# Security-first execution order — v2026.11.27.1902.1
Owner approved reprioritization on 2026-11-27. This changes task order only; existing security scope, approvals, release gates and app hold remain in force. Preserve existing branches and evidence.

## Required sequence
- [ ] P0-S: consolidate S01–S04 coverage and triage, prioritize verified Critical/High findings, record actual scope and gaps.
- [ ] P1-S: identity, administrator/member authorization, session lifecycle, independent factor policy and CSRF regression.
- [ ] P2-S: financial/DB privileges, ledger integrity, privacy/data isolation and real-time authorization.
- [ ] P3-S: remaining defense coverage, dependencies, secret/configuration scans and failure handling. Split heavy audits into sequential phases instead of omitting mandatory categories. CVP-labelled review conditional on verified entitlement; underlying defensive audit required.
- [ ] P4-S: remediate findings, exact-SHA full regression and independent Claude/GPT-Codex/Gemini review/re-review; unresolved mandatory checks remain HOLD. Never treat test counts alone as security acceptance.
- [ ] P5-S: gated official Test and rollback/hotfix/migration preparation; preserve G8 publisher/lease and separate G9 approval. No unauthorized production deployment or main merge.
- [ ] P6-B/P7-W: resume non-security backend then frontend, translation and UI/UX only after security candidate readiness; repeat security checks after changes. Prior backlog preserved.

## Evidence and status
At start: main 1df1150e97, integration ff33704ef8, previous candidate tests Spring 993/0/0 and frontend 3340/3340, type check clean. Security review was already running. Mandatory coverage and readiness are not yet verified. Owner priority instruction delivered to the normal Claude input queue without interrupting current audit. One heavy job at a time; no new provider/paid usage, no production probing or private data disclosure. Record exact SHA, test and finding dispositions, status and blockers. Public record sanitized; sensitive details stay internal. No application, account, or runtime changes by the coordinator.
