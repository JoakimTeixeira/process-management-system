import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  collectAnchors,
  collectLinks,
  markdownSlug,
  normalizeDestination,
  parseArguments,
  runLinkCheck,
  validateExternalLink,
} from "./check-links.ts";

const fixtureDirectory = path.resolve(".diagnostics-fixtures", "link-check");
const checker = path.resolve("scripts", "check-links.ts");

function runChecker(target: string) {
  return spawnSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", checker, target],
    {
      encoding: "utf8",
    },
  );
}

test.afterEach(async () => {
  await rm(fixtureDirectory, { force: true, recursive: true });
});

void test("should report every broken path, anchor, and reference via CLI and in-process runner", async () => {
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

  const loggedErrors: string[] = [];
  const inProcess = await runLinkCheck({
    arguments_: [fixture],
    logger: {
      error: (message) => loggedErrors.push(message),
      log: () => {},
    },
  });
  process.exitCode = 0;

  assert.equal(inProcess.failures.length, 3);
  assert.ok(loggedErrors.some((line) => line.includes("targets missing path")));

  const result = runChecker(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /broken\.md:3 \[links\] targets missing path/);
  assert.match(result.stderr, /broken\.md:4 \[links\] targets missing anchor/);
  assert.match(
    result.stderr,
    /broken\.md:5 \[links\] has no matching reference/,
  );
  assert.match(result.stderr, /3 broken link\(s\) found/);
});

void test("should accept valid relative paths, headings, HTML anchors, and external links", async () => {
  await mkdir(fixtureDirectory, { recursive: true });
  const target = path.join(fixtureDirectory, "target.md");
  const fixture = path.join(fixtureDirectory, "valid.md");
  await writeFile(
    target,
    '# Target Heading ##\n\n##Target Heading\n\n# Target Heading\n\n<a id="custom-id"></a>\n',
  );
  await writeFile(
    fixture,
    [
      "# Fixture",
      "",
      "[relative](target.md#target-heading \"Title\")",
      "[duplicate heading](target.md#target-heading-1)",
      "[html anchor](target.md#custom-id)",
      "[local](#fixture)",
      "[reference][target]",
      "[external](https://example.com/docs)",
      "[ignored](mailto:test@example.com)",
      "[data](data:text/plain;base64,SGVsbG8=)",
      '<a href="target.md">HTML link</a>',
      "```md",
      "[fenced broken](does-not-exist.md)",
      "```",
      "`[not a reference][inside code]`",
      "",
      "[target]: target.md",
    ].join("\n"),
  );

  const loggedMessages: string[] = [];
  const inProcess = await runLinkCheck({
    arguments_: ["--external", fixture],
    fetchImpl: () =>
      Promise.resolve({
        body: { cancel: () => Promise.resolve() },
        ok: true,
        status: 200,
      } as unknown as Response),
    logger: {
      error: (message: string) => loggedMessages.push(message),
      log: (message: string) => loggedMessages.push(message),
    },
  });

  assert.equal(inProcess.failures.length, 0);
  assert.ok(
    loggedMessages.some((line) =>
      line.includes("all internal and external links passed"),
    ),
  );

  const result = runChecker(fixture);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /all internal links passed/);
});

void test("should validate helper edge cases for link parsing and external HTTP errors", async () => {
  assert.deepEqual(parseArguments(["--external", "README.md"], "/repo"), {
    external: true,
    targets: ["README.md"],
  });
  assert.equal(
    markdownSlug("Heading with [Link](url) and <span>HTML</span>!"),
    "heading-with-link-and-html",
  );
  assert.equal(
    normalizeDestination("path/to/file.md 'Optional Title'"),
    "path/to/file.md",
  );

  const anchors = collectAnchors("# One\n# One\n<div name='named'></div>");
  assert.ok(anchors.has("one"));
  assert.ok(anchors.has("one-1"));
  assert.ok(anchors.has("named"));

  const links = collectLinks("[ref][]\n[ref]: ./doc.md");
  assert.equal(links.length, 1);
  assert.equal(links[0].destination, "./doc.md");

  const statusError = await validateExternalLink("https://example.com", () =>
    Promise.resolve({
      body: { cancel: () => Promise.resolve() },
      ok: false,
      status: 500,
    } as unknown as Response),
  );
  assert.equal(statusError, "returned HTTP 500");

  const networkError = await validateExternalLink("https://example.com", () =>
    Promise.reject(new Error("offline")),
  );
  assert.match(networkError ?? "", /offline/);
});

