# 개발 A — Migration 280 중복 충돌 복구 (2026-10-27 18:25 KST)

상태: **P0 복구 후보 / Draft / 운영 배포 보류**. 신규 사용자 기능의 배포 완료가 아니다.

## 원인 및 변경
- 시작·중간·커밋 직전 main `5373c6ae7a0987ebe31cb4cca59823e624eb62d9` 확인. 저장소 규칙, README, 영문 원본·국문 보조 기획서, 통합기획 v1368 초안, 이전 QA 및 PR 점검.
- main CI `40480263846`의 실제 DB 마이그레이션 연속성 테스트 실패: `280-qualification`과 `280-verified-help-center` 번호 중복, 다음 번호 `281-season`.
- 운영 연결 DB 및 접근 가능한 공식 Test PostgreSQL DB를 SELECT 전용으로 확인한 결과 280 이상 적용 기록이 없었다. 운영 연결 DB의 마지막 기록은 268이다. 적용된 마이그레이션은 변경하지 않았다.
- 시작 시 원격 354개 브랜치(비-main 353), 열린 PR 345개(Draft 330), 고유 분기 348개, main 포함 4개, 객체 미확보 1개, 실패 체크 PR 205개. 삭제 0건.
- 최신 main 기반 독립 `auto/hourly-a-migration-parity-repair-20261027-1825` 브랜치에서 **미적용 도움말 마이그레이션만 280 → 282**로 변경했다. SQL 동작은 그대로이며 파일명·첫 주석만 변경. 격리 PG fixture 4개 및 계약 테스트 경로 변경, 280/281/282 중복 방지 회귀테스트 추가.

## 테스트와 릴리스 판단
- RED: DB 테스트가 280 중복으로 실패. GREEN: DB 21 PASS/3 SKIP. 격리 PostgreSQL 17.11에서 부트스트랩·마이그레이션·관리자·권한 긍정/부정 fixture PASS 후 컨테이너 삭제. 운영 DB 쓰기 없음.
- 전체 테스트: API 계약 38 PASS, DB 21 PASS/3 SKIP, Backend 1,544 PASS/412 SKIP, Frontend 1,485 PASS. Typecheck, Lint(오류 0/기존 경고 1,122), Backend/Next Webpack 빌드, Bot, 보안 저장소 검사 PASS.
- 전체 의존성 보안 감사 **FAIL**(Critical 2/High 8), Bot npm 감사 **FAIL**(Critical 1/High 5). 운영 의존성 한정 감사 PASS는 전체 감사 실패를 대체하지 않는다. 구형 경로의 검사 3건은 최초 exit 127 후 올바른 스크립트로 재실행 PASS했고 양쪽 로그를 보존했다.
- 공식 Test 공개 SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`: 후보와 다름. 정확 SHA 인증 E2E, 독립 백업 복원, 브라우저 접근성/SEO, GitOps 미인증.
- 기존 #1559 등 Draft 도움말 PR은 마이그레이션 280을 다시 도입할 수 있어 **재기반 및 충돌 조정 전 병합 금지**. Draft/HOLD 유지, main 병합·운영 DB 변경·기능 활성화·배포·롤백·브랜치 삭제 0건. 미적용 상태에서는 후보 커밋을 되돌릴 수 있지만, 향후 282가 적용되면 파일과 체크섬을 불변으로 유지하고 후속 마이그레이션으로만 정정한다.
