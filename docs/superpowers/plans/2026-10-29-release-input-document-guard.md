# Release-input document executable guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development, with systematic-debugging and verification-before-completion.

**Goal:** Prevent documentation-labelled executable payloads, symlinks and mode changes from suppressing runtime release verification.

**Architecture:** Extend the existing release classifier to distinguish safe documentation data from potentially executable or non-regular Git entries, using both diff paths and Git tree metadata. Fail closed as `UNKNOWN` without bypassing existing candidate/release checks. Do not modify database or deployment.

**Tech Stack:** Node.js built-in test runner, git plumbing, GitHub Actions.

**Spec:** `docs/planning/PROJECT_PLAN.md` REL-DOCS-165/166 and `docs/planning/INTEGRATED_PLANNING_MASTER.md`.

## Global Constraints
- Preserve main and other contributors' worktrees/branches; no direct Production mutation.
- No applied migration changes; do not relax existing CI/release gates.
- Classifier evidence remains exact repository HEAD SHA; unknown classification blocks build/promotion.

## Task 1 — Failing adversarial regression
- [ ] Add synthetic Git tests for docs executable extensions, symlink, chmod +x, deletion, mixed paths, and safe Markdown.
- [ ] Run targeted tests; capture the expected RED failures.

## Task 2 — Fail-closed implementation
- [ ] Reject potentially executable docs paths in `classifyPaths`.
- [ ] Validate changed docs tree entry modes at both base and head in `buildReleaseInput`.
- [ ] Run targeted tests to GREEN; run existing classifier regression corpus.

## Task 3 — Review and verification
- [ ] Re-read current main, English/Korean plans, open PRs and latest QA.
- [ ] Run lint/typecheck/build/test/CI as feasible; record precise failures and skips.
- [ ] Draft PR with test evidence; no merge/deploy without exact-SHA official Test and full release gates.
