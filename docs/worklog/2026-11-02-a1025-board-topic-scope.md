# A 10:25 — Public board topic scope (2026-11-02)
**Status:** BEFORE WORK — implementation not yet started; no release authorized.
**Branch:** auto/hourly-a-20261102-1025-board-topic-scope
**Base origin/main:** a8541927c3a351d980454c66e95a3356c47e0722
**Design/plan:** /srv/moneyverse-data/tasks/mv-a-20261102-1025-board-topic-scope/design.md and /srv/moneyverse-data/tasks/mv-a-20261102-1025-board-topic-scope/plan.md (host evidence).
**Problem:** stock-linked discussions and general posts share the latest-50 public board; exact symbol search is insufficient for finding all stock discussions.
**Scope:** backend query and proof, web accessible filter, Android app API verification, real PostgreSQL read-only checks; no migration, no ledger or permission change.
**Guardrails:** protect B/C/Gemini branches and live services; no merge/deploy without all release gates.
**Before-work audit:** main fetched, AGENTS/README/English+Korean living plan/QA/worklogs and release policy reviewed. Host Debian 13.6 services active; disk 96% used (4.5 GiB free). Git remote heads 208, remote refs 209 incl main, non-merged refs 194; existing unique commits preserved. PR conflicts and CI to be updated at end.
**In progress:** RED tests reproduced backend 3 failures and frontend 4 failures. GREEN backend 23/23 and frontend 17/17 targeted PASS after implementation; both typechecks PASS. Existing public SQL function reused, no migration or new grants. Android requires appliedTopic proof even for empty results. API contract generation exposed expected drift; generated docs updated. Real dev PostgreSQL app-role READ ONLY transaction confirmed latest snapshot 1 (stock 0/general 1), ROLLBACK. Pre-existing P0 ACL excess remains; full gates pending.
**Finished:** pending.
