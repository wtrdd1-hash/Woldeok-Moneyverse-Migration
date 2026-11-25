# Multi-skill installation — v2026.11.24.1321

Development account only. 83 unique skill names verified in both `~/.agents/skills/` and `~/.claude/skills/`; 160 new directory copies byte-compared against prepared staging; existing files retained. The 83 includes existing Anthropic frontend-design, and four Anthropic skills already present in one root. Existing UI UX Pro Max, Superpowers, Gemini and Claudex remain untouched.

## Source posts
- https://www.instagram.com/p/DaCxFUSDyC9/
- https://www.instagram.com/reel/DewCJcSS2-7/
- https://www.instagram.com/reel/DfrUP9ID4hx/
- https://www.instagram.com/reel/DfKcfEcid_V/

Public descriptions identified the named skills in three reels. The first carousel advertises 24 desktop/cloud items (8 each plugins, skills, MCP) but the exact list is not in public caption or accessible image labels. Notion/Gmail/Zapier are mentioned; no account connection or authorization performed. Exact remaining items are unverified.

## Scope and verification

83 skill manifests parsed and installed/preserved; all target copies present. Explicit-invocation metadata added to new copies; skill hooks and automatic tool grants removed where present; Real SFX original unquoted colon in YAML normalized; local config files excluded. No bulk automatic hooks, global permission changes or service changes. Skills are instructions, not proof of external tools working. Agent-browser 0.44.0 installed in pinned npm runtime prefix and user-local symlink created; version and core guide passed, browser rendering not tested. The user-local bin path may need addition to PATH. GSD Core 1.23.0 installer ran in isolated HOME/config roots, 8 core skills each in Claude and Codex; not activated in existing agent profiles. Source checkout installer lacked generated module; packaged version succeeded. Graphify and REA instruction skills only: CLI/MCP engines not configured. Real SFX library, n8n MCP, Remotion project dependencies not configured/tested. ECC and Matt Pocock selected subset only; remaining upstream sources retained locally, not globally activated. No full ECC setup or hooks. Existing release and Superpowers gates remain binding. No credentials/customer data shared.

## Installed source inventory
| Source | Pinned SHA | Skills |
|---|---|---|
| https://github.com/Clipwing/skills.git | `edbefcbc3474869e6cc1e8a7ca583b0efd0dab7e` | real-sfx |
| https://github.com/DietrichGebert/ponytail.git | `ebd8654c2c627f721eb8f9c0d1bd4090a29f9e10` | ponytail |
| https://github.com/JuliusBrussee/caveman.git | `b89752f6bca5a26bfde8b019813554241800ca99` | caveman |
| https://github.com/Leonxlnx/taste-skill.git | `6c0b5c78f5d31776e2210305abaa210cdc0030bf` | design-taste-frontend |
| https://github.com/affaan-m/everything-claude-code.git | `4adeee6732a12d1540f49a4d50a38ce8c97f9a53` | api-design, browser-qa, e2e-testing, java-coding-standards, postgres-patterns, security-review, springboot-patterns, springboot-security, springboot-tdd, springboot-verification, verification-loop |
| https://github.com/anthropics/skills.git | `e4bb5d960d87126ff3b3a8af1a104b7db67560ba` | academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx |
| https://github.com/blader/humanizer.git | `a32f24407364c74c812b43c15926d638bee1e072` | humanizer |
| https://github.com/czlonkowski/n8n-skills.git | `ecdeca6f760b56bb1b11c0a7c961f11b69cb87d5` | n8n-agents, n8n-binary-and-data, n8n-code-javascript, n8n-code-python, n8n-code-tool, n8n-error-handling, n8n-expression-syntax, n8n-mcp-tools-expert, n8n-multi-instance, n8n-node-configuration, n8n-self-hosting, n8n-subworkflows, n8n-validation-expert, n8n-workflow-patterns, using-n8n-mcp-skills |
| https://github.com/forrestchang/andrej-karpathy-skills.git | `2c606141936f1eeef17fa3043a72095b4765b9c2` | karpathy-guidelines |
| https://github.com/mattpocock/skills.git | `abeeaf95660ba9e8b7c753eb38f441ca707a8823` | code-review, codebase-design, diagnosing-bugs, domain-modeling, grill-me, grill-with-docs, grilling, handoff, improve-codebase-architecture, prototype, research, tdd, teach, to-spec, writing-for-agents |
| https://github.com/morluto/rea.git | `46b73f5b8116ac71333a0c37980f166c13bedd4e` | reverse-engineer-anything |
| https://github.com/remotion-dev/skills.git | `89c8afa3eee9cdd83838ac31979c2ba1384615aa` | remotion-best-practices, remotion-captions, remotion-create, remotion-docs, remotion-interactivity, remotion-license, remotion-maps, remotion-markup, remotion-multimedia, remotion-render, remotion-saas, remotion-studio, remotion-upgrade |
| https://github.com/safishamsi/graphify.git | `013a6461c31da6e003c0dea191aca84c94cb8d47` | graphify |
| https://github.com/vercel-labs/agent-browser.git | `0a923358ea989d7602f0d06507ad3447c62ffe9b` | agent-browser |
| https://github.com/vercel-labs/skills.git | `57217cf86ba38148a57af9e90d14a4c049558330` | find-skills |

## Work record (server time)
```text
2026-11-24T13:21:25+09:00 START: identify sources; preserve existing skills and services
2026-11-24T13:22:03+09:00 CHECKPOINT: pinned sources retrieved; select standalone skill files; no global hooks or permission changes
2026-11-24T13:22:18+09:00 CHECKPOINT: skill file installation and byte comparison completed
2026-11-24T13:22:25+09:00 CHECKPOINT: selected skill files installed; upstream metadata failures held
2026-11-24T13:23:03+09:00 CHECKPOINT: real-sfx YAML corrected; agent-browser CLI 0.44.0 verified; GSD isolated Claude/Codex install logs successful; no live service change
2026-11-24T13:23:11+09:00 DOCUMENTATION: dedicated worktree created from current main
2026-11-24T13:23:34+09:00 FINISH: 83 skill names present in both roots; 160 new copies byte-verified; GSD 8+8 isolated; runtime smoke limited to CLI version and core help; no app, database, scheduler or deployment change
```
