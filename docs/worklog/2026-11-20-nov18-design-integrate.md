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


## Native administrator and CI checkpoint
- Canonical administrator rendering now uses the actual Spring Thymeleaf engine and a native template; manual HTML concatenation was removed. Existing session/RBAC lookup, escaped source names, private/no-store headers and partial-source HTTP503 remain.
- Missing/null source collections now remain unavailable rather than raising an unhandled render exception. Regressions observed RED then GREEN.
- All 35 original navigation targets are present, organized in the original actual six categories (8/4/4/6/6/7). Search supports all five translated labels, case folding and full-width normalization; changing language does not clear filters. The directory is navigation, not certification of every linked operation.
- Preserved original Korean tool labels and added explicit EN/JA/ZH/VI labels. Shared catalog now contains154 keys and is parity-tested against the client catalog. Old optimistic kill switches, false OTP success, invented member rows and infrastructure metrics were not carried into this source-backed entry screen.
- Fresh whole Spring suite: **289 tests, zero failures/errors/skips; bootJar successful**. Node UI/security/release suite: **199 pass**, before adding the native-CI contract test.
- New native Spring CI gate builds/tests the actual Java frontend and publishes a JAR manifest tied to the exact source SHA, separate from the existing Next image candidate. That gate is not production deployment or public Test acceptance.
- Read-only route/control inventory:290 static HTML files normalize to147 concepts;135 concepts include captured Next output. These counts are inventory, not implemented/native certification. Native admin/home conversion does not claim all routes complete.
- The prior integrated GitHub Node monorepo run was green but included36 skipped backend test files; those skips are unverified, not passing tests. No production promotion followed.
- Native wallet preservation and session-owned CSRF bootstrap are next. Existing wallet has mismatched transfer fields, floating-point amounts and no replay key/CSRF; the old session bootstrap exposes the stored hash instead of usable raw proof. A dedicated isolated security implementer handles only that lifecycle while this branch owns UI, with independent review before integration.


## Upload fixture isolation correction
The new native CI gate exposed an inherited media integration fixture using ImageStorageService's shared default directory. Earlier local full-suite runs also used that default, so the earlier broad statement of no shared filesystem changes was too strong: a synthetic 1x1 PNG may have been written into the default media directory. No shared-file deletion or unverified cleanup was attempted. Financial data, shared database DDL/DML, production service configuration and traffic were not changed by these tests.
- Added an explicit test-profile temporary media directory and a pre-upload guard requiring a configured path beneath java.io.tmpdir.
- RED: all five media tests refuse the old unconfigured path before upload. GREEN: all five media tests, including real isolated upload/retrieval, pass with the temporary path.
- Test isolation is now enforced in source; no production permissions were expanded to make CI pass.


## Native wallet checkpoint
- Native authenticated wallet now owns /wallet, /wallet/, /wallet.html and /wallet/index.html; forged identity headers cannot open the private page. SSR five-language and login/alias tests observed6RED→6GREEN. Native views preserve transfer inputs, quick amounts, available-cash selection and transaction history, with explicit loading/error/verified states and no fabricated zeroes.
- Monetary requests now cross JSON as canonical positive integer strings up to38 digits and reach the existing canonical PostgreSQL wrapper as BigDecimal. The legacy internal Long method delegates without changing the database transaction function. History amounts/IDs cross JSON as text; no money is rounded through Number.
- Client transfer state uses the actual recipientUserId/amountWld fields, session CSRF and stable caller UUID. Unconfirmed requests keep their exact intent/key and cannot silently change amount; duplicate in-flight posting, stale owner, missing canonical receipt and malformed money are rejected. CSV export preserves text and prevents spreadsheet formula evaluation.
- Known canonical SQLSTATE22023/23505 refusals map to409 rather than an uncertain503; owner receipt refusal28000 maps400. Unknown or unavailable source remains503. This is presentation mapping, not a database privilege or business-rule change.
- Shared native mobile menu/language selection now works outside the home renderer. Language change preserves transfer fields and pending state; account changes clear private values.
- Fresh local evidence before auth-bridge merge: **299 Spring tests, zero failures/errors/skips; bootJar success;207 Node UI/security/release tests pass**. Native browser layout and actual financial mutation acceptance remain unverified; no live transfer was performed.
- The source-bound native GitHub test/build gate on the prior published checkpoint is green after media isolation. These checks do not certify later uncommitted changes or production.

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

## Native session CSRF review round 1 — before fix
- Independent review found administrator close clears the host session cookie but leaves an active legacy session cookie for another account. After applying response cookie deletion, the next request can silently resolve that other identity.
- [ ] Reproduce close followed by browser-cookie application and session/proof resolution with two distinct active identities.
- [ ] Clear the legacy session cookie alongside the existing host-session/proof cleanup, preserving database revocation behavior.
- [ ] Run the isolated focused regression suite, self-review the scoped diff, record RED/GREEN, commit and push for the parent's review continuation.

## Native session CSRF review round 1 — in progress
- [x] Reproduced the review finding using real isolated session rows for distinct active host/legacy accounts, each with a matching proof. Applying close-response cookies then resolving the next request selected the legacy account: **45 tests, 1 logical failure**.
- [x] Added Secure HttpOnly SameSite=Lax Path=/ legacy session-cookie deletion to the existing administrator close response. Existing selected-session database revocation is unchanged; the unrelated database session is not revoked.

