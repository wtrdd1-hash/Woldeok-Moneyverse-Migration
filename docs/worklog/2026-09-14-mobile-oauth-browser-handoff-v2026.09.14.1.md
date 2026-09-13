# v2026.09.14.1 — Internal worklog: mobile OAuth browser handoff

Scope: fix the verified native-login gap where Discord approval completes in the browser but the Android app receives no callback and therefore never calls `/app-api/v1/auth/mobile/handoff`.

Pre-work checks: re-read the current authentication and deployment requirements. The repository already persisted `client=mobile`, created a one-time handoff code, and attempted an HTTPS 302 directly to the custom URI scheme. The reported fresh-install evidence isolated the remaining failure to the browser-to-app transition.

Implementation: mobile OAuth callbacks now return a minimal completion HTML response when a handoff code exists. It attempts the fixed custom-scheme URI with `window.location.replace` and provides a user-tappable fallback link. Web login/link/reauth redirects are unchanged.

Security: no caller-controlled return URI was added; no OAuth authorization code/state is logged; the completion response is `no-store`, `noindex`, protected by a restrictive CSP, and deep-link values are escaped.

Validation: contract build passed, frontend typecheck passed, and the full frontend Vitest run passed 56 files / 548 tests. The planning/deployment contract was re-checked during implementation. Release is blocked until the exact SHA is served by the isolated test stack and backend/database smoke succeeds before Production promotion.