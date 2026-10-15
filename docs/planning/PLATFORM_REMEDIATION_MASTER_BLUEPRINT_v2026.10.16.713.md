# Moneyverse Platform Remediation Master Blueprint — v2026.10.16.713

**Status: PROPOSED / PLANNING ONLY — approval and independent Test evidence pending.** [한국어 대응 문서](PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.ko.md)

**Purpose.** Repair the defects evidenced in the v711 full-platform re-audit, without losing member balances, rewriting ledger history, bypassing existing planning authority or overwriting concurrent work. This is a design proposal, not permission to mutate the live database or automatically promote to Production.

## 0. Starting contract and evidence

- Authority order: `docs/DOCUMENTATION_POLICY.md` → `docs/planning/PROJECT_PLAN.md` → `docs/planning/INTEGRATED_PLANNING_MASTER.md` → explicitly adopted detailed specs. This proposal does not silently supersede existing v523/v542/v543 monetary authority, v530 all-route UI hold, v397 API/CTA parity, or the v439 login-session requirement.
- Start exact GitHub `origin/main=be0335f3be288198eef8b1cab7f763a7db63c0bc`. Review v711 PR #878 is evidence, not merged authority; running Production is v697 source `a5a1e9da6fc55ac71c44c4cf6ee138e9442f4e73`. App v1.3.5 source and v710 blog implementation candidate are separate.
- v711 observed development role privileges: `moneyverse_app` can INSERT/UPDATE/DELETE 237 of 241 public tables. PUBLIC-executable SECURITY DEFINER functions went from 11 to **0** after concurrent v701 fix. Do not re-open a closed v701 finding. Production role/wallet scope must be independently measured before a change.
- v711 tests on `8ba6b442`: 1,212 backend pass and **396 skipped**, 1,220 frontend pass, lint error 0 / warning 1,088, typecheck/build green. No authenticated full-route, live monetary, DB security negative or Android device acceptance was proven.
- Code explicitly confirms direct balance writes in `backend/src/casino/pvp-arena.repository.ts`, `stock/stock-league.repository.ts`, `admin/bonds/treasury-bond.repository.ts`, `admin/pension/national-pension.repository.ts`, `admin/fx/fx.repository.ts`, `admin/treasury/auto-swf.service.ts`, `marketplace/marketplace.service.ts`, `marketplace/black-market.repository.ts`. Source hits are audit candidates, not an assertion each path is reachable or currently running.
- Active concurrent v710 modifies blog data/pages/SEO/sitemap/proxy; v701 security and v712 planning have their own owners. Never edit those paths on a competing branch. Re-fetch latest main at start, midpoint and before PR.

## 1. Desired user and operator experience

**Member:** A wallet transfer, PvP match, bond redemption, shop purchase or loan repayment either returns a confirmed immutable receipt, an explicitly denied outcome, or `UNKNOWN_RECONCILING` with a status lookup. Retrying the *same* operation key cannot double-charge. Amounts remain exact even above JavaScript safe-integer range. Feature controls are disabled or explain why they cannot act; the displayed score is based on user facts or transparently labeled a simulation.

**Administrator:** Finance screens show `RECONCILED` only after computing independent ledger-vault-account measures for a defined source high-water mark, time window and policy version. `DISCREPANCY` or `UNAVAILABLE` blocks new unsupported fiscal disbursements but leaves legitimate read and recovery paths. A privileged control requires verified role, step-up, CSRF, purpose, idempotency and audit receipt. No false index-submit or marketing claims.

**Operations:** Test and Production operate on immutable tagged application SHAs with a manifest, separate DB role identities, one leader per scheduled worker, archived backups, rollback assets and untouched sessions. Operators see exactly which test/DB gates passed or skipped and can stop the promotion without data rollback shortcuts.

**Visitor:** Real KR/US/JP/CN article substance and self-referential locale canonical metadata, truthful original/AI/editorial labels, usable financial calculators, accessible mobile navigation and no fictional WLD rewards presented as real cash or guaranteed benefit.

## 2. Architecture decisions (proposed, subject to review)

