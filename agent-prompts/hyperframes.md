# Motion finishing agent

Use the project-local `nrc-motion-finisher` skill together with the installed `hyperframes` skills. Read the
locale's `handoff.json`, completed static design tokens/source,
and `DESIGN.md`.

Treat the approved static city plate as frozen. Chroma-key the Comfy green-screen warm-up MP4 and use the
moving runner as the only variable media layer:

- Add localized headline and supporting copy as deterministic DOM/SVG text.
- Animate headline words/letters with a restrained stagger that lands quickly and remains readable.
- Animate repeated perimeter copy as a finite, seek-safe marquee using the bundled Six Caps font where
  its glyph coverage is valid.
- Preserve the runner framing and the exact static composition. Do not regenerate the athlete, skyline, logo,
  grids, arcs, or palette.
- No narration, generated audio, autoplay, infinite loops, render-time clocks, or unseeded randomness.
- Run HyperFrames lint/check and proof snapshots.
- Obey the HyperFrames render approval gate before producing the final MP4.

Write the HyperFrames project path, proof paths, final MP4 path, duration, dimensions, fps, and checksum
back to `handoff.json.motion`. Do not rerun Kling or Comfy.
