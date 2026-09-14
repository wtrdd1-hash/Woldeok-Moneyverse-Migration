# v2026.09.14.82 — 점진적 복잡도 및 첫 주 성장

날짜: 2026-09-14  
변경 유형: 문서-only  
런타임/코드 변경: 없음

## 추가
- `PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md`와 한국어 대응본을 추가했습니다.
- 기존 `첫 7일 동안 매일 주요 시스템 하나 소개` 기획과 현재 공개 가이드가 첫 방문부터 대부분의 금융·경제·게임 기능을 노출하는 현실 사이의 초기 리텐션 공백을 선택했습니다.
- 달력 중심 기능 노출보다 `첫 가치 → 선택한 core thread → adjacent preview 하나 → 계속/미루기 사용자 선택 → D1/D3 → D7 coherent loop → D14 voluntary breadth → D30 durable history`를 우선 성장모델로 정의했습니다.
- Orientation, core thread, adjacent system, connected loop, voluntary breadth, long-term identity로 이어지는 점진적 복잡도 사다리를 정의했습니다.
- 여러 기능을 많이 열어보는 것을 activation으로 보지 않으며 모든 경제 시스템을 경험해야 onboarding 완료로 보지 않는다고 명시했습니다.
- 기존 원장·인증·보안 계약을 바꾸지 않고 은행, 대출, WDX, 카지노/확률형 surface의 보수적 노출순서를 추가했습니다.
- intent-led vs calendar-led 첫 주, adjacent preview 1개 vs 동등 feature grid, finance-like explain-before-entry, reversible `나중에`, coherent session 종료 뒤 monetization 실험을 추가했습니다.
- 이해도, next-action clarity, 혼란/backtracking, D7 coherent-loop completion, D14 voluntary breadth, D30 durable history KPI를 추가했습니다.
- 피싱/ATO, 민감상태 노출, reward farming, finance/casino 조작, youth-safety, analytics 최소화 guardrail을 추가했습니다.
- day/level/unlock 조합 페이지 대량생성을 금지하고 개인 progression·경제·보안 상태를 검색대상에서 제외하는 SEO 원칙을 유지했습니다.

## 검토 자료
직접 채택:
- Supercell 2026-05-13 `New Collection Levels & Mastery Changes` — 진행 단순화, 보이는 다음 목표, 개인 목표와 보상의 연결.
- Supercell 2026년 6월 업데이트 — 단순화된 connected progression 방향의 교차검증.
- Meta/Threads 2026년 6월 community 업데이트 — visible progress와 자발적 community identity를 user-controlled breadth 참고로 활용.
- Google Search Central people-first/AI-search 가이드 — 저가치 first-week/unlock 페이지 대량생성 금지.
- Naver Search Advisor SEO 기본 가이드 — 한국 검색 최적화를 사용자 가치·명확성 중심으로 유지.

참고:
- Discord Community Onboarding 현행 가이드 — 신규 사용자가 원하는 것을 선택하고 과도한 선택지를 피하며 이후 수정 가능하게 하는 패턴. 오래된 제품 패턴이라 보조 근거로 사용.
- Google Health Coach 2026-05-07 — 모든 정보를 한꺼번에 보여주기보다 개인 목표에 맞춰 필요한 정보를 보여주는 일반 UX 참고.

## Runtime 현실
- 공개 홈과 시작 가이드에 접근 가능했습니다.
- 홈은 WLD/보상을 game-only 가상 데이터라고 명확히 고지합니다.
- 다만 홈 quick link에는 지갑, 미니게임, 가상주식, 상점, 퀘스트, 로비가 함께 노출됩니다.
- 가이드는 `처음에는 하나만`을 권하지만 동시에 예금, 국채, 대출, 직업, 사업, 주식, passive-income 표현, 카지노/미니게임을 초기 제품 설명에 포함합니다.
- 첫날 체크리스트는 남은 WLD를 복리예금에 넣는 것으로 끝나고 성장 로드맵은 자산구간 및 `대표 자본가` 서사를 유지합니다.
- 공개 운영소식은 quiet state인 반면 sponsored placement는 노출됩니다.

## 보안·법적 메모
- 보안 코드나 아키텍처를 변경하지 않았습니다.
- 기존 OAuth/session/RBAC/admin/ledger/market-integrity/probability/privacy 경계가 계속 우선합니다.
- 고위험 성장 제안은 실제 구현 전 별도 security/privacy/fraud/legal QA가 필요합니다.
- 개인정보보호위원회의 2026 COPPA 2.0 요약은 정책 신호로만 보고 한국 현행법이나 확정된 미국 규칙으로 취급하지 않습니다.

## Git/반영 메모
- 작업 시작 및 중간 동기화 확인 시 `main`은 `bedf99608f28198ef12f3ec76b29ce6c2ae3eacb`였습니다.
- 최종 동기화 확인 뒤 최신 `main`에만 fast-forward로 직접 반영합니다.
