export function parseLiters(raw: string): number | null {
  if (raw.trim() === "") {
    return null;
  }

  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidLiters(liters: number): boolean {
  return Number.isFinite(liters) && liters > 0;
}
