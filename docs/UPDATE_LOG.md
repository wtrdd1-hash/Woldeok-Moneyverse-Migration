# Update Log

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
