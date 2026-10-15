# F675-04 — Public Financial Calculators → Learning → Optional Fictional-Market Journey

> **Version v2026.10.15.681** | **PLANNING / AUTHORITY_DRIFT / Production BLOCKED** | 2026-10-15 KST
> English canonical · [한국어](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.ko.md)
> Authority: [PROJECT_PLAN](PROJECT_PLAN.md) → [Integrated Planning Master](INTEGRATED_PLANNING_MASTER.md) → [v675 feature review](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md). Also respect v397 API parity, v530 all-route UI holds, v523/v542/v543 ledger, v507/527 search and v487 ad-only revenue.
> Exact reviewed `origin/main=8356146e157080704e157b3203e38599baec68ff`; checkpoints [v681 worklog](../worklog/2026-10-15-f67504-calculator-learning-v681.md). **This specifies a candidate, not a deployed flow.**

## 0. Purpose, user promise, non-goals

**User problem:** A person reaches a search result needing a compound-interest, stock average-cost, salary, tax or retirement answer. Before asking for an account or promising game rewards, Moneyverse should actually calculate, disclose assumptions, help them understand what the result means, then optionally let them explore a **clearly separate fictional WLD market**. The user retains the answer and ability to leave.

**Product sequence:**
`search intent → useful public calculator → understandable result and assumptions → relevant glossary/guide → optional compare/share/save locally → optional and honest game preview → separately consented login and server-verified playable action`.

The calculator must provide its **full core value without registration**. No counterfeit reward, guaranteed virtual profit, fictional stock quote presented as a real live price, compulsive return loop or casino/deceptive ad cross-sell. WLD does not equal KRW/USD and does not follow real-world investment/tax law. Existing real-world calculator tools and fictional WLD simulations must remain visually and semantically separate.

**Non-goals:** new thousands of “keyword” calculators or programmatic variant pages, live trading of actual securities, converting real tax output into WLD, reward issuance, credential storage, creating a new portal duplicating `/tools` or `/guide`, false “one-click SEO indexing”, direct Production release, and redesign of v675 F675-05 onboarding beyond contextual, verified optional navigation.

## 1. Exact-main implementation inventory and truth gaps

| ID / priority | Direct source observation on reviewed SHA | User risk and implementation gate |
|---|---|---|
| **C681-01 P1** | Existing `frontend/src/app/tools/page.tsx` tools hub already lists compound, stock average, FIRE/retirement, salary, tax, real estate, youth savings, quant and fictional economy panels; `frontend/src/app/guide` and glossary exist | Reuse/curate, don't make duplicate routes. Enumerate exact URLs, choose source-authoritative canonical owner, map each guide to precise user intent |
| **C681-02 P0 trust** | `frontend/src/components/calculator-retention-funnel.tsx::handleSetAlert` sets local React `hasAlert=true` and announces a notification is enabled, with no evidence of a durable alert registration in that handler | **Remove/disable misleading success claim until notification backend, opt-in, consent and delivery acceptance exist**; local preview is labeled demo |
| **C681-03 P0 trust/economy** | `handleClaimBonus` locally sets `isClaimed` and announces that **10,000 WLD** has been reserved/credited on future signup; `calculator-conversion-banner.tsx` repeats 10,000 WLD “100% guaranteed” promotion | No WLD or promotion promise without eligible audited issuance order, available policy, actor/ledger receipt and server-confirmed credit. Never substitute onClick toast for mint/transfer |
| **C681-04 P0 trust** | `calculator-save-action.tsx` sets `isSaved=true` on local storage exception and sends `fetch('/api/portfolio/watchlist')` without verifying success; auth state inferred from cookie substrings/localStorage | Separate `LOCAL_ONLY`, `SERVER_PENDING`, `SERVER_CONFIRMED`, `FAILED/UNKNOWN` and verified session; never say account synchronized without server result |
| **C681-05 P1** | `frontend/src/app/tools/compound-calculator/page.tsx` uses JavaScript `number`, `Math.pow`, `Math.round` across frequencies; default annual rate 8.5%, years 3, with simplified monthly cashflow timing | Explain compounding frequency, APR vs APY, monthly deposit timing, fees/tax/inflation exclusions, decimal rounding and annual-rate source. Build domain golden fixtures; never sell approximations as guaranteed yields |
| **C681-06 P1** | `frontend/src/app/tools/stock-calculator/page.tsx` contains a fixed `POPULAR_STOCKS` list of fictional prices and uses `Number` for average price, quantity and fee calculations | Fixed sample prices must be **SAMPLE**, not live or authoritative. Show real-world hypothetical stock model separately from WLD quotes. Reject zero quantity / unbounded invalid numbers; handle precision/fees explicitly |
| **C681-07 P0 accuracy** | `frontend/src/app/tools/tax-calculator/page.tsx` has code-defined presets/tax thresholds/percentages, and `/tools/page.tsx` advertises “2026 tax law”; these are not live government data or an independently verified legal engine | Every tax, salary, pension, retirement and regional product needs **jurisdiction, effective-date, cited statute/rate source, last reviewed, assumptions and disclaimer**. Out-of-date or unverifiable rates mean label `ILLUSTRATIVE/UNVERIFIED` or noindex/disable, not current tax law certification |
| **C681-08 P1 privacy** | Existing retention/save flows use browser `localStorage`, potentially holding calculator scenario details; page scripts mix conversion prompts with examples and ads | Explicit locally saved scope, storage lifecycle, no PII/private portfolio/auth tokens in URL, analytics or shared results; no hidden persistence/cookie-based false auth |
| **C681-09 P1 SEO** | English/JA/ZH localized compound-interest route and Korean compound route, many preset pages under different slugs, and existing glossary/SEO modules | Validate truly distinct translated content, canonical/hreflang and sample preset duplicates with Search Console URL evidence before expanding pages; default noindex for thin variants |

