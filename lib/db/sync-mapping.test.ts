import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dedupeQueue,
  fromCowRow,
  fromDispatchRow,
  fromMilkingRow,
  toCowRow,
  toDispatchRow,
  toMilkingUpsert,
} from "./sync-mapping.ts";
import type { Cow, Dispatch, Milking, SyncQueueItem } from "./schema.ts";

const createdAt = new Date("2026-10-17T10:00:00.000Z");
const updatedAt = new Date("2026-10-17T10:05:00.000Z");
const syncedAt = "2026-10-17T11:00:00.000Z";

const cow: Cow = {
  id: "cow-1",
  name: "Lola",
  code: "A01",
  active: true,
  createdBy: "user-1",
  createdAt,
  updatedAt,
  syncedAt: null,
};

const milking: Milking = {
  id: "milking-1",
  cowId: "cow-1",
  date: "2026-10-17",
  shift: "morning",
  liters: 12.5,
  createdBy: "user-1",
  createdAt,
  updatedAt,
  syncedAt: null,
};

const dispatch: Dispatch = {
  id: "dispatch-1",
  date: "2026-10-17",
  shift: null,
  liters: 300,
  createdBy: "user-1",
  createdAt,
  updatedAt,
  syncedAt: null,
};

function queueItem(
  id: number | undefined,
  tableName: SyncQueueItem["tableName"],
  recordId: string,
  operation: SyncQueueItem["operation"],
  extra: Partial<
    Pick<SyncQueueItem, "attempts" | "lastError" | "nextAttemptAt">
  > = {},
): SyncQueueItem {
  return {
    id,
    tableName,
    recordId,
    operation,
    createdAt,
    attempts: 0,
    lastError: null,
    nextAttemptAt: null,
    ...extra,
  };
}

test("toCowRow maps camelCase to snake_case and stamps synced_at", () => {
  assert.deepEqual(toCowRow(cow, syncedAt), {
    id: "cow-1",
    name: "Lola",
    code: "A01",
    active: true,
    created_by: "user-1",
    created_at: "2026-10-17T10:00:00.000Z",
    updated_at: "2026-10-17T10:05:00.000Z",
    synced_at: syncedAt,
  });
});

test("fromCowRow maps snake_case to camelCase and parses dates", () => {
  assert.deepEqual(
    fromCowRow({
      id: "cow-1",
      name: "Lola",
      code: "A01",
      active: true,
      created_by: "user-1",
      created_at: "2026-10-17T10:00:00.000Z",
      updated_at: "2026-10-17T10:05:00.000Z",
      synced_at: syncedAt,
    }),
    { ...cow, syncedAt: new Date(syncedAt) },
  );
});

test("fromMilkingRow maps snake_case and coerces numeric liters", () => {
  assert.deepEqual(
    fromMilkingRow({
      id: "milking-1",
      cow_id: "cow-1",
      date: "2026-10-17",
      shift: "morning",
      liters: "12.5",
      created_by: "user-1",
      created_at: "2026-10-17T10:00:00.000Z",
      updated_at: "2026-10-17T10:05:00.000Z",
      synced_at: syncedAt,
    }),
    { ...milking, syncedAt: new Date(syncedAt) },
  );
});

test("fromDispatchRow maps snake_case and coerces numeric liters", () => {
  assert.deepEqual(
    fromDispatchRow({
      id: "dispatch-1",
      date: "2026-10-17",
      shift: null,
      liters: "300",
      created_by: "user-1",
      created_at: "2026-10-17T10:00:00.000Z",
      updated_at: "2026-10-17T10:05:00.000Z",
      synced_at: syncedAt,
    }),
    { ...dispatch, syncedAt: new Date(syncedAt) },
  );
});

test("toMilkingUpsert sets liters on conflict (cow_id,date,shift)", () => {
  const { row, options } = toMilkingUpsert(milking, syncedAt);

  assert.equal(options.onConflict, "cow_id,date,shift");
  assert.equal(row.liters, 12.5);
  assert.deepEqual(row, {
    id: "milking-1",
    cow_id: "cow-1",
    date: "2026-10-17",
    shift: "morning",
    liters: 12.5,
    created_by: "user-1",
    created_at: "2026-10-17T10:00:00.000Z",
    updated_at: "2026-10-17T10:05:00.000Z",
    synced_at: syncedAt,
  });
});

test("toDispatchRow keeps a null shift", () => {
  assert.deepEqual(toDispatchRow(dispatch, syncedAt), {
    id: "dispatch-1",
    date: "2026-10-17",
    shift: null,
    liters: 300,
    created_by: "user-1",
    created_at: "2026-10-17T10:00:00.000Z",
    updated_at: "2026-10-17T10:05:00.000Z",
    synced_at: syncedAt,
  });
});

test("dedupeQueue returns no tasks for an empty queue", () => {
  assert.deepEqual(dedupeQueue([]), []);
});

test("dedupeQueue keeps the last operation per record and collects queue ids", () => {
  const tasks = dedupeQueue([
    queueItem(1, "milkings", "milking-1", "insert"),
    queueItem(2, "milkings", "milking-1", "update"),
  ]);

  assert.equal(tasks.length, 1);
  assert.deepEqual(tasks[0], {
    key: "milkings:milking-1",
    tableName: "milkings",
    recordId: "milking-1",
    operation: "update",
    queueIds: [1, 2],
    attempts: 0,
    lastError: null,
    nextAttemptAt: null,
  });
});

test("dedupeQueue keeps the highest attempts and the latest retry", () => {
  const nextAttemptAt = new Date("2026-10-17T10:30:00.000Z");
  const tasks = dedupeQueue([
    queueItem(1, "cows", "cow-1", "update"),
    queueItem(2, "cows", "cow-1", "update", {
      attempts: 3,
      lastError: "network",
      nextAttemptAt,
    }),
  ]);

  assert.equal(tasks[0].attempts, 3);
  assert.equal(tasks[0].lastError, "network");
  assert.equal(tasks[0].nextAttemptAt, nextAttemptAt);
});

test("dedupeQueue keeps a delete as the final operation", () => {
  const tasks = dedupeQueue([
    queueItem(1, "cows", "cow-1", "insert"),
    queueItem(2, "cows", "cow-1", "update"),
    queueItem(3, "cows", "cow-1", "delete"),
  ]);

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].operation, "delete");
  assert.deepEqual(tasks[0].queueIds, [1, 2, 3]);
});

test("dedupeQueue keeps tasks in first-seen order and skips items without an id", () => {
  const tasks = dedupeQueue([
    queueItem(1, "cows", "cow-1", "update"),
    queueItem(2, "dispatches", "dispatch-1", "insert"),
    queueItem(undefined, "cows", "cow-2", "insert"),
  ]);

  assert.deepEqual(
    tasks.map((task) => task.key),
    ["cows:cow-1", "dispatches:dispatch-1", "cows:cow-2"],
  );
  assert.deepEqual(tasks[2].queueIds, []);
});
