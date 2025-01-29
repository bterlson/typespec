import { navigateType, Type } from "@typespec/compiler";
import { defineKit } from "@typespec/compiler/typekit";

export interface HttpKit {
  /**
   * Collect all types in the context of Http starting from the global namespace.
   */
  collectHttpTypes(): Type[];
}

interface TypekitExtension {
  http: HttpKit;
}

declare module "@typespec/compiler/typekit" {
  interface Typekit extends TypekitExtension {}
}

defineKit<TypekitExtension>({
  http: {
    collectHttpTypes() {
      const globalNs = this.program.getGlobalNamespaceType();
      const dataTypes = new Set<Type>();
      collectTypes(this, globalNs, dataTypes);

      return Array.from(dataTypes);
    },
  },
});

export function collectTypes(_$: any, type: Type, dataTypes: Set<Type>) {
  function trackType(type: Type) {
    if (!_$.type.isUserDefined(type)) {
      // skip built-in types
      return;
    }

    dataTypes.add(type);
  }
  navigateType(
    type,
    {
      operation(operation) {
        trackType(operation);
      },
      model(model) {
        if (_$.array.is(model) || _$.record.is(model)) {
          return;
        }

        if (_$.httpPart.is(model)) {
          const partType = _$.httpPart.unpack(model);
          // Need recursive call to collect data types from the part type as the semantic walker
          // doesn't do it automatically.
          collectTypes(_$, partType, dataTypes);
          return;
        }

        // Skip anonymous models
        if (!model.name) {
          return;
        }

        trackType(model);
      },
      union(union) {
        if (!union.name) {
          return;
        }

        trackType(union);
      },
      enum(enum_) {
        if (!enum_.name) {
          return;
        }

        trackType(enum_);
      },
      scalar(scalar) {
        if (!scalar.name) {
          return;
        }

        trackType(scalar);
      },
    },
    { includeTemplateDeclaration: false, visitDerivedTypes: true },
  );
}
