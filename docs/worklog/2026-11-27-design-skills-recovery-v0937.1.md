# Design skill access recovery — v2026.11.27.0937.1
[한국어](v2026.11.27.0937.1-design-skills-recovery-github.ko.md)
Scope: development tooling only. Main baseline and mid-check `1df1150e979106ec03d682a10f1f1348bff0a44c`. Follow-up to PR #3470; frontend authority candidate #3469 and G2 remain unchanged.
- Impeccable 4.10.0: local Claude and shared SKILL.md Git blobs exactly match separate upstream provider variants at `b49177d32788f2dc585c42831d845dacf1ebed2c`; different hashes are expected, not version drift. Preserve both variants. Not a complete package integrity audit.
- Gemini: removed only four redundant symlinks (backed up); canonical shared skill discovery remains and the four duplicate warnings disappeared in the live run. Unrelated security-audit warning not in scope.
- Dedicated design review wrapper stages four allowlisted public skill texts with byte verification and mode 444 inside existing isolated workspace. Existing generic wrapper, trust, permissions and billing remain unchanged. First live run returned HTTP 429 (free-tier input TPM, exit 173); file-read success not established.
- Alternate single-prompt public-context wrapper provides all four public SKILL.md texts directly and avoids model file-read calls. No private data or code, external hooks, scripts or new dependencies. Single controlled verification after provider cooldown; no retry loop. Record actual result below.
- No application, Test or Production changes. No G2 replacement or release acceptance.

## Verified result
At 09:39:35 KST the direct-context task completed exit 0, with three G2-oriented design directions and a 12,205-character standalone HTML/CSS prototype (no script tags or external URLs). Gemini tool calls: 0, no HTTP 429 on this run. All four source headings were verified; three quoted phrases match verbatim, Taste quotation is non-verbatim and must be treated as a paraphrase. Public source-context use is verified, not native skill activation, full accessibility or browser acceptance. File-read route remains unverified. No further automatic retry or permission change.
