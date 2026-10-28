# Release A1125 — HOLD (shop upkeep attention)

- **No main merge, no official Test deployment, no Production promotion, no DB migration, no WLD/ledger writes, no feature switch, no rollback executed, no branch deletion.**
- Public Test `/api/version` reported `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; `test-current` symlink target missing. Production `/api/version` reported `unknown`. Neither is candidate exact SHA. No authenticated Test backend/API/DB/user flow, independent restore or zero-downtime smoke certification.
- CI and full root test must be green on **the final candidate SHA** before considering merge. Existing main blog regression and unresolved P0 incident #1663 prohibit promotion.
- Rollback strategy if eventually deployed: revert the optional read-only filter and member UI/API cache rule through a reviewed PR, deploy verified previous GitOps release; no schema/data rollback. Confirm authenticated shop list, settlement unchanged, app-api and release version after rollback.
- Branch audit: starting remote heads 15 including main, open PRs 13, recovery refs 352; final counts and candidate SHA in host report. No remote branch deleted; closed-unmerged #1636 and its commit preserved.
