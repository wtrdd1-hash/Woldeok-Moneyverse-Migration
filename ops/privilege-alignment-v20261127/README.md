# Privilege alignment release tooling (v2026.11.27)

Read-only helpers for releasing the revoke migrations (357 app-role privilege alignment, 358 photos DML revoke) and rolling them back.

- `acl-snapshot.sql` prints `GRANT` statements that recreate the application role's current privileges in `public` (tables, functions, including `PUBLIC` function grants, and the migrator default ACL). Run it as the migrator **before** the revoke migrations and keep the output with the release record (internal, not in git).
- `effective-fingerprint.sql` prints one md5 + count of what the application role can actually do (`has_table_privilege` / `has_function_privilege`). Record it before, after, and after any rollback.

## Order (verified on the isolated synthetic sandbox)
1. Additive migrations (354, 355, 356, 359) can be applied before the code.
2. Release the application code that reads through the new functions.
3. Only then apply the revoke migrations 357 and 358. Applying them before the code makes the previous application's sign-in fail. This was reproduced on the sandbox.
4. Rollback of 357/358: replay the saved snapshot (purely additive `GRANT`s) in one transaction. Then confirm that the effective fingerprint equals the pre-revoke value. On the sandbox it matched exactly, and the replay took under a second.

Migration files are never edited or deleted to roll back. A later correction gets the next number.
