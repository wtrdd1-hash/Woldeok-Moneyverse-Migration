# v2026.11.09.1946 — National Mint UI and backend policy-domain parity

## BEFORE WORK (2026-11-09 KST)
- Owner supplied two real Production screenshots: approved WORK_REWARD mint order selected visually but form says select approved order; new monetary policy order form sent MINT/TREASURY and returned `internal server error` despite 10+ character reason.
- Read: docs/DOCUMENTATION_POLICY.md (PROJECT_PLAN first, integrated master second), docs/planning/{PROJECT_PLAN,INTEGRATED_PLANNING_MASTER}.md, prior v1941/v1944/v1945 updates/worklogs, frontend mint-dialogs, national-mint-panel, BFF orders and execute, backend monetary controller/service/types and migration 244. Worktree isolated from other agents on freshest origin/main; no change to existing main worktree.
- Root A: MintExecutionDialog hooks initialize `selectedOrderId` from initial `activeOrders=[]`; async active orders arrive later, native SELECT *visually* displays option zero but controlled state remains empty; first submit incorrectly complains no selection.
- Root B: OrderProposalDialog MINT/TREASURY and EXPAND_LIMIT/REBALANCE options are not allowed by persisted migration 244 monetary order_type/target_envelope CHECK constraints. Backend only checks amount/reason, not enum; Postgres CHECK fails and propagates as generic HTTP 500. Existing DB contains one APPROVED MINT/WORK_REWARD, 400000 WLD remaining.
- Integrity blocker: current `MintBureauService.executeAuthorizedMint` updates approved limit and inserts `mint_certificates`, but does not call canonical `economy_post_transaction` or increment Treasury vault. UI wrongly claims `VAULT_MAIN` auto deposit. Historical owner-approved Treasury reset v1944 left true Treasury 0; no auto-funding or invented money may be claimed. Treasury target cannot simply be enabled by loosening CHECK without a funded canonical issuance proof and compatible public fiscal release gate (`safeTreasuryEdgeResponse` accepts certified zero only).
- Scope: real form state repair, validated client/server enums + correct safe feedback, and replace false Treasury credit wording with accurate issuance certificate description or fail-closed where needed. Add regressions. No blind DB CHECK relaxation, no phantom-money issuance, no user balance/ledger mutation. Test / Production release must confirm exact SHA and preserve rollback.

## IN PROGRESS
- Pending red/green regression and production analysis.

## FINISHED
- Pending exact release evidence.
