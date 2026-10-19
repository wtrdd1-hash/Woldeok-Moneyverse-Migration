# v2026.10.19.921 — Qualified Guest Entry and Truthful Demo Worklog

**Status:** START / unshipped code candidate, Production HOLD. Korean partner: [KO](2026-10-19-qualified-guest-entry-v921.ko.md).

## Start — 2026-10-19 KST
- Owner reauthorized detailed master-plan and live-code analysis, customer-acquisition implementation, CI/Test and Production promotion after resolution of failures, with conditional data reset approval.
- Authoritative order reviewed: `docs/planning/PROJECT_PLAN.md` > `docs/planning/INTEGRATED_PLANNING_MASTER.md` > v860 SEO/user acquisition design, AGENTS and DOCUMENTATION_POLICY; v920 PR #944 merged after complete CI into main `a7be34de9fc12b380592dffd4bc29903ac69a502`. Android app separate and untouched.
- PC-specific MiniPC RPC timed out (as before); GitHub fallback used. Production release identity, financial gate, Test backend, actual GSC and signed-in browser E2E NOT verified this session.
- Concrete source finding: `frontend/src/app/page.tsx` primarily prioritizes finance cockpit/transfer/bank and displays source-hardcoded `+4.8% 24h`, `≈ ₩179,460,000 ... 실시간`, portfolio 62/28/10 and `100% 무손실 원장 보호` with no verified per-account provider. `frontend/src/components/tools-guest-conversion-bar.tsx` still promises unconditional 10,000 WLD but only offers login to check whether saving is supported. User's first useful value is hard to find; truth risk for search-acquired visitors.
- Narrow implementation v921: an SEO/visitor-first, non-auth, four-language useful-entry route navigator rendered before finance cockpit; verified public compound tool and localized glossary, optional feature guide; no forced signup. Mark static financial examples as demonstrations, remove unverified protection guarantee and immediate free reward claim on conversion bar. TDD first, then source, tests/CI. Do NOT pretend a client click implies account signup or server-confirmed WLD award.
- Finance and privacy: never touch DB, member ledger, balances, account status, sessions or money posting; no destructive reset is necessary. Existing known unresolved financial integrity and remote-Test release gates remain independently BLOCKING for Production. No bypass.

## Midpoint — 2026-10-19 KST
- Source tests were authored before changing homepage and the sticky conversion bar. Since MiniPC RPC timed out, a local RED phase was **not** executed; do not report 100% passed until GitHub CI completes.
- Added `frontend/src/lib/guest-entry-paths.ts` (+ route tests), `frontend/src/components/guest-quickstart.tsx`, early guest entry on `app/page.tsx`, and regression assertions `app/guest-first-home.test.ts`.
- Four-language links: Korean tool -> `/tools/compound-calculator`, translated EN/JA/ZH -> `/{locale}/tools/compound-interest-calculator`; translated glossary and public /features. Link clicks do not imply signup/ledger action.
- Home fixed growth `+4.8% 24h` reclassified demo; faux fiat conversion and absolute 100% ledger protection claims removed. Static portfolio proportions marked as DEMO; actual WalletGlance remains provider-based. Sticky tool conversion now avoids guaranteed 10,000 WLD and unverified permanent-save.
- Detailed [English/KO v921 spec](../planning/QUALIFIED_GUEST_ACTIVATION_AND_SEARCH_RECOVERY_v2026.10.19.921.md) covers provider status taxonomy, GSC/Naver search delay, consent-minimized events, 30-day first-user research, competitor positioning, content clusters, error acceptance and release gates. S1 instrumentation is **PLANNED**, not silently claimed implemented.
- Additional outage truth fix: Home had hardcoded four stock prices/percentages when `/api/v1/stocks` was absent, giving visitors plausible but invented live quotes. Added an explicit unavailable market status and no mock stock quotes, with regression test. No change to real market response data.
- Implementation [PR #958](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/958) created; initial CI submitted, final evidence pending. No DB, reward grant or live service changed.

## Final source checkpoint — 2026-10-19 KST
- [PR #958](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/958) stores homepage and CTA implementation, public-route + source regression tests, detailed EN/KO v921 plans and all change records.
- Work scope remains source-only: new guest-first links, demo-labelled figures, no fake public market quotes on unavailable backend, no unverified bonus or bank deposit. No member/ledger/database/SEO submission/server runtime changes.
- Main midpoint recheck `a7be34de9fc12b380592dffd4bc29903ac69a502`, unchanged. Other agents' merged v913/v920 scopes preserved, no Android changes.
- Local tests and authenticated Test host could not run because MiniPC RPC was unresponsive. GitHub exact-head CI status must be checked independently before any merge. Unknown Production SHA and previously blocked financial gate mean **Production HOLD**, irrespective of reset authorization.
- Next isolated slices: truthful GA4/server receipt funnel, Google/Naver verified source reports, remaining nonlocalized private/noindex audit, opt-in user acquisition field tests. No false SEO conversion results declared.

