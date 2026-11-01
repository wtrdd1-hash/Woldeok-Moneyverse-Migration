# Crafting Ledger/Source Truth Hold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent unverified WLD crafting requests and fabricated success messages from Next, legacy web UI and Android app-api.

**Architecture:** Next server action returns explicit unavailable without invoking Nest. Legacy crafting panel is replaced by a read-only, accessible hold notice. Android gateway short-circuits crafting paths before proxying, with private/no-store/noindex/no-referrer problem response. Backend B #2332 independently blocks Nest and SQL; this PR must not duplicate its changes.

**Tech Stack:** Next.js 16, React 19, Vitest, TypeScript, NestJS contract, PostgreSQL read-only verification.

**Spec:** QA issue #2330 and B Draft #2332; safety-first design authorized by P0 release-hold instruction. No interactive approval possible in scheduled execution.

## Global Constraints
- Base latest origin/main in isolated `auto/hourly-*` branch; preserve other worktrees.
- No ledger/DB writes, no migration, no fake success, no Production/Test changes.
- English canonical records; Korean supporting record. Accessibility and Android HTTP privacy.

## Task 1 — TDD guardrails
- [x] Write action test: even valid recipeId never calls `mutate`, result is error.
- [x] Write panel test: no craftable/submit controls or fake burn/receipt; accessible status.
- [x] Write Android proxy test: GET/POST crafting return 503 and private headers without upstream fetch.
- [x] Run focused tests and capture expected RED.

## Task 2 — Minimal safety implementation
- [x] Replace server action with fail-closed response; keep compatible result type.
- [x] Replace legacy panel with accessible, responsive read-only source-hold notice.
- [x] Add Android crafting short-circuit before app gateway proxy.
- [x] Run focused GREEN tests and inspect diff.

## Task 3 — Verification and hold
- [x] Re-fetch origin/main and canonical plan; record drift and dependencies.
- [ ] Run focused/full frontend/backend, lint/typecheck/build, app-api, security, PostgreSQL and E2E where possible.
- [ ] Push Draft PR and English/Korean final worklog; no merge or deploy without full PASS.
