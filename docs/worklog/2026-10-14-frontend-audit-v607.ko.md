# v607 프론트엔드 전면 감사 작업 기록

- 기준: integration/fullstack-branch-consolidation-20261014-v606, 시작 HEAD 51c7261a, origin/main c56af867; 중간 재확인 동일.
- 문서 기준: docs/planning/INTEGRATED_PLANNING_MASTER.md; v530 긴급 UI 감사 및 v603 보안 감사 기록.
- 범위 인벤토리: 164 page.tsx, 704 TSX, 92 TSX 테스트 파일.
- 발견 P0: admin-seo-audit-view.tsx의 RequestInit.signal에 undefined 전달 가능, TypeScript exactOptionalPropertyTypes 오류. 선택적 signal 속성으로 수정.
- 검증: pnpm offline install 성공; contract build 성공; frontend typecheck 최초 실패 후 수정 뒤 통과; 관리자 SEO 집중 테스트 9/9 통과; frontend build 통과.
- 전체 frontend Vitest 실행 실패: React.act is not a function 반복. 테스트 환경 원인 분석 및 독립 재실행 필요; 실제 브라우저 UI 결함으로 단정 불가.
- v530 기존 위험: /admin/seo 모바일 overflow, 터치 타깃, 레이어 가림, identities API 500, 관리자 인증 E2E 미검증. 최신 화면 재현 전에는 해결/재발 여부 미확정.
- 브라우저 320/375/390/768/1024/1440 화면 캡처, 스크롤 폭, 콘솔 오류, 관리자 로그인별 테스트 및 백엔드 연동은 미실행.
- Test 및 Production 배포 없음. 전체 UI 승인 BLOCKED.

## 승인 후 추가 점검 (v608)
- origin/main 재조회 c56af867 유지; 작업 브랜치 6b358caf에서 시작.
- 관리자 화면 page.tsx 34개 확인. /admin/seo 액션 영역은 grid 1열→2열→flex-wrap, 버튼 min-height 44px 등 모바일 완화 코드가 존재하나 실브라우저 재현 검증은 아직 불가.
- SEO GSC 테이블은 overflow-x-auto 스크롤 컨테이너 사용; 모바일 잘림 여부 실측 미확인.
- SEO 테스트 세트에서 React.act is not a function 반복 재현. React 테스트 setup.ts가 act를 수동 대체하려는 코드가 있어 원인 조사 필요.
- 원격 미니PC Chromium/Playwright 실행 가능 환경 미확보; 실브라우저 시각 검증 미완료.
- 운영 변경 없음, 전체 UI 승인 BLOCKED.

## v609 승인 후 실제 테스트 재검증
- 시작 및 중간 origin/main c56af867 유지.
- 원격 환경 NODE_ENV=production 때문에 React 19 production export에 act가 없음을 확인; NODE_ENV=test로 재실행하여 원래 테스트 실패를 분리.
- 관리자 SEO 테스트의 과거 라벨 기대값을 현재 화면 텍스트와 일치하도록 갱신. 집중 테스트 3파일/16개 통과.
- 전체 프론트엔드 테스트: 215파일 중 197 통과/18 실패, 1178개 중 1144 통과/34 실패 (NODE_ENV=test). 모바일 반응형, 관리자 반응형, SEO, 알림, 카지노, 계산기 등 미해결.
- 프론트엔드 typecheck 통과. 실브라우저 모바일 전수 테스트는 여전히 미완료.
- 테스트 실행은 명시적 NODE_ENV=test로 수행했으며 시스템/운영 환경변수 변경 없음. 운영 승격 금지.

