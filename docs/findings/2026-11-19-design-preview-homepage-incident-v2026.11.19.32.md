# Incident analysis: design-preview comparison published as production homepage

**Version:** v2026.11.19.32
**Status:** CONFIRMED presentation mismatch; remediation NOT performed
**Date:** 2026-11-19 KST
**Scope:** documentation and read-only evidence gathering. No source, server, API, database, Test or Production changes.
**Korean companion:** [한국어](2026-11-19-design-preview-homepage-incident-v2026.11.19.32.ko.md)

## Executive finding

The supplied mobile browser screenshot is **not a verified rendering of the previously accepted game-like homepage artwork**. It shows a page entitled "신규 사용자 유입을 위한 홈 화면 3안", a three-concept comparison experience, at `easy-scraping.com`. This is consistent with the application's exploratory `/design-preview` source, which explicitly calls itself a comparison prototype and says that only one chosen concept should be refined for actual operation. A local mini-PC QA report specifically records copying the design-preview HTML into the production root, and a read-only live-root GET returned the three-concept title. This is a **prototype-to-production boundary failure** and must not be represented as the completed approved redesign.

The screenshot does **not** establish which assistant or human authored each design element. Git metadata can identify a committer, not reliably attribute visual design authorship. No user approval for replacing the homepage with the unselected full comparison page was found in the reviewed project plan. The live check proves an HTML marker at the root, **not** that all runtime API, navigation, authenticated, or financial flows work.

## Evidence and provenance

| Evidence | Verified fact | Limitation |
|---|---|---|
| User-provided screenshot `1795053952878.jpeg` | Mobile Chrome screenshot 783×1536, SHA-256 `306fa75c03997e91c94da4697219b3a3637608bc0931029567ea815879a6cfeb`. Shows 3-concept title, green-dominant look, 01 onboarding, floating gift/help controls, and a visually blank green header control | Screenshot provided in conversation, **not checked into this repository**; no click behavior or API traces |
| `frontend/src/app/design-preview/page.tsx` | Metadata says "신규 사용자 UX 시안"; SEO metadata `robots: { index: false, follow: false }`; copy calls the screen a comparison prototype with three alternatives `01 / 02 / 03` and states only a selected option should go to production | Design preview source does not prove approval for root deployment |
| Mini-PC local QA report `docs/qa/2026-11-19-admin-api-and-180-route-exhaustive-qa.ko.md` | Section 4 says `spring-backend/src/main/resources/static/design-preview/index.html` was copied to the root `index.html` and served at `https://easy-scraping.com`; section 5 describes removing hydration bundles and maintaining this three-concept root | This QA file existed on mini-PC local `main` (`fa36b7b091`) but **not on remote `origin/main` (`78a3ff446f`)** at investigation time; claims are historical statements requiring independent release evidence |
| Live read-only HTTPS GET | On 2026-11-19 KST, `https://easy-scraping.com/` returned HTML (113,884 bytes) containing "신규 사용자 유입을 위한 홈 화면 3안", "디자인 시안 비교", and "YOUR FIRST MISSION" | Did not authenticate or execute browser interactions; does not confirm precise deployed SHA or functional correctness |
| `docs/planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md` | Specifies the user's previously accepted navy/violet/blue **game-like economy UI direction**, desktop/mobile coverage, and design-only initial stage; no production implementation under that planning deliverable | The planning document calls its 180 combined PNGs conceptual; they are not pixel-level proof of prior chat-rendered artwork |
| `docs/design/UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md` and `docs/design/all-pages-v2026.11.18.12/previews/home.png` | Persistent handoff for 180 desktop/mobile route concepts plus separate admin concepts; warns that the design concepts were not verified as a pixel-identical recreation and were not proof of Spring implementation | Final visual signoff requires side-by-side comparison to the user's approved original images |

**Branch synchronization:** initial documentation branch based on freshly fetched GitHub `origin/main` `78a3ff446f`. Concurrent local `main` `fa36b7b091` was 63 commits ahead at inspection; no unrelated work was staged, rebased, or deployed.

## Specific mismatch matrix

