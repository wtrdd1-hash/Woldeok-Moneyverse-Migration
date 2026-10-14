# Maintenance announcement publication — v2026.10.14.620

Status: **PRODUCTION_VERIFIED (public content only)**. Date: 2026-10-14 (KST).

## Authority and start checkpoint
- Original request: publish a public advisory that service may be unstable during updates.
- Read `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, and existing content API/code.
- `origin/main` at start: `c56af867ad8f7556e53f895b0bb294c4bfc8a02d`.
- Dedicated isolated branch: `docs/maintenance-notice-v2026.10.14.620`.
- No changes to product-plan authority, source, schema, release artifacts, feature switches, or real economy balances.

## Execution
1. **Preflight** — MCP service status: backend, frontend, Nginx active; read-only query of connected `woldeok_moneyverse_dev` showed zero notices and five active operators; local Nginx `/announcements` showed the empty state.
2. **Safe mutation** — Called the existing `content_save_announcement` SECURITY DEFINER function as an active unlinked service/operator identity. Receipt: `a4d1dbfd-b692-4d25-a96d-5423cf5ae0aa`, replayed=false; draft first.
3. **Explicit publication** — Called `content_set_announcement_publication` with an independent idempotency key; published at `2026-10-14T06:10:01.839Z` (15:10 KST), replayed=false. Both function paths require operator role and write command audit receipts.
4. **Middle checkpoint** — Read back exact row: `content_state=published`, `published_at IS NOT NULL`. Initial web check briefly missed cached listing; subsequent local Nginx `/announcements` and detail page both rendered the new title, detail HTTP 200. Backend, frontend, Nginx remained active.
5. **Final checkpoint** — Re-fetch `origin/main` and ensure this branch only contains documentation before push/PR. Capture external public HTTPS check if available.

## Published content
- Title: **[서비스 안내] 업데이트 작업에 따른 일시적 서비스 불안정 안내**
- URL: https://easy-scraping.com/announcements/a4d1dbfd-b692-4d25-a96d-5423cf5ae0aa
- Advises of possible slower page loads, temporary errors, and feature instability during improvements, with apology and ongoing monitoring.
- Existing announcements product used; no UI code deployed. No Test/Production binary promotion occurred.
- Rollback, if needed: authenticated publication command to change this exact notice to draft; **not performed**.

## Evidence boundary
Only the published editorial notice and its rendering were verified. This does not certify unrelated site stability, every route, exact-SHA acceptance tests, or a runtime promotion.

Final external check: public HTTPS detail returned HTTP 200 and rendered the new notice title. Mid-work origin/main remained c56af867ad8f7556e53f895b0bb294c4bfc8a02d.

Final source checkpoint: origin/main advanced mid-work from c56af867 to 77e27063 (independent disk-cleanup docs, #826); checked paths, no overlap; branch rebased before PR.
