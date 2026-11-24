# 2026-11-24 — Next 프론트엔드 ↔ Spring Test 연결 + 운영 블로그 복구

Branch: `fe/next-spring-test-connect-20261124` (base: `origin/integrate/branches-docs-unification-20261124` @ 6052760bb8)

Owner instructions (2026-11-24): 작업/예약 기록(`/srv/moneyverse-data/tasks`)과 MCP 게이트웨이는 건드리지 않음 · PR/문서 확인 후 프론트엔드 마저 구축 · Test 서버 우선 · Test 백엔드에 운영 DB 사본과 관리자 계정 반영 · Test 외부 접근 · **운영 블로그 문제 우선 복구**.

## 상태

- [x] **BEFORE** — 문서(AGENTS, CURRENT_UI_DESIGN, FEARCH.1), 열린 PR 25개, Test 런타임 조사
- [x] Test DB: 운영 DB 읽기 전용 `pg_dump` → Test 컨테이너 새 DB `moneyverse_test_prodcopy_20261124` 복원 (기존 Test DB 유지 = 롤백 경로)
- [x] 운영 블로그 원인 분석 및 Spring 공개 읽기 API 구현
- [x] Test 백엔드에 새 jar 배포, 블로그 API/Next 렌더링 검증
- [x] 운영 블로그: Next 블로그 서버 + 읽기 전용 Spring + nginx 블로그 경로 전환 (소유자 지시로 운영 반영)
- [x] Test 프론트엔드(Next) 상시 실행 + 외부 접근(test.easy-scraping.com)
- [x] v10 디자인 셸(사이드바/탑바/모바일 도크, 단일 다크 토큰, 공식 파비콘)
- [x] 관리자 프레임 서버 게이트, Spring 비로그인 세션 응답 해석, 로그인 문구 복원
- [x] **FINISHED** (이번 단계) — 아래 검증/배포 상태. 남은 작업은 "후속" 참조

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

## 추가 변경 (프론트엔드)

- `v10-tokens.css` + 테마 다크 고정: 레거시 라이트/로케일별 토큰이 다크 셸 안에서 어두운 글씨를 만들던 문제 해결.
- `v10-nav.ts` 단일 내비 모델 → 사이드바·상단 제목·모바일 5탭 도크(홈/지갑/투자/퀘스트/계정). 사이드바 링크 prefetch 끔(Spring 경로 RSC 406 방지).
- `app/favicon.ico` 를 공식 mv39 파비콘으로 교체(기존 파일이 공식 마크가 아니었고 public 파일을 가렸음).
- 블로그 날짜를 Asia/Seoul 고정 → 하이드레이션 #418 원인 제거.
- `admin/layout.tsx`: 비로그인 → /login, 비관리자 → 404. 관리자 메뉴가 익명 HTML에 노출되던 문제.
- `lib/session.ts requireMember`: Spring 은 비로그인에 200 `signedIn:false` 를 반환 → 로그인 리다이렉트 (기존엔 통과 후 500).
- 로그인 폼: 시안 채움 문구/미사용 `securityCode` 필드 제거, 실제 문구 복원.

## 검증 (2026-11-24 KST)

- `tsc --noEmit` 통과. vitest 전체 3108 중 12 실패 — **기준 커밋 6052760bb8 에서도 동일 12건 실패**(회귀 없음, 모바일 반응형 2건은 이번에 해결). 관리자 게이트/세션 신규 테스트 통과.
- Spring `bootJar` 성공(테스트 생략: `-x test`).
- 브라우저(Playwright Chromium, 1440×960 / 390×844): Test `/`, `/stocks`, `/login`, `/blog` JS 오류 0, 가로 넘침 0. 운영 블로그 목록·상세 정상.
- 운영 공개 확인: `/blog` 200, `/ko/blog`→`/blog` 308, `/en|ja|zh/blog` 200, 검증 글 상세 200, 미검증 글 상세 200, 없는 글 404, `/`·`/stocks` 영향 없음.

## 배포 상태

| 대상 | 유닛 / 포트 | 산출물 |
| --- | --- | --- |
| 운영 블로그 Next | `moneyverse-blog-next-v20261124` 127.0.0.1:55472 | `/srv/moneyverse-data/releases/next-frontend-v20261124-acb32e966fd3` |
| 운영 블로그 읽기 Spring | `moneyverse-blog-reader-v20261124` 127.0.0.1:55470 | `blog-reader-spring-v20261124-6052760bb8ff-wip/app.jar` (9ffa54ffbe 소스) |
| Test 프론트엔드 Next | `moneyverse-test-next-frontend-v20261124` 127.0.0.1:55474 | 위 운영 블로그와 동일 산출물, Test env |
| Test 백엔드 Spring | `moneyverse-nov18-test-backend-v20261122` 55438 + drop-in | `test-backend-blogfix-v20261124-6052760bb8ff-wip/app.jar`, DB 사본 |

nginx: 운영 블로그 경로(`/blog`, `/{en,ja,zh,ko}/blog[/*]`)와 `@mv_blog_v1417_static` → 55472. test 서버 블록 전체 → 55474. 백업: `/var/backups/moneyverse-test-prodcopy-20261124/nginx-sites-moneyverse.before-*`.

롤백: nginx 백업 복원 후 `nginx -t && reload`; 블로그 유닛 정지. 운영 메인 Spring 4550 은 변경하지 않음.

## 후속 / 미해결

