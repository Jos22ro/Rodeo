import { db } from "./index";
import type { Milking } from "./schema";

export const MAX_LITERS_PER_COW = 100;

export function listMilkings(date: string, shift: Milking["shift"]) {
  return db.milkings
    .where("date")
    .equals(date)
    .filter((milking) => milking.shift === shift)
    .toArray();
}

export async function saveMilkings(input: {
  date: string;
  shift: Milking["shift"];
  createdBy: string;
  entries: { cowId: string; liters: number }[];
}) {
  let count = 0;
  let liters = 0;

  await db.transaction("rw", db.milkings, db.syncQueue, async () => {
    const existing = await db.milkings
      .where("date")
      .equals(input.date)
      .filter((milking) => milking.shift === input.shift)
      .toArray();
    const byCow = new Map(existing.map((milking) => [milking.cowId, milking]));

    for (const entry of input.entries) {
      if (entry.liters < 0) {
        throw new Error("Negativo");
      }

      if (entry.liters === 0) {
        continue;
      }

      const current = byCow.get(entry.cowId);
      const total = (current?.liters ?? 0) + entry.liters;

      if (total > MAX_LITERS_PER_COW) {
        throw new Error("ExcedeMaximo");
      }

      if (current) {
        await db.milkings.update(current.id, { liters: total });
        await db.syncQueue.add({
          tableName: "milkings",
          recordId: current.id,
          operation: "update",
          createdAt: new Date(),
        });
      } else {
        const milking: Milking = {
          id: crypto.randomUUID(),
          cowId: entry.cowId,
          date: input.date,
          shift: input.shift,
          liters: entry.liters,
          createdBy: input.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncedAt: null,
        };

        await db.milkings.add(milking);
        await db.syncQueue.add({
          tableName: "milkings",
          recordId: milking.id,
          operation: "insert",
          createdAt: new Date(),
        });
      }

      count += 1;
      liters += entry.liters;
    }
  });

  return { count, liters };
}
