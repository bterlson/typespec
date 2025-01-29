import * as ay from "@alloy-js/core";
import * as cs from "@alloy-js/csharp";
import { Enum, Union, UnionVariant, EnumMember } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";


export interface EnumProps {
  type: Enum | Union;
  children?: ay.Children; 
}

export function EnumDeclaration(props: EnumProps) {
  const namePolicy = cs.useCSharpNamePolicy();
  const name = props.type.name ?? "Enum";
  const enumName = namePolicy.getName(name, "enum");
  let variants: ay.Children;

  if($.enum.is(props.type)) {
    variants = ay.mapJoin(props.type.members, (_, member) => {
      return <EnumMemberExpression type={member} />;
    }, { joiner: "\n" });
  } else {
    variants = ay.mapJoin(props.type.variants, (_, variant) => {
      return <EnumMemberExpression type={variant} />;
    }, { joiner: "\n" });
  }
  
  return (
    <cs.Enum name={enumName} accessModifier="public" refkey={ay.refkey(props.type)}>
      {
        ay.mapJoin(variants, () => {}, { joiner: "\n\n" })
      }
    </cs.Enum>
  );
}

export interface EnumMemberExpressionProps {
  type: UnionVariant | EnumMember;
}

export function EnumMemberExpression(props: EnumMemberExpressionProps) {
  const namePolicy = cs.useCSharpNamePolicy();
  let name: string;
  if($.enumMember.is(props.type)) {
    name = props.type.name
  } else {
    name = typeof props.type.name === "string" ? props.type.name : "FIXME";
  }

  const variantName = namePolicy.getName(name, "enum-member");
  return <cs.EnumMember name={variantName} refkey={ay.refkey(props.type)}/>;
}

