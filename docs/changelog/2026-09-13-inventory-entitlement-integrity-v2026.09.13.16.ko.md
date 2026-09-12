# 인벤토리 및 권리 무결성 v2026.09.13.16

## 변경 이유

Moneyverse에는 상점 구매, 제작, 유저 거래소, 시즌, 실결제 entitlement 각각의 명세가 있었지만 아이템 소유권, 고유 인스턴스, 스택, entitlement 생명주기, provenance, 잠금, 환불/회수, reconciliation을 모든 시스템에 공통으로 적용하는 권위 계약이 없었다.

이 공백은 재시도로 보상이 복제되거나, 결제가 pending인데 유료 권리가 지급되거나, 거래소와 제작 시스템이 서로 다른 소유권 상태를 보거나, 환불 시 너무 많은/적은 권리가 회수되는 구현 위험을 만든다.

## 변경사항

- 영문 canonical `INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.md` 추가
- 한국어 대응 문서 동기화
- catalog, inventory ownership, entitlement, provenance를 분리
- unique instance, stackable resource, account-bound, club-bound, system entitlement, time-bound entitlement, escrow 분류 정의
- catalog version, container, stack, instance, lock, event, entitlement, reconciliation 후보 DB/read-model 정의
- shop purchase, quest reward, season claim, craft, marketplace settlement, billing entitlement용 deterministic idempotency key 정의
- WLD 구매 + item grant 원자성과 보상 replay 멱등성 요구
- stack split/merge, metadata cohort, quantity conservation 규칙 추가
- marketplace/crafting/integrity review/season/refund review의 lock/escrow 의미 통합
- `PENDING -> ACTIVE -> EXPIRED` entitlement 흐름과 revoke/review 경로 정의
- 실결제 권리는 서버가 paid/purchased를 검증한 뒤 지급하고 pending/deferred 상태에서는 지급하지 않도록 명시
- 환불/revoke 시 해당 entitlement만 처리하고 무관한 인벤토리/계정 접근을 제거하지 않도록 정의
- duplicate unique ID, multi-owner, orphan escrow, missing grant, provider/local entitlement drift reconciliation 추가
- 반응형/접근성, 관리자/지원, analytics, monetization, privacy/legal, SEO 경계 추가

## 기본 한도 정책 영향

임의 게임플레이 또는 평생 인벤토리 하드캡을 추가하지 않았다. 큰 인벤토리는 pagination, index, archive/display view, virtualization으로 처리한다. 제한은 진짜 희소성, 유일성, request/batch 안전, 인프라 무결성, abuse 방지, provider 제약, 실제 법적 요구에만 허용한다.

## 경제 영향

- 아이템 이전은 WLD burn이 아니다.
- 거래소 principal은 `TRANSFER`다.
- 실제 제거된 WLD/resource만 `HARD_SINK`다.
- 제작 등에서 소비된 inventory material은 WLD 공급과 별도 집계할 수 있다.
- reconciliation은 누락 상태를 이유로 가치나 아이템을 조용히 새로 mint하면 안 된다.

## 2026-09-13 최신 레퍼런스

### 직접 채택

- Microsoft PlayFab Economy V2 `Items and Inventory Overview`, 2026-02-24 업데이트 — collection/stack, atomic batch, transaction history, idempotency 운영 패턴 참고. PlayFab 종속성은 추가하지 않음.
- Google Play Billing `Fight fraud and abuse`, 2026 현재 — 서버 검증, pending 상태 entitlement 미지급, 유효 구매 후 acknowledgement/consumption 원칙 채택.
- Apple StoreKit / App Store Server notification 문서, 2026 현재 — refund/revocation 발생 시 entitlement reconciliation 원칙 채택.

### 참고

- Apple 앱 내 구입 환불 안내 — refund/consumption 운영 패턴 참고. Moneyverse의 정확한 처리정책은 별도 product/legal 정책 대상.
- FTC Fortnite 환불 집행자료, 2026-09-13 재검토 — 하나의 분쟁거래 때문에 무관한 구매 콘텐츠까지 차단하는 보복성 설계를 피해야 한다는 소비자보호 참고사례.

## 실제 서비스 검증

`https://easy-scraping.com`은 이번 회차에도 HTTP 530을 반환했다. 상태: `runtime verification unavailable`.

현재 Production 인벤토리·거래소·유료 entitlement가 이 명세를 구현했다고 추정하지 않는다.

## 법률 / 수익 / SEO 영향

- 법률: 위험 감소. 실결제 소모품, 유료 랜덤결과, 외부환전 가능 가치, 유저간 실결제 거래는 계속 `legal review required`.
- 수익: 코스메틱/광고제거 같은 비-P2W 권리를 정확히 복구·회수·reconciliation할 수 있어 유료화 기반 품질에 긍정적.
- SEO: 공개 catalog/lore/season-item 페이지는 색인 가능 후보. 개인 inventory, 구매/entitlement 이력, provider 상태, 운영자 도구는 인증 + noindex.

## 전달 상태

- 버전: `v2026.09.13.16`
- 브랜치: `docs/inventory-entitlement-integrity-v2026.09.13.16`
- PR: 문서 완료 후 생성
- 변경 유형: 문서-only
- 테스트 서버: 이번 문서 변경에는 배포 불필요
- 실제 구현: 별도 개발 브랜치 -> 격리 Test -> backend/DB/API/inventory 검증 -> Production

## 다음 우선순위

1. 자체 인증 / Account Security Center P0
2. 현재 shop/inventory 런타임과 authoritative catalog + inventory read model 정합화
3. rewards/season claims/crafting deterministic operation-key registry
4. read-only provenance/reconciliation 운영 도구
5. 결제사업자 범위 확정 후 billing entitlement reconciliation
6. Production/Test 외부 검증 가능 즉시 Runtime Product Reality Audit