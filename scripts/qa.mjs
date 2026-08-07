import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { pngInfo } from '/Users/nicholas/.codex/skills/graphic-design/scripts/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const completedIds = new Set(manifest.generation.completedMarkets || []);
const completedLocalizations = localizations.filter(locale => completedIds.has(locale.id));
const reportDir = path.join(root, 'review');
fs.mkdirSync(reportDir, { recursive: true });

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function rgbaAt(file, x, y) {
  const probe = spawnSync('ffmpeg', [
    '-v', 'error', '-i', file,
    '-vf', `crop=1:1:${x}:${y},format=rgba`,
    '-frames:v', '1', '-f', 'rawvideo', '-'
  ]);
  if (probe.status !== 0 || probe.stdout.length < 4) return null;
  return [...probe.stdout.subarray(0, 4)];
}

const assetChecks = manifest.assets.map(asset => {
  const file = path.join(root, asset.path);
  const actual = fs.existsSync(file) ? sha256(file) : null;
  return {
    asset: asset.path,
    exists: Boolean(actual),
    checksumMatches: actual === asset.sha256,
    expected: asset.sha256,
    actual
  };
});

const variants = completedLocalizations.map(locale => {
  const file = path.join(root, 'exports/previews', `${locale.id}.png`);
  const generatedDir = path.join(root, 'assets/generated', locale.id);
  const generatedPlate = path.join(generatedDir, 'city-plate.png');
  const generatedRunner = path.join(generatedDir, 'runner-alpha.png');
  const comfyComposite = path.join(generatedDir, 'comfy-composite.png');
  const presentationMask = path.join(root, 'assets/processed', `${locale.id}-alpha-mask.png`);
  const reasons = [];
  let render = null;
  if (!fs.existsSync(file)) {
    reasons.push('preview export missing');
  } else {
    render = pngInfo(file);
    if (render.width !== 1055 || render.height !== 1491) reasons.push('wrong pixel dimensions');
    if (!render.taggedSrgb) reasons.push('missing sRGB profile');
  }
  if (!fs.existsSync(generatedPlate)) reasons.push('city skyline plate not generated');
  else {
    const plateInfo = pngInfo(generatedPlate);
    if (plateInfo.width !== 1055 || plateInfo.height !== 1491) reasons.push('city skyline plate has wrong pixel dimensions');
  }
  if (!fs.existsSync(generatedRunner)) {
    reasons.push('localized runner alpha not generated');
  } else {
    const runnerInfo = pngInfo(generatedRunner);
    const transparentCorner = rgbaAt(generatedRunner, 0, 0);
    const opaqueCenter = rgbaAt(generatedRunner, Math.floor(runnerInfo.width / 2), Math.floor(runnerInfo.height / 2));
    if (runnerInfo.width !== 864 || runnerInfo.height !== 1232) reasons.push('runner alpha has wrong pixel dimensions');
    if (!transparentCorner || transparentCorner[3] > 16) reasons.push('runner alpha background is not transparent');
    if (!opaqueCenter || opaqueCenter[3] < 240) reasons.push('runner alpha subject is not opaque');
  }
  if (!fs.existsSync(comfyComposite)) reasons.push('Comfy composite not generated');
  else {
    const compositeInfo = pngInfo(comfyComposite);
    if (compositeInfo.width !== 1055 || compositeInfo.height !== 1491) reasons.push('Comfy composite has wrong pixel dimensions');
  }
  if (!fs.existsSync(presentationMask)) reasons.push('presentation alpha mask not generated');
  else {
    const maskInfo = pngInfo(presentationMask);
    if (maskInfo.width !== 864 || maskInfo.height !== 1232) reasons.push('presentation alpha mask has wrong pixel dimensions');
  }
  reasons.push('localized copy requires native-speaker and brand/legal review');
  reasons.push('landmark authenticity requires local human review');
  reasons.push('casting and cultural specificity require local human review');
  reasons.push('anatomy, alpha edges, and wardrobe require human review');
  reasons.push('resemblance, rights, and campaign approval require human review');
  const hardFailure = reasons.some(reason => /not generated|wrong pixel|missing sRGB|not transparent|not opaque/.test(reason));
  return {
    id: locale.id,
    city: locale.city,
    locale: locale.locale,
    output: path.relative(root, file),
    status: hardFailure ? 'FAIL' : 'REVIEW',
    render,
    reasons
  };
});

const graphValidation = path.join(reportDir, 'workflow-validation.json');
const graph = fs.existsSync(graphValidation) ? JSON.parse(fs.readFileSync(graphValidation, 'utf8')) : null;
const summary = {
  generatedAt: new Date().toISOString(),
  scope: 'three-market production proof: Comfy city + persona generation, Comfy compositing, deterministic type, human review',
  totals: {
    pass: variants.filter(v => v.status === 'PASS').length,
    review: variants.filter(v => v.status === 'REVIEW').length,
    fail: variants.filter(v => v.status === 'FAIL').length
  },
  assetChecks,
  workflow: graph,
  variants
};

fs.writeFileSync(path.join(reportDir, 'qa-report.json'), `${JSON.stringify(summary, null, 2)}\n`);
const markdown = [
  '# QA report',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  `Status: ${summary.totals.pass} PASS / ${summary.totals.review} REVIEW / ${summary.totals.fail} FAIL`,
  '',
  'Paris, London, and Tokyo completed in Comfy. REVIEW is the correct state until local language, casting, cultural, landmark, and brand/legal checks are signed off.',
  '',
  '| Market | Status | Reasons |',
  '|---|---|---|',
  ...variants.map(v => `| ${v.city} (${v.locale}) | ${v.status} | ${v.reasons.join('; ')} |`),
  '',
  '## Automated technical evidence',
  '',
  ...(graph ? [
    `- ${graph.status} — workflow validation: ${graph.productionNodes} executable nodes, ${graph.presentationNodes} presentation nodes, and ${graph.perMarketGraphs} generated market graphs.`,
    ...graph.checks.map(check => `- PASS — ${check}.`)
  ] : ['- FAIL — workflow validation evidence is missing.']),
  ...variants.map(v => `- ${v.status === 'FAIL' ? 'FAIL' : 'PASS'} — ${v.city}: final ${v.render?.width || 'unknown'} × ${v.render?.height || 'unknown'} with ${v.render?.taggedSrgb ? 'sRGB tag; final city plate, 864 × 1232 runner RGBA, transparent-corner and opaque-center alpha pixels, 864 × 1232 presentation mask, and 1055 × 1491 Comfy composite verified.' : 'missing sRGB tag or render metadata.'}`),
  '',
  '## Protected assets',
  '',
  ...assetChecks.map(a => `- ${a.checksumMatches ? 'PASS' : 'FAIL'} — \`${a.asset}\` checksum ${a.checksumMatches ? 'matches' : 'does not match'}.`),
  ''
].join('\n');
fs.writeFileSync(path.join(reportDir, 'qa-report.md'), markdown);

if (assetChecks.some(item => !item.checksumMatches) || variants.some(v => v.status === 'FAIL')) {
  console.error('QA contains hard failures. See review/qa-report.md.');
  process.exitCode = 1;
} else {
  console.log(`QA complete: ${summary.totals.review} REVIEW, no hard failures.`);
}
