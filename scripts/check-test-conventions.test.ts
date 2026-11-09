import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findTestTitleViolations,
  fixTestTitles,
} from "./check-test-conventions.ts";

void test("should detect direct, modified, and parameterized test APIs", () => {
  const source = [
    'it("creates a record", () => {});',
    'test.skip("skips a record", () => {});',
    'test.each([[1]])("formats %s", () => {});',
    'void test("should keep valid wording", () => {});',
    '/value/.test("ordinary method");',
  ].join("\n");

  assert.deepEqual(
    findTestTitleViolations(source).map(({ line, title }) => ({ line, title })),
    [
      { line: 1, title: "creates a record" },
      { line: 2, title: "skips a record" },
      { line: 3, title: "formats %s" },
    ],
  );
});

void test("should prefix only nonconforming static test titles", () => {
  const source = [
    "it('creates a record', () => {});",
    "test(`should preserve valid wording`, () => {});",
    "test(`dynamic ${value}`, () => {});",
  ].join("\n");

  assert.equal(
    fixTestTitles(source),
    [
      "it('should create a record', () => {});",
      "test(`should preserve valid wording`, () => {});",
      "test(`dynamic ${value}`, () => {});",
    ].join("\n"),
  );
});

void test("should normalize common negative and copular test titles", () => {
  assert.equal(
    fixTestTitles('it("does not mutate state", () => {});\nit("is deterministic", () => {});'),
    'it("should not mutate state", () => {});\nit("should be deterministic", () => {});',
  );
});
