"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Cow } from "@/lib/db/schema";

export function CowTable({
  cows,
  onEdit,
  onToggle,
}: {
  cows: Cow[];
  onEdit: (cow: Cow) => void;
  onToggle: (cow: Cow) => void;
}) {
  if (cows.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay vacas"
        description="Cargá la primera vaca para empezar a registrar ordeños."
      />
    );
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {cows.map((cow) => (
          <div key={cow.id} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{cow.code}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {cow.name}
                </p>
              </div>
              <Badge variant={cow.active ? "default" : "secondary"}>
                {cow.active ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(cow)}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onToggle(cow)}
              >
                {cow.active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cows.map((cow) => (
              <TableRow key={cow.id}>
                <TableCell className="font-medium">{cow.code}</TableCell>
                <TableCell>{cow.name}</TableCell>
                <TableCell>
                  <Badge variant={cow.active ? "default" : "secondary"}>
                    {cow.active ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(cow)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggle(cow)}
                    >
                      {cow.active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
