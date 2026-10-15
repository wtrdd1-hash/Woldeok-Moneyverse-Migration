# F675-05 — First-Session Next-Action Guide: Earn → Choose → Progress, Without Fake Success

> **Version v2026.10.15.686** · **PLANNING / AUTHORITY_DRIFT / Production BLOCKED** · 2026-10-15 KST
> English canonical · [한국어](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.ko.md) · [Worklog](../worklog/2026-10-15-f67505-first-session-v686.md).
> Hierarchy: [PROJECT_PLAN](PROJECT_PLAN.md) → [Integrated Master](INTEGRATED_PLANNING_MASTER.md) → [v675 full-feature plan](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md). Conform to [v76 First Session Closure](FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md), [v82 Progressive First Week](PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md), F675-01 truth and F675-04 optional learning, v530 whole-site UI, v397 API parity, v523/542/543 supply safety and all release gates.
> Exact initial `origin/main=6946398986edba0ad84bc601e6d1076e442f6d05`. **No actual app implementation or Test/Production acceptance is claimed.**

## 1. Product decision and boundaries

**Member promise:** “I know the *one safe action* that is possible for me now, can choose my own direction, can verify that it genuinely finished, and see how to continue next time—without misleading WLD rewards, fake trades, pop-ups or compulsive streaks.”

F675-05 **reconciles existing onboarding**, not an additional parallel onboarding system. Reuse the existing `/guide` checklist/roadmap, onboarding tracker, first-trade modal, welcome banner, authenticated home and server actor/ledger receipts. The UI shows **at most three selectable recommendations**, ordinarily one primary, one optional adjacent action, and one learning/leave alternative. The “three” refers to visible actionable choices, not three required completions or three forced steps. Default to a safe public learn action if account or economy state cannot be established.

The recommended `earn → choose → progress` story is contextual, never mandatory. The user's actual choice becomes the return thread, not a forced finance funnel. No automatic purchase, bank deposit, stock trade, casino, lottery, notification subscription, artificial WLD issuance, guaranteed return, punitive streak or unverifiable “starter grant.” The onboarding feature must not change any money supply, DB role, privilege, rate, reward schedule or real-money policy.

## 2. Source-derived risk register and evidence levels

| ID / level | Exact reviewed source behavior | User-facing risk / design remedy |
|---|---|---|
| **O686-01 P0** | `frontend/src/lib/onboarding-tracker.ts::claimOnboardingReward` changes browser `localStorage` `claimed` and `totalEarnedWld` and returns configured `rewardWld`. It does **not** call a server wallet/ledger in this method | `LOCAL_CLAIM` is **not** WLD credited; stop describing this path as real wallet credit unless matched to an eligible server action and immutable ledger transaction |
| **O686-02 P0** | `interactive-onboarding-tracker.tsx::handleClaim` shows “+WLD deposited to wallet” based on the above local value, while tracker displays static possible WLD sum | **Fake success**. Separate preview/verified completed/reward settled states; amount from policy+server only, never from onboarding array or toast |
| **O686-03 P0** | `first-trade-onboarding-modal.tsx` `POST /api/stocks/orders` result is not checked; `.catch(() => null)`, then local simulated holding and completed flag; outer catch also sets completed. Default ticker `005930` (“Samsung Electronics”) is a real security code/name | Never claim real or fictional stock order accepted without server confirmation; no real ticker in a fictional asset list; no silently fabricated holdings or trade completion |
| **O686-04 P1** | `guide/components/onboarding-checklist.tsx` keeps locally toggled task state with `markAll`; independent tracker also persists completed/claimed locally | Check marks may represent **self-attested guide progress**, not verified in-game completion; do not merge them into an authoritative reward ledger or first-value KPI |
| **O686-05 P1** | `guide/components/onboarding-roadmap.tsx` advertises specific seed WLD, quick signup and predictable work/bank sequences as static content | Replace unconditional promises with policy- and current-eligibility-verified amounts, limits and real stage; hide unavailable actions |
| **O686-06 P0** | `welcome-onboarding-banner.tsx` promises “10,000 WLD” plus a free jackpot ticket to guests and links to `/login?ref=welcome_bonus`; `frontend/src/app/page.tsx` SEO metadata also claims instant 10k WLD and jackpot | This marketing copy is **not itself evidence of grant/ticket issuance**. Release only policy-verified promotion disclosures and no casino/jackpot to ineligible audiences; metadata must match public reality |
| **O686-07 P1 UX** | `route-aware-floating-utilities.tsx` mounts a floating onboarding tracker and support widget outside admin; first-trade modal is mounted from app layout; welcome banner adds another concurrent surface | Competing overlays/viewport clutter, especially 320px/screen reader. One orchestrator must assign priority; no repeated automatic modal after dismiss |
| **O686-08 P1** | Existing `/quests`, `/work`, `/bank`, `/stocks`, `/guide` **route source files** exist, but source presence is not authenticated feature availability | Do not recommend an executable action from route existence alone. Gate on actual server switch/auth/eligibility/current inventory and Test evidence |
| **O686-09 P1** | v76 closing thread and v82 readiness-based complexity ladder already specify optional next goal, revisit continuity, one adjacent concept and no streak pressure | Adopt these rather than duplicate stored intent schemas or invent a daily forced linear curriculum |
| **O686-10 P0** | v675 F675-01 and v677 feature reality require action→API→DB exact SHA, and v523/542/543 require supply/ledger invariants. Current source features have no new confirmed runtime evidence in this planning review | Show `UNKNOWN/UNAVAILABLE` and safe learning alternative; no deployment or economic approval from planning alone |

