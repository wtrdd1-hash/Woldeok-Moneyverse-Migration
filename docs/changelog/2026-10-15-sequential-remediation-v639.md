# Changelog — v2026.10.15.639 (2026-10-15)

- Public 404 navigation/redirects repaired; calculators stop claiming unverified WLD rewards.
- Stock candle API input/status preservation; backup admin step-up and IndexNow auth/owned-host fail-closed.
- Backend runtime release provenance read, QA routes CLI wired, bot QA parser corrected, docs merge marker removed.
- PvP/black-market money movement grouped in single Pg transaction with locks, conditional debit/rollback; secure RNG, disposable PG 4 PASS. **Not a canonical ledger settlement**.
- Test/scheduler safety: Test off and separate monetary auto explicit opt-in, no fabricated source-less faucet/sink.
- Acceptance: frontend 1,228 PASS, backend nonDB 1,199 PASS/29 skipped, build/type/179 mobile contract PASS, lint 0 errors/1,088 warnings. Full auth 5pass/DB ACL Test BLOCKED. No promotion.
- [Detailed EN](../findings/MONEYVERSE_SEQUENTIAL_REMEDIATION_v2026.10.15.639.md) / [Korean](../findings/MONEYVERSE_SEQUENTIAL_REMEDIATION_v2026.10.15.639.ko.md).
