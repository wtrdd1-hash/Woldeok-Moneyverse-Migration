# Backend B v719 — P0 real-estate source-truth and ledger fail-closed

**Base:** `f13bbce273ffc65e8576170992d82ea00c27a1c9` (origin/main checked before work). **Disposition:** DRAFT / RELEASE HOLD.

## Reproduced defect and boundary

`SpaceController` returned synthetic district occupancy, land ownership, member land/rent holdings, and successful land purchase, rent contract and **144,000 WLD rent payout** responses without durable ownership, authorization or balanced ledger settlement. No observed Production exploit is claimed. This is separate from the Next auction route blocked in C PR #2281 and from SQL-backed personal spaces.

## Changed API contract

- Authenticated `GET /api/v1/spaces/real-estate/districts`, `/lands`, `/my-lands`: HTTP **503** `{code: "REAL_ESTATE_SOURCE_UNVERIFIED", message}` rather than invented records.
- Authenticated `POST /api/v1/spaces/real-estate/purchase`, `/:id/rent`, `/:id/settle-rent`: HTTP **503** `{code: "REAL_ESTATE_LEDGER_UNAVAILABLE", message}` rather than invented WLD debits/credits, ownership, or rent receipts.
- Existing `SessionGuard`, `AuthenticatedGuard`, `ConsentGuard`, DTO bindings, and route paths remain; unauthenticated requests are still **401**, denied consent **403**. Personal-space owner reads, layouts, SQL-backed space purchase/tax hold and public city project reads remain unchanged.
- No new SQL, migration, DB grant, ledger posting, wallet write, or shared service mutation. Do not mistake these 503s for verified land functionality. Frontend must provide explicit unavailable state; coordinate with A/C and C #2281/#2291.

## TDD and local evidence

- RED: six of seven new controller tests failed because fake 200/201 responses were returned; GREEN: controller **7/7**, real Nest HTTP **7/7**, pre-existing space regression **19/19** PASS.
- Typecheck PASS, focused ESLint PASS, full ESLint PASS (0 errors, 1,021 existing warnings), mobile API contract **184** PASS, contract **41** PASS, database package **62 PASS / 4 SKIP**, security/release **34** PASS.
- Isolated PostgreSQL 17.11: **316** forward migrations applied; app direct account balance UPDATE, ledger DELETE and users SELECT all denied. Own container removed.
- Backend full test timed out at 145 seconds; retry aborted on cgroup thread creation `EAGAIN`. Frontend full **2,371 PASS / 497 FAIL** under resource pressure, not green. Overall build: backend build passed; frontend Next build failed at Node worker-thread creation. Production dependency audit 0 known; all dependency audit **9** (8 moderate, 1 low).
- Official Test exact candidate SHA, authenticated E2E, GitOps, independent restore, production DB ACL and financial settlement gates are NOT PASS. **No merge or Test/Production deployment** until all gates pass. This is a protective P0 code change, not feature completion.
