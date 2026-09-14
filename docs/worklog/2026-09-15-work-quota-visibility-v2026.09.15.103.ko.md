# 내부 작업 로그 — v2026.09.15.103

## 선택한 런타임 개선

Work 보드에 서버가 제공하는 업무별 일일 한도를 표시해 사용자가 `taken_today`와 `daily_limit`을 함께 확인할 수 있도록 했습니다. 반복 가능한 업무의 기존 동작은 변경하지 않습니다.

## 사용자 이점

각 직업 업무에서 오늘 완료 횟수뿐 아니라 서버 기준 일일 한도까지 한눈에 확인할 수 있습니다.

## 기준선 및 중복 작업 확인

- 개발 전 애플리케이션 기준선: `bb46906b786dd92e731be996ad8fc3c72e94f352` (`main`).
- 개발 전 애플리케이션 원격 브랜치는 `main`만 존재해 겹치는 활성 Work 작업이 없었습니다.
- 최신 Living Project Plan을 작업 전과 작업 중 다시 읽었습니다.
- 인프라는 별도로 감사했으며 현재 Test GitOps는 위 기준선 SHA를 가리킵니다.

## 범위

Frontend만 변경:
- `frontend/src/app/work/career-tasks-board.tsx`
- `frontend/src/app/work/work-quota.ts`
- `frontend/src/app/work/work-quota.test.ts`

Backend/API/DB 계약은 변경하지 않았습니다. UI는 계속 authoritative `/api/v1/work/tasks` 데이터를 사용합니다. 표시된 한도에 도달해도 업무를 spent 상태로 만들거나 반복 실행을 비활성화하지 않습니다.

## 검증 및 승격 상태

정확한 후보 SHA에 대해 repository CI와 immutable Test Candidate build가 입증된 뒤에만 Test 승격이 가능합니다. 실제 isolated Test의 exact-SHA/API/DB/log 검증과 Production 승격은 직접 증거가 확보될 때까지 fail-closed 상태를 유지합니다.

## 브랜치 감사 / 정리

애플리케이션은 non-main 브랜치가 없는 상태에서 시작했습니다. 인프라에서는 삭제 가능한 과거 브랜치를 식별했지만 현재 GitHub 연결에 ref 삭제 기능이 없고 승인된 원격 git/gh 장비가 모두 오프라인이어서 실제 삭제 성공으로 보고하지 않습니다.

## 남은 위험 / 다음 우선순위

가장 큰 운영 위험은 Production 전에 Test 런타임의 exact-SHA 일치 여부를 직접 입증하는 것입니다. 이번 Work UI 계약 보완 이후 새로운 P0/P1 공백이 나타나지 않는다면 다음 큰 사용자 기능 우선순위는 authoritative Clubs/Community 구현입니다.
