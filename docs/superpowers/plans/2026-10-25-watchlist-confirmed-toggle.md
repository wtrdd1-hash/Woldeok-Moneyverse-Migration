# Verified Stock Watchlist Toggle — bounded implementation plan

## Evidence and intended outcome
On canonical main, `frontend/src/app/stocks/watchlist-toggle.tsx` discards the `useActionState` result; members cannot distinguish failed watchlist mutations from successful ones. `setWatchlist` in `stocks/actions.ts` ignores the server response, assumes a success from HTTP 2xx, and revalidates `/stocks` only, not `/stocks/watchlist` or the stock detail. NestJS `POST /api/v1/stocks/:id/watchlist` returns `{ watching: boolean }` from a PostgreSQL SECURITY DEFINER function; no schema change is required. No open PR targets this toggle. This is a P1 state-integrity/accessibility gap.

## Scope and design
1. Add failing unit regression covering server-confirmed `{watching}` response and rejection of absent/mismatched receipts, plus relevant route revalidation.
2. Add failing UI regression verifying a failed server action is visibly and accessibly announced and button touch target is >=44px.
3. Implement minimum server-action receipt check and revalidate watchlist and stock detail; keep existing session/CSRF and PostgreSQL ownership boundaries unchanged.
4. Render `ActionAlert` from action state and preserve server-confirmed feedback, keyboard/ARIA and mobile layout.
5. Run focused tests, lint/typecheck/full test/build, security, CI and isolated PostgreSQL where safe; no live DB writes. Record exact SHA and release gate results. Never deploy on partial gates.

## Acceptance and rollback
No success message without an exact boolean receipt from the authenticated backend. Failed operations remain visibly failed and do not claim a persisted watch. Server-revalidated `/stocks`, `/stocks/watchlist`, and `/stocks/[symbol]` must reflect new state. Revert the isolated PR to roll back; no DB migration or WLD changes.
