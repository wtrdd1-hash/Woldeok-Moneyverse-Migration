# 제품 기획 작업 로그 — v2026.09.13.6

기준일: 2026-09-13
브랜치: `docs/billing-subscription-consumer-protection-v2026.09.13.6`

## 검토 입력

- 작업 시작·중간 `main` SHA `4ed57f4fcd2d640e6d04afd26317cd018a534e32`;
- `PROJECT_PLAN.md` Living Project Plan;
- `PRODUCT_GROWTH_PLAN.md`;
- `PRODUCT_DESIGN_SPEC.md`;
- `SEASON_SYSTEM_SPEC.md`;
- `DEFAULT_LIMIT_POLICY.md`;
- `ECONOMY_SINKS_SPEC.md`;
- `MONETIZATION_COMPLIANCE_SEO_SPEC.md`;
- Account Security Center PR #201 (`v2026.09.13.5`) 등 현재 열린 PR 상태;
- `easy-scraping.com` 공개 접근 상태.

## 선택한 부족 영역

저장소에는 수익화·법규의 상위 원칙은 있지만 현금 구독/상품 결제에서 가격버전, 동의, 구독 lifecycle, provider event, entitlement, 환불, dispute, fraud control, 반응형 UX, 접근성, analytics, 법률 출시게이트를 하나로 묶은 canonical 구현 명세가 없었다.

PR #201에서 진행 중인 계정보안 작업을 중복하지 않고 이 부족 영역을 선택했다.

## 최신 자료 조사

공식·최근 자료를 우선했다.

1. 미국 FTC 2026년 6월 구독 공식 집행: 정기결제 조건 은폐, 무단청구, 어려운 취소. **직접 채택**.
2. 미국 FTC 2026년 3월 negative-option rulemaking. **직접 채택**: 2024 Click-to-Cancel rule은 vacated 상태이므로 현행 구속 연방법처럼 표기하지 않는다.
3. FTC Chegg 2025년 9월 및 Uber 집행/사건 자료. **교차검증 참고**: 단순 취소와 취소 후 청구 방지.
4. 대한민국 공정거래위원회 2025년 2월 전자상거래법 다크패턴 시행 안내. **직접 채택**: 정기결제 가격 인상·무료→유료 전환의 사전 통지/동의 설계.
5. 공정거래위원회 전자상거래 소비자보호 안내. **직접 채택**: 청약철회/환불 구조 및 임의의 단일 환불기간 금지.
6. Stripe Billing 구독/invoice 문서. **구현 참고만**: webhook/invoice lifecycle 패턴; 결제사업자 선정은 아님.

## 주요 결정

- 현금 billing을 WLD/WDX 가상경제 원장과 faucet/sink 지표에서 완전히 분리한다.
- 과거 주문을 재현할 수 있도록 immutable 상품/가격 버전을 사용한다.
- provider webhook은 signature 검증, event unique, replay-safe 처리하는 서버간 입력으로 취급한다.
- payment state와 entitlement state를 분리하며 둘 다 멱등 reconciliation을 요구한다.
- 관할별 최소요건과 별개로 온라인 자체취소를 Moneyverse 기본 제품정책으로 채택한다.
- 한국/미국 실제 출시 범위 및 미국 주별 자동갱신 요구는 `legal review required`로 유지한다.
- 가능한 경우 hosted/tokenized 결제수집으로 결제데이터를 최소화하고 raw PAN/CVV는 Moneyverse에 저장하지 않는다.
- 유료상품은 엄격히 non-P2W로 유지한다.

## 실제 서비스 검증

`https://easy-scraping.com`은 이번 회차에도 HTTP 530이었다. 실제서비스 검증 상태는 `runtime verification unavailable`이다.

문서만 보고 Production billing 상태를 추정하지 않았다.

## 변경 파일

- `docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`
- `docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.ko.md`
- `v2026.09.13.6` 영문/한국어 changelog
- `v2026.09.13.6` 영문/한국어 worklog
- 영문/한국어 문서 INDEX

## 검증·배포

문서-only 변경이다. Test 배포는 필요 없다. backend, DB, API, frontend runtime, config, infrastructure, Production 변경은 하지 않았다.

실제 billing 구현은 별도 개발 브랜치 -> 격리 Test exact-SHA -> backend/DB/API/UI/security/provider 검증 -> Production 순서를 따른다.

## 동시작업

작업 시작과 중간 확인에서 `main`은 `4ed57f4fcd2d640e6d04afd26317cd018a534e32`로 유지됐다. PR #201은 `v2026.09.13.5` 계정보안 런타임 작업이므로 이번 문서 회차는 다음 순서 버전 `v2026.09.13.6`을 사용하고 PR #201을 수정하지 않았다.

## 다음 우선순위

1. Account Security Center 런타임 작업 통합/검증;
2. 자체 local-email 인증 P0 구현과 보안 QA;
3. billing schema 구현 전 결제사업자와 merchant/legal 출시범위 결정;
4. 이후 billing catalog/admin config 구현;
5. 서비스 복구 즉시 Runtime Product Reality Audit 수행.