import { Operation, Type, navigateType } from "@typespec/compiler";
import { InterfaceDeclaration } from "../../../typescript/interface-declaration.js";
import { InterfaceMember, TypeDeclaration } from "#typespec/emitter/typescript";
import { isDeclaration } from "../../../framework/utils/typeguards.js";
import { CliType } from "#typespec-cli";

export interface ControllerInterfaceProps {
  cli: CliType;
}

export function ControllerInterface({ cli }: ControllerInterfaceProps) {
  const commands: Operation[] = [];

  if (cli.kind === "Interface" || cli.kind === "Namespace") {
    // TODO: Namespaces might have operation templates, probably need to find those?
    commands.push(... cli.operations.values());
  } else {
    commands.push(cli);
  }

  const typeDecls = collectTypeDecls(cli).map(type => (
    <TypeDeclaration type={type} />
  ));

  const memberDecls = commands.map(command => <InterfaceMember type={command} />)
  return <>
    <InterfaceDeclaration name="CommandInterface">
      {`${cli.name}: () => void;`}
      {memberDecls}
      version: string;
    </InterfaceDeclaration>
    {typeDecls}
  </>
}

// todo: make this better.
function collectTypeDecls(root: Type) {
  const types: Type[] = [];
  navigateType(root, {
    model(m) {
      if (isDeclaration(m)) {
        types.push(m);
      }
    }
  }, {})

  return types;
}