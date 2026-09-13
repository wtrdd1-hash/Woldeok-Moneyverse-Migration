# 월덕 머니버스 — 인벤토리 및 권리(Entitlement) 무결성 명세

> 버전: v2026.09.13.16
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준 문서: [INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.md](INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.md)

## 0. 목적

Moneyverse에는 이미 상점 구매, 제작, 유저 거래소, 시즌 보상, 수집품, 유료 권리 기능이 기획되어 있다. 이 문서는 이 모든 시스템이 공통으로 사용해야 하는 소유권 경계를 정의한다. 사용자가 존재하지 않는 아이템을 받은 것처럼 보이거나, 감사 가능한 이유 없이 아이템을 잃거나, 재시도로 아이템을 복제하거나, 환불·취소·권리회수 후에도 잘못된 유료 접근권한이 남는 일을 막는 것이 핵심이다.

권위 모델은 다음 네 개 개념을 분리한다.

- **카탈로그 정의** — 아이템/권리가 무엇인지 정의
- **인벤토리 소유권** — 현재 어느 사용자·클럽·에스크로·시스템 문맥이 인스턴스/스택을 통제하는지 정의
- **entitlement** — 기능·코스메틱·콘텐츠에 대한 영구 또는 기간성 접근 권리
- **provenance event** — 소유권 또는 entitlement가 바뀐 이유를 남기는 불변 이벤트

인벤토리는 WLD 잔액이 아니다. WLD 이동은 기존 double-entry ledger를 계속 사용한다. 아이템의 유저간 이전량은 WLD 소각이 아니며, 실제로 제거된 WLD·자원만 hard sink로 계산한다.

## 1. 제품 불변조건

1. 아이템 소유권, 수량, entitlement 상태, 귀속, 거래 가능 여부, 만료, 회수는 서버/DB가 권위값이다.
2. 클라이언트 성공 화면, 결제사업자 콜백, 오래된 캐시 응답만으로 소유권을 부여하지 않는다.
3. 모든 상태변경 인벤토리 작업은 멱등적이어야 한다.
4. WLD/자원과 아이템을 교환하는 작업은 필요한 가치 이동과 소유권 변경이 원자적으로 커밋되거나 명시적 보상 트랜잭션을 사용한다.
5. provenance는 append-only다. 과거를 덮어쓰지 않고 reversal/reconciliation 이벤트로 정정한다.
6. 고유 아이템은 복구를 이유로 조용히 복제하지 않는다.
7. 스택형 아이템과 고유 인스턴스는 서로 다른 identity 규칙을 사용한다.
8. escrow/lock은 수익적 소유권을 보존하며 시스템의 일반 자산으로 바꾸지 않는다.
9. 환불·차지백·provider revoke는 해당 거래와 연결된 권리만 처리하고 무관한 구매를 처벌하지 않는다.
10. 임의 사용자 체감 인벤토리 상한은 기본값이 아니다. 용량·배치 제한은 안전·무결성·인프라·법적 요구·진짜 희소성 목적이 있어야 한다.

## 2. 아이템 분류

| 클래스 | 식별 방식 | 예시 | 이전 |
|---|---|---|---|
| `UNIQUE_INSTANCE` | 불변 instance ID 1개 | 서명 수집품, 트로피 변형 | 정책 기반 |
| `STACKABLE_RESOURCE` | catalog ID + stack ID + quantity | 제작재료, 이벤트 토큰 | 정책 기반 |
| `ACCOUNT_BOUND_ITEM` | 계정 영구 귀속 | 시즌 랭크 트로피 | 불가 |
| `CLUB_BOUND_ITEM` | 클럽 소유 | 클럽 트로피/배너 | 클럽 흐름만 |
| `SYSTEM_ENTITLEMENT` | 아이템이 아닌 시스템 권리 | 테마 사용권, 광고 제거 | 이전 불가 |
| `TIME_BOUND_ENTITLEMENT` | 시간/상태 기반 권리 | 구독 혜택 | 이전 불가 |
| `ESCROWED_ITEM` | 거래 잠금 상태의 사용자 소유 | 판매 등록 아이템 | 정산 흐름만 |

표시 카테고리나 희귀도만 보고 거래가능 여부를 추론하지 않는다. transfer policy는 명시적 서버 데이터다.

