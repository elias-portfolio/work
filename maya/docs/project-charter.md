# Maya Font — project charter

## Working name

Maya Font.

## Purpose

Build the first Maya font product: a converter-font/pipeline where Latin input is mapped into Maya visual output. Human aesthetic judgment remains sovereign; machine validation handles measurable constraints, mapping reproducibility, and build receipts.

Maya uses SpecDD as a local contract system: every meaningful artefact gets a nearby specification that says what it owns, what it depends on, what it forbids, and when it is done. The key artefact is not a generic Latin alphabet, but the mapping layer from Latin text to Maya signs/glyph sequences.

## Principle

SpecDD is discipline, not theology. The specs exist to stop agents from inventing silently, forgetting constraints, or mistaking measurable correctness for visual quality.

## Must

- Keep a local spec close to each artefact it governs.
- Use a repeated vocabulary: `Must`, `Must not`, `Owns`, `Depends on`, `Forbids`, `Done when`.
- Separate measurable validation from aesthetic review.
- Keep early scope to one conversion slice: Latin input tokens -> Maya output signs/glyph sequences, with a small proof set.
- Record unresolved aesthetic questions explicitly instead of burying them in implementation.

## Must not

- Do implementation before the first approval gate.
- Treat AI output as design authority.
- Reduce visual form to numeric rules where the rule would kill the form.
- Let root rules become a swollen constitution nobody reads.
- Expand glyph coverage before the mapping model, sign inventory, and first Maya-output proof establish rhythm, visual logic, and conversion behavior.

## Owns

- The project charter.
- The root font-family design principles.
- The first Latin-to-Maya mapping contract set.
- The first Maya output sign/glyph prototype set.
- The first metrics, kerning, master, and export contracts.
- The research prompt pack for external deep research.

## Depends on

- Human review for taste, silhouette, rhythm, conceptual fit, and whether the output reads as Maya rather than generic Latin.
- Machine validation for file structure, build reproducibility, font metadata, interpolation sanity, glyph naming, outlines, metrics, and export checks.
- External research on current type-design tooling and AI-assisted workflows.

## Forbids

- Codex implementation before approval.
- Bulk Latin glyph generation without a Latin-to-Maya mapping decision.
- Metrics, substitution, ligature, mapping, or kerning changes that are not tied to a spec or review note.
- Aesthetic claims without visual evidence.

## Done when

This start phase is done when Elias has approved:

1. the charter,
2. the minimal SpecDD skeleton,
3. the first Latin-to-Maya mapping proof set,
4. the first Maya output sign/glyph prototype set,
5. the deep-research prompt pack.

Only after that may the project move into implementation planning.
