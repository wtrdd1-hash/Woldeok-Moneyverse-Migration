# 개발 A1125 — 국고 제안·투표 허위 기록 차단 작업일지

## 작업 전
- Debian 13.6 미니PC 및 서비스 ACTIVE 확인. 루트 디스크 100%, 데이터 디스크 여유 93GiB. 기존 main `c9a868b1e622341e2daa8b936ddf0988eda9988e`에서 독립 Worktree 생성.
- AGENTS/README/영문·국문 프로젝트 계획·통합기획서, QA, 열린 PR 134개·원격 브랜치 138개·CI 확인. 기존 미병합 작업 보존.
- Next 국고 제안 API의 허위 제안 3건, 로컬 JSON 기반 무인증 표 가산 및 가짜 예산 집행 문구 발견.

## 작업 중
- TDD RED Frontend 4건, Backend 컨트롤러 부재 재현. Next API 503/401, Nest 가드/503, Android app-api 경로, 접근성 상태 화면 및 회귀 테스트 구현.
- 중간 main·통합기획서 재확인, SHA 동일. 기능 SHA `d5a1b4ced9e3d2a1cc6c46063fcd54cb84aab917`.
- 집중 Frontend 34 PASS, Backend 6 PASS. 전체 Backend 1,319 PASS, Frontend 1,402 PASS/6 FAIL, DB 15 PASS/3 SKIP, 계약 38 PASS. Typecheck/Lint/Build PASS. 감사 Critical 2/High 10 포함 FAIL.
- 격리 PostgreSQL 17.11 읽기 전용 확인: 시민 제안 테이블 없음, 앱 원장 INSERT/Posting UPDATE 차단, ROLLBACK. 운영 DB 쓰기 0건.

## 작업 후
- Draft PR #1264 및 후속 P0 이슈 #1263. 공식 Test SHA 불일치·전체 테스트/보안 FAIL로 통합·운영 HOLD.
- 비-main 고유 브랜치 138개, 충돌 PR 3개 보호. 삭제 0건, 운영 배포·재시작·롤백 0건. 최종 브랜치 SHA/CI 결과는 PR 댓글에 별도 기록.
