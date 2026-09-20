# Update Log

## v2026.09.20.302 — Frontend Full Rebuild Phase 1 (Global Shell & Auth/Account Modern FinTech UX)

- Branch: `feat/frontend-rebuild-v2026.09.20.302`, base `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- Eradicated AI-generated artifacts (repetitive generic card grids, excessive neon gradients) based on 10k+ real-world reference datasets (SeeClick 10k, WebUI 41k, RICO 66k) and Toss/Robinhood modern FinTech guidelines.
- Overhauled mobile bottom navigation (Home, Work, Stocks, Wallet, Account) and responsive masthead with zero horizontal overflow across 320px-1440px and 44px+ touch targets.
- Re-architected `/login` into a focused high-contrast FinTech authentication card, and enhanced `/account` and `/account/security` with intuitive active multi-session remote termination and identity management.
- Promotion to production follows exact-SHA isolated Test validation via zero-downtime host blue-green deployment.

## v2026.09.20.301 — Frontend colour and contrast audit

- Branch: `feat/frontend-contrast-v2026.09.20.301`, base `0b973824d85379119813f9b9f53cd7cdd4ddeb93`.
- Split light/dark semantic palettes, removed hard-coded light chrome, and corrected low-contrast text/action colours across home, shop, work, inventory, businesses and admin surfaces.
- Light-mode tertiary text improved from 3.77:1 on the page background to 4.90:1; tested dark-mode foreground roles are 6.14:1 or higher.
- Added automated WCAG contrast regression coverage and constrained user-selected point colours so white primary-button text stays readable.
- Reference corpus uses SeeClick 10k web subset, WebUI 41,970 web screens and RICO 66k+ UI screens, combined with WCAG/GOV.UK/Atlassian/Material guidance.
- Production promotion remains blocked until exact-SHA Test verification and the broader full-frontend rebuild gate pass.

## v2026.09.20.297 — Frontend rebuild foundation

- Branch: `feat/frontend-rebuild-v2026.09.20.297`, base `4dcd2ba112ae57565eed7444fe1d36512b926a3b`.
- Rebuilt the global visual foundation, shell spacing, page headings, cards and buttons without changing backend authority.
- Frontend typecheck/build and 90/90 test files with 681/681 tests pass.
- This is the rebuild foundation; route-by-route composition continues before the rebuild can be marked complete.

## v2026.09.19.275 — Blue/green continuity and automatic latest-build refresh

- Branch: `ops/blue-green-cache-refresh-v2026.09.19.275`.
- Added automatic cache-busted stale-build refresh without clearing login state and a reusable canary-first host blue/green deployment helper.
- Pre-promotion checks: helper regressions, frontend 7/7, typecheck, and real-DB authenticated-session continuity passed.

## v2026.09.19.274 — Deployment continuity and cache-freshness standard

- Branch: .
- Made zero-downtime frontend/backend handoff, PostgreSQL-backed member-session continuity, and automatic latest-shell cache revalidation mandatory release gates.
- Runtime code and Production services are unchanged by this documentation-only release.

## v2026.09.19.265 — Test routing guard and zero-downtime Production promotion

- Closed split-brain Test routing: backend identity/health and frontend/BFF now use stable 3100/3101 from one exact application SHA.
- Added a host Nginx routing regression checker that rejects transient Test UI ports and asserts stable Test/Production upstreams.
- Advanced Test and Production schema through migration 208 after a fresh encrypted Production backup, then promoted application `b1b1f7a…` via tested canaries and Nginx reloads without interrupting public traffic.
- Final Test/Production version, health, 146-item catalog and required public-page smoke checks passed; obsolete canaries were stopped and failed-unit count is zero.


## v2026.09.19.263 — Exact-SHA Test runtime repair

- Added split Test systemd release templates so stable secrets are no longer mixed with release-local `.env` files.
- Added a validated release-env generator that pins Test backend/frontend to the same exact Git SHA and API origin without writing secrets.
- Recorded and fixed the `EnvironmentFile` precedence failure that made a v259 candidate bind the stable 3100 port instead of its intended candidate port.
- Promotion remains Test-first: exact-SHA public version, backend health, catalog, noindex and page smoke must pass before zero-downtime Production promotion.
## v2026.09.18.215 — Debian boot continuity and Discord voice auto-start contract

- Documentation-only version; no application SHA or runtime release was changed.
- Re-verified the authorized Debian 13 host: backend, frontend, Discord bot, Economy AI, MCP gateway, Docker, Nginx, and the GitHub Actions runner are enabled/active; the Production PostgreSQL container on host port 5433 is running with Docker restart policy `unless-stopped`.
- Recorded the boot contract that the Discord bot must start automatically and reconnect to target voice channel `1536572442422550538`; the existing voice watchdog remains the recovery path for dropped voice sessions.
- Re-applied `systemctl enable --now` to the core runtime plus Nginx/runner, confirmed public Production and Test returned HTTP 200, and confirmed backend `/health` returned HTTP 200.

## v2026.09.18.214 — v213 Production release evidence

- Documentation-only version; runtime remains v213 exact main `24b85df1e0e5f922e461b1dcea82ec291bf54e48`.
- PR #467 / CI #1279 passed, Test exact-main edge passed responsive/CSP/backend gates, and Production was promoted zero-downtime through canary then persistent port 3001.
- Production browser QA: 27/27 on canary and 27/27 after persistent cutover; backend unchanged; old port 3201 frontend retained as rollback anchor.

## v2026.09.18.213 — AdSense iframe CSP Test-gate repair

- Real Test-edge Chromium found `ep2.adtrafficquality.google` and `www.google.com` iframe blocks after v212.
- Ads-enabled `frame-src` now admits only those reproduced AdSense origins; ads-disabled mode remains `frame-src 'none'`.
- Production remains blocked until v213 exact-main Test browser QA reports zero relevant CSP errors.

## v2026.09.18.212 — Full UI QA and browser hardening

- Branch: `fix/ui-full-qa-v2026.09.18.212`, exact base `d6d2798535894c54854135c23e37d972d267baa1`.
- Fixed 280 px grid min-content overflow on deletion/legal/shop surfaces, mobile shop-search focus zoom, duplicated site-brand titles, and the confirmed Gallery AdSense auxiliary-script CSP rejection.
- QA: targeted regressions 15/15, frontend 71 files / 623 tests, typecheck/build pass, lint 0 errors; 300 responsive browser checks contained no confirmed UI defect after redirect-race reruns.
- Runtime promotion remains Test-first and frontend-only; backend/database are unchanged.

## v2026.09.18.201 — Mobile-responsive UI QA and overflow hardening

- Branch: `fix/ui-responsive-qa-v2026.09.18.201`, based on the v200 authoritative plan/main baseline.
- Removed fixed-width mobile overflow risks in the global menu, five-tab bottom navigation, banking cards/actions, and inventory quick slots.
- Added a mobile responsive regression test; frontend validation passed 70 files / 619 tests, workspace typecheck, Production build, and repository lint with 0 errors and 11 pre-existing image warnings.
- Headless Chromium at 320/360/390 px passed 21 public-route render combinations with no document-level horizontal overflow. A pre-existing Google ad-quality script CSP rejection on Gallery remains tracked separately.
- No database migration or API/auth/ledger/entitlement contract changed. Exact-SHA Test backend/frontend smoke remains required before Production promotion.

## v2026.09.17.195 — v193 Production evidence

- Recorded zero-downtime Production remediation for the v193 Next.js API-cache permission fix.
- Active cache ownership is now `debian:debian`; frontend/backend PIDs remained unchanged.
- Health/BFF/public page probes passed and the post-repair window contained no new cache or backend fatal/database errors.

## v2026.09.17.194 — Discord guild command synchronization

- Branch: `fix/discord-command-sync-v2026.09.17.194`, rebased onto current `main`.
- Found a contract gap: startup logged seven commands as registered, but registration used fetch/edit/create and did not reset the guild command collection.
- Changed music registration to atomically replace guild commands with the exact seven supported music commands; application-global commands remain untouched.
- Added a regression test and expanded the bot test script; local `npm ci` and `npm test` passed with 0 vulnerabilities and 1/1 regression test.

## v2026.09.17.193 — Frontend API cache runtime permission guard

- Branch: `fix/frontend-api-cache-permissions-v2026.09.17.193`, based on `5d5826b21a9e4ae98fd0dcbe771d57fa8c674c84`.
- API audit found healthy NestJS/BFF paths but repeated Production Next.js `EACCES` failures under `.next/cache/fetch-cache`.
- Added a release-root constrained helper and regression test that prepares only the mutable Next.js cache and verifies runtime-user write access.
- Added EN/KO host-mirror deployment guidance; backend, database and migration 204 are unchanged.

## v2026.09.17.184 — AI profession assignment-limit auto control

- Branch: `feat/ai-job-limit-auto-v2026.09.17.184`, based on `3f523e6708af2bd9d24b60282f26619263a8c53d`.
- Added migration 204 with captured work-task daily-limit reference baselines and eight bounded per-profession adjustment knobs.
- Added soft-control-first tightening, shortage loosening, evidence-gated automatic relaxation and deterministic rollback compatibility.
- Marked assignment daily-limit proposals high risk in the dual AI council (`dual-economy-council-v3`).
- Reconciled PROJECT_PLAN, AI Economy Controller and Jobs/Mastery specs in English and Korean with the actual runtime quota contract.
- Local pre-release evidence: migrations 002→204 succeeded on isolated PostgreSQL 17.11; targeted AI/economy/work regression tests passed 42/42 across five files; repository lint completed with 0 errors and 11 pre-existing image warnings; full workspace typecheck and production build passed; `git diff --check` passed.

## v2026.09.16.151 — Runtime and GitOps convergence

- Converged application `main`, public Test, public Production, and GitOps desired Test/Production references on exact SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40`.
- Promoted exact-SHA Test first and passed public backend/API/SEO-boundary QA before Production.
- Created a fresh Production database backup before the exact-SHA Production promotion and preserved the previous Test/Production release directories as rollback anchors.
- Re-ran the GitHub Production Release successfully; immutable Production images and the Production-ready signal now exist for the exact SHA.
- Merged GitOps Test PR #78 and Production PR #79, then passed Runtime Drift Watch run `35069150294`.
- Production Kubernetes reconciliation remains intentionally suspended until NixOS administrative access and cluster-database reconciliation are restored; the Debian systemd runtime is the current public authority.

