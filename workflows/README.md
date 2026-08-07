# Comfy workflow

Open the new, unambiguous interview graph in Comfy Cloud:

https://cloud.comfy.org/#21f30a93-e0fb-43d3-a620-e2065174cec5

The saved version 7 graph contains one red `CITY INPUT · CHANGE ONLY THIS` node. Its value feeds a Gemini
localization-strategist node, which returns strict JSON containing a detailed skyline prompt, fictional-runner
prompt, probable locale, copy direction, and explicit human-review gates. Two core JSON extractor nodes route
the appropriate prompts into separate Nano Banana Pro image branches.

The skyline branch edits only a protected 570 × 365 module and reinserts it into the locked campaign plate.
The person branch generates a new fictional runner from the supplied pose and wardrobe reference, then Recraft
removes the studio background. The graph makes alpha polarity explicit, saves the runner RGBA, composites the
new person over the new city plate, and saves the validation composite.

The motion branch starts from the Recraft-isolated runner—not from the poster composite. Kling 3.0 generates a
five-second, locked-camera warm-up. Bria then replaces Kling's temporary background with the already-rendered
city plate and `SaveVideo` writes the MP4. This ordering is the protection mechanism: skyline, grids, arcs, mark,
palette, and crop do not enter the generative video model.

The executable portion is 22 nodes. The full 28-node interview graph also displays the completed Paris, London,
and Tokyo poster references. Change node `00` to a city such as `NEW YORK`, queue the graph, then walk left to
right through the strategist, the two extracted prompts, the two image branches, alpha, still composite, Kling
runner-only animation, Bria locked-plate recomposite, MP4 output, and the strict-JSON handoff written by
`SaveText` for Codex.

For multiple locales, Codex clones the executable API graph in one batch request, changes the single city value
and output prefixes for each clone, then downloads each locale's PNG, MP4, and JSON outputs into its run folder.
This keeps the Comfy canvas readable while preserving per-locale provenance, retry, and review state. Codex then
invokes the graphic-design finishing pass for statics and the HyperFrames finishing pass for motion.

`nano-banana-pro-<market>.api.json` preserves the older explicit per-market graphs as production evidence. The
primary demo file is `nano-banana-pro-interview-presentation.api.json`. Running the strategist workflow spends
credits on one Gemini text node, two Nano Banana Pro image nodes, one Recraft node, one Kling 3.0 node, and one
Bria video-background replacement node. The completed New York motion proof has prompt ID
`c13b648a-8c74-470f-ba4f-4a57ccd9687d` and is archived at
`assets/generated/new-york-en/runner-warmup.mp4`.
