# Nike Run Club Local Campaign Adaptation System

Status: native-ratio prototype implemented; importable Comfy graph, deterministic compositor, ten-market
proof sheet, and QA are complete. Paid city-plate generation is paused at the explicit spend gate.

## Goal

Turn one existing Nike Run Club poster into a repeatable, reviewable family of localized campaign assets.
For each target city or country, the system should:

- preserve the source campaign's recognizable visual logic without pixel-copying it;
- generate a clean, text-free photographic plate featuring an authentic local skyline or environment;
- adapt message, language, venue/address details, and typographic voice;
- recompose the design for 4:5, 1:1, 9:16, and 16:9 rather than center-cropping one master;
- distinguish controlled creative variables so comparisons remain meaningful;
- automatically pass, reject, or route outputs to human review;
- retain editable source, provenance, workflow parameters, and QA evidence.

This is an interview prototype and design-system study. It must not imply Nike authorization or be
published as real campaign work without permission.

## Product thesis

The useful artifact is not a generated poster. It is a small creative operating system:

1. the campaign owner defines what is locked;
2. regional teams provide local facts and cultural context;
3. Comfy generates only the adaptable photographic layer;
4. the graphic-design system deterministically renders brand marks and factual copy;
5. automated checks reduce the review set to genuine exceptions;
6. every delivered asset explains what changed, what remained fixed, and why.

## Non-negotiable implementation rule

Comfy does not render final typography, logos, addresses, dates, legal copy, or calls to action.
Generative models produce clean background plates and controlled image edits. HTML/SVG/CSS renders
the final design layers. This prevents misspelled copy, mutated marks, and uneditable layouts.

## What already exists

### Graphic-design staging skill

Reuse these existing capabilities rather than rebuilding them:

- `scripts/new-project.mjs`: project scaffolding and manifest templates;
- `scripts/lib.mjs`: exact headless-Chrome rendering with embedded sRGB profile;
- `scripts/preflight.mjs`: pixel-dimension, format, profile, and empty-file checks;
- `scripts/fingerprint-history.mjs`: composition similarity and template-saturation checks;
- `references/formats.md`: 4:5, 1:1, 9:16, 16:9, and banner presets;
- manifest, Style DNA, reference matrix, fingerprint, and review templates.

Required extension: `render-formats.mjs` and `contact-sheet.mjs` currently target the skill's specimen
files. Parameterize them to accept a project directory and manifest, then keep that interface stable.

### Comfy

Comfy Cloud authentication and its node catalog have already been verified. The available native stack
includes Qwen Image Edit 2511, FLUX multi-reference workflows, standard image scaling, model sampling,
and API execution. Start with an official saved workflow and version it with the project.

## V1 scope

Build one reference campaign across three cities, with three delivery ratios:

- one baseline city represented by the supplied poster;
- two localized cities selected after intake;
- 4:5, 9:16, and 16:9 outputs;
- one primary message per locale;
- one controlled image variable per test family, such as city, time of day, or runner density;
- a contact sheet and QA report containing `PASS`, `REVIEW`, or `FAIL` for every export.

Add 1:1 and print only after the first three ratios pass. This keeps V1 narrow without creating a
throwaway architecture.

## System architecture

```text
                         HUMAN-VERIFIED INPUTS
        baseline poster + official marks + target-city facts + exact copy
                                      |
                                      v
                         [1. REFERENCE DECOMPOSER]
                 style DNA / layout map / copy zones / protected regions
                           /                         \
                          v                           v
               [2. LOCALIZATION SPEC]       [3. VARIANT MATRIX]
                locale, city, facts          exactly one test variable
                          \                           /
                           v                         v
                         [4. COMFY IMAGE GRAPH]
       style reference -> clean city plate -> controlled edit -> format extension
                                      |
                         text-free background plates
                                      |
                                      v
                    [5. DETERMINISTIC DESIGN COMPOSITOR]
         HTML/SVG/CSS + supplied logo + locale fonts + exact localized copy
                                      |
                                      v
                              [6. QA GATES]
        factual copy / glyphs / overflow / logo / contrast / crop / image artifacts
                         |              |              |
                       PASS           REVIEW          FAIL
                         |              |              |
                         v              v              v
                       export      human decision    smallest-node retry
                         \              |              /
                          +-------------+-------------+
                                      |
                                      v
                 editable source + exports + manifest + contact sheet
```

## Core project contract

The manifest is the source of truth. A poster image is not the source of truth.

