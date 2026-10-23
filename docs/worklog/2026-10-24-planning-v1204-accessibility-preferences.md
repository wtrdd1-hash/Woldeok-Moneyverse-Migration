# Moneyverse Planning v1204 — F675-108 Accessibility Preferences
Date: 2026-10-24 KST. Previous Feature Improvement v1202; Current Feature Addition v1204; Next Feature Improvement v1206 provisional.
Canonical source: origin/main AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md (EN) and PROJECT_PLAN.ko.md (KO). Main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede start/mid, checksum unchanged. QA v1205 FAILED/HOLD.
Discovery: account menu lacks accessibility preference entry; theme.ts owns browser-local theme/point; globals.css and cosmetics.css respect OS reduced motion; root layout permits browser zoom; security sessions already managed. Backend auth guards, SQL SECURITY DEFINER and frontend/src/app/app-api reviewed. Production and development share live 5433: no DB mutation.
Scope: new guest-local/member opt-in cross-device reading/motion/contrast settings with verified receipts, member-only CAS APIs, additive schema and least privilege; no raw disability profiling. Android native OS precedence, WCAG 2.2 AA, redacted admin, SEO/cache, security and rollback. Complete English/Korean equivalent in existing integrated planning docs.
Backlog IDs: ENV1204-01 SEC1204-02 REL1204-03 A11Y1204-04 A11Y1204-05 A11Y1204-06 A11Y1204-07 A11Y1204-08 A11Y1204-09 A11Y1204-10.
P0 blockers: #1053 #1060 #993 #1067 #1066; QA v1205 lint 1 error/1124 warnings, frontend 1/1384 failure, Next 2 Critical/1 High, migration266 mismatch, no isolated exact-SHA Test/restore. No runtime/WLD/Production changes.
Independent references reviewed: W3C WCAG 2.2, W3C WAI-Adapt, MDN reduced motion (2 independent publishers). Newly approved evidence 0; cumulative verified deduplicated approved UNKNOWN/10,000 BLOCKED.
Docs-only isolated branch stacked after Draft PR #1065. No changes to Gemini/development A/B/C/QA branches.

GitHub implementation backlog issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1071
