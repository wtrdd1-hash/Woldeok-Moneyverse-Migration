# Integrated Planning Re-review v2026.09.22.348
## v1324 Re-review — Member-confirmed vs administrator-closed support truth (2026-10-26; DRAFT/HOLD)
- Verified main Migration196 allows admin status resolved without member acknowledgment; /support labels it “처리 완료”. Dev read-only: resolved2, waiting_user1, messages6; not Production or satisfaction evidence. Existing source, support transcript, support reply-attention v1316/v1318 and support evidence attachments are distinct; no overlap with their implementation branches.
- Decision: opt-in owner feedback per immutable new resolution event; no automatic confirmation from GET/notification, no retroactive legacy proof. Explicit acknowledgment and optional helpful/note; existing member reply reopens independently. Current event/version and idempotency required.
- Proposed owner GET/POST + additive SQL event/feedback, admin resolved-transition/audit atomicity, row locks, SECDEF and PUBLIC revoke, privacy k>=20, noindex/no-store, Android/WCAG, fail-closed error states. P0 4/P1 6: ENV1324-01 SEC1324-02 REL1324-03 SUP1324-04 SUP1324-05 SUP1324-06 SUP1324-07 SUP1324-08 SUP1324-09 SUP1324-10.
- QA v1297 FAILED/HOLD, root98% ~2.0GiB, security/ACL/migration/Test/restore blockers. External 10k newly approved 0, cumulative UNKNOWN; BLOCKED/IN PROGRESS. No runtime deployment or user data writes.

