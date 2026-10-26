# Planning v1336 — Private Support Evidence Attachments
2026-10-27 KST · Feature Addition · DRAFT / RELEASE HOLD

## Cycle and authority
Previous Feature Improvement v1334 → Current Feature Addition v1336 → Next Feature Improvement v1338 (provisional).
Canonical GitHub main at start: `0fe614b2ca1a7bc0df540514e54db78130479e2a`; read main AGENTS.md, README.md, PROJECT_PLAN.md English canonical and PROJECT_PLAN.ko.md. This docs-only worktree stacks on unmerged v1334 Draft PR #1472; never merge this child directly into main.

## Before work — verified source and safety
- Floating member support widget and admin support view POST images through generic `/app-api/v1/content/chat/upload` and append returned `/api/v1/content/chat/media/<key>` URLs to the text body. `/support` page lacks upload UI.
- Generic chat media GET has no Session/Authenticated/Consent guard and returns `Cache-Control: public, max-age=86400, immutable`; no support-thread binding in Migration 196. This is a code-level privacy/access-control risk, NOT proof of Production exposure or exploit.
- QA v1304 evidence: frontend 1,423 tests passed; typecheck/lint/build/API contract passed; full dependency audit and bot audit failed; route-ledger report `ok=false`; development app DML 235/241, three PUBLIC bank SECDEF functions, five applied migration SHA mismatches #1469. Root 99%, ~1.9GiB free; data 92%, ~17GiB free. Official authenticated exact-SHA Test and isolated restore unverified; Production RELEASE HOLD.
- Independent external 10,000 reference gate: newly accepted 0, cumulative approved/deduplicated UNKNOWN, BLOCKED / IN PROGRESS. Existing user-owned/worker worktrees, files, Docker volumes and runtime untouched.

## In progress — planned deliverables
- [ ] Inspect source and update official EN/KO project plan, integrated master, product feature review, and integrated review; preserve existing details and no new dispersed feature specs.
- [ ] Define owner-scoped private evidence staging, AV/metadata stripping, atomic DB message link, orphan handling, safe binary retrieval, Android/admin UX, WCAG/SEO/KPI, tests/rollback.
- [ ] Re-fetch main and canonical plan mid-run; verify no drift, record QA changes and external evidence count.
- [ ] Create draft PR, verify docs-only delta, append final evidence and GitHub/internal logs.

## GitHub task
- Development planning issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1475.
- Draft PR: pending.

## Release restrictions
No runtime code, SQL migration execution, DB rows, WLD/ledger, feature switches, Test/Production or other Gemini/A/B/C/QA files are changed. Any implementation needs its own branch, reviewed spec, isolated PostgreSQL negative authorization tests, exact-SHA Test E2E, backup restore and authorized GitOps release. New functionality remains OFF.
