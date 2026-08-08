# Comfy workflow

Open the new, unambiguous interview graph in Comfy Cloud:

https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5

The saved workflow record is now on version 7 of the canonical graph. It contains one red
`CITY INPUT · CHANGE ONLY THIS` node. Its value feeds a Gemini
localization-strategist node, which returns strict JSON containing a detailed skyline prompt, fictional-runner
prompt, probable locale, copy direction, and explicit human-review gates. Two core JSON extractor nodes route
the appropriate prompts into separate Nano Banana Pro image branches.

The skyline branch edits only a protected 570 × 365 module and reinserts it into the locked campaign plate.
Its strategist treats the source Seattle silhouette as material to erase, validates a closed whitelist of
target-city landmarks, places the primary landmark in the far-left 3–22% visibility zone, and requires one
continuous red skyline mass across the lower-left 72%. This prevents source-city leakage such as the Space
Needle appearing in New York and avoids empty lower-left compositions hidden by the runner.
The person branch starts from the supplied green-screen pose and wardrobe reference and generates a new
fictional runner on a required uniform `#00FF00` plate. The prompt enforces head, hand, elbow, hip, leg, and
garment clearance so the body cannot be clipped. A tolerance chroma mask with explicit polarity saves the
runner RGBA despite green luminance variation. RGB normalization before the mask prevents provider alpha from
causing four-channel tensor mismatches. The graph composites the new person over the new city plate and saves
the validation composite.

The motion branch starts from the generated green-screen runner—not from the poster composite. Kling 3.0
generates a five-second, locked-camera side stretch followed by a light run-in-place, athletic bounce, and
subtle smile. Bria restores a clean chroma-green plate and `SaveVideo` writes the handoff MP4. This ordering is
the protection mechanism: skyline, grids, arcs, mark, palette, and crop never enter the generative video model;
HyperFrames later keys the moving runner over the exact approved static plate.

The executable portion is 23 nodes. The full 29-node interview graph also displays completed reference outputs.
Change node `00` to a city such as `NEW YORK`, queue the graph, then walk left to
right through the strategist, the two extracted prompts, the two image branches, alpha, still composite, Kling
runner-only animation, Bria green normalization, MP4 output, and the strict-JSON handoff written by
`SaveText` for Codex.

For multiple locales, Codex clones the executable API graph in one batch request, changes the single city value
and output prefixes for each clone, then downloads each locale's PNG, MP4, and JSON outputs into its run folder.
This keeps the Comfy canvas readable while preserving per-locale provenance, retry, and review state. Codex then
invokes the graphic-design finishing pass for statics and the HyperFrames finishing pass for motion.

`nano-banana-pro-<market>.api.json` preserves the older explicit per-market graphs as production evidence. The
primary demo file is `nano-banana-pro-interview-presentation.api.json`. Running the strategist workflow spends
credits on one Gemini text node, two Nano Banana Pro image nodes, one Kling 3.0 node, and one Bria green-screen
normalization node. The current checked batch covers Cairo, Rio de Janeiro, and San Francisco; each final MP4
is finished downstream with the same deterministic HyperFrames composition used for the approved static.
