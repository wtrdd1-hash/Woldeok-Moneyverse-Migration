# Announcement Publication-Day Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development; execute tasks with evidence.

**Goal:** Provide bounded KST publication-day discovery for recent public announcements on web and Android.
**Architecture:** Existing PostgreSQL SECURITY DEFINER function returns a max-20 public window; Nest applies bound timestamp filtering and echoes the validated day. Next displays an accessible GET form; Android gateway fails closed on unverifiable 200 responses.
**Tech Stack:** NestJS, Next.js, PostgreSQL 17, TypeScript, Vitest.
**Spec:** docs/superpowers/specs/2026-11-01-announcement-day.md

## Tasks
- [ ] Write and run RED parser, repository and service/controller tests for day bounds, duplicates, SQL parameters and echo.
- [ ] Implement strict KST parser, parameterized public repository filter, Nest web/app endpoints; run GREEN.
- [ ] Write and run RED Android verifier/gateway tests for exact echo, day range, duplicate params, stale 200 and cache/index policy.
- [ ] Implement gateway verifier and accessible web filter UI; run GREEN.
- [ ] Verify app API contract and documentation; compare against main, review conflicts and add worklog checkpoint.
- [ ] Run exact-HEAD build/lint/typecheck/unit/integration/security/SEO/accessibility/app-api and real PostgreSQL read-only proof. Mark unrun or failing gates BLOCKED.
- [ ] Re-fetch latest main and plan, publish Draft PR with exact SHA and HOLD status. Never deploy without official Test exact SHA and all gates.
