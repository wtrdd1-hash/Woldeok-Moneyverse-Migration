# API 관측성 기획 변경이력 — v2026.09.27.468

[English canonical](2026-09-27-api-observability-control-tower-v2026.09.27.468.md) | **한국어**

- API 전수 관측성과 false-green 방지를 primary P0 project plan에 승격했다.
- exact-source inventory, telemetry, security, SLO/error-budget, alert, release gate를 담은 API_OBSERVABILITY_CONTROL_TOWER_SPEC을 추가했다.
- 현재 hard-coded API-health와 randomized telemetry를 검증된 runtime truth가 아니라 보완 gap으로 기록했다.
- exact-source 대사 전까지 API_CATALOG_MASTER 상태를 AUTHORITY_DRIFT로 정정했다.
- 기획/문서 전용이며 runtime 구현, Test 검증, Production 배포 완료를 주장하지 않는다.
