## Started 2026-10-30 KST
Main checked and isolated worktree created. Root cause: deterministic repetitive fabricated CHIMU314 positive news, AI fallback, model paths. Existing production market events are separate database rows.

## Production intervention and verification
- Production backend `/srv/moneyverse-data/releases/production-current/backend`, DB via its runtime environment; its database name is `woldeok_moneyverse_dev` despite serving Production. Avoid assuming the name denotes isolation.
- Before intervention: 12 active market events; 156 historical events with 치무전자 in headline; 197 candidate scenarios matching the headline.
- User-authorized cancel of *all 12 currently active events* (not hard delete): one transaction, snapshot of selected rows in local mode-0600 incident file `/home/debian/moneyverse-task-records/chimu-20261030/active-news-before-cancel.json`.
- Immediately after transaction: active events 0. Historical records and stock trades retained; automatic scheduler may publish again until changed runtime deployed.
- Root cause: hard-coded positive CHIMU314 fallback text and AI-generated proposals accepted even if LLM generation fails. Source guard suppresses CHIMU314 in both automatic paths. Manual administrator publication requires a separate policy decision.
- Tests: focused deterministic generator 4 passed before worktree isolation; combined broader service suite exhibited 7 failures among 62 (not claimed green). Full Test / Production deployment not completed.
- Work isolated on `fix/chimu-news-recurrence-20261030` to avoid interfering with Gemini/other development branch.

## Follow-up v2026.10.30.2204
- Current origin/main re-fetched: bf8d0d48f, unchanged since isolation.
- Reproduced seven failed AI auto-publication tests: missing seven-day novelty verification, incomplete fallback provenance and idempotency key reuse, and unsafe history failure behavior.
- Added fail-closed operator-gated recent event history check; reject repeated headlines and recently covered companies; stable SHA-256-derived UUID for identical automatic publication; explicit model fallback reason; no eligible scenario returns a skipped-publish receipt.
- Focused AI news + fallback engine tests: 63/63 PASS. Backend TypeScript noEmit: PASS.
- Production Test/rollout gates remain unverified; no code deployment yet.
