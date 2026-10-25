# P1 virtual bond holdings export implementation plan

Source: current main, owner-only `bank_get_my_standing` (migration 194). This is a read-only projection, not a transaction receipt. Existing web banking standing and native banking API are not modified.

1. Write backend RED tests for missing owner holdings method, rejecting malformed/over-limit/foreign-shaped results; implement `BankRepository.listBondHoldings(actor)` and `BankController` GET with session+consent and private no-store. DB function is SECURITY DEFINER and owner-scoped; never grant direct table SELECT.
2. Write frontend RED tests for bounded CSV escaping, numeric precision, and malicious labels; implement pure CSV formatter and authenticated Next handler with strict shape and no-store/noindex.
3. Add keyboard-accessible link on `/bank`, test Android app-api route mapping and privacy headers, run focused tests.
4. Run full pnpm tests/typecheck/lint/build, security audits, isolated real PostgreSQL role ACL, official exact SHA CI and Test. Keep Draft PR/Production HOLD if any required gate is red.
