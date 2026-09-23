# Business supply-chain idempotency v2026.09.23.411

- Require caller-owned UUID idempotency keys through service and PostgreSQL repository boundaries for business economic commands.
- Replace the unvalidated procurement request body with a validated DTO; quantity is constrained to 1..500.
- Remove repository-generated retry keys so transport retries cannot silently become distinct commands.
- Add procurement contract regression tests.

Validation: focused Vitest 5/5 PASS; backend TypeScript PASS; changed-file ESLint PASS; git diff --check PASS.
