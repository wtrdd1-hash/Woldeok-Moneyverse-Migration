# Release HOLD — Announcement recency (2026-11-03)

**No main merge, isolated Test deployment, or Production promotion.** Repair checkpoint SHA 81843c78ee18fa332cffdaacac61bf0d7e642cca, base main f5c3fbedae1c3b3ec2374882b049aac43a655eb4.

Blockers: two profile HTTP auth tests FAIL; full dependency audit nine findings; DEV app-role broad table permissions; no exact-final-SHA official Test, authenticated E2E, independent restore, executable provenance, or release gate. Test and Production public SHAs differ from candidate. Overlapping announcement PRs require manual reconciliation and full rerun.

Rollback is code-only (no migration, ledger, payment or service mutation), but NOT rehearsed. Preserve all unique unmerged changes. No branch deletion, service restart, or deployment.
