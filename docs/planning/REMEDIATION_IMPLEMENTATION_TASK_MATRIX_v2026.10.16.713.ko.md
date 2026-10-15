# 전체 오류 수정 작업별 실행 상세 체크리스트 — v2026.10.16.713

> **제안 상태: PLANNING. 이 문서는 코드를 수정하거나 운영에 반영하는 권한이 아니다.** 실제 개발자는 [통합 개선 설계](PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.ko.md) 및 [금융 P0 세부 설계](P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.ko.md)를 먼저 읽고 Superpowers의 worktree·TDD·systematic debugging·verification 절차를 수행한다.
>
> [영문 정본](REMEDIATION_IMPLEMENTATION_TASK_MATRIX_v2026.10.16.713.md)

**목표:** 발견된 각 결함을 독립적으로 재현하고, API·DB·UI·실행 환경을 수정하고, 실패 시 되돌릴 수 있는 검증 가능한 작업 묶음으로 나눈다. T713-01~26은 작업 ID이며 운영 릴리스 버전·마이그레이션 번호가 아니다. 실제 작업마다 신규 버전·전용 브랜치를 부여한다.

## 공통 실행 규칙

각 작업 공통으로 (1) 최신 main fetch 및 기획서 우선 재검토, (2) 같은 파일에 대한 다른 에이전트 PR/dirty worktree 확인, (3) 현상 재현·실패 테스트 RED, (4) 최소 수정 GREEN, (5) 리팩터/관련 전체 시험, (6) 정확 SHA·스킵/실패 수·원장/HTTP/브라우저 증거 기록, (7) 중간 main 변경 검토, (8) 영문/한국어 기획·테스트/변경 기록·내부용/깃허브용 업데이트, (9) 분리된 Test 수용, (10) 운영 승격은 별도 게이트로 수행한다.

**모든 단계에서 금지:** 운영 회원 자산으로 테스트하기, 적용된 SQL 수정, 세션 삭제, DB 백업 미검증 상태의 스키마 변경, GitHub main 강제 덮어쓰기, 다른 에이전트의 dirty file 수정, 단위 테스트 통과를 실제 기능 정상으로 광고하기.

## 단계 0 — 현황 및 근거 고정

### T713-01 · P0 · 통합 기획/소스/운영 기능 매핑
- **대상 문서:** `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/RELEASING.md`, v711 감사, v701/v710/v712 상태.
- **순서:** GitHub latest SHA·운영/테스트 릴리스 SHA·앱 main SHA를 독립 기록 → 현재 지원/미구현/정지 기능 분류 → 프론트 페이지 163개, Nest 컨트롤러 82개, Next API 경로 78개 기준으로 갱신 재고표 생성 → 메뉴/버튼·동작·권한·DB 함수·테스트 소유자를 결합.
- **검증:** 없는 파일/죽은 링크, 권위 없는 완료 주장, 중복 소유 P0, 기존 PR의 수정 영역 충돌을 0으로 만들기.
- **산출물:** 정확한 상태/책임자 표 + 작업 전 기록. 다른 에이전트 코드는 무단 병합하지 않음.

### T713-02 · P0 · DB 사용자 권한·함수·마이그레이션 전수 측정
- **대상:** `packages/database/migrations/*.sql`, `packages/database/migrate.sh`, `packages/database/test/migration-parity.test.ts`, `ops/security/v701-*.sql`.
- **순서:** 개발/운영/복원 Test 각각 public 테이블·뷰·함수·트리거·스키마 버전·권한 소유자 확인 → 역할의 직접/상속/PUBLIC 권한 합산 → `schema_migrations(filename,checksum)` 실이력과 Git SQL 파일 비교 → 269/270/271 적용/미적용/누락과 v701 긴급 조치의 중복 점검.
- **RED:** 앱 계정이 보호 계좌 직접 UPDATE 가능한 현상이 재현되어야 함.
- **GREEN 목표:** 승인된 DB 명령 호출은 허용하고 원장/금고 direct INSERT/UPDATE/DELETE는 거부하는 분리 Test 증거.
- **금지:** 바로 `REVOKE ALL` 하거나 운영 `schema_migrations` 가짜 이력 추가.

