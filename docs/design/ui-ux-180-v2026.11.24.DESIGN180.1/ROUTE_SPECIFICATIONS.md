# Route-by-route UI/UX contracts

These are proposed interaction requirements, not claims that existing APIs or actions work. Repeated layouts are deliberate family reuse; fields, columns and action labels remain route-specific. Administrator views require server-enforced roles and reauthentication for high-risk writes. Public reading pages do not require session-expiry or mutation-success states; such state specimens apply only to protected data/actions. Money remains canonical integer strings in any implementation. Real-world calculators use explicitKRW examples; in-game income usesWLD. None of the illustrative values certify a tax formula or financial forecast.

## Shared state requirements

- Loading: stable geometry; no invented zero balances.
- Empty: explain absence and offer the relevant permitted first action.
- Error: retain safe inputs; show a useful retry without exposing internals.
- Expired: request sign-in only for protected actions; preserve safe drafts.
- Forbidden/disabled: keep a clear explanation; never bypass a role or feature gate.
- Confirmation: show exact target, consequences and, for financial actions, amount and fees.
- Submitting: prevent duplicate activation; preserve the original idempotency reference.
- Success: show a verified server result; financial completion requires the authoritative receipt.

## Screen contracts

### /

**Your Moneyverse** · home · member-or-public

