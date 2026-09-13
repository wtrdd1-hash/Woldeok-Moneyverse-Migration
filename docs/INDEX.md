# Documentation Index

**English** | [한국어](INDEX.ko.md)

This directory is the long-form documentation for Woldeok Moneyverse. The root README is the visual product overview; files here describe the contracts operators and contributors need to preserve.

> Documentation language order: **1. English canonical source / 2. Korean maintained translation.** When a paired Korean document exists, it is linked beside the English source.

## Planning

- [Living Project Plan](planning/PROJECT_PLAN.md) / [한국어](planning/PROJECT_PLAN.ko.md)
- [Product Growth & Retention Plan](planning/PRODUCT_GROWTH_PLAN.md) / [한국어](planning/PRODUCT_GROWTH_PLAN.ko.md)
- [Detailed Product Design Specification](planning/PRODUCT_DESIGN_SPEC.md) / [한국어](planning/PRODUCT_DESIGN_SPEC.ko.md)
- [Default Limit Policy](planning/DEFAULT_LIMIT_POLICY.md) / [한국어](planning/DEFAULT_LIMIT_POLICY.ko.md)
- [Unlimited-Default Consistency Implementation Specification](planning/LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md) / [한국어](planning/LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.ko.md)
- [Economy Sinks Specification](planning/ECONOMY_SINKS_SPEC.md) / [한국어](planning/ECONOMY_SINKS_SPEC.ko.md)
- [Economy Sink Catalog](planning/ECONOMY_SINK_CATALOG.md) / [한국어](planning/ECONOMY_SINK_CATALOG.ko.md)
- [Business Operations & Supply-Chain Specification](planning/BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md) / [한국어](planning/BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.ko.md)
- [Personal Spaces & City Projects Specification](planning/PERSONAL_SPACES_CITY_PROJECTS_SPEC.md) / [한국어](planning/PERSONAL_SPACES_CITY_PROJECTS_SPEC.ko.md)
- [Player Marketplace & Crafting Specification](planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.md) / [한국어](planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md)
- [Clubs & Cooperative Economy Specification](planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.md) / [한국어](planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.ko.md)
- [Clubhouse UX & Operations Specification](planning/CLUBHOUSE_UX_OPERATIONS_SPEC.md) / [한국어](planning/CLUBHOUSE_UX_OPERATIONS_SPEC.ko.md)
- [Community & Market Integrity Specification](planning/COMMUNITY_MARKET_INTEGRITY_SPEC.md) / [한국어](planning/COMMUNITY_MARKET_INTEGRITY_SPEC.ko.md)
- [Monetization, Korea/US Compliance & Search Growth Specification](planning/MONETIZATION_COMPLIANCE_SEO_SPEC.md) / [한국어](planning/MONETIZATION_COMPLIANCE_SEO_SPEC.ko.md)
- [Billing, Subscription & Consumer Protection Specification](planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md) / [한국어](planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.ko.md)
- [Search Discovery Operations Specification](planning/SEARCH_DISCOVERY_OPERATIONS_SPEC.md) / [한국어](planning/SEARCH_DISCOVERY_OPERATIONS_SPEC.ko.md)
- [Minor Safety, Age Assurance & Content Removal Specification](planning/MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md) / [한국어](planning/MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.ko.md)
- [Analytics & Experimentation Governance Specification](planning/ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md) / [한국어](planning/ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.ko.md)
- [Notification & Reactivation Governance Specification](planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md) / [한국어](planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.ko.md)
- [Banking, Credit & Financial-Learning Safety Specification](planning/BANKING_CREDIT_SAFETY_SPEC.md) / [한국어](planning/BANKING_CREDIT_SAFETY_SPEC.ko.md)

The project plan is a living specification. Intentional, validated implementation changes must update the plan in the same development flow; accidental violations of security/data-integrity invariants must be fixed in code rather than documented away.

## Architecture

- [System overview](architecture/system-overview.md) / [한국어](architecture/system-overview.ko.md)
- [Request flow](architecture/request-flow.md) / [한국어](architecture/request-flow.ko.md)
- [Database security boundary](architecture/database-security.md) / [한국어](architecture/database-security.ko.md)
- [Deployment flow](architecture/deployment-flow.md) / [한국어](architecture/deployment-flow.ko.md)

## Gameplay and product features

- [Jobs and progression](features/jobs-and-progression.md) / [한국어](features/jobs-and-progression.ko.md)
- [Quests](features/quests.md) / [한국어](features/quests.ko.md)
- [Casino](features/casino.md) / [한국어](features/casino.ko.md)
- [Banking](features/banking.md) / [한국어](features/banking.ko.md)
- [Stocks](features/stocks.md) / [한국어](features/stocks.ko.md)
- [Businesses](features/businesses.md) / [한국어](features/businesses.ko.md)
- [Shop](features/shop.md) / [한국어](features/shop.ko.md)
- [Admin Control Center](features/admin-control-center.md) / [한국어](features/admin-control-center.ko.md)

