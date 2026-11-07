# Backend B v774 — canonical, unambiguous client rate-limit keys (P1 / DRAFT / RELEASE HOLD)

- **Start:** 2026-11-03 09:39 KST; origin/main `0309abdf001942ac09dabaec9e582b45f36b90f2`.
- **Mid-run main:** `e83ad8a6d1b8d477bfbe661ea3cffd46f270509c` (QA documentation only). Independent worktree; shared OWASP audit checkout untouched.
- **Scope:** `backend/src/security/rate-limit.ts` and `.test.ts`; no route, request/response schema, database migration, financial data, or deployed service changes.
- **Bug and impact:** A single IPv6 peer had distinct rate-limit keys when represented in expanded/compact notation, or as IPv4-mapped IPv6 versus IPv4. Duplicate `CF-Connecting-IP` header arrays silently chose the first value. This is a rate-limit accounting integrity weakness, not evidence of exploitation.
- **Implementation:** Canonicalize valid IPv6 through WHATWG URL parsing; collapse IPv4-mapped addresses to canonical IPv4; reject ambiguous repeated proxy identity headers and fall back to validated socket peer. Keep existing trusted-edge switch and untrusted `X-Forwarded-For` rejection.
- **RED:** 3 new regression cases failed before implementation. **GREEN:** 31 rate-limit tests and 43 focused security tests passed.
- **Verified gates:** contract build PASS; Backend Typecheck PASS; changed-file ESLint PASS; Backend build PASS; Database tests 72 PASS / 5 SKIP; mobile API contract 184 endpoints / 684 methods PASS; Frontend Typecheck PASS; full lint 0 errors / 1,027 warnings.
- **Unmet gates:** Backend full test exceeded 160-second limit at one worker (no complete result); Frontend full test failed 506 / passed 2,412, with `React.act is not a function` in failures. No authoritative full-suite PASS. Official real PostgreSQL/app-role/authenticated E2E, isolated exact-SHA Test, restore, release GitOps, Production smoke are not run. Do not merge or promote.
- **Coordination:** PR #2575 also changes `rate-limit.ts` for identity-link throttling; review combined diff and retest before any merge. A/C/QA/Planning branches and services are not modified.
- **Disposition:** Draft/HOLD. Only ship after full required gates and exact SHA provenance pass.
