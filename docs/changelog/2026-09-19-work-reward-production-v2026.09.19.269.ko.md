# 작업 보상 Production 승격 — v2026.09.19.269

영문 문서가 기준입니다.

Runtime v2026.09.19.268을 병합된 main SHA `d145d85591d5a36816d7f116ce66db3c16555e7a` 기준으로 운영에 승격했습니다. 기존 v267 후보는 exact-head CI 실패로 차단했고 PR #543이 이를 대체했습니다.

## 검증 근거

- GitHub PR #543은 CI run #1406 (`35424883407`) 전체 성공 후 병합했습니다.
- 병합 전 fresh PostgreSQL 17.11에서 migration 210까지 적용, backend 1463/1463, frontend 652/652 테스트를 통과했습니다.
- 격리 Test에 migration 209·210을 적용했고 `/health` 성공 및 `/api/version`이 병합 SHA와 정확히 일치함을 확인했습니다.
- Test immutable release: `/srv/moneyverse-data/releases/test-d145d85591d5-v268`.
- Production DB migration 전 2026-09-19 14:55:49 KST에 암호화 DB/사진 백업 생성 및 검증을 완료했습니다.
- Production에는 migrator 권한으로 migration 209·210을 적용한 뒤 애플리케이션을 전환했습니다.
- Production immutable release: `/srv/moneyverse-data/releases/prod-d145d85591d5-v268`.
- 공개 Production `/health`, `/api/version`, `/frontend-version`을 통과했고 두 version endpoint 모두 정확한 runtime SHA를 반환했습니다.
- Nginx host-routing guard를 통과했으며 backend/frontend 서비스는 active이고 승격 직후 warning 이상 journal은 0건입니다.

## 롤백

이전 Test/Production release 디렉터리는 그대로 보존합니다. DB migration은 forward-only이므로 애플리케이션 release 포인터는 되돌릴 수 있지만 migration 209·210 또는 기존 정산 이력을 되쓰거나 삭제하지 않습니다.
