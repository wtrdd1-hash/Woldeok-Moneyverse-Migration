# Cross-repository conflict and release-gate audit — v2026.11.25.001

**Status:** IN PROGRESS / RELEASE HOLD (documentation-only evidence)
**Scope:** web/server `Woldeok-Moneyverse-Migration` and Android `woldeok-moneyverse-app`.
**Baseline:** web `main` `9876c09888ec84034eec183cf1309c85df3d7447`; app main inspected via connected GitHub; exact app HEAD not independently captured.
**Evidence classification:** source/document inspection only, not a complete repository-wide semantic audit and not a running Test/Production acceptance.

## START — authority and safety boundary

- Read and cross-checked the web `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/CURRENT_DOCUMENTATION_STATUS.md`, `AGENTS.md`, `PROJECT_MEMORY.md`, `README.md` and app `docs/DOCUMENTATION_POLICY.md`, `docs/PROJECT_OPERATING_INSTRUCTIONS.md`, `docs/README.md`.
- Current authority: merged web project plan > integrated planning master > explicitly adopted specifications > version-specific source/runtime evidence > historical logs. A document cannot prove a deployment by itself.
- Connected Desktop Commander listed `debian13`, `minipc`, and `weoldog` **offline**. No shell, service status, private DB, test backend, signed-in session, or test environment was accessible. No test, security, migration, or deployment claims are authorized.
- This is an **incremental conflict register**, not a statement that all tracked documentation has been read end to end. A previous dated inventory counted 4,909 web Markdown/MDX and 59 app Markdown files; those are historical counts, not a new scan.

## Verified documentation conflicts and drift

| ID | Priority | Source A | Source B | Finding / disposition | Status |
|---|---|---|---|---|---|
| C01 | P0 | Root `AGENTS.md` describes active Next.js/NestJS/PostgreSQL rebuild | root `README.md` and current project plan describe Spring Boot 3.3.5 and Spring-native migration | **Architecture documentation drift**. No blanket source/runtime claim until checked against current Java build, entrypoints, dependency lock and deployed exact SHA. Product plan + exact runtime evidence govern. | OPEN |
| C02 | P0 | `PROJECT_MEMORY.md` says documentation-only commits to main allowed and immediately fast-forward merged | `docs/DOCUMENTATION_POLICY.md` §4 prohibits direct main docs commits except emergency | **Direct process contradiction**. Current documentation policy wins; isolated branch and reviewed PR. Preserve history. | RESOLVED AS RULE; historical reference needs annotation |
| C03 | P1 | `PROJECT_MEMORY.md` tells contributors to follow `docs/PROJECT-DOCUMENT-POLICY-KO.md` | that file says SUPERSEDED by `docs/DOCUMENTATION_POLICY.ko.md` | **Superseded-policy pointer**. Redirect future instructions; do not erase old evidence. | OPEN |
| C04 | P0 | web project plan/master frontdoor says owner-approved maintenance 503 and dedicated frontend Test/Production inactive as of Nov 21 | historical partial production/home acceptance notes and root README showcase | **Time/version scope ambiguity**. A partial old production receipt cannot imply current whole-site readiness. Validate actual endpoints and immutable release SHA before calling availability. | OPEN / RUNTIME BLOCKED |
| C05 | P0 | approved Nov 18 navy/violet 180-route UI and five-language planning in web project plan/master | prior design snapshots and independent unfinished frontend implementations | **Potential visual/spec divergence**. Old designs remain archived, not silently deleted; route-by-route screenshot and real authenticated state required. | OPEN / TEST BLOCKED |
| C06 | P0 | DB `SECURITY DEFINER` and restricted runtime grants documented in `AGENTS.md` and README | later Spring services, migration candidates and historical ORM terminology | **Compatibility/security verification gap**, not proof of a code defect. Reconcile exact migrations/functions/grants against Java adapters and app endpoints using isolated DB. | OPEN / DB BLOCKED |
| C07 | P1 | app `docs/PROJECT_OPERATING_INSTRUCTIONS.md` asks for one combined planning+QA document | web documentation governance separates current plan, evidence, worklog, release and update records | **Cross-repository organization conflict**. Web authority remains canonical; use this single cross-cutting register for decisions while keeping linked evidence in policy-defined directories. | OPEN |
| C08 | P1 | app legacy `docs/APP_SPEC_AND_USER_GUIDE.ko.md` and `docs/api/` snapshots | app `docs/DOCUMENTATION_POLICY.md` explicitly marks them historical/subordinate | **False-current-document risk**. Compare actual app API/client types, version headers, auth and finance parity before adopting old values. | OPEN |
| C09 | P1 | `docs/CURRENT_DOCUMENTATION_STATUS.md` captures Nov 11 production 200 and Test 502 | Nov 21 project-plan frontdoor captures later maintenance and Test blockers | **Snapshot staleness**, not an automatic contradiction in observed facts. Mark dated records historical; never report Test operational based on old QA. | OPEN |
| C10 | P0 | explicit user instruction: approved and nonconflicting transformation in Test first | historical migration/workflow procedures and live member ledger | **Approval boundary**. No production records cloned into test without approved sanitization; no write-mode migration before dry-run and exact user-approved scope; no production promotion on docs-only evidence. | BLOCKED |

## MID — release and data conversion gate

1. Re-fetch web and app main and compare changes since baseline, reconcile any concurrent Gemini PR/worktree ownership. Never overwrite unrelated work.
2. Produce deterministic document inventory, link validation (exclude legitimate routes), language pair classification, duplicate/obsolete-authority classification and machine-readable conflict matrix across BOTH complete repositories. Record precise paths and line evidence. This is **not yet executed**.
3. Inspect current Java/Spring, Next/legacy, Android Kotlin API consumers, Gradle lock/build and deployed runtime manifest. Check 180-route coverage, five languages (EN default, KO second), Nov18 responsive visuals, login (Google, Discord, native), consent, token/session/CSRF, admin RBAC and real data provenance.
4. Set up a **separate Test backend+frontend+database** without sharing production writable DB or secrets. First probe service health/version, then run builds/unit/integration/contract tests, deterministic Playwright browser/screenshot QA and authenticated role-based E2E. Include no direct mutable production tests.
5. Data conversion: inventory source/target schemas; owner-approved field/table scope; anonymized fixture; snapshot/backup and restore rehearsal; dry-run; row counts/checksums/foreign keys; idempotency and balance reconciliation (`sum(debits)=sum(credits)`), privilege negative tests, PII/consent retention checks, repeat/reversal/rollback and signed receipt. **No transform approved by the report alone**.
6. Security: secret scan, dependency/SBOM checks, SQL injection negative tests, CSRF, OAuth state/PKCE, cookie flags, horizontal/vertical auth, internal API token boundary, least-privilege database permissions, rate limit and logging redaction.
7. Release: fail closed unless exact candidate SHA in isolated Test has full QA/security/DB signoff, safe backup/restore, rollback drill, independent test/production processes, and blue-green/canary zero-downtime health/observability gates. Do not promote while any P0 is open.
8. Post-release: validate exact production SHA, sessions/auth, ledger integrity, real API data and UI, and retain rollback. Record versioned internal and GitHub-facing English/Korean updates.

## CHECKPOINT / FINISH

- This report is a **GitHub source review and test plan**, not a test execution receipt.
- No code, schema, service, Test, or Production was modified.
- Remaining: full file-by-file documentation inventory, exact app HEAD and main recheck, connected minipc, independent test environment, runtime QA/security/data-conversion authorization, PR review and guarded promotion.
- Release decision: **HOLD**. Do not turn this report or PR into an automatic deployment.