## Native session CSRF review round 1 — finished fix
- [x] Focused GREEN: **45 tests, 0 failures/errors/skips**, including close followed by browser-cookie application, member/admin session resolution, anonymous bootstrap, proof absence and preservation of the unrelated database session.
- Command: `MONEYVERSE_STORAGE_PATH=/tmp/native-session-csrf-media-20261120-0228-e64a SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test --tests '*NativeSessionCsrfRegressionTest' --offline --no-daemon -Dorg.gradle.workers.max=1`.
- [x] Self-reviewed the three-line cookie-only production delta and behavioral regression; `git diff --check` passes.
- Parent owns the final integrated full-suite/build gate after this review fix. Previous full 330-test/JAR evidence belongs to the preceding implementation commit and is not claimed as a run of this fix.
- Independent scoped re-review is pending. No database/schema/environment/service, merge or deployment change; production remains **HOLD**.

## Auth bridge integration review
The independent task review found an administrator-close legacy-cookie identity transition. Fix round1/5 added the missing legacy session-cookie deletion and a real H2/browser-cookie-jar regression (45 cases:1RED failure→45GREEN). Scoped independent review approved the fix with no new findings. Full integrated candidate verification follows; actual browser/TLS/Test continuity remains a release gate.

## Native asset version integrity — before work / in progress / finished implementation
- [x] Reproduced stale query versions in native entry templates with a content-hash regression. Logical RED identified a release label instead of the actual SHA256.
- [x] Added a narrowly scoped native template asset-version generator and independent digest verification. The generator refuses paths outside the classpath static root and non-CSS/JavaScript files.
- [x] Current four native templates now address assets by full SHA256; focused Node verification: 1 pass, 0 failure/skip. These are content digests, not release/source attestation.
- Auth integration changes shared assets again; rerun generation and integrity checks after that merge. The full integrated Spring test/JAR command at wallet/auth base72aa55 completed successfully; final candidate verification still follows.
- Browser and exact-source Test acceptance remain unavailable; no running service or production change.

## Native support/chat prerequisite — before work
- Root-cause inspection confirmed both controllers trust arbitrary identity headers or a fixed UUID. Services generate replacement retry keys and return successful empty histories after source/ownership errors; chat sequence crosses JSON as a numeric long.
- [ ] Add HTTP session/CSRF negative regressions and service request/receipt/error regressions; observe logical RED.
- [ ] Reuse MemberApiGuard for every private read/write. Never change session, RBAC, SQL grants or applied migrations.
- [ ] Require caller UUID retry keys and nonblank messages up to1000 Unicode code points; keep exact validated intent on retry.
- [ ] Reuse existing support_create_thread, support_add_message and private_chat_send owner-scoped functions. Require complete canonical receipts and string sequences; fail unavailable/forbidden rather than fabricate success.
- [ ] Run focused and full isolated tests/JAR; independent whole-branch review and browser/Test gates remain mandatory before enabling production.

## Native support/chat prerequisite — in progress
- Existing SensitiveApiBoundaryFilter already rejects anonymous/forged identities and enforces CSRF. This is not evidence of a currently exposed HTTP identity bypass. The controller-local fixed actor remains a defense-in-depth defect if that outer filter is absent; isolated controller tests deliberately disable filters to reproduce it. The first filtered test run used an incorrect forged-header success expectation and is not counted as feature RED.
- Controller-local RED:6 tests,6 logical failures. Existing service RED:13 cases,12 logical failures; expanded changed-intent replay RED:14 cases,13 logical failures. Reply route RED:26 combined cases,6 logical failures, all missing reply mapping. No live user messages were sent.
- Reused MemberApiGuard in both controllers, stable caller keys, max1000 Unicode code points, no NUL/malformed UTF16, and existing chat control restrictions. Private source/owner failures no longer become successful empty histories; missing/overflow counts do not become0. Chat sequence now remains exact decimal text through JSON.
- Ruling: support_create_thread's existing replay validates owner/key but not requested subject/body. Read the actual owner-scoped recent100 thread receipt and first canonical message before acknowledging creation. A replay outside that bounded thread window is unavailable, never relabelled with request text. Cost: very old retries may require manual history recovery; no direct grant or applied migration change.
- Added support reply POST backed by existing support_add_message and support_my_message_receipt. Both write-return and exact stored receipt must agree with owner/thread/body before success.
- Focused GREEN:26 tests,0 failures/errors/skips; one initial serialization harness error was corrected by registering the already available Java-time module, without weakening the string-sequence assertion. Full isolated verification follows.

## Native support/chat prerequisite — finished implementation
- [x] Added two further logical RED read-receipt cases (16 service cases,2 failures): wrong conversation identity and missing peer identity. Both now fail unavailable instead of presenting an unrelated/incomplete row.
- [x] Final isolated Spring full test and bootJar: **372 tests,0 failures/errors/skips; BUILD SUCCESSFUL**. Command: `SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1`; test profile media storage is task-isolated under java.io.tmpdir. Final JUnit XML totals were read.
- [x] Node UI/security/release suite: **208 passes,0 failures/cancellations/skips**. `git diff --check` passes. No migration, database grant or session/role security mechanism was changed.
- JDBC boundary doubles verify SQL/function/actor/key arguments and receipt handling; the PostgreSQL wrappers were not executed by these H2/isolated tests. Real ownership/concurrency/replay and browser/Test acceptance are still required. Global panel sending is not enabled by this API change alone.
- Source implementation checkpoint only; independent whole-branch review pending. No live messages, shared DB writes, service routing or deployment changes. Production **HOLD**.

## Native authentication route family — before work
- Approved task branch `feat/native-auth-ui-v20261120`, base `72aa55cfe596869b273e5f84e5565ab26733dbb0`; fetched main remains `08b1525ca76af514cd5fa2bddde33a784378352f`.
- Read remote AGENTS, binding task brief, TDD/testing, debugging and verification skills. Parent completed approved design, isolation and structured plan; this task implements that scoped plan.
- [ ] Write real Spring route/locale/cache/alias/security tests and client contract/state tests; observe logical RED.
- [ ] Implement native shared-chrome screens and five-language labels with source-backed requests only.
- [ ] Verify focused and full isolated test-profile suites, self-review and publish exact task files.

