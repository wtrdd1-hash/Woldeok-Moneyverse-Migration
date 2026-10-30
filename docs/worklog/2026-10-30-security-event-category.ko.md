# 개발 A — 최근 보안 활동 유형 필터

## 작업 전 (2026-10-30 12:56 KST)
- 미니PC Debian 13 연결, Backend·Frontend·Nginx·Docker·DB 정상 응답. 기준 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- QA v1388: Production 실행 프로세스 경로 불일치, Test 국고 가상 데이터 HTTP 200. 운영 승격 보류.
- 독립 `auto/hourly-a-20261030-1256-security-event-category` 브랜치와 worktree. 기존 열린 PR 7개와 고유 미통합 변경 보존.

## 진행 중
- 본인 최근 20건에만 적용하는 `all/login/settings` 필터. 기존 SECURITY DEFINER 함수 재사용, 마이그레이션·금액 변경 없음.
- 테스트 먼저 실패(RED) 확인 후 Backend 9건·Frontend/Android 62건·추가 gateway 52건 통과(GREEN). 비정상·불일치 응답은 빈 결과로 처리하지 않고 거부.
- 최신 main 중간 재확인: 변동 없음. 전체 게이트·격리 PostgreSQL 검증 진행 예정.

## 종료
- 검증·배포 판정 기록 예정. 공식 Test 정확 SHA 및 운영 승격 전까지 HOLD.
