# DESIGN.md — Woldeok Moneyverse Web

**Status:** source-derived design contract (local pilot; not a completed Stitch cloud project).
**Baseline:** owner-approved November 18, 2026 UI; integrated plan and Spring MVC/Thymeleaf source take precedence over older drafts.
**Visual sources:** `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`, `docs/FRONTEND_AND_UI_MASTER_GUIDELINES_20261119.md`, and `spring-backend/src/main/resources/static/css/mv-theme-nov18.css`.
**Reference imagery:** `docs/design/all-pages-v2026.11.18.12/previews/` and the approved official logo/favicon; screenshots are visual references, not verified functional implementations.

## 1. Visual theme and atmosphere
Premium, information-dense game-economy and banking web interface. Dark deep-navy surroundings, legible blue-navy surfaces, a restrained consistent violet brand accent, strong numeric hierarchy. Modern but trustworthy; playful economy details must not compromise banking clarity or data provenance. Reuse a common visual shell for guest, member, and administrator pages.

## 2. Color palette and semantic roles
| Token | Approved value | Usage |
| --- | --- | --- |
| `--mv-bg-base` | `#0C1020` | Entire application deep-navy backdrop |
| `--mv-bg-surface` | `#151D32` | Cards, navigation and panels |
| `--mv-bg-surface-elevated` | `#1C2642` | Elevated panel or form surfaces |
| `--mv-brand-violet` | `#9C83FF` | Primary action, selection, active state and focus accent |
| `--mv-brand-violet-hover` | `#B4A0FF` | Hover for violet controls |
| `--mv-accent-blue` | `#64B7FF` | Secondary information and links only |
| `--mv-text-primary` | `#E9F1FF` | Main body and financial labels |
| `--mv-text-secondary` | `#A8BCD8` | Secondary descriptions and metadata |
| `--mv-status-success` | `#4ADE80` | Verified upward / available / success states only |
| `--mv-status-danger` | `#FB7185` | Verified downward / destructive / risk states only |
| `--mv-status-warning` | `#FBBF24` | Warnings and pending actions only |
Do not replace this purple identity with a generic AI-inspired palette. No black/gold/green rebrand, random per-route accent colors, or fabricated success/balance indicators.

## 3. Typography and number rules
- Body and Korean UI: `--mv-font-sans`: Pretendard with system fallbacks; preserve clear hierarchy, 15px base text and readable line height.
- Numeric figures: `--mv-font-mono`: JetBrains Mono with monospace fallback; use tabular figures, thousand grouping and unchanged integer/decimal precision.
- Keep long translated labels readable without truncating essential financial values; semantic emphasis before oversized headline gimmicks.

## 4. Component language
- Navigation: shared responsive shell, real brand logo/favicon, stable top bar; desktop sidebar, compact mobile header and bottom navigation where appropriate.
- Cards and controls: card surface `#151D32`; radii `--mv-radius-sm` (8px), `--mv-radius-md` (12px), `--mv-radius-lg` (16px); clearly differentiated hover, pressed, disabled, loading, success and error states.
- Forms: explicit visible labels, validation text, keyboard focus. Never imply a transaction completed without a backend receipt.
- Bank, wallet, portfolio, stocks, trade and admin tables: prioritize source accuracy, account permissions, exact units and responsive overflow containers.
- Shared help/chat: exactly one reachable 56×56px circular entry point per page, separated into admin support and member chat only after valid server-side authorization; respect mobile safe area and overlays.

## 5. Responsive layout and accessibility
- Verify layout at widths 320, 360, 390, 430, 768, 1024, 1440 and 1920 CSS pixels, plus 200% browser zoom.
- Avoid body-level horizontal overflow and overlapped fixed controls. Minimum hit targets 44×44px.
- Provide visible keyboard focus, readable WCAG AA contrast, meaningful screen-reader labels, reduced motion, empty/loading/error states, RTL-safe structure where applicable.
- Test multi-line English/Korean/Japanese/Simplified Chinese/Vietnamese text without breaking navigation or forms.

## 6. Localization, data, security, framework
- Primary locale English (`en`); Korean (`ko`) second; support `ja`, `zh`, `vi`. Respect explicit saved manual selection, then account preference, then browser languages, then English fallback.
- Deliver as web UI using the existing Java Spring Boot MVC + Thymeleaf architecture, not a replacement Next.js, independent React runtime, or Android/iOS app.
- All financial balances, prices, stock data, avatars, session state and administrative actions must bind to authorized live backend APIs/DB; placeholders and sample charts must never look live.
- Fail closed for unauthenticated / unauthorized admin access, avoid leaking session tokens or customer data into design tools, and maintain transaction/CSRF rules.

## 7. Agent / Stitch usage policy
1. Read the integrated plan and this DESIGN.md before any screen work; compare target screenshots with the original Nov 18 references.
2. In an isolated branch/worktree, run `stitch-extract-design-md` on the existing Spring HTML/CSS source and reconcile findings against approved tokens. The tool can work without Stitch MCP.
3. Only after separately connecting Stitch MCP and explicitly approving a **sanitized** asset upload, use Stitch to generate or edit design *proposals*; do not upload actual user data, secrets, code that embeds tokens, or production screenshots.
4. Review desktop/mobile outputs and port approved visual structure into existing Spring/Thymeleaf components, without altering backend API contracts or permissions.
5. Run CSS token check, accessibility and real-API/role/locale/browser QA on independent Test; failed Test or missing rollback evidence blocks Production.

**Not yet done:** Stitch cloud connection, remote design system upload, generated UI, full 180-route comparison, real-account E2E and deployment. Local DESIGN.md extraction does not imply UI implementation.
