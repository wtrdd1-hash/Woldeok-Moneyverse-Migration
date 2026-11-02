# C v1324 — Password-reset request provenance (canonical)
## BEFORE WORK — 2026-11-03 07:15 KST
- Baseline: f5c3fbedae1c3b3ec2374882b049aac43a655eb4 (origin/main).
- MiniPC Debian 13.6; seven core services active, development DB connected.
- Read AGENTS.md, README.md, README/README.ko.md, both PROJECT_PLAN documents; reviewed open PRs/branches, A/B, planning, QA and CI. No open PR targets password-reset request feedback.
- Verified defect: /forgot-password?sent=1 displays a success-like claim without a request; action catches any Nest failure and redirects to the same claim. Nest returns {accepted:true} for both known and unknown emails and intentionally suppresses mail delivery failures for enumeration resistance.
- Scope: a verified *request acceptance*, not a mail-delivery receipt. Preserve indistinguishability of account existence and avoid disclosing user email. No database grants/migrations.
- Plan: RED tests for spoofing, error, malformed receipt and accepted receipt; implement a server action + client useActionState; keyboard/AT response; noindex/private HTTP; run exact-SHA gates; never promote on incomplete gates.
- Stage: BEFORE; TDD tests pending.

## IN PROGRESS — 2026-11-03 07:18 KST
- RED: 13/13 focused cases failed against original action/query-based success flow.
- Implemented server action receipt validation; API exceptions and malformed receipts are UNAVAILABLE, never success.
- Client form uses useActionState, 44px targets, pending guard, accessible live status, and no address/secret echoes.
- Backend {accepted:true} contract intentionally remains non-enumerating; do not confuse acceptance with email delivery.
- Added explicit six-locale noindex/private/no-referrer HTTP policy.
- Next: focused tests and main recheck; no merge until release gates.
