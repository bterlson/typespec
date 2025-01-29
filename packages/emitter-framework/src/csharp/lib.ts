import { createTypeSpecLibrary } from "@typespec/compiler";

export const $csharpLib = createTypeSpecLibrary({
  name: "emitter-framework/csharp",
  diagnostics: {
    "csharp-unsupported-type": {
      messages: {
        default: "Type not supported in C#",
      },
      severity: "warning",
    },
    "support-not-implemented": {
      messages: {
        default: "This type is not yet supported",
      },
      severity: "warning",
    },
  },
});

export const {
  reportDiagnostic: reportCSharpDiagnostic,
  createDiagnostic: CreateCSharpDiagnostic,
} = $csharpLib;
