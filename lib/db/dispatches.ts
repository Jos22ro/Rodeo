import { db } from "./index";
import type { Dispatch } from "./schema";

export function listDispatches(date: string) {
  return db.dispatches
    .where("date")
    .equals(date)
    .toArray()
    .then((rows) =>
      rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    );
}

export async function createDispatch(input: {
  date: string;
  shift: Dispatch["shift"];
  liters: number;
  createdBy: string;
}) {
  if (!Number.isFinite(input.liters) || input.liters <= 0) {
    throw new Error("LitrosInvalidos");
  }

  const now = new Date();
  const dispatch: Dispatch = {
    id: crypto.randomUUID(),
    date: input.date,
    shift: input.shift,
    liters: input.liters,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };

  await db.transaction("rw", db.dispatches, db.syncQueue, async () => {
    await db.dispatches.add(dispatch);
    await db.syncQueue.add({
      tableName: "dispatches",
      recordId: dispatch.id,
      operation: "insert",
      createdAt: new Date(),
    });
  });

  return dispatch;
}
