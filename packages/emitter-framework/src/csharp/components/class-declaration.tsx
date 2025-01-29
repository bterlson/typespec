import * as ay from "@alloy-js/core";
import * as cs from "@alloy-js/csharp";
import { Model } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export interface ClassDeclarationProps {
  type: Model;
  children?: ay.Children;
}

export  function ClassDeclaration(props: ClassDeclarationProps) { 
  const model = props.type;
  const namePolicy = cs.useCSharpNamePolicy();
  const className = namePolicy.getName(props.type.name, "class");
  return (
  <cs.Class name={className} accessModifier="public" refkey={ay.refkey(model)}>
  {ay.mapJoin(model.properties, (name, property) => {
    const propertyName = namePolicy.getName(name, "class-member-public");
    return <cs.ClassMember name={propertyName} type={<TypeExpression type={property} />} />
  }, { joiner: "\n\n" })}
</cs.Class>)
}
