# Smooth Real-Time Data & UI Synchronization — v2026.11.23.1

> Status: PLANNING / DOCS ONLY. Priority: P1 UX; P0 if balance correctness or cross-user disclosure is observed.
> Owner reference: 2026-11-23 screenshot of "Asset Status" (wallet, holdings, quests). Approved visual baseline: 2026-11-18 navy/violet responsive web design.
> This proposal does not certify the current runtime or authorize production changes.

## Observed evidence vs unverified causes
The supplied screenshot visibly shows oversized "실제 데이터 조회 중..." in wallet balance, a holdings card with "내 보유 종목" and account-verification explanation, and quest shortcut. The visible screenshot alone cannot establish actual polling frequency, network failures, fake data, or exact source implementation. Inspect current Spring handlers, user identity, API responses, browser network and frontend state before assigning root cause. Never treat the visible copy as proof of a backend failure.

## Desired contract
1. Initial authenticated load uses server-authoritative REST snapshot with `revision`, `asOf`, `userScope`, `requestId`. Show fixed-dimension skeleton only when no last trusted data exists; do not render verbose "real-data fetching" text in primary balance typography.
2. During refresh retain last **verified, same-user** snapshot and show subtle non-blocking freshness text. Never display data of a different account after logout/account switch; immediately clear protected state. Avoid pretending that cached values are live.
3. Successful events patch only affected widgets and animate subtle number transitions (150–250ms recommendation), honoring `prefers-reduced-motion`. Do not animate each market tick, remount cards, shift layout, flash, or interrupt keyboard/screen-reader focus.
4. Ledger or wallet mutation is committed server-side first; authoritative balance/receipt with monotonic version propagates after DB commit. Never derive final WLD from speculative browser math. Keep canonical integer-string representation.
5. Stock holdings and quest progress have separate `loading/ready/empty/permission-denied/stale/error` states. Empty means verified empty, never permission failure. Market price display and private holding positions must be explicitly distinguished.
6. Only show small network indicators when stale/offline; error notification is reserved for blocked user action or material loss of freshness. Recovery is silent once data are confirmed consistent.

## Protocol decision
- FIRST inventory existing Spring MVC/Spring WebSocket, SSE, Socket.IO, reverse proxy, auth/session and current client runtime. **Do not add Node.js** or an unreviewed second service just to enable events.
- Prefer Spring-native **SSE** if data feed is server-to-browser only; prefer Spring WebSocket/STOMP if bidirectional chat, subscriptions and ACK are required. Socket.IO with Java `netty-socketio` is an alternative ONLY after explicit protocol compatibility, authentication, lifecycle/port, reverse proxy and scaling evaluation. Socket.IO client is not a drop-in native-WebSocket client.
- HTTP REST remains initial snapshot, writes, revalidation, and fallback. Real-time messages are notification/delta hints, not economic truth.
- Event envelope proposal: `{eventId,type,entityId,revision,occurredAt,scope,correlationId}`. Event classes: `wallet.balance.changed`, `portfolio.positions.changed`, `quest.progress.changed`, `chat.message.created`, `system.notice.published`. Re-fetch authorized snapshot when gap, reconnect, invalid revision or stale session occurs.
- Scope events by authenticated principal and server-checked subscription authorization; no user identifiers or private contents in broadcast rooms; CSRF/session/cookie/origin/CORS/heartbeat/rate limits reviewed for selected protocol.
- Outbox-after-commit or equivalent reliable dispatch; eventId dedupe; gap detection; backoff+jitter on reconnect, visibility-aware resync; multi-instance fan-out and proxy idle timeouts verified.

## UI acceptance targets (proposed, not measured)
- No large transient fetching/verifying copy in asset cards; maintain card geometry; retain Nov18 navy/violet design on desktop/mobile.
- Accessibility: meaningful `aria-live` only for user-initiated outcomes, not every numerical tick; keyboard focus retained; reduced-motion.
- Same-account reconnect shows authoritative revision; account switch or logout never leaks cached private data.
- HTTP delayed, 401/403, 429, 500, dropped transport, offline/reconnect, out-of-order/duplicate events, stale revision and server restart are independently QA-tested.
- Evidence: request/response and receipt traces, no sensitive payloads; session-bound and authorization tests; visual screenshots at PC/mobile breakpoints; network reconnection matrix and Java integration tests.
- Test environment backend health + authenticated APIs + DB receipts and real-time scenarios must pass before any zero-downtime production promotion. Rollback and monitoring are mandatory; no promotion from this documentation branch.

## Sources reviewed
- https://middlefitting.tistory.com/107 — Spring Boot + separate Java Netty Socket.IO server
- https://velog.io/@cinnamein/Spring-Socket.IO-%EC%82%AC%EC%9A%A9 — rooms, namespaces, heartbeat and reconnect
- https://inpa.tistory.com/entry/SOCKET-%F0%9F%93%9A-SocketIO-%EC%82%AC%EC%9A%A9-%ED%95%B4%EB%B3%B4%EA%B8%B0 — event emit/on and scoped delivery; Node examples are not implementation authority for this Spring project
- https://socket.io/docs/v4/

## Execution and coordination
Version: v2026.11.23.1. Standalone documentation proposal only. Read current integrated plan and recheck main SHA prior to implementation. Gemini/ChatGPT must hold disjoint file ownership or coordinate via PR. No secrets, user financial values, or production credentials in GitHub. Reference docs/DOCUMENTATION_POLICY.ko.md and docs/planning/INTEGRATED_PLANNING_MASTER.ko.md. Status at authoring: desktop MCP devices offline; repository inspection only; application code, Test and Production untouched.