| Area | Observed in supplied screenshot | Contract/issue | Severity |
|---|---|---|---|
| Homepage purpose | "홈 화면 3안", concept 01/02/03 exploration | Comparison/gallery is **not** a finalized homepage; must remain isolated from `/` | **P1 — release gate** |
| Approved art direction | Green/teal promotional card dominates | Existing full-page specification is navy, violet and blue with restrained gold/economic status green; compare approved image before accepting color/token changes | Major |
| Information architecture | Exploration title and concept card take initial viewport | Actual homepage should prioritize playable economy dashboard, quest, wallet summary subject to authentication, market states, real community links | Major |
| Header action | Large green button-like rectangle visually lacks text | A visible primary action must have a semantic label and functioning destination; inspect DOM/contrast before concluding underlying bug | High |
| Floating controls | Gift progress `0/7` at lower left and circular headset/help at lower right over content | Must be independent functional affordances, no obscuring card/actions, maintain 56px global contact control and safe-area clearance | Medium |
| Preview data and "live" claims | Badges "실시간 라이브 연동", "3분 완성", illustrative onboarding | These labels do not certify a live API; every claim and progress count must be backed by actual Spring responses or identified as preview-only | High |
| Bottom navigation | Home, exchange, wallet/bank, jobs/farming, tasks/governance | Verify actual hrefs, authentication/permission gates, scroll/keyboard behavior, and preservation of original feature routes | High |
| Languages | Korean labels alongside English marketing text | Design review must not confuse localized KO screenshot with default locale. Product contract requires **English default and Korean second** with no hard-coded locale leakage | Medium |
| Production claim | `/` displays preview markers | "HTTP 200" and static rendering are not proof of release quality, wallet accuracy, all routes, admin controls or E2E completion | **P1 — validation gate** |

### Root cause / contributing control failure

**Direct cause documented by the local QA report:** a design-comparison HTML file was promoted into the Spring static homepage, causing a preview artifact to become the public entry screen.

**Process failure:** no traceable image-level user signoff or automated negative test prevented `design-preview` content from being served by `/`. The project had explicitly separated planning PNGs from runtime implementation; the promotion blurred that boundary. Specific individual responsibility is **not proven** by the available evidence.

## Required correction contract (proposed, not executed)

1. Preserve the approval chain: user-approved chat design reference → approved page-specific design contract → Spring home implementation → screenshot diff → signoff. Treat the recovered 180 PNGs as handoff concepts, not unquestionable pixel-perfect originals.
2. Keep `/design-preview` (if retained at all) behind an internal/test-only route with noindex and access controls as appropriate. **Never** copy its three-variant gallery into production `/` as if it were the selected homepage.
3. Implement actual homepage with the approved **game-like navy/violet/blue** family: home hero, first mission and progress with verifiable sources, wallet and market snapshot for authorized members, community/activity links, actual quick actions, and desktop/mobile layout families. Separate guest, signed-in, error, loading, empty, stale and unauthorized states.
4. Runtime must use the currently approved Java Spring Boot serving route and secured Spring APIs. Do not reintroduce a Node.js / Next.js production dependency to serve the homepage. Avoid mock financial values, fake completed quests and simulated success/error suppression.
5. Fix accessibility and layout at minimum widths 320/360/390/430/768/1024/1280/1440/1920px and 200% zoom. Require no horizontal clipping, focus/keyboard operation, clear action labels, ≥44×44px touch targets, and fixed bottom navigation/contact components without overlap.
6. Test real anonymous/member/admin sessions, API successes and failures, route links, CSRF/permission boundaries, money ledger consistency, onboarding completion, global contact/chat, SEO canonical/noindex behavior, and failure/unknown visual states.
7. Use a separate UI branch and isolated worktree, with coordination and file ownership recorded against the concurrent Gemini task. Build a distinct Test deployment, verify exact Spring JAR SHA, DOM/screenshots and authenticated API E2E, obtain visual approval, then use the documented zero-downtime production promotion and rollback gates. Never substitute a document-only PR for code deployment authorization.

## Fail-closed release acceptance

- [ ] User approves a **single** finalized home layout against the exact original visual reference (desktop and mobile).
- [ ] `GET /` never contains "신규 사용자 유입을 위한 홈 화면 3안" or "디자인 시안 비교"; preview content remains isolated.
- [ ] Every visible CTA, nav item, quest, wallet/bank, exchange, job/farming, governance and floating contact entry executes a real authorized flow or has an explicit honest unavailable state.
- [ ] Responsive, i18n English-default/Korean-secondary, WCAG 2.2 AA, and screenshot regression pass with reproducible screenshots and exact SHA.
- [ ] Spring-only Test runtime, logged-in member/admin E2E, API failure paths, finance integrity, release/rollback proof and production smoke checks pass.
- [ ] Change log, internal update, GitHub update, worklog and implementation PR clearly separate **planned**, **tested** and **deployed** states.

**Current outcome (v2026.11.19.32):** Incident documented and live/root/source mismatch evidenced. **No UI correction, Test run or production promotion is claimed.**