Evidence legend: `SOURCE_OBSERVED` = read current Git main file; `PREEXISTING_PLAN` = adopted prior policy; `HYPOTHESIS` = untested user need; `TEST_VERIFIED/PRODUCTION_VERIFIED` need authenticated exact-SHA tests, relevant real DB identity and ledger/feature-switch receipts. No user session, reward, trade or production browser was operated here.

## 3. Research questions and user journeys — hypotheses only

| Audience and goal | Question in their language | Proposed experience | Usability falsification case |
|---|---|---|---|
| Search guest curious about fictional economy | “What is WLD, and can I see this without signing up?” | game-only explanation + safe guide/calculator before account | forced login before understanding; prize masquerading as real currency |
| First signed-in member with no ledger rewards | “What should I try first?” | one currently eligible free/low-risk task only if server can confirm; link to relevant how-to | a blocked work/quest CTA or declared reward with no ledger proof |
| Member who already chose a profession | “How do I continue my job?” | continue exact available career task, not a generic seven-step tour | repeated first task/new user prompts after authenticated progress |
| Member waiting on cooldown | “Why can't I collect again?” | `LOCKED` + server-derived reason/available time; adjacent public learning | countdown fabricated from device clock or bypassed cooldown |
| New user who completed a real reward | “Did I get my WLD? What next?” | authoritative transaction ID/receipt, updated wallet, choose return thread | locally incremented balance shown as server credit |
| Person arriving from a stock calculator | “Is the suggested stock real or fictional?” | clear fictional-market guide, no auto trade, only validated ticker | Samsung/real security default presented in game order dialog |
| Mobile, assistive-tech or intermittent-network user | “Can I skip this and recover safely?” | no forced modal; one focused card; resume after failure; proper aria-live | 320px floating overlays, focus trap, double POST |
| Returning member after D1/D7 | “Did my choice persist and is there a new action?” | recognize consented saved thread and its actual status, or say nothing changed | fake new message/penalty for missing a day |
| Parent/young or jurisdiction-restricted visitor | “Can I avoid luck/financial risk?” | safe nonfinancial learning, region/age policy enforced server-side | casino/lottery shown as universal starter action |

Recruit opt-in participants for task-centered interviews across locale, device, accessibility, financial literacy, new/returning. Use fabricated account fixtures only. The Baymard guest-checkout research provides an **analogy** about not distracting users before their chosen job is complete, not proof of Moneyverse registration outcomes. The present document reports **zero actual interviews, A/B experiments or activation improvements**.

## 4. IA and wireframe-level UX for first 30 seconds, 3 minutes, session end

**Entry (first 30 s):** At most one clear purpose: “Explore the fictional Moneyverse / choose what interests you.” A visible game-only label. If guest: either “Learn how it works” (no login) or “Sign in to try eligible game actions,” never “10k credited.” If signed in: server-derived primary action, if available. No bonus/lottery banner competing with the sole action.

**Action choice (first 3 min):** One prominent card and no more than **two alternatives**:
- *Earn*, if eligible & an actual supported task available (profession/quest verified by backend): “Try your first available task” → route; confirm reward only with original transaction reference.
- *Learn/explore*, always a safe fallback: existing `/guide`, glossary, calculator and fictional market explainer without moving WLD.
- *Choose direction*, if user has preferences or first success: “Continue a profession,” “Follow a fictional company,” or “Understand banking,” **without automatically depositing/buying**. Some choices may be only a public guide until persistence is proven.

A user's first click is **intent**, not `COMPLETED`. On next-page transition, destination needs a real functional primary CTA or a truthful unavailable explanation. Do not bind progress to route visits or scrolls as if money moved.

