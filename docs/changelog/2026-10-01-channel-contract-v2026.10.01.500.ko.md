# App/Site Channel Contract — v2026.10.01.500

- `ChannelRouteDefinition`, `CHANNEL_API_ROUTES`, `matchChannelRoute` 추가.
- 현재 mobile contract에서 App v2 route 179개를 seed.
- browser/backend 증거 기반 Site v1 target 23개 추가.
- planning target과 live handler를 혼동하지 않도록 route availability 추가.
- Economy Core command, idempotency, CSRF, mobile integrity metadata 추가.
- `scripts/check-channel-api-contract.mjs`와 unit test 추가.
- root test chain에 channel contract 검증 연결.
- BFF runtime route는 아직 활성화하지 않음.
