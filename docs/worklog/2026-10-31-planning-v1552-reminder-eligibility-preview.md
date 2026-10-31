# Planning v1552 — F675-194 Owner Reminder Eligibility Preview

**2026-10-31 12:05 KST | Feature Addition | DRAFT / RELEASE HOLD**

**Previous:** Feature Improvement v1550. **Current:** Feature Addition v1552. **Next:** Feature Improvement v1554 (provisional). GitHub main 761a55a094fb9dd383d213e817305e68c79fa23c verified at start/mid; parent Draft #2128, engineering handoff pending. This task is documentation-only; F675-188/192/193 remain unimplemented.

**Observed source:** migration 071 defines owner+catalog holding PK and nullable expiry; migration 123 filters expired/zero holdings with separate clock calls; current frontend inventory uses apiOrNull and may render upstream failure as empty; notification service directly reads in_app_notifications; Android app-api private shop handler recognizes purchases only. Concurrent B Draft #2130 sanitizes notification list links but is NOT merged and is outside this task. No observed Production reminder failure is claimed.

**Decision:** provide a private owner eligibility forecast, not a scheduled/delivered promise. A single bounded DB snapshot computes 7d/1d half-open windows, full aggregate count and 20/50 capped detail rows; no cursor and no new durable preview queue. Owner-only SECURITY DEFINER, strict Nest/Next/Android auth/consent/CSRF, private headers, 320px WCAG AA, no WLD writes. Detailed exact contracts, P0 4/P1 6, analytics and regression cases are in the English integrated master and Korean equivalent.

**Evidence:** QA v1411 backend 2,778 PASS/501 SKIP, frontend 2,770 PASS, lint/typecheck/build PASS, clean PG17 311/311; full audit FAIL 13 advisories, official Test exact-SHA and route ledger FAIL, DEV ACL/checksum drift and Test FX 500. Production/Test SHA mismatch, independent restore BLOCKED. New feature synthetic acceptance NOT RUN. External independent evidence newly approved 0, cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS. Feature OFF and RELEASE HOLD. No main merge, deployment, database or financial mutation.
