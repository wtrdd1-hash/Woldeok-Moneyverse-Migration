# v2026.09.30.487 — Ad-only monetization planning worklog

Status: PLANNING / docs-only  
Date: 2026-09-30  
Start `origin/main`: `85508db432cd525570e26bc1820b9e637a8140fa`  
Scope: replace direct-sale/subscription monetization assumptions with advertising-only monetization until the business-registration scope is explicitly expanded and reviewed.

## Start record
- Read documentation policy, document catalog/index, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, monetization spec, KR legal audit, and latest v486 update evidence.
- User constraint: current business-registration guidance does not permit product sales; therefore paid subscriptions, paid digital goods/cosmetics, paid virtual currency, paid random items, and other direct user sales are treated as BLOCKED.
- Runtime/code/Production are out of scope for this change.
- Research authority for ad metrics: Google AdSense RPM definition, Auto Ads/Experiments, invalid-traffic policies; Korean tax context cross-checked against National Tax Service guidance on platform advertising income.
- No claim is made that NTS guidance for one-person media automatically determines this website's exact industry/tax classification. Exact classification remains subject to the registered business scope and professional/authority confirmation.

## Planned decision
1. Advertising revenue becomes the only currently allowed cash-revenue channel.
2. Existing sensitive-route ad exclusions remain.
3. Direct product sales and subscription billing remain disabled until a future business-scope/legal gate explicitly changes this decision.
4. Revenue goals use observed Page RPM and pageviews, not assumed CPM promises.

## Mid-work record
- Mid-work `origin/main`: `85508db432cd525570e26bc1820b9e637a8140fa`; no drift from start.
- Rechecked Google AdSense Page RPM, Auto Ads/Experiments, invalid traffic, publisher policies and NTS platform-ad-income tax guidance.
- Added the advertising-only detailed specification and v487 delta in EN/KO.
- Connected current authority through PROJECT_PLAN, integrated planning master, monetization/SEO spec, KR legal audit, documentation README and INDEX.
- The v444 subscription/cosmetic-sale portfolio remains historical evidence; v487 supersedes it for current cash-revenue authority.

## End verification
- Final pre-integration `origin/main`: `85508db432cd525570e26bc1820b9e637a8140fa`; no concurrent drift.
- Compare shows documentation-only changes; runtime/DB/frontend/backend code is unchanged.
- Verified `subscriptions.enabled=false` and fail-closed paid-channel completion criteria in the current monetization specification.
- Verified EN/KO pairs for PROJECT_PLAN v487, monetization spec v487, KR compliance audit v487 and the new ad-only detailed spec.
- KRW 1,000,000/month remains an observed Page-RPM/PV target model, not a promised RPM or revenue result.
- No Test/Production deployment is required for this docs-only scope.

## End state
READY_FOR_DOCS_PR

