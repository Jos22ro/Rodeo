import { strict as assert } from "node:assert";
import { test } from "node:test";
import { APP_ROUTES, warmRoutes } from "./warm-routes.ts";

function recorder() {
  const calls: string[] = [];
  return {
    calls,
    fetch: (input: string) => {
      calls.push(input);
      return Promise.resolve({});
    },
  };
}

test("warmRoutes does not fetch when offline", async () => {
  const rec = recorder();
  await warmRoutes({ isOnline: false, hasController: true, fetch: rec.fetch });
  assert.equal(rec.calls.length, 0);
});

test("warmRoutes does not fetch without a service worker controller", async () => {
  const rec = recorder();
  await warmRoutes({ isOnline: true, hasController: false, fetch: rec.fetch });
  assert.equal(rec.calls.length, 0);
});

test("warmRoutes fetches every app route when online and controlled", async () => {
  const rec = recorder();
  await warmRoutes({ isOnline: true, hasController: true, fetch: rec.fetch });
  assert.deepEqual([...rec.calls].sort(), [...APP_ROUTES].sort());
});

test("warmRoutes tolerates individual failures", async () => {
  const calls: string[] = [];
  await warmRoutes({
    isOnline: true,
    hasController: true,
    fetch: (input: string) => {
      calls.push(input);
      return Promise.reject(new Error("boom"));
    },
  });
  assert.deepEqual([...calls].sort(), [...APP_ROUTES].sort());
});
