# Economy Scenario Lab integration worklog — v2026.09.12.30

## Goal
Re-home the still-valid Economy Scenario Lab runtime implementation onto current `main` while preserving concurrent documentation and planning work.

## Base and branch
- Base main: `8b6666f46a2b56cd261604c322d116f0e004cfe2`
- Source feature SHA: `8e0dab2094743e1ea8cc62e01ff8cd38e3229b27`
- Integration branch: `integrate/economy-scenario-lab-v2026.09.12.30`

## Runtime scope
- Backend scenario projection helper and tests.
- Read-only administrator preview endpoint backed by the authoritative economy dashboard.
- Frontend `/admin/economy/scenario-lab` page and navigation entry.
- No schema migration or value-changing path.

## Concurrency handling
The feature branch was far behind current main. A direct history sync conflicted with newer planning documentation, so the runtime blobs only were transplanted onto the current main tree. Core runtime files touched by the feature had not changed on main since the feature merge-base, avoiding overwrite of newer runtime work.

## Status checklist
- [x] Planned: identify stale-but-valid runtime work.
- [x] In progress: re-home frontend/backend runtime files onto current main.
- [ ] In progress: GitHub CI on the new integration PR.
- [ ] Planned: immutable exact-SHA Test candidate.
- [ ] Planned: isolated Test backend/API/UI verification.
- [ ] Planned: merge to main only after required gates.
- [ ] Planned: Production promotion of the same verified SHA.

## Production
Not promoted. Test evidence is not yet available.
