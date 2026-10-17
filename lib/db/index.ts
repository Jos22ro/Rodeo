import Dexie, { type Table } from "dexie";
import type { Cow, Milking, Dispatch, SyncQueueItem } from "./schema";

class GanaderiaDB extends Dexie {
  cows!: Table<Cow, string>;
  milkings!: Table<Milking, string>;
  dispatches!: Table<Dispatch, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("ganaderia");
    this.version(1).stores({
      cows: "id, code, active",
      milkings: "id, cowId, date, shift, syncedAt",
      dispatches: "id, date, syncedAt",
      syncQueue: "++id, tableName, recordId",
    });
  }
}

export const db = new GanaderiaDB();

function enqueueSync(
  tableName: SyncQueueItem["tableName"],
  recordId: string,
  operation: SyncQueueItem["operation"],
) {
  db.syncQueue.add({ tableName, recordId, operation, createdAt: new Date() });
}

db.cows.hook("creating", (primKey, obj) => {
  const now = new Date();
  obj.createdAt = now;
  obj.updatedAt = now;
  obj.syncedAt = null;
});

db.cows.hook("updating", (mods) => {
  return { ...mods, updatedAt: new Date(), syncedAt: null };
});

db.cows.hook("deleting", (primKey) => {
  enqueueSync("cows", primKey as string, "delete");
});

db.milkings.hook("creating", (primKey, obj) => {
  const now = new Date();
  obj.createdAt = now;
  obj.updatedAt = now;
  obj.syncedAt = null;
});

db.milkings.hook("updating", (mods) => {
  return { ...mods, updatedAt: new Date(), syncedAt: null };
});

db.milkings.hook("deleting", (primKey) => {
  enqueueSync("milkings", primKey as string, "delete");
});

db.dispatches.hook("creating", (primKey, obj) => {
  const now = new Date();
  obj.createdAt = now;
  obj.updatedAt = now;
  obj.syncedAt = null;
});

db.dispatches.hook("updating", (mods) => {
  return { ...mods, updatedAt: new Date(), syncedAt: null };
});

db.dispatches.hook("deleting", (primKey) => {
  enqueueSync("dispatches", primKey as string, "delete");
});
