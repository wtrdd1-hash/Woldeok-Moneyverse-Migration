# 월덕 머니버스 — 결제·구독·소비자보호 명세

> 버전: v2026.09.13.6
> 상태: 구현 지향형 Living 제품 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md`
> 영문 기준 문서: [BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md](BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md)

## 1. 목적

이 문서는 광고 제거 구독, 비-P2W 꾸미기 상품, 선택형 표시·편의 기능, 향후 스폰서 연계 소비자 상품, 환불·차지백·결제 고객지원까지 실제 구현 가능한 결제 계약으로 구체화한다.

현금 결제 상품은 WLD 수익률, WDX 체결 우대, 대출 조건 우대, 랭킹 점수, 확률 우대, 사업 수익 증가, 비공개 시장정보 등 경제적·경쟁적 우위를 제공할 수 없다.

WLD/WDX는 계속 가상·게임 전용이다. 결제는 명시된 entitlement만 구매하며 현금환전, 증권, 예금, 투자, 도박 또는 가치보장 권리를 만들지 않는다.

## 2. 출시 게이트

현금 결제 checkout은 다음 P0 조건이 모두 통과하기 전까지 `planned / not implemented`로 둔다.

1. 한국과 실제 서비스 대상 미국 주/소비자 범위 법률검토;
2. 판매자 정보, 고객지원, 필수 고지 확정;
3. 버전형 상품/가격 catalog와 entitlement 모델 구현;
4. 서버 기반 결제사업자 연동, webhook 검증, 멱등성 구현;
5. 취소·환불·분쟁·결제실패 흐름을 격리 Test에서 검증;
6. 미성년자/연령 정책과 유료상품 자격 연동;
7. billing processor 개인정보 inventory 반영;
8. 매출·수수료·환불·분쟁·세금을 게임경제 원장과 분리 집계;
9. 계정삭제 시 법정 보존이 필요한 결제기록 처리정책 확정;
10. 관리자/지원도구에서 결제 자격증명 전체값 노출 금지.

프론트 checkout 화면만 완성됐다는 이유로 Production을 켜지 않는다.

## 3. 상품 및 가격 catalog

모든 현금 판매 상품은 서버가 권위적으로 관리하는 immutable 가격 버전을 사용한다.

권장 엔터티:

```text
billing_products
billing_price_versions
billing_offers
billing_orders
billing_payment_attempts
billing_subscriptions
billing_subscription_events
billing_entitlements
billing_consents
billing_refunds
billing_disputes
billing_webhook_events
billing_support_cases
```

`billing_products` 최소 필드:

```text
product_id
product_type                 # subscription | cosmetic | convenience
name_i18n_key
description_i18n_key
entitlement_code
p2w_classification          # 출시 시 NON_P2W 필수
age_policy
availability_state
created_at
retired_at
```

`billing_price_versions` 최소 필드:

```text
price_version_id
product_id
currency
amount_minor_units
billing_interval            # 일회성은 null
trial_duration
jurisdiction_scope
tax_display_mode
starts_at
ends_at
terms_version
refund_policy_version
```

완료 또는 대기 주문에 사용된 가격은 수정하지 않고 새 버전을 생성한다.

## 4. 구독 상태 머신

외부 결제사업자가 결제의 권위 원천이어도 Moneyverse는 내부 구독 read model을 가진다.

권장 상태:

`NONE -> PENDING -> TRIALING -> ACTIVE -> PAST_DUE -> GRACE -> CANCELED -> EXPIRED`

추가 예외/종료 상태:

- `PAYMENT_FAILED`
- `REFUNDED`
- `DISPUTED`
- `SUSPENDED_FRAUD_REVIEW`

원칙:

- 결제사업자 이벤트를 프론트가 직접 신뢰하지 않고 서버 webhook 검증을 통해 내부 상태를 갱신한다.
- 중복·순서가 뒤바뀐 webhook은 멱등 처리한다.
- entitlement 부여와 회수도 각각 멱등이어야 한다.
- 취소는 이후 갱신을 막으며, 정책상 즉시 종료가 필요한 경우가 아니면 이미 결제한 이용기간을 몰래 삭제하지 않는다.
- 환불/차지백에 따른 entitlement 처리규칙은 상품별로 문서화하며 게임경제 과거 원장을 다시 쓰지 않는다.
- 결제 상태와 WLD 원장 상태는 완전히 분리한다.

## 5. 구매 및 갱신 UX

최종 구매 버튼과 같은 의사결정 맥락에서 다음을 표시한다.

- 상품/서비스명;
- 실제 결제통화의 총 가격;
- 정기상품 결제주기;
- 자동갱신 여부와 시점;
- 체험기간이 있으면 종료일과 이후 정확한 가격;
- 관할별 세금/수수료 표시;
- 중요한 연령·이용자격 제한;
- 중요한 취소/환불 조건;
- 적용 약관·개인정보·환불정책 링크;
- 결제 의무가 발생함을 명확히 표현하는 affirmative CTA.

금지:

- 사전 체크된 유료 옵션;
- 정기결제 정보를 시각적으로 숨기는 구성;
- 구독을 일회성 결제처럼 표시;
- 가짜 카운트다운·가짜 재고부족;
- 결제 동의를 무관한 개인정보 동의에 묶기;
- 취소 완료 전에 취소사유 입력을 강제;
- 온라인 자체취소가 가능한데 고객센터만 이용하게 하기.

## 6. 취소 계약

관할별 최소 규정보다 단순한 자체 제품정책을 사용한다.

- 온라인 가입은 온라인 자체 취소를 제공한다.
- 계정 > 결제에서 현재 플랜, 다음 결제일, 가격, 취소 상태, entitlement 종료일을 표시한다.
- 도움말을 뒤져야만 찾을 수 있는 취소 CTA는 금지한다.
- 오클릭 방지를 위한 확인 1단계는 허용한다.
- 유지 제안은 사용자가 명확히 취소 계속을 선택할 수 있는 상태에서만 제공한다.
- 취소사유는 선택사항이다.
- 완료 시 즉시 취소 이벤트와 시각을 저장하고 확인화면을 보여준다.
- 계정 기록과 지원 알림 채널로 확인증을 남긴다.
- 유효한 취소 cutoff 이후에는 다음 갱신 청구를 시작하지 않는다.
- 재가입은 사용자의 명시적 새 행동이 필요하다.

## 7. 대한민국 소비자보호 기준

한국 현금결제 출시 전 `legal review required`.

전자상거래법과 공정거래위원회 최신 지침을 실제 상품유형에 적용할 수 있도록 거래정보, 청약철회, 환불, 다크패턴 방지 구조를 갖춘다.

2025년 2월 14일부터 시행된 온라인 다크패턴 규율을 실제 제품 제약으로 본다. 특히 정기결제 금액 인상이나 무료에서 유료로 전환되는 경우 법에서 요구하는 사전 통지·동의 흐름 없이 조용히 갱신조건을 바꾸지 않는다.

시스템은 다음을 지원한다.

- 사업자/판매자 정보 표시;
- 결제 전 총 가격 및 정기결제 조건;
- 주문·계약 확인;
- 법정 청약철회·환불과 디지털콘텐츠 예외 처리;
- 사용자가 본 가격·약관·동의 버전 증거;
- 고객지원 및 분쟁접수;
- 필요한 경우 미성년자 구매 처리;
- 실제 checkout과 동일한 한국어 고지.

판매하는 디지털 상품의 유형·소비 상태 법률분류 없이 하나의 환불기간을 전 화면에 하드코딩하지 않는다.

## 8. 미국 소비자보호 기준

미국 출시 전 실제 서비스 주와 offer 구조에 대해 `legal review required`.

FTC의 2024 Click-to-Cancel 규칙은 현재 유효한 연방법으로 단정하지 않는다. FTC는 2026년 rulemaking 자료에서 해당 2024 규칙이 vacated됐음을 전제로 한다. 대신 ROSCA, FTC Act 집행과 2026년 rulemaking에서 일관된 보수적 기준을 적용한다.

- 결제정보 입력 전 정기결제 핵심조건을 명확·눈에 띄게 표시;
- 청구 전 명시적·충분한 동의;
- 반복 청구를 중단할 수 있는 단순한 취소수단;
- 유효한 취소 이후 청구 금지;
- 절약액·무료체험·취소·갱신에 관한 오해 유발 표현 금지.

미국 주별 자동갱신법은 추가 고지·확인·리마인더·취소요건이 있을 수 있으므로 Production 전에 서비스 대상 주 매핑이 필요하다.

## 9. 결제 데이터와 보안 경계

가능하면 신뢰할 수 있는 결제사업자의 hosted/tokenized 결제수집을 사용해 PCI/카드정보 범위를 최소화한다.

저장 금지:

- 원본 카드번호(PAN);
- CVV/CVC;
- magnetic-stripe 데이터;
- Git 저장소의 provider secret key;
- 일반 로그의 재사용 가능한 결제 token.

회계, 고객지원, entitlement, 법적 의무에 필요한 provider reference만 최소한으로 보관한다.

모든 billing 상태변경 endpoint는 인증, cookie 인증 시 CSRF 방어, 멱등성, 서버측 상품/가격 lookup, 권한검사를 적용한다. 클라이언트가 전송한 금액·통화·entitlement 값은 권위값으로 사용하지 않는다.

Webhook은 다음을 필수로 한다.

- provider signature 검증;
- provider가 요구하는 경우 raw payload 기반 검증;
- event ID unique 처리;
- 수신/처리시각 기록;
- replay-safe 상태전이;
- dead-letter/retry 관측;
- secret rotation 계획;
- 사용자 제공 payload를 webhook으로 신뢰하지 않음.

## 10. Entitlement 구조

결제와 entitlement는 연결되지만 서로 다른 상태 머신이다.

예시:

- `AD_FREE`
- `PROFILE_THEME_PACK_2026A`
- `ROOM_COSMETIC_BUNDLE_CITY`
- `ARCHIVE_PRESENTATION_PLUS`

Entitlement는 WLD/WDX 잔액의 권위 원천이 될 수 없다.

```text
entitlement_id
user_id
entitlement_code
source_order_id
source_subscription_id
state
granted_at
valid_until
revoked_at
revoke_reason
```

프론트는 application API를 통해 entitlement를 조회하며 localStorage나 클라이언트 purchase flag를 신뢰하지 않는다.

## 11. 환불·결제실패·분쟁

환불은 WLD 이중원장과 별도의 billing 원장을 사용한다.

`REQUESTED -> ELIGIBILITY_REVIEW -> APPROVED | REJECTED -> PROVIDER_PENDING -> COMPLETED | FAILED`

원칙:

- 중복 환불 요청 멱등 처리;
- 환불액은 실결제액에서 이미 완료된 환불액을 뺀 범위를 넘지 않음;
- entitlement 회수는 상품별 문서정책을 따름;
- 꾸미기 회수로 무관한 계정 데이터를 삭제하지 않음;
- 지원 담당자의 환불도 서버검증+사유+감사로그 필수;
- chargeback/dispute는 별도 review state를 사용하며 fraud 근거 없이 무관한 서비스 전체를 자동 정지하지 않음;
- 갱신실패가 WLD를 발행·소각하지 않음.

## 12. 관리자·지원 콘솔

최소 필요 정보만 마스킹하여 표시한다.

- 사용자/계정 reference;
- 상품/플랜;
- 가격 버전/통화;
- provider transaction reference;
- 결제상태;
- entitlement 상태;
- 환불/분쟁 기록;
- 동의/약관 버전;
- 감사기록.

수동 entitlement 부여·회수, 환불 실행 등 고위험 행위는 최근 재인증, 사유입력, append-only audit를 요구한다.

전체 카드정보나 재사용 가능한 결제 secret은 어떤 관리자 UI에도 표시하지 않는다.

## 13. 분석 및 수익성

별도 추적:

- gross billings;
- 회계 기준상 recognized/net revenue;
- 결제사업자 수수료;
- 적용 시 세금;
- 환불;
- chargeback/dispute;
- 구독 시작·갱신·취소·만료;
- trial -> paid 전환;
- 결제실패 복구;
- 결제사용자 1,000명당 고객지원 건수;
- 환불률·분쟁률;
- ARPU/ARPDAU;
- 구독 전환율;
- LTV/CAC/payback;
- 광고제거 구독자 retention;
- 취소 완료시간과 중도이탈률.

현금 결제를 WLD 발행, WLD 소각, hard sink, transfer로 집계하지 않는다. billing과 게임경제 원장은 분석상 분리한다.

## 14. UI 상태·반응형·접근성

필수 상태:

- loading/skeleton;
- 플랜 없음;
- 가격 조회 실패;
- 결제 대기;
- 성공;
- 거절;
- provider 장애;
- 멱등 replay;
- past due;
- 취소 대기/완료;
- 환불 대기/완료/거절;
- offline;
- maintenance;
- permission denied.

데스크톱은 플랜 카드/표와 구매요약을 인접 배치할 수 있다.

모바일은 한 카드에 한 플랜, 가려지지 않는 고정 CTA, CTA 바로 위에 정기결제 조건을 둔다. 정밀 터치가 필요한 가로 financial table을 피한다.

접근성:

- 키보드로 checkout·취소 가능;
- visible focus;
- 가격/주기/status screen-reader label;
- 필요 시 결제상태 변화 `aria-live`;
- 오류를 색상만으로 전달하지 않음;
- 통화와 결제주기를 모호하지 않게 읽어줌.

## 15. SEO/색인

색인 후보:

- 공개 요금 안내;
- 공개 구독혜택 설명;
- 공개 환불/취소/고객지원 정책.

인증+noindex 필수:

- checkout;
- 주문/결제 내역;
- 결제수단;
- 구독 관리;
- 환불상태;
- 분쟁/지원 case;
- billing 관리자 콘솔.

공개 가격정보는 checkout catalog와 일치해야 하며 오래된 가격을 노출하지 않는다. 구조화 데이터는 화면에 실제 표시되는 유효 offer만 사용한다.

## 16. 악용·부정 결제 방지

`DEFAULT_LIMIT_POLICY.md`에 따라 보안·결제무결성 보호한도는 허용된다. 정상 게임플레이 하드캡은 아니다.

가능한 제어:

- 반복 결제시도 velocity/risk check;
- 계정/기기/네트워크 risk scoring;
- 중복 transaction 탐지;
- 환불 abuse review threshold;
- entitlement replay 차단;
- 프로모션/추천 self-dealing 탐지;
- 결제사업자 risk signal;
- 사기 근거가 있을 때 결제기능 일시 제한.

사기 제어가 WLD나 무관한 가상자산을 조용히 몰수해서는 안 된다. 게임경제 교정은 별도 authoritative ledger/audit 절차를 사용한다.

## 17. API 및 멱등성

후보 API:

```text
GET  /api/v1/billing/products
POST /api/v1/billing/checkout-sessions
GET  /api/v1/billing/subscription
POST /api/v1/billing/subscription/cancel
POST /api/v1/billing/subscription/reactivate
GET  /api/v1/billing/orders
POST /api/v1/billing/refunds
POST /api/v1/billing/webhooks/{provider}
```

모든 mutation은 idempotency key 또는 동일한 자연 unique key를 사용한다. provider webhook은 browser 인증 endpoint가 아니며 provider별 request verification을 사용한다.

## 18. Definition of Done

현금결제 릴리스 완료조건:

- 한국/미국 출시 범위 법률검토 기록;
- 상품·immutable 가격버전 구현;
- 결제 전 가격/정기조건 완전 표시;
- affirmative consent 증거 저장;
- webhook signature/replay 검증 통과;
- 중복 결제/환불/취소 멱등 처리;
- 고객센터 강제 없이 온라인 취소 E2E 성공;
- 결제실패·환불·분쟁 state 구현;
- entitlement restart/reconciliation 검증;
- billing 데이터를 WLD/WDX 원장과 분리;
- 미성년자/연령 gate 검증;
- EN/KO UI·정책 동등성;
- desktop/mobile/accessibility QA;
- Production 전 Test exact-SHA 검증;
- rollback/긴급 disable config와 support runbook.

## 19. 리서치 노트 — 2026-09-13

- **미국 FTC, 2026년 6월 공식 집행 — 직접 채택:** 최근 구독 집행에서 정기결제 조건 은폐, 동의 없는 청구, 어려운 취소를 FTC Act/ROSCA 위반으로 문제 삼았다. 명확한 조건·동의·단순 취소를 지속적 제품요건으로 채택한다.
- **미국 FTC, 2026년 3월 공식 rulemaking — 규제 상태 정정으로 직접 채택:** 2024 negative-option rule이 vacated된 상태에서 새 rulemaking을 진행 중임을 반영한다. Moneyverse는 2024 Click-to-Cancel을 현재 구속력 있는 연방법으로 표기하지 않는다.
- **대한민국 공정거래위원회, 2025년 2월 공식 안내 — 직접 채택:** 전자상거래 다크패턴 개정 제도가 2025년 2월 14일부터 시행되었고 정기결제 금액 인상·무료→유료 전환의 사전 통지/동의 사항을 포함한다.
- **공정거래위원회 전자상거래 소비자 안내 — 직접 채택:** 청약철회·환불은 실제 상품유형과 법정 예외를 반영해야 하므로 임의의 단일 환불정책을 만들지 않는다.
- **Stripe Billing 문서 — 구현 참고만:** subscription invoice와 webhook 기반 lifecycle은 내부 멱등 billing state machine 설계 참고다. 이 명세가 Stripe 채택을 강제하지 않는다.

## 20. 실제 서비스 확인

이번 기획 회차에서 `easy-scraping.com`은 HTTP 530으로 접근되지 않았다. 따라서 billing 관련 실제 서비스 검증 상태는 `runtime verification unavailable`이다.

운영 결제가 정상이라고 추측하지 않는다. 이번 버전은 문서-only이며 Test 배포가 필요 없다. 실제 billing 구현은 별도 개발 브랜치 -> 격리 Test -> backend/DB/API/UI/security/payment-provider 검증 -> Production 순서를 지킨다.