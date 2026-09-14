# Worklog — stock comparison deep-link v2026.09.14.77

## Baseline and overlap review
- Latest app main at start: `25844d21c862e06eed1018fb9ba897e4746c4ddd`.
- Newest relevant active stock work: PR #279 / `feat/stock-discussion-compose-v2026.09.14.76` at `1bcd4d1577058780c2c858efc02d1f53ff626e70`.
- PR #279 already contains PR #277's stock detail hub, including the comparison entry link. This branch intentionally starts from #279 so the deep-link receiver matches the newest stock-detail sender.
- PR #278 touches auth/email verification and does not overlap this stock comparison slice.
- `feature/app-auth-simplify-v2026.09.13.48` is stale against main and overlaps the newer auth workstream, so it was not integrated here.
- Existing dirty local `fix/mobile-profile-api-contract-v2026.09.14.75` worktree was preserved untouched.

## User benefit
Opening comparison from a stock detail page keeps that stock selected, removing redundant search/selection and making the stock-detail → comparison flow coherent.

## Scope
- Frontend only: comparison query parsing, authoritative symbol resolution, initial selection, regression tests.
- No backend/API/DB schema change.
- Living Project Plan English/Korean parity updated.

## Release gate
This stacked branch must not merge to `main` before its parent stock work is reconciled and the exact candidate passes CI plus isolated Test exact-SHA verification.

## Validation
- `scripts/check-secrets.sh`: PASS.
- `pnpm test`: PASS — contract 23, database 7, backend 852 passed / 353 DB-gated skipped, frontend 554 passed.
- `pnpm lint`: PASS with 11 pre-existing `no-img-element` warnings, 0 errors.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS; `/stocks/compare` and `/stocks/[symbol]` produced successfully.
- Migration parity tests: PASS. This frontend-only slice adds no migration.
