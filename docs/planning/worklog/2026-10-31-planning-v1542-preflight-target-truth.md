# Planning v1542 — Source Truth and Target-Bound Preflight

**Status:** DRAFT / RELEASE HOLD; docs-only. **Cycle:** v1540 Addition → v1542 Improvement → v1544 Addition (provisional).

**Start:** 2026-10-31T07:09:49+09:00 started; latest main 761a55a094fb9dd383d213e817305e68c79fa23c; v1540 PR #2101 head 247bf2e2eaa4d8adc3fae790c2ddc1d137b6c95f; QA v1405 last full verified; v1406 route-ledger evidence missing per B #2103; release HOLD.

**Midpoint:** Re-fetched origin/main, AGENTS.md, README.md, canonical PROJECT_PLAN.md and Korean counterpart; checked migration 071/114/123, Nest shop.controller, Next inventory-view and app-api gateway path, GitHub PRs #2101/#2103/#2094, issues #2100/#2031/#993. Main remained 761a55a094fb9dd383d213e817305e68c79fa23c. The v1540 preflight omitted expected target UUID and 7/30-day horizon, so a stale/unrelated slot could be misclassified as REVIEWABLE. This is a design gap, not an observed exploit.

**Design:** Require candidateId, expectedTargetCatalogId, slot, withinDays; owner-scoped full equipment source validation; DB-authoritative single timestamp, fingerprint, 30s/expiry/horizon invalidation; 404 foreign candidate, 409 target mismatch/conflict, 410 expired evidence, 503 unavailable; never treat review evidence as equip authority. Prefer private CSRF-protected POST-for-read BFF and verify Android gateway method before acceptance. Detailed EN/KO contract and 4 P0 + 6 P1 tasks in integrated master; no separate feature plan.

**Evidence:** QA v1405 main 2778 backend PASS/501 SKIP, 2770 frontend PASS, lint/typecheck/build PASS, dependency audit FAIL. B Draft #2103 notes QA v1406 exact-SHA route-ledger evidence missing. No exact-SHA official Test, DB ACL/checksum remediation or independent restore attested. Synthetic 10,001-row acceptance tests PROPOSED NOT RUN. External independent refs newly approved 0, cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS.

**Changes:** PROJECT_PLAN EN/KO, INTEGRATED_PLANNING_MASTER EN/KO, UPDATE_LOG EN/KO, this bilingual worklog and bilingual internal/GitHub update notes. No runtime/DB/WLD/ledger/Test/Production/main changes. Final GitHub PR/CI evidence recorded separately; keep Draft/HOLD.
