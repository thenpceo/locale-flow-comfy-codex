# Product definition

## Users

- central creative and brand systems teams;
- regional creative production teams;
- creative technologists and automation engineers;
- producers responsible for localization, QA, and asset delivery.

## Purpose

LocaleFlow makes a governed campaign system repeatable across markets. A user supplies a locale list once;
the agent creates independent generation jobs, editable static posters, motion posters, manifests, and review
records for every locale.

## Principles

1. Protect authored campaign geometry and marks from generative drift.
2. Generate bounded media layers rather than flattened final artwork.
3. Keep final copy, typography, legal text, and addresses deterministic and editable.
4. Preserve one manifest, retry boundary, and review state per locale.
5. Make source inputs, prompts, outputs, masks, composites, and approvals inspectable.
6. Treat language, cultural context, casting, geography, brand, and rights as human decisions.

## Success criteria

- an artist can import and understand the Comfy graph;
- an agent can operate the full workflow from a locale-list prompt;
- a failed locale can resume without rerunning successful paid stages;
- final static and motion deliverables share the same approved layout;
- every artifact can be traced to its workflow, prompt, model, and source;
- the package can be adapted to another campaign by replacing assets, locale records, and composition rules.

## Out of scope

- automatic brand, cultural, legal, or rights approval;
- publishing without cleared source and generated-media rights;
- trusting image or video models to reproduce final text or official marks;
- hiding multi-locale state inside an opaque graph loop.
