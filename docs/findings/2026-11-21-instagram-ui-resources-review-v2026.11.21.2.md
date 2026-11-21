# v2026.11.21.2 — Instagram UI References: Design Review for November 18 Website
**Date:** 2026-11-21 KST | **Status:** RESEARCH / DOCUMENTATION ONLY; not adopted into Project Plan; not implemented or deployed.
**Primary source:** https://www.instagram.com/reel/DeXyjjREa7b/ — @ibwj, caption dated 2026-10-11, title “바이브코딩, AI 티 안 나는 웹 UI 자료 5곳.” Inspected the exact page's publicly accessible Open Graph description, title and 640px cover using authorized mini-PC MCP HTTPS; **did not verify the reel's motion frames or spoken narration**. Avoid attributing other details to the video.
**Authority:** `docs/planning/PROJECT_PLAN.md` → `docs/planning/INTEGRATED_PLANNING_MASTER.md` → `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`. Linked proposed banking spec in independent draft PR #3343; not merged.

## What the source actually names
1. `animateicons.in` — animated React icons.
2. `shi-ui.vercel.app` — UI elements/blocks.
3. `tween-ui.vercel.app` — animated components.
4. `minimal.gallery` — web design inspiration.
5. `react-frontend-skills` — Claude Code agent skills (caption does not identify a GitHub owner; `PyModel/react-frontend-skills` is a plausible public matching project, not confirmed to be the author's intended repository).

## Independently verified references / applicability
| Reference | Independently observed | Recommendation for Spring MVC + Thymeleaf site |
| --- | --- | --- |
| AnimateIcons https://animateicons.in | 1,500 icons; supports React/Vue/Angular/plain JS. | **Selective use** of an accessible icon language and small microinteractions. Prefer stable SVG + CSS and reuse existing icons, never add an uncontrolled React runtime. |
| SHIUI https://shi-ui.vercel.app | 111 interactive elements/24 blocks; intentionally paper/ink/vermilion, flat 1.5px borders. | **Structural patterns only**: button priority, form states, dismissible notices, data cards. The light Japanese poster theme conflicts with the authoritative Nov18 dark navy/violet palette; do not copy its global tokens. |
| Tween UI https://tween-ui.vercel.app | The specified legacy domain returned 404 during live checking; publicly indexed documents and https://github.com/StaticMania/tween-ui document CSS/GSAP motion with React/Tailwind, reduced-motion support. Maintainer now advertises https://tween-ui.staticmania.com/. | **Concept reference only** for focus/hover, tabs, modals, loading feedback; reimplement natively via CSS/minimal JS where needed. Never run React/GSAP animation in finance submission state to imply a confirmed transaction. |
| Minimal Gallery https://minimal.gallery/tag/finance/ | Curated finance examples and other categories. | **Reference hierarchy and whitespace**, not branding, content or unsupported portfolio values; capture verified image/source licensing before reuse. |
| React frontend skills https://github.com/PyModel/react-frontend-skills | React/Next/Tailwind/Playwright-oriented agent skill collection. | **Quality checklist only** for design, accessibility, responsiveness, test coverage; do not install a React/Next stack or interpret it as authority superseding current Spring architecture. |

## Visual review using owner-provided wallet screenshots (separate from reel)
Owner's 2026-11-21 /wallet screenshot has a total/cash/bank three-card layout and transfer/transaction panels; the second version's green/teal full-screen shell diverges from Nov18 deep navy/violet authority. The observed “2838 x 1321” overlay and screen magnifier may originate outside the website, so do not assign root cause without DOM/browser inspection. The 394,728 WLD / 0 WLD observed labels are not audited ledger values.

### Binding visual baseline / do not change
Background #0C1020; surface #151D32; primary #9C83FF; secondary #64B7FF; text #E9F1FF; muted #A8BCD8; green/red for verified semantic states only. Responsive Spring MVC+Thymeleaf for PC/mobile web. English default, Korean second, plus Japanese, Simplified Chinese and Vietnamese with automatic detection and persistent manual override. Exactly one accessible global support/chat launcher.

## Prioritized actionable design changes (proposals, not code)
- **P0 — coherence/truth:** One nav/header/sidebar, consistent typography/spacings and same financial source across /wallet, proposed /banking, /transfers, /deposits, /cards; exact production data only, explicit updated-at and fail/error/empty states. No success animation until verified receipt.
- **P1 — banking task hierarchy:** Desktop wallet heading→asset summary→4 obvious actions (Send WLD / Deposit / Withdraw / Card)→ledger list→bank products; mobile 1+2 cards, two-column actions, transaction cards instead of clipped table. Existing route ownership first.
- **P1 — microinteractions:** SVG hover/focus on buttons; 120–200ms UI motion budget for nonfinancial transitions; loading states that never hide submit status; no motion on reduced-motion preference; no layout shift or blocked keyboard/screen reader flow. Durations are a **proposed guideline**, not a claim from the video.
- **P1 — financial form trust:** recipient verification, confirmation and idempotency, exact receipt details, user-scoped balances; new virtual card is a Moneyverse-only conceptual product and requires separate security/API design and real two-user Test.
- **P2 — aesthetic polish:** SHIUI-inspired border hierarchy and Minimal Gallery spacing, without importing paper/red tokens; avoid stacked large empty hero panels, decorative duplicates and hover-only actions. Consistent spacing, typographic scale and contrast.

## Release / review gates
Before implementation re-fetch latest main and current integrated authority, coordinate ownership with Gemini, verify external asset licenses and dependency provenance, map every Spring route → controller → Thymeleaf → secured server API → PostgreSQL function, and record initial/mid/end logs. Browser comparison to 18 Nov references at 320/360/390/430/768/1024/1440/1920 and 200% zoom in five locales; tested real ledger/auth flows including CSRF, two member accounts, retry, rollback. Isolated branch + Draft PR → official Test + complete tests → backed-up exact-SHA zero-downtime Production only if all gates pass. No code/test/production claim in this review.
