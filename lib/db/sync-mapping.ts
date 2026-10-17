import type { Cow, Dispatch, Milking, SyncQueueItem } from "./schema";

export type SyncTable = SyncQueueItem["tableName"];
export type SyncOperation = SyncQueueItem["operation"];

export interface SyncTask {
  key: string;
  tableName: SyncTable;
  recordId: string;
  operation: SyncOperation;
  queueIds: number[];
}

function toIso(date: Date) {
  return date.toISOString();
}

export function toCowRow(cow: Cow, syncedAt: string) {
  return {
    id: cow.id,
    name: cow.name,
    code: cow.code,
    active: cow.active,
    created_by: cow.createdBy,
    created_at: toIso(cow.createdAt),
    updated_at: toIso(cow.updatedAt),
    synced_at: syncedAt,
  };
}

export function toMilkingUpsert(milking: Milking, syncedAt: string) {
  return {
    row: {
      id: milking.id,
      cow_id: milking.cowId,
      date: milking.date,
      shift: milking.shift,
      liters: milking.liters,
      created_by: milking.createdBy,
      created_at: toIso(milking.createdAt),
      updated_at: toIso(milking.updatedAt),
      synced_at: syncedAt,
    },
    options: { onConflict: "cow_id,date,shift" },
  };
}

export function toDispatchRow(dispatch: Dispatch, syncedAt: string) {
  return {
    id: dispatch.id,
    date: dispatch.date,
    shift: dispatch.shift,
    liters: dispatch.liters,
    created_by: dispatch.createdBy,
    created_at: toIso(dispatch.createdAt),
    updated_at: toIso(dispatch.updatedAt),
    synced_at: syncedAt,
  };
}

export function dedupeQueue(items: SyncQueueItem[]): SyncTask[] {
  const tasks = new Map<string, SyncTask>();

  for (const item of items) {
    const key = `${item.tableName}:${item.recordId}`;
    const queueId = typeof item.id === "number" ? item.id : null;
    const existing = tasks.get(key);

    if (existing) {
      existing.operation = item.operation;
      if (queueId !== null) {
        existing.queueIds.push(queueId);
      }
      continue;
    }

    tasks.set(key, {
      key,
      tableName: item.tableName,
      recordId: item.recordId,
      operation: item.operation,
      queueIds: queueId === null ? [] : [queueId],
    });
  }

  return Array.from(tasks.values());
}
