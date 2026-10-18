import { db } from "./index";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/auth/current-user";
import {
  dedupeQueue,
  fromCowRow,
  toCowRow,
  toDispatchRow,
  toMilkingUpsert,
  type CowRow,
  type SyncTask,
  type SyncTable,
} from "./sync-mapping";

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
  const dirtyCowIds = new Set(
    tasks
      .filter((task) => task.tableName === "cows")
      .map((task) => task.recordId),
  );
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

  try {
    await pullCows(dirtyCowIds);
  } catch (error) {
    console.warn("No se pudieron descargar las vacas remotas", error);
  }

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
