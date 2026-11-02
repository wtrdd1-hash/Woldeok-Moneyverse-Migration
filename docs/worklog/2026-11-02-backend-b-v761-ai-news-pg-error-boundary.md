# Backend B v761 — AI news PostgreSQL error privacy boundary

## Before work — 2026-11-02 21:39 KST
- Base main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; GitHub and miniPC checked. Independent non-main worktree.
- QA v1472 `FAILED/P0`; Production and Test do not serve this candidate. Read AGENTS.md, README.md, English and Korean canonical project plans, current PR/CI/QA and related A/C/B branches.
- Reproduced by source review: `AiNewsController.guarded` sends arbitrary PostgreSQL `error.message` as `ai_news_refused.detail` for SQLSTATE P0001/23505/55000; the web displays only two known reasons, so full raw SQL is unnecessary. SQLSTATE 22023 known scenario failures currently bypass expected client-error mapping.
- Existing SQL migration 153 uses exact `scenario is no longer open` and `a strong reversal cannot follow the opposite news within six hours` messages. Preserve these two operator-facing explanations without raw database text.
- Scope: backend controller error normalization and HTTP/unit regression. No route/schema/migration/ledger changes.

## In progress
- Regression test committed first at `617004e3fcd698d86899b243346f55b186fac8d0` on GitHub. RED execution and minimal implementation are next.
- P0 DB ACL/checksum, Production locale HTTP 500, full CI, official Test exact-SHA and independent restore remain release blockers.

## Finished
- Pending final verification; draft-only and release hold.
