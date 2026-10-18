"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { syncNow } from "@/lib/db/sync";

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
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {pending === 0 ? "Sin pendientes" : `${pending} pendientes`}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={syncing}
        onClick={handleSync}
      >
        {syncing ? (
          "Sincronizando..."
        ) : (
          <>
            <span className="sm:hidden">Sincronizar</span>
            <span className="hidden sm:inline">Sincronizar ahora</span>
          </>
        )}
      </Button>
    </div>
  );
}
