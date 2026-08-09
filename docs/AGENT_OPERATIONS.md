# Agent operations manual

This document defines the end-to-end behavior expected from an agent operating LocaleFlow.

## Request contract

The user provides:

- one or more cities or locale ids;
- cleared source assets already available to Comfy;
- any campaign-specific copy, legal, or brand constraints;
- approval before paid generation.

The agent returns one complete, traceable static and motion package per locale. It does not stop after Comfy
previews and it does not collapse human review into an automated pass.

## Lifecycle

### 1. Resolve and plan

Read `data/localizations.json`. Match each requested city to one stable locale id. Flag missing language,
landmark, copy, or rights information instead of inventing it.

Create the run:

```bash
npm run pipeline:plan -- --locales <comma-separated-locale-ids>
```

Inspect the generated `runs/<run-id>/run.json` and per-locale `handoff.json` files.

### 2. Validate the graph and estimate spend

Use `workflows/manifest.json` to resolve the canonical editor and API graphs. Confirm the API graph still maps
nodes 9, 15, 17, 18, 21, and 22 to the declared outputs.

Estimate the current cost of every paid node for the requested locale count. Present the estimate and obtain
explicit user approval before submitting.

### 3. Execute Comfy per locale

Clone `workflows/nano-banana-pro-full-localizer.api.json` once per locale. Set node `1.value` to the city and
replace output prefixes with the locale id:

```text
9   LOCALE_FLOW/<LOCALE>_CITY_PLATE
15  LOCALE_FLOW/<LOCALE>_RUNNER_ALPHA
17  LOCALE_FLOW/<LOCALE>_COMFY_COMPOSITE
18  LOCALE_FLOW/<LOCALE>_RUNNER_RAW
21  LOCALE_FLOW/<LOCALE>_RUNNER_WARMUP
22  LOCALE_FLOW/<LOCALE>_AGENT_HANDOFF
```

Submit no more than the configured number of locale graphs concurrently. Wait for terminal state before
starting the next bounded batch.

### 4. Collect original artifacts

Download originals into `runs/<run-id>/<locale-id>/comfy/`. Do not use browser thumbnails as production
inputs. Record workflow version, prompt id, batch id, model names, timestamps, paths, and SHA-256 checksums in
the locale handoff.

Required Comfy artifacts are:

- city plate PNG;
- runner alpha PNG;
- validation composite PNG;
- raw runner PNG;
- runner-only warm-up MP4 on green;
- strategist JSON.

### 5. Finish the static poster

Invoke `nrc-static-finisher` and follow `agent-prompts/graphic-design.md`. Use the city plate and runner alpha
as separate source layers. Rebuild all final copy, type, rails, and disclosures as editable HTML/SVG. Export
the source, final PNG, provenance, and QA report.

### 6. Finish the motion poster

Only after the static design is approved, invoke `nrc-motion-finisher` and follow
`agent-prompts/hyperframes.md`. Chroma-key the runner-only MP4 and composite it between the static background
and foreground type layers. The settled motion layout must match the approved static layout.

### 7. Verify and report

Run mechanical checks for existence, checksum, dimensions, color mode, alpha, duration, frame rate, codec,
workflow references, and required manifest fields.

Keep these as named human review states:

- language and local tone;
- cultural relevance and sensitivity;
- casting and representation;
- anatomy and resemblance;
- landmark identity and geography;
- brand and legal compliance;
- source, trademark, likeness, and publication rights.

Report final artifact paths per locale and list any review state that is not approved.

## Failure and retry policy

- A submitted job is not a completed job; require terminal status.
- Retry only the failed locale and the smallest failed stage.
- For configured provider rate-limit errors, wait 60 seconds and retry once.
- Never rerun successful sibling locales.
- Never rerun paid generation because a download failed.
- Never rerun Kling because HyperFrames failed.
- Preserve valid artifacts and resume from the handoff manifest.

## Completion definition

A locale is complete only when:

1. Comfy terminal success is verified;
2. all six original artifacts are downloaded and checksummed;
3. editable static source and final PNG exist;
4. motion source, proof frames, and final MP4 exist;
5. mechanical QA passes;
6. every human review category is explicitly labeled.
