# Engineering Blog Relevance, Evidence and Depth Contract — v2026.10.27.1380

**Status: PLANNING ONLY; no code changes, publication, Test or Production rollout.**
**Authority:** integrated planning master; editorial v975; country independent publication v1107; no automatic withdrawal v1108. This contract specializes TECH articles; it must not bypass any publication or financial release gate.

## 1. Reported defect and source-level findings

The screenshot shows a 2026-10-27 TECH article titled “Distributed ledger integrity and BigInt integer accounting architecture” with an unrelated compound-interest slider, finance-market exposition, and shallow technical treatment.

| Finding | Verified `origin/main` code (baseline `59cdc2e0`) | Impact |
| --- | --- | --- |
| Unconditional calculator | `frontend/src/app/blog/[slug]/blog-post-client.tsx` inserts `BlogInlineCalculator` after Markdown block index 1 for **every article** | Category/intent mismatch |
| TECH calculator assignment | `frontend/src/app/blog/blog-data.ts` BigInt TECH template points at `/tools/compound-calculator` | Unrelated financial CTA |
| Shared prose | `generateDailyAiBlogPost` prepends macro market data and appends investment/portfolio advice regardless of TECH | Title/body mismatch |
| Citation pollution | Common body always appends FRED/Yahoo/Bank of Korea references. Country profile defines KIF/KDI, but this field's presence **does not prove it was printed** | No claim-to-source mapping |
| Unsupported measurements | TECH template states 1 million / 1 trillion transactions, 42.8 currency units, guaranteed zero errors without attached benchmark evidence; generated views are `Math.random()` and read time fixed at six minutes | Trust and SEO incident |
| Publication boundary | `publishBlogPost` bypasses its own editorial flag; a separate v1102 teammate branch contains a fail-closed 503 response for the legacy route | Must reconcile current **production** release and concurrent branch before fixing |

These are code observations, not assertions that a particular production deployment SHA or writer is identical. Do not edit/delete stored articles during this planning work.

## 2. Editorial verticals and strong article contracts

`TECH` = engineering design, runnable examples, implementation trade-offs, failure cases, measurable proofs, primary technical references. `FINANCIAL_EDUCATION` = country-specific policy, monetary formulas, applicable date, verified official sources and relevant financial calculators. A TECH title never inherits macroeconomic snapshots, savings widgets or stock CTAs merely because it concerns fintech. A country flag/edition must be backed by genuine jurisdiction-specific differences, not a locale string.

Proposed additive model: `editorialVertical`, `subTopic`, `primaryIntent`, `claimRefs[]`, `evidenceRefs[]`, `contentDepthChecklist`, `embeds[]` with signed/allowlisted `widget_id` and exact paragraph anchor. Make `relatedCalculatorHref` optional; TECH defaults to no embed.

**Depth requirements for in-depth TECH guides:** actual problem and pinned runtime/database version; minimal failing example and reproduction command; at least two design alternatives; runnable TypeScript/SQL design with boundary handling; consistency/security/concurrency/idempotency/rollback analysis; test matrix with expected/actual output; explicit limitations; per-claim citations and reproducible experiments. BigInt is an integer representation, not a guarantee of double-entry balance, atomicity or distributed consensus. Distinguish arbitrary-precision JS BigInt from bounded PostgreSQL bigint and from exact decimal numeric.

Editorial target for Korean in-depth guides: approximately 3,000–6,000 characters of main explanatory text, excluding code and tables, **not a hard Google SEO threshold**; article adequacy is measured by problem coverage, reproducibility and originality, not padding. Short engineering notes must be labelled separately and must not claim to be deep analysis. Calculate read time from rendered content instead of a fixed six minutes.

## 3. Citation and measurement policy

A source is associated with a **specific claim**, not assigned by country or topic broadness. Record `claim_id, authoritative URL, exact document title/version, accessed_at, valid scope, evidence_hash, reviewer`. TECH sources favor ECMA/TC39, MDN, PostgreSQL documentation, IEEE standards, original ACM and relevant source/test artifacts. Finance regulators and central banks may support a TECH paragraph only where that paragraph actually cites verified regulatory or economic facts. Verify publication venue (Goldberg 1991 is in *ACM Computing Surveys*, not *ACM Transactions on Computer Systems*).

