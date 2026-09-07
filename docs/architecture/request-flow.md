# Request Flow

## Read request

```mermaid
sequenceDiagram
    participant U as Browser
    participant F as Next.js
    participant A as NestJS API
    participant D as PostgreSQL
    U->>F: GET page / server navigation
    F->>A: Internal API GET + session + internal token
    A->>D: Read model / safe function
    D-->>A: Canonical values
    A-->>F: JSON
    F-->>U: HTML / RSC payload
```

Per-member responses are not shared in a public cache.

## Economy write request

```mermaid
sequenceDiagram
    participant U as Browser
    participant F as Next.js Server Action
    participant A as NestJS API
    participant D as PostgreSQL Function
    participant L as Ledger
    U->>F: Submit action
    F->>A: Fetch CSRF/session context
    F->>A: POST + CSRF + idempotency key + internal token
    A->>D: Call SECURITY DEFINER function
    D->>D: Authorize actor + validate policy
    D->>D: Check idempotency receipt
    alt first execution
      D->>L: Atomic ledger/state write
      D-->>A: New receipt
    else retry/replay
      D-->>A: Existing receipt
    end
    A-->>F: Receipt
    F-->>U: Result + revalidated UI
```

## Why idempotency matters
A server can commit a reward while the response is lost. Retrying with a new key could pay twice; retrying with the same key replays the original receipt. Work-completion UX keeps one idempotency key for one modal attempt so timeout recovery does not require close/reopen and does not duplicate value.

## Casino result flow

```text
choice + stake
    ↓
server action
    ↓
NestJS validation
    ↓
PostgreSQL game/policy function
    ↓
ledger + play receipt
    ↓
frontend maps receipt outcome to theme animation
```

The themed slot/high-low/wheel/treasure/gem views derive their final state from the receipt. Client animation can decorate a result but must never contradict the stored outcome.

## Failure behavior
- unauthenticated member → sign-in/redirect;
- stale/invalid CSRF → refused write;
- invalid internal token → API 401;
- policy/limit conflict → structured refusal;
- duplicate idempotency key → receipt replay;
- unavailable API → frontend recovery/error state rather than direct DB fallback.
