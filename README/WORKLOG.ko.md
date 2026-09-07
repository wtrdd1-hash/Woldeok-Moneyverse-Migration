
## 2026-09-07 — 관리자 감사 로그 회원 검색 수정
- 증상: 관리자 감사 로그에서 회원 UUID를 `대상 회원 ID`에 넣어도 해당 회원이 `target_id`로 기록된 감사 이벤트가 검색되지 않아 0건으로 표시됨.
- 원인: `admin_search_audit_events`의 회원 필터가 `subject_user_id`만 비교하고 `target_id`는 비교하지 않음.
- 수정: migration 174에서 회원 필터가 `subject_user_id` 또는 `target_id`를 일치시키도록 보정. 관리자 UI 설명도 실제 검색 의미와 일치하도록 갱신.
- 검증/배포: 테스트 결과와 배포 결과를 아래 후속 항목에 기록.
