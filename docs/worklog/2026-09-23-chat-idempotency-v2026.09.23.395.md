# Development B worklog — v2026.09.23.395

## Scope

P1 API command replay safety for chat message submission, selected outside the open business, stock-planning, and frontend-search work.

## Finding

`SendMessageDto.idempotencyKey` was optional and the controller generated a fresh UUID when absent. A caller retry after an ambiguous timeout could therefore be accepted as a distinct message command even though the service already supports an idempotency key.

## Change

The transport contract now requires a caller-owned UUID and forwards it unchanged to `ChatService.sendMessage`. The existing web action already supplies `idempotencyKey()`, so no frontend contract migration is needed.

## Safety

No database migration, privilege, ledger, authentication, or session semantics changed. Missing or malformed keys fail at DTO validation.

## Validation status

Focused contract tests are included. Repository required CI and exact-SHA validation remain authoritative; Production promotion must not occur unless those gates are green.