### T713-03 · P0 · 직접 WLD 수정 호출자 전수 추적
- **대상:** `backend/src/casino/pvp-arena.repository.ts`, `stock/stock-league.repository.ts`, `admin/bonds/treasury-bond.repository.ts`, `admin/pension/national-pension.repository.ts`, `admin/fx/fx.repository.ts`, `admin/treasury/auto-swf.service.ts`, `marketplace/marketplace.service.ts`, `marketplace/black-market.repository.ts` 및 모든 SQL definer.
- **순서:** 단순 grep 이후 실제 controller/module/worker call graph, feature flag, 실행 시 인증 주체, 수입/비용 상대 계좌, 멱등·Outbox·원장 posting 유무, 잔액 크기 타입 조사.
- **검증:** 새 코드에서 허용되지 않은 direct balance DML 발생 시 정적 CI 실패. 존재하지만 도달 불가능한 코드와 운영 활성코드는 분리 판정.

## 단계 1 — 금융 P0 시정과 검증

### T713-04 · P0 · 진짜 원장·국고 대사 엔진
- **파일:** `backend/src/admin/treasury/treasury.repository.ts`의 506·879행 부근, `treasury.service.ts`, `treasury.controller.ts` 및 새 순차 마이그레이션/DB 테스트.
- **RED:** 원장과 잔액에 1 WLD 차이를 만든 격리 Test 데이터에서도 정상 `RECONCILED`/차액 0이 나오는 오류를 먼저 보여줌.
- **수정:** 같은 원장 high-water mark에서 계좌잔액 vs 전표, 국고 흐름 vs 금고, 조폐/소각 vs 공급량 각각 독립 집계. 중복금고·미실현 SWF·약정자금 제외. 대사 실행기록에 SHA, 정책버전, 출처, 차액, 시각 저장.
- **GREEN:** 차액0만 RECONCILED, 차액1은 DISCREPANCY, DB 조회 실패는 UNAVAILABLE, 원천 부족은 INCOMPLETE. 고위험 국고 지출 차단하며 읽기 기능 유지.

### T713-05 · P0 · 관리자 국고 허위 정상 UI 제거
- **파일:** `frontend/src/app/admin/treasury/*`, 관련 Next BFF, `backend/src/admin/treasury/treasury.service.ts`.
- **수정:** 최근 실제 성공한 대사 시각·불일치 행수·사유·가용 지급 한도·지원 사건 ID 표시. 조회 실패 시 값 0 또는 밝은 성공 배지로 대체하지 않음. 실행 버튼/승인 단계는 실 권한·2FA·정산 상태 검사.
- **테스트:** 서버가 500·타임아웃·stale/unknown 결과 반환해도 승인 또는 성공 토스트 없음. 회원계정에서 관리자 API 시도 거절.

### T713-06 · P0 · 표준 원장 도메인 명령 및 영수증 기반 구현
- **파일:** 새 번호 SQL `packages/database/migrations/NNN-*.sql`, `backend/src/core`, `backend/src/core/financial-settlement-v653.db.test.ts`.
- **명령 계약:** 서버 확정 actor, `commandId UUID`, 요청 hash, 정책버전, 정수문자열 `amountWld`, 도메인 파라미터. DB 단일 트랜잭션에 분개·잔액 투영·도메인 상태·Outbox·감사 확정.
- **RED:** 같은 키로 중복 돈 지급, 다른 payload 같은 키 충돌 미탐지, 앱 SQL 직접 잔액 수정 허용.
- **GREEN:** 동일키 재시도 동일 영수증, 변경 요청 해시라면 409 충돌, 음수/소수/큰 정수 경계 정확, 실패 시 전액 롤백, 타 회원 영수증 금지.
- **권한:** SECURITY DEFINER 최소 권한만, 비신뢰 search_path 제외, PUBLIC 실행권0 유지. 기존 원장 함수의 생성을 가정하지 말고 실 스키마 조회 후 연결.

### T713-07 · P0 · PvP 승부존 정산
- **파일:** `backend/src/casino/pvp-arena.repository.ts`, `pvp-arena.controller.ts`, `pvp-arena.test.ts`; 신규 `pvp-arena.db.test.ts`.
- **보존:** 기존 DB 트랜잭션·계좌 순서 잠금·crypto.randomInt.
- **수정 방식:** 방 생성 시 예치 없는 기존 정책을 채택하면, 참가 시 패자 −stake/승자 +(stake−fee)/국고 +fee의 **3방향 원장분개**. 10,000 판돈·3% 팟 수수료는 패자 −10,000/승자 +9,400/국고+600. room 상태/원장 ID/수수료/알림을 한 번 커밋.
- **테스트:** 2인 동시 참가·같은 참가자 중복/새 키 재전송·잔액 동시 변경·방 취소·자기 방 참여·큰 숫자·수수료 반올림·DB crash·통화량 불변·서버영수증. 원장 없이 잔액만 증가하면 실패.

