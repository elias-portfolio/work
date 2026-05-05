# Maya Font — Glass-led implementation brief

Generated: 2026-05-05T18:53:24+02:00
Host: Eliass-MacBook-Air.local
Mode: Glass-led subagents. Codex is not the default builder.

## Current gate

- Build pipeline and contracts may be edited by Glass/subagents.
- Generated glyph outlines are still a separate approval gate.
- Recovered Maya material under `recovered/` is prior art/archive and must not be overwritten.

## Recommended next build spine

1. Validate local `.sdd` contracts with `make validate`.
2. Use `make research-snapshot` to refresh a concise research synthesis from the Gemini report.
3. Use `make init-ufo` to create a safe empty UFO shell under `sources/Maya-Regular.ufo`.
4. Architect subagent proposes exact `.sdd` edits for `adhesion` vs current `H/O/n/o/a` prototype choice.
5. Executor subagents edit only approved `.sdd`/pipeline files.
6. Critic subagent runs `make doctor`, checks no SpecDiff/audio contamination, then Glass decides.

## Validation state

```json
{
  "ok": true,
  "errors": [],
  "warnings": []
}
```

## Tool readiness

```json
{
  "bins": {
    "fontmake": null,
    "ttx": null,
    "fontbakery": null,
    "hb-shape": "/opt/homebrew/bin/hb-shape",
    "hb-view": "/opt/homebrew/bin/hb-view",
    "woff2_compress": "/opt/homebrew/bin/woff2_compress",
    "ufolint": null
  },
  "python_modules": {
    "fontTools": false,
    "fontmake": false,
    "fontbakery": false,
    "defcon": false,
    "ufoLib2": false
  }
}
```

## Current spec summary

## design-principles.sdd

### Must
- Define family-wide decisions before glyph-specific deviations.
- Keep a visible relationship between straight, round, and arched forms.
- Make counters part of the design language, not leftover holes.
- Treat spacing as design, not post-processing.
- Keep machine-checkable rules measurable where possible: UPM, naming, sidebearings, anchors, vertical metrics, export targets, outline validity.
- Keep non-measurable qualities under explicit human review: grace, tension, personality, density, silhouette, and whether the thing is alive.

### Done when
- The first prototype glyphs can be reviewed together in proof strings.
- Root decisions are specific enough to guide glyph work, but not so rigid that they erase visual discovery.
- Elias can reject or approve the direction without needing to inspect implementation files.

## exports/build-spec.sdd

### Must
- Research UFO, Glyphs, fontTools, fontmake, ufo2ft, fontbakery, and related validation tools before choosing the source format.
- Separate source format, build command, validation command, and proof generation.
- Make builds reproducible from local files.

### Done when
- Research synthesis recommends a source/build/validation stack with tradeoffs.
- `make doctor` passes.
- Elias approves any transition from pipeline scaffolding to generated outlines.

## glyphs/latin/H.cap.sdd

### Must
- Establish uppercase stem weight.
- Establish cap height behavior.
- Provide a straight-sided control glyph for spacing comparisons.
- Keep the crossbar position reviewable as a family-level rhythm decision.

### Done when
- H works in `HHH`, `HOH`, `OHO`, `HnH`, and `HaH` proof strings.
- Human review accepts stem weight and crossbar placement as a usable control point.

## glyphs/latin/O.cap.sdd

### Must
- Establish uppercase round-form overshoot.
- Establish relationship between outer curve and counter.
- Test contrast logic against H.
- Make sidebearings visibly compatible with H without flattening the roundness.

### Done when
- O works in `OOO`, `HOH`, `OHO`, and mixed uppercase/lowercase proof strings.
- Human review accepts its roundness, counter tension, and overshoot behavior.

## glyphs/latin/a.lower.sdd

### Must
- Provide the first high-personality lowercase glyph.
- Decide, or explicitly defer, single-storey versus double-storey construction.
- Test bowl, terminal, aperture, and counter logic against n and o.
- Make clear which parts are family logic and which parts are glyph-specific character.
- Keep this glyph as part of the `adhesion` prototype set.

### Done when
- a works in `aaa`, `nan`, `ana`, `non`, `noa`, and `Maya` test strings once M/y exist.
- a is judged compatible with `adhesion` rhythm (`ad`, `da`, `na`, `oa`) before any phase expansion.
- Human review accepts its personality as compatible with the family direction.

## glyphs/latin/d.lower.sdd

### Must
- Establish a lowercase ascender-gated form that pairs cleanly with `n.lower.sdd` stem logic.
- Derive bowl width and stroke logic from `o.lower.sdd` without copying it directly.
- Keep the stem-counter relationship stable when paired with straight and round letters.
- Define the first lowercase ascender rhythm for later `h` and potential `p/b/q` decisions.

### Done when
- d works in `ad`, `da`, `dd`, `do`, `od`, `de`, and `non`-style transitions without kerning.
- Human review accepts `d` as a stable ascender model for future `b/p/q` family members.
- The ascender-bowl join is visually consistent with `h.lower.sdd` and does not collapse sidebearings in `proof/strings.txt`.

