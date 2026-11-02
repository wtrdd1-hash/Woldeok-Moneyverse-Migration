# C v1321 — Hot-time snapshot freshness plan

> **For implementer:** use the isolated worktree, TDD RED/GREEN, no main edits or release without gates.

**Goal:** Do not advertise stale or future-dated hot-time status as a live economic buff on admin/public UI.

**Architecture:** Keep the Nest read-only GET contract and its source error handling. Add a pure time-bounded verifier on top of the existing parser; both consumers call it and refresh on a bounded interval. Add admin-only HTTP privacy header override. No new SQL migration or economic write.

**Task 1 (contract):** Extend `frontend/src/lib/hot-time-evidence.test.ts` with stale/future/boundary/expired-now tests. Verify RED. Add `parseCurrentHotTimeEvidence(value, nowMs=Date.now())`, max age 120s and future skew 30s, and verify GREEN.

**Task 2 (consumer):** Add stale-response and refresh regression to `frontend/src/app/admin/controls/hot-time-management-card.test.tsx`; test public banner stale rejection. Verify RED. Change both clients to the current verifier; add bounded refresh and cleanup, preserve accessible unavailable state.

**Task 3 (privacy):** Add route policy test for `/admin/controls` and locale-prefixed paths, verify RED, then update Next header overrides, verify GREEN and real HTTP response.

**Task 4 (release):** Fetch origin/main again, run exact-SHA build/lint/typecheck/unit/backend/contract/DB/PG/security/app-api/E2E/CI. Document any failures, keep Draft PR and release HOLD unless every gate passes.
