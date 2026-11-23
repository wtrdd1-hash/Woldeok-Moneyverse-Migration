# Strict Test-to-Production Promotion Policy

[한국어](STRICT_TEST_TO_PRODUCTION_GATE.ko.md) | **English canonical**

> Policy version: v2026.11.23.1
> Status: PROPOSED — not enforced until merged and configured in CI/CD/host permissions
> Scope: website, Spring backend, UI, APIs, database/schema, authentication, finance, bot integrations and infrastructure

## Governing rule: deny by default
Production is immutable. No human, agent, scheduled job, or deployment script may directly edit running production source, assets, service configuration, Nginx routes, DB schema/rows, feature flags, or release pointers outside an audited, approved release transaction. No `git pull/reset/checkout`, in-place file edits, ad hoc SQL, direct process swaps, or unreviewed restarts on the live release. A documentation-only commit must never trigger deployment. Owner requests to deploy establish **intent, not evidence** and never waive technical gates.

The live-runtime source of truth must be checked afresh against [runtime baseline](../CURRENT_RUNTIME_BASELINE.md), [canonical release guide](../RELEASING.md), [production procedure](production-deployment.md), [master plan](../planning/INTEGRATED_PLANNING_MASTER.md) and [project plan](../planning/PROJECT_PLAN.md). Historical Flux/Compose/Node guidance must not override the actively observed Debian systemd/Nginx and approved Spring migration direction. When documents conflict, stop and reconcile authority first.

## Mandatory promotion sequence (G0–G9)
| Gate | Requirement | Block condition |
|---|---|---|
| G0 Ownership | Log task/version, owner, files, start main SHA, conflict lock and current planning; assign separate branch | Unowned change, concurrent collision, outdated planning |
| G1 Change review | PR with scope, risk, dependency/API/DB impact, paired EN/KO docs, internal/public change logs; 2 reviews for privileged changes (owner plus independent technical reviewer, where distinct persons available) | Self-only privileged approval, missing diff, secrets, unreviewed direct main |
| G2 CI | Exact commit: build, lint/static analysis, complete unit/integration/contract tests, dependency/SAST/secret scanning, Spring security, authorization negatives, migration checks; required checks cannot be skipped | Any failed, missing, cancelled, stale or skipped required check |
| G3 Isolated Test | Deploy immutable artifact from exact SHA to isolated official Test; confirm frontend/backend/process/manifest identity and authoritative test DB; no fake response or mock substitute for real integration | Test unreachable/403, mismatched identity, production DB cross-connection, incomplete evidence |
| G4 End-to-end QA | Test actual user/admin routes, real non-production API read/write and DB outcomes, Google/Discord/local login and consent, session persistence, finance ledger/idempotency/concurrency, responsive Nov18 violet UI, 5 locales and accessibility | Any P0/P1, fake data, visible UI mismatch in changed scope, insufficient role-positive/negative evidence |
| G5 Data recovery | Verified recent backup and restore drill before risky schema/data change; irreversible migration requires compatibility / forward correction plan, operator acknowledgement and ledger reconciliation | Missing checksum/restore proof, untracked schema change, destructive action |
| G6 Change freeze + authorization | Re-fetch main and master documents; reconcile competing Gemini/GPT PRs; retest final merged source SHA; produce release record and explicit owner **release-specific** approval after evidence is presented | Earlier blanket approval, main drift, missing accountable owner, unapproved scope |
| G7 Canary | Prepare fresh immutable generation alongside live, retain last-known-good, verify health, real auth session continuity, Nginx configuration and rollback readiness; shift traffic gradually only via protected deploy identity | Restarting sole healthy process, untested rollback, split frontend/backend SHA |
| G8 Production acceptance | Verify public edge + direct origin version, readiness, authenticated critical API, session, finance fail-closed boundaries, visual smoke and logs; monitor 30 minutes minimum (longer for finance/schema) | New 5xx, auth failures, data mismatch, security alert, wrong SHA, failed monitor |
| G9 Closeout | Write exact SHA, artifact digest, Test evidence links, approvers, cutover time, post checks, rollback reference and internal/public EN/KO worklogs | Missing audit trail -> release remains unaccepted |

**No automatic test-to-production promotion.** Automation may prepare a candidate but protected Production Environment approval must be granted for this *specific release* only after all G0–G6 evidence is signed. CI green, an old approval, a passing local test, or Test being unavailable are not exemptions. Any failed or unknown gate = `BLOCKED`, not `PASS`. Documentation-only work does not require runtime Test but must never be marked `TEST_VERIFIED` or `PRODUCTION_VERIFIED`.

## Enforceable controls required
1. Protect `main`: no direct push/force push, mandatory PR, code-owner reviews, stale-review dismissal, latest-head successful required checks, merge queue/serialized integration, signed audit where available.
2. Protect GitHub Environment `production`: named reviewers excluding initiating actor when feasible, prevent self-review, restrict deployment to protected main/tag, lock deployment concurrency, require unique release approval.
3. Production host: separate read-only diagnostics from least-privilege deployment identity; deny interactive edits to release directory; immutable SHA-qualified directories; restricted `sudo` allowlist; audit every Nginx/systemd/pointer change. Emergency break-glass uses separate scoped authorization, ticket and immediate review, not a quiet bypass.
4. Test must use isolated DB and separate secrets; prohibit production credentials in CI/Test logs; deny network access to production DB from Test where feasible.
5. CI jobs must bind source SHA + built backend/frontend artifact hashes to the Test evidence and Production release. Recompute after main moves; protect audit/evidence from tampering.
6. Only one promotion transaction at a time; require explicit rollback command/procedure and last-known-good artifact before the cutover.
7. For financial or identity changes, independent security/DB/ledger evidence is obligatory even if scope seems small.

## Automatic stop and rollback
Before cutover: freeze the candidate and return `BLOCKED`; do not modify Production. During canary or within the observation window: stop traffic increase and roll back application/config pointers to a verified compatible generation if P0/P1, SHA drift, elevated errors, login/session loss, data integrity risk, or security alert appears. Preserve session, DB, audit and ledger rows. **Never blindly roll back destructive migrations or restore the production database**; isolate writes and follow an explicitly verified recovery plan.

Emergency P0 response may restore a previously certified safe generation using the separate break-glass path with owner+operator recorded, backup, change diff, timeline and retrospective within 24 hours. Emergency response does not authorize untested new features.

## Release evidence form
- Version / task / ticket / change owner / start, mid, final main SHA:
- GitHub PR and independent reviewers / release-specific owner approval timestamp:
- Source SHA / backend+frontend digest / immutable directory / manifest:
- Official Test URL, observed source SHA, authorized DB identity, evidence of real API writes/reads:
- CI matrix (including failures and skips), UI five-language/PC/mobile results, login/session/finance results:
- Backup ID/checksum, restore drill, migration dry-run and rollback compatibility:
- Canary start/traffic steps, Production observed SHA, 30+ minute monitoring results, error baseline:
- Rollback target / incident reference / end state (BLOCKED, TEST_VERIFIED, PRODUCTION_VERIFIED):

## Scope and adoption
This document sets a *proposed stronger gate*, not a claim that current GitHub protection rules, CI workflows, Test service or host ACLs already implement it. First merge this bilingual policy through a reviewed docs PR; then implement and independently verify protection settings and workflow scripts in separate PR(s). Until enforcement is evidenced, treat Production change authorization as frozen for unverified candidates. Track outstanding November 18 UI and full authenticated end-to-end QA as blockers rather than papering them over.
