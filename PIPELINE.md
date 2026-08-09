# Agent → Comfy → Static Design → HyperFrames

## System boundary

Comfy generates variable media. The operator agent orchestrates locale fan-out and file movement. The static
finisher owns deterministic composition. The HyperFrames motion finisher owns deterministic motion typography.

```text
USER LOCALE LIST
      │
      ▼
AGENT RUN PLANNER
      │
      ├── one locale ───────────────┐
      └── many locales → BATCH ─────┤
                                    ▼
                              COMFY MEDIA UNIT
                   skyline · green runner · alpha · composite
                    Kling chroma motion plate · JSON
                                    │
                           downloaded + checksummed
                                    ▼
                              HANDOFF MANIFEST
                           ┌────────┴────────┐
                           ▼                 ▼
                  GRAPHIC-DESIGN        HYPERFRAMES
                  static PNG/source     typeset MP4/source
                           └────────┬────────┘
                                    ▼
                             QA + HUMAN REVIEW
```

The visible Comfy graph is a per-locale unit on purpose. Multi-locale looping lives in the agent because
each market must have its own cost record, retry boundary, asset folder, provenance, and approval state.
Embedding an opaque loop inside the image graph would make failures and cultural review harder to trace.

## Inputs

- Locale ids from `data/localizations.json`, such as `paris-fr,london-en,tokyo-ja`.
- Protected background and runner reference already uploaded to the configured Comfy workspace.
- Explicit approval for paid Comfy partner nodes.
- An agent with a Comfy connector or API integration and the project-local skills installed.

## Comfy outputs per locale

| Output | Node | File contract | Consumer |
|---|---:|---|---|
| A | 9 | city plate PNG | graphic-design |
| B | 15 | runner PNG with alpha | graphic-design |
| C | 17 | validation composite PNG | graphic-design + QA |
| QA | 18 | raw runner PNG | anatomy/casting review |
| D | 21 | green-screen runner warm-up MP4 | HyperFrames |
| E | 22 | strategist JSON | both agents + review |

Kling receives only the full-clearance green-screen runner layer. Bria normalizes that motion result to
clean chroma green. HyperFrames keys the moving human over the exact approved static plate; the final
localized typography is not generated in Comfy.

## Run lifecycle

1. Plan: `npm run pipeline:plan -- --locales paris-fr,london-en,tokyo-ja`.
2. The agent estimates and confirms Comfy spend.
3. The agent divides the locale list into bounded batches of at most two full graphs, waiting for each
   batch to finish before starting the next. The user still supplies one locale-list prompt.
4. The agent waits for terminal completion and downloads originals into the generated run directory.
5. The agent completes each `handoff.json` against `contracts/handoff.schema.json`.
6. The agent invokes `nrc-static-finisher` once per locale.
7. The agent invokes `nrc-motion-finisher` once per locale with the Comfy MP4 and static design tokens.
8. The agent verifies dimensions, durations, checksums, and required review statuses.

## Retry semantics

- Retry only the failed locale and smallest failed stage.
- For HTTP 429 / `Rate Limit Exceeded`, wait 60 seconds and retry the failed locale once.
- Never run more than two full locale graphs concurrently; each graph fans out into several partner APIs.
- Never rerun a completed paid Comfy job because a download or downstream agent failed.
- A Comfy queue count is not evidence of completion; terminal job/batch status is.
- A static agent failure must not invalidate the owned Comfy outputs.
- A HyperFrames render failure must not rerun Kling.

## Review gates

Mechanical checks can pass automatically. Language, cultural specificity, casting, landmark accuracy,
anatomy, resemblance, brand, usage rights, and legal approval remain named human decisions.
