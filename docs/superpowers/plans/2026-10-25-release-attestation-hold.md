# P0 release gate: fail closed before verified isolated-Test attestation

Issue: #1088. Build Test Candidate success proves candidate build, not deployed Test or authenticated finance E2E. Current workflow may automatically squash-merge and delete branch, then dispatch a promotable main candidate.

Decision: until an independently verified SHA- and migration-bound Test/E2E attestation mechanism exists, the scheduler is read-only. Keep scheduled observations enabled, but remove automatic merge, branch reconciliation, branch deletion, workflow dispatch, and write permissions. Human-approved release procedure remains in docs/RELEASING.md; no alternate automatic bypass.

Steps:
1. Add regression test inspecting workflow permissions and mutating commands. RED against current workflow.
2. Replace mutating job with a read-only audit of open PRs; fail closed for every PR, even with successful candidate CI. GREEN.
3. Verify YAML parsing, release test suite, lint/typecheck/build where available, and latest main. Record unmet full Test/Production gates and do not merge.

Acceptance: no automatic PR merge or branch deletion; no main promote dispatch; only read-only GH_TOKEN scopes and gh api GET; explicit HOLD summary; no production changes.