## 3. 권장 데이터 모델

```text
catalog_items
catalog_item_versions
inventory_containers
inventory_stacks
inventory_instances
inventory_locks
inventory_events
inventory_operation_keys
entitlement_definitions
user_entitlements
entitlement_events
provider_purchase_links
inventory_reconciliation_runs
```

### 3.1 카탈로그 버전

```text
catalog_item_id
catalog_version
item_class
name_i18n_key
description_i18n_key
stackable
transfer_policy
binding_policy
expiry_policy
scarcity_policy
max_stack_size nullable
metadata_schema_version
p2w_classification
created_at
retired_at nullable
```

역사적 소유권/provenance에서 참조된 카탈로그 버전은 제자리 수정하지 않는다. 의미가 바뀌면 새 버전을 만든다.

### 3.2 고유 인스턴스

```text
item_instance_id
catalog_item_id
catalog_version
owner_type            # USER | CLUB | SYSTEM_ESCROW
owner_id
state                 # AVAILABLE | LOCKED | ESCROWED | CONSUMED | REVOKED | DESTROYED
bound_reason nullable
season_id nullable
created_by_event_id
tradable_after nullable
expires_at nullable
metadata_version
created_at
updated_at
```

### 3.3 스택

```text
stack_id
catalog_item_id
catalog_version
owner_type
owner_id
quantity
state
expires_at nullable
metadata_version
version
created_at
updated_at
```

quantity는 정수이며 음수가 될 수 없다. 큰 수량도 전송 과정에서 integer/string 안전성을 유지한다.

## 4. 컨테이너 모델

논리 컨테이너 예시:

- `USER_MAIN` — 일반 사용 가능한 인벤토리
- `USER_DISPLAY` — 소유권 변경 없는 전시 배치
- `MARKET_ESCROW` — 거래소 등록/예약 아이템
- `CRAFT_LOCK` — 제작 중 입력 아이템 잠금
- `CLUB_INVENTORY` — 클럽 소유 아이템
- `SEASON_TEMP` — 명시적 시즌 임시 아이템

컨테이너 이동은 자동으로 유저간 transfer가 아니며 아이템을 생성/삭제하지 않는다. 동일 인스턴스/provenance를 유지하며 이벤트를 남긴다.

## 5. 표준 작업 유형

- `GRANT`
- `PURCHASE`
- `TRANSFER`
- `MOVE_CONTAINER`
- `LOCK`
- `UNLOCK`
- `CRAFT_CONSUME`
- `CRAFT_OUTPUT`
- `SPLIT_STACK`
- `MERGE_STACK`
- `USE_CONSUMABLE`
- `EXPIRE`
- `REFUND_REVOKE`
- `CHARGEBACK_REVIEW`
- `ADMIN_COMPENSATION`
- `SYSTEM_RECONCILIATION`

각 이벤트는 actor, 대상 owner, 아이템/권리, 수량 또는 instance ID, reason code, 관련 주문/보상/정산, config/catalog version, idempotency key, timestamp, 안전한 trace ID를 기록한다.

## 6. 멱등성과 동시성

모든 상태변경 요청은 논리 작업 범위의 operation key를 사용한다.

```text
shop_purchase:{user_id}:{client_operation_uuid}
quest_reward:{quest_completion_id}:{reward_id}
season_claim:{season_id}:{user_id}:{reward_node_id}
craft:{user_id}:{recipe_id}:{client_operation_uuid}
market_transfer:{settlement_id}
billing_entitlement:{provider}:{provider_transaction_id}:{entitlement_code}
```

규칙:

- 같은 key + 같은 의미 payload = 원래 결과 반환
- 같은 key + 다른 핵심 payload = conflict
- stack split/merge는 최신 version·quantity 재검증
- timeout 후 retry도 중복 grant 불가
- background job과 webhook도 HTTP와 동일한 멱등 규칙 사용

## 7. 원자적 구매·지급

### 7.1 WLD 상점 구매

한 논리 트랜잭션에서:

1. 사용자 인증
2. 활성 immutable catalog/price version 조회
3. 소유·유일성·희소성 규칙 검증
4. 권위 WLD 잔액 확인
5. 경제계약에 따라 WLD debit/burn/route
6. 아이템 또는 entitlement 지급
7. inventory + ledger 연결 기록
8. analytics/outbox 생성
9. 한 번에 commit

