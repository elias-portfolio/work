# Maya Visual Gate Policy

## Why this exists
The first full `adhesion` outline proof passed structural checks but failed visual inspection. It looked like glyph soup: overlap, coordinate inversion artifacts, bad fill logic, and forms that did not read as Latin type.

From this point, structural PASS is not sufficient for outline work. Any outline expansion needs a rendered proof and a visual inspection gate.

## Current gate state
- Full `adhesion` outline proof: **VISUAL FAIL**.
- Minimal `n/o` proof: **VISUAL PASS**.

Evidence:
- `reports/visual-inspection/kimi-visual-inspection.md`
- `reports/visual-inspection/kimi-no-gate-inspection.md`
- `outlines/phase1-visual-gate/no-proof.svg`

## Rules
1. Do not expand a glyph set just because SpecDD validates.
2. Render proof output before calling outline work done.
3. Use visual inspection before GitHub publication for new outline proofs.
4. Expand from canary glyphs, not from a whole word at once.
5. Stop immediately if glyphs overlap, counters collapse, or the word does not read instantly.

## Current next step
Continue from `n/o`, fix the minor `n` arch-to-right-stem ridge, then add at most two glyphs in the next visual pass.

Recommended next glyphs: `h` and `i`, because they extend stem/arch rhythm without introducing bowl complexity.

Avoid returning to full `adhesion` until `n/o/h/i` visually pass.