Observations are **source-code findings**, not reproduced browser incidents, measured visitor reactions, proof of current Production SHA, or verification that every listed claim appears in all product routes. The flow may be absent, partially implemented or inaccessible to some roles; v677 feature truth registry is required before exposing CTA.

## 2. User-centered research plan (eight tasks, no fabricated interviews)

| Audience / arrival intent | Their question | Bad experience to prevent | Prototype task/observation |
|---|---|---|---|
| Google search guest — compound interest | “If I save 50,000 KRW/month, what changes with time/rate?” | signup wall or WLD banner before result; rates read as guaranteed | enter values, verify cashflow assumptions, explain effective vs nominal rate |
| Early-career Korean salaried reader | “What is my expected take-home pay under the applicable year?” | outdated tax/insurance presets presented as certified result | identify jurisdiction, tax year, exceptions and government citations |
| First-time investor learning average cost | “What happens if I add more at a different price?” | real stock input implicitly opens fictional live trading | compare cases, understand net fee and uncertainty, stay in public learning |
| Returning reader of saved scenario | “Is this stored in the browser or in my signed-in account?” | false cloud-sync/silent disappearance after clearing cache | close/reopen, review exact save state, no false toast |
| Language-switching visitor | “Can I read the same formula and explanation in English/Korean?” | mixed translation, missing hreflang, wrong country law | switch page, inspect jurisdiction/version and translation parity |
| Low bandwidth / keyboard / screen reader | “Can I compute without slider-only controls or blocked scripts?” | inaccessible number fields, blank JS result, layout shifts | keyboard input, explicit error, result announcement, 320px/400% zoom |
| Person curious about Moneyverse game | “Can I try a fictional market without real money or forced registration?” | deceptive 10k reward, implied real guaranteed profit | see game-vs-real distinction; optional verified sign-in, skip readily |
| Returning enrolled game member | “If I navigate to stock/bank, are these actions available and did my last one succeed?” | dead CTA, switch disabled, UI-only action success | server eligibility, destination success, authoritative ledger outcomes |

Participants should be opt-in, diverse in age, financial literacy, locale and accessibility. A pilot of 3–5 participants per materially different task may reveal issues, **not** provide statistical proof. Consent-sensitive evaluation: no real salaries, tax identifiers, account balances or investments recorded; use fictional fixtures. Study comprehension, task completion and voluntary **second useful action**, not forced signup click counts. No users were interviewed or measured in this planning cycle.

