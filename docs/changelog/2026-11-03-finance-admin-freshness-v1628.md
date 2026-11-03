# v2026.11.03.1628 — Admin finance evidence freshness

**Status: SOURCE TESTED / RELEASE PENDING.** [한국어](2026-11-03-finance-admin-freshness-v1628.ko.md)

- Revalidate KDIC, NPS and Central Bank client-held evidence on page mount/resume; refresh enterprise SSR data on resume.
- Reject KDIC evidence older than five minutes; clear stale monetary values while revalidating, distinguish UNKNOWN from real zero.
- Verified read-only live DB: Treasury legacy unlinked 0, pension AUM 0; member cash+bank 4,841,510, Treasury 0.
- 17 targeted tests, typecheck, ESLint PASS. No monetary writes, payout unblock or Production deployment.
