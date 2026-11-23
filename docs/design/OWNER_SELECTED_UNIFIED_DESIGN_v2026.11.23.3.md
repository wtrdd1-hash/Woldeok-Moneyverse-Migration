# OWNER-SELECTED DESIGN — Unified Navy/Violet PC + Mobile, v2026.11.23.3

> **OWNER SELECTED / DESIGN BASELINE — 2026-11-23.** This design language is the approved visual direction for the full Woldeok Moneyverse website and 180 Nov18 route concepts. It supersedes the earlier generic template look and inconsistent green/teal page accents **as a design choice only**. It does not certify 180 complete user flows or Production implementation.

Korean: [한국어](OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.ko.md)
Master inventory: [English](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.md) · [Korean](ALL_180_UNIFIED_UI_REGISTER_v2026.11.23.3.ko.md)
Issue [#3374](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3374) · Design PR [#3376](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3376) (Draft; not merged).

## Owner's selected visual reference

- Unified dark navy `#0C1020` background, `#151D32` cards, primary violet `#9C83FF`, blue `#64B7FF`; readable `#E9F1FF` text and `#A8BCD8` secondary text.
- Consistent W brand, desktop left navigation and mobile bottom navigation, search, clearly accessible **Jobs/Career**, global support/chat launcher, visible language menu.
- Distinct specialist UI per function: career selection, work/timer/claim and qualifications; banking deposits, withdrawals, savings and cards; wallet send/receive and receipts; quests, shop/inventory, markets, enterprise, community and RBAC-based administrator operations.
- English primary, Korean second; Japanese, simplified Chinese and Vietnamese also required. Images with Korean sample labels are **not** proof of complete localization.
- Sample values and statuses are fictional design data, never runtime data, transaction receipts or successful operations.

## Image references — distinguish old GitHub images from the new selected package

### Original 2026-11-18 source images **currently hosted on GitHub** (historical, NOT the new selected final PNGs)
- [Original home PNG](all-pages-v2026.11.18.12/previews/home.png)
- [Original work PNG](all-pages-v2026.11.18.12/previews/work.png)
- [Original bank PNG](all-pages-v2026.11.18.12/previews/bank.png)
- [Original wallet PNG](all-pages-v2026.11.18.12/previews/wallet.png)
- [Original quests PNG](all-pages-v2026.11.18.12/previews/quests.png)
- [Original shop PNG](all-pages-v2026.11.18.12/previews/shop.png)
- [Original admin-work PNG](all-pages-v2026.11.18.12/previews/admin-work.png)
- [All 180 original image links](all-pages-v2026.11.18.12/README.md)

### New selected 180-route unified images — created and delivered as conversation ZIP, **GitHub binary upload pending**
Package filename: `moneyverse-unified-ui-v2026.11.23.3.zip` (180 PC/mobile composites, manifests, 9 overview sheets, standalone priority images); ZIP was verified in the active conversation, not published as a persistent GitHub asset. The package download link is provided in the associated ChatGPT conversation; it cannot be linked reliably from this repository until an authorized image upload succeeds.

**Do not mislabel the old `home.png`, `work.png`, `bank.png`, or other historical Nov18 images as selected updated designs.** New images must be uploaded to a separate versioned folder, indexed with verified GitHub URLs and SHA256 hashes, reviewed for real text and controls, and then included in the PR.

## Status / implementation boundary
| Scope | State |
|---|---|
| Owner's choice of unified visual direction | **SELECTED** |
| 180 route mapping in English/Korean design register | DOCUMENTED ON BRANCH |
| New 180 PC/mobile composited mockup generation | GENERATED, LOCAL PACKAGE ONLY |
| New 180 images **on GitHub** | **NOT UPLOADED** |
| Every requirement's detailed interactive UI and state acceptance | OPEN |
| Spring MVC/Thymeleaf source implementation and Test/Production promotion | NOT DONE |

The authority remains `PROJECT_PLAN.md` → `INTEGRATED_PLANNING_MASTER.md` → adopted details. Keep predecessor design and documentation history readable; never overwrite source images without a reviewed, versioned migration. No API, DB or live financial state change.
