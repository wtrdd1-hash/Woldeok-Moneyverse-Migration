# B v641 — SWF unverified settlement containment

## Before work
- [x] Read AGENTS, README, bilingual project plan, QA v1373 and current PR/CI; start from fresh main.
- [x] Identify P0 manual SWF execution that reports success without canonical ledger receipts.
- [x] Preserve other workers and hold Production.

## In progress
- [x] Reproduce failing tests for manual rebalance and liquidation (RED).
- [x] Add fail-closed code at controller and service boundaries (GREEN).
- [x] Re-run focused HTTP/service regression, typecheck, lint and builds; remote CI unavailable without unsafe push.
- [x] Re-fetch main and plans at mid/end; main advanced to 608e0d44 (unrelated Telegram ops), rebase and exact-head retest required.

## Finished — PARTIAL / BLOCKED
- [x] P0 SWF manual execution fails closed at NestJS, service, Next BFF and visible admin controls.
- [x] Backend SWF focused 13 PASS; Frontend SWF focused 3 PASS; contract 41 PASS; database static 56 PASS / 4 SKIP; security policy 14 PASS; typecheck, backend build, Next build (607 pages), focused lint (0 errors), production dependency audit (0 vulnerabilities) PASS.
- [ ] Full gates: backend 2362 PASS / 230 FAIL / 493 SKIP; frontend final 2532 PASS / 59 FAIL; full lint failed; API contract drift; real PostgreSQL, authenticated E2E, official Test exact SHA and GitHub CI not certified.
- [ ] PR/merge/deploy: intentionally held locally due confirmed draft+hold merge incident #1891 and absent enforced admin protection/reviews. No Production/Test/DB/financial changes, no branch cleanup, schedules preserved.
- Release candidate is **not deployable**. QA PR #1896 touches the same Treasury Controller and needs conflict-aware integration after gate repair.


### In progress checkpoint 21:43 KST
- Existing four finance/SWF suites: 11 FAIL / 6 PASS on fresh main; 7 SWF-specific failures included HTTP 201 instead of 503.
- Added `swf-settlement-v641.test.ts`: RED 2/2 HTTP assertions (both endpoints returned 201).
- Applied minimal controller/service fail-closed change; pending GREEN verification.

### Cross-layer user-flow checkpoint 21:48 KST
- Frontend RED 3/3: rebalance BFF, liquidation BFF and admin disabled control all violated fail-closed contract.
- BFF mutations now return 503/no-store without forwarding; UI disables execution and removes unverified ledger-success copy. C is concurrently working on support forms, not SWF; no C worktree changed.
- Existing backend SWF focused suite GREEN 13/13, backend typecheck/build PASS; full backend 230 FAIL / 2362 PASS / 493 SKIP, full frontend 61 FAIL / 2530 PASS. Full lint 3 pre-existing errors in stale-tab-notice (QA #1894).

### Verification checkpoint 21:50 KST
- Backend SWF targeted 13/13 PASS; new NestJS HTTP 2/2 PASS, backend typecheck/build PASS.
- Frontend SWF targeted 3/3 PASS after RED 3/3, whole-workspace typecheck PASS, Next.js production build PASS (607 static pages), focused ESLint 0 errors (one inherited warning).
- Security advisory/policy 14/14 PASS, `pnpm audit --prod` PASS (0 vulnerabilities), contract package 41/41 PASS.
- `pnpm api:contract:check` FAIL due to unrelated `affinity` null/number schema drift; regenerated files restored to prevent unrelated contract edits.
- Whole Backend suite 2362 PASS / 230 FAIL / 493 SKIP; whole Frontend pre-final suite 2530 PASS / 61 FAIL; full ESLint 3 errors in `frontend/src/components/stale-tab-notice.tsx` (QA PR #1894), 1052 warnings.
- Official Test/Production SHA `c2129625aa6629c616fb31ce790950618b8d92b2`; source candidate not deployed. Main `7ba69348350cea054544dd4c17d782ed8dcf19fb` at mid-check.
- GitHub main protection has required status contexts but `enforce_admins=false`, no required PR reviews, no rulesets; recorded in incident #1891. Release remains HOLD; no PR/push while bypass unresolved.