| Page | Fields/actions in original UI | Existing Spring source contract | Native behavior |
| --- | --- | --- | --- |
| /login, /login/providers | email/password; terms/privacy/age; Discord/Google | POST /api/v1/auth/local/login returns 200 signed-in + userId/proof; form POST /login remains | Login fields with unchecked acknowledgements and legal links; browser-only acknowledgement notice (no consent-write API); Discord link; Google unavailable because authorize source lacks a complete URL |
| /register | email/displayName/password; legal links | POST /api/v1/auth/local/register returns 202 accepted:true + signed-in + userId/proof | Preserve fields, require unchecked acknowledgements; never claim consent recording |
| /forgot-password | email | No recovery request or delivery receipt API | Honest unavailable state; no submission or mail-sent claim |
| /reset-password | token/password/confirmPassword | No reset-completion API | Honest unavailable state; no query token reflection or request |
| /verify-email | token confirmation | No email activation API | Honest unavailable state; no automatic token action |
| /verify-email-change | token confirmation | No email-change completion API | Honest unavailable state |
| /account-deletion | deletion confirmation / receipt status | No deletion API | Honest unavailable state; no destructive action |

- GET ownership: LocalAuthController owns /login and /login/ forwarding to captured HTML. Only that GET will move; POST JSON/form mappings and all services/security/database remain unchanged. Native routes own canonical, trailing slash, .html and /index.html aliases; API paths never render this template.
- Provider/email/browser/live database execution is excluded. Media tests will use a task-owned absolute /tmp override. Production remains HOLD.

## Native authentication route family — in progress
- [x] Logical RED: 9 Spring tests failed with 0 errors/skips: missing MVC views, missing native fields/unavailable state and Flight requests accepted by the legacy renderer. Six Node tests failed with assertions that the native auth contract was missing.
- Parent ruling: registration must fail closed until server-side consent persistence/age gating is verified. Preserve its fields and unchecked legal/age controls but disable submit; core must reject registration with zero requests. Existing login remains available; browser acknowledgements must explicitly say they are not recorded. This replaces the initial registration row above and is a P0 source-contract gap for parent follow-up.
- [ ] Implement scoped native routes/client and catalog parity, then run focused and whole-suite gates.

### Native authentication implementation checkpoint
- [x] Native MVC/Thymeleaf owns all seven canonical routes and public HTML aliases, plus /login/providers aliases. Sensitive query values are never copied into HTML; responses are private/no-store/noindex with no-referrer and restrictive CSP. Existing LocalAuthController POST methods are byte-unchanged; only its HTML GET moved.
- [x] Login uses the existing fixed same-origin JSON API and accepts only its documented signed-in receipt. Duplicate in-flight posts are blocked, errors keep fields, confirmed account transitions/page exit clear private fields, and navigation is fixed to /. No caller identity header or persisted credential/proof data is introduced.
- [x] Registration fails closed at disabled fieldset, disabled submit and client action boundary. Recovery, reset, verification, email-change and deletion actions have no Spring APIs and present unavailable states without forms. Google is unavailable; the existing source-backed Discord link remains.
- [x] Added five-language labels and auth-scoped styles. Focused GREEN: 9 Spring tests, 0 failures/errors/skips; 15 Node auth/chrome tests passed. Client DOM RED separately observed 3 expected failures (missing submit binding, registration block and account-change clearing), followed by GREEN. Catalog parity initially exposed insertion-order mismatch, then a missing separator during relocation; both corrected and parity passes.
- Publication checkpoint 277bc325ff succeeded after providing explicit user AGENTS checkpoint-commit authorization to automatic approval review. The earlier rejection made no changes. A whole-file CSS replacement was also rejected; a narrow auth-only append succeeded without rewriting parent-owned styles.
- [ ] Final whole-suite test/bootJar, source self-review and parent independent review remain pending. Browser layout, live providers/email/database and deployment remain unverified; production HOLD.

## Native authentication route family — finished implementation
- [x] Completed the scoped MVC/template/client/catalog implementation and reviewed the exact diff against the brief. Only LocalAuthController's old HTML GET block changed; POST compatibility, identity services, security guards, database, environment and release files are unchanged.
- [x] Final full verification: **353 Spring tests across 76 suites, 0 failures/errors/skips; bootJar successful**. Command: `MONEYVERSE_STORAGE_PATH=/tmp/native-auth-ui-media-20261120 SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1`.
- [x] Final relevant Node verification: **216 tests passed, 0 failed/cancelled/skipped**. Command: `node --test scripts/native-auth.test.mjs scripts/native-wallet.test.mjs scripts/native-chrome.test.mjs scripts/admin-tools.test.mjs scripts/mv39-money.test.mjs scripts/release/*.test.mjs scripts/security/*.test.mjs`. Auth-specific suite has 9 cases; focused auth/shared chrome suite has 15.
- [x] Re-fetched main: unchanged at `08b1525ca76af514cd5fa2bddde33a784378352f`, still an ancestor. `git diff --check` and commit-trailer check pass. Full suite retains existing dependency/Gradle deprecation warnings; no test failures were omitted.
- Self-review confirms fixed same-origin login payload, documented receipt checks, duplicate-submit protection, error preservation, account-change clearing and no private browser storage. Registration has disabled fieldset/submit plus zero-request client rejection; missing actions contain no active form. All 31 new keys have five nonempty translations and server/client catalog parity passes. Human linguistic/layout review remains pending.
- Source gaps: verified consent persistence/age gating blocks native registration (P0 parent follow-up); recovery/reset/email verification/email-change/deletion APIs and email delivery receipts do not exist in the Spring controller tree; Google authorize source is incomplete. Existing API handlers remain unchanged. The existing Discord login flow is exposed without being executed or certified here.
- Independent parent review, exact-source browser/Test acceptance and release validation remain pending. No live provider/email/database traffic, service/configuration change, main merge, deletion or deployment was performed. Production remains **HOLD**.

