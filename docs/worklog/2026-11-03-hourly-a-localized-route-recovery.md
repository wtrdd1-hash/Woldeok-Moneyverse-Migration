# 2026-11-03 A — Localized route recovery (P0, DRAFT/HOLD)

## Authority and isolation
- Started 2026-11-03 00:34 KST. `origin/main` = `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`; isolated `auto/hourly-a-20261103-0025-localized-tools` worktree.
- Start remote branches: 295 (excluding local branch); open PRs: 268; conflicting PRs: 29. Preserve all unintegrated branches.
- Read `AGENTS.md`, `README.md`, English/Korean living plans, existing QA/issue #2534 and PR inventory. Existing collaborators own backend/DB/app integration and support workflows; do not touch those areas.
- P0 user-visible outage takes precedence over adding another low-value P1 filter: 2026-11-03 live read-only HTTP probes return 200 `/tools`, 500 `/en/tools`, `/ja/tools`, `/zh/tools`, `/en/stocks`, `/en/roadmap`; physical `/en/blog` and `/en/guide/glossary` return 200. Affected rewrites emit `x-middleware-rewrite: https://localhost:4205/tools?__mv_path_locale=en` while the Next listener is HTTP on 127.0.0.1:4205. Root-cause hypothesis: proxy uses HTTPS forwarded public scheme for loopback internal rewrite, causing Next to attempt TLS on its HTTP listener.

## Plan and checkpoint ledger
- [x] Inspect main, repo policy, existing PRs, live symptom and loopback listener.
- [x] RED: add executable proxy tests for HTTPS forwarded loopback, locale and query preservation, public HTTPS behavior, physical routes.
- [x] GREEN: make the minimal loopback-only rewrite correction; avoid insecure rewrites to public hosts.
- [x] Run focused tests, frontend lint/typecheck/build and initial full suites; inspect PostgreSQL read-only ACL. Exact rebase SHA CI and official Test remain pending.
- [ ] Re-fetch main and re-read integrated plan before PR; do not merge or deploy without official Test exact-SHA, restore and GitOps gates.
- [ ] Publish English/Korean QA, release HOLD, worklog and PR with exact test/CI evidence.

## Safety
No DB migration, financial ledger, app-role grant, Production/Test mutation, service restart or deletion is authorized by this task. Keep other PRs and worktrees intact. Any unresolved full gate is HOLD.

## Midpoint 00:39 KST
- RED: 5 failed / 2 passed (HTTP loopback scheme), then GREEN: 7 passed / 0 failed. Tests cover 3 localized tools pages, stocks, roadmap, physical blog, public HTTPS origin.
- Change only `frontend/src/proxy.ts` (loopback-only scheme correction) and focused test; external HTTPS origin unchanged.

## Rebase and QA checkpoint 00:49–00:55 KST
- New main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` merged finance work; proxy file unchanged. Rebasing produced candidate `40bdddab76ca02c4577949235c758e8b5ae4b4cf`. Other finance migrations and commits preserved.
- Isolated Next.js 16.4.2 HTTP port 4325 returned 200 for `/tools`, `/en/tools`, `/ja/tools`, `/zh/tools`, `/en/stocks`, `/en/roadmap`, `/en/blog`. Correct `html lang`, H1, canonical on EN/JA/ZH tools. Production still 500; no deploy. Isolated process stopped after checks.
- Pre-rebase full frontend 2945 PASS; backend 2983 PASS/518 SKIP; DB package 62 PASS/5 SKIP; full lint 0 errors/1027 warnings; build/typecheck and 184-endpoint App API contract PASS. Full audit 9 vulnerabilities; production dependency audit 0. Dev PG read-only: app-role account_balances UPDATE and user_items DELETE both true (P0).
- The final QA and release HOLD are in `docs/qa/2026-11-03-a0025-*`. Production/Test untouched. A fresh post-rebase full test/build run was launched; record authoritative result only after process completion.

## Duplicate and ownership audit
- Found existing Draft QA PR #2263 (localized loopback HTTPS-to-HTTP correction), with a substantially identical source fix and three focused tests. Preserve its unique work and branch. This A branch independently rebases the repair onto the newer main, adds broader regression coverage and actual isolated 7-route HTTP/SEO evidence; any PR must explicitly declare it a **superseding candidate**, never merge both patches. No deletion or closure of #2263 before proven replacement.

## Post-rebase tests and integration hold
- `pnpm test` on rebased source SHA `40bdddab76ca02c4577949235c758e8b5ae4b4cf` passed: contract 41, database 72 PASS/5 SKIP, backend 2985 PASS/518 SKIP, frontend 2954 PASS. Focused tests expanded to 10 PASS. Root typecheck/build/lint status to be recorded in PR after completion.
- No change to financial migrations or collaborator PRs. Candidate must remain Draft/HOLD even when local tests pass: official Test and security gates are missing.

## Final branch safety checkpoint
- Last pre-PR audit: 299 remote heads, 269 open PRs, 29 confirmed conflicting PRs. 0 branch deletions; all unique unintegrated changes preserved.
