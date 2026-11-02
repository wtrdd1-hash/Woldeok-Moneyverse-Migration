# QA v1465 — Route inventory source parity (DRAFT / RELEASE HOLD)

## Before work — 2026-11-02 15:18 KST
- Source: `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`; independent branch `qa/v1465-route-inventory-parity`.
- Existing full-route inventory contains 166 pages; source generator returns 173 pages. Seven routes omitted. The current ledger evidence file is absent; **this change does not invent browser passes**.
- Scope: add a deterministic test that compares the committed inventory against source-generated route names, metadata and canonical SHA, then regenerate the inventory. No runtime API, financial code, SQL, grants or deployment changes.
- Planned TDD: baseline RED -> regenerate -> GREEN -> policy suite -> latest-main sync -> Draft PR. Full authenticated route E2E, official Test exact-SHA and production promotion remain BLOCKED.

## In progress
- Pending RED/GREEN evidence.

## Finished
- Pending independent verification and release-gate audit.

### TDD and verification — 2026-11-02 15:18–15:20 KST
- RED: new committed-inventory parity assertion failed on baseline `routeCount` (166 vs source 173), exit 1. Evidence: `qa1465-evidence/route-parity-red.log`.
- GREEN: regenerated committed inventory from source: 173 routes, 36 admin, 33 dynamic, SHA `8e54bed383e8dfdd658a8e110f0035d27b9c3129ba35c5347c22dff0a48aa140`; 8/8 route-ledger unit tests PASS, exit 0.
- Changed-file ESLint PASS, `git diff --check` PASS. Entire `scripts/qa/*.test.mjs` **23 PASS / 1 FAIL** due to pre-existing `ui-backend-truth.v629` simulation wording expectation, independently tracked in Draft #2398; this change does not alter the failing test.
- No browser E2E evidence was produced; `artifacts/qa/full-route-ledger.json` remains absent. The new guard prevents stale inventory from being silently treated as complete; it does not certify 5-pass coverage.

## Finished — source-level change only / RELEASE HOLD
- Source-only parity assertion and regenerated inventory. No API, SQL, grants, money, live server, Test or Production changes.
- Exact-candidate CI, official Test authenticated 5-pass route ledger and GitOps approvals are mandatory before merge/release; no bypass.
- Shared `main` and all collaborator worktrees/branches preserved.

### CI root-cause investigation — 2026-11-02 15:20 KST
- Exact candidate SHA `2aa5a0a9c38d3cbd34fd158b861b1c8efc2ae61b` CI classify failed, runtime/policy skipped; independently reproduced `classify-release.mjs` exit 2 with `classification: UNKNOWN` because `artifacts/qa/route-inventory.json` is unclassified. This is a fail-closed control-plane policy, not a passing CI run.
- Additional gap: CONTROL_PLANE_ONLY CI policy did not execute the existing route QA unit suite, so simply allowlisting the exact inventory path would not enforce parity. Fix scope expanded narrowly: classify only the exact inventory artifact as QA control plane, keep all other artifact paths UNKNOWN, and run route ledger tests in the CI policy lane. TDD RED required before patch.

### Follow-up TDD — release classifier and CI gate
- Exact candidate CI #41399085560 FAILED at `classify` (policy/runtime SKIPPED): classifier returned UNKNOWN for the previously unclassified `artifacts/qa/route-inventory.json`. This is a fail-closed safety gate; no pass claim.
- RED: 2 new tests failed for exact QA artifact classification and policy-lane route suite execution. GREEN: 26/26 classifier tests PASS after exact-path allowlist and CI policy lane test. Unknown other artifacts remain UNKNOWN.
- RED: executable/symlink payload test failed; GREEN: 27/27 classifier tests PASS after enforcing regular non-executable Git blob mode for the exact QA inventory artifact. Full release test suite **152/152 PASS**; route-ledger unit suite **8/8 PASS**; changed-file ESLint PASS; git diff --check PASS.
- The inventory is QA control-plane evidence, not application runtime input. No broad artifact allowlist or bypass for unknown paths. All other release gates remain HOLD.


### Workflow-scope restriction and safe CI fallback
- Pushing a change to `.github/workflows/ci.yml` was rejected by GitHub: OAuth token lacks `workflow` scope. No permission bypass or workflow mutation attempted.
- Instead, the existing mandatory release policy suite (`node --test scripts/release/*.test.mjs`) now executes the full-route source parity unit suite as a nested subprocess. This enforces parity under the already authorized policy workflow without changing GitHub Actions YAML. Other unclassified artifacts remain fail-closed.
- The rejected unpushed local commit was reset on this QA-only branch; the published first commit and all collaborators' branches were untouched.
- Verified nested Node test runner needs `NODE_TEST_CONTEXT` removed in the child environment; otherwise it silently skips nested tests. Explicit RED with stale inventory: release policy test **1 FAIL** and nested route parity **1 FAIL**. Restored generated inventory: full release suite **152/152 PASS** and route unit suite **8/8 PASS**. No skipped nested assertions claimed as coverage.
- The revised candidate contains no `.github/workflows` file changes, so the available GitHub credential may push it without workflow scope. Full candidate CI is still a separate required gate.
