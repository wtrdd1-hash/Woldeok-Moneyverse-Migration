# v2026.11.04.1742.1 — NPS funded primary entry actual Production release

## BEFORE — 2026-11-04 14:48 KST
Explicit owner approval to promote. Latest main/PR #2686 SHA dfb98c7c5c2279201ab44808f7ea259acb5ac84d. Official Test was already same SHA with successful identity and financial-readiness gate. Production-current v1740; active old backend/frontend 4484/4485. Existing exact-source immutable Production v1742 build but canary unit files were not present. Master DOCS_INDEX.md, AGENTS.md, RELEASING.md and previous NPS worklog checked. Production backup and rollback required before any cutover.

## MID — actual no-downtime release
- Confirmed pre-existing immutable Production artifact, manifest/build SHA. Confirmed pre-cutover financial-readiness (42 balances, zero unexplained deltas, zero unbalanced transactions, no core app DML).
- Verified earlier full Production backup 131,741,559 bytes, SHA256 491e23c30af5be654283ff2be67aa20e2af95a7768a0d564ed0abd6ce317de45; Nginx original config and previous Production pointer copied for rollback.
- Registered and started v1742 independent systemd web services backend localhost4494 / frontend localhost4495, with new frontend API pointed to new backend and duplicate schedulers/outbox disabled. Old production v1740 services remained running.
- Checked new canary health, frontend version, pension, Treasury, KDIC, wallet, admin pension HTTP200. Nginx routes changed atomically after syntax checks: backend 6 entries, frontend 15 entries; reloaded Nginx without stopping public service. Old worker served initial old response during graceful reload; subsequent new responses verified.
- Atomically switched production-current to new immutable v1742; official exact Production verifier PASS ok:true/failures:[], backend/frontend/public/manifest/build all SHA match. New service units enabled for reboot persistence.

## END — completed scoped Production release
- External HTTPS seven relevant routes (backend/frontend versions, pension, Treasury, KDIC, wallet, admin pension) HTTP200; pension guest HTML shows canonical funded entry before historic record.
- Financial data and sessions unchanged before/after: 891 canonical tx, 1829 postings, 42 balances, 1902 auth sessions, 0 committed new finance receipts. DB schema and member balances never changed.
- New systemd backend/frontend active and enabled; original v1740 services and rollback assets preserved. Release documentation EN/KO, internal/GitHub updates, versioned changelogs committed separately after source merge.
- **Scope limitation:** fixes actual Production presentation/access to already working new NPS funded deposit/refund. Cannot claim authenticated new user real-money E2E, old NPS hourly payout, SOE dividend, KDIC payout, SWF investment, or Mint/CB issuance functional. Those remain under #2366 and await a real backed canonical settlement.
