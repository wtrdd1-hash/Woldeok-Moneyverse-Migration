# A 2026-10-29 23:23 KST — Chat media upload response privacy

## BEFORE WORK
- Baseline: origin/main 62c6cd038951d65c94b709302bdaec6e75b080b6; branch auto/hourly-a-chat-upload-privacy-20261029-2323, isolated worktree /srv/moneyverse-data/build-workspaces/mv-a-2323-chat-upload-privacy-20261029.
- MiniPC Debian 13.6, backend/frontend/Discord/Nginx/Docker active; DEV database reachable. Production/Test databases must not be written.
- Read AGENTS.md, README.md, bilingual project plan and integrated master, support privacy planning v1194, recent QA v1419, PR/CI and prior A reports.
- Source finding: authenticated chat upload returns the internal storageKey redundantly with its owner-gated URL; unknown storage failures surface raw exception text as HTTP 400. Web widget uses only URL. Existing migration 295 guards media reads via chat_media_visible.
- Scope: P1 privacy-safe response/error contract for web and Android; preserve existing media URL, authenticated ACL and orphan cleanup. No schema/ledger/migration changes.
- Existing open PRs and other agents' worktrees are protected. Full gates and official Test exact-SHA must pass before merge/release.

## IN PROGRESS
- [x] RED: backend 3 expected failures / 7 pass, Android gateway 1 expected failure / 38 pass; tests demonstrate raw key, scanner detail and filesystem error leakage.
- [ ] GREEN: remove redundant internal key from response and sanitize unknown storage errors.
- [ ] Verify backend, app-api contract, lint/typecheck/build, security, isolated PG as feasible.
- [ ] Recheck origin/main and integrated plans; record CI and release HOLD/PASS.

## FINISHED
- Pending.
