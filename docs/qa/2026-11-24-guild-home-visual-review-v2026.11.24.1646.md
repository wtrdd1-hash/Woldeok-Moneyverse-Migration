# Guild home visual quality and functional QA record

Version: v2026.11.24.1646 | OPEN / documentation only / production HOLD.
Evidence: owner-provided 1736×864 screenshot on 2026-11-24 and preceding qualitative review. Route, deployment SHA, session and capture time are unknown. [Korean full record](2026-11-24-guild-home-visual-review-v2026.11.24.1646.ko.md).

## Findings
Subjective overall 48/100; color 7/10, layout 4, typography 4, finish 4, UX 5, game immersion 3. Not automated or an arithmetic average.

| ID | Finding | Required improvement |
|---|---|---|
| GH-01 P1 | Oversized decorative skyline hero | Prioritize server clock, market and activity |
| GH-02 P1 | Heavy outlines, clipped corners, repeated gold | Reuse approved navy/violet tokens; limit gold |
| GH-03 P1 | Guest tutorial links dominate | Preserve guest access; personalize hierarchy by verified session |
| GH-04 P1 / P0 if authenticated balance failure confirmed | Balance checking label, wallet and send actions | Real ledger/session binding; distinct loading, empty, guest, error and success; deny unauthorized send |
| GH-05 P1 | One notice and large blank region | Actual notices, dates, states and working list link |
| GH-06 P1 | Heavy headings, weak type/action hierarchy | Consistent typography, spacing, tabular numbers and controls |
| GH-07 P1 | Market/asset/activity context not visible in captured area | Approved real-data market, assets, news and activities; no claim about offscreen content |
| GH-08 P1 | Server day 10181 / week 1455 day 3 lacks context | Preserve server-specific calendar; verify API, boundaries and freshness |

## Proposed direction and verification
Use premium dark navy/violet economy dashboard: compact header/clock/market summary, assets and quick actions, notices/news/activity. Preserve guest tools and existing functionality. The [integrated master](../planning/INTEGRATED_PLANNING_MASTER.ko.md), [project plan](../planning/PROJECT_PLAN.ko.md), [UI guidelines](../FRONTEND_AND_UI_MASTER_GUIDELINES_20261119.md) and [Nov18 home reference](../design/all-pages-v2026.11.18.12/previews/home.png) are relevant; recheck latest owner-approved Nov23 assets and open PRs before implementation. Pixel comparison and latest unmerged design approval are unverified. No replacement design authority or asset deletion.

Acceptance tests, all pending: actual browser screenshots at 1736/1440/1280/1024/768/430/390/320px; compare against approved references; verify typography, alignment, overflow, images, approved ads/widgets, keyboard focus, contrast, 44px targets and reduced motion. Test guest/member/admin, expired session/logout/account switch, delayed/empty/401/403/5xx/retry states. No indefinite loader, fabricated zero, static prices, false success or cross-account leakage. Validate wallet/send/calculator/glossary/economy/notice actions; test sends only with isolated synthetic accounts, CSRF, idempotency, insufficient funds and real receipt. Verify actual server clock/market/notice sources and stable refresh. Preserve English default, Korean second, other supported languages and manual selection.

Exact candidate SHA frontend/backend/edge identity, full CI, official Test authenticated data and action E2E, visual QA, independent restore and rollback readiness, then approved zero-downtime promotion only. HOLD otherwise. HTTP 200 alone is not acceptance. Reuse common rules across pages without claiming all 180 pages are defective.

## Stage versions
.1646.1 report (this round); .1646.2 reference and root-cause investigation; .1646.3 isolated implementation; .1646.4 official Test; .1646.5 approved promotion (all latter stages planned). No runtime, code, DB, WLD, Test or Production changes; cause and responsible commit unknown.
