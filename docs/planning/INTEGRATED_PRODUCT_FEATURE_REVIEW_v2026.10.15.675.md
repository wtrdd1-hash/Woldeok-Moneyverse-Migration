# Integrated Product and Feature Portfolio Re-review — v2026.10.15.675
## v2026.10.26.1292 — F675-130 Verified Member Notification Controls and Quiet Hours (Feature Addition / DRAFT / HOLD)
- **Cycle:** Previous Feature Improvement v1290 → Current Feature Addition v1292 → Next Feature Improvement v1294 (provisional). Main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 verified start/mid; AGENTS.md, README.md, canonical English plan and Korean parity checked; stacked on unmerged planning Draft #1349, isolated from A/B/C/Gemini/QA.
- **Verified gap:** /account/notifications saves only goal/NPC engagement preference. NotificationTabsBar renders six synthetic notification items (including fictional bank/security entries) and mutates read state only in browser. StockAlertPushEngine schedules simulated browser market-close notices from localStorage scenarios. Actual NestJS notification list uses owner filter but OFFSET and created_at-only order; live DB public.in_app_notifications has 10 columns. Source-level risks, not observed Production incidents.
- **New experience:** /account/notifications/preferences: explicit optional foreground browser alert categories, IANA timezone and optional quiet hours; actual owner in-app history with stable (created_at,id) keyset and server read receipts. SECURITY/SYSTEM always persist in-app; existing engagement toggle unchanged; no offline push/financial reward promises. Consent/session/CSRF, CAS+UUID idempotency, immutable receipt, SECDEF owner access, Android parity, no-store/noindex, WCAG AA, admin k>=20, notification_controls_v1 OFF. Full UX/API/schema/transactions/KPI/test/rollback in Integrated Planning Master.
- **P0:** ENV1292-01 root 99%/1.8GiB; SEC1292-02 dev app writable 239/241 and BOLA; REL1292-03 audits/frontend 6 failures/exact-SHA Test/migrations; NOT1292-04 remove fake notification/push claims. **P1:** NOT1292-05..10 schema, atomicity, keyset, web/Android, privacy/a11y, isolated real PG tests. Latest candidate PR #1350 1407 frontend PASS/6 FAIL; exact-SHA Test/restore not verified. Production BLOCKED.
- **Independent evidence gate:** W3C and OWASP sources considered candidates; newly deduplicated/classified accepted 0, cumulative accepted UNKNOWN / 10,000; BLOCKED / IN PROGRESS. Docs-only, no runtime/DB/WLD/ledger/Test/Production deployment.
- **Backlog IDs:** ENV1292-01 SEC1292-02 REL1292-03 NOT1292-04 NOT1292-05 NOT1292-06 NOT1292-07 NOT1292-08 NOT1292-09 NOT1292-10

