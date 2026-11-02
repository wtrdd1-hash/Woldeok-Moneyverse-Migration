# A — Published announcement recency (2026-11-03)

## Before work
- Baseline: origin/main f5c3fbedae1c3b3ec2374882b049aac43a655eb4, isolated worktree. The shared checkout contains unrelated uncommitted changes; never touch it.
- Read AGENTS.md, README.md, EN/KO integrated plans, current PR and CI summaries. Overlapping announcement PRs cover title/body searches, pinned, image, publication-day and ordering; this change is a distinct relative-age filter on the existing 20-row published snapshot.
- No DB schema/migration or finance writes. Existing SECURITY DEFINER published-announcement read remains authoritative. Filter may not claim all historical notices.
- RED: add tests for invalid, duplicate, recent=7d/30d and date boundary. GREEN: Nest web and Android read routes, service, Next UI, Android gateway validation. Verify and document blockers. Release default HOLD.

## In progress
- Implemented 7d/30d published-announcement recency against the existing owner-independent, published-only SQL function and 20-row snapshot. No migration or direct table grants.
- Web and Android Nest routes accept only exact filter values; duplicate arrays and unknown values return 400. Both return asOfUtc, applied filter and explicit source scope.
- Next adds accessible period selector, canonical root, query noindex, and rejects unverified success. Android gateway enforces query allowlist, response proof, no-store and noindex.
- TDD: first parser test failed for missing implementation; targeted backend 13 PASS, frontend 5 PASS after fixing a null timestamp normalization defect. Typechecks both PASS.
- Mid-run main remains f5c3fbedae1c3b3ec2374882b049aac43a655eb4. Development PostgreSQL 17.11: published-announcement function exists, app EXECUTE=true, current snapshot 1 row. No writes.
- Full gates and deployment identity still pending; release HOLD.

## Finished
- Pending.
