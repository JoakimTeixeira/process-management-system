import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeLcov } from "./normalize-lcov.mjs";

await test("maps source records to repository files and drops generated bundles", () => {
  const input = [
    "TN:",
    "SF:dist\\test-out\\run-id\\chunk-ABC.js",
    "DA:1,0",
    "end_of_record",
    "TN:",
    "SF:dist\\test-out\\run-id\\src\\app\\app.ts",
    "DA:1,1",
    "end_of_record",
    "",
  ].join("\r\n");

  const normalized = normalizeLcov(
    input,
    "web/public",
    "C:/workspace/project",
  );

  assert.doesNotMatch(normalized, /chunk-ABC/u);
  assert.match(
    normalized,
    /SF:C:\/workspace\/project\/web\/public\/src\/app\/app\.ts/u,
  );
  assert.match(normalized, /DA:1,1/u);
  assert.equal(normalized.match(/end_of_record/gu)?.length, 1);
});

await test("normalizes API records that are already relative to src", () => {
  const normalized = normalizeLcov(
    "SF:src\\main.ts\nDA:1,1\nend_of_record\n",
    "api",
    "C:/workspace/project",
  );

  assert.match(normalized, /SF:C:\/workspace\/project\/api\/src\/main\.ts/u);
});

await test("maps tooling records relative to the repository root", () => {
  const normalized = normalizeLcov(
    "SF:scripts\\check-links.mjs\nDA:1,1\nend_of_record\nSF:node_modules\\x.js\nDA:1,0\nend_of_record\n",
    ".",
    "C:/workspace/project",
    "scripts/",
  );

  assert.match(
    normalized,
    /SF:C:\/workspace\/project\/scripts\/check-links\.mjs/u,
  );
  assert.doesNotMatch(normalized, /node_modules/u);
});
