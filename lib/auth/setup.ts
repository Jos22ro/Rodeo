import { timingSafeEqual } from "node:crypto";

export function isValidSetupToken(
  token: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!token || !expected) {
    return false;
  }

  const provided = Buffer.from(token);
  const secret = Buffer.from(expected);

  return provided.length === secret.length && timingSafeEqual(provided, secret);
}

export function canSetupAdmin(input: {
  token: string | null | undefined;
  expected: string | null | undefined;
  adminExists: boolean;
}): boolean {
  return !input.adminExists && isValidSetupToken(input.token, input.expected);
}
