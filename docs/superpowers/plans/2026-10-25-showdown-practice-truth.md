# P0 mini-showdown integrity — design and execution plan

1. Verify current main, policies, existing dopamine contract and parallel work. Problem: client controls dice/outcome and backend fabricates payout; no authoritative WLD ledger receipt.
2. RED: unit/controller test rejects user dice/outcome/stake, checks server random die bounds, practice-only payout; frontend tests assert failed request cannot advance or display a WLD reward; native gateway tests assert auth/CSRF forwarding.
3. GREEN: backend uses crypto randomInt for independent server dice, accepts only empty body, requires existing session+consent+CSRF, responds `PRACTICE_ONLY`, `payout: '0'`, no cache; no DB writes.
4. Frontend: browser calls a Next server action via mutate (session and one-use CSRF), renders server dice only, 2-wins best-of-three local display, shows explicit practice-only badge and recoverable network error, never claims WLD; Android app-api retains same route and forwards CSRF.
5. Verify focused and full lint/typecheck/unit/integration/build/security/SEO/a11y/app-api, isolated PostgreSQL read-only ACL, CI and exact-SHA Test; no main merge/Production without all required PASS.
6. Review diff, re-fetch main at midpoint and preintegration, preserve other worktrees and all unique unmerged branches, write English+Korean QA/release and detailed worklog.

Rollback: revert the candidate commit on the feature branch; no schema, ledger, balance, or production changes. Feature does not implement paid wagering or reward distribution.
