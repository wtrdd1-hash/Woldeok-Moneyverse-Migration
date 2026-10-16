# v739 SEO background-ping isolation worklog

## START
- 2026-10-16 KST, miniPC main `3a3923ba`, public Production v717 / Test v735.2.
- In v738 separate shadow Test backend, existing SEO scheduler logged 39 external IndexNow/Google URL submissions around 30 seconds after boot; actual indexing not measured. Stopped shadow and removed systemd unit; no public traffic cutover.
- Isolated worktree `/srv/moneyverse-tasks/seo-cron-v739/source`, source branch `fix/seo-cron-isolation-v2026.10.16.739`. Other contributors' finance and blog PRs untouched.

## MID
- Re-read integrated master, release policy and observed SeoCronPingService; no environment guard existed before scheduling.
- Implemented fail-closed Test/opt-in check and cancellation of both startup/periodic timers.
- Regression 4/4 PASS with Vitest fake timers, no external submissions triggered during tests.
- Full suite and GitHub CI required before closing; no Production/Test runtime changed by implementation.

## END
- Keep exact Test release, authenticated UI/financial P0 and safe deployment gates separate. Runtime application promotion must not be declared without real public validation.
