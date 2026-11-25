# Design skills installation — v2026.11.25.1639
English canonical | [한국어](DESIGN_SKILLS_INSTALL_v2026.11.25.1639.ko.md)

Scope: Debian mini-PC development user only. Impeccable 4.10.0 from https://github.com/pbakaus/impeccable at b49177d32788f2dc585c42831d845dacf1ebed2c, engine manifest 0.1.27; provider-specific manual copies verified byte-for-byte before smoke test. Existing Anthropic frontend-design and UI UX Pro Max (https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) retained. Gemini CLI discovers all three via ~/.agents/skills; added separate Gemini config copies for Impeccable and UI UX Pro Max, removed only newly added redundant CLI symlinks after conflict detection. Codex and Claude skill paths verified. UI UX Pro Max shared manifest's 15 Claude-specific helper references changed to the existing absolute shared script path; original backed up outside repository. No automatic hooks, permission changes, app code, schedules, Test or Production changes.

Verification: Impeccable --version returned 4.10.0 through all three provider paths; isolated context command ran; UI UX Pro Max local UX search returned results; Gemini CLI lists all three Enabled without target duplicate warnings. No live model invocation, browser visual QA, or Claude official marketplace registration claimed.

Use these skills for implementation quality, accessibility and visual QA only. Approved route images, current integrated planning, real Spring API contracts, EN-first/KO-second localization and independent Test/release gates outrank generic skill recommendations. Current design authority file begins with G2 Guild Ledger Terminal, while older G1/v10 statements remain in other documents; do not resolve that conflict by arbitrary redesign. Escalate any unresolved visual authority conflict before changing UI. No change to canonical design documents in this task.

Start/mid main: 3fcf446f05c06e32aa31fcd83053e1b409203c42. [Worklog](../worklog/2026-11-25-design-skills-v1639.md).
