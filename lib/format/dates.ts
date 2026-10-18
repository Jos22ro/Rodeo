export const FARM_TIMEZONE = "America/Argentina/Buenos_Aires";

const FARM_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: FARM_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toFarmDateKey(date: Date): string {
  return FARM_DATE_FORMATTER.format(date);
}

export function todayKey(now: Date = new Date()): string {
  return toFarmDateKey(now);
}
