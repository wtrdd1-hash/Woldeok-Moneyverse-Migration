# Development A — Verified Host Storage Headroom QA (2026-10-30 07:25 KST)

**Verdict: TARGETED PASS / FULL GATES FAIL / RELEASE HOLD.** This is a Draft implementation candidate, not a deployed feature. Main baseline `62c6cd038951d65c94b709302bdaec6e75b080b6`; implementation checkpoint `55cb5c1c3a91fc810184db815b17d78b535c79f2`. Final PR head/CI recorded in PR #1956.

## Source and scope
- Read AGENTS, README, RELEASING, bilingual living/integrated plans, latest QA v1382 evidence, planning Drafts #1949/#1954 and issue #1948. No other worker's code/branches altered.
- Host-only fixed ROOT/DATA `statfs` collector signs Ed25519 payload; backend verifies public key, boot and mount namespace, freshness <=120s, signature, monotonic process-local sequence, strict two-mount data and reserved-block-aware `f_bavail` headroom. A missing key/collector/snapshot returns 503, not a healthy zero. No SQL, grants, ledger, or mobile member endpoint changes.
- Guards: Session/Authenticated/Consent/Admin/AdminSession; private no-store/noindex, global tiered 429; Next admin-only route and bilingual responsive UI with accessible UNKNOWN. No delete/cleanup/restart endpoint.

## Evidence / gates
| Gate | Observed result |
| --- | --- |
| Backend verifier RED→GREEN | 5 PASS |
| Backend guard/controller | 2 PASS |
| Backend actual HTTP auth/503/privacy | 3 PASS |
| Host privileged signed collector | 1 PASS |
| Host signed snapshot → backend reader, tamper rejection | 1 PASS |
| Frontend schema/BigInt precision | 2 PASS |
| Frontend private Next API auth/forgery | 2 PASS |
| Frontend admin page accessibility/SEO/UNKNOWN | 2 PASS |
| Backend TypeScript + build | PASS after optional-property correction |
| Frontend TypeScript | PASS after narrowing correction |
| Changed-file ESLint | PASS |
| Database unit | 56 PASS / 4 SKIP |
| Dependency production audit | PASS: no known vulnerabilities |
| Security advisory regression | 11 PASS |
| Full ESLint | FAIL: 3 existing `stale-tab-notice.tsx` no-empty errors; 1,052 warnings |
| Backend full suite | 2,358 PASS / 240 FAIL / 493 SKIP |
| Frontend full suite | TIMEOUT at 100s, no complete PASS result |
| Mobile API contract | FAIL: pre-existing NPC `affinity` nullable-vs-number drift; generated unrelated files restored |
| Frontend full build | BLOCKED: DATA mount 100% rounded, <1 GiB worker headroom; do not worsen capacity incident |
| Exact-SHA GitHub CI | FAIL on pre-existing lint; final SHA recheck in PR |
| Official Test exact-SHA authenticated E2E | BLOCKED: no signed host collector/key deployed or approved Test candidate |
| Production release, smoke, login continuity, rollback | NOT EXECUTED / HOLD |

## Real PostgreSQL read-only security finding
- Dev PostgreSQL 17.11, `woldeok_moneyverse_dev`: read-only transaction, 293 applied migration rows versus 304 source SQL files. `moneyverse_app` has direct `audit_logs` SELECT/INSERT/UPDATE/DELETE and `users` UPDATE privileges; `ledger_postings` INSERT and `ledger_transactions` UPDATE are false. P0 least-privilege and append-only audit boundary drift is **not** a Production claim. No SQL mutation performed. Existing issue #993 updated.

## Branch preservation
- Initial remote branches 38; after this branch 39. Initial open PRs 32; after Draft #1956, 33. Full 38 non-main branch comparison: 35 have unique unmerged commits, 3 are fully behind main, 0 unknown. Two conflicting PRs #1901/#1892; duplicate branch heads 0, PR head mismatch 0. No branch deletion, forced PR closure or main merge. Even fully-behind branches retained pending ownership/rollback audit.
- Main remained `62c6cd038951d65c94b709302bdaec6e75b080b6` at start/mid/pre-final review. Latest planning #1954 remains Draft and unmerged.

## Release HOLD and rollback
- Host DATA capacity deteriorated from ~981 MiB to ~667 MiB available during the run; ROOT filesystem ~96% used. No files/backups/containers/refs pruned. Capacity incident #1170 updated.
- Collector and public key provisioning are deliberately not performed in Test or Production. The feature returns 503/UNKNOWN until an approved host collector exists. No DB migration rollback needed. If ever deployed, rollback is previous immutable application generation and disable collector; retain signed evidence for audit. No release approved by this candidate.
