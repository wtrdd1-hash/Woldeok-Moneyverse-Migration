# B v544 — notification list filtering and deterministic pagination

## Before work
- Authority: main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; confirm again before any integration.
- Read AGENTS.md, README.md, both project plans, open PRs/QA/CI, and planning #1354. The latest planning specifically identifies unstable notification pagination; planning PR remains draft and unmerged.
- Scope: one P1 existing notification-list API correctness defect: a query value of `unreadOnly=false` is coerced to true and an arbitrary nonempty string also becomes true; equal timestamps have no deterministic secondary order. Fix without new schema, direct grants, or ledger effects.
- Do not modify others' worktrees, reservations, Test, or Production.

## In progress
- [ ] Add failing DTO and service query tests (RED).
- [ ] Implement strict boolean parsing and stable timestamp/UUID ordering.
- [ ] Run focused tests, backend tests, typecheck, build, lint, CI/security and assess blocked official gates.

## Finished
- Pending verification. Production HOLD.
