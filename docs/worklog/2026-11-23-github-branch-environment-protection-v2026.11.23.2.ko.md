# v2026.11.23.2 — GitHub protection settings applied

> Date: 2026-11-23 KST
> Status: CONFIGURATION VERIFIED (GitHub API); host direct-write safeguards and end-to-end promotion test NOT VERIFIED
> Related policy PR: #3389 (documentation proposal, not merged)

## Start
Owner requested real GitHub protection enforcement. Inspected both repositories via authenticated GitHub CLI from mini-PC MCP, preserving all existing mandatory web CI checks. Starting state: web main had required checks and enforce_admins but no PR approvals; app main had no protection; web production Environment had no protection rules.

## Changes applied via GitHub REST
1. Web main required checks remain `classify`, `policy`, `runtime-check`; enable 1 PR approval, dismiss stale reviews, require last-push approval, require conversation resolution; prohibit force pushes/deletion; enforce administrators.
2. App main required checks are `build`, `sensitive-files`; same PR/review and branch restrictions.
3. Web `production` Environment adds required reviewer GitHub user `wtrdd1-hash`, prevents self review, and limits deployment to protected branches. Existing production workflow `.github/workflows/deploy.yml` uses `environment: production`.

## Mid / independent read-after-write verification
GET both `/branches/main/protection` returned configured review rules, expected required contexts, conversation resolution, admin enforcement and force/deletion restrictions. GET `/environments/production` returned `required_reviewers` with `prevent_self_review: true` and `branch_policy` with `protected_branches: true`.

## Limitations and safety follow-up
- GitHub reviews / Production Environment are enforced only for GitHub-mediated changes and jobs that reference that environment; **they do not revoke host SSH/root rights or prevent direct server mutations**.
- A sole reviewer cannot approve a deployment they initiated; use an authorized separate CI/deployment actor and independent PR reviewer, without lowering protection. The change may block owner-triggered manual dispatch until that release process is configured.
- No workflow dispatch or actual deployment performed, no runtime/DB/config modified. CI full release gate G0–G9 is a separate implementation task.
- App's workflow is Android-only; do not mistake its build check for Spring website QA.
- Public log intentionally excludes credentials and host secrets.

## End
Verified GitHub-side protection configuration applied; release state unchanged. No `PRODUCTION_VERIFIED` or full promotion claim.
