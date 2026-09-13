# 작업기록 — 콘텐츠→습관 성장 루프 v2026.09.13.30

## 범위
소비자 성장 기획만 수행. 개발 구현 상세기획은 현재 지시에 따라 계속 중단.

## 검토 기준선
- 작업 시작 `main`: `127c182b4a02f3bf9a359524343f677bb2f5219b`.
- Living `PROJECT_PLAN.md`.
- `PRODUCT_GROWTH_PLAN.md`.
- `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md` v2026.09.13.29.
- 리텐션 복귀 및 리텐션→바이럴 성장 명세.
- `MONETIZATION_COMPLIANCE_SEO_SPEC.md`.
- Account Security Center 및 인증/보안 우선순위 문서.
- 현재 사용자 지시: acquisition, activation, retention, comeback, viral, brand/content, SEO, profitability 중심. 신규 DB/API/auth/security 아키텍처 확장 금지.

## 선택한 공백
기존 성장 스택은 가입 전 가치, D1~D30 복귀, 리텐션→바이럴 산출물, 반복 공개 콘텐츠까지 갖췄다. 남은 가장 큰 공백은 **유용한 콘텐츠 방문을 D7까지 살아남는 개인 스레드로 전환하는 연결**이었다.

## 결정
영문/한국어 `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC` v2026.09.13.30 추가.

핵심 루프:
`유용한 콘텐츠 → 이해 → 관련 행동 → 개인 스레드 저장 → 다음 목표 → D1 연속성 → D3 취향/정체성 → D7 회고`

핵심 소비자 결정:
- 고의도 공개 페이지마다 핵심 이어하기 1개;
- 가능한 경우 가입 전에 안전한 가치 체험;
- 가입을 이미 느낀 가치의 저장/이어하기로 표현;
- 가입/복귀 후 일반 홈보다 유입 의도 우선;
- D7은 부자순위/거래횟수 압박보다 자기진전+세계 맥락 회고;
- 콘텐츠 코호트를 D7/D30과 contribution margin까지 측정;
- 약속한 가치 이후 수익화.

## 최신 조사 — 2026-09-13
직접채택/방향 근거:
1. Discord 2026-08-20 `Introducing New Tools to Power Game Discovery and Social Play` — 발견/소셜 표면을 reach보다 실제 플레이/리텐션으로 평가해야 한다는 방향.
2. Discord 2026-03-09 `Discord Deepens Its Ability to Drive Growth for Games` — 소셜 맥락이 참여를 깊게 할 수 있다는 근거. Discord 내부 수치는 Moneyverse 성과 예측값으로 사용하지 않음.
3. Google Search Central 2026-02-05 Discover core update — 선정성 감소, 원본성·깊이·시의성 강화.
4. Google Search Central people-first content — 검색 조작보다 실제 사용자 목적과 신뢰 우선.
5. Naver Search Advisor 최신 콘텐츠/스팸 가이드 — 실질적 사용자 가치 우선, 얇은/오해유발/조작/인위적 트래픽 배제.
참고만:
6. Duolingo Friend Streak — 소셜 반복효과는 참고하되 공유 일일연속 손실은 채택하지 않음.

## 보안·개인정보·악용 교차검토
High:
- 인증 복귀/deep-link 피싱·안전하지 않은 리디렉션;
- 공개/비공개 개인화 누출;
- referral/bot 보상 파밍.

Medium:
- 분석/광고 과수집;
- UGC/커뮤니티 사칭·괴롭힘·doxxing·악성링크.

최소 기획조건:
- public-safe/내부 이어하기 목적지만 허용;
- 공개/공유/알림에 세션비밀·비공개자산·보안·복구 데이터 금지;
- 조회/공유/raw signup에 의미 있는 WLD/WDX 보상 금지;
- 개인화 공개면은 명시적 공개범위/opt-in;
- 실제 deep-link, 개인화 공개면, 경제적 referral 구현 전 별도 개발·보안 QA.

보안 코드는 수정하지 않음.

## 퍼널/KPI 변경
핵심 퍼널:
`검색/소셜/직접/공유 → 의미있는 이해 → 관련 체험/행동 → 가입/복귀 → 첫 의미 행동 → D1 → D3 → D7 → D30 → contribution margin`

추가 강조 KPI:
- 저장 스레드 이어가기율;
- 콘텐츠 유입 D7/D30;
- D7 주간회고 완료율;
- share/referral → activation → D7;
- fraud-adjusted CAC;
- privacy, spam/report, ATO signal, 의심 보상중복, public/private 노출, sponsor disclosure, ad-induced churn guardrail.

## 실험 backlog
1. 유입의도 보존 가입후 화면 vs 일반 홈;
2. 저장/이어하기 CTA vs 일반 가입;
3. 이어하기 1개 vs 제품 선택 3개;
4. D7 자기진전 회고 vs 리더보드 우선 회고;
5. 가치 제공 후 스폰서 vs 초반 스폰서.

## SEO·바이럴·수익 영향
- SEO는 페이지 수가 아니라 적합한 이해 → activation → D7/D30으로 평가.
- 바이럴은 raw invite보다 공유 맥락 → 첫 가치 → activation → D7로 평가.
- 단기매출이 올라도 downstream retention/trust가 악화되면 수익화 실험 폐기.

## 법규·정책
- WLD/WDX는 계속 virtual/simulated/game-only.
- 실제 투자권유·수익보장·예금·현금환전·실제증권 암시 금지.
- 스폰서/크리에이터 관계는 해당 시 명확히 표시.
- 맞춤광고, 신규 추적업체, 미성년자 타기팅, 경제가치 referral, 공개 UGC 확대는 별도 privacy/legal/trust review.

## Runtime verification
`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`.

## main 재확인
- 초기 문서 반영 뒤 `main` 재확인 완료.
- 중간 head에는 이번 v2026.09.13.30 문서 체인만 추가됐고, 기획을 무효화하는 외부 동시변경 없음.
- 현재 지시에 따라 문서는 `main` 직접 반영, 문서 PR 없음.

## 변경 유형/테스트 필요
문서-only. 런타임, DB, API, 인증, 인프라, 운영설정 변경 없음. 이번 문서 변경은 테스트 서버 배포 불필요.

## 다음 성장 우선순위
`주간 월드 브리프/공개 학습 콘텐츠 → 관련 개인 스레드 저장 → 의미있는 행동 → D7 회고`의 좁은 루프를 먼저 검증·구체화하고, activation·D7/D30·신뢰·contribution margin이 좋은 콘텐츠 축만 확대한다.