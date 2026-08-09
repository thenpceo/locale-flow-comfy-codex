# Implementation and adaptation plan

LocaleFlow is implemented as four explicit layers: an operator agent, a per-locale Comfy media graph, a
deterministic static finisher, and a deterministic motion finisher. The handoff manifest joins the layers.

## 1. Define the campaign contract

Before changing the graph, document:

- protected marks, geometry, palette, and copy zones;
- variable image regions and acceptable edit boundaries;
- exact copy ownership and review authority;
- required locales, writing systems, and font coverage;
- prohibited imagery, stereotypes, claims, and invented facts;
- final formats and delivery requirements.

Deliverables: a brief, style rules, cleared source manifest, locale records, and protected-region map.

## 2. Prepare source assets

Upload a protected campaign plate and a full-clearance character reference on uniform green to the target
Comfy workspace. Preserve original files and checksums. Keep official marks outside generative branches.

## 3. Configure the Comfy graph

Start from `workflows/nike-run-localizer-codex-orchestrated-multi-locale-latest.json`.

- update the strategist system prompt for the campaign and its protected regions;
- replace the two `LoadImage` assets;
- keep skyline and character generation in separate branches;
- keep final type and marks outside generation;
- send only the isolated green-screen character to Kling;
- save every declared intermediate and the strategy JSON;
- regenerate the API workflow and validate node/output mappings.

## 4. Configure locale data

Add stable locale records to `data/localizations.json`. Each record should contain reviewed city and language
identifiers, deterministic copy fields, target landmark constraints, cultural exclusions, and human-review
state. Never silently promote research or machine translation to approved copy.

## 5. Adapt static finishing

Update `composition/poster.html` and `nrc-static-finisher` for the campaign's layer order, design tokens,
fonts, safe zones, and export dimensions. Ensure every visible text layer remains editable and verify font
glyph coverage for each writing system.

## 6. Adapt motion finishing

Update the HyperFrames project and `nrc-motion-finisher` so the animation uses the approved static coordinates
and strings. Chroma-key the isolated runner between back and front design layers. Use finite, seek-safe
timelines and deterministic rendering.

## 7. Validate one locale

Before a paid batch:

1. run repository validation;
2. plan one locale;
3. estimate and approve spend;
4. run Comfy to terminal completion;
5. inspect all six original outputs;
6. finish static and motion deliverables;
7. run mechanical QA and named human review.

Do not scale until skyline placement, character anatomy, chroma quality, settled layout, copy, and provenance
are correct in the vertical slice.

## 8. Scale through the agent

The user supplies one locale-list prompt. The operator clones the API graph once per locale, limits
concurrency, preserves independent manifests, and retries only the smallest failed stage. Successful paid jobs
are never rerun because a later download, static, or motion step failed.

## Acceptance criteria

- both canonical workflow files validate and remain importable;
- each locale saves all six Comfy outputs;
- editable static source and final PNG match approved copy;
- motion source and final MP4 preserve the settled static composition;
- file checksums and provider provenance are recorded;
- automated QA cannot imply human approval;
- a clean clone contains enough instructions for a new agent and artist to operate the workflow.

See `docs/SETUP.md` for environment setup and `docs/AGENT_OPERATIONS.md` for the exact run lifecycle.
