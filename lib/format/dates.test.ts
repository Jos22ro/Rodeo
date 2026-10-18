import assert from "node:assert/strict";
import { test } from "node:test";
import { todayKey, toFarmDateKey } from "./dates.ts";

test("toFarmDateKey maps a UTC instant to the farm-local date", () => {
  assert.equal(toFarmDateKey(new Date("2026-10-17T12:00:00Z")), "2026-10-17");
  assert.equal(toFarmDateKey(new Date("2026-10-18T01:00:00Z")), "2026-10-17");
  assert.equal(toFarmDateKey(new Date("2026-10-18T02:59:59Z")), "2026-10-17");
  assert.equal(toFarmDateKey(new Date("2026-10-18T03:00:00Z")), "2026-10-18");
});

test("todayKey still shows yesterday one minute before the ART midnight", () => {
  assert.equal(todayKey(new Date("2026-10-18T02:59:59Z")), "2026-10-17");
  assert.equal(todayKey(new Date("2026-10-18T03:00:00Z")), "2026-10-18");
});
