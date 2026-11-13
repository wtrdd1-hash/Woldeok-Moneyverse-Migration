# Spring Boot Platform Migration — Task Worklog (v2026.11.13.1)

[한국어](2026-11-13-spring-platform-migration-v2026.11.13.1.ko.md)

## Before work — 2026-11-13 KST
- User direction: begin a **platform-wide, procedural migration plan** from the existing TypeScript/NestJS backend to Java/Spring Boot. This authorizes planning, **not** immediate production replacement.
- Access path: mini-PC MCP `system_exec_command` (preferred); no unrelated remote access.
- Source: `wtrdd1-hash/Woldeok-Moneyverse-Migration`, `origin/main` = `90965f1dd84e272e757041eb9afd8a477699eb7c`, fetched before work.
- Isolation: `planning/spring-platform-migration-v2026.11.13.1` in ignored `.worktrees/spring-platform-migration-20261113`; original main checkout was left untouched (pre-existing untracked `ops/telegram/__pycache__/`).
- Document priority checked: `AGENTS.md`, `docs/planning/README.ko.md`, `PROJECT_PLAN(.ko).md`, `INTEGRATED_PLANNING_MASTER(.ko).md`, `docs/RELEASING.md`, `docs/operations/release-documentation-policy.ko.md`, finance/treasury architecture and relevant Superpowers skills.
- Inventory at baseline: 898 tracked frontend TSX, 764 frontend TS, 900 backend TS; 89 NestJS controllers and 52 service files; 345 tracked migration files (counts only, not compatibility evidence).
- Important uncertainty: `AGENTS.md` describes Kubernetes/Flux; current `docs/RELEASING.md` discusses Debian systemd/Nginx release generations; actual host showed running systemd services. Deployment topology must be independently re-certified before any runtime work.
- Mini-PC resource observation: ~7.9 GiB RAM, ~0.8 GiB available, ~6.5 GiB swap in use; do not add a persistent JVM on the production host as part of planning.
- Existing QA/finance findings from dated planning docs are **historical**, not fresh live certification.
- Skills: `using-superpowers`, `brainstorming` (architectural draft/review gate), `using-git-worktrees`, `verification-before-completion`. The detailed implementation-plan gate follows user review of the architectural draft.


### Mid-work checkpoint — 2026-11-13 KST
- Drafted bilingual end-to-end architecture covering all NestJS modules, legacy JS bots, external integrations, Android, DB/security, operations and eventual NestJS retirement. Recommended modular Spring and G0–G6 gated strangler migration; financial writer stays single-owner.
- Added versioned planning-only release note and bilingual links in current Project/Integrated master plans plus both changelogs. Existing feature drafts were not overwritten.
- Re-fetched origin/main mid-task: still `90965f1dd84e272e757041eb9afd8a477699eb7c`; no intervening main change at this checkpoint.
- Adjusted G0 exit: unverified finance provenance blocks finance cutover and Production, not safe isolated read-only groundwork; this is explicitly documented.
- Created separate internal and GitHub-facing update reports, each in English and Korean, linked from the version note.
- Current source/tree and deployment were only inspected; no application, DB or runtime mutation.

## In progress — checkpoints
- [x] Confirm user goal and classify as an architecture-wide planning task.
- [x] Inspect primary code/document boundaries and isolate the branch.
- [ ] Write English canonical and Korean counterpart design/roadmap with migration waves and strict gates.
- [ ] Update living/master plan references without overwriting independent work.
- [ ] Add planning-version release notes and matching internal/GitHub changelog entries.
- [ ] Re-fetch and compare origin/main mid-task, rebase the isolated branch only if safe.
- [ ] Verify changed-file scope, bilingual parity, local Markdown links, and Git diff.
- [ ] Commit/push work to remote branch and propose review (not production release).

## Finished state
PENDING. Planning-only: no Java application implementation, test rollout, production promotion, DB/data mutation, or main merge was performed at the starting checkpoint.
