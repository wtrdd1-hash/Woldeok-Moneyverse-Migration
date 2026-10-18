# v2026.10.18.901 — Independent full-function live recheck

**English canonical** | [한국어](2026-10-18-full-function-recheck-v901.ko.md)

## Before work — 2026-10-18 KST
- User again requests all functions be verified (last message trails off after '그리고'). This run treats audit as all-feature, with banking priority; no unstated production promotion authorization inferred.
- Starting `origin/main=fe689c4bcd9acdea40755f9ff08ba446bdeeb1c8`, Production/Test publicly serve `e54e6843df27e01c00e0d409ddb9818f754d2c4c` at initial observation; they are not latest main.
- Prior v851 / v852 audit PRs #931 / #932 were closed without merge. v804 permissions and v806 bank deposit routing have since merged; re-test actual rather than reusing prior findings.
- Governing docs: `AGENTS.md`, `DOCS_INDEX.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/PROJECT_PLAN.md`, `docs/DEVELOPMENT_STATUS_AND_MASTER_REFERENCE.ko.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/RELEASING.md`, `docs/api/02-wallet-and-banking.md`, v804/806 release notes. Other agents have active worktrees; never alter shared root untracked QA scripts.
- Will use isolated source, authenticated requests only when safe fixtures exist. **NO Production user money writes, retries, privilege change, live schema change, release switch, or mislabeling of 200 as authenticated success.**

## In progress
- Validate runtime identity, current DB finance gate, source/DDL mismatch, all feature route QA and candidate build/test.

## Finish
- Pending independent evidence.
