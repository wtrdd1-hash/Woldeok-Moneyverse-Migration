# 2026-11-24 — Next 프론트엔드 ↔ Spring Test 연결 + 운영 블로그 복구

Branch: `fe/next-spring-test-connect-20261124` (base: `origin/integrate/branches-docs-unification-20261124` @ 6052760bb8)

Owner instructions (2026-11-24): 작업/예약 기록(`/srv/moneyverse-data/tasks`)과 MCP 게이트웨이는 건드리지 않음 · PR/문서 확인 후 프론트엔드 마저 구축 · Test 서버 우선 · Test 백엔드에 운영 DB 사본과 관리자 계정 반영 · Test 외부 접근 · **운영 블로그 문제 우선 복구**.

## 상태

- [x] **BEFORE** — 문서(AGENTS, CURRENT_UI_DESIGN, FEARCH.1), 열린 PR 25개, Test 런타임 조사
- [x] Test DB: 운영 DB 읽기 전용 `pg_dump` → Test 컨테이너 새 DB `moneyverse_test_prodcopy_20261124` 복원 (기존 Test DB 유지 = 롤백 경로)
- [x] 운영 블로그 원인 분석 및 Spring 공개 읽기 API 구현
- [x] Test 백엔드에 새 jar 배포, 블로그 API/Next 렌더링 검증
- [ ] **IN PROGRESS** — 운영 블로그: Next 블로그 서버 + 읽기 전용 Spring + nginx 블로그 경로 전환
- [ ] Test 프론트엔드(Next) 상시 실행 + 외부 접근(test.easy-scraping.com)
- [ ] v10 디자인 셸(사이드바/탑바/모바일 도크) 정합
- [ ] **FINISHED** — 검증 결과/배포 상태 기록

## 운영 블로그 원인

1. nginx가 `/blog/*`, `/ko/blog` 를 `prod_frontend`(= Spring 4550)로 보냄. Spring jar 안에는 블로그 **목록 정적 스냅샷**(`static/blog.html`)만 있고 상세 페이지가 없어 SPA 폴백으로 **홈 대시보드(200)** 를 반환 → 404 체인(`@mv_blog_v1417_static` → 3354/3482)도 발동하지 않음. 해당 Next 블로그 서버들은 이미 비활성.
2. Spring `BlogVerifiedController` 는 고정된 가짜 글 1개만 반환하는 스텁. 실제 발행 글은 DB `blog_verified_articles` (PUBLISHED 95건) 에 있고, `/api/v1/blog/verified` (Next `blog-verified-client.ts` 가 기대하는 계약) 를 제공하는 서비스가 없었음.

## 변경

- `spring-backend/.../editorial/controller/PublicVerifiedBlogController.java`: `GET /api/v1/blog/verified` → `{posts}`, `GET /api/v1/blog/verified/{slug}` → `{post}`. 테이블 직접 접근 없이 migration 298 의 `blog_verified_public_list()` / `blog_verified_public_by_slug(text)` 만 사용. slug 정규식 검증, 없으면 404, UTC 타임스탬프.

## Test 런타임 (2026-11-24 KST)

- Test DB: `mv-nov18-test-db-20261122` 컨테이너, 신규 DB `moneyverse_test_prodcopy_20261124` — 운영과 행 수 일치(users 23, ledger_transactions 950, ledger_postings 1964, user_roles 23, schema_migrations 343). 복사된 운영 세션 320건은 **사본에서만** `revoked_at` 처리. 사본에서만 `postgres` NOLOGIN 역할 생성(소유권 복원용).
- 백업: `/var/backups/moneyverse-test-prodcopy-20261124/` (root 0700) — 이전 Test DB 덤프, 운영 덤프, 이전 runtime.env.
- Test 백엔드 `moneyverse-nov18-test-backend-v20261122` (127.0.0.1:55438): drop-in `20-blogfix-20261124.conf` 로 새 jar 실행, DB URL 을 사본으로 변경. 롤백 = drop-in 삭제 + runtime.env.before 복원.
- 검증: `/api/v1/blog/verified` 95건, slug 200, 없는 slug 404, 잘못된 slug 404; stocks/session/shop/status 200. Next(dev, webpack) `/blog` 검증 글 링크 25+미검증 글, 검증 글 상세 렌더링, `/ko/blog` 허브 렌더링.
- 운영 사본은 실제 회원 데이터 — Test 외부 공개 시 개인정보 노출 범위에 주의(소유자 지시로 진행).

## 운영 블로그 런타임

- `moneyverse-blog-reader-v20261124` (127.0.0.1:55470): 새 jar, 운영 DB `moneyverse_app`, Hikari read-only, 스케줄러/티커/소켓/봇 비활성, IPAddressAllow=localhost. 운영 메인 Spring 4550 무변경. 검증: 95건 반환.
