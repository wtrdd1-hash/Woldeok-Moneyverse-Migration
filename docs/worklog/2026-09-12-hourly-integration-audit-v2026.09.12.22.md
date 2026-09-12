# Hourly Integration Audit — v2026.09.12.22

Date: 2026-09-12
Application main at audit start: `5908e4bc84bd8c6c0bcfdf7401ccad436f8eacc6`
GitOps main observed after automatic Test promotion: `fcfc899ffe7edc6397ed3f52b33f07499f802e4c`
Integration branch: `integrate/clubs-community-v2026.09.12.22`
Integration PR: #181

## Plan review

The current `docs/planning/PROJECT_PLAN.md` was read before work and again mid-work. Its fail-closed release contract remains authoritative: CI/test images alone are insufficient; Production may advance only after the isolated Test origin serves the exact candidate SHA and the backend/database path is directly verified.

## Branch classification

Active work preserved: runtime PRs #169, #165, #164, #162, #160, their required Test-candidate branches, and `kuber-infrastructure` draft PR #22. The DB-backup branch remains blocked until a non-production run proves persisted dump creation, SHA-256 verification, actual restore, and backend health.

Useful but idle documentation: PR #177 (Clubs & Cooperative Economy) and stacked PR #180 (Community & Market Integrity). Their unique files were re-homed in order onto current `main` through PR #181 rather than carrying stale parent history.

Already integrated/obsolete legacy branches include the old Banking, Player Marketplace, and prior hourly Banking integration refs. Their useful content has already been re-homed. No branch is reported deleted without direct ref evidence; explicit branch-ref deletion is not available through the connected write actions, while merged fully-contained branches remain eligible for the repository cleanup workflow.

## Validation and deployment evidence

Application `main` `5908e4bc84bd8c6c0bcfdf7401ccad436f8eacc6` passed CI and Build Test Candidate. GitOps auto-reconcile then committed Test desired state for that exact SHA as `fcfc899ffe7edc6397ed3f52b33f07499f802e4c`.

The Production Release for `5908e4bc84bd8c6c0bcfdf7401ccad436f8eacc6` failed its `test-gate`: the workflow polled `test.easy-scraping.com/api/version` for 60 attempts and never observed the exact SHA. The Production image build job was skipped. The latest GitOps reconciler therefore skipped Test re-verification for Production, Production-manifest mutation, and Production smoke verification.

GitOps Test desired state pins backend and migration source to `5908e4bc84bd8c6c0bcfdf7401ccad436f8eacc6`. Production GitOps remains pinned to `6c4237ccb811d37485fef2e65d390b936e188ccc`. Desired state is not treated as live-Pod proof.

Therefore Test migration completion, Test backend logs/service/container health, exact live Test SHA, key authenticated user flows, and rollback readiness remain unproven. Production promotion in this audit is zero.

## Remaining risks

1. Restore reliable exact-SHA identity and direct cluster evidence for Test before any runtime promotion.
2. Keep runtime PRs blocked until same-SHA Test evidence is complete.
3. Keep DB backup PR #22 draft until dump/checksum/restore/backend-health evidence exists on non-production infrastructure.
4. Remove obsolete squash-equivalent refs only through a verified branch-ref deletion path; do not equate content equivalence with deletion.