import { EmitContext, Program } from "../../src/core/index.js";
import { createTestHost } from "../../src/testing/test-host.js";
import { createTestWrapper } from "../../src/testing/test-utils.js";

export async function createContextMock(program?: Program): Promise<EmitContext<any>> {
  if (!program) {
    const host = await createTestHost();
    const runner = createTestWrapper(host);
    await runner.compile("");
    program = runner.program;
  }

  return {
    program,
    emitterOutputDir: "",
    options: {},
    getAssetEmitter() {
      throw "Not implemented";
    },
  };
}
