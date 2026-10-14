# 월덕 머니버스 — 프론트엔드 진입점·백엔드 기능 정합성 감사 v2026.10.14.628

**상태:** AUDIT / BLOCKED. 소스 검증 보고서이며, 수정 완료·운영 검증·배포 완료 선언이 아니다.
**소스 기준:** 2026-10-14 KST `origin/main=d4f9cc1978bea6ee1a0e904005fa418cd159b4cd`.
**상위 기획 권위:** `docs/planning/PROJECT_PLAN.ko.md` 및 `INTEGRATED_PLANNING_MASTER.ko.md`의 v530 현행 권위 / AUTHORITY_DRIFT. 기존 보안 감사 v603과 중복 문제를 구분한다.

## 범위 및 검증 수준

- GitHub 트리 3,945개 추적파일, Next 페이지 파일 164개(정적 패턴 135개), 백엔드 컨트롤러 80개, 데코레이터 기반 API 메서드 후보 541개, 프론트 소스 후보 852개, `routes.config.ts` 등록 경로 73개를 자동 조사했다.
- 글로벌/회원/모바일/관리자 네비게이션과 주요 API 호출·컨트롤러 구현을 직접 읽었다. **모든 파일을 한 줄씩 수동 심사했다는 뜻은 아니다.**
- 투자/경매/선물/퀀트/관리자 주요 파일 8개는 점검 main, 현재 운영 `prod-v600`, 테스트 `test-v618-7fa3f245bbc3` 파일의 SHA-256이 동일했다.
- 운영과 테스트의 GET `/health`는 HTTP 200. 비인증 GET `/admin/blog` 및 `/admin/treasury/grants`도 200이었지만 이는 실제 관리자 화면, 권한이나 기능 동작을 증명하지 않는다. 로그인 사용자 E2E/실제 원장·DB 권한 시험은 하지 않았다.
- 자동 검사에서 나온 **미참조 API 후보 수는 확정 결함 개수가 아니다.** 같은 파일 내 다중 Nest 컨트롤러, 내부 전용 API 및 410 폐기 경로는 오탐 가능. 예를 들어 `/api/v1/admin/approvals`는 명시적으로 `GoneException` 처리되어 신규 버튼을 만들 대상이 아니다.

## 확정·추가확인 결함 원장

