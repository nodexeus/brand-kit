import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  loadBrandJson,
  missingRequiredKeys,
  missingAssetPaths,
  missingHexInHtml,
  REQUIRED_BRAND_KEYS,
} from './brand-consistency.mjs';

test('loadBrandJson parses valid JSON from disk', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-'));
  const file = path.join(dir, 'brand.json');
  writeFileSync(file, JSON.stringify({ name: 'Test' }));
  const result = loadBrandJson(file);
  assert.deepEqual(result, { name: 'Test' });
  rmSync(dir, { recursive: true, force: true });
});

test('loadBrandJson throws on invalid JSON', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-'));
  const file = path.join(dir, 'brand.json');
  writeFileSync(file, '{ not valid json');
  assert.throws(() => loadBrandJson(file));
  rmSync(dir, { recursive: true, force: true });
});

test('missingRequiredKeys returns all keys when object is empty', () => {
  assert.deepEqual(missingRequiredKeys({}), REQUIRED_BRAND_KEYS);
});

test('missingRequiredKeys returns empty array when all keys present', () => {
  const full = Object.fromEntries(REQUIRED_BRAND_KEYS.map((k) => [k, {}]));
  assert.deepEqual(missingRequiredKeys(full), []);
});

test('missingRequiredKeys returns only the keys that are absent', () => {
  const partial = { name: 'x', tagline: 'y' };
  const missing = missingRequiredKeys(partial);
  assert.ok(missing.includes('colors'));
  assert.ok(!missing.includes('name'));
});

test('missingAssetPaths returns paths that do not exist on disk', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-assets-'));
  mkdirSync(path.join(dir, 'assets', 'logo'), { recursive: true });
  writeFileSync(path.join(dir, 'assets', 'logo', 'present.svg'), '<svg></svg>');
  const brand = {
    logo: {
      present: 'assets/logo/present.svg',
      missing: 'assets/logo/missing.svg',
      clearspace: '1x icon height on all sides',
    },
  };
  const missing = missingAssetPaths(brand, dir);
  assert.deepEqual(missing, ['assets/logo/missing.svg']);
  rmSync(dir, { recursive: true, force: true });
});

test('missingHexInHtml finds hex values absent from the given HTML text', () => {
  const html = '<div style="color:#FDC700">amber</div>';
  const missing = missingHexInHtml(['#fdc700', '#050506'], html);
  assert.deepEqual(missing, ['#050506']);
});
