# 월덕 머니버스 전체 코드·기능 수용검증 — v2026.10.14.605

> **현재 판정: 전체 기능 수용 BLOCKED(차단).** 실제 검사를 수행한 범위와 미검증 범위를 구분하는 문서 전용 감사다. 운영 승격·전체 기능 정상 보증·침투테스트 통과를 의미하지 않는다. [영문 정본](MONEYVERSE_FULL_FUNCTION_ACCEPTANCE_AUDIT_v2026.10.14.605.md) 참조.

## 1. 기준과 검사 범위

- 2026-10-14 13:54~14:10 KST, Debian 13 $pc 직접 접속. 현재 GitHub main 정확한 SHA **`c56af867ad8f7556e53f895b0bb294c4bfc8a02d`**, 격리 브랜치 `audit/full-function-acceptance-20261014-v605`. Android SHA `e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3`.
- 작업 시작·중간 `origin/main` 재조회 SHA 동일. 공유 main과 Gemini 작업 미수정. 통합기획·PROJECT_PLAN·문서 정책·완료도 SSOT·보안 마스터·v603 위험·v604 봇 운영 기록을 우선 검토했다.
- 자동 코드 인벤토리: **Git 추적 파일 3,938개**, Next 페이지 164개, Nest 컨트롤러 80개, 프론트 Next API 핸들러 63개, 백엔드 테스트 파일 190개(이 중 DB 통합 테스트 52개), 프론트 테스트 파일 213개. 파일 수는 전 기능 실측 통과 수와 다르다.
- 운영 service WorkingDirectory는 **production-current → prod-v600**, 구형 Test alias는 **test-v541-gsc-aa4b6387**. c56 소스를 격리 공간에서 테스트했으며 운영/테스트 배포 SHA가 최신 main과 같다고 인증하지 않았다.
- 운영에 영향을 주지 않도록 **비로그인 HTTP GET**, 격리 빌드/단위시험, **개발 DB SELECT**만 수행했다. 실제 자금 이동, 운영 DB 수정, 권한 변경, 기능 스위치 변경, 마이그레이션 적용, 운영 배포 없음.

## 2. 실행 검증 결과

| 검사/명령 | 실제 결과 | 해석·제한 |
| --- | --- | --- |
| `pnpm install --frozen-lockfile --ignore-scripts` | **통과** | 격리 작업공간 의존성 842개 준비 |
| `pnpm typecheck` | **통과** | 계약/DB/백엔드/프론트 모든 타입검사 |
| `pnpm build` | **통과** | 전체 빌드, Next 페이지/서버 번들 생성 |
| 백엔드 Vitest (DB 통합 테스트 제외) | **1,162 통과 / 29 스킵 / 0 실패** | 137 파일 통과/1 스킵. 실제 DB 트랜잭션·권한 검증 증거 아님 |
| 프론트 기본 실행(NODE_ENV=production 상속) | **790 통과 / 379 실패** | 환경 탓으로 React production `act` 없음. 379건을 각기 다른 제품 버그로 해석 금지 |
| 프론트 `NODE_ENV=test` 재실행 | **1,134 통과 / 35 실패**, 실패 파일 **19/213** | 환경 오류 제거 후 남은 기능/테스트 계약 문제 35건은 **미해결** |
| 데이터베이스 패키지 정적 Vitest | **7/7 통과** | 소스 migration parity 및 SQL 형식, 실제 DB 적용 체크 아님 |
| Discord 봇 `pnpm bot:test` | **4/4 통과** | 최초 격리 작업공간 bot 의존성 누락을 기존 로컬 설치와 연결한 뒤 재검사 |
| ESLint | **오류 0 / 경고 1,057**, 종료 0 | 경고는 보안 취약점 수 아님 |
| `pnpm api:contract:check` | **실패** | 624개 컨트롤러 메서드 기준 179개 API 생성. 모바일 계약 JSON/영·한 schema 문서 3개가 소스와 불일치. 생성 변화는 소스에 남기지 않고 원상복구 |
| 백업/릴리스/전체 라우트 QA 규칙 테스트 | **12/12 통과** | 스크립트 계약 검증이지 인증된 전체 브라우저 E2E 아님 |
| 봇 추가 QA 스크립트 구문검사 | **실패** | `bot/scripts/qa_ads_sponsorblock_verification.mjs:7` 문자열 구문 오류 |
| Android `testDebugUnitTest --offline` | **실행 차단** | Gradle Foojay 리졸버 미캐시 |
| Android 온라인 `testDebugUnitTest` | **실행 차단** | 로컬 Android SDK/ANDROID_HOME 없음. APK/Android 동작 정상 주장 금지 |

