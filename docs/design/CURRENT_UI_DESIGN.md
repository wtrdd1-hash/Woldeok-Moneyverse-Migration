> **SUPERSEDED 2026-11-24 — active authority is G1.** The owner approved the G1 "Guild Ledger" set ([gallery](game-ui-v2026.11.24.G1/README.md)); [CURRENT_UI_DESIGN_MANIFEST.json](CURRENT_UI_DESIGN_MANIFEST.json) now pins its 180 PNGs. v2026.11.23.10 below is archived for history and is no longer an implementation input. G1 implementation rules: tokens in `frontend/src/app/g1-tokens.css`; no tracked-caps eyebrows, tinted title phrases, decorative gradients or shadows; content radii capped at 8px; one h1 per page; figures only from live APIs.

# Current UI Design Authority — Single Active Image Set

**Authority update:** v2026.11.24.1 (2026-11-24 KST)

**Image baseline:** v2026.11.23.10 (Nov 23 corrected 180-route gallery)

**Scope:** PC/mobile responsive website; public, member, administrator and all routes

**Status:** Visual reference selection is binding; image QA passed, individual visual acceptance and live functional verification are OPEN.

## Required starting points for every coding assistant

1. Read the [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md), [UI/UX Single Reference](../UI_UX_SINGLE_REFERENCE.md) and this authority before any UI changes.
2. Locate the page in the [active 180-route gallery](game-ui-v2026.11.23.10/README.md) or [strict manifest](CURRENT_UI_DESIGN_MANIFEST.json). Use **only the linked v10 PNG** for layout, spacing, colors, section order, responsive hierarchy and route-specific structures. This is the **only active visual image source**, not an assertion that every image was individually approved.
3. If a v10 preview is missing, invalid or unsuitable, record a QA blocker and get a new explicit design decision. **Never silently substitute an older PNG**, a generic card layout or synthetic financial data.
4. Use actual verified code and the integrated master for functional contracts, accessibility, i18n, Spring architecture, authorization and real backend behavior. A design mockup does not prove a feature works. Never invent balances, rates, game dates, player data or API responses.
5. The actual favicon is the only brand logo: spring-backend/src/main/resources/static/assets/mv39/favicon.ico. Administrator navigation must only render for server-authorized admins. Maintain English primary documentation and Korean secondary translation.
6. When the owner explicitly revises the visual baseline, update this file, manifest, English/Korean galleries, single UI/UX reference and task ledger together; verify all 180 routes. Older images never become implementation instructions automatically.

## Design image version classification

| Version | Role | Use |
| --- | --- | --- |
| **v2026.11.23.10** — [active gallery](game-ui-v2026.11.23.10/README.md) | **ACTIVE / sole visual implementation reference (180)** | New UI and v10-route visual comparisons |
| v2026.11.23.8 — [archived gallery](game-ui-v2026.11.23.8/README.md) | **ARCHIVED / SUPERSEDED (180)** | Historical comparison only; not fallback |
| v2026.11.18.12 — [archived gallery](all-pages-v2026.11.18.12/README.md) | **ARCHIVED / SUPERSEDED (180)** | Historical provenance only; not fallback |
| Other earlier previews, old screenshots and PR images | **NON-AUTHORITATIVE** | Defect/history evidence unless explicit new owner direction |

**Visual precedence:** latest explicit owner directive → this active authority/manifest → route-specific v10 gallery. **Functional precedence:** approved integrated master, backend/security contracts and verified runtime data.

## Verification boundaries

- v10 asset QA found 180 readable, route-specific 1660×990 PNGs; manifest pins each file's SHA-256. The earlier QA included favicon sampling.
- **Still OPEN:** final page-by-page artistic approval; actual 180-page runtime implementation; responsive/browser parity; five language coverage; ledger/API workflows; administrator role security; Test acceptance; Production promotion.
- Retain all historic files and links to preserve auditability; archived means excluded from new implementation input, not physically deleted.
- On 2026-11-24 v10 was **not on origin/main**. This update is isolated, subject to CI/review, and is not a production release.

[한국어](CURRENT_UI_DESIGN.ko.md) · [Single UI/UX master](../UI_UX_SINGLE_REFERENCE.md) · [v10 QA](../qa/2026-11-23-game-ui-180-image-feature-audit.md) · [Task ledger](../worklog/2026-11-24-canonical-design-reference-v2026.11.24.1.md)
