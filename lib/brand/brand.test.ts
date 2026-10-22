import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { brand } from "./brand.ts";

const repoRoot = join(import.meta.dirname, "..", "..");

function readAsset(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

test("the brand keeps plain speech copy", () => {
  assert.equal(brand.name, "Rodeo");
  assert.ok(!brand.description.includes("!"));
  assert.ok(brand.description.endsWith("."));
  assert.ok(!/\bplease\b/i.test(brand.description));
});

test("manifest.json matches the brand source of truth", () => {
  const manifest = JSON.parse(readAsset("public/manifest.json"));
  assert.equal(manifest.name, brand.name);
  assert.equal(manifest.short_name, brand.shortName);
  assert.equal(manifest.description, brand.description);
  assert.equal(manifest.theme_color, brand.colors.primary);
  assert.equal(manifest.background_color, brand.colors.background);
});

test("globals.css defines the brand tokens", () => {
  const css = readAsset("app/globals.css").toLowerCase();
  assert.ok(css.includes(`--primary: ${brand.colors.primary.toLowerCase()};`));
  assert.ok(
    css.includes(
      `--primary-foreground: ${brand.colors.primaryForeground.toLowerCase()};`,
    ),
  );
});

test("brand mark assets exist and carry the brand colors", () => {
  const assets = [brand.assets.mark, brand.assets.glyph, brand.assets.lockup];
  for (const asset of assets) {
    const file = join(repoRoot, "public", asset.replace(/^\//, ""));
    assert.ok(existsSync(file), `${asset} should exist`);
  }
  const mark = readAsset("public/brand/logo-mark.svg");
  assert.ok(mark.includes(brand.colors.primaryLight));
  assert.ok(mark.includes(brand.colors.primaryDeep));
});

test("icon generator writes the expected brand icons", () => {
  const outRoot = mkdtempSync(join(tmpdir(), "rodeo-icons-"));
  try {
    execFileSync(
      process.execPath,
      [join(repoRoot, "scripts", "generate-icons.mjs"), "--out", outRoot],
      { stdio: "pipe" },
    );

    const expected: Record<string, number> = {
      "public/icons/icon-192.png": 192,
      "public/icons/icon-512.png": 512,
      "public/icons/icon-maskable-512.png": 512,
      "public/icons/apple-touch-icon.png": 180,
      "app/icon.png": 512,
      "app/apple-icon.png": 180,
    };
    for (const [relativePath, size] of Object.entries(expected)) {
      const file = join(outRoot, relativePath);
      assert.ok(existsSync(file), `${relativePath} should be generated`);
      const { width, height } = pngDimensions(readFileSync(file));
      assert.equal(width, size, `${relativePath} width`);
      assert.equal(height, size, `${relativePath} height`);
    }

    const generated = JSON.parse(
      readFileSync(join(outRoot, "public/manifest.json"), "utf8"),
    );
    const committed = JSON.parse(readAsset("public/manifest.json"));
    assert.deepEqual(generated, committed);
  } finally {
    rmSync(outRoot, { recursive: true, force: true });
  }
});

function pngDimensions(buffer: Buffer): { width: number; height: number } {
  assert.equal(buffer.readUInt32BE(0), 0x89504e47);
  assert.equal(buffer.toString("ascii", 12, 16), "IHDR");
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}
