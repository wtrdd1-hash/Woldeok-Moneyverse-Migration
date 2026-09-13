# 작업기록 — AI 경제 컨트롤러 — v2026.09.13.24

날짜: 2026-09-13
브랜치: `docs/ai-economy-controller-v2026.09.13.24`
범위: 문서/기획 전용

## 요청

AI가 Moneyverse 경제를 자동으로 안정화·조정할 수 있도록 실제 적용방법과 최신 참고패턴을 조사한 뒤 상세 기획서에 반영한다.

## 저장소 확인

작성 전에 최신 `main` 기획상태, 열린 통합작업, 기존 경제 명세를 확인했다. 기존 `ECONOMY_SIMULATION_TUNING_SPEC.md`에는 읽기전용 시뮬레이션, 경제회계 분류, 30/90/180 시나리오, 경제상태 밴드, 소비처 우선 조정, 롤백 중심 운영이 이미 정의되어 있었다. 따라서 현재 Economy Scenario Lab 작업을 중복하는 대신 AI Controller의 기반 계층으로 사용한다.

작업 중간에도 저장소를 다시 확인했다. 해당 시점 `main`은 `22f8b7a18cd778ddf6a754cc6d28dd0206847885`, 최신 기획/작업기록 버전은 `v2026.09.13.23`이었고 `v2026.09.13.24` 또는 AI Economy Controller 명세는 존재하지 않았다. 따라서 이번 작업을 `v2026.09.13.24`로 지정하고 새 문서 브랜치에서 수행했다.

## 조사

다음 최신 공식/참고 패턴을 검토했다.

- 환경별 remote/live config 및 단계적/percentage rollout
- 경제 transaction의 멱등성과 optimistic concurrency/stale-write 보호
- confidence/예상범위를 포함한 시계열 이상탐지
- 대규모 지속형 가상경제에서의 시즌성

외부 제품 동작을 그대로 복제하지 않고 Moneyverse 정책에 맞게 적용했다.

## 기획 결정

새 controller는 다음 범위제한 폐루프다.

`telemetry -> 품질/reconciliation -> anomaly/state -> 시즌기준선 -> 후보 -> Scenario Lab -> 결정론적 validator -> 승인/mode -> versioned rollout -> observe -> rollback`

주요 결정:

- AI의 직접 잔액·인벤토리·원장 변경 금지
- 결정론적 guardrail이 AI 출력보다 우선
- `RECOMMEND`부터 시작하고 `SHADOW`로 검증 후 저위험 `BOUNDED_AUTO`만 허용
- 여러 관찰기간과 이벤트/시즌 라벨 사용
- stale data, reconciliation 실패, 높은 uncertainty, incident, policy-version conflict에서 fail-closed
- ledger history가 아니라 config를 rollback
- 무제한 기본 플레이와 소비처 우선 조정정책 유지
- exploit 기반 급등은 일반유저 가격조정이 아니라 security/integrity incident로 처리
- min/max/step/drift/cooldown/sample/approval/rollback metadata를 가진 policy registry 정의
- 런타임 개발 전에 DB, API, admin UX, model governance, KPI, 실패 QA까지 정의

## 초기 기획 기본값

향후 저위험 `BOUNDED_AUTO` 단계의 설정 가능한 시작값으로 매시간 관찰, policy-family cooldown, 약 ±2%의 저위험 자동변경폭, 사람 승인 baseline 대비 약 ±5%의 7일 누적 drift, 변경 후 약 6h/24h 점검 및 7일 회고를 제안했다. 이는 유저 제한이 아니라 운영자 안전장치이며 실제 런타임 적용 전 `wdmv-test`와 역사데이터로 검증해야 한다.

## 추가 파일

- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md`
- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.ko.md`
- `docs/changelog/2026-09-13-ai-economy-controller-v2026.09.13.24.md`
- `docs/changelog/2026-09-13-ai-economy-controller-v2026.09.13.24.ko.md`
- `docs/worklog/2026-09-13-ai-economy-controller-v2026.09.13.24.md`
- `docs/worklog/2026-09-13-ai-economy-controller-v2026.09.13.24.ko.md`

## 런타임/테스트 상태

이번 작업에서는 runtime code, database schema, API implementation, Production config를 변경하지 않았다. 문서 전용이므로 이 PR에서는 `wdmv-test` 배포가 필요하지 않다.

향후 구현은 저장소 출시계약을 따라야 한다. 별도 개발 브랜치 -> `@미니pc홍` 환경 개발 -> 분리된 `wdmv-test` 배포 -> backend/DB/API/admin UI/멱등성/동시성/rollback 검증 -> Production 승격 순서다.

## 다음 구현 우선순위

1. 신뢰 가능한 read-only Scenario Lab 기반 완성/통합
2. `OBSERVE_ONLY`의 data-quality/reconciliation + policy registry 구현
3. 관리자 콘솔에 `RECOMMEND` proposal 표시
4. 충분한 역사데이터를 쌓고 offline replay/backtest 수행
5. `SHADOW`에서 예측오차와 오탐률 측정
6. acceptance gate를 통과한 뒤 좁은 범위의 `BOUNDED_AUTO` 활성화