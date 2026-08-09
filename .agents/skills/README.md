# Project-local agent skills

These skills make the repository operable as a complete agent workflow rather than a collection of media
scripts.

## Routing

Start with `locale-flow-operator`. It reads the project contract, prepares the locale plan, enforces the spend
gate, invokes the Comfy localizer, then routes every completed handoff to the static and motion finishers.

| Skill | Invoke when |
|---|---|
| `locale-flow-operator` | The user requests one or more completed localized campaigns |
| `nrc-campaign-localizer` | A run plan is approved and Comfy generation should begin |
| `nrc-static-finisher` | One locale has valid Comfy still outputs |
| `nrc-motion-finisher` | The locale's static design is approved and its runner MP4 is valid |

The `nrc-` prefix is retained for compatibility with existing prompts. The operating pattern is reusable for
other campaigns after replacing the source assets, composition, locale records, and strategy constraints.

## Codex

Open this repository in Codex. Codex reads `AGENTS.md` and discovers the skill folders under `.agents/skills/`.
Ask it to use `locale-flow-operator` and provide the locale list.

## Other agent environments

Copy each skill folder into the environment's supported skill directory or translate the procedures into its
tool format. Preserve the following boundaries:

- the operator owns planning, spend approval, batching, provenance, retries, and completion reporting;
- Comfy owns variable media generation;
- the static finisher owns exact type and final PNG export;
- the motion finisher owns runner compositing, type animation, and final MP4 export;
- human review remains explicit.

The motion implementation expects HyperFrames. Install its published skills when needed:

```bash
npx hyperframes skills
```

Never place credentials inside a skill file or commit them to this repository.