## v2026.09.12.13 — Automatic Test→Production release pipeline

- Internal release pipeline version: `v2026.09.12.13`.
- Branch: `ops/auto-test-prod-v2026.09.12.13`.
- Added exact-SHA Test identity, fail-closed Test smoke gating, automatic Production image creation, and a cross-repository Production-ready signal.
- GitOps automation remains the only cluster mutation path; application Actions do not receive kubeconfig or Production database credentials.
- Rollback anchor remains the previously pinned Production image SHA. Production success is reported only after the public exact-SHA and backend/database smoke checks pass.

## 2026-09-03 — Comprehensive Moneyverse Enhancement and Optimization

- Created branch `feature/moneyverse-comprehensive-enhancement` from `main`.
- Plan and execute seven key enhancements:
  1. Google Search Console and AdSense Policy Compliance: GSC verification metadata, JSON-LD structured data (Organization, WebSite, FAQPage), social metadata, and policy-compliant CLS-safe ad containers.
  2. Casino (Lucky Zone) Multi-Game Expansion: Add High-Low and Lucky Wheel games with transparent PPM probabilities, expected odds display, and real-time loss limit enforcement.
  3. Profile Photo and Media Relay Audit: Ensure robust MIME inspection, private storage retention, and smooth avatar fallback rendering.
  4. Administrator Master Console Audit Log Viewer: Enhance immutable audit log search, chain integrity verification, and delivery tracking.
  5. Member Balance Adjustment (Admin Adjustment Dialog): Implement direct mint/recovery adjustment modal with mandatory 10+ char reason, step-up re-authentication, and atomic ledger transaction commit.
  6. Branding Alignment: Apply official naming conventions (WLD/덕, 덕지갑, 잡보드, 덕마켓, 마이비즈, 마스터 콘솔) per Appendix A.3.
  7. Edge and Server API Optimization: Enable gzip compression, long-term static asset caching, and request parallelism.

