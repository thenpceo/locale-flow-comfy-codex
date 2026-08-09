# Agent operating contract

This repository is designed to be operated through an agent. A user supplies one or more locales; the agent
invokes Comfy, downloads original generated layers, and finishes static and motion deliverables with the
project-local skills.

Use `.agents/skills/locale-flow-operator/SKILL.md` as the primary router.

## Start every run

1. Read `PIPELINE.md`, `docs/AGENT_OPERATIONS.md`, `config/pipeline.example.json`,
   `workflows/manifest.json`, `data/localizations.json`, and `contracts/handoff.schema.json`.
2. Resolve each requested city to a locale record. Do not invent addresses, dates, routes, legal copy, or
   cultural claims.
3. Create a run directory with:

   ```bash
   npm run pipeline:plan -- --locales <comma-separated-ids>
   ```

4. Inspect the live Comfy node catalog before changing node types or model fields.
5. Estimate paid-node cost and obtain explicit user approval before submission.

## Comfy execution

- Editable graph: `workflows/nike-run-localizer-codex-orchestrated-multi-locale-latest.json`
- Batch execution graph: `workflows/nano-banana-pro-full-localizer.api.json`
- Machine-readable pointers: `workflows/manifest.json`
- Cloud copy: https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5

The 29-node editable graph contains six reference-preview nodes. Execute the 23-node API graph for automated
multi-locale production so preview nodes cannot pollute output sets.

For two or more independent locales, clone the API graph once per locale and submit bounded batches no larger
than `config/pipeline.example.json#batchPolicy.maxConcurrentLocales`. Wait for terminal state before submitting
the next batch.

Before submission, set node `1.value` to the city and localize all six output prefixes:

- node 9: `LOCALE_FLOW/<LOCALE>_CITY_PLATE`
- node 15: `LOCALE_FLOW/<LOCALE>_RUNNER_ALPHA`
- node 17: `LOCALE_FLOW/<LOCALE>_COMFY_COMPOSITE`
- node 18: `LOCALE_FLOW/<LOCALE>_RUNNER_RAW`
- node 21: `LOCALE_FLOW/<LOCALE>_RUNNER_WARMUP`
- node 22: `LOCALE_FLOW/<LOCALE>_AGENT_HANDOFF`

A submission is not completion. Wait for terminal status, download original files into
`runs/<run-id>/<locale>/comfy/`, and record prompt ids, batch id, workflow version, timestamps, models, paths,
and checksums in each `handoff.json`.

If a locale fails with a configured retryable provider error, wait the configured backoff and retry that
locale once. Never retry a completed locale or the whole batch.

## Static finishing

Invoke `nrc-static-finisher` and follow `agent-prompts/graphic-design.md`.

- Input: city plate, runner alpha, validation composite, raw runner, strategist JSON, locale record, and
  protected campaign assets.
- Output: editable HTML/SVG source, final PNG, provenance, and QA report.
- Final type, factual copy, addresses, marks, and legal text remain deterministic.

## Motion finishing

After static approval, invoke `nrc-motion-finisher` and follow `agent-prompts/hyperframes.md`.

- Input: green-screen runner MP4, approved static source/design tokens, font assets, and handoff manifest.
- Output: HyperFrames project, proof snapshots, final MP4, provenance, and QA report.
- The Comfy MP4 is an isolated media layer. HyperFrames owns exact compositing, text animation, and encoding.

## Completion

Do not call a locale complete until:

- Comfy terminal success is verified;
- all original outputs are downloaded and checksummed;
- static and motion skills have produced their declared artifacts;
- mechanical QA passes;
- language, culture, casting, landmark, brand, legal, and rights checks remain explicitly labeled for human
  approval.

Do not modify presentation or reference-output files unless the user explicitly asks for that work.
