# 변경기록 — 크리에이터·커뮤니티 Qualified Acquisition v2026.09.14.67

기준일: 2026-09-14
변경 유형: 문서-only 소비자 성장 기획

## 추가
- `docs/planning/CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md`
- 한국어 canonical 대응본.
- 영문/한국어 changelog 및 worklog.

## 이번에 닫은 가장 큰 공백
Creator/community 협업은 tactic으로 존재했지만 partner 선정부터 첫 30초, 가입 전 proof, activation, D7/D30 retention까지 이어지는 품질 모델이 없었다.

## 주요 결정
- 팔로워 수보다 audience/product fit을 우선.
- giveaway-first보다 playable creator story와 authored community artifact를 우선.
- creator/source intent를 landing→signup→D7까지 보존.
- reach/raw signup이 아니라 meaningful activation, retained CAC, D7/D30, LTV/contribution, trust로 partnership을 평가.
- creator click/follow/share/signup 자체에 의미 있는 WLD/WDX 보상을 주지 않는 것을 기본값으로 유지.
- sponsor/material connection과 finance-adjacent creative의 game-only 설명을 명확히 표시.

## 실험
1. contextual creator landing vs generic home;
2. authored artifact challenge vs follow/repost giveaway;
3. niche-fit creator vs broad-reach creator;
4. 명확한 sponsorship 표시 vs 모호한 표시;
5. reward-free attribution vs raw-signup economic bounty.

## 보안·신뢰
High: creator/공식 사칭·피싱, referral/giveaway 다계정 farming, finance-like creator deception, personalized showcase의 public/private leakage.
Medium: fake/purchased engagement, harassment/doxxing, analytics overcollection.

## 최신 조사
- YouTube Brand Deal Desk, 2026-07-01 — creator-brand fit/performance reporting 직접 채택.
- YouTube/Google Search profiles, 2026-06-04 — official/canonical creator identity 직접 채택.
- FTC TruHeight final order, 2026-07 — fake/incentivized-positive review 및 bot social-proof guardrail 직접 채택.
- FTC Consumer Review Rule warning letters, 2025-12 — fake review/social indicator와 sentiment-conditioned incentive 방지 직접 채택.
- 공정거래위원회 추천·보증 표시광고 심사지침 개정, 2024-12-01 시행 — 경제적 이해관계 표시 guardrail로 직접 채택. 이번 조사에서 더 최신 공식 개정은 확인되지 않음.
- Clash Royale 2v2 복귀 캠페인, 2026-09-09 — 참고만 함. repost/giveaway volume은 Moneyverse 핵심 성공지표로 채택하지 않음.

## Runtime verification
2026-09-14 가능. 공개 홈·운영소식·가이드를 확인했다. 홈/운영소식은 아직 실제 공개 소식이 없는 반면 sponsored placement가 노출되고, 가이드는 finance/wealth 중심이다. 따라서 creator traffic은 generic acquisition보다 expectation-matched contextual landing이 우선이다.

런타임, DB, API, 인증, 인프라, scheduler, 보안 코드 변경 없음.