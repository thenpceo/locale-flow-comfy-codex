import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { screenshot } from '/Users/nicholas/.codex/skills/graphic-design/scripts/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const featuredIds = new Set((process.env.NRC_MARKETS || 'paris-fr,london-en,tokyo-ja').split(','));
const featuredLocalizations = localizations.filter(locale => featuredIds.has(locale.id));
const outputDir = path.join(root, 'exports', 'previews');
const sourcePlate = path.join(root, 'assets/source/campaign-background.png');
const runner = path.join(root, 'assets/source/runner-cutout.png');
fs.mkdirSync(outputDir, { recursive: true });

function payload(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

const sheet = [];
for (const locale of featuredLocalizations) {
  const generatedDir = path.join(root, 'assets/generated', locale.id);
  const generatedPlate = path.join(generatedDir, 'city-plate.png');
  const generatedRunner = path.join(generatedDir, 'runner-alpha.png');
  const hasGeneratedPlate = fs.existsSync(generatedPlate);
  const hasGeneratedRunner = fs.existsSync(generatedRunner);
  const output = path.join(outputDir, `${locale.id}.png`);
  const data = {
    ...locale,
    plate: pathToFileURL(hasGeneratedPlate ? generatedPlate : sourcePlate).href,
    runner: pathToFileURL(hasGeneratedRunner ? generatedRunner : runner).href,
    statusLabel: hasGeneratedPlate && hasGeneratedRunner ? 'COMFY + AGENT · QA' : 'GENERATION PENDING'
  };
  screenshot({
    html: path.join(root, 'composition/poster.html'),
    output,
    width: 1055,
    height: 1491,
    query: `?payload=${encodeURIComponent(payload(data))}`
  });
  sheet.push({
    city: locale.city,
    locale: locale.locale,
    landmarks: locale.landmarks,
    image: pathToFileURL(output).href
  });
}

const contactSheet = path.join(root, 'exports', 'city-localization-contact-sheet.png');
screenshot({
  html: path.join(root, 'composition/contact-sheet.html'),
  output: contactSheet,
  width: 1920,
  height: 1200,
  query: `?payload=${encodeURIComponent(payload(sheet))}`
});

console.log(`Rendered ${featuredLocalizations.length} native-ratio previews.`);
console.log(`Contact sheet: ${contactSheet}`);
