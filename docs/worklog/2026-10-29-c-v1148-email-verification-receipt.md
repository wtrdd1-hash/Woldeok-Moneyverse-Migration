# C v1148 — Verified email activation receipt and browser session

## Before work — 2026-10-29 07:51 KST
- Source: remote main `35971c600f25869c96f1c666d4b9f58927202730`, isolated `auto/hourly-c-verify-email-receipt-v1148-20261029-0745`.
- Read AGENTS.md, README.md, README/README.ko.md, canonical/KO PROJECT_PLAN and INTEGRATED_PLANNING_MASTER; latest planning Draft #1794, QA v1359, and 107 open Draft PRs. Reviewed A #1797, B #1796, C #1795/#1793 and QA findings; no overlap on first-party email activation receipt.
- Verified backend `LocalAuthController.verifyEmail` emits `{outcome:'signed-in',csrfToken,consentCurrent:true}` and one `sessionCookie`; frontend `completeEmailVerification` currently ignores payload and relays any cookies, then displays registration success on any 2xx. This is a source-level P1 false-success/identity-cookie-integrity gap, not evidence of a production incident.
- Plan: TDD malformed response/cookie rejection; require canonical backend receipt and exactly one secure session cookie before relay; preserve cross-browser activation, a11y, mobile, noindex; verify backend contract; run isolated tests, full gates and official Test where safe. Do not touch other worktrees, main, finance or shared DB.
- State: BEFORE / IN PROGRESS. Release HOLD pending all required gates and official exact-SHA Test.

## In progress
- TDD RED reproduced two false-success cases: contradictory 2xx payload and missing session cookie; helper import also failed before implementation. GREEN: focused frontend activation tests and NestJS controller receipt contract pass.
- Added exact backend receipt and browser cookie verification before relay, one-cookie-only boundary, unconfirmed/re-login UX; 320px-friendly controls and noindex unchanged. No DB/migration/financial changes.
- Preparing full HEAD gates and official Test evidence; no release promotion without independent validation.

## Finished
- Pending exact-SHA validation, PR and release decision.

### CI feedback — 07:55 KST
- Candidate run #40783286287 failed TypeScript due to Vitest `it.each` interpreting the array of invalid cookie sets as positional arguments. Fixed the test parameterization to pass each full cookie set as one tuple; focused tests and frontend typecheck re-run PASS. This is a test defect, not a production-code bypass. All required gates must be rerun on the new HEAD.

### Main movement and branch preservation — 08:04 KST
- Main advanced from `35971c6` to consolidated `c47a4f2`, then `f05efcb5`; fetched/rebased all three task commits with no overlapping changed paths or conflicts. Focused frontend 26, backend receipt 2 and frontend typecheck re-passed after rebase.
- Concurrent external GitHub cleanup **closed unmerged Draft PR #1798 and deleted its remote head at 08:00:53–54 KST** while our unique code was not in main. This run did not authorize that deletion. Local worktree preserved all commits. Republished the rebased work under a new independent `auto/hourly-c-verify-email-receipt-v1148-20261029-0805` branch rather than discarding the changes.
- Before rebase, 1,895 frontend tests, 155 backend auth unit tests (21 DB skips), lint (0 errors, 1,099 warnings), app-api 180 endpoints and security-floor 9 PASS. Security audit: 1 production Moderate; 12 overall (3 Low, 9 Moderate). Isolated real-PG and official Test exact-SHA pending fresh CI. No main/DB/Test/Production writes.
