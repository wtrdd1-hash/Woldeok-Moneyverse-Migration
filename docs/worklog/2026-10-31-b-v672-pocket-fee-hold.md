# Backend B v672 — P0 Bank Pocket Customization Fee-Contract Containment

**Status: PARTIAL / BLOCKED / DRAFT / RELEASE HOLD.** This is a safety hold, not a functioning paid customization feature.

## Provenance and scope
- Start/mid `origin/main`: `bf8d0d48f810932b43783d8605dce53954c60cff`; QA v1402 FAILED/P0; latest open planning v1532 and A/C/QA/CI inspected.
- Isolated branch `auto/hourly-b-v672-pocket-fee-contract-hold-20261031-0235`, stacked on B v670 Draft #2069 (`06a1c9ed...`), since it changes the same paid operation. B v671 Draft #2072 is a separate SQL stack; neither resolves fee quote parity.
- P0 #2070: DEV SQL charges a fixed 100 WLD while frontend advertises 100/300/400 WLD. No verified DB-authoritative atomic quote+charge contract or clean-schema bank pocket parity. Do not guess a price.
- Only paid pocket customization is affected. No DB migration, ledger, balance, other pocket operation, auth/CSRF guard, or API success DTO change.

## Plan / execution
- [x] Read AGENTS, README, English/Korean main planning, latest QA, open PRs/branches, CI and #2070.
- [x] RED: five regression cases, 4 failed / 1 passed before implementation.
- [x] GREEN: `BankRepository.customizePocket` validates UUIDs then fails closed before ANY SQL; typed contract-hold error maps to HTTP 503 with generic message. No environment flag can bypass it. Existing UUID invalid input remains HTTP 400.
- [x] Update legacy SQL-overload expectation for hold; add real Nest HTTP 503 regression (guards mocked, not an authenticated Test E2E).
- [x] Focused bank tests: 17/17 PASS (includes 3 Nest HTTP tests).
- [x] Changed-file ESLint, typecheck, Backend build, Frontend build, 184 mobile API endpoints, contract 41, DB static 62 PASS/4 SKIP, security 14, production dependency audit zero known vulnerabilities.
- [x] Disposable PostgreSQL 17.11, network=none: init + all 311 migrations 002..312 applied, clean schema lacks legacy bank customization function; app role cannot UPDATE ledger_transactions; zero ledger transactions. Container removed.
- [x] Full lint FAIL: 1 pre-existing frontend parser error in shop purchases route.search.test.ts + 1043 warnings. Backend full 2665 PASS / 126 FAIL / 501 SKIP; Frontend full 2705 PASS / 55 FAIL. No claim of full gate success.
- [ ] Independent authenticated Test exact-SHA E2E, quote+charge SQL implementation, UI disable/quote handoff, remote CI, independent restore, release provenance #1984.

## Acceptance and rollback
- For valid caller UUID, PUT `/api/v1/banking/pockets/:id` now returns HTTP 503 and makes **zero** fee-bearing DB queries. Invalid UUID still 400; session, consent and CSRF guards remain on the route. Other pocket actions unchanged. Existing successful customization cannot occur until reviewed atomic quote/charge contract exists.
- This blocks a potentially misleading charge; it does NOT reconcile the existing 100/300/400 pricing, implement missing bank pocket functions, or prove Production behavior. Frontend still displays a price and needs a separate C UX hold.
- No main merge, official Test deployment, Production deployment, shared DB or WLD changes. Draft/HOLD only; do not bypass release gates.
