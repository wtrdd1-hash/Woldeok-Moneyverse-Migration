# Planning v1604 — Member expiry digest lookahead preference (EN)

**State: BEFORE WORK / IN PROGRESS — 2026-11-01 14:05 KST**

- Previous cycle: Feature Improvement v1602. Current: Feature Addition v1604. Next: Feature Improvement v1606 (provisional).
- Baseline main: `143190d3811a1a419bfdfb2bab968e34fee447df`; previous unmerged planning Draft #2315; no runtime deployment.
- Source checks: AGENTS.md, README.md, canonical PROJECT_PLAN.md, KO counterpart, notification settings page, Nest notification guards, shop holdings schema, app-api gateway, QA Draft #2326 and open P0/P1 issues.
- Proposed F675-207: optional owner-controlled expiry-digest lookahead of 24h or 72h; default 72h; never implicitly opt in; align F675-205 scheduled worker and F675-206 preview.
- Checklist: [x] read source and skills; [x] inspect remote main/PR/QA; [ ] update integrated EN/KO plans and logs; [ ] recheck main; [ ] run docs validation; [ ] commit/push Draft PR and handoff; [ ] finish audit.
- Independent reference gate: newly verified 0; cumulative UNKNOWN / 10,000; BLOCKED / IN PROGRESS.

## Mid-run checkpoint / 중간 점검
- Main advanced to `95877554097b595d8dcfa28b60ecb65e50bf0c2d` (Treasury v1607); isolated branch rebased to preserve latest main Treasury and QA dual-disk files.
- GitHub developer handoff issue: #2327. Four P0 + six P1, all DRAFT/HOLD.
- Fresh docs parity: four EN/KO pairs PASS; release policy 140/140 PASS; focused classifier/hold 26/26 PASS; git diff --check PASS. These are **not** functional acceptance tests.
