---
name: nrc-motion-finisher
description: Turn the approved static poster into a HyperFrames motion poster while moving only the isolated human and preserving the static type layout.
---

# NRC motion finisher

Use only after the static poster for a locale is approved.

This project-local skill defines the motion contract. Use the installed HyperFrames skills and CLI as the
implementation capability without allowing them to redesign the approved static composition.

## Required inputs

- Approved static poster and its exact design tokens/coordinates.
- Localized city plate.
- Runner-only Kling MP4 from Comfy.
- Transparent runner video or a foreground matte.
- The HyperFrames project in `videos/nrc-localized-motion-poster/`.

## Rules

1. Reuse the static layer order: city plate, back type, transparent moving runner, front type.
2. Copy the static coordinates and strings exactly. The wavy `RUN / WILD`, outline `GO`, city name, support line, perimeter rails, top line, and footer may reveal or move, but their settled layout may not be redesigned.
3. Kling receives only the isolated runner. The city plate, logo, skyline, grids, arcs, and type must stay outside the generative video pass.
4. Use a single paused, seek-safe GSAP timeline. Register it under the composition ID and seek to zero.
5. Run HyperFrames `check`, proof snapshots, and a static-versus-motion comparison before render approval.
6. Render the final MP4 only after approval. Verify codec, dimensions, frame rate, duration, and a late rendered frame.

Checked reference outputs under `videos/nrc-localized-motion-poster/renders/` are regression fixtures, not
substitutes for rendering the requested locale.
