# A2025 — 회원 주식 거래내역 최근 조회 범위 (한국어)
- 시작: 2026-10-28 20:25 KST, 기준 main `35971c600f25869c96f1c666d4b9f58927202730`. 별도 `auto/hourly-a-stock-history-window-20261028-2025` 작업트리.
- 범위: 최근 50/100/200건 선택, API 입력 엄격 검증, 기존 회원별 PostgreSQL 함수, 웹 필터 및 Android 비공개 캐시 정책. 전체 과거 거래를 모두 검색하는 기능이 아님. 마이그레이션/원장/공유 DB 쓰기 없음.
- 안전: 데이터 디스크 98%, 기존 QA·보안·복원·정확 SHA Test 차단 해소 전 병합/운영배포 금지. 다른 작업자 브랜치·복구 참조 보호.
- 상태: 계획 및 테스트 준비. 영문 worklog를 우선 원본으로 유지.
- 중간: RED 확인 후 Backend 집중 13 PASS, Frontend/Android 39 PASS. main 재확인, 마이그레이션 및 공유 DB 변경 없음. 전체 검증 대기.
- 로컬 최종: 전체 `pnpm test` PASS(계약 38, DB 46 PASS/4 SKIP, Backend 1,952 PASS/440 SKIP, Frontend 1,885 PASS), Bot 11 PASS. Typecheck PASS, Lint 오류 0/기존 경고 1,099, Backend 빌드 PASS, Frontend Webpack 빌드 첫 Google 폰트 오류 후 재시도 PASS, Android 계약 180개 PASS. 루트 High/Critical 0(Moderate 1), Bot 취약점 0.
- 격리 PostgreSQL 17.11 읽기 전용: 기존 `stock_my_trades` 함수 및 앱 역할 EXECUTE 확인, 원장 직접 SELECT 거부. 테스트 회원 거래 0건이므로 실데이터 200건 인증 E2E 검증 아님.
- QA v1348 FAIL/HOLD, 마이그레이션 불일치 5/미적용 20, 18,000 WLD 원장 불일치, 앱 테이블 DML 235, PUBLIC 은행 함수 3, 백업 복원 미확인. 공식 Test SHA `cfb13272...`, Production 버전 `unknown`으로 후보 미실행. 운영 승격 금지.
- 빌드 후 데이터 디스크 99%에 도달해 본 작업에서 생성한 `.next` 1.1GB만 증거 저장 후 제거, 98%로 복귀. 타인 작업공간·백업·Docker·복구 참조 352개 보존. main 병합/운영배포/DB·원장 쓰기/브랜치 삭제/롤백 없음.
