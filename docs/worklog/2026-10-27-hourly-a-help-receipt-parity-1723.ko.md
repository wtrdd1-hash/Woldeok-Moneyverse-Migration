# 개발 A — 도움말 검증기한 영수증 정합성 (2026-10-27 17:23 KST)

**상태:** DRAFT / 운영 RELEASE HOLD, 병합·배포 금지.

## 작업 전
- Debian 13.6 미니PC와 서비스·PostgreSQL 정상. 기준 main `c2a9306ddc0424438bc0ab297ea9543bb167aee6`. AGENTS/README, 영문 정본·국문 기획, 이전 QA·작업일지, 브랜치·PR·CI 및 미병합 기획 v1366 확인.
- 최신 main의 독립 `auto/hourly-a-help-receipt-parity-20261027-1723` worktree에 기존 A의 미통합 커밋 7개만 재적용. 다른 개발자와 기존 PR #1557 보호.

## 실제 수정
- P1: 현재 게시상태 응답의 문서 ID·게시시각이 같아도 서버 검증기한이 달라진 경우, 웹이 과거 SSR의 더 긴 검증기한을 보여주는 문제 수정. DB/Backend/Android API의 권위 있는 검증기한과 웹 표시 기한의 실제 시각을 비교한다.
- 실패 재현 RED(추가 회귀 1 FAIL / 기존 4 PASS) 후 GREEN(집중 5 PASS). 기존 테스트 Fixture도 문서별 검증기한과 일치시킴. 운영 DB·마이그레이션·원장·권한 변경 없음.

## 검증 및 릴리스 차단
- Typecheck/전체 테스트/Lint/Backend Build/Next Webpack Build PASS. Backend 1,344 PASS/398 SKIP, Frontend 1,445 PASS, DB 20 PASS/3 SKIP, Contract 38 PASS, Bot 8 PASS. Lint 기존 경고 1,132건·오류 0. 격리 PostgreSQL 17.11에서 280 초안·독립 승인·철회·권한 거부·감사 불변성 PASS, 임시 컨테이너 제거.
- 저장소 비밀키·제어문자·Prisma 명령 검사 PASS. 전체 의존성 보안 Critical 2/High 8, Bot Critical 1/High 5로 FAIL. 첫 테스트 명령은 NODE_ENV 누락으로 React 프로덕션 테스트 모드 오류가 났으나 바로잡아 실제 RED→GREEN 재현. 도구 재시도로 중복 실행된 자체 검증 프로세스만 종료하고 원래 단일 전체 검증을 완료함.
- 공식 Test exact SHA 인증 E2E, 전체 브라우저 WCAG·SEO, 독립 복원, GitOps 및 다른 미통합 PR과의 280 번호 충돌 미해결. 기능 OFF. main 병합·Test/Production 배포·운영 DB 쓰기·롤백·브랜치 삭제 0건. 사양·코드 2단계 검토 후 Draft/HOLD로 보존.
