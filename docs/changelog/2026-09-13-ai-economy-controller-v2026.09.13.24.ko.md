# AI 경제 컨트롤러 기획 업데이트 — v2026.09.13.24

날짜: 2026-09-13
유형: 문서 / 제품 기획 명세
런타임 영향: 이번 변경 없음

## 요약

제한된 범위에서 자동 조정할 수 있고, 감사·롤백이 가능한 AI 가상경제 컨트롤러의 기준 기획서를 추가했다. 기존 경제 시뮬레이션/동적 소비처 조정 명세와 Scenario Lab 구조 위에 설계하며 Moneyverse의 무제한 기본 및 소비처 우선 경제정책을 유지한다.

## 추가 문서

- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md`
- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.ko.md`

## 주요 결정

- AI는 유저 잔액, 인벤토리, append-only 원장을 직접 변경하지 않는다.
- AI는 진단과 정책 후보를 만들 수 있지만 최종 적용 권한은 결정론적 가드레일이 가진다.
- 운영모드는 `OBSERVE_ONLY`, `RECOMMEND`, `SHADOW`, `BOUNDED_AUTO`, `EMERGENCY_FREEZE`로 정의했다.
- 1시간/24시간/7일/30일 다중시간창과 시즌·이벤트 라벨을 사용해 한 번의 단기 변화만 보고 경제를 자동조정하지 않는다.
- `BOUNDED_AUTO` 초기 범위는 선택형 소비처, 소비처 노출, 비필수 서비스 parameter 등 저위험 allowlist부터 시작한다.
- 초기 WLD, 대출정책, 시즌 지급, WDX 가격형성, 변환율, 유료결제 연계, 신규 화폐 같은 고영향 정책은 계속 사람 승인을 요구한다.
- 작은 변경폭, 누적 drift 제한, cooldown, 최소 표본/불확실성 조건, 변경 후 관찰, 자동정지/롤백을 초기 가드레일로 정의했다.
- 롤백은 이전 config version을 복구하며 ledger history를 재작성하지 않는다.
- policy registry, controller DB model, 관리자 API, 관리자 UX, 모델 거버넌스, 분석, 실패 QA까지 구현계약을 추가했다.

## 조사 반영

환경별 live config와 단계적 rollout, retry-safe/idempotent economy mutation, optimistic concurrency, confidence/예상범위를 포함한 시계열 이상탐지, 대규모 가상경제의 시즌성 패턴에 대한 최신 공식 문서/운영 패턴을 설계 근거로 반영했다.

## 출시 정책

이번 변경은 문서 전용이므로 이 PR에서는 `wdmv-test` 배포가 필요하지 않다.

향후 런타임 구현은 반드시 별도 개발 브랜치에서 `@미니pc홍` 환경으로 진행하고, 분리된 `wdmv-test`에 배포하여 backend, database, API, admin UI, 멱등성, 동시성, rollback을 검증한 뒤에만 Production 승격 대상이 된다.