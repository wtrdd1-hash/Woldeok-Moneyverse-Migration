# Google Stitch Skills — Source-Only Integration Pilot (v2026.11.24.0818)

## Scope and provenance
- User reference: https://www.youtube.com/shorts/T5qdrYS7znc, verified YouTube metadata (title and description) pointing to https://github.com/google-labs-code/stitch-skills.
- Google Labs Code upstream commit: `9f4e828e77634e230978be45fec5501554dbe4b2`, original Apache-2.0 LICENSE preserved.
- Source-only skill copied into `.agents/skills/stitch-extract-design-md/`; agent-skill frontmatter name adapted to kebab-case. Upstream instructions otherwise intact; no unreviewed `npx` installer, no external API called.
- Existing approved Nov 18 Spring web design, not a redesign: `.stitch/DESIGN.md` / `.stitch/DESIGN.ko.md`, grounded in `spring-backend/src/main/resources/static/css/mv-theme-nov18.css` and `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`.

## How to use this local skill
1. In the isolated task worktree, read `.agents/skills/stitch-extract-design-md/SKILL.md` and its `references/plain-css.md`; inspect current Spring Thymeleaf templates and CSS without running external design agents on customer data.
2. Consult `.stitch/DESIGN.md` as an agent-readable design specification, preserving official navy/violet color tokens, licensed image/logo references, five locales, PC/mobile and real backend data semantics.
3. Run `python3 scripts/verify_stitch_design_contract.py` after changes; current result: **PASS 11/11 CSS tokens and contract checks**. This is a static contract check, not a browser visual test.
4. To create actual Stitch cloud designs later, separately configure Stitch MCP from https://stitch.withgoogle.com/docs/mcp/setup/ and obtain explicit confirmation before uploading sanitized materials. `manage-design-system` itself requires confirmation before upload. Stitch MCP has **not** been connected in this pilot.
5. Generate proposals only; the actual application remains Java Spring Boot MVC + Thymeleaf. Validate approved changes against original images and independent Test with real API/DB, locales, RBAC, accessibility and rollback gates before any Production action.

## Risk and acceptance
- Never upload credentials, account/balance data, real customer screenshots, internal system paths with secrets, or production source bundles to Stitch. Prefer a redacted design-only snapshot.
- Original experimental skill may embed subjective design advice. Project-approved November 18 navy/violet branding overrides any third-party generic style guidelines.
- **Done:** local skill installation, audited license/source, EN/KO design contracts, deterministic source check, isolated branch documentation.
- **Not done:** Stitch MCP/API authorization, Stitch cloud design generation, browser renders, 180-route visual QA, independent Test server deployment, Production change. Do not infer implementation completeness from this pilot.
- Current candidate branch: `feat/stitch-design-skill-v2026.11.24.0818`; base main SHA `9876c09888` (re-fetch before merge).
