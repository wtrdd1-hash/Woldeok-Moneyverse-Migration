# Public advertising display and route QA — v2026.11.23.11

## Reviewed constraints
Ad-only revenue authority and retention-safe monetization allow real Google AdSense only on substantial reviewed public content. Exclude banking, wallets, orders, casino, login, account/security/admin, private chat and legal consent screens. No fabricated ad fill, advertiser or click UI.

## Actual source correction
- The existing AdSense component now renders a distinctly separated padded/bordered disclosure area with EN/KO/JA/ZH/VI ad labels.
- The approved public-route allowlist now handles KO and VI locale prefixes, not only EN/JA/ZH. Protected localized routes remain excluded.
- Administrator and unresolved identity do not trigger AdSense; an unfilled slot remains hidden after the existing timeout.
- Publisher IDs, Google provider requests and backend/finance actions are unchanged.

## Evidence and limitations
55 focused Vitest tests PASSED and frontend TypeScript typecheck PASSED after building the local contract package.
No exact deployed native Spring advertisement integration, real Google inventory fill, consent, browser CLS/device screenshots, Test acceptance or Production promotion established.
Game-style design image concepts must depict a clearly labeled ad only after primary content on approved public routes, never in account/security/financial transaction screens. No claim that existing 180 PNG concepts were re-rendered.