Every number described as a benchmark, real measurement, latency, error rate or transaction count requires reproducible code, pinned SHA, environment, date, inputs, raw results and reviewer. Otherwise remove the empirical claim or prominently label a demonstrative example without implying it was measured. Never synthesize page views. Do not proclaim guaranteed zero ledger errors from BigInt alone.

Independent deterministic gates: `TOPIC_MISMATCH`, `UNRELATED_EMBED`, `IRRELEVANT_SOURCE`, `CITATION_MISSING`, `UNVERIFIED_MEASUREMENT`, `UNREPRODUCIBLE_EXPERIMENT`, `INSUFFICIENT_DEPTH`, `LANGUAGE_JURISDICTION_MISMATCH`. A weighted quality score is advisory: missing key evidence, fabricated measurements or invalid widgets are hard failures, even at a high score.

## 4. Widgets, publishing and remediation

Replace the hardcoded `idx===1` compound widget with an explicitly approved, semantically relevant `widget_id + anchor` contract. Default is no widget; future sandboxed examples may demonstrate decimal parsing, ledger balancing or bounded WebSocket charting. They must not execute user-provided arbitrary script or access accounts, trading or production databases. Validate mobile 320/360/375px, keyboard navigation and label wrapping; `Live` means verified genuinely live data.

Keep v1107/v1108: only independently verified GREEN low-risk drafts can auto-publish through the new auditable idempotent DB publisher; AMBER requires editor pre-approval, RED is blocked. Legacy `/api/blog/generate` must not publish to shared files merely on administrator/cron credentials; coordinate with v1102. Unreviewed posts exceeding 24 hours trigger **alert only**; no automatic withdrawal/noindex. Existing TECH URLs remain unchanged until an authorized human manually approves a versioned correction or withdrawal with audit record. Queue the screenshot's BigInt article for first manual technical rewrite; never silently rewrite old content.

Align country differences carefully: existing generator has KR/US/JP/VN whereas approved independent publishing contract specifies KR/US/JP/CN. Do not silently rewrite old slugs, country labels or `hreflang`; plan a migration/SEO mapping first. Finance widgets and country-specific original writing continue normally once safely verified.

## 5. Development backlog, acceptance and release sequence

| ID | Priority | Acceptance |
| --- | --- | --- |
| BLOGTECH-01 | P0 | Zero compound widget in every TECH fixture, allowed finance-widget semantics preserved |
| BLOGTECH-02 | P0 | No generic macro/portfolio text or off-topic financial CTAs in TECH headings/body/footer |
| BLOGTECH-03 | P0 | Fabricated 1T-transactions / 42.8-error / random views and ungrounded citations cannot pass checks |
| BLOGTECH-04 | P0 | Legacy generator remains fail-closed; exact publisher receipt and independent GREEN/AMBER/RED enforcement |
| BLOGTECH-05 | P1 | Representative BigInt guide includes runnable TS + SQL, invalid inputs, idempotency/concurrency tests, credible sources |
| BLOGTECH-06 | P1 | Legacy TECH inventory and manual editorial remediation queue, with immutable source/revision history |
| BLOGTECH-07 | P1 | Jurisdiction/locale validation and country-edition SEO parity without artificial duplication |
| BLOGTECH-08 | P1 | Mobile, accessibility, localization, citations, structured-data and source-broken regression tests |

Implement in separate iterations `v1380.1` audit, `v1380.2` taxonomy and generators, `v1380.3` evidence gates and renderer, `v1380.4` one approved sample article, `v1380.5` authenticated mobile/SEO/cross-category QA, `v1380.6` exact SHA CI/isolated official Test backend/API/DB/session/finance/rollback, then documented zero-downtime Production promotion only when release gates pass. Refresh main and coordinate with Gemini/hours A/B/C, especially the existing v1102 editor-gate branch. No stage or Production work belongs to this documentation iteration.

## 6. Primary reference material

- [Google Search Central: people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) (completeness, accuracy, originality, no fixed preferred word count).
- [PostgreSQL Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html) (exact numeric and bounded 64-bit bigint).
- [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).
- The IEEE 754 standard and Goldberg (1991) *ACM Computing Surveys* should be cited precisely if used in the final article. These documents are standards for authorship, **not evidence that Moneyverse performed a performance benchmark**.