### T713-08 · P0 · 주식 리그·암시장 경매·마켓 정산
- **파일:** `backend/src/stock/stock-league.repository.ts`, `backend/src/marketplace/black-market.repository.ts`, `backend/src/marketplace/marketplace.service.ts` 및 도메인 DB 테스트.
- **수정:** 리그 참가비 1회만 차감, 리그 풀/국고 수취 확인, 취소는 역거래. 경매 입찰은 에스크로 확정, 패찰 환급/낙찰자 인도/판매자 정산/국고 수수료를 분리하여 복식부기로 기록.
- **테스트:** 50개 동시 참여·중복 참가·같은 입찰을 반복 POST·입찰 취소/패찰·판매자/낙찰자 변경·비정상 소유자/권한·수수료 합계 검증.

### T713-09 · P0 · 국채·연금·외환·SWF 순차 정산
- **파일:** `backend/src/admin/bonds/treasury-bond.repository.ts`, `admin/pension/national-pension.repository.ts`, `admin/fx/fx.repository.ts`, `admin/treasury/auto-swf.service.ts`; 새 파일별 DB 회귀시험.
- **국채:** 만기/쿠폰 계산의 현실시간 vs 게임시간·연이율 환산, 원금/이자 지급 재원·발행 금액 검증. 출처 없는 이자 발행 금지.
- **연금:** 회원 납입, 기존 기획의 95/5 운용 비중, 매칭 재원, 환급 및 수급자격·만기, 중복 지급 차단.
- **외환:** 확정 시점 환율·스프레드·준비금·정확한 원화/WLD 환산·소수 반올림을 분리.
- **SWF:** 예상 수익이나 시뮬레이션 자산을 가용 WLD로 간주하지 않으며 실현 수익 출처·과세/수수료·승인 정책 확인. 해당 스케줄러가 비활성일 때 자동 재가동하지 않음.
- **테스트:** 각 거래의 funding source, 잔액/원장/공급량, 2^53 초과 WLD, 중복/실패/만기·환불, 없는 현금·권한 없는 실행 거절.

### T713-10 · P0 · 사용하지 않는 DB 직접 수정 권한 단계적 회수
- **파일:** 새로운 정규 번호 SQL, `packages/database/test/migration-parity.test.ts`, `backend/src/security/database-boundary.db.test.ts`.
- **선행:** T713-06~09의 모든 운영 호출부에서 raw DML 사용 제거, 기존 기록 호환성 확인, 동일 버전 분리 Test의 정상 API 작동.
- **수정:** 특정 `account_balances`/`ledger_transactions`/`ledger_postings`/국고/결제/정책 테이블의 앱 계정 원시 DML 회수, 함수별 필요 실행권 명시. 세션 관련 제한된 쓰기는 그대로 유지.
- **테스트:** 일반 앱 자격으로 보호 테이블 update/insert/delete 전부 거부, 정상 서비스 명령은 성공, PUBLIC 실행0, 상속 역할 우회0, migration checksum 일치. 운영 DB에 일괄 REVOKE 금지.

### T713-11 · P0 · 과거 불일치와 정정 전표
- **파일:** `backend/src/ledger-corrections.db.test.ts`, 관리자 원장 사건/수정 기능 후보.
- **수정:** 기존 사건의 원본/차액/영향 범위/근거/승인자를 불변 기록; 승인된 역거래 `reverses_transaction_id` 연결; 영수증 정정 표시.
- **검증:** 과거 원장 행 삭제·덮어쓰기 없음, 자금 창출 없는 정정, 중복 정정 요청 1회 처리, 사용자에게 변경 사유 노출.

## 단계 2 — 사용자가 클릭하는 전체 기능/보안 검증