- **GitHub planning review:** [Draft PR #1349](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1349) (stacked on unmerged #1345, docs only); [engineering issue #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

## v1290 / F675-129 — Verified member shop wishlist integrity (Improvement / DRAFT / HOLD)
- **Cycle:** Previous Addition v1288 → Current Improvement v1290 → Next Addition v1292 provisional. Remote main 1c5b84a1 unchanged at start/mid; unmerged planning Draft #1345, separate development #1344. Docs only, no A/B/C/Gemini/QA overlap.
- **Price:** migration 165 applies actor-specific, Seoul-date market_sale starter_tools discount (GREATEST(1,base_price*9/10)); public and member prices differ. Use member-effective BIGINT integer string at observation time, never cached/guaranteed. Seoul midnight and event changes require refresh.
- **Eligibility:** shop_catalog_list_v2 returns zero-stock items and does not check sale_ends_at; purchase separately checks stock/member/accounts/limits but does not visibly enforce sale_ends_at/progression. Wishlist cannot claim purchasable; no Buy CTA. Price×quantity BIGINT overflow is a test boundary.
- **Integrity:** inactive saved items removable; auth/consent before historical idempotent replay; append-only digest-bound receipts, 30 quota, owner→wishlist→catalog lock order, generation HMAC cursor and hard-purge handling. Owner API GET/POST/DELETE, Next.js/Android parity, no-store/noindex, admin k>=20, WCAG 2.2 AA, privacy merge/erase, verified KPI. Production flag OFF.
- **P0:** ENV1290-01 SEC1290-02 REL1290-03 SHP1290-04. **P1:** SHP1290-05 SHP1290-06 SHP1290-07 SHP1290-08 SHP1290-09 SHP1290-10. QA v1279 frontend 1397/6, audits FAIL, route-ledger CLI argument error; root 98%/2.0GiB, dev app writes 235/241, PUBLIC bank functions 0 unverified, migration 266 mismatch; exact-SHA Test/restore BLOCKED. Independent evidence 0 new, cumulative UNKNOWN/10,000 BLOCKED.
- **Backlog IDs:** ENV1290-01 SEC1290-02 REL1290-03 SHP1290-04 SHP1290-05 SHP1290-06 SHP1290-07 SHP1290-08 SHP1290-09 SHP1290-10

- **GitHub planning review:** [Draft PR #1345](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1345) (stacked on unmerged #1340, review-only); [development issue #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

## v1288 / F675-129 — Verified member shop wishlist (Addition / DRAFT / HOLD)
- Main `1c5b84a1` start/mid; previous Improvement v1286 → Addition v1288 → next Improvement v1290 provisional; unmerged planning Draft #1340 and separate engineering [#1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344). No overlap with A/B/C/Gemini/QA runtime changes.
- Source-verified: shop catalog UUID/code/BIGINT price and existing public/member catalog, holdings and purchase APIs; owner wishlist CRUD not identified. 30 active saves/member, server-confirmed receipts, live availability and exact integer-WLD strings, no price lock, reservation, auto purchase, rewards or fake settlement.
- Owner-only Next/Nest/Android CRUD, atomic 30-quota/UUID idempotency/revision CAS, DB SECDEF+least privilege, merge/erasure, signed keyset, admin k>=20, private SEO and WCAG AA. Full acceptance and rollback in integrated master.
- P0 ENV1288-01 SEC1288-02 REL1288-03 SHP1288-04; P1 SHP1288-05 SHP1288-06 SHP1288-07 SHP1288-08 SHP1288-09 SHP1288-10. QA v1278 raw 1397 pass/6 fail/test timeout/audits fail; root 98%, Production HOLD. External approved new 0, cumulative UNKNOWN/10,000 BLOCKED.
- **Backlog IDs:** ENV1288-01 SEC1288-02 REL1288-03 SHP1288-04 SHP1288-05 SHP1288-06 SHP1288-07 SHP1288-08 SHP1288-09 SHP1288-10


## v1286 / F675-128 — Marketplace search semantics and decimal integrity (Improvement / DRAFT / HOLD)
- **GitHub planning review:** [Draft PR #1340](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1340) (stacked on #1335, unmerged); [development handoff #1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334).
- Source-confirmed contract mismatches: NUMERIC(20,4) versus UI BigInt/Number sorting, unescaped ILIKE wildcard, seller-name placeholder not supported by SQL, unbounded query DTO, OFFSET and missing unique sort; these are risks, not observed incidents.
- Member-only saved searches retain 20-active limit and owner-bound receipt; filter v2 literal normalized keyword/category/max-price/allowlisted sort, exact decimal strings, server ACTIVE prefilter/keyset/HMAC revision cursor, 404 BOLA, merge/erase gate, Android/noindex/a11y. No fake listing, purchase or balance success. See integrated master.
- P0 ENV1286-01 SEC1286-02 REL1286-03 MKT1286-04; P1 MKT1286-05 MKT1286-06 MKT1286-07 MKT1286-08 MKT1286-09 MKT1286-10. QA v1276 FAILED/HOLD, v1277 raw failing evidence, root 98%/2.2GiB, release BLOCKED. External approved 0, cumulative UNKNOWN/10,000 BLOCKED. Engineering [#1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334).
- **Backlog IDs:** ENV1286-01 SEC1286-02 REL1286-03 MKT1286-04 MKT1286-05 MKT1286-06 MKT1286-07 MKT1286-08 MKT1286-09 MKT1286-10


## v1284 / F675-128 — Verified marketplace saved-search vault (Addition / DRAFT / HOLD)
- **Engineering handoff / 개발 인계:** [#1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334); planning-only and independent of runtime work.
- **Evidence:** existing `MarketplaceTabs` uses synthetic initial listings, browser-only purchase success and fallback WLD balance; real NestJS ACTIVE listings API has OFFSET and no unique sort; price NUMERIC(20,4). Saved-search CRUD absent from checked main. Do not certify synthetic marketplace results.
- **Member flow:** save/reopen/edit/delete validated fixed-price search (20/member); `/marketplace` → `/account/marketplace-searches`; owner-only DB and immutable idempotency receipt; signed live-results cursor, no automated alerts or settlement promises.
- **Delivery:** P0 ENV1284-01 SEC1284-02 REL1284-03 MKT1284-04; P1 MKT1284-05 MKT1284-06 MKT1284-07 MKT1284-08 MKT1284-09 MKT1284-10. Detail in integrated master; feature OFF, QA v1276 FAILED/HOLD, Production BLOCKED. New approved independent references 0, cumulative UNKNOWN/10,000.


## v1282 — F675-127 Status Race and Snapshot Truth (FEATURE IMPROVEMENT / HOLD)
- Previous Addition v1280 → Current Improvement v1282 → Next Addition v1284; main `1c5b84a1`, Draft #1324, engineering #1323. Migration 196 risks: idempotency unique-key race, unconditional reply status updates, timestamp regression, no-op admin audit. Queryable pool cannot guarantee repeatable-read export. Proposal: versioned idempotent status API; thread-locked event seq, atomic reply/status/audit, GREATEST timestamp, pinned read-only REPEATABLE READ, immutable owner-scoped snapshot across requests or honest non-certified fresh pages. 10k/2MiB/30s → 413; HMAC cursor/409, Android parity, privacy/SEO/a11y, rollback.
- P0 ENV1282-01 SEC1282-02 REL1282-03 SUP1282-04; P1 SUP1282-05 SUP1282-06 SUP1282-07 SUP1282-08 SUP1282-09 SUP1282-10. QA v1275 FAILED/HOLD, root 98%, audits/DB/migrations/Test gates unresolved. External new approved 0, cumulative UNKNOWN/10,000 BLOCKED. Docs only.
- **Backlog IDs:** ENV1282-01 SEC1282-02 REL1282-03 SUP1282-04 SUP1282-05 SUP1282-06 SUP1282-07 SUP1282-08 SUP1282-09 SUP1282-10


## v1280 — F675-127 Owner Support Transcript and Status Provenance (FEATURE ADDITION / HOLD)
- Previous Improvement v1278 → Current Addition v1280 → Next Improvement v1282; main `1c5b84a1` start/mid, predecessor Draft #1316, engineering [#1323](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1323).
- Actual `/support` member threads/messages are capped at 50/200 without keyset pagination; migration 196 has no member-readable old/new status timeline, and controller has no transcript export. Product: owner-only paged history and TXT snapshot with explicit `HISTORY_PARTIAL`, never backfill unverified status events. New Next `/support/transcripts/[threadId]`, NestJS/Android owner API, append-only DB status events, `REPEATABLE READ` export, 10,000 messages/2MiB/30s limit, HMAC cursors, digest and 404 owner isolation; admin k>=20, private noindex/no-store, WCAG 2.2 AA, 1%→10%→100% gated rollout/flag rollback.
- P0 ENV1280-01 SEC1280-02 REL1280-03 SUP1280-04; P1 SUP1280-05 SUP1280-06 SUP1280-07 SUP1280-08 SUP1280-09 SUP1280-10. QA v1273 FAILED/HOLD; QA #1317 local candidate passes do not authorize release. Root 98%, DB grants/migrations/official Test/restore unresolved. External newly approved 0, cumulative UNKNOWN/10,000 BLOCKED. Docs only, feature OFF, Production HOLD.
- **Backlog IDs:** ENV1280-01 SEC1280-02 REL1280-03 SUP1280-04 SUP1280-05 SUP1280-06 SUP1280-07 SUP1280-08 SUP1280-09 SUP1280-10


## v1278 — F675-126 Calculator Replay and Promotion Truth (FEATURE IMPROVEMENT / HOLD)
- Previous Addition v1276 → Current Improvement v1278 → Next Addition v1280; main `1c5b84a1` start/mid, predecessor Draft #1310, engineering [#1309](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1309).
- Source: compound/loan saved as `stock`, loan repaymentType omitted, formatted inputs cannot be safely replayed; title/ticker dedup loses distinct scenarios; failed watchlist promotion still marks success; retention promises unverified alerts/10,000 WLD. Require explicit calculatorId/formula/schema adapters, preview-only legacy import, receipt/read-back success and no WLD/stock/alert side effects.
- P0 ENV1278-01 SEC1278-02 REL1278-03 CAL1278-04; P1 CAL1278-05 CAL1278-06 CAL1278-07 CAL1278-08 CAL1278-09 CAL1278-10. QA v1273 FAILED/HOLD; root 98%, audits, ACL, migrations and exact-SHA Test/restore unresolved. External approved new 0, cumulative UNKNOWN/10,000 BLOCKED. Docs only, feature OFF, Production HOLD.
- **Backlog IDs:** ENV1278-01 SEC1278-02 REL1278-03 CAL1278-04 CAL1278-05 CAL1278-06 CAL1278-07 CAL1278-08 CAL1278-09 CAL1278-10


## v1276 — F675-126 Verified Calculator Scenario Vault (FEATURE ADDITION / HOLD)
- Previous Improvement v1274 → Current Addition v1276 → Next Improvement v1278. Main 1c5b84a1 verified start/mid, Draft #1304 unmerged; engineering [#1309](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1309).
- Actual CalculatorSaveAction localStorage-only drafts and nonexistent /api/portfolio/watchlist route do not establish permanent server saves; optimistic saved and 10,000 WLD/alerts promises are unsupported. New private scenario vault must require real owner/revision/digest receipt; safe opt-in local import, no stock/watchlist/WLD/ledger changes.
- Screens /tools and /account/calculator-scenarios, owner NestJS CRUD + Android, versioned allowlist/100 cap/8KiB, SECDEF PostgreSQL/CAS/immutable receipts, 401/403/404/409/422/429/503, privacy/noindex, admin k>=20, WCAG AA, verified-save KPI and rollback in integrated EN/KO master.
- P0 ENV1276-01 SEC1276-02 REL1276-03 CAL1276-04; P1 CAL1276-05 CAL1276-06 CAL1276-07 CAL1276-08 CAL1276-09 CAL1276-10. QA v1272 FAILED/HOLD, official CI failed, root 97%, migration266/280, DB ACL, exact-SHA Test/restore BLOCKED. Independent new approved 0, cumulative UNKNOWN/10,000 BLOCKED. Docs only.
- **Backlog IDs:** ENV1276-01 SEC1276-02 REL1276-03 CAL1276-04 CAL1276-05 CAL1276-06 CAL1276-07 CAL1276-08 CAL1276-09 CAL1276-10


## v2026.10.25.1274 — F675-125 Monthly Statement Precision and Closure Integrity (FEATURE IMPROVEMENT / DRAFT / HOLD)
- **Cycle:** Previous Addition v1272 → Current Improvement v1274 → Next Addition v1276 provisional. Main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 checked start/mid; AGENTS, README, EN canonical/KO comparison. Stacked on unmerged Draft #1296; engineering issue #1295. Planning only, no runtime/DB/Test/Production changes.
- **Verified correction:** Migration 194 and read-only development DB metadata confirm ledger_postings.amount and account_balances.available_amount are unbounded NUMERIC, **not BIGINT**. Supersede v1272 draft statement BIGINT columns with exact NUMERIC integer CHECK, decimal-string API/CSV, no JS Number coercion; repeated postings grouped by transaction/account; debit-credit sign matches wallet repository.
- **Closure:** transaction.created_at is the period key; corrections are new reversals (migration083), merge transfers are real postings (migration163). REPEATABLE READ/max timestamp alone cannot prove completeness against in-flight earlier-timestamp commits. VERIFIED requires all-writer source seal/commit-order watermark plus independent anchors, otherwise UNVERIFIABLE SOURCE_SEAL_UNAVAILABLE. Atomic complete immutable generation/HMAC/head, signed owner/session/generation cursor; merge source+target preflight and soft-delete privacy. No fabricated balances.
- **Backlog P0:** ENV1274-01 SEC1274-02 REL1274-03 WAL1274-04. **P1:** WAL1274-05 WAL1274-06 WAL1274-07 WAL1274-08 WAL1274-09 WAL1274-10. Detailed schema, screens/API/admin/SEO/Android/a11y/KPI/100 concurrent/100 foreign/10,001 synthetic/large-number and late-commit regressions in EN/KO integrated master.
- **QA:** latest completed v1271 FAILED/HOLD (frontend 5 failures, dependency Critical2/High10, dev app DML 235/241, PUBLIC bank EXECUTE 3, migration266/280, exact-SHA financial Test and restore missing). Root 95% used/~4.8GiB free at 17:08 KST. Feature OFF, RELEASE HOLD. External newly approved 0, cumulative UNKNOWN / 10,000 => BLOCKED/IN PROGRESS.
- **Backlog IDs:** ENV1274-01 SEC1274-02 REL1274-03 WAL1274-04 WAL1274-05 WAL1274-06 WAL1274-07 WAL1274-08 WAL1274-09 WAL1274-10


## v1272 — F675-125 Verified Monthly WLD Statements (ADDITION / HOLD)
- **GitHub:** [Draft PR #1296](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1296) OPEN/HOLD, [development issue #1295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1295) OPEN. Unmerged stacked documentation-only; runtime/DB/Test/Production untouched.
- Previous Improvement v1270; current Addition v1272; next Improvement v1274. Verified main 1c5b84a1, prior Draft #1289 unmerged, issue [#1295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1295).
- Real gap: wallet API and /wallet/activity cap at recent 50, client CSV exports only those 50; new owner-only closed-month statements require ledger-posting completeness, independently reconciled opening/closing per USER_CASH/USER_BANK and immutable generation receipts; no fabricated historic anchors. UI /wallet/statements and YYYY-MM, authenticated Nest + Android, private no-store/noindex, CSV formula safety, 320px/WCAG, admin aggregated-only. Full contract in EN/KO integrated master.
- P0 ENV1272-01 SEC1272-02 REL1272-03 WAL1272-04; P1 WAL1272-05 WAL1272-06 WAL1272-07 WAL1272-08 WAL1272-09 WAL1272-10. QA v1270 FAILED/HOLD and migration266/280/DB ACL/CI/Test/restore gates; no Production. New approved external references 0, cumulative UNKNOWN / 10,000 BLOCKED.

## v2026.10.25.1270 — F675-124 Board Mute Integrity Product Review (FEATURE IMPROVEMENT / DRAFT / HOLD)
- Draft PR [#1289](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1289) OPEN/HOLD; engineering issue [#1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280) updated; unmerged, no runtime/DB/Test/Production changes.
- Previous Addition v1268 / Current Improvement v1270 / Next Addition v1272 provisional; main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 verified start/mid; predecessor Draft #1281 unmerged, engineering issue #1280. No implementation.
- Product correction: never reuse top-50 public board or post-LIMIT stock filter for owner feed. SQL author and stock filters before LIMIT with signed owner/session/generation/filter cursor. Immutable source author identity, fail-closed account merge, explicit soft-delete/retention, durable HMAC original receipts, 200 cap, 12 writes/min and public SEO/DM/notifications unchanged. Admin k>=20, Android body CAS, WCAG AA. Full UX/API/DB/transaction/KPI/security/rollback in integrated master.
- P0 ENV1270-01 SEC1270-02 REL1270-03 BOARD1270-04; P1 BOARD1270-05 BOARD1270-06 BOARD1270-07 BOARD1270-08 BOARD1270-09 BOARD1270-10. QA v1269 FAILED/HOLD: 6 frontend failures, Critical2/High10, 235/241 app DML, 3 PUBLIC bank functions, migration266/280, exact-SHA Test and restore unverified; root 92% at start. Independent evidence newly approved 0, cumulative UNKNOWN/10,000 BLOCKED. Docs only.
- Full backlog IDs: ENV1270-01 SEC1270-02 REL1270-03 BOARD1270-04 BOARD1270-05 BOARD1270-06 BOARD1270-07 BOARD1270-08 BOARD1270-09 BOARD1270-10


## v2026.10.25.1268 — F675-124 Owner-only Board Author Mutes (FEATURE ADDITION / DRAFT / HOLD)
- Draft PR [#1281](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1281) OPEN/HOLD; engineering issue #1280 OPEN; main unmerged, runtime/Test/Production unchanged.
- Previous Improvement v1266 → Current Addition v1268 → Next Improvement v1270 provisional. Main eb27f5590e80bb71462e3888d052106a068e661a checked start/mid, canonical EN/KO plan reviewed. Development issue [#1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280); stacked after unmerged #1274, docs-only.
- Evidence: public board is 60s-cached/indexable and lists only 50 posts without authorUserId; post detail after migration259 has authorUserId. Reject client-side filtering and global block. Personal feed excludes muted authors in SQL before LIMIT; owner-only Hide/Unmute, no public SEO, moderation, DM, notifications or ledger effects.
- Proposed actor-checked SECDEF functions, 200 active mutes, owner+author tombstone/version, generation, HMAC replay receipts, cursor bound to owner/session/generation, consent/CSRF, Android parity, private no-store/noindex, admin k>=20 and WCAG2.2 AA. Full details in integrated EN/KO master.
- P0 ENV1268-01 SEC1268-02 REL1268-03 BOARD1268-04; P1 BOARD1268-05 BOARD1268-06 BOARD1268-07 BOARD1268-08 BOARD1268-09 BOARD1268-10. Acceptance: 100 concurrent requests, 100 foreign probes, 10,001 synthetic posts, no public cache leakage, exact-SHA Test + independent QA PASS before promotion.
- QA v1268 FAILED/HOLD; root now 89%/11G free but DB ACL 235/241 + PUBLIC 3, migration266/280, frontend six failures, Critical2/High10, finance and restore/Test gates BLOCKED. New approved external evidence 0, cumulative UNKNOWN/10,000 BLOCKED. Runtime/Test/Production unchanged.
- Full backlog IDs: ENV1268-01 SEC1268-02 REL1268-03 BOARD1268-04 BOARD1268-05 BOARD1268-06 BOARD1268-07 BOARD1268-08 BOARD1268-09 BOARD1268-10


## v2026.10.25.1266 — F675-123 Calendar Source/ICS Integrity (FEATURE IMPROVEMENT / DRAFT / HOLD)
- Draft PR [#1274](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1274) OPEN/HOLD; development issue [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267) updated; no main merge or runtime promotion.
- Previous Feature Addition v1264 → Current Feature Improvement v1266 → Next Feature Addition v1268 provisional. Main c9a868b1e622341e2daa8b936ddf0988eda9988e checked start/mid; main AGENTS/README and English canonical/Korean planning verified. Unmerged Draft #1268 and issue #1267; docs-only, no runtime implementation.
- Actual main: season event ends_at is parent season.end, admin event title/active has no monotonic revision; shop catalogue sale_ends_at differs from inventory availability window; calendar helper accepts elapsed parseable dates. New contract: server authoritative owner-scoped source resolver, season+event and catalogue+inventory revision, detect change→revert ABA, fail closed on changed/expired/disabled/sold-out/unavailable source; owner must confirm changed date.
- Export only a single transaction-consistent, reverified future-source ICS snapshot with opaque stable UID, UTC DTSTART/DTSTAMP, RFC5545 escaping/75-octet UTF-8 folds, no imaginary alerts/feed/cancellations, safe private no-store headers and explicit omission counts. Durable watch version/tombstone/HMAC replay; actor-first locks, 100-cap, Android JSON parity, privacy/admin k≥20/SEO/a11y/KPI, exact-SHA rollback.
- Backlog P0 ENV1266-01 SEC1266-02 REL1266-03 CAL1266-04; P1 CAL1266-05 CAL1266-06 CAL1266-07 CAL1266-08 CAL1266-09 CAL1266-10. Full executable API/DB/index/transaction/CTA/abuse/tests/rollout in [English integrated master](INTEGRATED_PLANNING_MASTER.md) and [Korean equivalent](INTEGRATED_PLANNING_MASTER.ko.md).
- QA v1267 FAILED/HOLD, root 100%/181MiB free, dev app DML 235/241 + 3 PUBLIC bank functions, migration266/280, frontend 6 failures, exact-SHA Test/restore BLOCKED. New approved independent evidence 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. No runtime, DB, WLD, ledger, Test, Production changes.

## v2026.10.25.1264 — F675-123 Verified Calendar Watchlist and Owner-only ICS Export (FEATURE ADDITION / DRAFT / HOLD)
- Previous Improvement v1262 → Current Addition v1264 → Next Improvement v1266 (provisional). Remote main `c9a868b1e622341e2daa8b936ddf0988eda9988e` checked start/mid; main AGENTS/README, English PROJECT_PLAN canonical/Korean parity reviewed. Stacked docs-only successor to unmerged #1261; development issue [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267). QA latest completed v1265 FAILED/HOLD; v1266 audit artifacts do not establish release PASS.
- Actual main `/calendar` shows season `event_id/ends_at`, shop `catalog_id/sale_ends_at`, derived weekly reset and today's personalized event; no owner watchlist/ICS was identified. F675-123 adds voluntary Watch/Unwatch and private list for verified future season/shop deadlines only, current-source revalidation, owner-scoped idempotent receipts, 100-cap, 12 writes/min, tombstone removal, and on-demand authenticated RFC5545 ICS **snapshot** (no permanent feed/reminders). Android JSON parity, no ledger/WLD changes.
- P0 ENV1264-01 SEC1264-02 REL1264-03 CAL1264-04; P1 CAL1264-05 CAL1264-06 CAL1264-07 CAL1264-08 CAL1264-09 CAL1264-10. Full purpose/permissions/UX/API/DB/indexes/transaction/admin/security/SEO/mobile/a11y/KPI/100-way/10,001-synthetic/rollback in [English integrated master](INTEGRATED_PLANNING_MASTER.md), [Korean parity](INTEGRATED_PLANNING_MASTER.ko.md).
- QA v1265 HOLD, root 100% (~349MiB), dev DML 235/241, PUBLIC bank EXECUTE 3, migration266/280, frontend 6 failures, v1266 audit Critical2/High10; exact-SHA Test/restore HOLD. RFC/OWASP/W3C reviewed as design sources, newly accepted 0 and cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. No runtime/DB/WLD/Test/Production changes.

## v2026.10.25.1262 — F675-122 Weekly Archive Atomic Publication/Completeness Hardening (FEATURE IMPROVEMENT / DRAFT / HOLD)
- Previous Addition v1260 → Current Improvement v1262 → Next Addition v1264 (provisional). Exact main `c9a868b1e622341e2daa8b936ddf0988eda9988e` rechecked start/mid; main AGENTS/README and English PROJECT_PLAN canonical/Korean parity reviewed. Stacked documentation-only successor to unmerged #1257; QA v1265 FAILED/HOLD.
- Code-backed: migration101 weekly goal function has lower-only `created_at` bound and mutable current-job ranking; no historical upper bound or trustworthy source completeness checkpoint. Proposed v1260 per-goal heads could expose mixed revisions; 24h grace alone cannot certify source completeness. Correct with immutable full-week generation + single atomic head, per-source contiguous checkpoints, no VERIFIED without evidence, HMAC provenance, generation-consistent owner API/Android signed cursors and 409 restart on snapshot change. Corrections append complete new week generations; no speculative backfill, NPC lifetime metric excluded, no WLD/ledger change.
- P0 ENV1262-01 SEC1262-02 REL1262-03 QUEST1262-04; P1 QUEST1262-05 QUEST1262-06 QUEST1262-07 QUEST1262-08 QUEST1262-09 QUEST1262-10. Detailed UX/API/DB/locks/admin/privacy/SEO/a11y/KPI/100-way/10,001-row/rollback contracts in [English integrated master](INTEGRATED_PLANNING_MASTER.md) and [Korean parity](INTEGRATED_PLANNING_MASTER.ko.md).
- QA v1265 root 100% (~368MiB), dev app DML 235/241, 3 PUBLIC bank functions, migration266 checksum/280 collision, PR #1255 frontend six failures; main CI runtime-check SKIPPED; exact-final-SHA Test/restore HOLD. External new accepted 0, cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. Planning only; no runtime/DB/WLD/Test/Production change.


## v2026.10.25.1260 — F675-122 Weekly Quest History Product Review (FEATURE ADDITION / HOLD)
- Current `/quests` uses migration101's current Seoul week only; no proven archive. Three week-window metrics are receipt/ledger based, whereas NPC affinity is lifetime/self-reported. Current job ranking changes, so recomputing historical job-task totals without provenance would fabricate past completion.
- New opt-in navigation to private `/quests/history` and detail; server-finalized immutable weekly goal evidence, explicit NOT_ARCHIVED/PENDING_FINALIZATION/VERIFIED/CORRECTED/UNVERIFIABLE, no reward or member write, no invented historic backfill. Frozen catalog version, 24h+source watermark, correction-only revisions, actor-only DB functions, signed cursor, Android/a11y, anonymized admin lag and private SEO. Full specification in [English integrated master](INTEGRATED_PLANNING_MASTER.md).
- P0 ENV1260-01 SEC1260-02 REL1260-03 QUEST1260-04; P1 QUEST1260-05 QUEST1260-06 QUEST1260-07 QUEST1260-08 QUEST1260-09 QUEST1260-10. QA v1264 FAILED/HOLD; root 100%, app DML 235/241, PUBLIC bank EXECUTE 3, migration266/280, exact-SHA Test/restore. Independent evidence new 0, cumulative UNKNOWN/10,000 BLOCKED. Docs-only, no runtime/finance change.


## v2026.10.25.1258 — F675-121 Board Follow Integrity Product Review (FEATURE IMPROVEMENT / HOLD)
- Code-grounded risk: comment-create's same-key replay only verifies author, not post/body; deletion ignores request key and route postId. This can produce misleading success and mismatched delete routes. No observed exploitation claimed. Proposed payload-bound receipt and 409, deterministic post lock, cross-post 404, unique new-only outbox and notification generation fence.
- User trust: only server-confirmed Follow/Unfollow; original comment receipt on retry; no phantom new-reply alert; after deletion retract or gate stale inbox source, without pretending prior reads never happened. Preserve existing C #1206 unmerged ownership; no WLD or ledger impact.
- P0 ENV1258-01 SEC1258-02 REL1258-03 BOARD1258-04; P1 BOARD1258-05 BOARD1258-06 BOARD1258-07 BOARD1258-08 BOARD1258-09 BOARD1258-10. QA v1261 HOLD, root 100%, frontend 6 failed, audits Critical2/High10 and bot Critical1/High5, ACL/migration266/280/Test/restore blocked. External accepted new 0, cumulative UNKNOWN/10,000. Draft only.


## v2026.10.25.1256 — F675-121 Board Reply Follow Product Review (FEATURE ADDITION / HOLD)
- Problem: the public board supports real posts and comments but has no confirmed opt-in thread follow with verified reply alerts on main. This is distinct from reading-list bookmarking, board drafts, revision history and C's unmerged verified notification inbox #1206.
- Value and trust: explicit Follow/Mute/Unfollow, private list, only newly committed and still-visible comments from other authors, no financial claim or reward. A 503 never becomes a success toast. Queue delivers once after generation and visibility checks; no stored private comment body or hidden title.
- Design: owner-only SECURITY DEFINER DB, 200 active subscriptions, per-post locked event_seq, CAS version/tombstone and HMAC receipts, Android JSON-body requestId/expectedVersion, 12 writes/min, admin anonymized health, noindex/no-store, WCAG 2.2 AA, queue/cursor/rollback. P0 ENV1256-01 SEC1256-02 REL1256-03 BOARD1256-04; P1 BOARD1256-05 BOARD1256-06 BOARD1256-07 BOARD1256-08 BOARD1256-09 BOARD1256-10. Full API/DB/UX/test contract in [English integrated master](INTEGRATED_PLANNING_MASTER.md).
- QA v1259 FAILED/HOLD: root 100%, app 235/241 DML, three PUBLIC bank EXECUTE, migration266/280, audit Critical2/High10, frontend six failures, exact-SHA Test and restore blocked. External approved new 0, cumulative UNKNOWN/10,000 BLOCKED. Documentation-only; no runtime/DB/WLD/Test/Production changes.


## v2026.10.25.1254 — F675-120 Wallet Annotation Lifecycle and Privacy Review (FEATURE IMPROVEMENT / HOLD)
- Product integrity: verified migration 163 account merge leaves historical owner postings under deleted p_merge while moving identities/sessions to p_keep. Annotations cannot be silently reassigned. P0 forward-only preflight blocks merges with source annotations/tombstones/receipts until an explicit audited portability policy exists. Do not claim a live incident.
- Member trust: Remove must clear category/note and caches, preserve only version tombstone; receipts contain no private text, HMAC request fingerprint replaces raw SHA256; 30-day receipt retention is proposed, pending privacy sign-off. No ledger/WLD modification.
- UX correctness: immutable created_at+transactionId keyset and owner/session/asOf cursor avoid update-driven skips/repeats; concurrent remove/re-add means stable order is not an exact snapshot. Preserve recent-50 CTA, saved-note list, owner-only 404, account-switch fencing, Android body requestId/expectedVersion, 320px/200%/TalkBack and private noindex/no-store.
- P0 ENV1254-01 SEC1254-02 REL1254-03 WAL1254-04; P1 WAL1254-05 WAL1254-06 WAL1254-07 WAL1254-08 WAL1254-09 WAL1254-10. QA v1257 FAILED/HOLD, root 100%, DB ACL, migration266/280, CI/security/official Test exact-SHA/restore gates unresolved. Details and future 100-way/10,001-item tests in EN/KO integrated master.
- External independent reference target 10,000: newly approved 0, cumulative verified UNKNOWN, gate BLOCKED/IN PROGRESS. Docs only; release HOLD.


## v2026.10.25.1252 — F675-120 Private Ledger Annotation Product Review (FEATURE ADDITION / HOLD)
- User problem: a wallet transaction may be hard to remember later, while the inspected `/wallet/activity` displays at most 50 recent owner transactions and its CSV only exports supplied recent rows. Avoid duplicating the existing transfer message, wallet dispute Draft #1048 or the authoritative ledger.
- Proposed value: an optional personal note and allowlisted category bound to a transaction proven by an owner cash/bank posting; `/wallet/activity` Save/Remove and `/wallet/annotations` list, immutable receipts, versioned tombstone, signed keyset pagination, Android parity, keyboard/320px/200% and private noindex/no-store. Personal labels are not official financial classification.
- Permissions/security: member-owned only; no admin content access, no public notes, no cross-member lookup; SECURITY DEFINER least privilege, no direct app table grants, 12 writes/min and 500 active note cap. No WLD/ledger mutation.
- P0 ENV1252-01 SEC1252-02 REL1252-03 WAL1252-04; P1 WAL1252-05 WAL1252-06 WAL1252-07 WAL1252-08 WAL1252-09 WAL1252-10. QA v1255 FAILED/HOLD; root 100%, migration266/280, app DB ACL, supply-chain, CI and exact-SHA Test/restore blockers. Full implementation-ready contracts in the English [Integrated Master](INTEGRATED_PLANNING_MASTER.md) and Korean equivalent.
- 10,000 independent external evidence gate: newly accepted 0, cumulative UNKNOWN; BLOCKED/IN PROGRESS. No runtime/DB/Test/Production changes.



## F675-06 detailed adoption — v2026.10.15.688

- [Google Search Evidence & Canonical Action Center](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md) / [한국어](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.ko.md) is the next v675 adopted **detailed planning** feature. Reuses /admin/seo and v685; identifies top-10-only GSC data, missing date=0, GSC PT/freshness, crawler-indexed mislabel and legacy index submission success/Google Indexing API misclaims. Separates source/submission/Google indexed-version/performance into independently verifiable evidence, 16 Google/WCAG references and D0–D7 gated implementation. Not a live SEO audit or deployed feature.


## F675-05 detailed adoption — v2026.10.15.686

- [First-session verified next-action design](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.md) / [한국어](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.ko.md) is the v675 F675-05 adopted detailed planning contract. Reuses existing guide, tracker and v76/v82 sequencing; identifies source-only fake WLD reward and failed-stock-order success paths and defines max-three server-available choices, user-controlled D1/D7 follow-up, safe 12 bilingual states, research hypotheses and D0–D7 release gates. **Documentation planning, not implemented or deployed.**


## F675-04 detailed adoption — v2026.10.15.681

- [Useful Public Calculator → Learning → Optional Fictional Game Spec](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.md) / [한국어](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.ko.md) is adopted as the detailed v675 F675-04 design. Existing /tools and glossary reused. Guest receives useful verified calculation before optional CTA; source truth of rewards, alerts, cloud saves and legally dated tax formulas; eight user hypotheses, 14 official references, D0–D7 gates. This is **PLANNING**, no deployed capability or GSC success claim.


## F675-03 deep-dive — v2026.10.15.680

- [WLD activity explanation & private receipts specification](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md) / [Korean](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md) is now the **adopted detailed planning contract** for F675-03. Builds on existing authenticated wallet/activity, does not authorize any new WLD movement. Exact cash/bank net-zero explanation, real ledger reference, bounded privacy-safe reads, 13 references and D0–D7 release gates. Not Production-verified.


## Detailed F675-02 review — v2026.10.15.679

- [F675-02 Trustworthy Fictional-Market AI News Spec](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.md) / [한국어](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md) is the adopted detailed follow-up. It reuses v325 newsroom, distinguishes AI model run vs published article vs authorized market event, and specifies actual last-published age, archive/corrections, seven user hypotheses, 13 research references and D0–D7 gates. No current Production incident closure or new implemented feature is claimed.


## Detailed F675-01 follow-up — v2026.10.15.677

- [Feature Reality, User Trust and Recovery Spec](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md) / [Korean](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md) is now the **adopted detailed planning contract for F675-01**. It is a design and research-hypothesis record, not runtime acceptance. Remaining F675-02..09 require their own one-by-one detailed review.
- Source-observed findings T677-01..06 include fake measured-health defaults and stale UI updates; remediation is subject to real-DB safety, current v530 full-route gates and exact-SHA Test. No code deployment from this adoption.


> Status: **PLANNING / AUTHORITY_DRIFT / release BLOCKED** (documentation decision and feature candidates, not implementation)
> Date: 2026-10-15 KST
> Parents: [Project Plan](PROJECT_PLAN.md) · [Integrated Planning Master](INTEGRATED_PLANNING_MASTER.md) · [Documentation Policy](../DOCUMENTATION_POLICY.md)
> Korean: [통합 기획 재검토](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md)
> Starting main: `f2bf939e53482721ee8bbf1074bd7ebf1922b13e`; mid-work and final SHA in worklog.
> **No override:** v530 UI BLOCKED gate, v523/542/543 economy safety authority, advertising-only v487, legal gates and current release policy remain in force.

## 1. Decision and evidence boundary

Moneyverse is a **persistent, non-cash-redeemable fictional social economy**, not a brokerage, real-world financial-news publisher or an ad-click game. Preserve the jobs → wallet → fictional markets → collections/businesses → community loop. Public educational tools and editorial content bring qualified visitors into voluntary, clearly disclosed game participation. Cash revenue remains eligible reviewed advertising only; speculative pricing, guaranteed-return wording and real-money game-value sales remain prohibited under current authority.

**Verified at review:** GitHub `origin/main` fetched; canonical governance, project/master, detailed design/security/SEO/AI/advertising documents reviewed; source shows tools, stock pages, blog/newspaper, admin SEO and API routes. Read-only miniPC status shows key daemons active and development DB connected. **Not verified:** every user-visible feature, authenticated admin E2E, exact-SHA isolated Test, financial role/ledger safety, currently deployed source identity, traffic/revenue outcome or Production promotion. This document is not a release approval.

Relevant recent observed evidence, not newly reproduced acceptance: [v638 functional audit](../worklog/2026-10-15-runtime-system-function-verification-v638.md) (145 anonymous GET probes, six 404, development DB privilege findings); [v651 web stability audit](../worklog/2026-10-15-web-full-code-stability-v651.md); [v652 release gate](../worklog/2026-10-15-production-promotion-gates-v652.md) (Test/backend SHA mismatch; HOLD); [v660 stock AI news audit](../worklog/2026-10-15-stock-ai-news-runtime-audit-v660.md) (model API/SSRF conflict, failed scheduled AI generation); and [v625 precision risk](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.md). Status claims are scoped to those checks.

## 2. Full-domain crosswalk — coverage is not acceptance

| Domain | Existing planning / source inventory | Open decision, gap or verification | Next gate |
|---|---|---|---|
| Identity, OAuth, session, locale | Auth and multilingual design, web/mobile | restart/rollout session continuity and manual locale fallback; do not force IP-based redirects | cross-browser authenticated continuity, locale/hreflang |
| Navigation, UI, admin | v530 responsive full-route plan, admin route templates | mobile clipping, all-admin states and real CTA→endpoint reachability still blocked | five complete exact-SHA route passes and accessibility matrix |
| WLD, wallet, ledger, transfers | canonical settlement functions, v523/542/543 and v625 | direct mutations, role-grant drift, precision and fiscal conservation P0 | real-DB least privilege, posting balance, idempotency and fault injection |
| Jobs, quests, progression | work loops, rewards, clock/limits | discoverability and correct reward/window wording; no artificial earnings | start→submit→verify→receipt E2E |
| Stocks, league, market events | fictional stocks/portfolio/candles/alerts + AI scenarios | stale AI-news job, ticker/ID error mapping, freshness confusion | deterministic market event and negative auth/404/503 contracts |
| Banking, bonds, pension, treasury | many finance/economic detailed specs | must move *existing* WLD; policy version, reserve semantics, funding | independently reconciled ledger + treasury tests |
| Business, shop, collection, auctions | existing UX/economy plans | inventory/settlement states, discovery, conflicting admin actions | complete purchase/auction ledger receipt and permissions |
| Community, boards, clubs, content | social/content/editorial plans | consent, moderation, generated-content attribution and publication controls | safety, author attribution and moderation E2E |
| News, blog and AI generation | v261/v325 AI newsroom, /newspaper and blog routes | generation failures, static fallback falsely implying fresh news | durable publish state and honest last-successful timestamps |
| Public tools, guides, learning | compound/tax tools, glossary, guides | scattered calculators and a weak result→second-action funnel | calculator correctness, source provenance, measured voluntary continuation |
| Search, localization and acquisition | v507 search ops, v527 keyword pool, GSC routes | indexing ≠ submission; content quality, canonical/hreflang, country switching | URL-level crawl/readiness and first-party GSC validation |
| Advertising and measurement | v487 ad-only, analytics governance | route exclusions, invalid-traffic protections, quality PV denominator | first-party measured Page RPM and consent compliance |
| API, security, data, infrastructure | API parity v397, ASVS, Postgres gates, release policy | privileged DB role drift and Test/Prod SHA uncertainty | ASVS mapped negatives, Test same-SHA + rollback/session evidence |
| Android/other clients | shared contract and mobile API plan | contract parity vs web, permission/deep links, signing | machine contract diff and real-device acceptance |

**Interpretation:** an existing page, controller, feature switch or historical test count is *presence evidence* only. For each requirement use `PLANNING → IMPLEMENTED → TEST_VERIFIED → PRODUCTION_VERIFIED` with exact source SHA, route/API/DB evidence, and owner. No blanket upgrade of status.

## 3. P0 before new growth releases

- **G675-01 ECONOMY/SECURITY P0:** close direct WLD mutation, wide app-role grants and exposed privileged DB function risks; reconcile balances/supply, use actor-scoped SECURITY DEFINER routines and strict DB-negative tests; never patch by broadening SELECT/UPDATE.
- **G675-02 RELEASE/UI P0:** resolve exact-SHA Test vs Production identity, source health, required authenticated all-route five-pass UI test, mobile overflow and session-preserving zero-downtime rollback evidence. Maintain HOLD while blocked.
- **G675-03 AI NEWS P0:** repair safely allowlisted trusted local model access without weakening generic SSRF protections; bounded queues, exponential retry and circuit breaker; disclose last successful generation and show stale/unavailable rather than fabricated live timestamps.
- **G675-04 FEATURE REALITY P0:** register every visible interactive CTA against route → BFF → Nest contract → DB/worker → auth/switch → test and error/empty/locked states; zero broken links and no UI-only success for backend actions.
- **G675-05 CONTENT/SEO P0:** prevent duplicated thin pages and inaccurate date/schema; publish only proof-backed content; no claim of indexing from sitemap/API submission.
- **G675-06 LEGAL/ADS P0:** keep eligibility, review and route ad exclusions; casino and monetization capabilities must not be certified by an enabled switch without separate law/policy evidence.

## 4. Proposed *incremental* feature backlog

The following enhance existing specs rather than silently replacing them. IDs are proposals; build work requires approved tickets, an independent branch and tests.

| ID / priority | Incremental capability (not a replacement) | Minimum technical/UX contract | KPI / acceptance |
|---|---|---|---|
| **F675-01 P0** | **Feature Reality Registry**: operator-visible canonical per-route feature status and broken-CTA map | generated route→UI action→BFF→backend→DB/worker→switch provenance, owners, error states; sensitive paths admin-only; diff exact SHA; integrate with v397/v530 | 100% published actions mapped, 0 false success, all failing routes tracked |
| **F675-02 P0** | **AI Market News Health & Corrections**: public trust status and admin reprocess queue | generation/publish/event separate states; source/model version and publish/expiry time; no fresh stamp for stale fallback; human override/audit; safe internal model endpoint isolation | no fictitious fresh status; visible successful-at age; failed jobs observable |
| **F675-03 P1** | **Wallet Activity Explanation**: “why did WLD change?” receipt drill-down | read-only, scoped SECURITY DEFINER queries; canonical integer string/BigInt; ledger trace per reward, order, transfer, correction; redact other users | sample receipts reconcile exactly; unauthorized lookup fails |
| **F675-04 P1** | **Public Calculator → Learning → Optional Game Journey**: unifies *existing* tools and glossary, no duplicate keyword URLs | versioned formula/source/jurisdiction/effective-date/assumptions, deterministic shareable presets, compare scenarios, educational caveat, consent-safe second action; in-game fictional figures visibly separate | tool accuracy fixtures; second-useful-action rate, opt-in account activation |
| **F675-05 P1** | **First-session Next-Action Guide**: actionable “earn→choose→progress” across already planned onboarding | only server-visible available actions; stop after three suggestions; locked/loading/error/finished states; no fabricated WLD or forced streak; A/B gate via experiments spec | verified first value, D1/D7, task completion, no higher 5xx |
| **F675-06 P1** | **Search Evidence & Canonical Action Center**: advances current admin SEO pages | query/page/country/device GSC samples, API quota/caching, canonical/hreflang/sitemap parity, submitted vs crawled vs indexed vs clicked statuses, actionable URL owners | zero test/admin indexed URLs, fewer canonical mismatches, qualified GSC clicks |
| **F675-07 P1** | **Explicit Language/Country Choice + Search-Compatible Locales** | browser preference may suggest locale; always keep manual selector and persistent choice; no IP-only forced redirect; only translated validated URLs in hreflang | all languages discoverable, consistent content/meta, no locale redirect loops |
| **F675-08 P2** | **Economy Transparency Timeline**: readable public policy/event changes with simulated-impact explainer | sourced policy/version, effective window, actual vs proposed vs simulated, no autonomous issuance or prediction claims; read-only aggregation | traceable published policy events, unchanged supply invariant |
| **F675-09 P2** | **Editorial Review Queue for AI Blog/News** | draft→fact/fiction review→publish→correct/retract with source rights and human editor byline, no misleading Google News claims, idempotent scheduler | 0 unapproved auto-published stories, all corrections durable |

### Adoption boundary

- **Adopt now:** prioritization, observable truth-state model, evidence and acceptance contracts in this document.
- **Not yet authorized:** database/schema work, production policy switches, new money movements, automatic publishing, real financial advice, payment channels, location fingerprinting or forced country redirects. Each feature needs a dedicated detailed spec and ownership confirmation before coding.
- All F675 proposals are **PLANNING**; exact dates, staffing and growth uplift are unknown.

## 5. Implementation slices and stop rules

**Release 0 / stabilization:** fix P0 ledger privilege/supply defects, API/UI status truth and runtime provenance, AI news pipeline, exact-SHA Test and all-admin QA first. Fail closed on incomplete proofs; do not launch dependent revenue/growth experiments.

**Release 1 / first utility:** F675-01 visibility layer and F675-02 freshness, then F675-03 ledger explanations and F675-04 calculators. Use per-feature golden-path, negative auth, stale-source, mobile/keyboard, and deterministic-test fixtures.

**Release 2 / acquisition and retention:** F675-05 onboarding, F675-06 Search Console truth center and F675-07 locale UX after actual route indexing/quality validation. Review traffic only with real GSC and consent-safe analytics.

**Release 3 / optional differentiation:** F675-08/F675-09 after core economic/legal and content-publishing gates pass.

Metrics by route + locale + device + cohort: clean 200 responses, real action completion, first-value, D1/D7/D30, search impressions→clicks→second action, measured ad Page RPM, indexable valid URLs, Core Web Vitals p75, ledger conservation and unauthorized action blocks. Baseline each metric **unknown until measured**; never invent improvement percentages. Block rollouts on P0 incidents, broken session continuity or supply drift; use precise feature rollback and immutable audit.

## 6. Primary references (read/rechecked 2026-10-15)

| Ref | Authoritative reference | Implication |
|---|---|---|
| R675-01 | [Google Search: people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | original demonstrable value, no scaled thin-content keyword factory |
| R675-02 | [Google Search: international/multilingual](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) | separate crawlable URLs, hreflang and manual language choice; not IP-only routing |
| R675-03 | [Google Search: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) | discovery aid, not guaranteed indexing |
| R675-04 | [Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | markup must reflect visible, current content; rich results not guaranteed |
| R675-05 | [Search Console API limits](https://developers.google.com/webmaster-tools/limits) | quota/caching/rate guards and no invented submission success |
| R675-06 | [Google web.dev Core Web Vitals](https://web.dev/articles/vitals) | field p75 mobile LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 |
| R675-07 | [W3C WCAG 2.2 changes](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | keyboard focus visibility and minimum touch targets |
| R675-08 | [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/master/5.0/en) | verifiable authz, security and boundary controls |
| R675-09 | [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) | session and reauthentication design based on assurance level |
| R675-10 | [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) | AI provenance, governance, risk and human review |
| R675-11 | [Google News transparency](https://support.google.com/news/publisher-center/answer/6204050) | dates, bylines, publication identity and corrected attribution |
| R675-12 | [PostgreSQL explicit/advisory locks](https://www.postgresql.org/docs/17/explicit-locking.html) | transaction vs session locking semantics; separate from monetary invariant |
| R675-13 | [Google Search Console data limits](https://support.google.com/webmasters/answer/12919192) | incomplete API extracts are not total-indexing truth |

References are product/security design inputs, **not** evidence of deployment, search ranking, AdSense approval, external-data rights, or Korean legal compliance. Recheck at feature implementation time.

## 7. Handoff and documentation QA

For each accepted F675 item: (1) existing-feature duplicate check; (2) one owner and canonical spec; (3) route/API/DB read/write matrix; (4) permissions and failure UX; (5) exact BigInt/fiscal invariants where relevant; (6) EN/KO + public locale readiness; (7) deterministic tests and isolated Test E2E; (8) security/privacy/SEO/ads review; (9) source SHA, no-downtime deployment, session sampling, rollback; (10) evidence-linked status update.

Documentation-only change; **no source code, Test or Production promotion performed by v675**. See [worklog](../worklog/2026-10-15-integrated-planning-review-v675.md) and the internal/GitHub update notes.
