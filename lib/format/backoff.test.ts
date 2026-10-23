import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BASE_DELAY_MS,
  MAX_ATTEMPTS,
  MAX_DELAY_MS,
  isFailed,
  isTaskDue,
  retryDelayMs,
} from "./backoff.ts";

test("retryDelayMs starts at the base delay", () => {
  assert.equal(retryDelayMs(0), BASE_DELAY_MS);
  assert.equal(retryDelayMs(1), BASE_DELAY_MS);
});

test("retryDelayMs doubles with each failure", () => {
  assert.equal(retryDelayMs(2), BASE_DELAY_MS * 2);
  assert.equal(retryDelayMs(3), BASE_DELAY_MS * 4);
  assert.equal(retryDelayMs(4), BASE_DELAY_MS * 8);
});

test("retryDelayMs caps at the ceiling", () => {
  assert.equal(retryDelayMs(20), MAX_DELAY_MS);
  assert.equal(retryDelayMs(100), MAX_DELAY_MS);
});

test("isTaskDue treats missing dates as due", () => {
  const now = new Date("2026-10-22T12:00:00Z");

  assert.equal(isTaskDue(undefined, now), true);
  assert.equal(isTaskDue(null, now), true);
});

test("isTaskDue compares the scheduled time", () => {
  const now = new Date("2026-10-22T12:00:00Z");

  assert.equal(isTaskDue(new Date("2026-10-22T11:59:00Z"), now), true);
  assert.equal(isTaskDue(now, now), true);
  assert.equal(isTaskDue(new Date("2026-10-22T12:01:00Z"), now), false);
});

test("isFailed marks tasks after the retry limit", () => {
  assert.equal(isFailed(0), false);
  assert.equal(isFailed(MAX_ATTEMPTS - 1), false);
  assert.equal(isFailed(MAX_ATTEMPTS), true);
  assert.equal(isFailed(MAX_ATTEMPTS + 1), true);
});