**After meaningful server-confirmed result:** one compact `state → evidence → user next choice` panel:
- “Your first work reward was recorded.” Show legitimate receipt link, precise WLD integer string, server-observed time only if record exists.
- “Continue this profession next time?” Save return thread only with actual user choice and backend confirmation, or explicitly local-only (with deletion/control). “Finish for now” works with no guilt.
- If no confirmed result, say “We can’t confirm it yet. Check your activity before retrying.” Never duplicate transaction.

**Return D1/D3/D7:** Recognize chosen thread first; `AVAILABLE` if actual action, `WAITING` with server-sourced next eligible time, `UNCHANGED` truthful, `DISABLED` with policy reason, `FINISHED` if verified. User may switch/delete thread and return to a different interest without penalty. No fake countdown/streak “loss”/unread dot and no scripted daily surprise.

**Visual arbitration:** Home hero, welcome banner, tracker, trade modal and support widget must not each show overlapping CTAs in same first visit. Proposed priority: system outage/security notice > current intentional form/action > transaction result/status > one onboarding card > ordinary support; never auto-open a trade dialog from localStorage. Guest+admin+returning screens have separate controls. Escape, focus restore, nonmodal alternative and dismissal persistence work without browser storage; no deep-link hijack.

## 5. Recommendation decision function — proposed, not existing API

Do **not** ship a new “AI recommends financial trades” system. Use a deterministic, audited, bounded decision list based on **verified capability** and user choice. Contract:

```ts
type VerifiedTask = {
  id: 'learn_moneyverse' | 'first_eligible_work' | 'first_eligible_quest'
    | 'continue_career' | 'explore_fictional_stock' | 'read_wallet_receipt';
  titleKey: string; reasonKey: string; href: string;
  readiness: 'AVAILABLE' | 'LOGIN_REQUIRED' | 'LOCKED' | 'DISABLED'
    | 'COMPLETED' | 'UNKNOWN';
  requiresMutation: boolean;
  actorVerified: boolean;
  backendEvidenceAt: string | null;
  featureStateVersion: string | null;
  relatedTxnId?: string; // only server-owned
  scope: 'PUBLIC' | 'PERSONAL';
};
```

Policy:
1. Fetch viewer identity via **trusted server session** and feature reality from appropriate existing backend, not auth cookie-string or localStorage guesses.
2. For money-impacting task check exact actor eligibility, cooldown/cap, feature switch, current route/API+DB readiness and WLD treasury source policy. A missing check fails closed.
3. Suppress prohibited/restricted luck or finance actions based on age/jurisdiction rules; do not guess using IP-only localization.
4. Rank by **selected intent**, current availability, reversible safety, cognitive complexity; favor a public learning guide when unknown.
5. Pick at most three distinct valid actions: one clear primary; one adjacent optional; one learn/not-now. Never claim all users must “earn first,” never hide the ability to end.
6. Apply dismiss/return preferences only if user opted into persistence; local-only storage must be labeled and never authorize a purchase, grant or stock order.
7. Every recommendation link needs a functional route and, for mutation, authenticated API contract; URL existence alone proves nothing.

**State boundaries**
- Journey: `NOT_STARTED → OFFERED → CHOSEN → NAVIGATED → ACTION_PENDING → VERIFIED_SUCCESS | VERIFIED_FAILURE | OUTCOME_UNKNOWN → RETURN_THREAD_CHOSEN | FINISHED`.
- User choices: `SKIPPED | DISMISSED | PAUSED` never imply task fail, reward denied, lost streak or retry.
- Capability: `AVAILABLE | LOGIN_REQUIRED | LOCKED | MAINTENANCE | DISABLED | UNKNOWN`, with `LOCKED` showing only known reason and true time.
- Payment/reward: `NOT_REQUESTED | SERVER_PENDING | LEDGER_CONFIRMED | REJECTED | OUTCOME_UNKNOWN`, with **separate** server credit + original transaction ID, authorized amount and cross-pocket balance validation. “Earned” is not a local claim.
- Stock first trade: `NOT_SENT | ORDER_ACCEPTED | PARTIAL_FILL | FILLED | CANCELLED | REJECTED | OUTCOME_UNKNOWN` from server matching, never local synthetic holding.

## 6. Backend/read-model and privacy requirements

