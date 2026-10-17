import { db } from "./index";
import type { Cow } from "./schema";

export async function listCows() {
  const cows = await db.cows.orderBy("code").toArray();
  return cows.sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true }),
  );
}

export async function isCodeTaken(code: string, excludeId?: string) {
  const existing = await db.cows.where("code").equals(code).first();
  return Boolean(existing && existing.id !== excludeId);
}

export async function createCow(input: {
  name: string;
  code: string;
  createdBy: string;
}) {
  const now = new Date();
  const cow: Cow = {
    id: crypto.randomUUID(),
    name: input.name,
    code: input.code,
    active: true,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };

  await db.transaction("rw", db.cows, db.syncQueue, async () => {
    await db.cows.add(cow);
    await db.syncQueue.add({
      tableName: "cows",
      recordId: cow.id,
      operation: "insert",
      createdAt: new Date(),
    });
  });
}

export async function updateCow(
  id: string,
  input: { name: string; code: string },
) {
  await db.transaction("rw", db.cows, db.syncQueue, async () => {
    await db.cows.update(id, { name: input.name, code: input.code });
    await db.syncQueue.add({
      tableName: "cows",
      recordId: id,
      operation: "update",
      createdAt: new Date(),
    });
  });
}

export async function toggleCowActive(id: string, active: boolean) {
  await db.transaction("rw", db.cows, db.syncQueue, async () => {
    await db.cows.update(id, { active });
    await db.syncQueue.add({
      tableName: "cows",
      recordId: id,
      operation: "update",
      createdAt: new Date(),
    });
  });
}
