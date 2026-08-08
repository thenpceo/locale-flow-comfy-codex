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

if (!locales.length) throw new Error('Usage: node scripts/clean-city-plate.mjs --locales cairo-ar,rio-pt');

const protectedPlatePath = path.join(root, 'assets/source/campaign-background.png');
const { data: protectedPlate, info: protectedInfo } = await sharp(protectedPlatePath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const moduleBox = { x: 100, y: 1030, width: 570, height: 365 };

for (const locale of locales) {
  const platePath = path.join(root, 'assets/generated', locale, 'city-plate.png');
  if (!fs.existsSync(platePath)) throw new Error(`Missing ${locale}/city-plate.png`);

  const { data, info } = await sharp(platePath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== protectedInfo.width || info.height !== protectedInfo.height) {
    throw new Error(`Unexpected ${locale} plate dimensions: ${info.width}x${info.height}`);
  }

  for (let y = moduleBox.y; y < moduleBox.y + moduleBox.height; y += 1) {
    for (let x = moduleBox.x; x < moduleBox.x + moduleBox.width; x += 1) {
      const pixel = (y * info.width + x) * 3;
      const red = data[pixel];
      const green = data[pixel + 1];
      const blue = data[pixel + 2];
      const generatedRed = red >= 115 && red >= green * 1.55 && red >= blue * 1.55;
      if (generatedRed) continue;

      const sourceRed = protectedPlate[pixel];
      const sourceGreen = protectedPlate[pixel + 1];
      const sourceBlue = protectedPlate[pixel + 2];
      const sourceGrid = sourceRed >= 150 && sourceGreen >= 150 && sourceBlue >= 150;
      if (sourceGrid) {
        data[pixel] = sourceRed;
        data[pixel + 1] = sourceGreen;
        data[pixel + 2] = sourceBlue;
      } else {
        data[pixel] = 0;
        data[pixel + 1] = 0;
        data[pixel + 2] = 0;
      }
    }
  }

  const tempPath = `${platePath}.clean.png`;
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toFile(tempPath);
  fs.renameSync(tempPath, platePath);
  console.log(path.relative(root, platePath));
}
