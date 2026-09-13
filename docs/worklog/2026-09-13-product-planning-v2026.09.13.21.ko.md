# 제품 기획 작업 로그 — v2026.09.13.21

기준일: 2026-09-13
변경 유형: 문서-only
브랜치: `docs/marketplace-runtime-delivery-v2026.09.13.21`
PR: 영/한 문서 완료 후 생성 예정
테스트 배포: 문서-only 변경에는 불필요

## 시작 상태

- 작업 시작 직전 최신 `main`, Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec, Player Marketplace & Crafting spec을 다시 읽었다.
- 시작 main SHA: `6ad8304ac743366ae8b9bc445934160b0eaecdee`.
- 열린 PR을 다시 확인했다. 가장 최신의 겹치는 런타임 후보는 PR #225 Marketplace Workbench, head `54ea358a30845117aca97412f854cebd83440971`이다.
- PR #225는 open/mergeable이지만 아직 병합되지 않았다. frontend-only, authenticated/noindex이며 `GET /api/v1/shop/holdings`를 읽고 marketplace/crafting mutation을 의도적으로 제공하지 않는다.
- banking/migration parity, portfolio, event calendar, economy scenario lab 등 다른 열린 런타임 후보는 이번 marketplace delivery 계약을 대체하지 않는다.

## 선택한 공백

기존 Player Marketplace & Crafting 명세에는 tradability, fixed-price listing, escrow, atomic settlement, crafting, integrity telemetry, economy accounting의 안전한 목표가 이미 있다.

새 런타임 후보가 등장하면서 실제 공백은 “읽기 전용 holdings workbench를 어떻게 서버/DB보다 앞서지 않고 완전한 marketplace로 발전시키는가”가 되었다.

따라서 중복 기능 문서를 하나 더 만드는 대신 **Marketplace Runtime Delivery & Trust Specification**을 추가했다.

## 결정 사항

1. PR #225를 R0 후보 증거로만 취급하고 현재 Production truth로 기록하지 않는다.
2. 현재 ownership authority인 동안 `/api/v1/shop/holdings`를 R0 권위 read bridge로 허용한다.
3. URL 구조를 정리한다는 이유로 별도 marketplace inventory truth를 만들지 않는다.
4. R0 holdings -> R1 listing/escrow -> R2 atomic settlement -> R3 deterministic crafting -> R4 advanced service 순으로 gate를 정의한다.
5. 정상 inventory/listing/crafting 참여는 기본 unlimited로 유지한다. page/batch/request 제한은 infrastructure protection이다.
6. marketplace principal은 `TRANSFER`, 시스템이 실제 제거한 수수료만 `HARD_SINK`로 유지한다.
7. public engraving/custom label/future review에는 moderation/minor-safety 정책을 상속한다.
8. anti-abuse가 임의 자산제한으로 변하지 않도록 false-positive rate를 핵심 KPI로 둔다.
9. private marketplace/account/admin 화면은 인증 + `noindex`다.
10. 실제 구현은 별도 런타임 브랜치 -> isolated exact-SHA Test -> backend/DB/API/concurrency/reconciliation 검증 -> Production 순서를 유지한다.

## 최신 자료 조사

### Microsoft PlayFab Economy V2 limits

출처 유형: 공식 개발자 문서.
검토일: 2026-09-13.

batch, inventory collection, transaction history에 명시적 제한이 있다. 채택한 시사점은 안전한 pagination/batching이고, 해당 숫자를 Moneyverse 사용자 gameplay cap으로 복사하지 않는다.

### Microsoft PlayFab transaction history

출처 유형: 공식 개발자 문서.
검토일: 2026-09-13.

continuation-token pagination과 transaction traceability를 운영 참고로 채택했다.

### PlayFab trading

출처 유형: 공식 개발자 문서.
검토일: 2026-09-13.

하나의 inventory instance가 동시에 여러 open trade에 들어가지 않는 exclusive semantics만 참고한다. Moneyverse는 자체 PostgreSQL ownership/escrow/ledger를 권위 모델로 유지한다.

### FTC Consumer Reviews and Testimonials Rule

출처 유형: 미국 정부 guidance 및 enforcement.
검토일: 2026-09-13.

향후 public marketplace rating/review 도입 시 fake/false review 통제, 특정 감정 조건 보상 금지, material connection 공개, 기만적 suppression 금지를 launch gate로 조건부 채택한다. 지금 review 기능을 추가할 필요는 없다.

### Apple App Review Guidelines

출처 유형: 공식 platform policy.
검토일: 2026-09-13.

향후 모바일 UGC 배포 참고자료로만 사용한다. 현재 웹서비스가 App Store 앱이라고 가정하지 않는다.

## 런타임 검증

`https://easy-scraping.com` 공개 런타임 확인을 시도했으나 HTTP 530으로 실패했다.

상태: `runtime verification unavailable`.

`/marketplace`, escrow, settlement, crafting이 Production에 배포되었다고 주장하지 않는다. 서비스가 처음 복구되는 회차에는 `Runtime Product Reality Audit` 섹션을 만들고 실제 shop/inventory/marketplace UI와 API 응답을 Living Spec과 비교한다.

## 추가한 파일

- `docs/planning/MARKETPLACE_RUNTIME_DELIVERY_SPEC.md`
- `docs/planning/MARKETPLACE_RUNTIME_DELIVERY_SPEC.ko.md`
- `docs/changelog/2026-09-13-marketplace-runtime-delivery-v2026.09.13.21.md`
- `docs/changelog/2026-09-13-marketplace-runtime-delivery-v2026.09.13.21.ko.md`
- `docs/worklog/2026-09-13-product-planning-v2026.09.13.21.md`
- `docs/worklog/2026-09-13-product-planning-v2026.09.13.21.ko.md`

## 테스트/배포 영향

이번 변경은 문서-only다. 코드·DB·API·배포 설정을 변경하지 않으므로 이 문서 커밋 자체는 Test 배포가 필요하지 않다.

실제 marketplace mutation 구현은 반드시 별도 개발 브랜치 -> exact-head CI -> immutable exact-SHA isolated Test -> backend/DB/API/concurrency/idempotency/ledger/inventory/provenance 검증 -> Production 순서를 따른다.

## 다음 우선순위

1. PR #225의 범위를 넓히지 말고 R0 workbench를 CI/Test로 검증한다.
2. authoritative listing/tradability/escrow backend + DB 계약을 구현한다.
3. write-capable repair 전에 read-only reconciliation을 추가한다.
4. 정확한 concurrency/idempotency 테스트와 함께 atomic settlement를 구현한다.
5. marketplace ownership 불변식이 입증된 이후 deterministic crafting transaction을 구현한다.
6. 서비스 접근 복구 즉시 runtime reality audit을 다시 수행한다.
