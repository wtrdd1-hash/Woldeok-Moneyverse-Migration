# Admin Takedown Authentication and Action Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the redundant recent-reauthentication gate only from emergency takedown administration while retaining signed-in administrator, open admin session and CSRF protections; prevent the UI from promising automatic content erasure not implemented by the backend.

**Architecture:** Backend guard metadata controls the redundant challenge; keep all other guards. The database `safety_admin_action_takedown` currently only changes case status; the frontend must communicate that difference and must not describe status changes as physical deletion or ledger writes. Preserve higher-risk reauthentication on unrelated money and security actions pending policy approval.

**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL SECURITY DEFINER, docs EN/KO.

- [ ] Establish latest-main baseline, record pre-change SHA and reproduce existing guard requirement.
- [ ] TDD RED: update safety-controller guard test to reject an extra ReauthGuard and retain mandatory session/role/CSRF guards; execute test and observe failure.
- [ ] GREEN: change only safety action guard; execute relevant backend and frontend tests.
- [ ] Correct misleading automatic-purge and ledger wording and add negative regression assertion.
- [ ] Scan route inventory and identity/verification cross-references; keep unresolved findings separate from proven remediations.
- [ ] Record start/mid/final updates, EN+KO docs, GitHub/internal changelog, latest-main recheck, execute typecheck/tests/build, push isolated branch.
- [ ] Test candidate exact SHA in isolated Test environment with backend/API/DB/session/cleanup evidence; promote only if release gates pass.
