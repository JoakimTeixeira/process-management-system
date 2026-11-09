import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import {
  normalizeCoverageReports,
  normalizeLcov,
} from "./normalize-lcov.ts";

void test("should map source records to repository files and drop generated bundles", () => {
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

void test("should normalize API records that are already relative to src", () => {
  const normalized = normalizeLcov(
    "SF:src\\main.ts\nDA:1,1\nend_of_record\n",
    "api",
    "C:/workspace/project",
  );

  assert.match(normalized, /SF:C:\/workspace\/project\/api\/src\/main\.ts/u);
});

void test("should map tooling records relative to the repository root", () => {
  const normalized = normalizeLcov(
    "SF:scripts\\check-links.ts\nDA:1,1\nend_of_record\nSF:node_modules\\x.js\nDA:1,0\nend_of_record\n",
    ".",
    "C:/workspace/project",
    "scripts/",
  );

  assert.match(
    normalized,
    /SF:C:\/workspace\/project\/scripts\/check-links\.ts/u,
  );
  assert.doesNotMatch(normalized, /node_modules/u);
});

void test("should rewrite configured LCOV files on disk", async () => {
  const tempRoot = resolve(".diagnostics-fixtures", "lcov-test");
  await mkdir(tempRoot, { recursive: true });
  try {
    const reportFile = join(tempRoot, "lcov.info");
    await writeFile(
      reportFile,
      "SF:src\\example.ts\nDA:1,1\nend_of_record\n",
      "utf8",
    );

    await normalizeCoverageReports(
      [{ reportPath: "lcov.info", sourceRoot: "api" }],
      tempRoot,
    );

    const updated = await readFile(reportFile, "utf8");
    assert.match(updated, /\/api\/src\/example\.ts/u);
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
});

