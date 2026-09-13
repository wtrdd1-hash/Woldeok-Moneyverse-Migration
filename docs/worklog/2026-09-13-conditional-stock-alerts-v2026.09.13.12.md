# Conditional stock alerts worklog — v2026.09.13.12

## Baseline
- Current main before development: `6a2089a22f7bba70af3ce970a8c751e72539849b`.
- Newest relevant runtime candidate: PR #208 / `1832baffb57eb7d2ad603346de20769587d94b0a`.
- Reconciled baseline: `3be9ce47407804a7166c6a02dff4dc0f76399d0f`, created by merging current main into the #208 runtime chain.
- Reason: #208 owns migration 181. Starting directly from main would risk assigning the same migration number to unrelated alert work.

## Runtime scope
- PostgreSQL migration 182: member alert rules, append-only trigger events, actor-scoped CRUD/read functions, ticker evaluator.
- NestJS: member alert API, validated WLD/bp/cooldown inputs, evaluator repository.
- Market ticker: evaluates alert conditions after a successful market move; evaluator failures do not stop price broadcast.
- Next.js: member-only `/stocks/alerts`, create/delete forms, current state, recent trigger history, stock-tool navigation.

## Safety
- Price alert amounts remain integer strings/BigInt-safe.
- Alert tables are not directly writable by `moneyverse_app`; mutations and reads use SECURITY DEFINER functions.
- Trigger events do not mutate market prices, holdings, wallets, ledger entries, rankings, or recommendations.
- Event history is retained; the API pagination limit is a read bound, not a retention cap.

## Validation status
- Pending CI on final feature SHA.
- Pending exact-SHA `wdmv-test` deployment and verification.
- Production unchanged.

## Next priority
After alert validation, continue Personal Dashboard / Portfolio Analysis while retaining unresolved exact-SHA Test blockers as release blockers.
