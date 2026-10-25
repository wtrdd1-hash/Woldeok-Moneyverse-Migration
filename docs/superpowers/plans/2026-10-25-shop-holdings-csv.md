# Verified Member Shop Holdings CSV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let signed-in members export only their database-verified own shop holdings as a safe, accurate CSV.

**Architecture:** Reuse shop_my_items_v2(actor) under the existing least-privilege application role. Expose a bounded, owner-authenticated JSON export through NestJS; Next converts it to escaped CSV without caching or fallback; Android app-api proxies the same authenticated JSON.

**Tech Stack:** NestJS, Next.js, TypeScript, PostgreSQL SECURITY DEFINER, Vitest.

**Spec:** docs/planning/INTEGRATED_PLANNING_MASTER.md financial truth, auth, privacy and release constraints; existing Store 2.0 shop holdings contract.

## Global Constraints
- No existing applied migration edits or financial writes.
- Never export another member's inventory; no request actor parameter.
- No CSV formula injection; no success on API failure, invalid schema or truncated data.
- Private no-store/noindex, server-only API credentials, app-api contract parity.
- All CI and official exact-SHA Test gates required before merge/deployment.

## Tasks
- [x] Read latest main and policies, audit other branches and select non-overlapping P1.
- [x] Create isolated worktree at exact origin/main.
- [x] RED: backend auth, CSV escaping/schema and Android gateway tests.
- [x] GREEN: guarded backend export, safe CSV builder, private Next handler, member CTA.
- [ ] Run focused tests, build/lint/typecheck, real isolated PostgreSQL read and ACL, security checks.
- [ ] Recheck main and integrated EN/KO plans, review diff and CI, record release HOLD if any gate fails.
