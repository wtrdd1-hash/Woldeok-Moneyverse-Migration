# Current Documentation Status — DOC-2026.11.11.1500

**English canonical** | [한국어](CURRENT_DOCUMENTATION_STATUS.ko.md)

> Captured: 2026-11-11 15:08 KST; repository baseline `05e9260208db5aecc2463347885ae095c1faba2e`. This is a time-stamped documentation navigation and audit register, **not** a product authority, deployment attestation, or approval of outstanding designs. Refresh source and production evidence before acting on it.

## Read this first: authority order

1. [Living Project Plan](planning/PROJECT_PLAN.md) / [KO](planning/PROJECT_PLAN.ko.md): current implementation-facing authority **on merged `main` only**.
2. [Integrated Planning Master](planning/INTEGRATED_PLANNING_MASTER.md) / [KO](planning/INTEGRATED_PLANNING_MASTER.ko.md): authority lineage and planning drift.
3. Explicitly adopted detailed [planning specs](planning/README.md); they do not become live functionality by publication.
4. Exact-version [runtime baseline](CURRENT_RUNTIME_BASELINE.md) / [KO](CURRENT_RUNTIME_BASELINE.ko.md), API contracts and production receipts govern *observed runtime facts*, not product decisions.
5. [Policy](DOCUMENTATION_POLICY.md), [catalog](DOCUMENT_CATALOG.md), [full EN index](INDEX.md), [KO index](INDEX.ko.md), historical updates and worklogs.

The product plan and integrated planning master on this baseline still lead with planning v1518 (inventory source-truth hardening), plus a v2026.11.09.1946.2 **blog owner override marked BRANCH CANDIDATE**. Newer version strings in individual notes or `implementation_plan.md` do not silently promote these into current adopted features. Separately observed branch `planning-v2082-20261111-1405` / `113fba55c9` is **not** adopted `main` authority by being present on the server. The planning agent may update it independently.

## Evidence versus intent — do not conflate

| Subject | Observed evidence on 2026-11-11 | Documentation status |
|---|---|---|
| Web source | `origin/main` at the capture baseline shown above; latest documented docs skill release v311 was merged | SOURCE OBSERVED — not runtime identity |
| Production | Read-only `GET https://easy-scraping.com/api/version` returned HTTP 200 and SHA `727881420a491bb129a1a97258ea8ae67f62bbf8` at 15:08 KST; previous [v1949 release receipt](releases/v2026.11.10.1949-funded-treasury-prod.md) exists | BASIC ENDPOINT OBSERVED only; not a complete authenticated acceptance test |
| Test | Read-only `GET https://test.easy-scraping.com/api/version` returned HTTP 502 at 15:08 KST; 14:14 [QA evidence](../DOCS_INDEX.md) also records unavailable upstream | BLOCKED — no claim that Test gates pass |
| Admin Discord/Telegram OTP, Treasury, bonds, pensions, blog | Main contains source changes and historical operational records, but current cycle did not run browser E2E or money movement validation | IMPLEMENTATION/RELEASE status must be read from exact feature receipts; no blanket “fixed” or “Production verified” claim |
| Android app | [Separate Android repository](https://github.com/wtrdd1-hash/woldeok-moneyverse-app) source `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb`, most recent observed app main | SOURCE OBSERVED, no APK build or compatibility verification |

## Inventory & cleanup, without deleting history

- 4,909 tracked Markdown/MDX files examined in the **web** repository (excluding other file types), plus 59 Markdown files present in the **app** checkout.
- Main collections: `docs/worklog` 1,649; `docs/updates` 1,456; `docs/changelog` 620; `docs/planning` 376; `docs/releases` 214.
- 56 exact-content duplicate groups identified. No historical receipts were deleted or de-duplicated without an inbound-reference proof.
- The first simple link pass checked 5,315 relative-looking references and flagged 647 candidates, **including false positives for site/API routes**. These numbers must not be presented as 647 actual broken documentation links. A targeted review of `docs/DOCS_INDEX.md` identified wrong `docs/` relative prefixes and five obsolete file names: corrected in this cycle.
- Eight *candidate* missing English/Korean pairs in the scanned root/planning subset require classification; exceptions for historical, internal and compatibility material still apply.
- Full [method, limitations and follow-up backlog](findings/2026-11-11-documentation-inventory-v2026.11.11.1500.md) / [KO](findings/2026-11-11-documentation-inventory-v2026.11.11.1500.ko.md).

## Working rules

Keep English canonical with Korean second, store changes in a dedicated branch, recheck `origin/main` before integration, leave all dated historical evidence discoverable, and record start/middle/end, internal and GitHub-facing updates. **Documentation-only changes do not authorize Test/Production promotion, database migrations, or changes to balances.**
