> **ARCHIVED / 역사 자료 ONLY — v2026.11.28.2027.1.** All visual content below is superseded; no implementation or acceptance use. [New frontend rebuild authority](../../planning/FRONTEND_REBUILD_MASTER_v2026.11.28.2027.1.md).

# Moneyverse · 180-page UI/UX proposal

Status: **PROPOSED · DESIGN ARTIFACTS ONLY**. This collection does not replace the approved Nov23 v10 baseline and is not a running frontend release.

180 route entries, including40administrator entries, have paired1440px desktop and390px mobile screenshots (360primary images). The same visual system is checked at320/390/768/1100/1440px. Preset and locale route aliases intentionally share their parent workflow;180routes does not mean180unrelated layouts.

Navy/violet identity, the actual repository favicon, readable finance tables, focused forms, consistent navigation, and mobile task parity are the design direction. The requested skills informed composition, typography, responsive layout and verification; they do not replace owner visual approval.

**All displayed accounts, prices, balances, charts and conversations are synthetic design data.** Buttons are visual specifications; there are no working login, admin or money operations in these offline artifacts. Existing backend contracts must be mapped and tested during subsequent implementation. No endpoint, credential, session or production balance was used.

## Start here

![Desktop home](desktop/home.png)

[Home mobile](mobile/home.png) · [Administrator shop](desktop/admin--shop.png) · [Bank](desktop/bank.png) · [Stock detail](desktop/stocks--_symbol_.png) · [Photo submission](desktop/gallery--submit.png)

- [Per-route screen and interaction contracts](ROUTE_SPECIFICATIONS.md)
- [Korean review guide](README.ko.md)
- [Partial locale copy and limitations](LOCALIZATION_COPY.md)
- [QA evidence](../../qa/2026-11-24-ui-ux-180-design-browser.json)
- [Work log](../../worklog/2026-11-24-ui-ux-180-page-design.md)

## Route gallery

