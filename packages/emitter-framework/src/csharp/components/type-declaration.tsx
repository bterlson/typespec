import { Type } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { ClassDeclaration } from "./class-declaration.js";
import { EnumDeclaration } from "./enum-declaration.js"

export interface TypeDeclarationProps {
  type: Type
}

export function TypeDeclaration(props: TypeDeclarationProps) {
  if($.model.is(props.type)) {
    return <ClassDeclaration type={props.type} />
  }

  if($.union.is(props.type) || $.enum.is(props.type)) {
    return <EnumDeclaration type={props.type} />
  }

  return null;
}
