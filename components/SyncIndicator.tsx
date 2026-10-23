"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSyncStatus, resetBackoff, syncNow } from "@/lib/db/sync";
import { cn } from "@/lib/utils";

const STATUS_REFRESH_MS = 5_000;

export function SyncIndicator() {
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshStatus = useCallback(async () => {
    const status = await getSyncStatus();
    setPending(status.pending);
    setFailed(status.failed);
  }, []);

  useEffect(() => {
    let disposed = false;

    const tick = async () => {
      const status = await getSyncStatus();

      if (!disposed) {
        setPending(status.pending);
        setFailed(status.failed);
      }
    };

    void tick();
    const interval = window.setInterval(tick, STATUS_REFRESH_MS);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, []);

  async function handleSync() {
    setSyncing(true);

    try {
      await resetBackoff();
      await syncNow();

      if ((await getSyncStatus()).pending > 0) {
        await syncNow();
      }
    } finally {
      setSyncing(false);
      await refreshStatus();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            failed > 0
              ? "bg-destructive"
              : pending > 0
                ? "bg-clay"
                : "bg-primary",
          )}
        />
        {failed > 0
          ? `${failed} ${failed === 1 ? "fallido" : "fallidos"} · ${pending} ${pending === 1 ? "pendiente" : "pendientes"}`
          : pending === 0
            ? "Sin pendientes"
            : `${pending} ${pending === 1 ? "pendiente" : "pendientes"}`}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="relative min-w-11"
        disabled={syncing}
        onClick={handleSync}
        aria-label={
          failed > 0 ? "Reintentar sincronización" : "Sincronizar ahora"
        }
      >
        <RefreshCw aria-hidden className={cn(syncing && "animate-spin")} />
        {failed > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {failed > 9 ? "9+" : failed}
          </span>
        )}
        <span className="hidden md:inline">
          {syncing
            ? "Sincronizando…"
            : failed > 0
              ? "Reintentar"
              : "Sincronizar"}
        </span>
      </Button>
    </div>
  );
}
