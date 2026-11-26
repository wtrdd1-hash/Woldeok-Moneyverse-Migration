# Cloudflare security audit skill — v2026.11.26.CFAUDIT.1

[한국어](CLOUDFLARE_SECURITY_AUDIT_INSTALL_v2026.11.26.1.ko.md)

- Upstream: https://github.com/cloudflare/security-audit-skill at `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (MIT).
- Start: inspect authority, check existing installations, fetch official pinned source. No existing `security-audit` directory found.
- Mid: Node v24.21.0; both upstream validator suites executed locally with a clean environment; 65 passed, 0 failed, 0 skipped. No target code executed.
- End: 20 files per installation, byte comparison with upstream passed in `~/.agents/skills/security-audit`, `~/.claude/skills/security-audit`, `~/.codex/skills/security-audit`, `~/.gemini/skills/security-audit`.
- GPT performed a bounded read-only source review using guidance mode on a security candidate. Detailed observations remain in private local work records; no confirmed new vulnerability or full audit is claimed.
- Existing agent sessions were not restarted; model-level discovery and multi-agent full workflow are not verified. Full audits require independent reviewers, coverage ledger, bounded isolated local fixtures and a budget. No live endpoint probing, secret disclosure, deployment, or DB change. TESTGATE.1 remains mandatory; this installation does not grant release authority.

## v2026.11.26.CFAUDIT.2 — cross-review smoke test
Gemini CLI discovered the skill as Enabled. Duplicate identical installations produced a precedence warning. A synthetic guidance-mode review timed out (exit 124) with a workspace read restriction; a retry with the skill directory explicitly included also timed out without a complete response. GPT classified the two synthetic cases as needs_validation and rejected respectively. Existing Claude-triggered Codex review was in progress and was not duplicated. Independent cross-model verification remains HOLD; no live endpoint, deployment, or database changes.
