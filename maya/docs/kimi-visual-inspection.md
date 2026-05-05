# Kimi Visual Inspection — Maya Outline Proof

## Verdict
**FAIL** — The proof reads as visual gibberish/noise, not a coherent Latin type prototype. Glyphs overlap, intersect, and lack recognizable letterform structure.

## Visual Findings
- **Severe overlap/intersection**: Glyphs are stacked on top of each other both horizontally and vertically, creating illegible black masses with random white cutouts.
- **Broken counter-spaces**: The `evenodd` fill-rule combined with overlapping paths creates unexpected holes and islands instead of proper letterform counters.
- **Unrecognizable letterforms**: Individual glyphs (a, d, e, h, i, n, o, s) do not read as Latin letters—their proportions and geometry are too abstract/distorted.
- **Coordinate inversion artifacts**: The Y-axis flip (`scale(1,-1)`) combined with positive Y translations causes glyphs to render at wrong positions, stacking upward instead of baseline-aligned.
- **No spacing discipline**: No sidebearings or metrics are visible; glyphs collide immediately.
- **Path direction chaos**: Intersecting subpaths within single glyphs suggest incorrect winding order, causing the renderer to subtract instead of add shapes.

## Pipeline Diagnosis
- **SVG transform stack is broken**: The `translate(0,760) scale(1,-1)` pattern in each glyph symbol is fighting with the outer `<use>` positioning, creating double-inversion and wrong Y coordinates.
- **Path data quality poor**: Glyph paths appear procedurally generated or hand-coded without bezier curves—too angular, self-intersecting, and lacking optical corrections.
- **No proof layout logic**: The proof simply dumps glyphs at hardcoded X/Y positions without baseline alignment, word spacing, or line metrics.
- **"Adhesion" word choice is a red herring**: The word itself is fine (standard font-testing word), but the pipeline is not producing readable glyphs to evaluate.

## Minimal Correction Plan
1. **Fix coordinate system**: Remove the per-glyph `scale(1,-1)` transform; draw paths in correct Cartesian orientation (Y-up or Y-down consistently, not mixed).
2. **Separate glyphs spatially**: Position each glyph with proper sidebearings so they don't overlap—aim for 100+ units between glyphs minimum.
3. **Fix path winding order**: Ensure outer contours are clockwise and inner counters are counter-clockwise (or vice versa) so `evenodd` fill works predictably.
4. **Simplify to basic shapes first**: Redraw 'n' and 'o' as simple rectangles + stroke outlines to verify the pipeline works before adding detail.
5. **Add baseline alignment**: All glyphs should sit on a common baseline (y=0 or consistent offset), not float at arbitrary Y positions.
6. **Generate a single-word proof first**: Just "no" or "on" with proper spacing—if those two glyphs don't read, the pipeline isn't ready for longer strings.

## Stop Rules
- **STOP if glyphs overlap** — spacing is as important as shape.
- **STOP if 'n' and 'o' don't read instantly** — these are the canary glyphs for Latin type.
- **STOP adding new glyphs until 'adhesion' renders legibly** — more glyphs won't fix broken fundamentals.
- **STOP using evenodd fill until winding order is verified** — use nonzero fill rule for predictable behavior.