Preferred: extend v677 feature-reality and existing onboarding/task/profession/ledger read API; **do not add a parallel authority**. Optional proposed `GET /api/v1/me/next-actions` provides `actions[]` (max 3, actor scoped), `viewerVerified`, `observedAt`, `sourceSha`, `sourceState`; `GET /api/v1/me/onboarding/progress` returns only verified job/quest/order/ledger completion plus separately tagged client-guided study progress. Both read-only, no value transfer. Candidate `PUT /api/v1/me/onboarding/return-thread` only for explicit opt-in; require session actor, CSRF if cookie auth, validation, idempotency and audit. Do not create these endpoints if equivalent secure existing APIs exist.

A genuine successful reward is sourced from immutable ledger transaction, not `rewardWld` in UI constants. No new Mint, treasury payout or database role changes. Receipt referent is private and actor-authorized; any returned amount is decimal **string/BigInt** and may be masked. Real-world stock identifiers and fictitious stock ticker namespaces must be distinct. A timeout after a committed action gives `OUTCOME_UNKNOWN`, not “failed, click again” or “success.”

All personalized responses `private, no-store`; non-index and no public SSR leakage. No raw actor IDs, balances, wallet account/transaction identifiers, IP-derived location, age, personal preference, OAuth token or job details in analytics labels or public landing JSON. User controls clear/delete return thread. Recommender cannot autonomously perform risky actions.

## 7. Bilingual status and result copy for usability prototypes

| Case | Korean | English |
|---|---|---|
| Guest | 먼저 머니버스의 가상경제를 살펴보세요. 가입하지 않아도 안내를 볼 수 있습니다. | Explore Moneyverse’s fictional economy first. You can read the guide without signing in. |
| Primary | 지금 가능한 첫 활동 한 가지를 추천합니다. 다른 활동도 선택할 수 있어요. | Here is one available first action. You can choose something else. |
| Work in progress | 작업을 진행 중입니다. 서버 상태를 확인한 뒤 결과를 표시합니다. | Your action is in progress. We will show a result after checking the server. |
| Recorded WLD | 첫 보상이 원장에 기록됐습니다. 거래내역에서 확인하세요. | Your first reward is recorded in the ledger. Check its receipt in activity. |
| Unknown reward | 아직 보상 지급을 확인할 수 없습니다. 다시 신청하기 전에 거래내역을 확인하세요. | We cannot confirm the reward yet. Check activity before retrying. |
| Cooldown | 현재는 다시 수행할 수 없습니다. 이용 가능한 시각이 확인되면 알려드립니다. | This action is not available yet. We’ll show a verified eligibility time when known. |
| Disabled | 이 기능은 현재 이용할 수 없습니다. 대신 안내를 살펴볼 수 있습니다. | This feature is unavailable now. You can read the guide instead. |
| Local progress | 이 체크 표시는 이 브라우저의 학습 표시이며 실제 보상 지급 기록이 아닙니다. | This checklist mark is local learning progress, not a reward receipt. |
| After first value | 첫 활동을 완료했습니다. 다음에 이어갈 목표를 직접 선택하세요. | You completed your first activity. Choose what you want to continue next time. |
| Finish | 오늘은 여기서 마쳐도 됩니다. 진행상황에는 불이익이 없습니다. | You can stop here with no penalty. |
| Return | 선택하신 활동의 확인된 최신 상태를 표시합니다. 변경사항이 없으면 그대로 안내합니다. | We show the verified state of your chosen activity, including when nothing changed. |
| Fictional stock | 머니버스의 가상 종목입니다. 실제 주식 주문이나 투자 추천이 아닙니다. | This is a fictional Moneyverse stock, not a real order or investment recommendation. |

“An amount will appear after signup,” “guaranteed first deposit,” “order completed” and “claimed bonus” are strictly prohibited unless a current verified server response and explicit economic authority substantiate them.

## 8. Testing, research and metrics

Research: ask participants to identify what WLD is, whether the next action is optional, and how they know a reward or trade completed. Observe newcomers, returning members, accessibility users, Korean/English visitors, low-speed devices; no fabricated interviews/surveys. Compare a **single primary CTA** with max-three option set only after accuracy is equal; no randomized false monetary promises. Follow established experiment governance and opt-in analytics, accessibility/age protections.

Privacy-safe signals: `first_available_action_seen`, `chosen_intent`, `next_action_navigation`, `task_server_verified`, `receipt_opened`, `return_thread_opted_in`, `d1_thread_recognized`, `d7_thread_resolved`, `onboarding_blocked_reason`, `onboarding_false_success_prevented`, `next_action_5xx_rate`. Avoid labels with user ID, personal balance, external auth, transaction ID or PII. Exclude bots and consent-restricted users from personalization measurements; cohort definitions and denominator must be published before interpreting change. Count **server-confirmed first value** not “visited quest” or local checkmark. No present observed growth percentage.

