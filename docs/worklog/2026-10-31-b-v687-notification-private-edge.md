# B v687 — Notification private response boundary

**Status:** IN PROGRESS / RELEASE HOLD. **Base main:** 761a55a094fb9dd383d213e817305e68c79fa23c.

## Checklist
- [x] Review canonical instructions, plans, latest QA/PRs and identify non-overlap.
- [x] Reproduce source cause: NotificationModule has no pre-guard response privacy middleware.
- [x] RED: regression for all notification routes, including guard errors.
- [x] GREEN: scoped pre-guard privacy headers with no API/DB changes.
- [ ] Verify focused, lint/typecheck/build, all tests, isolated PG/security/contract, CI.
- [ ] Recheck main/plans, push Draft/HOLD PR and record final release status.

No migration, schema, ledger, or production mutations are authorized.

## TDD checkpoint
- RED: 2 failed, 1 passed; NotificationModule.configure absent.
- GREEN: 3/3 pass after pre-guard middleware added to NotificationController routes.
- Contract: no new endpoint/DTO/DB; all notification responses receive Cache-Control private,no-store; X-Robots-Tag noindex; Referrer-Policy no-referrer, including pre-guard rejection.

## HTTP checkpoint
- Real Nest HTTP regression: authenticated 200 and unauthenticated 401 both carry private, no-store / noindex / no-referrer; 2/2 PASS.
- Focused total 5/5 PASS. No changes to session, consent or CSRF guards.
