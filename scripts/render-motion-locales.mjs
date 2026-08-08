import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.join(root, 'videos/nrc-localized-motion-poster');
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const byId = new Map(localizations.map(locale => [locale.id, locale]));
const args = process.argv.slice(2);
const localesFlag = args.indexOf('--locales');
const requested = (localesFlag >= 0 ? args[localesFlag + 1] : 'cairo-ar,rio-pt,san-francisco-en')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

function html(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function replaceText(source, id, value) {
  const pattern = new RegExp(`(<[^>]+id="${id}"[^>]*>)[\\s\\S]*?(<\\/[^>]+>)`);
  if (!pattern.test(source)) throw new Error(`Missing text target #${id}`);
  return source.replace(pattern, `$1${html(value)}$2`);
}

function localizeComposition(source, locale) {
  const words = locale.headline.trim().split(/\s+/);
  const split = words.length > 1 ? Math.ceil(words.length / 2) : 1;
  const line1 = words.slice(0, split).join(' ');
  const line2 = words.slice(split).join(' ') || locale.city;
  const edgeUnit = `NIKE.COM — ${locale.edgeCopy}`;
  const edgeTrack = Array(6).fill(edgeUnit).join(' \u00a0 ');

  let output = source
    .replace('aria-label="New York localized running motion poster"', `aria-label="${html(locale.city)} localized running motion poster"`)
    .replace('alt="New York campaign city plate"', `alt="${html(locale.city)} campaign city plate"`);
  if (/^(ja|zh)/.test(locale.locale)) {
    output = output
      .replace('<svg class="runwild"', '<svg class="runwild cjk"')
      .replace('<div class="city-lockup">', '<div class="city-lockup cjk">');
  }
  if (locale.direction === 'rtl') {
    output = output
      .replace('<svg class="runwild"', '<svg class="runwild rtl-hidden"')
      .replace('<div class="city-lockup">', '<div class="city-lockup rtl">')
      .replace('class="rtl-headline"', 'class="rtl-headline show"');
  }
  output = replaceText(output, 'nrc-run', line1);
  output = replaceText(output, 'nrc-wild', line2);
  output = replaceText(output, 'nrc-rtl-headline', locale.headline);
  output = replaceText(output, 'nrc-topline', edgeUnit);
  output = replaceText(output, 'nrc-edge-left', edgeTrack);
  output = replaceText(output, 'nrc-edge-right', edgeTrack);
  output = replaceText(output, 'nrc-city', locale.city);
  output = replaceText(output, 'nrc-support', locale.supporting);
  output = output.replace('FICTIONAL DEMO ROUTE · REPLACE BEFORE PRODUCTION', html(locale.locationLine));
  return output;
}

const renderDir = path.join(project, 'renders');
fs.mkdirSync(renderDir, { recursive: true });
const results = [];

for (const localeId of requested) {
  const locale = byId.get(localeId);
  if (!locale) throw new Error(`Unknown locale: ${localeId}`);
  const generatedDir = path.join(root, 'assets/generated', localeId);
  const required = ['city-plate.png', 'runner-warmup.mp4'];
  for (const name of required) {
    if (!fs.existsSync(path.join(generatedDir, name))) throw new Error(`Missing ${localeId}/${name}`);
  }

  execFileSync(process.execPath, [path.join(root, 'scripts/extract-runner-alpha-video.mjs'), '--locale', localeId], {
    cwd: root,
    stdio: 'inherit'
  });

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), `nrc-hyperframes-${localeId}-`));
  fs.cpSync(project, temp, {
    recursive: true,
    filter: source => !source.includes(`${path.sep}renders${path.sep}`) && !source.includes(`${path.sep}snapshots${path.sep}`)
  });
  fs.copyFileSync(path.join(generatedDir, 'city-plate.png'), path.join(temp, 'assets/city-plate.png'));
  fs.copyFileSync(path.join(generatedDir, 'runner-warmup-alpha.webm'), path.join(temp, 'assets/runner-warmup-alpha.webm'));
  const compositionPath = path.join(temp, 'compositions/index.html');
  fs.writeFileSync(compositionPath, localizeComposition(fs.readFileSync(compositionPath, 'utf8'), locale));
  fs.writeFileSync(
    path.join(temp, 'BRIEF.md'),
    fs.readFileSync(path.join(project, 'BRIEF.md'), 'utf8')
      .replaceAll('New York', locale.city)
      .replaceAll('"RUN WILD"', `"${locale.headline}"`)
      .replaceAll('"THE CITY RUNS WITH YOU"', `"${locale.supporting}"`)
      .replaceAll('"FICTIONAL DEMO ROUTE · REPLACE BEFORE PRODUCTION"', `"${locale.locationLine}"`)
  );

  execFileSync('npx', ['--yes', 'hyperframes@0.7.101', 'check'], { cwd: temp, stdio: 'inherit' });
  const output = path.join(renderDir, `${localeId}-motion-poster.mp4`);
  execFileSync('npx', [
    '--yes', 'hyperframes@0.7.101', 'render',
    '--quality', 'high', '--fps', '24', '--strict', '--output', output
  ], { cwd: temp, stdio: 'inherit' });

  const probe = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,r_frame_rate:format=duration',
    '-of', 'json', output
  ], { encoding: 'utf8' }));
  const stream = probe.streams[0];
  if (stream.codec_name !== 'h264' || stream.width !== 1204 || stream.height !== 1720 || stream.r_frame_rate !== '24/1') {
    throw new Error(`Unexpected render metadata for ${localeId}: ${JSON.stringify(probe)}`);
  }
  results.push({
    locale: localeId,
    output: path.relative(root, output),
    codec: stream.codec_name,
    width: stream.width,
    height: stream.height,
    fps: stream.r_frame_rate,
    duration: Number(probe.format.duration)
  });
  fs.rmSync(temp, { recursive: true, force: true });
}

const manifest = path.join(renderDir, 'locale-motion-manifest.json');
const previousResults = fs.existsSync(manifest)
  ? JSON.parse(fs.readFileSync(manifest, 'utf8')).results || []
  : [];
const mergedResults = new Map(previousResults.map(result => [result.locale, result]));
for (const result of results) mergedResults.set(result.locale, result);
fs.writeFileSync(manifest, `${JSON.stringify({
  renderedAt: new Date().toISOString(),
  results: [...mergedResults.values()].sort((a, b) => a.locale.localeCompare(b.locale))
}, null, 2)}\n`);
console.log(path.relative(root, manifest));
