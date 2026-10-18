import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildMermaSeries,
  buildShiftTotals,
  computeMerma,
  formatRelativeTime,
  isStale,
  lastNDays,
  sumByDate,
} from "./merma.ts";

test("lastNDays returns the range oldest-first and handles month boundaries", () => {
  assert.deepEqual(lastNDays(3, "2026-01-15"), [
    "2026-01-13",
    "2026-01-14",
    "2026-01-15",
  ]);
  assert.deepEqual(lastNDays(3, "2026-03-01"), [
    "2026-02-27",
    "2026-02-28",
    "2026-03-01",
  ]);
  assert.equal(lastNDays(30, "2026-10-17").length, 30);
  assert.deepEqual(lastNDays(1, "2026-01-01"), ["2026-01-01"]);
});

test("computeMerma reports the normal loss when more was milked than dispatched", () => {
  assert.deepEqual(computeMerma(100, 90), {
    liters: 10,
    percent: 10,
    over: false,
  });
  assert.deepEqual(computeMerma(120, 120), {
    liters: 0,
    percent: 0,
    over: false,
  });
});

test("computeMerma treats a day without dispatch as 100% merma but not a leak", () => {
  assert.deepEqual(computeMerma(80, 0), {
    liters: 80,
    percent: 100,
    over: false,
  });
});

test("computeMerma flags a dispatch-only day with 100% and over", () => {
  assert.deepEqual(computeMerma(0, 50), {
    liters: 50,
    percent: 100,
    over: true,
  });
});

test("computeMerma returns zero for a day with no records", () => {
  assert.deepEqual(computeMerma(0, 0), {
    liters: 0,
    percent: 0,
    over: false,
  });
});

test("computeMerma flags a leak when more milk left than was milked", () => {
  assert.deepEqual(computeMerma(90, 100), {
    liters: 10,
    percent: 11.11111111111111,
    over: true,
  });
});

test("sumByDate adds rows sharing a date and coerces numeric strings", () => {
  const totals = sumByDate([
    { date: "2026-10-17", liters: 10 },
    { date: "2026-10-17", liters: 5.5 },
    { date: "2026-10-16", liters: 3 },
  ]);
  assert.equal(totals.get("2026-10-17"), 15.5);
  assert.equal(totals.get("2026-10-16"), 3);
  assert.equal(totals.get("2026-10-15"), undefined);
});

test("buildMermaSeries fills missing days with zeros", () => {
  const series = buildMermaSeries(
    ["2026-10-15", "2026-10-16", "2026-10-17"],
    new Map([
      ["2026-10-15", 100],
      ["2026-10-17", 40],
    ]),
    new Map([
      ["2026-10-15", 90],
      ["2026-10-16", 20],
    ]),
  );

  assert.deepEqual(series, [
    {
      date: "2026-10-15",
      milked: 100,
      dispatched: 90,
      difference: 10,
      mermaLiters: 10,
      mermaPercent: 10,
      over: false,
    },
    {
      date: "2026-10-16",
      milked: 0,
      dispatched: 20,
      difference: -20,
      mermaLiters: 20,
      mermaPercent: 100,
      over: true,
    },
    {
      date: "2026-10-17",
      milked: 40,
      dispatched: 0,
      difference: 40,
      mermaLiters: 40,
      mermaPercent: 100,
      over: false,
    },
  ]);
});

test("buildShiftTotals groups milkings and dispatches by shift", () => {
  const totals = buildShiftTotals(
    [
      { shift: "morning", liters: 40 },
      { shift: "afternoon", liters: 30.5 },
    ],
    [
      { shift: "morning", liters: 35 },
      { shift: null, liters: 99 },
      { shift: "afternoon", liters: 28 },
    ],
  );

  assert.deepEqual(totals, [
    { shift: "morning", milked: 40, dispatched: 35 },
    { shift: "afternoon", milked: 30.5, dispatched: 28 },
    { shift: null, milked: 0, dispatched: 99 },
  ]);
});

test("formatRelativeTime scales from minutes to days", () => {
  const now = new Date(2026, 9, 17, 12, 0);

  assert.equal(formatRelativeTime(null, now), "sin sincronizar");
  assert.equal(
    formatRelativeTime(new Date(2026, 9, 17, 11, 59, 40), now),
    "hace instantes",
  );
  assert.equal(
    formatRelativeTime(new Date(2026, 9, 17, 11, 45), now),
    "hace 15 min",
  );
  assert.equal(
    formatRelativeTime(new Date(2026, 9, 17, 9, 0), now),
    "hace 3 h",
  );
  assert.equal(
    formatRelativeTime(new Date(2026, 9, 15, 12, 0), now),
    "hace 2 d",
  );
});

test("isStale flags null and anything older than 24 hours", () => {
  const now = new Date(2026, 9, 17, 12, 0);

  assert.equal(isStale(null, now), true);
  assert.equal(isStale(new Date(2026, 9, 16, 11, 0), now), true);
  assert.equal(isStale(new Date(2026, 9, 16, 12, 30), now), false);
});
