# Planning v1208 — Verified Member Board Reading List

- Cycle: Previous Feature Improvement v1206; Current Feature Addition v1208; Next Feature Improvement v1210 (provisional).
- Scope: F675-109 documentation-only new feature, stacked on unmerged v1206 Draft #1082. No A/B/C/QA/Gemini runtime or branch modifications.
- Authority: latest main AGENTS.md, README.md, English PROJECT_PLAN.md and Korean comparison; main SHA 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede.
- [x] START 2026-10-24 08:08 KST — miniPC Debian 13.6, all core services active, PostgreSQL connected. Installed Superpowers read; plugin skill list empty. QA v1211 FAILED/HOLD.
- [x] Source exploration — public board detail/controller/service, migration 044 UUID/deleted_at and public visibility; blog static data is not a Nest-authoritative source; Android gateway contract requires engineering. No unverified claims of implemented reading list.
- [x] MID 2026-10-24 08:11 KST — remote main and canonical EN/KO SHA256 rechecked; isolated worktree created from v1206. Public board only; explicit TOP/COMMENTS marker, no passive tracking.
- [x] Detailed P0/P1, member/admin/Android/API/DB/atomicity/security/SEO/WCAG/KPI/100-way tests/rollback specified in existing six EN/KO documents. No separate feature-spec files created.
- [ ] FINAL verification and GitHub Draft PR/issue references to be recorded after commit and push.

Blockers: QA v1211 main lint/frontend failures, pnpm audit Critical4/High10 and bot Critical1/High4, Production/dev shared DB and 5433, app DML 235/241 and PUBLIC bank EXECUTE 3, migration266 checksum drift, authenticated official exact-SHA Test and isolated backup restore. C #1081/#1085, A #1083, B #1084, QA #1076 remain independent. Evidence: OWASP/PostgreSQL/W3C 3 publisher families reviewed, newly accepted 0, cumulative verified UNKNOWN / 10,000 BLOCKED.
