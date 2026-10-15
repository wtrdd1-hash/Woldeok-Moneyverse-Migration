# 월덕 머니버스 — 운영 시스템·기능 오류 실행 검증 v2026.10.15.638

**최종 판정: 시스템은 실행 중, 전체 기능 수용은 BLOCKED.** 2026년 10월 15일 미니PC·GitHub·Nginx 로그·개발 DB의 읽기 전용 검증. 운영 파일·금액·계정·DB 권한·기능 스위치·운영/Test 심볼릭 링크 미변경. [English canonical](MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.md).

## 1. 기준 문서와 운영 구조

- `AGENTS.md`/문서정책/`PROJECT_PLAN`/`INTEGRATED_PLANNING_MASTER`/v636·v637 감사를 점검 전 확인. UI 공식 수용 v530 **BLOCKED** 유지.
- 시작·중간 GitHub `origin/main=c03b0a9b9c3018e7257c4be1d02bcbbf44d59961` 불변. 별도 독립 작업공간에서 동일 SHA 테스트. 운영 `production-current→prod-v600`, Test 별칭 `test-current→test-v618-7fa3f245bbc3`. 별도 `moneyverse-frontend-v635-canary` 서비스가 **3203 포트로 실행** 중이지만 정식 운영 별칭 대상은 아님. 테스트 디렉터리만으로 별도 Test 서버 검증 완료라고 주장하지 않음.
- 도메인 `https://easy-scraping.com`. backend/frontend/bot/nginx/docker active, 재시작 횟수 0. 백엔드 `/health` 200; `/api/version`은 HTTP 200이지만 **`{"id":"unknown"}`**. 디스크 사용 62%, 메모리 가용 약 10,104MiB. PostgreSQL 연결 정상.

## 2. 이번 실제 실행에서 재현한 기능 오류

| ID·중요도 | 재현 방법과 근거 | 수용 조건 |
| --- | --- | --- |
| **RUN-638-01 / P1 공개 버튼 6개 404** | 실제 서비스 GET **145개 중 200=138, 401=1, 404=6, 5xx=0**. 404 경로 `/auth/register`, `/attendance`, `/business`, `/career-guide`, `/guide/getting-started`, `/pet`. 금융 계산기 4개의 가입 CTA는 없는 `/auth/register`를 가리킴(`/register`는 200). 일부 다른 화면 버튼도 404 링크. **13개 요청은 로그인 화면으로 최종 이동해 200**: 실제 기능 정상으로 볼 수 없음. | 공통 라우트 맵/호환 alias·모든 CTA 검사, 회원 가입과 클릭 후 상태를 세션/DB까지 확인하는 실브라우저 E2E. |
| **RUN-638-02 / P1 주식 캔들 오류 코드 왜곡** | `frontend/src/app/api/stocks/[id]/candles/route.ts`는 `apiOrNull` 실패 전부를 503으로 변환. 비정상 문자열 ID는 백엔드 **400**, 프론트 **503**(curl 실측); 전부 0인 UUID는 backend **500**, frontend **503**. 실제 주식 ID는 backend/front **200/200**. 존재하지 않는 정상 형식 v4 UUID는 백엔드 200·빈 candles로 응답: 모든 미존재 ID가 500이라고 주장하면 안 됨. 일부 반복 외부 호출은 접근 필터링 403으로 별도 발생해 브라우저 재검증 필요. | 존재 여부/입력 검증 및 정상·미존재·nil·문자열 ID 조건별 HTTP 의미 보존, backend 400/404와 내부 500/서비스 503 분리. |
| **RUN-638-03 / P1 Nginx 과거 5xx 기록** | 10/15 접근로그 `GET /app-api/v1/support/threads` **502 1회**, 재요청은 비로그인 **401**로 회복. 회전 로그 10/15에 캔들 **503 1회**, 10/14에 캔들 **503 26회**, `/_next/static/chunks/15-8nrdig-n8f.js` **500 10회**, 가이드·채팅 미확인·버전·주식 API에서 **502 합계 4회**. 현재도 지속되는 장애라는 뜻은 아님. | 프록시/Next/백엔드 시각·릴리스 SHA·요청 ID 상관분석, 스태틱 자산 무중단 배포 호환성, 요청 오류율 경보. |
| **RUN-638-04 / P1 프론트 스트림 조기 종료** | 최근 24시간 Next 로그에 `The destination stream closed early` **37회**. 모두 **10월 14일 10:23~11:21 KST** 발생. 그날 Nginx 499 97건, 10/15에는 8건(같은 요청인지 미확정). | 클라이언트 중단과 SSR 예외를 request ID로 분리, 재현 가능한 사용자 화면 오류만 확정. |
| **RUN-638-05 / P1 자동 QA 사각지대** | 10/15 09:00 `moneyverse-qa.service` 정상 종료, 자동점검 **26 통과·0 실패**. 그러나 위 6개 실제 경로 404. 따라서 QA 대상 부족. 별도 `pnpm qa:route-ledger:check`는 `missing required option --inventory`로 **실패**. | 실제 Next 164개 화면/관리자 34개 및 메뉴 링크·역할·API·동적 라우트를 Test/운영에서 5회 확인, 인벤토리/ledger를 자동 수집·정상화. |
| **RUN-638-06 / P2 봇 부가 QA 문법 오류** | 봇 기본 `pnpm bot:test`는 **4/4 PASS**. 광고/SponsorBlock 부가 점검 `bot/scripts/qa_ads_sponsorblock_verification.mjs:7`은 **SyntaxError**. | 별도 구문 검사와 실제 Discord/음성 회귀 CI 게이트. |
| **RUN-638-07 / P1 정확한 릴리스 식별 불가** | 백엔드 `/api/version` 반환 `id=unknown`; 실제 운영은 prod-v600, 새 v635 카나리는 별도 활성. | 정확한 빌드 SHA·배포명/DB schema를 배포 매니페스트와 API에 일치 기록, 롤백/승격 때 실측. |

