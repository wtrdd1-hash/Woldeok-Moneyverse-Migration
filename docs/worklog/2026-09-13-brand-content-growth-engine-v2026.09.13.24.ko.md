# 제품 성장 작업 기록 — 브랜드·콘텐츠 성장 엔진 v2026.09.13.24

날짜: 2026-09-13
초점: 플레이하지 않는 날의 재방문 이유, 브랜드/콘텐츠 cadence, content-assisted 획득·리텐션, SEO 품질, 가치 이후 수익화, 신뢰 guardrail

## 검토 입력

- 작업 시작 및 문서 쓰기 직전 최신 `main`: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- `docs/planning/PROJECT_PLAN.md` Living Project Plan.
- `docs/planning/PRODUCT_GROWTH_PLAN.md`.
- `docs/planning/RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md` v2026.09.13.23.
- 현재 main에서 확인한 `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, 인증 보안 우선순위, 알림/복귀 governance, analytics/experiment governance 등 최근 관련 기획.
- 현재 제품 불변조건: WLD/WDX는 virtual/simulated/game-only이며 private/account/admin/economy/security 면은 공개 SEO 대상이 아니고 성장기획이 auth/session/RBAC/ledger/security 경계를 약화시키면 안 됨.

초기 검토와 문서 쓰기 직전 재확인 사이에 동시 main 변경은 확인되지 않았다. 이후 현재 문서-only 정책에 따라 `main`에 직접 문서를 기록했다.

## 발견한 가장 큰 공백

현재 성장 스택은 방문자가 왜 가입할 수 있는지, D1~D30에 왜 돌아오는지, 의미있는 진전이 왜 공유될 수 있는지는 설명한다. 남은 가장 큰 공백은 **사용자가 플레이할 생각이 없는 날에도 Moneyverse를 다시 찾을 반복 이유**였다.

강한 반복 콘텐츠 층이 없으면 신규 유입은 일회성 SEO 페이지에, 리텐션은 게임 내 숙제/알림에 과도하게 의존할 수 있다. 살아있는 가상세계라면 플레이 외에도 스토리, 학습, 아카이브, 프리뷰가 독립적으로 다시 볼 가치가 있어야 한다.

## 결정

영문/한국어 `BRAND_CONTENT_GROWTH_ENGINE_SPEC` v2026.09.13.24를 추가했다.

핵심 소비자 루프:

`유용한 공개 콘텐츠 → 살아있는 가상세계에 대한 호기심 → 맥락형 샘플/탐색 → 가입/복귀 → 의미있는 행동 → 개인 진전/산출물 → 다음 콘텐츠 재방문`

DB 스키마, API 계약, 인증 아키텍처, scheduler, backend 구현 상세는 추가하지 않았다.

## 소비자 기획 변경

- 지속 가능한 반복 앵커로 `주간 Moneyverse 월드 브리프` 추가.
- 거래횟수/수익률 자극보다 맥락·학습 중심의 가상기업/시장 스토리 추가.
- 3~5분 Money Skills Lab 추가.
- D-14/D-7/D-3/D-1 시즌 프리뷰를 영구 아카이브와 연결하고 FOMO 카운트다운 압박 금지.
- 컬렉션/lore를 정체성·스토리와 연결해 자발적 aspiration/sink 강화.
- 개인정보/모더레이션 조건을 전제로 opt-in 커뮤니티/클럽/도시 spotlight 추가.
- 첫 방문, D1, D3, D7, D14, D30+, 휴면 cohort별 콘텐츠 역할 정의.
- 일반 로그인 압박 대신 맥락형 가입 전 샘플 또는 복귀 행동 연결.
- 수익화는 첫 editorial 가치 이후에 배치.

## 최신 외부 조사

조사일: 2026-09-13.

### 직접 채택

1. Spotify 공식 2026-07-10 주간 discovery 업데이트.
   - Release Radar가 매주 약 900만 명에게 도달하며 반복 discovery 목적지로 운영됨.
   - 매일 filler를 찍기보다 관련성 높은 주간 앵커를 만드는 방향에 직접 채택.

2. Spotify 공식 2026-06-12 editor-led New Music Friday.
   - 기존 editor-led discovery가 저장/좋아요 기준 두 배 이상 참여를 만들었다고 공개.
   - 새 항목 목록만 보여주기보다 “왜 중요한가”를 설명하는 편집 맥락을 채택.

3. Naver Search Advisor 최신 콘텐츠 작성/스팸 가이드.
   - 실질적인 사용자 가치, 명확한 브랜드·주제 연관, 스팸 패턴 회피를 강조.
   - 독립적으로 유용한 페이지와 얇은 자동생성 금지에 반영.

4. Google Search Central 2026-08-28 Site Reputation Policy 업데이트.
   - 사이트 평판을 이용해 제3자 콘텐츠의 검색순위를 조작하는 행위를 계속 문제로 봄.
   - sponsor/creator/community 편집분리와 SEO inventory farm 금지에 반영.

### 참고/지속 guardrail

5. FTC Native Advertising 가이드.
   - native 콘텐츠의 광고 성격을 가까운 위치에서 명확하고 이해 가능하게 공개하는 원칙을 재확인.

6. Duolingo Friend Streak/social 자료.
   - 소셜 맥락이 반복 참여를 강화할 수 있다는 방향성만 참고.
   - Moneyverse에는 친구와 함께 매일 접속하지 않으면 손해보는 shared streak 압박을 기본 채택하지 않음.

## 퍼널/KPI 변경

주 퍼널:

`검색/소셜/직접/공유 → 유용한 콘텐츠 → 가치있는 읽기 → 맥락형 체험 → 가입/복귀 → 의미있는 행동 → D1 → D7 → D30`

추가/강화 지표:
- content-assisted signup/activation/D7/D30;
- 7/30일 콘텐츠 재방문;
- 주간 월드 브리프 독자→의미있는 행동;
- 콘텐츠 독자→comeback;
- branded organic/direct returning share;
- 콘텐츠 pillar/source별 D7/D30/LTV;
- content/artifact share→engaged visit→activation;
- engaged content user당 sponsor/ad 수익;
- ad-induced churn, contribution margin;
- privacy/spam/takedown/disclosure complaint guardrail.

## 실험 backlog

A. 주간 월드 브리프 맥락형 CTA vs 일반 Play/Sign up.
B. 가입 전 30초 simulated sample vs 바로 가입 CTA.
C. D-14/D-7/D-3/D-1 단계형 시즌 context vs 시작 공지 1회.
D. opt-in 편집형 community spotlight vs 일반 프로젝트 홍보.
E. 첫 유용 콘텐츠 이후 sponsor 배치 vs 상단 배치.

모든 실험은 downstream retention과 trust/fraud/privacy guardrail을 포함하며 단기 CTR·광고수익만으로 성공을 판단하지 않는다.

## 보안·악용·개인정보 검토

### High — 공개/비공개 경계 누출
영향: 비공개 잔액, 포지션, 계정 존재, 소셜관계, 보안맥락이 피싱·스토킹·표적공격에 악용될 수 있음.
최소조건: 명시적 공개범위/opt-in, public-safe 데이터만, 비공개 잔액/포트폴리오/보안/복구/제재/위험정보 금지, 삭제/수정 경로.
별도 개발/QA: 새로운 개인화 공개면 출시 전 필요.

### High — community spotlight/UGC 사칭·피싱·doxxing
영향: 괴롭힘, 악성링크, 허위신원, 실생활 연락처 노출.
최소조건: 참여자 동의, 신고/검토/삭제, 실명 강제 금지, outbound link 안전정책, 비공개 연락처 금지.
별도 개발/QA: 사용자 제출 spotlight 확대 전 필요.

### High — sponsor/creator 기만
영향: 유료 홍보가 금융 유사 가상시장 문맥에서 중립적 Moneyverse 분석처럼 오인될 수 있음.
최소조건: 콘텐츠 근처 현지언어 sponsor/material-connection 표시, 편집결론 독립, 유료 투자신호·수익보장 언어 금지.
별도 검토: 출시 전 product/legal/trust gate 필요.

### Medium
- bot/SEO/referral engagement fraud;
- analytics/ad 과수집;
- comeback/deep-link 메시지의 phishing/ATO 압박.

이번 회차에는 보안 코드를 수정하지 않았다.

## SEO/바이럴/수익 영향

SEO:
- 초보 학습, 가상기업 설명, 시즌 아카이브, 용어집, collection/lore, 충분한 opt-in 커뮤니티 스토리를 우선;
- 얇은 자동생성 issuer/profile/recap 페이지 대량 색인 금지;
- index volume보다 organic visit→signup/comeback→activation→D7/D30→margin 평가.

바이럴:
- editorial 자체를 공유 가능하게 하고 개인 산출물은 opt-in 유지;
- 잔액/수익률/부채/카지노 결과를 기본 공유 카드로 사용하지 않음;
- 수신자가 콘텐츠를 이해한 뒤 가입을 요청.

수익:
- 스폰서/광고는 첫 editorial 가치 이후;
- 광고제거와 비-P2W 표현상품을 우선;
- D7/D30, ad-induced churn, 지원/모더레이션 비용, contribution margin과 함께 평가.

## 법규/정책 주의

- WLD/WDX는 virtual/simulated/game-only 유지.
- 실제 투자권유, 수익보장, 현금환전 암시 추가 없음.
- sponsored/native/creator 경제관계는 명확한 공개 필요.
- 맞춤광고, 신규 tracking vendor, 미성년자 타기팅, 실질적 경제가치 referral, UGC 확대는 출시 전 별도 privacy/legal/trust review 필요.

## 실제 서비스 확인

`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`.

따라서 운영 서비스가 제안된 콘텐츠면이나 사용자 여정을 이미 구현했다고 주장하지 않는다.

## 반영 상태

- 버전: `v2026.09.13.24`
- 문서-only: 예
- `main` 직접 문서 반영 정책: 준수
- 문서 PR: 없음
- runtime/DB/API/auth/infra 변경: 없음
- 이번 문서 변경의 Test 배포: 불필요

## 다음 성장 우선순위

콘텐츠 양을 먼저 늘리지 않는다. 다음은 아래 하나의 좁은 루프를 증명하는 것이다.

`주간 월드 브리프 → 맥락형 탐색 → 의미있는 행동/복귀 → D7`

그 다음 source/cohort별 콘텐츠 pillar를 비교해 fraud-adjusted activation, D7/D30, contribution margin이 가장 좋으면서 신뢰를 보존하는 축을 더 깊게 발전시킨다.