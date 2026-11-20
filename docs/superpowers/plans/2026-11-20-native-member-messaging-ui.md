# Native member support and existing direct-message pages

> Execute with Superpowers subagent-driven-development and TDD. Owner approved November18 frontend implementation and ordinary task-branch checkpoint publication. No new discovery approval is required.

**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md
**Goal:** Replace captured member support/chat pages with real Spring MVC/Thymeleaf pages consuming the reviewed session-owned APIs and canonical receipts. This is the native-page stage of messaging; the global cross-navigation memory-only draft shell remains an explicit subsequent gate, not a completed claim.
**Base:**8746cd5131dd4e74a901bd033bb310e03c5c38af, isolated MiniPC worktree and feat/native-member-messaging-ui-v20261120 branch.

## Constraints / contracts
- Read full actualAGENTS, authority, original Next support/chat pages and existing static sources, reviewed SupportController/SupportService/ChatController/ChatService/DTO/MessageContract, native wallet/auth client session patterns and tests before changes. Record exact route/control/source inventory.
- MemberApiGuard derives actor from verified session; raw proof bootstrap is /api/auth/session. Never add identity headers, hardcoded users, substitute keys, new grants/SQL/schema/migrations or alternate stores. Backend API code is parent-owned in this UI task.
- Support GET /api/v1/support/threads[?status], GET /threads/summary (latest100 sample), GET /threads/{id}/messages; POST /threads with {idempotencyKey,subject,body}; POST /threads/{id}/messages with {idempotencyKey,body}. Include X-CSRF-Token and optional matching Idempotency-Key. Thread receipt must match canonical owner/subject/UUID/timestamps; reply receipt must match owner/thread/body/UUID/timestamp. Services already verify stored creation intent and exact reply receipt.
- Chat GET /api/v1/chat/conversations, /unread-count, /conversations/{id}/messages; POST /conversations/{id}/messages with {body,idempotencyKey} and proof/key. Receipt must match owner/conversation/body/messageUUID/timestamp and positive bigint sequence STRING. No number coercion for sequences/money.
- Only existing conversations can be used. Opening new DM, marking read/archive/block/report/upload has no reviewed Spring endpoint here: preserve clear unavailable affordance where original has it, never optimistic fake success or silently ignored button. Do not invent a recipient UUID or imply staff can browse private member DMs.
- Each body nonblank, maximum1000 Unicode codepoints, no truncation/NUL/unpaired surrogate. Respect existing chat no-control restriction. Preserve support newlines. Match server ASCII-edge-space normalization. Subject1..120. Counter must count codepoints, not UTF16 units; native maxlength must not reject legitimate1000emoji.
- Stable caller UUID belongs to exact owner/route/body intent. Double submit posts once. Unknown/network/malformed response keeps the same pending intent/key and body for retry and prevents altered-intent retry. Clear only on verified matching receipt or explicit safe owner transition; no automatic send/retry on page load or language change.
- Render all user/source content with textContent/escaped templates. No raw error/SQL bodies, sensitive query logging, private browser storage or persistent drafts. Refresh session before mutations; clear fields/history/proof/key on logout/account change, abort stale reads and suppress stale completions. Language changes preserve editable fields and pending intent.
- EN/KO/JA/ZH/VI catalog parity, approved fixed palette,44px controls, one shared56px launcher/mobile safe area. Shared fragment name is pageHeader (generic header produced duplicates and is fixed). Use existing chrome fragments; do NOT edit shared/chrome.html, chrome.js, chrome.css or existing home/admin/wallet/auth/public markup, except generator-created asset-query digest-only updates.
- Use family-scoped message keys/assets, extend UiLocale only for exact native routes. Do not change existing product Korean copy casually; preserve original labels from source. No capturedNext/Flight renderer or second locale engine.
- Keep original dirty checkout untouched. No production process, shared DB, credential, role, release workflow or main changes. Test profile + explicit task-owned temporary media for all tests. Actual PostgreSQL9-case owner/replay/receipt gate passed at7cb9890d95; simultaneous concurrency/browser messaging/Test403 remain unverified.

