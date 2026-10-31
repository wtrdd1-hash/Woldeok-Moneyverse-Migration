# Development C v1226 — member bank liquidity evidence (RELEASE HOLD)

## Before work — 2026-10-31 16:12 KST
- MiniPC Debian 13.6 connected; seven primary services active; development PostgreSQL connected. Shared Production/Test not changed.
- Canonical source: origin/main (exact SHA recorded in evidence); AGENTS.md, README.md, README/README.ko.md, canonical English/Korean project plans reviewed. QA v1415, active A/B/C/planning/admin PRs and CI inspected.
- Source finding: `bank-liquidity-card.tsx` fabricates 35% utilization from a member credit limit, then labels model outputs as live bank-wide liquidity, statutory reserves, guaranteed withdrawals and applied interest. The member `/api/v1/banking/standing` is actor-scoped through `bank_get_my_standing`, and has no aggregate reserve authority. This is a P0 truth defect.
- Scope: replace the fabricated model card with verified member-only bank/loan/credit-limit evidence; no new SQL, privileges, money writes, or aggregate liquidity claims. Reuse authenticated bank standing. Accessible mobile presentation and regression tests.
- [x] Read authority and collision inventory.
- [x] Implement actual source-backed view and runtime validation.
- [ ] Focused, full and real PostgreSQL/CI/exact-SHA Test evidence.
- [ ] Re-fetch main and plan; integrate only if every mandatory release gate passes.

## In progress
Pending.

## Finished
Pending; release HOLD until independently verified.

### Implementation checkpoint — 2026-10-31
- Replaced fabricated 35% bank-wide utilization and statutory reserve claims with actor-scoped standing amounts and exact BigInt debt-to-credit-limit ratio. Zero-limit and invalid upstream evidence are explicit unavailable states.
- No direct SQL/table grants, new money mutations or false loan terms. Member-only route remains dynamic/noindex; responsive 320px cards, accessible headings/status and semantic values.
- Added focused regressions for 78-digit WLD, malformed inputs, zero credit, over-limit, HTML disclosure and no fake safety labels.

### Mid-run verification — 2026-10-31 16:21 KST
- Focused frontend: 5/5 PASS; focused lint: 0 errors; workspace typecheck: PASS; full ESLint: 0 errors / 1,047 existing warnings.
- First root test run: FAIL/ENVIRONMENT due to EAGAIN fork exhaustion (shared host over 600 processes with concurrent QA/Test canaries); not a source PASS. Serial full tests, build, security audit, app-api, independent PostgreSQL, official exact-SHA Test and CI remain unverified.
- Mid-run origin/main re-fetch: unchanged 1a3625f3c5e426c857e2b44a412d7949ac4a6257; canonical English/Korean plans unchanged.
- GitHub issue #2168 opened. No shared services, DB, main, Test, Production or other workers modified.