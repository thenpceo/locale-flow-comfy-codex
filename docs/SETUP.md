# Setup guide

This guide prepares LocaleFlow for an agent-operated ComfyUI localization run.

## 1. Clone and install

```bash
git clone https://github.com/thenpceo/locale-flow-comfy-codex.git
cd locale-flow-comfy-codex
npm install
```

Required local tools are Node.js 22 or later and FFmpeg. Keep Comfy and model credentials outside the
repository.

## 2. Import the ComfyUI workflow

Import
[`workflows/nike-run-localizer-codex-orchestrated-multi-locale-latest.json`](../workflows/nike-run-localizer-codex-orchestrated-multi-locale-latest.json)
through ComfyUI's workflow import control. This is the editable 29-node graph.

The cloud reference is
[`21f30a93-e0fb-43d3-a620-e2065174cec5`](https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5),
but the checked-in JSON is the versioned source of truth.

Confirm the environment provides:

- a Gemini text-generation node with strict JSON output;
- Nano Banana Pro image-edit nodes for the skyline and runner branches;
- crop, resize, composite, mask, inversion, image-save, and text-save nodes used by the graph;
- Kling 3.0 image-to-video;
- Bria video green-screen normalization;
- video-save support.

Node names and provider implementations can change. Inspect the live node catalog before substituting a
node type or model field, then regenerate the API workflow and rerun validation.

## 3. Supply cleared source assets

The graph expects two source images:

1. a protected campaign plate containing the fixed brand geometry and the skyline replacement area;
2. a pose and wardrobe reference with the subject fully visible on a uniform green background.

Upload both to your own Comfy workspace and replace the corresponding `LoadImage` values. Workspace asset
hashes are not portable between accounts.

The character reference should include clearance around the head, elbows, hands, hips, and lower body. The
generation prompt preserves that clearance so chroma extraction and Kling animation do not crop the body.

## 4. Configure locales

Locale records live in [`data/localizations.json`](../data/localizations.json). Each record should contain a
stable id, city, language/locale, deterministic copy fields, and any reviewed landmark constraints.

Do not invent a real address, event route, date, endorsement, or legal claim. Draft translated copy must remain
marked for native-language review.

To plan a run without spending credits:

```bash
npm run pipeline:plan -- --locales cairo-ar,rio-pt,san-francisco-en
```

## 5. Configure the agent

Codex reads [`AGENTS.md`](../AGENTS.md) and the project-local skills under [`.agents/skills/`](../.agents/skills/).
Ask it to use `locale-flow-operator` for the complete workflow.

For another agent platform, copy the skill folders into its supported skills directory and preserve the same
stage ownership:

- Comfy generates city, runner, alpha, composite, runner motion, and strategy JSON;
- static finishing creates exact editable typography and the final PNG;
- motion finishing keys the runner over the approved plate and creates the final MP4;
- the operator owns spend approval, batching, downloads, provenance, retries, and QA state.

Install HyperFrames skills if they are not already available:

```bash
npx hyperframes skills
```

## 6. Validate before paid generation

```bash
npm run build:workflow
npm run validate:workflow
npm test
```

Then run exactly one locale. Confirm recognizable target-city architecture, full lower-left skyline coverage,
complete runner anatomy, usable alpha, clean green motion background, and correct output-node mapping before
authorizing a larger batch.

## 7. Production configuration

[`config/pipeline.example.json`](../config/pipeline.example.json) defines the public defaults. Keep any private
workflow IDs, credentials, billing configuration, and environment-specific asset ids in a private runtime
configuration.

The default maximum is two concurrent locale graphs because each graph fans out to multiple paid providers.
Lower the limit when provider quotas or review capacity require it.

## Troubleshooting

### The imported graph cannot find an input image

Upload the asset to the current Comfy workspace and select it again in the `LoadImage` node. Do not copy an
asset identifier from another account.

### The runner alpha clips or removes body areas

Check that the generated runner remains on a uniform green plate with full body clearance. Inspect the raw
runner output before adjusting the tolerance mask. Do not hide anatomy problems with the composite.

### The wrong landmark appears

Tighten the locale record and strategist whitelist. The skyline branch should explicitly remove source-city
architecture, place the primary landmark in the far-left visibility zone, and fill the lower-left edge.

### A provider returns HTTP 429

Wait the configured backoff, retry that locale once, and leave successful locales untouched.

### Static or motion finishing fails

Resume from the downloaded Comfy outputs. Do not rerun paid Comfy or Kling stages unless their own artifact is
missing or invalid.
