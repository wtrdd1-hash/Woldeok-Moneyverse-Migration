# 머니버스 전체 기능 회귀 재점검 — v2026.10.17.801

[English canonical](MONEYVERSE_FULL_FUNCTIONAL_REGRESSION_AUDIT_v2026.10.17.801.md) | **한국어**

**판정: 감사 완료, 전체 기능 수용·운영 승격 BLOCKED.** 2026-10-17 KST, Debian 13 미니PC에서 실제 원격 점검. 소스 검증 시작 SHA `bca8d54a6ef5b2a4903429c9db02e662d2a66cd2`(v800), 점검 중 문서 전용 최신 main `2a84687fd2d54608deec17c6651df32fe0025422`로 전진. 운영 DB 쓰기·기능스위치 조작·서비스 재시작·Test/Production 전환 없음.

## 범위 및 기획 우선순위

권위 순서: `docs/planning/PROJECT_PLAN.md` → `INTEGRATED_PLANNING_MASTER.md` → 채택된 상세 명세 → SHA 일치 계약 → 과거 기록. AGENTS, 문서 정책, 릴리스 지침, v530 UI 수용, v790/791/796 변경 증거 검토. v800 소스에 **Next 화면 166개(관리자 34), Next API route 파일 62개, Nest 컨트롤러 82개, 백엔드 테스트 파일 216개, 프론트엔드 테스트 파일 239개** 존재. 파일 수가 실사용 기능 동작 검증을 대신하지 않는다.

## 실제 재현·위험 분류

| ID / 우선도 | 확인 사실 | 완료 조건 |
| --- | --- | --- |
| F801-01 / P0 | 운영 DB 금융 읽기 전용 검사 **BLOCKED**. 앱 계정이 `account_balances`, `accounts`, `ledger_transactions`, `ledger_postings`, `system_treasury_vaults` 5개 핵심 테이블에 직접 INSERT/UPDATE/DELETE 가능. 잔액 40개 중 원장 투영 불일치 19개, 합계 **+4,779,188 WLD**. 이 중 분개가 전혀 없는 5개 계정 잔액 +2,627,807 WLD. 차변·대변 불일치 거래 0건, 분개 없는 거래 0건. **미증명 개시잔액/투영 차이이지 금전 손실 확정 아님.** | 개시잔액 출처·거래 영수증·국고 총액 대사, 최소권한 마이그레이션·복제 DB의 부정권한 테스트. 차액을 직접 UPDATE로 덮지 않음. |
| F801-02 / P0 | 공식 Test 릴리스 매니페스트와 물리적 Next 빌드 SHA는 **50fb6395(v795)**, 공개 버전과 백·프론트 BUILD_ID는 **bca8d54a(v800)**. 최신 v800 기준 `manifest_sha_mismatch`, `frontend_artifact_sha_mismatch` 재현. v795 기준에는 백엔드/프론트엔드 환경·공개 버전 불일치. | 동일한 승인 SHA로 빌드/서버 환경/매니페스트/Next 산출물/공개 버전 통일; DB·세션·롤백·Test 수용 다시 수행. |
| F801-03 / P0 | 실제 Production v717 SHA `176ca04ecfbd...` 지속. 공식 Test 링크 v795, 메인 소스 v800 이후 문서 갱신. 최신 기능이 운영에 반영됐다는 증거 없음. | 금융·Test 신원·v530 전체 인증 UI 5회·백업 복원·무중단 조건 해결 후 승인된 운영 절차로만 전환. |
| F801-04 / P1 | v800 소스상 실제 UI 링크 4개가 운영 404: Discord 배너 `/attendance`, 계산기 후속 `/career-guide`, 고객지원 안내 `/guide/getting-started`, 로드맵 `/pet`. `/register`, `/guide`, `/businesses`, `/shop`, `/board`, `/work`, `/wallet/activity`는 200. 기타 구형 URL 404는 현재 활성 CTA인지 추가 확인 필요. | 최신 실존 경로 연결 또는 대상 기능 구현, 링크 회귀 테스트, 회원/비회원·모바일 실제 브라우저 동선 검증. |
| F801-05 / P1 | 현 소스 비테스트 6파일에 잔액 직접 UPDATE 패턴 **20곳**: 국채, 자동 SWF, 환율, 국민연금, 암시장, PvP. 정적 발견 자체가 실제 운영 실행 증거는 아님. 암시장 경매 목록 소스는 현재 SELECT 전용이며 과거 GET 정산 문제를 무조건 재현됐다고 볼 수 없음. | 각 쓰기 경로 실행 가능성·원장 증빙 분류 후 원장 기반 원자적·멱등성 동작으로 교체, 병렬·권한·롤백 Test. |
| F801-06 / P1 | 주식 포트폴리오·관리자 분석·SWF UI 등에서 큰 WLD 문자열을 JS `Number`로 바꾸는 로직 잔존. 실제 사용자 손실 확정은 아니나 `Number.MAX_SAFE_INTEGER` 초과 정밀도 위험. | 문자열/BigInt 안전 경계, 고액 입력·출력·차트 회귀 테스트. |
| F801-07 / P1 | 166개 화면·관리자 34개에 대한 v530 **5회 전체 인증 UI 브라우저 검증 증거 없음**. 320/430px, 키보드/포커스, 정상·없음·권한거부, 로그인 유지까지 확인 필요. | 실제 테스트 사용자/관리자 세션·스크린샷·인터랙션 5회/화면·동적 상태·모바일/국가 언어 완주. |
| F801-08 / P1 | 전체 소스 테스트는 PASS지만 **DB 연계 검증 상당수 스킵**: Node 게이트 14 PASS, 계약 31 PASS, database 8 PASS/3 SKIP, 백엔드 1,253 PASS/396 SKIP(파일 161 PASS/55 SKIP), 프론트 1,267 PASS(239파일). 격리 워크트리에 DB URL 미설정. | 테스트 전용 권위 DB 복제, 실제 migration/ACL/동시성/E2E로 필수 스킵 제거. |
| F801-09 / P2 | 타입 검사 PASS, ESLint 오류 0/경고 1,076, 전체 빌드 PASS. 2a84687f main CI 성공 기록 확인. CI 성공은 Test/금융/운영 승격 합격과 별도. | 경고 개선·최신 merged SHA 전체 품질/보안/배포 게이트 재검. |
| F801-10 / 미검증 | 홈페이지·상태·블로그·지갑·주식·로그인·robots/sitemap 등 비로그인 HTTP 200, 마켓플레이스 로그인 이동. 7개 기능스위치 enabled, 핵심 서비스 가동, 최근 30분 샘플 주요 서비스 에러 로그 0. `/zh` 200, `/zh-CN` 404는 정식 locale 정책 판단 필요. IP/언어 실제 해외 테스트·Discord DM 실제 전달·AI 정책 영수증·Android 기기 테스트는 미실시. Android GitHub main `ee97ddfc`, Android CI PASS지만 미니PC 로컬 Android 체크아웃은 불완전. | 각 기능마다 실제 사용자·권한·DB·로그·외부 전달 근거로 수용. 프로세스 active/HTTP 200만으로 완료 선언 금지. |

