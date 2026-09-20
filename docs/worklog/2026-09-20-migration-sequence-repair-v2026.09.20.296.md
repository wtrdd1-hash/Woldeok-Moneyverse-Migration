# Migration sequence repair — v2026.09.20.296

## Scope
Repair the duplicate migration number already present on `main` before integrating new schema work.

## Checklist
- [x] Confirm `main` contains two migration files numbered 215.
- [x] Confirm Test/Production runtime SHAs predate the 180-day session migration.
- [x] Renumber the unapplied 180-day session migration from 215 to 216.
- [ ] CI migration parity and runtime checks pass.
- [ ] Merge before profile/shop migration branches are renumbered.

## Validation
The migration body is unchanged; only its not-yet-deployed sequence number and header are corrected.

## Deployment state
Repository sequence repair only. Runtime migration is applied later through the exact-SHA Test/Production release flow.
