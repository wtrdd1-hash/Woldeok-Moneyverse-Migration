# A 05:25 Repair — Profile HTTP Test Fixture and Internal Token

## BEFORE WORK
- `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; independent repair branch/worktree, not the feature branch.
- Full candidate test run found 2 failures: authenticated profile HTTP tests expected 200 but got 401.
- Reproduced the same 2 failures on pristine `origin/main` after building the shared contract. Therefore not introduced by public status feature.

## IN PROGRESS
- Root cause proven from test HTTP response: `internal token required` from the existing global `InternalTokenGuard`. The test sets a 32-character test token but did not send it on its authenticated requests.
- Fix only the two positive test requests to send the same test-only internal token. Preserve all unauthenticated 401/privacy assertions and production guards.

## FINISHED
- Focused 8/8 PASS, full backend 2,950 PASS / 517 SKIP, 0 FAIL. No runtime source, auth bypass, migration, database write or production change.
- Exact SHA CI, official Test and release gates still required. Keep Draft/HOLD, no merge or deployment.