## 3. 프론트엔드 실패 파일 전체(35건)

| 분류 | 실패 수 | 경로·내용 |
| --- | ---: | --- |
| 카지노 화면/게임 | 7 | `casino/dice.test.ts` 5, `casino/game-theme-regression.test.ts` 2. 현재 경로·UI 구조와 기존 테스트 기대가 불일치. 변경 의도와 정책 확인 필요 |
| 수익성/클릭 | 3 | `app/e2e-click-profitability.test.ts` |
| 알림 상태/동시성 | 5 | `notification-center-modal.race.test.tsx` 3, `account/notifications/unread-count.test.ts` 2 |
| 반응형/색 대비/UI | 9 | `color-contrast-regression` 2, `mobile-responsive-regression` 2, `brand-responsive` 1, `site-header-responsive` 1, `admin-mobile-responsive` 2, `truncated-list` 1 |
| SEO/경로/가이드 | 6 | `search-indexing` 2, `seo-routes` 2, `guide` 2 |
| 관리자 SEO/개발자 메뉴 | 2 | `admin-seo` 1, `developer-access` 1 |
| API 게이트웨이/서비스 영향 | 2 | `app-gateway` 1, `service-impact` 1 |
| 복리 계산기 | 1 | `compound-calculator` 1 |

일부는 **이전 테스트의 텍스트 기대가 낡아서** 실패했을 가능성이 있다. 하지만 기능 변경 결정·현재 권위 기획서·실제 E2E 수용 증거 없이 임의로 테스트를 삭제하거나 "정상" 판정해서는 안 된다.

## 4. 운영 HTTP 실측·개발 DB 회계

- 공개 GET **63개 표본**: 최초 **200 응답 61개**, `/business` **404 1개**, `/tools/stock-calculator/chips-minus-20` 연결 종료 1개. 재시도 때 계산기 경로 **200**, `/business`는 여전히 **404**. 실제 존재하는 경로 `/businesses`는 **200**. `/status`는 첫 순차 요청 실패 뒤 재검사 **200**.
- 백엔드 사설 `/health` **200**, 비로그인 `/api/v1/auth/viewer` **401**, 비로그인 공개 주식 목록 **200**. 프론트 `/app-api/v1/account/identities` 비로그인 요청 **401**: 로그인한 사용자에게 발생했던 500 문제가 고쳐졌다는 의미 아님.
- 직접 SELECT한 DB는 **`woldeok_moneyverse_dev` 개발 DB**다. 공개 테이블 241개, 공개 함수 549개, SECURITY DEFINER 함수 485개. 복식원장 **거래 831건 / 전표 1,692건(차변 846·대변 846)**, 거래별 금액 대사 불일치 **0건**, 전표 없는 거래 **0건**. 현재 스냅샷 일부 무결성 확인일 뿐 운영 DB 회계인증·동시성증명은 아니다.
- 개발 DB 마이그레이션 적용 기록 266개, 최신 소스의 번호 파일 002~269는 268개. **237·269가 개발 DB 미적용**으로 확인됨. **GAP-605-DB-01**: 237은 의도적 이력 제외 여부, 269는 적용 대기/누락 여부와 immutable checksum을 검증한다. 사용자 승인/격리 DB 검증 없이 절대 임의 적용하지 않는다.
- 카지노·경제 AI 자동정책·주식 기업행위 등 스위치 `enabled` 관측은 기능 정상이나 정책 적법성의 증거가 아니다.

## 5. 영역별 기능 수용 판정

