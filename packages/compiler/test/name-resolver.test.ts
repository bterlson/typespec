import { NodeFlags, SymbolLinks, SyntaxKind } from "@typespec/compiler";
import { ok, strictEqual } from "assert";
import { Binder, createBinder } from "../src/core/binder.js";
import { inspectSymbolFlags } from "../src/core/inspector.js";
import { createLogger } from "../src/core/logger/logger.js";
import { createTracer } from "../src/core/logger/tracer.js";
import { createResolver } from "../src/core/name-resolver.js";
import { getNodeAtPosition, parse } from "../src/core/parser.js";
import {
  Node,
  ResolutionResult,
  ResolutionResultFlags,
  SymbolFlags,
  TypeReferenceNode,
} from "../src/core/types.js";
import { Program, Sym } from "../src/index.js";

describe.only("compiler: nameResolver", () => {
  let binder: Binder;
  let resolver: ReturnType<typeof createResolver>;
  let program: Program;

  beforeEach(() => {
    program = createProgramShim();
    binder = createBinder(program);
    resolver = createResolver(program);
  });

  describe("models", () => {
    describe("binding", () => {
      it("binds is members", () => {
        const sym = getGlobalSymbol([
          `
          model M1 {
            x: "x";
          }
  
          model M2 is M1 {
            y: "y";
          }
          `,
        ]);

        assertSymbol(sym, {
          exports: {
            M1: {
              members: {
                x: {
                  flags: SymbolFlags.Member,
                },
              },
            },
            M2: {
              members: {
                x: {
                  flags: SymbolFlags.Member,
                },
                y: {
                  flags: SymbolFlags.Member,
                },
              },
            },
          },
        });
      });

      it("binds spread members", () => {
        const sym = getGlobalSymbol([
          `
          model M1 {
            x: "x";
          }
  
          model M2 {
            ... M1,
            y: "y";
          }
          `,
        ]);

        assertSymbol(sym, {
          exports: {
            M1: {
              members: {
                x: {
                  flags: SymbolFlags.Member,
                },
              },
            },
            M2: {
              members: {
                x: {
                  flags: SymbolFlags.Member,
                },
                y: {
                  flags: SymbolFlags.Member,
                },
              },
            },
          },
        });
      });

      it("sets containsUnknownMembers flag with spread/extends of instantiations", () => {
        const sym = getGlobalSymbol([
          `
          model Template<T> { ... T };
  
          model M1 extends Template<{}> {}

          model M2 {
            ... Template<{}>;
          }

          model M3 extends M1 {}
          model M4 {
            ... M1;
          }
          `,
        ]);

        const hasUnknownMembers = { links: { hasUnknownMembers: true } };
        assertSymbol(sym, {
          exports: {
            M1: hasUnknownMembers,
            M2: hasUnknownMembers,
            M3: hasUnknownMembers,
            M4: hasUnknownMembers,
          },
        });
      });

      it("binds members of templates", () => {
        const sym = getGlobalSymbol([
          `
          model Template<T> {
            x: "x";
          }
          `,
        ]);

        assertSymbol(sym, {
          exports: {
            Template: {
              members: {
                x: {
                  flags: SymbolFlags.Member,
                },
              },
            },
          },
        });
      });
    });

    describe("resolution", () => {
      it("resolves model members", () => {
        const { "Foo.prop": prop } = getResolutions(
          [
            `
            model Foo {
              prop: "prop";
            }
            ┆
            `,
          ],
          "Foo.prop"
        );
        assertSymbol(prop, { name: "prop", flags: SymbolFlags.Member });
      });

      it("resolves model members from spread", () => {
        const { "Foo.prop": prop } = getResolutions(
          [
            `
            model Bar {
              prop: "prop";
            }
  
            model Foo {
              ... Bar;
            }
            ┆
            `,
          ],
          "Foo.prop"
        );
        assertSymbol(prop, { name: "prop", flags: SymbolFlags.Member });
      });

      it("resolves model members from extends", () => {
        const { "Foo.prop": prop, Bar } = getResolutions(
          [
            `
            model Bar {
              prop: "prop";
            }
  
            model Foo extends Bar {}
            ┆
            `,
          ],
          "Foo.prop",
          "Bar"
        );
        assertSymbol(prop, { name: "prop", flags: SymbolFlags.Member });
        ok(prop[0].parent === Bar[0]);
      });

      it("resolves model members from extends with unknown spreads to unknown not inherited member", () => {
        const { "Foo.prop": prop } = getResolutions(
          [
            `
            model Bar {
              prop: "prop";
            }
  
            model Foo extends Bar {
              ... Baz<{}>;
            }
  
            model Baz<T> {
              ... T;
            }
  
            ┆
            `,
          ],
          "Foo.prop"
        );
        ok(prop[1] & ResolutionResultFlags.Unknown);
      });

      it("model members should be unknown with an unknown spread", () => {
        const { "Foo.prop": prop } = getResolutions(
          [
            `
            model Foo {
              ... Baz<{}>;
            }
  
            model Baz<T> {
              ... T;
            }
  
            ┆
            `,
          ],
          "Foo.prop"
        );
        ok(prop[1] & ResolutionResultFlags.Unknown);
      });

      it("model members should be unknown with an unknown base class", () => {
        const { "Foo.prop": prop } = getResolutions(
          [
            `
            model Foo extends Baz<{}> {
            }
  
            model Baz<T> {
              ... T;
            }
  
            ┆
            `,
          ],
          "Foo.prop"
        );
        ok(prop[1] & ResolutionResultFlags.Unknown);
      });
    });
  });

  describe("namespaces", () => {
    describe("binding", () => {
      it("merges across the same file", () => {
        const sym = getGlobalSymbol([
          `namespace Foo {
            model M { }  
          }
          namespace Foo {
            model N { }
          }`,
        ]);

        assertSymbol(sym, {
          exports: {
            Foo: {
              flags: SymbolFlags.Namespace,
              exports: {
                M: {
                  flags: SymbolFlags.Model,
                },
                N: {
                  flags: SymbolFlags.Model,
                },
              },
            },
          },
        });
      });

      it("merges across files", () => {
        const sym = getGlobalSymbol([
          `namespace Foo {
            model M { }  
          }`,
          `namespace Foo {
            model N { }
          }`,
        ]);

        assertSymbol(sym, {
          exports: {
            Foo: {
              flags: SymbolFlags.Namespace,
              exports: {
                M: {
                  flags: SymbolFlags.Model,
                },
                N: {
                  flags: SymbolFlags.Model,
                },
              },
            },
          },
        });
      });
    });

    describe("resolution", () => {
      it("resolves namespace members", () => {
        const { "Foo.Bar.M": M, "Foo.N": N } = getResolutions(
          [
            `namespace Foo {
              namespace Bar {
                model M {}
              }
              model N { }
            }
            ┆
            `,
          ],
          "Foo.Bar.M",
          "Foo.N"
        );
        assertSymbol(M, { name: "M" });
        assertSymbol(N, { name: "N" });
      });
    });
  });

  describe("aliases", () => {
    describe("binding", () => {
      it("binds aliases to symbols", () => {
        // this is just handled by the binder, but verifying here.
        const sym = getGlobalSymbol([
          `namespace Foo {
            model M { }  
          }
          namespace Bar {
            alias M = Foo.M;
          }`,
        ]);

        assertSymbol(sym, {
          exports: {
            Foo: {
              flags: SymbolFlags.Namespace,
              exports: {
                M: {
                  flags: SymbolFlags.Model,
                },
              },
            },
            Bar: {
              flags: SymbolFlags.Namespace,
              exports: {
                M: {
                  flags: SymbolFlags.Alias,
                },
              },
            },
          },
        });
      });
    });

    describe("resolution", () => {
      it.only("resolves aliases", () => {
        const { "Foo.Bar.M": M, "Baz.AliasM": AliasM } = getResolutions(
          [
            `namespace Foo {
                namespace Bar {
                  model M {}
                }
              }
              namespace Baz {
                alias AliasM = Foo.Bar.M;
              }
              ┆
              `,
          ],
          "Foo.Bar.M",
          "Baz.AliasM"
        );
        assertSymbol(M, { name: "M", flags: SymbolFlags.Model });
        assertSymbol(AliasM, { name: "M", flags: SymbolFlags.Model });
      });
    });
  });

  describe("usings", () => {
    describe("binding", () => {
      it("binds usings to locals", () => {
        const sym = getGlobalSymbol(["namespace Foo { model M { }} namespace Bar { using Foo; }"]);
        assertSymbol(sym, {
          exports: {
            Foo: {
              flags: SymbolFlags.Namespace,
            },
            Bar: {
              flags: SymbolFlags.Namespace,
              locals: {
                M: {
                  flags: SymbolFlags.Model | SymbolFlags.Using,
                },
              },
            },
          },
        });
      });
    });

    describe("resolution", () => {
      it("resolves usings", () => {
        const sources = [
          `
          namespace Foo {
            model M { }
          }
          
          namespace Bar {
            using Foo;
            ┆
          }
        `,
        ];

        const { M } = getResolutions(sources, "M");
        assertSymbol(M[0], { name: "M", flags: SymbolFlags.Using });
      });
    });
  });

  type StringTuplesToSymbolRecord<T extends string[]> = {
    [K in T[number]]: ResolutionResult;
  };

  function getResolutions<T extends string[]>(
    sources: string[],
    ...names: T
  ): StringTuplesToSymbolRecord<T> {
    let index = 0;
    const symbols = {} as any;
    const referenceNodes: TypeReferenceNode[] = [];

    for (let source of sources) {
      const cursorPos = source.indexOf("┆");
      if (cursorPos >= 0) {
        const aliasCodes = names.map((name) => `alias test${name.replace(/\./g, "")} = ${name};`);
        const aliasOffsets: number[] = [];
        let prevOffset = 0;
        for (let i = 0; i < names.length; i++) {
          aliasOffsets.push(prevOffset + aliasCodes[i].length - 1);
          prevOffset += aliasCodes[i].length;
        }
        source = source.slice(0, cursorPos) + aliasCodes.join("") + source.slice(cursorPos + 1);
        const sf = parse(source);
        program.sourceFiles.set(String(index++), sf);
        binder.bindSourceFile(sf);

        for (let i = 0; i < names.length; i++) {
          const node = getNodeAtPosition(sf, cursorPos + aliasOffsets[i]);
          referenceNodes.push(getParentTypeRef(node));
        }
      }
    }

    resolver.resolveProgram();
    for (let i = 0; i < names.length; i++) {
      const nodeLinks = resolver.getNodeLinks(referenceNodes[i]);
      if (!nodeLinks.resolutionResult) {
        throw new Error(`Reference ${names[i]} hasn't been resolved`);
      }

      symbols[names[i]] = [nodeLinks.resolvedSymbol, nodeLinks.resolutionResult];
    }
    return symbols;
  }

  function getParentTypeRef(node: Node | undefined) {
    if (!node) {
      throw new Error("Can't find parent of undefined node.");
    }
    if (node.kind !== SyntaxKind.MemberExpression && node.kind !== SyntaxKind.Identifier) {
      throw new Error("Can't find parent of non-reference node.");
    }

    if (!node.parent) {
      throw new Error("can't find parent.");
    }

    if (node.parent.kind === SyntaxKind.TypeReference) {
      return node.parent;
    }

    return getParentTypeRef(node.parent);
  }

  function getGlobalSymbol(typespecSources: string[]): Sym {
    let index = 0;
    for (const source of typespecSources) {
      const sf = parse(source);
      program.sourceFiles.set(String(index++), sf);
      binder.bindSourceFile(sf);
    }

    resolver.resolveProgram();
    return resolver.getGlobalNamespaceSymbol();
  }

  function assertSymbol(
    sym: ResolutionResult | Sym | undefined,
    record: SymbolDescriptor = {}
  ): asserts sym is [Sym, ResolutionResultFlags] | Sym {
    if (Array.isArray(sym)) {
      sym = sym[0];
    }
    if (!sym) {
      throw new Error(`Symbol not found.`);
    }
    if (record.flags) {
      ok(
        sym.flags & record.flags,
        `Expected symbol ${sym.name} to have flags ${inspectSymbolFlags(
          record.flags
        )} but got ${inspectSymbolFlags(sym.flags)}`
      );
    }

    if (record.nodeFlags) {
      ok(
        sym.declarations[0].flags & record.nodeFlags,
        `Expected symbol ${sym.name} to have node flags ${record.nodeFlags} but got ${sym.declarations[0].flags}`
      );
    }

    if (record.name) {
      strictEqual(sym.name, record.name);
    }

    if (record.exports) {
      ok(sym.exports, `Expected symbol ${sym.name} to have exports`);
      const exports = resolver.getAugmentedSymbolTable(sym.exports);

      for (const [name, descriptor] of Object.entries(record.exports)) {
        const exportSym = exports.get(name);
        ok(exportSym, `Expected symbol ${sym.name} to have export ${name}`);
        assertSymbol(exportSym, descriptor);
      }
    }

    if (record.locals) {
      const node = sym.declarations[0] as any;
      ok(node.locals, `Expected symbol ${sym.name} to have locals`);
      const locals = resolver.getAugmentedSymbolTable(node.locals);

      for (const [name, descriptor] of Object.entries(record.locals)) {
        const localSym = locals.get(name);
        ok(localSym, `Expected symbol ${sym.name} to have local ${name}`);
        assertSymbol(localSym, descriptor);
      }
    }

    if (record.members) {
      ok(sym.members, `Expected symbol ${sym.name} to have exports`);
      const members = resolver.getAugmentedSymbolTable(sym.members);

      for (const [name, descriptor] of Object.entries(record.members)) {
        const exportSym = members.get(name);
        ok(exportSym, `Expected symbol ${sym.name} to have member ${name}`);
        assertSymbol(exportSym, descriptor);
      }
    }

    if (record.links) {
      const links = resolver.getSymbolLinks(sym);
      for (const [key, value] of Object.entries(record.links) as [keyof SymbolLinks, any][]) {
        if (value) {
          ok(links[key], `Expected symbol ${sym.name} to have link ${key}`);
          strictEqual(links[key], value);
        }
      }
    }
  }
});

interface SymbolDescriptor {
  name?: string;
  flags?: SymbolFlags;
  nodeFlags?: NodeFlags;
  locals?: Record<string, SymbolDescriptor>;
  exports?: Record<string, SymbolDescriptor>;
  members?: Record<string, SymbolDescriptor>;
  links?: SymbolLinks;
}

function createProgramShim(): Program {
  return {
    tracer: createTracer(createLogger({ sink: { log: () => {} } })),
    reportDuplicateSymbols() {},
    onValidate() {},
    sourceFiles: new Map(),
    jsSourceFiles: new Map(),
  } as any;
}