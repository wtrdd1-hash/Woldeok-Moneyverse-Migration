# Spring Migration Detailed Risk / Artifact Review — Worklog v2026.11.13.2

[한국어](2026-11-13-spring-migration-detailed-review-v2026.11.13.2.ko.md)

## Before work — 2026-11-13 KST
- Owner request: re-review Spring conversion planning, add section-by-section cautions and a detailed plan, including artifact lifecycle.
- Entry: mini-PC MCP; inspect-only commands before the documentation changes. No production app/DB deployment authorization.
- Authority inspected: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, v2026.11.13.1 bilingual Spring design and worklog, `docs/RELEASING.md`, architecture/contract and GitHub Actions deployment workflows.
- Before-work `origin/main`: `90965f1dd84e272e757041eb9afd8a477699eb7c`, fetched 2026-11-13 22:xx KST; base Spring draft `3a65b5e35b841da556f1543e5b6759af9b65d4c3`, PR #3142 OPEN. This follow-up is stacked on the open Spring draft PR, NOT on another contributor's worktree; review PR must target that draft branch until upstream merges.
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

## Finished state
- PENDING. Final results, exact changed files, validation and GitHub state will be recorded here.
