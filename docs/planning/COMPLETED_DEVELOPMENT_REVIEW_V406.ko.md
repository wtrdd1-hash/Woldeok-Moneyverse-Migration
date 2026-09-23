# 월덕 머니버스 — 개발 완료 항목 전면 재검토 v2026.09.23.406

> 상태: 완료 주장 재감사 진행
> 기준 main: e447b11f1d27ee7da2a46c64fcd96e0058c8da6d
> 관측 Test application source: 7b705e1d37e97ccd05ba12042c3fd8d582e396d0
> 관측 Production application source: 2c854d47903294ef4ad48006a1b9cd57a70f5590
> 영문 기준: [COMPLETED_DEVELOPMENT_REVIEW_V406.md](COMPLETED_DEVELOPMENT_REVIEW_V406.md)

## 0. 완료 상태 용어

기능을 하나의 “완료” 상태로 뭉뚱그리지 않는다.

- **CODE_PRESENT** — 현재 source에 관련 frontend/backend/data 코드가 존재.
- **TEST_COVERED** — 해당 기능의 focused automated coverage가 있고 검토 candidate에서 통과.
- **TEST_RUNTIME_VERIFIED** — exact application candidate가 Test에서 실행되고 변경 backend/API/DB/user flow를 실제 검증.
- **PRODUCTION_VERIFIED** — exact intended application source가 Production에서 실행되고 public/runtime 수용증거 통과.
- **PLAN_DRIFT** — 현재 구현이 더 최신 권위 기획과 충돌.
- **BLOCKED_INTEGRITY** — 코드는 있지만 data/ledger/security 불변조건이 빠져 안전 mutation을 fail-closed해야 함.
- **COVERAGE_GAP** — 구현은 있으나 focused verification이 부족.

공개 “구현됨” 표시는 CODE_PRESENT 수준을 설명할 수 있지만 exact-version gate 없이 TEST_RUNTIME_VERIFIED 또는 PRODUCTION_VERIFIED를 의미하면 안 된다.

## 1. 런타임 lineage 확인

현재 main은 Test application source `7b705e1...`와 비교해 비문서 application 차이가 0건이다. 따라서 Test는 v406 변경 직전의 현재 application source를 대표한다.

Production은 `2c854d4...`를 보고하고 Test/current application source보다 **비문서 파일 55개** 뒤에 있다. Production의 root/guide/status/health/version endpoint는 정상 응답하지만, repository history만으로 최신 기능을 PRODUCTION_VERIFIED 처리할 수 없다.

v406은 runtime code를 변경하므로 merge/승격 전 새 exact-SHA Test candidate 검증이 필요하다.

## 2. 구현 완료 기능 재분류

| 기능군 | 코드/테스트 근거 | 현재 분류 | 재검토 결과 |
|---|---|---|---|
| 지갑/원장 | frontend + wallet controller/service/tests | CODE_PRESENT | 구현 표시는 유지. v406 변경 release는 exact runtime 검증 별도 필요 |
| 직업/작업 | work controller/repository + 다수 DB/e2e test | **PLAN_DRIFT** | 현재 DB는 작업별 일일 완료 quota를 강제. 최신 기획은 일반 직업/숙련도 기본 무제한 + 서버 권위 수행시간/발행속도 제어 |
| 퀘스트/성장 | engagement/activity/progression 코드·테스트 | CODE_PRESENT | 이번 회차에서 신규 완료 결함 없음 |
| 은행 | banking controller/tests | CODE_PRESENT | 이번 회차에서 신규 완료 결함 없음 |
| 주식 | stock/order/alert/newspaper controller + 폭넓은 test | CODE_PRESENT | 이번 회차에서 신규 완료 결함 없음 |
| 사업체 | business controller/service/tests | CODE_PRESENT | 이번 회차에서 신규 완료 결함 없음 |
| 상점/인벤토리 | server catalog/holdings/write path + tests | CODE_PRESENT | 이번 회차에서 신규 완료 결함 없음 |
| 기본 마켓 등록/구매/취소 | DB server function + controller path | CODE_PRESENT | 구현 표시 유지 |
| English Auction | read/write 코드 존재 | **BLOCKED_INTEGRITY** | 판매자 item escrow, 경매 종료 winner/item/seller 정산, ledger posting 미완료. v406에서 create/bid mutation 차단 |
| P2P 1:1 직거래 | table/controller/service 존재 | **BLOCKED_INTEGRITY** | confirm이 상태만 COMPLETED로 변경하고 WLD/item atomic swap 없음. recipient 미확인 시 actor fallback 문제. v406에서 create/accept/confirm 차단, 기존 read/cancel 유지 |
| 감정소 | table/controller/service 존재 | **BLOCKED_INTEGRITY** | ownership/provenance가 권위 검증되지 않았고 fee가 ledger 밖 balance를 수정. v406에서 신규 발급 차단·로컬 가짜 인증서 제거 |
| 게시판/종목 커뮤니티 | route/controller/tests | CODE_PRESENT | 신규 결함 없음 |
| 1:1 채팅 | direct chat/unread/block/unblock + safety coverage | CODE_PRESENT | 신규 결함 없음 |
| 클럽 | club API + canvas API/tests | CODE_PRESENT + v406 수정 | canvas load 실패 시 starter 상태 저장 위험을 발견. v406에서 server state load 전 edit/save 차단 |
| 개인 스페이스 | frontend + space controller/tests | CODE_PRESENT | 신규 결함 없음 |
| 신문/컬렉션/갤러리/시즌 | 전용 코드/controller coverage | CODE_PRESENT | 신규 결함 없음 |
| 캘린더 | seasons/early-game/engagement/shop API 집계 | **COVERAGE_GAP** | 실제 server-backed 화면이지만 focused calendar test/controller 없음 |
| 계정/프로필/보안/알림/지원 | 전용 page/controller/tests | CODE_PRESENT | 신규 결함 없음 |
## 3. G406 결함과 종료조건

