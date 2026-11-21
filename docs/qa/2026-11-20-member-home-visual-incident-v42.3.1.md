# v2026.11.20.42.3.1 — Owner-reported broken frontend UI: immediate rollback, root causes and actual Production verified repair

**Environment:** PC/mobile browser WEBSITE on Spring static assets + existing Java API, NOT an Android app. Owner reported visibly broken UI after the v42.2 static member-home production rollout. Production user HOME only scoped; Spring Java JAR/main/admin/all-page functionality not promoted. Existing G442 full-site 180-route/5-pass and official public Test (403) gates remain.

## Incident timeline and rollback

- Original Production home v2026.11.18.24 had attractive dark card styling but **hardcoded fictional 100,000,000,000,000 WLD Treasury, +2.41% change, 12,840 members and 1,420 sessions**. The v42.2 intended replacement removed those sources, but the first automated browser acceptance measured only no overflow/JavaScript/locale, not visual composition. On mobile, CSS forced all **three repetitive guest personal cards into one vertical column** and quick actions into six single rows, making the page overly long unlike the approved desktop/mobile concept. A fixed support FAB could cover the last action. Market used 760px-wide horizontally scrolling desktop table on phone. This is a real visual regression even with HTTP200/30/30 technical smoke.
- The v42.2 first Nginx candidate incorrectly added a duplicate `location = /` (existing production v24 include already owned that path). `nginx -t` rejected it and full config rolled back before reload. The second candidate used `alias` with a file path and Nginx appended index.html twice, briefly yielding HTTP500 on root; automatic response gate restored previous config. The corrected v42.2 did pass, but **owner's screenshot rejected visual quality**.
- **Emergency rollback at 2026-11-20 08:47 KST**: exact production Nginx SHA `1181941a196381fc44e739c0912a411d13bc802b85f2a75dedb0076533d59ab0` restored from a root-protected original backup to SHA `161cbce538be78d4ed666e6b2c62141caf3694a18923644c388e8b1dda70d5b9`. `nginx -t`, graceful reload, actual HTTPS home200, admin302, admin JSON401 and previous HTML route fixes302. Real rollback Chromium 390/1440: browser HTTP200, 6 CSS style sheets, no missing CSS/JS or JS page errors and no horizontal overflow. The previous page still contained the hardcoded fake metrics: rollback was **emergency availability restoration only**, not a complete source-truth correction.

## Source and visual repairs

1. Separate code ownership branch `fix/member-mobile-visual-v2026.11.20.42.3` stacked on #3306, preserving other agents' branches. Source files: `spring-backend/src/main/resources/static/index.html`, `assets/mv39/site.css`, `assets/mv39/app.js`.
2. Phone breakpoint <=480: first wallet KPI full width, secondary holdings/quest cards share a row; guest second card uses compact legitimate sign-in link instead of repeating full-length text; quick actions two columns at least 44px high. Flex/word wrap and sensible padding for 320px min viewport.
3. Source-backed stock market: phone <=480 displays compact **real public API** symbol/name and exact WLD quote/trend/status rows, not the desktop 760px table. Desktop continues semantic six-column scroll table. Both react to the same verified `/api/v1/stocks` read; unknown price/status stays explicit unavailable and no fake history points are injected.
4. Hide floating support FAB at <=1023 because it occluded quick-action button; support remains reachable via the dedicated quick-action and navigation. Responsive CSS measured from DOM bounding rectangles and screenshot captures, rather than horizontal overflow only.
5. HTML uses explicitly versioned `?v=v2026.11.20.42.3.1` for scoped CSS/i18n/JS so browsers do not mix previous cached layout with current markup. Immutable release folder and SHA checks, mobile/desktop screenshots tied to exact public HTTPS runtime.

## Actual QA + deployment evidence

| Gate | Observed |
|---|---|
| Source test and full Spring regression | `scripts/test_mv39_home.py` **16/16**, Spring `./gradlew --offline test` **271/271 pass, zero skips/fails**, JS syntax and git diff --check PASS |
| Mobile layout geometry (isolated fixture) | **7/7 PASS**: 320,360,390,430,768,1024,1440; first/second KPI placement, quick-action same row, 44px targets, no clipping, no mobile FAB overlay |
| Real existing Spring public API staging (isolated same-origin no-cookie GET proxy; not official Test) | **6/6 PASS**, 320–1440 widths; source-backed stock quotes 8 visible, no 100T Treasury or synthetic Board author/posts, real `/api/v1/stocks` HTTP200 |
| v42.3 first public deployment | HTML/CSS/JS exact file hashes match live HTTPS; actual real source market/6 widths **6/6**, five languages x six widths x five cycles **30/30**. No administrator/finance API route changed |
| v42.3.1 occlusion fix | First candidate's Nginx snippet version string accidentally created non-existent `.1.1` source path; a public source-hash gate **detected mismatch and auto-rolled back to v42.3**. Script corrected with exact path assertion before reload. Final v42.3.1 exact source HTML/CSS/i18n/JS hashes **4/4**, nginx -t/graceful reload, public HTTP/regression PASS |
| **Final real Production browser** | Actual no-mock HTTPS real market/responsive screenshot **6/6**, and five language cycles x six responsive widths **30/30**, **zero JavaScript exceptions**. CSS source version verified and mobile FAB absent; actual source 8 public stock rows displayed |
| Exact deployed bytes | HTML SHA256 `6794e3892128e15f885bf535fc595bdd5cae0e1de9dd3ce1cbfc588b411177f9`, CSS `d22d87a9915e9399f86ad75557bc7dfb5570eb15fa734ec89b59eb84dc9e52f1`, JavaScript `6d745cc3295c7c166eb1ae41de4402f32c661bd60681a8cffa8b7d4f87467d66`, final Nginx config SHA `c81c2b0727147bfdb14080658929e4eed192343fd291c31034b519c643778e9d` |
| Public security/API regression | `/`200, `/admin`302, `/admin.html`302, `/admin/blog-verified`302, `/api/v1/admin/users`401, auth session200, stocks200, two prior HTML alias302 |
| Immutable rollback | Protected local prior versions (v24, v42.3) and `nginx -t` + source-hash + browser failure automatic rollback. Actual v42.2 and first v42.3.1 rollback exercised. No user/DB write, no Java Production restart |

## Outstanding separate work (do NOT represent as done)

- **Only member homepage is deployed.** New Spring AdminDashboardPage source, legacy admin feature screens and Spring authorization repairs from #3304/#3306 are NOT installed on Production Java. Existing admin Nginx auth gate remains protective.
- Live `/api/v1/board` itself still emits fabricated `post-wld-*` at backend level. New homepage JavaScript explicitly fails closed for that payload, but actual backend fix needs verified rollout; community feed may show unavailable.
- Financial summary/stock portfolio/treasury/KDIC/derivatives, actual signed-in 2-member ledger source matching, authorized real administrator positive Test, official Test HTTPS 403, 15 fail-closed 503 routes and G442 ~180 pages x five full interactions/independent rollback remain uncertified. Full Java/main/entire web Production promotion **HOLD**.

[Actual public mobile/desktop captures](../design/mv42.3.1/README.md) · [Korean QA](2026-11-20-member-home-visual-incident-v42.3.1.ko.md) · [Worklog](../worklog/2026-11-20-member-home-visual-incident-v42.3.1.md).
