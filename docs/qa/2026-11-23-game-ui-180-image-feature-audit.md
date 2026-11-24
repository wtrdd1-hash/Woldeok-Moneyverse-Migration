# 180-route visual and feature source QA — v2026.11.23.10

## Findings and fixes
- Blog article detail wrongly displayed generic cards; revised v10 includes body, metadata, TOC, related entries and comments.
- 180 generic-card candidates in v8 were regenerated with route-aware finance/bank/transaction, social/article, authentication, admin, game, legal, account and tool structures. Overlarge hero orbit reduced. Final human visual review OPEN.
- 180/180 new PNGs decode at 1660x990, all SHA hashes distinct, all content areas changed from v8, original favicon pixel matches at three locations on every image; automated file check 0 errors.

## Functional verification boundary
- 180/180 Next page source candidates match design route inventory. Only 33/180 exact Spring HTML routes identified lexically (not proof of absence for others).
- Native Node source tests 347/347 PASS. Lexical inventory: 206 forms, 1146 handlers, 509 API URL references. None prove E2E acceptance.
- Localhost GET returned HTML 200 on root and blog test slug, JSON 200 for game clock (600 sec/day, 7 day/week), and login redirects for unauthenticated bank/admin. Blog test slug title appeared as home dashboard: investigate route response. Normal backend/frontend units inactive though other Test/proxies responded; deployed SHA/Host and authenticated user acceptance unverified.
- Full 180-route login/RBAC/finance-ledger/quest rewards/5-language/mobile browser and independent Test/Production QA **NOT VERIFIED**.

