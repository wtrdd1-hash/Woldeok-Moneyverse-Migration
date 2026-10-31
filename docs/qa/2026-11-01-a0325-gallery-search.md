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
