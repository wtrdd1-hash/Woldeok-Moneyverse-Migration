# Planning v1402 — F675-156 NPC Order Integrity

Status: PARTIAL / DRAFT / RELEASE HOLD; documentation only.

Cycle: previous Feature Addition v1400; current Feature Improvement v1402; next Feature Addition v1404 provisional.
Latest main at start/mid: f396d009f41f421ca38f93ef2e7f8d26960dcae2; predecessor planning Draft #1651 b79a9742b01e8e16e0243cae2f029e6a5a1fa1d8.
Read: main AGENTS.md, README.md, canonical PROJECT_PLAN.md and KO parity, migration 081/082, engagement controller/repository and real PG regression test, /quests UI, QA v1336.
Verified: UUID-only replay binding and no NPC active row lock; old test allows borrowed-key affinity=NULL. No confirmed incident.
Updated 10 existing bilingual master/plan/review/log files plus this worklog. No new standalone planning spec.
Backlog: ENV1402-01 SEC1402-02 REL1402-03 NPC1402-04 (P0 #1656) NPC1402-05 NPC1402-06 NPC1402-07 NPC1402-08 NPC1402-09 NPC1402-10.
QA v1336 prior-main FAILED; #1646 since merged; current main exact-head QA UNKNOWN. Official Test/restore/release HOLD.
External newly accepted 0; cumulative approved deduplicated UNKNOWN/10,000 BLOCKED/IN PROGRESS. Synthetic 10,001/100/100 specified, NOT RUN.
No runtime, DB, WLD, ledger, feature switch, Test or Production change.

- **Final main/runtime recheck (09:10 KST):** main advanced to b323647636a3f594c67ca7c95b039d86882530b4; only new root-cause analysis and implementation_plan.md changed since f396d009, not NPC/quest/migration or canonical plan files. Independently read Nginx and systemd: production default server proxies backend 127.0.0.1:3343 to active v1083 release, frontend 127.0.0.1:3388 to active repair-v1401 candidate, while moneyverse-backend/frontend units point to different prod-v2026.10.22.toss-redesign directories. This is verified runtime routing/identity drift, not proof that the newer release is serving users. P0 ENV1402-01 / REL1402-03 must require live Nginx upstream → process PID → systemd WorkingDirectory → immutable release manifest → exact SHA attestation and rollback rehearsal before any Production claim. No service or proxy change made.
