"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cow } from "@/lib/db/schema";

export type CowFormValues = { name: string; code: string };

export function CowForm({
  open,
  onOpenChange,
  cow,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cow: Cow | null;
  onSubmit: (values: CowFormValues) => Promise<string | null>;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(cow?.name ?? "");
    setCode(cow?.code ?? "");
    setError(null);
  }, [open, cow]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const message = await onSubmit({ name: name.trim(), code: code.trim() });
    setSaving(false);

    if (message) {
      setError(message);
      return;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{cow ? "Editar vaca" : "Nueva vaca"}</DialogTitle>
            <DialogDescription>
              {cow
                ? "Actualizá el nombre o el código de la vaca."
                : "Cargá el nombre y el código de la vaca."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cow-code">Código</Label>
            <Input
              id="cow-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cow-name">Nombre</Label>
            <Input
              id="cow-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
