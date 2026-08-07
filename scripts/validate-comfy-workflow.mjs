import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = path.join(root, 'workflows');
const reviewDir = path.join(root, 'review');
fs.mkdirSync(reviewDir, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const localizations = JSON.parse(fs.readFileSync(path.join(root, 'data/localizations.json'), 'utf8'));
const production = JSON.parse(fs.readFileSync(path.join(workflowDir, 'nano-banana-pro-full-localizer.api.json'), 'utf8'));
const presentation = JSON.parse(fs.readFileSync(path.join(workflowDir, 'nano-banana-pro-interview-presentation.api.json'), 'utf8'));
const errors = [];

const requiredInputs = {
  LoadImage: ['image'],
  ImageCrop: ['image', 'width', 'height', 'x', 'y'],
  GeminiImage2Node: ['images', 'prompt', 'model'],
  ImageScale: ['image', 'width', 'height'],
  ImageCompositeMasked: ['destination', 'source', 'x', 'y', 'resize_source'],
  SaveImage: ['images', 'filename_prefix'],
  RecraftRemoveBackgroundNode: ['image'],
  InvertMask: ['mask'],
  SaveImageWithAlpha: ['images', 'mask', 'filename_prefix'],
  PreviewImage: ['images']
  ,KlingVideoNode: ['multi_shot', 'multi_shot.prompt', 'multi_shot.negative_prompt', 'multi_shot.duration', 'generate_audio', 'model', 'model.resolution', 'model.aspect_ratio', 'seed', 'start_frame']
  ,BriaVideoReplaceBackground: ['video', 'seed', 'background_image']
  ,SaveVideo: ['video', 'filename_prefix', 'format', 'codec']
  ,SaveText: ['text', 'filename_prefix', 'format']
  ,PrimitiveString: ['value']
  ,StringConcatenate: ['string_a', 'string_b', 'delimiter']
  ,GeminiNodeV2: ['prompt', 'model', 'model.thinking_level', 'model.temperature', 'model.top_p', 'model.max_output_tokens', 'seed']
  ,JsonExtractString: ['json_string', 'key']
};

function validateGraph(graph, label, expectedNodes) {
  if (Object.keys(graph).length !== expectedNodes) errors.push(`${label}: expected ${expectedNodes} nodes, found ${Object.keys(graph).length}`);
  for (const [id, item] of Object.entries(graph)) {
    if (!requiredInputs[item.class_type]) {
      errors.push(`${label} ${id}: unexpected node type ${item.class_type}`);
      continue;
    }
    for (const required of requiredInputs[item.class_type]) {
      if (!(required in item.inputs)) errors.push(`${label} ${id} ${item.class_type}: missing required input ${required}`);
    }
    for (const [name, value] of Object.entries(item.inputs)) {
    if (Array.isArray(value)) {
      const [source, outputIndex] = value;
        if (!graph[source]) errors.push(`${label} ${id}.${name}: source node ${source} is missing`);
        if (!Number.isInteger(outputIndex) || outputIndex < 0) errors.push(`${label} ${id}.${name}: invalid output index`);
      }
    }
  }
}

validateGraph(production, 'production graph', 22);
validateGraph(presentation, 'presentation graph', 28);
for (const market of localizations) {
  const graphPath = path.join(workflowDir, `nano-banana-pro-${market.id}.api.json`);
  if (!fs.existsSync(graphPath)) {
    errors.push(`${market.id}: per-market workflow missing`);
    continue;
  }
  validateGraph(JSON.parse(fs.readFileSync(graphPath, 'utf8')), `${market.id} graph`, 14);
}

if (production['14']?.class_type !== 'InvertMask' || production['15']?.inputs?.mask?.[0] !== '14') {
  errors.push('production graph: PNG export must invert the Recraft foreground mask before SaveImageWithAlpha');
}
if (production['16']?.inputs?.mask?.[0] !== '13') {
  errors.push('production graph: validation composite must use the direct Recraft foreground mask');
}
if (production['1']?.class_type !== 'PrimitiveString' || production['4']?.class_type !== 'GeminiNodeV2' || production['4']?.inputs?.prompt?.[0] !== '1') {
  errors.push('production graph: CITY input must feed the localization-strategist LLM');
}
if (production['5']?.inputs?.json_string?.[0] !== '4' || production['11']?.inputs?.json_string?.[0] !== '4' || production['6']?.inputs?.prompt?.[0] !== '5' || production['12']?.inputs?.prompt?.[0] !== '11') {
  errors.push('production graph: strategist JSON must route detailed prompts into both Nano Banana Pro nodes');
}
if (production['19']?.class_type !== 'KlingVideoNode' || production['19']?.inputs?.start_frame?.[0] !== '13') {
  errors.push('production graph: Kling 3.0 must animate the isolated runner output, never the composed poster');
}
if (production['20']?.class_type !== 'BriaVideoReplaceBackground' || production['20']?.inputs?.video?.[0] !== '19' || production['20']?.inputs?.background_image?.[0] !== '8') {
  errors.push('production graph: Bria must composite the moving runner over the locked city plate');
}
if (production['21']?.class_type !== 'SaveVideo' || production['21']?.inputs?.video?.[0] !== '20') {
  errors.push('production graph: the locked-poster warm-up must terminate in SaveVideo');
}
if (production['22']?.class_type !== 'SaveText' || production['22']?.inputs?.text?.[0] !== '4' || production['22']?.inputs?.format !== 'json') {
  errors.push('production graph: strategist JSON must be saved as the downstream agent handoff');
}
for (const [loadId, previewId] of [['23', '24'], ['25', '26'], ['27', '28']]) {
  if (presentation[loadId]?.class_type !== 'LoadImage' || presentation[previewId]?.inputs?.images?.[0] !== loadId) {
    errors.push(`presentation graph: final-result preview pair ${loadId}/${previewId} is broken`);
  }
}

const result = {
  checkedAt: new Date().toISOString(),
  workflowId: manifest.generation.workflowId,
  workflow: 'workflows/nano-banana-pro-full-localizer.api.json',
  productionNodes: Object.keys(production).length,
  presentationNodes: Object.keys(presentation).length,
  perMarketGraphs: localizations.length,
  checks: [
    'node counts and required inputs',
    'all graph references resolve',
    'one CITY input feeds a localization-strategist LLM',
    'structured JSON routes detailed prompts to skyline and fictional-runner generators',
    'Recraft mask polarity is explicit for PNG alpha and compositing',
    'Kling 3.0 receives only the isolated runner layer',
    'Bria replaces the temporary video background with the locked city plate',
    'the motion branch terminates in an MP4 SaveVideo output',
    'the strategist payload terminates in a JSON agent-handoff output',
    'three final-poster preview pairs are wired'
  ],
  status: errors.length ? 'FAIL' : 'PASS',
  errors
};
fs.writeFileSync(path.join(reviewDir, 'workflow-validation.json'), `${JSON.stringify(result, null, 2)}\n`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Workflow package validation PASS: ${result.productionNodes}-node production graph, ${result.presentationNodes}-node interview graph.`);
}
