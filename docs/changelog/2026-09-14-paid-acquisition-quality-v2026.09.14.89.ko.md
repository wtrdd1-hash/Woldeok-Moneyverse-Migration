# 변경 기록 — 유료 획득 품질·리텐션 경제성 성장 v2026.09.14.89

## 추가
- `docs/planning/PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.md`.
- 한국어 대응본.

## 소비자 기획
- 현재 가장 큰 공백을 paid acquisition quality로 정의했다. 클릭·싼 가입·금융 키워드 호기심이 건강한 D7/D30 사용자로 이어지지 않는 문제를 다룬다.
- `정직한 paid creative → source-matched public-safe landing → proof/sample 하나 → authored interest → contextual signup → meaningful activation → D1 약속 유지 → D7 retained intent → D30 durable history → contribution margin → scale` 루프를 추가했다.
- persistent-world identity, collection/lore/season discovery, learning/simulation, community/cooperative project의 4개 안전한 promise family를 추가했다.
- 실제 수익·고수익·보장수익·손실복구·대출 urgency·카지노 승리·raw WLD giveaway 중심 cold acquisition을 제외했다.
- creative→landing→product continuity 계약과 자동 creative expansion의 human review 원칙을 추가했다.
- paid cohort D1/D3/D7/D14/D30 품질기준을 추가했다.

## 경제성·KPI 변경
- `CAC_activation`, fraud-adjusted `CAC_D7`, `CAC_D30`, retained contribution, payback, mature-cohort LTV/CAC gate를 추가했다.
- paid source별 activation/retention, promise comprehension, authored interest, first-sample completion, campaign/creative/landing cohort 지표를 추가했다.
- invalid traffic, fake signup, affiliate/referral fraud, finance-like misunderstanding, privacy complaint, phishing report, sensitive-targeting, ad-induced churn을 guardrail로 추가했다.
- 싼 가입량이 아니라 downstream retention과 contribution이 확인돼야 scale할 수 있도록 했다.

## 실험
- Source-matched landing vs generic homepage.
- Signup optimization vs meaningful-activation optimization.
- Broad discovery vs qualified intent controls.
- Platform attribution only vs incrementality-informed budget review.
- Immediate retargeting vs value-triggered retargeting.

## SEO / 바이럴 / 수익화
- thin paid doorway page를 대량 생성하지 않고 충분한 canonical public content를 paid destination으로 재사용한다.
- paid와 referral 경제성을 분리하고 raw click/signup/share/invite acceptance에는 meaningful WLD/WDX를 지급하지 않는다.
- paid user도 organic user와 같은 retention-safe monetization gate를 적용하며 CAC 회수 목적으로 첫 세션 ad load를 늘리지 않는다.

## 보안·악용·개인정보
- HIGH: paid-ad impersonation/phishing/ATO.
- HIGH: automated creative가 실제 금융/도박 claim으로 drift.
- HIGH: invalid traffic, bot/fake signup, referral arbitrage.
- HIGH: advertising/analytics vendor로 private economy/social/security data 유출.
- MEDIUM: landing mismatch, cloaking, affiliate deception.
- 기존 OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community 경계는 유지하며 보안 코드는 수정하지 않았다.

## 조사
- Google Ads AI Max 2026 automation/steering 변화: message/landing control과 D7/D30 quality gate를 강화하고 platform uplift 수치를 Moneyverse 예상치로 사용하지 않음.
- TikTok Attribution Portfolio 2026-05-13 및 Meta 2026 incremental-attribution 방향: platform attribution + first-party retained cohort + incrementality evidence를 결합.
- Google invalid-traffic guidance: paid click은 genuine user interest와 동일하지 않음.
- Meta 2026 scam advertiser/cloaking 및 advertiser verification 사례: canonical identity와 creative/destination consistency 유지.
- 개인정보보호위원회 2026-07-27 TikTok·Apple 제재: proper legal/privacy basis 없이 private Moneyverse state를 새 tracking에 보내지 않음.
- KISA 2026-03-04 불법스팸 안내서를 retargeting/marketing consent guardrail로 유지.

## Runtime
- 공개 홈페이지 검증 가능.
- 현재 첫 viewport는 지갑·미니게임·multi-feature quick-link grid를 노출하고, product explanation 전/중간에 sponsored placement가 있다.
- game-only 고지는 강하지만 generic homepage가 좁은 paid-ad intent를 희석할 수 있다.
- source-matched paid landing의 실제 효과는 아직 미검증 성장 가설이다.

## 범위
문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.