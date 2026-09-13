# 변경 기록 — 리텐션·복귀 사다리 v2026.09.13.22

날짜: 2026-09-13
유형: 문서-only 소비자 성장 기획

## 이유

기존 저장소에는 가입 전 활성화, 알림, 시즌, 성장 시스템이 이미 잘 정의되어 있었지만 D1/D3/D7/D14/D30의 복귀 이유가 하나의 생애주기 사다리로 연결되어 있지 않았다. 이번 버전은 개발 아키텍처 확대가 아니라 단계별 리텐션, 복귀 품질, 장기 정체성, 수익화 시점에 집중한다.

## 변경사항

- 영문 `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`와 한국어 대응본 추가.
- D1, D3, D7, D14, D30별 서로 다른 복귀 약속 정의.
- 1~3분, 5~15분, 30분+ 세션 모드 정의.
- 생애주기별 홈 우선순위와 absence-safe comeback journey 추가.
- 신규 사용자부터 프레스티지/유산 사용자까지 aspiration ladder 추가.
- 소셜 공유, 시즌 기대감, 공개 콘텐츠/SEO, 수익화를 리텐션 품질과 연결.
- primary metric과 trust/revenue guardrail을 포함한 실험 5개 추가.
- backend/API 구조를 새로 확장하지 않고 소비자 관점 보안·개인정보·피싱·referral fraud·UGC 위험 검토 추가.

## 검토한 최신 레퍼런스

조사일: 2026-09-13.

- Google Search Central `Creating helpful, reliable, people-first content` — 공식 문서. 공개 콘텐츠가 얇은 SEO/가입 퍼널이 아니라 단독으로 유용해야 한다는 원칙을 직접 채택.
- TradingView `Community trading contests: build your own competition`(2026-08-07) 및 현행 2026 The Leap — 최신 제품 사례. 시뮬레이션 연습 + 커뮤니티 + 공유 가능한 참여 패턴을 참고. 현금상금과 수익률 극대화 리텐션은 채택하지 않음.
- Discord Community Onboarding/현재 도움말 — 신규 사용자의 과부하를 줄이고 관련성이 높은 커뮤니티 맥락을 빠르게 찾게 하는 장기 제품 패턴 참고. 오래된 원문 자체는 최신 시장 근거로 취급하지 않음.

## 보안·신뢰 발견사항

- High: 공유/SEO 공개면에서 공개·비공개 데이터 경계 노출. 최소 조건: 명시적 public-safe 필드만 사용하고 개인 자산/계정/보안/복구 정보는 비공개·색인 제외 유지. 실제 출시 전 별도 런타임 QA 필요.
- High: 복귀/추천 메시지 피싱·사칭. 최소 조건: 메시지에 비밀값/민감 자산 정보 금지, 식별 가능한 안전한 브랜드 목적지, 손실 위협 문구 금지. messaging/deep-link 변경 시 별도 런타임 QA 필요.
- Medium: referral 다계정/fake-signup 악용. raw signup에 의미 있는 경제 보상 금지, retained activation milestone + 비-P2W 보상 우선.
- Medium: UGC 괴롭힘/doxxing 및 분석/광고 과수집. privacy/report/block 준비와 데이터 최소수집 필요.

## 법규·수익·SEO 영향

- WLD/WDX는 계속 virtual/simulated/game-only. 현금환전, 수익보장, 실제 투자 오인 금지.
- 수익화는 반복 가치 이후로 배치하며 매출과 함께 D7/D30, ad-induced churn, 구독취소, 마진을 평가.
- 공개 콘텐츠는 사람에게 실제로 유용해야 하며 개인계정/포트폴리오/보안/관리자 콘텐츠는 검색 노출 대상이 아님.
- 추천/보상 기획은 적용 시 표시·미성년자·개인정보·fraud 검토를 유지.

## Git 정책

현재 지시에 따라 문서-only 기획은 최신 `main`을 재확인한 뒤 별도 문서 PR 없이 `main`에 직접 반영한다. 런타임 코드, DB, API, 인증, 인프라, 운영 설정은 변경하지 않는다.

## 다음 우선순위

주간/월간 리텐션 산출물 루프를 더 깊게 검증한다: 개인 회고 → 선택형 공유 → 비회원 이해 → 양질의 활성화 → D7. 이 과정에서 개인정보 노출과 leaderboard/FOMO 압박을 피한다.