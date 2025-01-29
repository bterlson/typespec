import { code, refkey } from "@alloy-js/core";
import { ValueExpression, Reference } from "@alloy-js/typescript";
import { IntrinsicType, Model, Scalar, Type } from "@typespec/compiler";
import { isDeclaration } from "../../core/utils/typeguards.js";
// import { UnionExpression } from "./union-expression.js";
// import { ArrayExpression } from "./array-expression.js";
// import { RecordExpression } from "./record-expression.js";
// import { InterfaceExpression } from "./interface-declaration.js";
import { $ } from "@typespec/compiler/typekit";
import { reportCSharpDiagnostic } from "../lib.js";

export interface TypeExpressionProps {
  type: Type;
}

export function TypeExpression(props: TypeExpressionProps) {
  const type = $.httpPart.unpack(props.type);
  if (isDeclaration(type)) {
    return <Reference refkey={refkey(type)} />;
  }

  switch (type.kind) {
    case "Scalar":
    case "Intrinsic":
      return <>{getScalarIntrinsicExpression(type)}</>;
    case "Boolean":
    case "Number":
    case "String":
      return <ValueExpression jsValue={type.value} />;
    case "Union":
      return code`object`;
      // TODO: return <UnionExpression type={type} />;
      break;
    case "UnionVariant":
      return <TypeExpression type={type.type} />;
    case "Tuple":
      return (
        <>
          {`new object[] { ${type.values
            .map((element) => <TypeExpression type={element} />)
            .join(", ")} }`}
        </>
      );
    case "ModelProperty":
      return <TypeExpression type={type.type} />;
    case "Model":
      if ($.array.is(type)) {
        const elementType = type.indexer!.value;
        return <>List&lt;{<TypeExpression type={elementType} />}&gt;</>;
      }

      if ($.record.is(type)) {
        const elementType = (type as Model).indexer!.value;
        return <>Dictionary&lt;string, {<TypeExpression type={elementType} />}&gt;</>;
      }

      if ($.httpPart.is(type)) {
        const partType = $.httpPart.unpack(type);
        return <TypeExpression type={partType} />;
      }
      break;
    default:
      reportCSharpDiagnostic($.program, { code: "csharp-unsupported-type", target: type });
      return "object";
  }
}

const intrinsicNameToCSType = new Map<string, string | null>([
  ["unknown", "object"],
  ["string", "string"],
  ["boolean", "bool"],
  ["null", "null"],
  ["void", "void"],
  ["bytes", "byte[]"],

  // Numeric types
  ["numeric", "double"],
  ["integer", "int"],
  ["float", "float"],
  ["decimal", "decimal"],
  ["decimal128", "decimal"],
  ["int64", "long"],
  ["int32", "int"],
  ["int16", "short"],
  ["int8", "sbyte"],
  ["safeint", "int"],
  ["uint64", "ulong"],
  ["uint32", "uint"],
  ["uint16", "ushort"],
  ["uint8", "byte"],
  ["float32", "float"],
  ["float64", "double"],

  // Date and time types
  ["plainDate", "DateOnly"],
  ["plainTime", "TimeOnly"],
  ["utcDateTime", "DateTime"],
  ["offsetDateTime", "DateTimeOffset"],
  ["duration", "TimeSpan"],

  // String types
  ["url", "Uri"]
]);

function getScalarIntrinsicExpression(type: Scalar | IntrinsicType): string | null {
  let intrinsicName: string;
  if ($.scalar.is(type)) {
    if ($.scalar.isUtcDateTime(type) || $.scalar.extendsUtcDateTime(type)) {
      const encoding = $.scalar.getEncoding(type);
      let emittedType = "DateTime";
      switch (encoding?.encoding) {
        case "unixTimestamp":
          emittedType = "long";
          break;
        case "rfc7231":
        case "rfc3339":
        default:
          emittedType = "DateTime";
          break;
      }
      return emittedType;
    }
    intrinsicName = $.scalar.getStdBase(type)?.name ?? "";
  } else {
    intrinsicName = type.name;
  }


  const csType = intrinsicNameToCSType.get(intrinsicName);

  if (!csType) {
    // Todo: report diagnostics
    reportCSharpDiagnostic($.program, { code: "csharp-unsupported-type", target: type });
    return "object";
  }

  return csType;
}
