# Live Root UI Design Drift — Evidence/QA v2026.11.19.32.1

**Scope:** non-mutating production observation and documentation; **NOT** an authenticated functional QA or a bug fix. [한국어](2026-11-19-home-ui-design-gap-v32.ko.md).
Source baseline: GitHub main `78a3ff446fae1ee4754da6edd14b7fc3409f43a2` (v31 restored images).

| Probe / source | Observed result | Pass category |
| --- | --- | --- |
| User screenshot | 783×1536 mobile Chrome shows **“신규 사용자 유입을 위한 홈 화면 3안”**, emerald theme, quest mockup, fixed nav/docks | **Evidence accepted / Design parity FAIL** |
| Live public `https://easy-scraping.com/` GET, 2026-11-19 ~11:11 KST | HTTP 200, 113,884 HTML bytes, same title/labels | **Transport PASS, homepage design FAIL** |
| `/srv/moneyverse-data/frontend-static/index.html` read-only | 113,825 bytes, modified 11:07:16 KST; exact same H1 and badges, first 220 bytes coincide with public HTML | **Artifact content mismatch CONFIRMED** |
| Production illustration HEAD | `/images/guide/newcomer-adventure.png`: 200 | **Asset reachability only**, not onboarding behavior |
| Current source `frontend/src/app/page.tsx` | No three-concept H1; different actual-product landing structure | **Source-to-deployment drift**, origin/author untraced |
| GitHub design images | 180 per-route PC/mobile combined PNGs + 2 admin refs restored on `main`; home/mobile/desktop refs exist | **Artifact presence**, not rendered parity |
| Earlier PRs | #3268, #3270, #3275 closed **unmerged** | **No proof of frontend deployment** |
| Mobile authenticated browser/Chrome visual E2E | NOT RUN | **BLOCKED** |
| Live chats, wallet, stocks, quest/ledger receipts | NOT RUN | **BLOCKED** |
| Root-causing blank green rectangle / overlap measured | NOT RUN | **BLOCKED** |
| Full 180 URLs / source/renderer/response verification | NOT RUN | **BLOCKED**, contradictory local v30 route QA claims |
| Real Test deployment and zero-downtime rollback | NOT RUN; no services or production mutated | **NOT PERFORMED** |

**Release judgement:** P0 root content wrong. No success/complete claim until functional Spring-rendered root and approved responsive UI tested against live permissions/data, followed by exact SHA Test/production gates.

Evidence and proposed G0–G5 acceptance: [EN findings](../findings/LIVE_HOME_APPROVED_UI_GAP_v2026.11.19.32.1.md) / [KO](../findings/LIVE_HOME_APPROVED_UI_GAP_v2026.11.19.32.1.ko.md).
