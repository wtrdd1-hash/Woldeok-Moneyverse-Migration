# API 관측성 관제 타워 기획 작업로그 — v2026.09.27.468

[English canonical](2026-09-27-api-observability-control-tower-v2026.09.27.468.md) | **한국어**

- 상태: IN_PROGRESS
- 범위: 관리자 API 헬스/텔레메트리를 소스 기반 전수 관제, 실제 측정값, 명확한 보안 경계, 알림, 상세 드릴다운 증거, 릴리스 게이트까지 강화한다.
- Runtime/Test/Production: 기획/문서 전용 회차다. 런타임 코드 변경, Test 승격, Production 배포 완료를 주장하지 않는다.
- 브랜치: `plan/api-observability-control-tower-v2026.09.27.468`
- 시작 `origin/main`: `8493d69e2283bf6526b52752ea2242b707160830`

## 작업 전 기록

- 편집 전에 문서 권위 정책, 카탈로그, 인덱스, 권위 PROJECT_PLAN, 통합 기획 마스터를 확인했다.
- 현재 UI 소스는 “실시간”, “300+ REST API”라고 표기하지만 14개 도메인 로컬 상수만 렌더링하며 합계는 89개다.
- 백엔드 `admin/api-health/status`도 같은 도메인 수·지연시간·성공률·100% 상태를 하드코딩하여 실제 트래픽을 측정하지 않는다.
- 현재 backend controller 소스 진단 스캔에서는 HTTP decorator 333개, 고유 method/path 328개, 최상위 prefix 30개가 관측됐다. 이는 구현 권위 수치가 아니며 실제 구현에서는 생성형 권위 인벤토리로 대체해야 한다.
- 화면 문구는 카지노 API 완전 폐기를 주장하지만 현재 소스에는 casino route가 남아 있으므로 비활성/폐기/차단 endpoint도 숨기지 말고 상태를 명시해야 한다.
- 새 기획은 가짜 텔레메트리를 금지하고 인벤토리 불일치, 미분류 endpoint, stale sample, 권한 누락, false-green 상태를 승격 차단 사유로 둔다.

## 예정 순서

1. `v468-01` API/control-plane 소스와 관련 유지 문서를 전수 인벤토리한다.
2. `v468-02` 전수 인벤토리·측정·SLO/error budget·보안·드릴다운·알림 계약을 정의한다.
3. `v468-03` PROJECT_PLAN과 INTEGRATED_PLANNING_MASTER 영/한에 P0 지시를 통합한다.
4. `v468-04` 상세 영/한 명세, GitHub 공개 업데이트, 내부 업데이트를 작성한다.
5. `v468-05` 최신 `origin/main` 재확인, 동시 변경 대사, 링크/영한/diff 검증 후 커밋·브랜치 게시를 진행한다.

## 작업 중간 및 종료 기록

- 중간 origin/main 재확인: 8493d69e2283bf6526b52752ea2242b707160830. 동시 drift 없음.
- 최종 commit 전 origin/main 재확인: 8493d69e2283bf6526b52752ea2242b707160830. 동시 drift 없음.
- Repository 전수 타깃 인벤토리에서 API-health, catalog, 14-domain, telemetry, decommissioning 관련 source/document 119개를 찾았고 이번 회차에서 유지 권위와 직접 관련 runtime source를 대사했다.
- API catalog의 잘못된 전수/100% 검증 권위는 generated-manifest 대사 전 AUTHORITY_DRIFT로 정정했다. runtime baseline port/edge drift와 source-present casino lifecycle drift도 명시했다.
- 검증: git diff --check 통과, 변경 Markdown 상대링크 broken 0, 신규 유지 문서 6종 영/한 pair 모두 존재.
- 범위 보호: 변경 경로는 모두 문서다. runtime code, Test server, DB, Production process는 변경하지 않았다.

## GitHub 통합 checkpoint

- 이 브랜치로 PR #743을 열었고 Git 수준 mergeable 상태다.
- CI classify는 통과했다. CI policy는 base main SHA에 이미 존재하는 backend/src/seo/seo.service.test.ts의 secret-scanner hit로 차단됐다. test fixture에 literal PRIVATE KEY block marker가 들어 있다.
- 해당 backend test file은 v468에서 변경하지 않았고 origin/main 대비 diff가 비어 있다. 이번 기획 PR은 required check를 우회하거나 무관한 runtime/test code를 수정하지 않는다.
- 따라서 base policy 결함을 별도의 올바른 test 변경으로 해결한 뒤 최신 main을 다시 fetch하고 required check를 재실행하기 전까지 main 통합은 BLOCKED다.
