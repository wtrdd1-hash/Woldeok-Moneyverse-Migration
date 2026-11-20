# November 18 design integration — November 20, 2026

## Before work
- User approved integration of preceding branches, correction of GitHub failures, November 18 frontend implementation and gated production promotion.
- Baseline main: `245489a1452a1f187af831f483c18ab2501a65c5`.
- Approved specification: `NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md`, planning branch `131ee06e85d86349105530beb5b7671e92cdd36f`.
- Isolated task branch: `feat/nov18-design-integrate-v20261120`. Existing uncommitted i18n work in the original checkout is preserved.
- Superpowers: requirements comparison, worktree isolation, written plan, TDD, systematic debugging, independent review and fresh verification.

## In progress
- [x] Inventory nine open PRs and their dependency chains.
- [x] Identify candidate CI failure: zero SECURITY_BASE_SHA prevents policy verification before build.
- [ ] Correct candidate base resolution with failing regression tests first.
- [ ] Integrate compatible changes, resolve conflicts without losing concurrent work, verify exact combined source.
- [ ] Implement the approved native Spring MVC/Thymeleaf shared design, five-language selection and safe support entry point.
- [ ] Verify responsive and authenticated states; record incomplete routes and security blockers honestly.
- [ ] Re-fetch main; integrate reviewed changes through GitHub and delete only fully contained branches.
- [ ] Stage exact-source isolated Test and verify release gates before production.

## Finished
Not complete. No production runtime, database privileges, balances, sessions or service configuration changed by this task. Branch creation and read-only investigation only so far. Historical PR test claims are not fresh validation.
