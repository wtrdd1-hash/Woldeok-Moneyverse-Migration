# Design instruction compliance incident — v2026.11.24.2

Status: CONFIRMED DELIVERY GAP / DOCUMENTATION-ONLY / NOT A RUNTIME RELEASE.
Date: 2026-11-24 KST. Baseline main: `9876c09888ec84034eec183cf1309c85df3d7447`.
Owner request: use newly rebuilt 2026-11-23 design as the sole current implementation visual reference, remove competing old design references, audit all tasks and document violations.

## Evidence timeline
- 2026-11-18: Original 180-image gallery `docs/design/all-pages-v2026.11.18.12/previews` exists on main. Old source was historically approved at that time, but a later owner directive supersedes it for active implementation.
- PR #3398: 180 newly generated 1660x990 v8 PNGs, `game-ui-v2026.11.23.8`, marked GENERATED_NOT_APPROVED; CLOSED, NOT MERGED.
- PR #3399: unified master and v8 PNGs, `feat/game-ui-180-single-master-20261123`; CLOSED, NOT MERGED. Published branch-based link consequently returns 404 (owner screenshot); link was wrongly repeated.
- PR #3400: 180 replacement route-specific v10 PNGs; CLOSED, NOT MERGED. Immutable commit `54a9eb317751df6f1983fc7f20b4f39ffcbcdec7` successfully resolves `docs/design/game-ui-v2026.11.23.10/README.ko.md` via GitHub connector. The catalog explicitly retains original Nov18 and v8 alongside v10. PR head `39888c7d26bdf688737a77b93a7da29e230b4168`.
- PR #3417: `docs/v2026.11.24.1-single-design-reference` OPEN, NOT MERGED; makes v10 the only active reference in its own branch, retains legacy artwork as archived. It targets `fix/test-frontend-real-backend-20261123`, not main. No main integration or image approval is implied.
- Main `docs/UI_UX_SINGLE_REFERENCE.ko.md` is NOT_FOUND. Main planning master still identifies Nov18 reference as authoritative; later owner instruction has not reached main. Owner screenshot shows legacy previews tree.

## Owner-instruction nonconformities
| ID | Finding | Evidence | Status |
| --- | --- | --- | --- |
| DESIGN-001 | Latest Nov23 corrected v10 is not on main/current canonical reference | PR #3400 and #3417 not merged; main canonical reference missing | CONFIRMED GAP |
| DESIGN-002 | Competing older references are still visible and not archived on main | Main Nov18 gallery, Nov18 authority in planning master | CONFIRMED GAP |
| DESIGN-003 | Design files were created but closed/unmerged branches and unstable branch URLs prevented owner access | PRs #3398/#3399/#3400 and owner 404 screenshot | CONFIRMED GAP |
| DESIGN-004 | Assistant supplied unverified 404 URL and subsequently directed owner to legacy visuals | Conversation and owner's screenshot | CONFIRMED ASSISTANT ERROR |
| DESIGN-005 | Route-by-route visual signoff and live Spring UI parity are not proven | v10 catalog declares VISUAL_REVIEW_OPEN; #3400 explicitly disclaims E2E | OPEN QA |
| DESIGN-006 | PRs retained older images without cleanly communicating historical retention vs active removal | #3398/#3399/#3400 descriptions | CONFIRMED COMMUNICATION/WORKFLOW GAP |
| DESIGN-007 | Deleting historical binary assets is not confirmed/authorized as safe on main; do not rewrite immutable Git history | Existing documentation policy §1 | REQUIRES SAFE DESIGN DECISION |
| DESIGN-008 | MiniPC desktop remote connector reports offline, but separate @miniPC system command connector responded. No local asset byte inventory performed in this audit | Connected tool statuses | NOT VERIFIED LOCALLY |

## Required corrective actions
1. Preserve recoverable Git history and immutable v10 commit before any deletes. Verify v10 PNG binaries, 180 route inventory, image hashes and approval per route.
2. Make v10 the only ACTIVE route-by-route image for coding agents in EN/KO authoritative documentation, AGENTS/GEMINI instructions, indexes and implementation references. Mark legacy galleries ARCHIVED / NOT FOR IMPLEMENTATION; remove active links and ambiguity. PR #3417 proposes this but is not merged.
3. Integrate dependency branch and PR #3417 via protected-main independent review + CI, without bypassing controls, after reconciling concurrent Gemini/FE changes and current main.
4. If owner demands removal of old physical files from main (as opposed to active-reference removal), first inventory transitive links, PR and rollback implications; preserve a recoverable immutable historical reference and submit a separate guarded PR. No deletion was performed in this audit.
5. Validate 180 responsive designs visually, actual favicon, admin RBAC, five languages, real backend data, auth/consent/banking; isolated Test screenshot & transaction E2E before any Production release.
6. Always verify direct GitHub URL/file ref before sharing it, and label unmerged PR files as unmerged, not main.

## Safety and limits
This is a partial evidence-based audit of known relevant PRs, current master documents and supplied screenshots, **not** an exhaustive review of every historic worklog, local branch, or code file. PR-described test results are not independently re-executed here. No binary file deletion, source change, Test deployment, Production promotion, or DB mutation. Do not claim v10 is manually approved.

Evidence: [#3398](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3398), [#3399](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3399), [#3400](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3400), [#3417](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3417), [immutable v10 gallery](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/54a9eb317751df6f1983fc7f20b4f39ffcbcdec7/docs/design/game-ui-v2026.11.23.10/README.ko.md).
