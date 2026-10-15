# Moneyverse end-to-end planning, source, functionality and production re-audit — v2026.10.16.711

**Status: BLOCKED for whole-platform functional/financial acceptance.** EN canonical | [한국어](MONEYVERSE_FULL_PLAN_CODE_FUNCTION_REAUDIT_v2026.10.16.711.ko.md)

## 1. Evidence identity and authority

- Audit started 2026-10-16 KST from GitHub `origin/main=8ba6b4426f9e662f7196f364bfc19c9350476cc1`, in isolated branch `audit/full-plan-code-runtime-v2026.10.16.711`; mid-work origin advanced to `1eb65c685c7d116d569283c7971ab9efdaf32019` via concurrent v701 security/server operations, and the audit worktree fast-forwarded without overwriting it.
- Source-level tests, typecheck, lint and build were executed against **8ba6b442**. Its source diff against the later **1eb65c68** was limited to v701 documentation and `ops/security/v701-*.sql`; these are **not** a claim of a repeated full CI run against the later SHA.
- Production verified running source `a5a1e9da6fc55ac71c44c4cf6ee138e9442f4e73` (`prod-v2026.10.15.697`); current Test pointer `test-v2026.10.15.696-a5a1e9da6fc5`. Production frontend/backend v697 systemd services active (3214/3213); old v600 frontend/backend services remain active at older ports for rollback/background jobs. Production `/api/version` returned exact v697 source. No member financial transaction was sent.
- Android GitHub `main=ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb` (v1.3.5). Its source was read through GitHub, not rebuilt on device. Existing unmerged v710 country-blog work and v712 planning work were not altered.
- Authority: `docs/DOCUMENTATION_POLICY.md` => `docs/planning/PROJECT_PLAN.md` => `docs/planning/INTEGRATED_PLANNING_MASTER.md` => expressly adopted detailed specifications. v523/v542/v543 monetary conservation and v530 whole-route UI hold have not been silently superseded by successful builds/deployments. Historical `DOCS_INDEX.md`, `PROJECT_MEMORY.md`, `implementation_plan.md` marketing/completion entries are not current proof.
- Git-tracked snapshot: 4,337 files, 2,289 Markdown files, 163 Next page components, about 82 Nest controller files, 78 Next API handler files and 270 SQL migration files. Inventory is **not** feature acceptance.

## 2. Executed test and runtime evidence

| Verification | Observed outcome | Boundary |
| --- | --- | --- |
| `pnpm install --frozen-lockfile --offline --ignore-scripts` | PASS, isolated checkout | Dependencies only |
| `pnpm test` | Exit 0; backend **1,212 passed / 396 skipped**, frontend **1,220 passed**; contract/DB package and audit script stages also completed | Skipped DB/E2E is not pass |
| `pnpm typecheck` | PASS | Static typing only |
| `pnpm lint` | Exit 0, **0 errors / 1,088 warnings** | Technical debt remains |
| `pnpm build` | PASS (Nest + Next production build) | No authenticated browser flow certified |
| `pnpm bot:test` on new checkout | FAIL: bot `youtube-dl-exec` not installed in isolated bot folder | Environment/setup failure, not proven bot logic fault |
| `node --check bot/scripts/qa_ads_sponsorblock_verification.mjs` | FAIL: SyntaxError at line 7 | Reproducible source syntax defect |
| Anonymous production frontend checks with correct Host/X-Forwarded-Proto | 200: /, /status, /blog, blog article, /stocks, /tools/compound-calculator, /admin/blog, /robots.txt, /sitemap-blog.xml and locale blog pages | Authenticated actions / audit gating not exercised |
| Unauthenticated `/app-api/v1/account/identities` | 401 (expected) | Not proof signed-in endpoint works |
| Database privilege read, `woldeok_moneyverse_dev` | 241 public tables: SELECT 238, INSERT 237, UPDATE 237, DELETE 237 for `moneyverse_app` | Development DB, not automatically production |
| SECURITY DEFINER public execute | **11 before concurrent v701, 0 rechecked after v701**; functions total 485 | Historical issue mitigated during audit; app's table privileges still excessive |

