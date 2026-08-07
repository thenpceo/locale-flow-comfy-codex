# Codex operating contract

This repository is designed to be operated from Codex. A user supplies one or more locales; Codex
invokes Comfy, downloads the generated layers, and finishes static and motion deliverables with the
appropriate skills.

## Trigger

When the user asks to localize the campaign to one or more cities/locales:

1. Read `PIPELINE.md`, `config/pipeline.example.json`, `data/localizations.json`, and
   `contracts/handoff.schema.json`.
2. Resolve every requested city to a locale record. Do not invent addresses, dates, routes, legal copy,
   or cultural claims.
3. Prepare a run directory with:

   `node scripts/create-run.mjs --locales <comma-separated-ids>`

4. Inspect the live Comfy node catalog before changing node types or model fields.

## Comfy execution

- Canonical visible graph:
  https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5
- Canonical batch-execution graph:
  `workflows/nano-banana-pro-full-localizer.api.json`
- For one locale, a saved-workflow run is acceptable.
- For two or more independent locales, clone the API graph once per locale and call the Comfy batch
  tool once. Do not submit them sequentially.
- Before submission, set node `1.value` to the city and replace the six filename prefixes with the
  locale id:
  - node 9: `NRC_LOCALIZE/<LOCALE>_CITY_PLATE`
  - node 15: `NRC_LOCALIZE/<LOCALE>_RUNNER_ALPHA`
  - node 17: `NRC_LOCALIZE/<LOCALE>_COMFY_COMPOSITE`
  - node 18: `NRC_LOCALIZE/<LOCALE>_RUNNER_RAW`
  - node 21: `NRC_LOCALIZE/<LOCALE>_RUNNER_WARMUP`
  - node 22: `NRC_LOCALIZE/<LOCALE>_AGENT_HANDOFF`
- Paid generation requires the active Comfy spend gate. Quote the estimate and obtain explicit approval.
- A submit is not completion. Wait for the batch/job terminal state, retrieve outputs, and download the
  original files into `runs/<run-id>/<locale>/comfy/`.
- Record prompt ids, batch id, workflow id/version, timestamps, model names, checksums, and source paths
  in each locale's `handoff.json`.

## Static finishing

For each completed locale, invoke the `graphic-design` skill and follow
`agent-prompts/graphic-design.md`.

- Input: city plate, runner RGBA, Comfy composite, strategist JSON, locale copy record, and protected
  campaign assets.
- Output: editable HTML/SVG source, final PNG, manifest/provenance, and QA report.
- Typography, factual copy, addresses, marks, and legal text remain deterministic. Never ask an image
  model to preserve final text.

## Motion finishing

For each locale with a completed Comfy MP4, invoke the `hyperframes` skill and follow
`agent-prompts/hyperframes.md`.

- Input: Comfy MP4, final static design/copy tokens, Six Caps font, and handoff manifest.
- Output: HyperFrames project, checked proof snapshots, and final typeset MP4 after the skill's render
  approval gate.
- The Comfy MP4 is the media plate. HyperFrames owns exact text animation, stagger, perimeter marquee,
  and final encoding.

## Completion

Do not call a locale complete until:

- Comfy terminal success is verified.
- All original outputs are downloaded locally.
- Static and motion skills have produced their declared artifacts.
- Mechanical QA passes.
- Language, cultural, casting, landmark, brand, and rights checks remain explicitly labeled for human
  approval.

Update `runs/<run-id>/run.json` and the presentation only after those states are distinct and truthful.
