# Worklog — Trusted Client IP re-home v2026.09.13.2

## Selected runtime work
Re-home the still-valid Trusted Client IP hardening so forged `X-Forwarded-For` values cannot become application audit/rate-limit identity when trusted-proxy mode is enabled.

## Baseline and overlap review
- Latest main before development: `7f2e59b0faf627376f9dd8066be2bf0642e31981`.
- Newest active runtime baseline used: Business Settlement candidate `73756378915fe5d9bc74aeef4116664854436aa2`, which already reconciles that main and preserves the migration-number repair found by CI.
- Original source: PR #165 / `7adfe534c0e123b54c497daf3e27dab1219f7dc7`.
- Compared #165 base to current main. None of the seven runtime files changed on main after the original security fix, so selective transplant does not overwrite newer runtime work.
- Reviewed active PRs #196, #195 and #189. Their runtime scopes do not modify the Trusted Client IP files.
- Living Project Plan was read before development and again mid-work; security, fail-closed Test, and no-force-push rules remain unchanged.

## Runtime changes
- `requestClientKey` validates edge/socket addresses using Node `net.isIP`.
- Trusted-proxy mode accepts only valid `CF-Connecting-IP`; `X-Forwarded-For` is ignored even when supplied.
- Empty/malformed edge metadata falls back to validated socket peer or `unknown`.
- Next.js internal API paths stop forwarding `X-Forwarded-For`.
- Focused rate-limit and throttler tests cover forged forwarding chains, malformed edge values and Cloudflare precedence.

## Validation and deployment
- Branch: `integrate/trusted-client-ip-v2026.09.13.2`.
- Parent runtime candidate: `73756378915fe5d9bc74aeef4116664854436aa2`.
- CI: pending until PR creation/head stabilization.
- Exact-SHA isolated Test: not yet verified.
- Production: unchanged.

## Next priority
After CI/Test handling, re-home Admin edit-state preservation #160. Existing Economy Scenario Lab and Event Calendar candidates remain preserved until their exact-SHA Test gates are resolved.
