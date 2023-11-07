/**
 * The name resolver is responsible for resolving identifiers to symbols and
 * creating symbols for types that become known during this process. After name
 * resolution, we can do some limited analysis of the reference graph in order
 * to support e.g. augment decorators.
 *
 * Name resolution does not alter any AST nodes or attached symbols in order to
 * ensure AST nodes and attached symbols can be trivially reused between
 * compilations. Instead, symbols created here are either stored in augmented
 * symbol tables or as merged symbols. Any metadata about symbols and nodes are
 * stored in symbol links and node links respectively. The resolver provides
 * APIs for managing this metadata which is useful during later phases.
 *
 * While we resolve some identifiers to symbols during this phase, we often
 * cannot say for sure that an identifier does not exist. Some symbols must be
 * late-bound because the symbol does not become known until after the program
 * has been checked. A common example is members of a model template which often
 * cannot be known until the template is instantiated. Instead, we mark that the
 * reference is unknown and will resolve the symbol (or report an error if it
 * doesn't exist) in later phases. These unknown references cannot be used as
 * the target of an augment decorator.
 *
 * There are some errors we can detect because we have complete symbol
 * information, but we do not report them from here. For example, because we
 * know all namespace bindings and all the declarations inside of them, we could
 * in principle report an error when we attempt to `using` something that isn't
 * a namespace. However, giving a good error message sometimes requires knowing
 * what type was mistakenly referenced, so we merely mark that resolution has
 * failed and move on. Even in cases where we could give a good error we chose
 * not to in order to uniformly handle error reporting in the checker.
 *
 * Name resolution has three sub-phases:
 *
 * 1. Merge namespace symbols and decorator implementation/declaration symbols
 * 2. Resolve using references to namespaces and create namespace-local bindings
 *    for used symbols
 * 3. Resolve type references and bind members
 *
 * The reference resolution and member binding phase implements a deferred
 * resolution strategy. Often we cannot resolve a reference without binding
 * members, but we often cannot bind members without resolving references. In
 * such situations, we stop resolving or binding the current reference or type
 * and attempt to resolve or bind the reference or type it depends on. Once we
 * have done so, we return to the original reference or type and complete our
 * work.
 *
 * This is accomplished by doing a depth-first traversal of the reference graph.
 * On the way down, we discover any dependencies that need to be resolved or
 * bound for the current node, and recurse into the AST nodes, so that on the
 * way back up, all of our dependencies are bound and resolved and we can
 * complete. So while we start with a depth-first traversal of the ASTs in order
 * to discover work to do, most of the actual work is done while following the
 * reference graph, binding and resolving along the way. Circular references are
 * discovered during the reference graph walk and marked as such. Symbol and
 * node links are used to ensure we never resolve the same reference twice. The
 * checker implements a very similar algorithm to evaluate the types of the
 * program.
 **/

import { createSymbol, createSymbolTable } from "./binder.js";
import {
  AliasStatementNode,
  ModelExpressionNode,
  ModelStatementNode,
  ResolutionResult,
  compilerAssert,
  visitChildren,
} from "./index.js";
import { createDiagnostic } from "./messages.js";
import { Program } from "./program.js";
import {
  IdentifierNode,
  MemberExpressionNode,
  NamespaceStatementNode,
  Node,
  NodeFlags,
  NodeLinks,
  ResolutionResultFlags,
  Sym,
  SymbolFlags,
  SymbolLinks,
  SymbolTable,
  SyntaxKind,
  TypeReferenceNode,
  TypeSpecScriptNode,
} from "./types.js";
import { Mutable, mutate } from "./util.js";

