# v2026.11.17.5 — Spring finance and engagement P0 integration

## BEFORE — 2026-11-17 07:30 KST
- Owner approved fixing remaining work. Read main integrated PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, docs/RELEASING.md and AGENTS.md.
- Latest source main: cd822aa098d16a6f8bbfa5e41cf721eb1594e767.
- Existing draft PR #3218 is isolated, tested 114 Spring tests; PR #3215 KDIC 4 focused tests pass but full suite blocked by Phase7 duplicate /engagement/dopamine/status on main.
- SEC1 authorization worktree has concurrent uncommitted SecurityConfig / AdminAuthService changes; do not modify them or use same files.
- Only combine prior security/finance P0 fixes into a new branch. No money/DB mutations; preserve legacy route gateway until tested end-to-end.
## MIDPOINT — 2026-11-17 07:36 KST
- Main SHA remained cd822aa098d16a6f8bbfa5e41cf721eb1594e767 after refetch.
- Cherry-picked source fixes 9a21521e82 (engagement) and 829521417b (KDIC). Their combined Spring clean test bootJar passed 118 tests.
- New KDIC admin negative RED tests: 3/3 failed because anonymous overview returned 200 and ledger/write routes returned 503 without authentication.
- New KDIC fake-overview RED test failed because failed DB calls returned invented money values. Minimum fixes required DB-validated superadmin role and authoritative source. Additional role unit and HTTP checks were added.

## CLOSE — 2026-11-17 07:40 KST
- Spring test profile full clean test bootJar: 30 JUnit XML suites, 126 PASS / 0 FAIL / 0 SKIP; 78MB executable JAR. Real embedded HTTP KDIC authorization-negative tests passed.
- Secured admin KDIC overview, ledger-integrity, assess-premiums, liquidity-loan and payout (all v1 and non-v1 aliases) using DB-resolved signed-in superadmin, not spoofed X-User-Id or internal token.
- Removed KDIC false financial source fallbacks and unhealthy invented BIS/reserve ratios; valid missing financial source fails closed 503.
- Baseline live public edge still exposed old Spring KDIC overview/ledger-integrity HTTP 200 without cookie and engagement streak 200 with forged X-User-Id. Not claiming production fix until edge or exact-SHA Spring release.
- Kept concurrent SEC1 SecurityConfig, SEO and admin-logs branches untouched. No operational Test, Production, DB or money mutation.
- Remaining release hold: official exact-SHA Test, real admin MFA/CSRF positive E2E, canonical ledger-backed KDIC transactions, full Spring security, independent restore and zero-downtime rollback evidence.
