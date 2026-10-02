# 보안 긴급수정 작업 기록 — v2026.10.02.508

- 상태: 로컬 검증 완료 / 브랜치 검증 대기
- 시작: 2026-10-03 (Asia/Seoul)
- 브랜치: `security/p0-next-og-ci-v2026.10.02.508`
- 시작/중간 권위: `5a7c658b38853f564983d19f961c689a494dc4b6` (중간 fetch 시 origin/main 변경 없음)
- 계기: v2026.10.02.507 보안 감사에서 긴급 운영 프레임워크 노출과 CI 정책 게이트 파손을 확인했다.
- 범위: 프레임워크 패치, 의존성 수정, CI 보안 게이트 복구, CORS 강화, 기존 lint 차단 해소, exact-SHA Test 검증 후 무중단 운영 승격.
- 안전: 운영에는 exploit payload를 실행하지 않았다.

## 구현 기록
- Next.js와 Next lint 패키지를 16.3.4에서 16.3.8로 올렸다.
- root pnpm override에 Multer >=2.4.0, js-yaml >=5.4.1을 추가했다.
- 검토된 CORS 정책 모듈과 회귀 테스트를 반영했다.
- Node repository-security/control-byte scanner와 테스트를 추가하고 CI가 해당 scanner를 사용하도록 수정했다.
- control-byte scanner는 TDD로 진행하여 모듈이 없을 때 테스트 실패를 먼저 확인한 뒤 구현 후 통과시켰다.
- 복구된 runtime CI lane을 막을 기존 lint error 25건을 제거했다.

## 검증 기록
- Repository scanner: 4/4 테스트 통과, 실제 repository scan 통과.
- CORS 집중 회귀: 3/3 통과.
- Root lint: exit 0, error 0 / warning 456.
- Root typecheck: 통과.
- Root 전체 테스트: 통과.
  - contract 31/31
  - database 7/7
  - backend 1053 pass, DB-gated 391 skip
  - frontend 984/984
- Root production build: Next.js 16.3.8에서 통과.
- Production dependency audit moderate 기준: 알려진 취약점 0건.
- `git diff --check`: EOF 정리 후 통과.

## 남은 릴리스 게이트
- 브랜치를 push하고 exact-head Build Test Candidate 성공을 확보한다.
- 검증된 head만 PR로 main에 통합한다.
- Main exact-SHA 후보가 격리 Test identity/health/noindex 검사를 통과해야 한다.
- Test 근거 후에만 무중단 Production 승격을 수행한다.

## GitHub 브랜치 검증 복구
- exact-head 후보 `f92c75d87aa55d96b6d2755d8c976f88d48fe082`에서 교체한 secret scanner 성공을 확인한 뒤, public-repository sanitization에서 제거된 systemd/nginx shell helper를 policy job이 계속 참조하는 두 번째 기준선 결함이 드러났다.
- workflow 참조를 전수 확인하여 runtime lane에도 삭제된 `packages/database/ci-apply.sh`, `scripts/reject-prisma-migrate.sh` 참조가 남아 있음을 확인했다.
- 비-shell 대체 구현으로 fresh CI PostgreSQL migration용 `packages/database/ci-apply.mjs`, Prisma mutation guard용 `scripts/security/reject-prisma-migrate.mjs`와 각각의 Node 테스트를 추가했다.
- 현재 추적되는 nginx blue/green port switcher에는 Python 회귀 테스트가 있으므로 삭제된 shell 테스트 대신 해당 테스트를 CI에서 실행하도록 정리한다.
- TDD 근거: 신규 Node 테스트 2개는 구현 전 module-not-found로 실패했고 구현 후 합계 5/5 통과했다.
## 데이터베이스 보안 경계 복구
- GitHub DB 연동 runtime 검증에서 기존 241개 migration 적용은 전부 성공했으며, 이후 treasury migration 240-242가 만든 실제 권한 회귀 2건이 검출됐다.
- 신규 SECURITY DEFINER 국고 함수 6개가 PUBLIC execute 가능했고 moneyverse_app에 국고 증빙/거버넌스/부유세 테이블 direct INSERT/UPDATE 권한이 추가되어 있었다.
- 과거 migration을 수정하지 않고 immutable 후속 migration `243-treasury-security-boundary-repair.sql`을 추가했다.
- migration 243은 SECURITY DEFINER의 PUBLIC 실행권한을 다시 닫고 국고 지출/부유세 증빙 direct write를 제거하며 시민 예산 투표 write를 `treasury_cast_citizen_budget_vote` 전용 함수 뒤로 이동한다.
- wallet 및 관리자 treasury repository 모두 거버넌스 테이블 직접 write 대신 좁은 DB 함수를 호출하도록 변경했다.
- 수정 후 로컬 집중 검증: 변경 파일 lint 통과, root typecheck 통과, database 정적 suite 7/7, CI helper 테스트 5/5, repository/control-byte/Prisma scanner 통과, diff-check 통과.
