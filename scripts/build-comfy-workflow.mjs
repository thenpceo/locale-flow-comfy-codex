import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = path.join(root, 'workflows');
fs.mkdirSync(workflowDir, { recursive: true });
const officialUrl = 'https://raw.githubusercontent.com/Comfy-Org/workflow_templates/refs/heads/main/templates/image_qwen_image_edit_2511.json';
const cachedTemplate = path.join(process.env.TMPDIR || os.tmpdir(), 'qwen-image-edit-2511-ui.json');

async function loadOfficialTemplate() {
  if (fs.existsSync(cachedTemplate)) return JSON.parse(fs.readFileSync(cachedTemplate, 'utf8'));
  const response = await fetch(officialUrl);
  if (!response.ok) throw new Error(`Unable to retrieve official Qwen workflow: HTTP ${response.status}`);
  return response.json();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function coreProps(name, version = '0.5.1') {
  return { 'Node name for S&R': name, cnr_id: 'comfy-core', ver: version };
}

function node({ id, type, pos, size = [300, 180], order = 0, inputs = [], outputs = [], widgets = [], title, properties }) {
  const result = {
    id, type, pos, size, flags: {}, order, mode: 0, inputs, outputs,
    properties: properties || coreProps(type), widgets_values: widgets
  };
  if (title) result.title = title;
  return result;
}

const positivePrompt = [
  'Edit only the flat red Seattle skyline silhouette in this crop.',
  'Replace it with an unmistakable Paris skyline led by the Eiffel Tower with a restrained Montparnasse Tower counterpoint.',
  'Use the exact same graphic language: pure signal-red flat vector silhouette anchored to the bottom edge, pure black background, hard clean edges.',
  'Preserve any existing white grid lines and any red circular arc exactly.',
  'No text, no letters, no numbers, no logos, no photography, no gradients, no texture, no people.'
].join(' ');
const negativePrompt = 'generated text, letters, numbers, logo, swoosh, watermark, signature, gradients, photography, clouds, flag, tourist postcard collage, cultural costume, faux national pattern, blurry edges, hybrid landmarks';

const official = await loadOfficialTemplate();
const ui = clone(official);
ui.id = crypto.randomUUID();
ui.revision = 0;
ui.last_node_id = 176;
ui.last_link_id = 412;
ui.groups = [
  { id: 1, title: '1 · PROTECTED SKYLINE EDIT', bounding: [-920, -260, 1510, 570], color: '#b51c2b', font_size: 22, flags: {} },
  { id: 2, title: '2 · ALPHA COMPOSITE', bounding: [620, -260, 890, 570], color: '#3f789e', font_size: 22, flags: {} }
];

const subgraphType = ui.definitions.subgraphs[0].id;
const subgraph = ui.definitions.subgraphs[0];
subgraph.name = 'Protected Skyline Edit · Qwen Image Edit 2511';
for (const item of subgraph.nodes) {
  if (item.id === 151) item.widgets_values = [positivePrompt];
  if (item.id === 149) item.widgets_values = [negativePrompt];
  if (item.id === 161) item.widgets_values = ['qwen_image_edit_2511_fp8mixed.safetensors', 'default'];
  if (item.id === 162) item.widgets_values = ['qwen_2.5_vl_7b_fp8_scaled.safetensors', 'qwen_image', 'default'];
  if (item.id === 146) item.widgets_values = ['qwen_image_vae.safetensors'];
  if (item.id === 154) item.widgets_values = [4];
  if (item.id === 166) item.widgets_values = [20, 'fixed'];
  if (item.id === 168) item.widgets_values = [false];
  if (item.id === 169) item.widgets_values = [498017, 'fixed', 20, 4, 'euler', 'simple', 1];
}

const note = node({
  id: 82, type: 'MarkdownNote', pos: [-900, -700], size: [770, 370], order: 0,
  widgets: [
    '# NIKE RUN CLUB · CITY LOCALIZATION PROTOTYPE\n\n' +
    '**SAFE DEFAULT: this workflow is built but has not been queued. Comfy Cloud execution can spend credits.**\n\n' +
    '1. Upload `campaign-background.png` and `runner-cutout.png`.\n' +
    '2. Edit only the city phrase in the red Qwen subgraph.\n' +
    '3. Queue one city proof first. Save the clean city plate and the alpha-composited preview.\n' +
    '4. Final logos and localized type are applied outside Comfy.\n\n' +
    'The crop protects the supplied Nike mark, circle, grids, and all upper-canvas structure from model drift.'
  ],
  title: 'READ ME · SPEND GATE'
});

const background = node({
  id: 41, type: 'LoadImage', pos: [-880, -190], size: [280, 360], order: 1,
  outputs: [
    { name: 'IMAGE', type: 'IMAGE', links: [400, 403] },
    { name: 'MASK', type: 'MASK', links: null }
  ],
  widgets: ['campaign-background.png', 'image']
});
const crop = node({
  id: 171, type: 'ImageCrop', pos: [-550, -150], size: [280, 210], order: 2,
  inputs: [{ name: 'image', type: 'IMAGE', link: 400 }],
  outputs: [{ name: 'IMAGE', type: 'IMAGE', links: [401] }],
  widgets: [570, 365, 100, 1030]
});
const qwen = node({
  id: 170, type: subgraphType, pos: [-220, -220], size: [460, 736], order: 3,
  inputs: clone(official.nodes.find(item => item.id === 170).inputs),
  outputs: [{ name: 'IMAGE', type: 'IMAGE', links: [402] }],
  properties: clone(official.nodes.find(item => item.id === 170).properties)
});
qwen.inputs[0].link = 401;
for (let index = 1; index < qwen.inputs.length; index += 1) qwen.inputs[index].link = null;

const rescale = node({
  id: 172, type: 'ImageScale', pos: [290, -100], size: [270, 210], order: 4,
  inputs: [{ name: 'image', type: 'IMAGE', link: 402 }],
  outputs: [{ name: 'IMAGE', type: 'IMAGE', links: [404] }],
  widgets: ['lanczos', 570, 365, 'disabled']
});
const skylineComposite = node({
  id: 173, type: 'ImageCompositeMasked', pos: [650, -180], size: [300, 230], order: 5,
  inputs: [
    { name: 'destination', type: 'IMAGE', link: 403 },
    { name: 'source', type: 'IMAGE', link: 404 },
    { name: 'mask', type: 'MASK', shape: 7, link: null }
  ],
  outputs: [{ name: 'IMAGE', type: 'IMAGE', links: [405, 407] }],
  widgets: [100, 1030, false],
  title: 'Paste protected skyline crop'
});
const savePlate = node({
  id: 174, type: 'SaveImage', pos: [1010, -200], size: [360, 310], order: 6,
  inputs: [{ name: 'images', type: 'IMAGE', link: 405 }],
  outputs: [{ name: 'images', type: 'IMAGE', links: null }],
  widgets: ['NRC_LOCALIZE/CITY_PLATE']
});
const runner = node({
  id: 83, type: 'LoadImage', pos: [650, 160], size: [280, 360], order: 7,
  outputs: [
    { name: 'IMAGE', type: 'IMAGE', links: [408] },
    { name: 'MASK', type: 'MASK', links: [406] }
  ],
  widgets: ['runner-cutout.png', 'image'],
  title: 'Transparent runner · use this, not green screen'
});
const invert = node({
  id: 175, type: 'InvertMask', pos: [970, 280], size: [220, 90], order: 8,
  inputs: [{ name: 'mask', type: 'MASK', link: 406 }],
  outputs: [{ name: 'MASK', type: 'MASK', links: [409] }],
  widgets: []
});
const runnerComposite = node({
  id: 176, type: 'ImageCompositeMasked', pos: [1220, 180], size: [300, 230], order: 9,
  inputs: [
    { name: 'destination', type: 'IMAGE', link: 407 },
    { name: 'source', type: 'IMAGE', link: 408 },
    { name: 'mask', type: 'MASK', shape: 7, link: 409 }
  ],
  outputs: [{ name: 'IMAGE', type: 'IMAGE', links: [410] }],
  widgets: [0, 0, false],
  title: 'Alpha composite · supplied runner'
});
const savePreview = node({
  id: 9, type: 'SaveImage', pos: [1580, 160], size: [360, 310], order: 10,
  inputs: [{ name: 'images', type: 'IMAGE', link: 410 }],
  outputs: [{ name: 'images', type: 'IMAGE', links: null }],
  widgets: ['NRC_LOCALIZE/COMFY_PREVIEW']
});

ui.nodes = [note, background, crop, qwen, rescale, skylineComposite, savePlate, runner, invert, runnerComposite, savePreview];
ui.links = [
  [400, 41, 0, 171, 0, 'IMAGE'],
  [401, 171, 0, 170, 0, 'IMAGE'],
  [402, 170, 0, 172, 0, 'IMAGE'],
  [403, 41, 0, 173, 0, 'IMAGE'],
  [404, 172, 0, 173, 1, 'IMAGE'],
  [405, 173, 0, 174, 0, 'IMAGE'],
  [406, 83, 1, 175, 0, 'MASK'],
  [407, 173, 0, 176, 0, 'IMAGE'],
  [408, 83, 0, 176, 1, 'IMAGE'],
  [409, 175, 0, 176, 2, 'MASK'],
  [410, 176, 0, 9, 0, 'IMAGE']
];
ui.extra = { ...ui.extra, workflowRendererVersion: 'LG', prototype: 'NRC city localization', sourceTemplate: officialUrl };

const api = {
  '1': { class_type: 'LoadImage', inputs: { image: 'campaign-background.png' }, _meta: { title: 'Protected campaign background' } },
  '2': { class_type: 'ImageCrop', inputs: { image: ['1', 0], width: 570, height: 365, x: 100, y: 1030 }, _meta: { title: 'Crop skyline window only' } },
  '3': { class_type: 'FluxKontextImageScale', inputs: { image: ['2', 0] } },
  '4': { class_type: 'UNETLoader', inputs: { unet_name: 'qwen_image_edit_2511_fp8mixed.safetensors', weight_dtype: 'default' } },
  '5': { class_type: 'ModelSamplingAuraFlow', inputs: { model: ['4', 0], shift: 3.1 } },
  '6': { class_type: 'CFGNorm', inputs: { model: ['5', 0], strength: 1, pre_cfg: false } },
  '7': { class_type: 'CLIPLoader', inputs: { clip_name: 'qwen_2.5_vl_7b_fp8_scaled.safetensors', type: 'qwen_image', device: 'default' } },
  '8': { class_type: 'VAELoader', inputs: { vae_name: 'qwen_image_vae.safetensors' } },
  '9': { class_type: 'TextEncodeQwenImageEditPlus', inputs: { clip: ['7', 0], vae: ['8', 0], image1: ['3', 0], prompt: positivePrompt }, _meta: { title: 'City skyline edit prompt' } },
  '10': { class_type: 'TextEncodeQwenImageEditPlus', inputs: { clip: ['7', 0], vae: ['8', 0], image1: ['3', 0], prompt: negativePrompt }, _meta: { title: 'Exclusions' } },
  '11': { class_type: 'FluxKontextMultiReferenceLatentMethod', inputs: { conditioning: ['9', 0], reference_latents_method: 'index_timestep_zero' } },
  '12': { class_type: 'FluxKontextMultiReferenceLatentMethod', inputs: { conditioning: ['10', 0], reference_latents_method: 'index_timestep_zero' } },
  '13': { class_type: 'VAEEncode', inputs: { pixels: ['3', 0], vae: ['8', 0] } },
  '14': { class_type: 'KSampler', inputs: { model: ['6', 0], seed: 498017, steps: 20, cfg: 4, sampler_name: 'euler', scheduler: 'simple', positive: ['11', 0], negative: ['12', 0], latent_image: ['13', 0], denoise: 1 } },
  '15': { class_type: 'VAEDecode', inputs: { samples: ['14', 0], vae: ['8', 0] } },
  '16': { class_type: 'ImageScale', inputs: { image: ['15', 0], upscale_method: 'lanczos', width: 570, height: 365, crop: 'disabled' } },
  '17': { class_type: 'ImageCompositeMasked', inputs: { destination: ['1', 0], source: ['16', 0], x: 100, y: 1030, resize_source: false }, _meta: { title: 'Reinsert skyline crop into protected background' } },
  '18': { class_type: 'SaveImage', inputs: { images: ['17', 0], filename_prefix: 'NRC_LOCALIZE/CITY_PLATE' } },
  '19': { class_type: 'LoadImage', inputs: { image: 'runner-cutout.png' }, _meta: { title: 'Transparent runner' } },
  '20': { class_type: 'InvertMask', inputs: { mask: ['19', 1] }, _meta: { title: 'Convert LoadImage transparency mask to source opacity' } },
  '21': { class_type: 'ImageCompositeMasked', inputs: { destination: ['17', 0], source: ['19', 0], x: 0, y: 0, resize_source: false, mask: ['20', 0] } },
  '22': { class_type: 'SaveImage', inputs: { images: ['21', 0], filename_prefix: 'NRC_LOCALIZE/COMFY_PREVIEW' } }
};

fs.writeFileSync(path.join(workflowDir, 'city-skyline-localizer.ui.json'), `${JSON.stringify(ui, null, 2)}\n`);
fs.writeFileSync(path.join(workflowDir, 'city-skyline-localizer.api.json'), `${JSON.stringify(api, null, 2)}\n`);
fs.writeFileSync(path.join(workflowDir, 'README.md'), `# Comfy workflow\n\nImport \`city-skyline-localizer.ui.json\` into Comfy. It derives from the official Qwen Image Edit 2511 template and exposes two visible stages: a protected skyline crop edit, then an alpha composite of the supplied runner.\n\nThe default city is Paris. For another market, change only the city/landmark sentence in the positive prompt. Keep every preservation and exclusion sentence. The first Save node writes a text-free city plate for deterministic typesetting; the second is a Comfy-only visual preview.\n\nNo job has been queued. Comfy Cloud execution can spend credits.\n`);

const objectInfoPath = path.join(process.env.TMPDIR || os.tmpdir(), 'comfy-object-info.json');
if (fs.existsSync(objectInfoPath)) {
  const objectInfo = JSON.parse(fs.readFileSync(objectInfoPath, 'utf8'));
  const used = [...new Set(Object.values(api).map(item => item.class_type))];
  const contract = Object.fromEntries(used.map(type => [type, {
    required: Object.keys(objectInfo[type]?.input?.required || {}),
    optional: Object.keys(objectInfo[type]?.input?.optional || {}),
    outputs: objectInfo[type]?.output || null
  }]));
  fs.writeFileSync(path.join(workflowDir, 'comfy-node-contract.json'), `${JSON.stringify(contract, null, 2)}\n`);
}

console.log('Built importable UI workflow and API workflow without submitting a job.');
