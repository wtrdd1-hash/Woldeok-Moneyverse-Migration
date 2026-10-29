# v2026.10.29.1502 — Owner-authorized SWF/central-bank Production promotion

## BEFORE — 2026-10-29 14:22 KST
- Owner authorized operational promotion of v1501 source candidate (PR #1845).
- Current main fetched as b84d645a8; candidate branch fix/central-bank-swf-controls-v1501-20261029 at 21258b869. Previous application-code commit a3a545772 passed CI run 40821830240 and local full TypeScript/Nest/Next builds, relevant backend 18/18 and frontend 7/7 focused tests.
- Reviewed DOCS_INDEX.md, integrated master, AGENTS.md, infrastructure and English/Korean release guides, v1501 incident worklog, v1213 rollout/rollback records. Documents take precedence over outdated Kubernetes references.
- Authoritative active services: Production v1213 on 3492/3493, Test main b44ffd0a on 3100/3101, both backend health 200. Candidate isolated Test services on 3552/3553, 3552 has NO DB/session; this is not official same-SHA authenticated Test acceptance.
- Test candidate currently fails closed for SWF manual liquidation by design; **promotion cannot be interpreted as restoring actual cash sale or autonomous growth**.
- Snapshot references: preserve existing production-current, test-current symlinks, nginx configuration and live session/ledger state; no DB write, schema migration or accidental shared Production/Test process disruption.
- All stages require current-main refetch and owner-approved existing three finance DML grants preserved, without treating other data-integrity risks as waived.

## IN PROGRESS
- [ ] Verify full candidate CI at current source and source diff against running v1213.
- [ ] Materialize Test backend + frontend using exact candidate source with actual Test DB/session, no duplicate schedulers.
- [ ] Verify read-only financial status, no mutations, negative authorization, actual API 503, session-continuity evidence and exact SHA identity.
- [ ] Integrate approved source into main without overwriting concurrent agents; build/verify exact integration SHA.
- [ ] Stage immutable replacement Production backend/frontend with existing Production secrets, no new migrations, parallel readiness and rollback generation.
- [ ] Atomic Nginx switch, public smoke, version identity, background services, finance reconciliation and session continuity. Roll back on critical error.
- [ ] English/Korean release/internal/GitHub update records and CI/deployment evidence, including any blocked gates.

## FINISHED
- Pending actual Test and Production evidence. Authorization alone is not deployment success.
