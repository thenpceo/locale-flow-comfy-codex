---
name: nrc-campaign-localizer
description: Orchestrate one-or-many locale requests through the saved Comfy graph, collect outputs, and route each locale to the static and motion finishing skills.
---

# NRC campaign localizer

Use this skill when a user asks Codex to localize the poster system for one city or a list of cities.

## Inputs

- A comma-separated list of city or city-locale records.
- The saved Comfy graph in `workflows/nike-run-localizer-codex-orchestrated-multi-locale-latest.json`.
- Cleared campaign plate and runner reference assets in the user's Comfy workspace.

## Procedure

1. Resolve each city to a separate locale record and create a run plan with `npm run pipeline:plan -- --locales <ids>`.
2. Estimate live Comfy cost before any paid submission and obtain the user's approval.
3. For two or more locales, split independent per-locale graphs into the bounded batches declared in `config/pipeline.example.json`. Submit at most two full graphs concurrently, wait for terminal state, then submit the next bounded batch. Keep one prompt ID, retry boundary, output folder, and QA state per locale.
4. Wait for terminal status. Never infer completion from queue counts and never rerun a paid job because a download failed.
5. Retry a locale only when its terminal error matches the configured retryable errors. Wait 60 seconds and retry that locale once; never retry successful siblings or an entire batch.
6. Download original city plate, raw runner, runner alpha, validation composite, runner-only motion MP4, and strategist JSON. Record checksums in each handoff.
7. Invoke `nrc-static-finisher` for every completed static handoff.
8. Invoke `nrc-motion-finisher` after the static design is approved, so the motion design inherits the exact same type geometry.
9. Run mechanical QA. Keep native-language, cultural, casting, landmark, brand, and rights decisions marked for human review.

The user interface is Codex. Comfy is the inspectable media graph, not the place where the user manually repeats each locale.
