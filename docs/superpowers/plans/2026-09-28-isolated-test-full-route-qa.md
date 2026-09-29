# Isolated-Test Full Route QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce fail-closed, exact-SHA evidence for every current frontend route and its safe Test functionality before any Production promotion.

**Architecture:** Work in an isolated checkout at the latest GitHub `main` SHA. The candidate must first pass CI and be attested on `test.easy-scraping.com`; source inventory, Test-only fixture catalog, browser/API observations, and the five-pass ledger then form the acceptance record. Never perform QA mutations against Production.

**Tech Stack:** pnpm, Node.js, Next.js, NestJS, Vitest, GitHub Actions, Test systemd runtime, route-inventory and ledger verifier scripts.

**Spec:** `docs/planning/FULL_ROUTE_UI_QA_SPEC.md`

## Global Constraints

- Test only: `https://test.easy-scraping.com`; do not send mutation traffic to Production.
- Candidate SHA, Test `/api/version`, ledger, evidence, and route inventory must agree exactly.
- Every discovered route has five passes; every admin route includes `qa_admin_v1`; dynamic routes include `valid`, `not_found`, and `permission_denied` scenarios.
- A missing fixture, runtime mismatch, console/API error, or unresolved failure is `BLOCKED` or `FAIL`, never a pass.
- Preserve the current checkout's unrelated uncommitted work; use an isolated worktree for QA.

## Review Focus

- The Test runtime returns a SHA different from the candidate: stop before browser QA and record `BLOCKED`.
- A destructive action lacks a Test fixture: do not execute it; record `BLOCKED` with the missing fixture.
- A dynamic route resolves but leaks owner/admin data for an invalid role: record `FAIL` and retain request evidence.
- A responsive pass shows overflow, clipped focus, or an unreachable action at 320px or 200% zoom: record `FAIL`.
- A route appears healthy but its API response or browser console has a candidate-attributable error: record `FAIL`.

---

### Task 1: Create an exact latest-main QA workspace

**Files:**
- Read: `AGENTS.md`
- Read: `docs/operations/production-deployment.md`
- Generate: `artifacts/qa/route-inventory.json` in the isolated workspace

**Interfaces:**
- Consumes: GitHub `main` SHA and the isolated Test version endpoint.
- Produces: `candidateSha`, Test runtime identity, and an inventory generated from that candidate.

- [ ] **Step 1: Confirm the current GitHub `main` SHA and CI/Test Candidate status**

Run: `gh api repos/wtrdd1-hash/Woldeok-Moneyverse-Migration/commits/main --jq .sha` and inspect the matching Actions runs.

Expected: a completed successful CI and Build Test Candidate for the candidate SHA.

- [ ] **Step 2: Create or update an isolated worktree at that exact SHA**

Run the repository's worktree workflow without touching the primary checkout.

Expected: clean isolated worktree with `HEAD == candidateSha`.

- [ ] **Step 3: Verify the Test runtime identity before QA**

Run: `curl --fail --silent https://test.easy-scraping.com/api/version`.

Expected: returned `id` equals `candidateSha`; otherwise create one `BLOCKED` release record and stop functional QA.

- [ ] **Step 4: Generate the route inventory**

Run: `node scripts/qa/generate-full-route-inventory.mjs --output artifacts/qa/route-inventory.json`.

Expected: a candidate-specific inventory with every `frontend/src/app/**/page.tsx` route.

### Task 2: Establish Test-safe identities and fixture readiness

**Files:**
- Read: `scripts/qa/fixtures/full-route-fixtures.v1.json`
- Read: `docs/planning/FULL_ROUTE_UI_QA_SPEC.md`
- Generate: `artifacts/qa/fixture-readiness.json`

**Interfaces:**
- Consumes: current Test accounts and fixture catalog identifiers.
- Produces: auditable availability for guest, member, restricted, owner, non-owner, admin/step-up, and fault states.

- [ ] **Step 1: Verify each catalog fixture exists only in isolated Test**

Expected: no Production identity, credential, or mutation target appears in the readiness record.

- [ ] **Step 2: Map every destructive action to a reversible Test scenario**

Expected: every action is explicitly `safe`, `blocked`, or has a cleanup/replay rule; do not invent identifiers.

- [ ] **Step 3: Record fixture gaps before route execution**

Expected: missing identity or seeded state marks dependent routes `BLOCKED`, with a concrete fixture identifier.

### Task 3: Execute five full route passes and capture evidence

**Files:**
- Read: `artifacts/qa/route-inventory.json`
- Create: `artifacts/qa/full-route-ledger.json`
- Create: `artifacts/qa/evidence/<candidateSha>/...`

**Interfaces:**
- Consumes: route inventory, fixture readiness, Test runtime identity.
- Produces: one evidence-backed ledger entry per route per pass.

- [ ] **Step 1: Pass 1 — guest/member desktop baseline for every route**

Check render, heading, navigation, scroll, primary/secondary safe actions, API/console errors, refresh/back-forward, and desktop layout.

- [ ] **Step 2: Pass 2 — member/owner/non-owner mobile portrait coverage**

Use 320, 360, 375, 390, 412, and 430 CSS-pixel widths across the assigned routes; capture overflow/focus/touch evidence.

- [ ] **Step 3: Pass 3 — restricted/fault and dynamic invalid scenarios**

Exercise valid, not-found, and permission-denied dynamic scenarios; verify safe error and permission behavior.

- [ ] **Step 4: Pass 4 — administrator and step-up baseline**

Visit every `/admin/**` route with `qa_admin_v1`; verify tables, forms, dialogs, step-up, confirmation, audit evidence, and Test-safe handling.

- [ ] **Step 5: Pass 5 — tablet/landscape/zoom and regression sweep**

Cover 768/1024, mobile landscape, 200% zoom, relevant 400% reflow, and every route affected by earlier defects.

- [ ] **Step 6: Record each result immediately**

Each ledger entry includes candidate SHA, route, role, fixture, pass number, browser, viewport, runtime/API versions, result, timestamp, and evidence URI. Use `FAIL` or `BLOCKED` instead of skipping.

### Task 4: Validate evidence and report promotion outcome

**Files:**
- Read: `artifacts/qa/full-route-ledger.json`
- Read: `artifacts/qa/route-inventory.json`
- Read: `scripts/qa/verify-full-route-qa-ledger.mjs`
- Create: `artifacts/qa/summary-<candidateSha>.md`

**Interfaces:**
- Consumes: generated inventory, fixture catalog, and full-route ledger.
- Produces: a fail-closed QA summary and explicit promotion decision.

- [ ] **Step 1: Run ledger validation**

Run: `pnpm qa:route-ledger:check -- --inventory artifacts/qa/route-inventory.json --ledger artifacts/qa/full-route-ledger.json`.

Expected: zero verifier issues only when all scope arithmetic and evidence requirements pass.

- [ ] **Step 2: Run supplemental API and backend test evidence**

Run focused API contract tests and applicable E2E tests in the isolated workspace.

Expected: report test output separately from browser acceptance; neither substitutes for the other.

- [ ] **Step 3: Publish the QA outcome**

Expected: `PASS` only with exact-SHA Test evidence and no unresolved failures; otherwise `BLOCKED` or `FAIL` with affected routes and next required action.
