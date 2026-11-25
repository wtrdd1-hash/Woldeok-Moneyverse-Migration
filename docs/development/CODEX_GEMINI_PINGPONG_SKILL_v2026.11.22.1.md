# Codex ↔ Gemini Peer Review Skill — Moneyverse

**Version:** v2026.11.22.1 | **Status:** IMPLEMENTED (local instruction/tool installation; live model handoff NOT TEST_VERIFIED) | **Canonical:** English | [한국어](CODEX_GEMINI_PINGPONG_SKILL_v2026.11.22.1.ko.md)

## Purpose and scope

The owner requested a reusable two-agent “ping-pong” workflow and a persistent GitHub record. This adds a first-party Agent Skill and a **bounded advisory-only** CLI runner on the authorized mini-PC. It is not a production application change, deployed service, model consensus engine, or permission to let either agent modify another agent's branch.

Reference Reel: https://www.instagram.com/reel/DeeE-i9vuK2/ (video playback/content not independently verified). We chose a locally auditable first-party skill over executing unreviewed third-party orchestration packages. Original AgentMemory [policy](AGENTMEMORY_SHARED_AGENT_MEMORY_v2026.11.21.2234.md) remains separate; this new tool does not implement persistent model memory.

## Installed components

| Component | Exact location | State |
| --- | --- | --- |
| Source Agent Skill | `.agents/skills/codex-gemini-pingpong/SKILL.md` | Committed in feature branch, pending PR |
| Shared user skill | `/home/debian/.agents/skills/codex-gemini-pingpong/` | Installed as identical local mirror |
| Advisory runner and synthetic tests | `.agents/skills/codex-gemini-pingpong/scripts/` | Implemented; 6/6 synthetic tests passed |
| Codex CLI | `/usr/local/bin/codex` | Present; live peer-review invocation not tested |
| Official Gemini CLI | `/home/debian/.local/share/moneyverse-agent-toolchain/gemini-cli-v0.70.0/` | Pinned `@google/gemini-cli@0.70.0`; binary version verified; account authentication not tested |
| Gemini user shortcut | `/home/debian/.local/bin/gemini` | Local symlink to pinned version |

Gemini CLI installation used `npm install --prefix <user-only-prefix> --ignore-scripts --no-save --no-audit --no-fund --package-lock=false @google/gemini-cli@0.70.0`. No root-level npm install, public listener, server restart, database access or app release was performed. No credential is saved in Git.

## Operator workflow

1. Refresh `origin/main`, read `AGENTS.md`, `GEMINI.md`, `docs/DOCUMENTATION_POLICY.md`, the living [Project Plan](../planning/PROJECT_PLAN.md), [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md), relevant specs, and recent sanitized worklogs.
2. Create an isolated branch and worktree and mark file ownership for the implementation agent. Use a separate read-only worktree for the reviewer; never edit the same file concurrently.
3. Create a reviewed, synthetic/sanitized UTF-8 task brief *outside* the Git repository. Keep it under 24 KiB. Do not include credentials, database records, customer data, payment logs, or unreviewed source changes.
4. Check availability: `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --check` (does not validate login or call models).
5. **Only after separately configuring/authenticating both CLIs and approving the brief and model usage/cost**, invoke `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --run --input /path/to/approved-brief.txt --rounds 2`. Max three rounds. It sends the brief to both model services: Codex proposes an advisory review, Gemini independently critiques, Codex receives critique next round, and explicit `VERDICT: ACCEPT` may end early.
6. The runner creates private local JSON review evidence in `~/.local/state/moneyverse-agent-pingpong/` (directory 0700, file 0600). **Never commit raw output or input**, credentials, prompts containing personal data, or full model transcripts. Commit only a redacted outcome, dissent, exact tests and SHA in `docs/worklog`.
7. A human-controlled implementation branch then applies approved changes, a separate agent reviews the PR, actual Spring/API/UI integration QA is performed on an isolated Test service, and serial PR merge and documented rollback-capable production release remain gated. No verdict can bypass this process.

### Safety and limits

- Codex is called with `exec --sandbox read-only`; Gemini uses `--approval-mode plan` (read-only). The runner itself never performs repository writes, merges, or deployments.
- The runner uses an empty temporary working directory and has a strict 1–3-round bound and per-agent timeout; it checks common credential signatures before sending a brief. **Regex screening is not a guarantee**: input must still be manually reviewed, especially against private or financial data.
- The third-party CLIs remain independently authenticated networked model services; their own tool/runtime security properties are not certified here. Do not run with privileged service credentials or live finance data.
- Rejected/empty/invalid model responses halt the run. A successful synthetic test is not proof of real model API access, satisfactory reasoning, QA, or production safety.
- CLI authentication, two-live-model request/response, Google service billing/permissions, integrated repo code tests, and deployment are **NOT TEST_VERIFIED**. User-scoped installation alone does not make interactive skill selection by Gemini or Codex a demonstrated fact.
- If CLI credentials or quotas are unavailable, use a manual, redacted worklog handoff. Mark it **MANUAL**, not automatic.

## Verification and removal

- Run `python3 -m unittest discover -s .agents/skills/codex-gemini-pingpong/scripts/tests -v` and `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --check`.
- Compare `sha256sum` of each repository skill file and user mirror; verify UTF-8 frontmatter and `git diff --check`.
- To revert installation: remove *only* `~/.agents/skills/codex-gemini-pingpong`, local `~/.local/bin/gemini` shortcut if pointing at the pinned installation, and `~/.local/share/moneyverse-agent-toolchain/gemini-cli-v0.70.0` after confirming no other dependency. Local review evidence needs separate authorized deletion/retention policy.
- Source notes: [Codex Skill format](https://learn.chatgpt.com/docs/build-skills), [Gemini CLI installation](https://geminicli.com/docs/get-started/installation/), [Gemini headless](https://geminicli.com/docs/cli/headless/).

## Evidence and governance

- [Worklog](../worklog/2026-11-22-codex-gemini-pingpong-skill-v1.md) · [GitHub update](../updates/v2026.11.22.1-codex-gemini-pingpong-github.md) · Internal update: private mini-PC record (excluded from Git) · [Changelog](../changelog/2026-11-22-codex-gemini-pingpong-v1.md).
- This workflow is subordinate to the Project Plan, Integrated Planning Master, and document governance; no runtime changes are authorized or promoted.
