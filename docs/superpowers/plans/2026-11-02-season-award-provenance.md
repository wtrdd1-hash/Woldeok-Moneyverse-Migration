# Season award provenance hold — implementation plan

> For agentic workers: use test-driven-development and verification-before-completion.

**Goal:** Prevent a member from being told that an unledgered season pass reward was earned or claimed and prevent fictitious honorees from appearing as verified history.

**Architecture:** The existing authenticated Nest season event and leaderboard APIs remain the only verifiable event/rank source. No API or SQL contract exists for pass XP, milestone claims or historical honorees. Quarantine those two presentation modules behind explicit unavailability notices until an independently verified server contract exists; never invent a ledger transaction or zero-result.

**Tech Stack:** Next.js App Router, React, Vitest, PostgreSQL existing season read contract.

1. Update `frontend/src/app/seasons/season-pass.test.tsx` to assert no buy/claim CTA, fabricated XP, earned rewards or winners; add honoree regression. Run RED.
2. Replace `season-pass-track.tsx` and `hall-of-fame-ticker.tsx` with accessible non-transactional source-hold panels. Run GREEN.
3. Check page integration, responsive/keyboard/screenreader semantics, lint/typecheck/build/unit/integration, PostgreSQL/CI/E2E release gates, then update EN/KO worklogs and Draft PR. Preserve A/B/QA branches. Merge and deploy only on all required PASS.