### Native authentication final self-review correction — finished
- Self-review found the first disabled registration form did not retain the original nickname 2–20/password minimum 8 constraints and used generic field/action copy. Added a focused source-parity regression first: **1 test, 1 logical failure, 0 errors/skips** (missing original Korean nickname label). Restored those constraints and original email/nickname/register-password/login-submit/register-submit Korean strings without enabling registration.
- Final source now has **34 five-language auth keys**. The previous 353-test entry above belongs to the earlier candidate. Fresh final verification after this correction: **354 Spring tests across 76 suites, 0 failures/errors/skips; bootJar successful**, including **10 NativeAuthWebTest cases**. The same isolated full command was rerun.
- Fresh final relevant Node suite: **216 passed, 0 failed/cancelled/skipped**. Focused auth/chrome remains **15 passed**. No provider/email/live database/browser workflow was run. Independent review and deployment state remain pending/HOLD as recorded above.

## Native authentication review round 1 — before fix
- Independent review found auth palette overrides diverging from shared tokens, acknowledgement/legal/reset-help targets below or without 44px rules, replaced original page-specific Korean headings/leads, and an English-only navigation landmark. Verified the shared native palette and original registration/login-provider copy before changing source.
- [ ] Add failing stylesheet-projection and real MVC locale/copy/ARIA regressions, plus client language-change ARIA coverage.
- [ ] Use existing approved palette variables (including dark primary foreground), establish 44px label/link targets, restore original page-specific copy and localize the landmark.
- [ ] Run covering isolated Spring/Node tests, update exact review evidence, self-review and publish scoped fix; parent re-review and production HOLD remain.

## Native authentication review round 1 — in progress
- [x] Logical RED after fixing a test-only XML/HTML parser mismatch: 16 Spring cases, 6 logical failures, 0 errors/skips (page-specific heading and five-language landmark); Node 12 cases, 3 logical failures (runtime ARIA, native palette, missing 44px declarations), 9 existing passes. Production source was unchanged until logical RED was read.
- [x] Applied shared palette variables with dark primary foreground, added 44px acknowledgement/link targets, restored original page-specific headings/leads and added SSR/runtime five-language landmark localization. Missing-action notices and blocked registration are unchanged.
- [ ] Covering GREEN, exact diff self-review and parent re-review remain pending.

## Native authentication review round 1 — finished fix
- [x] All three Important findings and the Minor landmark issue are fixed in scoped source. Auth input/background/text/border/focus/checkbox/provider/primary styles use approved shared variables; primary foreground is the dark background token. Acknowledgement labels declare 44px minimum height; legal/reset-help links declare both 44px minimum height and width.
- [x] Original registration and login-provider Korean headings/leads are restored with page-specific five-language catalog keys. Unavailable routes omit the generic login lead and retain their unavailable notice. Account-help landmark is translated during SSR and language changes. Registration remains disabled; no action/API/guard changes.
- [x] Focused Spring command: `MONEYVERSE_STORAGE_PATH=/tmp/native-auth-ui-review1-media SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test --tests '*NativeAuthWebTest' --offline --no-daemon -Dorg.gradle.workers.max=1`. RED: 16 tests, 6 logical failures, 0 errors/skips. GREEN: **16 tests, 0 failures/errors/skips; BUILD SUCCESSFUL**.
- [x] Focused Node command: `node --test scripts/native-auth.test.mjs scripts/native-chrome.test.mjs scripts/native-wallet.test.mjs`. Auth-only RED: 12 cases, 3 logical failures and 9 passes. Covering GREEN: **24 tests passed, 0 failed/cancelled/skipped**. Auth-specific GREEN is 12 cases. Stylesheet projection verifies authored desktop declarations and custom-property values; it does not measure browser hit geometry.
- During verification the new dynamic Thymeleaf map-index expressions rendered empty heading/lead text. Catalog and built resources contained the values; explicit view-context map lookup fixed the one remaining real assertion failure. The intermediate full run had exactly that failure. Initial XPath assertions were corrected because HTML5 is not XML; CSS projection also normalizes semantically identical hexadecimal case. Expectations for original copy and approved palette were retained.
- [x] Final full command: `MONEYVERSE_STORAGE_PATH=/tmp/native-auth-ui-review1-media SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1`. Output: **BUILD SUCCESSFUL in 40s; 360 tests across 76 suites, 0 failures/errors/skips**, totals read from final JUnit XML.
- [x] Expanded Node command: `node --test scripts/native-auth.test.mjs scripts/native-wallet.test.mjs scripts/native-chrome.test.mjs scripts/admin-tools.test.mjs scripts/mv39-money.test.mjs scripts/release/*.test.mjs scripts/security/*.test.mjs`. Output: **219 tests, 219 passed, 0 failed/cancelled/skipped**.
- [x] Exact diff self-reviewed; `git diff --check` passes. No shared non-auth styles, backend identity/security services, database/environment/workflow, parent worktree or deployment changed. Browser/layout/computed hit geometry/provider/live database acceptance remains unverified. Parent re-review pending; production **HOLD**.

