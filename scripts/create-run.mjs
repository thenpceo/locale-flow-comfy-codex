import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const valueFor = flag => {
  const direct = args.find(item => item.startsWith(flag + '='));
  if (direct) return direct.slice(flag.length + 1);
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const requested = (valueFor('--locales') || '').split(',').map(value => value.trim()).filter(Boolean);
if (!requested.length) {
  console.error('Usage: node scripts/create-run.mjs --locales paris-fr,london-en,tokyo-ja');
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const pipeline = JSON.parse(fs.readFileSync(path.join(root, 'config/pipeline.example.json'), 'utf8'));
const byId = new Map(all.map(item => [item.id, item]));
const missing = requested.filter(id => !byId.has(id));
if (missing.length) {
  console.error('Unknown locale ids: ' + missing.join(', '));
  process.exit(1);
}

const now = new Date();
const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const digest = crypto.createHash('sha256').update(requested.join(',')).digest('hex').slice(0, 8);
const runId = valueFor('--run-id') || stamp + '-' + digest;
const runDir = path.join(root, 'runs', runId);
fs.mkdirSync(runDir, { recursive: true });

const asset = (localeId, name, node) => ({
  path: path.relative(root, path.join(runDir, localeId, 'comfy', name)),
  sha256: null,
  sourceNodeId: node
});

for (const id of requested) {
  const market = byId.get(id);
  const localeDir = path.join(runDir, id);
  fs.mkdirSync(path.join(localeDir, 'comfy'), { recursive: true });
  const handoff = {
    schemaVersion: 1,
    runId,
    localeId: id,
    city: market.city,
    locale: market.locale,
    status: 'planned',
    comfy: {
      workflowId: '21f30a93-e0fb-43d3-a620-e2065174cec5',
      workflowVersion: 7,
      batchId: null,
      promptId: null,
      completed: false,
      completedAt: null
    },
    copy: {
      headline: market.headline,
      supporting: market.supporting,
      edgeCopy: market.edgeCopy,
      locationLine: market.locationLine
    },
    assets: {
      cityPlate: asset(id, 'city-plate.png', '9'),
      runnerAlpha: asset(id, 'runner-alpha.png', '15'),
      composite: asset(id, 'comfy-composite.png', '17'),
      runnerRaw: asset(id, 'runner-raw.png', '18'),
      warmupVideo: asset(id, 'runner-warmup.mp4', '21'),
      strategistJson: asset(id, 'strategist.json', '22')
    },
    review: {
      language: 'pending',
      culture: 'pending',
      casting: 'pending',
      landmarks: 'pending',
      brand: 'pending',
      rights: 'pending'
    },
    static: {},
    motion: {}
  };
  fs.writeFileSync(path.join(localeDir, 'handoff.json'), JSON.stringify(handoff, null, 2) + '\n');
}

const run = {
  schemaVersion: 1,
  runId,
  createdAt: now.toISOString(),
  status: 'planned',
  locales: requested,
  batches: Array.from(
    { length: Math.ceil(requested.length / pipeline.batchPolicy.maxConcurrentLocales) },
    (_, index) => requested.slice(
      index * pipeline.batchPolicy.maxConcurrentLocales,
      (index + 1) * pipeline.batchPolicy.maxConcurrentLocales
    )
  ),
  batchPolicy: pipeline.batchPolicy,
  workflowId: '21f30a93-e0fb-43d3-a620-e2065174cec5',
  workflowVersion: 7,
  apiWorkflow: 'workflows/nano-banana-pro-full-localizer.api.json',
  next: 'Open this repository in Codex and ask it to execute AGENTS.md for this run id.'
};
fs.writeFileSync(path.join(runDir, 'run.json'), JSON.stringify(run, null, 2) + '\n');
console.log(path.relative(root, runDir));
