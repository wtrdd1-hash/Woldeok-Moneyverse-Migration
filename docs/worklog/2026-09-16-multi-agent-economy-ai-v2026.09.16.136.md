# Multi-agent Economy AI Planning — v2026.09.16.136

## Scope

Expand the Moneyverse AI economy planning into an adversarial multi-agent architecture with separately trained agents, structured debate, market and shop automation, automatic product proposals, bounded execution, simulation, rollback, and auditability.

## Checklist

- [x] Re-read the current AI economy controller specification before editing.
- [x] Re-read the current economy simulation/tuning specification before editing.
- [x] Reconfirm repository documentation and worklog standards.
- [x] Add separately trained specialist-agent roles and adversarial debate protocol.
- [x] Add ensemble/judge/safety-agent decision gates and anti-collusion requirements.
- [x] Add bounded stock price formation/market-maker policy automation without direct arbitrary price setting.
- [x] Add bounded shop price automation with elasticity, affordability, and cooldown constraints.
- [x] Add automatic product/SKU proposal and generation pipeline with human-approved templates and risk classes.
- [x] Add training/data/model registry requirements for each agent.
- [x] Add test/shadow/canary/rollback requirements.
- [x] Update Korean counterpart.
- [x] Update internal update log and GitHub-facing planning history.
- [x] Re-read the latest GitHub planning source mid-task and reconcile conflicts.
- [x] Validate documentation consistency and record deployment state.

## Final state

Updated the English canonical plan, Korean counterpart, simulation extension, planning changelog and update log. `git diff --check` passes. This is documentation/planning only, so no Test or Production deployment was performed.

## Research reassessment v2026.09.16.137

Completed an additional source-validation pass and revised the architecture toward a calibrated digital-twin ensemble; recorded the EconGrowthAgent verification failure and debate/judge limitations. No runtime deployment.

## v2026.09.16.138 extension — in progress

- [x] Re-fetched `origin/main` and re-read the current AI controller, jobs/profession, and default-limit planning contracts before editing.
- [ ] Add bounded AI control for primary-profession constraints, per-profession concurrency/selection constraints, daily work/reward protection limits, and automatic relaxation/removal.
- [ ] Keep `null = unlimited` as the normal product default; require an explicit evidence-backed reason for any non-null user-facing cap.
- [ ] Add deterministic guardrails, policy-registry fields, simulation/causal evaluation, audit, rollback, and UI disclosure requirements.
- [ ] Update English/Korean canonical planning, changelog/update log, validate, commit, and push.