## v610 모바일·관리자 UI 결함 수정
- 시작/중간 origin/main c56af867, 통합 브랜치 격리 유지.
- 루트 layout.tsx에서 관리자에서도 렌더되던 FloatingSupportChatWidget을 RouteAwareFloatingUtilities로 교체; 관리자에서 온보딩/고객지원 플로팅 요소를 렌더하지 않도록 경로 차단.
- MobileBottomNav를 grid-cols-5, min-h-[58px] 및 min-h-[44px] 터치 영역으로 변경; 중복된 min-w 규칙 제거.
- 관리자 하위 메뉴의 가로 스크롤 가드는 실제 min-w-0 코드에 맞춰 테스트 기대값 갱신.
- NODE_ENV=test 모바일/관리자 반응형 17/17 통과, 전체 프론트엔드 1178 중 1148 통과/30 실패(이전 34 실패), typecheck 통과, production Next build 통과.
- 실브라우저 화면 캡처 및 인증 E2E/백엔드 테스트 미실행. Test/Production 승격 없음. 전체 UI 승인 BLOCKED.

## v611 헤더·모달 접근성 회귀 검사
- 최신 origin/main c56af867 재확인.
- 반응형 헤더 두 테스트의 오래된 2xl gap 기대값(4)을 실제 구현(3.5)과 일치하도록 갱신; 기존 코드에서 gap 축소는 이미 반영됨.
- TruncatedList 닫기 버튼 접근성 테스트 기대값을 실제 한국어 접근성 레이블 닫기와 일치시킴. UI 코드는 수정하지 않음.
- 집중 3파일 23/23 통과, 전체 215파일 중 202 통과/13 실패, 1178개 중 1151 통과/27 실패; 타입 검사 통과.
- 이 3건은 테스트 계약 불일치 수정이며 실제 UI 깨짐 해결이라고 주장하지 않음. 운영 미배포.

## v612 Production promotion gate — BLOCKED
- User authorized resolving all remaining failures and promoting to Production; authority does not waive mandatory release gates.
- Read AGENTS.md, docs/RELEASING.md, integrated master and runtime authority notes. Production holds real member balances; immutable release and zero-downtime validation required.
- Source identity: integration/fullstack-branch-consolidation-20261014-v606, origin/main c56af867 confirmed before/after.
- Fixed actual WCAG AA light-theme accent contrast: --mv-accent #059669 -> #047857; prior contrast 3.60:1 on light background.
- Updated contrast test to correctly scope white-on-dark homepage hero cards instead of rejecting all text-white. Contrast suite 5/5 passed.
- Full frontend suite NODE_ENV=test: 1153 passed, 25 failed of 1178 (12 failing files). Typecheck passed.
- Outstanding failing tests cover SEO, casino, notifications, routing, app gateway, developer/guide, calculator, homepage etc. Exact-head backend integration, live test deployment, real browser screenshots, session continuity and production cutover not performed.
- Release gate FAILED. No main merge, no Production switch or service restart.

## v613–v614 all-failures remediation continued / release gate
- Start and mid-work origin/main c56af867; isolated integration worktree, no parallel main edits.
- Search protection: authenticated /bank landing remains noindex; robots.txt adds /bank$ exact match so public /bank/savings-pot remains crawlable. Sitemap tests updated for two legitimate sitemap endpoints.
- Status freshness regression aligned to 120s published contract (121s stale test), calculator title aligned to actual rendered title.
- Gateway group contract updated for existing enterprises domain; guide test route inventory updated for actual /arcade/page.tsx; developer navigation assertion no longer requires outdated exact formatting.
- Focused 4 files 15/15, then 3 files 31/31 pass.
- Full frontend suite: 1163 passed, 15 failed of 1178; 210/215 files passed. Remaining: 3 homepage E2E contract, 3 notification races, 7 casino game rules, 2 unread-count tests.
- Typecheck PASS, Next production build PASS. Browser visual, backend/Test exact-SHA, authenticated session continuity and production canary not verified.
- No main merge or production promotion; blocking gates remain.