### T713-12 · P0 · 로그인·OAuth·2FA·세션 보존
- **파일:** `backend/src/auth`, `backend/src/security`, `frontend/src/app/auth`, `frontend/src/app/app-api`.
- **테스트:** 가입/인증/로그아웃·외부 OAuth 취소·동의·관리자 step-up·쿠키 CSRF·세션 만료·다른 기기·서버 재시작·서비스 무중단 교체 전후 동일 사용자; 익명 identities 401은 정상이고 로그인 실제 200/본인 범위도 필수.
- **완료:** 타 회원 정보 접근/수정 금지, 관리자 2FA 우회 금지, 기기 재로그인 강제·세션 손실 없음.

### T713-13 · P0 · 프론트 버튼↔백엔드 실기능 전수 매핑
- **파일:** `frontend/src/app/**/page.tsx`, `frontend/src/app/app-api/**/route.ts`, `backend/src/**/*controller.ts`, `packages/contract/src/route-map.ts`, `scripts/qa/generate-full-route-inventory.mjs`.
- **방식:** 각각의 실화면 CTA·모달·드롭다운·폼에 BFF URL, Nest API, DB 함수, 인증/조건, 보상영수증, 관련 테스트를 1:1 연결. **API만 있고 화면 버튼 없는 기능**, 버튼만 있고 서버 권한이 막힌 기능, 성공만 표출하는 Mock UI를 모두 결함으로 등록.
- **완료:** 전체 경로 5회 실제 브라우저 QA, 모바일/태블릿/데스크톱, 회원/관리자, 401/403/404와 5xx 분리, 모든 실제 클릭의 결과까지 확인.

### T713-14 · P1 · 은행 신용도·큰 WLD 정확성
- **파일:** `backend/src/bank/bank.controller.ts`, `backend/src/bank/credit-rating.service.ts`와 테스트.
- **수정:** 임의 계정30일·직업5·상환3·연체0을 삭제하고 본인 활동·채무·연체·직업 기록의 확인 가능한 출처만 사용. 입력이 없다면 미충족/예시 시뮬레이션 상태로 전환. 신용 한도와 가짜 점수를 연결 금지.
- **테스트:** 데이터가 서로 다른 2명의 점수 차이, 잔액 2^53 초과 시 안전, 연체·상환이 없을 때 고정 점수 금지.

### T713-15 · P1 · 보상·업무·상점·게시판·알림 영수증
- **파일:** `frontend/src/app/work`, wallet/notifications/first-session onboarding, `backend/src/work`, 상점/게시판/알림 관련 구성요소.
- **수정:** 로컬 체크박스·로컬 저장 성공과 서버 저장/보상 지급을 분리. 미확정 환불·주문·구매는 상태 조회. 허위 10,000 WLD 지급/보장 문구 정정.
- **테스트:** 서버 권한실패/Outbox 실패/중복 클릭/장애 시 화면 성공이 뜨지 않고 실제 원장 영수증과 최종 UI가 일치.

### T713-16 · P1 · 주민참여 투표·그랜트의 원자성
- **파일:** `frontend/src/app/api/treasury/proposals/route.ts`, `frontend/src/app/api/treasury/apply-grant/route.ts`, `backend/src/admin`.
- **수정:** 파일 JSON 읽고 덮어쓰는 기능의 레이스/실패 무시 대신 PostgreSQL actor별 unique 투표/승인/지급 기록, 관리자 재인증, 서버원장 연계. 기존 투표이력 보존/중복 제거 계획 필요.
- **테스트:** 같은 사용자의 중복투표, 동시 관리자 승인, 파일 쓰기 실패, 중복 지급 모두 안전 차단.

### T713-17 · 조건부 P0 · 내부 인증 토큰 fallback 점검
- **파일:** `frontend/src/app/api/blog/generate/route.ts`, `frontend/src/app/api/discord/broadcast/route.ts`, `backend/src/seo/seo-daily-digest.service.ts`.
- **수정:** 설정값 누락 시 정적 공용 토큰 fallback 없이 요청을 실패 처리, 기능별 독립 비밀값 적용, 관련 환경값 교체. 운영에서 비밀값 자체를 출력하거나 전송하지 않는다.
- **테스트:** 비밀값 미설정/오입력시 401·403, 정상 서명만 처리, 악용 가능성을 조건부로 평가하고 로그에 토큰/개인정보 없음.

## 단계 3 — SEO·다국어·Android·Discord·속도

