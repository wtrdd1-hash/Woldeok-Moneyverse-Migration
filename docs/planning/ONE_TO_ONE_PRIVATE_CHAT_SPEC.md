# Woldeok Moneyverse — One-to-One Private Chat Specification

> Version: v2026.09.21.323
> Status: **URGENT / P0 product-planning priority**
> Date: 2026-09-21
> Parent plan: `PROJECT_PLAN.md`
> Korean counterpart: [ONE_TO_ONE_PRIVATE_CHAT_SPEC.ko.md](ONE_TO_ONE_PRIVATE_CHAT_SPEC.ko.md)
> Change type: planning/documentation only. Runtime, DB, API, realtime infrastructure and Production behavior remain unchanged until implementation gates pass.

## 1. Urgent objective
Implement a safe, reliable, mobile-first one-to-one private chat system between authenticated Moneyverse members. This work is **URGENT / P0** because private communication affects account safety, abuse handling, privacy, notifications, member retention and future social features. It must not ship as a thin frontend-only messenger.

The minimum viable outcome is not simply “messages can be sent.” Two eligible members must be able to start or continue exactly one private conversation, messages must be server-authoritative and recoverable, blocking/reporting must act immediately, privacy-sensitive data must not leak, and reconnect/session/error states must be deterministic.

## 2. Initial release scope
Included:
- authenticated member-to-member text chat;
- one canonical 1:1 conversation per eligible pair unless policy later allows multiple threads;
- conversation list, unread counts and paginated history;
- send, retry, server acknowledgement and read state;
- realtime delivery plus authoritative reconnect recovery;
- user DM permission setting;
- blocking, muting and reporting;
- privacy-minimized notifications;
- moderator evidence workflow;
- responsive mobile/tablet/desktop UI;
- accessibility, abuse controls, rate limits and security telemetry.

Explicitly excluded from the first release:
- group or anonymous chat, public rooms, voice/video;
- file transfer and chat-based WLD/WDX transfer;
- disappearing messages;
- end-to-end-encryption claims;
- AI impersonation or automated user-to-user messages;
- unrestricted administrator browsing of private conversations.

## 3. Core authority rules
1. Backend owns conversation membership, message authorship, ordering, delivery/read state and moderation state.
2. A 1:1 thread contains exactly two member principals; clients cannot add a third participant.
3. A user may read only conversations where the server confirms active participation.
4. A user may send only as their authenticated identity.
5. A blocked pair cannot exchange new messages in either direction.
6. A message is never shown as delivered until server persistence is acknowledged.
7. Realtime transport is an optimization, never the source of truth.
8. Read state is monotonic per participant and cannot be advanced for another user.
9. User-visible archive/delete is distinct from moderation/audit retention.
10. Private chat is noindex and must not feed public profiles, rankings, SEO or advertising targeting by default.

## 4. Eligibility and initiation
Before conversation creation or send, the server evaluates an interaction policy using account state, DM preference, block relation, moderation restrictions, suspension, rollout flags and any approved age/safety eligibility rules.

Suggested normalized result:
`DmEligibility { allowed, code, retryAfter?, policyVersion }`

The client must show only a safe generic denial message, must not expose peer age-verification/moderation/security attributes, and must not infer a sensitive reason such as “this user blocked you” unless policy explicitly permits disclosure.

## 5. Data model
Conversation fields should include:
- UUID id;
- participant_a_id and participant_b_id;
- normalized participant-pair key;
- created_at and last_message_at;
- active/restricted/closed state;
- policy_version;
- latest server sequence.

If the product uses one thread per pair, enforce uniqueness on the normalized participant pair.

Message fields should include:
- UUID id;
- conversation_id;
- sender_id;
- server-assigned monotonic sequence;
- bounded text body;
- message_type initially restricted to text;
- created_at;
- moderation visibility/state;
- idempotency key scoped to sender and conversation.

Per-participant state should include last-read sequence, archive status, mute status, notification override and any safe cached unread state.

Separate safety entities should hold blocks, reports, moderation evidence references, abuse/rate-limit state and privileged-content-access audit events.

## 6. API contract
Suggested endpoints:
- `POST /api/v1/chat/conversations` — create/get canonical eligible thread;
- `GET /api/v1/chat/conversations` — cursor-paginated list;
- `GET /api/v1/chat/conversations/:id/messages` — cursor/sequence history;
- `POST /api/v1/chat/conversations/:id/messages` — send with idempotency key;
- `POST /api/v1/chat/conversations/:id/read` — advance own read sequence only;
- `POST /api/v1/chat/conversations/:id/mute`;
- `POST /api/v1/chat/users/:id/block`;
- `DELETE /api/v1/chat/users/:id/block`;
- `POST /api/v1/chat/conversations/:id/report`;
- `GET/PUT /api/v1/account/privacy/direct-messages`.

