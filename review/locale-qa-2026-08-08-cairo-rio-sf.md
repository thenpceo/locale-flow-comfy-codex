# Cairo, Rio, and San Francisco production QA

**Run date:** 2026-08-08  
**Locales:** Cairo (`ar-EG`), Rio de Janeiro (`pt-BR`), San Francisco (`en-US`)  
**Result:** MECHANICAL PASS with named human-review gates  
**Workflow:** [Comfy Cloud canvas, saved version 7](https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5)

## What ran

Each locale ran through separate Nano Banana Pro skyline and fictional-runner branches. The runner was generated
on a chroma-green plate, keyed, and composited over the city plate. Kling 3.0 animated only that green-screen
person through a side stretch and light run-in-place. The agent rebuilt deterministic static typography, then
HyperFrames animated the same headline, city lockup, support copy, metadata, and perimeter marquee.

## Mechanical results

- all final static posters are `1055 x 1491` opaque PNGs;
- all generated runner stills are `864 x 1232` RGBA PNGs;
- all final motion posters are H.264, `1204 x 1720`, 24 fps, and 5.041667 seconds;
- HyperFrames lint, runtime, layout, motion, and contrast checks pass for all three locales;
- all 27 sampled text checks pass WCAG AA in every motion composition;
- all three motions contain the requested side-body stretch and compact run-in-place;
- the plate, logo, skyline, grids, arcs, and deterministic typography remain static while the runner moves;
- final runner edges are de-spilled and contain no visible chroma-green field;
- Cairo uses a real RTL headline and city lockup rather than reversed SVG glyph order.

## Bugs found and fixed

| ID | Observed failure | Fix | Result |
|---|---|---|---|
| ISSUE-008 | Exact `#00FF00` matching missed slightly darker provider greens and left a green composite. | Replace exact matching with a tolerance mask; add deterministic alpha feathering and green de-spill in the agent handoff. | All three static and motion figures key cleanly. |
| ISSUE-009 | San Francisco's Nano output included an alpha channel, producing a four-versus-three-channel tensor mismatch in `ColorToMask`. | Normalize Nano output to RGB with `ImageRemoveAlpha+` before mask, composite, and Kling. | The retried San Francisco graph completed. |
| ISSUE-010 | San Francisco landmarks were correct but generated on a white rectangle. | Preserve generated red landmarks only, restore protected white grids from source, force every other skyline-module pixel to black, and strengthen the future prompt to forbid white or transparent panels. | Golden Gate Bridge and Transamerica Pyramid remain; the campaign plate is black again. |
| ISSUE-011 | HyperFrames enlarged the Kling layer 13%, reducing the green-screen clearance during wide stretches. | Remove the additional scale and keep the keyed video at authored size. | Hands, hair, garments, and lower-body edges have materially more clearance. |
| ISSUE-012 | Arabic was being split into Latin-style SVG headline lines. | Add an RTL DOM headline and RTL city-lockup path while retaining the same animation timing. | Cairo headline and metadata render in the correct direction. |
| ISSUE-013 | The moving runner briefly reduced red city-label contrast below the strict threshold. | Lighten only the city-label red to `#ff4444`; keep the skyline and campaign signal red unchanged. | 27/27 checks pass for Cairo, Rio, and San Francisco. |

## Locale review notes

| Locale | Skyline evidence | Runner and motion | Status |
|---|---|---|---|
| Cairo | Cairo Tower leads the far-left silhouette; the mosque reads as a secondary form; no Space Needle leakage. | Distinct fictional Egyptian runner; Arabic type is RTL; stretch and jog both land. | Mechanical PASS; Arabic copy, casting, and landmark depiction require Egyptian-market review. |
| Rio de Janeiro | Christ the Redeemer and Sugarloaf read immediately at far left; no Seattle landmark leakage. | Distinct fictional Afro-Brazilian runner; stretch and smiling jog land. | Mechanical PASS; Portuguese copy, casting, and landmark depiction require Brazilian-market review. |
| San Francisco | Golden Gate Bridge and Transamerica Pyramid are visible at far left; the white-canvas failure is removed. | Distinct fictional Chinese American runner; restrained stretch and light jog land. | Mechanical PASS; casting direction and landmark treatment require local review. |

## Checksums

| Locale | Static PNG | Final MP4 |
|---|---|---|
| Cairo | `8068e3fd9e7af2d077385d0f0f1c65240f7b05e89aecde478f203f2abeed3506` | `86c21015730175b3df2c6990911edec04c72aa986e7b42bd8eb8eea6baf6b59d` |
| Rio de Janeiro | `8c2a7158c4037455a518e05a7748bab11ae5bf1137abd86fbc41624a258865c8` | `391f17dec1da906dbd7c7f6d35503657601f22eabb10124a38188e13635470d0` |
| San Francisco | `b93409937ea615145435e17ca0c0d60b9640199d4981f785b7ce5b7167f8aa40` | `760e71f0c4453711bed183ade2013a37f0243eb5d5e18a742f589c21d633385a` |

## Remaining human gates

This run does not approve native-language nuance, cultural specificity, casting or representation, brand use,
trademark and landmark rights, or likeness rights. Those remain explicit human review states before any real
campaign release or AEM publication.
