# Frontend v271 Production promotion — v2026.09.19.273

## English (canonical)

Frontend full-page rebuild baseline v2026.09.19.271 was promoted from merged main SHA `2cc746cb1474377458d591bc991eb745fe6eb39f` after exact-head validation, isolated Test verification, and a successful Production release gate.

## Evidence

- PR #549 merged to main as exact runtime SHA `2cc746cb1474377458d591bc991eb745fe6eb39f`.
- Branch exact-head Build Test Candidate run `35430452083` succeeded.
- Main Build Test Candidate run `35430740075` succeeded: release classification, policy, lint, typecheck, build, fresh database migrations, full tests, Prisma mutation guard, dependency audit, and immutable Test images.
- Public isolated Test was mirrored to immutable release `/srv/moneyverse-data/releases/test-2cc746cb1474-v271`.
- Test `/api/version` returned the exact main SHA; backend health, public catalog/database path, noindex boundary, and major UI routes passed.
- Build Production Release run `35431039813` succeeded after the exact-SHA Test gate and published the matching production-ready signal.
- A verified encrypted database/photo backup from 2026-09-19 14:55:49 KST was available before Production cutover.
- GitOps Auto Reconcile run `35431370208` successfully pinned and verified the exact SHA for Test and Production.
- Public Production host mirror was atomically repointed to `/srv/moneyverse-data/releases/prod-2cc746cb1474-v271`.
- Production `/api/version` and Test `/api/version` both return `2cc746cb1474377458d591bc991eb745fe6eb39f`.
- Production routes `/`, `/login`, `/stocks`, `/status`, `/work`, `/quests`, `/casino`, `/wallet`, `/shop/catalog`, `/progression`, `/terms`, `/privacy`, `/announcements`, `/robots.txt`, and `/sitemap.xml` returned HTTP 200.
- Backend and frontend systemd services are active; the new frontend cache is owned by the runtime user and no EACCES recurrence was observed after v271 startup.
- The previous v268 Test and Production release directories remain intact for application rollback.

## Scope note

This release promotes the v271 page-level rebuild baseline and reference/review contract. It does not claim that every route has finished its final hand-tuned visual redesign; route-by-route visual refinement remains follow-up work under the v271 plan.

## Rollback

Application rollback may atomically repoint Test/Production code to the preserved v268 immutable releases and restore their release identity files. No database history should be rewritten.
