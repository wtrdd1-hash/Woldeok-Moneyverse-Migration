## v2026.10.02.506 — 긴급 런타임 및 DB 보안 경계 복구

- 1:1 채팅의 conversation/history/sync/unread/archive 접근을 최소권한 SECURITY DEFINER 함수 경유로 수정하고 `moneyverse_app`의 private-chat 테이블 직접 접근 차단은 유지합니다.
- 존재하지 않는 `user_profiles` / `users.display_name` 대신 권위 member profile/public-name 모델을 사용하도록 채팅 peer 조회를 수정합니다.
- migration 240~242 이후 PUBLIC에 실수로 열린 treasury SECURITY DEFINER 함수 6개의 실행권을 차단합니다.
- application role의 treasury INSERT/UPDATE 직접 권한을 제거하고 시민 예산 투표를 `treasury_cast_citizen_budget_vote` 함수 경유로 변경합니다.
- 런타임 복구 절차에서 frontend 생성물 `.next`의 서비스 사용자 쓰기 권한을 복구하고 Test/Production frontend/backend를 하나의 exact candidate로 정렬합니다.
- 새 격리 Test DB 검증: database package 7/7 PASS, backend 170 files / 1,639 tests PASS, 환경 조건 casino E2E 29개만 skip.

## v2026.09.23.390 — QA 브랜치 생명주기 정리 강화

- 작업 브랜치: `fix/qa-branch-cleanup-v2026.09.23.390`.
- squash merge된 PR의 현재 브랜치 HEAD가 병합 당시 PR HEAD SHA와 동일하면 원격 소스 브랜치를 자동 삭제하도록 정리 워크플로를 수정했습니다.
- 병합 후 브랜치에 새 커밋이 추가된 경우에는 삭제하지 않아 후속 작업 유실을 방지합니다.
- 병합 PR 증거가 없는 브랜치는 `main`에 내용이 포함돼 보여도 활성 작업일 수 있으므로 계속 보존합니다.
- 수동 정리에서는 고유 미병합 커밋을 보존한 채 오래된 원격/로컬 브랜치와 clean patch-equivalent worktree를 제거했습니다.

## v2026.09.23.383 — 자산 강제 조정 caller-owned idempotency
- 관리자 현금/은행 자산 강제 조정 API가 내부에서 대체 키를 생성하지 않고 호출자 소유 UUID idempotency key를 필수로 요구합니다.
- 기존 PostgreSQL ledger 함수와 step-up 인증 경계는 유지하면서 timeout/retry 시 HTTP 계약에서 동일 작업을 안전하게 재시도할 수 있습니다.
- 누락·잘못된 키에 대한 DTO 회귀 테스트를 추가했습니다.

## v2026.09.23.381 — 주식 운영 mutation idempotency 계약
- 수동 주가 변경, 시장 이벤트 게시, 기업행위에 호출자 소유 UUID idempotency key를 필수화했습니다.
- 기존 관리자 클라이언트는 이미 키를 보내며 schema, DB 권한, ledger 의미는 변경하지 않았습니다.

## v2026.09.22.367 — Backend API 완전성 감사 CI 차단 해소
- backend API 완전성 감사기의 prefer-const CI 차단을 감사 의미 변경 없이 해소했습니다.

## v2026.09.21.322 — 마이그레이션 권위 fail-closed 게이트
- Production migration 실행이 exact repository checkout에 없는 DB 적용 migration 파일명을 발견하면 실패하도록 보강했습니다.
