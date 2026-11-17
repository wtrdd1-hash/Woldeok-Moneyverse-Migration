# INC-2026.11.17.1320 — Four-screen mobile dashboard, wallet, bonds, work incident (evidence report)

- **Version:** v2026.11.17.1320; stages: `.1` intake, `.2` source / runtime correlation, `.3` documentation close-out.
- **Observed:** 2026-11-17 13:18–13:21 KST, from four user-supplied **Android/mobile Chrome** screenshots; exact device/version, CSS viewport, member/permissions, network requests, response statuses and deployed SHA **unknown**.
- **Origin / paths:** `https://easy-scraping.com/dashboard`, `/wallet`, `/bonds`, `/work`.
- **Priority:** P0 financial information availability / false-zero risk; P1 career action availability and mobile screen overlap. **State:** OPEN, reproduction by screenshot only, **no fix / promotion**.
- **Public evidence handling:** Screenshot originals remain attached to the conversation, not copied to this public repository; no cookies, user identifiers, WLD balances, tokens, session exports or raw authenticated API payloads.
- **Source:** `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `.ko.md` are governing references, not superseded by this incident. Inspected current `origin/main` `e96e8f81f4d6b99b221392a2b6fe46356361b145` before independent documentation branch. Other agents may advance main at any time.

## 1. Screenshot evidence matrix
| Screen | Observed facts | Not established | Impact |
|---|---|---|---|
| Dashboard | `WLD 보유 —`, `관심 종목 0`, `보유 종목 0`, four tall summary cards, lower alert card partially covered in screenshot by floating utilities and bottom bar | True-zero stock positions, actual wallet funds, API response HTTP status, whether scrolling makes controls reachable | Monetary source ambiguity and false-zero presentation; mobile density |
| Wallet | Full-page fallback `지금은 지갑을 불러올 수 없어요. 잠시 후 다시 확인해 주세요.` after navigating `/wallet` | Whether request failed due to auth, timeout, routing, service, DB privileges, incompatible schema or a temporary failure; balances unaffected? **unknown** | P0 wallet reads unavailable |
| Bonds | Fallback `국채 시장 정보를 확인할 수 없습니다` and explicit inability to subscribe; retry link present; lower locale selector intersects floating gift at shown scroll position | Whether public market API is failing or returning stale/malformed/unverifiable data; no trade execution evidence | P0 public market listing unavailable; **fail-closed is intended**, do not replace with fake rates |
| Work | Software developer `Lv.1`, `0/100 EXP` and visible `대상을 찾을 수 없어요.` error beneath career switch; another career card below; floating widgets intrude around lower CTA region | Whether the POST or subsequent GET failed; whether any job change committed; exact HTTP status; whether footer prevents all access | P1 ambiguous career change result; mobile CTA/accessibility |

Visually repeated: top mobile header, fixed five-icon bottom navigation, bottom-left gift/progress `0/7` and bottom-right support button. A screenshot cannot establish CSS viewport or a permanent inability to scroll: test before claiming occlusion blocks interaction.

## 2. Direct source findings (source-confirmed, **not** live production trace)
1. **Dashboard** `frontend/src/app/dashboard/page.tsx`: `requireMember()`, concurrent `apiOrNull` requests to wallet `/api/v1/wallet?recent=6`, stocks watchlist/portfolio/history and alerts events. `wallet ? <Amount> : '—'` is deliberate unavailable balance. But `watchlist?.stocks ?? []` / `portfolio?.holdings ?? []` then `String(watched.length)` and `String(holdings.length)` collapse source failure to **0** in summary cards; dedicated lower sections separately handle `null` with `LoadFailure`. This is a **confirmed UI source-truth defect**, independent of whether the two affected APIs failed in this specific screenshot.
2. **Wallet** `frontend/src/app/wallet/page.tsx`: calls `apiOrNull<Overview>('/api/v1/wallet?recent=50')`, plus bank loans/rewards/stocks. `if (!wallet)` renders the exact fallback screenshot and hides wallet detail and action forms. The path is a **read failure in the UI**, not evidence of lost account balance or any committed transfer.
3. **Bonds** `frontend/src/app/bonds/page.tsx` and `market-integrity.ts`: `publicApi('/api/v1/bonds/markets', 30)` is checked by `verifyBondMarkets`. It rejects absent/non-object payloads, missing `overview` or `bonds`, malformed IDs/amounts/market states, duplicate ids, inconsistent unit counts, `disclosed_at` more than 5 minutes old or over 1 minute in the future, and more than 100 bonds. Any failure produces the shown fail-closed warning. Thus **HTTP 200 alone is not sufficient evidence of a valid source**; capture timestamp, contract and environment clock drift. Never enable subscriptions or fabricate interest/rates/remaining capacity when market truth is unavailable.
4. **Career mutation** `frontend/src/app/work/actions.ts`: `switchJobAction` submits `mutate('/api/v1/work/active-job', {body:{jobType}})`, validates receipt `job_type/is_active/level`, then performs `api('/api/v1/work/profile')` and confirms exactly one active matching job before reporting success. On `ApiError`, `frontend/src/lib/mutate.ts` maps **404** to the exact screenshot text. Crucially a 404 **from POST or the subsequent profile GET** can show the same message; a POST may have committed before a later GET failed. Do not imply mutation did not happen, and do not force a new switch before verifying actual canonical profile/receipt. Actual network response not captured here.
5. **Shared shell and fixed widgets** `frontend/src/components/mobile-bottom-nav.tsx` has `fixed bottom-0 ... z-50` and safe-area padding. `frontend/src/components/site-shell.tsx` provides bottom padding; other floating utilities are routed via `route-aware-floating-utilities.tsx`. These are plausible collision surfaces, **not isolated root-cause proof**. Audit actual stacking contexts and scroll reachability.

## 3. Environment inspection / do not misdiagnose
MiniPC MCP read-only snapshot (~13:20 KST): `moneyverse-frontend` active, `nginx` active, `moneyverse-discord-bot` active, DB connected in development environment; generic status tool described legacy `moneyverse-backend` as inactive. **Separately**, systemd listed `moneyverse-spring-backend.service`, `moneyverse-release-v1546-backend.service`, `moneyverse-release-v1546-frontend.service`, and `moneyverse-admin-api-restore-v2208-frontend.service` active. Test finance `moneyverse-test-spring-finance-v20261117-11.service` and session `moneyverse-test-spring-session-v20261117-12.service` appeared failed in unit list. These are service-state snapshots, **not proof of the path taken by user requests**, of the Spring migration percentage, or of actual API failure causation. Determine Nginx selected upstream, active artifact SHA, route ownership and staging separation first. Do not assume the inactive legacy unit is the failure.

## 4. Hypotheses and discriminating checks
| Candidate | Test/evidence to obtain | Safe response |
|---|---|---|
| Proxy route mismatch after Spring migration | Nginx exact `location` and upstream, `/api/v1` mapping, origin route matrix at exact production SHA; sanitized request-id/proxy status | Fix only after owner route and replay evidence; preserve isolation |
| Auth/consent/session mismatch | Authenticated test session; cookie policy; 401/403/302 flow, CSRF for mutation; user-scoped profile check | Do not bypass authentication, session or ownership |
| Contract/schema drift | Expected `Overview` wallet shape, bonds market verified payload, job response and profile; compare clean Test vs live signatures | Typed validation, actionable failure; do not fill zeros/fake WLD |
| DB permissions, connection or timeout | DB read-only health, pg errors redacted, endpoint p95/timeout, app role ACL and `SECURITY DEFINER` path | Never give broad DB grants or edit existing applied migrations |
| Bonds timestamp/staleness | `disclosed_at` and server clock skew, cache TTL, body data type and signed provenance | Preserve subscription-disabled on unverified data |
| Work change 404 or post-commit ambiguity | POST and profile GET correlation; actual career state, mutation receipt, conflict or replay behaviour | Never assert rolled back or success without profile/receipt |
| Mobile overlay / stale assets | 320–430px + 200% zoom; viewport metrics, scroll to last CTA, language select and keyboard focus, JS/CSS hash parity | Correct safe-area/inset/z-index per widget; no sticky CTA trapped |

## 5. Reproduction and QA execution specification (NOT YET RUN)
- On exact-SHA isolated Test with seeded **synthetic** verified member and clean independent DB, use real browser + Playwright or equivalent to navigate `/dashboard`, `/wallet`, `/bonds`, `/work`; record only status/trace IDs and synthesized harmless test balances.
- Dashboard 6 cases: fully available nonzero; genuine zero; wallet fails; watchlist fails; holdings fails; partial timeout. Assert error is never presented as a verified 0; `—` never is '0 WLD'.
- Wallet 8 cases: valid balance, real empty, 401, 403, 404 route, 429, 5xx, malformed body; assert details/actions not rendered on error and no session leak.
- Bonds 10 cases: valid open, verified empty, 404, 503, malformed, future/stale `disclosed_at`, negative units, available > issued, duplicate symbol, wrong states; assert no subscription affordance until verified.
- Work 10 cases: valid POST+matching GET, POST 404, GET 404 after POST success, invalid actor/CSRF, 409 duplicate/concurrency, response mismatch, pending timeout, job disabled, false receipt, 5xx; assert exactly one canonical active career and zero fake success.
- UI responsive matrix: 320, 360, 375, 390, 430 px (CSS width), dark/light, 200% text zoom, Android Chrome (browser system chrome separate), KO/EN/JA/ZH long labels, visual keyboard/tab order, 44px targets, aria-live, last CTA fully scrollable. Test 4 pages × 5 widths × 2 themes minimum and inspect viewport screenshots manually. Fixed navigation must not cover content or modal interaction. Gift/support bubbles must not cover language options or error retry.
- Security/release: no cross-user access, cache `private, no-store` for member financial pages, `noindex` member data, CSRF and ownership, redacted structured logs, test-only mutable operations, production read-only diagnosis; verify ledger balances with authoritative transactions/receipts **without making financial writes**.
- Record exact Test and Production build SHAs, API status and version headers, date/time zone, independent backup/restore and proven no-downtime rollback. Staging pass and independent approval required before promotion; do not merge this documentation PR as a deployment instruction.

## 6. Work and release gates
- `[x]` Screenshot evidence inventoried (4).
- `[x]` Source-level fallback semantics reviewed (dashboard, wallet, bonds, work); no live HTTP response captured.
- `[x]` Existing related issues checked (#2139, #3236, #3202, #3174), latest main examined.
- `[ ]` Authenticated incident reproduced against exact production candidate / request-ID traced.
- `[ ]` Root cause confirmed independently by per-API response and routing logs.
- `[ ]` Source fix, isolated branch tests, actual Test environment E2E, financial invariants, operator review.
- `[ ]` Release/rollback gates and verified production repair.
- `[ ]` Close incident only with member-visible retest and evidence.

**Status: Open / unremediated.** This incident report is evidence triage, no production or ledger change.

**Links:** [GitHub Issue #3243](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3243); related #2139 / #3236 / #3202 / #3174.