Qualitative pass criterion: participant independently explains game-only currency, confirms success via authoritative receipt, can dismiss safely, return thread persisted only with consent; no coercive first finance action. Technical success gates: zero false WLD claims, zero unintended orders, no duplicate mutation after response loss, zero cross-user data leak, no increased authenticated 5xx relative to baseline after gradual experiment; unknown sample counts = `UNKNOWN`, not 100% success.

## 9. D0–D7 engineering handoff and release gates

| Stage | Work in separate approved implementation PR | Deterministic acceptance |
|---|---|---|
| **D0 source and policy truth** | inventory all existing onboarding mount points/routes, real backend grants/switches/economy sources, authentic exact SHA | no decision from client-only state; reconcile v76/v82 and v675 |
| **D1 P0 truthful outcomes** | replace/disable local-only reward credit and fake first-trade success, bonus SEO/banner; tests first | mock `fetch` failure and localStorage exception must never claim credit or holding |
| **D2 verified read-model** | API/DTO or existing backend adapter for viewer-owned capability/readiness and ledger-backed first value | other-user UUID denied, expired switch/limits blocked, actual WLD proof |
| **D3 option model** | deterministic at-most-three selector, no casino default, user intent ranking, safe guide fallback | 0–3 only, no duplicate/disabled action links, unknown fails closed |
| **D4 UI integration** | consolidate tracker/banner/modal/home and guide into one priority model; responsive bilingual microcopy | 320/360/390/430px, 200/400% zoom, keyboard/ESC/focus/aria, reduced motion |
| **D5 close & return** | explicit continue/not-now/finish, opted-in persistence, D1/D7 verified re-entry | no punitive reminders, fake changed status or silently set preference |
| **D6 experiments/SEO** | actual first value, retention, 5xx metrics with privacy/consent; no new indexable internal onboarding URL | A/B correct outcomes and stable availability in each group |
| **D7 release** | review, golden/negative auth+economic tests, CI, exact-SHA isolated backend+DB Test, v530 **five-pass all-route authenticated UI**, session continuity/rollback | **HOLD** until v523/542/543 ledger, v397 parity, v530 full UI and release provenance all pass; only then separate zero-downtime promotion |

Negative fixtures: new guest, member with no rewards, returning old member, user with 0 WLD, cooldown, no eligible quest, disabled work switch, database unavailable, real model API unavailable, server fails after POST commit, duplicate tap, fake cookie/local storage, invalid 005930 ticker, owner mismatch, muted notification, local storage denied, screen-reader focus, overlapping support/tracker and admin route, locale route, unrelated casino or lottery restrictions, huge WLD and 38-digit string. No live backend acceptance test was executed in this planning cycle.

## 10. External references and adoption notes (checked 2026-10-15)

| ID | External reference | Adopted rule |
|---|---|---|
| R686-01 | [GOV.UK: Start by learning user needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) | jobs, not feature inventory; distinguish assumption from research |
| R686-02 | [GOV.UK: Inclusive live research](https://www.gov.uk/service-manual/user-research/user-research-in-live) | screen reader, low digital confidence, returning user interviews |
| R686-03 | [GOV.UK: Start using a service](https://design-system.service.gov.uk/patterns/start-using-a-service/) | clear first action/eligibility before commitment |
| R686-04 | [GOV.UK: Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/) | confirmation evidence and safe next action only **after actual success** |
| R686-05 | [GOV.UK: Error messages](https://design-system.service.gov.uk/components/error-message/) | specific blocked/unknown state, preserves context |
| R686-06 | [Baymard: Delayed account creation](https://baymard.com/research-articles/delayed-account-creation) | *analogy*—avoid interrupting goal with signup, not Moneyverse data |
| R686-07 | [Google: HEART user-experience measurement paper](https://research.google.com/pubs/archive/36299.pdf) | task success/adoption/retention with defined goals, not vanity clicks |
| R686-08 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | keyboard, focus, status, reflow, accessible actions |
| R686-09 | [W3C: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | accessible success/error feedback |
| R686-10 | [OWASP: Broken object-level authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | actor-scoped choices/ledger evidence |
| R686-11 | [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests) | don't blindly repeat uncertain financial actions |
| R686-12 | [GOV.UK: Error summary](https://design-system.service.gov.uk/components/error-summary/) | focusable validation and recoverability |

Cited resources are design references, not evidence that Moneyverse has conducted studies, complied with a regulator or passed Test/Production acceptance. Source references must be rechecked at implementation.

**v686 is a docs-only detailed design**. No application feature, economic result or release claim is made.
