# Worklog — Banking + Migration Parity v2026.09.13.18

## English primary
- Selected runtime feature: Banking Safety Overview.
- User benefit: explicit game-only finance boundary plus repayment-oriented guidance.
- Baseline: `main` `a785869ebeb8f9e3a9b5dc017cad3498685df59a`.
- Rechecked open PRs before development and before PR preparation; no newer `/bank` overlap was found.
- Previous Banking candidates #217 and #219 exposed the same repository-level migration parity blocker after secret scan, lint, typecheck, build, and migration application.
- Root cause: two new files claimed migration number `163`, leaving `179` absent.
- Safety evidence: `packages/database/production-checksums.json` is authoritative and ends at `046`; therefore neither duplicate `163` file is in the represented production-applied baseline. Git history dates account-merge `163` to 2026-09-06 and local-email `163` to 2026-09-12.
- Repair: preserve `163-merge-forked-member-accounts.sql`; move the later local-email SQL unchanged to `179-local-email-auth.sql`; delete only the duplicate old local-email path.
- Runtime file: `frontend/src/app/bank/page.tsx`.
- DB scope: migration path/number repair only; SQL body unchanged; no production-baseline migration altered.
- Backend/API/ledger: unchanged.
- Test evidence: pending exact-head CI, then exact-SHA Test image and runtime verification.
- Production evidence: none; Production unchanged.
- Infrastructure: `kuber-infrastructure` main `18eed320d3ae1eb2f29b32c11a0a9db8ffcebaf3`; isolated Test still points to older app candidate `cf73d089883f7d98d21b7b25b7d4083d9e37c02f`; infra PR #22 remains active pending backup/restore proof.
- Cleanup safe candidates confirmed: `integrate/hourly-banking-v2026.09.12.20` has zero unique commits and is far behind main; transient Banking v16 is an ancestor of v17; old infra promote branches checked are behind main with zero unique commits. Actual remote deletion remains blocked because no ref-delete action or connected authorized remote session is available.
- Remaining gates: full CI including migration parity, immutable candidate images, exact-SHA `wdmv-test`, authenticated `/bank`, DB/API/log/rollback checks.

## 한국어 내부 메모
- Banking 안전 UI와 main의 migration parity blocker를 함께 수정하는 후보.
- 운영 checksum baseline은 046까지이며 신규 중복 163 두 개는 baseline 밖임을 확인.
- 먼저 생긴 account-merge 163은 유지하고, 9월 12일에 나중 추가된 local-email migration만 SQL 내용 그대로 179로 이동.
- 전체 CI와 Test exact-SHA 검증 전에는 main/Production 승격 금지.
