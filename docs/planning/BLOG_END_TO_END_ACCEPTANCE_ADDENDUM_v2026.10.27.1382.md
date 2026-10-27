# v2026.10.27.1382 — End-to-End Blog Planning and Engineering Acceptance Addendum

**State:** planning reconciliation / implementation pending / Production not accepted. [Korean detailed version](BLOG_END_TO_END_ACCEPTANCE_ADDENDUM_v2026.10.27.1382.ko.md) · [verified code/runtime audit](../findings/BLOG_END_TO_END_PLANNING_CODE_AUDIT_v2026.10.27.1382.md).

## Binding authority

Retain v975 evidence, reviewer, claim, DB privilege and audit contracts; v1107 independent native four-country editions and limited immediate GREEN publishing; **v1108 supersedes any language that automatically unpublishes articles for overdue review**. A 24-hour review deadline triggers alerts, **not removal, noindex or retraction**. Human-authorized removal and separately audited legal/security emergency powers remain.

The in-progress `docs/blog-tech-editorial-v1380-20261027` effort owns TECH-specific editorial templates. This addendum only harmonizes cross-category, cross-locale, publication and release acceptance without editing competing code.

## Mandatory article/editorial contracts

1. Each article has an explicit `articleType: TECH | FINANCE | PRODUCT_GUIDE`, real reader question, target jurisdiction/locale, topical relevance, fact-freshness status and canonical relationship. Body composition, citations, related tools and promotions must be type-aware, not a shared finance-only template.
2. TECH content must contain: problem/impact, architecture, minimal executable code/SQL or reproducer, benchmark environment + data + command + raw results when claiming measurements, limitations/trade-offs, direct authoritative primary technical references. Never invent TPS/precision/accuracy numbers. Quality is judged by reader utility and verification, **not padded word count**.
3. FINANCE content must identify jurisdiction, rule effective date, official source URL and verified claim IDs, units, formula version/rounding, target eligibility, relevant exceptions; sensitive claims are AMBER and require prior human revision approval. Live market numbers require dated, durable source observation, freshness and consistent effective time.
4. Optional widgets and related materials must be resolved from a reviewed `article_id → contextually relevant active target` relationship. No default compound calculator, virtual stock card, simulated banking offer or irrelevant financial call-to-action on TECH. If there is no relevant tool, render none. Remove claims such as guaranteed finance accuracy, guaranteed benefits, or exact inventory counts unless evidenced.
5. Display honest reviewed/updated/publication timestamps, author and AI assistance disclosure, corrections, references. Never invent views, read time, quantified tests or market quotes; hide unmeasured metrics and calculate reading-time estimates transparently.
6. Create genuinely native content separately for KR/US/JP/CN. Map alternate `hreflang` only between editorially equivalent intents and use self-canonical for independent articles. Do not treat IP, user-interface language and tax jurisdiction as identical. English primary product language and Korean second-language availability coexist with each article's native-country language.

## Persistent workflows and operator access

- Persist `topic → ingested source → claim → draft → revision → deterministic QA → reviewer where needed → durable publish receipt → correction/withdrawal` with immutable source provenance, data hashes, times, jurisdiction, expiry, signed exact-content publication receipts and idempotent outbox. Model-generated approval tokens and direct JSON-file writing do **not** confer publisher privilege.
- GREEN verified low-risk original education publishes automatically after independent checks and atomic persistence; AMBER waits for a qualified human's approval of the exact revision; RED never publishes. A 24-hour overdue state only alerts, maintaining public visibility until a person acts. Require concurrent publication/withdrawal, replay, stale-source, approval-change and scheduler-restart negative tests.
- Admin UI must expose country/language, reasoned holds, unsourced/unreproducible measurements, duplicate candidates, post-publication review alerts, evidence, corrective revision, manually authorized retraction and audited emergency halt. Existing unaudited `?purge=true` disk deletion is not the target contract. Never silently bulk remove legacy articles.
- New SEO contracts cover public/list/sitemap/BLOGPosting consistency, correction/noindex/410, canonical/hreflang equivalence, cache revalidation and verifiable GSC measures; use `NO_DATA` rather than fabricated keyword volume, CTR or results.
- QA includes 320/375/768/1024px viewport, all four native locales and financial numeracy, article-type widget relevancy, source recency, duplicate candidates, 24/48h overdue remains public, authenticated editor/administrator, mobile/web, DB negative ACL, exact-SHA isolated Test app+backend+DB, backup/restore, CI/security/finance gates and independently confirmed zero-downtime promotion.

## Versioned order

**v1382.1** establish the actual Production writer, filesystem mode changes, scheduler/hold and source-SHA evidence; **v1382.2** category-aware generation, trusted source verification and duplicates; **v1382.3** trusted GREEN/AMBER/RED publisher/outbox/overdue alerts and manual withdrawal; **v1382.4** four-country native SEO and contextually matched related experiences; **v1382.5** operator/mobile/a11y/locale verification; **v1382.6** CI + separate Test backend + exact release artifact and zero-downtime Production gate with immutable worklog and internal/GitHub change notes.

**This change delivers planning and audit only. It does not certify that a new content pipeline, release, live indexing, or backend publication has occurred.**
