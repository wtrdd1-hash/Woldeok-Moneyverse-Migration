# Development A — P2P Recipient Search Race Hardening (2026-10-24 00:25 KST)

## Problem and acceptance
The P2P transfer dialog retains results from an earlier nickname query while a later request is in flight, and an older response may overwrite a newer result. This creates a wrong-recipient selection hazard before an irreversible WLD transfer. No production incident is asserted.

- One query generation owns its results; a new query, selection, modal close or unmount invalidates the previous generation.
- Abort superseded fetches, but also check cancellation after each await because transports and test doubles may ignore abort.
- Do not expose stale results or report a failed search as an empty successful result. Show an accessible error state and allow retry.
- Require valid recipient UUID and display name from the backend before making a recipient selectable; cap at ten.
- Preserve the existing authenticated frontend BFF → Nest wallet search → owner-filtered PostgreSQL read → Android app-api route. No DB schema, financial function, migration, permission, or balance mutation.
- Preserve existing P2P retry/CSRF PR #1026 and recipient privacy PR #1034. The new branch is independent from latest main; merge only after reviewing both PRs.

## Execution (TDD)
1. Write a hook regression that returns the newer response before the older response; demonstrate RED stale overwrite.
2. Test query change, cancellation, non-OK response, malformed result and minimum query length.
3. Implement a cancellable recipient search hook, integrate into the modal and show an accessible failure state.
4. Run focused regression, relevant API/backend tests, full lint/typecheck/build/unit/security gates, and read-only DB owner/data invariants.
5. Recheck latest main and integrated planning; record exact SHA, PR/CI status and hold official Test/Production unless all required gates pass.

## Risk / rollback
Frontend-only behavior; rollback is to leave the Draft PR unmerged or revert its commit. Never change the main Worktree or apply a migration. No claim of exact-SHA authenticated Test or Production readiness from mocked unit tests.