## 3. Information architecture: reuse, not clone

**Public hub:** Existing `/tools` canonical. Cluster existing routes into “Save & Grow”, “Borrow & Repay”, “Stocks & Fees”, “Taxes & Take-home”, “Retirement & Goals”, “Fictional Market Practice”, with jurisdiction badges. Each cluster links directly to one authoritative tool plus relevant existing `/guide/glossary` concepts.

**Tool detail layout**, mobile-first (one column):
1. Search-aligned H1 and statement “Free calculator — no login required,” country/year/illustrative data scope.
2. 2–5 essential labeled inputs with meaningful defaults clearly marked *example*, not actual user data; unit/currency, rate basis, timing, negative/zero boundaries, effective year and financial caveats near fields.
3. Immediate result with **recomputed date/time only when actual inputs change**, summary/breakdown and explicit calculation assumptions. For unavailable source show stale / illustrative rather than fake current output.
4. “Understand this result”: one short plain-language insight, formula and worked example, 2–3 glossary/guide deep links (real education, not another low-value keyword route).
5. “Compare a scenario”: two presets/cases with **same assumptions, dates, currency**, side-by-side change and bound/effective rate. Show calculator model/version.
6. Optional share with **whitelisted nonpersonal preset fields** encoded deterministically and short enough for URLs, never account/financial personal details. Optional local save with honest `LOCAL_ONLY` feedback, clear delete/export controls and consent explanation; server save only after actual account auth + API success.
7. **Separate optional game invitation after answer**, no guaranteed bonus: “Explore how fictional markets work” link to existing guide / game info, then only verified available actions; skipping never suppresses results.
8. Sources / editor / review date, limitations, last verified period and feedback link. Ads only approved public placements, never interposed between Calculate and result/mandatory warnings, and no ad disguised as “Calculate” or “Next”.

**No new canonical multi-step registration funnel.** Existing auth /game account flows retain control; preexisting F675-05 first session covers onboarding separately.

## 4. Calculation and provenance schema

Proposed internal `CalculatorDefinition` registry (typed, code-owned; no new writable DB required):
```ts
type CalculatorDefinition = {
  id: string;
  canonicalPath: string;
  class: 'REAL_WORLD_ESTIMATE' | 'FICTIONAL_WLD_SIMULATION' | 'EDUCATIONAL_SAMPLE';
  locale: 'ko' | 'en' | 'ja' | 'zh';
  formulaId: string;
  formulaVersion: string;
  jurisdiction: string | 'NOT_APPLICABLE';
  effectiveFrom: string | null;
  reviewedAt: string | null;
  primarySourceUrls: readonly string[];
  roundingPolicyId: string;
  assumptions: readonly string[];
  unit: 'KRW' | 'USD' | 'WLD' | 'PERCENT' | 'YEARS';
  canonicalPresetIds: readonly string[];
  editorialOwner: string;
  sourceState: 'VERIFIED_FOR_PERIOD' | 'ILLUSTRATIVE' | 'STALE' | 'UNKNOWN';
};
```
Types are **planned**, not existing API. Registry should include `resultFormulaVersion`, `assumptionsHash` and an explicitly configured max numeric range. Preserve parameters when changing tools only on compatible units and when user consents. Avoid multi-year “tax current” assertions without new dated primary-law references; official law changes require isolated reviewed content update and fixtures.

**Accuracy acceptance:** choose reference formula per tool and derive an independent exact decimal/rational implementation or fixed precision specification, not only a test against the same JS formula being tested. Example compound interest: `FV = P(1 + r/n)^(nt) + Σ D_m (1 + r/n)^(n(t - m/12))` for end-month contributions, with independently defined period conventions, leap day basis and rate conversion. Show `nominalAPR` versus effective `APY=(1+r/n)^n-1`, not guaranteed market yield; rounding only as specified. Never apply WLD BigInt business arithmetic to KRW real-world calculator without appropriate decimal units; likewise avoid JS Number for money-moving WLD commands. Provide zero-rate, negative-rate (where supported), boundary, overflow, NaN/Infinity, thousands grouping, zero stock quantity, taxes/fee rounding and locale separators tests. This proposal does **not** certify the current calculations.

