# 제품 기획 작업 로그 — v2026.09.13.13

## 시작 상태

- 작업 시작 직전 최신 `main`, Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec을 다시 읽었다.
- 시작 main SHA: `e023c15927035d58b67b76d3765535adc1d2ded0`.
- 현재 은행 기능 문서와 문서 색인을 함께 검토했다.
- 열린 PR을 재확인했으며 PR #192는 별도의 카지노 문서 작업으로 이번 은행 기획과 직접 충돌하지 않는다.
- 기존 결론을 고정된 사실로 취급하지 않고 Living Spec으로 재검토했다.

## 선택한 공백

기존 은행 문서에는 이자·대출·가상채권의 무결성 규칙은 있었지만, IA, 신용제안 고지, 상환/회복, 계약 버전, 경제 분류, 분석, 접근성/반응형, 수익화 제한, SEO 경계, 법률 검토 전환조건을 하나로 묶은 구현급 계약이 부족했다.

## 2026-09-13 조사

1. 미국 CFPB Regulation Z / Truth in Lending — 공식 규제기관 자료, 현행 페이지는 2026-04-08 최종 수정. 고지의 명확성만 직접 참고하며 Moneyverse를 실제 소비자신용으로 취급하지 않는다.
2. Investor.gov `Saving and Investing for Military Personnel` — SEC 공식 투자자 교육 자료. gamified nudge가 과도한 금융행동을 유도하지 않아야 한다는 안전 원칙을 직접 채택했다.
3. OWASP API Security Top 10 2023 — 독립 보안 참고자료. 객체/속성 권한검증과 보호필드 처리에 채택했다.
4. Microsoft PlayFab Economy V2 Items and Inventory Overview, 2026-02-24/25 갱신 — 공식 플랫폼 문서. 원자적 처리, transaction history, idempotency 패턴만 참고했다.

## 실제 서비스 확인

`https://easy-scraping.com` 외부 요청은 HTTP 530이었다. `runtime verification unavailable`로 기록하고 운영 UI/API 상태를 추정하지 않았다.

## 제품 결정

- WLD 은행은 계속 `virtual / simulated / game-only`다.
- 대출횟수가 아니라 금융학습·상환 행동을 성장축으로 사용한다.
- 임의의 일일 대출/행동 하드캡은 추가하지 않았다.
- 신용한도는 게임경제 노출/상환능력에 기반한 보호목적 한도만 허용한다.
- 예치원금 이동은 hold/internal allocation이며 총 상환거래량은 자동 burn이 아니다.
- 실제 현금·신용·외부 금융상품으로 전환되면 채택 전에 `legal review required`다.
- 구독/광고로 승인, 금리, 신용한도, 정산 우위를 판매하지 않는다.

## 변경 파일

- `docs/planning/BANKING_CREDIT_SAFETY_SPEC.md`
- `docs/planning/BANKING_CREDIT_SAFETY_SPEC.ko.md`
- 영문/한국어 changelog
- 영문/한국어 worklog
- 영문/한국어 `docs/INDEX`

## 버전 / 브랜치 / PR

- 버전: `v2026.09.13.13`
- 브랜치: `docs/banking-credit-safety-v2026.09.13.13`
- PR: #216
- 변경 유형: 문서-only
- Test 배포: 이번 회차에는 불필요
- 런타임 구현 시: 별도 개발 브랜치 → 격리 Test exact SHA → backend/DB/API/UI 검증 → Production

## 법규 / 수익 / SEO

- 법규: game-only 경계와 실제 금융상품 전환 전 법률검토 조건으로 위험 감소
- 수익: 금융결과를 바꾸는 유료우위 금지, 비-P2W 코스메틱/일반 구독은 가능
- SEO: 공개 교육/규칙만 색인 후보, 개인 은행·신용·거래내역·관리자는 인증 + noindex

## 다음 우선순위

1. Account Security Center / 자체 인증 P0 정합화 및 Test 검증
2. 은행 authoritative read model + 상품버전 registry
3. 예치이자/상환 경계시각·멱등성 테스트
4. 학습 중심 은행 UX
5. Production/Test 복구 즉시 Runtime Product Reality Audit
