# v2026.09.17.184 — Adaptive profession assignment limits

- Added a bounded per-profession automatic adjustment layer for the server-authoritative work-task daily limits.
- Added captured task reference baselines and eight allowlisted `jobs.assignment_daily_limit_delta.<profession>` policy knobs (`-1..+2`, one step per policy cycle).
- Profession shortages may loosen limits; sustained overconcentration can tighten them only after repeat-reward soft control is already active. Recovery automatically returns policy deltas toward baseline.
- Daily-limit proposals are treated as high-risk by the dual economy AI council and require full rebuttal before deterministic application.
- Reconciled English/Korean planning documents with the actual finite runtime quota contract instead of claiming unlimited semantics are already deployed.
- Pre-release QA: fresh PostgreSQL migration chain 002→204 succeeded; targeted AI/economy/work regression tests passed 42/42 across five files; repository lint completed with 0 errors and 11 pre-existing image warnings; full workspace typecheck and production build passed; `git diff --check` passed.
