# Content moderation evidence — v1086 implementation plan

## Scope and approval
Bounded P1 authorized by the scheduled user instruction: select and implement one verified missing/partial admin UX. Existing backend and database read contracts stay unchanged. No production mutation.

## Task 1 — API evidence boundary
- Add `frontend/src/app/admin/content/content-evidence.ts` with unknown-input parsers for pending photos, all photos, and announcements.
- Add `content-evidence.test.ts` first; run RED before implementation, GREEN after. Validate IDs, state, dates, duplicates and essential fields without casting untrusted values.

## Task 2 — Truthful admin view
- Add `page.test.tsx` first to reproduce API failures being shown as empty. Run RED.
- Update `page.tsx` to pass unknown API data through parsers, isolate three unavailable sections, provide accessible retry link and distinguish genuine zero. Preserve unaffected sections and admin authorization; correct truncated-list wording. Run GREEN.

## Task 3 — Verification and release hold
- Run focused tests, complete frontend suite, lint, typecheck, backend build, contract and PostgreSQL CI, security audits, candidate build; re-fetch main/planning mid-run and pre-merge.
- Create Draft PR and write EN canonical + KO supplemental logs, exact SHA, CI/QA/official Test evidence. Do not merge or deploy without every required gate PASS.
