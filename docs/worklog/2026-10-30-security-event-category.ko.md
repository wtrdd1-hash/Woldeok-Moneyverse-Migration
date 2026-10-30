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

## 진행 중 추가 (13:07 KST)
- 전체 타입검사 PASS, 전체 린트 오류 0건(기존 경고 1,043건), 로컬 빌드 PASS.
- DB 단위 56 PASS/4 SKIP, Backend 대상 9 PASS, Frontend/Android 대상 68 PASS, OpenAPI 유형 테스트 4 PASS.
- 격리 PostgreSQL 17.11에 마이그레이션 305개(002~306) 적용. 본인 최근 20건, 타인 분리, 20건 밖 오래된 이벤트 제외, 앱 역할 원본 테이블 직접 조회/수정 차단, 함수 실행권한, 롤백 후 0건 검증 PASS. 운영 DB 변경 없음.
- Android 기계 판독 API 계약 및 영문·국문 스키마 참조에 `category` 파라미터 추가. 전체 회귀/CI 재검증 대기.
