# Release Gate — Owner Inventory Expiry Window (HOLD)

Draft PR #2214; code SHA `d4bc49a9e7920faaf8a6bd6fa6e3bbb70c856ad9`; base main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`.

**No merge or deployment.** Full local backend/frontend tests, typechecks and builds passed, but exact final SHA CI and independent candidate Docker image are not yet proven. DEV app-role direct user_items SELECT/DELETE violates least privilege (#993). Official isolated Test exact SHA, authenticated owner flow, independent backup restore, finance provenance and GitOps gates remain unproven.

Rollback: revert PR (no migration, new grant, WLD, ledger or item write). Default inventory and equip behavior remain unchanged. Preserve all unrelated branches, PRs and active tasks. No actual rollback performed.
