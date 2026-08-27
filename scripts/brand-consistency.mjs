import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export const REQUIRED_BRAND_KEYS = [
  'name',
  'tagline',
  'description',
  'website',
  'colors',
  'fonts',
  'logo',
  'voice',
  'socialContentPillars',
  'socialConventions',
  'examplePosts',
  'visualCardRules',
];

export function loadBrandJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

export function missingRequiredKeys(brand) {
  return REQUIRED_BRAND_KEYS.filter((key) => !(key in brand));
}

export function missingAssetPaths(brand, baseDir) {
  const paths = Object.values(brand.logo).filter(
    (value) => typeof value === 'string' && value.includes('/')
  );
  return paths.filter((relativePath) => !existsSync(path.join(baseDir, relativePath)));
}

export function missingHexInHtml(hexList, htmlText) {
  const lowerHtml = htmlText.toLowerCase();
  return hexList.filter((hex) => !lowerHtml.includes(hex.toLowerCase()));
}
