# Main authority safety regression refinement

Spec: November18 native/frontend authority and project AGENTS security boundary. Parent frontend approval and task-branch integration remain in force. Execute inline with systematic debugging and TDD; do not publish an unsafe intermediate main merge.

## Task 1: Restore human administrator boundaries
Files: AdminAuthService.java; AdminControlsController.java; focused AdminInternalCredentialRegressionTest.java and AdminLegacyControlsRegressionTest.java.
- Merge a9b1070d10 source into the isolated branch after reading its diff. Preserve existing host-first cookie handling/canonical wallet strings and additive recipient/bond/casino aliases.
- Reproduce matching internal token being accepted as verified actor/CSRF and pre-existing isAuthorized shortcut. A network credential is not an audited administrator identity; require active database session/current database role.
- Reproduce quick POST returning success without auth and after service/SQL error, with no stable caller intent. Remove direct table update/random actor/key/false success. No verified native step-up bridge exists here; legacy quick mutation remains fail-closed/unavailable until that contract is implemented. Canonical read must use the verified actor; never invent a principal.
- No applied migration/role/grant/TOTP secret change. Record compatibility cost of refusing machine-token-only admin calls and unsupported quick toggles.

## Task 2: Remove unverified legacy-widget delivery claims
Files: static/js/mv-floating-chat.js and scripts/legacy-floating-chat.test.mjs.
- Behavioral VM regressions: stale send controls must not issue unverified requests/fabricate receipt on empty200; existing native launcher prevents a duplicate widget; actual emitted access links exist.
- Preserve singular56px support/DM access, focus/Escape and five-language labels. Until canonical UI is connected use truthful page links, no fake encrypted/delivered claim, no private storage/raw route telemetry.
- Native support/chat pages remain a separate source implementation task. No claim global private-draft retention is solved.

## Verification
Run actual focused auth/HTTP/widget regressions RED thenGREEN, full isolated Spring test/JAR, native/release/security Node gates and git diff --check. Rerun actual PostgreSQL CI9-case gate on latest source. Fresh whole-branch review before integration/release. Exact-source public Test403 remains a release blocker.

## Task3: Browser-discovered shared control regressions
Actual browser found7 links below44px and shared English aria/footer/skip strings in Korean. Reuse existing product copy, add only navigation region labels, test negotiated SSR in5 locales and live locale change with expanded-menu state. Enlarge inline/auth/footer link targets without rewriting card/navigation layout. Rerun actual browser all5 locales/8 widths; record remaining acceptance gaps.
## Integration
Current main9635262fb2 includes unrelated official brand assets, preserved. PR3311 squash removed old task ancestry: integrate reviewed8746..3fe753fc43 pure messaging diff while retaining child parentage, resolve only catalog/doc/digest conflicts, re-run full fresh tests and independent whole-branch review.
