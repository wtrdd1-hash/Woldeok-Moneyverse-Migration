# Frontend Transition — Admin Design and Global Support v2026.11.18.17

Status: STARTED; isolated code candidate; official Test/Production HOLD.
Owner approval: 2026-11-18 KST — "프론트엔드 전환진행승인".
Repository: wtrdd1-hash/Woldeok-Moneyverse-Migration
Branch: feat/spring-frontend-admin-chat-v20261118-17
Starting head SHA: a43b70d477fbb17d6c42d4e36a46d4e7ca3fc7c2, stacked on Spring security repair PR #3267 / routing PR #3264.
Main SHA at start: 0590fac4e8a82bc986ba1b8c64f014d18daca9e9.

## START — before implementation
- Authoritative plans: docs/planning/PROJECT_PLAN(.ko).md, INTEGRATED_PLANNING_MASTER(.ko).md, docs/DOCUMENTATION_POLICY(.ko).md; AGENTS.md; responsive/anti-clash/design guidelines; previous design #3268 and admin/chat prototype #3270. Read latest head/source baseline and PR list.
- Scope approval: transition from preview planning to real frontend **code development** on a separate Spring-compatible branch, preserving current production frontend until promotion is verified.
- Architecture discovered: Spring routing PR #3264 serves exported Next static files from Spring Boot SpaWebMvcConfig. Production code must be built from source and packaged/tested with exact-SHA Spring, not assumed operational because source exists.
- Current frontend already renders a functioning chat/support widget across member routes, but route-aware utility suppresses /admin. The Spring chat/support controllers trust client-provided identity headers and fallback UUID; SupportService may return fake success after SQL failure. These are integration-release blockers and are owned by Spring security team, not this UI branch.
- Existing admin dashboard uses real backend-derived evidence and renders UNKNOWN on missing metrics. Preserve that truth; no synthetic green statuses.
- Chosen design: update existing administrator layout theme without altering API or security semantics; expose a safe read-only administrator help dock on every admin route; keep one existing Support/Direct widget on non-admin routes, improve 56px launcher/safe-area/focus. Do NOT enable admin message transmission until backend is fixed.
- Conflict control: avoid all modified files in PR #3267 (Spring security), avoid overlapping PR #3270 docs; new UI branch touches narrowly scoped frontend components, tests, and versioned docs only.
- Planned: TDD RED/GREEN for admin dock, route-aware selection, style tokens and responsive mobile placement, typecheck/tests/build, Spring Test server validation where feasible; separate PR and no auto-merge or production publish.

## MID — implementation and evidence
- Rechecked GitHub main SHA 0590fac4e8a82bc986ba1b8c64f014d18daca9e9 and Spring repair base a43b70d477; no concurrent Spring/security files edited.
- Repaired broken inherited dependency symlinks by isolated offline pnpm install; original mini-PC checkout untouched.
- TDD RED: missing admin dock/route selection and 3 admin theme/launcher assertions. GREEN: 4 targeted test files, 20 PASS.
- Scoped navy/violet admin shell preserves authenticated data states; admin safe help/read-only dock, one existing member Support/DM with 56px, aria-expanded and mobile safe-area.
- Contract build, frontend TS, entire Next build (603 generation step), Spring bootJar, Spring admin API boundary unit tests 3/3 PASS. ESLint 0 errors; legacy widget 9 warnings.
- Entire frontend suite timed out after 105s (exit 124); adsense and SEO/search tests failed during execution. Cannot claim regression pass.
- Spring static JAR still contains old admin.html while newly built /admin and /support are Next dynamic. This blocks a full Spring frontend handoff and any official Test/Production promotion.


## END — implementation & test evidence
- Rechecked remote main and Spring repair base; isolated branch retains exclusive source scope.
- Scoped admin visual theme and safe admin help dock implemented; member chat existing API preserved and launcher improved.
- Focused 4 UI files / 20 tests PASS; contract build, TS, Next full build, Spring bootJar PASS; Spring admin boundary 3 and embedded random-port real HTTP 1 PASS.
- Full frontend test suite NOT GREEN (105 second timeout, ad/search failures). New Next dynamic admin/support pages NOT included in Spring static JAR, so live Spring UI handoff BLOCKED.
- Actual chat API identity and false-success P0 problems unresolved, so admin dock remains read-only. No Nginx/DB/ledger/production changes.
- Local private updates remain excluded from GitHub by the repository ignore policy. Candidate to be reviewed in stacked Draft PR, not merged or deployed.

## GitHub review handoff
- Stacked DRAFT PR #3275: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3275
- Based on Spring repair #3267 to avoid conflicting security-owner files; not merged or deployed. Code-level candidate only.
- Internal notes remain locally ignored; public bilingual planning, QA and changelog published to GitHub.
