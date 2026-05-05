# Outline Proof: Phase 1 Adhesion Set

## Purpose
- Create a first controlled outline proof for glyphs `a d h e s i o n`.
- Preserve legacy proof controls (`H/O/n/o/a`) for continuity while new `adhesion` proof set is being established.
- Keep outputs explicitly labeled as **prototype-only** and **not final font-ready**.

## Scope and assumptions
- Scope covers only the `phase1-adhesion` prototype artifacts, not final production outlines.
- Generated paths:
  - `outlines/phase1-adhesion/*.svg`
  - `outlines/phase1-adhesion/adhesion-proof.svg`
  - `sources/Maya-Regular.ufo/glyphs/{a,d,h,e,s,i,o,n}.glif`
  - `sources/Maya-Regular.ufo/glyphs/contents.plist`
- Proof geometry is coarse, polygonal, and intended for human review only.
- No descenders were added (consistent with Phase 1 guardrail).

## What is intentionally rough
- Paths use only straight-line segments (placeholder geometry) to keep the first pass lightweight.
- Metrics and spacing are represented visually in the proof canvas, not through production-quality interpolation.
- No kerning-dependent polishing; all rhythm intent is to be judged from base sidebearings and stroke flow.

## Human-review vs machine-checkable
### Human-review
- Readability of each glyph in isolation and in short transition strings.
- Visual alignment of rhythm in the string lines (`adhesion`, `sh`, `is`, `on`, etc.).
- Perceived balance of bowls, bowls, stems, and transitions against existing controls.
- Whether `a`, `d`, `h`, `e`, `s`, `i`, `o`, and `n` control expectations feel coherent.

### Machine-checkable
- Repository-level structure checks via `make validate`.
- Gate checks via `make doctor`.
- Presence of expected output files listed above.

## Control strategy for this phase
- Primary design-DNA set remains `adhesion`.
- Legacy controls are preserved in proof strings and docs to avoid SpecDD integrity loss.
- No claim of final export readiness is made in this phase.

## Known limitations
- This is a hand-crafted outline draft; it is not production-quality interpolation.
- It does not represent final design decisions for terminals, curve tension, or optical corrections.
- No automated geometric QA (e.g., ufolint/fontmake/fontTools) has been run at this stage because dependencies are missing in environment.

## Review checkpoints
- Confirm all eight unique glyphs (`a d h e s i o n`) have SVG and `.glif` proof artifacts.
- Confirm `adhesion-proof.svg` contains string-level proof lines and legacy control notes.
- Confirm `contents.plist` includes the glyph-to-file mapping for phase1 set.
- Re-run:
  - `make outline-proof`
  - `make validate`
  - `make doctor`
  - `make status` (for environment/tool drift)
