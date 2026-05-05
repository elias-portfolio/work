# Phase 1 Adhesion State (Maya Font)

## Status

- Phase 1 is in execution with `adhesion` (`a d h e s i o n`) promoted as the primary design-DNA prototype set.
- `H/O/n/o/a` remain preserved as legacy proof controls for SpecDD integrity.
- No glyph outlines were created in this phase.

## Delivered in this pass

- Added new glyph specs for:
  - `d.lower.sdd`
  - `h.lower.sdd`
  - `e.lower.sdd`
  - `s.lower.sdd`
  - `i.lower.sdd`
- Updated existing `a.lower.sdd`, `n.lower.sdd`, `o.lower.sdd` to explicitly acknowledge `adhesion` context.
- Added adhesion proof-control tagging language to:
  - `a.lower.sdd`
  - `n.lower.sdd`
  - `o.lower.sdd`
  - `H.cap.sdd`
  - `O.cap.sdd`
- Updated `proof/strings.txt` with Phase-1 `adhesion` proofs and kept legacy `H/O/n/o/a` controls.
- Expanded `metrics/spacing.sdd` to reference adhesion context and keep `H/O/n/o/a` as integrity checks.
- Added/updated `agents/README.md` with Maya role structure (no literal `sub-coordinator`).
- Added concise state doc: `docs/phase1-adhesion.md`.

## Notes

- `s` was included per Doctor Glass instruction despite complexity.
- No descender glyphs were added.
- No UFO outlines were modified; only contract/document updates performed.

## Next validation gates

- Run `make validate`.
- Run `make doctor`.
- Record any pipeline blockers to final report for Doctor Glass.