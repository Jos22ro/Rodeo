"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cow } from "@/lib/db/schema";

export function CowRow({
  cow,
  value,
  saved,
  error,
  onChange,
}: {
  cow: Cow;
  value: string;
  saved: number;
  error: string | null;
  onChange: (value: string) => void;
}) {
  const inputId = `milking-${cow.id}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={inputId} className="text-base font-semibold">
            {cow.code}
          </Label>
          {saved > 0 && <Badge variant="clay">Ya: {saved} L</Badge>}
        </div>
        <p className="truncate text-sm text-muted-foreground">{cow.name}</p>
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <Input
        id={inputId}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        pattern="[0-9]*[.,]?[0-9]*"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-16 w-28 shrink-0 text-center text-3xl font-semibold"
      />
    </div>
  );
}
