import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const editorPath = path.join(root, 'workflows/nike-run-localizer-codex-orchestrated-multi-locale-latest.json');
const apiPath = path.join(root, 'workflows/nano-banana-pro-full-localizer.api.json');
const editor = JSON.parse(fs.readFileSync(editorPath, 'utf8'));
const api = JSON.parse(fs.readFileSync(apiPath, 'utf8'));
const byId = new Map(editor.nodes.map(node => [String(node.id), node]));

editor.extra = editor.extra || {};
editor.extra.comfy_mcp = {
  name: 'Nike Run Localizer - Codex Orchestrated Multi-Locale - Latest',
  description: 'Latest 29-node interview workflow: one CITY input feeds a localization strategist, separate Nano Banana Pro skyline and green-screen fictional-person branches, RGB normalization, tolerance chroma alpha, still composite, Kling runner-only animation, Bria green normalization, JSON agent handoff, and visible completed references. Codex owns multi-locale fan-out and deterministic static/motion finishing.'
};

const runner = byId.get('10');
runner.title = api['10']._meta.title;
runner.widgets_values[0] = api['10'].inputs.image;

const strategist = byId.get('4');
strategist.widgets_values[strategist.widgets_values.length - 1] = api['4'].inputs.system_prompt;

const generator = byId.get('12');
generator.title = api['12']._meta.title;
generator.widgets_values[generator.widgets_values.length - 1] = api['12'].inputs.system_prompt;
generator.outputs[0].links = [30];

let rgb = byId.get('29');
if (!rgb) {
  rgb = {
    id: 29,
    type: 'ImageRemoveAlpha+',
    pos: [1520, 1050],
    size: [290, 110],
    flags: {},
    order: 28,
    mode: 0,
    inputs: [{ link: 30, name: 'image', type: 'IMAGE' }],
    outputs: [{ links: [13, 15, 18, 21, 22], name: 'IMAGE', slot_index: 0, type: 'IMAGE' }],
    properties: {},
    widgets_values: null,
    title: api['29']._meta.title
  };
  editor.nodes.push(rgb);
  byId.set('29', rgb);
} else {
  rgb.title = api['29']._meta.title;
  rgb.inputs = [{ link: 30, name: 'image', type: 'IMAGE' }];
  rgb.outputs = [{ links: [13, 15, 18, 21, 22], name: 'IMAGE', slot_index: 0, type: 'IMAGE' }];
}
editor.last_node_id = Math.max(editor.last_node_id || 0, 29);
editor.last_link_id = Math.max(editor.last_link_id || 0, 30);

Object.assign(byId.get('13'), {
  type: 'ColorToMask',
  title: api['13']._meta.title,
  inputs: [{ link: 13, name: 'images', type: 'IMAGE' }],
  outputs: [{ links: [14], name: 'MASK', slot_index: 0, type: 'MASK' }],
  widgets_values: [false, 0, 255, 0, 80, 16]
});

Object.assign(byId.get('14'), {
  title: api['14']._meta.title,
  inputs: [{ link: 14, name: 'mask', type: 'MASK' }],
  outputs: [{ links: [16, 19], name: 'MASK', slot_index: 0, type: 'MASK' }]
});

byId.get('15').title = api['15']._meta.title;
byId.get('16').title = api['16']._meta.title;

const kling = byId.get('19');
kling.title = api['19']._meta.title;
kling.inputs = [{ link: 22, name: 'start_frame', type: 'IMAGE' }];
kling.widgets_values[1] = api['19'].inputs['multi_shot.prompt'];
kling.widgets_values[2] = api['19'].inputs['multi_shot.negative_prompt'];

Object.assign(byId.get('20'), {
  type: 'BriaVideoGreenScreen',
  title: api['20']._meta.title,
  inputs: [{ link: 23, name: 'video', type: 'VIDEO' }],
  outputs: [{ links: [25], name: 'VIDEO', slot_index: 0, type: 'VIDEO' }],
  widgets_values: ['chroma_green', 290318, 'fixed']
});

byId.get('21').title = api['21']._meta.title;

const replacements = new Map([
  [13, [13, 29, 0, 13, 0, 'IMAGE']],
  [14, [14, 13, 0, 14, 0, 'MASK']],
  [15, [15, 29, 0, 15, 0, 'IMAGE']],
  [18, [18, 29, 0, 16, 1, 'IMAGE']],
  [19, [19, 14, 0, 16, 2, 'MASK']],
  [21, [21, 29, 0, 18, 0, 'IMAGE']],
  [22, [22, 29, 0, 19, 0, 'IMAGE']]
]);
editor.links = editor.links
  .filter(link => link[0] !== 24)
  .map(link => replacements.get(link[0]) || link);
if (!editor.links.some(link => link[0] === 30)) editor.links.push([30, 12, 0, 29, 0, 'IMAGE']);

fs.writeFileSync(editorPath, `${JSON.stringify(editor, null, 2)}\n`);
console.log('Updated the visible editor graph for chroma-key runner generation and Kling motion.');
