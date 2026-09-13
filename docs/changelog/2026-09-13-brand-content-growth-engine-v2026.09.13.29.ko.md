# 변경 기록 — 브랜드·콘텐츠 성장 엔진 v2026.09.13.29

날짜: 2026-09-13
유형: 문서-only 소비자 성장 기획

## 변경 이유
기존 성장 스택은 가입 전 가치, D1~D30 리텐션/복귀, 리텐션→바이럴 공유까지 다뤘지만 플레이하지 않는 날에도 다시 Moneyverse를 찾게 만드는 지속적 공개 콘텐츠 이유가 부족했다.

## 추가
- 영문 canonical + 한국어 `BRAND_CONTENT_GROWTH_ENGINE_SPEC`.
- `유용한 공개 콘텐츠 → 호기심 → 맥락형 체험 → 가입/복귀 → 의미있는 행동 → 진전 → 다음 콘텐츠 재방문` 루프.
- 주간 월드 브리프, 가상기업/시장 스토리, Money Skills Lab, 시즌 기대감/아카이브, 컬렉션/lore, opt-in 커뮤니티/클럽/도시 spotlight 6개 기둥.
- 첫 방문/D1/D3/D7/D14/D30+/휴면 사용자별 콘텐츠 역할.
- content-first SEO와 얇은 자동생성 금지, organic→activation→D7/D30→margin 측정.
- 맥락형 CTA, 가입 전 샘플, 시즌 preview cadence, 커뮤니티 spotlight, value-first sponsor 위치 실험 5개.
- 공개/비공개 누출, UGC 피싱/doxxing, sponsor 기만, engagement fraud, 분석/광고 과수집, comeback phishing 압박 guardrail.

## 동시 main 변경 보정
회차 시작 기준은 `22f8b7a18cd778ddf6a754cc6d28dd0206847885`였으나 첫 문서 쓰기 직전 `main`이 통합 baseline `ef8509ac8db073a748d95eee8e564ec10f0e8f36`으로 변경됐다. 이 통합에는 Account Security Center runtime과 최신 AI 경제/카지노 기획이 포함됐다.

동시 통합에서 순서형 기획 버전 `v2026.09.13.24`가 이미 사용됐기 때문에 임시 브랜드/콘텐츠 v24 초안을 기준본으로 유지하지 않고 **v2026.09.13.29**로 정정했다. 통합된 보안·경제 경계는 그대로 보존한다.

## 최신 조사
2026-09-13 확인:
- Spotify 공식 2026-07-10 주간 discovery — 지속 가능한 반복 발견 앵커 근거로 직접 채택.
- Spotify 공식 2026-06-12 editor-led New Music Friday — 설명형 editorial 맥락 근거로 직접 채택.
- Naver Search Advisor 최신 콘텐츠 품질/스팸 가이드 — 독립적 사용자 가치와 thin-content 방지에 직접 채택.
- Google Search Central 2026-08-28 Site Reputation Policy — sponsor/creator/community 편집 분리와 SEO inventory farm 방지에 직접 채택.
- FTC Native Advertising — 광고 공개 지속 guardrail.
- Duolingo Friend Streak/social — social context의 반복 참여 효과만 참고하며 punitive shared daily streak는 채택하지 않음.

## 영향
- Acquisition: 얇은 가입페이지가 아니라 지속 가능한 organic/direct/share 진입면.
- Activation: 독자가 먼저 가치를 받은 후 맥락형 체험/가입.
- Retention/comeback: 주간 월드 브리프와 아카이브로 FOMO 없는 재방문 이유.
- Viral: 재산/수익률을 기본 지위신호로 만들지 않는 editorial/owner-first 공유.
- Monetization: 첫 editorial 가치 이후 광고/스폰서, D7/D30·ad-induced churn·contribution margin 동시 평가.
- SEO: URL 수보다 색인품질과 downstream activation/retention 우선.

## 보안·개인정보·악용
High: 공개/비공개 누출, UGC/spotlight 사칭·피싱·doxxing, 가상금융 맥락 sponsor/creator 기만.

최소 보호조건: 명시적 공개범위/동의, public-safe 데이터만 사용, 비공개 잔액/포트폴리오/보안/복구정보 금지, 신고/삭제 준비, 명확한 sponsor disclosure, 새로운 개인화 공개면/UGC 확대 전 별도 runtime QA.

기존 auth/session/RBAC/ledger/admin/privacy 경계는 완화하지 않는다.

## 법규/정책
- WLD/WDX는 virtual/simulated/game-only 유지.
- 현금환전, 실제 투자권유, 수익보장 표현 추가 없음.
- sponsored/native/creator 이해관계는 명확히 공개.
- 맞춤광고, 신규 tracking vendor, 미성년자 targeting, 실질 경제가치 referral, 대규모 UGC 확대는 별도 privacy/legal/trust review.

## 실제 서비스 검증
`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`.

## 반영
- 버전: `v2026.09.13.29`
- 문서-only: 예
- 문서 PR: 없음. 현재 지시에 따라 최신 `main` 직접 반영.
- 이번 성장회차 runtime/DB/API/auth/infra 변경: 없음
- 문서 변경 Test 배포: 불필요

## 다음 성장 우선순위
먼저 `주간 월드 브리프 → 맥락형 탐색 → 의미있는 행동/복귀 → D7` 하나의 좁은 루프를 검증한다. 이후 fraud-adjusted activation, D7/D30, contribution margin이 가장 좋으면서 신뢰를 보존하는 콘텐츠 기둥을 깊게 발전시킨다.