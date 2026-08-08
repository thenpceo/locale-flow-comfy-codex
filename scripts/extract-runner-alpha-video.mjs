import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const localeFlag = args.indexOf('--locale');
const outputFlag = args.indexOf('--output');
const localeId = localeFlag >= 0 ? args[localeFlag + 1] : 'new-york-en';
const inputVideo = path.join(root, `assets/generated/${localeId}/runner-warmup.mp4`);
const outputVideo = outputFlag >= 0
  ? path.resolve(args[outputFlag + 1])
  : localeFlag >= 0
    ? path.join(root, `assets/generated/${localeId}/runner-warmup-alpha.webm`)
    : path.join(root, 'videos/nrc-localized-motion-poster/assets/runner-warmup-alpha.webm');
const width = 1204;
const height = 1720;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'nrc-runner-alpha-'));

if (!fs.existsSync(inputVideo)) {
  throw new Error(`Missing ${localeId} green-screen motion video.`);
}

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', inputVideo,
  '-vsync', '0',
  path.join(temp, 'frame-%04d.png')
]);

const frames = fs.readdirSync(temp).filter(name => /^frame-\d+\.png$/.test(name)).sort();
if (!frames.length) throw new Error('FFmpeg extracted no frames.');

for (const [frameIndex, name] of frames.entries()) {
  const { data: frame } = await sharp(path.join(temp, name))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(width * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const rgb = pixel * 3;
    const red = frame[rgb];
    const green = frame[rgb + 1];
    const blue = frame[rgb + 2];
    const greenDominance = green - Math.max(red, blue);
    if (green >= 90 && greenDominance >= 65) alpha[pixel] = 0;
    else if (greenDominance <= 20) alpha[pixel] = 255;
    else alpha[pixel] = Math.round(255 * (65 - greenDominance) / 45);
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const rgb = pixel * 3;
    const out = pixel * 4;
    rgba[out] = frame[rgb];
    const neutralGreen = Math.max(frame[rgb], frame[rgb + 2]);
    rgba[out + 1] = Math.min(frame[rgb + 1], neutralGreen);
    rgba[out + 2] = frame[rgb + 2];
    rgba[out + 3] = alpha[pixel];
  }

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 1 })
    .toFile(path.join(temp, `alpha-${String(frameIndex + 1).padStart(4, '0')}.png`));
}

fs.mkdirSync(path.dirname(outputVideo), { recursive: true });
execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-framerate', '24',
  '-i', path.join(temp, 'alpha-%04d.png'),
  '-c:v', 'libvpx-vp9',
  '-lossless', '1',
  '-pix_fmt', 'yuva420p',
  '-auto-alt-ref', '0',
  '-metadata:s:v:0', 'alpha_mode=1',
  outputVideo
]);

fs.rmSync(temp, { recursive: true, force: true });
console.log(path.relative(root, outputVideo));
