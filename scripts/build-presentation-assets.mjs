import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const processed = path.join(root, 'assets', 'processed');
const markets = ['paris-fr', 'london-en', 'tokyo-ja'];
fs.mkdirSync(processed, { recursive: true });

function ffmpeg(args, label) {
  const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Could not build ${label}.`);
}

ffmpeg([
  '-i', path.join(root, 'assets', 'source', 'campaign-background.png'),
  '-vf', 'crop=570:365:100:1030',
  '-frames:v', '1',
  path.join(processed, 'skyline-module-input.png')
], 'skyline module crop');

for (const market of markets) {
  ffmpeg([
    '-i', path.join(root, 'assets', 'generated', market, 'runner-alpha.png'),
    '-vf', 'alphaextract,format=gray',
    '-frames:v', '1',
    path.join(processed, `${market}-alpha-mask.png`)
  ], `${market} alpha mask`);
}

console.log('Built skyline crop and three inspectable alpha masks.');
