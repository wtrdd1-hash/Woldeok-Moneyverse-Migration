# Production Security Hotfix v2026.10.02.508 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the confirmed Production Next.js RCE exposure, restore fail-closed CI security gates, and harden the browser/API boundary before Test and zero-downtime Production promotion.

**Architecture:** Keep the existing Next.js BFF + NestJS private backend boundary. Patch the vulnerable framework version, retain public OG functionality on the patched runtime, replace deleted shell-only security gates with maintained Node checks, and apply the already-reviewed CORS policy module.

**Tech Stack:** Next.js 16, NestJS, pnpm, Vitest, Node test runner, GitHub Actions.

**Spec:** docs/planning/SECURITY_MASTER_PLAN.ko.md and docs/planning/SECURITY_ASSURANCE_MASTER_PLAN.md

## Global Constraints
- Work from refreshed origin/main in an isolated worktree.
- English is canonical; Korean companion documentation is required.
- Test candidate must be exact-SHA verified before Production.
- No destructive exploit payloads against Production.
- Production promotion must remain zero-downtime/fail-closed.

## Review Focus
- Patched Next.js version is actually resolved in pnpm-lock.yaml.
- Public OG route still returns images after the dependency update.
- CI repository scanner rejects real secrets and permits placeholders.
- CI no longer references deleted shell scripts.
- Production CORS excludes loopback and edge-owned identity headers.

---

### Task 1: Patch Next.js critical advisory
- [ ] Update frontend Next.js and matching lint packages to a patched current 16.3.x release.
- [ ] Run production dependency audit and confirm no critical/high finding remains.
- [ ] Run frontend security tests and build.

### Task 2: Restore CI security policy
- [ ] Bring in the tested Node repository security scanner.
- [ ] Add a Node control-byte scanner test first, verify RED, then implement.
- [ ] Replace deleted shell-script workflow calls with Node scanner commands.
- [ ] Run both scanner tests and scanners on the repository.

### Task 3: Apply CORS hardening
- [ ] Bring in the reviewed CORS policy test/module.
- [ ] Run the focused CORS test.
- [ ] Run backend security regression.

### Task 4: Verify and publish branch
- [ ] Re-fetch origin/main and reconcile if it moved.
- [ ] Run lint, typecheck, full tests, build, and production dependency audit.
- [ ] Write internal/GitHub update notes and worklog v2026.10.02.508.
- [ ] Push branch and open PR.
- [ ] Require successful exact-SHA Build Test Candidate before integration.
