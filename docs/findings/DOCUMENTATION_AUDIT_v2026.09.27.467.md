# Documentation Audit — v2026.09.27.467

**English canonical** | [한국어](DOCUMENTATION_AUDIT_v2026.09.27.467.ko.md)

- Start baseline: `main@b0c8f1e25dc15b28d44fd033fca510bce70f6960`
- Latest-main reconciliation baseline: `main@d64eaedccb7c094063b36fb5f46590ce19f51ab1`
- Scope: full Git-tree documentation inventory, authority classification, exact-duplicate detection, language-pair inventory and Android documentation cross-check.
- Runtime/Test/Production: documentation-only audit; no deployment claim.

## Findings

### DOC-467-01 — P0 — AUTHORITY_DRIFT
Repository source/runtime history reached v2026.09.27.466 while `docs/planning/PROJECT_PLAN.md` remains v2026.09.25.444. Post-v444 runtime commits and root `implementation_plan.md` entries are evidence, not silent product authority.

**Action:** expose the drift. Do not renumber `PROJECT_PLAN.md` until post-v444 product decisions are actually reconciled.

### DOC-467-02 — P1 — stale navigation authority
The prior docs landing/index/catalog presented v402 as current full re-review and the index declared planning authority v442.

**Action:** v402 is historical; current implementation authority is v444; runtime/source v466 drift is explicit.

### DOC-467-03 — P1 — inventory growth and duplicate history
Exact inventory contains 1,638 files under `docs/`, 1,620 Markdown files, 18 root-level dated Markdown files and 31 exact duplicate-content groups.

**Action:** preserve paths. Future deduplication requires inbound-link proof and compatibility paths.

### DOC-467-04 — P1 — language-pair inventory
Raw normalization found 85 English Markdown paths without Korean pairs and 19 Korean-normalized paths without English pairs. Historical/internal/API legacy and third-language material is included.

**Action:** require EN canonical + KO for newly maintained authority/governance docs; triage legacy gaps rather than mass-copying them.

### DOC-467-05 — P1 — root execution artifacts can be mistaken for authority
Root `implementation_plan.md`, `PROJECT_MEMORY.md` and `walkthrough.md` mix implementation notes and historical/operational context.

**Action:** classify them as non-authoritative unless explicitly adopted by `PROJECT_PLAN.md`.

### DOC-467-06 — P1 — Android documentation drift
The app repository has 66 files under `docs/` and 67 documentation-related files overall. Its old app guide contains casino/older runtime/database assumptions.

**Action:** add app README/governance pairs that defer product authority to the web repository and mark the old guide historical.

### DOC-467-07 — P1 — concurrent-main reconciliation
During final pre-integration checking, web main moved from `b0c8f1e...` to `d64eaed...` with runtime and root execution-plan changes only. The documentation work was recreated from the new exact main instead of merging over or reverting concurrent work. The runtime commit itself uses v2026.09.27.466, so the documentation cycle was advanced from the provisional v466 label to v2026.09.27.467 to avoid version collision.

## Acceptance
Current authority is obvious; v402 is historical; no historical file is deleted; EN/KO maintained governance is paired; concurrent main is preserved; app docs defer to web authority; start/mid/final main checks are recorded.
