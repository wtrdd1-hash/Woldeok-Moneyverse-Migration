# C v1136 — SWF manual-liquidation gateway and operator UX hold

**Status: ENGINEERING CANDIDATE / DRAFT / RELEASE HOLD.** 2026-10-28 KST. Authoritative main at start/mid: `35971c600f25869c96f1c666d4b9f58927202730`.

## Source-backed defect and separation of ownership

Main's `frontend/src/app/api/admin/treasury/swf/liquidate/route.ts` forwards an unverified manual-liquidation POST to NestJS. `frontend/src/app/admin/treasury/swf-control-panel.tsx` enables a one-click liquidation and claims a successful cash recovery based only on the upstream `success` field, without a balanced-ledger settlement or immutable receipt. This is a **source-level risk**, not evidence that Production funds were moved. Backend B owns the NestJS service fail-closed fix in **Draft PR #1751**; this branch intentionally does not edit that service, DB migrations, or the B worktree. The related C SWF-read PR #1691 remains unmerged and protected.

## Implementation and contract

- The Next.js same-origin manual-liquidation POST always returns `503`, `{success:false,code:'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',error:...}` and `Cache-Control: private, no-store`, without parsing the request or forwarding any financial mutation to the backend. No simulated success.
- The administrator SWF panel removes its liquidation network handler and success toast. The action remains visible but disabled with a 44px touch target, a screen-reader-associated explanation and an explicit static status notice. Other controls and read-only information are not changed in this scope.
- TDD: four focused RED assertions against main, then four GREEN. Test cases cover missing/normal/extreme request bodies and the accessible disabled operator control. No live funds, DB writes or actual liquidation requests.
- The actual ledger-backed liquidation feature is **not implemented**. The backend B PR and an atomic, idempotent, audited settlement/receipt contract remain mandatory prerequisites. The web gateway hold is defense in depth, not a substitute for backend or DB authority.

## Verification and release policy

Do not merge or deploy on focused tests alone. Required: exact-HEAD full build, lint, typecheck, frontend/backend/unit/integration, isolated PostgreSQL ACL/ledger, security audit, app-api, E2E, mandatory CI, independently attested official Test backend/API/DB/auth/member/admin flow; then fresh main/plan recheck and approved GitOps. Existing QA v1350: 18,000 WLD projection drift, 5 migration checksum mismatches, 20 unapplied migrations, 235 app-role DML tables, 3 PUBLIC bank functions, and 98%+ data disk. Backup #1718 and release identity remain P0. No Production or Test mutation authorized.

### Sequence

- **START:** confirmed Debian 13.6 miniPC, 7 active services, dev PostgreSQL connectivity; read AGENTS, README EN/KO, canonical plan EN/KO, integrated plan EN/KO, 70+ open PRs, latest QA1350, A/B/C and CI. Fresh independent `auto/hourly-c-*` worktree from main; no shared checkout modifications.
- **MID:** TDD RED 4/4 failed on the unprotected main code; GREEN 4/4 passed after gateway + UI changes. Re-fetched main and plan unchanged. Avoided backend B overlap and unverified DB access.
- **END:** recorded in the PR and miniPC internal report after final exact-SHA verification. Release remains HOLD until all gates PASS.
