# Landmark auction source-integrity implementation plan (C v1252)
1. Reproduce false successful landmark bid and rent-claim contracts with failing Vitest HTTP handler tests. Confirm failure against main.
2. Replace in-memory GET/POST landmark auction handlers with explicit unverified-source HTTP 503, signed-out 401, unknown-auth 503, private no-store/noindex/no-referrer. Do not contact Discord or touch a ledger.
3. Replace hardcoded rent-claim success with the same protected 503 contract; preserve explicit authentication.
4. Replace member-facing real-estate page and client with localized, accessible 320px-ready source-unavailable guidance and non-indexable metadata. Do not render client-local storage as proof of real ownership.
5. Recheck canonical main/plans, run focused and full checks on exact HEAD, isolated PostgreSQL migration, security and HTTP checks, remote CI, and official Test only when release gates allow.
6. Record English canonical worklog, Korean companion and update log; draft PR HOLD on failure, preserve all unrelated branches.
