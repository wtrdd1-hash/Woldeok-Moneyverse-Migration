# v2026.10.14.633 — 운영·로컬·GitHub·DB 전체 재분석 작업 기록

[영문 정본](2026-10-14-full-system-reaudit-v633.md) | 상태: AUDIT / BLOCKED / 문서 전용

## 작업 전 기록
- 요청: 현재 사이트, 미니PC 로컬, 웹·Android GitHub 재분석. 먼저 `AGENTS.md`, 문서 표준·카탈로그, `PROJECT_PLAN` 및 `INTEGRATED_PLANNING_MASTER` EN/KO, 관련 v603/v624/v628 보고서 읽기.
- 기존 로컬 웹 `main=f22e29e1`, 최초 GitHub `origin/main=b2e5e67517e628bc593aa80a13da950a741c15fb`.
- 전용 격리 공간 `/srv/moneyverse-tasks/site-local-github-reaudit-20261014/main-checkout` 생성. 다른 에이전트 worktree·로컬 메인 미수정.

## 진행 중 기록
- `$pc`로 호스트/프로세스/운영·Test 릴리스/HTTP/DB ACL/마이그레이션을 **읽기 전용** 확인.
- 운영 `prod-v600`, Test `test-v618-7fa3f245bbc3`; 운영 백엔드 DB는 `moneyverse_app`으로 `woldeok_moneyverse_dev` 연결 확인.
- DB 테이블 241개 중 앱 계정 DML 237개, PUBLIC 실행 가능 SECURITY DEFINER 11/485개 확인. 비밀번호·토큰을 공개하거나 DB를 수정하지 않음.
- 운영 파일과 main의 국고 지급, 관리자 그랜트, DAO, 관리자 백업, SEO 감사, 관리자 SEO 소스 해시 일치 확인. 취약 코드와 실제 사고 증거를 분리.
- **중간 main 드리프트 감지:** 최초 b2e5e675 → 신규 `28bd1e85e6c85094c00197f65bfd18fd2f44f7a5`(v224). 원격 fetch 후 격리 작업공간만 최신화.
- 동시진행 PR #829~#834 확인. #833은 runtime-check 2개 실패; #834는 #833 기반으로 아직 main/운영에 없음.
- Android 기존 로컬 .git/HEAD 미존재로 격리된 새 GitHub 클론에서 별도 조사.

## 테스트 / 미실행
- Node 공식 필수 체크·백업증빙·QA 원장 테스트 **12 통과, 0 실패**(초기 main 기반).
- 최신 v224 모바일 텍스트 기반 sentinel **18/21 통과, 3개 실패**. 실제 화면 측정이 아님.
- 봇 광고 QA JS 파일은 `node --check` **7행 구문 오류**.
- 전체 설치 기반 타입/빌드/테스트, 로그인 UI 5회, 관리자 34개 실제 화면, Android Gradle, DB 음성시험, 운영 원장 거래, 승격 **미실행**.

## 종료 및 산출물
- 영/한 전체 재분석 `docs/findings/MONEYVERSE_FULL_SYSTEM_REAUDIT_v2026.10.14.633.{md,ko.md}`.
- 영/한 GitHub용·내부용 업데이트와 본 작업기록 생성.
- v530 통합기획 권위 유지. 코드·DB·기능·테스트·운영 배포 변경 없음. 최신 main 재검토, 문서 링크·검증 후 PR 기록.