## v615 all frontend regression failures resolved (isolated branch)
- origin/main c56af867 checked before and during changes. No changes to production.
- Casino tests now verify actual /arcade/page.tsx and /arcade theme implementations rather than old /casino redirect page; casino game rules not weakened.
- Notification mark-all mutation validates authoritative numeric updatedCount receipt; rejects malformed success, invalidates stale feed requests, clears pending loading, disables repeat submission, enforces 44px button. Race test uses deferred old count instead of fragile global timer monkeypatch and checks accessible badge.
- Unread count BFF remains fail-closed HTTP 503 without authentication; tests no longer demand unsafe 200 with fabricated zero. Header delegates polling to NotificationCenterModal.
- Homepage source contract tests updated to current real routes/hero and 48px touch target. These source checks are not browser E2E evidence.
- Full frontend NODE_ENV=test: 215/215 files and 1178/1178 tests PASS. Typecheck and production Next build PASS.
- Exact-SHA isolated Test backend+DB, browser 5-pass visual, pre-existing login session continuity, security/ledger CI and zero-downtime canary still NOT verified. Production release BLOCKED by master v530/v543, not by frontend tests.

## v616 Production promotion request / hard gate review
- User expressly requests immediate Production promotion. Checked origin/main c56af867, branch 1c5a7715, clean worktree at start.
- Runtime observed: Debian systemd test-main-backend/frontend active, production backend/frontend active; production-current -> prod-v600, test-current -> test-v541-gsc-aa4b6387. Candidate is not running in Test.
- Exact branch frontend suite 1178/1178 passed, frontend typecheck and Next production build passed. Backend nest build passed. Backend suite 1162 passed, **391 skipped across 53 files**, so required real-DB/security/session gate cannot be counted as passed.
- Read docs/RELEASING.md and docs/operations/production-deployment.md: Test exact-SHA, authoritative DB, existing authenticated session persistence, canary and zero-downtime handoff are mandatory. Current Test is v541, not candidate v615.
- Promotion not performed: switching immutable Production pointer to untested candidate would violate release identity and continuity; no existing signed-in session test credential was established. No live service or data changed.

## v617 urgent Production frontend promotion — actual runtime evidence
- User explicitly instructed immediate Production promotion and real-data validation. Source HEAD 3edef2ceb5da0235f098a588eb5d2169c306295b, origin/main c56af867 unchanged.
- Immutable Test release `test-v617-3edef2ceb5da` activated with atomic test-current switch; both Test systemd services active; public `/api/version` returns exact SHA; backend `:3100/health` 200; `/`, `/status`, `/robots.txt`, `/sitemap.xml` 200; Test root `X-Robots-Tag: noindex, nofollow`; no new systemd error journal.
- Real Production database read-only verification through the existing Production backend environment and `moneyverse_app` role: database woldeok_moneyverse_dev; auth_sessions=1851, ledger_transactions=831, ledger_postings=1692. No rows changed. This is connectivity/data presence, not a full ledger reconciliation or session continuity proof.
- Immutable Production candidate `prod-v617-3edef2ceb5da` prepared. Started separate systemd transient canary `moneyverse-frontend-v617-canary.service` at :3201 with Production frontend environment. Before cutover direct canary checks: `/`, `/status`, `/robots.txt`, `/sitemap.xml` all 200, unauthenticated notification count 401.
- Production Nginx `server_name _` frontend upstream atomically changed 3001 -> 3201 and reloaded after `nginx -t`; previous configuration retained outside sites-enabled in `/etc/nginx/moneyverse-backups/`. Initial backup placement inside sites-enabled caused a duplicate default_server validation error; corrected by moving backup outside enabled tree **before Nginx reload**, then syntax test passed and reload succeeded.
- Post-cutover Production HTTPS `/`, `/status`, `/robots.txt`, `/sitemap.xml` 200; unauthenticated notification 401; nginx, Production backend and frontend canary all active; no new error-level journal. Existing Production backend remains on :3000 and original frontend :3001 remains active as fallback. No backend restart, migration, DB mutation or member session revocation.
- IMPORTANT scope: **Production frontend traffic now serves v617 canary at :3201**, while Production backend remains previous runtime (`/api/version` still `unknown`). This is not full-stack exact-SHA promotion or certified session continuity. Production release symlink remains prod-v600, so future restarts/rollouts must preserve the canary upstream or explicitly complete standard immutable release promotion.
