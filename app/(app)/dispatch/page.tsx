"use client";

import { useCallback, useEffect, useState } from "react";
import { DispatchForm } from "@/components/dispatch/DispatchForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/toast";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { listDispatches } from "@/lib/db/dispatches";
import type { Dispatch } from "@/lib/db/schema";

const SHIFT_LABELS: Record<NonNullable<Dispatch["shift"]>, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
};

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatTime(value: Date) {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function DispatchPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDate(today());
  }, []);

  const refresh = useCallback(async (forDate: string) => {
    setDispatches(await listDispatches(forDate));
  }, []);

  useEffect(() => {
    if (!date) return;

    let cancelled = false;

    async function load() {
      try {
        const currentUserId = await getCurrentUserId();
        if (cancelled) return;

        setUserId(currentUserId);
        await refresh(date);
      } catch {
        if (!cancelled) setError("No se pudieron cargar los despachos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [date, refresh]);

  function handleSaved() {
    setError(null);
    void refresh(date).catch(() => {
      setError("No se pudieron cargar los despachos.");
    });
  }

  const total = dispatches.reduce((sum, dispatch) => sum + dispatch.liters, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Despacho</h1>
        <p className="text-sm text-muted-foreground">
          Registrá los litros que salen de la finca. Funciona sin conexión.
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
          <CardTitle>Nuevo despacho</CardTitle>
          <CardDescription>
            Cargá la fecha, el turno (opcional) y el total de litros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !date ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <DispatchForm
              date={date}
              onDateChange={setDate}
              userId={userId}
              onSaved={handleSaved}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despachos del día</CardTitle>
          <CardDescription>
            {dispatches.length}{" "}
            {dispatches.length === 1 ? "registro" : "registros"} · {total} L
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dispatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay despachos para esta fecha.
            </p>
          ) : (
            <ul className="divide-y">
              {dispatches.map((dispatch) => (
                <li
                  key={dispatch.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-base font-semibold">
                      {dispatch.shift
                        ? SHIFT_LABELS[dispatch.shift]
                        : "Sin turno"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(dispatch.createdAt)}
                    </p>
                  </div>
                  <p className="text-base font-semibold">{dispatch.liters} L</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
