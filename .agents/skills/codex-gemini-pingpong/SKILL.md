---
name: codex-gemini-pingpong
description: Coordinate bounded GPT/Codex and Gemini peer-review handoffs for Moneyverse. Use for independent design/code/security review, disagreement resolution, and cross-agent QA while preserving separate worktrees, evidence, and human-controlled merges.
---

# Codex ↔ Gemini Ping-Pong — Moneyverse

## Before either agent starts
1. Read `AGENTS.md`, `GEMINI.md`, `DOCS_INDEX.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md` and `docs/planning/INTEGRATED_PLANNING_MASTER.md`; latest applicable specs and worklogs supersede this skill.
2. Fetch `origin/main`. Identify the exact baseline SHA, task scope, branch owner, owned file set and the existing active worktrees/PRs. Create a dedicated branch and worktree, never sharing a mutable workspace with another agent.
3. Start a sanitized `docs/worklog/` entry BEFORE source edits, then checkpoint against refreshed main and close with exact test evidence. English is canonical; paired Korean docs are required for maintained guidance.
4. Explicitly distinguish plan, opinion, tool installation, successful model responses, Test verification and Production verification.

## Safe peer-review loop
1. Prepare a **sanitized, synthetic or reviewed** task brief in a UTF-8 file. Never send access tokens, secrets, private personal/financial data, production logs, DB dumps or unreviewed diffs to an external model.
2. For a CLI-based **advisory-only** exchange, run `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --check` to inspect available CLIs. Only after reviewing input and budget run `python3 .agents/skills/codex-gemini-pingpong/scripts/pingpong.py --run --input /path/to/sanitized-brief.txt --rounds 2`.
3. Round A: Codex proposes/test-challenges the brief in a read-only scratch workspace. Round B: Gemini independently criticizes assumptions, evidence and security. Repeat for at most three rounds; stop early only on explicit `VERDICT: ACCEPT` from Gemini.
4. The runner creates **local private review evidence only**; it never edits repository files, commits, merges, calls a deployment API, alters user accounts, or starts a production service. Its absence of a real two-model run must be reported honestly. Model judgments cannot authorize an implementation.
5. If Gemini CLI/auth is unavailable, use the **manual handoff fallback**: Codex writes an approved, redacted summary to the isolated task worklog; a separately configured Gemini session reviews it; Codex responds. Mark this `MANUAL` rather than claiming automatic interoperation.

## Implement, verify and release separately
- Put implementation changes in one owned branch; other agent reviews via a separate read-only worktree/PR. Do not have both edit the same file.
- No agent may force-push, auto-merge, rebase another agent's branch, disable controls, or use full-access agent flags. PR integration is serialized and refreshed against current main.
- Reviewers must cite exact files, tested SHAs, reproducible evidence, limitations and unresolved disagreements. Test Spring/backend/API/UI against actual isolated Test services before any release; no fake mock pass as Production evidence.
- Block release on failed checks, conflicting edits, insecure behavior or missing actual QA. Production promotion follows documented rollback-capable release gates, never a chat/model consensus.
- Store sensitive local transcripts outside Git, mode 0700 directories/0600 files. Commit only **sanitized decisions and evidence**. Follow `docs/development/CODEX_GEMINI_PINGPONG_SKILL_v2026.11.22.1.md` for installation and operations.

## Sources
- Codex Agent Skills: https://learn.chatgpt.com/docs/build-skills
- Gemini CLI headless review: https://geminicli.com/docs/cli/headless/
- Gemini CLI package: https://github.com/google-gemini/gemini-cli
