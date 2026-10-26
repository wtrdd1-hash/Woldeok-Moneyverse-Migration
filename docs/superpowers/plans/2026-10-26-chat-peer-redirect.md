# v1065 chat peer navigation plan
1. Reproduce successful conversation POST being swallowed by a caught Next.js redirect; write a failing Vitest regression for redirect semantics and malformed server receipt.
2. Test API failure and malformed peer: no redirect, accessible failure announcement, no unauthorized writes.
3. Implement smallest safe change in chat/page.tsx: validate peer and returned UUID, redirect outside the catch, retain existing conversation behavior.
4. Verify focused tests, lint/typecheck/build, broader frontend/backend/real isolated PostgreSQL/security/contract gates and exact-SHA CI. Re-fetch main and integrated plan at mid and before any merge.
5. Publish EN/KO checkpoints and Draft PR; merge/release only if all gates and exact-SHA Test pass; otherwise preserve all branches and block Production.
