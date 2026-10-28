# B v625 — Golden Duck authoritative ledger safety recovery

Status: IN PROGRESS / RELEASE HOLD. Scope: P0 #1319. Started from main `35971c600f25869c96f1c666d4b9f58927202730`.

## Task checklist
- [x] Review AGENTS, README, EN/KO plan, QA issue #1319, existing closed unmerged A #1320 and open PRs.
- [ ] RED: demonstrate fake successful reward with null repository and non-atomic daily claim path.
- [ ] GREEN: block uncertified financial claim before DB operations; retain 10-second client-only practice and remove WLD reward claims.
- [ ] Regression: controller/repository/Next action/UI/app-api, auth/CSRF; no DB writes or migration.
- [ ] Verify main freshness, candidate SHA, CI, official Test and release gates. No merge/deploy unless all pass.

Prior work preservation: A #1320 was CLOSED without merge. Review its unique member-owned status/read model before any future financial feature restoration. Do not change A/C/QA workspaces or schedules.

## 06:43 KST — RED/GREEN checkpoint
- RED on main: backend controller/repository tests 7 failed; owner status action tests 3 failed. Additional direct Next server action and legacy browser helper tests 2 failed by proving live mutation requests were still dispatched.
- Recovered the unique unmerged safety changes from closed A #1320 into a fresh main-derived branch (no branch deletion or edit to A). Added an extra server-action and browser-helper fail-closed boundary not present in #1320.
- GREEN: Backend controller, repository and Nest HTTP E2E 18/18; frontend owner status, server action, browser helper, local practice UI and Android app-api route 37/37 (NODE_ENV=test; server default NODE_ENV=production makes React.act unavailable).
- API: GET /engagement/dopamine/golden-duck/status is owner-scoped, private no-store and read-only; POST /engagement/dopamine/golden-duck returns 503 `golden_duck_settlement_unavailable`. Browser and server action never attempt financial claim. No migration or WLD writes.
- Pending: full validation, CI, exact-SHA Test, formal release gate; current shared disk 99%, /tmp 97%.
