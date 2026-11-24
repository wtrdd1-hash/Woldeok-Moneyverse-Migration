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

### 3단계 — Test 로그인 설정을 운영과 동일하게 (소유자 승인, 작업자: Claude Code / Claude Opus 5.5)
- [x] 디스코드 OAuth client id/secret: Test 와 운영 해시 일치 확인(이미 동일).
- [x] 구글 OAuth client id/secret: 운영 값 복사, 콜백 `https://test.easy-scraping.com/auth/google/callback`.
- [x] Test 백엔드 외부 통신 허용(drop-in `30-oauth-egress-20261124.conf`).
- [x] `DISCORD_BOT_TOKEN`, `TELEGRAM_BOT_TOKEN` 은 Test 에서 비움 — 토큰이 있으면 Test 가 운영 봇 계정으로 게이트웨이에 접속해 슬래시 명령 재등록, 음성 채널 입장, 실사용자에게 Test 데이터로 중복 응답하기 때문. 로그 확인: "Bot token is empty … standby".
- [x] 사고 수정: env 파일 끝 줄바꿈 누락으로 `GOOGLE_CLIENT_ID` 가 `MONEYVERSE_FEATURES_PENSIONOPERATIONAL` 줄에 붙음 → 분리, 플래그 값 `false` 원복 확인.
- 검증: 디스코드·구글 시작 → 각 제공자로 이동(운영과 같은 client id, test 콜백). 가짜 코드 콜백 → 디스코드 `invalid_grant`, 구글 400 — 백엔드가 제공자까지 도달함. 실제 계정 로그인 완주는 소유자 테스트로 확인 필요(제공자 콘솔에 test 콜백 등록 여부 포함).
- 백업: `runtime.env.before-oauth-parity`.

### 4단계 — G1 프론트엔드 구축 1차 (소유자 승인, 작업자: Claude Code / Claude Opus 5.5) — 진행 중
- [x] G1 토큰 레이어(`g1-tokens.css`), Black Han Sans·Orbitron 로컬 서체, 셸(레일·플레이어 HUD·5탭 도크, 관리자만 GM 메뉴).
- [x] 홈을 공개 API(시세·공지·서버 시계)로 재구축, 로케일 SEO 메타데이터와 P2P 송금 복구. HUD 는 실제 잔액만 표시(레벨 API 없음).
- [x] 테스트: 전체 실패 12 → 기존 무관 1건(로그인 터치 타깃 문자열 검사)으로 감소 예상, 디자인 문자열 고정 테스트는 G1 의미 검사로 교체. tsc 통과.
- [x] Test 배포 `next-frontend-v20261124-8aedda403ef0` (모바일 HUD 수정 e84207eaf1 은 아직 미배포). 운영 블로그 서버에는 G1 미반영.
- [ ] 남은 일: e84207eaf1 빌드·Test 배포, 제목 서체 적용 확인(스크린샷상 Black Han Sans 미적용 의심), 모바일 상단바 재확인, 페이지별 G1 히어로 적용(지갑·은행·거래소·퀘스트·상점·광장·문의·계정·관리자), 디자인 기준 문서(CURRENT_UI_DESIGN·manifest) G1 전환, 운영 블로그 서버 반영.

### 5단계 — 지시서 기반 재개: 오류 해결·디자인 재검토·G1 구현 (작업자: Claude Code / Claude Opus 5.5)

**사용 스킬:** ui-ux-pro-max(팔레트·접근성 규칙), frontend-design(2단계 디자인 계획), hallmark(바닥 규칙: eyebrow·가운뎃점·장식 그라디언트 금지, sloplint), design-taste-frontend·web-design-guidelines(검토 기준), emil-design-eng(눌림 피드백 scale .97 / 100~160ms), verification-loop(빌드·타입·린트·테스트·보안 grep·diff 6단계), security-review(인증 변경 체크리스트). 브라우저 검증은 Playwright Chromium.

