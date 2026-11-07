# Public Board Title Ordering Implementation Plan

> **For agentic workers:** Follow test-driven development, verification before completion, and isolated-worktree discipline. This run uses an approved autonomous P1 scope with conservative release HOLD.

**Goal:** Let visitors sort the latest 50 public board posts by exact UTF-8 title order without changing the existing default or disclosing private data.

**Architecture:** Extend the existing public PostgreSQL SECURITY DEFINER function read path with an optional, whitelisted ORDER BY over its bounded 50-row output. Preserve Nest defaults, verify explicit response proof in Next SSR and Android app gateway, and apply no-store/noindex to query-specific pages.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, TypeScript, Vitest, pnpm.

## Task 1 — Backend and SQL
- [x] RED tests for unknown/repeated sort, SQL bounded ordering and empty response proof.
- [x] Add optional `sort=title`, SQL `COLLATE "C"`, UUID tie-breaker; preserve default behavior.
- [x] Targeted backend tests GREEN; full backend suite pending.

## Task 2 — Frontend and Android
- [x] RED SSR/parse/gateway tests.
- [x] Add accessible GET sort, SSR verification, Android validation and HTTP privacy headers.
- [x] Targeted frontend tests GREEN; full frontend suite pending.

## Task 3 — Contract, review and release
- [x] Regenerate 184 endpoint mobile API contract and bilingual schema reference.
- [x] Initial and midpoint main/PR/branch/CI audits; do not delete unique branches.
- [ ] Final exact SHA full test/build/lint/typecheck/security/real PostgreSQL/Android/E2E gates.
- [ ] Exact-SHA official Test, authenticated flow, independent restore and GitOps release gates. If unavailable, keep Draft/HOLD and prohibit Production deployment.
