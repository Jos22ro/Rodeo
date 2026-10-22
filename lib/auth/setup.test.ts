import assert from "node:assert/strict";
import test from "node:test";

import { canSetupAdmin, isValidSetupToken } from "./setup.ts";

test("accepts the expected token", () => {
  assert.equal(isValidSetupToken("secreto", "secreto"), true);
});

test("rejects wrong, empty or missing tokens", () => {
  assert.equal(isValidSetupToken("otro", "secreto"), false);
  assert.equal(isValidSetupToken("", "secreto"), false);
  assert.equal(isValidSetupToken(undefined, "secreto"), false);
  assert.equal(isValidSetupToken("secreto", undefined), false);
});

test("rejects tokens of a different length without throwing", () => {
  assert.equal(isValidSetupToken("secreto-largo", "secreto"), false);
});

test("setup is allowed only with a valid token and no admin", () => {
  assert.equal(
    canSetupAdmin({
      token: "secreto",
      expected: "secreto",
      adminExists: false,
    }),
    true,
  );
  assert.equal(
    canSetupAdmin({ token: "secreto", expected: "secreto", adminExists: true }),
    false,
  );
  assert.equal(
    canSetupAdmin({ token: "otro", expected: "secreto", adminExists: false }),
    false,
  );
  assert.equal(
    canSetupAdmin({
      token: undefined,
      expected: undefined,
      adminExists: false,
    }),
    false,
  );
});
