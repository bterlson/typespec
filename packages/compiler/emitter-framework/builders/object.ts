import { compilerAssert } from "../../core/index.js";
import { Placeholder } from "../placeholder.js";
import { EmitEntity, EmitterResult } from "../types.js";

export interface ObjectBuilder<T> extends Record<string, any> {}
export class ObjectBuilder<T> {
  constructor(initializer: {} = {}) {
    for (const [key, value] of Object.entries(initializer)) {
      this.set(key, value as any);
    }
  }
  set(key: string, v: EmitEntity<T> | Placeholder<T> | T) {
    let value = v;
    if (v instanceof EmitterResult) {
      compilerAssert(v.kind !== "circular", "Can't set a circular emit result.");

      if (v.kind === "none") {
        this[key] = null;
        return;
      } else {
        value = v.value;
      }
    }

    if (value instanceof Placeholder) {
      value.onValue((v) => {
        this[key] = v;
      });
    }

    this[key] = value;
  }
}