```text
nike-run-localization/
├── IMPLEMENTATION_PLAN.md
├── BRIEF.md
├── manifest.json
├── style-dna.md
├── reference-matrix.md
├── data/
│   └── localizations.json
├── assets/
│   ├── source/
│   ├── marks/
│   ├── fonts/
│   ├── generated/
│   └── processed/
├── workflows/
│   └── city-background-localizer.json
├── composition/
│   └── poster.html
├── scripts/
│   └── localize.mjs
├── tests/
│   └── localize.test.mjs
├── review/
└── exports/
```

Keep the new project-specific logic to five primary files: the manifest, localization data, Comfy
workflow, composition, and orchestrator. Reuse the graphic-design skill for scaffolding, rendering,
preflight, fingerprints, and contact sheets.

## Data model

Each localization record must use verified facts. OCR may suggest source text but cannot silently become
approved copy.

```json
{
  "id": "city-locale-format-message",
  "city": "user supplied",
  "country": "user supplied",
  "locale": "user supplied",
  "language": "user supplied",
  "copy": {
    "headline": "exact approved string",
    "supporting": "exact approved string",
    "address": "exact approved string",
    "date": "exact approved string",
    "cta": "exact approved string",
    "legal": "exact approved string"
  },
  "cityEvidence": {
    "requiredLandmarks": [],
    "avoidCliches": [],
    "sourceLinks": [],
    "humanVerified": false
  },
  "type": {
    "displayRole": "category and voice, not an unlicensed font guess",
    "textRole": "legible family with full locale glyph coverage",
    "licenseVerified": false
  },
  "variant": {
    "variable": "city",
    "value": "user supplied",
    "locked": ["campaign thesis", "brand mark", "hierarchy", "grade family"]
  },
  "formats": ["portrait-feed", "vertical-story", "widescreen"]
}
```

## Stage 1: Reference decomposition

When the baseline poster arrives:

1. preserve the original file and calculate a checksum;
2. identify supplied versus inferred assets;
3. transcribe visible copy, then require human confirmation for dates, places, addresses, and legal text;
4. map the one-, three-, and ten-second hierarchy;
5. record grid, dominant mass, image behavior, headline behavior, information placement, palette logic,
   surface process, and edge behavior;
6. mark protected regions: logo, product/athlete identity if relevant, factual copy, and intentional
   campaign devices;
7. create a copy-space and focal-point map as canvas percentages;
8. document what makes the work recognizably part of the campaign versus incidental to that one city.

Deliverable: approved Style DNA card, layout map, exact-copy record, and protected-region masks.

## Stage 2: Localization brief

For each city, define:

- authentic skyline/environment anchors;
- contemporary local running context rather than tourist-postcard shorthand;
- time of day, weather, season, and camera position;
- required quiet zones for type;
- language and writing-system requirements;
- display-font voice words and legal font sources;
- locally correct message, event details, address, and legal information;
- cultural anti-cliches and prohibited imagery.

City research can propose options, but a human must approve cultural choices and factual metadata.

## Stage 3: Comfy image workflow

Create one saved, versioned graph with exposed parameters rather than separate graphs per city.

```text
[Baseline poster/style reference]
                +
[clean layout/copy-space guide]
                +
[city image brief + skyline references]
                |
                v
[multi-reference image edit/generation]
                |
                v
[protected-region and unexpected-text checks]
                |
          +-----+-----+
          |           |
        valid       invalid
          |           |
          v           v
[format-specific]  [retry smallest
[extend/reframe]    controlling node]
          |
          v
[clean plate + prompt/seed/job metadata]
```

Recommended first model route: Qwen Image Edit 2511 for style-preserving edits and product/subject
consistency. Test FLUX multi-reference as the challenger. Pick the winner from a fixed three-case eval,
not from one attractive generation.

Expose:

- city/environment prompt;
- style reference image;
- skyline/landmark references;
- layout guide or mask;
- aspect ratio and output dimensions;
- seed;
- variation axis and value;
- negative requirements, including no text, no logos, and no invented landmarks.

For each ratio, recompose or extend the photographic plate. Do not crop one master when it destroys the
focal relationship or copy space.

## Stage 4: Deterministic graphic-design composition

`composition/poster.html` is the editable master. It reads one localization record and one format name.
CSS variables define format-specific geometry while the locale record supplies content and font roles.

Responsibilities:

- place the official supplied Nike mark without redrawing it;
- render exact copy from `localizations.json`;
- select only licensed fonts with complete glyph coverage;
- allow city-specific typographic character without stereotyping the writing system;
- preserve the campaign's hierarchy while recomposing line breaks, scale, and information placement;
- export at exact dimensions through the graphic-design rendering utility;
- retain clean image plates separately from final composites.

