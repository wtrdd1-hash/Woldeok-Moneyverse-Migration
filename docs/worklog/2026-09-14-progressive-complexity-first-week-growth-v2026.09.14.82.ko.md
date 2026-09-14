# 작업기록 — 점진적 복잡도 및 첫 주 성장 v2026.09.14.82

날짜: 2026-09-14  
저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`  
변경 유형: 문서-only

## 검토 입력
- 작업 시작 및 중간 최신 `main`: `bedf99608f28198ef12f3ec76b29ce6c2ae3eacb`;
- `PROJECT_PLAN.md` Living Project Plan;
- `PRODUCT_GROWTH_PLAN.md`;
- `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md`;
- `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`;
- `SEASON_SYSTEM_SPEC.md`;
- 현재 Production 공개 홈, `/guide`, `/announcements`;
- 최신 공식 제품·검색·개인정보·소비자보호 자료.

## 발견한 가장 큰 공백
첫 가치와 리텐션 기획은 강해졌지만 복잡도 확대 순서가 일관되지 않습니다. 기존 성장계획은 첫 주에 매일 주요 시스템 하나를 소개하고, 공개 가이드는 초기 여정에서 거의 전체 경제 stack을 설명합니다. 이 구조는 이해도와 retained value보다 기능 노출을 최적화할 위험이 있습니다.

## 결정
`PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md`와 한국어 대응본을 추가했습니다.

선택한 lifecycle:
`첫 가치 → 선택한 core thread → 결과 → 설명 가능한 adjacent preview 하나 → 계속/미루기 → D1 same-thread → D3 coherent progress → D7 coherent loop → D14 voluntary breadth → D30 durable history`.

이번 회차에서는 기능 잠금 코드, DB 계약, API, scheduler, 인증 변경, 보안 아키텍처를 추가하지 않았습니다.

## 소비자 기획 변경
- 기능이 존재하는 것과 지금 추천해야 하는 것을 분리;
- 첫 주의 중심을 사용자가 고른 core thread 하나로 설정;
- adjacent system은 한 번에 하나, 한 문장으로 관계를 설명할 수 있을 때만 추천;
- D7에는 넓고 얕은 기능 체험보다 coherent understanding을 우선;
- 자발적 breadth는 주로 D14+부터 강화;
- 은행/대출/WDX/카지노를 mandatory onboarding milestone에서 제외;
- 세션 깊이는 사용자 선택과 unlimited-by-default 원칙 유지;
- 첫 주 학습/종료 구간을 interruptive monetization에서 보호.

## 추가 실험
1. intent-led first week vs calendar-led system tour;
2. adjacent preview 1개 vs 동등 feature grid;
3. finance-like explain-before-entry vs direct shortcut;
4. reversible `나중에` vs persistent recommendation;
5. coherent session closure 이후 monetization vs 이전 monetization.

각 실험은 downstream retention과 trust/safety guardrail을 포함하며, 가능하면 대규모 확대 전 D30까지 확인합니다.

## KPI 변경
이해도, next-action clarity, confusion/backtracking, 첫 가치 전 열어본 시스템 수, D1 exact-thread continuation, D3 coherent progress, adjacent-preview accept/defer/hide, D7 coherent-loop completion, D14 voluntary breadth, D30 durable history, shallow-feature-sampling rate를 추가했습니다.

기존 visitor→signup, activation, TTFV, D1/D3/D7/D14/D30, WAU/MAU, CAC, LTV, ARPU/ARPDAU, ad-induced churn, cohort revenue KPI는 유지합니다.

## 보안·개인정보·악용 점검
HIGH:
- 가짜 progression/unlock 메시지 피싱 및 ATO;
- private progression/economy/security 상태 노출;
- tutorial/unlock/referral reward farming;
- finance/casino 추천 조작 및 WDX 담합;
- 아동·청소년에게 부적절한 금융/확률 압박 노출.

MEDIUM:
- cross-feature analytics 과수집.

최소조건은 canonical-domain messaging, personalized progression 기본 비공개, public-safe allowlist, 링크/analytics에 secret 금지, raw unlock/open/recommendation에 의미 있는 WLD/WDX 지급 금지, 기존 시장/확률/연령/법적 경계 유지입니다.

보안 코드는 변경하지 않았습니다.

## Research note
직접 채택:
- Supercell 2026-05-13 Collection Levels/Mastery 변경: 진행 복잡도와 개인 목표와 동떨어진 보상을 문제로 지적하고 다음 목표가 명확한 connected loop를 지향.
- Supercell 2026년 6월 업데이트: progression 단순화 방향 교차검증.
- Meta/Threads 2026년 6월 community 업데이트: visible voluntary progress/identity 패턴 참고.
- Google Search Central people-first/AI-search 및 Naver Search Advisor: 저가치 unlock/day/level SEO 페이지 대량생성 금지 근거.

참고:
- Discord Community Onboarding 현행 FAQ: 적은 선택지, 사용자 관심 선택, 이후 재선택.
- Google Health Coach 2026-05-07: 가능한 모든 정보보다 개인 목표에 맞는 정보 노출.

법·정책 교차검토:
- FTC Genshin 사건은 게임·청소년·확률형 UX 관련 참고 선례;
- FTC Genesis Tech 2026-06은 명확한 구독조건과 쉬운 취소 중요성 재확인;
- 개인정보보호위원회 2026 youth-privacy 정책 활동은 출시시점 검토 신호;
- COPPA 2.0 국외동향은 정책맥락으로만 기록하고 한국 현행법이나 확정된 미국 규칙으로 취급하지 않음.

## Runtime Product Reality Audit
검증: 공개 웹 surface 확인 가능.

관찰:
- 홈은 WLD/보상을 game-only 가상 데이터라고 명확히 고지;
- quick link에는 지갑, 미니게임, 거래소, 상점, 퀘스트, 로비가 함께 노출;
- 가이드는 `하나부터 시작`을 말하지만 초기 설명에 예금, 국채, 대출, 직업, 사업, 주식, passive-income 표현, 카지노/미니게임까지 포함;
- 첫날 체크리스트는 복리예금 행동으로 끝남;
- 자산구간 및 `대표 자본가` 로드맵 유지;
- 운영소식은 quiet state인데 sponsored placement 노출.

결론: progressive-complexity loop는 Production에서 아직 검증되지 않은 소비자 성장 가설입니다.

## Git 상태
작업 시작/중간 `main`: `bedf99608f28198ef12f3ec76b29ce6c2ae3eacb`.
커밋/ref update 직전에 최신 `main`을 다시 확인하고 non-force fast-forward로만 반영합니다.

## 변경 예정 파일
- `docs/planning/PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md`
- `docs/planning/PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.md`
- `docs/changelog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.ko.md`
- `docs/worklog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.md`
- `docs/worklog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.ko.md`

배포: 문서-only이므로 이번 변경 자체에는 Test/Production 런타임 배포가 필요하지 않습니다.
