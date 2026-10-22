import assert from "node:assert/strict";
import test from "node:test";

import { canViewDashboard } from "./roles.ts";

test("owner and admin can view the dashboard", () => {
  assert.equal(canViewDashboard("owner"), true);
  assert.equal(canViewDashboard("admin"), true);
});

test("capataz cannot view the dashboard", () => {
  assert.equal(canViewDashboard("capataz"), false);
});

test("missing or unknown roles cannot view the dashboard", () => {
  assert.equal(canViewDashboard(null), false);
  assert.equal(canViewDashboard(undefined), false);
  assert.equal(canViewDashboard(""), false);
  assert.equal(canViewDashboard("otro"), false);
});
