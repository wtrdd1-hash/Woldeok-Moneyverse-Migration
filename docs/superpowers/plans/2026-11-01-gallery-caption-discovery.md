# Public Gallery Caption Discovery Implementation Plan

> For agentic workers: execute in an isolated worktree with red-green tests, review and final verification.

## Purpose and bounded design
Visitors may find an operator-approved public gallery photo by matching a caption substring. This is a read-only convenience filter over the **latest 24 published public photos** returned by the existing SECURITY DEFINER function, not historical search. A missing or malformed upstream response must not masquerade as a verified empty result. Empty search preserves the existing canonical gallery. Query length 2–60 characters; no duplicate/unknown query keys, control characters or oversized values. Only a literal substring is matched; case-insensitive for standard Latin/Korean. No database schema or privilege changes, and no sensitive request logging.

## Tasks
1. [ ] Write failing backend parser, repository SQL, controller/service tests; run RED; implement and run GREEN.
2. [ ] Write failing frontend filter validation tests and app-api gateway tests; run RED; implement and run GREEN.
3. [ ] Add accessible GET search form, clear action, explicit 24-photo scope and noindex/no-store for filtered page; run component and SEO tests.
4. [ ] Verify real DEV PostgreSQL READ ONLY / ROLLBACK with moneyverse_app, confirm function grants and direct table restrictions; no Production writes.
5. [ ] Fetch main again, run complete required gates and record exact SHA; Draft PR/HOLD if any gate fails. Do not merge, deploy or delete others' branches.
