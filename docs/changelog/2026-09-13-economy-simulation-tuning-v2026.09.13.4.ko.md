# 경제 시뮬레이션 및 동적 소비처 조정 v2026.09.13.4

## 변경 이유

Economy Sinks 명세가 30/90/180일 인플레이션 모델과 동적 소비처 조정 playbook을 미완성 후속작업으로 직접 지정하고 있었다. 현재 PR #189의 Economy Scenario Lab은 유용한 읽기 전용 예측기지만 코호트, 자산집중, 가격탄력성, 악용 데이터 오염, rollout/rollback 정책은 의도적으로 다루지 않는다.

## 변경사항

- `ECONOMY_SIMULATION_TUNING_SPEC.md` 및 한국어 대응본 추가.
- 30/90/180일 표준 기간과 baseline/growth/sink expansion/reward pressure/high-wealth/low-engagement/abuse 시나리오 정의.
- `faucet`, `hard_sink`, `transfer`, `converter`, `hold`, treasury 회계 의미 표준화.
- 평균/중앙/P90/P95/P99 잔액, 상위 1%/10% 점유율, 소비처 집중도, 코호트별 구매일수, 보호한도 발동률, 한계보상 적용률, 오탐률을 필수 지표로 지정.
- GREEN/AMBER/RED 운영 트리거를 정의하되 사용자 하드캡으로 전환하지 않도록 명시.
- 자발적 소비처 확대, 발견성, 활동연동 서비스비, 명예 가격곡선, 한계보상 감소를 좁은 무결성 제한보다 먼저 적용하는 조정순서 정의.
- 버전형 운영 가드레일, 탄력성 실험, rollout/rollback, 향후 DB/API/read-model, 반응형 관리자 UX와 접근성 요구사항 추가.
- PR #189의 읽기전용 Economy Scenario Lab과 기획계약을 명확히 연결했으며 실제 정책 쓰기나 자동 self-tuning은 허용하지 않음.

## 최신 조사 — 2026-09-13

- Microsoft PlayFab Economy V2 공식 문서(2026): 멱등성, transaction history, 고동시성 설계 및 플랫폼 안전 제한과 게임 규칙 분리에 대한 근거로 채택.
- Unity Remote Config / Game Overrides 공식 문서(2026): 환경별/버전별 LiveOps config, 타깃 override, 측정 및 가역적 조정 패턴 근거로 채택.
- Unity Economy 서비스 상태 공식 문서: 참고만 함. Moneyverse는 Unity Economy에 의존하지 않음.

## 실제 서비스 검증

가용 외부 경로에서 `https://easy-scraping.com`이 HTTP 530을 반환했다. Runtime Product Reality Audit은 계속 `runtime verification unavailable`이며 운영상태를 추정하지 않았다.

## 수익 / 법규 / SEO 영향

- 수익: P2W 또는 유료 WLD/주식/랭킹 우위를 추가하지 않으며 광고·스폰서 비용과 경제조정을 직접 연결하지 않음.
- 법규: WLD/WDX는 virtual/simulated/game-only 유지. 현금환전·실제 금융성격 변경은 별도 법률검토 필요.
- SEO: 경제 시나리오/관리자 화면은 인증된 `noindex` 대상이므로 직접 SEO 영향은 중립.

## 버전 / 통합

- 버전: `v2026.09.13.4`
- 브랜치: `docs/economy-simulation-tuning-v2026.09.13.4`
- 문서-only: 예
- 테스트서버 필요: 이번 문서 변경에는 불필요
- 런타임 구현 게이트: 별도 개발 브랜치 -> isolated exact-SHA Test -> backend/DB/API/UI 검증 -> Production

## 다음 우선순위

1. 정책쓰기 없이 현재 Economy Scenario Lab 런타임을 안전하게 통합·검증.
2. 동적정책 자동화 전에 권위있는 metric snapshot 및 cohort/sink read model 구축.
3. 자체 계정/인증 보안 구현과 exact-SHA Test 보안 QA 완료.
4. Production/Test 접근 복구 즉시 Runtime Product Reality Audit 수행.
5. unlimited-by-default를 유지하면서 핵심 사용자 노출 기능 공백 계속 해소.
