# 은행·신용·금융학습 안전 v2026.09.13.13 변경 기록

## 변경 이유

기존 은행 기능 문서에는 예치 이자, 신용등급 대출, 가상 채권의 무결성 규칙이 있었지만, 통합 기획에는 사용자 여정, 계약 버전, 상환/회복 UX, 분석, 접근성, 수익화 경계, SEO 경계, 법률 검토 전환 조건을 한 번에 연결한 구현급 계약이 부족했다.

## 변경사항

- 영문 기준본 `BANKING_CREDIT_SAFETY_SPEC.md` 추가
- 한국어 대응본 동시 추가
- `/bank` 개요·저축·신용·상환·가상채권·학습·기록 IA 정의
- 신규 예치금의 과거 시간 소급이자 금지
- 실제 소득/신용자료가 아닌 게임 내부 상태 기반 대출자격 정의
- 발행계약 조건 불변/버전관리, 결정적 상환배분 정의
- 복리 연체 함정 대신 구조조정·회복 경로 정의
- 예치/대출/상환/수수료/채권을 faucet/transfer/hard-sink/hold로 분리
- DB/read model/API 후보, actor-scoped 권한, 멱등성 요구사항 추가
- 데스크톱/태블릿/모바일과 오류·오프라인·보안검토 상태, 접근성 정의
- 대출 횟수/금액이 아닌 금융 이해·상환 행동 중심 성장 원칙 추가
- 운영 KPI 및 정책변경 절차 추가
- 한국/미국 법적 경계와 실제 금융상품 전환 시 `legal review required` 명시
- 결제로 승인·금리·신용한도 우위를 판매하는 수익화 금지
- 계정별 은행 데이터 인증 + noindex 정책 추가

## 기본 한도 정책 영향

일반 플레이에 임의 하드캡을 추가하지 않았다. 신용한도는 경제/무결성 보호 목적이 문서화된 경우에만 허용하며 `하루 N회 대출`보다 노출/상환능력 기반 규칙을 우선한다.

## 경제 영향

- wallet↔deposit은 일반적으로 hold/internal allocation
- 시스템 이자는 faucet
- 대출원금은 자금모델에 따라 faucet 또는 treasury transfer
- 대출 원금 상환은 자동 burn 아님
- 실제 경제에서 제거되는 수수료만 hard sink

## 2026-09-13 최신 참고자료

- 미국 CFPB Regulation Z 현행본(2026-04-08 최종 수정): 실제 소비자신용 고지의 명확성만 참고하며 Moneyverse가 실제 신용상품이라고 주장하지 않음
- Investor.gov `Saving and Investing for Military Personnel`: gamified nudge가 과도한 금융행동을 유도할 수 있다는 공식 투자자 교육 근거를 직접 반영
- OWASP API Security Top 10 2023: 객체/속성 권한검증 참고
- Microsoft PlayFab Economy V2 Items and Inventory Overview(2026-02-24/25 갱신): transaction history/idempotency 패턴 참고

## 실제 서비스 확인

`https://easy-scraping.com` 외부 확인은 HTTP 530이었다. 따라서 `runtime verification unavailable`로 기록하며 현재 운영의 은행 구현상태를 추정하지 않는다.

## 법규 / 수익 / SEO 영향

- 법규: 위험 감소. 실제 신용·현금성 상품 전환은 별도 법률 검토 필요
- 수익: 중립~긍정. 안전한 상품 경계는 명확해졌지만 유료 금융우위는 계속 금지
- SEO: 공개 교육/용어집만 색인 후보, 잔액·제안·상환·거래기록·관리자는 인증 + noindex

## 전달 상태

- 버전: `v2026.09.13.13`
- 브랜치: `docs/banking-credit-safety-v2026.09.13.13`
- PR: #216
- 변경 유형: 문서-only
- Test 배포: 이번 문서 변경에는 불필요
- 런타임 구현: 별도 개발 브랜치 → 격리 Test → backend/DB/API/UI 검증 → Production

## 다음 우선순위

1. 자체 인증 / Account Security Center P0
2. 은행 authoritative read model + 상품버전 registry
3. 이자/상환 경계시각·멱등성 테스트
4. 학습 중심 은행 UX
5. 서비스 복구 즉시 Runtime Product Reality Audit
