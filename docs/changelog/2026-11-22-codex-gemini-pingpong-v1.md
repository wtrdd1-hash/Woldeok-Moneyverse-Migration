# Changelog — v2026.11.22.1: Cross-agent advisory skill

- **Added:** `codex-gemini-pingpong` shared Agent Skill and a 1–3 round, explicit-run-only Codex/Gemini review script.
- **Installed locally:** official Gemini CLI `@google/gemini-cli@0.70.0` in an unprivileged user prefix; user-scoped Agent Skill mirror, preserving existing skills.
- **Validation:** six isolated mock-process tests, CLI presence/version, Skill hash parity; live authentication and actual two-model communication remain untested.
- **Controls:** read-only agent modes, sanitized input screening, private local evidence, separate worktrees and manual PR/QA/release gates.
- **No product/runtime impact:** no application, database, Nginx, Test or Production changes.
- **Authority:** subordinate to living planning documents; see [guidance](../development/CODEX_GEMINI_PINGPONG_SKILL_v2026.11.22.1.md) and [worklog](../worklog/2026-11-22-codex-gemini-pingpong-skill-v1.md).
