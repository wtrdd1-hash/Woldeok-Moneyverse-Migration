# Trusted Client IP Hardening

Update version: **2026.09.12-10**
Status: **Candidate / staging verification required**
Branch: `fix/trusted-client-ip-v2026.09.12.10`

## Summary

The application could fall back from Cloudflare's edge-overwritten `CF-Connecting-IP` to `X-Forwarded-For` when trusted-proxy mode was enabled. Because an append-only forwarding chain can preserve a visitor-supplied first hop, that fallback could allow a caller-controlled address to become the audit IP and rate-limit identity.

## Change

- Backend client identity now accepts only a syntactically valid `CF-Connecting-IP` when trusted-proxy mode is enabled.
- `X-Forwarded-For` is never used as an application identity source.
- Missing or malformed trusted edge addresses fail closed to the socket peer; if that is not a valid IP, the key becomes `unknown`.
- Next.js internal API forwarding no longer relays `X-Forwarded-For` on either server-side API calls or the public app API gateway.
- The same hardened resolver remains shared by rate limiting, audit context, administrator security, activity, and lobby code paths.

## Verification

Focused security tests cover forged forwarding chains, repeated headers, malformed trusted edge values, Cloudflare precedence, socket fallback, audit context, and tiered throttling.

Production promotion is prohibited until the exact candidate SHA passes CI and is deployed to `wdmv-test`, where the backend must start successfully and real requests must show the Cloudflare-confirmed client address without accepting caller-supplied `X-Forwarded-For`.