**발견 오류와 근본 원인 / 해결**
| 오류 | 근본 원인 | 해결 |
| --- | --- | --- |
| 한글 제목이 G1 서체로 안 나옴 | `@fontsource/black-han-sans/400.css` 는 라틴 전용 | `korean-400.css` 추가 |
| 기준선 테스트 12건 실패 | v10 개편이 홈 SEO 메타·P2P 송금·로그인 공통 컴포넌트를 제거 | 홈/로그인 재구축으로 기능 복구, 디자인 문자열 고정 테스트는 G1 의미 검사로 교체 → 3111/3111 |
| 문의 버튼 크기 회귀 | 디자인 정리 중 56px→48px 축소 | 56px 원복 |
| 이메일 회원가입 "잠시 후 다시 시도" | Spring 에 consent 엔드포인트 없음(404), 자체 가입은 503 으로 의도적 비활성 | 동의 미기록 시 가입 요청 차단, 사실대로 안내(테스트 3개). 백엔드 구현은 남은 작업 |
| 모바일/태블릿 히어로 그림이 문구와 겹침 | 장면이 sm 이상에서 표시 | lg 이상에서만 표시 |

**디자인 재검토(소유자 요구: AI 생성 느낌·장식·과한 카드/둥근 모서리 지양)**
- PageHeader/SectionHeader(105개 파일 공용): 대문자 eyebrow 제거, 제목 일부 강조색 제거.
- 본문 영역: 큰 radius 8px 상한, 장식 그림자 제거, 강제 대문자·넓은 자간 해제.
- 히어로·사이드바·주 버튼 그라디언트 제거(단색 금색 버튼), HUD·입력창 radius 축소, 비회원 안내·송금·온보딩·문의 위젯 평면화.
- 디자인 기준 문서: G1 을 공식 기준으로 전환(manifest 180장 sha256 재계산, AGENTS/CURRENT_UI_DESIGN EN·KO 갱신, v10 보관).

**검증(verification-loop)**
- 빌드: 통과(Next 보안 권고로 1회 재시도 필요). 타입: 통과. 린트(변경 파일): 오류 0·경고 0. 테스트: 592 파일 / 3111 개 전부 통과.
- 보안 grep(변경분): 비밀값·console.log·dangerouslySetInnerHTML·eval 추가 없음, 새 네트워크 호출은 같은 출처 `/api/wallet/summary` 뿐.
- 브라우저(Test): 1440 / 768 / 390 에서 주요 공개 페이지 가로 넘침 0, JS 오류 0, 페이지당 h1 1개, 회원 페이지는 비로그인 시 로그인으로 이동.
- **미검증:** 로그인 후 회원 화면(지갑·은행·퀘스트·계정·관리자) 실제 데이터 렌더 — 자체 가입이 백엔드에서 닫혀 있어 검증 계정을 만들 수 없음. 소유자 계정으로 확인 필요.

**배포:** Test 프론트 `next-frontend-v20261124-1e03513e71a4`. 운영 블로그 서버는 G1 미반영(운영 배포는 별도 승인 필요).

**남은 작업:** Spring 자체 가입(동의·연령 기록 DB 함수 + 마이그레이션), 회원/관리자 화면별 G1 히어로·레이아웃 정밀화, 로그인 상태 E2E, 운영 반영 승인 시 블로그 서버 갱신, Next 보안 업그레이드.

### 6단계 — 180개 페이지 구현 현황 (정직한 집계, 작업자: Claude Code / Claude Opus 5.5)
| 범위 | 페이지 수 | 상태 |
| --- | --- | --- |
| G1 공통 셸(사이드바·HUD·도크)·토큰·서체 | 180 / 180 | 완료(모든 페이지) |
| G1 상단 배너(PageHeader 또는 G1PageHero, 경로별 장면) | 95 / 180 | 완료 |
| 배너 미적용(자체 제목 마크업) | 85 / 180 | 남음 — 계산기 약 35, 은행·거래소(하위 컴포넌트 제목), 계정, 일부 관리자·상세 페이지 |
| 본문까지 G1 시안대로 재구성 | 2 / 180 (홈, 로그인) | 남음 — 나머지 본문은 G1 토큰·평면화 규칙만 적용 |

- 이번 단계: PageHeader 를 G1 배너로 전환(경로→장면 매핑, 단위 테스트 12개), 계산기 목록·문의·중앙은행 제목을 공통 배너로 이전. 전체 테스트 3123/3123, tsc 통과, 변경 파일 린트 오류 0(기존 any 경고 1).
- Test 배포 `next-frontend-v20261124-8035e3c442`. 운영 미배포.

### 7단계 — 전체 기능 검사·오류 수정·광고 영역·공통 부품 디자인 (작업자: Claude Code / Claude Opus 5.5)
**180개 경로 브라우저 전수 검사(Test, 동적 경로는 실제 데이터로 치환)**: 1차 정상 137 / 문제 29 / 건너뜀 14 → 수정 후 **정상 161 / 문제 5 / 건너뜀 14**.

