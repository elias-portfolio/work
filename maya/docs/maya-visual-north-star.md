# Maya Visual North Star — Draft Gate

## Purpose
Define what the visual inspector must judge before any more outline glyphs are accepted.

This is a draft gate, not final art direction. It exists because the first outline pass was judged by the wrong criterion: generic Latin legibility.

## What Maya is not
- Not generic Latin lowercase with a project name pasted on top.
- Not `adhesion` as a sacred word.
- Not SpecDD bureaucracy posing as visual judgment.
- Not automatic conversion of the recovered hieroglyph font into a Latin alphabet.

## What Maya is trying to become
A type project where the Latin-facing prototype, if used, carries visible kinship with the recovered Maya/hieroglyph material while remaining readable enough to test as type.

The exact balance is not approved yet. That balance is the design problem.

## Reference sources to inspect
Recovered project material:

- `recovered/source-snapshot/data/maya_ref.jpg`
- `recovered/source-snapshot/data/reference_images/maya_ref.jpg`
- `recovered/source-snapshot/data/reference_images/dog_with_infix.svg`
- `recovered/source-snapshot/data/reference_images/affix.svg`
- `recovered/source-snapshot/data/reference_images/venus_omen_v4_final.svg`
- `recovered/source-snapshot/data/reference_images/tuun_ni_rendered.png`
- `recovered/source-snapshot/data/reference_images/huvudtecken.svg`
- `recovered/source-snapshot/output/best_layout_vector.svg`
- `recovered/source-snapshot/output/font_render_test.png`

## Visual inspection questions
A visual inspector must answer these before PASS:

1. Does the form look like part of Maya, or just Latin?
2. Which specific Maya reference traits are present?
3. Which specific Latin/default traits should be reduced?
4. Is readability preserved without erasing Maya character?
5. Does the form have a coherent construction logic: carving, modular blocks, compression, glyph-compounding, inscriptional rhythm, mask/infix logic, or another named principle?
6. Is the output worth showing to Elias as design evidence?

## Gate labels
- `TECHNICAL_RENDER_PASS`: SVG/font pipeline can render without breaking.
- `LATIN_READABILITY_PASS`: the glyph reads as a Latin character.
- `MAYA_DESIGN_PASS`: the glyph reads as part of the Maya visual system.

Only `MAYA_DESIGN_PASS` can approve expansion.

## Current status
- Full `adhesion` proof: `VISUAL_FAIL`.
- `n/o` proof: `TECHNICAL_RENDER_PASS`, not `MAYA_DESIGN_PASS`.
- Next required action: inspect recovered references and define the first Maya-inflected visual move before drawing more glyphs.