1. **Money is a single-purpose command boundary:** Browser/Android → same-origin BFF/auth → domain service → narrow SECURITY DEFINER SQL command → canonical account + ledger + business record + audit + outbox in one DB transaction. Domain commands accept the server-resolved actor and prevalidated operation UUID. Never grant the application role arbitrary raw ledger/mint posting authority.
2. **Existing ledger schemas are discovered, not assumed.** The early `001-economy-core.sql` is historical; newer migrations include changed posting fields and custom domain ledger tables. First inspect `information_schema`, `pg_proc`, real applied checksums and candidate PR diffs. Build a canonical adapter after verifying live schema, not by copying the old 001 signature blindly.
3. **Two independent reconciliation channels:** (A) canonical postings vs account balance projection; (B) treasury fiscal journal vs sub-vault allocation, commitments and treasury cash account; plus supply equation vs approved minted/retired certificates. Never compare the same computed value to itself. Snapshot at a shared transaction/LSN or bounded ledger watermark to avoid false race discrepancies.
4. **Security layers:** explicit least-privilege DB grants + safe function `search_path` + actor/resource predicates + application session/RBAC/CSRF + time-limited step-up for finance + rate limits. All failures are fail-closed, not UI-only controls.
5. **Migration direction:** never modify 001–271 applied files; query actual applied migrations in Production and all Test DBs. Choose a fresh contiguous number from the current authoritative baseline, resolving candidate 269–271 and v701 emergency SQL without duplication. Prefer expand → backfill/verify → domain cutover → revoke → contract, with checkpointable rollbacks.
6. **No silent monetary correction:** unexpected WLD gaps are put in quarantined audit/reconciliation state; approved compensating postings use independent evidence and stable correction IDs. Never silently zero a mismatch, mint to cover a deficit, or rewrite ledger history.
7. **Test first:** RED failing integration/security/economic invariants, GREEN minimal domain implementation, REFACTOR, exact app/DB SHA evidence. Mock-only success cannot satisfy financial gates.
8. **Feature truth:** one shared registry maps visible action → Next BFF → Nest controller → SQL command/worker → receipt/evidence → UX states. Routes may exist but be disabled, pending, Test-only or unverified.
9. **Background owners:** adopt a single durable lease/fencing protocol per recurring job, not two uncoordinated schedulers. Distinguish each job's `disabled`, `ready`, `processing`, `success`, `stale`, `error` and `last_committed_at`.
10. **Public and private data:** content, analytics and Android requests never expose internal tokens/DB financial reads; member summaries are actor-scoped. Cacheability must be separate for authenticated and public routes.

## 3. Risk and remediation register

| ID | Priority | Confirmed concern / objective | Preferred work package | Definition of done |
| --- | --- | --- | --- | --- |
| R713-01 | P0 | 237/241 app-role tables writable in DEV, unauthorized ledger bypass | DB authority & migration | no direct forbidden financial writes; correct functions still callable; negative SQL principals pass |
| R713-02 | P0 | hardcoded treasury `RECONCILED` with zero variance | reconciliation read and custody | real independent deltas, unknown/error states and fiscal execution hold |
| R713-03 | P0 | PvP and further domains directly mutate balances | canonical economic settlement | canonical double-entry, exact amounts, idempotency, transaction rollback |
| R713-04 | P0 | ambiguous mint/retire/treasury supply & fiscal drift | central-bank/Mint/Treasury guard | certified issue/retirement only, zero transfer supply delta, no synthetic growth |
| R713-05 | P0 | skipped DB and authenticated user/admin full-route gates | acceptance evidence | restored isolated Test, role-negative and 5-pass UI/device coverage |
| R713-06 | P0 | v697 Test/Production provenance and scheduler ownership split | release/worker | exact SHA, lease and session/rollback proofs |
| R713-07 | P1 | fixed fabricated credit profile & Number amounts | banking truth | real user-scoped data or honest simulation; BigInt-safe |
| R713-08 | P1 | KR/EN/JA/ZH blog duplicate Korean title/canonical | v710-led editorial/SEO | independently localized metadata, sources, editorial, sitemap |
| R713-09 | P1 | Discord QA script parsing error; bot isolated dependencies | bot regression | syntax + dependency setup + real API/voice Test where feasible |
| R713-10 | P1 | broken or unproven UI/API navigation/auth/admin flows | parity / UX | route-action-command matrix, member/admin negative tests |
| R713-11 | P1 | mobile 1.3.5 vs 1.3.0 agent string; API drift | Android | app identity aligned, API contract tests and signed-device session Test |
| R713-12 | P1 | GSC vs submitted vs indexed vs clicked false equivalence | SEO telemetry | provider evidence separated, stale/unknown states, no instant indexing promises |
| R713-13 | P2 | 1,088 lint warnings / accessibility/perf debt | nonfunctional | quantified warning trend, targeted regressions, p75 CWV and server telemetry |
| R713-14 | P2 | historical documentation advertises stars/guaranteed rewards as fact | documentation truth | mark historical marketing vs implemented/verified without deleting evidence |
| R713-15 | P1 | DAOs/grants/stores/alerts may have unsafe client-only success | persistent receipts | owner-bound unique voting/claim state, atomic writes and no optimistic fake success |

