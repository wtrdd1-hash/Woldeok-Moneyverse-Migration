# Mini-showdown Ledger Hold Implementation Plan

> For agentic workers: use test-driven-development and verification-before-completion. Bounded P0 safety change, not new settlement architecture.

1. [ ] Add `backend/src/engagement/dopamine-mini-showdown-ledger-hold.test.ts` to assert authenticated controller never returns success, payout or a client-supplied outcome, including malicious stakes and missing repository.
2. [ ] Run focused test RED and record exact failure.
3. [ ] Replace `resolveMiniShowdown` synthetic return with 503 `MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE`; preserve guards, add private/no-store/noindex/no-referrer.
4. [ ] Run focused test GREEN and inspect diff; confirm no SQL, migration, ledger or wallet writes.
5. [ ] Run available gates without interfering with A/C/QA; record failures, remote CI and official exact-SHA Test blocker.
6. [ ] Create Draft/HOLD PR, notify C of frontend payout fallback and preserve RELEASE HOLD until exact-SHA, E2E, independent restore and GitOps PASS.
