# Maya Font Pipeline

This is the usable project pipeline for Maya Font.

It is deliberately Glass-led and subagent-friendly. Codex is not the default builder.
The pipeline validates contracts, captures research, creates safe source scaffolds, and produces briefs for narrow subagents. It does not generate glyph outlines unless a later explicit gate allows it.

## Commands

```bash
cd /Users/eliaskarlsson/openclaw/workspaces/projects/maya-font
make status            # show optional font-tool readiness and current specs
make validate          # validate .sdd section structure and path-like dependencies
make research-snapshot # copy/summarize the Gemini Deep Research result into project research
make init-ufo          # create an empty safe UFO source shell, no glyph outlines
make brief             # generate a Glass/subagent implementation brief
make doctor            # run research snapshot + brief + validation report
```

## Pipeline stages

1. **Research intake**
   - Source: Gemini Deep Research extraction from the Glass handoff folder.
   - Output: `research/synthesis/gemini-specdd-type-pipeline-2026-05-05.md`.

2. **Spec validation**
   - Every `.sdd` file must contain: `Must`, `Must not`, `Owns`, `Depends on`, `Forbids`, `Done when`.
   - Path-like dependencies are checked where possible.
   - Output: `reports/validate.json`.

3. **Source shell**
   - `make init-ufo` creates `sources/Maya-Regular.ufo` with metadata only.
   - No glyph outlines are generated in this stage.

4. **Subagent work loop**
   - Researcher verifies claims and sources.
   - Architect proposes spec changes and gates.
   - Executor edits only approved files.
   - Critic runs `make doctor` and attacks the result.
   - Glass decides what reaches Elias/Maya group.

5. **Later font build gate**
   - Once approved and dependencies are installed, the build path should use UFO/.glif + fontmake + fontbakery + HarfBuzz + visual regression.
   - Current local machine has HarfBuzz/WOFF2 binaries but is missing Python font packages. Treat that as setup work, not a blocker for the SpecDD pipeline.

## Current design decision to make

The old skeleton uses `H/O/n/o/a`. Gemini recommends `adhesion` (`a d h e s i o n`) as a stronger first design-DNA set. Do not silently switch. Make it a Glass/Elias decision.

## Stop rules

- Do not overwrite `recovered/` material.
- Do not route to Codex as default builder.
- Do not claim a font build exists unless `sources/`, exported binaries, and validation receipts exist.
- Do not let SpecDD drift into SpecDiff/audio/spectrogram material.
