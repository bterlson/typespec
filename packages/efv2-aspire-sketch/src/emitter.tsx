import * as ay from "@alloy-js/core";
import * as cs from "@alloy-js/csharp";
import * as ef from "@typespec/emitter-framework/csharp";

import { EmitContext } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";

export async function $onEmit(context: EmitContext) {
  const csNamePolicy = cs.useCSharpNamePolicy();

  // Collects all types relevant to Http
  const collectedTypes = $.http.collectHttpTypes();
  const models = collectedTypes.filter(
    (type) => $.model.is(type) || $.enum.is(type) || $.union.is(type),
  );

  // Emit all enums and models
  return (
    <ay.Output namePolicy={csNamePolicy}>
      <cs.ProjectDirectory description="" name="efv2-aspire-sketch" path="." version="0.0.1">
        <cs.Namespace name="Models">
          <ay.SourceDirectory path="src">
            {ay.mapJoin(models, (model) => {
              const className = csNamePolicy.getName(model.name!, "class");
              return (
                <cs.SourceFile path={`${className}.cs`}>
                  <ef.TypeDeclaration type={model} />
                </cs.SourceFile>
              );
            })}
          </ay.SourceDirectory>
        </cs.Namespace>
      </cs.ProjectDirectory>
    </ay.Output>
  );
}
