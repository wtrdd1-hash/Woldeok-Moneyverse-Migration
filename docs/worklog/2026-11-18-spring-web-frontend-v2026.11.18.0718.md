# Spring-owned web frontend — execution ledger v2026.11.18.0718

- **Status:** IN PROGRESS / isolated branch / RELEASE HOLD.
- **Owner request:** Move the browser-facing frontend to Spring as well, without removing existing UI, member sessions, finance/account features or administrator routes.
- **Authority baseline:** `origin/main` `e96e8f81f4d6b99b221392a2b6fe46356361b145` fetched at start. Read `AGENTS.md`, `GEMINI.md`, documentation governance/catalog, `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, Spring migration architecture/review, incident review, and current runtime observations. Git main worktree carries 11 local commits and an untracked Next asset tree; neither will be modified.
- **Start evidence:** 2026-11-18 KST. Spring Boot port 4550 is running. Nginx `prod_frontend` points to Spring 4550. `GET /`, `/guide`, `/admin/blog` through the local Nginx public Host return the same 475-byte placeholder index (HTTP 200); existing Next test runtime at port 4522 returns a 113841-byte real homepage, but it is NOT an approved release service. A blanket Spring static-index fallback is not a functioning port.
- **Safety:** No production traffic switch, runtime restart, DB migration, account write, secret or session change. Existing user-facing components remain intact. Spring web migration shall be progressive, explicit-route and tested, with unmigrated routes kept on verified Next only when that routing can be authenticated and approved.

## Checklist
- [x] Capture start SHA, governance, live routing and visible regression.
- [x] Implement two isolated read-only Spring MVC/Thymeleaf candidate pages, EN/KO and responsive CSS; actual route ownership flags are OFF.
- [x] Run new route-gate, MVC HTML and embedded real HTTP/H2 loopback tests; 11 focused tests green. No authenticated/finance E2E was claimed.
- [x] Recheck origin/main mid-task: unchanged `e96e8f81f4d6b99b221392a2b6fe46356361b145`. No source overlap with the existing main checkout.
- [x] Run embedded in-memory H2 Test profile Spring+Tomcat HTTP on random loopback port; home/guide/CSS responses passed. **Official external Test remains NOT RUN.**
- [ ] Complete paired EN/KO planning, internal/GitHub update notes and release decision.
- [ ] Promote only if official Test, complete route inventory, auth/finance, backup/rollback and production checks pass.

## Checkpoints
1. **START:** no code modifications; source/reality gap confirmed. Production promotion is blocked until gates pass.
2. **MIDDLE / IMPLEMENTATION:** `GET /spring-ui/home` and `/spring-ui/guide` added as read-only noindex previews; actual `/` and `/guide` controllers only load when explicitly enabled. CSS 320px-responsive, EN default/KO second, no third-party JS or synthetic financial data. A generated 178-file route ledger explicitly leaves 176 pages unmigrated. Spring `SecurityConfig` remains a known CSRF/permitAll blocker for protected routes.
3. **MIDDLE / QA:** First focused 5 tests detected one `Content-Language` mismatch caused by framework response locale override; removed the unreliable header and used correct HTML `lang` instead. Focused 11 MVC/flag/real HTTP tests now pass; prior full clean Spring test/bootJar passed before adding home tests. Read-only frontdoor regression script correctly reports 3/3 observed Nginx routes as broken placeholders. Real Test uses H2 only; no Production DB access.
4. **MIDDLE / AUTHORITY:** `origin/main` re-fetched during work at `e96e8f81f4d6b99b221392a2b6fe46356361b145`; the originally described 2026-11-13 Next preservation target is superseded only for final web frontend scope by user 2026-11-18 direction.
