# Security Model

<!-- CORE-AUTHORITY-V499 -->
## App/Site/Economy Core authority overlay — v2026.10.01.499 (2026-10-01)

- **Superseding authority:** this maintained-document overlay supersedes any conflicting older planning text below. Historical passages remain evidence of prior decisions, not current product authority.
- **Channel boundary:** the target canonical public contracts are **App Core** at `/app-api/v2/**` and **Site Core** at `/site-api/v1/**`. **App API v1** remains compatibility/runtime evidence until measured retirement; this documentation cycle does not claim those target routes are already implemented in Test or Production.
- **Single economic authority:** App/Site BFFs never own independent balance, tax, banking, treasury, market, job-reward or monetary-policy rules. One **Economy Core** owns economic command/read authority and delegates final WLD mutation to the append-only ledger and reviewed PostgreSQL `SECURITY DEFINER` functions.
- **Fiscal conservation:** every `TAX_*` posts **100% to TREASURY_MAIN** net of explicit reversal. Tax may not target burn/sink. Treasury purposes are logical budget commitments/envelopes, not independently spendable cash vaults.
- **AI boundary:** one **Economy Policy Registry** and one policy executor own numeric policy application. AI/model/work/stock modules are **proposal-only** unless a specific low-risk key is registered `BOUNDED_AUTO`. **direct member balance write = 0 (prohibited)**, **direct absolute stock-price write = 0**, historical-ledger rewrite = 0, and AI cannot widen its own limits.
- **Identity boundary:** internal **workload identity** and user/admin/automation actor identity are validated independently. Shared `INTERNAL_API_TOKEN` / `x-internal-token` is legacy compatibility, not the final multi-core service-identity design.
- **Rollout truth:** the transition is expand → shadow/observe → switch → reconcile → contract. Runtime/Test/Production completion requires exact-SHA evidence and is not implied by this planning authority update.

This document summarizes the major runtime trust boundaries. It is not a replacement for code review or infrastructure policy.

## Public boundary

The public browser reaches the nginx edge and Next.js frontend. The NestJS API is an internal service rather than a normal public origin.

## Internal API token (legacy compatibility)

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
