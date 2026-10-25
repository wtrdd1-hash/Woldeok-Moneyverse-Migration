# Public Blog Readership Provenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development. All changes stay in the isolated C worktree.

**Goal:** Prevent public readers and API consumers from interpreting fabricated blog view counts as real engagement.

**Architecture:** The existing static/in-memory editorial store is authoritative for published article metadata but has no verified readership counter. Remove the `views` field from `BlogPost` and hub summaries, delete hardcoded/random values at their sources, and remove both UI count labels. The existing public `/api/blog` route must return articles without that property. Do not invent an analytics backend or leak administrator-only telemetry.

**Tech Stack:** Next.js 16 App Router, TypeScript, React, Vitest, Node tests.

## Tasks
1. [x] Write regression tests proving published and generated posts lack `views`, public `/api/blog` does not return it, and blog hub/detail do not render fake counts. Run tests RED.
2. [x] Update blog types, seed/editorial/generated posts and UI. Run tests GREEN; verify localized article header, 320px responsive header, focusable navigation and public SEO metadata remain intact.
3. [ ] Run lint, typecheck, targeted and full tests, build, API contract, security, isolated PostgreSQL/backend gates. Record precise failures and skipped gates.
4. [ ] Re-fetch main/plan, integrate semantic changes if advanced, verify final HEAD, create Draft PR and attach evidence; merge/deploy only on complete required PASS.
