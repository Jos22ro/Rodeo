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
import {
  createCow,
  isCodeTaken,
  listCows,
  toggleCowActive,
  updateCow,
} from "@/lib/db/cows";
import type { Cow } from "@/lib/db/schema";
import { supabase } from "@/lib/supabase/client";

async function getCurrentUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) return data.user.id;
  } catch {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

export default function CowsPage() {
  const [cows, setCows] = useState<Cow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cow | null>(null);

  const refresh = useCallback(async () => {
    setCows(await listCows());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const currentUserId = await getCurrentUserId();
      if (cancelled) return;

      setUserId(currentUserId);
      await refresh();
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(cow: Cow) {
    setEditing(cow);
    setFormOpen(true);
  }

  async function handleToggle(cow: Cow) {
    await toggleCowActive(cow.id, !cow.active);
    await refresh();
  }

  async function handleSubmit(values: CowFormValues) {
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