The city-specific font decision is art direction, not an automatic country-font lookup. The system may
suggest candidates by language support and voice, but the human selects the display face.

## Stage 5: Controlled creative variants

Every comparison family changes one declared variable:

| Family | Locked | Variable |
|---|---|---|
| Geographic adaptation | message, time of day, runner density | city |
| Message adaptation | city plate, crop, format, grade | headline/supporting copy |
| Environmental adaptation | city, copy, crop, runner | time of day or weather |
| Format adaptation | city, message, image lineage | aspect ratio/composition |

The manifest stores the lineage. A reviewer can tell whether a performance difference came from city,
message, image, or format rather than an uncontrolled pile of changes.

## Stage 6: QA and human review

### Deterministic gates

- exact copy matches the approved localization record;
- all required fields are present and no placeholder metadata remains;
- every glyph exists in the selected font;
- no text box overflows, clips, or enters a protected safe zone;
- logo file checksum matches the supplied official asset;
- pixel dimensions, output format, and sRGB profile match the manifest;
- minimum readable size and contrast thresholds pass;
- export names and manifest entries agree.

### Image gates

- OCR on the clean plate finds no unexpected text-like artifacts;
- required skyline anchors are plausible and no impossible hybrid skyline is accepted automatically;
- people, limbs, repeated structures, reflections, and architecture survive native-size inspection;
- protected subjects and marks have not drifted;
- copy-space occupancy matches the layout map;
- crop retains the intended focal point and visual motion;
- palette and grade remain inside the campaign's approved tolerance.

### Decision states

- `PASS`: all deterministic checks pass and no image warning exceeds threshold;
- `REVIEW`: technically valid but cultural, typographic, landmark, or image-authenticity judgment remains;
- `FAIL`: factual mismatch, missing glyph, logo mutation, broken crop, unreadable copy, obvious image defect,
  or unlicensed asset.

The contact sheet shows city, locale, ratio, variable, seed/job ID, checks, and status beside each asset.
Only a human can promote `REVIEW` to final.

## Failure routing

| Failure | Handling | User-visible result |
|---|---|---|
| Comfy/API timeout | retry with the same idempotent job record; do not create a new lineage silently | job remains pending or reports a recoverable error |
| Model unavailable | keep the brief, switch to the pre-evaluated fallback workflow | output records the fallback model |
| Mutated/generated text | reject the plate and retry the image node | no corrupted copy reaches composition |
| Fake or hybrid skyline | force `REVIEW`; compare with approved city references | reviewer sees landmark evidence beside the asset |
| Missing locale glyph | fail before rendering and propose licensed candidates | no tofu boxes or substituted fonts ship |
| Copy overflow | recompose that format; do not shrink all type blindly | failed ratio is isolated from valid exports |
| Wrong address/date/legal | hard fail against the approved data record | factual error cannot be promoted |
| Unsafe crop | reframe or regenerate the affected ratio | other ratios remain usable |
| Unclear source rights | quarantine the asset | manifest explains why export is blocked |
| Partial batch failure | preserve successful outputs and rerun only failed jobs | reviewer gets complete status, not a silent partial set |

## Test plan

Use Node's built-in `node:test` for contracts and deterministic rendering checks. Add visual/eval fixtures
for model outputs because unit tests cannot judge cultural authenticity or style preservation.

```text
CODE PATHS                                      USER FLOWS
[+] manifest/localization validation            [+] Add a new city
  ├── valid locale and exact copy                  ├── valid facts -> preview [E2E]
  ├── missing required fact -> FAIL                ├── missing address -> blocked [E2E]
  ├── unverified legal copy -> FAIL                └── unsupported glyph -> font error [E2E]
  └── uncontrolled variant fields -> FAIL

[+] Comfy job orchestration                     [+] Generate localized plates
  ├── upload + submit + poll + download [E2E]      ├── all jobs complete [E2E]
  ├── timeout -> resumable status                  ├── one job fails -> partial report [E2E]
  ├── provider error -> explicit failure           └── retry preserves lineage [E2E]
  └── output metadata recorded

[+] deterministic composition                   [+] Review formats
  ├── 4:5 render and preflight                     ├── compare native + thumbnail [E2E]
  ├── 9:16 safe-zone recomposition                 ├── promote REVIEW -> PASS [E2E]
  ├── 16:9 recomposition                            └── reject -> smallest-node retry [E2E]
  ├── copy overflow -> FAIL
  └── missing glyph -> FAIL

[+] image/style evaluation [EVAL]
  ├── source campaign DNA retained
  ├── skyline plausibility
  ├── no generated text or mark mutation
  ├── copy-space integrity
  └── three fixed baseline cases across candidate models
```

