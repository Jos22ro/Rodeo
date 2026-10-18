"use client";

import { useEffect } from "react";
import { syncNow } from "@/lib/db/sync";
import { warmAppRoutes } from "@/lib/pwa/warm-routes";

const SYNC_INTERVAL_MS = 30_000;
const SYNC_TAG = "sync-data";

interface SyncRegistration extends ServiceWorkerRegistration {
  sync?: { register(tag: string): Promise<void> };
}

async function registerBackgroundSync(registration: SyncRegistration) {
  try {
    await registration.sync?.register(SYNC_TAG);
  } catch {
    return;
  }
}

export function SyncProvider() {
  useEffect(() => {
    let disposed = false;

    const run = () => {
      void syncNow().catch(() => undefined);
    };

    const handleOnline = () => {
      run();
      void warmAppRoutes();
    };

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string } | null;

      if (data?.type === "sync") {
        run();
      }
    };

    window.addEventListener("online", handleOnline);
    const interval = window.setInterval(run, SYNC_INTERVAL_MS);
    run();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (disposed) {
            return;
          }

          void registerBackgroundSync(registration);

          return warmAppRoutes();
        })
        .catch(() => undefined);
    }

    return () => {
      disposed = true;
      window.removeEventListener("online", handleOnline);
      window.clearInterval(interval);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
