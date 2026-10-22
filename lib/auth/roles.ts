export type ProfileRole = "owner" | "admin" | "capataz";

export function canViewDashboard(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