All endpoints require authentication, object-level authorization, bounded inputs, stable error envelopes and privacy-safe logs.

## 7. Idempotency, ordering and concurrency
Sending requires a client-generated idempotency key. Repeating the same principal/conversation/key must return the original committed message rather than create duplicates. The same key with a different body must fail closed.

The server assigns message sequence numbers. Client clocks never define ordering. Concurrent sends, retry races, read updates, block-during-send and session-expiry races require dedicated integration tests.

## 8. Realtime transport and reconnect
WebSocket, SSE or equivalent may deliver:
- message.created;
- conversation.read;
- conversation.restricted;
- notification/mute updates where needed;
- resync hints.

Realtime connections must authenticate the session and authorize every conversation subscription. Arbitrary conversation-ID subscription is prohibited.

On disconnect the client must:
1. show reconnecting state without inventing delivery;
2. reconnect with bounded backoff;
3. fetch authoritative delta after the last confirmed sequence;
4. deduplicate by message ID/sequence;
5. reconcile unread/read state.

Realtime outage must degrade safely to API refresh/polling rather than losing committed messages.

## 9. Conversation and composer UX
Desktop may use a split list/thread layout. Mobile uses separate list/thread navigation states and preserves list scroll/back state.

The composer must:
- remain usable above the virtual keyboard and safe area;
- reject empty/whitespace-only messages;
- enforce a bounded length;
- show sending/failed/retry states;
- avoid accidental send during Korean IME composition;
- work without horizontal overflow at 320/360/390px.

Core surfaces need deterministic loading, empty, restricted, blocked, offline, reconnecting, expired-session and server-error states.

## 10. Conversation list privacy
List rows may use public-safe display name/avatar, privacy-minimized latest-message preview, server-derived time, unread badge and mute state.

Never expose balances, holdings, debt, private friend/club graph, account-security state, age-verification detail or moderation flags in chat discovery/list surfaces.

## 11. Read receipts and presence
Read receipts are optional and policy-controlled. If enabled, disclose only minimum useful state such as whether the sender's latest message is read.

Do not ship continuous presence or precise “last seen” by default. Any future presence feature requires a separate privacy and anti-stalking review.

## 12. Blocking
Blocking is a server safety primitive, not a UI filter. It must:
- immediately reject new sends in both directions;
- prevent new conversation initiation;
- suppress push/in-app notifications from the blocked peer;
- disable relevant interaction entry points;
- preserve historical data according to retention policy;
- preserve moderation evidence;
- avoid leaking block existence where disclosure can facilitate harassment.

Unblocking must not retroactively deliver messages attempted during the block period.

## 13. Muting
Mute suppresses notifications only. It does not change authorization or storage. It is per user, reversible and independent from blocking.

## 14. Reporting and moderation
A report should capture reporter, conversation, selected message IDs or bounded evidence window, reason category, optional note, server timestamp and policy version.

Submitted evidence is immutable except for moderation-status transitions.

Moderator tooling must be report/evidence-centered, least-privilege and audited. Every exceptional message-content access records who accessed what, when and why. Unrestricted casual browsing of private conversations is prohibited.

## 15. Age-sensitive safety
Private messaging is high-risk for age-sensitive users. Before Production enablement, explicitly decide:
- who may DM whom;
- whether verification/age tiers affect initiation;
- adult/minor interaction boundaries;
- unsolicited-message limits;
- link restrictions;
- escalation paths;
- evidence/retention rules.

Enforcement belongs on the server. Peer exact age/verification status must not be disclosed to unauthorized users.

## 16. Abuse and spam controls
Minimum controls:
- per-account send rate limit;
- per-conversation burst limit;
- new-conversation creation limit;
- proportionate duplicate/repetition detection;
- URL/link policy;
- oversized payload rejection;
- suspicious automation/replay telemetry;
- escalating throttles;
- suspension integration.

## 17. Notifications
Integrate with existing privacy/notification settings. Default payloads should minimize message content and respect lock-screen privacy.

Do not notify when the peer is blocked, the conversation is muted, the recipient is ineligible/restricted, or the message was not committed.

