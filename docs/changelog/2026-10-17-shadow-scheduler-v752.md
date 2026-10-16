# Changelog — v2026.10.17.752

**English canonical** | [한국어](2026-10-17-shadow-scheduler-v752.ko.md)

- Prevent any SchedulerModule tasks on `NODE_ENV=test`; production requires explicit `MONEYVERSE_SCHEDULER_ENABLED=true`. Default-deny avoids accidental money/data worker execution by fresh test and release canary generations.
- Add five TDD negative/positive regression tests; scheduler suite 15/15 and backend full 1,235 PASS, 396 skipped; backend Nest build PASS.
- No member DB, money, Test/Production services or release pointers modified by this source commit. Production scheduled work requires separately reviewed single-leader configuration before promotion.
