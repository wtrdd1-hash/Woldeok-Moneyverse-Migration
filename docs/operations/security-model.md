# Security Model

This document summarizes the major runtime trust boundaries. It is not a replacement for code review or infrastructure policy.

## Public boundary

The public browser reaches the nginx edge and Next.js frontend. The NestJS API is an internal service rather than a normal public origin.

## Internal API token

Production API requests require an internal server-to-server token except for endpoints intentionally decorated/exempted for operational health or signed webhook behavior.

The token is never a browser credential and must not be committed to source, README screenshots, logs or client bundles.

## Session and CSRF

Member sessions are same-origin HttpOnly cookies. State-changing browser actions use the server-action/API flow and CSRF/session validation rather than direct cross-origin API calls.

## Database authority

The runtime application role is restricted. Economy writes use actor-checking database functions. Direct table grants are treated as exceptional and audited.

## Idempotency

Idempotency is required where a network retry could duplicate value: task completion, transfers, casino plays and similar write operations should have a stable retry identity.

## Container hardening

Production frontend/backend are deployed with hardened options including read-only root filesystems, dropped Linux capabilities and `no-new-privileges` where supported by the service.

## HTTP hardening

The edge uses strict Host handling and internal-only health behavior. Public pages include standard browser security headers configured by the application/edge.

## Secrets

- never commit `.env` secrets;
- never paste access tokens into documentation;
- never put secrets in screenshots;
- use CI/host secret stores for deployment credentials;
- redact operational logs before sharing them.

## Production data

Production member data, ledger records and volumes are protected assets. Routine cleanup must not delete them. Docker volume pruning requires explicit, separate approval.
