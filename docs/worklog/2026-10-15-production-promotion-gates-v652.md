# Production promotion gate verification — v2026.10.15.652

## Before work — 2026-10-15 KST
- Explicit user request: promote using the documented Moneyverse Production process.
- Isolated worktree from exact `origin/main=bf55b0571193b4470c9a305ea8b5937bacd2d501`; now `ops/production-promotion-gate-v2026.10.15.652`.
- Version 651 was initially allocated, then renumbered to 652 to avoid another worker's already-active v651 implementation. The superseded prework branch has no runtime effect.
- Reviewed `AGENTS.md`, current canonical project/integrated planning, index, both release guides, current Debian host baseline, infrastructure authority, production deployment runbook, immutable release staging helper and documentation policy.
- Non-negotiable gate: only exact-SHA Test/backend/frontend/DB/session acceptance, economy invariants, verified rollback and zero-downtime replacement may authorize Production traffic cutover.

## In progress — evidence gathered on the miniPC
1. Source main `bf55b0571193b4470c9a305ea8b5937bacd2d501`: GitHub CI PASS, Build Test Candidate PASS; the latest merged web PRs #841–#843/#845 were **documentation-only**. Android #27 hardens signing but is not a web runtime release. The unmerged runtime PR #844 is DRAFT/BLOCKED despite its own CI and candidate-build success.
2. Host systemd/Nginx live service inventory: `moneyverse-backend`, `moneyverse-frontend`, `test-main-backend`, `test-main-frontend`, `nginx` ACTIVE. Read-only public `/health` probes returned HTTP 200.
3. Production pointer `production-current -> prod-v600` and live process cwd `prod-v600`; no `.moneyverse-release.json` in that legacy directory. Production `/api/version` HTTP 200 reports `unknown`, so exact Production source identity is not certified.
4. Test pointer `test-current -> test-v618-7fa3f245bbc3` with manifest SHA `7fa3f245bbc3b308ae3e26ff3bfb0fbc70ba4642`, but active Test backend release config and publicly observed `/api/version` report `888311cc9240e8c5bb69ef51b92f8b738c6ad3be`. Active Test frontend release config reports `7fa3f245...`. **Backend version identity conflicts with Test release manifest and frontend**; neither equals the latest web main nor unmerged #844.
5. Read-only live development-role ACL query: `moneyverse_app` has DML capability against **237 public tables**. Eleven PUBLIC-callable `SECURITY DEFINER` routines. These reproduce existing P0 privilege-model findings and cannot be dismissed by passing TypeScript/unit tests.
6. No complete authenticated five-pass full-route UI report or Test session-preservation/rollback restore evidence was established for the promoted candidate. No verified replacement Production backend canary was found. A separate v635 frontend canary exists; frontend canary alone does not prove safe backend handoff.
7. Another worker is actively building under `/srv/moneyverse-tasks/fix-safety-reauth-v651`. Avoided modifying shared Test state, other workers' branches or in-use release pointers to prevent collision.

## Finished — STOP / BLOCKED, no Production promotion
- **Decision:** HOLD. `docs/RELEASING.md` section 2 explicitly prohibits promotion if Test does not serve the exact intended candidate. Required financial, authorization, authenticated UI, restart/session and rollback acceptance gates also remain open.
- **Changes made:** isolated, versioned operational evidence documentation only. No Test or Production pointer switch, Nginx/systemd restart, DB change, migration, member balance, feature switch, user session revocation or Discord bot restart.
- **Required remediation before retry:** determine a single approved candidate/source SHA; pass code/DB ledger privilege and idempotency negatives; stage and serve that exact SHA from isolated Test with matching backend/frontend manifest+version; prove auth E2E (including admin and five full UI passes), post-restart session retention, DB/migration+ledger reconciliation, rollback readiness and backend/frontend zero-downtime canary; only then perform an atomic Production handoff and post-release smoke.
- **Verification:** read-only health 200, authoritative Test/Production identity and DB ACL query. These are diagnosis results, NOT production acceptance.
