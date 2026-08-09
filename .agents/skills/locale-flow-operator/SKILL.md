---
name: locale-flow-operator
description: Operate the complete LocaleFlow pipeline from a user locale list through Comfy generation, deterministic static and motion finishing, QA, and final per-locale delivery.
---

# LocaleFlow operator

Use this skill whenever a user asks for completed localized campaign assets for one or more cities. This is the
primary router. Do not stop after creating a run plan, submitting Comfy, or downloading previews.

## Read first

Read these repository contracts before acting:

- `AGENTS.md`
- `PIPELINE.md`
- `config/pipeline.example.json`
- `workflows/manifest.json`
- `data/localizations.json`
- `contracts/handoff.schema.json`
- `docs/AGENT_OPERATIONS.md`

## Inputs

- requested cities or locale ids;
- cleared campaign plate and green-screen character reference available to Comfy;
- campaign-specific copy, brand, legal, and rights constraints;
- user approval for paid generation.

## Procedure

1. Resolve every requested city to a locale record. Flag missing or unreviewed data; do not invent factual
   copy, addresses, routes, dates, endorsements, or legal text.
2. Run `npm run pipeline:plan -- --locales <ids>` and inspect the generated plan and handoffs.
3. Validate the canonical workflow and inspect the live Comfy node catalog before changing node types.
4. Estimate current paid-node cost for the complete locale set. Show the estimate and obtain explicit approval.
5. Invoke `nrc-campaign-localizer` for the approved run. Enforce configured concurrency and retry boundaries.
6. Verify terminal Comfy success. Download original outputs, checksum them, and complete each handoff.
7. Invoke `nrc-static-finisher` once per locale with valid still outputs.
8. After static approval, invoke `nrc-motion-finisher` once per locale with the runner-only MP4 and the exact
   approved static design tokens.
9. Run mechanical QA and retain all language, cultural, casting, landmark, brand, legal, and rights categories
   as explicit human review states.
10. Return a per-locale delivery table containing editable source, final PNG, motion source, final MP4, handoff,
    QA report, and unresolved review states.

## Invariants

- One user request may fan out to many locale jobs; each locale keeps an independent folder and manifest.
- Comfy generates bounded media layers, not final typography.
- Kling receives only the isolated green-screen runner, never the complete poster.
- Motion reuses the approved static design and may animate its reveal, not redesign its settled state.
- A provider submission or queue entry is not completion.
- A failed download or downstream finisher never authorizes rerunning a successful paid stage.
- Never claim automated QA is human approval.

## Completion

Do not report success until every requested locale has either reached the completion definition in
`docs/AGENT_OPERATIONS.md` or is clearly reported as failed/blocked with the last valid artifact preserved.
