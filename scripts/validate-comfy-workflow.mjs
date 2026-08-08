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
const editor = JSON.parse(fs.readFileSync(path.join(workflowDir, 'nike-run-localizer-codex-orchestrated-multi-locale-latest.json'), 'utf8'));
const errors = [];

const requiredInputs = {
  LoadImage: ['image'],
  ImageCrop: ['image', 'width', 'height', 'x', 'y'],
  GeminiImage2Node: ['images', 'prompt', 'model'],
  ImageScale: ['image', 'width', 'height'],
  ImageCompositeMasked: ['destination', 'source', 'x', 'y', 'resize_source'],
  SaveImage: ['images', 'filename_prefix'],
  ImageColorToMask: ['image', 'color'],
  ColorToMask: ['images', 'invert', 'red', 'green', 'blue', 'threshold', 'per_batch'],
  'ImageRemoveAlpha+': ['image'],
  InvertMask: ['mask'],
  SaveImageWithAlpha: ['images', 'mask', 'filename_prefix'],
  PreviewImage: ['images']
  ,KlingVideoNode: ['multi_shot', 'multi_shot.prompt', 'multi_shot.negative_prompt', 'multi_shot.duration', 'generate_audio', 'model', 'model.resolution', 'model.aspect_ratio', 'seed', 'start_frame']
  ,BriaVideoGreenScreen: ['video', 'green_shade', 'seed']
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

validateGraph(production, 'production graph', 23);
validateGraph(presentation, 'presentation graph', 29);
for (const market of localizations) {
  const graphPath = path.join(workflowDir, `nano-banana-pro-${market.id}.api.json`);
  if (!fs.existsSync(graphPath)) {
    errors.push(`${market.id}: per-market workflow missing`);
    continue;
  }
  validateGraph(JSON.parse(fs.readFileSync(graphPath, 'utf8')), `${market.id} graph`, 18);
}

if (production['29']?.class_type !== 'ImageRemoveAlpha+' || production['29']?.inputs?.image?.[0] !== '12' || production['13']?.inputs?.images?.[0] !== '29') {
  errors.push('production graph: generated RGBA must be normalized to RGB before chroma keying');
}
if (production['13']?.class_type !== 'ColorToMask' || production['13']?.inputs?.green !== 255 || production['13']?.inputs?.threshold < 60 || production['14']?.class_type !== 'InvertMask' || production['15']?.inputs?.mask?.[0] !== '14') {
  errors.push('production graph: tolerance-based green chroma mask must be inverted before SaveImageWithAlpha');
}
if (production['16']?.inputs?.mask?.[0] !== '14' || production['16']?.inputs?.source?.[0] !== '29') {
  errors.push('production graph: validation composite must use the chroma-keyed foreground mask');
}
if (production['1']?.class_type !== 'PrimitiveString' || production['4']?.class_type !== 'GeminiNodeV2' || production['4']?.inputs?.prompt?.[0] !== '1') {
  errors.push('production graph: CITY input must feed the localization-strategist LLM');
}
if (production['5']?.inputs?.json_string?.[0] !== '4' || production['11']?.inputs?.json_string?.[0] !== '4' || production['6']?.inputs?.prompt?.[0] !== '5' || production['12']?.inputs?.prompt?.[0] !== '11') {
  errors.push('production graph: strategist JSON must route detailed prompts into both Nano Banana Pro nodes');
}
if (production['19']?.class_type !== 'KlingVideoNode' || production['19']?.inputs?.start_frame?.[0] !== '29') {
  errors.push('production graph: Kling 3.0 must animate the raw green-screen runner, never the composed poster');
}
if (production['20']?.class_type !== 'BriaVideoGreenScreen' || production['20']?.inputs?.video?.[0] !== '19' || production['20']?.inputs?.green_shade !== 'chroma_green') {
  errors.push('production graph: Bria must normalize the Kling background to exact chroma green');
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

const editorNodes = new Map(editor.nodes.map(node => [String(node.id), node]));
if (editor.nodes.length !== 29) errors.push(`editor graph: expected 29 nodes, found ${editor.nodes.length}`);
if (editorNodes.get('10')?.widgets_values?.[0] !== production['10']?.inputs?.image) {
  errors.push('editor graph: green-screen reference does not match the executable graph');
}
if (editorNodes.get('13')?.type !== 'ColorToMask' || editorNodes.get('13')?.widgets_values?.[4] < 60 || editorNodes.get('14')?.type !== 'InvertMask') {
  errors.push('editor graph: tolerance-based green chroma-key nodes are missing');
}
if (editorNodes.get('29')?.type !== 'ImageRemoveAlpha+' || editorNodes.get('29')?.inputs?.[0]?.link !== 30) {
  errors.push('editor graph: RGBA-to-RGB normalization node is missing');
}
if (editorNodes.get('19')?.type !== 'KlingVideoNode' || editorNodes.get('19')?.inputs?.[0]?.link !== 22) {
  errors.push('editor graph: Kling must receive the green-screen runner branch');
}
if (editorNodes.get('20')?.type !== 'BriaVideoGreenScreen' || editorNodes.get('20')?.widgets_values?.[0] !== 'chroma_green') {
  errors.push('editor graph: Bria green normalization is missing');
}
if (editor.links.some(link => link[0] === 24)) {
  errors.push('editor graph: obsolete locked-plate input still feeds the Bria motion node');
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
    'tolerance-based green mask polarity is explicit for PNG alpha and compositing',
    'Kling 3.0 receives only the green-screen runner layer',
    'Bria normalizes the moving runner background to exact chroma green',
    'the motion branch terminates in an MP4 SaveVideo output',
    'the strategist payload terminates in a JSON agent-handoff output',
    'three final-poster preview pairs are wired'
    ,'visible editor graph matches the green-screen production contract'
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
