# Member Privacy Request Type Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development. Each implementation step requires RED and GREEN evidence.

**Goal:** Let a signed-in member filter their recent privacy-rights requests by one of the five existing request types, with the same owner-scoped behavior in web and Android API.

**Architecture:** Keep `privacy_list_my_requests` as the existing SECURITY DEFINER source of truth. The unfiltered endpoint retains its 30 most recent records; filtered reads scan at most the latest 100 owner-scoped records in PostgreSQL, filter by exact request type and return at most 30. Reject malformed types; no new grants, mutations or migration. Web uses allowlisted URL query values and no-store; Android gateway forwards the same query with no-store.

**Tech Stack:** NestJS, Next.js 16, PostgreSQL 17, Vitest, TypeScript, pnpm.

## Tasks
- [ ] Record baseline and write failing Backend service/repository/controller tests for valid type, invalid type, bounded source and owner scope; run RED.
- [ ] Implement service/controller/repository with bound SQL parameters; run GREEN.
- [ ] Write failing web privacy-center tests for type tabs, allowlisted URL and limited scope; run RED.
- [ ] Implement accessible web controls and explicit recent-history wording; run GREEN.
- [ ] Write failing Android app-api query-forwarding/no-store test; run RED, then verify existing gateway satisfies it.
- [ ] Verify isolated PostgreSQL function, exact SHA backend/frontend/bot tests, build, lint, typecheck, contract, audit and CI; record blockers without waiving gates.
- [ ] Re-fetch main/plan, avoid other task branches, create Draft PR only, preserve unresolved branches, prohibit Test/Production release without full evidence.
