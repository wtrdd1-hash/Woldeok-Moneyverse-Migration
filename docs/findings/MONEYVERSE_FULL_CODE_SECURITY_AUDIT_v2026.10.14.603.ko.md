# 월덕 머니버스 전체 코드·보안 재감사 — v2026.10.14.603

> 상태: **문제 확인 / 개선 필요 / 문서 전용**. 침투시험 통과, 구현 완료, Test 수용, 운영 승격을 의미하지 않는다. 영문 정본: [MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md](MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md)

## 1. 점검 범위·권위·병행 작업 처리

- Debian 13 미니PC에 $pc로 접속하여 GitHub main, 현재 배포 디렉터리, 관리자·인증·경제·DB·SEO·봇 코드를 점검했다. 시작 SHA **062db65b8b6abd88c7e10d24ffe0842b63e185e8**, 중간 변경 이후 SHA **6be447193f006069ec8257bb50c8c675fe24bc52**. 다른 에이전트의 변경을 보존하면서 격리 브랜치를 최신 main으로 fast-forward했다. Android GitHub main: **e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3**.
- AGENTS, Superpowers 검증 규칙, DOCS_INDEX, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, SECURITY_MASTER_PLAN, PLANNING_GAP_CLOSURE, 기존 릴리스·작업 기록, v600 권위 불일치 및 v602 전략/SEO 점검을 우선 읽었다. **통합기획 권위 v530은 별도 승인 전 그대로 유지**한다.
- 최종 소스 자동 인벤토리: **웹 저장소 Git 추적 파일 3,890개 / 코드·설정 파일 1,916개 읽기 / Next API 라우트 63개 / 파일 읽기 실패 0건**, Android 저장소 **186개 추적 파일**. 자동 스캔은 후보 탐색이며, 3,890개를 한 줄씩 사람이 수동 보안검토했다는 주장은 아니다.
- 실제 서비스 작업 디렉터리는 production-current에 연결되며 점검 시 **prod-v600**이었다. 반면 구형 별칭 /srv/moneyverse는 **prod-v589**를 가리켰다. IndexNow/DAO/블로그 경로 3개의 소스 해시는 격리 브랜치 및 활성 배포 디렉터리에서 동일했다. 운영 DB를 수정하거나 실제 공격성 요청을 보내지 않았다.
- P0는 즉시 봉쇄 후보, P1은 높은 우선순위, P2는 품질·운영상 문제다. **소스 결함 확인**과 **실제 외부 공격 성공 확인**은 서로 다르다.

## 2. 결함·보안 위험 상세 레지스터

