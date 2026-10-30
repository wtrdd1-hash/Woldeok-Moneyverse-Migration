# QA route ledger exact-SHA binding — Backend B v677

**Status:** Code candidate only; release HOLD. **Scope:** QA/release evidence validation, no API, schema, finance or service changes.

## Reproduced P1 defect

The route-ledger verifier previously accepted a complete five-pass ledger even when its self-declared `candidateSha` did not match the intended commit, or when an entry's `runtimeVersion` belonged to a different build. The package check also omitted required inventory and ledger paths. Passing fixture unit tests did not prove any authenticated route was exercised.

## Contract and implementation

- `verifyLedger` now requires an **independent** full 40-hex `expectedSha`, checks the ledger's full commit SHA, rejects a mismatch, and rejects any per-entry runtimeVersion that is not the ledger's exact SHA (case-insensitive hex comparison).
- CLI uses `git rev-parse HEAD` as its independent default. For an externally deployed Test candidate, pass `--expected-sha <40-hex>` explicitly; never derive expected SHA from the ledger being checked.
- `pnpm qa:route-ledger:check` now supplies canonical inventory and ledger file paths. Missing real ledger evidence remains a hard failure, not an empty/green result.
- Root `pnpm test` now runs the QA ledger regression suite, so the binding check is part of the required CI test path.
- Regression tests include mismatched candidate SHA, mixed runtime, malformed/missing expected SHA and a synthetic CLI positive/negative control. Synthetic controls are **not** Test E2E evidence.

**Manual command:** `pnpm qa:route-ledger:check --expected-sha <exact-tested-SHA>` after collecting `artifacts/qa/route-inventory.json` and the **real** `artifacts/qa/full-route-ledger.json`. For evidence from an isolated worktree, use that worktree's exact SHA.

**Remaining gates:** Genuine authenticated five-pass route evidence, admin/dynamic fixtures, actual Test frontend/backend/app-api/DB identity, release policy, security, full CI, independent restore and Production smoke. This validator does not verify screenshots, signatures or a deployed runtime by itself. No main merge or Production promotion without all release gates.
