# 월덕 머니버스 — 전체 코드·기획 일치성·기능 재감사 (v2026.10.15.636)

**최종 판정: AUDIT / BLOCKED / AUTHORITY_DRIFT.** 2026-10-15 08:53~09:05 KST, $pc MCP·GitHub·운영 프로세스·개발 DB를 직접 확인. **운영 DB/잔액/기능 스위치/배포 링크 변경, 실제 자금 이동, 마이그레이션 적용, main 병합, 운영 승격은 수행하지 않았다.**

## 1. 기획 권위와 정확한 코드·배포 기준

- 문서 정책에 따른 순서: `PROJECT_PLAN.md`(구현 권위) → `INTEGRATED_PLANNING_MASTER.md`(통합 회차·권위 드리프트) → 명시 채택된 상세 기획 → 최신 코드/검증 증적. **전 화면 UI 수용 기준 v2026.10.05.530/BLOCKED** 유지. 후속 v543·v625 후보 또는 루트 `implementation_plan.md`의 v229 '완료' 표현만으로 기획/운영 수용이 완료되지 않는다.
- 사전 확인: `AGENTS.md`, `DOCS_INDEX.md`, `PROJECT_MEMORY.md`, 프로젝트/통합기획 EN·KO, 전사 로드맵, 문서 정책, v603/v605/v630/v633 감사, 최신 변경 이력.
- 웹 GitHub `main`: **`c03b0a9b9c3018e7257c4be1d02bcbbf44d59961`**. 시작·중간 `git fetch origin main` 일치. 추적 4,094개 파일, Next 페이지 164개(관리자 34), Nest 컨트롤러 82개, Next API route 62개. 이는 자동 인벤토리이며 **4,094개 전 파일의 모든 실행문을 수작업 검증했다는 뜻은 아님**.
- Android GitHub `main`: **`e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3`**. 기존 로컬 Android `.git/HEAD` 부재로 공식 GitHub 저장소를 감사 공간에 재클론. 열린 PR #23/#24/#25/#27은 운영 앱으로 간주하지 않음.
- **실제 systemd 운영:** `production-current` → **`prod-v600`**, `test-current` → **`test-v618-7fa3f245bbc3`**. SHA `888311cc`의 `prod-v635-888311cc9240` 배포 산출물은 있으나 **활성 심볼릭 링크 대상이 아님**. `/srv/moneyverse`도 `prod-v600`을 가리킴. 현재 실제 서비스 호스트는 **https://easy-scraping.com**.
- 운영 백엔드 프로세스: `NODE_ENV=production`, 실제 `DATABASE_URL`의 사용자 `moneyverse_app`, DB명 **`woldeok_moneyverse_dev`**, 로컬 포트 5433 확인. 비밀값 원문 미출력. 프론트·백엔드·봇·Nginx·MCP·Docker 활성이나 기능 정상 인증은 아님.

## 2. 동일 SHA 격리 검증

| 항목 | 실측 | 판정 |
| --- | --- | --- |
| 프론트 Vitest | **1,206/1,206 통과** (220개 파일) | PASS: 단위/회귀 |
| 백엔드 Vitest (`*.db.test.ts` 제외) | **1,185 통과 / 29 스킵 / 실패 0** (143개 파일 통과) | PASS: 실제 DB 통합 제외 |
| 전체 타입검사 | Contract·DB·Backend·Frontend **PASS** | PASS: 분리 작업공간에서 의존성 재설치 |
| 전체 `pnpm build` | **PASS** | PASS: 빌드이지 운영 E2E 아님 |
| 모바일 API 계약 검사 | **PASS**, 179 엔드포인트·637 컨트롤러 메서드 | PASS |
| Discord 봇 기본 테스트 | **4/4 PASS** (기존 호스트 봇 의존성 재사용) | PASS: 음악 기능 한정 |
| 별도 봇 광고 QA | `bot/scripts/qa_ads_sponsorblock_verification.mjs:7` SyntaxError | FAIL |
| 비로그인 GET 표본 | 사이트·블로그·계산기·SEO·사이트맵 200, `/en/business` 404, `/en/businesses` 200, 인증 API 401, 백엔드 `/health` 200 | 표본 확인. 로그인 E2E 미검증 |
| Android 빌드/실기기 | 호스트에 Android SDK·에뮬레이터 없음 | NOT TESTED |

공유 main 작업공간의 백엔드 TypeScript/Vitest 심볼릭 링크는 손상돼 최초 실행이 중단됐다. 원본을 건드리지 않고 별도 Git worktree에서 `pnpm install --offline --frozen-lockfile --ignore-scripts` 후 타입·빌드·백엔드 검사를 통과했다. 원시 로그는 미니PC `/srv/moneyverse-tasks/audit-20261015`에 기록.