## 2026-09-03 — Main integration, consent flow, announcement images, and live work countdown

- Integrated the guide onboarding, locale switcher, administrator-console UX, and media relay fixes into `main`.
- Changed sign-in to identify the member through OAuth first, then require current terms, privacy, and age acknowledgement before protected service use.
- Added announcement image upload, private-disk storage metadata, publication-gated media access, accessible alt text, and public announcement rendering.
- Prevented transient media 404 responses from being cached by the web tier.
- Added a live seconds-resolution countdown to active work cards; the submit control enables immediately when the minimum duration expires.
- Applied migrations 002–112 to a clean PostgreSQL 17 database and exercised announcement create/image/publish/public-read as the least-privileged application role.
- Verified all 1,192 backend tests including database integration, 448 frontend tests, 23 contract tests, and 6 migration tests.

This file records incremental project changes so concurrent work can avoid overlapping edits.

## 2026-09-03 — Guide onboarding refresh

- Created branch `codex/guide-onboarding-20260903`; no changes will be pushed directly to `main`.
- Reviewed the existing `/guide` page, guide data, tests, shared page components, and repository instructions.
- Reserved the guide refresh scope: `frontend/src/app/guide/`, new guide-only public image assets, and this log.
- Generated and added `frontend/public/images/guide/newcomer-adventure.png`, a text-free illustrated path through quests, the wallet, the shop, and rewards for the guide hero.
- Added `frontend/public/images/guide/first-reward-loop.png` as a supporting illustration for the quest-to-reward loop.
- Expanded the guide data with a four-step quick start, three beginner guardrails, and FAQ answers for consent renewal and returning after losing one's place.
- Rebuilt `/guide` as a visual onboarding journey with an illustrated hero, direct start actions, a compact quick-start route, six connected checkpoints, a reward-loop explainer, beginner tips, a first-day checklist, expanded FAQs, and a final call to action.
- Added guide-data coverage for the four quick-start steps and three beginner tips.
- Verified formatting, lint, workspace type checking, 23 contract tests, 6 migration tests, 696 backend tests, 433 frontend tests, a production frontend build, and a local HTTP 200 render of `/guide`; 299 database-backed backend tests skipped because no test database URL was configured.

