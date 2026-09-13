# v2026.09.13.48 — App authentication simplification and API guide

- Removed the numeric minimum password-length requirement from first-party member registration by product decision.
- Empty passwords remain invalid; the 128-code-point technical maximum remains.
- Expanded the obvious common-password blocklist for the new short-password policy.
- Kept Argon2id password storage, NFC normalization, generic invalid-login responses and existing authentication rate limiting.
- Added dedicated English/Korean detailed app authentication API guides covering prelogin, consent, registration, email verification, login, viewer/session confirmation, logout and OAuth entry points.
- Updated current planning and mobile API/UI documentation. Historical changelog/worklog records were not rewritten.
- Release path: feature branch -> isolated exact-SHA Test verification -> main -> Production.
