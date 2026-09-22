## v2026.09.23.383 — 개발 B: 자산 강제 조정 idempotency 계약 강화
- 최신 main에서 관리자 자산 override가 idempotency key 누락 시 API가 random UUID를 생성해 재시도마다 별도 경제 명령이 될 수 있는 P0/P1 경계를 확인했습니다.
- API DTO에서 caller-owned UUID를 필수화하고 controller fallback 생성을 제거했습니다. 기존 관리자 프론트는 이미 UUID를 보내므로 사용자 흐름은 유지됩니다.
- focused DTO 2/2, backend typecheck, changed-file ESLint, 전체 backend Vitest 89 files / 942 tests 통과. DB 환경이 없는 52 files / 361 tests는 skip되어 real PostgreSQL gate는 별도 required CI에서 확인합니다.


## 2026-09-07 — 관리자 감사 로그 회원 검색 수정
- 증상: 관리자 감사 로그에서 회원 UUID를 `대상 회원 ID`에 넣어도 해당 회원이 `target_id`로 기록된 감사 이벤트가 검색되지 않아 0건으로 표시됨.
- 원인: `admin_search_audit_events`의 회원 필터가 `subject_user_id`만 비교하고 `target_id`는 비교하지 않음.
- 수정: migration 174에서 회원 필터가 `subject_user_id` 또는 `target_id`를 일치시키도록 보정. 관리자 UI 설명도 실제 검색 의미와 일치하도록 갱신.
- 검증/배포: 테스트 결과와 배포 결과를 아래 후속 항목에 기록.
