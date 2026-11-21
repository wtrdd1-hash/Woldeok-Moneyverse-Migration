# AgentMemory — Shared coding-agent memory and reference protocol

**Version:** v2026.11.21.2234
**Status:** PLANNING (protocol documented; external AgentMemory integration NOT INSTALLED or TEST_VERIFIED)
**Canonical language:** English | [Korean](AGENTMEMORY_SHARED_AGENT_MEMORY_v2026.11.21.2234.ko.md)
**Owner directive:** Save the 2026-11-06 MIRLABS Instagram AgentMemory reference and make it reusable throughout Moneyverse development.

## 1. Permanent source reference

- Reel: https://www.instagram.com/reel/DfZgpiWtX1z/ (canonical metadata URL: https://www.instagram.com/mirl.abs/reel/DfZgpiWtX1z/)
- Publisher: MIRLABS (Instagram @mirl.abs); metadata date 2026-11-06.
- Upstream source: https://github.com/rohitg00/agentmemory
- Upstream technical description: https://raw.githubusercontent.com/rohitg00/agentmemory/HEAD/README.md
- Evidence level: Instagram page metadata/caption and upstream README were retrievable on 2026-11-21; the original reel's video playback and spoken narration were NOT verified. Claims are attributed to the caption/README, not independently measured.
- Retain the URL and attribution in the repository's indexes so subsequent sessions can retrieve the source without depending on conversation history.

## 2. What the reference proposes

AgentMemory is a third-party, local-first persistent memory system for coding agents. The reel describes capture, recall, continuation, and inspection across sessions and tools, including MCP/HTTP adapters for CLI-based agents. The upstream README describes keyword-based retrieval without a model API key; other search modes can require additional components.

This is **development-session context**, not a money ledger, user-profile store, authorization database, Git repository, or replacement for approved project specifications. Any marketing benchmark or popularity figure from the reel is a publisher claim, not an independently verified performance guarantee.

## 3. Required repeatable Moneyverse workflow — effective now with existing GitHub documents

For every future development task, regardless of whether AgentMemory is installed:

1. **Before:** Fetch current `origin/main`, read `docs/planning/PROJECT_PLAN.md` and `docs/planning/INTEGRATED_PLANNING_MASTER.md`, repository safety instructions, and the latest relevant worklog; search existing decisions by feature/issue/version. Create the task's own branch/worktree and start an EN/KO task log BEFORE implementation.
2. **Record:** In the current task worklog, save a sanitized and dated summary of goal, approved requirements, baseline SHA, involved paths, owner/branch, constraints, decisions and reason, executed commands (without sensitive arguments), test evidence and unresolved defects.
3. **Checkpoint:** During significant changes, refresh `origin/main` and the living plans, compare other contributors' changes, update the worklog and push meaningful progress to the isolated task branch. A memory match never authorizes overwriting newer repository data.
4. **Continue:** On a later session or tool switch, recall the task handoff and verify it against the latest main SHA, actual code, CI and Test/Production evidence. Historical memory is a search hint, not current runtime truth.
5. **Close:** Save final result, exact commit/PR references, validation outcomes, failures, deployment/non-deployment and next steps. Use English canonical plus Korean secondary in maintained documentation.

Until a guarded AgentMemory deployment passes its gates, **GitHub worklogs + integrated planning documents are the durable searchable fallback**. Do not state that an MCP server or cross-agent automatic capture is active.

## 4. Data and security controls

- **Never capture:** passwords, API keys, access/refresh tokens, cookies, session identifiers, secret-bearing URLs, database credentials, private keys, secrets in terminal output, user/administrator personal data, unredacted financial ledger entries, private messages, or support tickets.
- Apply allowlist-based recording, redact before capture, and use secret scanning before any write or export; built-in secret scrubbing alone is not a verified control.
- Never commit `~/.agentmemory`, memory DBs, indexes, embeddings, HTTP dumps or raw transcripts to Git. Keep future storage outside web roots and repositories, under restrictive per-user permissions.
- Prefer local-only loopback access. Disable remote HTTP exposure, external providers, automatic observation hooks, telemetry, and embedding downloads until reviewed individually. Test authorization, retention, delete/export behavior, backup and recovery before multi-agent access.
- Keep separate namespaces per project and test/production context. Do not feed live customer/finance data into a coding-agent memory engine.
- The memory engine is not a concurrency lock: use task ownership, isolated worktrees, branch-lease checks, CI and serial PR integration. Other agents cannot alter the same file simply because they can recall a decision.
- Avoid automatic `npx ... @latest` execution on the production host. Pin and review exact upstream commit/package version, license, install scripts and transitive dependencies in an isolated non-production environment.

## 5. Adoption and acceptance gates

| Gate | Acceptance | Observed at v2026.11.21.2234 |
| --- | --- | --- |
| R0 reference | Verified attributable source URL, origin and summary | PASS: Instagram metadata + upstream README |
| R1 persistence | Paired EN/KO policy, planning/index and agent-entry references in reviewable Git branch | Documentation branch candidate |
| R2 isolated pilot | Pinned package, local-only service and separate restricted test user, no privileged daemon | NOT STARTED |
| R3 security | Secret-negative capture tests, redaction inspection, local storage access policy, remote-network denial | NOT STARTED |
| R4 interoperability | Same non-secret synthetic decision captured and recalled accurately across two supported agent clients | NOT STARTED |
| R5 reliability | Restart/backup/restore, corruption recovery, retention/deletion, stale conflict and full-session handoff tests | NOT STARTED |
| R6 adoption | Explicit review, merged authoritative docs, configured agents and evidence of actual use | NOT VERIFIED |

**Deployment:** This document does not install AgentMemory, change application code, deploy a service or touch financial systems. External package installation is a separate gated implementation task. Protocol use means consulting and writing the versioned project documentation already available.

## 6. Ownership, hierarchy and linked evidence

The authority order remains `docs/DOCUMENTATION_POLICY.md`: living project plan and integrated planning master override older sessions, third-party marketing material, and this supporting integration protocol. The 2026-11-18 responsive Spring website design, English-primary/Korean-secondary locale rules, and test/prod release gates are unchanged.

- Worklog: [EN](../worklog/2026-11-21-agentmemory-shared-agent-protocol-v2234.md) / [KO](../worklog/2026-11-21-agentmemory-shared-agent-protocol-v2234.ko.md)
- GitHub-facing update: [EN](../updates/v2026.11.21.2234-agentmemory-reference-github.md) / [KO](../updates/v2026.11.21.2234-agentmemory-reference-github.ko.md)
