# C v1335 — Unread count response minimization (English canonical)

Start: 2026-11-03 15:48 KST. Baseline origin/main `07fa93a7781c60e042c59862953bc6f05452e45a`. Reviewed AGENTS, README, planning canonical/Korean and open PRs #2635, #2628, #2623, #2622, #2633, #2634; avoided overlapping search/feed/privacy changes. Existing backend authenticated unread-count API remains unchanged.

Finding: edge GET `/api/notifications/unread-count` validated `unreadCount` but returned the entire upstream object, potentially disclosing unexpected member fields. RED: test rejected response containing `email` and `token`; second invalid-count case passed. GREEN: return only validated `{unreadCount}`; 2/2 tests pass. Frontend TypeScript noEmit passed. This is a real API response-contract/privacy fix, not a UI-only mock.

Release HOLD: full workspace build/lint, unit/integration, real PostgreSQL, security, app-api, authenticated E2E, official exact-SHA Test and required CI not yet all PASS. No merge, Test, Production or rollback. Preserve A/B/Gemini/QA branches and worktrees.

## 한국어 보조 기록
2026-11-03 15:48 시작. 읽지 않은 알림 수 API가 검증된 수치 외의 상위 서버 응답 필드를 그대로 노출할 수 있어 허용된 `unreadCount`만 반환하도록 수정. 실패 재현 1건 및 수정 후 테스트 2건 통과, 프론트 TypeScript 통과. 전체 필수 게이트 미완료로 병합·배포 금지.
