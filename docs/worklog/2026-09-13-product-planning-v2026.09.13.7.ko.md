# 제품 기획 작업 로그 — v2026.09.13.7

기준일: 2026-09-13

## 시작 상태

- 최신 `main`, Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec을 다시 읽었다.
- 작업 시작 main SHA: `1b03e3f6e2e66780225d47e6446e73ecec5a4da3`.
- 별도 런타임 작업인 Account Security Center PR #201도 확인했으며 이번 문서 기획과 분리 유지했다.
- 작업 중간에 `main`을 다시 확인했고 SHA 변화가 없었다.
- `easy-scraping.com` 외부 확인이 불가능하여 `runtime verification unavailable` 상태를 유지했다.

## 선정한 공백

기존 Growth Plan에는 activation/retention/economy KPI와 실험 아이디어가 있으나 event schema, consent 목적분리, 권위 event source, experiment assignment/exposure, metric version, guardrail, retention, vendor governance를 구현 수준으로 통합한 명세가 없었다.

이미 계획된 온보딩, 리텐션, 경제, 수익, SEO 개선을 안전하게 측정하려면 새 gameplay 기능보다 이 기반이 먼저 필요하다고 판단했다.

## 조사 자료

- Google Tag Platform Consent Mode 공식 개발자 문서, 2026-04-17 갱신: 동의상태 기반 측정. 직접 설계 반영, 사업자 고정 아님.
- LaunchDarkly Metrics/Experimentation 최신 공식 문서: 실행 중 experiment의 metric definition 안정성. 직접 반영, 사업자 선정 아님.
- LaunchDarkly Holdouts 최신 공식 문서: 향후 1–5%, 약 1–3개월 stable holdout 참고값.
- 개인정보보호위원회 2026 맞춤형광고 집행자료: 투명성, 실질적 선택권, 광고파트너 관리 중요성. 개인정보 설계에 직접 반영.

## 변경사항

- 영문 canonical 및 한국어 `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC` 추가.
- 목적/데이터 분류, consent snapshot, 금지필드 추가.
- 공통 event envelope와 server-authoritative event 규칙 추가.
- activation, D1/D3/D7/D30 retention, economy, revenue, SEO KPI 계약 추가.
- experiment registry, stable assignment, exposure, mutual exclusion, metric version, guardrail, 표본/기간 규칙 및 선택형 holdout 정의.
- auth/privacy/billing/age assurance/loan/금융게임 UX의 금지 또는 사전검토 실험 범위 정의.
- event quality, retention 계층, 외부 destination register 정의.
- P0 event catalog와 guardrail을 포함한 초기 실험 4종 정의.
- 영문/한국어 INDEX와 changelog 동기화.

## 정책 확인

- 임의의 gameplay hard cap을 추가하지 않았다.
- experiment traffic allocation은 릴리스/측정 제어이며 gameplay cap이 아님을 명시했다.
- 경제 지표는 `hard_sink`, `transfer`, faucet, 현금수익을 분리하며 P2P volume을 소각으로 계산하지 않는다.
- 시장학습 실험은 거래횟수 증가만을 목표로 하지 않는다.
- 맞춤형광고는 명시적인 consent/privacy/legal gate 뒤에 둔다.

## 배포/테스트

문서-only 변경이므로 이번 기획 갱신에는 Test 배포가 필요 없다.

런타임 구현은 반드시 별도 개발 브랜치와 격리 Test exact-SHA 검증 후 Production으로 진행한다.

## 브랜치 / PR

- 버전: `v2026.09.13.7`
- 브랜치: `docs/analytics-experimentation-governance-v2026.09.13.7`
- PR: 최종 main 재확인 후 이번 작업흐름에서 생성 예정.

## 다음 우선순위

1. Account Security Center 런타임 작업 정합화 및 검증;
2. 자체 로그인/회원가입 P0 보안 구현;
3. first-party event/schema registry와 권위 경제 metric read model 구현;
4. 서비스 복구 즉시 Runtime Product Reality Audit;
5. 그 후 통제된 온보딩/리텐션 실험 시작.
