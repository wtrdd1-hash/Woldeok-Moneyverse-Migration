# A 06:25 — Verified pinned public announcement discovery

## Before work — 2026-11-01 06:27 KST
- Isolated branch: `auto/hourly-a-20261101-0625-pinned-notices`, from `f13bbce273ffc65e8576170992d82ea00c27a1c9` (origin/main).
- Debian 13.6 miniPC and backend/frontend/nginx/docker active; development PostgreSQL connected. No shared-service mutations.
- Read AGENTS.md, README.md, English and Korean living plans, current QA v1430 and prior A worklogs. The latest planning v1588 is a **Draft** and does not authorize implementing F675-203.
- Start audit: 46 non-main remote branches (45 with commits outside main); 43 open Draft PRs; preserve all unmerged work. Main checkout's unrelated `implementation_plan.md` modification remains untouched.
- Existing A PRs #2243 (title search) and #2249 (gallery captions) are unmerged. This task is scoped to **pinned-only published announcements**, not title search, gallery, financial writes or any C/B work.
- Known baseline: main Backend 2,948 PASS / 2 FAIL (profile HTTP test internal-token fixture), Frontend 2,901 PASS; A repair PR #2265 exists. QA's CI-migrator repair is independently in progress.

## Scope and bounded design (user's autonomous P1 feature instruction)
- Provide a discoverable, keyboard-accessible pinned-only toggle for the latest 20 published announcements without opting the public ISR page out of static rendering.
- Extend both public Nest and Android app-content endpoints with a strict optional `pinned=true` filter, rejecting arrays/unknown values. Filter **after** the existing `content_list_published_announcements(20)` SQL read; never claim global history search.
- Harden Next's public `/api/content/announcements` gateway to forward the filter and reject missing/malformed/unfiltered upstream responses instead of fabricating an empty list.
- Reuse existing immutable PostgreSQL SECURITY DEFINER read; no new migration, table grants, ledger writes, auth changes, or production writes.
- TDD: backend filter/controller tests, frontend toggle/gateway tests; verify exact SHA locally and CI, real PostgreSQL read/permissions and official Test E2E if available. Do not merge or deploy without all gates.

## Work in progress
- [ ] RED backend and frontend focused tests
- [ ] GREEN implementation across public web, Nest, app-content, Next gateway
- [ ] Targeted and full tests, lint, typecheck, builds, contract, PostgreSQL, security/SEO/accessibility
- [ ] Midpoint and pre-merge latest main/plans check, PR and CI evidence

## Finished
- Pending. All releases HOLD until authoritative gates pass.

### Checkpoint — 2026-11-01 06:34 KST
- TDD RED: Backend 2/2 expected failures; frontend 4/5 expected failures before implementation.
- TDD GREEN: Backend 2/2 PASS; frontend 7/7 PASS, plus a real DOM click/toggle regression 3/3 PASS.
- Implemented public Nest + app-content query parsing, service post-SQL pinned filter, public ISR web toggle, verified Next public gateway and Android app-api response validation.
- `pnpm typecheck` PASS; `pnpm lint` PASS (0 errors, 1,022 pre-existing warnings); `pnpm api:contract:check` retry PASS (184 endpoints). Initial contract attempt hit transient `spawn sh EAGAIN` during concurrent QA load; no bypass or policy changes.
- Actual development PostgreSQL 17.11 read-only transaction: `content_list_published_announcements(integer)` SECURITY DEFINER, `search_path=pg_catalog, pg_temp`, EXECUTE granted to moneyverse_app; latest 20 published count=1, pinned=0; ROLLBACK. No shared DB writes, and no positive pinned SQL fixture claim.
- Midpoint `origin/main` still `f13bbce273ffc65e8576170992d82ea00c27a1c9`; English and Korean plans unchanged in this worktree. Latest planning Draft v1588 still unrelated.
- Full test/build/CI and official exact-SHA Test gates remain pending. Production HOLD.
