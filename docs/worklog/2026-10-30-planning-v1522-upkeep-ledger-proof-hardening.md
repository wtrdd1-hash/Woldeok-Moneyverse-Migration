# Planning v1522 — upkeep receipt ledger-proof and reference-week correctness

**2026-10-30 KST · Feature Improvement · DRAFT/HOLD · DOCS ONLY**

## Before work
- [x] Consulted installed Superpowers using-superpowers, brainstorming, writing-plans, worktrees and verification skills (skills connector returned no URI).
- [x] Queried miniPC Debian 13.6 system status; seven services active and DEV DB connected. Checked main `bf8d0d48f810932b43783d8605dce53954c60cff`, canonical AGENTS/README/English plan and Korean parity, open PRs, and v1520 Draft #2036.
- [x] Created isolated `auto/planning-v1522-upkeep-ledger-proof-hardening-20261030` worktree stacked on Draft #2036, not shared main.

## In progress — source and QA evidence
- [x] Read `001-economy-core.sql` posting delta rule: debit increases balance, credit decreases. Read migration 104: actual upkeep posts USER_CASH credit / SINK debit for both auto/manual settlement.
- [x] Read migration 075 receipt UNIQUE/FK and 104 automated `v_total` with prior arrears and manual `first_missed_week`; no per-week coverage allocation or receipt payment timestamp.
- [x] Inspected Nest shop controller/service, Next purchase BFF and Android gateway boundaries; receipt history is a new read, purchase receipts are not upkeep receipts.
- [x] Inspected QA v1396 correction in #2031: public Nginx uses live-prod v1935 bf8d0d48, legacy v1515 units are separate; exact deployed SHA runtime checks failed, official Test c2129625, local lint parse failed. Release HOLD.
- [x] Re-fetched main during work; unchanged at the same SHA. No automatic merge or Production action.

## Finished — verification and handoff
- [x] English/Korean integrated plan, canonical plan, update logs, GitHub logs and this worklog validated.
- [x] DOCS_ONLY release classifier 24/24 and git diff checks passed.
- [x] Draft PR #2042 created on #2036; engineering issue #2035 updated, release P0 #2031 cross-referenced.
- [x] Final SHA recorded on miniPC; GitHub CI status checked separately (not a runtime approval).

**Acceptance is documentation-only.** Synthetic PostgreSQL 10,001-row and negative suites are specified but **not executed**; no claims of full runtime CI, Test exact-SHA, Production authorization, independent restore or 10,000 external reference approval. Newly approved independent references 0, cumulative UNKNOWN/10,000 (BLOCKED / IN PROGRESS). No runtime, DB, WLD, Test, Production, or main mutation.
