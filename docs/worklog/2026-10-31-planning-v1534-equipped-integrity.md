# Planning v1534 internal update

## v2026.10.31.1534 — F675-189 Equipped Expiry Boundary and Slot Integrity (FEATURE IMPROVEMENT / DRAFT / RELEASE HOLD)
- **Cycle:** Previous Feature Addition v1532 → Current Feature Improvement v1534 → Next Feature Addition v1536 (provisional). Main bf8d0d48f810932b43783d8605dce53954c60cff checked; Draft #2075 parent, engineering #2074, QA v1402 FAILED/P0.
- **Critical time-only correction:** v1532 TTL missed an item entering the 7/30-day horizon without a DB write. Compute validUntilUtc=min(asOf+60s, earliest impacted expiry, earliest future expires_at - horizon) and mark stale at boundary, including verified-empty.
- **Full-set integrity:** migration 114 has non-unique equipped index, allows NULL slot with is_equipped and lacks category/slot check; equip function has no explicit per-owner serialization. Validate entire owner equipped set BEFORE horizon filter; duplicate/malformed/zero quantity → 409, expired-flag remains warning, not auto-unequip. One statement_timestamp() inside same SQL statement, not separate query. Separate DB/B write-side unique index/locking handoff, no DDL here.
- **Backlog:** P0 OPS1534-01 SEC1534-02 FIN1534-03 REL1534-04; P1 IMPACT1534-05 IMPACT1534-06 IMPACT1534-07 IMPACT1534-08 IMPACT1534-09 IMPACT1534-10 (4+6). QA v1402 backend 2653 PASS/126 FAIL/501 SKIP, frontend 2701 PASS/55 FAIL, lint 1 error, exact-SHA Test/restore BLOCKED. Proposed 10,001 synthetic and no-write entry/exit tests NOT RUN. RELEASE HOLD.
- **External references:** newly verified 0, cumulative independently verified/deduplicated/classified UNKNOWN/10,000, BLOCKED/IN PROGRESS. Docs-only; no runtime/DB/WLD/Test/Production change or main merge. Full EN/KO details in integrated master and #2074.

**Current planning:** v1534 F675-189 horizon-entry and equipped-slot integrity / engineering #2074 / Draft stacked on #2075 / RELEASE HOLD.


## v2026.10.31.1534 — F675-189 Equipped Expiry Boundary and Slot Integrity (FEATURE IMPROVEMENT / DRAFT / RELEASE HOLD)

**Cycle:** Previous Feature Addition v1532 → Current Feature Improvement v1534 → Next Feature Addition v1536 (provisional). Main bf8d0d48f810932b43783d8605dce53954c60cff; parent Draft #2075, engineering #2074, independent QA v1402 FAILED/P0. English canonical, Korean equivalent; documentation only.

### Source-verified defects and design decision
- **Time-only horizon ENTRY:** v1532 validUntilUtc=min(asOf+60s, earliest impacted expiry) handles rows EXITING the 7/30-day window but misses a row initially outside the upper bound ENTERING as time advances without a DB write. A previously verified empty result can become false before its TTL. Eligibility remains asOf < expires_at <= asOf+withinDays*24h, UTC instants, inclusive upper bound.
- **Full-set slot integrity:** migration 114 adds eight allowed slot names and a NON-UNIQUE (user_id,is_equipped) index. It does NOT enforce is_equipped=>non-NULL slot, one equipped row per user/slot, or catalog category/slot compatibility. inventory_equip_item accepts an allowed caller slot and runs two UPDATEs without explicit per-owner serialization; profile_get_cosmetics uses LIMIT 1 on five slots and does not check quantity/expiry. These are source-level risks, not proof of an actual duplicate or exploit.
- Validate ALL owner rows flagged is_equipped BEFORE filtering for upcoming expiry. Duplicate slot (even when only one row falls in horizon), NULL/unknown slot, category mismatch (badge_1/2/3 require badge; other slots require matching category), or quantity<=0 must return 409 EQUIPMENT_SOURCE_CONFLICT, never an arbitrary LIMIT 1 or verified-empty. Expired rows whose equip flag persists are distinct EXPIRED_FLAG_STILL_SET warnings, not upcoming items or proof of auto-unequip. NULL expiry is UNKNOWN, not permanent; inactive catalog items remain visible if owned. No effect, upkeep or refund claim.
- Selected approach: one DB-authoritative owner snapshot with next entry AND exit boundary; reject client-only 60s TTL and scheduled automatic unequip. No new member table, background worker, notification, money write or equipment mutation.

### Precise DB/API and temporal contract
- Nest GET /api/v1/shop/holdings/expiring/equipped-impact, Next same-origin /api/shop/holdings/expiring/equipped-impact, Android /app-api/v1/shop/holdings/expiring/equipped-impact. Query withinDays=7|30 (default 7); actor from guarded authenticated session and consent, never from client. Strict response {asOfUtc,validUntilUtc,withinDays,items:[{catalogId,currentName,equippedSlot,quantity,holdingExpiresAtUtc}],warnings:[{equippedSlot,reason:EXPIRED_FLAG_STILL_SET}],sourceStatus:VERIFIED}. Warning list bounded by eight slots. Empty items with warnings is NOT “all equipment valid”; malformed 200 fails closed 503.
- New forward-only owner SECURITY DEFINER shop_my_equipped_expiry_impact_v1(actor,within_days), schema-qualified relations, fixed search_path, REVOKE PUBLIC EXECUTE, grant moneyverse_app EXECUTE only. Capture ONE statement_timestamp() INSIDE the same SQL statement and return that exact asOfUtc with the rows and bounds; querying timestamp in a separate statement can shift it even inside REPEATABLE READ. Use one PoolClient, READ ONLY REPEATABLE READ and COMMIT/ROLLBACK for multi-statement reads. No JS Date.now() authority, direct table grants, applied migration edits or financial writes.
- Let H=withinDays*24 hours. Across all valid owner-equipped future-expiring holdings, exitBoundary=min(expires_at where asOf<expires_at<=asOf+H); entryBoundary=min(expires_at-H where expires_at>asOf+H); validUntilUtc=min(asOf+60s, exitBoundary if present, entryBoundary if present). At dbNow>=validUntilUtc the result is stale, including verified-empty; refresh using a new DB clock. If boundary is invalid/nonfuture fail closed. No pagination/cursor: at most eight valid slots, but validate the entire flagged set before limiting. No cross-request snapshot claim.
- Separate Backend B/DB write-side handoff: preflight duplicates, evaluate forward-only partial UNIQUE (user_id,equipped_slot) WHERE is_equipped AND equipped_slot IS NOT NULL, enforce equip-flag/slot/category coherence and per-actor serialization, test two simultaneous same-slot equips. Do NOT apply DDL here; read endpoint fails closed before any write-side fix.

