"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { syncNow } from "@/lib/db/sync";
import { cn } from "@/lib/utils";

const PENDING_REFRESH_MS = 5_000;

export function SyncIndicator() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(async () => {
    setPending(await db.syncQueue.count());
  }, []);

  useEffect(() => {
    let disposed = false;

    const tick = async () => {
      const count = await db.syncQueue.count();

      if (!disposed) {
        setPending(count);
      }
    };

    void tick();
    const interval = window.setInterval(tick, PENDING_REFRESH_MS);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, []);

  async function handleSync() {
    setSyncing(true);

    try {
      await syncNow();
    } finally {
      setSyncing(false);
      await refreshPending();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            pending > 0 ? "bg-clay" : "bg-primary",
          )}
        />
        {pending === 0 ? "Sin pendientes" : `${pending} pendientes`}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="min-w-11"
        disabled={syncing}
        onClick={handleSync}
        aria-label="Sincronizar ahora"
      >
        <RefreshCw aria-hidden className={cn(syncing && "animate-spin")} />
        <span className="hidden md:inline">
          {syncing ? "Sincronizando…" : "Sincronizar"}
        </span>
      </Button>
    </div>
  );
}