**Tax/salary:** freeze unverified “2026” rate claims until a jurisdiction-specific official law/source/effective date and exception review is recorded. We have not independently audited Korean tax percentages in this work unit. If missing: clear “educational illustration; not a tax filing amount,” withdraw live-law badges and remove from current-year rich metadata.

## 5. Save, alerts, game invitation: four independent outcome authorities

**Calculator compute:** local deterministic result `READY | INVALID_INPUT | MODEL_UNAVAILABLE` (a source registry failure, not necessarily whole-site failure).
**Save:** `NOT_SAVED | LOCAL_ONLY | SERVER_PENDING | SERVER_CONFIRMED | FAILED | OUTCOME_UNKNOWN`; localStorage failure does not become saved. A browser-only bookmark must not claim cloud sync or notifications.
**Alert:** `UNAVAILABLE | CONSENT_REQUIRED | REQUESTED | SERVER_CONFIRMED | FAILED | UNKNOWN`; no future notification promise without real backend subscription, explicit delivery destination/permission and retention/unsubscribe handling. A button click is never proof an alert was registered.
**Game eligibility + outcome:** `PUBLIC_PREVIEW | LOGIN_REQUIRED | ELIGIBLE | DISABLED | UNKNOWN` separate from any purchase/transfer action's `CONFIRMED/UNKNOWN`. Eligible state from server session, feature switch and the current product rules, not reading login cookies or client localStorage; never assume a new user automatically receives a fixed WLD amount.

**Required correction copy:** remove guaranteed “10,000 WLD bonus issued/reserved,” “100% loss-free real investment,” “notification activated,” “permanent cloud save” unless separately backed by **current** server policies, verified receipts and real feature capability. It is acceptable to say “This is a fictional market preview. Check eligibility after sign-in.” No signup inducement involving a ledger credit that has not occurred. No game-specific promise on search metadata unless source-verified and relevant.

## 6. Bilingual error, trust and conversion copy (prototype)

| Surface / state | Korean | English |
|---|---|---|
| Before input | 로그인 없이 계산할 수 있습니다. 예시 값은 변경할 수 있습니다. | Calculate without signing in. You can change the sample values. |
| Result | 선택한 가정으로 계산한 추정 결과입니다. 실제 수익은 보장되지 않습니다. | This is an estimate based on your assumptions, not a guaranteed return. |
| Formula link | 어떤 계산식과 기준을 사용했는지 확인하세요. | See the formula, period and assumptions used. |
| Jurisdiction stale | 이 계산기의 적용 연도·법령 근거를 확인하지 못했습니다. 신고에 사용하지 마세요. | We cannot verify the applicable year's rules. Do not use this for filing. |
| Saved locally | 현재 브라우저에만 저장했습니다. 다른 기기와 자동 동기화되지 않습니다. | Saved only in this browser. It is not synced to other devices. |
| Save failure | 결과가 저장되지 않았습니다. 화면에서 계속 확인할 수 있습니다. | Your result was not saved. It remains available on this page. |
| Alert unavailable | 목표 알림은 현재 연결되지 않았습니다. 신청 완료로 표시하지 않습니다. | Goal alerts are not connected. No alert has been activated. |
| Game invitation | 현실 금융 계산과 별개로 머니버스의 가상시장을 살펴보세요. 선택 사항입니다. | Optionally explore the fictional Moneyverse market, separate from real finance. |
| Reward unverified | 가입 보상 지급 여부는 로그인 후 실제 이용 조건과 거래 기록에서 확인하세요. | Check actual reward eligibility and your ledger after signing in. |
| Unsupported input | 값을 확인하세요. 허용 범위와 단위를 확인한 뒤 다시 계산할 수 있습니다. | Check the value and unit, then calculate again. |

Copy explicitly contrasts actual confirmed action with local preview. Translations beyond EN/KO ship only after human or quality-verified equivalent explanatory content; current KO default is a project constraint, not an IP-geolocation redirect order.

