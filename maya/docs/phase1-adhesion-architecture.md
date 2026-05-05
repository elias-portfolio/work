# Maya Font — Phase 1 Architecture Report

**Author:** Phase-1 Architect Subagent  
**Date:** 2026-05-05  
**Report To:** Doctor Glass (Chief Orchestrator)  
**Status:** Architecture Only — No Implementation Edits

---

## 1. Executive Summary

This document defines the Maya-specific subagent/orchestration structure for Phase 1 of the Latin typeface project. It is inspired by the ultrawork pattern but **does not use a literal 'sub-coordinator' role**. Instead, authority flows through a flat executor hierarchy with Doctor Glass as the single Chief Orchestrator.

Phase 1 promotes `adhesion` (`a d h e s i o n`) as the design-DNA glyph set while preserving `H/O/n/o/a` as **proof controls** — a dual-track approach that validates the SpecDD system against known working patterns.

---

## 2. Role Taxonomy (Maya-Specific)

### 2.1 Chief Orchestrator: Doctor Glass
- **Identity:** Doctor Glass (existing)
- **Purpose:** Single point of authority. No sub-coordinator exists beneath Glass.
- **Authority:** 
  - Approve all spec changes
  - Gate all implementation transitions
  - Resolve inter-executor conflicts
  - Interface with Elias/human reviewers
- **Deliverables:** 
  - Go/no-go decisions
  - Briefs for executor subagents
  - Final review synthesis

### 2.2 Executor Class: Architect
- **Identity:** Domain-specific analyst (e.g., "Phase-1 Architect", "Glyph Logic Architect")
- **Purpose:** Propose spec structures, identify dependencies, design validation gates
- **Authority:**
  - Write new `.sdd` files and architecture reports
  - Propose edits to existing specs (requires Glass approval)
  - Define task decomposition for other executors
- **Deliverables:**
  - Architecture documents (like this one)
  - Spec drafts for review
  - Dependency maps
- **Boundaries:** 
  - May NOT edit `recovered/` material
  - May NOT approve own proposals
  - Must route all implementations through Glass

### 2.3 Executor Class: Spec Validator
- **Identity:** Contract enforcement agent
- **Purpose:** Ensure all `.sdd` files follow the SpecDD vocabulary and dependency rules
- **Authority:**
  - Run `make validate`
  - Report violations with specific citations
  - Propose fixes as patches (requires Glass approval)
- **Deliverables:**
  - `reports/validate.json`
  - Violation reports with line references
- **Boundaries:**
  - Does not judge aesthetic quality
  - Does not generate outlines

### 2.4 Executor Class: Research Synthesizer
- **Identity:** Information distillation agent
- **Purpose:** Convert external research into project-usable briefs
- **Authority:**
  - Run `make research-snapshot`
  - Summarize Gemini/type-design research
  - Extract actionable recommendations
- **Deliverables:**
  - `research/synthesis/*.md` files
  - Tool comparison matrices
  - Workflow recommendations
- **Boundaries:**
  - Does not choose tools (recommends only)
  - Does not implement

### 2.5 Executor Class: Source Shell Generator
- **Identity:** UFO/infrastructure scaffold agent
- **Purpose:** Create safe empty sources without glyph outlines
- **Authority:**
  - Run `make init-ufo`
  - Generate metadata-only UFO structures
  - Validate UFO shell integrity
- **Deliverables:**
  - `sources/Maya-Regular.ufo/` (metadata only)
  - UFO validation reports
- **Boundaries:**
  - NO glyph outlines in Phase 1
  - NO interpolation setup yet

### 2.6 Executor Class: Critic
- **Identity:** Adversarial review agent
- **Purpose:** Attack the coherence of specs, identify hidden assumptions, find contamination
- **Authority:**
  - Run `make doctor`
  - Flag SpecDiff/audio/spectrogram drift
  - Challenge unproven aesthetic claims
- **Deliverables:**
  - Critical analysis reports
  - List of unvalidated assumptions
  - Risk warnings
- **Boundaries:**
  - Does not fix issues (reports only)
  - Does not block without Glass channel

