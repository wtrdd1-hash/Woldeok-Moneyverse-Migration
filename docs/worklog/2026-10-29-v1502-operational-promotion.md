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

## RESUMED — 2026-10-29 14:54 KST
- User reiterated the Production promotion instruction. Refetched main: changed from b84d645a8 to a6284ef43810a7b310dc23565876fd02567fa918 by PR #1849 (AI market-news-repeat guard v1452). Its application changes are independent from SWF/central-bank source. Integrated both versions on isolated existing fix branch, manually retaining BOTH English/Korean integrated planning sections. Reconciled merge source SHA c2129625aa6629c616fb31ce790950618b8d92b2, pushed GitHub without overwriting any main checkout.
- Prior immutable Test package at aca0ba00e and Next exact-sha build succeeded, but represents superseded source and is **not** promotion evidence for c2129625a. New integrated workspace typecheck, Nest/Next builds, five relevant central-bank/mint/SWF suites, merged v1452 AI-news test suites and Next regression suites are running via mv-task mv-v1502-integrated-c212.
- Existing Test/Production backends still health 200. Candidate c212 full Test/Prod remain NOT deployed. Concurrent Next build and limited miniPC memory are slowing typecheck; no other worker processes are stopped. Exact-SHA CI #40826166798 running, checks pending. Preserve unrelated v1452 features when reconciling main.

## FINISHED
- Pending actual Test and Production evidence. Authorization alone is not deployment success.