A calmer place to follow your money, community and next adventure.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Activity · Type · Amount · Time|
|Sections|Wallet overview → Your next steps → Community highlights|
|Actions|Open wallet → Explore quests|
|Navigation|home|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/home.png) · [Mobile](mobile/home.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /[locale]/blog

**Moneyverse journal** · editorial · member-or-public

Stories, ideas and guides from the community.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Topic · Search|
|Record columns|Title · Author · Updated|
|Sections|Featured story → Latest articles|
|Actions|Read article → Browse topics|
|Navigation|community|
|Alias behavior|Localized route alias; full copy review pending|
|Desktop / mobile|[PC](desktop/_locale_--blog.png) · [Mobile](mobile/_locale_--blog.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /[locale]/blog/[slug]

**Journal article** · article · member-or-public

Read the full content with context, related links and clear discussion controls.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Author · Published · Updated|
|Sections|Article body → On this page → Related reading → Comments|
|Actions|Share article → Back to list|
|Navigation|community|
|Alias behavior|Localized route alias; full copy review pending|
|Desktop / mobile|[PC](desktop/_locale_--blog--_slug_.png) · [Mobile](mobile/_locale_--blog--_slug_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /[locale]/guide/glossary

**Financial glossary** · guide · member-or-public

Look up a term and follow it into context.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Popular terms → Browse alphabetically → Related guides|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Localized route alias; full copy review pending|
|Desktop / mobile|[PC](desktop/_locale_--guide--glossary.png) · [Mobile](mobile/_locale_--guide--glossary.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /[locale]/guide/glossary/[term]

**Glossary term** · glossary-term · member-or-public

A clear definition with examples and related terms.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Definition → Worked example → Related terms|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Localized route alias; full copy review pending|
|Desktop / mobile|[PC](desktop/_locale_--guide--glossary--_term_.png) · [Mobile](mobile/_locale_--guide--glossary--_term_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /[locale]/tools/compound-interest-calculator

**Compound growth** · calculator · member-or-public

See how contributions and compounding build over time.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Starting amount · Monthly contribution · Annual return · Years|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Growth projection → Contributions vs returns → Yearly breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Localized route alias; full copy review pending|
|Desktop / mobile|[PC](desktop/_locale_--tools--compound-interest-calculator.png) · [Mobile](mobile/_locale_--tools--compound-interest-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /[locale]/tools/compound-interest-calculator/[preset]

**Compound growth** · calculator · member-or-public

See how contributions and compounding build over time.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Starting amount · Monthly contribution · Annual return · Years|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Growth projection → Contributions vs returns → Yearly breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/_locale_--tools--compound-interest-calculator--_preset_.png) · [Mobile](mobile/_locale_--tools--compound-interest-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /account

**My account** · account · member-or-public

Manage your identity, preferences and privacy.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Display name · Language · Time zone|
|Record columns|Content-led layout; no record table|
|Sections|Profile → Security → Notifications → Privacy|
|Actions|Save preferences → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/account.png) · [Mobile](mobile/account.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /account-deletion

**Delete account** · legal-action · member-or-public

Review what will happen before requesting account deletion.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Content-led layout; no record table|
|Sections|Account impact → Records retained → Data removal → Request review|
|Actions|Review deletion request → Read related policy|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/account-deletion.png) · [Mobile](mobile/account-deletion.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /account/notifications

**Notifications** · notifications · member-or-public

Choose which updates reach you and where.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Transaction updates · Community replies · Security alerts · Delivery channel|
|Record columns|Content-led layout; no record table|
|Sections|Notification preferences → Recent notifications|
|Actions|Save notifications → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/account--notifications.png) · [Mobile](mobile/account--notifications.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /account/privacy

**Privacy controls** · privacy-settings · member-or-public

Choose what others can see and manage your data.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Profile visibility · Activity visibility · Contact preference|
|Record columns|Content-led layout; no record table|
|Sections|Visibility controls → Data access → Account deletion|
|Actions|Save privacy settings → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/account--privacy.png) · [Mobile](mobile/account--privacy.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /account/security

**Account security** · security · member-or-public

Keep sign-in methods and active sessions under control.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Current password · New password · Confirm new password|
|Record columns|Content-led layout; no record table|
|Sections|Sign-in methods → Active sessions → Security events|
|Actions|Review password change → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/account--security.png) · [Mobile](mobile/account--security.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin

**Operations overview** · admin · administrator

Review the community economy and respond to exceptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Service · Status · Latest check · Owner|
|Sections|Service health → Action queue → Economy overview|
|Actions|Open incident → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin.png) · [Mobile](mobile/admin.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/analytics

**Community analytics** · admin · administrator

Understand participation without exposing private member records.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Metric · Period · Value · Trend|
|Sections|Participation trend → Audience segments|
|Actions|Export aggregate → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--analytics.png) · [Mobile](mobile/admin--analytics.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/api-health

**API health** · admin · administrator

Inspect endpoint availability and trace failed requests.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Endpoint · Method · Status · Latency|
|Sections|Endpoint health → Recent failures|
|Actions|Inspect request → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--api-health.png) · [Mobile](mobile/admin--api-health.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/bank

**Bank operations** · admin · administrator

Review deposit policy, accrual jobs and bank exceptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Account · Balance · Accrual · Status|
|Sections|Deposit policy → Accrual queue|
|Actions|Review policy → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--bank.png) · [Mobile](mobile/admin--bank.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/blog

**Editorial desk** · admin · administrator

Manage draft articles, publication and corrections.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Title · Author · Visibility · Updated|
|Sections|Editorial queue → Scheduled publications|
|Actions|New article → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--blog.png) · [Mobile](mobile/admin--blog.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/bonds

**Bond administration** · admin · administrator

Review issuances, maturities and settlement status.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Issue · Principal · Maturity · Status|
|Sections|Issue calendar → Settlement queue|
|Actions|Review issuance → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--bonds.png) · [Mobile](mobile/admin--bonds.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/catalog

**Catalog administration** · admin · administrator

Maintain product definitions and visibility.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Product · Category · Visibility · Updated|
|Sections|Catalog filters → Product details|
|Actions|New product → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--catalog.png) · [Mobile](mobile/admin--catalog.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/central-bank

**Central bank policy** · admin · administrator

Review policy proposals and their audit trail.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Policy · Current value · Effective date · State|
|Sections|Policy history → Change review|
|Actions|Review proposal → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--central-bank.png) · [Mobile](mobile/admin--central-bank.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/content

**Content moderation** · admin · administrator

Review reported posts with context and appeal history.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Content · Report reason · Queue · Updated|
|Sections|Moderation queue → Appeals|
|Actions|Review report → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--content.png) · [Mobile](mobile/admin--content.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/controls

**Feature controls** · admin · administrator

Pause features with a reason and a reversible change record.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Feature · State · Reason · Updated|
|Sections|Feature switches → Change history|
|Actions|Review change → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--controls.png) · [Mobile](mobile/admin--controls.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/discord

**Discord integration** · admin · administrator

Inspect integration delivery and command configuration.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Integration · Connection · Last delivery · State|
|Sections|Delivery queue → Command catalog|
|Actions|Inspect delivery → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--discord.png) · [Mobile](mobile/admin--discord.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/economy

**Economy operations** · admin · administrator

Inspect ledger reconciliation and supply changes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Measure · Observed · Expected · Result|
|Sections|Reconciliation → Supply history|
|Actions|Inspect variance → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--economy.png) · [Mobile](mobile/admin--economy.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/economy/scenario-lab

**Economic scenario lab** · admin · administrator

Compare hypothetical policy effects without applying them.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Scenario · Assumptions · Result · Updated|
|Sections|Scenario comparison → Sensitivity|
|Actions|Run simulation → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--economy--scenario-lab.png) · [Mobile](mobile/admin--economy--scenario-lab.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/enterprises

**Enterprise administration** · admin · administrator

Review business listings and operational restrictions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Enterprise · Owner · Sector · Status|
|Sections|Business registry → Review queue|
|Actions|Review enterprise → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--enterprises.png) · [Mobile](mobile/admin--enterprises.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/fx

**FX administration** · admin · administrator

Review rate sources, spreads and stale quotes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Pair · Source · Quoted at · Status|
|Sections|Rate sources → Spread policy|
|Actions|Inspect quote → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--fx.png) · [Mobile](mobile/admin--fx.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/help

**Help center editor** · admin · administrator

Maintain useful support content and revisions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Article · Category · Locale · State|
|Sections|Article library → Revision history|
|Actions|New help article → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--help.png) · [Mobile](mobile/admin--help.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/kdic

**Deposit protection** · admin · administrator

Review coverage limits, eligible accounts and claims.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Claim · Coverage · Amount · Status|
|Sections|Coverage policy → Claim queue|
|Actions|Review claim → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--kdic.png) · [Mobile](mobile/admin--kdic.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/logs

**Audit explorer** · admin · administrator

Follow administrative actions through immutable records.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Sequence · Action · Actor · Timestamp|
|Sections|Audit filters → Record details|
|Actions|Inspect record → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--logs.png) · [Mobile](mobile/admin--logs.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/logs/activity

**Activity log** · admin · administrator

Inspect administrative action history by actor and subject.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Sequence · Actor · Action · Subject|
|Sections|Activity timeline → Record details|
|Actions|Inspect activity → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--logs--activity.png) · [Mobile](mobile/admin--logs--activity.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/logs/delivery

**Delivery log** · admin · administrator

Trace notification attempts and retry outcomes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Delivery · Channel · Attempt · Result|
|Sections|Delivery timeline → Retry details|
|Actions|Inspect delivery → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--logs--delivery.png) · [Mobile](mobile/admin--logs--delivery.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/logs/errors

**Error log** · admin · administrator

Group failures by source and impact.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Fingerprint · Source · Occurrences · Last seen|
|Sections|Error groups → Trace details|
|Actions|Inspect error → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--logs--errors.png) · [Mobile](mobile/admin--logs--errors.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/logs/integrity

**Audit integrity** · admin · administrator

Review verification outcomes without rewriting history.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Range · Verified at · Result · Reference|
|Sections|Chain verification → Verification history|
|Actions|Inspect verification → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--logs--integrity.png) · [Mobile](mobile/admin--logs--integrity.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/logs/system

**System events** · admin · administrator

Review service restarts and background job events.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Service · Event · Severity · Time|
|Sections|System timeline → Job outcomes|
|Actions|Inspect event → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--logs--system.png) · [Mobile](mobile/admin--logs--system.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/market

**Market operations** · admin · administrator

Review symbols, market sessions and trading exceptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Symbol · Session · Quote age · State|
|Sections|Market sessions → Trading exceptions|
|Actions|Review symbol → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--market.png) · [Mobile](mobile/admin--market.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/market/ai-news

**Market news review** · admin · administrator

Review generated news drafts before publication.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Headline · Source · Review state · Updated|
|Sections|Review queue → Attribution|
|Actions|Review draft → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--market--ai-news.png) · [Mobile](mobile/admin--market--ai-news.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/mint

**Mint oversight** · admin · administrator

Inspect authorized currency issuance and supporting records.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Issuance · Purpose · Amount · State|
|Sections|Issuance ledger → Authorization|
|Actions|Inspect issuance → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--mint.png) · [Mobile](mobile/admin--mint.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/money-flow

**Money flow** · admin · administrator

Trace aggregate movements between economic accounts.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Source · Destination · Amount · Period|
|Sections|Flow diagram → Movement ledger|
|Actions|Inspect flow → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--money-flow.png) · [Mobile](mobile/admin--money-flow.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/operations/storage

**Storage operations** · admin · administrator

Inspect capacity, backup evidence and restore readiness.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Volume · Used · Available · State|
|Sections|Capacity history → Backup evidence|
|Actions|Inspect backup → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--operations--storage.png) · [Mobile](mobile/admin--operations--storage.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/pension

**Pension operations** · admin · administrator

Review contributions, benefit policies and payout exceptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Plan · Member group · Period · State|
|Sections|Contribution ledger → Payout queue|
|Actions|Review payout → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--pension.png) · [Mobile](mobile/admin--pension.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/safety

**Safety moderation** · admin · administrator

Handle safety reports with context and restricted access.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Report · Category · Priority · State|
|Sections|Safety queue → Appeals|
|Actions|Review safety report → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--safety.png) · [Mobile](mobile/admin--safety.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/security

**Security center** · admin · administrator

Review security alerts and privileged access.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Alert · Severity · Subject · State|
|Sections|Access reviews → Security events|
|Actions|Inspect alert → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--security.png) · [Mobile](mobile/admin--security.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/seo

**Search visibility** · admin · administrator

Review crawlability and publication metadata.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Page · Index state · Canonical · Updated|
|Sections|Index coverage → Metadata issues|
|Actions|Inspect page → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--seo.png) · [Mobile](mobile/admin--seo.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/seo-audit

**SEO audit** · admin · administrator

Review broken links, metadata and structured-data findings.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Finding · URL · Severity · State|
|Sections|Audit results → Page details|
|Actions|Inspect finding → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--seo-audit.png) · [Mobile](mobile/admin--seo-audit.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/shop

**Shop operations** · admin · administrator

Manage stock, product availability and purchase exceptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Product · Price · Stock · Visibility|
|Sections|Inventory → Purchase exceptions|
|Actions|Review product → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--shop.png) · [Mobile](mobile/admin--shop.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/support

**Support inbox** · admin · administrator

Resolve member requests with least-privilege access.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Ticket · Topic · Assigned to · State|
|Sections|Ticket inbox → Conversation|
|Actions|Open ticket → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--support.png) · [Mobile](mobile/admin--support.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/treasury

**Treasury oversight** · admin · administrator

Review allocations and balances against ledger records.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Fund · Allocation · Available · State|
|Sections|Fund allocation → Treasury ledger|
|Actions|Review allocation → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--treasury.png) · [Mobile](mobile/admin--treasury.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/treasury/grants

**Grant review** · admin · administrator

Review grant requests and their disbursement receipts.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Application · Program · Requested · State|
|Sections|Application queue → Disbursement|
|Actions|Review application → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--treasury--grants.png) · [Mobile](mobile/admin--treasury--grants.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/users

**Member administration** · admin · administrator

Find members and inspect permitted account actions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Member · Joined · Account state · Roles|
|Sections|Member directory → Account actions|
|Actions|Inspect member → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--users.png) · [Mobile](mobile/admin--users.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/users/[id]

**Member details** · admin · administrator

Review one member account with an auditable reason.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Account field · Current value · Updated · Source|
|Sections|Identity → Role history → Account actions|
|Actions|Review account action → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--users--_id_.png) · [Mobile](mobile/admin--users--_id_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /admin/work

**Work operations** · admin · administrator

Review task definitions, submissions and verified rewards.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Status · Date range|
|Record columns|Task · Category · Submissions · State|
|Sections|Task catalog → Verification queue|
|Actions|Review submission → View audit trail|
|Navigation|admin|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/admin--work.png) · [Mobile](mobile/admin--work.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /advisor

**Financial guide** · plan · member-or-public

Explore your goals and the trade-offs between them.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Goal · Time horizon · Risk preference|
|Record columns|Goal · Target · Progress · Next step|
|Sections|Your plan → Goal priorities → Risk overview|
|Actions|Review plan → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/advisor.png) · [Mobile](mobile/advisor.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /announcements

**Announcements** · feed · member-or-public

Keep up with decisions and service updates.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Category · Search|
|Record columns|Title · Author · Updated|
|Sections|Pinned updates → Latest announcements|
|Actions|Read announcement → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/announcements.png) · [Mobile](mobile/announcements.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /announcements/[announcementId]

**Announcement** · article · member-or-public

Read the full content with context, related links and clear discussion controls.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Author · Published · Updated|
|Sections|Article body → On this page → Related reading → Comments|
|Actions|Share article → Back to list|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/announcements--_announcementId_.png) · [Mobile](mobile/announcements--_announcementId_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /arcade

**The arcade** · arcade · member-or-public

Find a game, understand its rules and start when eligible.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Game category|
|Record columns|Item · Requirement · Reward · State|
|Sections|Featured game → Game library → Recent sessions|
|Actions|View game rules → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/arcade.png) · [Mobile](mobile/arcade.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /bank

**Your bank** · bank · member-or-public

Keep everyday funds and savings clearly separated.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Amount · Transfer direction|
|Record columns|Movement · Amount · Account · Date|
|Sections|Deposit and withdraw → Savings overview → Interest terms|
|Actions|Review transfer → Open savings pot|
|Navigation|bank|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/bank.png) · [Mobile](mobile/bank.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /bank/savings-pot

**Savings pots** · savings · member-or-public

Give each savings goal its own place.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Pot name · Target amount · Target date · Contribution|
|Record columns|Pot · Saved · Goal · Progress|
|Sections|Savings goals → Contribution history|
|Actions|Create savings pot → Add contribution|
|Navigation|bank|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/bank--savings-pot.png) · [Mobile](mobile/bank--savings-pot.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /blog

**Moneyverse journal** · editorial · member-or-public

Stories, ideas and guides from the community.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Topic · Search|
|Record columns|Title · Author · Updated|
|Sections|Featured story → Latest articles|
|Actions|Read article → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/blog.png) · [Mobile](mobile/blog.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /blog/[slug]

**Journal article** · article · member-or-public

Read the full content with context, related links and clear discussion controls.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Author · Published · Updated|
|Sections|Article body → On this page → Related reading → Comments|
|Actions|Share article → Back to list|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/blog--_slug_.png) · [Mobile](mobile/blog--_slug_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /board

**Community board** · board · member-or-public

Find conversations worth joining.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search posts · Category|
|Record columns|Title · Author · Updated|
|Sections|Pinned posts → Recent discussions|
|Actions|New post → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/board.png) · [Mobile](mobile/board.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /board/[postId]

**Community post** · article · member-or-public

Read the full content with context, related links and clear discussion controls.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Author · Published · Updated|
|Sections|Article body → On this page → Related reading → Comments|
|Actions|Share article → Back to list|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/board--_postId_.png) · [Mobile](mobile/board--_postId_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /bonds

**Government bonds** · bonds · member-or-public

Compare maturities, terms and your holdings.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Maturity · Issue category|
|Record columns|Issue · Yield · Maturity · Availability|
|Sections|Available issues → My holdings → Maturity calendar|
|Actions|Review issue → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/bonds.png) · [Mobile](mobile/bonds.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /businesses

**My businesses** · business · member-or-public

Follow the operations and finances of your businesses.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Business category · Status|
|Record columns|Business · Revenue · Costs · State|
|Sections|Business overview → Cash flow → Operations|
|Actions|Open business → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/businesses.png) · [Mobile](mobile/businesses.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /businesses/ventures

**Startup ventures** · ventures · member-or-public

Review venture proposals and their funding terms.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Sector · Funding state|
|Record columns|Venture · Funding target · Progress · State|
|Sections|Venture directory → Funding timeline → Risk disclosure|
|Actions|Review venture → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/businesses--ventures.png) · [Mobile](mobile/businesses--ventures.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /calculators

**Calculator library** · tools · member-or-public

A clear starting point for savings, loans and tax scenarios.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search calculators · Topic|
|Record columns|Content-led layout; no record table|
|Sections|Savings tools → Borrowing tools → Tax tools|
|Actions|Open calculator → Get help|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/calculators.png) · [Mobile](mobile/calculators.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /calendar

**Community calendar** · calendar · member-or-public

Plan around events, deadlines and market sessions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Month · Event category|
|Record columns|Item · Requirement · Reward · State|
|Sections|Month calendar → Upcoming events → Event details|
|Actions|Open event → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/calendar.png) · [Mobile](mobile/calendar.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /casino

**Casino lounge** · casino · member-or-public

Check eligibility, limits and availability before play.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Game · Stake · Limit|
|Record columns|Item · Requirement · Reward · State|
|Sections|Game selection → Play limits → Round history|
|Actions|Review eligibility → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/casino.png) · [Mobile](mobile/casino.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /central-bank

**Central bank** · policy · member-or-public

Understand monetary policy and its published history.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Policy category · Period|
|Record columns|Policy · Effective date · Change · Status|
|Sections|Policy overview → Published decisions → Supply history|
|Actions|Read decision → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/central-bank.png) · [Mobile](mobile/central-bank.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /chat

**Messages** · chat · member-or-public

Keep conversations organized and see what is new.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search conversations · Message|
|Record columns|Conversation · Updated · Unread|
|Sections|Conversation list → Message thread → Conversation details|
|Actions|New conversation → Send message|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/chat.png) · [Mobile](mobile/chat.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /clubs

**Find your club** · clubs · member-or-public

Discover a group to build, trade and play with.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search clubs · Interests · Admission|
|Record columns|Title · Author · Updated|
|Sections|Club directory → Recommended clubs|
|Actions|Explore club → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/clubs.png) · [Mobile](mobile/clubs.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /clubs/[clubId]

**Club home** · club · member-or-public

Your shared plans, conversations and upcoming events.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search club posts|
|Record columns|Title · Author · Updated|
|Sections|Club overview → Club discussion → Upcoming events|
|Actions|Join club → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/clubs--_clubId_.png) · [Mobile](mobile/clubs--_clubId_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /clubs/[clubId]/members

**Club members** · members · member-or-public

See the people and roles in your club.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search members · Role|
|Record columns|Title · Author · Updated|
|Sections|Member directory → Role descriptions|
|Actions|Open member profile → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/clubs--_clubId_--members.png) · [Mobile](mobile/clubs--_clubId_--members.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /clubs/new

**Create a club** · club-create · member-or-public

Bring people together with a clear purpose and membership rules.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Club name · Description · Interests · Admission policy · Club emblem|
|Record columns|Content-led layout; no record table|
|Sections|Club details → Membership rules → Preview|
|Actions|Review club → Cancel|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/clubs--new.png) · [Mobile](mobile/clubs--new.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /clubs/warfare

**Club competition** · competition · member-or-public

Review fixtures, eligibility and results.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Season · Competition state|
|Record columns|Title · Author · Updated|
|Sections|Current fixtures → Club standings → Competition rules|
|Actions|Open fixture → Browse topics|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/clubs--warfare.png) · [Mobile](mobile/clubs--warfare.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /collections

**Collections** · collections · member-or-public

Follow collection progress and explore missing pieces.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Collection category · Progress|
|Record columns|Item · Requirement · Reward · State|
|Sections|Featured collection → Collection sets → Rewards|
|Actions|Open collection → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/collections.png) · [Mobile](mobile/collections.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /dashboard

**My dashboard** · dashboard · member-or-public

Keep your personal finances and activity in one place.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Activity · Account · Amount · Time|
|Sections|Asset allocation → Recent activity → Personal goals|
|Actions|Manage goals → Open wallet|
|Navigation|home|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/dashboard.png) · [Mobile](mobile/dashboard.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /data-deletion

**Data deletion** · legal-action · member-or-public

Understand your options for deleting personal information.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Content-led layout; no record table|
|Sections|Deletion options → Retention exceptions → Request process → Contact|
|Actions|Review deletion request → Read related policy|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/data-deletion.png) · [Mobile](mobile/data-deletion.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /design-preview

**Design system** · design-system · member-or-public

Review the visual language and accessible component states.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Component family · State|
|Record columns|Content-led layout; no record table|
|Sections|Typography → Surfaces → Inputs and actions → Feedback|
|Actions|Inspect component → Get help|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/design-preview.png) · [Mobile](mobile/design-preview.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /developer

**Developer center** · developer · member-or-public

Find public integration documentation and contract examples.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search documentation|
|Record columns|Content-led layout; no record table|
|Sections|API reference → Integration guide → Service limits|
|Actions|Read API reference → Get help|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/developer.png) · [Mobile](mobile/developer.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /enterprises

**Enterprise directory** · enterprise · member-or-public

Find community businesses and their services.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search enterprises · Sector|
|Record columns|Enterprise · Sector · Services · Status|
|Sections|Featured enterprises → Business directory|
|Actions|Open enterprise → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/enterprises.png) · [Mobile](mobile/enterprises.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /features

**Explore Moneyverse** · features · member-or-public

Find the parts of Moneyverse that fit your next goal.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Feature category|
|Record columns|Content-led layout; no record table|
|Sections|Money → Community → Play and progress|
|Actions|Explore feature → Get help|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/features.png) · [Mobile](mobile/features.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /forgot-password

**Reset your access** · auth · member-or-public

Request a recovery link for your registered email.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Email|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Send recovery link → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/forgot-password.png) · [Mobile](mobile/forgot-password.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /fx

**Currency exchange** · exchange · member-or-public

Compare a quote and its fee before reviewing an exchange.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|From currency · To currency · Amount|
|Record columns|Pair · Rate · Spread · Quoted at|
|Sections|Exchange quote → Rate history → Fee details|
|Actions|Review exchange → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/fx.png) · [Mobile](mobile/fx.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /gallery

**Community gallery** · gallery · member-or-public

Explore photographs and creations from the community.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search photos · Category · Sort by|
|Record columns|Content-led layout; no record table|
|Sections|Featured collection → Photo grid → Community favorites|
|Actions|Upload photo → Open collection|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/gallery.png) · [Mobile](mobile/gallery.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /gallery/[photoId]

**Photo details** · photo · member-or-public

See the photograph, its creator and the conversation around it.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Creator · Published · License|
|Sections|Full photograph → Caption → Comments → Related photos|
|Actions|Save photo → Report photo|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/gallery--_photoId_.png) · [Mobile](mobile/gallery--_photoId_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /gallery/submit

**Upload a photo** · upload · member-or-public

Choose an image and review its details before publishing.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Photo · Title · Caption · Category · Alt text · Visibility|
|Record columns|Content-led layout; no record table|
|Sections|Image preview → Photo details → Publication review|
|Actions|Review upload → Cancel|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/gallery--submit.png) · [Mobile](mobile/gallery--submit.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide

**Moneyverse guide** · guide · member-or-public

Find a helpful starting point for every feature.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Getting started → Money and markets → Community and play|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide.png) · [Mobile](mobile/guide.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide/career-mastery

**Career mastery** · guide · member-or-public

Understand job progression and task verification.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Choose a career → Build mastery → Track verified rewards|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide--career-mastery.png) · [Mobile](mobile/guide--career-mastery.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide/dopamine-system

**Growth guide** · guide · member-or-public

Understand progression without losing sight of your goals.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Progress and milestones → Reward limits → Healthy play|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide--dopamine-system.png) · [Mobile](mobile/guide--dopamine-system.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide/glossary

**Financial glossary** · guide · member-or-public

Look up a term and follow it into context.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Popular terms → Browse alphabetically → Related guides|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide--glossary.png) · [Mobile](mobile/guide--glossary.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide/glossary/[term]

**Glossary term** · glossary-term · member-or-public

A clear definition with examples and related terms.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Definition → Worked example → Related terms|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide--glossary--_term_.png) · [Mobile](mobile/guide--glossary--_term_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide/stock-trading

**Stock trading guide** · guide · member-or-public

Learn chart basics, order review and risk.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Read a chart → Review an order → Understand risk|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide--stock-trading.png) · [Mobile](mobile/guide--stock-trading.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /guide/virtual-banking

**Banking guide** · guide · member-or-public

Understand deposits, transfers and interest terms.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search guide|
|Record columns|Content-led layout; no record table|
|Sections|Move funds → Savings goals → Interest and limits|
|Actions|Read guide → Browse glossary|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/guide--virtual-banking.png) · [Mobile](mobile/guide--virtual-banking.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /help

**Help center** · help · member-or-public

Find a clear answer or reach the support team.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search help · Topic|
|Record columns|Title · Author · Updated|
|Sections|Popular questions → Browse topics → Contact support|
|Actions|Search help → Browse topics|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/help.png) · [Mobile](mobile/help.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /help/[slug]

**Help article** · article · member-or-public

Read the full content with context, related links and clear discussion controls.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Author · Published · Updated|
|Sections|Article body → On this page → Related reading → Comments|
|Actions|Share article → Back to list|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/help--_slug_.png) · [Mobile](mobile/help--_slug_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /inventory

**My inventory** · inventory · member-or-public

Find your items and understand where they can be used.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search items · Category · Sort by|
|Record columns|Item · Requirement · Reward · State|
|Sections|Item grid → Item details → Usage history|
|Actions|Open item → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/inventory.png) · [Mobile](mobile/inventory.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /invite/[code]

**Club invitation** · invitation · member-or-public

Review the destination and rules before accepting an invitation.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Acceptance|
|Record columns|Content-led layout; no record table|
|Sections|Club details → Invitation status → Community rules|
|Actions|Accept invitation → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/invite--_code_.png) · [Mobile](mobile/invite--_code_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /kdic

**Deposit protection** · coverage · member-or-public

Understand covered balances and the limits of protection.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Account category|
|Record columns|Account · Eligible balance · Limit · Coverage|
|Sections|Coverage overview → Covered accounts → Protection rules|
|Actions|Check coverage → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/kdic.png) · [Mobile](mobile/kdic.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /lobby

**Community lobby** · chat · member-or-public

Keep conversations organized and see what is new.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search conversations · Message|
|Record columns|Conversation · Updated · Unread|
|Sections|Conversation list → Message thread → Conversation details|
|Actions|New conversation → Send message|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/lobby.png) · [Mobile](mobile/lobby.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /login

**Welcome back** · auth · member-or-public

Sign in to your Moneyverse.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Email · Password|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Sign in → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/login.png) · [Mobile](mobile/login.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /login/providers

**Choose how to sign in** · auth · member-or-public

Use a connected provider without sharing its password.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Provider|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Continue with provider → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/login--providers.png) · [Mobile](mobile/login--providers.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /marketplace

**Community market** · marketplace · member-or-public

Browse member listings and review trade terms.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search listings · Category · Price range|
|Record columns|Item · Requirement · Reward · State|
|Sections|Featured listings → Listing grid → Buyer guidance|
|Actions|Open listing → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/marketplace.png) · [Mobile](mobile/marketplace.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /marketplace/auction

**Auctions** · auction · member-or-public

Understand timing and bid commitments before participating.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Category · Closing time · Auction state|
|Record columns|Item · Requirement · Reward · State|
|Sections|Closing soon → Auction listings → My bids|
|Actions|Review bid → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/marketplace--auction.png) · [Mobile](mobile/marketplace--auction.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /mint

**Currency issuance** · issuance · member-or-public

Inspect published issuance records and their purposes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Period · Purpose|
|Record columns|Issuance · Purpose · Amount · Date|
|Sections|Issuance history → Supply explanation|
|Actions|Open issuance record → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/mint.png) · [Mobile](mobile/mint.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /newspaper

**The Moneyverse daily** · newspaper · member-or-public

A readable digest of community and economy news.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Edition · Topic|
|Record columns|Title · Author · Updated|
|Sections|Lead story → Economy brief → Community notes|
|Actions|Read edition → Browse topics|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/newspaper.png) · [Mobile](mobile/newspaper.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /pension

**My pension** · pension · member-or-public

Follow contributions and review future benefit assumptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Plan · Period|
|Record columns|Period · Contribution · Employer share · Status|
|Sections|Contribution history → Benefit projection → Plan terms|
|Actions|Review contribution → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/pension.png) · [Mobile](mobile/pension.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /prediction

**Prediction markets** · prediction · member-or-public

Read outcomes, rules and risk before participating.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Topic · Closing date|
|Record columns|Market · Outcome · Closes · State|
|Sections|Open markets → My positions → Resolution rules|
|Actions|Review market → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/prediction.png) · [Mobile](mobile/prediction.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /privacy

**Privacy policy** · legal · member-or-public

Know how personal information is handled.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Content-led layout; no record table|
|Sections|Information collected → Purpose and retention → Your rights → Contact|
|Actions|Contact support → Read related policy|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/privacy.png) · [Mobile](mobile/privacy.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /profile

**My profile** · profile · member-or-public

Your public identity and community contributions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search activity|
|Record columns|Content-led layout; no record table|
|Sections|Profile overview → Badges → Recent activity|
|Actions|Edit profile → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/profile.png) · [Mobile](mobile/profile.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /profile/[userId]

**Member profile** · profile-public · member-or-public

Explore a member profile within their privacy choices.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Activity category|
|Record columns|Content-led layout; no record table|
|Sections|Public profile → Contributions → Achievements|
|Actions|Send message → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/profile--_userId_.png) · [Mobile](mobile/profile--_userId_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /profile/settings

**Edit profile** · profile-edit · member-or-public

Choose how your profile appears to the community.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Display name · Biography · Profile image · Visibility|
|Record columns|Content-led layout; no record table|
|Sections|Profile preview → Personal details|
|Actions|Save profile → Cancel|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/profile--settings.png) · [Mobile](mobile/profile--settings.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /progression

**Your growth** · progression · member-or-public

See your progress, milestones and next unlock.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Progress category|
|Record columns|Item · Requirement · Reward · State|
|Sections|Level journey → Milestones → Unlocked features|
|Actions|Open milestone → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/progression.png) · [Mobile](mobile/progression.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /progression/prestige

**Prestige** · prestige · member-or-public

Understand what resets and what is preserved before prestige.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Acknowledgement|
|Record columns|Item · Requirement · Reward · State|
|Sections|Eligibility → Preserved progress → Reset review|
|Actions|Review prestige → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/progression--prestige.png) · [Mobile](mobile/progression--prestige.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /quests

**Your next quest** · quests · member-or-public

Turn small steps into meaningful progress.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Quest category · Quest state|
|Record columns|Item · Requirement · Reward · State|
|Sections|Featured quest → Quest board → Claimed rewards|
|Actions|Open quest → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/quests.png) · [Mobile](mobile/quests.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /register

**Create your account** · auth · member-or-public

Start with a secure account and clear consent.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Display name · Email · Password · Confirm password · Terms consent · Privacy consent|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Create account → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/register.png) · [Mobile](mobile/register.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /reset-password

**Choose a new password** · auth · member-or-public

Use your recovery link to set a new password.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|New password · Confirm password|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Reset password → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/reset-password.png) · [Mobile](mobile/reset-password.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /roadmap

**Product roadmap** · roadmap · member-or-public

Follow planned work and published progress.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Area · Milestone state|
|Record columns|Content-led layout; no record table|
|Sections|Now → Next → Later → Completed changes|
|Actions|Open milestone → Get help|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/roadmap.png) · [Mobile](mobile/roadmap.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /safety

**Community safety** · legal · member-or-public

A safer community starts with clear boundaries.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Content-led layout; no record table|
|Sections|Community rules → Reporting → Moderation → Appeals|
|Actions|Contact support → Read related policy|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/safety.png) · [Mobile](mobile/safety.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /safety/takedown

**Request a takedown** · legal-action · member-or-public

Submit a clear report and follow the review process.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Content URL · Reason · Evidence · Contact email|
|Record columns|Content-led layout; no record table|
|Sections|Request details → Evidence → Rights and permissions → Review process|
|Actions|Review report → Read related policy|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/safety--takedown.png) · [Mobile](mobile/safety--takedown.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /search

**Search Moneyverse** · search · member-or-public

Find pages, articles, members and public resources.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search · Content type|
|Record columns|Content-led layout; no record table|
|Sections|Search results → Related searches → Recent searches|
|Actions|Search → Get help|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/search.png) · [Mobile](mobile/search.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /seasons

**Current season** · seasons · member-or-public

Follow the season journey and its reward rules.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Season · Reward category|
|Record columns|Item · Requirement · Reward · State|
|Sections|Season progress → Reward track → Season rules|
|Actions|Open reward → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/seasons.png) · [Mobile](mobile/seasons.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /shop

**Moneyverse shop** · shop · member-or-public

Find useful items with clear prices, availability and purchase review.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search products · Category · Availability|
|Record columns|Product · Price · Stock · Visibility|
|Sections|Featured products → Product catalog → Purchase history|
|Actions|Open product → View inventory|
|Navigation|shop|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/shop.png) · [Mobile](mobile/shop.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /shop/catalog

**Product catalog** · shop · member-or-public

Browse the complete catalog and understand every purchase.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search catalog · Category · Sort by|
|Record columns|Product · Price · Stock · Availability|
|Sections|Catalog filters → Product grid → Product details|
|Actions|Review product → View inventory|
|Navigation|shop|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/shop--catalog.png) · [Mobile](mobile/shop--catalog.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /spaces

**My space** · space · member-or-public

Make a place of your own in Moneyverse.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Space category|
|Record columns|Item · Requirement · Reward · State|
|Sections|Space preview → Owned spaces → Customization|
|Actions|Customize space → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/spaces.png) · [Mobile](mobile/spaces.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /spaces/real-estate

**Real estate** · property · member-or-public

Compare properties and their ownership costs.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|District · Price range · Property type|
|Record columns|Item · Requirement · Reward · State|
|Sections|District map → Property listings → Cost review|
|Actions|Open property → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/spaces--real-estate.png) · [Mobile](mobile/spaces--real-estate.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /status

**Service status** · status · member-or-public

Check reported service availability and incident updates.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Service · Period|
|Record columns|Content-led layout; no record table|
|Sections|Service health → Incident timeline → Maintenance notices|
|Actions|Read incident → Get help|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/status.png) · [Mobile](mobile/status.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks

**Stock market** · market · member-or-public

Explore the market with price context and clear risk.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search symbols · Sector · Session|
|Record columns|Symbol · Price · Change · Volume|
|Sections|Market overview → Watchlist → Market movers|
|Actions|Open symbol → Manage watchlist|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks.png) · [Mobile](mobile/stocks.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/[symbol]

**Stock details** · stock · member-or-public

Read the chart, understand the cost, then review an order.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Order side · Order type · Quantity · Limit price|
|Record columns|Price · Quantity · Side|
|Sections|Candlestick chart → Volume → Moving averages → Order book → Order review|
|Actions|Review order → Add to watchlist|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--_symbol_.png) · [Mobile](mobile/stocks--_symbol_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/alerts

**Price alerts** · alerts · member-or-public

Set a threshold and understand how you will be notified.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Symbol · Condition · Target price · Channel|
|Record columns|Symbol · Condition · Target · State|
|Sections|Active alerts → Triggered alerts|
|Actions|Create alert → Manage notifications|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--alerts.png) · [Mobile](mobile/stocks--alerts.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/community

**Market discussion** · discussion · member-or-public

Discuss ideas while keeping analysis distinct from advice.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search discussions · Symbol|
|Record columns|Discussion · Author · Replies · Updated|
|Sections|Symbol discussions → Community guidelines|
|Actions|New discussion → Browse symbols|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--community.png) · [Mobile](mobile/stocks--community.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/compare

**Compare stocks** · compare · member-or-public

Compare the same periods and measures side by side.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|First symbol · Second symbol · Period|
|Record columns|Measure · First symbol · Second symbol|
|Sections|Relative performance → Valuation comparison → Risk notes|
|Actions|Compare symbols → Reset comparison|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--compare.png) · [Mobile](mobile/stocks--compare.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/derivatives

**Derivative products** · derivatives · member-or-public

Review eligibility and product risk before any order.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Product · Expiry · Side · Quantity|
|Record columns|Contract · Expiry · Price · Risk|
|Sections|Product chain → Risk disclosure → Order review|
|Actions|Review eligibility → Read product terms|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--derivatives.png) · [Mobile](mobile/stocks--derivatives.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/history

**Trade history** · ledger · member-or-public

Follow your orders from placement to settlement.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Symbol · Order status · Date range|
|Record columns|Order · Side · Quantity · Status|
|Sections|Order history → Settlement details|
|Actions|Open order → Export history|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--history.png) · [Mobile](mobile/stocks--history.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/league

**Trading league** · leaderboard · member-or-public

Compare game performance with transparent ranking rules.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Season · Ranking group|
|Record columns|Rank · Player · Score · Change|
|Sections|Season standings → My standing → Scoring rules|
|Actions|View scoring rules → Open profile|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--league.png) · [Mobile](mobile/stocks--league.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/portfolio

**My portfolio** · portfolio · member-or-public

Understand positions, allocation and unrealized outcomes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Position · Quantity · Average cost · Market value|
|Sections|Portfolio allocation → Holdings → Performance|
|Actions|Open position → View trade history|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--portfolio.png) · [Mobile](mobile/stocks--portfolio.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /stocks/watchlist

**Watchlist** · watchlist · member-or-public

Keep the symbols you care about within reach.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search symbols · Sort by|
|Record columns|Symbol · Price · Change · Alert|
|Sections|Watched symbols → Price alerts|
|Actions|Add symbol → Create alert|
|Navigation|stocks|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/stocks--watchlist.png) · [Mobile](mobile/stocks--watchlist.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /support

**Support conversations** · chat · member-or-public

Ask for help and follow the status of your request.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search conversations · Message|
|Record columns|Conversation · Updated · Unread|
|Sections|Conversation list → Message thread → Conversation details|
|Actions|New support request → Send message|
|Navigation|community|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/support.png) · [Mobile](mobile/support.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /terms

**Terms of service** · legal · member-or-public

Understand your rights and responsibilities.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Content-led layout; no record table|
|Sections|Using Moneyverse → Virtual economy → Account responsibilities → Disputes|
|Actions|Contact support → Read related policy|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/terms.png) · [Mobile](mobile/terms.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools

**Financial tools** · tools · member-or-public

Choose a focused tool and inspect its assumptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search tools · Topic|
|Record columns|Content-led layout; no record table|
|Sections|Popular calculators → All tools → Saved scenarios|
|Actions|Open calculator → Get help|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools.png) · [Mobile](mobile/tools.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/capital-gains-tax-calculator

**Capital gains tax** · calculator · member-or-public

Estimate gains and review the assumptions behind tax.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Sale proceeds · Acquisition cost · Eligible expenses · Tax year|
|Record columns|Item · Taxable base · Rate · Estimated tax|
|Sections|Estimated tax → Net proceeds → Tax assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--capital-gains-tax-calculator.png) · [Mobile](mobile/tools--capital-gains-tax-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/capital-gains-tax-calculator/[preset]

**Capital gains tax** · calculator · member-or-public

Estimate gains and review the assumptions behind tax.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Sale proceeds · Acquisition cost · Eligible expenses · Tax year|
|Record columns|Item · Taxable base · Rate · Estimated tax|
|Sections|Saved scenario → Estimated tax → Net proceeds → Tax assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--capital-gains-tax-calculator--_preset_.png) · [Mobile](mobile/tools--capital-gains-tax-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/compound-calculator

**Compound growth** · calculator · member-or-public

See how contributions and compounding build over time.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Starting amount · Monthly contribution · Annual return · Years|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Growth projection → Contributions vs returns → Yearly breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--compound-calculator.png) · [Mobile](mobile/tools--compound-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/compound-calculator/[preset]

**Compound growth** · calculator · member-or-public

See how contributions and compounding build over time.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Starting amount · Monthly contribution · Annual return · Years|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Growth projection → Contributions vs returns → Yearly breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--compound-calculator--_preset_.png) · [Mobile](mobile/tools--compound-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/crypto-apy-calculator

**Crypto yield** · calculator · member-or-public

Compare compounding scenarios and explain their risks.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Starting amount · Annual yield · Compounds per year · Days|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Projected yield → Compounding schedule → Risk assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--crypto-apy-calculator.png) · [Mobile](mobile/tools--crypto-apy-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/dividend-tax-calculator

**Dividend income** · calculator · member-or-public

Estimate dividend withholding and net income.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Ticker · Shares held · Dividend per share · Withholding rate|
|Record columns|Payment date · Gross amount · Withholding · Net amount|
|Sections|Gross vs net income → Payment schedule → Tax assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--dividend-tax-calculator.png) · [Mobile](mobile/tools--dividend-tax-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/dividend-tax-calculator/[ticker]

**Dividend income** · calculator · member-or-public

Estimate dividend withholding and net income.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Ticker · Shares held · Dividend per share · Withholding rate|
|Record columns|Payment date · Gross amount · Withholding · Net amount|
|Sections|Saved scenario → Gross vs net income → Payment schedule → Tax assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--dividend-tax-calculator--_ticker_.png) · [Mobile](mobile/tools--dividend-tax-calculator--_ticker_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/farming-calculator

**Work income** · calculator · member-or-public

Compare verified job reward assumptions and time.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Job · Tasks per day · Days worked · Reward per task|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Time vs income → Daily projection → Reward limits|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--farming-calculator.png) · [Mobile](mobile/tools--farming-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/farming-calculator/[preset]

**Work income** · calculator · member-or-public

Compare verified job reward assumptions and time.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Job · Tasks per day · Days worked · Reward per task|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Time vs income → Daily projection → Reward limits|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--farming-calculator--_preset_.png) · [Mobile](mobile/tools--farming-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/fire-calculator

**Financial independence** · calculator · member-or-public

Explore a target based on spending and withdrawal assumptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Annual expenses · Current assets · Annual savings · Withdrawal rate|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Target portfolio → Time to target → Sensitivity|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--fire-calculator.png) · [Mobile](mobile/tools--fire-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/gift-tax-calculator

**Gift tax** · calculator · member-or-public

Estimate a gift-tax scenario and applicable allowances.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Gift amount · Relationship · Previous gifts · Tax year|
|Record columns|Item · Allowance · Taxable base · Estimated tax|
|Sections|Estimated liability → Allowance breakdown → Calculation notes|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--gift-tax-calculator.png) · [Mobile](mobile/tools--gift-tax-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/gift-tax-calculator/[preset]

**Gift tax** · calculator · member-or-public

Estimate a gift-tax scenario and applicable allowances.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Gift amount · Relationship · Previous gifts · Tax year|
|Record columns|Item · Allowance · Taxable base · Estimated tax|
|Sections|Saved scenario → Estimated liability → Allowance breakdown → Calculation notes|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--gift-tax-calculator--_preset_.png) · [Mobile](mobile/tools--gift-tax-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/goal-wealth-calculator

**Savings goal** · calculator · member-or-public

Work backwards from a target to a contribution plan.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Target amount · Starting balance · Target date · Expected return|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Required contribution → Goal progress → Alternative plans|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--goal-wealth-calculator.png) · [Mobile](mobile/tools--goal-wealth-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/isa-calculator

**ISA account** · calculator · member-or-public

Compare allowances and estimated after-tax outcomes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Contribution · Holding years · Expected return · Account category|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Account projection → Tax comparison → Eligibility|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--isa-calculator.png) · [Mobile](mobile/tools--isa-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/isa-calculator/[slug]

**ISA account** · calculator · member-or-public

Compare allowances and estimated after-tax outcomes.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Contribution · Holding years · Expected return · Account category|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Account projection → Tax comparison → Eligibility|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--isa-calculator--_slug_.png) · [Mobile](mobile/tools--isa-calculator--_slug_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/kimchi-premium-calculator

**Market premium** · calculator · member-or-public

Compare two sourced prices with currency conversion.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Local price · Overseas price · FX rate · Fees|
|Record columns|Market · Price · Currency · Source time|
|Sections|Premium comparison → Cost breakdown → Source timestamps|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--kimchi-premium-calculator.png) · [Mobile](mobile/tools--kimchi-premium-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/kimchi-premium-calculator/[preset]

**Market premium** · calculator · member-or-public

Compare two sourced prices with currency conversion.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Local price · Overseas price · FX rate · Fees|
|Record columns|Market · Price · Currency · Source time|
|Sections|Saved scenario → Premium comparison → Cost breakdown → Source timestamps|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--kimchi-premium-calculator--_preset_.png) · [Mobile](mobile/tools--kimchi-premium-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/loan-interest-calculator

**Loan repayment** · calculator · member-or-public

Understand payment schedules before choosing a loan scenario.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Loan principal · Annual interest · Term months · Repayment method|
|Record columns|Period · Payment · Interest · Principal · Remaining|
|Sections|Monthly payment → Principal vs interest → Repayment schedule|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--loan-interest-calculator.png) · [Mobile](mobile/tools--loan-interest-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/loan-interest-calculator/[preset]

**Loan repayment** · calculator · member-or-public

Understand payment schedules before choosing a loan scenario.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Loan principal · Annual interest · Term months · Repayment method|
|Record columns|Period · Payment · Interest · Principal · Remaining|
|Sections|Saved scenario → Monthly payment → Principal vs interest → Repayment schedule|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--loan-interest-calculator--_preset_.png) · [Mobile](mobile/tools--loan-interest-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/pension-tax-calculator

**Pension tax** · calculator · member-or-public

Estimate pension contributions and deductions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Annual contribution · Income band · Age · Tax year|
|Record columns|Contribution · Deduction limit · Applicable rate · Estimated deduction|
|Sections|Estimated deduction → Annual contribution → Assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--pension-tax-calculator.png) · [Mobile](mobile/tools--pension-tax-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/pension-tax-calculator/[slug]

**Pension tax** · calculator · member-or-public

Estimate pension contributions and deductions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Annual contribution · Income band · Age · Tax year|
|Record columns|Contribution · Deduction limit · Applicable rate · Estimated deduction|
|Sections|Saved scenario → Estimated deduction → Annual contribution → Assumptions|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--pension-tax-calculator--_slug_.png) · [Mobile](mobile/tools--pension-tax-calculator--_slug_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/quant-studio

**Quant studio** · quant · member-or-public

Compare strategies using transparent hypothetical assumptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Universe · Date range · Strategy · Benchmark|
|Record columns|Metric · Strategy · Benchmark|
|Sections|Strategy builder → Performance comparison → Drawdown|
|Actions|Run backtest → Save scenario|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--quant-studio.png) · [Mobile](mobile/tools--quant-studio.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/real-estate-calculator

**Property costs** · calculator · member-or-public

Compare acquisition, financing and ongoing costs.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Property price · Down payment · Loan rate · Holding years|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Total ownership cost → Financing → Cost breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--real-estate-calculator.png) · [Mobile](mobile/tools--real-estate-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/real-estate-calculator/[preset]

**Property costs** · calculator · member-or-public

Compare acquisition, financing and ongoing costs.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Property price · Down payment · Loan rate · Holding years|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Total ownership cost → Financing → Cost breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--real-estate-calculator--_preset_.png) · [Mobile](mobile/tools--real-estate-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/retirement-calculator

**Retirement plan** · calculator · member-or-public

Explore income needs and retirement funding.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Current age · Retirement age · Current assets · Monthly savings|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Retirement gap → Projected assets → Income plan|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--retirement-calculator.png) · [Mobile](mobile/tools--retirement-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/retirement-calculator/[slug]

**Retirement plan** · calculator · member-or-public

Explore income needs and retirement funding.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Current age · Retirement age · Current assets · Monthly savings|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Retirement gap → Projected assets → Income plan|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--retirement-calculator--_slug_.png) · [Mobile](mobile/tools--retirement-calculator--_slug_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/salary-calculator

**Take-home pay** · calculator · member-or-public

Estimate deductions and monthly take-home income.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Annual salary · Dependants · Non-taxable pay · Tax year|
|Record columns|Item · Annual amount · Monthly amount|
|Sections|Net monthly pay → Deductions → Annual summary|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--salary-calculator.png) · [Mobile](mobile/tools--salary-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/salary-calculator/[preset]

**Take-home pay** · calculator · member-or-public

Estimate deductions and monthly take-home income.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Annual salary · Dependants · Non-taxable pay · Tax year|
|Record columns|Item · Annual amount · Monthly amount|
|Sections|Saved scenario → Net monthly pay → Deductions → Annual summary|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--salary-calculator--_preset_.png) · [Mobile](mobile/tools--salary-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/stock-calculator

**Trade outcome** · calculator · member-or-public

Estimate a hypothetical trade including fees.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Buy price · Sell price · Quantity · Fees|
|Record columns|Metric · Buy assumption · Sell assumption · Outcome|
|Sections|Profit or loss → Break-even price → Fee breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--stock-calculator.png) · [Mobile](mobile/tools--stock-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/stock-calculator/[preset]

**Trade outcome** · calculator · member-or-public

Estimate a hypothetical trade including fees.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Buy price · Sell price · Quantity · Fees|
|Record columns|Metric · Buy assumption · Sell assumption · Outcome|
|Sections|Saved scenario → Profit or loss → Break-even price → Fee breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--stock-calculator--_preset_.png) · [Mobile](mobile/tools--stock-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/tax-calculator

**Tax estimate** · calculator · member-or-public

Review an income scenario and its calculation assumptions.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Taxable income · Tax year · Deductions · Income category|
|Record columns|Bracket · Taxable base · Rate · Estimated tax|
|Sections|Estimated tax → Effective rate → Bracket breakdown|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--tax-calculator.png) · [Mobile](mobile/tools--tax-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/youth-leap-calculator

**Youth savings** · calculator · member-or-public

Review a contribution plan, eligibility and expected maturity.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Monthly contribution · Term months · Annual rate · Income band|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Maturity projection → Contribution breakdown → Eligibility|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/tools--youth-leap-calculator.png) · [Mobile](mobile/tools--youth-leap-calculator.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /tools/youth-leap-calculator/[preset]

**Youth savings** · calculator · member-or-public

Review a contribution plan, eligibility and expected maturity.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Monthly contribution · Term months · Annual rate · Income band|
|Record columns|Year · Contributions · Returns · Total|
|Sections|Saved scenario → Maturity projection → Contribution breakdown → Eligibility|
|Actions|Calculate estimate → Reset inputs|
|Navigation|tools|
|Alias behavior|Editable saved scenario; show selected assumptions|
|Desktop / mobile|[PC](desktop/tools--youth-leap-calculator--_preset_.png) · [Mobile](mobile/tools--youth-leap-calculator--_preset_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /treasury

**Public treasury** · treasury · member-or-public

Follow public allocations and published expenditure.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Fund · Period|
|Record columns|Fund · Allocated · Spent · Available|
|Sections|Fund allocation → Spending history → Public reports|
|Actions|Open spending record → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/treasury.png) · [Mobile](mobile/treasury.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /verify-email

**Verify your email** · auth · member-or-public

Confirm the address associated with your account.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Verification code|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Verify email → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/verify-email.png) · [Mobile](mobile/verify-email.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /verify-email-change

**Confirm email change** · auth · member-or-public

Review the new address before confirming this change.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Verification code|
|Record columns|Content-led layout; no record table|
|Sections|Account verification → Provider sign-in → Help|
|Actions|Confirm email change → Get help|
|Navigation|account|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/verify-email-change.png) · [Mobile](mobile/verify-email-change.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /wallet

**My wallet** · wallet · member-or-public

See available funds and review every movement.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Transaction · Direction · Amount · Status|
|Sections|Available balance → Send money → Recent transactions|
|Actions|Send money → View all activity|
|Navigation|wallet|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/wallet.png) · [Mobile](mobile/wallet.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /wallet/activity

**Wallet activity** · ledger · member-or-public

Search your wallet history and open a verifiable receipt.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Search transactions · Transaction type · Date range|
|Record columns|Transaction · Type · Amount · Time|
|Sections|Transaction history → Statement summary|
|Actions|Export statement → Open receipt|
|Navigation|wallet|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/wallet--activity.png) · [Mobile](mobile/wallet--activity.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /wallet/activity/transactions/[transactionId]

**Transaction receipt** · receipt · member-or-public

A clear record of the movement, fees and outcome.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|No primary form|
|Record columns|Transaction ID · Status · Amount · Fee · From · To · Timestamp|
|Sections|Receipt details → Ledger reference → Related activity|
|Actions|Copy reference → Back to activity|
|Navigation|wallet|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/wallet--activity--transactions--_transactionId_.png) · [Mobile](mobile/wallet--activity--transactions--_transactionId_.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.

### /work

**Work board** · work · member-or-public

Choose a task, complete it and track verification.

|Aspect|Proposed contract|
|---|---|
|Inputs / filters|Job category · Difficulty · Availability|
|Record columns|Item · Requirement · Reward · State|
|Sections|Available tasks → My assignments → Reward history|
|Actions|Open task → View history|
|Navigation|explore|
|Alias behavior|Primary route|
|Desktop / mobile|[PC](desktop/work.png) · [Mobile](mobile/work.png)|

Desktop keeps a compact title, clear primary action and aligned content. Mobile preserves required inputs/results and action hierarchy; records become labeled cards where necessary. Verify real dynamic IDs, pagination, validation, role refusal and exact server field mapping before implementation acceptance.