## Localization

- [Localization maintenance and parity policy](localization/README.md) / [한국어](localization/README.ko.md)

## Integration

- [Mobile / external app API](mobile-api.md) / [한국어](mobile-api.ko.md)

## Operations

- [What this deployment actually is](INFRASTRUCTURE.md) / [한국어](INFRASTRUCTURE.ko.md)
- [Release guide](RELEASING.md) / [한국어](RELEASING.ko.md)
- [Local development](operations/local-development.md) / [한국어](operations/local-development.ko.md)
- [Database migrations](operations/database-migrations.md) / [한국어](operations/database-migrations.ko.md)
- [Backup and recovery](operations/backup-and-recovery.md) / [한국어](operations/backup-and-recovery.ko.md)
- [Production deployment](operations/production-deployment.md) / [한국어](operations/production-deployment.ko.md)
- [Security model](operations/security-model.md) / [한국어](operations/security-model.ko.md)
- [Release and change documentation policy](operations/release-documentation-policy.md) / [한국어](operations/release-documentation-policy.ko.md)
- [Surviving `as` casts](as-casts.md) / [한국어](as-casts.ko.md)
- [Update log](UPDATE_LOG.md) / [한국어](UPDATE_LOG.ko.md)

## Findings / audits

- [Project gap audit — 2026-09-07](findings/project-gap-audit-2026-09-07.md) / [한국어](findings/project-gap-audit-2026-09-07.ko.md)
- [Public discoverability audit — 2026-09-08](findings/public-discoverability-audit-2026-09-08.md) / [한국어](findings/public-discoverability-audit-2026-09-08.ko.md)
- [Stock read grant finding](findings/stock-reads-lack-grants.md) — source document is already Korean

## Release history and work logs

