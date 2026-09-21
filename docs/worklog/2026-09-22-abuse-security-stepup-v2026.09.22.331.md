# v2026.09.22.331 — Abuse-security step-up worklog

Baseline: `4579e5c2d020470f11606ad6db3efd705bc95615`

## Checklist
- [x] Reconcile latest main and open PRs.
- [x] Select a backend security slice not overlapping active A/C work.
- [x] Require recent reauthentication for IP block add/remove and permanent suspension.
- [x] Add focused guard regression tests (3/3).
- [x] Backend TypeScript typecheck and `git diff --check`.
- [ ] Exact-SHA GitHub CI.
- [ ] Main integration and Production promotion; only after all release gates pass.

No database migration or ledger mutation is introduced. Existing migration-authority and DR release blockers remain authoritative.
