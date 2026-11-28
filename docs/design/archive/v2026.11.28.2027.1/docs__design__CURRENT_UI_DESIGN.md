> **Current authority (2026-11-24): G2 "Guild Ledger Terminal", owner-approved.** Visual rules come from the [13 G2 references](game-ui-v2026.11.24.G2/README.md): ledger status strip on every page (live API values only), hairline 6px panels without chamfers, one violet action colour, gold and Orbitron only on the member's own balance, tabular body figures, grouped navigation (GM for administrators only), page head as title plus one line. Each route's content and order follow the G1 per-route previews ([gallery](game-ui-v2026.11.24.G1/README.md)) until G2 per-route previews exist. Tokens: `frontend/src/app/g1-tokens.css` (G2 section).

> **SUPERSEDED 2026-11-24 — active authority is G1.** The owner approved the G1 "Guild Ledger" set ([gallery](game-ui-v2026.11.24.G1/README.md)); [CURRENT_UI_DESIGN_MANIFEST.json](CURRENT_UI_DESIGN_MANIFEST.json) now pins its 180 PNGs. v2026.11.23.10 below is archived for history and is no longer an implementation input. G1 implementation rules: tokens in `frontend/src/app/g1-tokens.css`; no tracked-caps eyebrows, tinted title phrases, decorative gradients or shadows; content radii capped at 8px; one h1 per page; figures only from live APIs.

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
