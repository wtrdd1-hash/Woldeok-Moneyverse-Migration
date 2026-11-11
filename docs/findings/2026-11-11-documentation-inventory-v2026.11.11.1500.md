# Documentation Inventory & Cleanup Audit — DOC-2026.11.11.1500

**English canonical** | [한국어](2026-11-11-documentation-inventory-v2026.11.11.1500.ko.md)

- Capture: 2026-11-11 15:08 KST. Source: `05e9260208db5aecc2463347885ae095c1faba2e` (web), `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb` (Android). Scope: Git-tracked `*.md`/`*.mdx` of the web repo plus separate app checkout. This is a machine-inventory and targeted editorial review, **not** proof that all 4,909 documents are semantically current.
- Web Markdown: 4,909 total. Largest groups: worklog 1,649; updates 1,456; changelog 620; planning 376; releases 214; superpowers 158; findings 107.
- App Markdown: 59 files. App main README cited outdated `f40709ae...`, although the current app main observed was `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb`.
- Exact byte-content SHA-256: 56 duplicate groups; some are differently purposed GitHub/internal/worklog records. **Keep history** until provenance and inbound links are examined.
- First-pass Markdown-link extraction: 5,315 file-or-route-like targets; 647 nonexistent *filesystem* matches. Many are expected `/api` or website routes, not Markdown links. These are **candidates** only, not a verified broken-link count. The index `docs/DOCS_INDEX.md` has demonstrably incorrect relative `docs/` prefixes, root-file cross-links, and five historical filename mismatches; fix those directly.
- Candidate English/KO gaps in scoped root/planning files: 8; do not translate legacy or internal artifacts without classifying maintenance status.

## Remediation performed in this cycle

1. Establish a single **navigation/status gateway** that points to living planning authorities and clearly separates implementation, Test, and Production truth.
2. Correct the document links in `docs/DOCS_INDEX.md` without renaming files or losing backlinks.
3. Update EN/KO doc READMEs and master indices to stop describing historical versions as the current runtime or current planning cycle.
4. Add paired audit, worklog, changelog and GitHub/internal update records; update app repository docs entry point without changing app code.
5. Preserve legacy snapshots and all authority-superseding planning work for specialist planning/QA agents to reconcile rather than silently rewriting their decisions.

## Deferred, explicit backlog

- **P1 DOC-LINKS**: replace the simple regex with an AST-aware checker distinguishing Markdown file links, frontend routes, API examples, anchors and non-file URIs; repair validated broken Markdown links in targeted batches.
- **P1 DOC-PAIRS**: classify the 8 EN/KO candidates under `DOCUMENTATION_POLICY.md` historical/compatibility exceptions; only pair currently maintained authority docs.
- **P2 DOC-DEDUP**: enumerate 56 duplicate groups with inbound link maps and provenance; never bulk-delete dated history.
- **P0 QA/RELEASE (owned elsewhere)**: Test `/api/version` 502 at 15:08 KST; no authenticated E2E claimed. [QA snapshot](../CURRENT_DOCUMENTATION_STATUS.md) is not a waiver.
- **P1 AUTHORITY-DRIFT**: merge or explicitly reject newer planning candidates through normal planning review; do not overwrite concurrent planning agent branches.

## Check methodology

Read-only Git inventory, UTF-8 content hashing, Markdown link parsing and filesystem existence checks; compare live current origin/main at start/mid, app main and two public version endpoints. No database writes or release commands. Raw scan files and start/mid logs retained on the authorized miniPC under `/srv/moneyverse-tasks/docs-v2026.11.11.1500/`.
