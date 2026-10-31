# Owner pension Android gateway privacy plan (B v690)

## Source and design
`frontend/src/app/app-api/v1/[...path]/route.ts` currently enforces `private, no-store` and `noindex` for wallet, support and banking, but not pension. `appGatewayPath` accepts the pension group. A backend accidentally returning `Cache-Control: public` or `X-Robots-Tag: index, follow` could reach the member's Android gateway. This is a conditional privacy bug, not evidence of real-world disclosure. Do not change PostgreSQL grants or pension settlement logic (#2082/#1970).

## Tasks
1. Add `frontend/src/app/app-api/v1/[...path]/pension-private.test.ts` for 200, 401, 503, 204, HEAD and pre-upstream 426; assert private no-store, noindex, no-referrer, actor cookie and CSRF preservation, no public stock regression. Run test RED.
2. Add a final `parts[0] === 'pension'` response-header override in `handle` to cover upstream and early gateway responses. Run test GREEN.
3. Run frontend/full backend/contract/database/lint/typecheck/build/security/API-contract and optional isolated PG with controlled resource budget. Recheck origin/main and EN/KO plan; document failures honestly.
4. Push isolated branch, create Draft/HOLD PR; do not merge or deploy without exact-SHA official Test, real authenticated E2E, CI, DB and GitOps gates.
