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
const lockedPlate = path.join(root, `assets/generated/${localeId}/city-plate.png`);
const outputVideo = outputFlag >= 0
  ? path.resolve(args[outputFlag + 1])
  : localeFlag >= 0
    ? path.join(root, `assets/generated/${localeId}/runner-warmup-alpha.webm`)
    : path.join(root, 'videos/nrc-localized-motion-poster/assets/runner-warmup-alpha.webm');
const width = 1204;
const height = 1720;
const threshold = 32;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'nrc-runner-alpha-'));

if (!fs.existsSync(inputVideo) || !fs.existsSync(lockedPlate)) {
  throw new Error(`Missing ${localeId} motion video or locked city plate.`);
}

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', inputVideo,
  '-vsync', '0',
  path.join(temp, 'frame-%04d.png')
]);

const { data: background } = await sharp(lockedPlate)
  .resize(width, height, { fit: 'fill' })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const frames = fs.readdirSync(temp).filter(name => /^frame-\d+\.png$/.test(name)).sort();
if (!frames.length) throw new Error('FFmpeg extracted no frames.');

for (const [frameIndex, name] of frames.entries()) {
  const { data: frame } = await sharp(path.join(temp, name))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const binary = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 3;
      const delta = Math.max(
        Math.abs(frame[pixel] - background[pixel]),
        Math.abs(frame[pixel + 1] - background[pixel + 1]),
        Math.abs(frame[pixel + 2] - background[pixel + 2])
      );
      if (delta >= threshold) binary[y * width + x] = 1;
    }
  }

  const labels = new Int32Array(width * height);
  const components = [];
  let label = 0;
  const queue = new Int32Array(width * height);
  for (let start = 0; start < binary.length; start += 1) {
    if (!binary[start] || labels[start]) continue;
    label += 1;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    labels[start] = label;
    let area = 0;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    while (head < tail) {
      const index = queue[head++];
      const y = Math.floor(index / width);
      const x = index - y * width;
      area += 1;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      const neighbors = [index - 1, index + 1, index - width, index + width];
      for (const next of neighbors) {
        if (next < 0 || next >= binary.length || labels[next] || !binary[next]) continue;
        const nextY = Math.floor(next / width);
        const nextX = next - nextY * width;
        if (Math.abs(nextX - x) + Math.abs(nextY - y) !== 1) continue;
        labels[next] = label;
        queue[tail++] = next;
      }
    }
    components.push({ label, area, minX, maxX, minY, maxY });
  }

  const selected = new Set(
    components
      .filter(component => {
        const boxArea = (component.maxX - component.minX + 1) * (component.maxY - component.minY + 1);
        const crossesCenter = component.maxX >= 430 && component.minX <= 774;
        const reachesBody = component.maxY >= 520 && component.minY <= 1600;
        return component.area >= 10000 && crossesCenter && reachesBody && component.area / boxArea >= 0.035;
      })
      .sort((a, b) => b.area - a.area)
      .slice(0, 4)
      .map(component => component.label)
  );

  const alpha = Buffer.alloc(width * height);
  const extents = Array.from({ length: height }, () => null);
  for (let y = 0; y < height; y += 1) {
    let left = width;
    let right = -1;
    for (let x = 0; x < width; x += 1) {
      if (!selected.has(labels[y * width + x])) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
    if (right - left >= 20) extents[y] = [left, right];
  }

  // Interpolate only short interior gaps caused by dark garment pixels.
  let previousY = -1;
  for (let y = 0; y < height; y += 1) {
    if (!extents[y]) continue;
    if (previousY >= 0 && y - previousY > 1 && y - previousY <= 48) {
      const [fromLeft, fromRight] = extents[previousY];
      const [toLeft, toRight] = extents[y];
      for (let fillY = previousY + 1; fillY < y; fillY += 1) {
        const progress = (fillY - previousY) / (y - previousY);
        extents[fillY] = [
          Math.round(fromLeft + (toLeft - fromLeft) * progress),
          Math.round(fromRight + (toRight - fromRight) * progress)
        ];
      }
    }
    previousY = y;
  }

  for (let y = 0; y < height; y += 1) {
    if (!extents[y]) continue;
    const left = Math.max(0, extents[y][0] - 5);
    const right = Math.min(width - 1, extents[y][1] + 5);
    if (right - left < 35) continue;
    alpha.fill(255, y * width + left, y * width + right + 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    const row = y * width;
    const above = (y - 1) * width;
    const below = (y + 1) * width;
    for (let x = 1; x < width - 1; x += 1) {
      if (!alpha[row + x] && alpha[above + x] && alpha[below + x]) alpha[row + x] = 255;
    }
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const rgb = pixel * 3;
    const out = pixel * 4;
    rgba[out] = frame[rgb];
    rgba[out + 1] = frame[rgb + 1];
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
