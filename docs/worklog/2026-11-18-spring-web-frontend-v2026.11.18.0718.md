# Spring-owned web frontend — execution ledger v2026.11.18.0718

- **Status:** IN PROGRESS / isolated branch / RELEASE HOLD.
- **Owner request:** Move the browser-facing frontend to Spring as well, without removing existing UI, member sessions, finance/account features or administrator routes.
- **Authority baseline:** `origin/main` `e96e8f81f4d6b99b221392a2b6fe46356361b145` fetched at start. Read `AGENTS.md`, `GEMINI.md`, documentation governance/catalog, `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, Spring migration architecture/review, incident review, and current runtime observations. Git main worktree carries 11 local commits and an untracked Next asset tree; neither will be modified.
- **Start evidence:** 2026-11-18 KST. Spring Boot port 4550 is running. Nginx `prod_frontend` points to Spring 4550. `GET /`, `/guide`, `/admin/blog` through the local Nginx public Host return the same 475-byte placeholder index (HTTP 200); existing Next test runtime at port 4522 returns a 113841-byte real homepage, but it is NOT an approved release service. A blanket Spring static-index fallback is not a functioning port.
- **Safety:** No production traffic switch, runtime restart, DB migration, account write, secret or session change. Existing user-facing components remain intact. Spring web migration shall be progressive, explicit-route and tested, with unmigrated routes kept on verified Next only when that routing can be authenticated and approved.

## Checklist
- [x] Capture start SHA, governance, live routing and visible regression.
- [ ] Implement a self-contained Spring-rendered public UI slice, with English/Korean, responsive styling and no placeholder fallback for pilot route.
- [ ] Write Spring MVC HTTP/SEO/route/auth-negative regression tests and execute locally.
- [ ] Recheck origin/main and integrate only nonconflicting changes.
- [ ] Run isolated Test web+backend smoke and document exact SHA.
- [ ] Complete paired EN/KO planning, internal/GitHub update notes and release decision.
- [ ] Promote only if official Test, complete route inventory, auth/finance, backup/rollback and production checks pass.

## Checkpoints
1. **START:** no code modifications; source/reality gap confirmed. Production promotion is blocked until gates pass.
