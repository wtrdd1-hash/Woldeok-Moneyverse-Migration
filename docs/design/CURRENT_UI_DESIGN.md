# Current UI Design Authority — Single Active Image Set

**Authority update:** v2026.11.24.2 (2026-11-24 KST)

**Image baseline:** v2026.11.24.11 (Nov 24 dark gaming & neo-fintech 180-route gallery)

**Scope:** PC/mobile responsive website; public, member, administrator and all routes

**Status:** Visual reference selection is binding; image QA passed, fully open guest mode and typecheck verified.

## Required starting points for every coding assistant

1. Read the [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md), [UI/UX Single Reference](../UI_UX_SINGLE_REFERENCE.md) and this authority before any UI changes.
2. Locate the page in the [active 180-route gallery](game-ui-v2026.11.24.11/README.md) or [strict manifest](CURRENT_UI_DESIGN_MANIFEST.json). Use **only the linked v11 PNG** for layout, spacing, colors, section order, responsive hierarchy and route-specific structures. This is the **only active visual image source**, applying Stake/Roobet/Linear dark gaming craftsmanship.
3. If a v11 preview is missing or requires route-specific enhancement, record a QA note and follow design guidelines (`anti-ai-frontend-craftsmanship`, `interactive-minigame-web-engine`).
4. Maintain fully open guest viewing: non-logged-in visitors must be able to explore all 180 pages without exceptions, fatal redirects or empty screen errors. Stateful actions (betting, claiming rewards, trading) trigger the login modal.
5. All financial figures must render in high-contrast monospace typography (`font-mono tabular-nums`) with 100% SVG vector icons (Lucide), eliminating artificial purple gradients and emoji glitches.

## Design image version classification

| Version | Role | Use |
| --- | --- | --- |
| **v2026.11.24.11** — [active gallery](game-ui-v2026.11.24.11/README.md) | **ACTIVE / sole visual implementation reference (180)** | New UI and official visual implementation |
| v2026.11.23.10 — [archived gallery](game-ui-v2026.11.23.10/README.md) | **ARCHIVED / SUPERSEDED (180)** | Historical comparison only; not fallback |
| v2026.11.23.8 — [archived gallery](game-ui-v2026.11.23.8/README.md) | **ARCHIVED / SUPERSEDED (180)** | Historical comparison only; not fallback |
| v2026.11.18.12 — [archived gallery](all-pages-v2026.11.18.12/README.md) | **ARCHIVED / SUPERSEDED (180)** | Historical provenance only; not fallback |

**Visual precedence:** latest explicit owner directive → this active authority/manifest → route-specific v11 gallery. **Functional precedence:** approved integrated master, backend/security contracts and verified runtime data.

[한국어 (CURRENT_UI_DESIGN.ko.md)](CURRENT_UI_DESIGN.ko.md) · [Single UI/UX master](../UI_UX_SINGLE_REFERENCE.md) · [Manifest](CURRENT_UI_DESIGN_MANIFEST.json)
