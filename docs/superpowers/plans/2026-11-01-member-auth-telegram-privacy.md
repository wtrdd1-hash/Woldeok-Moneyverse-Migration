# Member auth Telegram privacy — bounded design and implementation plan

Intent: preserve email verification and login while preventing unverified or non-consenting member identifiers from being transmitted to an external Telegram destination. Issue #2231 supplies scope and constraints. No policy approval exists for third-party PII transmission.

Decision: do not emit registration notifications until a separately approved verified-registration event contract exists. On successful login, emit only a generic, identifier-free event after current user consent. The transport method accepts no member payload, so spoofed forwarding headers and raw user agents cannot reach it. Keep unrelated administrative/financial Telegram alerts unchanged.

1. Write controller RED tests: accepted unverified registration must not call Telegram; login with stale consent must not call Telegram; current-consent login must call generic notification without PII.
2. Write transport RED tests: registration notification methods must never call safeFetch; generic login message must omit UUID, IP, user agent, email, display name even if malicious data is present in the request.
3. Make minimal controller/service changes, run focused GREEN tests, refactor only if needed.
4. Run build/typecheck/lint and relevant auth, Telegram, security and API regression gates. Recheck main and draft planning before PR. Record all results and release HOLD.
