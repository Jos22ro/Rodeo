"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <p className="text-sm text-muted-foreground">
        Todavía no hay vacas registradas.
      </p>
    );
  }

  return (
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
                <Button variant="outline" size="sm" onClick={() => onEdit(cow)}>
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
  );
}
