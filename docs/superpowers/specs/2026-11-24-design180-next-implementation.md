# DESIGN180 implementation in the Next frontend — spec

Status: **DRAFT for owner review** (superpowers:brainstorming, architectural path). No product code is written for this spec until the owner approves it; then superpowers:writing-plans produces the task plan.

Worker: Claude Code (Claude Opus 5.5, claude-opus-5-5), 2026-11-24.

## 1. Intended outcome (owner's words and what they mean)

- Owner: PR #3443 link, then "해결진행 및 백엔드 기능 등 다 점검할 것, 스킬 제대로 많이 써".
- Meaning taken: build the real Next frontend to PR #3443's DESIGN180 screen structures (180 routes, desktop + mobile), corrected where it conflicts with earlier owner direction, on live APIs, verified on Test before any Production promotion; audit the backend in the same pass.
- Assumption (please correct): PR #3443 is the structure/route-contract authority; its visual tokens are adopted with the corrections in §3.

Success = every route renders its DESIGN180 family layout with real data or an honest unavailable/empty state, guest/member/admin each verified on Test with a real signed-in session, zero JS errors, no horizontal overflow at 320–1440px, all suites green, then a separately approved Production switch with rollback.

## 2. Sources and authority

| Source | Use |
| --- | --- |
| PR #3443 `docs/design/ui-ux-180-v2026.11.24.DESIGN180.1/` (360 PNG, `ROUTE_SPECIFICATIONS.md`, `scripts/design/ui-ux-180/styles.mjs`) | Route families, sections, fields, columns, actions, state contract, tokens |
| Owner direction this session | No AI look, no eyebrow labels, no decorative hero/gradients/shadows, no card overload, small radii, precise type, real data only, Korean market colours |
| AGENTS.md §6 | `lib/api.ts` server-only; public pages static/ISR (viewer after hydration); member pages force-dynamic + noindex; shadcn/ui layer; Korean product copy not reworded |
| AGENTS.md §0, §7 | Superpowers stages with evidence; Production cutover needs owner approval + real Test/API/DB/role/locale/viewport evidence + rollback |

PR #3442's "v11" set is excluded: its 180 images are byte-identical to archived v2026.11.23.10.

## 3. Visual system (DESIGN180 tokens, corrected)

Kept from DESIGN180: canvas `#0c1020`, surface `#141b2e`, raised `#1b2440`, line `#2d3753`, text `#f3f5fc`, secondary `#b9c3d9`, brand `#a98aff`, caution `#f6cf87`; 224px sidebar, 64px top bar, 1240px content; 44px touch targets; five-tab mobile dock; tables become labelled cards under 768px; tabular numerals for money.

Corrections (owner direction wins over the proposal):

| DESIGN180 | Implemented |
| --- | --- |
| Positive `#67d8b2` green / negative `#ff9aab` pink for price moves | Rise `#ff5d73` red, fall `#4ba3ff` blue (Korean market); green `#67d8b2` only for success/verified states |
| Eyebrow line above every title ("Moneyverse", "Administrator workspace") | Removed; breadcrumb stays in the top bar |
| Home hero banner with city art | Removed; home opens on balance/status strip and next steps (guild-home QA GH-01) |
| Panel radius 16–18px, input 10px | Panels 8px, inputs/buttons 6px |
| Filler copy repeated across rows ("A clear next step, at your pace") | Real API rows; when none, one honest empty state |
| English-first copy | Existing Korean product strings kept verbatim; DESIGN180 English labels translated only where no Korean string exists |
| Synthetic figures | Never shipped; unknown = "확인 불가"/unavailable, never 0 |

Admin routes use the DESIGN180 separate admin navigation (Overview, Members, Economy, Shop, Content, Support, Security, Audit trail), shown only to server-verified administrators.

## 4. Architecture

- Shared shell rebuilt once: `components/shell/*` (sidebar member/admin variants, top bar with search/locale/notifications/avatar, mobile dock, support button). Replaces G1/G2 shell components; the G2 ledger strip is dropped unless the owner wants it kept (open question 1).
- Family primitives in `components/d180/*`: PageHead, StatRow, Panel, DataTable (desktop table / mobile cards), Toolbar (search + selects), Tabs, SummaryList, FormSection, ReviewFooter, StateBox (loading/empty/error/expired/forbidden), Chart wrappers (candles, line), Receipt.
- Route families (from `catalog.mjs`): home, wallet/receipt, bank/pockets, stock market/detail/order, calculator, editorial/article/gallery, chat/support, account/auth, game/work/quests, guide/legal/status, admin operations. Each family = one layout module; each route supplies its fields/columns/actions from `ROUTE_SPECIFICATIONS.md` and its existing data loader.
- Data: existing loaders and BFF routes only. No new endpoint without a Spring contract; a missing contract renders StateBox "unavailable" and is listed in the plan as a backend gap.
- Tokens: new `app/d180-tokens.css`; G1/G2 token remaps removed after all routes migrate (one switch, not mixed).

## 5. Backend audit findings (this session, read-only unless noted)

1. **Fixed (TDD, commit c855cfc7a6):** Next `rewrites()` ran `/api/:path*` → Spring before dynamic routes, so six dynamic BFF handlers never executed (candles by symbol returned Spring 500; blog slug, auction bid, mint approval, arena handlers bypassed). Moved to `fallback`. Deployed to Test; not yet Production.
2. **Fixed in Production nginx:** my cutover block had dropped `/health`, `/health/spring`, `/api/v1/spring/*` (now 200 again) and the legacy read-only write guard for support/chat/profile/notifications/work/admin economy·stocks·users (restored: writes 403, reads unchanged).
3. **Open:** login CSRF state check exists only on this branch's Spring; Production Spring lacks it. `/api/shop/purchases` answers 503 to guests instead of 401. Treasury/pension/fx/kdic intentionally fail closed (feature or verification gates). Spring suite 710/713 (3 legacy Thymeleaf contract tests). Local registration closed in Test backend, so no QA member can be created without owner action.
4. **Ops:** 1,475 root-owned files in the shared `.git` (written ~20:50 by a root git process) blocked every worker's commits; ownership restored to debian.

## 6. Verification gates

- Per task: RED → GREEN unit/component tests (vitest), tsc, eslint.
- Per family: Playwright at 320/390/768/1100/1440, guest + member + admin, zero JS errors, zero overflow, h1 = 1, Hallmark sloplint on rendered HTML, web-design-guidelines review.
- Whole branch: full vitest + Spring suite, 180-route crawl on Test, side-by-side screenshots vs DESIGN180 PNGs, independent review (codex-review when available, else fresh reviewer subagent).
- Production: separate owner approval with the evidence above; switch = service release swap, rollback = previous release.

## 7. Open questions for the owner

1. Keep the G2 ledger status strip (server time / rise-fall / base rate / my WLD) on top of DESIGN180, or drop it?
2. A real signed-in QA member and admin on Test are required for the role evidence AGENTS.md §7 demands. Can you sign in once on test.easy-scraping.com with Discord/Google (or allow a Test-only local account)?
3. Deploy the branch's Spring security fix (OAuth state check) to Production as a separate backend release?
4. The restored Production read-only guard blocks support/chat/profile/notification/work writes as before the cutover. Keep it (default) or open those writes?
