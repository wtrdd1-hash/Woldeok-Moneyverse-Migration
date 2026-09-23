# Development B — Photo approval replay safety — v2026.09.23.397

## English canonical

- Base: `21088a07d7846b8dfb827b603ab7f1635b8520e7`.
- P1 finding: `POST /admin/photos/:id/approval` generated its idempotency UUID on the server. An ambiguous timeout followed by a retry therefore became a different publication command.
- Fix: require a caller-owned UUID in `PhotoApprovalDto`, pass it unchanged into the existing PostgreSQL-backed publication command, and have the existing admin frontend send the key.
- Existing step-up boundary remains `ReauthGuard`; session, CSRF, consent, admin-session, database privileges, migrations, and ledger semantics are unchanged.
- Merge and Production promotion remain blocked until required CI and exact-SHA gates are green.

## Korean secondary

- P1 문제: 사진 승인 API가 서버에서 멱등성 UUID를 새로 생성해 타임아웃 후 재시도가 별도 공개 명령이 될 수 있었습니다.
- 수정: `PhotoApprovalDto`에서 호출자 소유 UUID를 필수화하고 기존 PostgreSQL 공개 명령에 그대로 전달하며 관리자 프론트도 키를 전송합니다.
- 기존 `ReauthGuard` step-up 경계와 세션/CSRF/동의/관리자 세션, DB 권한, migration, ledger 의미는 변경하지 않았습니다.
- required CI와 exact-SHA gate가 green이 되기 전에는 병합/Production 승격하지 않습니다.
