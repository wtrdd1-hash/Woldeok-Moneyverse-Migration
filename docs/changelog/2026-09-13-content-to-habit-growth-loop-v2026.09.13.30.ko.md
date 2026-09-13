# v2026.09.13.30 — 콘텐츠→습관 성장 루프

## 변경 이유
기존 성장 스택은 가입 전 가치, D1~D30 복귀 이유, 리텐션→바이럴, 반복 브랜드/콘텐츠까지 다뤘다. 남은 가장 큰 공백은 유용한 콘텐츠 방문을 D7까지 이어지는 개인 스레드로 전환하지 못하고 일회성 읽기/클릭으로 끝날 수 있다는 점이었다.

## 추가
- 영문 canonical + 한국어 `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC`.
- 핵심 루프: `유용한 콘텐츠 → 이해 → 관련 행동 → 개인 스레드 저장 → 다음 목표 → D1 → D3 → D7`.
- 고의도 공개페이지당 핵심 이어하기 1개 원칙.
- 가입 전 30~90초 가치 체험 패턴.
- 가입을 일반 gate가 아니라 이미 느낀 가치를 저장/이어가는 이유로 재정의.
- 유입 의도 보존 첫 세션과 D1 연속성, D3 정체성 형성, D7 자기진전 회고 약속.
- 콘텐츠 유입 코호트, 저장 스레드 이어가기, D7 회고, fraud-adjusted acquisition, 신뢰 및 contribution-margin KPI.
- 유입의도, 맥락형 가입문구, 인지부하, 자기진전 회고, 가치 우선 스폰서십에 대한 5개 실험.

## 보안·개인정보·악용
- High: deep-link/피싱, 공개/비공개 개인화 누출, referral/bot 보상 파밍.
- Medium: 분석/광고 과수집, UGC/커뮤니티 악용.
- 기존 인증/세션/RBAC/원장/관리자/개인정보/Account Security Center 경계 유지.
- 페이지뷰·공유·raw signup에 의미 있는 WLD/WDX 보상 금지.
- 새 인증 deep-link, 개인화 공개면, 경제적 referral 보상은 실제 구현 전 별도 보안/QA 필요.

## 최신 조사 — 2026-09-13
직접채택/방향 근거:
- Discord 2026-08-20 게임 발견·소셜 플레이 업데이트: acquisition 클릭보다 실제 플레이 행동·리텐션 연결을 중시.
- Discord 2026-03-09 게임 성장 업데이트: 소셜 맥락이 참여를 깊게 할 수 있다는 방향 근거이며 Moneyverse 성과 예측값으로 사용하지 않음.
- Google Search Central 2026-02-05 Discover core update: 선정성 감소, 원본성·깊이·시의성 강화.
- Google Search Central 최신 people-first 가이드: 독자 목적 충족과 신뢰 우선, 금융 인접 주제에서 특히 중요.
- Naver Search Advisor 최신 콘텐츠/스팸 가이드: 실질적 사용자 가치 우선, 얇은 대량생성·조작·오해유발·트래픽 부풀리기 배제.
참고만:
- Duolingo Friend Streak: 소셜 반복효과는 참고하되 공유 일일연속 손실은 Moneyverse 기본 메커닉으로 채택하지 않음.

## SEO·바이럴·수익 영향
- SEO 성공경로를 `organic visit → 이해 → 관련 샘플 → activation → D7/D30 → contribution margin`까지 확장.
- 바이럴 성공은 raw invite가 아니라 `공유 맥락 → 참여 방문 → 첫 가치 → activation → D7`.
- 약속한 가치 이후 수익화를 배치하고 단기매출 상승이 리텐션/신뢰를 악화시키면 폐기.

## 법규·정책
- WLD/WDX는 계속 virtual/simulated/game-only.
- 실제 투자권유·수익보장·예금·현금환전·실제 증권 암시 금지.
- 한국/미국 스폰서·크리에이터 관계 명확 표시.
- 맞춤광고, 신규 추적업체, 미성년자 타기팅, 경제가치 referral, 공개 UGC 확대는 별도 privacy/legal/trust review.

## Runtime verification
`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`.

## 변경 유형
문서-only. 런타임, DB, API, 인증, 인프라, 운영설정 변경 없음. 이번 문서 변경은 테스트 서버 배포 불필요.

## main 정책
현재 사용자 지시에 따라 최신 `main`에 직접 작성했으며 문서 PR은 만들지 않았다.