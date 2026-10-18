import { LastSyncBadge } from "@/components/dashboard/LastSyncBadge";
import { MermaChart } from "@/components/dashboard/MermaChart";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { toFarmDateKey } from "@/lib/dashboard/merma";
import {
  getLastSyncedAt,
  getMermaSeries,
  getShiftTotals,
  getTodaySummary,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = toFarmDateKey(new Date());

  try {
    const [summary, series, shifts, lastSyncedAt] = await Promise.all([
      getTodaySummary(today),
      getMermaSeries(today),
      getShiftTotals(today),
      getLastSyncedAt(),
    ]);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl font-semibold">Panel</h1>
            <p className="text-sm text-muted-foreground">
              Conciliación de ordeños y despachos.
            </p>
          </div>
          <LastSyncBadge lastSyncedAt={lastSyncedAt} />
        </div>

        <SummaryCards summary={summary} />
        <MermaChart series={series} shifts={shifts} />
      </div>
    );
  } catch {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-xl font-semibold">Panel</h1>
        <p className="text-sm text-destructive">
          No se pudieron cargar los datos del panel. Intentá de nuevo.
        </p>
      </div>
    );
  }
}