## Native auth integration — checkpoint
- Independent scoped round1 review approved all three Important UI fixes and the localized landmark. Auth branch tip483c053dce merged into the task branch; append-only worklog conflict combined both histories. No runtime source conflict.
- Refreshed native asset digests after catalog/CSS integration. Fresh integrated evidence: **388 Spring tests,0 failures/errors/skips, bootJar successful;220 Node tests passed,0 failed/skipped**.
- This is a task-branch integration checkpoint, not completion of all route families. Registration/recovery/provider gaps, real browser geometry/session continuity and exact-source Test/release remain unverified; production HOLD.
- Follow-up inspection found three remaining dynamic dictionary lookups that can resolve against the map rather than the page model. Add real rendered title/header/password-label regressions before the next UI correction.


## Native public tools/calculators/status — before work
- [x] Read actual controllers, pure calculation functions, collector service/policy, all five native templates and their tests plus approved November18 authority.
- [x] Confirmed isolated branch/base bad193 and fetched main unchanged at08b1525. Native scope is /tools, /calculators, /tools/compound-calculator, /tools/stock-calculator and /status; no captured tools are included as converted.
- [x] Recorded exact fields/defaults/limits/metrics/models, all17 destinations and original Korean copy in task report before implementation.
- [ ] Logical RED for shared chrome/five locales and native result/control preservation.
- [ ] Scoped templates/assets/catalogs, GREEN, full Spring/Node/build, source self-review and checkpoint publication.
- Status source failure stays503. No API/auth/SQL/schema/runtime/release changes. Browser/Test acceptance unavailable; production HOLD.

## Native public tools/calculators/status — in progress
- [x] Logical RED:35 real MVC cases,34 failures/0 errors/skips (missing shared uiLanguage/launcher/five-language headers and bindings). Existing hub destination/filter test passes; no failure was hidden.
- [x] Behavioral client RED:2 cases fail. Annual compounding fixture (1000 principal,100% rate,no deposits,one year) overwrites submitted2,000 with monthly2,613 after frequency change; language change leaves English label and hidden language unchanged.
- Ruling approved by parent: saved manual cookie > supported explicit lang deep-link compatibility > supported browser language > EN. Shared engine remains sole persisted preference. Remove incorrect competing client math, leave submitted results until explicit Calculate; no server arithmetic/rate change.
- [ ] Scoped implementation and full gates. Browser/Test acceptance and production remain HOLD.
## Native rendered copy / CI selection — before work, in progress and finished fix
- [x] Root independently tested the three suspected dynamic bindings. Five login document-title cases failed with literal `null`; the shared page header and original registration minimum-password label already rendered correctly and were preserved. Focused6 cases:5 logical RED failures→6GREEN.
- [x] Corrected only the confirmed document-title lookup to explicit page-model scope. No blind rewrite of the already-correct conditional bindings.
- [x] CI expansion to native-*.test.mjs exposed an old guard asserting the literal native-chrome filename. The new guard expands the actual command's file patterns and requires every tracked native test plus admin/money tests. No guard exemption was added. The intermediate Node/CI failure is recorded and not presented as a pass.
- [x] Fresh final isolated full test/JAR: **394 Spring tests,0 failures/errors/skips; BUILD SUCCESSFUL**. Full Node UI/security/release: **220 passed,0 failures/cancellations/skips**. Commands/logs: /tmp/nov18-native-copy-full.log and /tmp/nov18-native-copy-node.log. Existing Gradle/dependency warnings remain.
- Read-only HTTP recheck at15:25KST: production root200, public Test /api/version403. HTTP200 only confirms response availability, not feature or source identity. No current browser screenshot/click acceptance is claimed.
- Native public tools/calculators/status presentation is the next isolated in-progress task, based on bad193193e. Its source-control progress is separate until independent review/integration. The original dirty checkout remains untouched.

## Native messaging real-PostgreSQL gate — before work
- [ ] Add a dedicated tagged Java/JDBC integration task that fails without explicit disposable CI connection settings. Ordinary H2 tests exclude this task; do not report it as locally passed.
- [ ] Seed only synthetic users in a rollback-only CI transaction, switch to moneyverse_app, and execute the actual services/wrappers for ownership, stable retries, exact stored receipts and large sequences.
- [ ] Run it against the existing GitHub disposable PostgreSQL service after immutable migrations, with no new role grants/migrations or MiniPC/production SQL.
- [ ] Read mandatory CI results separately from H2/UI/JAR results; preserve browser/Test/production HOLD.

## Native messaging real-PostgreSQL gate — in progress
- [x] Added9 actual-service JDBC cases and a separate tagged Gradle task. Ordinary isolated suite remains394 tests,0 failures/errors/skips plus successful bootJar. These394 explicitly exclude the9 PostgreSQL cases.
- [x] Verified the dedicated task refuses this non-CI host:9 cases failed at the GitHub-only guard before any connection/SQL. This is expected safety-refusal evidence, not PostgreSQL verification and not a passing suite.
- Tests use a single rollback-only CI connection and SET LOCAL ROLE moneyverse_app. Test-only privileged fixture seeding is explicit; production application privileges remain unchanged. Large sequence fixture is above2^53, and raw-table privilege assertions accompany function behavior.
- [ ] Publish test-runner checkpoint and wire mandatory execution to the existing disposable CI PostgreSQL service; read actual9-case results. No production/MiniPC PostgreSQL connection was attempted.