### T713-18 · P1 · v710 국가별 블로그 전용 소유·완료 검증
- **소유:** 기존 v710 에이전트; 본 v713에서 블로그 소스 덮어쓰기 금지.
- **검증 대상:** `frontend/src/app/blog/page.tsx`, `blog/[slug]/page.tsx`, `blog/blog-data.ts`, `[locale]/blog`, `sitemap-blog.xml/route.ts`, `frontend/src/proxy.ts`.
- **조건:** KR/EN-US/JA-JP/ZH-CN의 관할별 실질적 다른 글·현행 세법 출처·기사 일시·이미지 권리/alt; SSR title/description/본문, 자기 canonical, reciprocal hreflang 및 실제 indexable 사이트맵.
- **테스트:** 접속 언어/수동 선택/검색봇/게스트 쿠키 없음/모바일·PC HTML 전수 대조. v710 병합 또는 명시적 담당 인계 후 진행.

### T713-19 · P1 · 관리자 SEO/Search Console 사실성
- **파일:** `frontend/src/app/admin/seo`, Next BFF, `backend/src/seo`.
- **수정:** IndexNow URL 제출, 제공자 수락, Google 실제 URL 색인 확인, 노출·클릭을 구분하고 각각 데이터 출처·조회일·상태/실패 로그를 표시. 관리자 권한/CSRF·API quota 준수.
- **테스트:** GSC 장애→stale/unknown, 미보고 데이터→0건으로 단정하지 않음, 사이트맵 URL별 canonical/noindex 일치. 구글 4.9점 가짜 별점 문구 금지.

### T713-20 · P1 · Android 웹 계약·버전·실기기
- **별도 앱 저장소:** `app/build.gradle.kts`, `ApiClient.kt`, `MoneyverseApi.kt`, `ApiContractCompatibilityInterceptor.kt` 및 Compose 화면.
- **수정:** 앱 `versionName=1.3.5`와 HTTP User-Agent `APP_VERSION=1.3.0` 불일치를 빌드 단일 버전 값으로 동기화. debug Test HTTPS와 release 운영 HTTPS 호스트 고정/인증쿠키·CSRF·DTO·보상 중복 POST 정책 확인.
- **테스트:** Gradle unit+instrumented 에뮬레이터/실기기에서 가입, 로그인, 지갑조회, 장바구니/주식 주문 상태, 끊어진 요청 복구, 앱 서명 빌드. GitHub에 메서드가 있다는 이유로 구현 완료 판정 금지.

### T713-21 · P1 · Discord 봇/QA 실행 안정성
- **파일:** `bot/scripts/qa_ads_sponsorblock_verification.mjs`, `bot/package-lock.json`, `bot/music.test.mjs`.
- **수정:** 7행 JS 구문 오류, 격리 환경 의존성 `youtube-dl-exec` 등 설치 경로, 광고 차단/음성 연결과 API 실패 상태 정리.
- **테스트:** Node 구문 0오류, 독립 bot test 전부 통과, 디스코드 테스트 서버/권한 확인, 재연결/중복 연결/외부 음악 API 장애. 실제 채널에서 무단 재생이나 사용자 개인정보 노출 없음.

### T713-22 · P1 · 신·구 백엔드 잡 소유권/Outbox 중복 방지
- **파일:** `backend/src/scheduler`, `backend/src/admin/treasury/auto-swf.service.ts`, 주식 AI 뉴스 잡/Outbox 및 v697 운영 실행설정.
- **수정:** 작업유형별 DB lease와 fencing token, 원자적 청구, 선행 실행 기록, 장애시 임대 만료 후 takeover 및 멱등 event 전파. 새 서버 활성만으로 구 서버를 중지하거나 두 잡을 동시에 실행하지 않는다.
- **테스트:** 두 버전 동시 백엔드·강제 kill·네트워크 타임아웃·시작 순서 역전에서도 작업 중복 지급 0, 뉴스 중복 발행 0, Outbox 유실 0. 실행 이력은 표시.

