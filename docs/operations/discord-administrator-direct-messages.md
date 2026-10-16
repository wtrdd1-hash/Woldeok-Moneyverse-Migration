# Discord administrator direct-message alerts

[한국어](discord-administrator-direct-messages.ko.md) | [Operational deployment](production-deployment.md)

## Scope (v2026.10.16.742)

The backend's `DiscordAlertService` sends **each curated Discord operational embed** both to the configured log channel and the administrator's direct messages. This covers reconciliation failures, negative balance and audit integrity alarms, admin warning/info/critical alerts, announcements, treasury and monetary-policy events, mint/burn events, SEO failures and daily digests, stock movers, and community broadcast events already routed through this service. Direct-to-admin high-value transfers, casino jackpots, reserve issues, kill switches, and delinquency alerts retain their existing direct-message route.

This is **not** forwarding arbitrary application logs, secrets, API tokens, session cookies, private member records, or full database exports. It does not automatically report GitHub CI status, infrastructure host outages when the backend itself is down, or events with no existing alert producer. A separate out-of-process watcher is required for those.

## Configuration

- `DISCORD_BOT_TOKEN`: required on the backend. Store only in the protected host environment.
- `DISCORD_ADMIN_ALERT_USER_ID`: Discord snowflake of the authorized administrator. Configure explicitly in production instead of relying on the legacy built-in fallback.
- `DISCORD_ADMIN_DM_ENABLED=false`: opt out of DM mirroring while preserving channel delivery (default: enabled).
- `DISCORD_ADMIN_DM_MODE=critical`: send only embeds marked critical to DM. Default is `all`.
- `DISCORD_ALERT_WEBHOOK_URL` or `DISCORD_ALERT_CHANNEL_ID`: optional channel transport as before.

The bot must share a Discord context with the administrator and be allowed to DM them; Discord user privacy settings can block DMs. The service logs HTTP status on failure without including response bodies, tokens or message content. Recipient-specific DM channels are cached separately. Discord mention parsing is disabled and credential-like strings are redacted.

## Verification / rollback

1. Use an isolated exact-SHA Test backend, not a mutable live release directory.
2. Run targeted alert tests, backend suite, typecheck, lint and build; check no member data or migrations changed.
3. Verify a harmless test DM to the configured administrator and a channel post; test failure routes.
4. Only promote through [production release gates](production-deployment.md). Finance P0 and authenticated UI gates must remain satisfied; a passing unit test is not a release gate.
5. Roll back the backend release pointer for code rollback. To disable DM delivery immediately, set `DISCORD_ADMIN_DM_ENABLED=false` in the protected environment and follow the controlled service restart process.