- [Clubhouse UX & Operations v2026.09.13.18 changelog](changelog/2026-09-13-clubhouse-ux-operations-v2026.09.13.18.md) / [한국어](changelog/2026-09-13-clubhouse-ux-operations-v2026.09.13.18.ko.md)
- [Product planning v2026.09.13.18 worklog](worklog/2026-09-13-product-planning-v2026.09.13.18.md) / [한국어](worklog/2026-09-13-product-planning-v2026.09.13.18.ko.md)
- [Banking, Credit & Financial-Learning Safety v2026.09.13.13 changelog](changelog/2026-09-13-banking-credit-safety-v2026.09.13.13.md) / [한국어](changelog/2026-09-13-banking-credit-safety-v2026.09.13.13.ko.md)
- [Product planning v2026.09.13.13 worklog](worklog/2026-09-13-product-planning-v2026.09.13.13.md) / [한국어](worklog/2026-09-13-product-planning-v2026.09.13.13.ko.md)
- [Notification & Reactivation Governance v2026.09.13.12 changelog](changelog/2026-09-13-notification-reactivation-governance-v2026.09.13.12.md) / [한국어](changelog/2026-09-13-notification-reactivation-governance-v2026.09.13.12.ko.md)
- [Product planning v2026.09.13.12 worklog](worklog/2026-09-13-product-planning-v2026.09.13.12.md) / [한국어](worklog/2026-09-13-product-planning-v2026.09.13.12.ko.md)
- [Analytics & Experimentation Governance v2026.09.13.7 changelog](changelog/2026-09-13-analytics-experimentation-governance-v2026.09.13.7.md) / [한국어](changelog/2026-09-13-analytics-experimentation-governance-v2026.09.13.7.ko.md)
- [Product planning v2026.09.13.7 worklog](worklog/2026-09-13-product-planning-v2026.09.13.7.md) / [한국어](worklog/2026-09-13-product-planning-v2026.09.13.7.ko.md)
- [Billing, Subscription & Consumer Protection v2026.09.13.6 changelog](changelog/2026-09-13-billing-subscription-consumer-protection-v2026.09.13.6.md) / [한국어](changelog/2026-09-13-billing-subscription-consumer-protection-v2026.09.13.6.ko.md)
- [Product planning v2026.09.13.6 worklog](worklog/2026-09-13-product-planning-v2026.09.13.6.md) / [한국어](worklog/2026-09-13-product-planning-v2026.09.13.6.ko.md)
- [Search Discovery Operations v2026.09.13.1 changelog](changelog/2026-09-13-search-discovery-operations-v2026.09.13.1.md) / [한국어](changelog/2026-09-13-search-discovery-operations-v2026.09.13.1.ko.md)
- [Product planning v2026.09.13.1 worklog](worklog/2026-09-13-product-planning-v2026.09.13.1.md) / [한국어](worklog/2026-09-13-product-planning-v2026.09.13.1.ko.md)
- [Minor Safety / Age Assurance v2026.09.12.35 changelog](changelog/2026-09-12-minor-safety-age-assurance-v2026.09.12.35.md) / [한국어](changelog/2026-09-12-minor-safety-age-assurance-v2026.09.12.35.ko.md)
- [Product planning v2026.09.12.35 worklog](worklog/2026-09-12-product-planning-v2026.09.12.35.md) / [한국어](worklog/2026-09-12-product-planning-v2026.09.12.35.ko.md)
- [Monetization, Compliance & SEO v2026.09.12.27 changelog](changelog/2026-09-12-monetization-compliance-seo-v2026.09.12.27.md) / [한국어](changelog/2026-09-12-monetization-compliance-seo-v2026.09.12.27.ko.md)
- [Product planning v2026.09.12.27 worklog](worklog/2026-09-12-product-planning-v2026.09.12.27.md) / [한국어](worklog/2026-09-12-product-planning-v2026.09.12.27.ko.md)
- [Business Operations & Supply Chain v2026.09.12.25 changelog](changelog/2026-09-12-business-operations-supply-chain-v2026.09.12.25.md) / [한국어](changelog/2026-09-12-business-operations-supply-chain-v2026.09.12.25.ko.md)
- [Product planning v2026.09.12.25 worklog](worklog/2026-09-12-product-planning-v2026.09.12.25.md) / [한국어](worklog/2026-09-12-product-planning-v2026.09.12.25.ko.md)
- [Unlimited-Default Consistency v2026.09.12.23 changelog](changelog/2026-09-12-unlimited-consistency-v2026.09.12.23.md) / [한국어](changelog/2026-09-12-unlimited-consistency-v2026.09.12.23.ko.md)
- [Community & Market Integrity v2026.09.12.21 changelog](changelog/2026-09-12-community-market-integrity-v2026.09.12.21.md) / [한국어](changelog/2026-09-12-community-market-integrity-v2026.09.12.21.ko.md)
- [Clubs & Cooperative Economy v2026.09.12.20 changelog](changelog/2026-09-12-clubs-cooperative-economy-v2026.09.12.20.md) / [한국어](changelog/2026-09-12-clubs-cooperative-economy-v2026.09.12.20.ko.md)
- [Player Marketplace & Crafting v2026.09.12.16 changelog](changelog/2026-09-12-player-marketplace-crafting-v2026.09.12.16.md) / [한국어](changelog/2026-09-12-player-marketplace-crafting-v2026.09.12.16.ko.md)
- [Personal Spaces & City Projects v2026.09.12.11 changelog](changelog/2026-09-12-personal-spaces-city-projects-v2026.09.12.11.md) / [한국어](changelog/2026-09-12-personal-spaces-city-projects-v2026.09.12.11.ko.md)
- [Public board / SEO candidate](changelog/2026-09-08-public-board-seo.md) / [한국어](changelog/2026-09-08-public-board-seo.ko.md)
- [Economy Sinks v2026.09.12.5](changelog/2026-09-12-economy-sinks-v2026.09.12.5.md) / [한국어](changelog/2026-09-12-economy-sinks-v2026.09.12.5.ko.md)
- [v2026.09.07.2 localized guide parity](releases/v2026.09.07.2.md) / [한국어](releases/v2026.09.07.2.ko.md)
- [v2026.09.07.1 documentation release](releases/v2026.09.07.1.md) / [한국어](releases/v2026.09.07.1.ko.md)
- [v2026.09.07 gameplay release](releases/v2026.09.07.md) / [한국어](releases/v2026.09.07.ko.md)
- [v2026.09.08 public board / SEO](releases/v2026.09.08-public-board-seo.md) / [한국어](releases/v2026.09.08-public-board-seo.ko.md)
- [2026-09-07 gameplay/UX worklog](worklog/2026-09-07-gameplay-ux-release.md) / [한국어](worklog/2026-09-07-gameplay-ux-release.ko.md)
- [2026-09-07 app gateway worklog](worklog/2026-09-07-app-gateway-gallery-board-images.md) / [한국어](worklog/2026-09-07-app-gateway-gallery-board-images.ko.md)
- [2026-09-08 operations/observability worklog](worklog/2026-09-08-ops-observability-gap.md) / [한국어](worklog/2026-09-08-ops-observability-gap.ko.md)
- [2026-09-08 SEO/ads/legal worklog](worklog/2026-09-08-seo-ads-legal-audit.md) / [한국어](worklog/2026-09-08-seo-ads-legal-audit.ko.md)
- [English changelog](changelog/CHANGELOG.md) / [한국어](changelog/CHANGELOG.ko.md)

## Visual assets

- [Screenshot provenance and update rules](images/README.md) / [한국어](images/README.ko.md)