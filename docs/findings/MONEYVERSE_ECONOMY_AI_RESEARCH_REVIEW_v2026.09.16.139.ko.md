# Moneyverse 경제 AI 연구 검토 — v2026.09.16.139

날짜: 2026-09-16  
범위: Moneyverse 전통+AI 이중 경제 컨트롤러 기획 근거.  
후보군 목록: `MONEYVERSE_ECONOMY_AI_REFERENCE_CORPUS_v2026.09.16.139.csv`

## 1. 후보군 구축

이번 회차는 모든 자료를 전부 정독했다고 주장하지 않고 대규모 서지 후보군을 만든 뒤 핵심 원문을 심층 검토했다.

- OpenAlex: 15개 주제 검색에서 각 최대 1,000건을 시도했다. 후반 rate limit 전까지 고유 OpenAlex work 8,788건을 확보했다.
- Crossref: 보완 검색 6개에서 원자료 3,000건을 조회했다. DOI 우선, 정규화 제목 보조 중복 제거 후 기존 후보군에 없던 2,961건을 추가했다.
- 최종 중복 제거 후보군: **11,749건**.
- 커밋되는 CSV에는 자료원, record ID/URL, 제목, 연도, DOI, 가능한 경우 인용수, 자료유형을 한 행씩 기록한다.
- CSV 포함은 채택이나 원문 정독을 의미하지 않는다. 폭넓은 후보군이다.

핵심 설계 판단은 검색순위가 아니라 원 논문, 주요 학회, NBER/AEA/PMLR/ACL, 공식 프로젝트 문서와 재현 가능한 구현을 우선한다.

## 2. 자동 주제 분류

제목 패턴으로 후보군을 1차 정리했다. 서로 겹칠 수 있어 합계는 전체건수와 일치하지 않는다.

| 주제 | 후보 건수 |
|---|---:|
| 전통/에이전트 기반 계산경제학 | 1,210 |
| AI/강화학습 정책 | 1,553 |
| LLM/생성형 에이전트 | 272 |
| 시장/주식/미시구조 | 242 |
| 가격/소매/공급망 | 730 |
| 인과 정책평가 | 398 |
| 가상/게임/토큰 경제 | 160 |
| 디지털트윈/강건/제약 제어 | 906 |

전통 ABM 후보의 중앙연도는 2016년, LLM agent 후보는 2024년이었다. 새 AI만 쓰기보다 성숙한 경제·제어 방법을 유지하면서 AI를 병렬 추가해야 한다는 근거가 된다.

## 3. 핵심 채택 근거

Tesfatsion의 ACE, agent-based macroeconomics handbook, Hansen-Sargent 강건제어, Synthetic Difference-in-Differences, Constrained Policy Optimization, Calvano 등의 알고리즘 가격·담합, AI Economist, Generative Agents, EconAgent, Homo Silicus, EconGym, MMO 생성형 ABM, StockAgent, Market-Bench, LLM econometrics framework를 핵심 설계 근거로 채택한다.

## 4. 최종 구조

Moneyverse는 **두 개의 독립 분석/제어 lane을 항상 병렬 실행**한다.

### Lane A — 전통/결정론

회계 항등식, 원장대사, rule-based ABM, 계량적 탄력성/예측모델, 인과추론, 주문장 매칭/주가형성, bounded optimization/MPC, 공개 정책식과 결정론적 안전제약을 담당한다. 모든 학습모델이 장애여도 계속 운영 가능한 기준선·비상운전 계층이다.

### Lane B — AI/학습

LLM 행동 에이전트, 역할별 adapter, 재현 가능한 시뮬레이션 안의 RL/MARL, 이상원인 설명, 반사실 정책생성, 상품/SKU 아이디어, 수요 가설, 적대 에이전트와 다중 에이전트 비판을 담당한다. 탐색범위를 넓히되 잔액·원장·주가·hard constraint의 최종 권한은 갖지 않는다.

## 5. 자동 중재

두 lane은 같은 불변 feature snapshot을 읽고 각각 예측, 불확실성, 정책후보를 출력한다.

- 방향과 크기가 안전 교집합에서 일치하면 저위험 정책은 제한형 자동적용 후보가 된다.
- 방향은 같지만 크기 차이가 크면 보수적 교집합 또는 더 낮은 위험 행동을 택한다.
- 강하게 충돌하면 단순 평균하지 않고 `SHADOW`, `NO_OP`, 사람검토로 내린다.
- AI 장애/stale이면 Lane A가 계속 운영한다.
- 전통 lane이 새 행동패턴을 모델링하지 못해도 AI는 shadow 제안까지만 만들며 실측 검증을 우회하지 않는다.
- 안전·무결성 hard constraint는 두 lane보다 우선한다.

## 6. 연속 제어 루프

`telemetry -> 대사 -> 불변 snapshot -> Lane A + Lane B 병렬 -> 불일치/보정 gate -> Scenario Lab -> 결정론 validator -> shadow/canary/제한형 적용 -> 인과효과 측정 -> 유지/rollback -> 두 lane 재보정`

관측은 매시간 가능하지만 일반 정책 변경은 더 느린 cooldown을 사용한다. 사고/무결성 보호는 별도 빠른 결정론 경로를 사용한다.

## 7. 도메인 적용

- 가상주식: 결정론 주문장/가격엔진이 권위이며 AI는 투자자 행동·이벤트·조작 stress를 만든다.
- 상점가격: 전통 탄력성/제약과 AI 수요가설이 모두 평가되고 구매력 guardrail을 통과해야 자동가격 조정 가능하다.
- 상품추가: AI는 승인된 저위험 cosmetic/non-power variant를 생성할 수 있으나 schema·entitlement·가격·악용·경제영향 validator를 통과한 뒤 Test/제한배포한다.
- 직업/주직업/일일제한: 전통 발행·무결성 임계치가 허용범위를 정하고 AI가 행동을 분석해 적응형 변경을 제안한다. 유한 제한은 한시적·가역적이고 `null = 무제한`으로 자동 완화 가능해야 한다.
- faucet/sink: 원장 분류와 회계사실은 결정론이며 AI는 정책대안과 콘텐츠 대응을 탐색한다.

## 8. 학습 전략

처음부터 다수 foundation model을 새로 만들지 않는다. 공유 base model + 역할/도구/데이터 view 분리로 시작하고 Moneyverse 행동·실험·replay 데이터셋을 먼저 쌓는다. 충분한 데이터가 생긴 역할만 SFT/LoRA adapter로 분화하고 이후 offline RL/preference optimization을 재현 가능한 시뮬레이터 안에서 검토한다. 승격 모델은 registry version, holdout 평가, calibration, rollback을 필수로 한다.

## 9. 증거 기준

11,749건 후보군은 범위를 넓히기 위한 것이지 정확성을 보장하지 않는다. 운영정책은 직접 관련된 핵심 원문, 현재 Moneyverse 런타임 데이터, 재현 가능한 시뮬레이션, 적용 후 인과효과 측정을 근거로 해야 한다. 논문 수나 에이전트 투표가 원장 진실과 실제 사용자 결과를 대신하지 않는다.
