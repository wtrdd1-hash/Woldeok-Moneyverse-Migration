# Admin Console + Global Round Support Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. This iteration implements a standalone proof, never deployed.

**Goal:** Provide attachable admin desktop/mobile concepts and an executable, accessible, page-wide floating customer inquiry/DM preview without editing the existing frontend.

**Architecture:** A documentation-contained HTML/CSS/ES module preview. A pure JS state/validation core is tested with Node's built-in test runner; the DOM demo shows simulation only, and routes are simulated with navigation without network mutations. A subsequent production integration requires separate security approval.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Node 24 native node:test, SVG, Python XML validation.

**Spec:** docs/planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.md

## Global Constraints
- Strictly no modifications to frontend/, backend/, spring-backend/, apps/, DB, Nginx, workflows, live services.
- English canonical + Korean companion. The prototype can use Korean for project owner review.
- Synthetic sample data only; demo messages NEVER sent, not stored to localStorage, no client identity headers.
- Route context limited to a safe section category, not tokens, slugs or query strings.
- Existing Spring support/chat identity and false-success flaws must not be used as accepted production APIs.
- Mobile 320px, 44px hit targets, aria labels, Escape/focus restoration; no overlapping chat/bottom navigation.

## Review Focus
- Route `/admin/users/UUID?token=x` cannot leak UUID or query; only `admin` category remains.
- Empty/whitespace and >1000-character input cannot be submitted.
- Demo submissions cannot announce successful delivery or create real API calls.
- After simulated page switches panel stays open and in-memory draft is preserved; never stored persistently.
- Guest, access denied, unavailable and account change must not display another user's private thread data.

## Tasks
### Task 1: Write pure state and validation tests (RED)
- [x] Create `preview/chat-core.test.mjs` with URL category sanitation, form input bounds, login gate, no-success simulation, mobile launcher offset assertions.
- [x] Run `node --test ...` and verify failing import or assertions, recording RED.

### Task 2: Implement pure state and validation (GREEN)
- [x] Implement `preview/chat-core.mjs`: route category, draft validity, layout placement, simulated submit outcome (never sent), account reset.
- [x] Run all tests; 0 failures; refactor as appropriate.

### Task 3: Build standalone admin and global bubble interface
- [x] Create `preview/index.html`, `preview/styles.css`, `preview/app.mjs`; no external libraries.
- [x] Build admin overview with demo data, navigation across home/wallet/quests/board/admin, float bubble, support/DM tabs, safe DOM text rendering, keyboard and focus, mobile.
- [x] UI must label simulation and never call a real backend; no localStorage persistence.

### Task 4: Design references and planning authority
- [x] Create desktop/mobile reference SVGs and verify XML parse.
- [x] Add bilingual spec to `PROJECT_PLAN` and `INTEGRATED_PLANNING_MASTER` via a short version header, including image Markdown attachments.
- [x] Add worklog start/mid/end, public GitHub/internal updates and changelog, then check latest main SHA and concurrent PRs.

### Task 5: Test/PR handoff
- [x] Node tests, Python SVG/XML + missing asset + screenshot marker tests and `git diff --check` all pass; verify original frontend untouched.
- [x] Serve preview on loopback isolated ephemeral HTTP endpoint and check it responds, without touching running Nginx/Spring or public Test.
- [ ] Push isolated branch and create DRAFT stacked PR targeting the prior design branch; never merge or deploy on this iteration.
