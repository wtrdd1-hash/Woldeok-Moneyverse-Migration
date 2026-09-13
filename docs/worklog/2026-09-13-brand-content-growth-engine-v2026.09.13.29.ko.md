# 제품 성장 작업 기록 — 브랜드·콘텐츠 성장 엔진 v2026.09.13.29

날짜: 2026-09-13
초점: 비플레이일 재방문 이유, 브랜드/콘텐츠 cadence, content-assisted 획득·리텐션, SEO 품질, 가치 이후 수익화, 신뢰 guardrail

## 저장소 상태 검토

- 시작 `main`: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`와 최신 retention/activation/monetization/security 기획을 다시 읽음.
- 회차 중 첫 문서 쓰기 직전에 `main`이 통합 baseline `ef8509ac8db073a748d95eee8e564ec10f0e8f36`으로 동시 변경됨.
- 해당 통합을 다시 검토했으며 Account Security Center runtime과 최신 AI 경제/카지노 기획이 포함되어 있었음. 이번 소비자 성장 방향을 무효화하지 않으며 통합된 보안/경제 경계를 그대로 보존함.
- 동시 통합이 순서형 기획 버전 `v2026.09.13.24`를 이미 사용했으므로 임시 브랜드/콘텐츠 v24 초안은 기준본으로 유지하지 않고 **v2026.09.13.29**로 정정함.

## 발견한 가장 큰 공백

현재 제품은 가입 전 가치, D1~D30 복귀 사다리, retention→viral 루프가 이전보다 명확하다. 남은 가장 큰 공백은 사용자가 긴 플레이를 할 생각이 없는 날에도 Moneyverse를 다시 찾게 만드는 반복 이유였다.

반복 공개 콘텐츠가 약하면 획득은 일회성 SEO 페이지에, 리텐션은 게임 내 숙제/알림에 과도하게 의존할 수 있다. 살아있는 가상세계라면 스토리·학습·아카이브·프리뷰 자체도 다시 볼 이유가 되어야 한다.

## 결정

영문/한국어 `BRAND_CONTENT_GROWTH_ENGINE_SPEC` v2026.09.13.29 추가.

핵심 루프:
`유용한 공개 콘텐츠 → 호기심 → 맥락형 샘플/탐색 → 가입/복귀 → 의미있는 행동 → 개인 진전/산출물 → 다음 콘텐츠 재방문`

DB schema, API contract, auth architecture, migration, scheduler, backend 구현 상세는 확장하지 않았다.

## 소비자 기획 변경

- 지속 가능한 반복 앵커로 주간 Moneyverse 월드 브리프 추가.
- 거래횟수/수익률 과장 대신 맥락·학습 중심 가상기업/시장 스토리.
- 3~5분 Money Skills Lab.
- D-14/D-7/D-3/D-1 시즌 preview를 영구 archive와 연결하고 FOMO countdown 압박 금지.
- collection/lore를 정체성·스토리와 연결해 자발적 aspiration/sink 강화.
- opt-in community/club/city spotlight에 개인정보/모더레이션 조건 부여.
- 첫 방문/D1/D3/D7/D14/D30+/휴면 cohort별 콘텐츠 역할 정의.
- generic auth 압박보다 맥락형 pre-signup/comeback 행동 연결.
- 광고/스폰서는 첫 editorial 가치 이후 배치.

## 최신 조사

조사일: 2026-09-13.

직접 채택:
1. Spotify 공식 2026-07-10 주간 discovery 업데이트 — Release Radar가 매주 약 900만 명에게 도달; 지속 가능한 반복 discovery anchor 근거.
2. Spotify 공식 2026-06-12 editor-led New Music Friday — 기존 editor-led discovery가 저장/좋아요 기준 2배 이상 참여; 설명형 editorial 맥락 근거.
3. Naver Search Advisor 최신 콘텐츠 작성/스팸 가이드 — 독립 사용자 가치, 명확한 브랜드/주제 연관, thin content 금지에 반영.
4. Google Search Central 2026-08-28 Site Reputation Policy — sponsor/creator/community 편집분리와 SEO inventory farm 금지에 반영.

참고/guardrail:
5. FTC Native Advertising — 광고/스폰서 성격을 콘텐츠 가까이서 명확히 공개.
6. Duolingo Friend Streak/social — social context가 반복참여를 강화할 수 있다는 방향성만 참고하고 punitive shared daily streak는 채택하지 않음.

## 퍼널/KPI

주 퍼널:
`검색/소셜/직접/공유 → 유용한 콘텐츠 → 가치있는 읽기 → 맥락형 체험 → 가입/복귀 → 의미있는 행동 → D1 → D7 → D30`

추가/강화 지표:
- content-assisted signup/activation/D1/D3/D7/D14/D30
- 콘텐츠 진입→첫 의미있는 행동 시간
- 7/30일 콘텐츠 재방문
- 주간 월드 브리프→meaningful action
- 콘텐츠 독자→comeback
- branded organic/direct returning share
- pillar/source별 D7/D30/LTV
- share→engaged visit→pre-signup value→activation→D7
- engaged content user당 sponsor/ad 수익, subscription conversion, ad-induced churn, LTV/CAC, contribution margin
- fake signup, engagement/referral fraud, ATO signal, spam/report, privacy complaint, duplicate reward, disclosure complaint, takedown을 trust guardrail로 사용

## 실험 backlog

A. 주간 월드 브리프 맥락형 CTA vs 일반 Play/Sign up.
B. 가입 전 30초 simulated sample vs 바로 가입.
C. D-14/D-7/D-3/D-1 단계형 시즌 context vs 시작 공지 1회.
D. opt-in 편집형 community spotlight vs 일반 프로젝트 홍보.
E. 첫 유용 콘텐츠 이후 sponsor vs 상단 sponsor.

단기 CTR/광고수익만으로 성공을 정의하지 않고 downstream retention과 trust/fraud/privacy guardrail을 함께 본다.

## 보안·악용·개인정보

### High — 공개/비공개 누출
영향: stalking, phishing, 표적공격, 잔액/포지션/계정/관계/보안맥락 노출.
최소 보호: 명시적 공개범위/opt-in, public-safe 데이터만, 비공개 balance/portfolio/security/recovery/moderation/risk 정보 금지, hide/remove/redact 경로.
별도 개발/QA: 새로운 개인화 공개면 출시 전 필요.

### High — community spotlight/UGC 사칭·피싱·doxxing
최소 보호: 참여동의, moderation/report/takedown, 실명강제 금지, outbound-link 안전정책, 비공개 연락처 금지.
별도 개발/QA: 사용자 제출 spotlight 확대 전 필요.

### High — sponsor/creator 기만
최소 보호: 콘텐츠 가까이의 현지언어 sponsor/material-connection 표시, editorial 독립, 유료 금융유사 signal/수익보장 금지.
별도 검토: 출시 전 product/legal/trust gate.

### Medium
- bot/SEO/referral engagement fraud
- analytics/ad 과수집
- comeback/deep-link phishing/ATO 압박

기존 auth/session/RBAC/ledger/admin/privacy 경계는 그대로 유지했고 이번 회차 보안 코드는 수정하지 않았다.

## SEO/바이럴/수익 영향

SEO: 유용한 학습, 가상기업 설명, 시즌 archive, glossary, collection/lore, 충분한 opt-in community story 우선. 얇은 자동생성 대량 페이지 금지. organic은 activation→D7/D30→margin까지 평가.

바이럴: editorial은 공유 가능, 개인산출물은 opt-in. balance/profit/debt/casino를 기본 공유카드로 만들지 않고 recipient value 이후 signup을 요청.

수익: value-first sponsor/ad, 광고제거, 비-P2W 표현상품 우선. D7/D30, ad-induced churn, 콘텐츠/지원/모더레이션 비용, contribution margin과 함께 평가.

## 법규/정책

- WLD/WDX는 virtual/simulated/game-only.
- 실제 투자권유, 수익보장, cash redemption 암시 없음.
- sponsored/native/creator 관계는 명확한 disclosure 필요.
- 맞춤광고, 신규 tracking vendor, 미성년자 targeting, 실질 경제가치 referral, 대규모 UGC는 별도 privacy/legal/trust review 필요.

## 실제 서비스 검증

`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`.

## 반영

- 버전: `v2026.09.13.29`
- 문서-only: 예
- 문서 PR: 없음. 현재 지시에 따라 최신 `main` 직접 반영.
- 이번 성장회차 runtime/DB/API/auth/infra 변경: 없음
- 문서-only Test 배포: 불필요

## 다음 성장 우선순위

먼저 `주간 월드 브리프 → 맥락형 탐색 → 의미있는 행동/복귀 → D7`을 증명한다. 이후 fraud-adjusted activation, D7/D30, contribution margin이 가장 좋으면서 신뢰를 보존하는 콘텐츠 기둥을 깊게 발전시킨다.