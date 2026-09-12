# 결제·구독·소비자보호 v2026.09.13.6

기준일: 2026-09-13

## 변경 이유

기존 수익화 명세에는 광고 제거 구독과 유료 꾸미기 상품의 원칙은 있었지만 상품/가격 버전, 정기결제 상태, 결제사업자 webhook, entitlement 정합성, 환불·분쟁·취소를 구현할 수 있는 완전한 계약이 부족했다.

## 변경사항

- 영문 canonical `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`와 한국어 대응본을 추가했다.
- 한국/미국 현금결제 출시 게이트를 정의하고 관할별 해석이 필요한 사항은 `legal review required`로 표시했다.
- immutable 상품/가격 버전, 구독 상태머신, 결제시도, 동의증거, webhook event, entitlement, 환불, dispute 모델을 정의했다.
- 현금 billing 회계와 WLD/WDX 게임경제 원장 및 faucet/sink 지표를 분리했다.
- 온라인 자체취소, 선택형 취소사유, 지속 가능한 취소 확인증을 제품 기본정책으로 추가했다.
- 한국 전자상거래 다크패턴 요구를 반영했고, 미국에서는 2024 Click-to-Cancel rule을 현행 구속법으로 취급하지 않도록 규제 상태를 정정했다. ROSCA/FTC Act 집행과 2026년 rulemaking을 지속 기준으로 삼는다.
- 서버 권위 checkout, webhook signature 검증, 멱등성, 결제데이터 최소수집, 관리자 마스킹 요구를 추가했다.
- 반응형/접근성 상태, SEO 색인 규칙, analytics/KPI, fraud control, DoD를 추가했다.
- `easy-scraping.com`은 HTTP 530이어서 실제서비스 검증은 `runtime verification unavailable`로 기록했다.

## 조사한 최신 근거

- 미국 FTC 2026년 6월 구독 관련 공식 집행 — 정기결제 조건·동의·단순취소 기준에 직접 채택.
- 미국 FTC 2026년 3월 negative-option rulemaking — 현재 규제상태 정정에 직접 채택.
- 대한민국 공정거래위원회 2025년 2월 전자상거래 다크패턴 시행 안내 — 직접 채택.
- 공정거래위원회 전자상거래 소비자보호 안내 — 직접 채택.
- Stripe Billing 구독/invoice 문서 — 구현 참고만 하며 특정 provider 선정 의미는 없음.

## 수익·법규·SEO 영향

- 수익: P2W 없이 광고제거·꾸미기 유료화를 측정 가능하게 하고 환불/분쟁/지원비용까지 margin 분석에 포함한다.
- 법규: 정기결제 다크패턴 위험을 낮추지만 실제 한국/미국 출시 범위의 법률검토를 대체하지 않는다.
- SEO: 공개 요금/도움말은 색인 가능 후보이며 checkout·결제내역·구독관리·billing admin은 인증+noindex다.

## 변경 관리

- 버전: `v2026.09.13.6`
- 브랜치: `docs/billing-subscription-consumer-protection-v2026.09.13.6`
- 변경유형: 문서-only
- Test 배포: 이번 문서 변경에는 불필요
- 런타임 구현: 별도 개발 브랜치 -> 격리 Test exact-SHA -> backend/DB/API/UI/security/provider 검증 -> Production

## 다음 우선순위

1. Account Security Center 런타임 변경을 인증 경계를 약화시키지 않고 통합/검증;
2. provider·법률결정 후 billing catalog/admin config 설계;
3. 자체 회원가입/로그인 P0 보안 구현;
4. 서비스 복구 즉시 Runtime Product Reality Audit;
5. billing/legal 출시 게이트 전까지 현금 수익화 비활성 유지.