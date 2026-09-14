# 변경 기록 — 획득 포트폴리오·증분 성장 배분 v2026.09.15.90

## 추가
- `docs/planning/ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md`.
- 한국어 대응본.

## 가장 큰 공백
SEO/콘텐츠, creator/community, referral/viral, paid 각각의 명세는 있었지만 여러 채널이 같은 사용자의 공을 주장할 때 다음 광고비·편집·creator capacity를 어디에 배분할지 결정하는 통합 규칙이 부족했다.

## 소비자 기획
- `시장/브랜드 신호 → qualified discovery → public value → authored interest → activation → D1/D7/D30 quality → incremental retained contribution → marginal allocation` 루프 추가.
- demand creation과 demand capture를 분리.
- truthful promise, public value, authored interest, contextual signup, same-intent activation의 공통 채널 계약 추가.
- D1/D3/D7/D14/D30 연속성과 game-only 경계 보존.

## KPI/경제성
- 포트폴리오 1차 성과를 incremental fraud-adjusted D30 retained user와 retained contribution으로 정의.
- incremental D30 user당 marginal CAC, marginal retained contribution, branded/non-branded demand, content shelf life, support/moderation/fraud 비용, 가능한 경우 saturation 근거 추가.
- platform attribution, first-party retained cohort, incrementality evidence를 서로 다른 관점으로 유지.

## 실험
- Branded-search credit test.
- Evergreen organic vs paid matched-intent.
- Creator/community vs referral-code push.
- Marginal paid-spend step test.
- Social/video search-discovery feedback loop.

## SEO/바이럴/수익화
- 2026 Search Console branded query, AI visibility, social/video platform property는 discovery diagnostic으로 사용하고 retention 성공 자체로 보지 않는다.
- near-duplicate channel landing farm 및 raw referral/signup WLD/WDX 보상 금지.
- acquisition source를 이유로 첫 세션 광고량 또는 finance-like monetization pressure를 높이지 않는다.

## 보안/개인정보
- HIGH: cross-channel private-state leakage.
- HIGH: referral/creator/paid arbitrage.
- HIGH: real-finance/gambling claim drift.
- HIGH: acquisition surface phishing/impersonation.
- MEDIUM: measurement overcollection.
- 기존 OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community 경계 유지.

## 조사
직접 채택:
- Google Search Console branded query filter, 2026-03-11 광범위 제공.
- Google Search Generative AI report, 2026-08-31 worldwide rollout 완료.
- social/video platform property, 2026-07-29 global availability.
- Google Meridian v2.0/GeoX 및 full-funnel MMM, 2026-09 현재 문서.
- 개인정보위 2026-07-27 TikTok·Apple 제재를 behavioral tracking privacy guardrail로 사용.

참고만:
- vendor uplift 수치는 Moneyverse 예상치로 사용하지 않는다.
- 이번 문서-only 회차에서 MMM 구현을 요구하지 않는다.

## Runtime
2026-09-15 production 공개 페이지 접근 가능. 홈은 여전히 wallet/mini-games/multi-feature shortcut과 sponsored placement를 main explanation 전후로 보여주며 guide는 finance/wealth 비중이 높다. game-only 고지는 강하다.

## 범위
문서-only. 런타임, DB, API, 인증, migration, scheduler, 인프라, 보안 코드 변경 없음.
