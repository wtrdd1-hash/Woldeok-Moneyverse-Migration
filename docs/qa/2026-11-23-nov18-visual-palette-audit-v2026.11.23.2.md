# November 18 full visual audit: color and page-specific UX fidelity

Version: v2026.11.23.2 | Date: 2026-11-23 KST  
Status: **READ-ONLY AUDIT** (no replacement art, source changes, financial operations, Test, or Production deployment)  
Baseline: GitHub `main` `9876c09888ec84034eec183cf1309c85df3d7447`  
Source: `docs/design/all-pages-v2026.11.18.12/previews/*.png` (180 PNGs, desktop+mobile side by side), `docs/design/admin-chat-v2026.11.18.13/references/*.png`, and approved design docs.

## Executive finding

**The owner's color complaint is substantiated.** The 180 PNG gallery is **not** a consistent definitive visual master. It is tagged `PLANNING ONLY`, uses synthetic data, and has generic template repetition. The approved Nov18 design authority, not the variant PNG accent, defines a navy/violet site-wide brand.

### Authority precedence for implementation

1. Current `docs/planning/PROJECT_PLAN.md` and `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, plus latest owner instruction.
2. `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md` (color/type and Spring/UI authority) and `docs/planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md`.
3. Nov18 admin concept `docs/design/admin-chat-v2026.11.18.13/references/admin-console-{desktop,mobile}.png` for layout; per-page 180 PNG concepts for information architecture **only when not contradictory to 1–2**.
4. Older September black/gold/emerald design guidance is superseded wherever it conflicts with current November authority.

**Binding color tokens:**

| Semantic role | Color | Policy |
|---|---|---|
| Base background | `#0C1020` | All pages |
| Card / elevated surface | `#151D32` (elevated `#1C2642`) | All pages |
| Brand and primary action | `#9C83FF` | All pages including wallet, banking, admin, tools |
| Secondary action / links | `#64B7FF` | No independent cyan brand |
| Primary and secondary text | `#E9F1FF`, `#A8BCD8` | High contrast |
| Verified success/gain | `#4ADE80` | Semantic state **only** |
| Verified loss/risk | `#FB7185` | Semantic state **only** |
| Warning | `#FBBF24` | Semantic state only |

Source CSS agrees: `spring-backend/src/main/resources/static/css/mv-theme-nov18.css` defines matching tokens. Do not introduce per-route brand overrides in new implementation.

## All 180 PNGs: visual accent classification

Method: on the MiniPC, parse 180 gallery rows from the README, read their actual PNGs with Pillow, resize each to 332×198 for aggregate pixel analysis, count saturated/bright green-cyan-violet pixels (HSV thresholds: saturation > 0.26, value > 0.30, channel spread > 55, teal/cyan hue .38–.57; violet hue .68–.84) and group by README family. This is **observational color grouping, not a WCAG contrast certification**, and includes shades of blue-cyan in the teal/cyan family.

| Family | PNGs | Dominant accent group | Observed mismatch |
|---|---:|---|---|
| Admin | 40 | cyan/teal 40 | Header, brand decoration, chart and borders cyan/blue instead of shared violet |
| Finance | 27 | green/teal 27 | Wallet/bank, savings-pot and stocks render mint/teal brand accents |
| Tools | 37 | bright cyan/teal 37 | Calculator primary result/calculate button cyan, not shared brand violet |
| Auth | 7 | violet 7 | Mostly consistent |
| Game | 16 | violet 16 | Mostly consistent |
| Home | 1 | violet 1 | Matches approved direction |
| Legal | 6 | violet 6 | Group classification; limited saturated pixels |
| Member | 24 | violet 24 | Mostly consistent |
| Social | 22 | violet 22 | Mostly consistent |
| **Total** | **180** | **104 cyan/teal vs 76 violet** | Inconsistent accent system |

Green is not prohibited for **actual positive financial changes**, but coloring the wallet/bank brand/title/hero border and generic sparkline green regardless of verified state is not an allowed semantic use.

## Page-specific visual insufficiency

- `wallet.png` vs `bank.png`: **99.51% identical pixels** after both are resized to 415×248 with Pillow. Different titles do not constitute a dedicated bank UX.
- `bank.png` vs `bank-savings-pot.png`: **99.31% identical** by the same method.
- `wallet.png` vs `wallet-activity.png`: **99.33% identical**.
- `wallet.png` vs `stocks.png`: **99.52% identical**.
- These metrics measure *image duplication*, not source-code functional coverage or runtime UI matching.
- Wallet, bank and savings-pot gallery PNGs share balance, generic change, 'status', illustrative sparkline, recent records and quick-links blocks. They do not depict distinct working account, deposit/withdraw, saving-pocket contribution/withdrawal, receipts, insufficient-funds/confirmation/error states.
- Mock `12,580 WLD`, `+2.41%` and other repeated values cannot be represented as actual balances/performance.
- `admin-bank.png` belongs to the blue/cyan generic admin family; the separate `admin-console-desktop.png` / `admin-console-mobile.png` references depict navy/violet administrator chrome and show a different level of fidelity. Both are design-only, not production proof.
- Templates display PC and mobile in one 1660×990 planning canvas; that layout does not certify actual 320px/390px reflow, keyboard, five-language coverage or real member flows.

## Runtime cross-check (not a UI acceptance test)

- Spring approved stylesheet `mv-theme-nov18.css` uses violet tokens; source `spring-backend/src/main/resources/static/bank.html` also contains a violet brand token alongside legacy blue/green marketing decorations.
- Anonymous live `GET /bank` returned HTTP 200 on 2026-11-23 KST. This does **not** establish that the real rendered layout matches design, that logged-in bank funding works or that the 180-page suite has been deployed.
- Earlier Nov21 route audits and previous wallet/bank source observations remain distinct; related banking functionality/security defects are recorded in draft PR #3368.

## Required design correction, scoped as next work (NOT done here)

1. Publish a **single component/tokens authority** for all Spring MVC/Thymeleaf site routes. Primary navigation/actions remain violet even on finance/admin/tools; cyan/green only when contextually justified, and never as a second domain brand.
2. Produce **per-feature designs**, not copied generic screens: Wallet total/cash/bank + Deposit/Withdraw/Transfer/History; Bank current/savings/pockets/rates + authenticated forms and posted receipts; saving pockets with target, progress, funding and withdrawal; stocks with symbol/holdings/order states; admin with actual RBAC and failed/in-progress states.
3. Compare before/after screenshots at 320, 360, 390, 430, 768, 1024, 1440, 1920px, 200% zoom and EN(default)/KO/JA/ZH/VI. Use screenshots as visual evidence only; independently verify real APIs, authorization, ledger and receipt states.
4. No release of the bank transfer/deposit/withdrawal workflow until the independent P0 identity and balanced-ledger defects in PR #3368 are corrected/tested.
5. Use a separate owner-assigned implementation branch/worktree, source SHA lock, official Test backend and zero-downtime production gates. Neither PNG repainting nor CSS token change is by itself completed feature QA.

## Evidence level and limitations

**Verified:** Repository files, all 180 PNG pixel analysis, exact sampled visual comparisons, inspected CSS, anonymous public GET.  
**Not verified:** Original 11/18 in-chat generated art pixel-identical match, live authenticated member visuals, API write success, Java/DB test suite, screenshot-per-route browser test, or deployment. No graphical images were modified in this audit.

**Work record:** `docs/worklog/2026-11-23-nov18-visual-audit-v2026.11.23.2.md`.