## 18. Logging and analytics
Allowed: outcome code, latency, message-size bucket, reconnect/delivery counts, rate-limit events, error codes and aggregated usage metrics.

Forbidden in normal logs/analytics: raw message bodies, private transcripts, auth tokens, cookies, CSRF secrets and unnecessary peer-sensitive attributes.

## 19. Retention and deletion
Define separate policies for normal message retention, archive/hide, account deletion, reported evidence, security/legal hold where applicable and backup retention.

Account deletion must not break referential integrity or silently erase required moderation evidence. User-facing privacy documentation must accurately state what is deleted, anonymized or retained.

## 20. Security release blockers
Negative tests must cover:
- BOLA/cross-account conversation access;
- forged sender ID;
- arbitrary realtime subscription;
- state-changing CSRF where applicable;
- replayed send;
- same idempotency key with altered body;
- block bypass;
- XSS/injection through message text;
- oversized payload/resource exhaustion;
- cursor tampering;
- modifying another user's read state;
- privilege escalation into moderation APIs;
- private content leaking into logs or notifications.

Stored/rendered message text must be safely encoded. Rich text and URLs require dedicated sanitization before later enablement.

## 21. Accessibility
Required: keyboard navigation, visible focus, semantic forms/buttons, non-noisy status announcements, WCAG 2.2 AA text contrast, zoom/reflow, reduced motion, and screen-reader labels for unread/mute/failed-send/report actions.

## 22. Performance and reliability
Plan for bounded list/history queries, indexes for participant lookup, conversation recency, conversation+sequence and report queue, no N+1 profile lookup, reconnect delta rather than unbounded history reload, realtime backpressure and safe degraded mode.

## 23. Operations and admin metrics
Expose content-free operational metrics such as realtime health, send success/error rate, delivery lag, reconnect rate, rate-limit events, report queue age, moderation SLA and notification failure rate.

Infrastructure failure, moderation restriction and user block/mute states must remain distinct.

## 24. Rollout and kill switch
Use server-controlled rollout:
1. schema/API dark launch;
2. staff/test accounts;
3. isolated Test E2E;
4. approved limited cohort;
5. broader rollout after safety/reliability evidence.

A kill switch must stop new DM initiation/sends without corrupting stored history or unrelated services.

## 25. QA matrix
Functional: create/reuse thread, send/receive, pagination, unread/read, mute, block/unblock, report, archive, notifications.

Concurrency: simultaneous sends, simultaneous reads, duplicate retries, reconnect during send, block while send is in flight, session expiry during realtime connection.

Responsive: 320/360/390/768/1024/1280/1440 CSS px, supported Android/iOS browsers, Korean IME, landscape, virtual keyboard and zoom/reflow.

Privacy/security: all section-20 negative tests, noindex, private-content log scan, notification privacy and admin evidence-access audit.

## 26. Production release gates
Production is blocked unless all are true:
- latest authoritative plan re-read before implementation and again mid-work;
- schema forward migration plus compatibility/rollback strategy verified;
- backend/unit/integration tests pass;
- exact candidate SHA deployed to isolated Test;
- authenticated cross-account E2E passes;
- realtime disconnect/reconnect recovery passes;
- block/report/rate-limit behavior passes;
- mobile responsive/accessibility QA passes;
- zero unresolved critical privacy/security findings;
- existing authenticated sessions and critical flows do not regress;
- exact merged SHA is rebuilt;
- zero-downtime Production promotion succeeds;
- post-promotion health/API/realtime/session smoke passes.

## 27. Rollback
Rollback must disable new sends/entry points by server policy, stop chat realtime fanout without harming unrelated services, preserve committed data and moderation evidence, restore a compatible frontend/backend release, and verify existing sessions remain valid.

## 28. URGENT implementation order
1. **v2026.09.20.305-01 P0:** schema, retention, interaction-policy and age/safety contract.
2. **v2026.09.20.305-02 P0:** DB migrations, repository/service, authorization, idempotency and API.
3. **v2026.09.20.305-03 P0:** authenticated realtime channel, ordering, reconnect recovery and backpressure.
4. **v2026.09.20.305-04 P0:** responsive conversation list/thread/composer/read-state UI.
5. **v2026.09.20.305-05 P0:** block, mute, report, notification and moderator-evidence integration.
6. **v2026.09.20.305-06 P0:** security/privacy/abuse/concurrency/mobile/accessibility E2E.
7. **v2026.09.20.305-07 P0:** latest-plan re-read, exact-SHA Test, rollback drill and zero-downtime Production promotion.