| 기능군 | 증거 | 현재 판정 |
| --- | --- | --- |
| 회원가입·로그인·OAuth·세션·관리자 2FA | 비로그인 401/단위시험 | **미검증**: 인증·재인증·계정 복구 실제 E2E 필요 |
| 지갑·송금·원장·대사 | 개발 DB 831건 거래 대사 정상 | **미검증**: 실거래·멱등·DB 권한·운영 회계 별도 |
| 주식·호가·레버리지·포트폴리오 | 페이지 GET 200, 일부 소스/단위 | **미검증**: 실제 체결·정산/고래 카피 거래 |
| 은행·대출·국채·Repo | /bank 200, 단위 | **미검증**: 잔액·이자·상환 실제 DB |
| 중앙국고·지원금·DAO | /treasury 200, 기존 코드 위험 재확인 | **차단**: 중복투표 및 원장 없는 지급 성공 응답 |
| 카지노·공정성·게임 | /casino GET, 스위치 enabled | **차단**: 7건 UI 테스트 실패, 정책과 화면 정합성 불명확 |
| 직업·업무·초기 성장 | /work 200, 단위 | **미검증**: 실제 일감/보상 원자적 처리 |
| 사업·길드·자금조달 | /businesses 200, /business 404 | **미검증**: 경로·실제 거래 기능 |
| 커뮤니티·게시판·알림 | /support 200, 화면 자동시험 | **차단**: 알림 경합·미확인 상태 5건 실패 |
| 관리자·보안·백업·감사 | 관리자 화면 GET 및 코드 점검 | **차단**: 백업 AdminSessionGuard 누락, 관리자 2FA E2E 없음 |
| SEO·다국어·블로그·계산기 | 사이트맵 1,012 loc, 표본 GET, 빌드 | **차단**: SEO·계산기 테스트 실패, API 색인/진실성 이슈 |
| 경제 AI·국부펀드·통화정책 | 서비스 실행 및 단위 | **미검증**: 정책 한도·실제 원장·AI 승인권 |
| Discord 봇·음악·알림 | 봇 4개 시험 통과 | **소스 시험 통과**, 실제 Discord 게이트웨이/음성 연결 **미검증** |
| Android 모바일 앱/API | Android 소스 확보, 계약 생성 | **차단**: SDK 미설치, 모바일 API 문서 불일치 |
| 인프라·배포·백업·장애복구 | 핵심 서비스 실행, QA 12개, health 200 | **미검증**: 실제 복구·관리자 E2E·정확한 SHA 승격 |

## 6. 기존 v603 보안 문제 계속 존재

최신 코드에서 아래 **소스 위험 신호**를 다시 확인했다: 내부 인증 토큰 고정 기본값, 백업 API에 관리자 역할 가드 누락, IndexNow POST에 자체 인증 체크 없음, DAO 계정별 중복투표 방지 없음, 창업 지원서 고정 신청자 ID, 국고 지급 API에 실제 원장 호출 없음. 전체 위험 근거는 [v603 보고서](MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.ko.md)를 연결하며 운영상 실제 악용 성공을 주장하지 않는다.

## 7. 권고 작업 순서 및 엄격한 수용조건

1. **P0 우선**: 인증 비밀값 없으면 fail-closed, 관리자 백업 권한/재인증, 국고 지급 canonical 원장 영수증, DAO 계정별 1표/DB 원자성, IndexNow 미인증 남용 차단.
2. **P1**: 프론트 실패 35건 각각 실제 회귀/승인된 기능 변경/테스트 결함으로 분류하고 수정하여 0 실패 증명. 모바일 계약 3개 정합화, 개발 DB 237·269 누락 이유 확인, 반응형/카지노/알림/SEO 수용.
3. **P1 Test**: 현재 수정 코드 SHA의 새로운 격리 테스트 백엔드·DB 구성, 마이그레이션 checksum, 권한 음성 시험 및 금융 복식원장 검증, 회원·관리자 로그인 E2E, 모든 경로 5회 수용, 장애복구 기록.
4. **P2**: `NODE_ENV=test` 명시, lint 경고 1,057개 분류, 봇 QA 스크립트 수정, Android SDK 구축, 실제 음성·Discord 연결 QA 및 오래된 경로 정리.
5. 수정 때는 **최신 main에서 별도 코드 브랜치**, CI/Test exact SHA/백엔드 헬스 확인, 무중단 운영 승격을 **별도 승인**해야 한다. 이번 v605는 보고서만 남겼다.

## 8. 근거와 남은 제약

- [GET 표본 원자료](evidence/function-audit-v605/runtime-get-smoke.json), [실패 테스트 파일별 목록](evidence/function-audit-v605/frontend-failure-groups.json), [검증 집계 JSON](evidence/function-audit-v605/audit-summary.json) 보존. 세션, 비밀번호, 운영 DB 개인정보, 비밀값 원문은 포함하지 않는다.
- GitHub 현재 main SHA에 대해 CI 상태/PR 기반 워크플로 조회는 관련 결과 항목을 반환하지 않았다. **CI 100% 통과 주장 금지**.
- 관리자·회원 인증이 필요한 실제 행동, 실거래, 모든 디바이스 브라우저 UI 5회, Android APK, Test/Production exact-SHA가 아직 수용되지 않았으므로 "전 기능 정상" 판정은 할 수 없다.
