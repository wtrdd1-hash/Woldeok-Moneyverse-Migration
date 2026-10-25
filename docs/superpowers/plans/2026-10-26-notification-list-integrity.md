# Notification list integrity implementation plan — B v544

1. **RED — DTO**: in `backend/src/notification/notification-list-integrity.test.ts`, exercise `plainToInstance` and `validateSync` for `unreadOnly=true`, `unreadOnly=false`, invalid strings, and absent values. Expect false to remain false and invalid values to fail validation.
2. **RED — pagination**: use a queryable double to assert that `NotificationService.listNotifications` orders by both `created_at DESC` and `id DESC` while keeping owner predicate, parameter binding, and bounded caller arguments.
3. **GREEN**: replace Boolean constructor coercion in `backend/src/notification/notification.dto.ts` with strict string-to-boolean conversion (retain boolean inputs); add deterministic UUID tiebreaker to `backend/src/notification/notification.service.ts`.
4. **Verify**: focused RED/GREEN, full backend suite, build/typecheck/lint, security, CI, isolated PostgreSQL if available. Keep PR draft and release HOLD for any failed or unverified gate. Recheck latest main and English/Korean plans before integration.
