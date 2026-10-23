# Next.js P0 Security Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate Next.js 16.3.8 Critical/High advisories while retaining compatibility and preserving all member data.

**Architecture:** Update Next.js runtime and matched Next ESLint packages in an isolated worktree, regenerate pnpm lockfile, and verify with dependency audit, full project checks and remote CI. No API, DB or financial migration changes.

**Tech Stack:** Next.js 16, pnpm 10, TypeScript, ESLint 9, Node 24.

- [ ] Record baseline main, worktree, relevant planning, open PR and CI.
- [ ] RED: run production dependency audit against existing lockfile and record advisories.
- [ ] GREEN: update `frontend/package.json`, root `package.json`, `pnpm-lock.yaml` with compatible patched Next packages.
- [ ] Verify `pnpm audit --prod --audit-level high`, frontend tests, backend tests, lint, typecheck, build, API contract, and security checks.
- [ ] Re-check current main and re-run required gates on exact final SHA; submit Draft PR and keep release HOLD unless all required gates pass.
