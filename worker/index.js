"use strict";

const SYNC_TAG = "sync-data";

async function notifyClients() {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  clients.forEach((client) => client.postMessage({ type: "sync" }));
}

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClients());
  }
});
