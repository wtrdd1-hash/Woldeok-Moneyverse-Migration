# 분석 및 실험 거버넌스 v2026.09.13.7

기준일: 2026-09-13

## 이유

기존 성장계획에는 KPI와 실험 백로그가 있었지만 이벤트 스키마, 동의 상태, 권위 이벤트 원천, 실험 배정, metric 버전, guardrail, 데이터 품질, 보유기간, 운영자 거버넌스를 하나의 구현급 계약으로 묶은 문서가 없었다.

## 변경사항

- 영문 canonical `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md`와 한국어 대응 문서를 추가했다.
- 목적제한, 최소수집, 동의 기반 destination, 분석 금지필드를 정의했다.
- unique `event_id`, release/config, experiment assignment, consent snapshot을 포함하는 버전형 이벤트 envelope를 정의했다.
- UI 관찰용 client event와 계정·경제·주문·billing·season reward의 권위 server/DB event를 분리했다.
- activation, D1/D3/D7/D30 retention, economy, revenue, SEO KPI 계약을 구체화했다.
- production experiment registry, 안정적인 server-side assignment, 실제 exposure event, mutual exclusion, 고정 metric version, audit decision을 정의했다.
- reliability, accessibility, abuse, economy integrity, virtual-market safety, billing, notification pressure, 미성년자 정책 guardrail을 추가했다.
- deduplication, timestamp skew, assignment balance, sample-ratio mismatch 등의 데이터 품질 점검을 추가했다.
- storage/retention 계층과 외부 analytics/experimentation vendor register를 추가했다.
- rollout/allocation을 gameplay cap으로 사용하지 않도록 기본 한도 없음 정책을 유지했다.
- onboarding, home recommendation, comeback mission, market-risk learning의 초기 실험을 정의했다.
- 실제 서비스 검증은 불가능하여 문서만으로 구현 완료를 추정하지 않았다.

## 조사 자료

- Google Tag Platform Consent Mode, 2026-04-17 갱신 공식 개발자 문서 — 동의상태별 측정과 destination gating에 직접 반영.
- LaunchDarkly Metrics/Experimentation 최신 공식 문서 — 실행 중 metric definition 안정성과 명시적 metric 계약에 직접 반영. 사업자 선정 의미는 아님.
- LaunchDarkly Holdouts 최신 공식 문서 — 향후 1–5%, 약 1–3개월 안정 holdout의 참고 근거로 사용.
- 개인정보보호위원회 2026 맞춤형광고 관련 집행자료 — 실질적 선택권, 투명성, 광고파트너 관리와 목적분리에 직접 반영.

## 수익 / 법규 / SEO 영향

- 수익: 구독·꾸미기·광고 의사결정 attribution을 개선하되 현금매출과 WLD 경제지표를 섞지 않는다.
- 법규/개인정보: 동의목적 분리, 최소수집, retention, vendor governance를 강화했다. 실제 사업자·국외이전·연령별 적용은 `legal review required`다.
- SEO: 공개 검색유입 데이터는 집계 가능하지만 private account/balance/billing/portfolio 데이터는 기본적으로 SEO attribution과 결합하지 않는다.

## 변경관리

- 버전: `v2026.09.13.7`
- 브랜치: `docs/analytics-experimentation-governance-v2026.09.13.7`
- 변경 유형: 문서-only
- Test 배포: 이번 문서 변경에는 불필요
- 런타임 구현: 별도 개발 브랜치 -> 격리 Test exact-SHA -> event/schema/backend/DB/API/UI/consent 검증 -> Production

## 다음 우선순위

1. Account Security Center 런타임 PR을 최신 main과 정합화하고 Test 증거 확보 후 처리;
2. 자체 이메일 회원가입/로그인 P0 보안 구현;
3. 실제 제품 실험 전에 first-party event/schema registry와 권위 경제 metric read model 구현;
4. 서비스 복구 즉시 Runtime Product Reality Audit 수행;
5. 맞춤형 광고와 현금결제 실험은 개인정보/법률 gate 통과 전 비활성 유지.
