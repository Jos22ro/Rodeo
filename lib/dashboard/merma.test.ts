import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildMermaSeries,
  buildShiftTotals,
  computeMerma,
  formatRelativeTime,
  isStale,
  lastNDays,
  parseDateKey,
  sumByDate,
  toLocalDateKey,
} from "./merma.ts";

test("toLocalDateKey uses local date parts, not UTC", () => {
  assert.equal(toLocalDateKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(toLocalDateKey(new Date(2026, 11, 31, 23, 30)), "2026-12-31");
});

test("parseDateKey builds a local date and round-trips with toLocalDateKey", () => {
  const parsed = parseDateKey("2026-10-17");
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 9);
  assert.equal(parsed.getDate(), 17);
  assert.equal(toLocalDateKey(parsed), "2026-10-17");
});
test("lastNDays returns the range oldest-first and handles month boundaries", () => {
  assert.deepEqual(lastNDays(3, new Date(2026, 0, 15)), [
    "2026-01-13",
    "2026-01-14",
    "2026-01-15",
  ]);
  assert.deepEqual(lastNDays(3, new Date(2026, 2, 1)), [
    "2026-02-27",
    "2026-02-28",
    "2026-03-01",
  ]);
  assert.equal(lastNDays(30, new Date(2026, 9, 17)).length, 30);
});

test("computeMerma subtracts dispatched from milked", () => {
  assert.deepEqual(computeMerma(100, 90), { liters: 10, percent: 10 });
  assert.deepEqual(computeMerma(120, 120), { liters: 0, percent: 0 });
});

test("computeMerma reports 100% when nothing was milked but milk left", () => {
  assert.deepEqual(computeMerma(0, 50), { liters: 50, percent: 100 });
});

test("computeMerma treats a day without dispatch as 100% merma", () => {
  assert.deepEqual(computeMerma(80, 0), { liters: 80, percent: 100 });
});

test("computeMerma returns zero for a day with no records", () => {
  assert.deepEqual(computeMerma(0, 0), { liters: 0, percent: 0 });
});

test("computeMerma keeps negative merma when more milk left than was milked", () => {
  assert.deepEqual(computeMerma(90, 100), {
    liters: -10,
    percent: -11.11111111111111,
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
      mermaLiters: 10,
      mermaPercent: 10,
    },
    {
      date: "2026-10-16",
      milked: 0,
      dispatched: 20,
      mermaLiters: 20,
      mermaPercent: 100,
    },
    {
      date: "2026-10-17",
      milked: 40,
      dispatched: 0,
      mermaLiters: 40,
      mermaPercent: 100,
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