### 2.7 Executor Class: Brief Generator
- **Identity:** Handoff documentation agent
- **Purpose:** Create implementation briefs for other executors
- **Authority:**
  - Run `make brief`
  - Summarize current state for subagent consumption
  - Maintain `handoffs/` folder
- **Deliverables:**
  - `handoffs/glass-subagent-implementation-brief.md`
  - State snapshots
  - Next-action recommendations

---

## 3. Phase 1: The `adhesion` Promotion Plan

### 3.1 Context: Current vs Proposed

**Current skeleton:** `H.cap`, `O.cap`, `n.lower`, `o.lower`, `a.lower`  
**Proposed design-DNA set:** `adhesion` (`a d h e s i o n`)

The current skeleton uses `H/O/n/o/a` as a minimal control set. Gemini research recommends `adhesion` as a stronger first design-DNA set because it:
- Tests straight (n), round (o), arch (h), and asymmetric (s) forms
- Includes ascender (d, h) and descender (p, g — though p/g not in adhesion)
- Forms a readable word for immediate visual evaluation
- Covers spacing pairs: straight-straight (ad), straight-round (de), round-straight (on), etc.

### 3.2 Phase 1 Scope

Promote `adhesion` as the primary prototype glyph set while **keeping `H/O/n/o/a` as proof controls** — they verify that the SpecDD system works with known-good patterns.

### 3.3 Phase 1 Atomic Task List

| # | Task | Executor Class | Deliverable | Gate |
|---|------|----------------|-------------|------|
| 1.1 | Create `adhesion` glyph spec stubs | Architect | `glyphs/latin/{a,d,h,e,s,i,o,n}.lower.sdd` | Glass approval |
| 1.2 | Define `adhesion` proof strings | Architect | Update `proof/strings.txt` | Glass approval |
| 1.3 | Update `spacing.sdd` to reference `adhesion` | Architect | Patch to `metrics/spacing.sdd` | Glass approval |
| 1.4 | Validate all new specs | Spec Validator | `reports/validate.json` | Must pass |
| 1.5 | Run research snapshot | Research Synthesizer | `research/synthesis/*.md` | Info only |
| 1.6 | Generate UFO source shell | Source Shell Generator | `sources/Maya-Regular.ufo/` | Glass approval |
| 1.7 | Generate implementation brief | Brief Generator | Updated `handoffs/glass-subagent-implementation-brief.md` | Info only |
| 1.8 | Critic review of `adhesion` plan | Critic | Critical analysis report | Glass review |
| 1.9 | Human review gate | Doctor Glass → Elias | Approved/Rejected decision | **STOP if rejected** |
| 1.10 | Mark `H/O/n/o/a` as proof controls | Architect | Add `proof-control:` tag to existing specs | Post-approval |

### 3.4 Detailed Task Specifications

#### Task 1.1: Create `adhesion` Glyph Spec Stubs

Create 8 new `.sdd` files under `glyphs/latin/`:

| Glyph | File | Key Concerns |
|-------|------|--------------|
| a | `a.lower.sdd` | Bowl, terminal, aperture (already exists — review/update) |
| d | `d.lower.sdd` | Ascender, bowl, stem weight relationship to n/h |
| e | `e.lower.sdd` | Crossbar, counter, eye logic, relationship to o |
| h | `h.lower.sdd` | Ascender, arch, stem weight inheritance from n |
| i | `i.lower.sdd` | Dot position, stem width, spacing minimalism |
| o | `o.lower.sdd` | Counter, overshoot (already exists — review/update) |
| n | `n.lower.sdd` | Arch, stem weight (already exists — review/update) |
| s | `s.lower.sdd` | Asymmetry, terminals, curve tension, personality test |

Each spec MUST include:
- `Must`: Establish specific design logic
- `Must not`: Prohibit premature decisions
- `Owns`: Declare what this glyph controls
- `Depends on`: Reference dependencies (e.g., `n.lower.sdd` for stem weight)
- `Forbids`: Prevent common errors
- `Done when`: Proof strings and human review criteria

#### Task 1.2: Define `adhesion` Proof Strings

Add to `proof/strings.txt`:

