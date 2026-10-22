import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "cn";
import type { TodaySummary } from "@/lib/supabase/queries";

function formatLiters(liters: number): string {
  return (Math.round(liters * 100) / 100).toLocaleString("es-AR", {
    maximumFractionDigits: 1,
  });
}

export function SummaryCards({ summary }: { summary: TodaySummary }) {
  const mermaCritical = summary.mermaOver;

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
              mermaCritical && "text-destructive",
            )}
          >
            {formatLiters(summary.mermaLiters)} L ·{" "}
            {summary.mermaPercent.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            Merma (L) y % sobre lo ordeñado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
