# 작업기록 — 공개 소비자 서사 성장 v2026.09.13.36

기준일: 2026-09-13
범위: 소비자 성장 기획만 수행
배포: 문서-only; Test/Production 배포 불필요

## 확인한 기준자료

- 작성 직전 최신 `main`;
- `docs/planning/PROJECT_PLAN.md`;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- `docs/planning/MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.md`;
- 실제 공개 홈, `/guide`, `/announcements`, 카지노 진입면;
- Discord 최신 공식 정체성 표현 가이드;
- FTC 최신 구독/negative-option 집행 및 정책 자료.

## 최신 main 동기화

작업 시작 시 최신 확인 `main`은 `697e9ceb5c81a7511040bc66e81c0a925407399a` (`ops: prune fully merged branches on main updates v2026.09.13.35`)였다. 확인 시점에 열린 PR은 없었다. 문서 쓰기 직전에도 최신 main을 다시 확인했다.

저장소 운영 변경에서 이미 v2026.09.13.35를 사용했으므로 이번 성장기획은 다음 순서 버전인 **v2026.09.13.36**을 사용한다.

## 발견한 가장 큰 성장 공백

실제 홈과 실제 시작 가이드가 서로 다른 신규유저 이야기를 전달하고 있었다.

홈은 비회원도 활동을 확인하고 로그인 뒤에는 하나씩 시작하라고 안내한다. 반면 가이드는 복리예금, 국채, 대출, 8대 직업, 사업, 주식, 상점, 카지노로 빠르게 확장하며 시세차익·배당·패시브 소득·대표 자본가를 성장의 중심으로 표현한다.

이 차이는 activation 마찰과 브랜드 혼란을 만들고, 가상/game-only 금융 시스템이 정체성·성장·커뮤니티 경험보다 제품의 핵심 약속처럼 오해될 가능성을 키운다.

## 기획 결정

canonical 소비자 서사를 다음으로 통일한다.

`의미 있는 스레드 하나 → 내 것으로 만들기 → 변화 확인 → 다시 이어가기`

첫 가치를 느끼기 위해 전체 경제 시스템을 이해할 필요가 없게 한다.

## 갱신된 소비자 funnel

`공개 약속 → 미리보기 하나 → 관심사 하나 → 맥락형 가입 → 첫 의미 행동 → 연속성 증거 → D1 이어가기 → D3 취향 형성 → D7 진전 이야기 → D14 세계 변화 → D30 열망 선택`

Activation은 로그인 자체가 아니라 의미 행동과 이어질 이유가 함께 생긴 상태로 본다.

## 추가한 실험

1. 정체성/역사 약속 vs 자산/금융 중심 약속;
2. 미리보기 하나 vs 전체 기능 개요;
3. 맥락형 가입 CTA vs 일반 가입 CTA;
4. D7 진전 이야기 vs 잔액/활동량 대시보드;
5. 반복가치 이후 수익화 vs 조기 수익화.

각 실험은 CTR만 보지 않고 retention과 trust guardrail을 함께 본다.

## 보안·악용·개인정보 발견사항

### High — 공개/비공개 정보 누출
사용자 영향: 공개 미리보기·공유·아카이브에서 잔액, 보유자산, 부채, 보안/복구 상태, 숨겨진 소셜그래프 노출.

최소 보호조건: public-safe 필드만 사용, 개인화 이력 기본 비공개, 공개범위 되돌리기 가능, 계정/보안 화면 인증+검색색인 제외.

별도 개발/보안 QA: 신규 공개 개인화 화면 구현 시 필요.

### High — 공유/referral 피싱
사용자 영향: Moneyverse 링크 사칭을 통한 계정/세션 탈취.

최소 보호조건: URL/메시지에 secret/session/private asset 값 금지, 공식 도메인 표시, 자산 손실을 위협하는 로그인 압박 금지.

별도 QA: runtime deep-link 변경 시 필요.

### High — 금융상품 오인 문구 drift
사용자 영향: WLD/WDX 가상예금·주식·사업이 실제 수익 또는 실제 금융능력을 의미한다고 오해.

최소 보호조건: 관련 주장 근처 game-only 고지, 보장수익/패시브 소득 보장 표현 금지, 실제 증권/예금 표현 변경 시 법률 검토.

### Medium — fake activation/referral farming
raw signup/view/share에 의미 있는 WLD/WDX를 연결하지 않는다. retained/fraud-adjusted milestone과 비-P2W 코스메틱·명예 보상을 우선한다.

## 리서치 기록

### 2026-09-13 — Discord Profile Widgets FAQ
유형: 공식 제품 도움말, 2026-09-08 업데이트.
핵심 시사점: 정체성 표현은 사용자가 직접 추가·재배치·삭제할 수 있다.
판단: **직접 채택**. 불투명하고 고정된 persona 추론 대신 사용자 통제형 My Moneyverse 정체성의 근거로 사용.

### 2026-09-13 — FTC Shutterstock 구독 합의
유형: 미국 규제기관 집행, 2026-05.
핵심 시사점: 중요 구독조건 고지, 명시적 동의, 간단한 해지가 필수.
판단: **직접 채택**. 구독 trust guardrail로 반영.

### 2026-09-13 — FTC negative-option rulemaking notice
유형: 미국 규제기관 정책/규칙 검토, 2026-03.
핵심 시사점: 불충분 고지, 비동의 가입, 해지마찰이 계속 문제로 다뤄짐.
판단: **참고**. 수익화/legal review 기준으로 유지.

### 2026-09-13 — Moneyverse 실제 홈/가이드/운영소식
유형: 런타임 소비자 경험 직접 근거.
핵심 시사점: 홈은 점진적 onboarding과 맞지만 가이드는 자산/금융 중심이며, 운영소식은 아직 정기 복귀 콘텐츠 역할을 하지 못함.
판단: **직접 채택**. 이번 공백 선정의 핵심 근거.

## 변경 파일

- `docs/planning/PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`
- `docs/planning/PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.md`
- `docs/changelog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.ko.md`
- `docs/worklog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.md`
- `docs/worklog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.ko.md`

## 런타임 / 테스트 상태

Runtime verification: 가능, 공개 비파괴 화면에서 수행.
런타임 코드 변경: 없음.
DB/API/인증/인프라 변경: 없음.
이번 문서-only 변경에 Test 서버 배포: 불필요.

## 다음 우선순위

다음 좁은 소비자 경로를 검증·구체화한다.

`Home 약속 → 공개 미리보기 하나 → 맥락형 가입 → 첫 의미 행동 → D1 이어가기 → D7 진전 이야기`

이 성장 자동화에서는 백엔드 구현 상세를 늘리지 않는다. 실제 문구·화면·라우팅 변경은 별도 제품/보안/QA 작업으로 분리한다.