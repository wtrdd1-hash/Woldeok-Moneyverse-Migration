# Auto Integrate Ready-PR Enumeration Implementation Plan

> For agentic workers: use the test-driven-development, using-git-worktrees, systematic-debugging and verification-before-completion skills. The candidate stays DRAFT/HOLD pending official Test exact-SHA and all release gates.

**Goal:** Fix QA P1 #1558 by ensuring open draft/WIP and disallowed PRs never trigger per-branch GitHub REST requests during automatic integration.

**Architecture:** Fetch all open-main PR pages once into a checked temporary snapshot; fail closed on API/JSON errors. Use a separately unit-tested jq policy to select only same-repository, ready, unblocked, allowlisted heads before the existing per-branch exact-SHA validation loop. Recheck current PR state, title, labels and SHA before merge; do not broaden auto-merge scope or alter release gates.

**Tech stack:** GitHub Actions YAML, Bash, GitHub CLI, jq, Node.js built-in test runner.

## Tasks / acceptance

- [x] Inspect authoritative main, AGENTS, README, EN/KO planning, QA #1558, open PRs and recent CI. Record base SHA.
- [x] Create independent B v587 worktree from exact origin/main; leave A/C/QA/Gemini branches untouched.
- [x] Write failing regression tests for 270 draft + 15 ineligible ready PRs, eligible ready and WIP filters, unknown draft, API 403 and changed head readiness.
- [x] Confirm RED before implementation; implement minimal checked pagination + jq selector and recheck.
- [x] Confirm GREEN: selector tests 6/6, release tests 62/62; Bash syntax and YAML parse.
- [x] Run full local typecheck, lint, unit tests and build; capture audit failures rather than concealing them.
- [ ] Push exact SHA, create protected Draft PR, inspect CI and exact-SHA Test; do not merge or deploy without all mandatory gates.

## Security/release constraints

No branch cleanup or merge is performed by this work. Existing workflow policy, candidate verification, merge head lock, and Production gating remain in force. Never treat a failed/partial API snapshot as zero eligible PRs. Preserve 403 as BLOCKED and keep all drafts. No DB, ledger, auth, user-data or Production changes.