## 2026-09-03 — Korean and English locale experience

- Created branch `codex/i18n-language-switcher-20260903`; no changes were made directly to `main`.
- Added Korean-default locale detection that selects English for visitors outside Korea, with browser language as a fallback when country data is unavailable.
- Added a persistent Korean/English language selector in the global masthead, designed as a compact Material-style globe menu with clear selection state and accessible touch targets.
- Made an explicit language selection override automatic detection for one year.
- Localized the global brand, navigation, session controls, footer, and primary public home-page marketing content.
- Added unit coverage for country and browser locale detection and for the language selector interaction.
- Google Stitch was requested, but no Stitch connector or installable Stitch plugin was available in this Codex environment; the implementation follows current Google international-site and Material interaction guidance directly.
- Verified the change with repository linting, workspace TypeScript checking, 23 contract tests, 6 migration tests, 696 backend tests, 438 frontend tests, and a successful production build with 17 static pages generated; 299 database-backed backend tests skipped because no test database URL was configured.
- Passed the control-byte and committed-secret checks. The production dependency audit found no high-severity vulnerability and reported two moderate-severity vulnerabilities.

## 2026-09-03 — Administrator console usability

- Created the isolated `codex/admin-console-ux-20260903` branch from `origin/main`.
- Replaced the flat member table with a searchable, status-filtered directory and summary cards.
- Added a direct path from each member row to a dedicated detail and activity-log view.
- Added a dedicated member detail page with status context, high-risk actions, and the latest 50 member-targeted audit events.
- Made the administrator back-navigation component support contextual parent destinations.
- Prepared the audit screen for a dedicated Discord delivery-history page.
- Added a dedicated delivery-log page with summary counts, completion timestamps, and routing navigation.
- Added the delivery-log destination to the administrator console navigation map.
- Added interaction coverage for member-name search, status filtering, and detail-page links.
- Grouped administrator destinations into member safety, economy operations, and records/delivery sections.
- Rebuilt the administrator home navigation as three clearly labelled, responsive card groups with stronger focus and hover states.
- Verified the frontend TypeScript build and all 435 frontend tests after the new routes and interactions were added.
- Fixed stale member screens by invalidating both the directory and the active detail page after restrictions or forced logouts.
- Made authentication cookie requests preserve Cloudflare's authoritative client-address header like all other API requests.
- Final verification passed: workspace lint, 435 frontend tests, frontend type-check, and the optimized production build including both new dynamic routes.

