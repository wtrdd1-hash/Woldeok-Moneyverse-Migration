# 월덕 머니버스 — 경제 핵심 논문-기획 매핑

> 버전: v2026.09.23.401
> 상태: 권위 연구-설계 연결 문서
> 영문 기준: [ECONOMY_RESEARCH_PAPER_MAP.md](ECONOMY_RESEARCH_PAPER_MAP.md)

## 0. 목적

대규모 후보군과 별도로, 실제 기획판단에 사용하는 고신뢰 핵심 논문을 명시하고 각 논문의 결과를 Moneyverse 설계 결정에 직접 연결한다. 각 논문은 채택한 시사점, 채택하지 않은 가정, 검증 KPI를 함께 기록한다.

## 1. Axtell & Farmer (2025) — Agent-Based Modeling in Economics and Finance

출처: Journal of Economic Literature 63(1), 197–287. DOI: 10.1257/jel.20221319.

채택 근거: ABM은 대표행위자 모형이 놓치는 이질적 행동과 시장동학을 표현할 수 있지만 모델 구축·검증 자체가 어렵다.

Moneyverse 적용:
- ABM은 stress test, 시장충격, 시스템 리스크, 정책탐색에 사용한다.
- 원장 사실·회계항등식·hard safety limit·정산규칙은 결정론 계층이 유지한다.
- 실제 코호트·replay 데이터로 보정한다.
- ABM 기반 정책은 sensitivity analysis를 통과해야 한다.

미채택: ABM 출력을 경제의 사실이나 자동 권위결정으로 보지 않는다.

KPI: 재현성, calibration error, sensitivity 범위, 실제 적용 후 관측치와의 divergence.
## 2. Kaplan, Moll & Violante (2018) — Monetary Policy According to HANK

출처: American Economic Review 108(3), 697–743. DOI: 10.1257/aer.20160042.

채택 근거: 유동성·자산·한계소비성향이 다른 집단은 동일 정책에도 서로 다르게 반응하며 간접 일반균형 효과가 클 수 있다.

Moneyverse 적용:
- 신규·중간·고소득·고자산·휴면복귀 유저를 분리한다.
- 코호트별 구매력·잔액변화를 계산한다.
- reward/sink 변경 시 핵심바스켓 구매력을 코호트별로 검증한다.
- 전체 평균잔액 하나로 튜닝하지 않는다.

미채택: 현실의 금리 전달경로를 게임경제에 그대로 복사하지 않는다.

KPI: 코호트별 CPI/바스켓, 유동잔액 분위수, 소득 분위수, 구매전환율, 정책 후 분포이동.

## 3. Kaplan & Violante (2018) — Microeconomic Heterogeneity and Macroeconomic Shocks

출처: Journal of Economic Perspectives 32(3), 167–194.

채택 근거: 미시적 이질성이 거시충격 전달을 크게 바꿀 수 있다.

Moneyverse 적용:
- 이벤트 대량보상, 복귀캠페인, 휴면잔액 활성화, 주식 이벤트 이익을 코호트별로 stress test한다.
- rollout/rollback threshold에 분포영향을 포함한다.

KPI: 코호트별 충격반응, 잔액감소, 가격반응, sink 이용률, 자산집중도.
## 4. Zheng et al. (2020/2021) — The AI Economist

출처: arXiv:2004.13332, arXiv:2108.02755.

채택 근거: 정책설계자와 경제주체가 함께 적응하는 이중 RL 시뮬레이션으로 비직관적 정책과 gaming behavior를 탐색할 수 있다.

Moneyverse 적용:
- 보상, 수수료, 세금형 sink, subsidy 정책을 2-level simulation으로 시험한다.
- 정책을 악용하는 adversarial/gaming agent를 포함한다.
- 학습정책을 결정론 baseline과 비교한다.
- AI 출력은 제한형 제안이며 원장을 직접 변경하지 않는다.

미채택: 논문의 equality/productivity welfare 목적함수를 Moneyverse의 목적함수로 그대로 사용하지 않는다.

KPI: baseline 대비 성능, gaming 내성, 코호트별 welfare proxy, 정책안정성, rollback 성공률.

## 5. Atashbar & Shi (2022) — Deep Reinforcement Learning in Macroeconomics

출처: IMF Working Paper 2022/259. DOI: 10.5089/9798400224713.001.

채택 근거: DRL은 복잡하고 비정상적인 경제환경에 유용하지만 environment·reward 설계와 안정성·해석가능성 문제가 있다.

