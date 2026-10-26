# Planning v1334 — Support Search Privacy, Normalization and Cursor Integrity
2026-10-27 KST · Feature Improvement · DRAFT / RELEASE HOLD

## Cycle and authority
Previous: Feature Addition v1332. Current: Feature Improvement v1334. Next: Feature Addition v1336 (provisional).
GitHub main at start/mid: 0fe614b2ca1a7bc0df540514e54db78130479e2a. Read canonical main AGENTS.md, README.md, PROJECT_PLAN.md, PROJECT_PLAN.ko.md; predecessor v1332 Draft #1468 is not main and is stacked on #1461. This work is a separate docs-only branch.

## Read-only source investigation
- Next.js /support/page.tsx selects ?thread or first returned, without search/filter/page UI.
- NestJS SupportController.threads uses SessionGuard, AuthenticatedGuard, ConsentGuard and SupportRepository.myThreads. Migration196 supports statuses open/waiting_user/resolved and returns newest last_message_at 50/max100; created_at/id are present, created-time index not.
- SessionRepository.AuthSessionRow has id and user_id; no session_generation. Android App API proxy supports POST.
- v1332 GET q query proposal could leak search terms to URL logs/Referer; no such search endpoint is implemented. v1334 replaces the proposed new endpoint with read-only POST + CSRF JSON, not a deployed fix.
- QA v1303: frontend 1423 PASS, typecheck/lint/build PASS, full audit 2 Critical/8 High FAIL, bot audit 1 Critical/5 High FAIL, route-ledger FAIL. Dev DB app direct DML 235/241, PUBLIC bank SECDEF 3; GitHub #1469 documents five applied migration checksum mismatches. Root98%, data91%. Exact-SHA Test and isolated restore absent, Production BLOCKED.

## Planning output and safeguards
- Nine documentation files only: 6 English/Korean plan/review/master, 2 update logs, 1 worklog. P0 four and P1 six tasks with exact IDs in each of six documents. No new dispersed feature spec file; existing integrated master is authoritative detailed proposal.
- Search body privacy, NFC/ASCII literal SQL matching, Seoul calendar bounds, 15min signed actual-session-ID cursor with upper watermark, status-race disclosure, selected-thread independent authorization, admin k>=20, Android/WCAG/SEO, 10,001 synthetic and 100 BOLA/concurrency acceptance, forward-only DB migration, OFF rollback.
- External 10,000 independent evidence gate: newly approved 0; cumulative verified/deduplicated UNKNOWN, BLOCKED/IN PROGRESS.
- No runtime, DB data/migration, WLD, ledger, Test, Production, flags or other worker worktrees changed. Exact-SHA engineering/QA and backup-restore remain release prerequisites.
- Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1472.