## Native messaging CI authorization and browser preview — in progress
- Automatic approval review rejected the first workflow replacement for embedding a new database-password literal, then rejected the safer runtime-only addition because the replacement also contained unchanged existing disposable CI examples. No rejected workflow write was bypassed. Owner explicitly approved retaining the disposable CI examples; runtime-only service-credential update3047b02d6c and nine-executed/zero-skip coverage assertion7cb9890d95 were then accepted. No production credential was added or printed.
- Required real-PostgreSQL execution is now wired to the existing disposable service, after migrations. Read actual results before claiming a pass.
- IAB browser connection recovered. Read the actual existing production youth-leap scenario and opened its language menu; this is baseline production evidence, not the new native candidate. Existing screen mixes EN interface with Korean content and still uses the older cyan layout; native migration coverage remains explicit.
- [ ] Add a test-source-only loopback H2 preview launcher for actual candidate visual QA. Force test config, H2 datasource, loopback HTTP/socket binding and temporary media at command-line precedence, with explicit opt-in/source SHA. No production credentials/configuration, public listener or shared database.
- [ ] Access preview through a loopback-only approved SSH tunnel, verify rendered native pages and record screenshots. This preview does not replace the documented exact-source public Test/release gate, which still returns403.

## Actual PostgreSQL CI result and preview harness checkpoint
- [x] CI run44689405118 at7cb9890d959f03399c36c3e2ca83a94471362f95 succeeded. Read the actual runtime-check log: `{"nativePostgresMessaging":{"tests":9,"failures":0,"errors":0,"skipped":0}}`. This executes real SupportService/ChatService/PostgreSQL wrappers under app-role access, not JDBC doubles. Fixtures rolled back; no production/MiniPC SQL was run. Parallel concurrency and real-browser sending are not certified by sequential replay tests.
- [x] Added test-source-only preview launcher and explicit Gradle task. It refuses missing opt-in/source SHA and forces classpath test config, H2, localhost binding, empty bot token and temporary media through fixed command-line arguments. It is excluded from bootJar by test-source placement.
- [x] Preview harness compilation succeeded; full ordinary Spring test/JAR remains394 cases,0 failures/errors/skips, and Node UI/security/release220 passes. Actual preview browser checks follow after launching the isolated process/tunnel.
- Public-chrome independent review is in progress. Important missing status viewport metadata is being collected for the original implementer's scoped fix loop; unreviewed public changes are not integrated yet.

## Actual browser header regression — before work / in progress / finished fix
- Opened source3290a526bb in a test-classpath H2 preview through loopback-only SSH forwarding. Actual screenshot and DOM show an extra support header above the homepage; there are two support-heading IDs, only one inside the closed dialog.
- Root cause: Thymeleaf fragment selector header also selects the other header element in the shared template. Renamed the shared fragment pageHeader and adapted its native consumers; administrator chrome owns a separate header and was not changed.
- Regression for home/login/register:9 focused cases,3 logical RED failures (expected one support heading, observed two), then9 GREEN. Full isolated Spring test/JAR:397 tests,0 failures/errors/skips; Node220 passes,0 failures/skips. Preview was stopped before rebuilding; its own loopback listener is closed.
- Public task viewport fix98b0afa89d passed independent scoped re-review. Next integrate that reviewed task, adapt its shared-header consumers to the new fragment contract and rerun source/browser acceptance. No running production service was changed.

