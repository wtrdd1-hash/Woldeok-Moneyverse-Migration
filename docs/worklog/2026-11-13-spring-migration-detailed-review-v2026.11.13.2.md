# Spring Migration Detailed Risk / Artifact Review — Worklog v2026.11.13.2

[한국어](2026-11-13-spring-migration-detailed-review-v2026.11.13.2.ko.md)

## Before work — 2026-11-13 KST
- Owner request: re-review Spring conversion planning, add section-by-section cautions and a detailed plan, including artifact lifecycle.
- Entry: mini-PC MCP; inspect-only commands before the documentation changes. No production app/DB deployment authorization.
- Authority inspected: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, v2026.11.13.1 bilingual Spring design and worklog, `docs/RELEASING.md`, architecture/contract and GitHub Actions deployment workflows.
- Before-work `origin/main`: `90965f1dd84e272e757041eb9afd8a477699eb7c`, fetched 2026-11-13 22:34 KST; base Spring draft `3a65b5e35b841da556f1543e5b6759af9b65d4c3`, PR #3142 OPEN. This follow-up is stacked on the open Spring draft PR, NOT on another contributor's worktree; review PR must target that draft branch until upstream merges.
- Isolation: `planning/spring-migration-detailed-review-v2026.11.13.2` in a new separate worktree, retaining original repo and v1 draft untouched.
- Preliminary findings: G0 needs an actual edge/active runtime identity map (release guide v1550 vs running v1546 unit); 8 GiB host has 6.7 GiB swap in use at this observation, requiring JVM/coexistence budget; CI attestation+artifact retention is not itself a verified rollback target; existing v1 design does not provide a complete endpoint/job census, concrete artifact registry policy, domain acceptance matrices or wave-by-wave failure drills.
- External references under review: official Spring Boot requirements, Spring 4 migration guidance, GitHub artifact attestation/verification documentation.
- State: STARTED. Create bilingual review/detailed appendix and retain user approval gates; no Java scaffolding, DB migration, Test deploy, or production change.

## Mid-work checkpoint — 2026-11-13 KST
- Completed English/Korean section-by-section G0–G6 risk review with 10 specific gaps (R01–R10), source-specific implementation plan, stop/rollback rules and exact-evidence template.
- Completed separate English/Korean artifact/Artifactory policy: JAR, OCI/GHCR, SHA and SBOM/provenance, manifest schema, retention, signing and restore; JFrog conditional rather than assumed installed.
- Re-fetched origin/main during work: unchanged 90965f1dd84e272e757041eb9afd8a477699eb7c; Spring parent PR #3142 remains OPEN with unchanged SHA.
- Resource observation corrected as timestamp-dependent (available RAM approximately 2960 MiB vs older snapshot 0.8 GiB); document G0 runtime topology mismatch (historical release v1550 vs observed running v1546 unit) as an unknown to verify.
- Next: link parent draft and living plans, add bilingual change records, validate local docs and open stacked PR. No runtime/DB/Test/Production mutation.

## Finished state — 2026-11-13 KST
- **Version/output:** v2026.11.13.2, 22 Markdown-only changed files relative to open parent PR #3142: bilingual detailed review, bilingual artifact/Artifactory policy, bilingual worklog, existing project/integrated master and draft design cross-links, DOCS_INDEX/catalog, bilingual changelogs, GitHub and internal update notes.
- **Risks and detail:** 10 section-anchored issues R01–R10; G0–G6 task/QA/STOP gates; finance PostgreSQL writer fence, session/OTP/Android/Socket.IO parity, host capacity, release attestation/rollback; default GHCR and conditional JFrog evaluation.
- **Validation:** git diff --check PASS; EN/KO required files present with matching review stages; 22 changed Markdown files inspected for new relative-link errors: **0 introduced**, 2 pre-existing invalid relative links inside historical CHANGELOG were not altered. PR diff contains **no application source, SQL, Android or runtime configuration files**.
- **GitHub checkpoints:** kickoff b244186a19, detailed specs 2ddd954e41, plan/updates 6c1a4e678f; all pushed to planning/spring-migration-detailed-review-v2026.11.13.2. Draft [PR #3144](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3144) OPEN/MERGEABLE, based on unmerged parent Spring draft [PR #3142](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3142). At snapshot CI classify PASS, policy check PENDING; **CI not yet fully green**.
- **Main freshness:** before/mid/final fetched origin/main remained 90965f1dd84e272e757041eb9afd8a477699eb7c; original Spring branch remained 3a65b5e35b841da556f1543e5b6759af9b65d4c3; other agent worktrees untouched.
- **Not performed:** Java scaffold/compile, full code tests, DB grants/migration/finance reconciliation, independent backup restore, official Test deployment, authenticated live site QA, production cutover or approval, financial/data mutation and main merge. Documents remain DRAFT and do not authorize implementation or deploy.
- **Next gate:** review/accept architecture and this risk/artifact plan, then independently authorize G0 inventory/actual-runtime/backup/resource audit. G1+ require separate code/CI/Test acceptance and G5/G6 separate money/operations evidence.