| 오류 | 근본 원인 | 해결 |
| --- | --- | --- |
| React #418 하이드레이션(계산기 약 20, 블로그 상세, 기능, 신문) | `lib/adsense` 가 서버 전용 `ADS_ENABLED` 를 읽어 서버는 광고 없음·브라우저는 광고 있음으로 렌더 | `next.config` 에서 광고 설정을 빌드 시점 `NEXT_PUBLIC_*` 로 고정 |
| 종목 차트 400 | 프론트가 900초 봉 요청, Spring 허용 간격 밖 | 1D 를 1800초 봉으로 |
| 거래소 h1 2개 | 레이아웃 h1 + 종목/리그 페이지 h1 | `StocksHeading` 이 자체 h1 페이지에선 텍스트로 |
| 비로그인 401(덕이 상담소, 주주 라운지) | 회원 전용 API 를 방문자에게도 호출 | 로그인 시에만 호출 |
| `/help` 404 | 기능 플래그 `VERIFIED_HELP_CENTER_V1` 로 닫혀 있음(백엔드 API 는 200) | Test env 에서만 플래그 켬 |
| 남음: 외환·예금보험·연금 503 | Test 백엔드 기능 플래그(`*OPERATIONAL=false`) | 화면 안내 확인 필요(운영 정책 결정 사항) |

**광고 영역**: 기획 규정(공개 콘텐츠 본문 뒤에만, 금융·계정·관리자·채팅 금지, 5개 언어 표시, 미노출 시 숨김) 준수. G1 표시 스타일, Test 빌드용 미리보기 슬롯(`NEXT_PUBLIC_AD_PREVIEW=true`, 같은 경로 정책·같은 높이 예약으로 실제 전환 시 레이아웃 이동 없음), 홈 본문 뒤 광고 자리 추가. 미리보기 슬롯 테스트 8개(금지 경로 6곳에서 미노출 확인).

**디자인**: 공통 Card(232 파일)·Button(281)·Badge(237) G1 평면화 — 블러·그림자·마우스 올림 떠오름 제거(클릭 불가 카드가 클릭 가능해 보이던 문제), 금색 주 버튼, 매매 버튼 발광 제거. 히어로 달을 초승달로.

**검증**: 테스트 594 파일 / 3130 개 통과, tsc 통과, 변경 파일 린트 오류 0. Test 배포 `next-frontend-test-v20261124-1a964f093a`(광고 미리보기 포함 Test 전용 빌드). 운영 미배포.

**기획 문서 분석 범위(정직 기록)**: INTEGRATED_PLANNING_MASTER 의 광고 관련 항목과 광고 QA 문서는 이번에 확인. 통합 기획서 전체·UI/UX 단일 기준서 전체 정독은 아직 아님.
**남은 일**: 계산기 35개 등 자체 제목 페이지 85개의 G1 배너·본문 정리, 이모지 아이콘 제거, 거시지표 수치 출처 검증, 로그인 상태 E2E, 이메일 가입 백엔드, 운영 반영(승인 필요).

### 8단계 — 전체 디자인·프론트엔드 전수 확인 (작업자: Claude Code / Claude Opus 5.5)
- 180개 경로 PC(1440)·모바일(390) 스크린샷 329장을 비교 시트 22장으로 묶어 전부 육안 검토. 기능 검사: 정상 161 / 문제 5 / 건너뜀 14, 모바일 가로 넘침 0.
- 수정: 거시지표 패널이 고정 예시 수치(코스피·나스닥·환율·경제 캘린더)를 "실시간·10분 갱신"으로 표시하던 문제 — API 에 지표 목록이 없어서 생김. 실제 데이터가 없으면 "불러올 수 없음"으로 표시, 예시 수치 194줄 삭제(테스트 2개).
- 수정: 관리자 화면을 G1 GM 콘솔(엠버 배너)로, 하위 메뉴 G1 토큰, 관리자 테마의 장식 발광 제거. 관리자 테스트 755개 통과.
- 수정: 페이지별 채도 높은 그라디언트 배너(외환·예금보험·경매·연금 등)를 G1 평면 패널로 일괄 정리(진행 막대·작은 버튼은 제외되는 선택자).
- 확인된 남은 디자인 과제: 페이지 내부의 원색 버튼(예: 예금보험 파란 버튼)·둥근 입력창·페이지 자체 검은 바탕, 이모지 아이콘(검사 브라우저엔 □ 로 보임), 모바일에서 떠 있는 위젯 2개가 본문을 가림.
- 남은 기능 과제: 외환·예금보험·연금 503(Test 백엔드 기능 꺼짐 — 정책 결정), 로그인 상태 화면(관리자 40개·회원 화면) 미검증.
- 블로그 거시 수치: Yahoo·FRED 실시간 조회 후 실패 시 고정값 사용 — 고정값 표시 여부 정리 필요(남은 일).
- 테스트 595 파일 / 3132 개 통과. Test 배포 `next-frontend-test-v20261124-*`(최신 커밋). 운영 미배포.