WLD만 차감되고 아이템이 지급되지 않는 상태를 허용하지 않는다. 재시도는 동일 구매 결과를 반환한다.

### 7.2 보상 지급

퀘스트·시즌·업적 보상은 deterministic source ID를 사용한다. scheduler retry, 새로고침, 중복 outbox 전달로 두 번 지급되지 않는다.

### 7.3 번들

모든 구성품을 함께 제공하기로 한 번들은 원자적 지급을 기본으로 한다. 일부 구성품이 유일성 때문에 지급 불가하면 전체 거절 또는 사전 고지된 대체정책을 사용하며 조용히 누락하지 않는다.

## 8. 스택과 수량

- split/merge 전후 총량은 일치해야 한다.
- stack metadata에 획득출처·만료 cohort·거래가능시각 등이 존재할 수 있다.
- 호환되지 않는 metadata cohort는 자동 병합하지 않는다.
- 0수량 stack을 지우기 전 provenance를 보존한다.
- batch size는 인프라 보호이며 게임플레이 상한이 아니다.
- 큰 인벤토리는 pagination/virtualization으로 처리하고 평생 보유량을 임의 제한하지 않는다.

## 9. Lock·escrow·pending 상태

아이템은 존재하지만 일시적으로 사용할 수 없을 수 있다.

잠금 사유:

- marketplace listing/reservation
- 제작 진행 중
- moderation/integrity review
- 환불/차지백 검토
- 시즌 정산 전환
- recovery/reconciliation hold

UI는 잠금 이유와 임시 여부를 표시한다. 잠긴 아이템은 다른 경로로 동시에 소비·판매·제작·이전할 수 없다.

## 10. Entitlement 상태머신

권장 흐름:

`PENDING -> ACTIVE -> EXPIRED`

추가 흐름:

- `ACTIVE -> REVOKED`
- `ACTIVE -> SUSPENDED_REVIEW -> ACTIVE | REVOKED`
- `PENDING -> FAILED`

규칙:

- 실결제 entitlement는 서버가 검증한 purchased/paid 상태 이후에만 부여
- pending/deferred 구매는 잠금 해제 금지
- restore/reconciliation은 provider 이력으로 누락 read model을 재생성하되 중복 grant 금지
- refund/revoke는 상품정책에 따라 해당 entitlement를 변경
- 자동갱신 취소는 이미 결제한 기간의 접근권을 즉시 빼앗는 것과 동일하지 않음
- webhook은 지연·순서뒤바뀜 가능성을 고려해 provider event time/version 규칙으로 처리

## 11. 환불·차지백·회수

하나의 결제가 분쟁 상태라고 해서 전체 계정을 잠그거나 무관한 아이템을 몰수하지 않는다.

### 영구 코스메틱 entitlement

유효 환불로 회수가 필요하면:

- 대상 entitlement만 `REVOKED`
- 구매·환불 기록 보존
- 해당 entitlement 향후 사용 중지
- 무관한 인벤토리/WLD 역사 변경 금지
- 계정 내역에 명확한 사유 표시

### 이미 사용된 consumable

실결제 소모품을 도입하려면 판매 전 consumption/refund 정책을 별도 확정해야 한다. 별도 법률/제품 검토 없이 이미 사용된 콘텐츠를 이유로 자동 음수 WLD나 불가능한 인벤토리 부채를 만들지 않는다.

### 차지백 검토

해당 유료 권리의 임시 검토 상태는 가능하다. 광범위 계정 제재는 별도 사기 증거와 appeal/recovery 정책이 필요하다.

## 12. 제작 연계

- 입력수량을 commit 시점에 다시 검증
- locked/escrowed 입력은 사용 불가
- deterministic recipe는 deterministic output
- 랜덤 recipe는 확률 공개, 유료화와 결합 시 별도 정책 검토
- 실패한 craft는 입력소모/출력지급 모두 없음
- 성공 output provenance에 input event IDs와 recipe/config version 연결

## 13. 거래소 연계

기존 `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`의 정산·경제계약은 유지한다.

추가 공통 제약:

