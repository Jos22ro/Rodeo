import { db } from "./index";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/auth/current-user";
import {
  dedupeQueue,
  toCowRow,
  toDispatchRow,
  toMilkingUpsert,
  type SyncTask,
  type SyncTable,
} from "./sync-mapping";

export interface SyncSummary {
  synced: number;
  failed: number;
  skipped: boolean;
}

function emptySummary(): SyncSummary {
  return { synced: 0, failed: 0, skipped: true };
}

export async function syncNow(): Promise<SyncSummary> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return emptySummary();
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return emptySummary();
  }

  const tasks = dedupeQueue(await db.syncQueue.toArray());
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

  return { synced, failed, skipped: false };
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
