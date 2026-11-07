# A0325 Gallery Search QA — Evidence and Blockers

- Base main: `f13bbce273ffc65e8576170992d82ea00c27a1c9` (unchanged at start/mid).
- Feature: read-only search over the **24 newest** already published gallery photos; no full-archive claim.
- RED: backend 3 failures on missing feature; frontend proof missing and Android gateway failed to reject invalid/unverified data.
- GREEN targeted: backend 3/3; frontend proof/gateway 4/4; SSR page 2/2.
- DEV PostgreSQL 17.11: `moneyverse_app` EXECUTE published-photo function=true, direct SELECT photos=false, read-only count=2, no writes.
- Typecheck: first failed on UI type alias; fixed, second PASS. Lint: 0 errors / 1022 warnings on first run.
- Build: first 1024 MiB heap OOM; isolated 2048 MiB one-worker retry in progress.
- Full tests: first attempt failed API contract drift; generated contract artifacts need commit then full rerun.
- P0 existing release: Production executable identity, least privilege across other tables, independent restore and official exact-SHA authenticated Test E2E remain unverified. Release HOLD.

## Exact candidate b5c6506665909cd81ce7aea41fbaeaf8ab376baa
- `pnpm test` exit 0 at 03:35 KST: root/security 41 PASS; database 62 PASS / 4 SKIP; backend 2,953 PASS / 517 SKIP; frontend 2,908 PASS. Skipped DB-backed tests are not represented as passing integration tests.
- Android generated contract 184 endpoints, exact-candidate `pnpm api:contract:check` exit 0.
- Production dependency audit `pnpm audit --prod --audit-level high`: exit 0, no known vulnerabilities; one Node URL API deprecation warning.
- Public Test `/frontend-version` and `/api/version` both `bc8cd8a6c654af0336f550643f23049a58ee1d16`, NOT candidate. Production frontend reports timestamp `1793450413898` while backend reports `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`. Exact running frontend SHA cannot be proven; P0 release hold.
- GitHub Draft PR #2249, candidate CI run #41229826782 and image build #41229822414; both pending at 03:35 KST.
- Branch audit at 03:33 KST: 30 remote refs including main, 29 non-main, 28 ahead/unmerged, 1 ancestor-only retained. Open PRs 27, conflicts 0; PR #2245 has failed runtime-check (independent CI bot release rate-limit issue tracked by QA PR #2248). Zero deletions.
- Main SHA unchanged at start, mid and 03:35 KST. Latest unmerged planning Draft #2247 v1582 inspected, unrelated owner saved-expiry views; no overlap with this public gallery read.
- Exact code SHA `b5c6506665909cd81ce7aea41fbaeaf8ab376baa`: `pnpm build` exit 0 at 03:36 KST with `MONEYVERSE_NEXT_BUILD_CPUS=1`, `NODE_OPTIONS=--max-old-space-size=2048`; 603 Next static pages generated. `pnpm typecheck` exit 0 after build. The initial 1024 MiB heap failure was an execution resource limit, not an accepted build gate.

## Final local gates (03:36:55 KST)
- Exact code SHA `b5c6506665909cd81ce7aea41fbaeaf8ab376baa`: `FULL_TEST=0`, `BUILD=0`, `TYPECHECK=0`, `LINT=0`, `CONTRACT=0` (process exit codes). Lint: 0 errors / 1,022 pre-existing warnings. Android contract: 184 endpoints.
- GitHub CI #41229826782 and candidate image build #41229822414 remained IN_PROGRESS at 03:37 KST; not accepted as PASS. Candidate is Draft/HOLD.
- Main re-fetched immediately before reporting: unchanged `f13bbce273ffc65e8576170992d82ea00c27a1c9`; latest planning v1582 Draft still unmerged. No merge, no Test or Production release, no rollback, no branch deletion.