| Route | Latest PNG | Spring exact mapping | State |
| --- | --- | --- | --- |
| / | [PNG](../design/game-ui-v2026.11.23.10/previews/home.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/blog | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--blog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/blog/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--blog--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/guide/glossary | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/guide/glossary/[term] | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary--term-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/tools/compound-interest-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/tools/compound-interest-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account | [PNG](../design/game-ui-v2026.11.23.10/previews/account.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account-deletion | [PNG](../design/game-ui-v2026.11.23.10/previews/account-deletion.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account/notifications | [PNG](../design/game-ui-v2026.11.23.10/previews/account-notifications.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account/privacy | [PNG](../design/game-ui-v2026.11.23.10/previews/account-privacy.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account/security | [PNG](../design/game-ui-v2026.11.23.10/previews/account-security.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin | [PNG](../design/game-ui-v2026.11.23.10/previews/admin.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/analytics | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-analytics.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/api-health | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-api-health.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/bank | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/blog | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-blog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/bonds | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-bonds.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/catalog | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-catalog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/central-bank | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-central-bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/content | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-content.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/controls | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-controls.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/discord | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-discord.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/economy | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-economy.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/economy/scenario-lab | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-economy-scenario-lab.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/enterprises | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-enterprises.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/fx | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-fx.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/help | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-help.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/kdic | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-kdic.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/activity | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-activity.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/delivery | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-delivery.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/errors | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-errors.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/integrity | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-integrity.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/system | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-system.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/market | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-market.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/market/ai-news | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-market-ai-news.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/mint | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-mint.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/money-flow | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-money-flow.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/operations/storage | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-operations-storage.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/pension | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-pension.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/safety | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-safety.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/security | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-security.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/seo | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-seo.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/seo-audit | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-seo-audit.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/shop | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-shop.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/support | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-support.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/treasury | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-treasury.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/treasury/grants | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-treasury-grants.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/users | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-users.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/users/[id] | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-users--id-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/work | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-work.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /advisor | [PNG](../design/game-ui-v2026.11.23.10/previews/advisor.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /announcements | [PNG](../design/game-ui-v2026.11.23.10/previews/announcements.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /announcements/[announcementId] | [PNG](../design/game-ui-v2026.11.23.10/previews/announcements--announcementId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /arcade | [PNG](../design/game-ui-v2026.11.23.10/previews/arcade.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /bank | [PNG](../design/game-ui-v2026.11.23.10/previews/bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /bank/savings-pot | [PNG](../design/game-ui-v2026.11.23.10/previews/bank-savings-pot.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /blog | [PNG](../design/game-ui-v2026.11.23.10/previews/blog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /blog/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/blog--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /board | [PNG](../design/game-ui-v2026.11.23.10/previews/board.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /board/[postId] | [PNG](../design/game-ui-v2026.11.23.10/previews/board--postId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /bonds | [PNG](../design/game-ui-v2026.11.23.10/previews/bonds.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /businesses | [PNG](../design/game-ui-v2026.11.23.10/previews/businesses.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /businesses/ventures | [PNG](../design/game-ui-v2026.11.23.10/previews/businesses-ventures.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /calculators | [PNG](../design/game-ui-v2026.11.23.10/previews/calculators.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /calendar | [PNG](../design/game-ui-v2026.11.23.10/previews/calendar.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /casino | [PNG](../design/game-ui-v2026.11.23.10/previews/casino.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /central-bank | [PNG](../design/game-ui-v2026.11.23.10/previews/central-bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /chat | [PNG](../design/game-ui-v2026.11.23.10/previews/chat.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/[clubId] | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs--clubId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/[clubId]/members | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs--clubId--members.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/new | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs-new.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/warfare | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs-warfare.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /collections | [PNG](../design/game-ui-v2026.11.23.10/previews/collections.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /dashboard | [PNG](../design/game-ui-v2026.11.23.10/previews/dashboard.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /data-deletion | [PNG](../design/game-ui-v2026.11.23.10/previews/data-deletion.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /design-preview | [PNG](../design/game-ui-v2026.11.23.10/previews/design-preview.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /developer | [PNG](../design/game-ui-v2026.11.23.10/previews/developer.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /enterprises | [PNG](../design/game-ui-v2026.11.23.10/previews/enterprises.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /features | [PNG](../design/game-ui-v2026.11.23.10/previews/features.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /forgot-password | [PNG](../design/game-ui-v2026.11.23.10/previews/forgot-password.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /fx | [PNG](../design/game-ui-v2026.11.23.10/previews/fx.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /gallery | [PNG](../design/game-ui-v2026.11.23.10/previews/gallery.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /gallery/[photoId] | [PNG](../design/game-ui-v2026.11.23.10/previews/gallery--photoId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /gallery/submit | [PNG](../design/game-ui-v2026.11.23.10/previews/gallery-submit.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide | [PNG](../design/game-ui-v2026.11.23.10/previews/guide.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/career-mastery | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-career-mastery.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/dopamine-system | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-dopamine-system.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/glossary | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-glossary.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/glossary/[term] | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-glossary--term-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/stock-trading | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-stock-trading.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/virtual-banking | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-virtual-banking.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /help | [PNG](../design/game-ui-v2026.11.23.10/previews/help.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /help/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/help--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /inventory | [PNG](../design/game-ui-v2026.11.23.10/previews/inventory.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /invite/[code] | [PNG](../design/game-ui-v2026.11.23.10/previews/invite--code-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /kdic | [PNG](../design/game-ui-v2026.11.23.10/previews/kdic.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /lobby | [PNG](../design/game-ui-v2026.11.23.10/previews/lobby.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /login | [PNG](../design/game-ui-v2026.11.23.10/previews/login.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /login/providers | [PNG](../design/game-ui-v2026.11.23.10/previews/login-providers.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /marketplace | [PNG](../design/game-ui-v2026.11.23.10/previews/marketplace.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /marketplace/auction | [PNG](../design/game-ui-v2026.11.23.10/previews/marketplace-auction.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /mint | [PNG](../design/game-ui-v2026.11.23.10/previews/mint.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /newspaper | [PNG](../design/game-ui-v2026.11.23.10/previews/newspaper.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /pension | [PNG](../design/game-ui-v2026.11.23.10/previews/pension.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /prediction | [PNG](../design/game-ui-v2026.11.23.10/previews/prediction.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /privacy | [PNG](../design/game-ui-v2026.11.23.10/previews/privacy.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /profile | [PNG](../design/game-ui-v2026.11.23.10/previews/profile.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /profile/[userId] | [PNG](../design/game-ui-v2026.11.23.10/previews/profile--userId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /profile/settings | [PNG](../design/game-ui-v2026.11.23.10/previews/profile-settings.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /progression | [PNG](../design/game-ui-v2026.11.23.10/previews/progression.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /progression/prestige | [PNG](../design/game-ui-v2026.11.23.10/previews/progression-prestige.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /quests | [PNG](../design/game-ui-v2026.11.23.10/previews/quests.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /register | [PNG](../design/game-ui-v2026.11.23.10/previews/register.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /reset-password | [PNG](../design/game-ui-v2026.11.23.10/previews/reset-password.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /roadmap | [PNG](../design/game-ui-v2026.11.23.10/previews/roadmap.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /safety | [PNG](../design/game-ui-v2026.11.23.10/previews/safety.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /safety/takedown | [PNG](../design/game-ui-v2026.11.23.10/previews/safety-takedown.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /search | [PNG](../design/game-ui-v2026.11.23.10/previews/search.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /seasons | [PNG](../design/game-ui-v2026.11.23.10/previews/seasons.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /shop | [PNG](../design/game-ui-v2026.11.23.10/previews/shop.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /shop/catalog | [PNG](../design/game-ui-v2026.11.23.10/previews/shop-catalog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /spaces | [PNG](../design/game-ui-v2026.11.23.10/previews/spaces.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /spaces/real-estate | [PNG](../design/game-ui-v2026.11.23.10/previews/spaces-real-estate.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /status | [PNG](../design/game-ui-v2026.11.23.10/previews/status.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/[symbol] | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks--symbol-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/alerts | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-alerts.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/community | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-community.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/compare | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-compare.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/derivatives | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-derivatives.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/history | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-history.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/league | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-league.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/portfolio | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-portfolio.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/watchlist | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-watchlist.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /support | [PNG](../design/game-ui-v2026.11.23.10/previews/support.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /terms | [PNG](../design/game-ui-v2026.11.23.10/previews/terms.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools | [PNG](../design/game-ui-v2026.11.23.10/previews/tools.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/capital-gains-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/capital-gains-tax-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/compound-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-compound-calculator.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/compound-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-compound-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/crypto-apy-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-crypto-apy-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/dividend-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/dividend-tax-calculator/[ticker] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator--ticker-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/farming-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-farming-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/farming-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-farming-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/fire-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-fire-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/gift-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/gift-tax-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/goal-wealth-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-goal-wealth-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/isa-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-isa-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/isa-calculator/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-isa-calculator--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/kimchi-premium-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/kimchi-premium-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/loan-interest-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/loan-interest-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/pension-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/pension-tax-calculator/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/quant-studio | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-quant-studio.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/real-estate-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/real-estate-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/retirement-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/retirement-calculator/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/salary-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-salary-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/salary-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-salary-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/stock-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-stock-calculator.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/stock-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-stock-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/youth-leap-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/youth-leap-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /treasury | [PNG](../design/game-ui-v2026.11.23.10/previews/treasury.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /verify-email | [PNG](../design/game-ui-v2026.11.23.10/previews/verify-email.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /verify-email-change | [PNG](../design/game-ui-v2026.11.23.10/previews/verify-email-change.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /wallet | [PNG](../design/game-ui-v2026.11.23.10/previews/wallet.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /wallet/activity | [PNG](../design/game-ui-v2026.11.23.10/previews/wallet-activity.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /wallet/activity/transactions/[transactionId] | [PNG](../design/game-ui-v2026.11.23.10/previews/wallet-activity-transactions--transactionId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /work | [PNG](../design/game-ui-v2026.11.23.10/previews/work.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |

## Isolated Test backend read-only probes (2026-11-23 KST)
- Independent moneyverse-nov18-test-backend-v20261122.service active at localhost:55438.
- GET /actuator/health: HTTP 200 status UP. GET /api/v1/game-clock: 200 with policy v2026.09.15.114, 600 real seconds/server day and 7 server days/week.
- GET / and /bank: HTML 200. This proves only public HTML responses, not banking transactions.
- Unauthenticated GET /admin: HTTP 302 login redirect. Admin-role RBAC test remains open.
- Important finding: GET /blog/test-article: HTML 200 but home dashboard title. Blog slug, correct content, 404 and routing/SEO remain suspect and unverified.
- Full 180 route authenticated functional, financial settlement, admin mutation, mobile/locale, and Production verification not performed.

## Isolated Test backend: all 180 routes anonymous GET inventory (2026-11-23 KST)
- Test scope localhost:55438 only; no credential/session, read-only GET, dynamic parameters substituted with qa-no-such-* placeholders, not real records. Responses are NOT end-to-end feature acceptance.
- 180/180 probes returned: **200=132, 302=42, 401=3, 405=1, 503=2**.
- **33 non-home routes served HTTP200 with a HOME dashboard title**, indicating suspicious generic routing/fallback rather than verified route-specific content. Blog article routes are among them.
- Two **HTTP503** Test routes: /status and /stocks/derivatives. Need fix/maintenance reconciliation.
- HTTP302 admin responses can be correct authentication redirects, HTTP401 can be expected authorization; /safety/takedown HTTP405 may be intentional POST-only method. Do not call those failures without endpoint contracts.
- This checks only read-only anonymous responses. It does not prove authenticated UX, finance ledger writes, game rewards, admin mutations, 5-locale/device or Production flows.

| Route | Test anonymous GET | HTML title (abridged) | Classification |
| --- | --- | --- | --- |
| / | 200 | My assets dashboard · W Moneyverse | NO_END_TO_END_PROOF |
| /[locale]/blog | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /[locale]/blog/[slug] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /[locale]/guide/glossary | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /[locale]/guide/glossary/[term] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /[locale]/tools/compound-interest-calculator | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /[locale]/tools/compound-interest-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /account | 200 | 내 계정 센터 - 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /account-deletion | 200 | Account deletion · W Moneyverse | NO_END_TO_END_PROOF |
| /account/notifications | 200 | 알림 설정 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /account/privacy | 200 | 개인정보 센터 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /account/security | 200 | 로그인 기기 및 보안 관리 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /admin | 302 |  | NO_END_TO_END_PROOF |
| /admin/analytics | 302 |  | NO_END_TO_END_PROOF |
| /admin/api-health | 302 |  | NO_END_TO_END_PROOF |
| /admin/bank | 302 |  | NO_END_TO_END_PROOF |
| /admin/blog | 302 |  | NO_END_TO_END_PROOF |
| /admin/bonds | 302 |  | NO_END_TO_END_PROOF |
| /admin/catalog | 302 |  | NO_END_TO_END_PROOF |
| /admin/central-bank | 302 |  | NO_END_TO_END_PROOF |
| /admin/content | 302 |  | NO_END_TO_END_PROOF |
| /admin/controls | 302 |  | NO_END_TO_END_PROOF |
| /admin/discord | 302 |  | NO_END_TO_END_PROOF |
| /admin/economy | 302 |  | NO_END_TO_END_PROOF |
| /admin/economy/scenario-lab | 302 |  | NO_END_TO_END_PROOF |
| /admin/enterprises | 302 |  | NO_END_TO_END_PROOF |
| /admin/fx | 302 |  | NO_END_TO_END_PROOF |
| /admin/help | 302 |  | NO_END_TO_END_PROOF |
| /admin/kdic | 302 |  | NO_END_TO_END_PROOF |
| /admin/logs | 302 |  | NO_END_TO_END_PROOF |
| /admin/logs/activity | 302 |  | NO_END_TO_END_PROOF |
| /admin/logs/delivery | 302 |  | NO_END_TO_END_PROOF |
| /admin/logs/errors | 302 |  | NO_END_TO_END_PROOF |
| /admin/logs/integrity | 302 |  | NO_END_TO_END_PROOF |
| /admin/logs/system | 302 |  | NO_END_TO_END_PROOF |
| /admin/market | 302 |  | NO_END_TO_END_PROOF |
| /admin/market/ai-news | 302 |  | NO_END_TO_END_PROOF |
| /admin/mint | 302 |  | NO_END_TO_END_PROOF |
| /admin/money-flow | 302 |  | NO_END_TO_END_PROOF |
| /admin/operations/storage | 302 |  | NO_END_TO_END_PROOF |
| /admin/pension | 302 |  | NO_END_TO_END_PROOF |
| /admin/safety | 302 |  | NO_END_TO_END_PROOF |
| /admin/security | 302 |  | NO_END_TO_END_PROOF |
| /admin/seo | 302 |  | NO_END_TO_END_PROOF |
| /admin/seo-audit | 302 |  | NO_END_TO_END_PROOF |
| /admin/shop | 302 |  | NO_END_TO_END_PROOF |
| /admin/support | 302 |  | NO_END_TO_END_PROOF |
| /admin/treasury | 302 |  | NO_END_TO_END_PROOF |
| /admin/treasury/grants | 302 |  | NO_END_TO_END_PROOF |
| /admin/users | 302 |  | NO_END_TO_END_PROOF |
| /admin/users/[id] | 401 |  | NO_END_TO_END_PROOF |
| /admin/work | 302 |  | NO_END_TO_END_PROOF |
| /advisor | 200 | AI 금융 어드바이저 덕이 — 포트폴리오 진단 &amp; 리밸런싱 / Woldeok Moneyverse ·  | NO_END_TO_END_PROOF |
| /announcements | 200 |  | NO_END_TO_END_PROOF |
| /announcements/[announcementId] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /arcade | 200 | 아케이드 · 월덕 머니버스 (Woldeok Moneyverse) | NO_END_TO_END_PROOF |
| /bank | 200 | 가상 은행 & 복리 예금 · Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /bank/savings-pot | 200 | 4인 공동 저축 챌린지 팟 / 월덕 가상금융 소셜 세이빙 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /blog | 200 | 월덕 블로그 / 경제 · 코딩 · 컴퓨터 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /blog/[slug] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /board | 200 | 커뮤니티 · Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /board/[postId] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /bonds | 200 | 게임 내 가상 WLD 채권 거래소 / 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /businesses | 200 | 가상 사업체 — 게임 내 비즈니스 운영 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /businesses/ventures | 200 | 가상 스타트업 VC 엔젤투자 &amp; 지분 펀딩 — 6대 유망 벤처 투자 &amp; 배당 수익 · 월덕 머 | NO_END_TO_END_PROOF |
| /calculators | 200 | Calculator center / Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /calendar | 200 | 이벤트 캘린더 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /casino | 200 | 카지노 · 월덕 머니버스 (Woldeok Moneyverse) | NO_END_TO_END_PROOF |
| /central-bank | 200 | 한국은행 (Bank of Korea) 통화정책 공시 포털 / 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /chat | 302 |  | NO_END_TO_END_PROOF |
| /clubs | 200 | 클럽·협동조합 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /clubs/[clubId] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /clubs/[clubId]/members | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /clubs/new | 200 | 월덕 머니버스 — 가상경제·모의 주식·금융 계산기 | NO_END_TO_END_PROOF |
| /clubs/warfare | 200 | 클럽 공성전 운영 상태 / 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /collections | 401 |  | NO_END_TO_END_PROOF |
| /dashboard | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | NO_END_TO_END_PROOF |
| /data-deletion | 200 | 개인정보 삭제 요청 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /design-preview | 200 | 신규 사용자 UX 시안 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /developer | 200 | 개발자 포털 &amp; API 센터 (관리자 전용) / Woldeok Moneyverse · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /enterprises | 200 | 국가 공기업 경영정보 공개 (ALIO) / 머니버스 공공 거버넌스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /features | 200 | 핵심 기능 &amp; 사용법 가이드 / 실제 화면으로 보는 6대 핀테크 가상 경제 조작법 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /forgot-password | 200 | Forgot password · W Moneyverse | NO_END_TO_END_PROOF |
| /fx | 200 | 서울외환시장 (FX) 실시간 환전 &amp; 외환보유액 포털 / 월덕 통화안전망 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /gallery | 200 | 사진 / Gallery · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /gallery/[photoId] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /gallery/submit | 200 | 사진 보내기 / Submit Photo · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /guide | 200 | 가이드 · Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /guide/career-mastery | 200 | 8대 전문 직업 2.0 &amp; 일일 WLD 급여 파밍 완벽 가이드 — 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /guide/dopamine-system | 200 | 도파민 보상 루프 &amp; 지속 가능한 수익화 시스템 가이드 — 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /guide/glossary | 200 | 50대 핵심 투자 &amp; 금융 용어사전 — 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /guide/glossary/[term] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /guide/stock-trading | 200 | 가상 주식 실전 매매 &amp; 호가창 분석 가이드 — 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /guide/virtual-banking | 200 | 가상 금융 &amp; 복리 예금·국채 전략 가이드 — 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /help | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /help/[slug] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /inventory | 200 | 내 보관함 · 인벤토리 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /invite/[code] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /kdic | 200 | 예금보험공사(KDIC) 5천만원 예금자보호 포털 / 월덕 금융안전망 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /lobby | 200 | 커뮤니티 로비 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /login | 200 | Log in · W Moneyverse | NO_END_TO_END_PROOF |
| /login/providers | 200 | Log in · W Moneyverse | NO_END_TO_END_PROOF |
| /marketplace | 200 | 플레이어 마켓 — 거래 근거 확인 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /marketplace/auction | 200 | 월덕 머니버스 — 가상경제·모의 주식·금융 계산기 | NO_END_TO_END_PROOF |
| /mint | 200 | 한국조폐공사 (KOMSCO) 화폐 공시 포털 / 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /newspaper | 200 | 주간 경제 브리프 &amp; 실시간 월드 펄스 — 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /pension | 200 | 국가 국민연금공단 (NPS) / 신규 정식 원장 적립·환급 및 과거 내역 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /prediction | 200 | 월덕 머니버스 — 가상경제·모의 주식·금융 계산기 | NO_END_TO_END_PROOF |
| /privacy | 200 | 개인정보처리방침 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /profile | 200 | 내 프로필 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /profile/[userId] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /profile/settings | 200 | 월덕 머니버스 — 가상경제·모의 주식·금융 계산기 | NO_END_TO_END_PROOF |
| /progression | 200 | 성장 단계 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /progression/prestige | 200 | 프레스티지 환생 — 거래 준비 중 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /quests | 200 | 퀘스트 · Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /register | 200 | Create account · W Moneyverse | NO_END_TO_END_PROOF |
| /reset-password | 200 | Reset password · W Moneyverse | NO_END_TO_END_PROOF |
| /roadmap | 200 | 머니버스 시작 가이드 / 가입·직업·가상 주식 탐색 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /safety | 200 | 머니버스 안전 센터 (Safety Center) · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /safety/takedown | 405 |  | NO_END_TO_END_PROOF |
| /search | 200 | 통합 검색 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /seasons | 200 | 시즌 이벤트 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /shop | 200 | 상점 · Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /shop/catalog | 200 | 아이템 상점 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /spaces | 200 | 가상 부동산 &amp; 개인 공간 (Personal Spaces) / Woldeok Moneyverse ·  | NO_END_TO_END_PROOF |
| /spaces/real-estate | 200 | 가상 부동산 메가시티 랜드마크 경매 &amp; 월세 배당 거래소 / Woldeok Moneyverse · 월 | NO_END_TO_END_PROOF |
| /status | 503 | null / Woldeok Moneyverse | HTTP_503 |
| /stocks | 200 | Virtual stock exchange / Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /stocks/[symbol] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /stocks/alerts | 401 |  | NO_END_TO_END_PROOF |
| /stocks/community | 200 | 토스형 주주 라운지 &amp; 모의투자 소셜 피드 / 월덕 머니버스 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /stocks/compare | 200 | 가상 주식 종목 비교 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /stocks/derivatives | 503 |  | HTTP_503 |
| /stocks/history | 200 | 월덕 머니버스 — 가상경제·모의 주식·금융 계산기 | NO_END_TO_END_PROOF |
| /stocks/league | 200 | 가상 주식 실시간 카피 트레이딩 리그 &amp; 고래 리더보드 / Woldeok Moneyverse · 월덕 | NO_END_TO_END_PROOF |
| /stocks/portfolio | 200 | 가상 주식 포트폴리오 분석 — 자산 비중 및 실시간 손익 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /stocks/watchlist | 200 | 월덕 머니버스 — 가상경제·모의 주식·금융 계산기 | NO_END_TO_END_PROOF |
| /support | 302 |  | NO_END_TO_END_PROOF |
| /terms | 200 | 이용약관 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /tools | 200 | Financial tools / Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /tools/capital-gains-tax-calculator | 200 | [2026 최신] 해외주식 양도소득세 계산기 — [무료/1초] 미국주식 250만원 비과세 &amp; 손익상계 | NO_END_TO_END_PROOF |
| /tools/capital-gains-tax-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/compound-calculator | 200 | Compound interest calculator / Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /tools/compound-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/crypto-apy-calculator | 200 | 코인 스테이킹 APY 복리 계산기 — [무료] DeFi APR ↔ APY 변환 &amp; 일/월 복리 이자  | NO_END_TO_END_PROOF |
| /tools/dividend-tax-calculator | 200 | [무료/무로그인] 배당소득세 계산기 — 1초 만에 국내·미국 배당주 15.4% 세후 실수령액 &amp; 20 | NO_END_TO_END_PROOF |
| /tools/dividend-tax-calculator/[ticker] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/farming-calculator | 200 | 직업별 일일 파밍 수익 시뮬레이터 — 5대 전문직 숙련도 &amp; 복리 예금 최적화 / 월덕 머니버스 | NO_END_TO_END_PROOF |
| /tools/farming-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/fire-calculator | 200 | FIRE족 조기은퇴 4% 룰 계산기 — [무료] 목표 은퇴자산 &amp; 안전 인출률 30년 시뮬레이션 /  | NO_END_TO_END_PROOF |
| /tools/gift-tax-calculator | 200 | [2026 최신] 증여세 계산기 — [무료/1초] 배우자 6억·자녀 5천만·혼인 1.5억 비과세 한도 &am | NO_END_TO_END_PROOF |
| /tools/gift-tax-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/goal-wealth-calculator | 200 | 목표 자산·은퇴·FIRE 달성 계산기 — 4% 룰 및 자금 고갈 시뮬레이터 / 월덕 머니버스 | NO_END_TO_END_PROOF |
| /tools/isa-calculator | 200 | [2026 최신] ISA 계좌 절세 계산기 — [무료/1초] 일반형·서민형 비과세 한도 &amp; 9.9%  | NO_END_TO_END_PROOF |
| /tools/isa-calculator/[slug] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/kimchi-premium-calculator | 200 | [실시간 무료] 코인 김치프리미엄 계산기 — 1초 만에 업비트·바이낸스 김프/역프 &amp; 차익거래 순수익 | NO_END_TO_END_PROOF |
| /tools/kimchi-premium-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/loan-interest-calculator | 200 | [무료/무로그인] 대출이자 계산기 — 1초 만에 2억·3억 대출 원리금균등 월 납입금 &amp; 총이자 즉시 | NO_END_TO_END_PROOF |
| /tools/loan-interest-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/pension-tax-calculator | 200 | [2026 최신] 연금소득세 &amp; 퇴직소득세 계산기 — [무료/1초] IRP·연금저축 수령액 &amp; | NO_END_TO_END_PROOF |
| /tools/pension-tax-calculator/[slug] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/quant-studio | 200 | 노코드 퀀트 전략 연습 — DCA·그리드·RSI 예시 시뮬레이션 / 월덕 머니버스 | NO_END_TO_END_PROOF |
| /tools/real-estate-calculator | 200 | [무료/무로그인] 부동산 임대수익률 계산기 — 1초 만에 오피스텔·상가 Cap Rate &amp; 레버리지  | NO_END_TO_END_PROOF |
| /tools/real-estate-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/retirement-calculator | 200 | 퇴직금·퇴직소득세 예상 계산기 — 근속기간·급여·IRP 참고 / 월덕 머니버스 | NO_END_TO_END_PROOF |
| /tools/retirement-calculator/[slug] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/salary-calculator | 200 | [2026 최신] 연봉 실수령액 계산기 — [무료/1초] 4대보험·소득세 공제 후 세후 월급 즉시 확인 /  | NO_END_TO_END_PROOF |
| /tools/salary-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/stock-calculator | 200 | Stock average price calculator / Woldeok Moneyverse | NO_END_TO_END_PROOF |
| /tools/stock-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /tools/tax-calculator | 200 | 가상자산·금융투자 세금 계산기 — 2026/2027 양도소득세 &amp; 배당소득세 / 월덕 머니버스 | NO_END_TO_END_PROOF |
| /tools/youth-leap-calculator | 200 | [2026 최신] 청년도약계좌 만기 수령액 계산기 — [무료/1초] 5,000만원 정부기여금 &amp; 비과 | NO_END_TO_END_PROOF |
| /tools/youth-leap-calculator/[preset] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /treasury | 200 | [2026] 대국민 국고(Treasury) 포털 — 현재 회계기와 재정 대사 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /verify-email | 200 | Verify email · W Moneyverse | NO_END_TO_END_PROOF |
| /verify-email-change | 200 | Confirm email change · W Moneyverse | NO_END_TO_END_PROOF |
| /wallet | 302 |  | NO_END_TO_END_PROOF |
| /wallet/activity | 200 | 내 지갑 기록 · 월덕 머니버스 | NO_END_TO_END_PROOF |
| /wallet/activity/transactions/[transactionId] | 200 | 홈 대시보드 · 월덕 머니버스 (Woldeok Moneyverse) | HOME_TITLE_FALLBACK |
| /work | 200 | 직업 및 업무 — 전문 직업 2.0 · 월덕 머니버스 | NO_END_TO_END_PROOF |

## Additional brand asset issue: filename/MIME do not match bytes (P1)
- The exact owner-designated existing favicon at spring-backend/src/main/resources/static/assets/mv39/favicon.ico contains JPEG/JFIF 1024x1024 bytes even though named .ico; independent Test serves it as Content-Type: image/x-icon (200, 355640 bytes).
- The v10 design PNGs include the unchanged source favicon **pixel content**, avoiding any invented logo. Browser favicon/manifest handling may still be incompatible; requires native ICO/PNG conversion preserving appearance plus exact Test browser/head/asset regression before any operational change. The original file was not modified in this visual QA branch.
