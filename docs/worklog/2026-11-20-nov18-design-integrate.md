# November 18 design integration — November 20, 2026

## Before work
- User approved preceding-branch integration/cleanup, GitHub failure repair, November 18 frontend implementation and gated production promotion.
- Baseline main: `245489a1452a1f187af831f483c18ab2501a65c5`.
- Approved design authority: `NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md`, planning source `131ee06e85d86349105530beb5b7671e92cdd36f`.
- Isolated task branch: `feat/nov18-design-integrate-v20261120`; existing uncommitted i18n work preserved in the original checkout.
- Superpowers: requirements comparison, isolation, written plan, RED/GREEN, systematic debugging, independent review, fresh verification.

## In progress
- [x] Inventory nine pending PRs and dependency stacks.
- [x] Assemble #3300/#3301/#3302/#3303/#3304/#3305/#3306/#3307/#3309 in one candidate, preserving actual ancestors.
- [x] Fix all-zero candidate CI security baseline; keep tracked/changed-file scanning fail closed. RED two new regressions, GREEN with CLI invalid/missing/noncommit/changed-path coverage.
- [x] Resolve historical planning append conflicts by retaining both records. Home uses the current source-backed mobile/member shell; original i18n source file remains unchanged. Shared locale consolidation belongs to the next frontend phase.
- [x] Exclude the newly introduced prohibited internal artifact from candidate HEAD; history remains in the existing PR ancestor. Automatic review refused its content lookup; no content was returned.
- [x] Repair source price precision with exact decimal BigInt ratios, restore mobile 56px help target and approved palette. Three regressions observed RED then GREEN; 16 homepage contracts pass.
- [x] Independent final integration review; address important wallet completeness finding with RED three failing cases, then GREEN four tests. Missing/duplicate cash/bank accounts or missing projections cannot become a partial/zero total. Account creation contract is migration 006.
- [x] Resolve migration-authority finding with read-only metadata: existing connected moneyverse_migrator is already superuser and can act as postgres; migration 349 absent from inspected registry. No grants/DDL/data changed. Document explicit authorized-executor prerequisite and add disposable CI privilege-refusal coverage. This is existing elevated authority, not least-privilege certification.
- [ ] Wait for exact final-head GitHub runtime/isolated PostgreSQL checks and merge through normal requirements.
- [ ] Verify main ancestry and added-file parity before deleting fully integrated branches.
- [ ] Implement native Spring MVC/Thymeleaf shared frontend and security-gated global support against approved design.
- [ ] Verify exact-source isolated Test, authenticated/session-continuity and browser acceptance before production.

## Validation
- Original main: 237 Spring tests, 38 failures, zero skips (fresh baseline).
- Integrated source after review fixes: `./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=2`, test profile and loopback binding: **276 tests, 0 failures/errors/skips; JAR build success**.
- `node --test scripts/mv39-money.test.mjs scripts/security/*.test.mjs scripts/release/*.test.mjs packages/database/test/ledger-default-acl-v349.test.mjs`: **196 pass, 0 fail/skip**.
- `python3 scripts/test_mv39_home.py`: **16/16**.
- Shell syntax and `git diff --check`: pass.
- Live Test `/api/version`: **403**, so no exact-source public Test acceptance. CUA existing-tab and new-tab attachment both timed out; actual responsive browser acceptance is not complete. Approved Nov18 homepage reference image was inspected.
- No shared DB migrations/privilege writes, financial mutations, service restarts, traffic changes or production deployment performed.

## Finished
Integration implementation and local checks completed; GitHub checks, main merge, branch cleanup, full frontend and release phases remain in progress. This record is not all-route QA or production completion evidence. Production is HOLD pending the documented exact-source Test/auth/security/rollback gates.

## Frontend continuation checkpoint
- Integration PR #3310 merged to main `08b1525ca76af514cd5fa2bddde33a784378352f` after fresh GitHub policy/runtime/PostgreSQL checks and candidate image build succeeded. Production dispatch was skipped, not certified.
- All nine preceding PR tips are ancestors of main. Eight preceding runtime branches plus the temporary CI repair branch were deleted remotely only after empty unmerged-log and added-file checks. The documentation branch is retained because its deliberately excluded internal artifact fails added-file parity; no unique commit was discarded. Stacked PRs #3303/#3306/#3307 show CLOSED while their actual tips are fully included in #3310/main.
- New isolated stacked branch `feat/nov18-native-frontend-v20261120` preserves the completed integration candidate while implementing native frontend. It was reconciled with main before this checkpoint.
- Actual `/` and `/index.html` now render `mv43/home` through Spring MVC + Thymeleaf. Shared fragments own sidebar/header/mobile navigation/footer/support; source-backed existing homepage data behavior remains.
- Shared 112-key, five-language SSR catalog is protected by parity with the existing approved client dictionary. Saved cookie overrides supported Accept-Language; malformed/unsupported metadata and q=0 safely fall back. Native renderer/header identity and no-store/Vary are tested.
- Native support dialog opens/closes, retains open state on language change and restores focus; its links distinguish support, member conversations and guide. Sending is not enabled or certified, and no private draft is persisted. Full authenticated messaging remains a separate P0 gate.
- Client locale now honors negotiated SSR language on first load, Auto can return to browser detection, malformed cookie decoding cannot crash, and missing translations show safe English with a diagnostic instead of raw keys.
- RED: native HTTP 10/10 failed on the old static page, and three new locale cases failed on the old engine. GREEN: **286 Spring tests, zero failures/errors/skips; bootJar successful; 198 Node tests pass without skips**.
- Next: migrate administrator rendering to shared Thymeleaf without losing authorization, source status or actions; inventory all existing route/control families before further conversions. No all-route/native frontend/production completion is claimed.

