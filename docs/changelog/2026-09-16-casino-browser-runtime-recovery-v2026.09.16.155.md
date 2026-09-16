# Internal change record — v2026.09.16.155

## Incident evidence

- User-visible failure: casino interaction could fall into the global application error boundary.
- Production digest: `3286936712@E352`.
- Production frontend journal: `A "use server" file can only export async functions, found object.`
- Additional runtime defect: repeated Next.js fetch-cache `EACCES` because release cache files were owned by `root` while `moneyverse-frontend` runs as `debian`.

## Code changes

1. Added `casino-state.ts` and moved `CasinoPlayState`/`CASINO_IDLE` out of `actions.ts`.
2. Removed the synchronous `parityLabel` re-export from the `use server` action module.
3. Updated all casino client components to import initial state from the client-safe module.
4. Added a static regression test that rejects runtime object/re-export additions to the server-action module.
5. Added a casino-segment error boundary with settlement-safe recovery guidance.
6. Replaced the generic casino loading placeholder with a route-specific skeleton.

## Runtime intervention

On the active Debian production release, `.next/cache` ownership was changed to `debian:debian` to stop cache write failures. No member data, database schema, ledger row, balance, or casino settlement was modified.

## Verification evidence

- Focused casino tests: 14 passed / 0 failed.
- Typecheck: passed.
- Lint: 0 errors, 11 unrelated pre-existing warnings.
- Next.js production build: passed.

## Promotion gates

Branch → exact-SHA Test candidate → public Test exact-SHA/API/user-flow QA → main → exact-main-SHA Test → Production → production smoke/log check. Production is not considered complete until the public runtime serves the intended SHA and the casino interaction no longer emits the recorded server-action boundary error.
