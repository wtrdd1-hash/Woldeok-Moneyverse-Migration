# QA v1221 — Locale and Login Touch-Target Regression (Draft / Release Hold)

## Scope and baseline

- Base: 46794ff0ac3deeae87862ac9b74d209798e8d074 (remote main at start and mid).
- Isolated QA branch: audit/qa-v1221-20261024-1115.
- Superpowers: systematic-debugging, test-driven-development, verification-before-completion and using-git-worktrees reviewed.
- No database, production, Test environment, migration, feature switch, or other worker branch change.

## Evidence and root cause (RED)

- Official exact-main CI 40050878918 fails its runtime Test job, and Test Candidate 40050878912 fails. Local pnpm test reproduced 5 failing frontend assertions / 1,395 passing.
- frontend/src/lib/locale.test.ts assumes Vietnam resolves to English, but the current five-locale product implementation deliberately maps VN to vi. The test also omits vi from explicit choices.
- frontend/src/app/login/login-touch-targets.test.ts requires a verbatim CSS class attribute. Current login button retains min-h-11 w-full sm:w-fit but adds font-bold; the original accessibility invariant is still present.
- Three seo-routes.test.ts assertions concern the route contract and are already owned by concurrent Draft PR #1099. This QA must not edit the overlapping file.

## Execution checklist

- [x] Inspect exact-main failures, source implementation and overlapping PRs.
- [x] Record failing baseline in isolated QA workspace.
- [x] Replace brittle assertions with current supported locale and class-token checks.
- [x] Verify focused tests, lint, full regression (FAIL), build; exact-head CI to be checked after push.
- [ ] Create Draft PR, preserve concurrent PRs, do not merge or deploy.
- [ ] Record final gate results and blockers.

## Release decision

HOLD: no Production promotion until full security, deployed isolated Test exact-SHA login/finance E2E, real PostgreSQL ACL and restore gates pass.

## Verification checkpoint (2026-10-24)

- Focused GREEN: locale + login 7/7 PASS.
- Independent full candidate regression: 3 frontend FAIL / 1,397 PASS, all in concurrent SEO file; 1,313 backend PASS / 398 skipped; DB package 15 PASS / 3 skipped; 38 contract PASS; 179 app-api endpoint references match.
- Candidate lint: 0 errors, 1,144 warnings; typecheck PASS; build PASS.
- Security: production pnpm audit 2 HIGH; full pnpm audit 2 CRITICAL/10 HIGH; Discord bot npm audit 1 CRITICAL/5 HIGH.
- Real isolated Test exact-SHA auth/finance E2E and restore: NOT RUN. Release HOLD.
- Remaining work: coordinate Draft PR #1099 for SEO expectations and verify security + finance gates before any merge.