## Task 1: Native messaging pages and exact client state
Files: new spring-backend/src/main/java/com/moneyverse/api/domain/web/NativeMessagingPageController.java; templates/mv43/support.html and chat.html; static/assets/mv43/messaging-core.js,messaging.js,messaging.css; domain/web/UiLocale.java; ui/mv43-copy.json and static/assets/mv39/i18n.js; new NativeMessagingWebTest.java and scripts/native-messaging.test.mjs; docs/worklog/2026-11-20-nov18-design-integrate.md.
Interfaces: controller renders source-owned private/member state and exact routes/UUID aliases identified from original pages; client reads only existing session-owned APIs; missing source is loading/unavailable/denied/empty as truthful, not zero/fake messages. Shared header/nav/support remain singular.
1. Inventory original canonical/alias/dynamic routes, controls, permissions and Korean copy; write before-work checklist/report before implementation. Preserve original member/guest access semantics; when uncertain bring evidence to parent, no user approval loop.
2. Write real HTTP regressions for native template identity, aliases, guest/forged-header refusal, five locales/cookie precedence, no-store/noindex/Flight refusal, exact original controls and singular headings/launcher. Observe logical RED against captures.
3. Write executable client-core/binding tests with independently hand-authored real API fixtures: missing/foreign receipts, stable unknown retries, double submit, exact sequence text >2^53,1000codepoint boundary, safe rendering, language-change field retention, stale read/owner-change clearing. Observe logical RED before production implementation.
4. Implement native list/new-thread/reply and existing-DM selection/history/send/refresh with real receipts. Display bounded support counts as recent sample; no invented unread updates. Missing actions visibly unavailable. No actual user message sent during development tests.
5. Run focused tests then entire isolated Spring test bootJar and Node native/admin/money/release/security suites, diffcheck. Run asset generator so each branch passes its own integrity gate; generated version-only changes to other native templates are authorized. Report exact failures/skips and limits. Commit/push only scoped ordinary task branch checkpoints, append before/inprogress/finished worklog and same .superpowers report. Do not integrate main/deploy.
Expected: real native page UI with guarded API/state/receipt tests, source-backed list and mutations, honest missing controls; no claim global memory retention across full navigation is finished.

## Review Focus
- Each screen can name function arguments from real owner-scoped lists; no dead write-only form or invented recipient/thread.
- Actual API envelope/field naming/receipts are matched, not only synthetic internal shapes; unknown outcomes do not get a new key or a false sent state.
- Auth/CSRF/owner transitions and asynchronous completions cannot expose another account's private text; no private storage, raw URL or error leaks.
-1000codepoints, sequence precision, source counts, locale field preservation, originalcopy and singular native chrome; missing backend actions remain honest.
- Global draft retention, actual authenticated browser acceptance and exact-source Test/production remain OPEN in report/worklog, not silently discarded.

## Review round1 — authorized owner-binding correction
Ruling before implementation: session reproof alone cannot bind an ownerless DTO when cookies switch A→B→A. Narrow approved exception to prior UI-only API scope: SupportController and ChatController may add X-MV-Owner RESPONSE headers solely from the MemberApiGuard session-derived actor on successful private GET responses, with private/no-store and Vary: Cookie. Anonymous/denied/error responses must carry no owner header. No incoming identity header/override, service/SQL/RBAC/CSRF/auth change.
The client must validate that exact response-owner header equals the originally active owner, then reprove session after each list/history/summary read before publishing. Missing/malformed/foreign owner headers fail closed; older servers/proxies without the header remain unavailable until coordinated same-source rollout. Deferred A→B and A→B→A cases must never publish wrong-owner lists/history.
Review also requires original-owner/privateEpoch recheck after post-send load, and one shared exact Java blank predicate for NBSP support subjects in input and stored source.
- [x] Read independent review and verified all3 Important findings against actual source/guard/DTOs.
- [ ] Add HTTP response-owner/no-owner-on-denial and deferred/ABA client regressions; observe RED.
- [ ] Minimal scoped fixes; focused/full gates; publish fix and report for scoped re-review.
No unsafe-current-main merge, real user messages, browser acceptance or release claim.

Review round1 execution:3 Important findings fixed; focused24 Spring/26 client cases GREEN, full453 Spring/254 Node GREEN,0 failures/errors/skips. Response-owner compatibility gate is mandatory; missing stamp remains unavailable until same-source rollout. Scoped independent re-review and browser/Test/release acceptance pending.

## Native messaging review round2 — before work
- [x] Verified whole-branch integration finding against actual source: messaging.js loads before shared chrome.js, and chrome localize later rewrites every data-i18n node. Component-owned ready state, selected subject and retry labels still carry static translation keys.
- [x] Verified second Important finding against established mv39 app.js renderAuthControls/site.css: account/profile/logout classes and topbar.member-authenticated select44px sizing, long-name ellipsis and <=480px second-row wrapping; messaging's bare anchors/custom logout omit that contract.
- [ ] Add actual locale/core/messaging/chrome scripts in template order on one shared DOM with real template data-i18n/fragment IDs. Observe RED for ready/selected heading/retry plus account classes/transition contract.
- [ ] Remove only shared-localizer ownership from messaging-rendered dynamic nodes while preserving initial escaped SSR fallback; reuse established account classes and member-authenticated toggle, no shared chrome/CSS changes.
- [ ] Focused Node/HTTP, appropriate full gates, report and checkpoint for scoped re-review. Fixed child base retained; no blind main merge or parent-root edit.
Browser geometry, global cross-navigation drafts, authenticated delivery and Test/release remain OPEN.

Round2 execution: Important I1/I2 fixed with actual4-script shared-DOM integration tests,34 client/29 focused Spring GREEN. Parent explicitly assigned minor M1/M3, both resolved; M2 remains parent-owned. Full458 Spring+bootJar/262 Node GREEN,0 failures/errors/skips. Shared chrome/CSS untouched; scoped re-review and actual browser geometry/release acceptance remain open.
