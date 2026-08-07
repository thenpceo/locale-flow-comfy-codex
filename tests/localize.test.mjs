import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('prototype includes ten unique target markets', () => {
  assert.equal(localizations.length, 10);
  assert.equal(new Set(localizations.map(item => item.id)).size, 10);
});

test('each market carries complete localization and landmark contracts', () => {
  for (const item of localizations) {
    for (const key of ['city', 'country', 'locale', 'language', 'headline', 'supporting', 'edgeCopy', 'locationLine', 'skylinePrompt']) {
      assert.equal(typeof item[key], 'string', `${item.id}.${key} must be a string`);
      assert.ok(item[key].trim(), `${item.id}.${key} must not be empty`);
    }
    assert.ok(['ltr', 'rtl'].includes(item.direction), `${item.id} direction`);
    assert.ok(item.landmarks.length >= 2, `${item.id} needs two landmark anchors`);
    assert.ok(item.avoid.length >= 3, `${item.id} needs cultural anti-cliches`);
  }
});

test('three interview markets and one motion proof completed the paid generation flow', () => {
  assert.equal(manifest.generation.spendApproved, true);
  const completed = new Set(manifest.generation.completedMarkets);
  for (const market of ['paris-fr', 'london-en', 'tokyo-ja']) {
    assert.ok(completed.has(market), `${market} must be completed`);
  }
  assert.ok(completed.has('new-york-en-motion-proof'));
  assert.equal(typeof manifest.generation.motion?.promptId, 'string');
  assert.ok(fs.existsSync(path.join(root, manifest.generation.motion.output)));
  assert.match(manifest.generation.state, /completed/i);
});

test('native canvas matches supplied assets', () => {
  assert.deepEqual([manifest.canvas.width, manifest.canvas.height], [1055, 1491]);
  assert.deepEqual(manifest.generation.protectedRegion, { x: 100, y: 1030, width: 570, height: 365 });
});
