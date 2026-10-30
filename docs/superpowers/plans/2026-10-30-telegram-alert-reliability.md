# Telegram Alert Reliability Repair Implementation Plan

> For agentic workers: execute with the established TDD, isolation, review and verification methodology.

Goal: Restore a durable two-minute market alert schedule and detect silent timer exhaustion, while preventing stale-price false positives.
Architecture: use explicit systemd wall-clock recurrence, inspect active and next schedule, and track last-observed time in the market checkpoint.
Tech: Python unittest + standard library, Debian systemd, PostgreSQL READ ONLY, Telegram Bot API.

## Global constraints
- Do not expose token/recipient; do not write finance, customer or stock data.
- Independently stage only alert scripts/units; never restart existing frontend/backend.
- English canonical + Korean translated release records.

## Execution
- [ ] Reproduce market timer elapsed/infinity and compare healthy base timer.
- [ ] RED tests for new timer calendar, base alert condition and stale price behavior.
- [ ] Implement smallest fixes, GREEN tests and extra negative checks.
- [ ] Test against isolated PostgreSQL and Test HTTP; verify systemd calendar syntax.
- [ ] Commit branch and PR, fetch current main mid-task, verify CI.
- [ ] Stage code and independent timer; verify two natural timer runs and delivery receipt.
- [ ] Record evidence in EN/KO release, updates and master; publish GitHub release.