### T713-23 · P2 · 코드 경고·접근성·성능 정리
- **파일:** 1,088 ESLint 경고 분류 결과, `frontend/src/app/globals.css`, 관리자 메뉴/모바일 UI, 서버 로그·메트릭.
- **수정:** 미사용 변수/의심스러운 효과·반응형 클릭 영역·모달 오버레이·명암/포커스 개선. 성능은 LCP/INP/CLS p75를 실제 관측하고 DB 쿼리 시간/메모리/스왑과 같이 최적화.
- **테스트:** 신규 lint 경고 0, 기존 경고 단계별 감소, WCAG 2.2 키보드/터치 테스트, CPU/메모리/디스크 안전성, PostgreSQL WAL/fsync 보존.

### T713-24 · P2 · 기획·문서 진실성/표준 유지
- **파일:** `DOCS_INDEX.md`, `docs/DOCUMENT_CATALOG.md`, `docs/planning/PROJECT_PLAN.md`, 영한 서비스 안내.
- **수정:** 역사 기록과 현재 정책·시험 후보·실제로 운영 확인된 기능을 명확히 구분. 근거 없는 4.9점, 즉시 색인, 보장성 WLD 보상 문구 수정; 이전 기록은 삭제하지 않음.
- **검증:** 모든 링크 유효, 영문 정본/한국어 대응, 계획 채택 날짜/정확 SHA, 과도한 운영 완료 주장 없음.

## 단계 4 — 실제 사용자 수용·Test·운영승격

### T713-25 · P0 · 독립 Test의 동일 SHA 전체 검증
- **파일:** `.github/workflows/ci.yml`, `scripts/release/verify-main-required-checks.mjs`, `scripts/qa/verify-full-route-qa-ledger.mjs`, `docs/RELEASING.md`.
- **단계:** clean install → 기본 lint/타입/빌드/계약 → PostgreSQL 17 백업 복원본+순차 마이그레이션 → 앱 권한 음성/원장 무결성/동시성 → 회원/관리자 로그인 브라우저 전체 경로 5회 → 모바일/가로/세로 → Test 기존 세션 재시작 유지.
- **통과:** 해당 P0 DB 테스트 스킵 0, CI 전 단계 0오류, 동일 frontend/backend SHA 및 DB 이력, 실제 회원 액션 최종 영수증 확인.

### T713-26 · P0 · 무중단 운영 승격 및 복구 수용
- **대상:** 실제 호스트 Nginx/systemd 릴리스 스크립트, `docs/RELEASING.md`, `docs/BACKUP.md`, v697/v701 운영 매니페스트.
- **사전 조건:** 운영 복원본 Test 완전 성공, 현재 main 재조회·QA 재실행, 승인된 소스/스키마 동일 SHA, 백업/실제 복원 시험, 기존 세션·원장 차액0, 자동잡 소유자 1개.
- **승격:** 마지막 정상 버전 보존 → 다른 포트에 후보 기동·읽기/쓰기 경계 확인 → 기존 회원 Test 로그인 유지 검증 → Nginx 원자적 전환 → 공개 홈/상태/인증/주식/국고/SEO/앱 연결 5회 스모크 → 장애 관찰·롤백 포인터 보존.
- **문제 발생:** 새 서비스의 실행 정지/예전 URL 전환만으로 복구되는 코드 장애와, 데이터 정방향 보정이 필요한 스키마 장애를 구분. 운영 DB 복원으로 새로운 정상 거래를 지우지 않음.

## 작업 중단 조건 및 책임 분리

**운영 승격 금지:** 미해결 국고/공급량 차액, 중복 WLD 지급, 앱 raw DML 권한 방치, 필수 DB 음성 테스트 실패/스킵, 계정 교차 접근 허용, 기존 세션 유실, 백업 복원 미실시, 신·구 서버에서 경제잡 2회 실행, Test와 운영 후보 SHA 불일치.

**소유 제안:** 재무/DBA = T02~T11·마이그레이션 번호 전용 관리; 웹 인증/QA = T12~T17·T25; v710 블로그팀 = T18; SEO = T19; Android팀 = T20; 봇·인프라 = T21~T23·T26; 문서 담당 = T01·T24. 실제 사람이나 다른 에이전트의 동의가 이루어졌다고 가정하지 않는다.

**작업별 산출:** 소스/버전번호, 사전 기획, RED/GREEN 로그, 회귀시험/실 DB 권한 표, 복구 절차, 중간 원격 main 조회, 시작·중간·종료 기록, 내부용·GitHub용 업데이트, PR 및 CI 상태. 승인 전 새 구현이나 자동 운영 반영 없음.