## 7. API, privacy, performance and SEO implementation contract

- **Public compute** preferred client-side pure deterministic function with tracked formula revision; no user account request to calculate. Only backend calls when source data really must be current; authoritative API response must include `observedAt`, `sourceVersion`, `isSample`; caching has tested freshness and no financial personalization leakage.
- **Optional persistence** after separate consent and verified session; no sensitive income/tax/account/salary in URL, localStorage, analytics event properties or open graph. Share safe preset parameters only after allowlist, range and URL size limit (no PII) and never use shortener collecting private data. Multi-device server save needs real authenticated API with negative auth, CSRF, idempotency and session-scoped read; no fake POST `/api/portfolio/watchlist` success if endpoint missing/errors.
- **Game CTAs** must follow v677 route→BFF→Nest→switch→DB/worker→TEST and operator allow-list. Existing virtual bank/stock routes are linked only if server-verifiably available; otherwise direct to a public guide or show locked/unknown reason. Login preserves explicit user request *if* supported and never pretends a guest did a transaction. No WLD issuance/stock order from an educational result without separately authorized confirmation.
- **SEO:** one intent/one canonical useful calculator per locale; consolidate overlapping `/tools/compound-calculator` versus `/[locale]/tools/compound-interest-calculator` with quality/locale review rather than auto-redirect every alternate, hreflang only if substantive translations. Thin generated `[preset]` and `[ticker]` pages default `noindex` until editorial uniqueness, correct canonical, real index coverage evidence; do not manufacture 10k keywords. No misleading SoftwareApplication rich-result promise, FAQ rich result guaranteed, Google News categorization or “indexed” based solely on sitemap submission.
- Canonical path, per-locale `lang`, visible country/year/source information must agree with metadata/structured data. Sample/preset query is not a canonical indexed URL. Compare Google selected canonical via actual URL Inspection/Performance, not merely code strings.
- **Accessibility and performance:** 320–430px plus 200%/400% zoom, semantic labels/help, keyboard alternatives to sliders, focusable error summary and `aria-live` only for meaningful new result, non-color-only financial direction, avoid layout shift/re-rendering on every keystroke. Measure real p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 for mobile and desktop after deployment (industry goals, **not measured project outcomes**).
- **Ethical monetization:** v487 eligible ads alone as real-world revenue, never mix actual taxation/results with paid game claims. No casino or WLD purchase/payout incentive; preserve ad exclusions and consent.

## 8. Measurement and user research: do not invent conversion results

Instrumentation: `calculator_usable_result_view` (id/formula_version/locale/sourceState), `calculator_error_input`, `calculator_assumptions_open`, `calculator_glossary_click`, `calculator_compare_completed`, `calculator_share_created`, `calculator_local_save_confirmed`, `calculator_game_preview_click`, `calculator_verified_login_continue`, `calculator_verified_first_game_action`, `calculator_misleading_promise_report`. For every event: qualified action, actor type public/member, no raw income amount, portfolio, query, personal data, localStorage key, session token or unique URL in event payload.

**Primary north star**: fraction of calculator visitors obtaining a *correct* useful result and performing a **second useful action** (interpret assumptions / compare / learn / use safe share). **Secondary**: opt-in sign-up→genuine confirmed game value, D1/D7 only on consent-safe cohorts, GSC query-page-country impressions/clicks, real Page RPM on eligible pages. Not “bonus clicked,” ad impressions or raw PV masquerading as user value. Explicit denominator/attribution/retention windows, bot exclusion, valid consent and variant source revision. No A/B experiment may change accuracy/disclaimer or falsely display a reward; baseline `UNKNOWN` until measured.

## 9. Staged execution D0–D7, tests and release hold

