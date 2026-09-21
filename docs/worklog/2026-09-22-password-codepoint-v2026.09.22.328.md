# Password code-point boundary — v2026.09.22.328

## English canonical

- Status: completed locally; CI / exact-SHA isolated Test pending.
- Reviewed current `main`, open integration/dependency PRs, authentication priority spec and local-auth runtime before selecting this non-overlapping backend/security fix.
- Found the password policy documented a 128 Unicode-code-point maximum while `acceptablePassword` used JavaScript `.length`, which counts non-BMP characters such as emoji as two UTF-16 code units.
- Changed the runtime policy to count normalized Unicode code points with `Array.from`, without changing the no-numeric-minimum policy, NFC normalization, common-password rejection or Argon2id hashing.
- Added boundary regression coverage for 128/129 ASCII and emoji passwords.
- No migration, ledger, privilege or production data path is modified.