Required fixtures:

- one Latin locale with long copy;
- one locale requiring diacritics;
- one non-Latin locale if included in the first city set;
- deliberately wrong address/date;
- deliberately missing glyph;
- deliberately overflowing 9:16 composition;
- Comfy timeout, failed job, and partial batch responses;
- clean and defective skyline plates;
- logo checksum mismatch.

## Implementation sequence

### Phase 0: Intake and campaign anatomy

- receive baseline poster and source assets;
- establish rights/prototype boundary;
- confirm exact copy and select target cities;
- build Style DNA, reference matrix, protected-region map, and localization records.

Exit criterion: a human approves the locked and variable elements.

### Phase 1: One-city vertical slice

- parameterize the graphic-design project renderer and contact sheet;
- create one Comfy background-localization workflow;
- render one new city in 4:5;
- preserve image/job provenance;
- run deterministic and native-size visual checks.

Exit criterion: one localized poster can be reproduced from a clean checkout and manifest.

### Phase 2: Format family

- add 9:16 and 16:9 image recomposition;
- add format-specific CSS layouts and safe zones;
- prove the system recomposes rather than center-crops;
- produce a three-format contact sheet.

Exit criterion: all three ratios retain hierarchy, focal point, and readable factual copy.

### Phase 3: Multi-city controlled matrix

- add two more cities/locales;
- lock one-variable test families;
- run candidate model comparison on fixed seeds and briefs;
- output lineage and comparison metadata.

Exit criterion: reviewers can identify the changed variable for every asset without reading prompts.

### Phase 4: QA control plane

- implement hard deterministic gates;
- add image-warning heuristics and review thresholds;
- create PASS/REVIEW/FAIL contact sheet and machine-readable QA report;
- support retrying only failed nodes/jobs.

Exit criterion: no factual, copy, logo, dimension, profile, or glyph failure can receive PASS.

### Phase 5: Interview packaging

- prepare a 60–90 second live walkthrough;
- show the graph, editable composition, controlled matrix, and exception queue;
- map Comfy components to Firefly Graph/Services concepts;
- clearly label the work as an independent prototype using a supplied campaign reference.

Exit criterion: the demo explains operational value even if image generation is not run live.

## Acceptance criteria

- one supplied campaign becomes at least three authentic city adaptations;
- every city ships in 4:5, 9:16, and 16:9;
- all visible type remains editable and matches approved copy exactly;
- no generated logo or brand mark appears in a final asset;
- each asset records source image, model/workflow, prompt, seed/job ID, crop, font, and export checksum;
- each format is intentionally recomposed;
- one-variable experiment lineage is explicit;
- QA produces deterministic `PASS`, `REVIEW`, or `FAIL` with reasons;
- contact sheets work at native and thumbnail review sizes;
- a clean run can reproduce the same deterministic composition from the manifest;
- the demo distinguishes prototype completion from Nike approval or external deployment.

## Not in scope for V1

- public publishing, paid media activation, or claiming Nike authorization;
- direct AEM, Workfront, Frame.io, or Firefly production integration;
- automatic translation without native-speaker or local-market approval;
- automatic cultural approval;
- animated/video variants;
- large catalog or DAM ingestion;
- font purchasing or redistribution;
- print-production separations beyond a later proof-of-concept.

These are credible Firefly Graph extensions after the Comfy prototype proves the workflow.

## Inputs required after this plan

1. Highest-resolution baseline poster, preferably original PDF/PSD or a lossless image.
2. Any official Nike/Run Club marks available separately.
3. Exact visible copy if the poster image is not fully legible.
4. Two or three target cities/countries.
5. Which facts are real versus safe placeholders for the interview prototype.
6. Any supplied fonts and license constraints.
7. Priority formats if 4:5, 9:16, and 16:9 are not the right first three.

## Recommended interview demo

1. Show the approved source poster and the locked/variable map.
2. Change `city = Tokyo` to another approved target.
3. Run or reveal the clean Comfy-generated plate.
4. Show the graphic-design layer applying exact localized copy and the selected local type system.
5. Reveal 4:5, 9:16, and 16:9 recompositions.
6. Intentionally surface one failed output, such as a fake skyline or copy overflow.
7. Show the system routing it to `REVIEW` while the other outputs pass.
8. End on the contact sheet and lineage report.

The final impression should be: this system lets a central creative team define campaign intent once,
regional teams contribute real local knowledge, and production scales without surrendering craft or
control.
