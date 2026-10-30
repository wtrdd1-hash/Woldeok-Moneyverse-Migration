# Planning v1530 — Owner inventory expiry radar integrity (2026-10-31)

**Before work — 2026-10-31 01:01 KST.** Previous Feature Addition v1528; current Feature Improvement v1530; next Feature Addition v1532 (provisional). Isolated branch stacked after Draft #2061. Remote main `bf8d0d48f810932b43783d8605dce53954c60cff` checked. Documentation only; RELEASE HOLD. Existing issue #2060 and P0 #2031/#993; coordinate Development A #2056.

**Evidence:** Migration 071 defines `public.user_items` `(user_id,catalog_id)` PK, nullable `expires_at`, and mutable `quantity`; migration 123 `shop_my_items_v2` uses separate `clock_timestamp()` calls and joins catalogue without `active` filtering. Nest holdings route is session/consent guarded and the repository calls an owner-scoped function. The v1528 proposal has not been implemented.

**In progress:** Resolve expiry during pagination, database-clock vs cursor time, cross-request snapshot drift, catalogue name/code mutation, exact cursor/session identity, and DB transaction boundary. Keep full feature/addition scope unchanged. Latest QA v1400 is failing; release remains blocked.

**Checklist:**
- [x] Inspect installed Superpowers skills, latest remote main, PR #2061, QA and real sources.
- [ ] Strengthen English/Korean canonical and integrated plans, P0/P1 backlog, logs.
- [ ] Recheck main and PR collision, run documentation classifier, parity and diff checks.
- [ ] Push final draft, create stacked PR, update #2060, verify exact-SHA CI.

**External reference gate:** new verified 0; cumulative verified/deduplicated/classified UNKNOWN/10,000 — BLOCKED / IN PROGRESS. No runtime, database, WLD, Test, Production, or automation changes.