export function createResolver(program: Program) {
  const mergedSymbols = new Map<Sym, Sym>();
  const augmentedSymbolTables = new Map<SymbolTable, SymbolTable>();
  const nodeLinks = new Map<number, NodeLinks>();
  let currentNodeId = 0;
  const symbolLinks = new Map<number, SymbolLinks>();
  let currentSymbolId = 0;

  const globalNamespaceNode = createGlobalNamespaceNode();
  const globalNamespaceSym = createSymbol(globalNamespaceNode, "global", SymbolFlags.Namespace);
  mutate(globalNamespaceNode).symbol = globalNamespaceSym;

  return {
    resolveProgram() {
      // Merge namespace symbols and decorator implementation/declaration symbols
      for (const file of program.jsSourceFiles.values()) {
        mergeSymbolTable(file.symbol.exports!, mutate(globalNamespaceSym.exports!));
      }

      for (const file of program.sourceFiles.values()) {
        mergeSymbolTable(file.symbol.exports!, mutate(globalNamespaceSym.exports!));
      }

      // Bind usings to namespaces, create namespace-local bindings for used symbols
      for (const file of program.sourceFiles.values()) {
        setUsingsForFile(file);
      }

      // Begin reference graph walk starting at each node to ensure we visit all possible
      // references and types that need binding.
      for (const file of program.sourceFiles.values()) {
        bindAndResolveNode(file);
      }
    },

    getMergedSymbol,
    getAugmentedSymbolTable,
    getNodeLinks,
    getSymbolLinks,

    getGlobalNamespaceSymbol() {
      return globalNamespaceSym;
    },
  };

  function getMergedSymbol(sym: Sym) {
    if (!sym) return sym;
    return mergedSymbols.get(sym) || sym;
  }

  /**
   * @internal
   */
  function getNodeLinks(n: Node): NodeLinks {
    const id = getNodeId(n);

    if (nodeLinks.has(id)) {
      return nodeLinks.get(id)!;
    }

    const links = {};
    nodeLinks.set(id, links);

    return links;
  }

  function getNodeId(n: Node) {
    if (n._id === undefined) {
      mutate(n)._id = currentNodeId++;
    }
    return n._id!;
  }

  /**
   * @internal
   */
  function getSymbolLinks(s: Sym): SymbolLinks {
    const id = getSymbolId(s);

    if (symbolLinks.has(id)) {
      return symbolLinks.get(id)!;
    }

    const links = {};
    symbolLinks.set(id, links);

    return links;
  }

  function getSymbolId(s: Sym) {
    if (s.id === undefined) {
      mutate(s).id = currentSymbolId++;
    }
    return s.id!;
  }

  function resolveTypeReference(
    node: TypeReferenceNode | MemberExpressionNode | IdentifierNode
  ): ResolutionResult {
    const links = getNodeLinks(node);

    if (links.resolutionResult) {
      return [links.resolvedSymbol, links.resolutionResult];
    }

    let result = resolveTypeReferenceWorker(node);

    // Unwrap aliases
    while (result[1] & ResolutionResultFlags.Resolved && result[0]!.flags & SymbolFlags.Alias) {
      const aliasNode = result[0]!.declarations[0] as AliasStatementNode;
      if (
        aliasNode.templateParameters.length === 0 &&
        aliasNode.value.kind === SyntaxKind.TypeReference &&
        aliasNode.value.arguments.length === 0
      ) {
        const [aliasRefSym, aliasRefResult] = resolveTypeReference(aliasNode.value);
        if (aliasRefResult & ResolutionResultFlags.Resolved) {
          result = [aliasRefSym!, ResolutionResultFlags.Resolved];
          continue;
        }
      }
      break;
    }

    if (result[0]) {
      links.resolvedSymbol = result[0];
    }
    links.resolutionResult = result[1];
    return result;
  }

  function resolveTypeReferenceWorker(
    node: TypeReferenceNode | MemberExpressionNode | IdentifierNode
  ): ResolutionResult {
    if (node.kind === SyntaxKind.TypeReference) {
      if (node.arguments.length > 0) {
        return [undefined, ResolutionResultFlags.Unknown];
      }
      return resolveTypeReference(node.target);
    } else if (node.kind === SyntaxKind.MemberExpression) {
      return resolveMemberExpression(node);
    } else if (node.kind === SyntaxKind.Identifier) {
      return resolveIdentifier(node);
    }

    compilerAssert(false, "Unexpected node kind");
  }

  function resolveMemberExpression(node: MemberExpressionNode): ResolutionResult {
    const [baseSym, baseResult] = resolveTypeReference(node.base);
    if (baseResult & ResolutionResultFlags.ResolutionFailed) {
      return [undefined, baseResult];
    }
    compilerAssert(baseSym, "Base symbol must be defined if resolution did not fail");

    if (baseSym.flags & SymbolFlags.MemberContainer) {
      return resolveMember(baseSym, node.id);
    } else if (baseSym.flags & SymbolFlags.ExportContainer) {
      return resolveExport(getMergedSymbol(baseSym), node.id);
    }

    throw new Error("NYI rme");
  }

  function resolveMember(baseSym: Sym, id: IdentifierNode): ResolutionResult {
    const baseNode = baseSym.declarations[0];
    compilerAssert(baseNode, "Base symbol must have a declaration");

    bindMemberContainer(baseNode);

    switch (baseNode.kind) {
      case SyntaxKind.ModelStatement:
      case SyntaxKind.ModelExpression:
        return resolveModelMember(baseSym, baseNode, id);
    }
    throw new Error("NYI");
  }

  function resolveModelMember(
    modelSym: Sym,
    modelNode: ModelStatementNode | ModelExpressionNode,
    id: IdentifierNode
  ): ResolutionResult {
    const modelSymLinks = getSymbolLinks(modelSym);

    // step 1: check direct members
    // spreads have already been bound
    const memberSym = tableLookup(modelSym.members!, id);
    if (memberSym) {
      return [memberSym, ResolutionResultFlags.Resolved];
    }

    // step 2: check extends. Don't look up to extends references if we have
    // unknown members, and resolve any property as unknown if we extend
    // something unknown.
    const extendsRef = modelNode.kind === SyntaxKind.ModelStatement ? modelNode.extends : undefined;
    if (
      extendsRef &&
      extendsRef.kind === SyntaxKind.TypeReference &&
      !modelSymLinks.hasUnknownMembers
    ) {
      const [extendsSym, extendsResult] = resolveTypeReference(extendsRef);
      if (extendsResult & ResolutionResultFlags.Resolved) {
        return resolveMember(extendsSym!, id);
      }

      if (extendsResult & ResolutionResultFlags.Unknown) {
        modelSymLinks.hasUnknownMembers = true;
        return [undefined, ResolutionResultFlags.Unknown];
      }
    }

    // step 3: return either unknown or not found depending on whether we have
    // unknown members
    return [
      undefined,
      modelSymLinks.hasUnknownMembers
        ? ResolutionResultFlags.Unknown
        : ResolutionResultFlags.NotFound,
    ];
  }

  function resolveExport(baseSym: Sym, id: IdentifierNode): ResolutionResult {
    const node = baseSym.declarations[0];
    compilerAssert(
      node.kind === SyntaxKind.NamespaceStatement || node.kind === SyntaxKind.TypeSpecScript,
      "Unexpected node kind"
    );

    const exportSym = tableLookup(baseSym.exports!, id);
    if (!exportSym) {
      return [undefined, ResolutionResultFlags.NotFound];
    }

    return [exportSym, ResolutionResultFlags.Resolved];
  }

  function tableLookup(table: SymbolTable, node: IdentifierNode, resolveDecorator = false) {
    table = augmentedSymbolTables.get(table) ?? table;
    let sym;
    if (resolveDecorator) {
      sym = table.get("@" + node.sv);
    } else {
      sym = table.get(node.sv);
    }

    if (!sym) return sym;

    return getMergedSymbol(sym);
  }

  /**
   * This method will take a member container and compute all the known member
   * symbols. It will determine whether it has unknown members and set the
   * symbol link value appropriately. This is used during resolution to know if
   * member resolution should return `unknown` when a member isn't found.
   * @param node
   * @returns
   */
  function bindMemberContainer(node: Node) {
    switch (node.kind) {
      case SyntaxKind.ModelStatement:
      case SyntaxKind.ModelExpression:
        bindModelMembers(node);
        return;
    }
  }

  function bindModelMembers(node: ModelStatementNode | ModelExpressionNode) {
    const modelSym = node.symbol!;
    const modelSymLinks = getSymbolLinks(modelSym);

    if (modelSymLinks.membersBound) {
      return;
    }

    modelSymLinks.membersBound = true;

    const targetTable = getAugmentedSymbolTable(modelSym.members!);

    const isRef = node.kind === SyntaxKind.ModelStatement ? node.is : undefined;
    if (isRef && isRef.kind === SyntaxKind.TypeReference) {
      const [isSym, isResult] = resolveTypeReference(isRef);

      if (isResult & ResolutionResultFlags.Unknown) {
        modelSymLinks.hasUnknownMembers = true;
      } else if (isResult & ResolutionResultFlags.Resolved && isSym!.flags & SymbolFlags.Model) {
        const isSymLinks = getSymbolLinks(isSym!);
        if (isSymLinks.hasUnknownMembers) {
          modelSymLinks.hasUnknownMembers = true;
        }
        const sourceTable = getAugmentedSymbolTable(isSym!.members!);
        targetTable.include(sourceTable);
      }
    }

    // here we just need to check if we're extending something with unknown symbols
    const extendsRef = node.kind === SyntaxKind.ModelStatement ? node.extends : undefined;
    if (extendsRef && extendsRef.kind === SyntaxKind.TypeReference) {
      const [extendsSym, extendsResult] = resolveTypeReference(extendsRef);
      if (extendsResult & ResolutionResultFlags.Resolved) {
        if (getSymbolLinks(extendsSym!).hasUnknownMembers) {
          modelSymLinks.hasUnknownMembers = true;
        }
      } else if (extendsResult & ResolutionResultFlags.Unknown) {
        modelSymLinks.hasUnknownMembers = true;
      }
    }

    for (const propertyNode of node.properties) {
      if (propertyNode.kind === SyntaxKind.ModelSpreadProperty) {
        const [sourceSym, sourceResult] = resolveTypeReference(propertyNode.target);
        if (~sourceResult & ResolutionResultFlags.Resolved) {
          if (sourceResult & ResolutionResultFlags.Unknown) {
            modelSymLinks.hasUnknownMembers = true;
          }
          continue;
        }

        compilerAssert(sourceSym, "Spread symbol must be defined if resolution succeeded");

        if (!(sourceSym.flags & SymbolFlags.Model)) {
          // will be a checker error
          continue;
        }

        const sourceSymLinks = getSymbolLinks(sourceSym!);
        if (sourceSymLinks.hasUnknownMembers) {
          modelSymLinks.hasUnknownMembers = true;
          continue;
        }

        const sourceTable = getAugmentedSymbolTable(sourceSym.members!);
        targetTable.include(sourceTable);
      }
    }
  }

  function resolveIdentifier(node: IdentifierNode): ResolutionResult {
    let scope: Node | undefined = node.parent;
    let binding: Sym | undefined;

    while (scope && scope.kind !== SyntaxKind.TypeSpecScript) {
      if (scope.symbol && scope.symbol.flags & SymbolFlags.ExportContainer) {
        const mergedSymbol = getMergedSymbol(scope.symbol);
        binding = tableLookup(mergedSymbol.exports!, node);
        if (binding) return [binding, ResolutionResultFlags.Resolved];
      }

      if ("locals" in scope && scope.locals !== undefined) {
        binding = tableLookup(scope.locals, node);
        if (binding) return [binding, ResolutionResultFlags.Resolved];
      }

      scope = scope.parent;
    }

    if (!binding && scope && scope.kind === SyntaxKind.TypeSpecScript) {
      // check any blockless namespace decls
      for (const ns of scope.inScopeNamespaces) {
        const mergedSymbol = getMergedSymbol(ns.symbol);
        binding = tableLookup(mergedSymbol.exports!, node);

        if (binding) return [binding, ResolutionResultFlags.Resolved];
      }

      // check "global scope" declarations
      const globalBinding = tableLookup(globalNamespaceNode.symbol.exports!, node);

      // check using types
      const usingBinding = tableLookup(scope.locals, node);

      if (globalBinding && usingBinding) {
        return [undefined, ResolutionResultFlags.Ambiguous];
      } else if (globalBinding) {
        return [globalBinding, ResolutionResultFlags.Resolved];
      } else if (usingBinding) {
        if (usingBinding.flags & SymbolFlags.DuplicateUsing) {
          return [undefined, ResolutionResultFlags.ResolutionFailed];
        }
        return [usingBinding, ResolutionResultFlags.Resolved];
      }
    }

    return [undefined, ResolutionResultFlags.Unknown];
  }
  /**
   * We cannot inject symbols into the symbol tables hanging off syntax tree nodes as
   * syntax tree nodes can be shared by other programs. This is called as a copy-on-write
   * to inject using and late-bound symbols, and then we use the copy when resolving
   * in the table.
   */
  function getAugmentedSymbolTable(table: SymbolTable): Mutable<SymbolTable> {
    let augmented = augmentedSymbolTables.get(table);
    if (!augmented) {
      augmented = createSymbolTable(table);
      augmentedSymbolTables.set(table, augmented);
    }
    return mutate(augmented);
  }

  function mergeSymbolTable(source: SymbolTable, target: Mutable<SymbolTable>) {
    for (const [sym, duplicates] of source.duplicates) {
      const targetSet = target.duplicates.get(sym);
      if (targetSet === undefined) {
        mutate(target.duplicates).set(sym, new Set([...duplicates]));
      } else {
        for (const duplicate of duplicates) {
          mutate(targetSet).add(duplicate);
        }
      }
    }

    for (const [key, sourceBinding] of source) {
      if (sourceBinding.flags & SymbolFlags.Namespace) {
        let targetBinding = target.get(key);
        if (!targetBinding) {
          targetBinding = {
            ...sourceBinding,
            declarations: [],
            exports: createSymbolTable(),
          };
          target.set(key, targetBinding);
        }
        if (targetBinding.flags & SymbolFlags.Namespace) {
          mergedSymbols.set(sourceBinding, targetBinding);
          mutate(targetBinding.declarations).push(...sourceBinding.declarations);
          mergeSymbolTable(sourceBinding.exports!, mutate(targetBinding.exports!));
        } else {
          // this will set a duplicate error
          target.set(key, sourceBinding);
        }
      } else if (
        sourceBinding.flags & SymbolFlags.Declaration ||
        sourceBinding.flags & SymbolFlags.Implementation
      ) {
        if (sourceBinding.flags & SymbolFlags.Decorator) {
          mergeDeclarationOrImplementation(key, sourceBinding, target, SymbolFlags.Decorator);
        } else if (sourceBinding.flags & SymbolFlags.Function) {
          mergeDeclarationOrImplementation(key, sourceBinding, target, SymbolFlags.Function);
        } else {
          target.set(key, sourceBinding);
        }
      } else {
        target.set(key, sourceBinding);
      }
    }
  }

  function mergeDeclarationOrImplementation(
    key: string,
    sourceBinding: Sym,
    target: Mutable<SymbolTable>,
    expectTargetFlags: SymbolFlags
  ) {
    const targetBinding = target.get(key);
    if (!targetBinding || !(targetBinding.flags & expectTargetFlags)) {
      target.set(key, sourceBinding);
      return;
    }
    const isSourceDeclaration = sourceBinding.flags & SymbolFlags.Declaration;
    const isSourceImplementation = sourceBinding.flags & SymbolFlags.Implementation;
    const isTargetDeclaration = targetBinding.flags & SymbolFlags.Declaration;
    const isTargetImplementation = targetBinding.flags & SymbolFlags.Implementation;
    if (isTargetDeclaration && isTargetImplementation) {
      // If the target already has both a declaration and implementation set the symbol which will mark it as duplicate
      target.set(key, sourceBinding);
    } else if (isTargetDeclaration && isSourceImplementation) {
      mergedSymbols.set(sourceBinding, targetBinding);
      mutate(targetBinding).value = sourceBinding.value;
      mutate(targetBinding).flags |= sourceBinding.flags;
      mutate(targetBinding.declarations).push(...sourceBinding.declarations);
    } else if (isTargetImplementation && isSourceDeclaration) {
      mergedSymbols.set(sourceBinding, targetBinding);
      mutate(targetBinding).flags |= sourceBinding.flags;
      mutate(targetBinding.declarations).unshift(...sourceBinding.declarations);
    } else {
      // this will set a duplicate error
      target.set(key, sourceBinding);
    }
  }

  function setUsingsForFile(file: TypeSpecScriptNode) {
    const usedUsing = new Set<Sym>();
    for (const using of file.usings) {
      const parentNs = using.parent!;
      const [usedSym, usedSymResult] = resolveTypeReference(using.name);
      if (~usedSymResult & ResolutionResultFlags.Resolved) {
        continue;
      }
      compilerAssert(usedSym, "Used symbol must be defined if resolution succeeded");
      if (~usedSym.flags & SymbolFlags.Namespace) {
        reportCheckerDiagnostic(createDiagnostic({ code: "using-invalid-ref", target: using }));
        continue;
      }

      const namespaceSym = getMergedSymbol(usedSym)!;

      if (usedUsing.has(namespaceSym)) {
        reportCheckerDiagnostic(
          createDiagnostic({
            code: "duplicate-using",
            format: { usingName: memberExpressionToString(using.name) },
            target: using,
          })
        );
        continue;
      }
      usedUsing.add(namespaceSym);

      addUsingSymbols(namespaceSym.exports!, parentNs.locals!);
    }
  }

  function addUsingSymbols(source: SymbolTable, destination: SymbolTable): void {
    const augmented = getAugmentedSymbolTable(destination);
    for (const symbolSource of source.values()) {
      const sym: Sym = {
        flags: SymbolFlags.Using,
        declarations: [],
        name: symbolSource.name,
        symbolSource: symbolSource,
        node: undefined as any,
      };
      augmented.set(sym.name, sym);
    }
  }

  function memberExpressionToString(expr: IdentifierNode | MemberExpressionNode) {
    let current = expr;
    const parts = [];

    while (current.kind === SyntaxKind.MemberExpression) {
      parts.push(current.id.sv);
      current = current.base;
    }

    parts.push(current.sv);

    return parts.reverse().join(".");
  }

  function createGlobalNamespaceNode() {
    const nsId: IdentifierNode = {
      kind: SyntaxKind.Identifier,
      pos: 0,
      end: 0,
      sv: "global",
      symbol: undefined!,
      flags: NodeFlags.Synthetic,
    };

    const nsNode: NamespaceStatementNode = {
      kind: SyntaxKind.NamespaceStatement,
      decorators: [],
      pos: 0,
      end: 0,
      id: nsId,
      symbol: undefined!,
      locals: createSymbolTable(),
      flags: NodeFlags.Synthetic,
    };

    return nsNode;
  }

  function bindAndResolveNode(node: Node) {
    switch (node.kind) {
      case SyntaxKind.TypeReference:
        resolveTypeReference(node);
        break;
      case SyntaxKind.ModelStatement:
      case SyntaxKind.ModelExpression:
        bindMemberContainer(node);
    }

    visitChildren(node, bindAndResolveNode);
  }
}
function reportCheckerDiagnostic(arg0: any) {
  throw new Error("Function not implemented.");
}