# Phase-1 Adhesion Outline Proof Report

## Scope
Created a low-risk, proof-only outline prototype pass for `a d h e s i o n` with legacy controls preserved (`H/O/n/o/a`). No final font export was performed and no descenders were added.

## Changed Files

### New/created
- `outlines/phase1-adhesion/a.svg`
- `outlines/phase1-adhesion/d.svg`
- `outlines/phase1-adhesion/h.svg`
- `outlines/phase1-adhesion/e.svg`
- `outlines/phase1-adhesion/s.svg`
- `outlines/phase1-adhesion/i.svg`
- `outlines/phase1-adhesion/o.svg`
- `outlines/phase1-adhesion/n.svg`
- `outlines/phase1-adhesion/adhesion-proof.svg`
- `sources/Maya-Regular.ufo/glyphs/a.glif`
- `sources/Maya-Regular.ufo/glyphs/d.glif`
- `sources/Maya-Regular.ufo/glyphs/h.glif`
- `sources/Maya-Regular.ufo/glyphs/e.glif`
- `sources/Maya-Regular.ufo/glyphs/s.glif`
- `sources/Maya-Regular.ufo/glyphs/i.glif`
- `sources/Maya-Regular.ufo/glyphs/o.glif`
- `sources/Maya-Regular.ufo/glyphs/n.glif`
- `docs/outline-phase1.md`
- `scripts/make_outline_phase1.py`

### Updated
- `sources/Maya-Regular.ufo/glyphs/contents.plist`
- `Makefile` (added `outline-proof` target)
- `reports/validate.json` (from `make validate`)
- `reports/doctor.md` (from `make doctor`)

## Proof Paths
- Prototype glyph SVGs: `outlines/phase1-adhesion/*.svg`
- Proof page: `outlines/phase1-adhesion/adhesion-proof.svg`
- UFO glyph files: `sources/Maya-Regular.ufo/glyphs/{a,d,h,e,s,i,o,n}.glif`

## Validation

### `make outline-proof`
- Command: `make outline-proof`
- Result: PASS (target runs `python3 scripts/make_outline_phase1.py`)

### `make validate`
- Command: `make validate`
- Result: PASS
- `reports/validate.json`: `{"ok": true, "errors": [], "warnings": []`

### `make doctor`
- Command: `make doctor`
- Result: PASS
- `reports/doctor.md`: `Verdict: PASS`

## Gate/Tool notes
- Existing environment blockers remain: `fontmake`, `ttx`, `fontbakery`, `python fontTools/fontmake/fontbakery/defcon/ufoLib2` not available in this workspace.

## Blockers
- No new blockers for proof scope.
- The proof contours are intentionally coarse and line-based; they are not production-quality.

## Human-review checklist
- Confirm stroke rhythm and spacing of `a d h e s i o n` in proof words (`ad he so`, `non`, `sh side`, `his shed`).
- Confirm legacy controls (`H/O/n/o/a`) visually retained in proof notes.
- Confirm controls and mapping files are present.

## Explicit status
- THIS IS A PROTOTYPE PROOF ONLY and **NOT a final font export.**