Production v697 release evidence explicitly reported money mutation privileges; v701 release verifies PUBLIC execution remediation with a restored Test DB. Production independent least-privilege acceptance, transaction ledger conservation and authentic member E2E remain open.

## 3. Verified current-source defects and policy gaps

**A711-01 — P0, excessive database DML privileges (current).** The app role can UPDATE/DELETE/INSERT 237 of 241 public tables in development, inconsistent with restricted SECURITY DEFINER RPC architecture. Production v697/v701 records independently acknowledge continuing balance direct UPDATE/ledger INSERT privileges. Do not blindly REVOKE before inventorying legacy callers and forward-only migrations, data reconciliation and isolated negative privilege tests.

**A711-02 — P0, misleading treasury reconciliation.** `backend/src/admin/treasury/treasury.repository.ts:506` constructs a `RECONCILED` result with `total_ledger_net_flow_wld` set to the vault balance and discrepancy `0` without cross-check; `:879` does the same in `getReconciliation()`. UI/API must fail closed or show UNKNOWN when independent postings and vault movements have not actually been reconciled. Existing treasury v683–690 PRs remain separate/unmerged; their success is not production closure.

**A711-03 — P0, PvP direct balance settlement outside canonical double-entry.** `backend/src/casino/pvp-arena.repository.ts:347-373` directly UPDATEs losing/winning/treasury account balances without canonical ledger postings. **Correction to historical audit:** current code *does* use one `withPgTransaction`, ordered balance locks and crypto `randomInt` (v653); do not repeat historical assertions that it lacks those mitigations. End-to-end accounting and idempotent settlement evidence are still lacking.

**A711-04 — P1, credit score fabricated inputs / imprecise amounts.** `backend/src/bank/bank.controller.ts` credit-rating method sets fixed `accountAgeDays:30`, `jobLevel:5`, `historicalRepaymentsCount:3`, `overdueRepaymentsCount:0`, and converts wallet values through `Number(...)`. Rating should use audited actor-scoped facts or explicitly label itself illustrative; store/compute WLD as exact integer strings/BigInt.

**A711-05 — P1, country blog is not country-native/indexable content.** Live `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog` return 200 with respective HTML `lang`, yet all four render the same Korean blog title and canonical `https://easy-scraping.com/blog`. `frontend/src/app/blog/page.tsx`, `[slug]/page.tsx` and `sitemap-blog.xml/route.ts` use Korean/default single-language metadata and URL inventory; `blog-post-client.tsx` changes translations client-side. Require per-locale editorial content provenance, real locale URLs, server-rendered locale metadata, self-canonical/hreflang and image rights/alt review; **do not overwrite the concurrent v710 candidate**. No ranking claim from merely 200.

**A711-06 — P1, bot QA syntax.** `bot/scripts/qa_ads_sponsorblock_verification.mjs:7` contains an invalid multiline single-quoted string and fails Node syntax check. Isolated `bot:test` requires bot-specific dependencies; report that setup separately.

**A711-07 — P1, financial release/orchestration ownership.** v697 running backend has selected scheduled AI market/news/outbox/SWF jobs disabled; old backend remains live for background job ownership. Independent proof of single-owner job leases, persistence, outbox delivery continuity and rollback is pending. Unit tests and 200 pings do not establish double-execution safety.

**A711-08 — P2, Android client version mismatch.** App `app/build.gradle.kts` uses `versionName=1.3.5` while `ApiClient.kt` sends User-Agent `APP_VERSION=1.3.0`. The app source enforces HTTPS and pinned allowed host, but device build, sign-in, session cookies/CSRF, 179-API compatibility and actual UI/action journeys were not tested in this audit.

