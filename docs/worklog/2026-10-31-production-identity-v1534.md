# v2026.10.31.1534 — Production release identity service detection repair
Status: SOURCE_VERIFIED; existing Production release re-attested read-only. NEW release not deployed. Branch fix/admin-finance-incident-v20261031-1530 / Draft PR #2131.

## START
- Owner requested fixing the repeated admin and operational issues. Read AGENTS, DOCS_INDEX, DOCUMENTATION_POLICY, project and integrated masters, release guide, v1530 and v1532 worklogs, actual host systemd units and immutable release manifest.
- Remote origin/main 761a55a094fb9dd383d213e817305e68c79fa23c checked at task start and mid-work; other agent worktrees untouched.
- Active production processes use moneyverse-live-prod-backend/frontend.service at ports 3564/3565, with immutable cwd /srv/moneyverse-data/releases/prod-v2026.10.31.0950-761a55a094fb. The manifest applicationSourceSha, effective environment BUILD_ID, actual frontend .next/BUILD_ID and public /api/version and /frontend-version all report **95485a299885693e3becb694dfc36ad45e832f97**. Existing source-only release checker incorrectly selected nonexistent moneyverse-release-v0950-backend.service and failed before assessing real process.
- This is a release attestability defect, not proof that old/current finance transactions are settled.

## MID — TDD / fix
- RED: add regression for fixed live-prod service using actual immutable release cwd; previous selector returned nonexistent generation by version label. Confirmed 1 new failing test.
- Minimal fix: serviceForRelease keeps legacy inferred immutable unit and also checks fixed live-prod service, requiring exactly one **active** unit whose process cwd matches the canonical release root/role. Zero matches or multiple matches fail closed. Existing BUILD_ID/public frontend/treasury 503 verification remains mandatory.
- GREEN: release identity suite 15/15; integrated release verification suites 30/30 PASS.
- Fresh host command `sudo -n node scripts/release/verify-host-runtime-identity.mjs --channel prod --sha 95485a299885693e3becb694dfc36ad45e832f97` returns ok=true/failures=[] for the CURRENT public release. This does not attest any newly proposed branch/production package.

## FINISH
- Updated EN/KO release runbook; recorded internal/GitHub notes and changelog under v1534. No systemd change, traffic switch, WLD write, DB migration, or Test candidate promotion.
- Remain blocked for new branch: official exact-SHA Test, authenticated session continuity, full CI, rollback, and separate canonical finance/552 Treasury provenance. Current Production identity PASS alone is NOT full finance acceptance.
