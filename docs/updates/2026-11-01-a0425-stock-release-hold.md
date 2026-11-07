# Release HOLD — Development A stock filter

- Candidate: `auto/hourly-a-20261101-0425-stock-availability`, based on main `f13bbce273ffc65e8576170992d82ea00c27a1c9`; final SHA and CI status are recorded on PR #2254.
- Full local test/build/typecheck/lint/security audit PASS on code; real PostgreSQL read PASS, but independent Test authenticated exact-SHA E2E and backup restore NOT RUN.
- **Blocking P0:** development app-role direct UPDATE of `shop_catalog` and `account_balances`; Production role not independently attested. Production backend SHA and frontend timestamp disagree; official Test serves another SHA.
- **Decision:** no merge, no official Test or Production deployment, no DB writes, no service restart, no rollback. Preserve all other branches/PRs. Release only after every gate passes on the exact integrated main SHA.
