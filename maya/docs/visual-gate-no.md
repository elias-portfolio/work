# Maya Visual Gate: n/o

## Verdict
PENDING VISUAL INSPECTION. The previous full `adhesion` outline proof is marked FAIL and must not be used as design evidence.

## Scope
- Generate only `n` and `o` visual proof SVGs.
- Use SVG top-down coordinates with no per-glyph `scale(1,-1)` inversion.
- Use explicit filled shapes and visible counters instead of fragile compound path/fill-rule behavior.
- Do not expand to the full `adhesion` set until this gate passes visual review.

## Generated files
- `outlines/phase1-visual-gate/no-proof.svg`
- `outlines/phase1-visual-gate/n.svg`
- `outlines/phase1-visual-gate/o.svg`

## Stop rules
- STOP if `n` and `o` do not read instantly.
- STOP if glyphs overlap.
- STOP if counters collapse or appear random.
- STOP adding glyphs until `no`/`on` is visually coherent.

## Status
Prototype-only. No final font export.
