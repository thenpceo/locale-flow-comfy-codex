---
name: nrc-static-finisher
description: Finish a localized campaign poster from Comfy image layers with deterministic, editable typography and QA.
---

# NRC static finisher

Use after one locale's Comfy image outputs have completed.

This project-local skill contains the required campaign rules. If a broader `graphic-design` skill is
available, use it as the rendering capability while preserving this file's layer, copy, and completion
contract.

## Required inputs

- Localized city plate PNG.
- Fictional runner PNG with alpha.
- Comfy validation composite.
- Strategist JSON and locale record.
- The canonical static source in `composition/poster.html`.

## Rules

1. Treat the city plate and runner alpha as separate immutable inputs.
2. Rebuild typography in editable HTML/SVG. Do not ask an image model to typeset final copy.
3. Preserve the canonical coordinates for the wavy `RUN / WILD`, outline `GO`, city lockup, support line, perimeter rails, top line, and footer.
4. Use Six Caps for supported Latin ultra-condensed perimeter copy. Keep its OFL file beside the font and use
   a reviewed script-appropriate fallback when required glyphs are absent.
5. Insert localized city, copy, and fictional route/disclosure fields from the handoff. Never invent a real address.
6. Export a native-ratio sRGB PNG plus editable source and provenance.
7. Run `npm run qa`. Automated PASS does not replace language, culture, representation, landmark, brand, legal, or rights approval.

The final poster must remain visually comparable to the campaign master while every generated and deterministic layer remains inspectable.