## 3. 결함 레지스터: 기획 요구 ↔ 현재 코드 ↔ 운영 동작

| ID / 심각도 | 확인된 근거 | 해결 수용 조건 |
| --- | --- | --- |
| **AUD-636-01 / P0 DB 최소권한 붕괴** | 실제 DB: public 테이블 241개, 앱 계정 SELECT 238 / INSERT 237 / UPDATE 237 / DELETE 237. `account_balances` INSERT/UPDATE, `ledger_postings` INSERT, `users` UPDATE, `audit_logs` DELETE 권한 각각 **true**. 공개 함수 549개, SECURITY DEFINER 485개 중 PUBLIC EXECUTE 11개. 운영 백엔드가 이 DB에 접속. | 일회용 Test DB에서 함수 종속성·앱 권한·감사 로그 불변·원장 대사·복구·권한 음성 시험 후 순차 마이그레이션. **실 DB 권한 무검증 일괄 REVOKE 금지.** |
| **AUD-636-02 / P0 운영 구버전 허위 지급 성공** | `frontend/src/app/api/treasury/claim/route.ts`: 최신 main은 미정산 지급 HTTP 503 차단, 실제 `prod-v600`에는 `ok: true` 코드가 남음. `apply-grant/route.ts`도 main 503, 운영 성공 응답 분기 잔존. 실제 자금이 이동했다는 증거는 없음. | 실제 인증 계정·멱등 원장 지급 영수증 발행 전 '지급 완료' 금지. 격리 Test와 무중단 승격 후 운영 실제 응답 재검증. |
| **AUD-636-03 / P1 DAO 중복투표·경합** | `api/treasury/proposals/route.ts`: 로그인만 검사, 표 수를 `votesCount + 1`로 증가. 투표 사용자별 중복 방지 및 원자적 DB 기록 없이 JSON 읽기/덮어쓰기. 이 파일은 main과 운영 동일. | (제안 ID, 사용자 ID) 고유키, 원자성·멱등·감사 영수증, 동일인 반복·동시성 테스트. |
| **AUD-636-04 / P1 관리자 백업 권한** | `backend/src/admin/admin-backup.controller.ts:33`: Session/Authenticated/Consent/CSRF만 존재하고 관리자 역할/재인증 가드 없이 `trigger`가 백업 셸 실행. 외부 직접 노출 여부는 별도. | 관리자 전용 가드와 스텝업, 일반 회원 차단 실제 백엔드 테스트. |
| **AUD-636-05 / P1 IndexNow 무인증 요청** | `frontend/src/app/api/indexnow/route.ts:8`: 별도 호출자 인증 없이 POST `urls`을 수신하여 외부 IndexNow 제출, 운영과 최신 main 동일. 일반 SSRF로 과장하지 않음. | 관리자/스케줄러 인증, 자사 canonical만 허용, 길이·건수 제한, 속도 제한. |
| **AUD-636-06 / P1 화면 ↔ API ↔ 배포 불일치** | 관리자 하위 탐색 `/admin/blog` 최신 main 존재/운영 없음. `proxy.ts`, `admin/seo-audit/route.ts`, 국고 API는 운영과 main 소스가 다름. 최신 관리자 SEO API는 콘솔 권한 확인·색인확정 여부 구분; 운영은 구형. | 주요 화면·메뉴·URL·권한·API·원장 응답의 1:1 매트릭스, 실제 320px·로그인 E2E와 Locale 확인. |
| **AUD-636-07 / P1 DB 마이그레이션 계보** | DB `schema_migrations` 266개, 최고 번호 268, 2026-10-11 이후 기록 없음. 최신 main 소스의 269/270/271은 적용기록 없고 237도 누락. | 불변 체크섬·의도적 제외 확인, 독립 DB forward 마이그레이션 및 권한 회귀 테스트. 운영에 자동 적용 금지. |
| **AUD-636-08 / P1 Android 버전·배포 안전성** | 앱 main `versionCode=35`, `versionName=1.3.4`, API 클라이언트 내부 버전 1.3.0. 운영 리소스 문자열에 테스트/비밀번호 안내 흔적. SDK 미설치·미병합 PR 존재. 실제 자격증명 유효 여부 미확인. | 릴리스 자격증명/힌트 완전 제거, `BuildConfig.VERSION_NAME` 통일, 서명 격리, Android CI·실기기 인증 E2E. |
| **AUD-636-09 / P1 SEO 표시 진실성** | 계산기 구조화데이터에 출처가 입증되지 않은 `ratingValue: '4.9'`·`'4.95'` 정적 선언. `/business`는 404, `/businesses`는 200. 사이트맵 200과 실제 색인 성공은 별개. | 평점 데이터 출처·사용자 리뷰 수 검증 없으면 마크업 제거; canonical/hreflang, 국내·해외 실유입→회원전환 지표 측정. |
| **AUD-636-10 / P2 문서 정합성** | `DOCS_INDEX.md:3`에 `<<<<<<< HEAD` 충돌 마커. 루트 구현 계획 v229/로드맵 '완료' 표현과 v530 수용 차단이 혼재. | 마커 복구, 현재 권위·역사적 주장 구분, EN/KO 동기화. |
| **AUD-636-11 / P2 봇 QA 문법** | 광고 QA 스크립트 7행 구문 오류 재현. | 별도 CI 스크립트 검증 추가 후 통과. |
| **AUD-636-12 / 조건부 P0 인증 기본값** | 블로그 생성·Discord broadcast·SEO digest에서 `INTERNAL_API_SECRET || CRON_SECRET` 기반 인증 폴백. v603 보고서에서 고정 기본 문자열 경고. 운영 필수 키 실제 누락 여부·비밀값은 이번에 확인/출력하지 않음. | 기본값 제거·누락 시 fail-closed·키 분리 및 회전·무인증 음성테스트. |

