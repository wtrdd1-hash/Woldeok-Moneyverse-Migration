# Backend B v755 — Activity session attribution integrity

## Before work
- [x] Verified Debian 13 miniPC, live service status, remote main and QA v1465.
- [x] Reviewed AGENTS, README, English/Korean planning, concurrent PRs and CI evidence.
- [x] Isolated branch/worktree from exact origin/main; shared main remains untouched.
- [ ] RED regression for activity ingestion on session storage failure.
- [ ] GREEN backend change and focused HTTP/unit tests.
- [ ] Full gates, exact-SHA Test, CI, and release decision.

## In progress
- Pending TDD. A cookie-backed session lookup outage currently falls through as anonymous telemetry, misclassifying provenance instead of reporting an unavailable source.

## Finished
- Pending. No merge, deployment or financial mutation is authorized by this worklog.

### Midpoint — RED/GREEN
- RED: 2/5 expected failures (cookie + session storage outage wrongly recorded as anonymous); three control tests passed. Initial test fixture was corrected to provide a request socket before the valid RED run.
- GREEN: reject unverifiable cookie-backed telemetry with HTTP 503 `ACTIVITY_SESSION_UNVERIFIED`; preserve anonymous no-cookie and verified-actor flows. No schema or financial mutation.
- Backend activity focused tests executed; see internal logs. Official Test, release and all-gates remain HOLD.
