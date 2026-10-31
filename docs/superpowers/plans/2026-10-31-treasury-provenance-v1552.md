# v1552 — Evidence-first Treasury reconciliation plan
1. Capture DB identity, authoritative source counts, avoid personal IDs and misleading financial throughput as balance.
2. TDD RED for missing and inconsistent evidence, bounds, zero missing links not implying payout certification, and readonly SQL transaction rollback in all cases.
3. GREEN one-purpose CLI: bounded repeatable-read READ ONLY snapshot; grouped legacy types, canonical journal and debit-sum time coincidence counts (correlation not proof). No data mutation, inference-based link or payout.
4. Verify exact Production app-role runtime DB and isolated unit mocks. Compare expected 552 total / 552 unlinked / 551 zero coincidences / 1 unverified coincidence / 891 transactions / 1829 postings.
5. Run release tests, independent source CI; recheck main and official immutable Test/Prod gates. Operator-only diagnostic code is not a new web release.
6. Write EN+KO START/MID/FINISH, internal/GitHub change updates and changelog, DOCS_INDEX. Never report legacy settlement restored without independently supported links.
