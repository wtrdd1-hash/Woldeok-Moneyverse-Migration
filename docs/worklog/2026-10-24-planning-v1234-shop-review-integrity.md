# Planning v1234 — F675-115 Verified Review Integrity (2026-10-24)

**Status: PARTIAL / DRAFT / RELEASE HOLD.** Previous Feature Addition v1232 → Current Feature Improvement v1234 → Next Feature Addition v1236 provisional.

## Sources and boundaries
- miniPC Debian 13.6 active services, connected Production-linked DEV DB **status only**; no live SQL writes. Superpowers `skills__list` returned no URI; installed `using-superpowers`, `brainstorming`, `using-git-worktrees`, `writing-plans`, `verification-before-completion` read via miniPC. Noninteractive docs-only improvement; no runtime implementation authorization.
- Main `49788d09494fed3e463651945b83386e87dd47bc` and main English canonical/Korean comparison hashes verified at start/mid. Prior v1232 Draft #1167 is unmerged and is this **stacked PR's base**, not runtime truth. Inspected `AGENTS.md`, `README.md`, migrations 071/072/168/218, Nest shop and admin controllers, Next `/shop`, Android/app-api and open GitHub PRs. Latest completed QA v1240 FAILED/HOLD at 20:57 KST; v1239 full tests referenced, not rerun.
- Source-backed corrections: Store 2.0 `shop_purchases.transaction_id` FK and economic-command replay do not prove reversal finality; admin can deactivate `shop_catalog.active`; v1232's durable owner/catalog UNIQUE conflicts with inserting a new row after withdrawal; moderation must bind to exact content revision, not stale review ID; historical receipt does not equal current visible state; signed `asOf` cursor alone does not guarantee concurrent-moderation snapshot.
- No product code, database, WLD, ledger, inventory, feature switches, Test/Production, other workers' branches, merges or deployments changed. No new scattered planning file; only six existing EN/KO integrated masters and this mandatory worklog.

## Backlog, evidence and release
- P0: `ENV1234-01` shared DB/5433/disk, `SEC1234-02` least-privilege and actor binding, `REL1234-03` exact-SHA QA/CI/security/restore, `SHOP1234-04` purchase-ledger finality. P1: `SHOP1234-05` through `SHOP1234-10` schema/erasure, idempotency/revision locks, member/admin/Android API, moderation, SEO/a11y/KPI, isolated concurrency and rollback.
- QA v1240: 235/241 app DML, 3 PUBLIC bank EXECUTE, migration266 checksum mismatch, four-way migration280 #1147, root audit Critical2/High10, bot Critical1/High5, frontend 5 FAIL (v1239), official Test SHA differs from main, authenticated finance E2E and isolated restore unverified; root disk ~94–96%, issue #1170. **Release BLOCKED**.
- Reviewed technical publisher families PostgreSQL, OWASP, W3C and Google Search Central **4** (not approved independent evidence records). New accepted/deduplicated independent records **0**; cumulative accepted **UNKNOWN / 10,000** → **BLOCKED / IN PROGRESS**. No invented count or claim of 10,000 completion.
- Proposed test acceptance **NOT RUN**: 100 concurrent identical keys → one review/event/receipt, 100 cross-owner probes denied, 100 edit/approve/withdraw/deactivate races, static 10,001 cursor fixture, no WLD/ledger/stock side effects.
- Development handoff: separate engineering branch, isolated PG + role negative tests and TDD, exact HEAD CI/security, official Test exact-SHA authenticated buyer/admin/Android/finance E2E, encrypted backup restore, independent QA and authorized GitOps; feature `shop_verified_reviews` OFF. No migration number until #1147 resolved.

## Verification
- Documentation-only parity and `git diff --check` to be verified before commit/PR. No product runtime tests performed.
