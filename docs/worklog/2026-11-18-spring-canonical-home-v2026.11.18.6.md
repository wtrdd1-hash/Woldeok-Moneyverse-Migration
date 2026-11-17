# v2026.11.18.6 — Owner instruction compliance: Spring MVC canonical frontend conversion

**English primary** · [한국어](2026-11-18-spring-canonical-home-v2026.11.18.6.ko.md) · STARTED

## BEFORE — 2026-11-18 08:19 KST
Owner explicitly rejects the previous Next.js fallback as a violation of the full Spring frontend migration instruction. That fallback was an emergency recovery that restored actual UI on 13+ routes; it was NOT the requested architecture. Do not describe it as Spring migration. The isolated Spring SSR preview v2026.11.18.3 is actually live but only on `/spring-web` paths, also insufficient.

At 08:16 KST, GitHub main e96e8f81f4d6b99b221392a2b6fe46356361b145 and master plans checked; main v2026.11.17.5 financial/security G0–G6 RELEASE HOLD applies. A separate agent branch `feat/spring-web-frontend-v2026.11.18.0718` has genuine native Spring MVC + Thymeleaf canonical home and guide implementations with live route flags, in isolated clean worktree and tests. Do not modify that branch; integrate its tested source into a NEW branch stacked atop v2026.11.18.3 H2-only preview. Java21/Thymeleaf, English default / Korean opt-in, fail-closed HTTP filter on sidecar, no Production PostgreSQL, no privileged API writes, no loss of existing Spring preview.

Source/operations plan: import Spring Home+Guide source files from the other clean branch without altering it, enable only the independent sidecar's native Java route flags, run RED/GREEN tests and isolated immutable JAR, Test Nginx exact `/` and `/guide` on the test origin only after local HTTP, validate real HTML and styles. Then deploy identical immutable artifact to a new Production Spring sidecar, canary exact canonical `/` (which overrides temporary Next-only exact home), and `/guide` (which overrides the old Next catch-all), preserve all more specific API/auth/admin/finance and existing Next fallback for routes NOT YET migrated. This is still NOT a full 178-page + 124-BFF conversion. Record zero-downtime and rollback evidence.

## MIDPOINT
Pending.

## CLOSEOUT
Pending.

## MIDPOINT — 2026-11-18 08:20 KST
- Integrated Java Spring controller/model/templates/CSS and real HTTP integration tests for native `/` and `/guide` from the clean parallel agent branch without editing that branch. Enabled canonical route flags only in isolated H2 preview profile and expanded denial filter to allow two canonical guest pages and their CSS while preserving forbidden API/admin/money writes.
- Rebuilt via Java21 Gradle `clean test bootJar`: BUILD SUCCESSFUL; combined Spring suite and embedded Spring HTTP tests passed. The existing emergency Next.js catch-all remains active until independently verified Spring Test canonical routes. Exact Nginx Test and Production canary snippets and optimistic-concurrency/automatic rollback tool prepared.