|Route|Family|Desktop|Mobile|
|---|---|---|---|
|/|home|[PC](desktop/home.png)|[Mobile](mobile/home.png)|
|/[locale]/blog|editorial|[PC](desktop/_locale_--blog.png)|[Mobile](mobile/_locale_--blog.png)|
|/[locale]/blog/[slug]|article|[PC](desktop/_locale_--blog--_slug_.png)|[Mobile](mobile/_locale_--blog--_slug_.png)|
|/[locale]/guide/glossary|guide|[PC](desktop/_locale_--guide--glossary.png)|[Mobile](mobile/_locale_--guide--glossary.png)|
|/[locale]/guide/glossary/[term]|glossary-term|[PC](desktop/_locale_--guide--glossary--_term_.png)|[Mobile](mobile/_locale_--guide--glossary--_term_.png)|
|/[locale]/tools/compound-interest-calculator|calculator|[PC](desktop/_locale_--tools--compound-interest-calculator.png)|[Mobile](mobile/_locale_--tools--compound-interest-calculator.png)|
|/[locale]/tools/compound-interest-calculator/[preset]|calculator|[PC](desktop/_locale_--tools--compound-interest-calculator--_preset_.png)|[Mobile](mobile/_locale_--tools--compound-interest-calculator--_preset_.png)|
|/account|account|[PC](desktop/account.png)|[Mobile](mobile/account.png)|
|/account-deletion|legal-action|[PC](desktop/account-deletion.png)|[Mobile](mobile/account-deletion.png)|
|/account/notifications|notifications|[PC](desktop/account--notifications.png)|[Mobile](mobile/account--notifications.png)|
|/account/privacy|privacy-settings|[PC](desktop/account--privacy.png)|[Mobile](mobile/account--privacy.png)|
|/account/security|security|[PC](desktop/account--security.png)|[Mobile](mobile/account--security.png)|
|/admin|admin|[PC](desktop/admin.png)|[Mobile](mobile/admin.png)|
|/admin/analytics|admin|[PC](desktop/admin--analytics.png)|[Mobile](mobile/admin--analytics.png)|
|/admin/api-health|admin|[PC](desktop/admin--api-health.png)|[Mobile](mobile/admin--api-health.png)|
|/admin/bank|admin|[PC](desktop/admin--bank.png)|[Mobile](mobile/admin--bank.png)|
|/admin/blog|admin|[PC](desktop/admin--blog.png)|[Mobile](mobile/admin--blog.png)|
|/admin/bonds|admin|[PC](desktop/admin--bonds.png)|[Mobile](mobile/admin--bonds.png)|
|/admin/catalog|admin|[PC](desktop/admin--catalog.png)|[Mobile](mobile/admin--catalog.png)|
|/admin/central-bank|admin|[PC](desktop/admin--central-bank.png)|[Mobile](mobile/admin--central-bank.png)|
|/admin/content|admin|[PC](desktop/admin--content.png)|[Mobile](mobile/admin--content.png)|
|/admin/controls|admin|[PC](desktop/admin--controls.png)|[Mobile](mobile/admin--controls.png)|
|/admin/discord|admin|[PC](desktop/admin--discord.png)|[Mobile](mobile/admin--discord.png)|
|/admin/economy|admin|[PC](desktop/admin--economy.png)|[Mobile](mobile/admin--economy.png)|
|/admin/economy/scenario-lab|admin|[PC](desktop/admin--economy--scenario-lab.png)|[Mobile](mobile/admin--economy--scenario-lab.png)|
|/admin/enterprises|admin|[PC](desktop/admin--enterprises.png)|[Mobile](mobile/admin--enterprises.png)|
|/admin/fx|admin|[PC](desktop/admin--fx.png)|[Mobile](mobile/admin--fx.png)|
|/admin/help|admin|[PC](desktop/admin--help.png)|[Mobile](mobile/admin--help.png)|
|/admin/kdic|admin|[PC](desktop/admin--kdic.png)|[Mobile](mobile/admin--kdic.png)|
|/admin/logs|admin|[PC](desktop/admin--logs.png)|[Mobile](mobile/admin--logs.png)|
|/admin/logs/activity|admin|[PC](desktop/admin--logs--activity.png)|[Mobile](mobile/admin--logs--activity.png)|
|/admin/logs/delivery|admin|[PC](desktop/admin--logs--delivery.png)|[Mobile](mobile/admin--logs--delivery.png)|
|/admin/logs/errors|admin|[PC](desktop/admin--logs--errors.png)|[Mobile](mobile/admin--logs--errors.png)|
|/admin/logs/integrity|admin|[PC](desktop/admin--logs--integrity.png)|[Mobile](mobile/admin--logs--integrity.png)|
|/admin/logs/system|admin|[PC](desktop/admin--logs--system.png)|[Mobile](mobile/admin--logs--system.png)|
|/admin/market|admin|[PC](desktop/admin--market.png)|[Mobile](mobile/admin--market.png)|
|/admin/market/ai-news|admin|[PC](desktop/admin--market--ai-news.png)|[Mobile](mobile/admin--market--ai-news.png)|
|/admin/mint|admin|[PC](desktop/admin--mint.png)|[Mobile](mobile/admin--mint.png)|
|/admin/money-flow|admin|[PC](desktop/admin--money-flow.png)|[Mobile](mobile/admin--money-flow.png)|
|/admin/operations/storage|admin|[PC](desktop/admin--operations--storage.png)|[Mobile](mobile/admin--operations--storage.png)|
|/admin/pension|admin|[PC](desktop/admin--pension.png)|[Mobile](mobile/admin--pension.png)|
|/admin/safety|admin|[PC](desktop/admin--safety.png)|[Mobile](mobile/admin--safety.png)|
|/admin/security|admin|[PC](desktop/admin--security.png)|[Mobile](mobile/admin--security.png)|
|/admin/seo|admin|[PC](desktop/admin--seo.png)|[Mobile](mobile/admin--seo.png)|
|/admin/seo-audit|admin|[PC](desktop/admin--seo-audit.png)|[Mobile](mobile/admin--seo-audit.png)|
|/admin/shop|admin|[PC](desktop/admin--shop.png)|[Mobile](mobile/admin--shop.png)|
|/admin/support|admin|[PC](desktop/admin--support.png)|[Mobile](mobile/admin--support.png)|
|/admin/treasury|admin|[PC](desktop/admin--treasury.png)|[Mobile](mobile/admin--treasury.png)|
|/admin/treasury/grants|admin|[PC](desktop/admin--treasury--grants.png)|[Mobile](mobile/admin--treasury--grants.png)|
|/admin/users|admin|[PC](desktop/admin--users.png)|[Mobile](mobile/admin--users.png)|
|/admin/users/[id]|admin|[PC](desktop/admin--users--_id_.png)|[Mobile](mobile/admin--users--_id_.png)|
|/admin/work|admin|[PC](desktop/admin--work.png)|[Mobile](mobile/admin--work.png)|
|/advisor|plan|[PC](desktop/advisor.png)|[Mobile](mobile/advisor.png)|
|/announcements|feed|[PC](desktop/announcements.png)|[Mobile](mobile/announcements.png)|
|/announcements/[announcementId]|article|[PC](desktop/announcements--_announcementId_.png)|[Mobile](mobile/announcements--_announcementId_.png)|
|/arcade|arcade|[PC](desktop/arcade.png)|[Mobile](mobile/arcade.png)|
|/bank|bank|[PC](desktop/bank.png)|[Mobile](mobile/bank.png)|
|/bank/savings-pot|savings|[PC](desktop/bank--savings-pot.png)|[Mobile](mobile/bank--savings-pot.png)|
|/blog|editorial|[PC](desktop/blog.png)|[Mobile](mobile/blog.png)|
|/blog/[slug]|article|[PC](desktop/blog--_slug_.png)|[Mobile](mobile/blog--_slug_.png)|
|/board|board|[PC](desktop/board.png)|[Mobile](mobile/board.png)|
|/board/[postId]|article|[PC](desktop/board--_postId_.png)|[Mobile](mobile/board--_postId_.png)|
|/bonds|bonds|[PC](desktop/bonds.png)|[Mobile](mobile/bonds.png)|
|/businesses|business|[PC](desktop/businesses.png)|[Mobile](mobile/businesses.png)|
|/businesses/ventures|ventures|[PC](desktop/businesses--ventures.png)|[Mobile](mobile/businesses--ventures.png)|
|/calculators|tools|[PC](desktop/calculators.png)|[Mobile](mobile/calculators.png)|
|/calendar|calendar|[PC](desktop/calendar.png)|[Mobile](mobile/calendar.png)|
|/casino|casino|[PC](desktop/casino.png)|[Mobile](mobile/casino.png)|
|/central-bank|policy|[PC](desktop/central-bank.png)|[Mobile](mobile/central-bank.png)|
|/chat|chat|[PC](desktop/chat.png)|[Mobile](mobile/chat.png)|
|/clubs|clubs|[PC](desktop/clubs.png)|[Mobile](mobile/clubs.png)|
|/clubs/[clubId]|club|[PC](desktop/clubs--_clubId_.png)|[Mobile](mobile/clubs--_clubId_.png)|
|/clubs/[clubId]/members|members|[PC](desktop/clubs--_clubId_--members.png)|[Mobile](mobile/clubs--_clubId_--members.png)|
|/clubs/new|club-create|[PC](desktop/clubs--new.png)|[Mobile](mobile/clubs--new.png)|
|/clubs/warfare|competition|[PC](desktop/clubs--warfare.png)|[Mobile](mobile/clubs--warfare.png)|
|/collections|collections|[PC](desktop/collections.png)|[Mobile](mobile/collections.png)|
|/dashboard|dashboard|[PC](desktop/dashboard.png)|[Mobile](mobile/dashboard.png)|
|/data-deletion|legal-action|[PC](desktop/data-deletion.png)|[Mobile](mobile/data-deletion.png)|
|/design-preview|design-system|[PC](desktop/design-preview.png)|[Mobile](mobile/design-preview.png)|
|/developer|developer|[PC](desktop/developer.png)|[Mobile](mobile/developer.png)|
|/enterprises|enterprise|[PC](desktop/enterprises.png)|[Mobile](mobile/enterprises.png)|
|/features|features|[PC](desktop/features.png)|[Mobile](mobile/features.png)|
|/forgot-password|auth|[PC](desktop/forgot-password.png)|[Mobile](mobile/forgot-password.png)|
|/fx|exchange|[PC](desktop/fx.png)|[Mobile](mobile/fx.png)|
|/gallery|gallery|[PC](desktop/gallery.png)|[Mobile](mobile/gallery.png)|
|/gallery/[photoId]|photo|[PC](desktop/gallery--_photoId_.png)|[Mobile](mobile/gallery--_photoId_.png)|
|/gallery/submit|upload|[PC](desktop/gallery--submit.png)|[Mobile](mobile/gallery--submit.png)|
|/guide|guide|[PC](desktop/guide.png)|[Mobile](mobile/guide.png)|
|/guide/career-mastery|guide|[PC](desktop/guide--career-mastery.png)|[Mobile](mobile/guide--career-mastery.png)|
|/guide/dopamine-system|guide|[PC](desktop/guide--dopamine-system.png)|[Mobile](mobile/guide--dopamine-system.png)|
|/guide/glossary|guide|[PC](desktop/guide--glossary.png)|[Mobile](mobile/guide--glossary.png)|
|/guide/glossary/[term]|glossary-term|[PC](desktop/guide--glossary--_term_.png)|[Mobile](mobile/guide--glossary--_term_.png)|
|/guide/stock-trading|guide|[PC](desktop/guide--stock-trading.png)|[Mobile](mobile/guide--stock-trading.png)|
|/guide/virtual-banking|guide|[PC](desktop/guide--virtual-banking.png)|[Mobile](mobile/guide--virtual-banking.png)|
|/help|help|[PC](desktop/help.png)|[Mobile](mobile/help.png)|
|/help/[slug]|article|[PC](desktop/help--_slug_.png)|[Mobile](mobile/help--_slug_.png)|
|/inventory|inventory|[PC](desktop/inventory.png)|[Mobile](mobile/inventory.png)|
|/invite/[code]|invitation|[PC](desktop/invite--_code_.png)|[Mobile](mobile/invite--_code_.png)|
|/kdic|coverage|[PC](desktop/kdic.png)|[Mobile](mobile/kdic.png)|
|/lobby|chat|[PC](desktop/lobby.png)|[Mobile](mobile/lobby.png)|
|/login|auth|[PC](desktop/login.png)|[Mobile](mobile/login.png)|
|/login/providers|auth|[PC](desktop/login--providers.png)|[Mobile](mobile/login--providers.png)|
|/marketplace|marketplace|[PC](desktop/marketplace.png)|[Mobile](mobile/marketplace.png)|
|/marketplace/auction|auction|[PC](desktop/marketplace--auction.png)|[Mobile](mobile/marketplace--auction.png)|
|/mint|issuance|[PC](desktop/mint.png)|[Mobile](mobile/mint.png)|
|/newspaper|newspaper|[PC](desktop/newspaper.png)|[Mobile](mobile/newspaper.png)|
|/pension|pension|[PC](desktop/pension.png)|[Mobile](mobile/pension.png)|
|/prediction|prediction|[PC](desktop/prediction.png)|[Mobile](mobile/prediction.png)|
|/privacy|legal|[PC](desktop/privacy.png)|[Mobile](mobile/privacy.png)|
|/profile|profile|[PC](desktop/profile.png)|[Mobile](mobile/profile.png)|
|/profile/[userId]|profile-public|[PC](desktop/profile--_userId_.png)|[Mobile](mobile/profile--_userId_.png)|
|/profile/settings|profile-edit|[PC](desktop/profile--settings.png)|[Mobile](mobile/profile--settings.png)|
|/progression|progression|[PC](desktop/progression.png)|[Mobile](mobile/progression.png)|
|/progression/prestige|prestige|[PC](desktop/progression--prestige.png)|[Mobile](mobile/progression--prestige.png)|
|/quests|quests|[PC](desktop/quests.png)|[Mobile](mobile/quests.png)|
|/register|auth|[PC](desktop/register.png)|[Mobile](mobile/register.png)|
|/reset-password|auth|[PC](desktop/reset-password.png)|[Mobile](mobile/reset-password.png)|
|/roadmap|roadmap|[PC](desktop/roadmap.png)|[Mobile](mobile/roadmap.png)|
|/safety|legal|[PC](desktop/safety.png)|[Mobile](mobile/safety.png)|
|/safety/takedown|legal-action|[PC](desktop/safety--takedown.png)|[Mobile](mobile/safety--takedown.png)|
|/search|search|[PC](desktop/search.png)|[Mobile](mobile/search.png)|
|/seasons|seasons|[PC](desktop/seasons.png)|[Mobile](mobile/seasons.png)|
|/shop|shop|[PC](desktop/shop.png)|[Mobile](mobile/shop.png)|
|/shop/catalog|shop|[PC](desktop/shop--catalog.png)|[Mobile](mobile/shop--catalog.png)|
|/spaces|space|[PC](desktop/spaces.png)|[Mobile](mobile/spaces.png)|
|/spaces/real-estate|property|[PC](desktop/spaces--real-estate.png)|[Mobile](mobile/spaces--real-estate.png)|
|/status|status|[PC](desktop/status.png)|[Mobile](mobile/status.png)|
|/stocks|market|[PC](desktop/stocks.png)|[Mobile](mobile/stocks.png)|
|/stocks/[symbol]|stock|[PC](desktop/stocks--_symbol_.png)|[Mobile](mobile/stocks--_symbol_.png)|
|/stocks/alerts|alerts|[PC](desktop/stocks--alerts.png)|[Mobile](mobile/stocks--alerts.png)|
|/stocks/community|discussion|[PC](desktop/stocks--community.png)|[Mobile](mobile/stocks--community.png)|
|/stocks/compare|compare|[PC](desktop/stocks--compare.png)|[Mobile](mobile/stocks--compare.png)|
|/stocks/derivatives|derivatives|[PC](desktop/stocks--derivatives.png)|[Mobile](mobile/stocks--derivatives.png)|
|/stocks/history|ledger|[PC](desktop/stocks--history.png)|[Mobile](mobile/stocks--history.png)|
|/stocks/league|leaderboard|[PC](desktop/stocks--league.png)|[Mobile](mobile/stocks--league.png)|
|/stocks/portfolio|portfolio|[PC](desktop/stocks--portfolio.png)|[Mobile](mobile/stocks--portfolio.png)|
|/stocks/watchlist|watchlist|[PC](desktop/stocks--watchlist.png)|[Mobile](mobile/stocks--watchlist.png)|
|/support|chat|[PC](desktop/support.png)|[Mobile](mobile/support.png)|
|/terms|legal|[PC](desktop/terms.png)|[Mobile](mobile/terms.png)|
|/tools|tools|[PC](desktop/tools.png)|[Mobile](mobile/tools.png)|
|/tools/capital-gains-tax-calculator|calculator|[PC](desktop/tools--capital-gains-tax-calculator.png)|[Mobile](mobile/tools--capital-gains-tax-calculator.png)|
|/tools/capital-gains-tax-calculator/[preset]|calculator|[PC](desktop/tools--capital-gains-tax-calculator--_preset_.png)|[Mobile](mobile/tools--capital-gains-tax-calculator--_preset_.png)|
|/tools/compound-calculator|calculator|[PC](desktop/tools--compound-calculator.png)|[Mobile](mobile/tools--compound-calculator.png)|
|/tools/compound-calculator/[preset]|calculator|[PC](desktop/tools--compound-calculator--_preset_.png)|[Mobile](mobile/tools--compound-calculator--_preset_.png)|
|/tools/crypto-apy-calculator|calculator|[PC](desktop/tools--crypto-apy-calculator.png)|[Mobile](mobile/tools--crypto-apy-calculator.png)|
|/tools/dividend-tax-calculator|calculator|[PC](desktop/tools--dividend-tax-calculator.png)|[Mobile](mobile/tools--dividend-tax-calculator.png)|
|/tools/dividend-tax-calculator/[ticker]|calculator|[PC](desktop/tools--dividend-tax-calculator--_ticker_.png)|[Mobile](mobile/tools--dividend-tax-calculator--_ticker_.png)|
|/tools/farming-calculator|calculator|[PC](desktop/tools--farming-calculator.png)|[Mobile](mobile/tools--farming-calculator.png)|
|/tools/farming-calculator/[preset]|calculator|[PC](desktop/tools--farming-calculator--_preset_.png)|[Mobile](mobile/tools--farming-calculator--_preset_.png)|
|/tools/fire-calculator|calculator|[PC](desktop/tools--fire-calculator.png)|[Mobile](mobile/tools--fire-calculator.png)|
|/tools/gift-tax-calculator|calculator|[PC](desktop/tools--gift-tax-calculator.png)|[Mobile](mobile/tools--gift-tax-calculator.png)|
|/tools/gift-tax-calculator/[preset]|calculator|[PC](desktop/tools--gift-tax-calculator--_preset_.png)|[Mobile](mobile/tools--gift-tax-calculator--_preset_.png)|
|/tools/goal-wealth-calculator|calculator|[PC](desktop/tools--goal-wealth-calculator.png)|[Mobile](mobile/tools--goal-wealth-calculator.png)|
|/tools/isa-calculator|calculator|[PC](desktop/tools--isa-calculator.png)|[Mobile](mobile/tools--isa-calculator.png)|
|/tools/isa-calculator/[slug]|calculator|[PC](desktop/tools--isa-calculator--_slug_.png)|[Mobile](mobile/tools--isa-calculator--_slug_.png)|
|/tools/kimchi-premium-calculator|calculator|[PC](desktop/tools--kimchi-premium-calculator.png)|[Mobile](mobile/tools--kimchi-premium-calculator.png)|
|/tools/kimchi-premium-calculator/[preset]|calculator|[PC](desktop/tools--kimchi-premium-calculator--_preset_.png)|[Mobile](mobile/tools--kimchi-premium-calculator--_preset_.png)|
|/tools/loan-interest-calculator|calculator|[PC](desktop/tools--loan-interest-calculator.png)|[Mobile](mobile/tools--loan-interest-calculator.png)|
|/tools/loan-interest-calculator/[preset]|calculator|[PC](desktop/tools--loan-interest-calculator--_preset_.png)|[Mobile](mobile/tools--loan-interest-calculator--_preset_.png)|
|/tools/pension-tax-calculator|calculator|[PC](desktop/tools--pension-tax-calculator.png)|[Mobile](mobile/tools--pension-tax-calculator.png)|
|/tools/pension-tax-calculator/[slug]|calculator|[PC](desktop/tools--pension-tax-calculator--_slug_.png)|[Mobile](mobile/tools--pension-tax-calculator--_slug_.png)|
|/tools/quant-studio|quant|[PC](desktop/tools--quant-studio.png)|[Mobile](mobile/tools--quant-studio.png)|
|/tools/real-estate-calculator|calculator|[PC](desktop/tools--real-estate-calculator.png)|[Mobile](mobile/tools--real-estate-calculator.png)|
|/tools/real-estate-calculator/[preset]|calculator|[PC](desktop/tools--real-estate-calculator--_preset_.png)|[Mobile](mobile/tools--real-estate-calculator--_preset_.png)|
|/tools/retirement-calculator|calculator|[PC](desktop/tools--retirement-calculator.png)|[Mobile](mobile/tools--retirement-calculator.png)|
|/tools/retirement-calculator/[slug]|calculator|[PC](desktop/tools--retirement-calculator--_slug_.png)|[Mobile](mobile/tools--retirement-calculator--_slug_.png)|
|/tools/salary-calculator|calculator|[PC](desktop/tools--salary-calculator.png)|[Mobile](mobile/tools--salary-calculator.png)|
|/tools/salary-calculator/[preset]|calculator|[PC](desktop/tools--salary-calculator--_preset_.png)|[Mobile](mobile/tools--salary-calculator--_preset_.png)|
|/tools/stock-calculator|calculator|[PC](desktop/tools--stock-calculator.png)|[Mobile](mobile/tools--stock-calculator.png)|
|/tools/stock-calculator/[preset]|calculator|[PC](desktop/tools--stock-calculator--_preset_.png)|[Mobile](mobile/tools--stock-calculator--_preset_.png)|
|/tools/tax-calculator|calculator|[PC](desktop/tools--tax-calculator.png)|[Mobile](mobile/tools--tax-calculator.png)|
|/tools/youth-leap-calculator|calculator|[PC](desktop/tools--youth-leap-calculator.png)|[Mobile](mobile/tools--youth-leap-calculator.png)|
|/tools/youth-leap-calculator/[preset]|calculator|[PC](desktop/tools--youth-leap-calculator--_preset_.png)|[Mobile](mobile/tools--youth-leap-calculator--_preset_.png)|
|/treasury|treasury|[PC](desktop/treasury.png)|[Mobile](mobile/treasury.png)|
|/verify-email|auth|[PC](desktop/verify-email.png)|[Mobile](mobile/verify-email.png)|
|/verify-email-change|auth|[PC](desktop/verify-email-change.png)|[Mobile](mobile/verify-email-change.png)|
|/wallet|wallet|[PC](desktop/wallet.png)|[Mobile](mobile/wallet.png)|
|/wallet/activity|ledger|[PC](desktop/wallet--activity.png)|[Mobile](mobile/wallet--activity.png)|
|/wallet/activity/transactions/[transactionId]|receipt|[PC](desktop/wallet--activity--transactions--_transactionId_.png)|[Mobile](mobile/wallet--activity--transactions--_transactionId_.png)|
|/work|work|[PC](desktop/work.png)|[Mobile](mobile/work.png)|

## Acceptance limits

900ready-layout checks cover overflow, touch target dimensions, unique IDs, labels, page errors and unintended network attempts.169additional cases cover seven route families in eight non-ready states, shared chrome locale expansion on three routes, and long numeric-string resilience. Only shared labels are translated; full route-copy translation remains open. Automated dimensions and contact-sheet review do not prove backend function, complete screen-reader compliance or owner design acceptance.

No application code, workflow, runtime process, database or infrastructure has been changed by this PR. No Test/Production deployment was performed. The branch remains a review candidate.
