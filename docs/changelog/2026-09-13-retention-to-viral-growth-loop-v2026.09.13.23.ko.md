# 변경 기록 — 리텐션→바이럴 성장 루프 v2026.09.13.23

날짜: 2026-09-13
유형: 문서-only 소비자 성장 기획

## 이유

현재 기획은 가입 전 활성화와 D1→D30 복귀 사다리는 정의하지만, 리텐션에서 생긴 사용자 가치가 고품질 신규유입으로 연결되는 구조는 아직 약했다. 단순 추천 보상은 스팸·다계정·가짜가입 압력을 키우고 raw registration에 과도한 가치를 줄 수 있다.

## 변경사항

- 영문 canonical `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md` 추가.
- 한국어 대응본 `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.ko.md` 추가.
- `의미 있는 진전 → owner-first 산출물 → 선택적 공유 → 가치 우선 공개 랜딩 → 가입/활성화 → D7` 루프 정의.
- 재산/수익/순위만 보여주는 카드보다 주간·월간 회고, 컬렉션, 직업, 공간, 시즌, 학습, 커뮤니티 산출물을 우선.
- D1–D3, D7, D14, D30+ 생애주기별 공유 기회 정의.
- 공유 콘텐츠를 가입벽으로 즉시 가리지 않는 비회원용 value-first 랜딩 정의.
- 추천을 유용한 산출물 공유보다 보조수단으로 두고 raw signup에 의미있는 경제 보상을 주지 않도록 규정.
- 스폰서십/material connection 표시를 포함한 creator/community 협업 원칙 추가.
- SEO 품질 기준 추가: 충분한 내용과 명시적 공개 의도가 있는 아카이브는 색인 후보, 얇은 자동생성 회고/referral/비공개 금융게임 페이지는 원칙적으로 noindex/비공개.
- 공유/수신자 가치를 해치지 않는 수익화 원칙과 금융게임 우위 판매 금지 명시.
- 사적 데이터 노출, 피싱/사칭, referral farming, UGC 괴롭힘, creator deception, 분석/광고 과수집 위험 검토 추가.
- 리텐션, 공유 품질, 바이럴 효율, 브랜드/콘텐츠, 수익 품질, 신뢰 guardrail KPI 추가.
- owner-first 회고, story landing vs signup wall, 자기진전 vs 재산/랭크 공유, retained milestone 추천 보상, 고품질 SEO 선별색인 등 5개 실험 추가.

## 최신 외부자료 검토

조사일: 2026-09-13.

- Spotify 2026 Investor Day 및 2025 Wrapped 공식 자료: 개인화 회고가 사용자 가치이면서 문화적 공유·획득·브랜드 표면이 될 수 있는 패턴을 직접 참고.
- Discord GDC 2026 및 2026년 8월 소셜/발견 업데이트: social context가 플레이 빈도와 발견을 강화할 수 있다는 방향성 근거로 사용.
- TradingView 2026 커뮤니티 paper-trading contest: 시뮬레이션 학습이 creator/community 콘텐츠가 될 수 있다는 참고. 현금상금·수익률-only 소셜순위는 채택하지 않음.
- Google Search Central 최신 Search Appearance/ProfilePage 및 2026년 8월 Site Reputation Policy: 공개 creator/community 표면은 충분한 내용과 정확성이 있어야 하고 도메인 평판을 이용한 콘텐츠 양산을 피해야 함.
- Naver Search Advisor 최신 sitemap/RSS 및 URL 검사: 얇은 URL 수보다 의도적 공개 콘텐츠와 실제 색인 품질 확인을 우선.
- FTC 리뷰/추천 가이드와 2025~2026 집행: 특정 긍정 의견을 조건으로 인센티브를 주지 않고 material connection/인센티브를 명확히 공개.

## 보안/개인정보 영향

High 위험:
1. 비공개 잔액·포트폴리오·계정/보안·소셜 데이터의 의도치 않은 공개/색인;
2. Moneyverse 공유/추천/보상 목적지를 사칭한 피싱;
3. referral farming 및 다계정 보상 악용.

최소 보호조건을 문서화했다. 실제 보안 코드수정은 이번 작업 범위가 아니며 관련 공개 기능 출시 전 별도 개발/QA가 필요하다.

## 법규/소비자 영향

- WLD/WDX는 계속 virtual/simulated/game-only.
- 실제 투자수익, 현금환전, 수익보장 표현을 추가하지 않음.
- creator sponsor/incentive 관계는 필요한 경우 명확한 공개 필요.
- 맞춤광고, 미성년자, 새 추적/주소록 수집, 공개 UGC 확대는 별도 privacy/legal/trust 검토 필요.

## SEO 영향

충분한 공개 아카이브, 컬렉션/lore/시즌/커뮤니티 회고, 독창적 교육 콘텐츠를 우선한다. 얇은 자동생성 회고 URL, 비공개 금융게임 페이지, referral/reward 페이지, 민감 계정 화면은 SEO 자산으로 취급하지 않는다.

## 수익 영향

반복가치 이후 프로필/공간/아카이브/쇼케이스 코스메틱과 광고제거 같은 표현 중심 수익화를 연결할 수 있다. 성공은 광고노출보다 D7/D30, 수신자 품질, 구독전환, ad-induced churn, LTV, contribution margin으로 평가한다.

## 런타임

`https://easy-scraping.com`은 HTTP 530으로 확인되어 `runtime verification unavailable`이다.

## 반영

- 버전: `v2026.09.13.23`
- 변경유형: 문서-only
- 반영 브랜치: 현재 문서변경 지시에 따라 `main`
- 별도 문서 PR: 없음
- 테스트서버 배포: 불필요
- 런타임 코드/DB/API/인프라 변경: 없음

## 다음 성장 우선순위

비회원과 휴면 사용자가 플레이하지 않는 날에도 다시 찾아올 이유를 만드는 **정기 브랜드/콘텐츠 cadence**를 설계하고, 이를 얇은 SEO 양산이 아니라 activation→D7/D30으로 연결한다.
