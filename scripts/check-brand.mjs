#!/usr/bin/env node
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  loadBrandJson,
  missingRequiredKeys,
  missingAssetPaths,
  missingHexInHtml,
} from './brand-consistency.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

let failed = false;

const brand = loadBrandJson(path.join(repoRoot, 'brand.json'));

const missingKeys = missingRequiredKeys(brand);
if (missingKeys.length > 0) {
  console.error('Missing required brand.json keys:', missingKeys.join(', '));
  failed = true;
}

const missingAssets = missingKeys.includes('logo') ? [] : missingAssetPaths(brand, repoRoot);
if (missingAssets.length > 0) {
  console.error('brand.json references missing asset files:', missingAssets.join(', '));
  failed = true;
}

const colorHtml = readFileSync(path.join(repoRoot, 'color.html'), 'utf8');
const hexValues = Object.values(brand.colors).flatMap((value) =>
  Array.isArray(value) ? value : [value]
);
const missingHex = missingHexInHtml(hexValues, colorHtml);
if (missingHex.length > 0) {
  console.error('color.html is missing hex values present in brand.json:', missingHex.join(', '));
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Brand consistency checks passed.');
