# Planning v1366 — Verified Support Hours Integrity (2026-10-27)
**Status:** IN PROGRESS / DRAFT / RELEASE HOLD. **Previous:** Feature Addition v1364. **Current:** Feature Improvement v1366. **Next:** Feature Addition v1368 (provisional). **Predecessor:** Draft PR #1549, unmerged; **Issue:** #1548.

## Checklist
- [x] Start: miniPC service status, root/data capacity, current main and open PRs checked; using-superpowers and relevant local skills read; skills connector returned no URI.
- [x] Inspect canonical main AGENTS.md, README.md, English PROJECT_PLAN.md and Korean counterpart; inspect v1364 stacked spec and actual support controller/page/actions.
- [x] Mid-run main/canonical plan recheck and precise P0/P1 risk/design refinement.
- [x] Update existing EN/KO integrated planning, feature review, canonical plan, update logs without adding distributed planning specs.
- [ ] Verify 10 backlog IDs in EN/KO, docs-only diff, fresh main, GitHub issue, PR, commit and remote SHA; record final blockers.

## Initial evidence
At start 2026-10-27 17:05 KST Debian 13 miniPC reports frontend/backend/bot/MCP/Nginx/Docker active and development PostgreSQL connected; root 79% (21GiB free), data 72% (55GiB free). `/srv/moneyverse` symlink points to prod-v600 (target existence not yet proven). `origin/main=c2a9306ddc0424438bc0ab297ea9543bb167aee6`. QA v1318 is scheduler-only, not full release acceptance. F675-148 remains a proposal, not verified staff schedule or SLA. External 10,000 independently verified sources gate remains BLOCKED: newly approved 0, cumulative UNKNOWN. No runtime/DB/financial/Test/Production changes authorized.

## Midpoint (17:08 KST)
Main remained `c2a9306ddc0424438bc0ab297ea9543bb167aee6` (canonical EN/KO plan blobs rechecked). v1364 Draft PR #1549 is still OPEN and stacked on #1541. QA v1318 internal closeout confirms 24 public HTTP successes, 2 login-only routes untested and `FULL_FUNCTIONAL_QA=NOT_VERIFIED`; this does not certify support-hours behavior. Main app gateway supports the `support` group but not a new published-hours endpoint. `/srv/moneyverse` symlink target remains missing. This iteration hardens the proposal, not an implemented feature.

## Design integration
Updated existing EN/KO integrated master, feature review, canonical project plan, and EN/KO update logs (8 existing documents). All 10 P0/P1 IDs mirrored across EN/KO. Primary corrections: caller-controlled `?at` cannot claim OPEN_NOW, sourceId alone is not attestation, slot-index uniqueness cannot prevent overlaps, generation fencing prevents stale publisher/withdraw worker, public SWR forbidden, date exceptions replace full local day. No new scattered planning file.
External references used for design review only: RFC 9111 caching (https://www.rfc-editor.org/rfc/rfc9111.html), PostgreSQL range/exclusion (https://www.postgresql.org/docs/current/rangetypes.html), W3C WCAG 2.2 (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Newly approved independent references **0**; cumulative deduplicated/classified **UNKNOWN/10,000**. These three design-reference candidates are not counted as approved evidence.
