# Planning v1424 — Verified member collection showcase (DRAFT / HOLD)

- **Started:** 2026-10-28 20:05 KST; separate branch `auto/planning-v1424-verified-collection-showcase-20261028-2005` from main `35971c600f25869c96f1c666d4b9f58927202730`.
- **Cycle:** Previous Feature Improvement v1422 → Current Feature Addition v1424 → Next Feature Improvement v1426 (provisional).
- **Scope:** F675-162, a member-opt-in, revocable, time-limited **verified** collection showcase. Documentation only; no feature implementation, DB changes, deploy or test claims.
- **Source evidence:** `frontend/src/app/collections/curation-retention-flow.tsx` hard-codes `?showcase=arch-1063` and starts with `DEFAULT_PIECES`, with browser localStorage fallback; `backend/src/collection/collection.repository.ts` seeds four pieces on read and directly reads/writes `user_collections`; migration 232 has no award-proof linkage. These do **not** constitute verified ownership.
- **Release gate:** QA v1347 FAILED, 18,000 WLD historical divergence, data disk 97–98%, backup restore unverified, app-role DML and migration parity gaps, Production version unknown, official Test exact-SHA unverified. No promotion.
- **External evidence:** 10,000 independent-reference gate: new approved 0; cumulative deduplicated accepted UNKNOWN; BLOCKED / IN PROGRESS. Do not invent totals.
- **Checklist:** [x] read skills and authoritative main [x] inspect user/admin/API/DB/app-api [ ] draft EN/KO integrated design [ ] update EN/KO plans, review and logs [ ] run document parity and diff checks [ ] GitHub issue and Draft PR [ ] final status.
