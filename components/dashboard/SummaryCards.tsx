import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "cn";
import type { DaySummary } from "@/lib/dashboard/merma";

function formatLiters(liters: number): string {
  return (Math.round(liters * 100) / 100).toLocaleString("es-AR", {
    maximumFractionDigits: 1,
  });
}

function formatPercent(percent: number): string {
  return percent.toLocaleString("es-AR", { maximumFractionDigits: 1 });
}

export function SummaryCards({ summary }: { summary: DaySummary }) {
  const mermaCaption = summary.over
    ? "Salida mayor al ordeñe"
    : summary.dispatched === 0
      ? "Sin despachos cargados"
      : "Leche sin despachar";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Ordeñado hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-semibold tabular-nums">
            {formatLiters(summary.milked)} L
          </p>
          <p className="text-sm text-muted-foreground">Mañana + Tarde</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Despachado hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-semibold tabular-nums">
            {formatLiters(summary.dispatched)} L
          </p>
          <p className="text-sm text-muted-foreground">Salidas registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Merma hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "font-heading text-2xl font-semibold tabular-nums",
              summary.over && "text-destructive",
            )}
          >
            {formatLiters(summary.mermaLiters)} L ·{" "}
            {formatPercent(summary.mermaPercent)}%
          </p>
          <p className="text-sm text-muted-foreground">{mermaCaption}</p>
        </CardContent>
      </Card>
    </div>
  );
}
