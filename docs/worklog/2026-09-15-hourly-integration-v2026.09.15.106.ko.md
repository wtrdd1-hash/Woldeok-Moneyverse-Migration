# 시간별 통합 사이클 — v2026.09.15.106

## 선택한 런타임 작업

PR #328 이후 `main`이 전진했기 때문에, 직업 업무의 권위 있는 일일 한도 표시 기능을 최신 애플리케이션 기준선 위로 다시 옮겼다.

## 기준선 및 중복 검토

- 개발 전 최신 애플리케이션 `main`: `1679fe33a8b276035c4a8fc0ab8e79d42cb2f07c`
- 이전 검증 구현: PR #328 / `fe14bb14a61dcd6cb7fa277cec7878d46dfac292`
- 비교 결과: 이전 후보는 현재 `main`보다 5커밋 앞서고 6커밋 뒤처진 상태였다.
- 새로 추가된 `main`의 6개 커밋은 문서/기획 변경뿐이었고 Work quota 런타임 파일과 겹치지 않았다.
- 새 통합 브랜치: `integrate/work-quota-visibility-v2026.09.15.106`

## 런타임 범위

- `frontend/src/app/work/career-tasks-board.tsx`
- `frontend/src/app/work/work-quota.ts`
- `frontend/src/app/work/work-quota.test.ts`

사용자는 각 업무의 서버 권위 값인 `taken_today / daily_limit` 진행도를 확인할 수 있다. Backend/API/DB/migration/ledger/economy mutation 계약 변경은 없다.

## 검증 및 배포 상태

이전 exact candidate `fe14bb14...`는 CI와 immutable Test Candidate 이미지 빌드는 통과했지만, 실제 isolated Test endpoint가 오래된 build를 계속 서비스하여 exact-SHA 검증에는 실패했다. 새 후보는 merge 또는 Production 승격 전에 독립적으로 CI/build/tests와 isolated Test exact-SHA 검증을 다시 통과해야 한다.

이번 실행 시작 시 승인된 원격 장비가 모두 offline 상태여서 remote git/kubectl 경로를 통한 branch ref 삭제와 Flux/Kubernetes 클러스터 진단은 사용할 수 없었다.

## 릴리스 원칙

isolated Test가 정확한 후보 SHA를 서비스하고 DB/API smoke, 차단 오류 없는 로그, rollback 준비 상태를 확인하기 전까지 Production은 fail-closed로 유지한다.
