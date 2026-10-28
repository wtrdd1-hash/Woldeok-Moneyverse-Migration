# A2125 Internal/GitHub update v1 — exact shop price ordering
- New Draft PR #1745 from main 35971c600f25869c96f1c666d4b9f58927202730, independent branch. Code commit 42efdefef0b0ec59ca4638c36f17a7fe35789a8a.
- Feature: authenticated owner shop catalogue sort price_asc/price_desc, strict HTTP validation, BigInt stable sort, web selector/search, Android query forwarding with private/no-store/noindex.
- TDD RED→GREEN 11 backend and 31 frontend/app-api; root test/lint/typecheck/build/security gates exit 0. Isolated PostgreSQL 17.11 app-role read and table ACL read-only PASS. No migration or WLD writes.
- QA v1348, official Test exact SHA, restore, broad privileges, historical 18k WLD ledger mismatch and data disk 98% block release. No merge/deploy/branch cleanup. CI must be rechecked on final SHA.
