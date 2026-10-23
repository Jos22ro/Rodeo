export const BASE_DELAY_MS = 30_000;
export const MAX_DELAY_MS = 30 * 60_000;
export const MAX_ATTEMPTS = 5;

export function retryDelayMs(attempts: number): number {
  const safeAttempts = Math.max(0, Math.floor(attempts));

  if (safeAttempts <= 1) {
    return BASE_DELAY_MS;
  }

  return Math.min(BASE_DELAY_MS * 2 ** (safeAttempts - 1), MAX_DELAY_MS);
}

export function isTaskDue(
  nextAttemptAt: Date | null | undefined,
  now = new Date(),
): boolean {
  return !nextAttemptAt || nextAttemptAt.getTime() <= now.getTime();
}

export function isFailed(attempts: number): boolean {
  return attempts >= MAX_ATTEMPTS;
}