### 9단계 — 정밀 디자인 패스·외부 모델 시도·전체 테스트 (작업자: Claude Code / Claude Opus 5.5)
- 외부 모델(저장소 `codex-gemini-pingpong` 스킬 절차): 민감정보 없는 요청서 + 비로그인 공개 화면 8장 준비(로컬 0700). **GPT(Codex CLI 0.162.0): 계정 사용 한도 초과로 거부(재시도 가능 2026-11-27 13:57).** **Gemini CLI 0.70.0: 소유자 로그인 후 재시도 → 인증 방식 `gemini-api-key` 의 키가 Google 에서 "API key not valid"(400) 로 거부.** 모델 응답은 받지 못함 — 외부 모델 의견을 반영했다고 주장하지 않음.
- 자체 정밀 패스(공통 규칙): h1 크기를 전 페이지 하나의 유동 크기로 통일(기존 2xl~5xl 혼재), 과대 섹션 제목 통일, 버튼·버튼형 링크의 단색 원색 배경(파랑·남색·초록·청록·하늘·틸)을 G1 바이올렛 행동색으로, 알약 입력창 6px.
- 전체 테스트: 프론트 tsc 통과, vitest 595 파일 / 3132 개 통과. Spring 713 중 710 통과(실패 3 = 이전부터 있던 Thymeleaf 디자인 검사, 이번 변경과 무관).
- 180 경로 브라우저 재검사: 정상 163 / 문제 3(외환·예금보험·연금 503 — Test 백엔드 기능 꺼짐) / 건너뜀 14(데이터 없음). 프론트 오류 0.
- Test 배포 `next-frontend-test-v20261124-9e95db34c2`. **운영 승격 안 함(소유자 지시).**

### 10단계 — G2 "길드 원장 단말기" 시안·승인·구현 (작업자: Claude Code / Claude Opus 5.5)
- 시안 13종(PC+모바일) 생성: `scripts/design/game-ui-g2/`, 결과 `docs/design/game-ui-v2026.11.24.G2/`. Hallmark sloplint 13/13 위반 0. 외부 모델(GPT 사용 한도, Gemini 키 거부) 응답 없음.
- 소유자 승인(2026-11-24) 후 구현: 모든 화면 상단 원장 상태 띠(`components/g2/ledger-strip.tsx` — 서버 시계, 시세 기반 상승/하락(BigInt), 기준금리, 본인 잔액; 실패 시 "확인 불가", 테스트 2개), 그룹 메뉴(게임·경제·커뮤니티, GM 은 관리자만), 평면 하단 도크, PageHeader 를 제목+한 줄로(배너 그림 제거), 패널 1px 선·6px 모서리, 숫자 본문 고정폭 서체(Orbitron 은 본인 잔액만), 로그인 버튼 단순화, 사이드바 중복 서버 시계 제거, 비회원 안내 eyebrow 제거.
- 디자인 기준 문서·매니페스트·AGENTS.md 를 G2 로 전환(경로별 내용·순서는 G2 경로별 시안 전까지 G1 경로별 시안 유지).
- 검증: tsc 통과, vitest 596 파일 / 3134 개 통과, 180 경로 브라우저 검사 정상 166 / 건너뜀 14(데이터 없음), 오류 0.
- Test 배포 `next-frontend-test-v20261124-<최신 커밋>`. **운영 승격 안 함(소유자 지시).**