| ID | 심각도·확인 상태 | 문제 및 파일/행 근거 | 권고·수용 조건 |
| --- | --- | --- | --- |
| SEC-603-01 | **P0 조건부 / 코드 확인** | blog/generate (frontend/src/app/api/blog/generate/route.ts:10-20), discord/broadcast (frontend/src/app/api/discord/broadcast/route.ts:7-16), 백엔드 일일 SEO 호출 (backend/src/seo/seo-daily-digest.service.ts:144-153)이 환경변수 부재 시 **하드코딩 기본 인증 비밀값**을 공통 사용한다. 운영환경에서 실제 환경변수가 빠졌는지는 미확인. 비밀값 원문은 보고서에 재기재하지 않는다. | 필수 환경변수 누락 시 시작/호출을 기본 거부하고, 역할별 고엔트로피 키를 분리·회전한다. 오류/누락 헤더 거부 음성 테스트. |
| SEC-603-02 | **P1 / 관리자 권한 검사 공백 확인** | backend/src/admin/admin-backup.controller.ts:31-35,80-129의 백업 목록 및 수동 백업 실행에 세션·동의·CSRF 가드는 있으나 AdminGuard/AdminSessionGuard 및 고위험 작업 재인증이 없다. 백엔드 외부 직접 노출 여부는 별도 확인 필요. | 관리자 역할과 스텝업 검증, 일반 로그인 사용자 호출 거부 통합테스트, 프록시 공개 경로 재검증. |
| SEC-603-03 | **P1 / 반복 투표 가능 로직** | frontend/src/app/api/treasury/proposals/route.ts:199-265은 로그인만 확인하고 투표자의 실제 계정·중복표 기록 없이 votesCount를 매번 +1 증가시킨다. | (제안 ID, 사용자 ID) 고유 제약, 원자적 DB 투표 거래, 멱등성 및 반복투표·경합 테스트. |
| SEC-603-04 | **P1 / 투표·지원서 유실 가능** | DAO의 파일 로드→덮어쓰기(frontend/src/app/api/treasury/proposals/route.ts:74-108,183-192,220-255) 및 창업 지원서의 동일 방식(frontend/src/app/api/treasury/apply-grant/route.ts:43-68,96-123)은 파일 잠금·DB 트랜잭션이 없다. 저장 실패를 잡아놓고 성공을 응답한다. 실제 손실 발생은 입증되지 않았다. | DB 트랜잭션/감사 영수증, 동시요청·읽기전용 저장소 실패 테스트, 실패 시 성공 응답 금지. |
| SEC-603-05 | **P1 / 외부 서비스 호출 남용** | frontend/src/app/api/indexnow/route.ts:8-33의 미인증 POST가 호출자 URL을 받으며 lib/indexnow.ts:114-135에서 최대 1만 개를 외부 IndexNow로 전송한다. 별도 미인증 관리자 경로 frontend/src/app/api/admin/seo-audit/route.ts:55-65도 전량 전송한다. 고정 목적지이므로 일반 SSRF라고 과장하지 않는다. | 관리자/스케줄러 인증, rate limit, 길이·건수 제한, 자사 canonical 소유 URL 검증, 타 도메인 차단. |
| SEC-603-06 | **P1 / 국고 지급 허위 성공** | frontend/src/app/api/treasury/claim/route.ts:7-58에서 프로그램별 상수 금액을 설정하고 **원장 처리 없이 지급 완료 성공 메시지**를 돌려준다. 미승인 실제 자금 이동 증거가 아니라, 유저에게 지급을 오인시키는 기능 결함이다. | 원장 기반 DB 정산·멱등 지급영수증 없이 지급 성공 반환 금지. 시뮬레이션이면 명확히 모의로 분리. |
| SEC-603-07 | **P1 / 지원서 신청인 추적 불가** | frontend/src/app/api/treasury/apply-grant/route.ts:91-113에서 applicantId를 실제 인증 사용자 대신 고정 ID로 저장한다. 소유권·중복신청·사후 감사 무결성이 없다. | 실제 사용자 UUID 서버 검증, 소유권 제약과 신청 상한, 원자적 DB 기록. |
| SEC-603-08 | **P1 / 관리자 SEO 허위 실측** | frontend/src/app/api/admin/seo-audit/route.ts:8-53이 크롤러 상태, 색인률, 응답시간, 성공률 100%를 **고정 값**으로 반환한다. GSC 실측 증거가 아니다. v602 별도 검토에서도 관련 문제가 기록되었다. | MOCK 표기 또는 권위 API와 측정시각·출처를 연동. 제출 성공과 실제 색인을 구분. |
| SEC-603-09 | **P1 / 모바일 빌드에 테스트 계정 힌트** | Android app/src/main/res/values/strings.xml:16에 테스트 계정 ID·비밀번호 안내가 평문 문자열로 포함됐다. 실제 로그인 가능 여부는 미확인. | 운영 리소스에서 삭제, 실제 공유 테스트 계정 폐기·비밀번호 회전, APK 문자열 검사 및 debug 분리. |
| SEC-603-10 | **P2 / 실행 불가 QA 스크립트** | bot/scripts/qa_ads_sponsorblock_verification.mjs:7 및 후속 지점에 JavaScript 작은따옴표 내부 줄바꿈이 있어 node --check 실패. | 문자열 수정 후 CI 구문 검사·QA 호출 추가. |
| SEC-603-11 | **P1 / 타입체크 게이트 차단** | 현지 backend/node_modules/typescript가 없는 경로로 연결돼 pnpm typecheck가 백엔드 검사 시작 전 모듈을 찾지 못한다. 오프라인 의존성 설치는 120초 제한을 초과했다. 소스 컴파일 오류 여부는 미결. | 격리 CI 의존성 재설치, pnpm lockfile, 타입·테스트·빌드 통과 후에만 승격. |
| SEC-603-12 | **P2 / Android 버전 불일치** | app/build.gradle.kts:14-15는 versionCode=35, versionName=1.3.4이나 ApiClient.kt:18은 User-Agent APP_VERSION=1.3.0. 통합 문서에는 versionCode=134라는 기존 주장이 있다. | BuildConfig.VERSION_NAME 하나로 통일, 릴리스 원장과 재대조. |
| SEC-603-13 | **P2 / AI 블로그 설명·실제 구현 불일치** | frontend/src/app/blog/blog-data.ts:383-419는 날짜별 템플릿 조합이며 독립 실시간 AI 자료조사 엔진이 아니다. frontend/src/app/api/blog/generate/route.ts:38-86은 비동기 통지 성공을 기다리지 않는데 색인 핑 전송 완료라고 표현한다. | 생성 방식·근거 출처를 투명하게 기재, 외부 도착 여부 검증 전 완료 주장 금지, 금융 콘텐츠 인용·품질 검수. |
| SEC-603-14 | **P2 / 배포 별칭 및 문서 최신성 혼동** | 활성 production-current=prod-v600, 레거시 /srv/moneyverse=prod-v589. 기존 기획·운영 기록의 버전/완료 주장은 각각 서로 다른 시점의 증거다. | 실제 systemd WorkingDirectory·배포 SHA 기준 manifest 생성, 계획/기능검증/운영배포 버전 분리 기록. |

