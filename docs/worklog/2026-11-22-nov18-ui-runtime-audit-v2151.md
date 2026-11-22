# v2026.11.22.2151.1 — Nov 18 UI cross-layer audit worklog

[한국어](2026-11-22-nov18-ui-runtime-audit-v2151.ko.md) | [Findings](../findings/2026-11-22-nov18-ui-runtime-drift-v2151.md)

## START — 2026-11-22 21:51 KST
- Owner request: determine why the Nov 18 approved UI remains inconsistent across pages and inspect related activity/history.
- Read-only work plan: verify authority docs, latest Migration and Android GitHub heads, mini-PC state, merged/open UI PRs, existing FE/QA task logs, Nginx routing, Spring static templates and anonymous HTTP.
- GitHub Migration default `main`: `86393ad8bc1c66ba5c8593aa3770e2310173fd29`; Android `main`: `b6e9dda322ab7440567c0306295f3baf45067aeb` as recorded by FE/QA tasks; independent Android application validation not performed.
- Isolated documentation branch: `docs/nov18-ui-runtime-drift-audit-v2026.11.22.2151.1`. No edits to shared FE-A/FE-B/FE-C code files and no direct main commits.

## MID — current main/planning recheck
- Re-read current `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`, Nov18 authority and `DOCUMENTATION_POLICY`; git remote `main` rechecked unchanged at `86393ad8bc...`.
- PR chronology evidence: #3355 18:48, #3356 19:45, #3359 20:43, #3362 21:21 KST. Confirmed merged UI changes modify individual `spring-backend/src/main/resources/static/*.html` files; #3359 introduces `css/mv-shell-nov18.css`. Open Test-first delivery #3357 still exists.
- Existing Nov21 report explicitly classifies 26 new-shell/5 partial/37 other/79 errors/33 dynamic-not-run. Treated as dated historical evidence rather than live Nov22 rerun.
- Current source counts: 59 top-level static HTML, 22 template HTML, 19/59 shared shell CSS, 50/59 legacy Next static asset strings, 48/59 legacy body class strings. No new browser screenshot acceptance executed.
- Live mini-PC shows Nginx/Java 4550/4632/4646, former managed service units inactive, 4550 started 20:32; `/api/version` local edge returned 503. Anonymous route checks and source/JAR/HTTP fingerprint comparisons recorded in findings.
- FE-A, FE-B, FE-C, QA-1, QA-2 latest task records inspected; exact-SHA/auth/finance/visual gates remain unresolved. FE-C documents uncommitted worktree paths: **do not overwrite**.

## MID addendum — indexed work history

- Scanned all currently named FE-A/B/C and QA-1/QA-2 task folders on the mini-PC: 218, including 217 readable audit files. `hold` occurred in 216; `blocked` in 213 (text occurrences only). Git Nov 18–22 history has 293 commits, 153 titles matching frontend/UI/design patterns. No claim that each audit file was independently reviewed line-by-line.
- Rechecked GitHub `main` unchanged `86393ad8bc...` after updating this isolated documentation branch.

## END — audit-only delivery
- Findings recorded in EN/KO and separate internal/GitHub update entries. No code/data/service/edge config, restart, feature flag, auth state or Production deployment modified.
- Verification is limited to repository reads, GitHub API metadata, Nginx/Java state, SHA256 fingerprint reads, and anonymous local HTTP. No 180-image live visual matrix or authenticated finance QA claimed.
- Status: **INVESTIGATED, IMPLEMENTATION NOT DONE, TEST/PRODUCTION RELEASE HOLD**. Gate owner must allocate files and create fresh code branch; use exact-main Test before any future promotion.
- This audit's GitHub author identity alone cannot identify which AI generated earlier code.
