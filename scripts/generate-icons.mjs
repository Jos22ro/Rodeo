#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { brand } from "../lib/brand/brand.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: { out: { type: "string", default: repoRoot } },
});
const outRoot = resolve(values.out);

const publicDir = join(repoRoot, "public");
const markSvg = await readFile(join(publicDir, brand.assets.mark));
const glyphSvg = await readFile(join(publicDir, brand.assets.glyph));
const glyphAspect = aspectRatio(glyphSvg);

function aspectRatio(svg) {
  const viewBox = svg.toString("utf8").match(/viewBox="([^"]+)"/)?.[1];
  const [, , width, height] = (viewBox ?? "").split(/[\s,]+/).map(Number);
  if (!width || !height) {
    throw new Error("logo-glyph.svg needs a viewBox");
  }
  return width / height;
}

function gradientBackground(size) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="rodeo-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${brand.colors.primaryLight}" />
          <stop offset="1" stop-color="${brand.colors.primaryDeep}" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#rodeo-badge)" />
    </svg>`,
  );
}

function badgeIcon(size) {
  return sharp(markSvg).resize(size, size).png().toBuffer();
}

async function fullBleedIcon(size) {
  const height = Math.round(size * 0.6);
  const width = Math.round(height * glyphAspect);
  const glyph = await sharp(glyphSvg)
    .resize(width, height, { fit: "contain" })
    .png()
    .toBuffer();
  return sharp(gradientBackground(size))
    .composite([{ input: glyph, gravity: "centre" }])
    .png()
    .toBuffer();
}

const manifest = {
  id: "/",
  name: brand.name,
  short_name: brand.shortName,
  description: brand.description,
  start_url: "/cows",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  lang: "es-AR",
  theme_color: brand.colors.primary,
  background_color: brand.colors.background,
  icons: brand.icons.public
    .filter((icon) => !icon.file.startsWith("apple"))
    .map((icon) => ({
      src: `/icons/${icon.file}`,
      sizes: `${icon.size}x${icon.size}`,
      type: "image/png",
      ...(icon.kind === "maskable" ? { purpose: "maskable" } : {}),
    })),
};

const publicIconsDir = join(outRoot, "public", "icons");
const appDir = join(outRoot, "app");
await mkdir(publicIconsDir, { recursive: true });
await mkdir(appDir, { recursive: true });

for (const icon of brand.icons.public) {
  const buffer =
    icon.kind === "badge" ? await badgeIcon(icon.size) : await fullBleedIcon(icon.size);
  await writeFile(join(publicIconsDir, icon.file), buffer);
}

for (const icon of brand.icons.app) {
  const buffer =
    icon.kind === "badge" ? await badgeIcon(icon.size) : await fullBleedIcon(icon.size);
  await writeFile(join(appDir, icon.file), buffer);
}

await writeFile(
  join(outRoot, "public", "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Rodeo icons written to ${outRoot}`);
