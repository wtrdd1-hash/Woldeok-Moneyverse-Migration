# App/Site Channel Contract — v2026.10.01.500

- Added `ChannelRouteDefinition`, `CHANNEL_API_ROUTES` and `matchChannelRoute`.
- Seeded 179 App v2 route definitions from the current mobile contract.
- Added 23 Site v1 target definitions from browser/backend evidence.
- Added route availability status so planning targets are not confused with live handlers.
- Added Economy Core command, idempotency, CSRF and mobile-integrity metadata.
- Added `scripts/check-channel-api-contract.mjs` and unit tests.
- Wired channel contract verification into the root test chain.
- No BFF runtime route activated.
