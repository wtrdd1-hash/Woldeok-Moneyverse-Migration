# 제품 성장 작업 기록 — v2026.09.13.22

날짜: 2026-09-13
집중: D1–D30 리텐션·복귀 사다리
변경 유형: 문서-only

## 시작 상태

- 기획 직전 최신 `main`을 다시 확인했다.
- 시작/중간 main SHA: `0b149a8c6cfef9cc17fb9e3af8f26a79b316162d`.
- `PRODUCT_GROWTH_PLAN.md`, 최신 가입 전 활성화 기획, 소비자 성장과 관련된 알림/복귀·시즌·보안/개인정보·경제 문서를 다시 읽었다.
- 실제 서비스는 이번 회차에도 `https://easy-scraping.com`이 HTTP 530으로 정상 확인되지 않아 runtime verification unavailable 상태다.
- 현재 지시에 따라 구현 상세기획은 중단했으며 DB/API/인증/backend 아키텍처를 새로 확장하지 않았다.

## 공백 분석

7개 성장 질문을 다시 검토했다. 직전 회차에서 1~3번, 즉 왜 방문하고 가입 전 무엇을 이해하며 왜 가입하는지는 크게 보강됐다.

이번에 가장 큰 공백은 4번과 6번이었다. 활성화한 사용자가 D1/D3/D7/D14/D30에 각각 왜 돌아오는지, 그리고 어떤 정체성·기록이 장기적으로 남게 하는지가 하나의 사다리로 연결되어 있지 않았다.

기존 문서에는 일일/주간/시즌 루프, 주간 회고, comeback mission, 컬렉션, 소셜 기능이 있지만 날짜별 복귀 약속이 분명한 생애주기 서사는 부족했다.

## 조사

조사일: 2026-09-13.

- Google Search Central `Creating helpful, reliable, people-first content` — 공식 문서. 공개 콘텐츠가 가입을 위한 얇은 통로가 아니라 자체로 유용해야 한다는 원칙을 retention형 공개 콘텐츠에 직접 적용.
- TradingView `Community trading contests: build your own competition`(2026-08-07) 및 현행 2026 The Leap — 최신 제품 사례. 시뮬레이션 연습과 커뮤니티 참여·공유 경험의 연결을 참고. 현금상금·수익률 극대화·위험추구는 Moneyverse에 채택하지 않음.
- Discord Community Onboarding/현재 도움말 — 신규 사용자의 과부하를 줄이고 관련성이 높은 커뮤니티 맥락으로 안내하는 장기 제품 패턴 참고. 오래된 게시물 자체는 최신 시장 근거로 취급하지 않음.

## 제품 결정

영문/한국어 `RETENTION_RETURN_LADDER_GROWTH_SPEC` v2026.09.13.22를 추가했다.

핵심 결정:
- D1 = 첫 세션 관심사의 연속성;
- D3 = 취향과 정체성 형성;
- D7 = 자기진전 회고와 다음 주 방향;
- D14 = 세계/커뮤니티 연속성;
- D30 = 개인 아카이브, 기록, 미완성 aspiration;
- 쉬었다고 불이익을 주지 않으며 punitive streak reset과 “놓친 보상” 압박을 피함;
- 1~3분, 5~15분, 30분+ 세션이 공존;
- 장기 aspiration은 WLD 단순축적보다 숙련·수집·표현·공간·아카이브·커뮤니티 프로젝트·명예로 이동;
- 수익화는 첫 가치 전보다 반복 가치 이후를 우선;
- 공개 콘텐츠를 acquisition뿐 아니라 재방문 surface로도 활용.

## 추가 실험

1. D1 관심사 이어하기 카드 vs 일반 홈.
2. 자기진전형 주간 회고 vs leaderboard-first 회고.
3. absence-safe 중립 복귀 브리핑 vs 보상/FOMO 강조 문구.
4. 공유형 주간 성장 스토리 vs 일반 초대 링크.
5. 반복 가치 이전 방해형 수익화 억제 vs 현재 가능한 노출 시점.

모든 실험은 CTR/open rate만이 아니라 downstream retention/revenue와 trust guardrail을 같이 본다.

## 보안·개인정보·악용 검토

- High: 공유/SEO 공개면의 공개·비공개 경계 누출. 영향은 스토킹, 피싱, 타깃 계정 공격. 최소 조건은 public-safe allowlist 데이터만 사용하고 계정/보안/복구/개인자산은 비공개·색인 제외 유지. 실제 출시 전 별도 런타임 QA 필요.
- High: comeback/referral 메시지 피싱·사칭. 최소 조건은 비밀값·민감 자산정보 금지, 안전하고 식별 가능한 브랜드 목적지, 계정/자산 손실 위협 문구 금지. 실제 messaging/deep-link 변경 시 별도 런타임 QA 필요.
- Medium: fake-signup/referral 다계정 악용. raw registration에 의미 있는 경제보상을 주지 않고 retained activation milestone + 비-P2W 보상 우선.
- Medium: 공개 social/UGC 괴롭힘·doxxing. 확장 전 privacy, block/report, moderation 준비 필요.
- Medium: 리텐션/광고 분석 과수집. 세분화를 위해 credentials, token, 비공개 자산정보, 불필요 식별자를 수집하지 않음.

실제 보안 코드는 수정하지 않았다.

## 법규·수익·SEO 영향

- WLD/WDX는 계속 virtual/simulated/game-only. 현금가치, 수익보장, 예금/투자상품 오인 요소를 추가하지 않음.
- 수익화는 ARPU/ARPDAU와 함께 D7/D30, ad-induced churn, 취소율, LTV/CAC, contribution margin으로 평가.
- SEO/콘텐츠는 people-first 원칙 유지. 개인계정/포트폴리오/보안/관리자 페이지는 공개 검색 대상이 아님.
- 추천/공유/인센티브는 개인정보·미성년자·표시·fraud 검토를 유지.

## Git 반영

현재 지시에 따라 문서-only 기획 변경은 최신 `main`을 중간에 다시 확인한 뒤 별도 문서 PR 없이 `main`에 직접 반영한다. 런타임 코드, DB, API, 인증, 인프라, 운영 설정은 변경하지 않는다. 문서-only이므로 테스트 서버 배포는 필요하지 않다.

## 다음 성장 우선순위

주간/월간 리텐션 산출물 루프를 더 깊게 설계·검증한다. `개인 성장 회고 → 선택형 공유 → 비회원 이해 → 양질의 활성화 → D7`이 실제로 이어지는지 확인하면서 개인정보 노출과 ranking/FOMO 압박을 피한다.