## Native session CSRF prerequisite — before work
- Isolated branch `fix/native-session-csrf-v20261120`, fixed base `86138e3d17e5327ac08211660e8b848d47237edc`; fetched main remains its ancestor at `08b1525ca76af514cd5fa2bddde33a784378352f`.
- Root cause: session bootstrap serializes the stored digest while both mutation guards require the raw token whose digest matches it. Existing creation paths retain the raw value only in the initial response.
- [ ] Add synthetic, isolated regression tests; observe logical RED before changing production code.
- [ ] Preserve session status and existing hashes; emit an HttpOnly Secure SameSite=Lax host-only proof cookie on token creation and clear it with session cleanup.
- [ ] Return raw proof only after session ownership and same-origin validation; prevent shared caching.
- [ ] Run focused and full isolated Spring tests and bootJar, self-review, and publish the task branch for independent review.
- No production, live database, schema, environment, credential or deployment changes are authorized by this prerequisite.

## Native session CSRF prerequisite — in progress
- [x] Reproduced the digest/raw-token mismatch: clean RED run had 31 cases, 30 logical failures; the existing stored-digest rejection guard remained green.
- [x] Added verified raw proof recovery through a Secure HttpOnly SameSite=Lax host-only cookie; both existing mutation guards are unchanged. Missing, malformed, foreign, duplicate, inactive-session and anonymous proof fails closed without rotating session hashes.
- [x] Bootstrap is private/no-store and varies by Cookie while preserving CORS Vary headers. Native browser same-origin Fetch Metadata can prove context; explicit Origin must match configured `moneyverse.app-base-url` / `APP_BASE_URL`. Missing metadata or cross-origin context receives no usable proof; request Host and forwarded headers never grant origin authority.
- [x] Covered local/prelogin creation, the existing eight-hour OAuth lifetime, actual OAuth redirect retention with mocked provider transport, logout/reset and administrator cleanup.
- Controller authorized related scope expansion: administrator session rotation now emits proof and clears its stale legacy session cookie. Member and administrator services share deterministic host-session extraction; invalid or duplicate host cookies cannot select a legacy or bearer identity. Existing database rotation, role, reauthentication and TOTP mechanics are unchanged.
- Additional RED cycles: padded raw proof / legacy cleanup 2 failures of 34; host-cookie precedence / stale cleanup 6 failures of 42; administrator parser consistency 5 failures of 44. Final focused GREEN: 44 tests, 0 failures/errors/skips.
- Intermediate full isolated suite: 328 tests, 0 failures/errors/skips and bootJar success. Final full suite is running after the shared administrator parser change.
- [ ] Read final full-suite counts, self-review the exact diff, commit/push only authorized task files, and hand off for independent review.

## Native session CSRF prerequisite — finished implementation
- [x] Explicit untrusted Origin or Fetch Metadata now receives HTTP 403 without a user payload; the final privacy RED cycle observed 7 failures of 44 before this response change. Metadata-missing service clients keep existing signedIn/user semantics and receive empty proof.
- [x] Final focused verification: **44 tests, 0 failures/errors/skips**. Final full verification: **330 tests across 73 suites, 0 failures/errors/skips; bootJar successful**.
- Final full command: `MONEYVERSE_STORAGE_PATH=/tmp/native-session-csrf-media-20261120-0228-e64a SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1`. A forced full rerun with the media override also passed before the final privacy response change.
- Parent identified that the existing test profile omitted a media storage override. Earlier whole-suite runs used that default and may have emitted synthetic upload fixtures into shared default media storage. No shared media cleanup was attempted. Final verification used the task-owned temporary directory; the shared test-profile repair belongs to the parent task.
- [x] Exact production diff self-reviewed; both existing member mutation guards, database files, CORS allowlist, role/reauthentication/TOTP checks and existing database session rotation mechanics remain unchanged. Main was fetched again and remains an ancestor at `08b1525ca76af514cd5fa2bddde33a784378352f`; `git diff --check` passes.
- Compatibility limits: legacy sessions without matching proof remain authenticated but cannot bootstrap mutation proof. Browsers without Fetch Metadata need an explicit configured matching origin; noncanonical explicit origins are refused. No existing session hash is rotated to compensate.
- Implementation is ready for the parent's independent review and integration. No live database/schema/privilege, environment, running-service, merge or deployment changes were made. Browser/exact-source Test acceptance is unverified; production remains **HOLD**.
