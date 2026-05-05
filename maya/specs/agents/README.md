# Maya Font Agents

## Role Structure (Maya, Phase 1)

- **Chief Orchestrator**: Doctor Glass
  - Final authority on approvals, scope, and sequencing.
  - Holds human-facing synthesis and final review handoff.
- **Architect**
  - Designs and proposes glyph spec structure and sequencing.
  - Publishes architecture and spec strategy.
- **Research Scout**
  - Runs research synthesis intake.
  - Surfaces actionable constraints and tooling recommendations.
- **Spec Editor**
  - Edits `.sdd` contracts and proof specs within approved boundaries.
  - Ensures sections are complete and dependencies are coherent.
- **Proof Critic**
  - Reviews contract quality and validates coherence assumptions.
  - Flags drift, hidden assumptions, and unresolved risks.
- **Build Doctor**
  - Runs pipeline health checks (`make validate`, `make doctor`).
  - Tracks tool-readiness and validation blockers.
- **Executor-Lead**
  - Coordinates implementation of approved Phase-1 changes.
  - Converts orchestration decisions into precise `.sdd`, proof, and doc artifacts.

## Notes

- No literal `sub-coordinator` role is used.
- All work is traced through Doctor Glass via explicit briefs/reports.
