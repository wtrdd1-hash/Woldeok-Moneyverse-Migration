# 2026-10-27 — Owner-scoped bank loan response privacy (Development A)

## Before work (21:28 KST)
- Authority: main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`, isolated branch `auto/hourly-a-bank-private-cache-20261027-2125`.
- Reviewed `AGENTS.md`, `README.md`, English/Korean `PROJECT_PLAN`, integrated English/Korean planning masters, QA v1323/v1324, existing bank SQL function and app API contract, prior A worklog and open PR inventory.
- Existing `public.bank_my_loans(p_actor)` is owner-scoped and limited to 20 rows; `GET /api/v1/bank/loans` is authenticated; `/bank` is dynamic/noindex. The Android gateway copies upstream cache headers for `bank/*`, allowing an upstream `public, max-age` header to persist owner-specific loan records across account changes. The backend loan GET also lacks an explicit private no-store header.
- Approved user goal: a P1 end-to-end security/privacy hardening of an existing bank loan feature without touching money, schema, roles, sessions or migrations. Scope: NestJS loan read response + Android bank/banking proxy success/error/version-denial paths; preserve public app contract metadata. RED→GREEN regression tests. Other A/B/C/Gemini changes untouched.
- Production/Test hold: existing main migration duplicate 280, security audits, Test exact-SHA identity and DB ACL concerns. No merge or deployment without independent full gates.

## In progress
- [ ] RED tests for backend loan response and Android bank/banking success/failure/version rejection.
- [ ] Minimal implementation without changing bank SQL or money types.
- [ ] Focused and broad verification; record exact SHA, PASS/FAIL/SKIP.
- [ ] Recheck latest main and integrated plans before integration.

## Finished
- Pending.

### Mid-work checkpoint (21:30 KST)
- Fresh main recheck: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c` unchanged. Integrated planning EN/KO SHA256 unchanged (`506c291f...`, `630a8293...`).
- RED backend loan cache metadata **1 FAIL**; RED Android bank/banking cache cases **4 FAIL / 12 PASS**. Failures are missing no-store headers, not environment failures.
- GREEN backend focused **2 PASS**, including real Nest HTTP 200 with exact integer-string outstanding amount `9007199254740993` and private no-store; Android gateway focused **16 PASS** (bank loan, banking standing, 502, 426 and public contract metadata unaffected).
- Minimal implementation: `@Header('Cache-Control', 'private, no-store')` on authenticated Nest bank loans GET; Android gateway always overrides bank/banking response cache headers after proxy, including early errors. Existing SQL owner-scoped function, session guards, amount representation and public contract unchanged.
- Broad gates and isolated DB authorization still pending; no release/merge authority claimed.