# 2026-09-07 — Activity reliability, unrestricted work, and economy references

- Audited GitHub integration through merged PR #75. `main` contains the recent AI news,
  administrator boundary, photo moderation, and private Discord logging changes; no remote
  feature branch contains commits missing from `main`.
- Corrected the activity-log administrator guard order. The database already contained activity
  rows, but the endpoint returned 403 before the session was hydrated and the page rendered that
  failure as an empty result.
- Added client event IDs, retry persistence, non-success HTTP responses, and database deduplication
  for loss-resistant browser telemetry. Exact source IPs remain in the private database; Discord
  continues to receive only a masked network.
- Removed the remaining per-task overtime reduction. Verified repeat work now pays full WLD and
  EXP without a daily task-count cap.
- Added seven repeatable shop purchases as voluntary currency sinks and published the reliability
  and virtual-economy reference links on the getting-started guide.

## 2026-09-07 — Remove the legacy career-task limit and expand sinks

- Re-fetched GitHub and confirmed that `main` contains every recent remote change, including AI
  news, Discord delivery, photo moderation, mobile administrator access, and activity reliability.
- Found that the legacy assign-submit-verify work path still enforced each catalogue row's
  `daily_limit`, even though the direct-completion path was already unlimited.
- Removed that final assignment limit, made the compatible task-board field report zero as the
  unlimited sentinel, and aligned the member and administrator descriptions with full repeat pay.
- Added eight repeatable, non-investment convenience purchases across 350–60,000 WLD price bands,
  bringing the newly added voluntary sink catalogue to fifteen products.
- Added `docs/SITE_GAP_AUDIT_2026-09-07.md` with confirmed gaps, priorities, evidence, and release
  acceptance criteria.

# 2026-09-07 — 사진 공개·관리 및 단일 지갑 잔액 표시 복구

- 회원 사진 승인 후 DB는 공개 상태였지만 API가 내부 `/media/<key>` 경로를 외부 HTTPS 주소로 잘못 거부해 500을 내던 오류를 수정했습니다.
- 갤러리를 동적 조회로 전환해 승인 직후 공개 사진이 보이도록 했습니다.
- 관리자 콘텐츠 화면에서 대기·공개 사진 전체를 조회하고 공개/비공개 전환 및 영구 삭제할 수 있게 했으며, 삭제 시 내부 이미지 파일도 함께 정리합니다.
- 상점이 제거된 `cashBalance` 필드를 읽어 잔액을 0으로 표시하던 오류를 수정했습니다. 지갑과 상점 모두 동일한 `WalletOverview.balances.cash.availableAmount`를 사용합니다.
- 운영 원장 정합성 스냅샷에서 미균형 거래·누락 계좌·잔액 불일치가 모두 0임을 확인했습니다.

