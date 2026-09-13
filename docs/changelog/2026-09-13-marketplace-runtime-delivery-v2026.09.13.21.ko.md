# 마켓플레이스 런타임 전달 및 신뢰 — v2026.09.13.21

기준일: 2026-09-13
변경 유형: 문서-only
브랜치: `docs/marketplace-runtime-delivery-v2026.09.13.21`
PR: #226
테스트 배포: 문서-only 변경에는 불필요

## 변경 이유

기존 Player Marketplace & Crafting 명세에는 fixed-price marketplace, escrow, atomic settlement, deterministic crafting 목표가 이미 정의되어 있다. 동시에 최신 런타임 후보 PR #225가 `GET /api/v1/shop/holdings`를 사용하는 로그인 전용 읽기 전용 `/marketplace` workbench를 첫 안전 슬라이스로 제안하고 있다.

이번 공백은 전달 순서였다. Living Spec이 workbench를 미병합 후보로 명확히 표시하고, 현재 mutation 기능이 없다는 사실과 listing·purchase·escrow·crafting UI가 활성화되기 전에 필요한 backend/DB 불변식을 정확히 연결할 필요가 있었다.

## 변경 사항

영문 canonical `MARKETPLACE_RUNTIME_DELIVERY_SPEC.md`와 한국어 대응 문서를 추가했다.

주요 내용:

- R0 authoritative holdings workbench;
- R1 listing quote + escrow 활성화 gate;
- R2 buyer/seller/fee/item 원자 정산 gate;
- R3 deterministic crafting gate;
- telemetry/reconciliation 안정 이후의 R4 확장 서비스;
- 기존 `/api/v1/shop/holdings`를 duplicate ownership truth가 아닌 R0 bridge로 사용;
- pagination/indexing/virtualization 기반 no-arbitrary-hard-cap 규모 확장;
- asking price / settled price / reference range 구분;
- engraving/custom label/future review의 UGC moderation;
- desktop/tablet/mobile/accessibility;
- 비례적 integrity hold와 false-positive KPI;
- transfer/hard-sink/hold/converter/faucet 회계;
- admin/reconciliation 계약;
- monetization/legal/SEO 경계;
- R0 및 향후 mutation의 exact-SHA Test gate.

## 정책 영향

### 기본 한도

정상 inventory/listing/buying/crafting에 하드캡을 추가하지 않았다. 외부 provider/framework 제한은 engineering/batch 제약으로만 취급한다.

### 경제

Marketplace principal은 계속 `TRANSFER`이고 시스템이 실제 제거한 수수료만 `HARD_SINK`다. GMV를 burn으로 계산하지 않는다. customization, restoration, archive reconstruction, provenance, display service를 통해 저가·중가·고가·명예 소비처를 계속 확장한다.

### 수익

비-P2W cosmetic/sponsorship과 discovery-only WLD placement는 가능하다. 실결제 settlement priority, integrity 우회, cash-out, 유료 random outcome, 결제 연동 금융/게임 우위는 별도 검토 없이는 금지한다.

### 법률/개인정보

실결제 유저간 정산, cash-out/외부교환 가능 inventory, 유료 random outcome, merchant/seller 구조, 아동/미성년자 commerce 변경, 공개 상업 review 기능은 `legal review required`를 유지한다.

### SEO

개인 holdings/listings/history/settlement/proceeds/integrity/admin 화면은 인증 + `noindex`다. 품질 높은 공개 catalog/lore/crafting/provenance 교육 페이지만 색인 후보다.

## 런타임 검증

이번 회차 `https://easy-scraping.com`은 HTTP 530을 반환했다. 따라서 `runtime verification unavailable`로 기록한다. PR #225는 열려 있는 미병합 후보이며 운영 동작으로 간주하지 않는다.

## Research note

2026-09-13 검토:

- Microsoft PlayFab Economy V2 limits — 공식 개발자 문서, batching/pagination 참고만 채택하고 gameplay cap 숫자는 복사하지 않음.
- Microsoft PlayFab transaction history — 공식 개발자 문서, traceability/pagination 참고.
- PlayFab trading documentation — 공식 개발자 문서, exclusive item-in-trade 의미만 참고.
- FTC Consumer Reviews and Testimonials Rule Q&A 및 2025 집행 guidance — 정부 자료, 향후 marketplace rating/review 도입 시 조건부 launch gate.
- Apple App Review Guidelines 및 2026 업데이트 — 공식 platform policy, 향후 모바일 UGC 배포 참고.

## 다음 우선순위

1. PR #225 CI 및 exact-SHA isolated Test 검증 완료 전 병합/운영 승격 금지.
2. 별도 런타임 브랜치에서 authoritative listing/tradability/escrow 계약 구현.
3. listing ↔ escrow ↔ ownership ↔ ledger/provenance read-only reconciliation 추가.
4. concurrency/idempotency를 포함한 atomic purchase settlement 구현.
5. inventory consumption/output creation이 하나의 transaction boundary일 때 deterministic crafting 구현.
6. 서비스 복구 즉시 실제 marketplace/shop/inventory UI와 API를 Runtime Product Reality Audit으로 검증.
