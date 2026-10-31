# B v670 — Pocket customization idempotency and replay safety

## Before work — 2026-10-31 01:09 KST
- Main: `bf8d0d48f810932b43783d8605dce53954c60cff`; isolated branch `auto/hourly-b-v670-pocket-customize-idempotency-20261031-0135`.
- Verified Debian 13.6 miniPC, 82% data disk; reviewed AGENTS, README, EN/KO planning, QA v1400, other A/C/B/planning PRs and CI.
- Found `PocketController.customizePocket` passes constant `00000000-0000-0000-0000-000000000000` to `bank_customize_pocket`; UI action has no caller key, despite potentially WLD-charging operation. No assertion of actual Production double charge.
- The database function's clean-schema availability is unverified (#2000), and Production provenance #1984 remains blocked. No shared DB or service mutation.

## In progress
- Plan: TDD at Nest DTO/controller and Next action/dialog; preserve UUID across ambiguous retry, rotate for a changed intent.
- Status: tests not yet run; no release approval.

## In-progress verification — 2026-10-31 01:10–01:21 KST
- RED: Nest DTO 1 + controller 1, Next action 2 and UI 1 failures for missing/constant request key; GREEN: 10 Backend focused (including HTTP 2) and 8 Frontend focused PASS.
- Changed-file ESLint 0 errors/0 warnings; typecheck PASS; backend and frontend builds PASS; mobile API contract 184 endpoints PASS; database static 62 PASS/4 SKIP; security/release tests 134 PASS.
- Full lint FAIL: existing parser error `frontend/src/app/api/shop/purchases/route.search.test.ts:99`, 1,044 warnings. Full Backend 2,657 PASS/126 FAIL/501 SKIP. Full Frontend 2,705 PASS/55 FAIL. All fail the required release gates.
- Isolated PostgreSQL 17.11 applied init 001 + 311 repository migrations through 312; **`public.bank_customize_pocket(uuid,uuid,uuid,text,text)` and `public.bank_saving_pockets` both MISSING** in clean schema. Container removed. Therefore successful paid customization E2E is NOT proven, and the endpoint is blocked on a missing clean-schema DB contract (#2000).
- READ ONLY DEV PostgreSQL confirms the function exists in DEV and calls `economy_post_transaction(p_key,...)`, then updates pocket style; it does not itself compare an existing key to the new theme/icon. Existing DEV function charges a fixed 100 WLD while current UI estimates up to 400 WLD. This is **not** proof of a Production charge, and an independent SQL idempotency/fingerprint and pricing fix is required before release. No shared DB mutation.
- Main and EN/KO plan re-fetched mid-run, unchanged `bf8d0d48f810932b43783d8605dce53954c60cff`. Other A/C/QA work protected.

## API/DB contract
- `PUT /api/v1/banking/pockets/:id`: body now requires a caller UUIDv4 `idempotencyKey` in addition to optional `themeColor` and `iconCode`. Missing/nil/non-v4 -> HTTP 400 before repository call; valid key forwarded unchanged with authenticated actor and pocket. Next server action does not regenerate the key. Browser rotates on a new pocket/open/selected intent, retains on unchanged retry.
- DB schema and existing applied migrations unchanged. **No guarantee of replay safety against malicious same-key/different-payload reuse until DB ledger binding is proven.**

## Finished
- Candidate only; code implemented and focused tests green. Release gates and bank pocket clean-schema SQL remain BLOCKED. Final SHA/PR and remote CI to be recorded in GitHub. No main merge, Test or Production deployment.
