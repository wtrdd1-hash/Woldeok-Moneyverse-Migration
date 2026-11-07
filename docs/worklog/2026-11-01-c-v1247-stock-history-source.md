# Development C v1247 — Owner stock-history source integrity (DRAFT / RELEASE HOLD)

## Start — 2026-11-01 05:15 KST
- Debian 13.6 miniPC: seven services active, development PostgreSQL connected. Base `origin/main` = `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean living project plans, active PRs/CI and A/B/QA worktrees. Existing PRs address owner business (#2257), stock league (#2250), stock comparison (#2245), member HTTP headers (#2225), and A/B shop/chat; avoid overlap.
- Isolated branch `auto/hourly-c-stock-history-source-v1247-20261101-0515` and worktree under `/srv/moneyverse-data/tasks/`; main checkout has an unrelated pre-existing `implementation_plan.md` edit, left untouched.

## Source finding and bounded design
- `frontend/src/app/stocks/history/page.tsx` checked the shape of trade rows only when a `minGross` query parameter was supplied. Default unfiltered API payloads reached BigInt aggregation directly; malformed/partial values crash SSR and unverified values can be presented as valid member trade history.
- Reuse the existing authenticated Nest `GET /api/v1/stocks/history?limit=50|100|200` and owner-scoped PostgreSQL `stock_my_trades` read function. Validate the entire bounded response for every request, without changing DB, session, or money writes. Distinguish verified empty from source unavailable, offer keyboard-accessible retry and noindex metadata. Preserve exact BigInt WLD and mobile layout.

## TDD and mid-run
- RED: 13 new tests failed before implementation, including actual `Cannot convert undefined to a BigInt` in SSR.
- GREEN: focused suite 37 PASS after validation and UI correction. Verified legitimate >2^53 WLD integer formatting; rejected duplicate IDs, invalid dates, bad side, invalid numbers and overlimit payloads.
- Mid-run `origin/main` still `f13bbce273ffc65e8576170992d82ea00c27a1c9`; English/Korean planning SHA256 captured separately.

## Release disposition
- Source change is read-only and fail-closed. Full exact-HEAD CI, independent PostgreSQL, authenticated official Test E2E, security, edge privacy, and production provenance gates must all pass before merge. Prior shared global `X-Robots-Tag` issue is tracked by Draft #2225; page metadata alone does not certify actual HTTP headers.
- No main, shared development DB, Test, Production, GitOps, other agent worktrees or core schedules are to be modified. Missing gates are BLOCKED, not PASS.

- **Android app-api parity:** The same default-unfiltered bypass existed in the mobile proxy. RED showed HTTP 200 for malformed `quantity=NaN`; GREEN verifies both filtered/unfiltered responses and returns HTTP 503 `stock_history_source_unverified` for invalid default payloads, while retaining verified-empty 200 and private no-store/noindex/no-referrer. Existing contract route is reused.
