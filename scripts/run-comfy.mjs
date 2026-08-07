import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(process.argv.slice(2).map(value => {
  const [key, ...rest] = value.replace(/^--/, '').split('=');
  return [key, rest.join('=') || true];
}));
const cityId = args.get('city') || 'paris-fr';
const execute = args.get('execute') === true;
const spendApproval = args.get('approve-spend') === 'YES';
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const city = localizations.find(item => item.id === cityId);
if (!city) throw new Error(`Unknown city id: ${cityId}`);
const workflow = JSON.parse(fs.readFileSync(path.join(root, 'workflows/city-skyline-localizer.api.json'), 'utf8'));
workflow['9'].inputs.prompt = workflow['9'].inputs.prompt.replace(
  /an unmistakable Paris skyline led by the Eiffel Tower with a restrained Montparnasse Tower counterpoint/i,
  city.skylinePrompt
);
workflow['14'].inputs.seed = Number(args.get('seed') || 498017);

console.log(JSON.stringify({
  mode: execute ? 'execute requested' : 'dry run',
  city: city.id,
  landmarks: city.landmarks,
  seed: workflow['14'].inputs.seed,
  model: workflow['4'].inputs.unet_name,
  crop: { x: 100, y: 1030, width: 570, height: 365 },
  paidJobSubmitted: false
}, null, 2));

if (!execute) {
  console.log('Dry run complete. No upload and no Comfy job submission occurred.');
  process.exit(0);
}
if (!spendApproval) throw new Error('Spend gate closed. Execution requires --execute --approve-spend=YES after explicit user approval.');
if (!process.env.COMFY_CLOUD_API_KEY) throw new Error('COMFY_CLOUD_API_KEY is required for execution.');
throw new Error('Execution adapter intentionally remains disabled until the first explicit spend approval. Import the UI workflow for a manual first proof or enable the adapter in the approval turn.');
