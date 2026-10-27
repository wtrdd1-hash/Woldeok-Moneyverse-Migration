# Private Chat Cache Boundary — Execution Plan

1. Add HTTP integration test `backend/src/chat/chat-cache.e2e.test.ts`: authenticated chat history/unread must carry `Cache-Control: private, no-store`; real session/consent guards, mocked read repository. Run RED.
2. Add Android gateway regression in `frontend/src/app/app-api/v1/[...path]/route.test.ts`: override cacheable upstream, 502, 426, and keep public metadata cacheable. Run RED.
3. Add backend chat response interceptor in `backend/src/chat/chat.controller.ts` and gateway chat group response fence in `frontend/src/app/app-api/v1/[...path]/route.ts`. Run GREEN.
4. Add `cache: 'no-store'` to direct chat polling in `frontend/src/app/chat/chat-room.tsx`, `frontend/src/components/chat-header-button.tsx`; ensure no unrelated changes. Review.
5. Run focused/full tests, lint, typecheck, build, contract, real isolated PostgreSQL read-only auth flow, security audit, CI. Re-fetch main, commit and open Draft HOLD PR only if evidence warrants. No production/test deployment without exact SHA and all gates.

Existing DB chat functions and applied migrations remain immutable. No direct SQL grant changes. Rollback by reviewed git revert before any release; production promotion explicitly blocked until release gates.
