import {
  buildMermaSeries,
  buildShiftTotals,
  computeMerma,
  lastNDays,
  parseDateKey,
  sumByDate,
  type DailyMerma,
  type Shift,
  type ShiftTotals,
} from "@/lib/dashboard/merma";
import { createClient } from "./server";

export interface TodaySummary {
  date: string;
  milked: number;
  dispatched: number;
  mermaLiters: number;
  mermaPercent: number;
}

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

function sumLiters(rows: { liters: number }[]): number {
  return rows.reduce((total, row) => total + Number(row.liters), 0);
}

export async function getTodaySummary(date: string): Promise<TodaySummary> {
  const [milkings, dispatches] = await Promise.all([
    fetchMilkings(date, date),
    fetchDispatches(date, date),
  ]);

  const milked = sumLiters(milkings);
  const dispatched = sumLiters(dispatches);
  const merma = computeMerma(milked, dispatched);

  return {
    date,
    milked,
    dispatched,
    mermaLiters: merma.liters,
    mermaPercent: merma.percent,
  };
}

export async function getMermaSeries(
  today: string,
  days = 30,
): Promise<DailyMerma[]> {
  const range = lastNDays(days, parseDateKey(today));
  const from = range[0];
  const [milkings, dispatches] = await Promise.all([
    fetchMilkings(from, today),
    fetchDispatches(from, today),
  ]);

  return buildMermaSeries(range, sumByDate(milkings), sumByDate(dispatches));
}

export async function getShiftTotals(date: string): Promise<ShiftTotals[]> {
  const [milkings, dispatches] = await Promise.all([
    fetchMilkings(date, date),
    fetchDispatches(date, date),
  ]);

  return buildShiftTotals(milkings, dispatches);
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