**A711-09 — P2, stale / promotional documentation truth.** `DOCS_INDEX.md` markets 4.9-star Google rich results, instant indexing and financial outcomes as if verified. Under current governance these are old inventory/aspirational descriptions; do not use them as success metrics without independent evidence. `PROJECT_PLAN` already records F675 planning-only feature-truth gaps.

## 4. Feature-domain disposition (implementation != operation)

| Domain | Source/runtime evidence | Disposition |
| --- | --- | --- |
| OAuth, account, identity, session, consent, 2FA | Protected anonymous identities path 401; type/unit pass | Authenticated E2E **UNVERIFIED** |
| Wallet, ledger, transfers, pensions, FX, banking | Existing routes/tests; DML boundary too broad, credit mock inputs | **P0 BLOCKED** money acceptance |
| Treasury, budgets, SWF, bonds, grants, taxation | Reconciliation hardcoded, open finance PRs | **P0 BLOCKED** |
| Stocks, orders, corporate actions, AI news | Public /stocks 200; source and tests present | Live fill, worker ownership **UNVERIFIED** |
| Casino, 1v1 PvP, reward loops | Switch enabled, source transaction improvements; direct balance settlement | **P0 BLOCKED** financial correctness |
| Work, earning, businesses, marketplace, auctions, shop | Routes and some unit coverage | Authenticated financial E2E **UNVERIFIED** |
| Board, profile, chat, notifications, gallery, support | Source coverage/public entrypoint | Member write/delivery **UNVERIFIED** |
| Admin SEO, blogging, analytics, operations, audit | /admin/blog shell 200; i18n canonical mismatch | Auth/RBAC and locale SEO **UNVERIFIED / P1** |
| Public calculators and guides | Public calculator 200, build/tests pass | Year/jurisdiction/SEO claims **REVIEW** |
| Discord bot and integrations | Bot QA syntax fail; bot test install gap | **P1 PARTIAL** |
| Android | 57 Kotlin files, 9 Kotlin test files in default-branch tree; version mismatch | Device/build/API journey **UNVERIFIED** |
| CI, DB migrations, releases and rollback | Source build passes; v697 live and v701 grants remediation | Exact finance/backup/session gates **BLOCKED** |

## 5. Remediation order and acceptance

1. **P0 fail-closed finance:** verify genuine treasury-vault-vs-ledger delta, block unsupported disbursements; inventory every `UPDATE account_balances` and no-ledger settlement including PvP/stock league; restore copy of production DB in Test, reconcile conservation and write forward-only secure RPC migrations before DML grants are removed. No production-money mutation as an audit shortcut.
2. **P0 identity and release gate:** test real actor, RBAC/2FA/CSRF, idempotency and timeout-unknown transaction recovery with Test logins; verify Test frontend + backend + database on one exact SHA and existing session continuity, backups and rollback.
3. **P1 correctness:** audit user credit input, stock/news worker owner uniqueness, bot syntax, full browser route × screen size × user role, mobile API contract and image/translation editorial QA; never equate GET 200 with purchase/receipt success.
4. **P1 SEO/international:** reconcile v710 without overwriting it; country-specific substance (KR/US/JP/CN), factual finance regulation/date source, proper locale canonical/hreflang, renderable metadata + XML sitemap, and transparent ads/AI disclosures.
5. **P2 quality:** warning remediation, docs evidence cleanup, instrumentation and regression tests for fixed defects, Android version sync.

**Not performed:** live WLD spending, money migration, production table mutations, feature switch modification, deployments, authenticated full-site five-pass/browser/device tests, independently observed GSC Search Analytics, genuine transaction/outbox delivery across rollover. No global “fixed” or “Production acceptance” claim is made.

Evidence details: [Korean audit](MONEYVERSE_FULL_PLAN_CODE_FUNCTION_REAUDIT_v2026.10.16.711.ko.md), [worklog](../worklog/2026-10-16-full-plan-code-audit-v711.md), [internal update](../updates/v2026.10.16.711-internal.md), [GitHub update](../updates/v2026.10.16.711-github.md).
