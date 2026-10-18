"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CowForm, type CowFormValues } from "@/components/cows/CowForm";
import { CowTable } from "@/components/cows/CowTable";
import { getCurrentUserId } from "@/lib/auth/current-user";
import {
  createCow,
  isCodeTaken,
  listCows,
  toggleCowActive,
  updateCow,
} from "@/lib/db/cows";
import { SYNCED_EVENT } from "@/lib/db/sync";
import type { Cow } from "@/lib/db/schema";

export default function CowsPage() {
  const [cows, setCows] = useState<Cow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cow | null>(null);

  const refresh = useCallback(async () => {
    setCows(await listCows());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const currentUserId = await getCurrentUserId();
        if (cancelled) return;

        setUserId(currentUserId);
        await refresh();
      } catch {
        if (!cancelled) setError("No se pudieron cargar las vacas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const handleSynced = () => {
      void refresh().catch(() => {});
    };
    window.addEventListener(SYNCED_EVENT, handleSynced);

    return () => {
      cancelled = true;
      window.removeEventListener(SYNCED_EVENT, handleSynced);
    };
  }, [refresh]);

  function openCreate() {
    setError(null);
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(cow: Cow) {
    setError(null);
    setEditing(cow);
    setFormOpen(true);
  }

  async function handleToggle(cow: Cow) {
    setError(null);

    try {
      await toggleCowActive(cow.id, !cow.active);
      await refresh();
    } catch {
      setError("No se pudo actualizar la vaca. Intentá de nuevo.");
    }
  }

  async function handleSubmit(values: CowFormValues) {
    if (!values.code) {
      return "Ingresá un código.";
    }

    if (!values.name) {
      return "Ingresá un nombre.";
    }

    if (await isCodeTaken(values.code, editing?.id)) {
      return "Ya existe una vaca con ese código.";
    }

    if (editing) {
      await updateCow(editing.id, values);
    } else {
      if (!userId) {
        return "No se pudo identificar al usuario. Volvé a iniciar sesión.";
      }
      await createCow({ ...values, createdBy: userId });
    }

    await refresh();
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold">Vacas</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná el listado de vacas de la finca.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Nueva vaca
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>
            {cows.length}{" "}
            {cows.length === 1 ? "vaca registrada" : "vacas registradas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <CowTable cows={cows} onEdit={openEdit} onToggle={handleToggle} />
          )}
        </CardContent>
      </Card>

      <CowForm
        open={formOpen}
        onOpenChange={setFormOpen}
        cow={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
