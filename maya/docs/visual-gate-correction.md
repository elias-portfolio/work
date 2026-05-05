# Visual Gate Correction — 2026-05-05

## Correction
The `n/o` visual gate was incorrectly framed as a design pass because it read as Latin lowercase. That is not sufficient for Maya.

## Correct interpretation
- `n/o` gate: **TECHNICAL RENDER PASS ONLY**.
- It proves the SVG coordinate/fill/render path can produce legible shapes.
- It does **not** prove the design direction is right.
- It does **not** approve expansion to more Latin glyphs.

## Why
Maya is not a generic Latin typeface exercise. The project has two named layers:

1. `legacy-hieroglyph-font` — recovered Mayan hieroglyph/OpenType/vector pipeline.
2. `latin-specdd-prototype` — a new Latin-facing prototype governed by SpecDD.

The Latin-facing layer must still carry Maya’s visual/conceptual DNA. A gate that asks only “does this read as Latin?” is too weak and points the project toward generic forms.

## New gate requirement
Before adding more outline glyphs, create a Maya visual north-star gate.

A valid visual inspection must ask:

- Does this look like part of the Maya project, not just a Latin letter?
- Does it relate to the recovered MayaVectorSeed / hieroglyph material or approved inspiration?
- Does the form have a deliberate Maya-inflected logic: rhythm, silhouette, compression, carving, modularity, texture, or another explicitly chosen principle?
- Is the Latin readability preserved only as one constraint among several, not as the entire design target?

## Stop rule
Do not expand from `n/o` to `h/i` or full `adhesion` until the Maya visual north-star is defined and inspected.
