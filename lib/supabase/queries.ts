import {
  buildDaySummary,
  buildMermaSeries,
  buildShiftTotals,
  lastNDays,
  sumByDate,
  type DailyMerma,
  type DaySummary,
  type Shift,
  type ShiftTotals,
} from "@/lib/dashboard/merma";
import { createClient } from "./server";

interface MilkingRow {
  date: string;
  shift: Shift;
  liters: number;
}

interface DispatchRow {
  date: string;
  shift: Shift | null;
  liters: number;
}

export interface DashboardData {
  summary: DaySummary;
  series: DailyMerma[];
  shifts: ShiftTotals[];
}

function queryError(message: string, error: { message: string } | null): never {
  throw new Error(`${message}: ${error?.message ?? "error desconocido"}`);
}

async function fetchMilkings(from: string, to: string): Promise<MilkingRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("milkings")
    .select("date, shift, liters")
    .gte("date", from)
    .lte("date", to);

  if (error) {
    queryError("No se pudieron leer los ordeños", error);
  }

  return (data ?? []) as MilkingRow[];
}

async function fetchDispatches(
  from: string,
  to: string,
): Promise<DispatchRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dispatches")
    .select("date, shift, liters")
    .gte("date", from)
    .lte("date", to);

  if (error) {
    queryError("No se pudieron leer los despachos", error);
  }

  return (data ?? []) as DispatchRow[];
}

export async function getDashboardData(
  today: string,
  days = 30,
): Promise<DashboardData> {
  const range = lastNDays(days, today);
  const [milkings, dispatches] = await Promise.all([
    fetchMilkings(range[0], today),
    fetchDispatches(range[0], today),
  ]);
  const todayMilkings = milkings.filter((row) => row.date === today);
  const todayDispatches = dispatches.filter((row) => row.date === today);

  return {
    summary: buildDaySummary(today, todayMilkings, todayDispatches),
    series: buildMermaSeries(range, sumByDate(milkings), sumByDate(dispatches)),
    shifts: buildShiftTotals(todayMilkings, todayDispatches),
  };
}

export async function getLastSyncedAt(): Promise<Date | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("milkings")
    .select("synced_at")
    .not("synced_at", "is", null)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    queryError("No se pudo leer la última sincronización", error);
  }

  const syncedAt = (data as { synced_at: string | null } | null)?.synced_at;
  return syncedAt ? new Date(syncedAt) : null;
}