## 실행 증거

- 별도 브랜치 `audit/all-feature-regression-v2026.10.17.801-chatgpt`; 의존성 842개 캐시 오프라인 사용. `pnpm test` 종료 코드 0: Node 14, 계약 31, DB 패키지 8/스킵3, 백엔드 1253/스킵396, 프론트엔드 1267 PASS. 릴리스·원장 검증 단위 47/47 PASS.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` 각각 정상 종료. ESLint 경고 1,076. 인증 브라우저 UI 5회나 DB 실제 수용을 대신하지 않음.
- 금융 검사는 실제 운영 연결 환경으로 `REPEATABLE READ READ ONLY` + ROLLBACK 실행; 결과 BLOCKED, 데이터 변경 없음.
- Test 신원 검사는 활성 systemd, manifest, 서비스 환경, Next 빌드 산출물 및 공개 버전을 직접 비교하여 양쪽 SHA 모두 BLOCKED.
- 회원 금융거래·위험한 운영 GET·DB 쓰기·서비스 재시작·실제 운영 승격 작업은 수행하지 않음.

## 처리 순서

1. 원장 19개 불일치 개별 개시증빙·국고/화폐 총량·5개 무분개 잔액 대사, 백업/복원.
2. 잔액 직접 변경 및 광범위한 금융 DML 권한을 격리 DB에서 원장·최소권한 구조로 시정, 멱등/병렬/보안 부정테스트.
3. 공식 Test의 v795/v800 산출물 혼합 해소, 동일 SHA 정확성·세션 재시작·롤백 검증.
4. UI 404 링크 시정, 회원/관리자 166화면 5회·320/430px·API/DB 필수 테스트 스킵 제거.
5. 모든 수용 게이트 통과 후만 운영 병렬 세대·무중단 canary·원자적 승격·원복 검증. 그전 운영 v717 유지.

**상태:** 소스 자동테스트 `SOURCE_TEST_VERIFIED`; 환경상태 `RUNTIME_OBSERVED`; 금융/공식 Test 신원/전체 인증 UI/운영 승격 `BLOCKED`. 새 기능을 `PRODUCTION_VERIFIED`로 주장하지 않음.
