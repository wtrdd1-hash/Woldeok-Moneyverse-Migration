# 2026-09-14 — 제품 기획 작업일지 v2026.09.14.65

## 시작 상태

- 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- 시작 `main`: `690208e713b86743a7cd72a3d280ede307e16b6c`
- 시작 시 최신 기획 버전: v2026.09.14.64 리텐션 안전 수익화 진입.
- 범위: 문서-only 소비자 성장기획. 런타임 코드, DB, API, 인증, 인프라, 보안코드 변경 없음.

## 검토한 입력

저장소 문서:
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`
- `docs/planning/RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
- 저장소 검색으로 확인한 현재 product/security/privacy/economy/season 관련 문서와 Living Project Plan의 보안경계.

Runtime:
- `https://easy-scraping.com/`
- `https://easy-scraping.com/guide`
- `https://easy-scraping.com/privacy`
- `https://easy-scraping.com/terms`

외부 최신 reference:
- Discord GDC 2026 social layer / Instant Play.
- Discord Official game identity, 2026-03-12.
- Discord game discovery/social play, 2026-08-20.
- Meta original creators, 2026-03-13.
- Instagram Instants, 2026-05-13.
- Google Search Central people-first 및 2026-08-28 Site Reputation Policy.
- Naver Search Advisor 현행 content/title/spam 가이드.
- 공정거래위원회 표시광고 관련 법령·지침.
- 개인정보보호위원회 2026-04-01 COPPA 2.0 국외동향.

## main 재확인

작업 시작과 중간에 `main`을 다시 확인했고 동일했다.

`690208e713b86743a7cd72a3d280ede307e16b6c`

문서 write 전 병합해야 할 동시 변경은 없었다.

## 이번에 선택한 최대 공백

**acquisition-facing 브랜드 약속과 최신 retention/identity 전략 사이의 promise inconsistency.**

현재 runtime은 WLD를 game-only라고 올바르게 설명하지만 시작 가이드는 복리예금, 국채, 대출, 주식 시세차익/배당, 사업 배당, 카지노와 “대표 자본가”를 향한 자산성장 서사를 강하게 노출한다. 반면 최근 성장기획은 authored choice, 학습, 컬렉션, 정체성, 시즌 연속성, 커뮤니티, 장기 기록을 중심으로 한다.

이 불일치는 top-of-funnel 수치가 좋아도 잘못된 사용자 기대를 유입시킬 수 있다.

## 결정

`BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC`를 만들고 canonical loop를 다음으로 정의했다.

`명확한 약속 → 구체적 증거 → authored choice → contextual signup → meaningful activation → D1 recognition → D7 continuation → branded/direct return`

canonical positioning:
- 지속형 커뮤니티 시뮬레이션 / 가상경제 게임;
- 하나의 길을 고르고 기록을 쌓고 다시 돌아왔을 때 이어지는 세계;
- WLD/WDX는 virtual/simulated/game-only이며 현금환전·수익보장 없음.

## 문서화한 소비자 변경

- human outcome → proof → trust qualifier → next action 메시지 계층.
- 첫 30초 이해 목표.
- 첫 3분 Build / Collect / Explore 경로.
- D1/D3/D7/D14/D30 약속 연속성.
- home, guide, SEO, share landing, auth continuation, comeback surface 규칙.
- finance-like acquisition 표현의 제한/맥락 규칙.
- qualified impression부터 D30 retained contribution까지 message-cohort KPI.
- 통제 가능한 5개 실험.

## 보안·악용·개인정보 검토

High:
1. 브랜드 사칭 / phishing / account takeover;
2. finance-like 기만 또는 오인;
3. public/private 데이터 누출.

Medium:
4. bot/fake-signup/referral 조작;
5. tracking/analytics 과수집;
6. UGC 사칭/doxxing.

최소 보호조건으로 canonical domain 일관성, public-safe allowlist, 개인 history 기본 비공개, URL/analytics의 secret/session/recovery 금지, raw click/view/signup/share에 의미 있는 WLD/WDX 지급 금지, 명확한 virtual/game-only 표현, 향후 personalized public/deep-link/campaign 구현 시 별도 QA를 기록했다.

## 법규/정책 주의

- 한국 표시광고 규칙을 정확성·기만 방지 guardrail로 유지.
- sponsored/material relationship은 적절히 표시.
- 개인정보보호위원회의 2026-04-01 COPPA 2.0 자료는 한국 현행법이 아니라 international-policy/youth review signal로만 기록.
- WLD/WDX는 game-only이며 실제 환전/증권/예금/외부가치 경품으로 바뀌면 별도 legal/product review 필요.

## Runtime 관찰

Homepage:
- game-only 고지 존재;
- main brand hero보다 먼저 wallet/minigame/stock/shop/quest shortcut이 보임;
- sponsored advertisement가 여러 개 존재;
- hero는 커뮤니티 가상경제와 “우리가 함께 만드는 작고 단단한 경제”를 설명;
- 월간소식 미게시;
- lobby는 quiet 상태로 보일 수 있음.

Getting-started guide:
- finance-heavy pillar와 wealth ladder가 강함;
- 복리예금, 국채, smart loan, 주식 시세차익/배당, business payout, passive-income-like 표현, 카지노, “대표 자본가” framing;
- 동시에 올바른 game-only/no-cash 고지도 포함.

해석: disclosure는 강하지만 전체 brand hierarchy가 최신 성장기획과 완전히 정렬되지 않은 consumer expectation 문제다. 이번 기획에서는 보안코드 결함으로 취급하지 않고 메시지/성장 가설로 기록했다.

## 준비한 파일

- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-brand-promise-first-value-v2026.09.14.65.md`
- `docs/changelog/2026-09-14-brand-promise-first-value-v2026.09.14.65.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.65.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.65.ko.md`

## 검증 / 배포

- 영문 canonical + 한국어 대응본 parity 유지.
- 문서 자체에는 runtime test 불필요.
- 문서-only 변경이므로 Test/Production 배포를 유발하지 않는다.
- Runtime verification은 별도로 가능했고 위에 기록했다.
- 최종 `main` SHA는 atomic tree/commit/ref update 후 기록한다.
