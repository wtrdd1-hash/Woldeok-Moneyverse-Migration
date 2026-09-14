# Worklog — Integrated Release Governance & Feature Evidence Audit

> Version: v2026.09.15.104
> Date: 2026-09-15
> Runtime changes: none

## Ordered work

1. Researched current official Google Search Central, Naver Search Advisor, OWASP ASVS/API Security and FTC consumer-protection references before planning.
2. Read the latest `main`, `PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`, current workflow configuration and implementation evidence.
3. Audited Production public home, `/guide`, and `/status` from the consumer/operations perspective.
4. Reproduced the stale unlimited profession-work reward statement in Production `/guide`.
5. Compared normative promotion requirements against actual CI, candidate-build and Production-release workflows.
6. Found that current Production gate directly proves exact test SHA, non-empty public shop catalog and root noindex, but does not directly prove all documented promotion evidence such as isolated-test DB migration parity/checksum, authenticated critical-flow QA and rollback readiness.
7. Verified `main` protection metadata currently has required-status-check enforcement off/empty; recorded this separately from the Production gate.
8. Rechecked `main` mid-work before documentation writes; it remained `3bfa41ce6c251b707254c09f7c3504d1e5245d28`.
9. Updated the English canonical and Korean Living Plan with v104 detailed contracts.
10. Added EN/KO changelog and EN/KO worklog. No runtime branch, API, DB, migration or infrastructure was modified.

## Main evidence

- Starting/mid-work SHA: `3bfa41ce6c251b707254c09f7c3504d1e5245d28`.
- CI includes secret/control-byte checks, clean lint/typecheck/build, PostgreSQL migration/application tests and high-severity production dependency audit.
- Test candidate workflow calls CI and publishes immutable `${SHA}-test` images with SBOM/provenance; test frontend has indexing and ads disabled.
- Production release waits for exact test SHA and tests public catalog + root noindex before emitting `production-ready`.
- Branch protection is enabled but required status checks are not currently enforced by the branch metadata observed in this run.
- Legacy combined commit status for the starting SHA returned `pending` with zero individual statuses; the available PR-triggered workflow-run lookup returned no run. These facts are recorded as verification unavailable, not a CI failure.

## Runtime evidence

- Production public home, guide and status were reachable.
- Public status reported web, economy API and ledger DB healthy at its latest recorded snapshot.
- `/guide` still states profession work is repeatable without a daily limit and pays full WLD/EXP each time, conflicting with the documented authoritative daily-limit implementation.
- Authenticated economy/user flows were not independently executed in this documentation run; runtime verification remains partial.

## External reference decisions

- Google Search Central: direct adoption for canonical, crawlable content, sitemap/lastModified and duplicate URL policy.
- Naver Search Advisor: direct adoption for user-helpful SEO, unique title/description, crawlable resources and sitemap/feed/index monitoring.
- OWASP ASVS 5.0.0: direct adoption as the technical verification baseline.
- OWASP API1:2023 BOLA/current authentication guidance: direct adoption for server object authorization, negative tests and session/auth testing.
- FTC 2026 subscription/negative-option enforcement and policy work: consumer-protection reference and product guardrail for any future real-money recurring billing; not treated as automatic jurisdictional applicability to every Moneyverse flow.

## Planning changes

### P0

- `QA-104-01`: profession-work quota copy/runtime contract drift remains OPEN.
- `REL-104-02`: release automation evidence gap; add fail-closed isolated-test migration/auth/economy/rollback evidence before `production-ready`.

### P1

- `REL-104-03`: required status checks/ruleset for runtime code while keeping a narrow docs-only exception.
- Object-ID inventory and negative BOLA tests.
- Auth/session fixation/rotation/logout/reauth verification.
- SEO public read-model/backend and privacy scan.
- Backup restore proof and migration/ledger recovery evidence.

## Profitability decisions

- WLD-only spend is economy activity/sink, not recognized real revenue.
- Ads are judged by net contribution after retention/session/support/privacy impact.
- SEO is judged by incremental organic D30 retained users and downstream value, not impressions alone.
- Security/QA/release improvements are judged by avoided incident/fraud/refund/downtime/support cost.
- Real-money purchases/subscriptions stay `UNVERIFIED` until provider, receipt/webhook, tax/refund, legal and unit-economics contracts are selected and tested.

## Rollback / deployment

Documentation-only commits were made directly to `main` under the current documentation policy. Runtime promotion was not requested or performed. Git history is the rollback mechanism for this planning change.