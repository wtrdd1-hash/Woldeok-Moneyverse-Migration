# Moneyverse 기획 v1470 — 개인정보 내보내기 무결성 보완 (2026-10-29)

**범위:** F675-173, 이전 추가 v1468 / 현재 보완 v1470 / 다음 추가 v1472(잠정). DRAFT / RELEASE HOLD. 런타임 코드·DB·금융·Test·Production 미변경.

## 시작 — 19:07~19:09 KST
- miniPC Debian 13.6 백엔드·프론트엔드·봇·nginx·Docker 활성, 개발 PostgreSQL 연결. 루트 디스크 77%, 데이터 74%. 원격 main 76d63a5840a4a185fcaeb02f8b1132dd145f19e4. 기존 main 작업 디렉터리에는 다른 개발자의 미커밋 코드가 있어 건드리지 않고 별도 작업 트리·브랜치를 생성했다.
- 설치된 Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion 확인. 스킬 커넥터는 URI 0건. GitHub 커넥터로 병합 PR #1877, 열린 이슈 #1876, P0 #1878, 개발 PR #1880/#1881 확인.
- 기준 문서 AGENTS.md, README.md, PROJECT_PLAN.md/.ko.md. privacy controller/repository/service, ReauthGuard, 계정 개인정보 UI, app-api 경로 소스를 직접 확인했다.
- QA v1370 FAILED/P0: 과거 브랜치 462개 누락, 마이그레이션 충돌, 금융 출처 미검증, 공식 Test 정확 SHA 미인증. 최신 main SQL은 303개, 중복 291×3/292×3/293×2/294×2/295×4(신규 소스 실측). 이전 QA의 300개와 시점을 구별한다.

## 중간 — 소스·기획 대조
- v1468 기획 병합 커밋 6930c76ac은 존재하지만 v270 통합 후 최신 main의 프로젝트·통합 기획서에서 F675-173 섹션이 누락되었다. 이전 깨끗한 기획 브랜치에서 v1468 섹션만 복원하고 v1470 개선을 추가하며 다른 main 변경은 보존했다. 별도 분산 기획 파일은 생성하지 않았다.
- ReauthGuard 900초와 내보내기 요구 600초 불일치 확인. 서버 인증 세션별 600초 재인증, 종류별 스냅샷 완전성·manifest, 파일 잘림 금지, 서버 저장 암호화와 내려받는 평문 ZIP 구분, 1회용 비재개 다운로드, 복원 후에도 적용되는 삭제 증빙을 명세했다.
- P0 REPO1470-01/SEC1470-02/FIN1470-03/REL1470-04, P1 EXPORT1470-05~10. 실제 PostgreSQL 합성 10,001건·경합·권한 시험은 제안만 했으며 미실행.

## 완료·배포 경계
- 영어 원본·한국어 동등 프로젝트 계획과 통합 마스터, 한영 작업일지 및 내부/GitHub 기록은 문서 전용이다. 커밋·PR 전 diff·양 언어 백로그 10개 일치와 main 변경을 재확인한다.
- 외부 독립 중복 제거·실제 승인 레퍼런스 신규 0건, 누적 UNKNOWN / 10,000건, BLOCKED / IN PROGRESS.
- PR DRAFT, 병합·SQL 번호 지정·DB 실행·Test/Production 배포 금지. 개발 담당자는 #1878 번호 충돌과 공식 Test 정확 SHA, 독립 복원, 개인정보 보안 시험을 해결해야 한다.
