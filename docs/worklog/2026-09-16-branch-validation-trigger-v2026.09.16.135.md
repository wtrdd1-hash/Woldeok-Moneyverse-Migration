# Branch validation trigger coverage — v2026.09.16.135

## Scope

Follow-up to v2026.09.16.134. The queue drain was fixed, but two classes of branches could still remain indefinitely: managed prefixes that were not part of `Build Test Candidate` push filters, and any eligible branch whose exact current HEAD never received a successful candidate run.

## Change

1. Added `feature/**`, `bugfix/**`, and `security/**` to `Build Test Candidate` push triggers.
2. When the integration scan finds an eligible branch with no successful exact-HEAD candidate run, it now dispatches `test-candidate.yml` for that branch instead of silently skipping it.
3. Added validation-dispatch count to the workflow summary for operational visibility.
4. Existing exact-SHA merge gate, conflict skip behavior, final-main candidate dispatch, isolated Test verification, and Production gate remain unchanged.

## Expected result

Fresh pushes on every managed branch prefix validate automatically. Older or otherwise unvalidated eligible branches are picked up by the hourly integration scan and receive a candidate run, whose successful completion immediately re-enters the event-driven integration workflow.
