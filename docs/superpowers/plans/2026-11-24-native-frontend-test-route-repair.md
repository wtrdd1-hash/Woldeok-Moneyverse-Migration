# Native frontend Test route repair implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Test-first, fixed candidate SHA, and no Production changes.

**Goal:** Remove the observed Test-only 403 for published Terms/Privacy and bundled Socket.IO script, plus publication page title 'null', while retaining the Nov23 navy/violet shared design and source-authored legal content.
**Architecture:** Stay on exact currently deployed presentation source 7b676e..., isolated branch/worktree. Add a fail-closed Spring legal read-only controller and immutable Thymeleaf policy templates copied without editorial change from checked-in canonical React policy documents (EN/KO, EN body fallback for JA/ZH/VI). Add only explicitly permitted GET/HEAD legal/script routes; ensure Test-only Nginx narrow forwarding with production config byte identical. Fix Thymeleaf title expression for announcement/gallery.
**Tech:** Java 21 runtime / Spring Boot 3.3.5 Thymeleaf, Gradle JUnit, Python standard library offline template export, Test 55440 / isolated backend 55438 / Test DB 55436.
**Spec:** docs/planning/INTEGRATED_PLANNING_MASTER.md; docs/UI_UX_SINGLE_REFERENCE.ko.md; docs/design/game-ui-v2026.11.23.10; approved source frontend/src/components/policy/{terms,privacy}-document.tsx.
**Global constraints:** No Production change, no DB writes, no authenticated route allowlist relaxation, no invented legal terms, no unverified claim, preserve other agents' worktrees, exact-SHA immutable candidate and rollback.
**Review Focus:** (1) Invalid method/path remains denied; (2) all five locales and English body fallback distinguished; (3) no reflected XSS in legal page; (4) legal policy version & text parity and viewport; (5) no Test-to-Production fallbacks for resources.

### Task 1: RED — native policy/script paths
- [ ] Add HTTP integration assertions to UnifiedFrontendIsolationTest: /terms and /privacy render source-origin text from existing policy, five language shells, no admin/session/db, /socket.io.min.js JS 200, arbitrary sibling and POST 403.
- [ ] Run targeted test, observe 403 expected failure.
- [ ] Implement only the necessary controller/template/source resource and security allowlist.
- [ ] Run targeted test GREEN and denied-path regressions.

### Task 2: RED — publication title
- [ ] Add expected translated title assertions to NativePublicationIsolationTest on all five languages.
- [ ] Run targeted test and observe 'null' failure.
- [ ] Correct the Thymeleaf expression in existing announcement/gallery templates; run GREEN.

### Task 3: release safety
- [ ] Full Java tests + bootJar, no DB-tagged skip reported as pass, miniPC host snapshot and exact src/artifact SHA; isolated port Test preview, 5-language + legal/script + login/RBAC + public API no fallback checks.
- [ ] Test-only Nginx route backup, diff of Production block, nginx -t, safe Test cutover with old Test artifact rollback; external HTTPS smoke and rollback proof.
- [ ] Independent PR in new branch; start/checkpoint/end worklog, internal+GitHub changelog English and Korean, version v2026.11.24.1, latest main checked before integration.
