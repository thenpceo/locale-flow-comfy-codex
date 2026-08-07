# Design System

## Visual Theme

A dark campaign screening room crossed with a production contact sheet. The dominant reference is the supplied black, white, and signal-red running poster: hard edges, oversized condensed type, halftone athletes, orthogonal grids, and deliberate occlusion. It should feel authored and physical, not like software chrome.

## Color Palette

- Canvas: `#080808`
- Raised field: `#111111`
- Paper: `#F5F5F2`
- Muted paper: `#A9A9A4`
- Rule: `#303030`
- Signal red: `#FF1616`
- Focus: `#FFFFFF`

Red means active market, generation stage, or review attention. It is never used as ambient gradient decoration.

## Typography

- Outer edge: self-hosted `Six Caps` under SIL OFL 1.1. Its skeletal, highly condensed grotesk proportions carry the repeated perimeter copy.
- Display: `Arial Narrow`, `Helvetica Neue Condensed`, then system sans fallbacks. Use extreme scale, tight tracking, and short lines.
- Body: `Helvetica Neue`, system sans fallbacks. Minimum 1rem with generous dark-mode leading.
- Metadata: compact uppercase only for short production labels; never for body paragraphs.
- Local-script copy uses `PingFang SC`, `Hiragino Sans`, and appropriate system locale fallbacks.

## Components

- Navigation: a thin fixed production rail with project title, workflow link, and section anchors.
- Hero: one large final poster, an uncompromising title, and a concise thesis.
- Production graph: two literal still-generation lanes plus one purple motion-isolation lane. The motion lane makes the invariant visible: runner alpha enters Kling 3.0, while the locked plate enters later at Bria recompositing.
- Market switcher: three large text tabs with real poster thumbnails; roving keyboard navigation.
- Asset viewer: input, city plate, runner alpha, Comfy composite, and final poster shown as a sequence.
- QA ledger: plain rows with explicit status text and evidence; color is supplemental.
- Download rail: direct links to every final and intermediate asset.

## Layout

Use a 12-column desktop grid with asymmetric spans and fluid section spacing. The production graph runs horizontally on desktop and becomes one explicit vertical sequence on small screens. Keep hero imagery large enough to inspect. Avoid generic cards; bordered rectangles are reserved for literal workflow nodes.

## Motion

The page itself stays restrained. One user-controlled five-second proof clip demonstrates layer-isolated generation: only the fictional runner warms up; the poster plate is reattached after Kling. The clip is muted and never autoplays. Under `prefers-reduced-motion: reduce`, remove transforms, transitions, and smooth scrolling.

## Accessibility

Maintain AA contrast, native links/buttons, visible focus rings, semantic headings, alt text that names the production stage, and keyboard access to all tabs and downloads.
