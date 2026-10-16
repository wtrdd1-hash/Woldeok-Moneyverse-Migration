# v2026.10.16.740 — Branch integration, CI repair and Production evidence

**Status: IMPLEMENTED in isolated branch; CI/PR merge pending; Production BLOCKED.** [한국어](2026-10-16-branch-ci-production-audit-v740.ko.md)

## START — authority and concurrent work
Read `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/RELEASING.md`, Debian deployment/infra guidance, current `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`, v737 financial and v739 release evidence. Remote main at start and mid-work: `3c60c78569d68820e7c8285ffafeaab488b684ad`. Created isolated `fix/ci-pipeline-noop-rate-v2026.10.16.740`; did not edit concurrent Gemini or scheduled-agent worktrees, Production service/configuration, or a database.

## MID — observed failures and repairs
- GitHub Test Candidate run `38902388991` misclassified equal comparison base/head as `UNKNOWN`, incorrectly failing a branch pointing at the already existing main SHA. A new exact-ref `NO_CHANGES` class now preserves immutable identity evidence and a lightweight CI lane; runtime builds/Production dispatch remain restricted to runtime-relevant changes. Changed-but-unrecognized paths still fail closed.
- Auto Integrate run `38899841851` and Cleanup Merged run `38899542211` exhausted GitHub installation API capacity through per-branch requests. Auto integration now enumerates open main-targeted same-repo PR heads only, retaining the existing Draft/hold gates. Pruning fetches refs, batches merged/open PR evidence and deletes only an exact merged PR head that is an ancestor of current main, with force-with-lease. Active, conflicting, changed-after-merge and unevidenced branches remain intact.
- All 12 open web PRs were Draft at inspection. Android #23 was conflicting; #24/#25 were both Draft and conflicting. None meets a safe unconditional merge/delete standard. These PR contents require feature-level reconciliation rather than claim-based deletion.
- Local test-driven reproduction was RED before the fixes; classifier tests GREEN 17/17; all `scripts/release/*.test.mjs` GREEN 44/44. No actual GitHub CI/PR result for this new commit yet.

## Production release stop — verified on 2026-10-16
- Public Production source `176ca04ecfbd673e7f1057cdf83a9b92ea8f8272` (v717), Test `9618a2499328d207c9e34b969f6aa96121331749` (v735.2); both `/api/health` HTTP 200. Repository `main` is newer and not the observed Production identity.
- Verified the v717 systemd backend's approved environment-file chain before executing the *read-only* `verify-financial-readiness.mjs` against its actual backend DB. Result `BLOCKED`: `moneyverse_app` retains direct DML on account_balances, accounts, ledger_transactions, ledger_postings, system_treasury_vaults; 40 account projections include 19 uncertified historical opening/drift discrepancies totaling +4,779,188 WLD. Per-transaction imbalances and headers missing postings were zero, but this does **not** certify historical opening balances.
- The v530 five-pass authenticated all-route UI, migration/reconciliation, same-SHA Test, pre-existing member-session continuity and rollback gates remain mandatory. No Production cutover, financial mutation, fake accounting correction or bypass is performed or represented as complete.

## END — pending external evidence
This worklog covers the *isolated candidate* only. GitHub PR checks, final main reconciliation, safe source-branch deletion and any deploy require new exact-SHA evidence. An ordinary CI repair cannot authorize an unsafe Production upgrade.
