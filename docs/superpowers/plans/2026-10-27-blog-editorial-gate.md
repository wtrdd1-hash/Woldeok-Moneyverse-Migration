# Blog editorial publication truth implementation plan

> For agentic workers: use TDD, isolated worktree, systematic debugging, and verification-before-completion.

**Goal:** Prevent unreviewed AI-generated posts from being published as if editorial approval had passed.

**Architecture:** Preserve read-only public blog listing; enforce a server-side hold at the Next.js generation endpoint for both session and scheduler callers. Expose a truthful GET hold status and render the same hold in the admin UI; retain admin auth, no-store, noindex, keyboard/screenreader access.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React.

**Spec:** Standing user instruction for C P1 feature; source `frontend/src/app/blog/blog-data.ts` editorial-review gate.

## Steps
- [x] Write failing route tests: authenticated scheduler/admin POST must return 503 without invoking generation or publication; GET reports HOLD, not READY; unauthorized stays 403.
- [x] Run focused tests RED.
- [x] Enforce hold before generation and publication; remove unused imports; implement truthful status.
- [x] Write failing UI test: hold visible, generate action disabled, no invented quality metrics, accessible controls.
- [x] Run focused tests RED, update UI, rerun GREEN.
- [ ] Run full HEAD exact-SHA checks, CI and candidate, inspect main mid/end, record all PASS/FAIL/BLOCKED, Draft PR only when blocked.
