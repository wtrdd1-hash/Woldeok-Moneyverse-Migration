# v2026.09.16.1 — Stock discovery composition

## User benefit
Members can search the virtual-stock catalogue and then rank only those matches by movers, price, availability, or name without losing either filter. The combined `q` + `sort` URL is shareable and bookmarkable.

## References
- Next.js App Router search/pagination guidance: URL search parameters preserve shareable server-rendered view state, and controls should mutate the existing parameter set rather than discard unrelated state.
- W3C WAI-ARIA `aria-current`: expose the current item in a related navigation set programmatically.

## Implementation and safety
Changed only the stock discovery UI/helper/tests plus documentation. Sorting uses `BigInt`; no API, PostgreSQL schema, ledger, authorization, idempotency, migration, or Production data path changed.

## Validation
Focused search/sort tests and frontend typecheck pass locally after contract build. GitHub CI and exact-SHA Test runtime remain mandatory promotion gates.
