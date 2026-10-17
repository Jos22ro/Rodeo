"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { createDispatch } from "@/lib/db/dispatches";
import type { Dispatch } from "@/lib/db/schema";
import { isValidLiters, parseLiters } from "@/lib/format/parse-liters";

type Shift = NonNullable<Dispatch["shift"]>;
type ShiftValue = Shift | "none";

const SHIFT_LABELS: Record<ShiftValue, string> = {
  none: "Sin turno",
  morning: "Mañana",
  afternoon: "Tarde",
};

export function DispatchForm({
  date,
  onDateChange,
  userId,
  onSaved,
}: {
  date: string;
  onDateChange: (date: string) => void;
  userId: string | null;
  onSaved: () => void;
}) {
  const [shift, setShift] = useState<ShiftValue>("none");
  const [liters, setLiters] = useState("");
  const [saving, setSaving] = useState(false);

  const parsed = parseLiters(liters);
  const litersError =
    liters.trim() === ""
      ? null
      : parsed === null
        ? "Ingresá solo números."
        : !isValidLiters(parsed)
          ? "Los litros deben ser mayores a 0."
          : null;
  const canSave = Boolean(
    userId && date && parsed !== null && isValidLiters(parsed),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave || parsed === null || !userId) {
      return;
    }

    setSaving(true);

    try {
      await createDispatch({
        date,
        shift: shift === "none" ? null : shift,
        liters: parsed,
        createdBy: userId,
      });

      setLiters("");
      onSaved();

      toast.add({
        type: "success",
        title: "Despacho guardado",
        description: `${parsed} L`,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="dispatch-date">Fecha</Label>
          <Input
            id="dispatch-date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 w-44"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-shift">Turno</Label>
          <Select
            value={shift}
            onValueChange={(value) => {
              if (typeof value === "string") setShift(value as ShiftValue);
            }}
          >
            <SelectTrigger
              id="dispatch-shift"
              aria-label="Turno"
              className="h-10 w-36"
            >
              <SelectValue>
                {(value) => SHIFT_LABELS[value as ShiftValue] ?? "Sin turno"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin turno</SelectItem>
              <SelectItem value="morning">Mañana</SelectItem>
              <SelectItem value="afternoon">Tarde</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-liters">Litros totales</Label>
          <Input
            id="dispatch-liters"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            pattern="[0-9]*[.,]?[0-9]*"
            value={liters}
            onChange={(event) => setLiters(event.target.value)}
            aria-invalid={Boolean(litersError)}
            aria-describedby={litersError ? "dispatch-liters-error" : undefined}
            className="h-10 w-32"
          />
        </div>
      </div>

      {litersError && (
        <p id="dispatch-liters-error" className="text-sm text-destructive">
          {litersError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12"
        disabled={saving || !canSave}
      >
        {saving ? "Guardando..." : "Guardar Despacho"}
      </Button>
    </form>
  );
}
