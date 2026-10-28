# C v1145 — Account all-device sign-out truth and failure recovery (HOLD)

## Before work — 2026-10-29 05:42 KST
- Debian 13.6 miniPC reached; seven services active; development PostgreSQL reachable. Shared `/` 98% full, data volume 99% full: never write shared/live DB, run backups, or modify other workers' worktrees.
- Canonical `origin/main` at `35971c600f25869c96f1c666d4b9f58927202730`. Read AGENTS.md, README.md, README/README.ko.md, English and Korean PROJECT_PLAN, active PRs, QA v1357, and A/B/C activity. All 98 open PRs are drafts. C v1144 AI-news consent, B v624 venture, A shop features do not overlap.
- Initial shared-worktree inspection suggested unconditional success, but authoritative `origin/main` already catches logout errors and verifies other-session readback. Corrected P1 gap: a 204 logout response **without a valid session-clearing Set-Cookie** still produces `/login?signed_out_all=1`; cookie relay silently ignores malformed headers, leaving stale browser authentication state. This narrower failure is the only scope of this cycle. Backend `POST /api/v1/auth/logout` revokes session and returns 204 plus a clear-session Set-Cookie; no backend or DB schema change is required to use this real contract.
- Scope: truthful completion only after backend logout and browser cookie relay, explicit partial failure recovery, reject missing cookie-clear evidence; add executable mocked-action regression and mobile/a11y/noindex checks. Do not change unrelated logout, ledger, or other worker's code.
- Plan: RED test -> GREEN implementation -> focused/full frontend, lint, typecheck, build, contract, security, isolated PostgreSQL and CI where safe -> re-fetch main -> Draft/HOLD PR if any release gate missing. Exact-SHA official Test and Production prohibited without every gate.

## In progress — 2026-10-29 05:46 KST
- Rechecked the actual origin/main worktree, correcting the initial stale shared-worktree interpretation. Existing `security-action-receipts.test.ts` already covers logout exceptions and revocation readback.
- Executable action tests: 4 RED / 6 PASS on missing, unrelated, nonempty and nonexpiring session-clearing cookies (`tdd-red2.log`). No production code changed yet.
- Next: validate backend logout cookie-clear receipt before relaying; preserve existing `?error=logout` recovery and member-only/noindex UI.

## In-progress verification — 2026-10-29 05:47 KST
- `origin/main` re-fetched: unchanged `35971c600f25869c96f1c666d4b9f58927202730`.
- Implemented strict session-clear cookie evidence: only empty `mv_session` or `__Host-mv_session`, `Path=/`, `Max-Age=0`; `__Host-` requires `Secure` and no `Domain`. Refuses unrelated/malformed cookies before relay and never reports completion on failure.
- Updated existing success fixture to match real NestJS `clearSessionCookie()` response; no Backend, DB schema, API route or financial mutation.
- Focused action/readback/mobile/noindex regression 29/29 PASS (4 test files).

## Finished
- Pending exact-SHA full validation and PR review; never interpret candidate image build as official Test promotion.