- `AVAILABLE`이며 policy상 tradable인 인벤토리만 escrow 이동 가능
- escrow도 동일 instance/stack lineage 유지
- settlement는 소유권을 정확히 한 번 이전
- 취소/만료는 정확한 미판매 instance/quantity 반환
- orphan listing, missing escrow, duplicate ownership 탐지
- buyer→seller principal은 hard sink가 아니며 실제 제거된 시스템 fee만 sink

## 14. 시즌·이벤트 연계

- 고유 시즌 트로피는 deterministic reward key 사용
- 보상 전달 실패는 멱등 재생 가능
- 시즌 종료 시 미수령 보상정책 명시
- 영구 코스메틱은 시즌 종료로 사라지지 않음
- 임시 시즌 자원은 발행 전에 `expires_at` 또는 conversion 정의
- 다음 시즌이 과거 provenance를 덮어쓰지 않음

## 15. 기본 한도 없음 정책

경제조절을 위해 lifetime inventory count, collection count, craft count, purchase count를 임의로 제한하지 않는다.

허용되는 보호 제한:

- request/batch/payload 크기
- 진짜 유한 재고
- 고유아이템 1개 의미
- DB/index 안정성
- abuse throttle/integrity hold
- provider/법적 제한

대규모 인벤토리는 pagination, index, archive/display view, virtualized UI로 처리한다. 제품 제한이 불필요한 numeric config는 `null = unlimited`를 지원한다.

## 16. UI/반응형/접근성

### 데스크톱

- filterable grid/list
- category/filter controls
- detail drawer에서 소유권/provenance/binding/availability 확인
- 안전이 입증된 작업에만 bulk selection

### 모바일

- card/grid + bottom sheet detail
- 핵심 액션은 가로 테이블 의존 없이 접근
- 긴 목록은 pagination/infinite loading
- 파괴적 액션 확인, 오류 후 맥락 보존

필수 상태:

- loading/skeleton
- empty
- partial/stale
- offline
- permission denied
- locked
- integrity review
- expired/revoked entitlement
- retryable error
- maintenance

귀속·잠금·희귀도·만료·회수를 색상만으로 표현하지 않는다. 키보드 focus와 screen-reader label을 제공한다.

## 17. 관리자·고객지원 도구

읽기 중심 도구:

- ownership/provenance timeline
- source order/reward/settlement lookup
- duplicate grant 탐지
- orphan escrow 탐지
- expired/invalid entitlement reconciliation
- provider purchase status 비교
- catalog별 quantity 분포
- 의심 transfer/claim cluster

고위험 보상조정은 재인증/2FA, reason, target preview, append-only audit가 필요하다. provenance를 우회하는 범용 `set inventory quantity` 버튼은 금지한다.

## 18. Reconciliation 및 복구

자동/주기 검사가 탐지해야 할 것:

- 음수/불가능 stack quantity
- duplicate unique instance ID
- 한 unique instance의 다중 owner
- active listing과 escrow 불일치
- 유효 source가 필요한데 entitlement만 active인 상태
- provider paid인데 entitlement 누락
- refund/revoke인데 local entitlement active
- season reward 완료됐는데 grant 누락
- inventory event 합계와 materialized state 불일치

복구는 우선 report/proposal mode다. 자동복구는 결정적·멱등적이며 audit와 rollback/compensation이 가능한 경우에만 허용한다.

## 19. 분석·경제 지표

- source별 item grant/destruction/consumption
- catalog별 unique owner 수
- stack quantity 분포
- transfer volume
- marketplace settlement
- crafting input/output
- entitlement active/revoked/expired
- duplicate-operation reject rate
- reconciliation anomaly rate
- recovery success rate
- inventory API error/latency
- ownership 변경 1,000건당 support case

아이템 transfer volume을 WLD burn으로 계산하지 않는다. WLD는 기존 경제명세에 따라 faucet/hard sink/transfer/converter/hold로 분리한다.

## 20. 수익화/P2W 경계

유료 아이템은 기존 billing 정책에서 허용된 코스메틱·프로필/개인공간 표현·광고 제거 등 비-P2W 권리에 한정한다.

유료 entitlement로 제공할 수 없는 것:

- 높은 WLD 수익률
- 유리한 WDX 체결/비공개 특혜정보
- 낮은 대출비용/높은 신용한도
- 경쟁 랭킹 점수
- 높은 랜덤 확률
- 보안/악용방지 우회
- 별도 검토 없는 현금성/외부환전 가치