### UI, privacy, analytics, tests and release
- Existing flag-gated /inventory → /inventory/expiring?withinDays=7|30 → “장착 영향 확인” → /inventory/expiring/equipped-impact. No dead CTA while predecessor F675-188 is OFF. Show current mutable catalog name, slot, quantity, holding expiry KST and “보관함에서 확인”; distinguish verified-empty, expired-flag warning, conflict 409, entry/exit stale Refresh, auth/consent, 429, 503 Retry. Preserve existing showcase/counts. Cancel/fence in-flight requests on account/horizon switch; 320px, 200% zoom, keyboard/focus/aria-live, WCAG 2.2 AA.
- Default-OFF inventory_equipped_expiry_impact; Cache-Control private,no-store; X-Robots-Tag noindex,nofollow; Referrer-Policy no-referrer on 200/4xx/5xx at Nest/Next/Android AND public Nginx edge. No actor/catalog IDs, item names, raw expiry timestamps or tokens in analytics. Admin aggregates cohorts>=20 only; KPI opens, impact count, expired-flag warning rate, 409 rate, horizon-entry stale rate and p95. No member-detail bypass.
- **Proposed NOT EXECUTED:** isolated PostgreSQL 17.11 all migrations; 10,001 synthetic holdings; all eight slots; upper-bound equality/+1 microsecond; entry in 5s without writes; exit in 5s; verified-empty→nonempty; duplicate slot with one row outside horizon; NULL/mismatched slot, zero quantity, expired-flag warning, inactive catalog, NULL expiry, foreign actor, PUBLIC/app-role negative grants, concurrent equip race, Android/edge privacy, account switch, a11y. Assert no stale 200, arbitrary LIMIT 1 or financial mutation; p95<=500ms and bounded memory. Write-side tests remain BLOCKED until implemented separately.
- **QA v1402 (2026-10-31 02:18–02:32 KST):** backend 2,653 PASS/126 FAIL/501 SKIP; frontend 2,701 PASS/55 FAIL; lint 1 parser error; typecheck/build PASS; DEV 293/311 migrations applied, 5 checksum mismatches and excessive app-role DML; official Test exact-SHA and independent restore BLOCKED; Production private pages index/follow, runtime-check FAILED. RELEASE HOLD. Docs CI is not runtime proof.
- **External independent reference gate:** new verified 0; cumulative independently verified/deduplicated/classified UNKNOWN/10,000; BLOCKED / IN PROGRESS. Internal GitHub and synthetic fixtures do not count.

### P0/P1 development backlog — 4 P0 and 6 P1
| Priority | ID | Verifiable acceptance |
|---|---|---|
| P0 | OPS1534-01 | Exact Production executable SHA, rollback digest, independent restore, public edge provenance #1984. |
| P0 | SEC1534-02 | DEV app-role DML removal; 5 checksum mismatches and 18 unapplied migrations reconciled without editing history #993. |
| P0 | FIN1534-03 | Treasury/MINT/SWF/bond ledger truth; no fabricated reconciliation or jackpot #1976/#2077. |
| P0 | REL1534-04 | #2031/#1088 merge control; lint and 126/55 failures; exact-SHA Test authenticated E2E, private edge, signed promotion. |
| P1 | IMPACT1534-05 | DB/B: full-slot invariant, one DB clock, entry/exit boundaries, warning, EXPLAIN and write-side integrity handoff. |
| P1 | IMPACT1534-06 | Backend B: strict guarded DTO, read-only snapshot, 400/401/403/409/429/503, no false-empty/truncation. |
| P1 | IMPACT1534-07 | Frontend A/C: expired-flag warning, horizon-entry stale Refresh, account/horizon fence, WCAG. |
| P1 | IMPACT1534-08 | Android C: session parity, strict payload validation and private no-store headers. |
| P1 | IMPACT1534-09 | Security/Ops: public edge noindex/no-store all statuses, OFF flag, >=20 cohort KPI. |
| P1 | IMPACT1534-10 | QA: 10,001-row PG, entry/exit without writes, outside-horizon duplicate, equip concurrency, exact-SHA Test/rollback. |

**Status:** DOCUMENTATION PROPOSAL / DRAFT / RELEASE HOLD. No runtime/DB/WLD/ledger/Test/Production changes or main merge. No new distributed planning file.

**Current planning:** v1534 F675-189 horizon-entry and slot-integrity hardening; engineering #2074; planning Draft stacked on #2075; RELEASE HOLD.


## Work record
Start: miniPC Debian 13.6, skills list empty; installed using-superpowers and related skills read; latest main and QA checked. Mid: recheck main/plans and conflict ownership. Finish: document classifier, diff, GitHub Draft/CI and release gates must be recorded independently.