# 2026-09-07 — Account continuity, safe merge and resilient backups

- OAuth login now finds a provider identity by a key-independent hash, so a
  data-encryption-key rotation cannot create an empty duplicate account.
- Added a migrator-only, append-only account-fork merge operation. It transfers
  balances through the ledger, preserves chosen names and immutable history,
  merges supported photos/activity/progression/work state, and refuses unknown
  ownership state instead of deleting it.
- Test and production install staggered ten-minute encrypted full backups with
  overlap locks, one-hour freshness checks, bounded retention and result logs.
- Deployment reuses one SSH control connection to avoid repeated host timeout.
- Account merge ledger entries now have a clear Korean wallet label.
- Added the current project gap audit under `docs/findings/`.

## 2026-09-14 — v2026.09.14.70 Email verification delivery hardening

- Added high-confidence email-domain typo rejection, safe SMTP failure diagnostics, and optional `SMTP_RETURN_PATH` bounce routing.
- Confirmed the triggering production failure was an invalid recipient-domain submission, while preserving fail-closed delivery semantics.
- DKIM DNS/relay activation and public MX port-25 acceptance remain infrastructure prerequisites and are not falsely marked complete by this application change.

## 2026-09-15 — v2026.09.15.113 Test runtime routing recovery

- Diagnosed the promotion blocker: public `test.easy-scraping.com` was falling through the Production Nginx default upstream instead of the isolated Test frontend.
- Added an opt-in middleware bridge that forwards only the Test hostname to `TEST_FRONTEND_ORIGIN`; Production behavior is unchanged when the variable is absent.
- Verified the bridge on an alternate port: Production host stayed on the router build while Test host returned exact main SHA `c82153917095bf380b5336ef95ad6932c9d7a295`, public-catalog smoke returned 200, and Test remained `noindex`.
- Rebuilt the isolated Test frontend/backend from exact current main SHA instead of trusting a mismatched manual BUILD_ID.

## 2026-09-16 — v2026.09.16.136 Multi-agent economy AI planning

- Expanded the Moneyverse AI economy plan into separately versioned specialist agents that debate, challenge and audit one another before a policy is eligible for bounded automation.
- Added deterministic bounded stock-price formation, automatic shop repricing, and low-risk template-based SKU auto-publication with safety, affordability, anti-manipulation and rollback gates.
- Updated English/Korean controller and simulation specifications. Planning only; no runtime deployment.

## 2026-09-16 — v2026.09.16.138 Adaptive profession/daily-limit AI planning

- Added bounded AI control for primary-profession slots, active-profession concurrency, daily assignment/full-reward protection limits, and automatic relaxation back to unlimited.
- Kept ordinary daily limits unlimited by default and protected existing primary-profession selections/mastery through grandfathering.
- Updated integrated planning, scenario/QA requirements, and rollback/audit contracts. Planning only; no runtime deployment.

## 2026-09-16 — v2026.09.16.139 Dual classical + AI economy control research

- Built and committed a deduplicated 11,749-record OpenAlex+Crossref research candidate corpus with an English/Korean evidence review.
- Reframed Economy AI as two continuously running lanes: classical/deterministic authority/fallback plus AI/learned exploration.
- Added disagreement arbitration, failover, causal post-rollout calibration and explicit authority boundaries for stocks, shops, generated SKUs, jobs/limits and faucet/sink policy.
- Planning only; no runtime deployment in this version.

## 2026-09-16 — v2026.09.16.141 Paired specialist economy AI council

- Implemented six economy-AI specialist domains with two A/B seats each, independent/rebuttal review, exact-proposal arbitration and append-only 12-seat evidence.
- Preserved the existing deterministic policy engine as the fallback authority.
- Verified migration 200 on the development PostgreSQL instance and created AI storage on the second 100GB disk.

## v2026.09.16.143

Optimized the paired economy AI council for remote inference with dynamic domain routing, early exit, targeted rebuttal, bounded concurrency, exact-proposal cache and agent telemetry/scoreboard.
