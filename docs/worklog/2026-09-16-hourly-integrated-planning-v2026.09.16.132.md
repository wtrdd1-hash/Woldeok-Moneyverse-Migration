# v2026.09.16.132 — Integrated planning evidence delta

## Evidence snapshot
- Start/mid-run main: `84603dd330e0d00e927fe810597bca9a201ff151` (`feat(stocks): combine search and sorting v2026.09.16.1 (#348)`).
- Branch protection remains enabled while required-status-check enforcement is `off` with no required contexts/checks. `REL-104-03` therefore remains P1/CONFIRMED and runtime merges must not treat branch protection alone as a CI gate.
- Exact-main-SHA `Build Test Candidate #590` completed successfully. Verify/check passed lint, typecheck, build, migrations, tests, secret/control-byte checks, Prisma mutation rejection and dependency audit; immutable backend/frontend candidate images were built and pushed.
- This is Test Candidate evidence only. No same-SHA Production release, Production runtime, Production smoke, backup/restore or rollback evidence was observed in this run, so Production remains `UNVERIFIED`.

## External references checked
- Google Search Central updates (last updated 2026-09-08): structured-data capabilities change over time; only currently supported types belong in the serializer allowlist. Google structured-data guidance requires crawlable/indexable pages and recommends Rich Results Test → limited deployment → URL Inspection → sitemap.
- OWASP API Security Top 10 2023 remains the current API project release; relevant controls for stock trading/search include BOLA, Broken Authentication, Unrestricted Resource Consumption, Broken Function Level Authorization, sensitive-business-flow abuse and unsafe upstream consumption.
- OWASP ASVS 5.0.0 remains the application-security verification baseline.
- Google Play 2026 fee policy varies by install cohort, transaction type, program and billing path; stock engagement is not real-currency revenue and paid SKU economics must not use one fixed platform-fee constant.

## STOCK-132-01 — P1 — IMPLEMENTED/PARTIAL — composable stock discovery
### User/UX contract
`/stocks?q=<query>&sort=<default|change|price|available|name>` is bookmarkable/shareable view state. Search preserves non-default sort; sort preserves normalized query; clear removes only `q`. Invalid sort falls back to API/default order. Query is capped at 80 characters. Empty result distinguishes “no match” from “no tradable stocks”; API failure remains an error state. Search result count uses `role=status`/`aria-live=polite`; sort navigation exposes `aria-current`.

Mobile uses wrapping controls and >=44px-equivalent touch height; tablet/desktop retain the same URL contract. KO/EN labels must remain semantically equivalent. Offline cannot trade and must not fabricate fresh quotes; cached read-only discovery, if later added, must be visibly stale and trading CTA disabled until authoritative refresh.

### Data/API/backend/DB
This change is presentation/discovery only: existing `/api/v1/stocks`, `/portfolio`, `/history`, `/sparklines`, `/market-events`, `/watchlist` remain authoritative. Search/sort must not mutate ledger, holdings, prices, authorization or DB schema. Price, availability and mover comparison use integer-string/BigInt-safe arithmetic; percentage movers use exact cross multiplication rather than floating point. Deterministic symbol tie-break prevents unstable ordering.

Future server-side pagination/search MUST define normalized `q`, sort enum, stable secondary key, maximum page size, rate limit and snapshot/cursor semantics so concurrent ticker updates cannot duplicate/omit rows unpredictably. Client and server must share conformance vectors before migration.

### Security/abuse/privacy
Search is read-only but still bounded. Reject/normalize oversized query values, never interpolate query/sort into SQL, logs or HTML without parameterization/encoding, and rate-limit abusive discovery traffic if server-side search is introduced. Trading remains independently authorized and idempotent; discovery parameters never influence price authority, quantity, ownership or execution order. Analytics may record normalized sort and query-present/query-length buckets; raw search text is not required for KPI and should not be logged by default.

### Analytics/business
Events: `stock_discovery_view`, `stock_search_submit`, `stock_sort_change`, `stock_result_open`, `stock_trade_open`, `stock_trade_success`. Dimensions: locale, sort, query_present, result_count_bucket, device class; never treat WLD turnover as cash revenue. KPI hypothesis: discovery→detail CTR, discovery→trade-open, successful virtual trades/session, D1/D7/D30 stock-user retention, support incidents, render latency. SCALE only if engagement/retention improves without higher trade-error/abuse/support rates; ITERATE if discovery use rises but trade success/retention does not; KILL/revert if ordering creates material latency, incorrect large-value ordering or misleading market behavior.