| Step | Planned work / file ownership | Required check before proceeding |
|---|---|---|
| **D0 inventory** | `frontend/src/app/tools/*`, locale variants, `config/pseo-*.config.ts`, glossary and guide routes; exact code and SEO URL inventory | enumerate real canonical, test role and backend readiness, no duplicate orphan URLs |
| **D1 trust P0** | existing `calculator-retention-funnel.tsx`, `calculator-conversion-banner.tsx`, `calculator-save-action.tsx`; source-only audit then **separate approved code PR** | no client-only bonus/alert/cloud-save success; red failing tests then green; real server receipt gating |
| **D2 formula truth** | factor pure formula library for compound/stock/tax/salary, fixtures independent of implementation | correct period/jurisdiction/rate, NaN/Infinity/bounds, rounding, precision, no invalid legal badge |
| **D3 useful results** | `/tools`, selected canonical calculators, `/guide/glossary` mapping | guest can calculate/read/learn fully without auth, small-screen & keyboard |
| **D4 compare/share** | small allowlisted preset module + safe URL serializer and unit tests | exact deterministic round trip, no PII, no duplicate SEO pages |
| **D5 opt-in game** | contextual CTAs relying on v677 feature evidence and existing auth/game routes | no false reward or disabled feature; auth return path and action result independently confirmed |
| **D6 SEO & telemetry** | URL/canonical/hreflang, analytics privacy and GSC verified query-to-tool path | indexing ≠ submission; no thin presets; 13 cited references; field CWV baseline |
| **D7 release proof** | unit/contract/mobile accessibility, unauthorized API, full UI five passes, exact-SHA isolated Test and zero-downtime rollback | **HOLD** if v530 full UI, v523/542/543 WLD security, v397 UI/API parity or Test/Production SHA/session identity fail |

Core acceptance negative fixtures: no JavaScript/slow network, 0/negative rate, infinity and overflow, zeros/decimals, big money strings, time/leap-day/period conversions, non-English decimal separators, user changing country/year, expired law, missing exchange quote, fixed fictional stock price disguised as live, failed `localStorage`, failed `fetch`, cookie-faked auth, bonus-not-approved, notification denied, sensitive scenario in share URL, duplicate/[preset] pages, inaccessible sliders, multiple languages, 320px and 400% zoom. No claimed browser tests or Production service outcomes in this planning work.

## 10. External official/practitioner source register — checked 2026-10-15

| ID | Source | Design application |
|---|---|---|
| **R681-01** | [Google People-first helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | prioritize real answer, clear who/how/why vs ranking-driven pages |
| **R681-02** | [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization) | one best relevant URL, acknowledge chosen canonical can differ |
| **R681-03** | [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) | substantiated hreflang/alternate language URLs |
| **R681-04** | [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | prevent scaled thin pages and misleading calculator functionality |
| **R681-05** | [Google Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start) | separate submitted, crawled, indexed, clicked, and locale/country query evidence |
| **R681-06** | [Google structured data for software](https://developers.google.com/search/docs/appearance/structured-data/software-app) | use truthful schema only where appropriate; rich appearance not assured |
| **R681-07** | [GOV.UK question page pattern](https://design-system.service.gov.uk/patterns/question-pages/) | ask only essential inputs, one clear question, no inaccessible slider-only mode |
| **R681-08** | [GOV.UK service start point](https://design-system.service.gov.uk/patterns/start-using-a-service/) | convey eligibility/value before requesting signup; contextual CTA |
| **R681-09** | [GOV.UK field error messages](https://design-system.service.gov.uk/components/error-message/) | specific repair message, preserve previously entered values |
| **R681-10** | [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/) | focusable list of validation problems for assistive tech |
| **R681-11** | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | accessible calculations, error prevention and status messages |
| **R681-12** | [web.dev Core Web Vitals](https://web.dev/articles/vitals) | user-centric field LCP/INP/CLS targets |
| **R681-13** | [Google developer guide to page experience](https://developers.google.com/search/docs/appearance/page-experience) | useful page/performance, not SEO tricks |
| **R681-14** | [Google AI-generated content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) | reviewed educational help rather than scaled automated text |

Reference design claims do **not** certify Moneyverse user research, Google ranking or actual current Korean tax rules. Future implementation must re-check primary law sources relevant to each jurisdiction at that time.

**End status:** v681 is paired planning documentation only; no application logic, WLD balances, model, DB, Test server or Production release was changed.
