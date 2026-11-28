# P8-AR final architecture / database / artifact review — checkpoint 1 (2026-11-28)

**English canonical** | [한국어](2026-11-28-p8-ar-final-review.ko.md)

Directive v2026.11.27.2310.1. Candidate: integration `643fad6cdb` (+ this branch `security/ar02-least-privilege-20261128`). main 1df1150e97 unchanged. Reviewer: Claude Code (claude-opus-5-5); Codex for the code change. Status per area is PASS only with evidence at this candidate; otherwise HOLD with the reason.

## Before work
- [x] Read the P8-AR directive, AGENTS §1–§9, the latest integration/release records and earlier security matrix.

## In progress → finished (this checkpoint)
- [x] AR02 privilege inventory on the owned synthetic sandbox (migrations to 366): 272 public tables; application role SELECT on 51, INSERT on 9, UPDATE on 2 (+ column grants), DELETE 0; 654 functions, 472 executable by the application role; SECURITY DEFINER functions without a pinned search_path 0, not owned by the migrator 0, executable by PUBLIC 0; `economy_post_transaction` not executable by the application role. Ledger invariants 0/0/0 (336,141 transactions).
- [x] Residual grants mapped to code: INSERT on chat_media_registry, member_board_image_uploads, treasury_swf_events, user_progression has no API writer any more → migration 367 (candidate) revokes them; release order: after the Spring application that uses the registration functions. SELECT on black_market_bid_logs kept: the legacy NestJS gateway still reads it (follow-up when it is retired).
- [x] Sealed auction listing: invented items on a failed read and published the highest bidder → 503 on failure, bidder undisclosed; dead bid-log read/bid write service methods removed.
- [x] Tests: source/parity tests for 367 (RED → GREEN), MemberObjectAccessGateTest (RED 2 → GREEN); Spring 1158/0/0/0 at 1358b01848 (e307626a7e changes only a comment and the SQL/test); database package 106 passed + 5 skipped (PostgreSQL-tagged, CI only); sandbox: 367 applied (privileges false afterwards, registration functions still succeed as the application role, direct INSERT permission denied), re-apply idempotent.
- [x] Review: Codex REQUEST_CHANGES (legacy gateway reads the bid log; UI shows undisclosed bidder as "none") → bid-log revoke removed; UI ruling (no consumer is wired) accepted → APPROVE at e307626a7e.

## Area status at this checkpoint
| Area | Status | Evidence / reason |
|---|---|---|
| AR01 Architecture | HOLD | Target shape holds in source (Next presentation + same-origin BFF, Spring API, PostgreSQL functions). The legacy NestJS gateway still owns live read paths (e.g. sealed-auction logs, auction listing BFF) — retirement inventory incomplete; observed runtime topology not re-verified in this checkpoint. |
| AR02 PostgreSQL | PARTIAL / HOLD | Grant and function hygiene measured clean (above); 367 prepared. Fresh install + forward upgrade on a disposable database and the PostgreSQL-tagged suite run in CI only — not run here. |
| AR03 Finance and security | HOLD | Single canonical writer not executable by the API; idempotency template unchanged; fabricated-answer, media ACL and proxy-cache findings fixed in the candidate. HOLD: S04-CVP entitlement, Production still carries the media exposure until release (owner decision on purge), SEC1 rotations. |
| AR04 Capacity / resilience | HOLD | Earlier sandbox capacity evidence (#3462 era) is not for this SHA; not re-measured. |
| AR05 Artifact / supply chain | HOLD | Spring jar sha256 f1c0a738… with embedded sourceRevision 78c9399123 verified; no Next artifact digest, SBOM/vulnerability scan last at a984c9f240, restore drill not run. |
| AR06 Full-system integration | HOLD | QA04 synthetic browser smoke passed for alerts, chat media, board upload, admin API health; 180-route ledger, five locales and authenticated interaction sweep not re-run at this SHA. |

## Not done / next
- Merge this branch into the integration candidate; re-run Spring/database at the new head.
- AR05: SBOM + Trivy for the new jar and lockfile; Next build artifact digest. AR02: CI fresh-install/upgrade on the exact SHA. AR04/AR06: bounded re-measurement and route sweep when memory allows.
- No Test publication (G8) or Production change (G9).