## 4. Workstreams, dependency order and integration ownership

**Track F — Finance and DB authority (highest-risk; one owning team/branch stack).**
- F0: freeze scope, enumerate schema signatures, real DB principals, migration checksums, direct DML callers, historical balances and immutable release provenance. Set baseline queries + tamper-evident evidence hashes.
- F1: design and exercise independent read-only reconciliation (account/posting, fiscal/vault and supply) on a restored Test DB. Mismatch reveals differences; no automatic corrective write.
- F2: canonical server-side domain commands for PvP, stock league, marketplace, auction, bonds, pension, FX and SWF with exact integer math and actor/key/ledger guarantees, in small migration-consistent PR batches.
- F3: replace UI/BFF callers with verified server receipts and explicit uncertain state; unit + DB integration + concurrency tests.
- F4: only after all reviewed callers migrate, revoke direct app DML on protected tables (financial/accounting/policy), audit `PUBLIC` and role inheritance, protect default privilege for future functions. Avoid revoking necessary scoped session writes.
- F5: settle legacy fiscal/supply mismatches only through separate reviewed compensating postings with dual-control evidence.

**Track A — Authentication and functionality.** Enumerate every production-visible page, nav CTA, API and worker; add route-state owner matrix. QA across guest/member/mod/admin, mobile+desktop, 401/403/409/429/5xx, CSRF and step-up. Financial actions never auto-retry on unknown outcome.

**Track S — Search, editorial, locale and content.** v710 owner retains all blog files until its branch is merged or explicitly transferred. Then independently validate per-locale content, canonical/hreflang, robots/indexability, facts by jurisdiction and source date, legal/ad restrictions, alt/OG imagery and GSC evidence semantics.

**Track O — Ops, bots, Android and performance.** Add durable scheduler lease and per-run outbox audit, bot QA correction, Android endpoint/version parity and phased lint/CWV optimization. No server tuning should starve PostgreSQL WAL, backups or active sessions.

**Track D — Documentation/governance.** Maintain EN canonical + KO companion specs, exact SHA/role/test evidence, versioned worklog/changelog/internal/GitHub notes, immutable historical records. Existing planning authority changes only by explicit supersession, not automatic version bump.

## 5. Acceptance gates and artifacts

**G0 Scope/governance:** latest main ref and all open PR/file overlap reviewed; named ownership; present-approved design, archive/backup identity and risk table.

**G1 Static and unit:** lockfile install, secret-policy checks, API contract generation/check, TypeScript, ESLint (existing warnings recorded with no *new* warnings), Nest/Next build and every relevant frontend/backend/bot test. Never convert skipped tests to passes.

