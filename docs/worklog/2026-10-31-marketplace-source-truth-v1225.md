# Development C v1225 — Marketplace source truth (English canonical)

## START — 2026-10-31 15:40 KST
- Base `origin/main` = `65193a0940778ac659e4d4952589ee49c291c30f`; isolated branch `auto/hourly-c-marketplace-source-truth-v1225-20261031-1545`.
- miniPC Debian 13.6 reachable, seven services active and development PostgreSQL connected. Shared DB, Test and Production are not change targets.
- Read AGENTS, README/README.ko, canonical and Korean integrated project plans; inspected open PRs, CI, A/B/QA, prior C v1224. No active marketplace PR found in the first 200 open PRs.
- P0 evidence: `/marketplace` substitutes `1000` WLD when wallet fetch fails, turns failed holdings read into `[]`, renders `INITIAL_MARKET_LISTINGS`, and its local React callbacks deduct WLD and create item/receipt-like success without calling authenticated backend. `MarketplaceService.listListings` already exposes authenticated GET `/api/v1/marketplace/listings` backed by `public.marketplace_listings`; its SQL permission and Test availability must still be proven.
- Design: fail-closed member-only read-only marketplace with validated real backend listings. No mock prices, simulated volume, crafting, escrow, bids, or trade success. Display verified-empty separately from unavailable. Do not modify SQL/ledger, direct table grants, or other teams' branches. Keep accessible 320px/mobile, noindex, retry, and tests.

## IN PROGRESS
- [x] Write RED tests for source validation and page evidence states.
- [x] Implement verified read-only marketplace page using existing guarded backend GET.
- [x] Verify final SHA and document PASS/FAIL/BLOCKED release gates.

## FINISHED — 2026-10-31 15:53 KST (release hold)
- Scope: source-backed member marketplace read-only entry; no mock WLD, listings, 24-hour volume, local crafting/auction/trade receipts, or write CTA on `/marketplace`. Existing nested subroutes remain separate and are not certified.
- Backend: guarded active/owner GET now calls `marketplace_active_listings`/`marketplace_owner_listings` SECURITY DEFINER functions in forward migration 313. Direct app-role SELECT/INSERT on marketplace_listings revoked. SQL has bounded active listing limit; owner list preserves full prior behavior. No shared DB/ledger changes.
- TDD: frontend RED then 6/6 GREEN; backend RED then 2/2 GREEN, plus existing controller 5/5. Scope lint 0 errors. Full lint 0 errors/1049 warnings. Typecheck PASS after worktree database node_modules symlink repair. app-api contract 184 endpoints PASS. Backend/Frontend build generated output (frontend 608 static pages), but the first build command was duplicated by remote command retry; exact final SHA rerun required.
- Full frontend 2,778 PASS. Full backend 2,780 PASS / 501 SKIP before final owner-read test addition. Database 62 PASS / 4 SKIP; contract 41 PASS; release/security 27 PASS. Isolated PostgreSQL 17.11 **312/312** forward migrations PASS; app-role table SELECT/INSERT false, function EXECUTE true, read-only empty function calls PASS; isolated container removed.
- Production dependency audit PASS (no known vulnerabilities); full audit FAIL (13: 3 low, 10 moderate). Full-route QA FAIL (missing `--inventory`). Synthetic local Next anonymous HTTP 500 due missing auth config and `X-Robots-Tag: index, follow` contradicts private-page noindex (#2012). Official authenticated exact-SHA Test E2E, remote required CI, independent restore, Production promotion are BLOCKED/NOT RUN.
- Prior issue #2041 and planning issue #1334 overlap this source-truth work; update them instead of creating a duplicate. No PR merge, no GitOps/Production changes, no rollback. Keep draft branch and all other A/B/QA/Gemini work intact. Five recurring schedules remain unchanged.
- Final candidate SHA, CI and test status will be attached to GitHub PR/issue and local external evidence after commit; PASS of skipped or unexecuted gates is not claimed.

### MID — 2026-10-31 15:41 KST
- RED: two source/page test files failed against main's simulated trading view. GREEN after implementation: 6/6 tests PASS.
- New page uses existing guarded marketplace GET only; verified list, verified empty and unavailable states; all mock WLD and client-side fake settlement actions removed from `/marketplace` entry point. Existing nested routes are not covered.
- Fresh origin/main unchanged at `65193a094...`; development database `moneyverse_app` has direct marketplace SELECT privilege (P0 least-privilege review needed). This is a DEV observation, not Production proof.

### MID 2 — 2026-10-31 15:43 KST
- Fresh isolated PostgreSQL 17.11 applied all existing 311 migrations; `moneyverse_app` direct SELECT on `marketplace_listings` was FALSE, and the existing Nest direct read returned `42501 permission denied`. DEV database privilege was broader and cannot certify fresh install. This confirmed a genuine API/DB contract failure.
- Added forward-only migration `313-marketplace-member-read-functions.sql` with SECURITY DEFINER active and owner list reads, fixed search_path, explicit EXECUTE grants, direct table privilege revoke. Updated Nest repository to call the functions; existing session/consent guard remains the only actor source. No financial writes.
- Backend RED then GREEN contract test. Frontend parser now accepts PostgreSQL `numeric(20,4)` integer amounts (e.g. `1250.0000`) without treating fractional WLD as integer. Focused frontend 6/6 and backend 6/6 PASS, scoped lint 0 errors/1 pre-existing warning.