## 3. 테스트·코드 검사 실측

- Node 기본 테스트: **12 통과 / 0 실패 / 0 스킵** (백업증빙, 릴리스 규정, QA 전체 라우트 원장).
- ESLint: **종료 코드 0, 오류 0, 경고 1,062**. 경고를 취약점 개수로 해석하지 않는다.
- Git 추적된 JS/MJS/CJS·JSON·쉘 검사: **봇 MJS 1개 구문 오류**, Android XML **23개 정상 파싱**; SQL 마이그레이션 파일 002~269 **268개 번호 연속·중복 0개**.
- 웹 전체 타입체크: **미통과(로컬 의존성 링크 손상으로 검사 전에 중단)**. Android 오프라인 단위 테스트: **미실행(Gradle Foojay plugin 1.0.0 미캐시로 구성 실패)**.
- Node 테스트와 린트는 최초 SHA 062db65b의 동일 코드 기준에서 실행한 값이다. 이후 병행 변경으로 main을 6be44719까지 업데이트했으므로 **최종 SHA의 전체 테스트 인증 결과로 재사용하지 않는다**.
- 미실행: 실제 운영 공격 시험, 전 관리자 E2E, 실제 PostgreSQL 권한 음성/동시성 검증, 의존성 최신 CVE/SBOM 감사, Android 정식 APK 서명 확인, 정규 Next/Nest 전체 빌드, exact-SHA 격리 Test·백엔드 건강성 승인.

## 4. 기계 탐지와 실제 취약점의 구분

- SECURITY DEFINER 관련 정규식 **695건은 출현 건수**다. 695개 위험 함수가 아니다. 역할별 실제 함수 ACL·search_path·소유자는 DB에서 별도 확인이 필요하다.
- migration 114의 profile_get_cosmetics PUBLIC EXECUTE는 이후 **migration 125에서 철회**했다. 현재 운영 DB 권한 검증 없이 이를 미수정 치명 취약점으로 확정하지 않는다.
- SQL 템플릿 후보 26건은 backend 테스트 *.db.test.ts 내부이고, eval 검색 4건도 테마 테스트 코드다. XSS 관련 116건은 HTML 삽입 패턴 후보이며 실제 사용자 입력 경로 미확인 상태다.
- 경로 인증 문자열이 빠진 것으로 탐지된 30여 API는 서버 측 API 계층에서 권한을 재검증할 수도 있으므로 무인증 취약점으로 일괄 판정하지 않는다.

## 5. 순차 해결 계획·담당·배포 차단 기준

1. **보안·운영 담당**: 인증 고정 기본값 제거, 비밀값 회전 및 누락 시 fail-closed. 환경변수는 실제 값 대신 존재/길이만 점검.
2. **백엔드·경제 코어 담당**: 백업 관리자 가드, DAO 계정별 1표, 원자적 투표/지원서, 실제 원장 지급영수증과 보상 트랜잭션 정비. Test에서 다른 사용자·중복·병행 요청 음성 테스트 필수.
3. **프론트엔드·SEO 담당**: IndexNow 인증·소유 URL·속도 제약, 허위 관리자 SEO 수치 제거, GSC/Naver/Bing 실측·출처 연동.
4. **QA·Android 담당**: TypeScript 패키지 링크/오프라인 Gradle 복구, 봇 스크립트 구문 수정, 린트 부채 우선순위, 테스트 계정 힌트 제거, Android 버전 소스 통일.
5. 수정은 **다시 최신 origin/main에서 새 코드 브랜치**, 독립 Test 환경, 정확한 SHA의 백엔드·DB·인증 테스트 및 무중단 운영 승격 증거가 있어야 한다. **본 회차는 문서 작성만 하고 운영을 수정하지 않는다.**

## 6. 연결 기록

- 정본 영어 보고서와 동일한 결함 ID를 공유한다. 증거용 JSON: [static-inventory.json](evidence/security-audit-v603/static-inventory.json), [syntax-check-results.json](evidence/security-audit-v603/syntax-check-results.json). **소스/비밀값 원문 없는 경로·건수 중심 산출물**이다.
- [이번 작업 기록](../worklog/2026-10-14-full-code-security-audit-v603.md), [통합기획서](../planning/INTEGRATED_PLANNING_MASTER.ko.md), [직전 v602 전략·SEO 분석](MONEYVERSE_STRATEGY_DEEP_DIVE_v2026.10.14.602.ko.md) 참조.
