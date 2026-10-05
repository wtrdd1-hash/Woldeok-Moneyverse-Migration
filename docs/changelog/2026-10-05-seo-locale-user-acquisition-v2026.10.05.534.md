# SEO Locale & User Acquisition Emergency Worklog — v2026.10.05.534

Status: IN PROGRESS
Started: 2026-10-05
Base main: 5c497639a919a5adf1ef648eba07f08bf7cd45a7
Branch: fix/seo-locale-conversion-v534

## Start record
- Re-read AGENTS.md, PROJECT_MEMORY.md, integrated implementation_plan.md, v527 SEO demand research/spec, and latest main before changes.
- Production evidence: the root URL can render locale-dependent metadata/content while advertising fixed locale canonicals/hreflang.
- Source evidence: DEFAULT_LOCALE is en; proxy derives locale from GeoIP/Accept-Language and sets a detected cookie without moving the request to a stable locale URL.
- Conversion evidence: home has no prominent account creation CTA; the only account-related home copy is indirect/login-oriented.
- External search evidence: the generic Moneyverse brand query is occupied by unrelated services, so acquisition must emphasize Woldeok-specific branded queries and high-intent utility clusters.

## Intended v534 correction
1. Make Korean the default locale.
2. Stabilize locale URLs: root is Korean; new non-Korean geo-detected visitors are redirected to explicit /en, /ja, /zh URLs while explicit user preference remains respected.
3. Add regression tests for stable locale routing and Korean default.
4. Add a prominent low-friction signup/start CTA without gating utility answers.
5. Re-run SEO/unit/type/build gates, validate test host, then only promote after successful evidence.

## Mid-work record
- Mid-work origin/main recheck: unchanged at 5c497639a919a5adf1ef648eba07f08bf7cd45a7.
- Implemented Korean DEFAULT_LOCALE and stable root-to-explicit-locale redirect behavior.
- Ensured explicit locale prefixes are visible to rewritten server components in the same request.
- Added two home acquisition CTAs: free registration and ungated tools-first exploration.
- Focused locale regression suite: 10/10 passed.
- git diff --check: clean. Frontend typecheck/build gate is running through mv-task.

## Final local verification record
- Focused locale tests: 10/10 passed.
- Root workspace typecheck: passed for contract, database, backend, and frontend.
- Frontend production build: passed; 559 static pages generated where applicable.
- The first build attempt was invalidated by an out-of-worktree node_modules symlink; it was removed and the authoritative clean worktree install/build passed.
- No database migration is included in v534.
- Next release step: push branch, let Build Test Candidate validate/deploy the exact SHA to isolated Test, verify Test backend/frontend and SEO behavior, then allow the existing zero-downtime promotion gate.