## glyphs/latin/e.lower.sdd

### Must
- Define a readable, high-frequency body form with stable eye and counter behavior.
- Set crossbar position so it can be reused for rhythm checks with `H`/`O` control families.
- Keep the e-curve weight relationship coherent with `o.lower.sdd` while preserving a distinct e identity.
- Establish open/closed counter behavior for future e-like variants.

### Done when
- e works in `he`, `de`, `se`, `es`, `le`-style transitions (`adhesion` family context), and `Maya`-style mixed-case rhythm checks.
- Human review accepts the openness and stress of the e-counter as clean and repeatable.
- `e` remains readable at text size in `proof/strings.txt` without requiring kerning.

## glyphs/latin/h.lower.sdd

### Must
- Carry the `n.lower.sdd` stem weight into a sustained ascender rhythm.
- Use the same stem-arch tension scale as `n.lower.sdd` while increasing width for a clear ascender identity.
- Set the shoulder-to-stem transition as a repeatable pattern for later arches (`m.lower`, `u.lower`, `r.lower` in later phases).

### Done when
- h works in `ha`, `hh`, `ho`, `ah`, `nh`, and `sh` contexts in proof strings.
- Human review accepts ascender rhythm as coherent with `d.lower.sdd` and `n.lower.sdd`.
- The shoulder remains stable in repeated stems (`hhn`, `hho`) without kerning support.

## glyphs/latin/i.lower.sdd

### Must
- Establish minimal lowercase stem logic for single-stroke glyphs.
- Keep stem width and x-height alignment compatible with `n.lower.sdd`.
- Define dot position as a spacing-aware visual anchor, not an afterthought.
- Clarify whether the dot remains a separate component or integrated stroke rhythm in a future phase.

### Done when
- i works in `ii`, `si`, `is`, `hi`, `ni`, and `ie` contexts in proof strings.
- Dot placement reads clearly at intended proof size without visual drift in repeated use (`iii`).
- Human review accepts dot policy as intentional and consistent for the phase.

## glyphs/latin/n.lower.sdd

### Must
- Establish lowercase stem weight.
- Establish x-height behavior.
- Establish arch logic for related glyphs: h, m, u, r.
- Provide the primary lowercase spacing control.
- Anchor the `adhesion` rhythm for straight and arch alternation.

### Done when
- n works in `nnn`, `non`, `nan`, `HnH`, and `minimum`-style rhythm strings.
- Human review accepts the arch as a repeatable family gesture.
- n supports initial `adhesion` sets like `on`, `na`, and `sn` without kerning.

## glyphs/latin/o.lower.sdd

### Must
- Establish lowercase round-form overshoot.
- Establish lowercase counter logic.
- Pair with n as the first rhythm test.
- Expose whether the design wants calligraphic stress, geometric balance, or a hybrid.
- Carry the round-half of `adhesion` rhythm contracts.

### Done when
- o works in `ooo`, `non`, `ono`, `noon`, and `nono`.
- Human review accepts counter, stress, overshoot, and spacing behavior.
- o supports `adhesion` rhythm checks in `on`, `so`, and `ho` contexts.

## glyphs/latin/s.lower.sdd

### Must
- Define the first asymmetrical lower-case transition glyph in the adhesion set.
- Balance top and bottom stress while preserving a readable two-lobe flow.
- Set terminal and curve tension such that `s` can join to straight, round, and ascender forms without distortion.
- Expose a testable rhythm marker for later serif/contrast choices.

### Done when
- s works in `ss`, `sh`, `so`, `is`, `si`, `ns`, `os`, and `shed shed` style sequences in `proof/strings.txt`.
- Human review accepts `adhesion` readability and personality without decorative treatment.
- Phase 1 spacing remains stable without kerning in repeated s patterns.

## masters/regular.sdd

### Must
- Start with one Regular master only.
- Define UPM, vertical metrics, x-height, cap height, ascender, descender, and overshoot values before build implementation.
- Keep numeric values provisional until research and first drawings support them.

### Done when
- Regular metrics are explicit and compatible with export validation.
- Human review accepts Regular as the right first master.

## metrics/kerning.sdd

### Must
- Start only after base spacing has passed review.
- Prefer class-based kerning once enough glyphs exist.
- Keep kerning exceptions explicit and reviewable.

### Done when
- Not applicable in start phase. This file is a guardrail placeholder until spacing passes.

## metrics/spacing.sdd

### Must
- Treat spacing as drawing logic, not cleanup.
- Establish sidebearing behavior with `adhesion` as the primary family rhythm and H/O/n/o/a as integrity controls.
- Use proof strings before kerning is introduced.
- Keep every spacing change tied to a glyph spec, proof, or review note.

### Done when
- The prototype glyphs can form readable rhythm strings without kerning.
- Human review marks the rhythm as coherent enough for the next glyph wave.

