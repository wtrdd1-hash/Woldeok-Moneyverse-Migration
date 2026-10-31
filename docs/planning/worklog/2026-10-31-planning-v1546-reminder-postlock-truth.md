# Planning v1546 — F675-192 Reminder Post-Lock Time and Safe Inbox Navigation
- **GitHub:** Draft PR #2119 OPEN/HOLD, parent #2113, engineering issue #2112 updated; no merge or deployment.
**State:** DOCS_ONLY / DRAFT / RELEASE HOLD. **Cycle:** Improvement v1542 → Addition v1544 → Improvement v1546 → Addition v1548 (provisional). **Base:** v1544 Draft #2113. **Handoff:** #2112. **Main authority:** `761a55a094fb9dd383d213e817305e68c79fa23c`.

## Start
miniPC Debian 13.6 active service status and DEV DB connection checked. skills connector returned no URIs, so installed Superpowers using-superpowers, brainstorming, writing-plans, worktrees and verification were read from repo. Isolated worktree and branch created; AGENTS, README and canonical EN/KO plans reviewed. GitHub Draft #2113 and issue #2112 checked.

## Midpoint
Main and canonical plan rechecked unchanged. Source inspection found notification search's link allowlist rejects /inventory; notification DTO already allows PRODUCT_ACTIVITY; notification inbox table creation/ACL remains unverified. v1544 statement_timestamp-before-lock proposal could classify an item against stale window time. New design uses ordered locks and post-lock clock, exact-precision receipt+inbox transaction, and safe CTA compatibility. Historical QA v1405 only; #2103, #2111, #2031 remain open release risks.

## Handoff / evidence
English canonical and Korean equivalent master/plan updated; P0 4 + P1 6 engineering tasks; isolated synthetic acceptance NOT RUN. External independent references newly approved 0, cumulative UNKNOWN/10,000 BLOCKED. No runtime/DB/WLD/ledger/Test/Production changes or main merge. Commit, Draft PR and CI status must be appended only after verified.

Fresh read-only public HTTP at 09:10 KST: Test FX 500, Production FX 200, Test /inventory 307 (redirect not followed). No authenticated Test SHA evidence.
