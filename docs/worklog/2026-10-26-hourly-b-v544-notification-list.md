# B v544 — notification list filtering and deterministic pagination

## Before work
- Authority: main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; confirm again before any integration.
- Read AGENTS.md, README.md, both project plans, open PRs/QA/CI, and planning #1354. The latest planning specifically identifies unstable notification pagination; planning PR remains draft and unmerged.
- Scope: one P1 existing notification-list API correctness defect: a query value of `unreadOnly=false` is coerced to true and an arbitrary nonempty string also becomes true; equal timestamps have no deterministic secondary order. Fix without new schema, direct grants, or ledger effects.
- Do not modify others' worktrees, reservations, Test, or Production.

## In progress
- [x] Add failing DTO and service query tests (RED: 3 failed / 2 passed).
- [x] Implement strict boolean parsing and stable timestamp/UUID ordering (focused GREEN).
- [ ] Run focused tests, backend tests, typecheck, build, lint, CI/security and assess blocked official gates.

## Finished
- Pending verification. Production HOLD.

## Verification (02:35–02:41 KST)
- RED: new five-case focused suite initially 3 failed / 2 passed; GREEN: focused 7/7 with existing controller tests.
- Backend: 1,318 PASS / 398 SKIPPED; TypeScript backend and full workspace PASS; Backend build PASS.
- Database package: 15 PASS / 3 SKIPPED; contract package: 38 PASS; API contract: 179 endpoints PASS; ESLint: 0 errors / 1,128 warnings; repository security policy: 18 PASS; Bot: 8 PASS.
- Isolated PostgreSQL 17.11 (`--network none`, ephemeral tmpfs): synthetic notification table validates same-timestamp UUID ordering, unread-only filtering and owner WHERE predicate; container removed. This is **not** official schema/migration/least-privilege or authenticated Test E2E proof.
- Frontend suite: 1,397 PASS / 6 FAIL (existing SEO 3, login touch target 1, calculator registration 1, admin M2 1). Default frontend build FAIL (Turbopack dependency resolution in linked worktree). Production dependency audit FAIL (2 high); full audit FAIL (2 critical, 10 high, 11 moderate, 3 low).
- The main branch contains no migration for `in_app_notifications` or its `notification_*` functions; this change does not claim to complete a production-ready notification inbox. Owner-scoped SECURITY DEFINER read model remains future work, as does official exact-SHA Test authentication, DB ACL, Android, and E2E verification.
- `scripts/check-secrets.sh` and `scripts/check-control-bytes.sh` referenced in older AGENTS.md are not present on current main; actual repository security tests ran instead. No policy gate was disabled.
- main re-fetched and compared during work: unchanged `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; canonical EN/KO plans re-read. Planning #1354 is unmerged, so no implementation overlap.

## Finished — PARTIAL / RELEASE HOLD
- [x] Add failing DTO and service query tests (RED: 3 failed / 2 passed).
- [x] Implement strict boolean parsing and stable timestamp/UUID ordering (focused GREEN).
- [x] Run focused/backend/DB/contract/typecheck/build/lint/security, isolated PG and identify failed frontend/audit gates.
- API: `GET /api/v1/notifications?unreadOnly=false` now means all items; `true` means unread only; invalid strings reject validation; offset pages order by `created_at DESC, id DESC`. No API path, DB schema, migration, ledger, balance, Test or Production change.
- No main merge or branch cleanup; PR remains draft. Production HOLD until full gates, official exact-SHA Test, and approved GitOps release.
