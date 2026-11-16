# Release note — v2026.11.17.5 — Discord OAuth state/session cookie isolation

- **Bug:** Browsers could retain a valid `__Host-mv_session` from the Nest legacy auth system together with a new `mv_session` issued by Spring prelogin. Provider-start state was persisted under the new Spring session, while callback consumed it under the preferred stale Nest cookie and returned `oauth_state` (400); invalid stale host cookies instead caused 401.
- **Change:** The Next OAuth authorize response expires a stale host cookie only when anonymous prelogin has issued a new Spring `mv_session`; a successful provider sign-in callback expires the replaced Spring cookie only when Nest sends a new `__Host-mv_session`. Other login, local registration, link, reauthentication and financial routes are untouched.
- **Security:** No challenge validation bypass, no credential logging, no change to general authentication precedence or database. OAuth state remains bound to the authoritative DB challenge and session. Cookie expiry is host-only, Secure, HttpOnly, SameSite=Lax.
- **Evidence:** Public anonymous challenge reproduction; 4 direct node:test regressions and 4 Next handler integration tests passed; frontend TypeScript and full build passed. Production/Test deployment evidence is recorded separately in the task log.
- **Limitation:** No real consenting Discord account authorization has been executed; cannot claim a verified completed provider sign-in.

- **Runtime compatibility hardening:** Next's HTTP cookie serialization may omit `Max-Age=0` when expiring a cookie. Expiration now explicitly sets the fixed epoch `Expires` date as well; both attributes are regression tested. An empty cookie without expiry is NOT considered a valid cleanup.