Moneyverse 적용:
- RL은 shadow/simulation lane에 유지한다.
- action space는 범위제한·버전관리한다.
- reward function에 인플레이션, 구매력, 집중도, abuse, 안정성 penalty를 넣는다.
- 모든 정책 후보는 결정론 validator와 replay gate를 통과한다.

KPI: out-of-sample 안정성, 행동상한 위반, reward weight sensitivity, 재현성.
## 6. Atashbar & Shi (2023) — AI and Macroeconomic Modeling: DRL in an RBC Model

출처: IMF Working Paper 2023/040. DOI: 10.5089/9798400235252.001.

채택 근거: DRL 경제 에이전트의 학습품질은 환경구조와 stochasticity에 크게 의존한다.

Moneyverse 적용:
- 학습형 시나리오와 별개로 결정론 benchmark를 유지한다.
- 동일 정책을 deterministic/stochastic shock 양쪽에서 시험한다.
- 특정 simulator 설정에서만 좋은 정책은 기각한다.

KPI: benchmark regret, stochastic stress 성능, seed 간 분산, policy robustness.

## 7. Atashbar (2024) — Reinforcement Learning from Experience Feedback

출처: IMF Working Paper 2024/114. DOI: 10.5089/9798400277320.001.

채택 근거: 과거 정책경험을 정책학습의 피드백으로 사용할 수 있다.

Moneyverse 적용:
- policy version과 telemetry window 기준으로 정책결과 memory를 유지한다.
- 성공·회귀·rollback 기록을 AI 추천 context에 넣는다.
- 과거 요약이 canonical ledger evidence를 덮어쓰지 못하게 한다.

KPI: 추천 일관성, 동일 회귀 재발률, 근거 추적성.
## 8. Hogan-Hennessy, Xenopoulos & Silva (2022) — Market Interventions in a Large-Scale Virtual Economy

출처: arXiv:2210.07970.

채택 근거: Old School RuneScape에서 거래세와 item sink는 서로 다른 효과를 냈고, item sink는 거래량을 무너뜨리지 않으면서 고급재 가격상승과 연결될 수 있었다.

Moneyverse 적용:
- sink는 총소각량이 아니라 품목군별 효과를 본다.
- 가격·거래량·희소성·대체수요·집중도를 같이 본다.
- 큰 sink 변경은 causal/quasi-experimental 평가를 우선한다.
- "더 많이 소각했으니 성공"으로 판정하지 않는다.

KPI: category CPI, item-volume elasticity, control cohort 비교, substitution flow, 자산코호트별 효과.

## 9. Calvano et al. (2020) — Artificial Intelligence, Algorithmic Pricing, and Collusion

출처: American Economic Review 110(10), 3267–3297. DOI: 10.1257/aer.20190623.

채택 근거: 반복 가격경쟁에서 Q-learning 가격에이전트가 명시적 통신 없이 초경쟁적 가격을 학습할 수 있었다.

Moneyverse 적용:
- 자동가격 시스템은 매출만 최적화하지 못한다.
- 가격변경 상한, 경쟁·공정성 constraint, collusion-risk telemetry를 둔다.
- 결정론 reference price와 구매력 guardrail을 유지한다.
- 중요한 가격체계 변경은 사람 승인을 요구한다.

KPI: 가격분산, markup drift, 에이전트 간 동기화, 구매력 regression, rollback trigger.
## 10. Meylahn & Schinkel (2026) — Artificial Collusion

출처: Management Science, 2026 online publication. DOI: 10.1287/mnsc.2024.08557.

채택 근거: Q-learning의 초경쟁적 가격이 항상 현실적 의미의 자율담합을 뜻하는 것은 아니므로 메커니즘을 구분해야 한다.

Moneyverse 적용:
- 가격동조와 실제 담합 메커니즘을 구분한다.
- 보수적 가격 safeguard는 유지하되 모든 동조를 담합으로 자동분류하지 않는다.
- 제재성 자동조치는 설명 가능한 근거를 요구한다.

KPI: 인과·메커니즘 근거, 동조 지속성, 외생충격 반응, false-positive 검토율.

## 11. 연구-정책 연결 규칙

중요 경제정책 PR/기획 delta는 반드시 근거 논문, 채택한 시사점, 채택하지 않은 가정, 필요한 Moneyverse telemetry, rollback 조건을 기록한다. 단순 인용만으로는 부족하다.

논문은 simulation hypothesis나 모니터링 요구사항의 근거가 될 수 있지만, 그 자체가 Production 파라미터 값을 승인하지는 않는다.