## 29. Cross-surface direct-message entry points — v2026.09.21.323
Private messaging must be reachable from the member context where another user is encountered, without creating a separate authorization model per surface.

Required first-party entry points:
- public board post author identity;
- public board comment/reply author identity;
- member profile/header;
- member ID/username/nickname search result;
- eligible member directory/list rows where such a directory already exists;
- other authenticated user chips/cards only when the displayed identity resolves to one canonical member ID.

Every entry point must resolve the target to an immutable server-side member ID before conversation creation. Display names, nicknames, usernames, post IDs or comment IDs are discovery context only and must never become authorization keys.

### 29.1 Entry-point interaction flow
1. User activates the message action from a post, comment, profile, search result or member row.
2. Client sends only the canonical target member ID plus optional non-authoritative source context.
3. Server re-evaluates authenticated principal, self-target rejection, account state, DM preference, block relation, moderation restrictions, age/safety eligibility, rollout state and rate limits.
4. If allowed, server returns the existing canonical conversation or creates it idempotently.
5. Client opens the canonical conversation screen. Message delivery is shown only after the send request is committed.
6. If denied, client shows a generic privacy-safe unavailable state and does not reveal block, age, moderation or security details about the peer.

### 29.2 Board-specific rules
- Board post/comment actions bind to authoritative author_user_id, not rendered nickname text.
- Deleted, anonymized, suspended or system-authored content must not expose a stale message action.
- If content survives account deletion/anonymization, direct-message initiation is removed unless a live eligible member principal still exists.
- Quoted/reposted content messages the explicitly selected displayed author and never infers a recipient from quoted text.
- Board moderation and DM moderation remain separate. Removing a post does not delete an existing private conversation.

### 29.3 ID, username and nickname lookup
- Exact user ID/username lookup may expose a message action only after the server returns a public-safe member result.
- Nickname search may contain duplicates; UI disambiguates with public-safe fields while internally retaining canonical member IDs.
- Client never constructs a DM target from a free-form nickname without server resolution.
- Search endpoints must resist bulk enumeration, apply rate limits and return only approved public member fields.
- Email, phone, OAuth identifiers, non-public internal IDs, balances and security/moderation attributes are not DM discovery keys.

### 29.4 Self, block, privacy and unavailable states
- Self-target is hidden or disabled in UI and rejected again by the server.
- DM disabled, blocked, restricted or otherwise ineligible peers use a privacy-safe unavailable state unless policy explicitly permits a non-sensitive distinction.
- Logged-out users may authenticate, but target context is restored only after login and revalidated.
- Existing or archived pair conversations open the same canonical thread instead of creating duplicates.

### 29.5 API contract addition
POST /api/v1/chat/conversations accepts { targetUserId, sourceContext? }.
sourceContext is optional navigation/telemetry context from a fixed enum such as profile, board_post, board_comment, member_search or member_list. It never affects authorization.
A lightweight eligibility endpoint may be added only for UI affordances and must not leak block direction, exact age-verification state or moderation reason.

### 29.6 Frontend contract
Use one shared member-action primitive across board, profile, search and member-list surfaces. It receives canonical member ID plus public-safe display metadata and always revalidates eligibility on activation.
Mobile requirements: action reachable at 320/360/390px, minimum 44px touch target, back navigation returns to the originating post/search/profile, virtual keyboard does not cover composer, and deep-link/back restoration cannot resend a message or create a duplicate conversation.

### 29.7 QA additions
QA must cover post author -> message, comment author -> message, profile -> message, exact username/user-ID -> message, duplicate nickname disambiguation, self-target, blocked pair, DM-disabled peer, suspended/deleted/anonymized author, logged-out login-and-revalidation, forged target ID, stale board metadata after username/nickname change, repeated initiation idempotency, mobile back-stack/accessibility, and sourceContext tampering having zero authorization effect.

### 29.8 Implementation order extension
8. v2026.09.21.323-08 P0: canonical member-resolution contract and shared DM entry-action component.
9. v2026.09.21.323-09 P0: board post/comment author actions plus profile/member-search/list entry points.
10. v2026.09.21.323-10 P0: enumeration/rate-limit/privacy/stale-identity tests and cross-surface E2E on isolated Test.
11. v2026.09.21.323-11 P0: mid-work latest-plan re-read, exact-SHA regression pass and zero-downtime Production promotion only after all original private-chat gates also pass.
