# v2026.10.16.713 — Post-promotion evidence for v712

**English canonical | [한국어](2026-10-16-production-locale-v713.ko.md)**

- New docs-only isolated branch from observed `origin/main=eb81f9dbbdd30da3612b03fe167f813ad5578270` after #880 merged; no change to the application binary or production data.
- Both public `https://easy-scraping.com/api/version` and `/frontend-version` independently returned `142e36b5b0955c575992ca95b1706ba85e8dc909` after Nginx cutover. Same source tree as merged `main` despite squash merge ID.
- Host actual public Nginx Production block now routes frontend :3224, backend :3223; immutable `production-current` points at `prod-v2026.10.16.712-142e36b5b095`. The two v712 systemd services are active and boot-enabled; v697 fallback continues active. No bot interruption, DB migration or account mutation.
- Production automated fail-closed host cutover performed 5/5 complete public health/version/home/status/stocks/unauthorized protection smokes; scripts/log/rollback config stored root-restricted `/srv/moneyverse-tasks/promotion-v712/`.
- CI verified on PR #880, Test version exact, four locale SSRs/headers, font resource-hint reduction, no auto cookie writes.
- Remaining: real browser LCP/INP/p75 at different countries and Production authenticated session continuity E2E were not measured; browser/cloud edge RTT remains network-dependent.
- Full formal release: [v712 English](../releases/v2026.10.16.712.md) / [한국어](../releases/v2026.10.16.712.ko.md).
