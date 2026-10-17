"use client";

import { useCallback, useEffect, useState } from "react";
import { CowRow } from "@/components/milking/CowRow";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { listMilkings, saveMilkings } from "@/lib/db/milkings";
import type { Cow, Milking } from "@/lib/db/schema";
import { parseLiters } from "@/lib/format/parse-liters";

function parseMilkingLiters(raw: string | undefined) {
  if (raw === undefined || raw.trim() === "") {
    return 0;
  }

  return parseLiters(raw);
}

export function MilkingSheet({
  cows,
  date,
  shift,
  userId,
}: {
  cows: Cow[];
  date: string;
  shift: Milking["shift"];
  userId: string | null;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const loadSaved = useCallback(async () => {
    const rows = await listMilkings(date, shift);
    const totals: Record<string, number> = {};

    for (const row of rows) {
      totals[row.cowId] = (totals[row.cowId] ?? 0) + row.liters;
    }

    setSaved(totals);
  }, [date, shift]);

  useEffect(() => {
    setValues({});
    setSaved({});
    void loadSaved().catch(() => {});
  }, [loadSaved]);

  function errorFor(cowId: string) {
    const parsed = parseMilkingLiters(values[cowId]);

    if (parsed === null) {
      return "Ingresá solo números.";
    }

    if (parsed < 0) {
      return "Los litros no pueden ser negativos.";
    }

    if ((saved[cowId] ?? 0) + parsed > 100) {
      return "El total de la vaca no puede superar 100 L.";
    }

    return null;
  }

  const pending = cows
    .map((cow) => ({ cow, liters: parseMilkingLiters(values[cow.id]) ?? 0 }))
    .filter((entry) => entry.liters > 0);
  const hasErrors = cows.some((cow) => errorFor(cow.id) !== null);

  async function handleSave() {
    if (!userId || pending.length === 0) {
      return;
    }

    setSaving(true);

    try {
      const result = await saveMilkings({
        date,
        shift,
        createdBy: userId,
        entries: pending.map((entry) => ({
          cowId: entry.cow.id,
          liters: entry.liters,
        })),
      });

      setValues({});
      await loadSaved();

      toast.add({
        type: "success",
        title: "Ordeño guardado",
        description: `${result.count} ${result.count === 1 ? "vaca" : "vacas"} · ${result.liters} L`,
      });
    } catch {
      toast.add({
        type: "error",
        title: "No se pudo guardar",
        description: "Intentá de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (cows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay vacas activas. Cargalas en la sección Vacas.
      </p>
    );
  }

  return (
    <>
      {/* shortcut: lista simple sin virtualizar; revisar si crece el número de vacas activas */}
      <div className="divide-y">
        {cows.map((cow) => (
          <CowRow
            key={cow.id}
            cow={cow}
            value={values[cow.id] ?? ""}
            saved={saved[cow.id] ?? 0}
            error={errorFor(cow.id)}
            onChange={(value) =>
              setValues((current) => ({ ...current, [cow.id]: value }))
            }
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {pending.length} {pending.length === 1 ? "vaca" : "vacas"}
          </p>
          <Button
            size="lg"
            className="h-14 flex-1 text-base"
            onClick={handleSave}
            disabled={saving || hasErrors || !userId || pending.length === 0}
          >
            {saving ? "Guardando..." : "Guardar Ordeño"}
          </Button>
        </div>
      </div>
    </>
  );
}
