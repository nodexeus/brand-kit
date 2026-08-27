import { readFileSync } from 'node:fs';

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
