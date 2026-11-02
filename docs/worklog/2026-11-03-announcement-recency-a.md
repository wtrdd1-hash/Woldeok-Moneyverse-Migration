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

## Repair (separate branch)
- CI runtime-check failed on initial SHA fee081bf157fba4e9b9af28e903c22a75d394e39: Next.js disallows exporting static metadata and generateMetadata together. The typechecker did not catch it.
- Fixed in isolated repair branch by making the metadata constant private; run full build/CI again on new SHA.

## Finished
- Feature and isolated repair code completed. Next build failed on first SHA due to metadata export conflict; repaired and both builds PASS at repair checkpoint. Targeted backend 14, frontend 5, typechecks, contract 41 and DB unit 72 PASS.
- Initial full backend 2,988 PASS / 2 FAIL / 518 SKIP; frontend 2,952 PASS. Exact final docs SHA full gates and CI to be recorded in PR.
- DEV PostgreSQL 17.11 READ ONLY: latest 20 snapshot has 1 row (7d=0, 30d=1); P0 app direct table grants remain. Full audit 9 findings. No authenticated E2E or independent restore. Test/Production SHAs differ.
- Git audit: 308 remote-tracking refs at start, 311 after feature branch; 275 to 278 open PRs, 29 conflicting. No deletions. Prior announcement PRs #2380/#2377/#2362/#2359/#2347 have overlapping files.
- No main merge, Test/Production promotion, service restart, DB mutation or rollback. DRAFT/HOLD. See EN/KO QA and Release HOLD documents.
