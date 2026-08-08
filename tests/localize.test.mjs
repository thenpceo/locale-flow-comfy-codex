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

test('city-driven skyline prompt prevents source-city leakage and protects left-edge visibility', () => {
  const workflow = JSON.parse(fs.readFileSync(new URL('../workflows/nano-banana-pro-full-localizer.api.json', import.meta.url)));
  const strategist = workflow['4'].inputs.system_prompt;
  const generator = workflow['6'].inputs.system_prompt;

  for (const phrase of ['Space Needle', 'closed whitelist', 'x=3–22%', 'x=0% through at least x=72%']) {
    assert.match(strategist, new RegExp(phrase.replace(/[–%]/g, match => `\\${match}`)));
  }
  assert.match(generator, /Space Needle is forbidden/);
  assert.match(generator, /no empty lower-left gap/);
});

test('multi-locale planning bounds paid graph concurrency and records retry policy', () => {
  const pipeline = JSON.parse(fs.readFileSync(new URL('../config/pipeline.example.json', import.meta.url)));
  assert.equal(pipeline.batchPolicy.maxConcurrentLocales, 2);
  assert.equal(pipeline.batchPolicy.maxRetryAttempts, 1);
  assert.equal(pipeline.batchPolicy.retryBackoffSeconds, 60);
  assert.ok(pipeline.batchPolicy.retryableErrors.includes('429'));
});

test('paid execution graph exposes only the six locale deliverables', () => {
  const workflow = JSON.parse(fs.readFileSync(new URL('../workflows/nano-banana-pro-full-localizer.api.json', import.meta.url)));
  const outputNodes = Object.entries(workflow)
    .filter(([, node]) => ['SaveImage', 'SaveImageWithAlpha', 'SaveVideo', 'SaveText', 'PreviewImage'].includes(node.class_type));
  assert.deepEqual(outputNodes.map(([id]) => id), ['9', '15', '17', '18', '21', '22']);
  assert.equal(outputNodes.some(([, node]) => node.class_type === 'PreviewImage'), false);
});

test('runner generation forbids invented apparel, accessories, and lettering', () => {
  const workflow = JSON.parse(fs.readFileSync(new URL('../workflows/nano-banana-pro-full-localizer.api.json', import.meta.url)));
  const combined = `${workflow['4'].inputs.system_prompt} ${workflow['12'].inputs.system_prompt}`;
  for (const phrase of ['only permitted lettering', 'headbands', 'running-club', 'Preserve the supplied wardrobe exactly']) {
    assert.match(combined, new RegExp(phrase));
  }
});

test('Kling motion keeps the lower garment unbranded', () => {
  const workflow = JSON.parse(fs.readFileSync(new URL('../workflows/nano-banana-pro-full-localizer.api.json', import.meta.url)));
  assert.match(workflow['19'].inputs['multi_shot.prompt'], /solid-black unbranded lower garment/);
  assert.match(workflow['19'].inputs['multi_shot.prompt'], /only permitted lettering or brand mark/);
  assert.match(workflow['19'].inputs['multi_shot.negative_prompt'], /shorts logo/);
});

test('localized motion preserves CJK scoping and static city wrapping', () => {
  const motion = fs.readFileSync(new URL('../videos/nrc-localized-motion-poster/compositions/index.html', import.meta.url), 'utf8');
  assert.match(motion, /\.runwild\.cjk text/);
  assert.match(motion, /\.city-lockup\.cjk \.city/);
  assert.doesNotMatch(motion, /#root\.cjk/);
  const cityRule = motion.match(/\.city \{([\s\S]*?)\}/)?.[1] || '';
  assert.doesNotMatch(cityRule, /white-space:\s*nowrap/);
});

test('partial motion rerenders preserve prior locale manifest entries', () => {
  const renderer = fs.readFileSync(new URL('../scripts/render-motion-locales.mjs', import.meta.url), 'utf8');
  assert.match(renderer, /previousResults/);
  assert.match(renderer, /mergedResults\.set\(result\.locale, result\)/);
  assert.match(renderer, /locale\.localeCompare\(b\.locale\)/);
});