```
# adhesion proof strings (Phase 1)
adhesion adhesion adhesion
ad ad ad
de de de
he he he
on on on
ion ion ion
sh sh sh
si si si
is is is
so so so
os os os
his his his
shed shed shed
side side side
hide hide hide
nose nose nose
ash ash ash
```

Keep existing `H/O/n/o/a` strings as proof controls:

```
# H/O/n/o/a proof controls (legacy, maintained)
HHH HOH OHO HnH HaH
OOO HOH OHO
nnn non nan HnH minimum
ooo non ono noon nono
aaa nan ana non noa
```

#### Task 1.3: Update `spacing.sdd`

Modify `metrics/spacing.sdd` to:
- Reference `adhesion` glyphs as primary spacing controls
- Keep `H/O/n/o/a` as cross-checks
- Add note: "Proof controls: H/O/n/o/a verify SpecDD system integrity"

#### Task 1.4-1.8: Validation Pipeline

Standard executor runs — see Role Taxonomy above.

#### Task 1.9: Human Review Gate

**Critical Gate:** Elias must approve:
1. The `adhesion` glyph set rationale
2. The dual-track approach (adhesion + H/O/n/o/a proof controls)
3. The updated proof strings
4. The risk assessment

**STOP RULE:** If rejected, do not proceed. Return to architecture revision.

#### Task 1.10: Mark Proof Controls

Post-approval, tag existing specs:

```yaml
# In H.cap.sdd, O.cap.sdd, etc.
## Proof Control Note
# This spec is maintained as a proof control for the SpecDD system.
# It validates that the system works with known-good patterns.
# Primary design-DNA set is now `adhesion` (a d h e s i o n).
```

---

## 4. Files to Create/Edit

### 4.1 Files to Create

| Path | Purpose | Executor |
|------|---------|----------|
| `glyphs/latin/d.lower.sdd` | d glyph spec | Architect |
| `glyphs/latin/e.lower.sdd` | e glyph spec | Architect |
| `glyphs/latin/h.lower.sdd` | h glyph spec | Architect |
| `glyphs/latin/i.lower.sdd` | i glyph spec | Architect |
| `glyphs/latin/s.lower.sdd` | s glyph spec | Architect |
| `research/synthesis/adhesion-rationale.md` | Design-DNA justification | Architect |

### 4.2 Files to Edit

| Path | Change | Executor |
|------|--------|----------|
| `proof/strings.txt` | Add adhesion strings | Architect |
| `metrics/spacing.sdd` | Reference adhesion + proof controls | Architect |
| `glyphs/latin/a.lower.sdd` | Review/update for adhesion context | Architect |
| `glyphs/latin/n.lower.sdd` | Review/update for adhesion context | Architect |
| `glyphs/latin/o.lower.sdd` | Review/update for adhesion context | Architect |

### 4.3 Files to Tag (Post-Approval)

| Path | Tag | Executor |
|------|-----|----------|
| `glyphs/latin/H.cap.sdd` | Add proof-control note | Architect |
| `glyphs/latin/O.cap.sdd` | Add proof-control note | Architect |
| `glyphs/latin/n.lower.sdd` | Add proof-control note | Architect |
| `glyphs/latin/o.lower.sdd` | Add proof-control note | Architect |
| `glyphs/latin/a.lower.sdd` | Add proof-control note | Architect |

---

## 5. Stop Rules / Gates

### 5.1 Absolute Stops (Hard Gates)

| Condition | Action |
|-----------|--------|
| `make validate` fails | Do not proceed. Fix specs first. |
| Glass rejects proposal | Do not proceed. Revise architecture. |
| Elias rejects at review gate | Do not proceed. Return to design principles. |
| Attempt to edit `recovered/` | BLOCK. This is prior art/archive. |
| Attempt to generate glyph outlines | BLOCK. Outlines require separate approval gate. |

### 5.2 Conditional Stops (Soft Gates)

| Condition | Action |
|-----------|--------|
| Critic finds unvalidated assumptions | Pause. Address or document as risk. |
| Research synthesis conflicts with `adhesion` plan | Pause. Reconcile with Glass. |
| Tool readiness blocks UFO generation | Document in `reports/doctor.md`. Continue planning. |

### 5.3 Routing Rules

