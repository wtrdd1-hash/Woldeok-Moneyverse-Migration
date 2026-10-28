# C v1142 — Scenario Lab Council Evidence (canonical English)
Status: STARTED / HOLD. 2026-10-29 03:5x KST.
Base main: 35971c600f25869c96f1c666d4b9f58927202730.
Branch: auto/hourly-c-scenario-truth-v1142-20261029-0345.

## Before work
- Checked Debian 13.6 miniPC; seven services active, PostgreSQL connected.
- Read AGENTS.md, README.md, README/README.ko.md, both living project plans, latest QA v1355, recent A/B/C/Planning PRs.
- Confirmed no existing PR targets the scenario-lab page.
- P1 defect: scenario-lab/page.tsx locally invents Llama/Gemma votes and labels them real-time dual-AI cross-review, although the actual backend endpoint only returns a deterministic read-only projection. This can be mistaken for an approved economic policy.
- Preserve the genuine backend projection and parameter validation. Do not write to DB, perform financial mutations, fabricate model decisions, or modify other worktrees.
- Design: replace synthetic vote and fake model claims with a prominent accessible "not evaluated by AI" evidence notice; label the projection as mathematical what-if, not policy approval. Keep authenticated GET and non-indexed responsive page.
- TDD: add page-level regression tests first (RED), remove invented council logic (GREEN), run focused and full gates. Any failed gate means Draft/HOLD; no merge or deployment.
## In progress
Pending tests and implementation.
## Finished
Pending verification and release decision.
