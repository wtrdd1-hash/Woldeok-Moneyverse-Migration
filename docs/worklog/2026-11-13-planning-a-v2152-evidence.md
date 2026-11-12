# A/v2152 — QA evidence checkpoint (2026-11-13 04:05 KST)

## Start — scope and skill evidence
Previous B/v2150: Draft #3115; Current A/v2152; Next B/v2154 (provisional, subject to completed-cycle GitHub confirmation).
miniPC system-status API: backend/frontend/bot/MCP/nginx/docker active; development DB connected. This is not production transaction certification.
Hosted skills__list returned an empty catalog; hosted using-superpowers read unavailable. Actual local skill documents read: /home/debian/.agents/skills/using-superpowers/SKILL.md (entry), systematic-debugging/SKILL.md (root-cause gate), writing-plans/SKILL.md (implementation handoff), verification-before-completion/SKILL.md (evidence gate). Local inventory inspected. No helper code executed.
Remote Migration main at start: 5f9219600984a3d8b84144a6ab04df8def4b8120. Read AGENTS.md, README and both EN/KO canonical project plans and integrated masters via main blob inventory. App checkout and complete 30-day history not audited; app latest main SHA not certified in this cycle.

## Mid — evidence and duplicate screening
P0 INC-2026.11.12.01, issue #3101 (OPEN, last updated 2026-11-12): main frontend admin-mint-topup-dialog.tsx POST body has amountWld/reason/otpCode but no requestKey; treasury.service.ts validates UUID v4 requestKey; Next mint-topup route returns {error}, dialog reads data.message. Treasury controller verifies OTP before service validation. These are code-confirmed contract defects, not evidence that any specific production transfer succeeded or failed. Existing #3101 already specifies repair, regression, OTP and settlement certification; **no new root cause or new improvement delta** this cycle. Do not copy OTP from screenshots.
P0 SWF issue #1909 remains OPEN. Existing evidence describes false-success rebalance/liquidation without certified settlement. No new exact-SHA production reconciliation or authenticated E2E obtained; no duplicate proposal.
Open planning PRs #3112, #3114, #3115 reviewed for overlap. Current planning remains evidence-only; developer ownership and Gemini overlap require explicit handoff before implementation.
Priorities: P0 #3101 frontend/backend request and error contract with fail-closed money/OTP tests; P0 #1909 SWF settlement gate; P1 certified authenticated Test E2E and ledger reconciliation; P2 UX/error copy after financial correctness. These are references to existing backlog, not new issues.
No new change to PROJECT_PLAN or INTEGRATED_PLANNING_MASTER proposed without independently verified delta. Historical TSI-20261110-001..011 and Draft #3006 untouched.
Reference gate 10,000 independent verified sources: NOT VERIFIED/BLOCKED (do not claim count). Production settlement, exact-SHA Test, app audit, full 30-day novelty inventory: BLOCKED.

## End — classification and gate
New NET_NEW adopted: 0. New IMPROVEMENT deltas: 0. Duplicates excluded: 2 known P0 issue re-registrations (#3101, #1909). Planning-only records this cycle: 1 bilingual evidence checkpoint. Runtime code implemented: 0. QA/production certified: 0. Existing issue status: OPEN, not reclassified as fixed.
Quality gate BLOCKED: incomplete 30-day/app/production evidence, external 10,000 reference gate, no authenticated exact-SHA Test. No production writes, DB mutations, deploys, or plan canonical edits. Next B must inspect >=3 mechanisms against code, plans, PRs and independent external evidence before any NET_NEW adoption.
GitHub-only review branch and Draft PR are documentation provenance, not merged implementation.
