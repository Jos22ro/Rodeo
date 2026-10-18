export type Shift = "morning" | "afternoon";

export const SHIFT_ORDER: Shift[] = ["morning", "afternoon"];

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
};

export interface MermaResult {
  liters: number;
  percent: number;
}

export interface DailyMerma {
  date: string;
  milked: number;
  dispatched: number;
  mermaLiters: number;
  mermaPercent: number;
}

export interface ShiftTotals {
  shift: Shift;
  milked: number;
  dispatched: number;
}

export interface LitersRow {
  date: string;
  liters: number;
}

export interface ShiftLitersRow {
  shift: Shift;
  liters: number;
}

export interface DispatchShiftLitersRow {
  shift: Shift | null;
  liters: number;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const STALE_HOURS = 24;

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function lastNDays(count: number, today: Date = new Date()): string[] {
  const days: string[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(
      toLocalDateKey(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - offset,
        ),
      ),
    );
  }

  return days;
}

export function computeMerma(milked: number, dispatched: number): MermaResult {
  if (milked <= 0) {
    return {
      liters: dispatched > 0 ? dispatched : 0,
      percent: dispatched > 0 ? 100 : 0,
    };
  }

  const liters = milked - dispatched;
  return { liters, percent: (liters / milked) * 100 };
}

export function sumByDate(rows: LitersRow[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const current = totals.get(row.date) ?? 0;
    totals.set(row.date, current + Number(row.liters));
  }

  return totals;
}

export function buildMermaSeries(
  days: string[],
  milkedByDate: Map<string, number>,
  dispatchedByDate: Map<string, number>,
): DailyMerma[] {
  return days.map((date) => {
    const milked = milkedByDate.get(date) ?? 0;
    const dispatched = dispatchedByDate.get(date) ?? 0;
    const merma = computeMerma(milked, dispatched);

    return {
      date,
      milked,
      dispatched,
      mermaLiters: merma.liters,
      mermaPercent: merma.percent,
    };
  });
}

export function buildShiftTotals(
  milkings: ShiftLitersRow[],
  dispatches: DispatchShiftLitersRow[],
): ShiftTotals[] {
  return SHIFT_ORDER.map((shift) => ({
    shift,
    milked: milkings
      .filter((milking) => milking.shift === shift)
      .reduce((sum, milking) => sum + Number(milking.liters), 0),
    dispatched: dispatches
      .filter((dispatch) => dispatch.shift === shift)
      .reduce((sum, dispatch) => sum + Number(dispatch.liters), 0),
  }));
}

export function formatRelativeTime(
  from: Date | null,
  now: Date = new Date(),
): string {
  if (!from) {
    return "sin sincronizar";
  }

  const diff = now.getTime() - from.getTime();

  if (diff < MS_PER_MINUTE) {
    return "hace instantes";
  }

  const minutes = Math.floor(diff / MS_PER_MINUTE);

  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.floor(diff / MS_PER_HOUR);

  if (hours < 24) {
    return `hace ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function isStale(
  from: Date | null,
  now: Date = new Date(),
  maxHours: number = STALE_HOURS,
): boolean {
  if (!from) {
    return true;
  }

  return now.getTime() - from.getTime() > maxHours * MS_PER_HOUR;
}
