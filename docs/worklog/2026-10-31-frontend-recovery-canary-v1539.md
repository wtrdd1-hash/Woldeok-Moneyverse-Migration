# v2026.10.31.1539 — Exact-backend-SHA Frontend Recovery Canary

**STATUS: isolated HTTP canary verified / official Test + Production cutover NOT performed.**

## START
The owner requested actual operational recovery. Followed AGENTS, DOCS_INDEX, documentation policy, PROJECT_PLAN, integrated master and release guide. Reused isolated v1538 production-integrity branch; server main and other agents' active build worktrees untouched. Remote main 761a55a rechecked. Live backend source commit `95485a299885693e3becb694dfc36ad45e832f97` exists locally, but the original same-SHA compiled frontend bundle is not preserved in an independently verifiable existing release. The active frontend advertises a timestamp build instead.

## MID — controlled recovery candidate
- Waited for another developer's resource-intensive Next build to finish before creating a second Next build. Staged exact source commit 95485a in `/home/debian/moneyverse-task-records/prod-95485-recovery-v1538/repo`, detached and separate from all live/test directories.
- Installed frozen offline package dependencies. First frontend build failed **module not found @moneyverse/contract**; recognized correct workspace build-order prerequisite rather than masking the error.
- Built `@moneyverse/contract` and retried with explicit `BUILD_ID=95485a299...` and `NEXT_PUBLIC_BUILD_ID=95485a299...`. Next production build PASS; actual `frontend/.next/BUILD_ID` is the exact 40-char SHA matching the currently running backend.
- Launched a short-lived port 3893 preview, not on the public Nginx upstream. Raw HTTP redirects 308 to HTTPS (expected middleware); with production-equivalent `Host` and `X-Forwarded-Proto:https`, read-only GET `/`, `/frontend-version`, `/admin/bonds`, `/admin/pension` and `/login` each returned 200, version endpoint exactly `95485a299...`. Preview stopped after checks.
- Pushed immutable baseline Git commit to separate GitHub branch `fix/prod-95485-recovery-v1538` (never main). GitHub candidate/CI evidence is independent of these local HTTP probes.

## FINISH — important limits
- **Not authenticated QA:** HTTP 200 can be a public shell or login gate, not proof of admin financial functionality, session continuity or CSRF/authorization correctness. No live monetary POST was attempted.
- **Not a ready-to-promote full release:** this 95485a frontend is the historical backend-compatible recovery baseline, but does not contain the newer compact update-banner and bond read fixes from PR #2131 or finance warning from PR #2143. Blind rollback would reintroduce these defects. Official exact-SHA Test, finance/restored DB checks, sessions and zero-downtime compatible blue-green switch still required.
- No production Nginx/systemd/symlink update, data/WLD mutation or manual ledger repair. Existing runtime backend/old frontend mismatch is still P0 #2144.
