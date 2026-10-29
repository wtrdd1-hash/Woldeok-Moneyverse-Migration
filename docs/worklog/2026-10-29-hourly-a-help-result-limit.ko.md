# 개발 A 13:27 — 검증된 도움말 검색 표시 개수 선택

## 작업 전
- 최신 main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`에서 신규 격리 브랜치와 worktree 생성.
- 미니PC Debian 13.6, 서비스·개발 DB 정상. AGENTS, README, 영문/국문 PROJECT_PLAN, 통합기획, QA v1365, PR/CI/브랜치 검토.
- 기존 DB SECURITY DEFINER 함수와 Backend는 최대 50건 검색을 지원하지만 웹은 20건으로 고정된 부분 구현을 확인. 기존 승인된 도움말만 조회하며 기능 스위치는 계속 OFF.

## 작업 중
- TDD RED: 웹 선택값 전달·변조값 차단 10건 실패, 접근성 선택 UI 1건 실패. 구현 후 Frontend 29건, Backend 6건, DB 계약 5건 PASS.
- Android app-api에서 도움말 응답이 상위 서버의 잘못된 public 캐시 정책을 그대로 전달할 수 있는 문제를 재현. 영문 표시 라벨과 함께 수정하여 57건 Frontend 대상 테스트 PASS.
- 최초 전체 게이트: Typecheck PASS, Lint 오류 0·경고 1,091, Build PASS, 전체 테스트 PASS(Backend 1,956 PASS/440 SKIP, Frontend 1,925 PASS). 최종 소스 변경 후 전체 재검증 PASS: Typecheck/Lint/Build, Backend 1,956 PASS·440 SKIP, Frontend 1,927 PASS, DB 47 PASS·4 SKIP, API 계약 38 PASS.
- 격리 PostgreSQL 17.11에서 승인·미승인·만료·권한 경계 및 실제 10/20/50건 검색과 DB 상한 50건 PASS. 컨테이너 종료·삭제, 운영 DB 미접근.
- 의존성 보안 감사 High/Critical 0, Moderate 1. 신규 패키지·마이그레이션·금융 원장 변경 없음.

## 저장소 감사 및 배포 보류
- 원격 브랜치 127개(비-main 126), 열린 Draft PR 124개, 충돌 39개/병합 가능 85개. PR Head 누락·SHA 불일치·중복 0. 고유 커밋 보유 비-main 125개, main 조상 1개. 삭제 0.
- #1833과 도움말 화면·액션 파일이 겹치므로 최신 main 기준 순차 재기반 및 회귀테스트 필수. 다른 개발자의 미통합 변경 보존.
- Test/Production `/api/version` 모두 HTTP 200, 앱 SHA `b44ffd0af9e2bd6e7c2be7345b72094827078c3d`. 신규 후보 정확 SHA 인증 E2E는 미완료.
- QA v1365: 기존 18,000 WLD 출처, Treasury 552건, 마이그레이션 체크섬 불일치 5건, 오프호스트 백업 복원 등 미해결.
- **main 병합·Test/Production 배포 금지.** 기능 스위치 OFF, 운영 DB 변경·롤백·브랜치 삭제 없음.

## 작업 종료
- 신규 격리 브랜치에서 웹·서버 액션·Android app-api 캐시 보호 코드 및 회귀테스트 구현. 실제 PostgreSQL 검증 PASS, 기능 스위치 OFF 유지.
- Bot 테스트는 신규 worktree의 npm 의존성 누락으로 처음 실패했으나 오프라인 설치 후 11/11 PASS. 코드 수정은 불필요.
- 정확 SHA GitHub CI·후보 이미지 빌드 및 공식 Test 인증 E2E는 PR 등록 후 별도 확인. **Draft/HOLD**, main 병합·운영 배포·브랜치 삭제 없음.
