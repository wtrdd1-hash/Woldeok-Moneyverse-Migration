# Branch Cleanup Automation v2026.09.12.15

Date: 2026-09-12

## Summary

- Adds a GitHub Actions workflow that deletes a same-repository source branch after its pull request is merged into `main`.
- Adds a scheduled/manual cleanup pass that deletes only branches whose commits are already fully contained in `main`.
- Preserves `main`, `production`, `staging`, `develop`, and `release/*` branches.
- Keeps deployment ordering unchanged: merge to `main`, build the exact-SHA test candidate, GitOps promotion to `wdmv-test`, exact-SHA backend/API smoke validation, production image build, then GitOps production reconciliation.

## Safety

The cleanup job does not merge unreviewed work and does not delete branches that still contain commits absent from `main`. Protected or non-deletable branches are left in place.