**G2 DB isolated:** restored Production-equivalent **Test copy** (no Production write); immutable migration checksums contiguous; PostgreSQL 17 exact migration application. Run real `moneyverse_app`, migrator, read-only and malicious principals: deny raw protected UPDATE/INSERT/DELETE, deny PUBLIC definer, permit narrow commands only for actor. Assert per-operation sum(debits) = sum(credits), account projection reconciles, and money supply changes solely with certified Mint/retire.

**G3 Finance adversarial:** 0/1/boundary/max WLD, >2^53 interop, duplicate key with identical and conflicting payload, two simultaneous joiners, crash between posting and outbox, stale room, expired step-up, delayed packet, broken treasury allocation, insufficient funds, multi-account lock order and retry after unknown HTTP outcome. Each leaves no unposted WLD, no double-credit and a permanent receipt or safe denial.

**G4 End-to-end UX:** all route groups real browser, 5 passes at guest/member/admin roles, mobile/tablet/desktop, 2FA/CSRF, focus/touch sizing/WCAG 2.2, inaccessible account identities tests, complete CTA BFF→API→DB evidence and actual source locale HTML. Failure evidence includes route, role, device, timestamp and exact SHA.

**G5 Background/SEO/client:** exactly one job owner across service overlap, durable outbox no duplicate publication, Test noindex, 4-locale canonical/hreflang, provider receipt ≠ indexed proof, Android device session and HTTP/TLS pinned host, bots in QA voice Test without exposing external side effects.

**G6 Staging/Production:** same exact frontend/backend git SHA in isolated Test and vetted schema; verified backup/restore, session preservation from pre-cutover user, Nginx spare ports, health/version/telemetry/reconciliation; reversible Nginx atomic cutover and last-known-good rollback. Schema rollback primarily **forward corrective**; never restore database in place without authorized data-loss assessment. Post-cutover 5 smoke passes and observation.

A domain is `TEST_VERIFIED` only if G1–G5 relevant sections truly passed; `PRODUCTION_VERIFIED` requires G6. No finance release if any P0 financial privilege/ledger/reconciliation test is skipped or failing.

## 6. Delivery milestones (logical sequencing, NOT deadlines)

- M0 evidence freeze: scope and matrix covering all current functions, controllers and DB boundaries.
- M1 fail-closed UI/admin truth and reconciliation observability, no balance writes.
- M2 settlement commands for each bounded financial domain and Test-only release gates.
- M3 DB DML privilege shrink after replacement, restored-copy full regression.
- M4 authenticated full-route/SEO/mobile/worker acceptance with targeted repairs.
- M5 independently approved zero-downtime release. Each milestone receives a separate incremental version, isolated PR, internal/GitHub update and rollback plan. Do not reserve concrete migration numbers before comparing current main and applied DB history.

## 7. Review decisions required before implementation

1. Product sign-off on suspending **new unsafe financial actions** when ledger reconciliation is unavailable, while preserving views, past balances and recovery.
2. Accounting owner sign-off on canonical ledger schema adapter, fiscal vault double count exclusions, fee recipient and rounding for PvP, debt/time units and supply certificate classifications.
3. DBA sign-off on scope of revokes, migration floor, legacy direct-write compatibility and restored Test rollback rehearsal.
4. Content/legal sign-off on KR/US/JP/CN localized articles, real-versus-fictional disclosures and gambling/ad restrictions.
5. Ops sign-off on durable job leader lease, Test application identity, no-downtime steps and on-call rollback authority.

## 8. External reference basis

- PostgreSQL 17: [CREATE FUNCTION / SECURITY DEFINER](https://www.postgresql.org/docs/17/sql-createfunction.html), [REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html), [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html), [explicit/row locks](https://www.postgresql.org/docs/17/explicit-locking.html).
- [OWASP API Security Top 10 2023](https://api-security.owasp.org/editions/2023/en/0x00-header/): actor/object authorization and sensitive business flows.
- [Google localized versions/hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions), [Google review markup requirements](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).
- [Next.js generateMetadata canonical/alternates](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) and [GitHub deployment review](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments). Verify current provider rules again when implementing.

**Status reminder:** PLANNING ONLY. Nothing in this document changes a service/feature switch, member account, GitHub main, Test or Production runtime.
