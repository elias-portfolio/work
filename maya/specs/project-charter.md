# Maya Font — project charter

## Working name

Maya Font.

## Purpose

Build an original typeface through an agent-assisted workflow where human aesthetic judgment remains sovereign and machine validation handles measurable constraints.

Maya uses SpecDD as a local contract system: every meaningful artefact gets a nearby specification that says what it owns, what it depends on, what it forbids, and when it is done.

## Principle

SpecDD is discipline, not theology. The specs exist to stop agents from inventing silently, forgetting constraints, or mistaking measurable correctness for visual quality.

## Must

- Keep a local spec close to each artefact it governs.
- Use a repeated vocabulary: `Must`, `Must not`, `Owns`, `Depends on`, `Forbids`, `Done when`.
- Separate measurable validation from aesthetic review.
- Keep early scope to one master, one writing system slice, and a small control glyph set.
- Record unresolved aesthetic questions explicitly instead of burying them in implementation.

## Must not

- Do implementation before the first approval gate.
- Treat AI output as design authority.
- Reduce visual form to numeric rules where the rule would kill the form.
- Let root rules become a swollen constitution nobody reads.
- Expand glyph coverage before the prototype glyphs establish rhythm, contrast, counter logic, and spacing behavior.

## Owns

- The project charter.
- The root font-family design principles.
- The first glyph prototype contract set.
- The first metrics, kerning, master, and export contracts.
- The research prompt pack for external deep research.

## Depends on

- Human review for taste, silhouette, rhythm, and conceptual fit.
- Machine validation for file structure, build reproducibility, font metadata, interpolation sanity, glyph naming, outlines, metrics, and export checks.
- External research on current type-design tooling and AI-assisted workflows.

## Forbids

- Codex implementation before approval.
- Bulk glyph generation without local glyph specs.
- Metrics and kerning changes that are not tied to a spec or review note.
- Aesthetic claims without visual evidence.

## Done when

This start phase is done when Elias has approved:

1. the charter,
2. the minimal SpecDD skeleton,
3. the first 3-5 glyphs for the prototype,
4. the deep-research prompt pack.

Only after that may the project move into implementation planning.
