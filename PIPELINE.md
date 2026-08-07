# Codex → Comfy → Graphic Design → HyperFrames

## System boundary

Comfy generates variable media. Codex orchestrates locale fan-out and file movement. The graphic-design
agent owns deterministic static composition. The HyperFrames agent owns deterministic motion typography.

```text
USER LOCALE LIST
      │
      ▼
CODEX RUN PLANNER
      │
      ├── one locale ───────────────┐
      └── many locales → BATCH ─────┤
                                    ▼
                              COMFY MEDIA UNIT
                   skyline · runner · alpha · composite
                         Kling runner-only motion · JSON
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

The visible Comfy graph is a per-locale unit on purpose. Multi-locale looping lives in Codex because
each market must have its own cost record, retry boundary, asset folder, provenance, and approval state.
Embedding an opaque loop inside the image graph would make failures and cultural review harder to trace.

## Inputs

- Locale ids from `data/localizations.json`, such as `paris-fr,london-en,tokyo-ja`.
- Protected background and runner reference already uploaded to the configured Comfy workspace.
- Explicit approval for paid Comfy partner nodes.
- Codex with the Comfy Cloud connector and local skills installed.

## Comfy outputs per locale

| Output | Node | File contract | Consumer |
|---|---:|---|---|
| A | 9 | city plate PNG | graphic-design |
| B | 15 | runner PNG with alpha | graphic-design |
| C | 17 | validation composite PNG | graphic-design + QA |
| QA | 18 | raw runner PNG | anatomy/casting review |
| D | 21 | runner-only warm-up recomposited MP4 | HyperFrames |
| E | 22 | strategist JSON | both agents + review |

Kling receives only the isolated runner layer. Bria attaches the locked plate afterward. The final
localized typography is not generated in Comfy.

## Run lifecycle

1. Plan: `npm run pipeline:plan -- --locales paris-fr,london-en,tokyo-ja`.
2. Codex estimates and confirms Comfy spend.
3. Codex submits one batch for all requested locales.
4. Codex waits for terminal completion and downloads originals into the generated run directory.
5. Codex completes each `handoff.json` against `contracts/handoff.schema.json`.
6. Codex invokes `graphic-design` once per locale.
7. Codex invokes `hyperframes` once per locale with the Comfy MP4 and static design tokens.
8. Codex verifies dimensions, durations, checksums, and required review statuses.

## Retry semantics

- Retry only the failed locale and smallest failed stage.
- Never rerun a completed paid Comfy job because a download or downstream agent failed.
- A Comfy queue count is not evidence of completion; terminal job/batch status is.
- A static agent failure must not invalidate the owned Comfy outputs.
- A HyperFrames render failure must not rerun Kling.

## Review gates

Mechanical checks can pass automatically. Language, cultural specificity, casting, landmark accuracy,
anatomy, resemblance, brand, usage rights, and legal approval remain named human decisions.

