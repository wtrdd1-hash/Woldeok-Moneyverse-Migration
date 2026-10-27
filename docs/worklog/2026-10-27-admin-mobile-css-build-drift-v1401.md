# v2026.10.27.1401 — Administrator mobile CSS/build drift recovery

## Before work — 2026-10-27 KST

- Source: administrator mobile screenshot shows an oversized brand moon, unstyled navigation and a bulleted administrator menu on `https://easy-scraping.com/admin`.
- Canonical documents reviewed: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.ko.md`, `docs/RELEASING.ko.md`, `docs/RESPONSIVE_DESIGN_GUIDELINES.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`; branch based on refreshed `origin/main`.
- Production HTML references `/_next/static/chunks/07n3_vyoxfswp.css`, but the active frontend returns HTTP 500 for it. The frontend `.next/static/chunks` directory instead contains `1o54v_05nxpad.css`, which is not referenced by HTML. Other current page CSS assets return HTTP 200.
- The live Next.js process on port 3354 started at 09:31 KST, while the build output on disk was regenerated at 18:23 KST. This is a runtime/disk identity mismatch; a direct live restart would interrupt traffic.
- Scope: protect member sessions, finances, security controls and other developers' work. No database/migration changes. Test the replacement on an isolated port before atomic proxy cutover.

## In progress

- [ ] Confirm immutable candidate copies and static bundle completeness.
- [ ] Start separate replacement frontend and validate CSS response, administrator document and API compatibility.
- [ ] Implement a repeatable static asset drift verification guard in the task branch.
- [ ] Re-fetch main before integration and run relevant automated gates.
- [ ] Carry out zero-downtime promotion only after authenticated Test/rollback readiness gates.


### Checkpoint 1 — replacement and verification

- A separate source-matched, read-only candidate copy was created at `/srv/moneyverse-data/releases/repair-v1401-admin-css-candidate` (1.2 GB, without build cache or Git history); no live files were edited.
- The replacement process runs on 3384, while production remains on 3354. The replacement document links all 5 present CSS chunks; `verify-next-static-assets.mjs` passed, and the broken old port failed with CSS HTTP 500.
- Five automated negative/positive regression tests passed (5/5). Candidate HTTP `/`, `/admin` and `/admin/blog` all returned 200; no authenticated admin activity is claimed.
- `origin/main` advanced from `59cdc2e0` to `cf56520b` during work; the task branch must be rebased without clobbering concurrent contributions.

## Finished

Pending actual verification and cutover; no deployment is claimed yet.
