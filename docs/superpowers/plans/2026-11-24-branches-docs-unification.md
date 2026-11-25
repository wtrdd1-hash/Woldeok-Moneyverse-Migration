# Branch and Documentation Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task by task.

**Goal:** Preserve and integrate branch changes, establish consistent current document authority, and remove only fully integrated branch heads.
**Architecture:** Stage one main-based integration tree with branch/ref provenance and exact-head validation. Separate owner decisions, observed runtime, approved targets and historical receipts; preserve all design/QA evidence.
**Tech Stack:** Git, GitHub CLI, existing Node/Python/Java validation, Markdown and sanitized JSON inventory.
**Spec:** Owner's four instructions and approved PR3423 architecture, plus project AGENTS and release gates.

## Global Constraints
- Work on MiniPC through approved SSH; no credentials or live member records in Git.
- New frontend target is Next/React/BFF with Spring API and PostgreSQL ledger authority.
- Test-only runtime scope; no automatic Production promotion by branch cleanup.
- No force reset, force push, deletion of unintegrated heads or foreign dirty worktrees.
- Conflicting unresolved instructions require owner confirmation; continue independent analysis.

## Review Focus
- Closed/squash/stacked PR is not proof every branch commit reached main.
- Remote heads can advance between inventory and deletion.
- Historical implementation and latest approved target must remain distinguishable.
- Source version is not runtime identity or full-feature acceptance.
- Documentation changes must not trigger a runtime release.

### Task1: Complete inventory and recovery
Files: docs/qa/2026-11-24-branches-docs-inventory.json, docs/worklog/2026-11-24-branches-docs-unification.md and .ko.md.
- [ ] Capture real remote heads (exclude symbolic refs), local checked-out/dirty ownership and per-head ancestry.
- [ ] Preserve exact head IDs in local recovery refs.
- [ ] Read all unique documentation blobs and record per-path/ref/hash classification and issue candidates.

### Task2: Stage branch integration and identify command conflicts
Files: active document authority/index/plan files discovered by inventory; no runtime setting changes.
- [ ] Reconcile branch tips in dependency order without dropping unique code or migrations.
- [ ] Record exact conflicts and owner decisions before changing contradictory commands.
- [ ] Preserve date/version records with explicit historical status instead of rewriting receipts.
- [ ] Check changed paths and compare local files with original source blobs.

### Task3: Verify and integrate
- [ ] Run required candidate security, classifier, Node/Java/DB checks as applicable; failures remain blockers.
- [ ] Fresh spec and code-quality review before final integration; do not claim skipped checks pass.
- [ ] Re-fetch main/heads and resolve advancement; integrate only a green exact candidate.
- [ ] Recheck main ancestry and added-file survival for every head, then delete by expected SHA.
- [ ] Record remaining branches/dirty worktrees and final outcome.
