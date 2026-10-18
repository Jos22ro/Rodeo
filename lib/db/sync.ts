import { db } from "./index";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/auth/current-user";
import {
  dedupeQueue,
  fromCowRow,
  fromDispatchRow,
  fromMilkingRow,
  toCowRow,
  toDispatchRow,
  toMilkingUpsert,
  type CowRow,
  type DispatchRow,
  type MilkingRow,
  type SyncTask,
  type SyncTable,
} from "./sync-mapping";
import type { Milking } from "./schema";

export const SYNCED_EVENT = "ganaderia:synced";

export interface SyncSummary {
  synced: number;
  failed: number;
  skipped: boolean;
}

function emptySummary(): SyncSummary {
  return { synced: 0, failed: 0, skipped: true };
}

let inFlight: Promise<SyncSummary> | null = null;

export function syncNow(): Promise<SyncSummary> {
  if (!inFlight) {
    inFlight = runSync().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}

async function runSync(): Promise<SyncSummary> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return emptySummary();
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return emptySummary();
  }

  const tasks = dedupeQueue(await db.syncQueue.toArray());
  const dirty = {
    cows: dirtyIdsFor(tasks, "cows"),
    milkings: dirtyIdsFor(tasks, "milkings"),
    dispatches: dirtyIdsFor(tasks, "dispatches"),
  };
  let synced = 0;
  let failed = 0;

  for (const task of tasks) {
    try {
      await pushTask(task);
      synced += 1;
      await db.syncQueue.bulkDelete(task.queueIds);
    } catch {
      failed += 1;
    }
  }

  await pullSafely("las vacas", () => pullCows(dirty.cows));
  await pullSafely("los ordeños", () => pullMilkings(dirty.milkings));
  await pullSafely("los despachos", () => pullDispatches(dirty.dispatches));

  const summary = { synced, failed, skipped: false };

  if (failed > 0) {
    console.warn("Sync con tareas fallidas", summary);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNCED_EVENT));
  }

  return summary;
}

async function pullCows(dirtyIds: Set<string>) {
  const { data, error } = await supabase
    .from("cows")
    .select(
      "id, name, code, active, created_by, created_at, updated_at, synced_at",
    );

  if (error) {
    throw new Error(error.message);
  }

  const cows = ((data ?? []) as CowRow[])
    .filter((row) => !dirtyIds.has(row.id))
    .map(fromCowRow);

  if (cows.length > 0) {
    await db.cows.bulkPut(cows);
  }
}

function dirtyIdsFor(tasks: SyncTask[], table: SyncTable) {
  return new Set(
    tasks
      .filter((task) => task.tableName === table)
      .map((task) => task.recordId),
  );
}

async function pullSafely(label: string, pull: () => Promise<void>) {
  try {
    await pull();
  } catch (error) {
    console.warn(`No se pudieron descargar ${label}`, error);
  }
}

function milkingKey(milking: {
  cowId: string;
  date: string;
  shift: Milking["shift"];
}) {
  return `${milking.cowId}|${milking.date}|${milking.shift}`;
}

async function pullMilkings(dirtyIds: Set<string>) {
  const { data, error } = await supabase
    .from("milkings")
    .select(
      "id, cow_id, date, shift, liters, created_by, created_at, updated_at, synced_at",
    );

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as MilkingRow[];

  if (rows.length === 0) {
    return;
  }

  const byKey = new Map(
    (await db.milkings.toArray()).map((milking) => [
      milkingKey(milking),
      milking,
    ]),
  );
  const cowIds = new Set((await db.cows.toArray()).map((cow) => cow.id));
  const toAdd: Milking[] = [];
  const toUpdate: { id: string; changes: Partial<Milking> }[] = [];

  for (const row of rows) {
    const current = byKey.get(
      milkingKey({
        cowId: row.cow_id,
        date: row.date,
        shift: row.shift,
      }),
    );

    if (current) {
      if (dirtyIds.has(current.id)) {
        continue;
      }

      const updatedAt = new Date(row.updated_at);

      if (updatedAt.getTime() <= current.updatedAt.getTime()) {
        continue;
      }

      toUpdate.push({
        id: current.id,
        changes: {
          liters: Number(row.liters),
          updatedAt,
          syncedAt: row.synced_at ? new Date(row.synced_at) : null,
        },
      });
      continue;
    }

    if (cowIds.has(row.cow_id)) {
      toAdd.push(fromMilkingRow(row));
    }
  }

  if (toAdd.length > 0) {
    await db.milkings.bulkAdd(toAdd);
  }

  for (const update of toUpdate) {
    await db.milkings.update(update.id, update.changes);
  }
}

async function pullDispatches(dirtyIds: Set<string>) {
  const { data, error } = await supabase
    .from("dispatches")
    .select(
      "id, date, shift, liters, created_by, created_at, updated_at, synced_at",
    );

  if (error) {
    throw new Error(error.message);
  }

  const dispatches = ((data ?? []) as DispatchRow[])
    .filter((row) => !dirtyIds.has(row.id))
    .map(fromDispatchRow);

  if (dispatches.length > 0) {
    await db.dispatches.bulkPut(dispatches);
  }
}

async function pushTask(task: SyncTask) {
  const syncedAt = new Date().toISOString();

  if (task.tableName === "cows") {
    const cow = await db.cows.get(task.recordId);

    if (!cow || task.operation === "delete") {
      await deleteRemote("cows", task.recordId);
      return;
    }

    const { error } = await supabase
      .from("cows")
      .upsert(toCowRow(cow, syncedAt));

    if (error) {
      throw new Error(error.message);
    }

    await markSynced("cows", task.recordId);
    return;
  }

  if (task.tableName === "milkings") {
    const milking = await db.milkings.get(task.recordId);

    if (!milking || task.operation === "delete") {
      await deleteRemote("milkings", task.recordId);
      return;
    }

    const { row, options } = toMilkingUpsert(milking, syncedAt);
    const { error } = await supabase.from("milkings").upsert(row, options);

    if (error) {
      throw new Error(error.message);
    }

    await markSynced("milkings", task.recordId);
    return;
  }

  const dispatch = await db.dispatches.get(task.recordId);

  if (!dispatch || task.operation === "delete") {
    await deleteRemote("dispatches", task.recordId);
    return;
  }

  const { error } = await supabase
    .from("dispatches")
    .upsert(toDispatchRow(dispatch, syncedAt));

  if (error) {
    throw new Error(error.message);
  }

  await markSynced("dispatches", task.recordId);
}

async function deleteRemote(table: SyncTable, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

async function markSynced(table: SyncTable, id: string) {
  const syncedAt = new Date();

  if (table === "cows") {
    await db.cows.update(id, { syncedAt });
    return;
  }

  if (table === "milkings") {
    await db.milkings.update(id, { syncedAt });
    return;
  }

  await db.dispatches.update(id, { syncedAt });
}
