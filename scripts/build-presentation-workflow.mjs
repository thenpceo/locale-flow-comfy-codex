import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = JSON.parse(fs.readFileSync(path.join(root, 'workflows/nano-banana-pro-full-localizer.api.json'), 'utf8'));
const results = [
  ['23', '24', '39f955f2a4628861c26b42a929b99f509c1b984d870f6d24389f97835639ca03.png', 'PARIS'],
  ['25', '26', '028b9a6d98b906b28f51123de203b28e6fe562a5aeb4bf7ccf6fa751b5e33814.png', 'LONDON'],
  ['27', '28', 'd3de5794eded6d3044fce81bcbc37f1c004ae67498688d9946744679463a7c60.png', 'TOKYO']
];
for (const [loadId, previewId, image, city] of results) {
  workflow[loadId] = {class_type:'LoadImage',inputs:{image},_meta:{title:`AGENT RESULT · ${city} final localized poster`}};
  workflow[previewId] = {class_type:'PreviewImage',inputs:{images:[loadId,0]},_meta:{title:`PRESENTATION OUTPUT · ${city}`}};
}
fs.writeFileSync(path.join(root, 'workflows', 'nano-banana-pro-interview-presentation.api.json'), `${JSON.stringify(workflow, null, 2)}\n`);
console.log('Built presentation workflow with three real final poster previews.');