### Performance/cache
Current page performs six API reads concurrently and is `force-dynamic`/`revalidate=0`. Search/sort are in-memory over returned market rows. Track server render p50/p95, API fan-out latency and stock count. If catalogue growth makes in-memory sorting expensive, move discovery to an indexed server read model without changing trade authority. Never cache authenticated portfolio/watchlist/history across users.

### QA acceptance
Unit: each sort, equal-value symbol tie-break, invalid/missing sort, BigInt boundaries, zero/non-positive open price, query normalization, KO/EN name behavior. Integration/E2E: search→sort preserves q; sort→search preserves sort; clear preserves sort; direct bookmarked URL; back/forward navigation; empty/error; keyboard/focus/screen reader; mobile wrapping; concurrent quote updates do not alter submitted trade authority. Security: encoded HTML/script query, oversized query, repeated requests, unauthorized API reads, BOLA negatives. Promotion requires exact-main-SHA Test runtime plus changed-flow QA; Production requires same release evidence chain and smoke.

## SEO-132-01 — HIGH — REDESIGN_REQUIRED — authenticated `/stocks` advertises `index: true`
### Evidence/problem
`frontend/src/app/stocks/page.tsx` exports SEO title/description and `robots: { index: true, follow: true }`, but the page immediately executes `requireMember()`. A crawler without a member session therefore cannot reliably access the content that metadata claims should be indexed. This creates an SEO/auth contract contradiction and risks login redirects, inaccessible/thin indexing, duplicate query URLs and misleading search snippets.

### Decision
Choose one explicit model; do not mix them:
1. **Preferred near-term:** authenticated `/stocks` is private product UI: `noindex,nofollow`, excluded from sitemap/structured data/canonical discovery. `q` and `sort` URLs are never indexed.
2. **Future acquisition option:** create a separate public read-only route (for example `/market/stocks`) backed only by a public SEO read-model with delayed/non-personalized game-market data, explicit “virtual/game-only, not real investment” copy, server-rendered crawlable HTML, canonical to the base public market URL, and no holdings/watchlist/history/trade controls. Filter/query permutations remain noindex or canonicalized to approved landing pages.

Do not expose authenticated portfolio, trade history, watchlist, account identifiers or personalized balances to crawler-facing responses. Public structured data is added only when a currently supported Google type accurately represents visible content; no financial-product/investment implication.

### SEO backend
Add route-level `SeoPolicy` (`PUBLIC_INDEXABLE | PUBLIC_NOINDEX | PRIVATE_NOINDEX`) consumed by metadata, robots, sitemap and structured-data serializer so policy cannot drift. Sitemap generator accepts only `PUBLIC_INDEXABLE`; canonical generator strips non-content tracking parameters and rejects private routes; redirect map preserves permanent public slugs; `updatedAt/lastModified` changes only for material public content changes. Search Console/Naver ingestion records crawl/index errors by route policy and alerts on `PRIVATE_NOINDEX` URLs appearing in sitemap/index reports.

### QA/gate
Anonymous crawler request to `/stocks` must never produce an indexable authenticated shell. Test HTML/meta, response/redirect chain, robots, sitemap absence, canonical behavior for `?q`/`?sort`, no personalized cache leakage and KO/EN parity. If a public market route is introduced, test SSR without JS, Rich Results Test only for applicable schema, URL Inspection, CWV, crawler resource access and noindex/canonical parameter matrix. SEO-132-01 is a Production gate for any release claiming stock SEO acquisition.

## Revenue/cost impact
Stock search/sort is an indirect retention feature, not direct revenue. Measure incremental retention/activation and infrastructure/support cost. Any future paid stock cosmetic/subscription feature must keep virtual-market fairness, disclose non-investment status and model Google Play fees by market × install cohort × recurring/non-recurring × program × billing path. Security/SEO fixes are evaluated as avoided trust, support, incident and acquisition-waste cost.

## Priority/order
`P0 release truth/backup/auth/economy integrity` → `SEO-132-01 HIGH stock indexability contradiction` → `STOCK-132-01 regression/performance completion` → monetization/growth experiments. No runtime deployment was performed by this planning run.

## Canonical-plan integration status
PR #348 already appended the basic v2026.09.16.1 stock-discovery delta to both `PROJECT_PLAN.md` and `PROJECT_PLAN.ko.md`, but their headers still declare integrated version `v2026.09.15.110`. This run cannot safely replace either large canonical file because the available writer requires complete-file replacement while full reads are truncated. `DOC-117-01` remains `BLOCKED_BY_SAFE_WRITE_CAPABILITY`; do not claim v132 canonical synchronization until a lossless patch/complete-read path is available.