## Native public tools/calculators/status — finished implementation candidate
- [x] Existing5 native HTML paths use shared chrome/one gated support launcher, with192 scoped five-language keys in shared catalogs.17 destinations retained:2 existing native calculators,15 explicitly legacy/QA pending.
- [x] Exact fields/defaults/limits/frequency options, GET filters, server metrics/yearly rows and collector state/freshness/failure preserved. Pure calculation/collector service/policy are byte-unchanged. Invalid forms400, Flight406, unavailable collector503.
- [x] Only demonstrated mismatching client compound math removed; results stay last submitted until Calculate. Five-language VM cases retain unsent inputs, filters and results; labels/hidden locale/reset links/counts/title/ARIA update without reload/private storage.
- [x] Focused61 Spring cases,0 failures/errors/skips. Public39 cases additionally assert actual shared h1 strings for all25 route×locale combinations. Selected-option assertion corrected for attribute ordering after confirming actual selected state; count-translation RED1 failure/2 passes before GREEN.
- [x] FINAL isolated Spring:433 tests across81 suites,0 failures/errors/skips; bootJar successful, exit0. Command: MONEYVERSE_STORAGE_PATH=/tmp/native-public-chrome-media-20261120 SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1.
- [x] FINAL Node:228 passed,0 failed/cancelled/skipped. Command: node --test scripts/native-*.test.mjs scripts/admin-tools.test.mjs scripts/mv39-money.test.mjs scripts/release/*.test.mjs scripts/security/*.test.mjs. Public suite8; public/chrome/assets15.
- [x] Exact source/diff/content digests self-reviewed. Generator/integrity coverage includes mv28/mv29/mv30; existing mv43 edits are generated digest-only. Main unchanged at08b1525; parent44a773e942 incorporated as22a075d404 retaining both worklog histories.
- Shared markup/behavior unchanged. Suspected shared-header issue disproved by real rendered heading assertions. Existing catalog keys, auth/API/identity/security/SQL/schema/grants/runtime/release workflows and original dirty checkout unchanged by this scoped implementation.
- Independent parent review pending. Browser geometry/accessibility, human linguistic review, PostgreSQL live collector and exact-source Test/release acceptance unverified. No CUA workaround, main merge or deployment; production HOLD.

## Native public review round1 — before fix
- Independent review identified one Important finding: /status lost original UTF-8 and mobile viewport declarations. Confirmed actual status head and shared commonHead; no replacement metadata is present.
- [ ] Add rendered head regressions for all5 locales, requiring exactly one UTF-8 declaration and the original device-width/initial-scale/viewport-fit content. Observe logical RED before the narrow template fix.
- [ ] Restore original metadata, run focused covering Spring plus native asset/client Node checks, record exact results and publish scoped fix for re-review.
- No shared markup, controller/source logic, browser geometry or release claim is in this fix. Production HOLD.

## Native public review round1 — in progress
- [x] Logical RED:5 rendered /status locale cases,5 failures/0 errors/skips, each reporting missing device layout viewport. Production source was unchanged until this output was read.
- [ ] Restore the original one UTF-8 plus one device-width/initial-scale/viewport-fit declaration, then run covering checks and publish for re-review.

## Native public review round1 — finished fix candidate
- [x] Restored original UTF-8 and width=device-width,initial-scale=1,viewport-fit=cover declarations as one line in /status head. No shared markup or controller/client/asset content changed.
- [x] New rendered regression checks /status in all5 locales: exactly one original viewport and exactly one UTF-8 declaration. Logical RED5 failures/0 errors/skips; covering GREEN66 tests/0 failures/errors/skips, including44 NativePublicChromeTest cases.
- Spring covering command: MONEYVERSE_STORAGE_PATH=/tmp/native-public-chrome-media-20261120 SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 ./gradlew test --tests '*NativePublicChromeTest' --tests '*SpringNativeCalculatorUiTest' --tests '*SpringNativeToolHubTest' --tests '*StatusSourceTruth*Test' --tests '*SpringCalculatorMathUnitTest' --offline --no-daemon -Dorg.gradle.workers.max=1. BUILD SUCCESSFUL in27s, exit0. RED used only --tests '*NativePublicChromeTest.statusHeadKeepsExactlyOneOriginalMobileViewportAndUtf8*', exit1 with expected missing-device-viewport assertions.
- [x] Node native client/shared chrome/asset integrity:15 passed,0 failed/cancelled/skipped. Command: node --test scripts/native-public.test.mjs scripts/native-assets.test.mjs scripts/native-chrome.test.mjs. git diff --check passes; main remains08b1525.
- Full433-test/bootJar and228-Node evidence above belongs to the prior candidate; full suite was not repeated for this metadata-only fix under the review instruction. Scoped re-review remains pending. No browser geometry or release acceptance claimed; production HOLD.

## Reviewed public-page integration — checkpoint
- Independent public task review found missing viewport/UTF-8 metadata on status. Original implementer fix98b0afa89d observed five logical RED cases, then66 focused Spring/15 Node GREEN; scoped re-review approved, no new findings. Fix round1/5:1 addressed,0 open.
- Integrated the reviewed public branch. Preserved both append-only worklog histories and verified the shared test version contains every child test plus root duplicate-heading regressions before resolving add/add.
- Added the duplicate-heading assertion to25 public route/language cases:25 logical RED failures with old generic header selector. Adapted five public template consumers to pageHeader. No computation/status source method changed.
- Fresh integrated full verification:441 Spring tests,0 failures/errors/skips, bootJar successful;228 Node UI/security/release tests passed with0 failures/skips; asset generator changed0 references and integrity checks passed. Source test/JAR and Node logs: /tmp/nov18-native-public-integrated-full.log and /tmp/nov18-native-public-integrated-node.log.
- Actual browser acceptance continues after restarting the stopped isolated H2 preview on this integrated source. Real PostgreSQL service gate passed9/9 at ancestor7cb9890d95; newest CI will rerun. Exact-source public Test remains403; production HOLD.

## Native member messaging pages — before work
- [x] Read full actual AGENTS, approved authority/plan/brief, original support/chat pages/forms/room controls, actual Spring controllers/services/DTOs/MessageContract, native wallet/auth/session/locale/chrome/test patterns.
- [x] Isolated approved base8746cd5131dd4e74a901bd033bb310e03c5c38af. Original dirty checkout untouched. Fetched origin/main now a9b1070d1091191c5fe2b68b2759f24762be780a; parent notified of advancement before implementation.
- [x] Inventory: member-only /support and /chat plus /, .html, /index.html aliases; selected thread/conversationId/peer query values must resolve from verified owner lists. No original dynamic page path. Original transcript/{id} and /text routes are separate exports, not private page aliases.
- [x] Support controls: new subject/body/start; status, title search, sort, inclusive Korea-time last-message date range max366 days; selection, recent100 summary, CSV/TXT downloads, reply/send. Spring list caps50 from latest100; keep local display filters with explicit latest50 disclosure and sample100 summary. Export only loaded verified max500 messages, safely escaped.
- [x] Chat controls: existing conversations/search/select/back/refresh/history/send; new DM/user search, archived view/archive, mute, block/unblock, report and image upload have no reviewed Spring endpoints and remain visibly disabled with explanation. No automatic peer creation, staff private-DM browse or optimistic unread updates.
- [ ] Real rendered HTTP and independently authored client-core/binding regressions RED.
- [ ] Native implementation, focused GREEN/full Spring test+bootJar/Node/security/release, self-review and scoped checkpoint.
- No backend/auth/SQL/schema/grants or production changes. Global cross-navigation drafts, authenticated browser and exact-source public Test403/release acceptance remain OPEN; production HOLD.

## Native member messaging pages — in progress
- [x] HTTP logical RED:10 tests,10 failures (captured routes lack native templates/privacy/member redirects/controls/Flight refusal). Command: test --tests '*NativeMessagingWebTest' with test profile/loopback/task temp media; /tmp/native-messaging-http-red.log.
- [x] Client RED:9 cases fail the explicit missing-native-core assertion; source-constraint case fails on absent binding file. No old client was represented as verified. Implementing independently hand-authored real DTO fixtures and async receipt/session state.
- Parent confirms fixed base pending root integration, local sample filtering with KST boundaries and formula-safe CSV export. No main integration in this child.

- [x] First focused HTTP GREEN:10 tests,0 failures/errors/skips. Initial binding run9 passed/3 failed traced to VM inventory omitting h3 tag digits; corrected harness, not product assertions. Account-change test now asserts no private article after transition while allowing safe empty-state text.
- [x] Self-inspection added2 logical RED focus-race cases (12 passed/2 failed): same-owner refresh erased reply draft; a shared read generation suppressed a verified mutation result and could leave a delivered body available. Separate private-owner generation from read epochs and restore history without resetting same-target drafts.

- [x] Added existing-DM/forged-selection/five-language draft/exact-bigint binding and actual Blob CSV formula-safety checks. Java-vs-JavaScript whitespace test exposed real U+001C blank mismatch (RED), corrected to Java whitespace set; ASCII-only edge trim remains exact. CSV assertion initially tested literal backslash-r rather than fixture carriage return, corrected that test expectation.

- [x] Focused messaging GREEN16/16 Node cases,0 failures/skips. Broader Node run exposed catalog insertion-order parity (client keys prepended vs server appended); existing parity compares serialized ordered dictionaries. Moved only new messaging entries to matching append position; no parity exemption.
- [ ] Full Spring/bootJar and expanded Node final gates, scoped checkpoint and independent parent review.

- [x] Clean full Spring rerun451 tests,0 failures/errors/skips, bootJar successful exit0. Prior wrapper printed BUILD SUCCESSFUL but had a shell exit quoting error; rerun used a readable shell script with correct status propagation and final JUnit totals.
- [x] Final source review found original query-filter initialization and source-independent chronological transcript ordering missing. Added2 logical RED regressions before scoped fix. Query search stays local and is never included in source fetch URLs.

## Native member messaging pages — implementation checkpoint
- [x] Native member-only support/chat aliases, singular shared chrome, five locale catalogs and exact reviewed DTO/receipt/session/CSRF paths implemented.18 executable messaging cases pass;10 real rendered HTTP cases pass.
- [x] Prior full Spring451/0 failures/errors/skips and Node244/244 passed. Final query/ordering corrections have focused18/18 evidence; rerunning whole gates after final asset generation before completion report.
- [x] Source review verified all9 existing-template changes are asset-query SHA256 digests only; all preexisting locale keys/values unchanged. No shared chrome/backend API/security/SQL/schema/grant/runtime or original dirty-checkout modifications.
- [ ] Independent parent review and final exact-source full gates. Browser geometry/authenticated-browser/source-success acceptance and global cross-navigation memory-only draft shell remain OPEN. Production HOLD; no main integration/deployment.

## Native member messaging pages — finished implementation candidate
- [x] Final exact-source Spring command (test profile, loopback, task temporary media): ./gradlew test bootJar --offline --no-daemon -Dorg.gradle.workers.max=1. **451 tests,0 failures/errors/skips; bootJar BUILD SUCCESSFUL**. Actual full run54s after final source checkpoint; /tmp/native-messaging-final.log. Shell wrapper had a trailing-CR error after reporting all gate exits0; independent Python subprocess confirmation then returned **Spring exit0**, tasks up-to-date7s, with identical final JUnit totals. No test failure was hidden.
- [x] Final expanded Node command: node --test scripts/native-*.test.mjs scripts/admin-tools.test.mjs scripts/mv39-money.test.mjs scripts/release/*.test.mjs scripts/security/*.test.mjs. **246 passed,0 failed/cancelled/skipped**, including18 messaging cases. Clean-process logs /tmp/native-messaging-node-final-clean.log and /tmp/native-messaging-spring-final-clean.log. git diff --check exit0; asset generator changed0 final references.
- [x] Correction to initial shorthand RED entry: original client run was9 total failures (8 explicit missing-core assertions plus1 absent-binding source check), not9 core failures plus another. Subsequent executable binding RED8 pass/4 fail; logical focus regressions12 pass/2 fail; Java blank semantics14 pass/2 fail including a corrected CSV test literal; query/chronology16 pass/2 fail; final18/18 GREEN. HTTP10 logical RED→10 GREEN.
- [x] Scoped source self-review checks actual DTO interfaces; UUID targets come only from verified owner lists; receipts bind exact owner/target/body/subject/date and bigint sequence. Unknown intents cannot change content/key, double submits post once, same-owner focus preserves retry/draft, changed-owner/stale reads cannot display prior text. CSV quotes and apostrophe-prefixes all cells including whitespace/control-leading formulas.
- [x] Source checkpoint32ea9618139493594e183fea8fd22382b8f405bd published while implementation review/full validation were in progress; final evidence checkpoint follows on the same ordinary task branch. Original dirty checkout untouched. Main refreshed unchanged at a9b1070d1091191c5fe2b68b2759f24762be780a during final gates; parent explicitly owns safe current-main integration.
- [ ] Independent parent spec/code review, authenticated browser layout/44px/computed geometry/five-language linguistic acceptance, global cross-navigation memory-only drafts, simultaneous live concurrency and exact-source public Test/release remain OPEN. Parent requested browser inspection after safe integration. Existing9 real Java/PostgreSQL service cases passed in separate ancestor CI7cb9890d95; not rerun or claimed as local H2 evidence here.
- Deployment state: **not merged to main, not deployed; production HOLD**. Native-page implementation with tested source/receipt state is not global messaging completion. Missing Spring DM/open/read/archive/mute/block/report/upload actions remain visibly unavailable; no backend API/auth/SQL/schema/grant/role/production changes.
