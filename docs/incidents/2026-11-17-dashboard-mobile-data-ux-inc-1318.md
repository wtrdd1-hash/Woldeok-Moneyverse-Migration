# Mobile member dashboard: unknown WLD, false-zero ambiguity, floating-control collisions
> Incident: INC-2026.11.17.1318.1 · Work step v2026.11.17.1318.1 · Date 2026-11-17 KST
> Priority P1 · Status OPEN / TRIAGE · Evidence: user-supplied mobile Chrome screenshot, GitHub main source review · GitHub issue [#3242](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3242)
> Documentation only. NOT FIXED, NOT TEST-VERIFIED, NOT PRODUCTION-VERIFIED.

## Evidence provenance and confidence
On 2026-11-17 at approximately 13:18 KST, a mobile Chrome screenshot showed the personal /dashboard of easy-scraping.com. The URL was truncated in the phone toolbar; route attribution comes from its visible `/dashboa…` and matching source. The screenshot is retained in the original conversation, not uploaded to the public repository. We have **no authenticated network trace**, no production ledger evidence, no reliable screenshot viewport in CSS px, and no confirmed production runtime release identity. Do not infer actual user holdings or backend availability from the screenshot.

### Visual observations
| ID | Screen observation | Confidence / interpretation |
| --- | --- | --- |
| DASH-01 | `WLD 보유` displays `—`. | Observed; indicates UI has no balance to show, **not** balance=0. |
| DASH-02 | `관심 종목` displays `0`. | Observed, meaning (verified empty vs error) not yet proven. |
| DASH-03 | `보유 종목` displays `0`. | Observed, meaning (verified empty vs error) not yet proven. |
| DASH-04 | `최근 발생 알림` summary starts at the screen bottom; remainder outside captured area. | Observed framing; permanent clipping NOT established. |
| DASH-05 | Gift `0/7` control left and circular support control right intrude over lower card region; persistent five-item bottom nav. | Visible overlay; CSS cause and touch obstruction still require interactive evidence. |
| DASH-06 | Tall single-column KPIs have extensive unused vertical area; user must scroll extensively before useful detail. | Usability deficiency observed; measure geometry under multiple widths. |
| DASH-07 | Header contains theme, locale, chat, notification, profile and menu controls with minimal spare width. | Regression risk only; clipping not established. |

## Source-level proof, as distinct from production proof
- [frontend/src/app/dashboard/page.tsx](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/main/frontend/src/app/dashboard/page.tsx) requires a member and issues these five reads in parallel:
  - `GET /api/v1/wallet?recent=6` for wallet balance / recent transactions;
  - `GET /api/v1/stocks/watchlist` for tracked symbols;
  - `GET /api/v1/stocks/portfolio` for virtual-stock holdings;
  - `GET /api/v1/stocks/history` for recent trades;
  - `GET /api/v1/stocks/alerts/events?limit=5` for recent triggers.
- The wallet card explicitly uses `wallet ? … : '—'`. This is consistent with an unknown wallet response but does not show why it is unknown.
- The watchlist and holding summaries compute `(watchlist?.stocks ?? []).length` and `(portfolio?.holdings ?? []).length` through array defaults, rendering 0 even if the corresponding request returned null. Alert-event count has the same issue. **This ambiguity is confirmed in source**, not proof that a particular network call failed in production.
- [frontend/src/lib/api.ts](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/main/frontend/src/lib/api.ts) `apiOrNull` catches failures and returns null. The summary drops failure cause, while lower detail components have `LoadFailure` states. No client response status or request duration was captured.
- [frontend/src/components/mobile-bottom-nav.tsx](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/main/frontend/src/components/mobile-bottom-nav.tsx) is `fixed bottom-0 z-50` and includes `pb-[env(safe-area-inset-bottom)]`; verify content padding against its actual rendered height and floating controls.
- **Authority drift:** root DOCS_INDEX claims Java Spring Boot full single-runtime integration, while older integrated product planning still describes Next UI + staged Spring conversion. The precise production `/dashboard` renderer, embedded assets, gateway routing, and active Spring handlers must be measured, not guessed.

## Risk and impact
- **Financial truth:** a user may mistake `—` for lost WLD or `0` for actual zero stock positions. Never claim funds/positions were lost or recovered without canonical member-scoped database/ledger proof.
- **Silent partial outage:** summary renders success-like zeros for failed subrequests; the detail area may disagree.
- **Mobile accessibility:** floating controls and fixed navigation may cover interactive content, intercept taps, or obstruct keyboard focus in narrow or zoomed layouts.
- **Privacy/security:** account-scoped data must stay private/no-store/noindex; never log session cookies, bearer tokens, member identifiers, or raw balances.

## Implementation contract (proposal; not applied)
1. Define typed per-resource status `loading | verified-value | verified-empty | auth-required | consent-required | unavailable | invalid-response`. Don't collapse failures into empty arrays in summary counts. Real empty is only certified after successful, validated authoritative response.
2. Card semantics: wallet shows exact integer-string WLD or Korean `잔액을 불러오지 못했습니다` with accessible Retry; no synthetic 0. Stock/alerts counts show `—` / `조회 실패` with retry when unavailable; preserve unaffected successful KPIs. Propagate status and safe trace ID without exposing private data.
3. Validate response types and owner session; enforce private no-store/noindex in browser, BFF and app-api as applicable. Handle 401/403/429/5xx/timeouts and unexpected JSON separately. Account-switch/logout invalidates old results.
4. Mobile layout: responsive summary design with compact vertical height and readable type at 320px; check 2-column viability only where minimum readable width is available. Floating widgets must never cover card headings, values or buttons; bottom clearance must include navigation height + platform safe area + floating-widget footprint. Avoid fixed-height clipping.
5. Keep working mobile five-item navigation and controls; test visible focus, tab order, 44px touch targets, locale switches and WCAG 2.2 AA without unrelated redesign.
6. Preserve canonical WLD handling as integer strings / BigInt and the authoritative ledger; no mutation or fabricated financial data.

## Reproduction / QA matrix (NOT EXECUTED)
| Vector | Test | Required evidence |
| --- | --- | --- |
| Member data | Known nonzero ledger-proven wallet, known watchlist/holdings; separate truly empty account | Correct amounts/counts against owner-scoped source |
| Partial outage | Each of five APIs independently returns 401/403/404/429/500/502/503/504, timeout, malformed JSON | Per-card unknown/error states, never false 0 |
| UI | 320/360/375/390/430 CSS px, landscape, Android Chrome toolbar, 200% zoom, safe area | No overlap, focus masking, text clipping, horizontal scroll, inaccessible CTA |
| Session | Reload, logout, session expiry, switch accounts, stale cache | No cross-account results, retry works, response private |
| Runtime | Record deployment SHA, Nginx route, embedded SPA version, Spring API handlers | No claims from outdated architecture maps |
| Accessibility | Keyboard, screen reader live errors, tap targets, reduced motion, EN/KO | WCAG 2.2 AA focus/touch acceptance |
| Release | Isolated official Test exact SHA, authenticated browser+API+read-only ledger, rollback rehearsed | Only then consider production promotion |

**Completion criteria:** source-validated balance and counts; failed reads never displayed as verified 0; all key dashboard content readable/interactable without overlapping widgets; reproducible negative tests and official Test same-SHA authenticated E2E; production read-only verification with release identity. **This report satisfies none of these runtime exit criteria.**

## Investigation ownership and boundaries
Use a new isolated branch/worktree from refreshed main. Coordinate concurrent Gemini changes; do not edit the shared dirty main worktree. Record start/mid/end worklog and EN/KO update notes. No DB writes, WLD transfer, admin/identity bypass, CSS hotfix, Test or Production promotion in this record-only stage. Escalate from P1 to P0 if a canonical ledger mismatch, unauthorized cross-account access, or systemic customer financial data loss is confirmed.

## Trace
- START: owner screenshot received; issue #3242 opened as detailed immutable triage record.
- MID: authoritative doc and GitHub main source review; code-confirmed false-zero ambiguity; fixed bottom nav class confirmed; operational root cause unverified.
- END: documentation candidate only; report remains OPEN pending actual authenticated runtime tests.

Related source: [#3242](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3242); [Korean counterpart](2026-11-17-dashboard-mobile-data-ux-inc-1318.ko.md).
