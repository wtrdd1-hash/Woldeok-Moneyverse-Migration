# 변경 기록 — 브랜드·콘텐츠 성장 엔진 v2026.09.13.24

날짜: 2026-09-13
유형: 문서-only 소비자 성장 기획

## 변경 이유

기존 성장 기획은 가입 전 가치, D1~D30 리텐션/복귀, 리텐션→바이럴 공유까지 보강됐지만 사용자가 플레이하지 않는 날에도 Moneyverse를 다시 찾게 만드는 지속적인 공개 콘텐츠 이유가 부족했다.

## 추가한 내용

- 영문 canonical `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`와 한국어 대응본 추가.
- `유용한 공개 콘텐츠 → 호기심 → 맥락형 체험 → 가입/복귀 → 의미있는 행동 → 진전 → 다음 콘텐츠 재방문` 루프 정의.
- 주간 월드 브리프, 가상기업/시장 스토리, Money Skills Lab, 시즌 기대감/아카이브, 컬렉션/lore spotlight, opt-in 커뮤니티/클럽/도시 spotlight 6개 콘텐츠 기둥 추가.
- 첫 방문, D1, D3, D7, D14, D30+, 휴면 사용자별 콘텐츠 역할 정의.
- 콘텐츠 중심 SEO 클러스터와 얇은 자동생성 콘텐츠 금지 원칙 추가.
- content-assisted acquisition/activation/retention/viral/revenue KPI 추가.
- 맥락형 CTA, 가입 전 샘플, 시즌 preview cadence, 커뮤니티 spotlight, value-first 스폰서 위치를 검증하는 실험 5개 추가.
- 공개/비공개 누출, UGC 피싱/doxxing, 스폰서 기만, engagement fraud, 분석/광고 과수집, 복귀 피싱 압박에 대한 신뢰 gate 추가.

## 최신 조사 반영

2026-09-13 확인:
- Spotify 2026-07-10 주간 discovery 업데이트 — 지속 가능한 반복 발견 앵커의 근거로 직접 채택.
- Spotify 2026-06-12 editor-led New Music Friday 업데이트 — 단순 변화목록보다 설명형 편집 맥락을 추가하는 근거로 직접 채택.
- Naver Search Advisor 최신 콘텐츠 품질/스팸 가이드 — 독립적인 사용자 가치와 얇은 콘텐츠 금지에 직접 채택.
- Google Search Central 2026-08-28 Site Reputation Policy 업데이트 — sponsor/creator/community 편집 분리와 SEO inventory farm 방지에 직접 채택.
- FTC Native Advertising 가이드 — 광고 공개 guardrail로 유지.
- Duolingo Friend Streak/social 자료 — 소셜 맥락이 습관을 강화할 수 있다는 참고만 사용하며 punitive shared daily streak는 채택하지 않음.

## 제품 영향

- Acquisition: 공개 콘텐츠를 얇은 가입 유도면이 아니라 지속 가능한 organic/direct/share 진입면으로 사용.
- Activation: 독자가 먼저 가치를 받은 뒤 맥락형 체험/가입 행동으로 연결.
- Retention/comeback: 주간 월드 브리프와 아카이브가 FOMO 없이 저마찰 재방문 이유 제공.
- Viral: editorial과 owner-first 산출물이 재산/수익률을 기본 지위신호로 만들지 않고 공유 가능.
- Monetization: 첫 editorial 가치 이후 광고/스폰서를 배치하고 D7/D30, ad-induced churn, contribution margin을 함께 평가.
- SEO: URL 수보다 색인 품질과 downstream activation/retention을 우선.

## 보안·개인정보·악용

High 위험:
- 공개/비공개 데이터 누출;
- UGC/커뮤니티 spotlight 사칭·피싱·doxxing;
- 금융 유사 가상시장 문맥에서 스폰서/크리에이터 콘텐츠 기만.

최소 보호조건은 명시적 공개범위/동의, public-safe 데이터만 사용, 비공개 잔액/포트폴리오/보안/복구정보 금지, 신고/삭제 준비, 명확한 sponsor disclosure이며 새로운 개인화 공개면 또는 UGC spotlight 확대 전 별도 런타임 QA가 필요하다.

Medium 위험은 bot/SEO/referral engagement fraud, analytics/ad 과수집, 피싱처럼 보이는 comeback 압박이다.

기존 auth/session/RBAC/ledger/admin/privacy 경계는 완화하지 않는다.

## 법규/정책

- WLD/WDX는 계속 virtual/simulated/game-only.
- 현금환전, 실제 투자권유, 수익보장 표현 추가 없음.
- sponsored/native/creator 경제적 이해관계는 명확히 공개.
- 맞춤광고, 신규 tracking vendor, 미성년자 타기팅, 실질적 경제가치 referral, 대규모 UGC 확대는 별도 privacy/legal/trust review 필요.

## 실제 서비스 검증

`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`.

## 반영 정보

- 버전: `v2026.09.13.24`
- 문서-only: 예
- 문서 PR: 없음. 현재 지시에 따라 최신 `main`에 직접 반영.
- runtime/DB/API/auth/infra 변경: 없음
- 이번 문서 변경의 테스트 서버 배포: 불필요

## 다음 성장 우선순위

먼저 `주간 월드 브리프 → 맥락형 탐색 → 의미있는 행동/복귀 → D7` 하나의 좁은 루프를 검증한다. 이후 콘텐츠 수를 무작정 늘리지 말고 실제 source/cohort별 성과가 가장 높은 기둥을 깊게 발전시킨다.