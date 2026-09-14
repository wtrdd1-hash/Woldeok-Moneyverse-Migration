# 내부 작업 로그 — v2026.09.15.104

## 선택한 런타임 개선

오래된 브랜치 스냅샷을 그대로 병합하지 않고 PR #327의 유효한 Work 일일 한도 표시 기능을 최신 `main` 위에 다시 수용했습니다. Work 보드는 `/api/v1/work/tasks`가 반환하는 authoritative `taken_today / daily_limit` 진행도를 표시하며 반복 가능한 업무 동작은 변경하지 않습니다.

## 사용자 이점

사용자는 각 업무에서 오늘 완료한 횟수뿐 아니라 서버 기준 일일 한도까지 즉시 확인할 수 있습니다.

## 기준선 및 중복 작업 확인

- 새 통합 기준선: `3bfa41ce6c251b707254c09f7c3504d1e5245d28` (`main`).
- 새 브랜치: `integrate/work-quota-visibility-v2026.09.15.104`.
- 검토한 겹치는 활성 작업: PR #327 / `feat/work-quota-visibility-v2026.09.15.103` (`4b51a0a23b87143bcf751638f6b290ff6c1b6f35`).
- PR #327 exact head의 repository CI는 성공했지만 최신 `main`과 양쪽으로 각각 6커밋씩 diverged 상태였습니다.
- 최신 `main`의 추가 6커밋은 기획/문서 전용임을 확인했고 이번 Work 런타임 파일과 겹치지 않습니다.
- 최신 Living Project Plan을 구현 전과 통합 브랜치 생성 후 다시 읽었습니다. P0 fail-closed 승격 증거와 profession-work quota 계약 항목은 계속 적용됩니다.

## 변경 파일과 범위

Frontend/runtime:
- `frontend/src/app/work/career-tasks-board.tsx`
- `frontend/src/app/work/work-quota.ts`
- `frontend/src/app/work/work-quota.test.ts`

문서:
- 영문 작업 로그
- 이 한글 parity 작업 로그

Backend/API/DB 계약은 변경하지 않았습니다. 기존 authoritative Work task read model만 계속 사용하며 경제 mutation, migration, quota 의미를 변경하지 않았습니다.

## 검증 및 배포 증거

선행 PR #327 exact head는 repository CI를 통과했습니다. 해당 SHA로 isolated Test GitOps 매니페스트도 고정됐지만 첫 외부 exact-SHA smoke에서는 검증 시간 동안 Test가 해당 SHA를 보고하지 않아 실패했습니다. 단순 reconcile 지연인지 지속적인 cluster/runtime 문제인지 구분하기 위해 재검증을 시작했습니다.

v104 통합 head는 새로운 immutable 후보이므로 main 또는 Production 변경 전에 secret/security 검사, lint, typecheck, build, tests, PostgreSQL/migration parity, Test Candidate image build, isolated-Test exact-SHA/API/database smoke, rollback readiness를 독립적으로 다시 통과해야 합니다.

## 브랜치 감사 및 정리

이번 통합 브랜치 생성 전 애플리케이션 브랜치는 2개(`main` + PR #327)였습니다. 인프라는 감사 시작 시 17개 브랜치였습니다.

직접 증거로 삭제 가능 상태를 확인한 인프라 ref:
- `fix/wdmv-auto-reconcile-v1-catalog-v2026.09.15.103` — 현재 infra main보다 완전히 뒤에 있고 고유 커밋/파일 없음.
- `fix/wdmv-test-candidate-race-v2026.09.14.89` — 현재 infra main보다 완전히 뒤에 있고 고유 커밋/파일 없음.
- `promote/wdmv-test-4b51a0a23b87-v2026.09.15.103` — infra `main`과 동일 커밋을 가리킴.

삭제 성공은 보고하지 않습니다. 현재 GitHub 연결에는 branch ref 삭제 기능이 없고 승인된 원격 git/gh 장비가 모두 오프라인입니다. Infra draft PR #22와 #50은 고유한 backup/recovery 검증 작업이 남아 있어 보존합니다.

## 차단점, 위험, 롤백, 다음 우선순위

새 통합 후보가 isolated Test에서 정확한 SHA로 확인되고 모든 필수 게이트를 통과하기 전까지 Production은 차단합니다. Test가 선언된 SHA를 계속 서비스하지 못하면 Production 전에 cluster/Flux reconcile 경로를 먼저 복구해야 합니다.

이번 변경은 frontend-only이므로 롤백은 통합/병합 커밋의 정상 revert이며 DB rollback은 없습니다. 이후 최우선은 Living Plan의 P0 promotion-evidence/Test 신뢰성 문제이며, 그 다음 최신 계획상 가장 가치가 높은 미해결 사용자 런타임 기능을 진행합니다.