### 11단계 — 보안 점검·운영 후보 실검증·운영 승격 (작업자: Claude Code / Claude Opus 5.5)
- 소유자 지시: "보안테스트 프론트엔드 실제 작동 등 실제 테스트 후 문제없으면 운영까지 승격".
- 보안 점검(Test): 보안 헤더(CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer/Permissions-Policy) 확인, 비로그인 관리자 화면 → 로그인 이동, 관리자 API 401, 외부 출처 POST(송금·로그아웃) 401/403, 외부 주소 이동(next/redirect) 없음, OAuth 콜백 목적지 고정, 경로 우회(../, %2e) 404/403, .env/.git 차단, 정적 번들에 내부 토큰·비밀값 없음.
- 발견·수정: next 16.4.2 공개 취약점 7건(교차 응답 주입, HttpOnly 쿠키 노출, 사용자 간 캐시 노출 등) → 16.4.6 으로 올림. pnpm audit --prod 0건. 빌드 시 보안 경고도 사라짐.
- 운영 후보: 운영 빌드(광고 미리보기 끔)를 운영 Spring 4550 에 붙여 비공개 포트에서 180 경로 검사 — 정상 166 / 건너뜀 14, JS 오류 0. 도움말 404 는 기능 설정 누락 → 운영 env 에 추가. SEO(robots, 사이트맵, canonical, index) 확인.
- G2 경로별 시안 180장 추가(`docs/design/game-ui-v2026.11.24.G2/routes/`, sloplint 180/180 통과).
- 운영 승격(무중단): 새 서비스 `moneyverse-next-frontend-v20261124`(55476) + nginx 새 파일(easy-scraping.com 전용 블록). 기존 블록 무수정, 되돌리기는 파일 삭제 후 reload. 상세 `ops/next-prod-cutover-v20261124/`.
- 운영 실검사(https://easy-scraping.com): 180 경로 정상 166 / 건너뜀 14, JS 오류 0, 가로 넘침 0. 외환·예금보험·연금 503 은 전환 전과 동일(백엔드 기능 꺼짐). 기존에 깨져 있던 `/api/v1/blog/verified`(400)를 읽기 전용 블로그 API 로 바로잡음(200).
- 미배포: 이 브랜치의 Spring 변경(로그인 CSRF state 검증 등)은 운영 Spring 에 아직 없음 — 백엔드 배포는 별도 결정 필요.
- PR #3442 검토: "v2026.11.24.11 180장 시안"이 보관된 v2026.11.23.10 이미지와 180장 모두 동일(바이트 일치) — 소유자에게 보고.

### 12단계 — 전체 분석·백엔드 점검·회귀 수정·DESIGN180 명세 (작업자: Claude Code / Claude Opus 5.5)
- 소유자 지시: 중단 후 전체 분석, 이어서 "해결진행 및 백엔드 기능 다 점검, 스킬 제대로 많이". 사용 스킬: 저장소 Superpowers(using-superpowers, brainstorming, writing-plans, test-driven-development, systematic-debugging, verification-before-completion, subagent-driven-development 읽음), .agents spring-* 8종 점검표, hallmark, ui-ux-pro-max/frontend-design(토큰 검토).
- 백엔드 점검: BFF 106 경로 Test·운영 대조(대부분 일치, 405=POST 전용), 운영 쿠키·CORS·CSRF·actuator·문서 노출 점검(외부 출처 쓰기 401/403, CORS 허용 없음, actuator 403, swagger 404). Spring 테스트 710/713(기존 Thymeleaf 3건).
- 근본 원인 수정(TDD): next.config rewrites 가 동적 BFF 6개를 가리던 문제 → fallback 으로 이동(c855cfc7a6). Test 배포·검증(종목 기호 캔들 200).
- 운영 nginx 회귀 2건 수정: /health·/health/spring·/api/v1/spring 누락 → 복구(200). 기존 운영의 읽기 전용 쓰기 차단(문의·채팅·프로필·알림·일자리·관리자 경제/주식/회원)이 새 블록에 빠져 있던 것 → 복구(쓰기 403, 읽기 정상). 첫 시도에서 nginx -t 실패(서버 레벨 if 안 add_header) — reload 는 실행되지 않아 운영 영향 없음, 즉시 수정.
- 공유 .git 의 root 소유 파일 1,475개(20:50 경 root git 실행 흔적) → debian 소유로 복구(모든 작업자 커밋 차단 해소).
- PR #3443(DESIGN180) 검토 후 구현 명세 초안: docs/superpowers/specs/2026-11-24-design180-next-implementation.md — 소유자 승인 대기(brainstorming 관문).