- 홈(`/`) 등 일부 화면은 v10 시안 문구(실제 데이터 미연동)가 남아 있음 → 실제 API 연동 필요.
- 주식 화면 거시지표 수치의 데이터 출처 확인 필요(하드코딩 여부).
- Test 백엔드는 외부 네트워크 차단 → Discord/Google OAuth·텔레그램 OTP 불가. 로컬 계정 로그인만 가능. 운영 봇 토큰이 Test env 에 있어 외부 허용 시 운영 봇 중복 접속 위험.
- Spring 4550 jar 의 `BlogVerifiedController` 스텁, `AdminBlogController` 의 테이블 직접 조회(298 에서 revoke) 정리 필요.
- 운영 Test 는 실제 회원 데이터 사본 — 외부 공개 중이므로 접근 범위 관리 필요.
- Next 16.4.2 보안 권고(빌드마다 차단) → 업그레이드 별도 작업 필요.

---

## 2단계 (2026-11-24 오후) — 작업자: Claude Code (Claude Opus 5.5)

### 운영 블로그 전수 재점검 (소유자 최우선 지시)
- [x] 허브 4개(`/blog`, `/en|ja|zh/blog`) 200, `index, follow`, canonical 정상, X-Robots-Tag 없음.
- [x] 허브에서 링크된 상세 189개 전부 200, 전부 canonical + JSON-LD, 상세의 hreflang·OG·description 정상.
- [x] 브라우저(PC 1440 / 모바일 390): 목록 141개 → 검색 33개 → 카테고리 3개 필터 동작, 글 이동/목록 복귀/언어 탭 이동 정상, 가로 넘침 0.
- [x] **수정:** `/sitemap-blog.xml` 이 2026-11-18 고정 정적 파일(70개, 이후 글 누락)이었음 → nginx 2곳을 Next 블로그 서버의 동적 사이트맵으로 전환. 공개 응답 193개 URL, 193개 모두 200, 오늘 글 포함. 백업 `nginx-sites-moneyverse.before-sitemap-20261124`.
- [x] **수정:** 셸의 모바일 제목이 h1 이라 모든 페이지에 h1 이 2개 → 일반 텍스트로 변경(운영 블로그 상세 h1 1개 확인).
- 참고: 관련 계산기 링크 미리 불러오기에서 406(Spring 경로) — 클릭 이동은 200, 기능 영향 없음.

### 로그인 백엔드 점검
| 항목 | 운영 easy-scraping.com | Test |
| --- | --- | --- |
| 자체 로그인 API | (Spring) | 잘못된 자격증명 401 정상 |
| 디스코드 시작 | 302 → discord.com, 콜백 운영 도메인 | Next 경로가 `oauth_session` 오류 → **수정 후 307 → discord.com (콜백 test 도메인)** |
| 구글 시작 | 302 → Google, 콜백 운영 도메인 | client_id 비어 있음, 콜백이 운영 도메인 → **Test 환경 설정 필요(차단됨, 아래)** |
| 콜백 토큰 교환 | — | Test 백엔드 외부 통신 차단 → 불가 (차단됨, 아래) |

- **원인/수정:** Spring 은 OAuth 시작·콜백에 `format=json` 이 없으면 302 를 반환하는데 Next BFF 는 JSON 을 기대 → Next authorize/callback 이 `format=json` 사용.
- **보안 발견/수정 (Test jar):** Spring 콜백이 URL `state` 를 어떤 UUID든 prelogin 세션으로 받아들이고 브라우저 쿠키 세션과 대조하지 않음 → 로그인 CSRF 가능. state 가 브라우저 세션과 일치해야 하도록 수정(코드 교환 전에 거부). 운영 4550 jar 에는 미적용 — 운영 반영은 별도 승인 필요.
- 테스트: Spring 713 중 710 통과, 실패 3건은 Thymeleaf/정적 디자인 검사(이번 변경 파일과 무관). 인증 테스트 46/46 통과(신규 거부 테스트 포함). Next 인증 테스트 통과.
- **차단됨:** Test 백엔드 외부 통신 허용 + 운영 구글 키 복사 + 봇 토큰 비우기 — 권한 검사에서 거부됨. 소유자 승인 시 진행.

### G1 게임풍 디자인 후보 (승인 대기, 구현 미착수)
- `docs/design/game-ui-v2026.11.24.G1/` 180장 + README(EN/KO), 생성기 `scripts/design/game-ui-g1/`.
- 사용 스킬: ui-ux-pro-max, frontend-design, hallmark(sloplint 180/180 FAIL 0). 공식 기준(v10)은 변경하지 않음.

### 커밋 / 작업자
| 커밋 | 내용 | 작업자 |
| --- | --- | --- |
| 9ffa54ffbe | Spring 공개 검증 블로그 API | Claude Code (Claude Opus 5.5) |
| 6e30a14f66 | v10 셸, 다크 토큰, 모바일 도크, 공식 파비콘 | Claude Code (Claude Opus 5.5) |
| 5ae69b20ee | 블로그 날짜 시간대 고정 | Claude Code (Claude Opus 5.5) |
| ebd7268e14 | 관리자 서버 게이트, Spring 비로그인 세션 해석 | Claude Code (Claude Opus 5.5) |
| acb32e966f | 로그인 문구 복원 | Claude Code (Claude Opus 5.5) |
| 2e814b691a | 작업 로그 | Claude Code (Claude Opus 5.5) |
| 90a0fb0269 | OAuth JSON 계약, state 세션 바인딩, h1 중복 제거 | Claude Code (Claude Opus 5.5) |
| (이번 커밋) | G1 디자인 후보 + 작업 로그 | Claude Code (Claude Opus 5.5) |

배포 상태: 운영 블로그 Next/Test 프론트 = `next-frontend-v20261124-90a0fb026903`, Test 백엔드 = `test-backend-v20261124-90a0fb026903`.