| ID | 우선순위 | 코드 근거 | 결함 | 수용·해결 게이트 |
| --- | --- | --- | --- | --- |
| UX628-01 | **P0** | `frontend/src/app/api/admin/treasury/grants/route.ts:49-130` | 국고 창업 그랜트 승인 POST는 관리자 역할 대신 `isLoggedInMember()` 로그인 여부만 확인. JSON 파일 상태 변경으로 국고 지급 완료를 응답하며 원장 정산이 없음. 일반 회원의 악용 성공은 시도하지 않았으나 소스상 권한 경계가 없다. | 관리자 역할·세션·CSRF·재인증, 일반회원 거부 테스트, 감사·원자적 DB 지급 영수증, 허위 성공 제거 |
| UX628-02 | **P0** | `frontend/src/app/businesses/ventures/page.tsx:56-155,162-252,260-340` | 지갑 6천만 WLD 고정값. 창업·공모주 청약·배당금·투표를 React 상태로만 계산하면서 실제 지갑 입금·법인세 소각이라고 안내 | 사용자 실제 잔액·원장 API/멱등 영수증 연결 전까지 모의화면 표기 및 실지급 성공 문구 차단 |
| UX628-03 | **P0** | `backend/src/business/ventures.controller.ts:107,153-257` | 벤처 투자·배당 수령·창업 신청 API가 고정 샘플 데이터로 성공 및 48,500 WLD 지급을 반환. DB 거래 부재, 프론트에서도 해당 API 미연결 | 세션 사용자 소유권/DB 원자거래/원장 보존/중복요청 방지 및 UI API 연결 |
| UX628-04 | **P0** | `backend/src/marketplace/marketplace.controller.ts:121-151`; `frontend/src/app/marketplace/auction/page.tsx:84-205` | 백엔드에 실제 에스크로·안티스나이핑 경매 입찰 `POST /api/v1/marketplace/auctions/:id/bid`가 있지만 화면은 로컬 잔액·입찰·소각만 변경. `isPlusUser=true` 고정도 현행 광고 전용 수익화 권위와 불일치 | 실제 경매 API·에스크로·CSRF·경합 처리 UI 연결, 수수료 정책 정합, 데모/실행 엄격 구분 |
| UX628-05 | **P1** | `frontend/src/app/tools/quant-studio/page.tsx:41-85`; `backend/src/economy/quant.controller.ts:91-195` | 퀀트 화면은 브라우저 봇 목록에 추가한 후 백그라운드 자동매매 등록이라고 안내. 백엔드 전략·백테스트·활성화도 모의·고정 수치 | 실제 저장/실행되기 전까지 모의로 표기, 자동매매 성공 문구 금지 |
| UX628-06 | **P1** | `frontend/src/app/clubs/warfare/page.tsx:34-90`; `backend/src/club/warfare.controller.ts:80-188` | 공성전 선포/방어 수리가 프론트 로컬 상태이고, 백엔드도 가짜 점령지·고정 전투/세금 지급 결과 반환. 배당 일부는 시뮬레이션으로 표기 중 | 모의 상태 일관 표기 또는 권한·동시성 포함 영속 게임/자금 처리 |
| UX628-07 | **P1** | `frontend/src/app/admin/treasury/grants/page.tsx:52-58`, `frontend/src/app/api/admin/treasury/grants/route.ts:9-59` | 관리자 지원금 페이지는 Nest `/api/v1/admin/treasury/grants`를 호출하지만 이에 대응하는 백엔드 GET을 찾지 못해 사전작성 신청서로 조용히 대체 가능. 별도 Next GET은 가짜 신청서 데이터 저장 부작용이 있음 | 계약 경로 일치, 관리자 조회의 실패/빈상태 명시, GET 부작용·가짜 지급 기록 제거 |
| UX628-08 | **P2** | `frontend/src/app/admin/blog/page.tsx`, 관리자 공통 메뉴 소스 | 관리자 블로그 화면은 존재하지만 프론트에서 `/admin/blog` 진입 링크가 없음 | 관리자 권한 메뉴·탐색 경로와 모바일 E2E |
| UX628-09 | **P2** | `frontend/src/app/admin/treasury/grants/page.tsx`, 관리자 공통 메뉴 소스 | 지원금 심사 화면 역시 관리자 영역/메뉴 미노출 | 권한·정산 P0 봉쇄 후 적합한 관리 메뉴에 링크 |
| UX628-10 | **P2 후보** | `frontend/src/app/tools/kimchi-premium-calculator/page.tsx`, `frontend/src/components/popular-calculators-hub.tsx` | 코인별 계산기 링크는 있으나 기본 계산기 허브 페이지 직접 진입 링크는 검출되지 않음. 완전 고립 페이지는 아님 | 금융도구 허브에서 진입 링크와 locale/SEO 확인 |
| UX628-11 | **P1 기존 이슈** | v530 긴급 UI 재감사, v600 통합계획 | `/admin/seo` 모바일 넘침 및 과거 `/app-api/v1/account/identities` 500이 미종결 게이트. 이번 읽기 전용 점검에서는 재현 미실시 | 관리자 전 320–430px E2E와 인증 API 회귀 |
| UX628-12 | **P2 범위 구분** | `frontend/src/app/stocks/derivatives/page.tsx:57-205,353`; `backend/src/stock/derivatives.controller.ts:129-215` | 파생상품 화면은 '모의 선물 시드'를 표기하는 로컬 시뮬레이션이고 백엔드는 모의 포지션·고정 청산 결과를 반환. 실제 돈 손실 증거가 아님 | 실거래로 주장하지 말고 데모와 정산형 기능을 명확히 분리 |

## 기존 v603 참고: 신규 발견과 혼동 금지

`docs/findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.ko.md`에는 인증 기본 비밀값, 관리자 백업 권한 경계, DAO 중복투표, 미인증 IndexNow, 국고 `/api/treasury/claim` 허위 지급, 고정 SEO 실적 등 기존 P0/P1이 따로 기록돼 있다.

## 권고 구현 순서

1. **P0 우선:** 가짜 자산/지급·권한 경계를 실패 시 차단하고 실제 거래 여부를 정확히 표현한다.
2. **API-화면 매트릭스:** 각 기능의 백엔드 엔드포인트, 호출 UI, 접근 역할, 메뉴/딥링크, 데이터 영속, 오류·빈상태, 정산 영수증을 1:1 추적한다. 내부전용·폐기 API는 사용자 버튼이 없어도 정상일 수 있다.
3. **검증:** exact-SHA 빌드/타입/테스트, DB 권한과 동시성·멱등성, 320/390/430/768/1280/1440px, 관리자·일반회원 E2E/키보드/줌 점검.
4. **승격:** 같은 SHA 분리 Test에서 백엔드·DB·인증 확인 후 별도 승인된 무중단 운영승격. **이번 감사에서는 코드·운영·DB·기능 스위치·배포 변경 없음.**

**주의:** 페이지 200/코드 해시 동일은 사용자 기능 정상의 증명이 아니다. 앱(Android)은 파일 인벤토리만 확인했고 앱 전체 E2E는 범위 밖이다.