### G406-01 — P1 Production application lineage 지연

Production application source가 Test/current source보다 오래됐다. “main/Test 구현”과 “Production 검증 완료”를 분리한다.

종료조건:
- exact v406 candidate build;
- exact-SHA Test 배포;
- backend/API/DB/changed-flow/session continuity 검증;
- candidate gate 통과 후 merge;
- merged-main exact 재검증;
- 무중단 Production 승격 및 public version/smoke 확인.

### G406-02 — P1 직업 기본 무제한 기획 드리프트

현재 migration/test는 작업별 daily quota를 여전히 강제하지만 현재 권위 기획은 일반 직업/숙련도를 기본 무제한으로 두고 real/server-authoritative task duration과 issuance velocity를 제어한다.

종료조건:
- 일반 작업 finite completion quota를 nullable/unlimited semantics로 전환;
- server-authoritative minimum/expected duration 유지;
- settlement/repeat/quality/issuance control로 발행속도 제어;
- API/schema/frontend/DB test를 같은 구현 회차에서 갱신.

그 전까지 public guide는 현재 quota 동작을 설명할 수 있지만 “최신 기획까지 구현 완료”는 아니다.

### G406-03 — P0 마켓플레이스 고급 정산 무결성

English auction, P2P direct trade, appraisal issuance가 완료처럼 표시됐지만 핵심 권위 불변조건이 미완성이었다.

관측 결함:
- auction seller inventory escrow lock 없음;
- auction end/winner/item/seller settlement 없음;
- auction bid balance 변경이 authoritative ledger 밖에서 수행;
- direct-trade confirm은 상태만 변경하고 atomic WLD/item transfer 없음;
- direct-trade recipient 미확인 시 sender 자신으로 fallback 가능;
- appraisal ownership/provenance 미검증;
- appraisal fee가 balance를 직접 수정하고 payer 잔액과 불일치한 sink value 생성 가능;
- frontend가 API 실패 시 sample/fake authoritative record를 보여주거나 생성.

v406 조치:
- 고급 marketplace write는 controller에서 fail-closed;
- public guide 완료 목록에서 auction/direct-trade/appraisal 제거;
- auction/trade/appraisal UI의 sample authoritative fallback 제거;
- club canvas는 authoritative server state load 성공 전 edit/save 금지;
- source regression test로 fail-closed 규칙 고정.

완전 종료에는 ledger-backed atomic settlement, asset ownership/escrow, idempotency/concurrency, recipient identity validation, end-of-auction settlement, appraisal provenance evidence, DB-backed test가 필요하다.

### G406-04 — P1 Calendar focused coverage gap

Calendar는 mock이 아니라 실제 server API 집계 화면이지만 focused regression test가 없다. unavailable/empty/real season, early-game, engagement, shop deadline 상태를 검증하는 coverage가 필요하다.

### G406-05 — P1 공개 구현기능 검증 깊이

현재 guide test는 기능군 수와 대표 link 유효성만 확인하며 각 sub-capability의 route/API/data authority까지 증명하지 않는다.

종료조건: 각 sub-feature에 frontend route, backend/API source, focused test, Test verification status, Production verification status를 기록하는 machine-readable implemented-feature manifest를 유지한다.

## 4. 완료 주장 규칙

v406부터 “implemented”는 현재 application source에 설명된 동작의 실제 server-backed path가 존재한다는 뜻으로만 사용한다. 다음에는 사용하지 않는다.

- placeholder/demo/sample state를 권위 데이터처럼 표시;
- durable settlement가 미완성인 mutation;
- runtime에 아직 반영되지 않은 planning target;
- Production이라고 말하면서 Test에만 존재하는 기능.

“Production verified”는 exact public runtime identity와 해당 runtime의 smoke/changed-flow evidence가 있어야 한다.
