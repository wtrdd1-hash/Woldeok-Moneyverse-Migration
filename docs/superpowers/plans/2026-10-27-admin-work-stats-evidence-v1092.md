# Admin work statistics evidence and reauthentication recovery — C v1092

## Source and scope

- Baseline main: 584f01a9c8df3f9005a7e5aa6d13e4719914ae0c, fetched at start; latest QA v1314 FAILED/HOLD.
- Problem: /admin/work trusts an unvalidated admin/work/stats payload and silently suppresses telemetry on failure; the privileged auto-tune button offers no route to the existing recent-auth flow despite NestJS ReauthGuard. This risks showing malformed work reward evidence or stranding a privileged user action.
- Existing real contract: AdminWorkOperationsController.stats() delegates to OperationsRepository.getWorkRealtimeStats() reading work reward receipts and work policy; autoTune is guarded by CsrfGuard + ReauthGuard and invokes the existing policy write function. No new database permissions, financial mutation, migration, or bypass.
- In scope: strict runtime parser for the existing stats payload; explicit unavailable/invalid state; recent-auth recovery link and rejection notice; responsive keyboard/screen-reader affordances; TDD regression tests and full gates.
- Out of scope: changing reward formula, migrating balances, enabling a feature, or deploying to live environments.

## Implementation tasks

1. RED: Add contract tests for valid nested/flat stats and malformed/missing/unsafe/inconsistent responses; observe failures.
2. GREEN: Implement a small runtime evidence parser using nonnegative integer strings, bounded counts/percentages and required nested arrays; wire to the authenticated admin page, and show an accessible error state rather than zero data.
3. RED/GREEN: Add render regressions for the work auto-tune recovery link and error states; preserve server ReauthGuard and use existing /account/security flow, no credentials in admin forms.
4. Verify responsive 44px targets, noindex and backend guard/real API integration; run exact-SHA lint/typecheck/build/unit/DB/security/app-api/CI/E2E where safe. Document any BLOCKED gate.
5. Re-fetch main/plans, review diff, commit/push isolated branch, open Draft PR; merge and deploy only if every required gate passes.

## Safety

Never touch main, other A/B/Gemini/QA branches or the shared live PostgreSQL database. Preserve five scheduled jobs. Exact-SHA Test and Production promotion require verified isolation, clean security audits and explicit GitOps release gates.
