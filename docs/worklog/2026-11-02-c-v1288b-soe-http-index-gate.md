# C v1288b — Public SOE disclosure real HTTP indexing gate

## START — 2026-11-02 08:03 KST
- Base origin/main `a8541927c3a351d980454c66e95a3356c47e0722`. Independent branch/worktree. MiniPC seven services active; read AGENTS, README, EN/KO plans, QA, A/B, CI and all open PRs.
- Separate feature from open C v1250 Draft #2274: its page-level `robots: noindex` does not override `frontend/next.config.ts` public `X-Robots-Tag: index, follow`. Independent Next.js HTTP measurement of `/enterprises` proved indexable HTTP header despite HTML `noindex` meta. This is a real SEO policy contradiction, not a claim of search indexing.
- Scope: set explicit route-scoped HTTP noindex for `/enterprises` and supported locale-prefixed paths; preserve other public SEO and Test-wide indexing switch. No DB/API/auth/WLD writes.
- TDD RED → GREEN, exact-SHA build/lint/typecheck/tests/real HTTP, CI; release HOLD if any gate missing.

## MID — pending

## END — pending

## MID — 2026-11-02 08:03 KST
- RED: `security-headers.test.ts` 1 FAIL/9 PASS; no route-scoped noindex for public SOE, confirmed HTTP `X-Robots-Tag: index, follow` even though HTML carried noindex metadata.
- GREEN: add route-scoped `X-Robots-Tag: noindex, nofollow` for `/enterprises` and localized prefixes, without modifying global SEO policy or other workers' routes. Focused 10/10 PASS. Origin/main fetched again unchanged.
- This is a distinct edge HTTP contract from Draft #2274, which edits the page, backend, Android and DB but not `frontend/next.config.ts`.
