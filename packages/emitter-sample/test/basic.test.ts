import { d } from "@alloy-js/core/testing";
import { expect, it } from "vitest";
import { emit } from "./test-host.js";

it("works", async () => {
  const results = await emit(`op doWork(): void;`);
  expect(results["package.json"]).toBe(d`
    {
        "name": "test-package",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {}
    }
  `);

  expect(results["index.ts"]).toBe(d`
    export * from "./client.js";
  `);

  expect(results["client.ts"]).toBe(d`
    function makeRestCall() {
      return fetch("http://localhost:8080");
    }
  `);
});