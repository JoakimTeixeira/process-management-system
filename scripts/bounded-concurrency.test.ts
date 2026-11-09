import assert from "node:assert/strict";
import { test } from "node:test";
import { mapWithConcurrency } from "./bounded-concurrency.ts";

void test("should preserve result order while respecting the concurrency limit", async () => {
  let active = 0;
  let maximumActive = 0;

  const results = await mapWithConcurrency([3, 1, 2, 4], 2, async (value) => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => setTimeout(resolve, value));
    active -= 1;
    return value * 2;
  });

  assert.deepEqual(results, [6, 2, 4, 8]);
  assert.equal(maximumActive, 2);
  await assert.rejects(
    mapWithConcurrency([], 0, () => Promise.resolve(undefined)),
    /positive integer/u,
  );
});
