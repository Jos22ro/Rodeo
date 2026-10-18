"use client";

import { useEffect, useState } from "react";
import { MilkingSheet } from "@/components/milking/MilkingSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toast";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { listCows } from "@/lib/db/cows";
import { SYNCED_EVENT } from "@/lib/db/sync";
import type { Cow, Milking } from "@/lib/db/schema";
import { todayKey } from "@/lib/format/dates";

type Shift = Milking["shift"];

export default function MilkingPage() {
  const [cows, setCows] = useState<Cow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [shift, setShift] = useState<Shift>("morning");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDate(todayKey());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const currentUserId = await getCurrentUserId();
        const all = await listCows();
        if (cancelled) return;

        setUserId(currentUserId);
        setCows(all.filter((cow) => cow.active));
      } catch {
        if (!cancelled) setError("No se pudieron cargar las vacas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleSynced = () => {
      void load();
    };
    window.addEventListener(SYNCED_EVENT, handleSynced);

    return () => {
      cancelled = true;
      window.removeEventListener(SYNCED_EVENT, handleSynced);
    };
  }, []);

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h1 className="font-heading text-xl font-semibold">Ordeño</h1>
        <p className="text-sm text-muted-foreground">
          Registrá los litros por vaca y turno. Funciona sin conexión.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !userId && (
        <p className="text-sm text-destructive">
          No se pudo identificar al usuario. Volvé a iniciar sesión.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Turno y fecha</CardTitle>
          <div className="flex flex-wrap items-end gap-4 pt-2">
            <div className="w-full space-y-2 sm:w-auto">
              <Label htmlFor="milking-shift">Turno</Label>
              <Select
                value={shift}
                onValueChange={(value) => {
                  if (value) setShift(value);
                }}
              >
                <SelectTrigger
                  id="milking-shift"
                  aria-label="Turno"
                  className="h-10 w-full sm:w-36"
                >
                  <SelectValue>
                    {(value) => (value === "afternoon" ? "Tarde" : "Mañana")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Mañana</SelectItem>
                  <SelectItem value="afternoon">Tarde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2 sm:w-auto">
              <Label htmlFor="milking-date">Fecha</Label>
              <Input
                id="milking-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 w-full sm:w-44"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading || !date ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <MilkingSheet
              cows={cows}
              date={date}
              shift={shift}
              userId={userId}
            />
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
