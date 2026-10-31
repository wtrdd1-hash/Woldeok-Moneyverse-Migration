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
