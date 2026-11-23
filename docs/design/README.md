# Woldeok Moneyverse — Official Design Hub
Version: v2026.11.23.5 | **CURRENT DESIGN AUTHORITY: OWNER SELECTED** | Korean: [한국어](README.ko.md)

## The only current full-site visual direction
**[OWNER-SELECTED Unified Navy/Violet Design, v2026.11.23.3](OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.md)** (EN canonical) · [Korean version](OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.ko.md).

Every website screen, including public, members, finance, jobs, games, community, login, support, tools, and all admin screens, shall use this visual direction. Brand background `#0C1020`, cards `#151D32`, violet `#9C83FF`, blue `#64B7FF`, text `#E9F1FF`, muted `#A8BCD8`. No independent teal/green page-level brand themes or generic copy-pasted functionality. Maintain Jobs in desktop/mobile navigation and proper job/pay/qualification, banking/deposit/card, wallet/transfer/receipt, shop/quests and administrative workflows.

**[Complete 180-route register (EN)](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.md)** · [한국어](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.ko.md).

## Authority / implementation limits
The official choice is recorded in [PROJECT_PLAN](../planning/PROJECT_PLAN.md) and [INTEGRATED_PLANNING_MASTER](../planning/INTEGRATED_PLANNING_MASTER.md); actual main authority is updated **only after the open design PR merges**. This design selection is neither full interaction-state design acceptance nor proof of Spring MVC + Thymeleaf implementation, Test, or Production.

**Image status:** newly generated 180-route images are available as a conversation ZIP `moneyverse-unified-ui-v2026.11.23.3.zip`, **not yet GitHub-hosted**. Do not point at the earlier `all-pages-v2026.11.18.12/previews/*.png` and claim those show the selected updated design. Binary upload and exact PNG links/hashes remain open. [Open draft PR #3376](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3376).

## Superseded historical design material — NOT current visual authority
| Former resource | Status | Reason / usage |
|---|---|---|
| [Nov18 180-route gallery](all-pages-v2026.11.18.12/README.md) | `SUPERSEDED / HISTORICAL` | Route-count/provenance baseline only, old PNGs unchanged |
| [Nov18 admin/chat gallery](admin-chat-v2026.11.18.13/README.md) | `SUPERSEDED / HISTORICAL` | Admin/chat early images and prototype, not official current style |
| [Nov19 image implementation handoff](UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md) · [KO](UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md) | `HISTORICAL` | Image provenance, not chosen style |
| [Nov18 responsive blueprint](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.md) · [KO](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md) | `SUPERSEDED / HISTORICAL` | Initial wireframe concept, not current UI decision |
| [Nov18 admin/chat isolated demo spec](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.md) · [KO](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md) | `SUPERSEDED for visual design` | Historical demo only; security/role constraints are still applicable |
| [Nov20 authority/spec](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md) · [KO](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md) | `PARTIALLY SUPERSEDED` | Newer selected visual direction wins, existing security and 5-language obligations stay |
| [Earlier design guidelines](../DESIGN_SYSTEM_GUIDELINES.md) · [Responsive standards](../RESPONSIVE_DESIGN_GUIDELINES.md) | `SUPPORTING NON-VISUAL RULES` | Keep accuracy/accessibility/touch/overflow policies; obsolete style/palette may not override chosen visuals |

Historical references are preserved for traceability and inbound links under [documentation policy](../DOCUMENTATION_POLICY.md); removal from current design navigation is **not deletion of historical records**.

## Release gate
Document-only consolidation. No source PNG replacement, code, API/DB, Test, Production, or deployment has occurred. Complete asset upload, per-feature PC/mobile design audit, five locales, Spring implementation and verified exact-SHA Test/rollback before any production promotion.
