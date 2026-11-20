# November 18 design integration implementation plan

> **For agentic workers:** Use superpowers:executing-plans task by task. The user explicitly approved implementation, integration, cleanup and gated promotion; proceed inline with independent final review.

**Goal:** Integrate pending verified work, repair candidate CI, then deliver the approved native Spring frontend without losing security or existing functionality.

**Architecture:** Reconcile the existing PR dependency stacks in an isolated MiniPC worktree. Shared Spring MVC/Thymeleaf composition must replace fragmented page shells incrementally; existing session-authenticated APIs remain authoritative. Promotion requires exact-source isolated Test evidence.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Thymeleaf, CSS, browser JavaScript, Node built-in tests, Gradle/JUnit, GitHub Actions.

**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md at planning branch 131ee06e85d86349105530beb5b7671e92cdd36f.

## Global Constraints
- Canonical money remains integer strings; never Number(balance).
- Background #0C1020, card #151D32, violet #9C83FF, blue #64B7FF, text #E9F1FF, muted #A8BCD8.
- EN default; KO, JA, ZH, VI supported with persisted manual preference precedence.
- One 56px global support entry point; no false success, spoofable actor, duplicate message or cross-account draft leakage.
- Preserve uncommitted work, immutable migrations, ledger boundaries and existing Korean product copy.
- No production promotion without exact-SHA isolated Test, auth/session continuity, rollback and relevant release evidence.

## Review Focus
1. New branch push with zero event-before must scan the same valid comparison base as release classification.
2. Missing Git objects must fail closed with actionable diagnostics, never bypass scanning.
3. Main's concurrent i18n shell must survive old homepage replacement.
4. Financial strings beyond JS safe integer range must display exactly and preserve direction.
5. Support drafts and selection must not leak after logout or account switch; inaccessible APIs must show unavailable states.

### Task 1: Restore candidate security scan provenance
**Files:** .github/workflows/ci.yml; .github/workflows/test-candidate.yml; scripts/security/check-repository-security.mjs; scripts/security/check-repository-security.test.mjs; scripts/release/classify-release.test.mjs.
**Interfaces:** Candidate release-input exports comparison_base_sha; reusable CI consumes comparison_base_sha; scanner accepts only available nonzero commit SHA.
- [ ] Add failing tests for propagated comparison base and unavailable/zero Git object validation.
- [ ] Run node --test on these files and observe expected failure.
- [ ] Pass the already-resolved base through reusable CI, validate before scan, catch missing Git objects without leaking values.
- [ ] Run node --test scripts/security/*.test.mjs scripts/release/*.test.mjs; inspect every failure.
- [ ] Commit/push checkpoint after verification and independent review.

### Task 2: Reconcile pending PR stacks
**Files:** Existing PR changes #3300–3307 and documentation #3309; docs/worklog/2026-11-20-nov18-design-integrate.md.
**Interfaces:** Integrated source retains session/CSRF enforcement and canonical receipts; main ancestry proves cleanup eligibility.
- [ ] Record baseline test failures before changes.
- [ ] Merge approved planning and pending branches in dependency order in isolated task branch, preserving both historical append records and current i18n assets.
- [ ] Resolve homepage against approved palette, mobile layout and real data; do not hide support on mobile.
- [ ] Run full Spring tests and repository policy suite. New regression fixes follow RED/GREEN.
- [ ] Review exact combined diff and re-fetch main before GitHub integration. Delete only branches fully included in main; preserve unique/failed work.

### Task 3: Complete shared native frontend against approved authority
**Files:** spring-backend/src/main/resources/templates/**, static/assets/**, web controllers and matching Spring tests (exact existing paths identified after integration).
**Interfaces:** Shared Thymeleaf shell, locale preference and existing session-authenticated support/chat APIs.
- [ ] Inventory implemented routes and source owners; record gaps rather than treating concept inventory as completion.
- [ ] Add failing shared-shell, locale, mobile support, money-precision and auth-negative tests for each changed behavior.
- [ ] Implement minimal shared components and safe unavailable states. Remove fixed-actor and fabricated-success paths before enabling messaging.
- [ ] Verify whole Spring suite plus real browser widths 320/390/768/1440 and five locales, keyboard and error states.
- [ ] Commit reviewed checkpoints; record exact evidence and remaining routes.

### Task 4: Integration, cleanup and release gates
**Files:** Worklog and release evidence; only documented release mechanisms.
**Interfaces:** Tested SHA equals staged Test and eventual production SHA.
- [ ] Fresh whole-branch review and fix important findings with RED/GREEN.
- [ ] Merge through required GitHub checks, verify tip ancestry and added-file parity before deleting branches.
- [ ] Stage isolated Test, verify identity, changed flows, authentication continuity and rollback.
- [ ] Promote only if gates pass. Otherwise preserve production and record precise blockers; do not claim deployment.

## Plan review
Task 1 precedes all integration candidate claims. Task 2 determines the exact existing files for Task 3; that inventory checkpoint must refine Task 3 before behavior edits. Task 4 consumes the final tested SHA, never historical PR QA. Full route migration is not satisfied by CSS or a captured static gallery.
