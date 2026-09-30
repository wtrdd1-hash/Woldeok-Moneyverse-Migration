# v2026.10.01.489 — Security reference and assurance audit worklog

Status: AUDIT_IN_PROGRESS / docs-only
Date: 2026-10-01
Start `origin/main`: `9740265592a60ab3811f67af02950f2e84d764d1`
Branch: `docs/security-audit-v2026.10.01.489`
Scope: current security references plus repository/runtime assurance review; no runtime mutation is authorized by this audit.

## Start record
- Read current documentation governance, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, SECURITY_MASTER_PLAN, SECURITY_ASSURANCE_MASTER_PLAN, AUTHENTICATION_SECURITY_PRIORITY_SPEC, AGENTS and runtime baseline.
- Reserved v489 because a concurrent v488 planning branch already exists; do not overwrite concurrent work.
- External primary references to recheck include OWASP Top 10:2025, OWASP ASVS 5.0, OWASP API Security Top 10:2023, NIST SP 800-63B-4, NIST SSDF, PostgreSQL 17 function security, GitHub Actions security and Debian security guidance.
- Priority review lanes: authentication/session/cookies, API authorization and exposure, PostgreSQL SECURITY DEFINER/grants, CI/CD supply chain and secrets, host/network/service hardening, browser headers/CSP, rate/resource controls.
- Findings require concrete source/runtime evidence; previously documented wildcard binds are not called Internet-exposed without current firewall/reachability evidence.
- Planning/runtime/Test/Production status will remain separated.

## Mid-work record
- Mid-work `origin/main` moved to `34dddce057df97ca745d5cf580b5eda12b1b6a8d`; merged into the audit branch before findings were finalized.
- Read-only host evidence confirmed wildcard PostgreSQL 5433 publishing, permissive effective SSH settings, weak systemd sandboxing on primary units, absent unattended-upgrades and arbitrary-Host HTTP 200 behavior on the default Nginx virtual host.
- Current-tree `scripts/check-secrets.sh` passed. Ten of twenty GitHub Action references in the server workflows remained mutable tags rather than full-SHA pins.
- Android `main` baseline `e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3` confirmed HTTPS/host pinning, encrypted storage and backup blocking, plus the private-scheme OAuth handoff and signing-config findings.
- No runtime setting was changed and no secret value was intentionally emitted.

## Final-main recheck and end record
- Before integration, `origin/main` moved again to `597c6029a8539d501e3c554582552cb761feab6c`; merged it into the audit branch.
- Re-reviewed the new floating support-chat/audio runtime delta. Support writes retain CSRF + idempotency, API thread IDs are encoded in fetch paths, and message bodies render as React text rather than raw HTML; no new P1 was added.
- `git diff --check` initially found Markdown hard-break trailing whitespace only in the new audit files; those lines were normalized before final verification.
- Findings: 5 P1 and 9 P2 items, with explicit uncertainty around public-Internet reachability of host listeners.
- No Test deployment, Production mutation or Production promotion was performed because v489 is documentation/audit evidence only.

## End state
READY_FOR_DOCS_PR
