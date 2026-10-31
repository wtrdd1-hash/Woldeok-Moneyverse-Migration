# Fast URI Security Floor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the vulnerable `fast-uri@3.1.8` dependency resolution reported by full dependency audit.

**Architecture:** Upgrade the root pnpm override and lockfile to 3.1.9. Strengthen the existing lockfile security regression. No API, SQL, or money mutations.

**Tech Stack:** pnpm 10, Node 24, node:test.

**Spec:** `docs/planning/PROJECT_PLAN.md` P0 release gates and QA v1409 audit.

## Task 1
- [x] Raise fast-uri regression floor and run RED.
- [x] Upgrade root override and lockfile to 3.1.9.
- [x] Run GREEN and re-audit; 0 fast-uri advisories.

## Task 2
- [x] Run applicable build/lint/typecheck/unit/contract/security gates (PASS; full audit still FAIL).
- [x] Re-fetch main, check CI (Next font loader FAIL) and overlapping PR #2115.
- [x] Open Draft/HOLD PR #2120; no merge/deployment until official Test exact-SHA gates pass.
