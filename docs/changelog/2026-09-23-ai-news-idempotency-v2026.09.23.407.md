# AI news caller-owned idempotency — v2026.09.23.407

- AI news settings, manual generation, scenario publish, and discard now require a caller-owned UUID retry key at the HTTP DTO boundary.
- AiNewsService no longer manufactures retry identities for those externally initiated commands; existing frontend actions already supply UUID keys.
- Internal autonomous generation keeps internal command identities. No migration, ledger, privilege, or authentication semantics changed.