## 21. 개인정보·법률·소비자보호

서비스 무결성에 필요한 최소 소유권/provenance ID만 저장한다. 결제 provider ID는 광범위한 사용자 표시 metadata가 아니라 billing/provider linkage에 둔다.

다음을 도입하기 전에는 `legal review required`:

- 실결제 소모품
- 유료 랜덤결과
- 유저간 실결제 거래
- 외부 환전 가능 가치
- 현금성 inventory

환불/revoke UX에서 분쟁경로를 숨기거나 무관한 콘텐츠를 제거하는 보복성 설계를 사용하지 않는다.

## 22. SEO 경계

공개 카탈로그, 수집품 lore, 시즌 아이템 가이드는 독립적으로 유용한 콘텐츠일 때 색인 가능하다.

다음은 인증 + `noindex`:

- 개인 인벤토리
- 개인 계정과 연결된 ownership/provenance
- 구매/entitlement 이력
- provider transaction state
- 판매자 비공개 관리화면
- admin/support/reconciliation 도구

structured data에서 가상아이템을 금융자산, 증권, 환전가능 통화, 투자상품처럼 표현하지 않는다.

## 23. 최신 레퍼런스 — 2026-09-13 검토

### 직접 채택

1. **Microsoft PlayFab Economy V2 — Items and Inventory Overview**, 2026-02-24 업데이트: collection/stack, purchase/transfer, atomic batch, transaction history, idempotency 패턴. 플랫폼 종속성은 채택하지 않는다.
2. **Google Play Billing — Fight fraud and abuse**, 2026 현재 안내: 서버가 `PURCHASED`를 검증한 후 entitlement를 부여하고 pending 구매에는 부여하지 않으며 secure-server acknowledgement/consumption을 권장한다.
3. **Apple StoreKit / App Store Server notifications**, 현재 문서: refund/revoke에 따라 entitlement를 재동기화해야 하며 access를 영구로 가정하면 안 된다.

### 참고

4. **Apple in-app purchase 환불 안내**, 2026 현재: 환불에 따라 잔액/잠금해제 콘텐츠를 적절히 조정할 수 있다는 운영 패턴 참고.
5. **FTC Fortnite 환불 집행자료**, 2026-09-13 재검토: 특정 분쟁을 이유로 무관한 구매 콘텐츠 접근까지 막는 보복성 관행을 피해야 한다는 소비자보호 참고사례. 보편 법적 요구라고 단정하지 않는다.

## 24. 실제 서비스 검증 상태

`https://easy-scraping.com` 외부 확인은 이번 회차에도 HTTP 530이었다.

상태: `runtime verification unavailable`.

따라서 이 명세는 `planned / not verified in Production`이며 현재 인벤토리·결제·거래소 런타임이 이미 구현했다고 주장하지 않는다.

## 25. Definition of Done

- 영문/한국어 문서 동기화
- catalog/ownership 클래스 명시
- unique instance/stack이 retry/concurrency로 복제되지 않음
- WLD 구매+grant 원자성/멱등성 검증
- marketplace/crafting/season/billing이 같은 ownership boundary 사용
- refund/revoke가 정당한 대상 권리만 처리
- duplicate/missing/orphan 상태 reconciliation 가능
- 임의 사용자 체감 inventory cap 없음
- desktop/tablet/mobile + accessibility QA 통과
- 개인 ownership/payment data는 인증 + noindex
- 실제 구현 시 exact SHA를 격리 Test에 배포
- backend/API/DB/inventory invariant와 로그를 확인한 뒤 Production

## 26. 다음 구현 우선순위

1. 자체 이메일 인증 및 Account Security Center P0를 인벤토리 확장보다 우선한다.
2. 기존 상점/거래소 실제 구현을 기준으로 first-party `catalog_items` + authoritative inventory read model을 정의한다.
3. grant/season claim/crafting용 deterministic operation-key registry를 구현한다.
4. 광범위 admin mutation보다 read-only provenance/reconciliation 도구를 먼저 만든다.
5. 결제사업자·상품 범위 확정 후 billing entitlement reconciliation을 연결한다.
6. Production/Test가 외부 검증 가능해지면 Runtime Product Reality Audit 후 구현 정합성을 판단한다.