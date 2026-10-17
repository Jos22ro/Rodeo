import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidLiters, parseLiters } from "./parse-liters.ts";

test("parseLiters returns null for empty input", () => {
  assert.equal(parseLiters(""), null);
  assert.equal(parseLiters("   "), null);
});

test("parseLiters returns null for non-numeric input", () => {
  assert.equal(parseLiters("abc"), null);
  assert.equal(parseLiters("1,2,3"), null);
});

test("parseLiters parses zero and integers", () => {
  assert.equal(parseLiters("0"), 0);
  assert.equal(parseLiters("42"), 42);
});

test("parseLiters accepts comma and dot decimals", () => {
  assert.equal(parseLiters("12,5"), 12.5);
  assert.equal(parseLiters("12.5"), 12.5);
});

test("parseLiters parses negatives", () => {
  assert.equal(parseLiters("-1"), -1);
});

test("isValidLiters rejects zero and negatives", () => {
  assert.equal(isValidLiters(0), false);
  assert.equal(isValidLiters(-1), false);
});

test("isValidLiters accepts positive values", () => {
  assert.equal(isValidLiters(0.5), true);
  assert.equal(isValidLiters(12.5), true);
});