- **v1322 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1432 (stacked on unmerged #1427; DRAFT / RELEASE HOLD). **Engineering issue:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1426.

## v1322 Re-review — Collection curation read/write and canonical code integrity (2026-10-26; DRAFT/HOLD)
- Main source evidence: frontend NEO_CYBER_ARCADE_TOKEN vs backend NEO_CYBER_CASINO_CHIP; GET listCollections inserts four samples; GET getCurationStatus inserts/updates progress; POST accepts arbitrary targetStep and independent D1/D3/D7; UI ignores failed optimistic mutations. Dev read-only: 8 collection rows/2 owners and 2 progress rows step1/D7; no Production inference.
- Chosen v2: preserve unknown legacy, never certify alias or cache, pure GET with zero DB writes, explicit versioned CAS/idempotent progress and notes, separate day preference, immutable evidence and admin-reviewed alias mapping. P0 4/P1 6: ENV1322-01 SEC1322-02 REL1322-03 COL1322-04 COL1322-05 COL1322-06 COL1322-07 COL1322-08 COL1322-09 COL1322-10.
- QA v1297 IN PROGRESS with failed gates; root98%, exact-SHA Test/restore unverified, Production HOLD. External independent 10k newly approved0, cumulative UNKNOWN, BLOCKED/IN PROGRESS. No runtime deployment.


- **v1320 Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1427 (stacked on unmerged #1420; HOLD). Engineering issue:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1426 (Draft/RELEASE HOLD; predecessor #1420 unmerged).

## v1320 Re-review — Collection provenance truth gate (2026-10-26; DRAFT/HOLD)
- Canonical source: main 1c5b84a1; frontend collections DEFAULT_PIECES/localStorage fallback, backend ensureSeedPieces, Migration232 descriptive provenance, dev DB 8 rows/2 owners/8 seed-code matches and direct app DML. No individual historical grant or Production provenance certified.
- F675-137 adds member evidence receipts rather than erasing legacy rows or falsely validating samples; full owner/API/DB/UX/Android/admin/privacy/SEO/KPI/rollback contract in Integrated Planning Master. 4 P0 + 6 P1: ENV1320-01 SEC1320-02 REL1320-03 COL1320-04 COL1320-05 COL1320-06 COL1320-07 COL1320-08 COL1320-09 COL1320-10.
- QA v1294 FAILED/HOLD; root97%/~3.3GiB; exact-SHA Test, isolated PG/restore, security gates pending. Existing screenshot-corpus aggregate is NOT 10,000 independently deduplicated, approved references. New accepted0; cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS. No runtime deployment.


Date: 2026-09-22
Authority: companion detail to `PROJECT_PLAN.md`; if wording diverges, the integrated summary in PROJECT_PLAN is authoritative.
Scope: current plan, latest implementation plan, v342/v343/v347/v347.1 records, QA/security/release governance, and current external normative references.

## 1. Evidence model

The "10,000+ references" requirement is fulfilled as a traceable corpus threshold plus focused normative review, not as a claim that 10,000 pages were manually opened. Existing project research records SeeClick's 10,000-web-screenshot subset, WebUI's 41,970 screenshots, and RICO's 66,000+ screens: more than 117,970 UI artifacts in aggregate.

Evidence priority is: (1) current normative standards/regulator or central-bank material; (2) repository source/generated contracts/exact-SHA tests; (3) Test/Production runtime evidence with exact identity; (4) large design/UI/security corpora for pattern breadth; (5) historical worklogs/changelogs for provenance only.

## 2. High-priority gaps found

### G348-01 — integrated version drift
The header was v335 while the document already contained v337 and repository work had advanced through v347.1. Acceptance: header v348, EN/KO parity, and explicit supersession semantics.

### G348-02 — defect-state drift
QA-335 findings remain OPEN while later release records report recovery. Acceptance: every state transition records candidate SHA, Test evidence, Production evidence, closure SHA/date; stale OPEN text is never silently deleted.

### G348-03 — Developer Portal/API safety underspecified
v347 implemented `/developer` and live requests, but the integrated plan lacked mutation safety, secret handling, auth/CSRF/step-up behavior, error shape, resource budgets, and OpenAPI evolution rules.
Acceptance: validate generated OpenAPI against implementation; document OAS 3.0 compatibility and a tested path to OAS 3.2.1; use RFC 9110 semantics and RFC 9457-compatible problems where practical; forbid unrestricted Production admin/economic mutation from docs UI; define endpoint auth/BOLA, DTO allowlists, idempotency, pagination, size/rate/time budgets, cache/retry/deprecation; never persist credentials in analytics or localStorage.

### G348-04 — newspaper vote authority conflict
v343 records localStorage poll behavior while v347 adds a POST vote API. Acceptance: for a shared poll the server owns eligibility/votes/aggregate and localStorage remembers browser UX only. If intentionally local/demo, label it as local/demo and never present its percentages as global opinion.
### G348-05 — consent step-up semantics
v347.1 fixed blackout with an in-place modal, but planning lacked a full state/accessibility contract. Acceptance: server authority for versioned age/terms/privacy grants; labelled dialog and focus management; idempotent submit; expired-session/network/conflict recovery; protected mutations remain blocked until server-confirmed grant; sensitive consent payloads excluded from analytics.

### G348-06 — stock-halt plan/implementation mismatch
v315 says planning-only while v342 records a live database fix/release. Acceptance: v315 is the product contract and v342 is implementation evidence; real-DB concurrency, double-credit prevention, missing-cost-basis fail-closed, and immutable-ledger tests remain ongoing gates.

### G348-07 — freshness semantics
Home/newspaper/developer surfaces use live/real-time language without one stale-data contract. Acceptance: every live datum carries source timestamp, fetched timestamp, maximum staleness, stale UI behavior, retry/backoff, and safe fallback. Client animation never proves freshness.

## 3. Detailed implementation contracts

### API / Developer Portal
- Keep stable operation IDs and contract-first endpoint inventory.
- Reject undeclared mutation fields; monetary authority uses integer/minor-unit or exact-decimal contracts, never binary-float authority.
- Persist mutation idempotency scope/key/result hash; use stable cursor pagination under concurrent inserts.
- Publish rate/resource budgets, correlation IDs, cache/retry/version/deprecation behavior.
- "Try It Out" defaults to sandbox/read-only. Privileged writes retain normal authorization, CSRF and step-up and may be disabled entirely on Production docs.

### Newspaper
- Story authority includes id/type/content, scenario/event links, generated/published/corrected/retracted timestamps, locale, disclosure and provenance.
- Embedded market values are timestamped snapshots; current quotes are explicitly distinct.
- Poll authority includes pollId/options/window/eligibility/vote policy/aggregate freshness/idempotency.
- Never expose private prompts, secrets, personal financial profiles or private moderation data. Only stable public archive/detail URLs are index candidates.

### Consent
- State machine: UNKNOWN -> REQUIRED -> SUBMITTING -> CURRENT or ERROR; SESSION_EXPIRED is distinct.
- Policy-version changes return the user to REQUIRED while preserving prior audit history.
- Backend stores exact policy versions/timestamps; frontend cache is advisory.
- Mandatory dialogs still satisfy keyboard, screen-reader, zoom/reflow and focus-not-obscured requirements.

### Release / QA
- Documentation changes alone never claim runtime deployment.
- Implementation branch -> exact candidate Test -> real DB/API/security/accessibility/responsive checks -> re-read latest plan -> merge -> exact merged SHA rebuild -> zero-downtime Production -> identity/session/smoke/log checks.
- Any P0/P1 auth, financial-integrity, DB-migration, cross-account, split-release or data-loss defect blocks Production.

## 4. Current reference refresh — checked 2026-09-22

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- OpenAPI Specification 3.2.1 (label corrected by v349; URL unchanged): https://spec.openapis.org/oas/v3.2.1.html
- RFC 9110 HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- RFC 9457 Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- OWASP API Security Top 10:2023: https://owasp.org/API-Security/
- NIST SP 800-63-4: https://csrc.nist.gov/pubs/sp/800/63/4/final
- NIST SP 800-63B-4: https://csrc.nist.gov/pubs/sp/800/63/b/4/final
- NIST SP 800-218 SSDF 1.1: https://csrc.nist.gov/pubs/sp/800/218/final
- ISO 20022-1:2026: https://www.iso.org/standard/20022-1
- Bank of Korea, Payment and Settlement Systems Report 2025: https://www.bok.or.kr/eng/bbs/E0000866/view.do?menuNo=400223&nttId=11064840

## 5. Required planning behavior
Every hourly/planning cycle appends a concise record to PROJECT_PLAN, not only to a side worklog. Re-read remote main before implementation and once midway because the plan is living. Keep English primary and Korean synchronized. Preserve historical defects and distinguish planning, implementation evidence and deployment evidence.


### G348-08 — v46/v47 emergency-defense draft needs safety refinement
The mid-work re-read found new implementation-plan v46/v47 proposals for dynamic policy binding, exempt-path matching, a 200ms mount fade and an automatic <10s rollback script. These are draft inputs, not automatically safe production contracts.
Acceptance:
- policy lookup failure uses an explicit fail-safe state and never invents a consent version from a stale/hard-coded fallback;
- route matching canonicalizes path/encoding/trailing-slash variants and server/API authorization remains authoritative; a client overlay is not a security boundary;
- the exempt-route matrix is tested for prefix confusion, encoded-path bypasses and API mutation paths;
- fade duration is a UX choice, while CLS/flicker is measured by browser evidence rather than asserted as 0%;
- rollback targets a recorded last-known-good paired frontend/backend release with artifact SHA/digest, schema/migration compatibility and health/session checks;
- `systemctl reload-or-restart` is not treated as zero-downtime proof by itself; use the established blue/green/canary cutover and rollback anchor.
