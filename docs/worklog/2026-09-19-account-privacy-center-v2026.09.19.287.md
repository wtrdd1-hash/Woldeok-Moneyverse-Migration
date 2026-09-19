# v2026.09.19.287 Worklog — Account privacy center

## Ordered versions
1. `287-01` — Rechecked `origin/main=d59294c9f106e3c0ea7db8d9a08da3bf9f4e6853`, open PRs and active automation branches; avoided shop/economy and account-security work already in flight.
2. `287-02` — Rechecked the mobile UI specification and existing privacy backend/API; selected the missing dedicated privacy-center surface.
3. `287-03` — Added `/account/privacy`, account navigation and write-path revalidation using the existing authoritative privacy request API.
4. `287-04` — Added regression tests and English canonical/Korean-second changelog/worklog records.
5. `287-05` — Exact-head local tests/CI/Test/Production evidence recorded after execution; no promotion is allowed before all gates are green.

## Safety and deployment state
- No economy/ledger mutation was changed.
- No database migration was required because the privacy request backend, database functions and app-api gateway are already authoritative.
- Production promotion: pending exact-SHA CI and isolated Test verification.
