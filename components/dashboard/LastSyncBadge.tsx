import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, isStale } from "@/lib/dashboard/merma";

export function LastSyncBadge({ lastSyncedAt }: { lastSyncedAt: Date | null }) {
  const now = new Date();
  const stale = isStale(lastSyncedAt, now);

  return (
    <Badge variant={stale ? "destructive" : "secondary"}>
      Última sync: {formatRelativeTime(lastSyncedAt, now)}
    </Badge>
  );
}