- **All spec changes** → Doctor Glass → Elias (if aesthetic)
- **Validation failures** → Spec Validator → fixes → re-validate
- **Research findings** → Research Synthesizer → brief → Glass
- **Critical analysis** → Critic → report → Glass
- **Implementation** → Only after explicit Glass approval

---

## 6. Success Criteria / Unconditional Proofs

### 6.1 Phase 1 Complete When

1. **Specs:** All `adhesion` glyph specs exist and `make validate` passes
2. **Proof Strings:** `proof/strings.txt` includes adhesion + H/O/n/o/a controls
3. **Documentation:** `research/synthesis/adhesion-rationale.md` explains design-DNA choice
4. **UFO Shell:** `sources/Maya-Regular.ufo/` exists (metadata only, no outlines)
5. **Human Approval:** Elias has approved the `adhesion` direction
6. **Proof Controls Tagged:** H/O/n/o/a specs marked as system validation controls

### 6.2 Unconditional Proofs (Checklist)

| # | Proof | Verification |
|---|-------|--------------|
| P1 | `make validate` returns `"ok": true` | `reports/validate.json` |
| P2 | 8 adhesion specs exist | `ls glyphs/latin/{a,d,e,h,i,n,o,s}.lower.sdd` |
| P3 | Proof strings include adhesion | `grep "adhesion" proof/strings.txt` |
| P4 | Proof strings include H/O/n/o/a | `grep "HHH\|OOO\|nnn\|ooo\|aaa" proof/strings.txt` |
| P5 | Elias approval recorded | Decision file or Glass confirmation |
| P6 | No outlines in UFO | `find sources/Maya-Regular.ufo -name "*.glif" | wc -l` == 0 |
| P7 | No recovered/ contamination | `git status` shows no changes to `recovered/` |

### 6.3 Failure Modes

| Mode | Detection | Response |
|------|-----------|----------|
| Spec drift | `make validate` fails | Re-run Spec Validator, fix, re-validate |
| Human rejection | Glass/Elias says no | Return to architecture, revise proposal |
| Tool gap | `make doctor` shows missing tools | Document, defer build phase, continue planning |
| Outline creep | `.glif` files appear in UFO | DELETE. Outlines are gated separately. |

---

## 7. Architecture Diagram

```
                    ┌─────────────────┐
                    │   Elias/Human   │
                    │  (Sovereign)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Doctor Glass   │
                    │Chief Orchestrator
                    │   (No Sub-Coord)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │Architect│         │  Critic │         │  Brief  │
   │(Specs)  │         │(Review) │         │Generator│
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │ Spec    │         │Research │         │ Source  │
   │Validator│         │Synthesizer         │ Shell   │
   │         │         │         │         │Generator│
   └─────────┘         └─────────┘         └─────────┘

Executor Classes:
- Flat hierarchy — no sub-coordinator
- All report to Doctor Glass
- Glass decides what reaches Elias
```

---

## 8. Open Questions for Glass/Elias

1. **s glyph complexity:** The `s` is often the hardest lowercase glyph. Is it appropriate for Phase 1, or should we defer to Phase 2?
2. **i/j dot:** Should `i.lower.sdd` include the dot as a component or integrated outline?
3. **Proof control status:** Should H/O/n/o/a remain fully maintained specs, or transition to "frozen" reference state?
4. **E thematic:** The `e` has high word frequency. Should it have stricter rhythm requirements than other glyphs?
5. **Descender test:** `adhesion` lacks a descender (g, j, p, q, y). Should we add one for completeness, or defer to Phase 2?

---

## 9. Summary

This architecture establishes:

1. **Flat executor hierarchy** with Doctor Glass as single orchestrator (no sub-coordinator)
2. **Dual-track glyph strategy:** `adhesion` as design-DNA, `H/O/n/o/a` as proof controls
3. **Explicit gates:** Validation, Glass approval, Elias approval
4. **Atomic tasks:** 10 tasks with clear deliverables and stop rules
5. **Unconditional proofs:** 7 verifiable success criteria

**Next Action:** Doctor Glass reviews this architecture and decides on the open questions before authorizing Task 1.1.

---

*End of Architecture Report*
