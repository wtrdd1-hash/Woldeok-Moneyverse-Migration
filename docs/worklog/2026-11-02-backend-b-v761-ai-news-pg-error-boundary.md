# Backend B v761 — AI news PostgreSQL error privacy boundary

## Before work — 2026-11-02 21:39 KST
- Base main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; GitHub and miniPC checked. Independent non-main worktree.
- QA v1472 `FAILED/P0`; Production and Test do not serve this candidate. Read AGENTS.md, README.md, English and Korean canonical project plans, current PR/CI/QA and related A/C/B branches.
- Reproduced by source review: `AiNewsController.guarded` sends arbitrary PostgreSQL `error.message` as `ai_news_refused.detail` for SQLSTATE P0001/23505/55000; the web displays only two known reasons, so full raw SQL is unnecessary. SQLSTATE 22023 is already classified as an expected command failure; its raw message currently reaches the browser.
- Existing SQL migration 153 uses exact `scenario is no longer open` and `a strong reversal cannot follow the opposite news within six hours` messages. Preserve these two operator-facing explanations without raw database text.
- Scope: backend controller error normalization and HTTP/unit regression. No route/schema/migration/ledger changes.

## In progress
- Regression test committed first at `617004e3fcd698d86899b243346f55b186fac8d0` on GitHub. RED executed: 4 expected failures, 1 control pass (`logs/red.log`); implementing minimal sanitization.
- P0 DB ACL/checksum, Production locale HTTP 500, full CI, official Test exact-SHA and independent restore remain release blockers.

## Finished
- Pending final verification; draft-only and release hold.

### Midpoint — 2026-11-02 21:40 KST
- Re-fetched main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`, unchanged; reviewed EN/KO plans and QA v1472 again.
- RED confirmed on real miniPC Vitest: **4 failures / 1 passing control** (unmasked PostgreSQL details), `logs/red.log`.
- Minimal implementation now maps exactly two known migration-153 messages to fixed `reversal` / `no longer open` UI tokens, omitting all other SQL details. Existing API path and `ai_news_refused` code unchanged.
- Focused GREEN **13/13** controller/consent/guard tests and HTTP privacy GREEN **7/7**. One multiworker attempt aborted from miniPC cgroup thread exhaustion; serial single-worker rerun passed. No Production changes.
- Full workspace gates and CI are pending. Release HOLD remains in force.
