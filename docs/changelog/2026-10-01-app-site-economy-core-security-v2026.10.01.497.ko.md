# App/Site/Economy Core 보안 설계 — v2026.10.01.497

- 미래 client-facing contract를 App Core와 Site Core로 분리하고 권위 Economy Core는 하나로 유지한다.
- 명시적 trust zone, 탈취 격리, workload/user-actor 이중 authorization을 추가했다.
- 최종 shared-token 설계를 short-lived scoped workload identity로 교체하고 물리분리 고가치경로의 proof-of-possession/mTLS 방향을 추가했다.
- DB-first `SECURITY DEFINER`/append-only ledger 권위를 유지하고 BFF/AI runtime의 protected-table write를 금지했다.
- canonical Economy Command Envelope, request hash, replay 통제, endpoint inventory/versioning, App/Site migration 규칙을 추가했다.
- 선택된 모바일 고가치 action에 Play Integrity request binding을 추가하되 device integrity를 identity로 쓰지 않는다.
- economy/work/stock AI tuning을 Economy Policy Registry 하나와 policy executor 하나로 통합했다.
- 구체적인 AI 변경폭 default, cooldown, 누적 drift budget, direct balance/price/history 변경금지를 정의했다.
- prompt injection/excessive agency 격리, controlled AI egress, model runtime의 policy-executor credential 금지를 추가했다.
- 무중단 migration, security test matrix, release gate를 추가했다.
- 중복제거 discovery 149,691건과 현행 1차보안근거 검토를 기록했다.
- 조사/문서 전용이며 런타임·DB·Test·Production 변경 없음.
