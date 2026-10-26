# Backend B v556 — SSRF DNS-to-connect pinning (2026-10-26)

## Before work
- Start main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched from origin).
- Isolated branch: `auto/hourly-b-ssrf-dns-pin-v556-20261026-1435`.
- Read AGENTS.md, README.md, English/Korean project plans, release guide, relevant TDD/worktree/verification skills; reviewed current PRs, QA and CI.
- P1 #1369: DNS check and fetch connection resolve separately. PRs #1368 and #1392 touch same module; preserve their changes and flag integration order.
- No live DB writes, feature switch changes, existing worktree modifications, merge or deployment.

## In progress
- [x] RED: prove validated DNS address not bound to outbound socket.
- [x] GREEN: pin validated address for each hop, fail closed on mixed/private answers and preserve hostname TLS/Host.
- [x] Tests: focused, typecheck, lint, build, security and isolated PostgreSQL smoke.
- [ ] Required gates: full frontend test, dependency audit, complete real-PG app-role/migrations, authenticated official Test exact-SHA, and GitOps release all PASS.

## Finished — PARTIAL / BLOCKED (2026-10-26 14:51 KST)
- **Starting and mid/late main SHA:** `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, re-fetched; English/Korean planning unchanged on main. New branch only; no main merge.
- **Code SHA:** `ce5508008d09915561ca6f51441f31f8ec077c68`; **patched dependency SHA:** `b84b18b8ebd08de69fffbc0b91819feb668a7633` (`undici@7.30.1`). This document finalization will create a newer documentation-only HEAD; code SHA is explicitly identified.
- **Actual code:** `backend/src/security/ssrf-defense.ts`, new `ssrf-dns-pin.test.ts`, `backend/package.json`, `pnpm-lock.yaml`. Validate all A/AAAA records, pin the connector lookup to approved addresses per hop, reject mixed/private and IPv4-mapped/compatible IPv6, prevent caller dispatcher override, preserve URL hostname for TLS/Host and redirect credential checks, combine caller abort with timeout, gracefully close per-hop Agent. No API DTO/route change, DB migration or ledger mutation.
- **TDD:** before fix 3/4 new tests RED, 1 already GREEN; after fix 5/5 new and 18/18 related SSRF/redirect tests GREEN on patched dependency. Actual public HTTPS GET via `safeFetch` returned 200, body 577 bytes with `undici@7.30.1`.
- **Dependency audit:** initial undici@7.16.0 added six high vulnerabilities; corrected to patched undici@7.30.1 before finalization. Patched Production audit still **2 high** (pre-existing body-parser/multer); full audit **2 critical / 10 high / 11 moderate / 3 low**. Security gate FAIL; no waiver.
- **Typecheck:** PASS. **ESLint:** PASS, 0 errors/1,128 warnings. **Full build:** PASS on patched dependency. **Backend test retry:** 1,318 PASS / 398 SKIPPED; first full `pnpm test` retry saw a transient SEO crawler 5s timeout (1 failure), isolated SEO 9/9 PASS, subsequent backend 1,318 PASS. **Frontend:** 1,397 PASS / 6 FAIL (SEO 3, login touch 1, registration 1, admin M2 1); therefore full test gate FAIL. **Bot:** 8/8 PASS after offline bot dependency install. **Contract:** 38 PASS; DB package 15 PASS/3 SKIPPED; no live DB integration was executed.
- **Isolated PostgreSQL 17.11:** network=none, no published ports, ephemeral container; transaction rollback preserved 100 and no UPDATE privilege for synthetic unprivileged app role. Container removed. This is a smoke test, **not** project migration parity/full app-role ACL/authenticated financial E2E.
- **GitHub Draft PR:** #1417; CI run #40275868751 Runtime **FAIL** on the same six frontend tests; Build Test Candidate #40275863753 not confirmed PASS at this checkpoint. Integration cautions posted to overlapping PRs #1368/#1392; issue #1369 and QA PR #1412 updated. Other branches/worktrees left intact.
- **Read-only live version check:** Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Candidate not installed. Official Test exact-SHA backend/API/DB/login/core-user-flow **BLOCKED**, authenticated finance E2E **BLOCKED**, GitOps release gate **BLOCKED**. **No merge or Production promotion.**
- **Server storage:** root ~96% used (4.0GiB free), data volume ~84% used (31GiB free). No other developer workspace/branch deletion. Core A/B/C/planning/QA automations read-only checked: all five enabled; no automation mutation.
- **Cleanup:** isolated PostgreSQL container removed; no Git branch/worktree deletion (unique unmerged changes remain). No shared service/database, feature switch or release modification.
