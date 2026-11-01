# Planning v1620 — F675-211 Member Expiry-Digest Weekday Preferences

**2026-11-01 KST | Feature Addition | DRAFT / RELEASE HOLD | Documentation only**

**Cycle:** Previous Feature Improvement v1618 → Current Feature Addition v1620 → Next Feature Improvement v1622 (provisional).

**Before work (22:08–22:14 KST):** miniPC Debian 13.6 backend/frontend/Discord/MCP/nginx/docker active, DEV DB connected; main `3d5e321c3d1221febff677469fecdfcb3cf42e7d` checked. Read main AGENTS.md, README.md, canonical English/Korean plan, installed Superpowers skills, actual notification page, Nest controller, Android app-api, 071/114/123 database references, open planning/QA/developer PRs. Stacked on unmerged planning Draft #2375 (`54a8f2e7a35e4a0a8d7d0546f0c39c7fe295c804`), isolated worktree. No runtime change.

**In progress:** [x] Define F675-211 exact user/API/DB/worker/privacy/QA/release contract. [x] Synchronize EN/KO canonical and integrated master. [x] Update EN/KO update logs. [x] GitHub P0/P1 issue and draft PR. [x] Midpoint main recheck. [ ] Verification.

**Finished:** Pending evidence.

**In progress (22:17–22:24 KST):** Drafted F675-211 canonical EN/Korean and integrated master/updates. Main rechecked unchanged at 3d5e321c3d1221febff677469fecdfcb3cf42e7d; Test e39af10f6... and Production 353c6d5d... do not match. Existing stacked planning branch does not contain current main ancestry; preserve isolated Draft stack, do not merge main into it without upstream coordination. GitHub development handoff #2383 created. No runtime/schema/financial mutation.
 External independent references newly verified 0; cumulative approved UNKNOWN/10,000, gate BLOCKED/IN PROGRESS. No Test/Production writes authorized.

**Midpoint verification:** node --test scripts/release/*.test.mjs 147/147 PASS; classifier 24/24 PASS. Initial bilingual marker audit identified a missing `weekdayIsoDays` mention in integrated masters; corrected before final audit. Draft PR/remote CI pending. RELEASE HOLD.
