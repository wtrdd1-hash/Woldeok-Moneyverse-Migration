# Server game year implementation (GAMEYEAR.2-5)

Version: v2026.11.26.GAMEYEAR.2
Branch: feat/server-game-year-20261126 (worktree /home/debian/mv-gameyear-20261126), stacked on #3447 head 8a48975a00 because the Test backend runs #3447; retarget to main once #3447 merges.
Worker: Claude Code (Claude Opus 5.5, claude-opus-5-5)

- Start (2026-11-26T09:02:32+09:00): owner directive — priority changed to GAMEYEAR.2-5 ahead of the remaining #3447 admin parity work (checkpointed at 8a48975a00, pushed). Read PR #3452 (671febd666, spec/plan/worklog EN+KO) and PR #3453 (a5044a16c9, mobile navigation and five-locale audit). main 1df1150e97. Migration numbers: main 349, #3447 350-352, no open PR uses 353 -> 353.
- Scope: forward-only DB calendar function (migration 190 untouched), Spring contract with honest failure, web shared header/mobile/dashboard year display (EN default, KO second, JA/ZH/VI), app/Discord contract check, isolated Test verification. Not in scope: annual settlement, rates, account/season resets, real-time security or casino protection, NAV-01/I18N-01/I18N-02 and admin console fixes (follow-up), Production, main, data conversion.
