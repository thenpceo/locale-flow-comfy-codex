import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = args.indexOf('--locales');
const locales = (flag >= 0 ? args[flag + 1] : '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

if (!locales.length) throw new Error('Usage: node scripts/clean-runner-alpha.mjs --locales cairo-ar,rio-pt');

for (const locale of locales) {
  const source = path.join(root, 'assets/generated', locale, 'runner-raw.png');
  const output = path.join(root, 'assets/generated', locale, 'runner-alpha.png');
  if (!fs.existsSync(source)) throw new Error(`Missing ${locale}/runner-raw.png`);

  const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const input = pixel * 3;
    const target = pixel * 4;
    const red = data[input];
    const green = data[input + 1];
    const blue = data[input + 2];
    const dominance = green - Math.max(red, blue);
    let alpha;
    if (green >= 90 && dominance >= 65) alpha = 0;
    else if (dominance <= 20) alpha = 255;
    else alpha = Math.round(255 * (65 - dominance) / 45);

    rgba[target] = red;
    rgba[target + 1] = Math.min(green, Math.max(red, blue));
    rgba[target + 2] = blue;
    rgba[target + 3] = alpha;
  }

  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(output);
  console.log(path.relative(root, output));
}