## 3. 동일 SHA 실제 재실행 테스트

독립 Git worktree에서 오프라인 고정 의존성 설치. 최초 Vitest 실패는 **공통 패키지 `@moneyverse/contract` 빌드 전이라 Vite가 모듈을 찾지 못한 환경 문제**. `pnpm --filter @moneyverse/contract build` 이후 다시 실행하여 모두 통과.

- 프론트 `NODE_ENV=test pnpm --filter @moneyverse/frontend test`: **220개 파일/1,206 테스트 전부 통과**.
- 백엔드 `pnpm --filter @moneyverse/backend exec vitest run --exclude '**/*.db.test.ts'`: **143개 파일 통과·1개 스킵, 테스트 1,185 통과/29 스킵**. DB 통합 검사 포함되지 않음.
- `pnpm build` **PASS**, `pnpm typecheck` **PASS** (Contract/DB/Backend/Frontend).
- `pnpm api:contract:check` **PASS** (179개 모바일 API endpoint / 637개 controller method).
- `pnpm bot:test` **4/4 PASS**, 별도 QA 파일 syntax FAIL.
- 비로그인 `/api/v1/auth/viewer`, 관리자 보안/백업, 프론트 고객지원/알림/계정 identities는 **401**(권한 차단 정상); 공용 주식 목록 200. **로그인 회원 E2E·관리자 계정 역할·실제 금융 거래·DB 마이그레이션·Android SDK·실브라우저 320px/430px는 미검증**. 이 호스트에서 Chromium/Playwright 브라우저가 발견되지 않음.

## 4. DB 무결성/보안 점검 (쓰기 금지)

- DB public 테이블 241개. `moneyverse_app` 계정이 **237개 테이블에 INSERT·UPDATE·DELETE 각각 가능**, RLS 테이블 0개. PUBLIC EXECUTE 가능한 SECURITY DEFINER 함수 11개. 개발 DB 이름을 쓰는 운영 백엔드의 계정 최소권한 P0 문제는 여전히 남음. 침입이나 잔액 유출이 일어났다는 뜻은 아님.
- 현재 원장 거래 **831**, 분개 **1,692**, 차변·대변 불균형 **0**, 분개 없는 거래 **0**, 허용되지 않은 음수 잔액 **0**. 하지만 직접 UPDATE는 원장에 없을 수 있음. 직전 v637에서 8개 백엔드 소스 파일 내 직접 잔액 UPDATE 24곳 및 PvP·암시장 정산 비원자성 이미 증명.
- `schema_migrations` 적용 266개, 최고 번호 268. 최신 소스 269/270/271은 미적용, 과거 237도 적용 내역 조사 필요. 운영과 접속된 DB에 임의 SQL 적용 금지.

## 5. 기존 기획·운영 불일치 유지

- 운영 prod-v600 국고 지급/창업 그랜트 경로에는 오래된 성공 응답 코드, 최신 main에는 실제 원장 지급 미준비 시 503 차단. DAO 계정별 중복투표, 관리자 백업 역할·재인증 부족, IndexNow 무인증 POST, GeoIP 첫 요청 전달 최신 수정 미배포, 블로그 관리자 메뉴 운영 드리프트, 404 버튼·Android 버전·문서 인덱스 병합마커도 남음.
- `moneyverse-qa.service` 및 `moneyverse-backup.service`의 `inactive (dead)`는 **타이머 기반 일회성 실행 정상 종료(exit 0)** 결과였으며 장애로 분류하면 안 됨. 운영 API 401도 미로그인 접근 차단이 정상인 경우가 있음.

## 6. 우선 조치 및 무중단 승격 전 필수 조건 (수정 승인은 아님)

1. **P0:** 격리 PostgreSQL Test DB·복구/백업으로 계정 권한·금융 직접 DML·원장 우회 및 PvP/경매/연금/외환/국채를 원자·멱등 트랜잭션화, 실패·동시성·음성 테스트.
2. **P1:** 소스↔실운영 exact SHA를 확인하고 원장 없는 지급 성공 분기 수정, 인증/관리자/DAO/IndexNow 차단을 Test에서 인증 회원·일반회원/관리자 시나리오 검증. 실서버 파일 직접 덮어쓰기 금지.
3. **P1:** 6개 404 경로, 캔들 API 상태·검증, 링크·리다이렉트·로그인 전환·관리자 화면 164페이지 전체 5회 수용.
4. **P1:** 10/14–15 서버 오류 요청 ID/에셋 버전/502 원인 조사, 릴리스 manifest·`/api/version` 통일, 카나리와 실제 운영 릴리스 혼동 방지.
5. **P2:** 봇 QA 구문/Android CI 실기기/문서 EN·KO 정책 이력 정리.
6. 다른 에이전트 Gemini 작업 보존, `origin/main` 시작/중간/끝 재조회, 승인된 신규 수정 브랜치·정확한 SHA CI→독립 Test 백엔드/DB·원장·세션 수용→백업·롤백→무중단 운영 승격.

**결론:** 백엔드·프론트·DB 서비스 자체는 가동 중이고 소스 단위 테스트는 통과했지만, 재현된 404와 API 상태 오류, 시스템 로그의 5xx, QA 사각지대와 기존 원장·권한 결함으로 전체 기능 수용 **BLOCKED**. 감사만 수행했고 운영 수정/승격하지 않음.
