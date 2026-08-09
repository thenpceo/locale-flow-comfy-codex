# ComfyUI workflows

This directory contains the editable ComfyUI graph and its agent-executable API form.

## Canonical files

| File | Nodes | Purpose |
|---|---:|---|
| `nike-run-localizer-codex-orchestrated-multi-locale-latest.json` | 29 | Editable workflow for ComfyUI import, inspection, and one-locale runs |
| `nano-banana-pro-full-localizer.api.json` | 23 | Per-locale API graph for agent-controlled batch execution |
| `manifest.json` | — | Stable paths, cloud workflow id, and output-node contract |

The editable graph contains six reference-preview nodes that do not belong in automated production. The API
graph contains only the 23 executable nodes.

## Import

1. Download `nike-run-localizer-codex-orchestrated-multi-locale-latest.json`.
2. Use ComfyUI's workflow import control or drag the JSON onto the canvas.
3. Replace both `LoadImage` selections with cleared files uploaded to your current workspace.
4. Confirm all partner nodes and models are available.
5. Change only the red `CITY INPUT · CHANGE ONLY THIS` field for an interactive one-locale run.

The cloud reference is:

https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5

The checked-in JSON remains the portable, versioned source of truth.

## Graph stages

1. **City input** supplies the requested city to the strategy node.
2. **Localization strategy** returns strict JSON for skyline, fictional runner, locale, copy direction,
   exclusions, and review gates.
3. **Skyline branch** edits only the protected skyline module with Nano Banana Pro, resizes it to the exact
   source module, and reinserts it into the locked campaign plate.
4. **Runner branch** generates a new fictional athlete from a cleared pose/wardrobe reference on a uniform
   `#00FF00` background with full body clearance.
5. **Alpha and composite** normalize RGB, create a tolerance chroma mask, save the runner alpha, and build a
   validation composite over the localized plate.
6. **Motion branch** sends only the green-screen runner to Kling 3.0 for a side stretch, light run in place,
   athletic bounce, and subtle smile.
7. **Green normalization** uses Bria to restore a clean keyable background after video generation.
8. **Handoff** saves the six declared outputs for downstream static and motion finishers.

## Skyline constraints

The strategy should treat source-city architecture as material to replace. It should use a closed target-city
landmark whitelist, put the primary landmark in the far-left visibility zone, and create a continuous
bottom-anchored skyline across the lower-left module. These constraints preserve recognizable architecture
after the runner is composited.

## Character constraints

The runner prompt should create a fictional adult athlete appropriate to the locale without stereotyping or
imitating an identifiable person. It must preserve wardrobe intent and leave visible green clearance around
the head, hands, elbows, hips, and lower body. The raw runner output remains a required casting and anatomy
review artifact.

## Why Kling receives only the runner

The protected plate, skyline, grids, arcs, marks, palette, and typography stay outside generative video. Kling
animates only the isolated human. The motion finisher later keys that runner over the approved city plate and
animates deterministic type. This prevents poster geometry and copy from drifting between frames.

## Output nodes

| Node | Output |
|---:|---|
| 9 | localized city plate PNG |
| 15 | runner PNG with alpha |
| 17 | validation composite PNG |
| 18 | raw generated runner PNG |
| 21 | green-screen runner warm-up MP4 |
| 22 | strategist JSON |

For multiple locales, the agent clones the API graph once per locale, changes node `1.value` and all output
prefixes, submits bounded batches, waits for terminal completion, downloads original artifacts, and continues
from the per-locale handoff manifest.

Running the graph can spend credits on Gemini, Nano Banana Pro, Kling, and Bria. Always use the live cost
estimate and require approval before submission.
