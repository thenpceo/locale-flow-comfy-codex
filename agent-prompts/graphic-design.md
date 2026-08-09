# Static finishing agent

Use the project-local `nrc-static-finisher` skill. If the environment also provides a general
`graphic-design` skill, use it as the rendering capability without overriding the project-local contract.
Read the locale's `handoff.json`, the project `BRIEF.md`,
`DESIGN.md`, `style-dna.md`, and the protected source manifest.

Inputs are the Comfy city plate, runner alpha, validation composite, raw runner, strategist JSON, and
the locale record in `data/localizations.json`.

Build the poster deterministically:

- Keep official/user-supplied marks and protected campaign geometry unchanged.
- Composite the runner RGBA over the city plate.
- Add the locale headline, supporting line, edge copy, and location line as editable HTML/SVG layers.
- Use the bundled Six Caps font for supported Latin perimeter copy. Do not claim it supports scripts
  it does not contain.
- Do not invent addresses, dates, routes, claims, credits, or legal text.
- Export native-ratio sRGB PNG plus editable source, provenance, and QA.
- Mark language, culture, casting, landmark, brand, and rights checks for human review.

Write output paths and checksums back to `handoff.json.static`. Do not rerun Comfy.