**증거 등급 구분:** 소스 취약 후보와 실제 악용은 다르다. Next 페이지 HTTP 200은 인증된 기능 정상의 증거가 아니다. GitHub 병합, CI/단위 PASS, 새 릴리스 디렉터리 생성 모두 운영 승격과 구분해야 한다.

## 4. 도메인별 기획 충족 판단

- **가입·로그인·세션·계정보호:** 비로그인 401 확인, 기본 테스트 PASS. 로그인 회원의 `account/identities` 과거 HTTP 500, 관리자 2FA·세션 지속성·계정복구 실제 E2E는 **미검증**.
- **지갑·원장·조폐/중앙은행·주식·은행·대출·연금·국고:** 코드는 빌드/테스트 일부 통과했지만 앱 DB 직접 권한이 불변식과 충돌. 실제 회계 정산과 권한은 **BLOCKED**.
- **DAO·창업 지원금:** 운영 구버전 성공 응답·투표 중복·원장·감사 인증 문제로 **BLOCKED**.
- **카지노·주식 차트·직업·사업·커뮤니티·알림:** 화면/단위시험 통과와 사용자별 거래/지속성은 별개. **PARTIAL / 미검증**.
- **관리자/보안/백업:** 메뉴·화면의 일부 최신 코드가 운영 미반영, 역할 검증 부족. **BLOCKED**.
- **SEO·블로그·계산기·다국어·수익화:** 공개 라우트와 1,206 테스트 통과. 그러나 운영 메뉴·국가 인식 소스 드리프트, 평점 출처, 실제 색인/검색 CTR/회원전환 근거 부재. **PARTIAL / 미검증**.
- **Discord·Android:** 봇 기본 4건 PASS/실제 Discord 게이트웨이 미검증, Android 소스 정적 확인/빌드·실기기 불가.
- **인프라·백업·배포:** 서비스 active, build PASS. 동일 SHA Test↔Production 수용, 백업 복구 실측 및 무중단 승격 증거 부족으로 **BLOCKED**.

## 5. 순차 해결 및 운영 승격 수용 조건

1. P0 독립 DB 백업/복원·권한·SECURITY DEFINER·원장 불변식 재현. 운영 기존 DB는 건드리지 않음.
2. P0 운영의 허위 지급 성공 동작은 정확한 소스 SHA로 격리 Test 및 무중단 승격을 거쳐 제거. 코드 파일만 수동 덮어쓰기 금지.
3. P1 관리자 백업/내부 토큰/IndexNow 인증, DAO/그랜트 멱등·원자적 정산, DB 269~271 체크섬과 기본 ACL 정비.
4. P1 운영 화면 164개·관리자 34개, 320~430px/200%·로그인/관리자 5회 E2E, GeoIP·canonical·블로그 메뉴와 API 완전 연결, Android CI·실기기 수용.
5. P2 문서 충돌·봇 QA 구문·구식 URL·근거 없는 구조화 평점 정리.
6. 모든 변경 전에 `origin/main` 재조회, 신규 브랜치, 같은 SHA CI와 격리 Test 백엔드/DB/회원·관리자 기능 확인, 백업/롤백, 무중단 운영 승격 및 승격 후 실제 서비스 재검증.

**최종: 현재 main의 빌드·타입·기본 테스트는 통과하지만, 전체 기능 수용 및 안전한 운영 승격은 여전히 BLOCKED. 본 기록은 감사 결과이며 수정·테스트서버 승격·운영 승격 완료가 아니다.**
