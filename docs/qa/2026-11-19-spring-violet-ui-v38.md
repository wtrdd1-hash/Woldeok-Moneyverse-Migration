# Spring-native Approved Violet UI — Actual QA v2026.11.19.38.1

Date: 2026-11-19 KST
Branch: `feat/spring-violet-ui-shell-v20261119-38` (isolated mini-PC source candidate)
Source baseline: local integration main `ec22442819b986e190d5ba6d9fd2539d86efb2db` (GitHub public main was `c131ef1039fddbba064e04a9c07bbba06e0a38a2` at start; **not the same source tree**).
Status: **UNIT/EMBEDDED HTTP PASS, REAL BROWSER/PROD RELEASE HOLD**.

## Direct evidence

| QA | Command / observation | Result |
| --- | --- | --- |
| Admin/Thymeleaf design TDD | 6 initial v38 unit tests before implementation | **RED 6/6**, then GREEN |
| Status dock CSS coverage | Cross-template resource-link test | RED 1, GREEN after status template link |
| CSP regression | Two admin controller `Content-Security-Policy` tests | RED 2, GREEN after adding self-only CSS allowance |
| Admin visual shell + support | Actual `LiveAdminUsersPage.renderPage` output in Java tests | EN/KO, escaped title, 1 safe dock, 240px desktop CSS and 980px responsive rule PASS |
| Spring native templates | Actual Thymeleaf layout/hub/status resource checks | Shared 56px dock, CSS, no JS/chat send PASS |
| Spring embedded HTTP/H2 | `SpringNativeUiV38HttpTest`: random-port Test `/calculators?lang=en` and `?lang=ko`, CSS path, anonymous /admin/users | **4 actual HTTP PASS**, 200/200/200/302 |
| Exact isolated Java full regression + packaging | `cd spring-backend && ./gradlew clean test bootJar --offline --no-daemon -Dorg.gradle.workers.max=2` | **251 JUnit PASS / 0 FAIL / 0 SKIP**; `BUILD SUCCESSFUL` in 36s |
| Boot JAR identity | SHA256 of `moneyverse-spring-backend-0.0.1-SNAPSHOT.jar` | `ba94b7b999be97f59b2c13e40fd4618fb3859885aeb7d202bb54d616dafd09ef` (not production) |
| Boot JAR contents | `unzip -l` | `BOOT-INF/classes/static/mv-spring/v38/admin-ui.css`, `shared-ui.css`, Thymeleaf footer/status/hub and Java class present |
| Existing user-data/finance permissions | Original Spring `LiveAdminUsersPageTest`, `LiveAdminOverviewPagesTest` and full suite | PASS; no controller authentication, DB/finance business function or response status logic changed |
| Gemini conflict check | Read-only check concurrent v37 worktree | **No edits** in its owned `spring-backend/src/main/resources/static/index.html` or ops/db |
| EN/KO design references | [Admin desktop](../design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png), [mobile](../design/admin-chat-v2026.11.18.13/references/admin-console-mobile.png), [180 image matrix](SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md) | Source file references present; **NO live pixel-parity proof** |

## Explicitly NOT verified

1. Real Chrome render at 320/360/390/768/1440/200% and screenshot comparison against approved original images. Mini-PC lacks a usable headless browser binary in this work environment, so static geometry checks and embedded HTTP are **not visual tests**.
2. Valid authenticated production administrator session, MFA, finance ledger read/write receipts, member ownership, true support/DM delivery and failure-state E2E. Current safe dock intentionally does not send messages.
3. Real Test Nginx route cutover of this exact Spring JAR and external HTTPS route matrix, immutable release SHA, independent rollback, current Nginx actor, Cloudflare caching and Android parity.
4. 180 image routes converted — current matrix labels remaining work `IMAGE ONLY / SPRING UI NOT CERTIFIED`.
5. Existing live `/admin` root and `/` homepage — both are separate owner scope and cannot be claimed improved by this Java shell branch.
6. GitHub main merged — mini-PC local integration main contains unpublished commits. Prepare a narrow stacked PR on the published Spring-routing baseline to avoid uploading concurrent integration history.

## Release decision

**HOLD / NO PRODUCTION REPLACEMENT.** The Java test jar demonstrates real Spring-generated UI and CSS, **not** a live release. Do not reload Nginx or restart running Spring/Discord processes; ongoing v37 site work is not in this candidate. Remediate visual browser QA, authenticated/finance proof and exact-SHA Test/rollback before scoped zero-downtime promotion.

[English visual implementation spec](../planning/SPRING_NATIVE_VISUAL_SHELL_v2026.11.19.38.1.md) / [한국어](../planning/SPRING_NATIVE_VISUAL_SHELL_v2026.11.19.38.1.ko.md).

## Clean GitHub PR lineage and independent recheck

A second isolated worktree was created from the **published remote Spring routing branch** `46275239f5d707aed52b38fe91d959da59df0977`, then only the v38 implementation commit was cherry-picked. The resulting **clean PR source SHA** is `086084c13608a1aecbffb690e7b4b23708862d7d`, with exactly **30 changed files** relative to the published parent; no eight other unpublished local integration commits were included. On this exact clean PR branch the complete `./gradlew clean test bootJar --offline --no-daemon -Dorg.gradle.workers.max=2` ran independently and **251/251 PASS, 0 fail, 0 skipped**, packaging SHA256 `50eb48f788a3e5f4ade587e537981312989d2db8329bd366c80209a525f44d93`. Different baseline produces a different JAR SHA; neither is Production. All **205 local relative links across EN/KO implementation, QA and route matrix** exist in that PR branch. Published Spring routing baseline may not include the local security fixes from other workers; merging this UI must NEVER bypass a subsequent security integration review and Test gate.
