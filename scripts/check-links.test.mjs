import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const fixtureDirectory = path.resolve(".diagnostics-fixtures", "link-check");
const checker = path.resolve("scripts", "check-links.mjs");

function runChecker(target) {
  return spawnSync(process.execPath, [checker, target], {
    encoding: "utf8",
  });
}

test.afterEach(async () => {
  await rm(fixtureDirectory, { force: true, recursive: true });
});

await test("reports every broken path, anchor, and reference", async () => {
  await mkdir(fixtureDirectory, { recursive: true });
  const fixture = path.join(fixtureDirectory, "broken.md");
  await writeFile(
    fixture,
    [
      "# Fixture",
      "",
      "[missing file](missing.md)",
      "[missing anchor](#not-present)",
      "[missing reference][nowhere]",
    ].join("\n"),
  );

  const result = runChecker(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /broken\.md:3 \[links\] targets missing path/);
  assert.match(result.stderr, /broken\.md:4 \[links\] targets missing anchor/);
  assert.match(result.stderr, /broken\.md:5 \[links\] has no matching reference/);
  assert.match(result.stderr, /3 broken link\(s\) found/);
});

await test("accepts valid relative paths, headings, and reference links", async () => {
  await mkdir(fixtureDirectory, { recursive: true });
  const target = path.join(fixtureDirectory, "target.md");
  const fixture = path.join(fixtureDirectory, "valid.md");
  await writeFile(target, "# Target Heading\n");
  await writeFile(
    fixture,
    [
      "# Fixture",
      "",
      "[relative](target.md#target-heading)",
      "[local](#fixture)",
      "[reference][target]",
      "`[not a reference][inside code]`",
      "",
      "[target]: target.md",
    ].join("\n"),
  );

  const result = runChecker(fixture);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /all internal links passed/);
});
