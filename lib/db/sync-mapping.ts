import type { Cow, Dispatch, Milking, SyncQueueItem } from "./schema";

export type SyncTable = SyncQueueItem["tableName"];
export type SyncOperation = SyncQueueItem["operation"];

export interface SyncTask {
  key: string;
  tableName: SyncTable;
  recordId: string;
  operation: SyncOperation;
  queueIds: number[];
  attempts: number;
  lastError: string | null;
  nextAttemptAt: Date | null;
}

function toIso(date: Date) {
  return date.toISOString();
}

export interface CowRow {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
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

export function fromCowRow(row: CowRow): Cow {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    active: row.active,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    syncedAt: row.synced_at ? new Date(row.synced_at) : null,
  };
}

export interface MilkingRow {
  id: string;
  cow_id: string;
  date: string;
  shift: Milking["shift"];
  liters: number | string;
  created_by: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export function fromMilkingRow(row: MilkingRow): Milking {
  return {
    id: row.id,
    cowId: row.cow_id,
    date: row.date,
    shift: row.shift,
    liters: Number(row.liters),
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    syncedAt: row.synced_at ? new Date(row.synced_at) : null,
  };
}

export interface DispatchRow {
  id: string;
  date: string;
  shift: Dispatch["shift"];
  liters: number | string;
  created_by: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export function fromDispatchRow(row: DispatchRow): Dispatch {
  return {
    id: row.id,
    date: row.date,
    shift: row.shift,
    liters: Number(row.liters),
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    syncedAt: row.synced_at ? new Date(row.synced_at) : null,
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
    const attempts = item.attempts ?? 0;
    const lastError = item.lastError ?? null;
    const nextAttemptAt = item.nextAttemptAt ?? null;

    if (existing) {
      existing.operation = item.operation;
      existing.attempts = Math.max(existing.attempts, attempts);
      existing.lastError = lastError ?? existing.lastError;
      existing.nextAttemptAt = latestDate(
        existing.nextAttemptAt,
        nextAttemptAt,
      );
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
      attempts,
      lastError,
      nextAttemptAt,
    });
  }

  return Array.from(tasks.values());
}

function latestDate(a: Date | null, b: Date | null): Date | null {
  if (!a) {
    return b;
  }

  if (!b) {
    return a;
  }

  return a.getTime() >= b.getTime() ? a : b;
}
