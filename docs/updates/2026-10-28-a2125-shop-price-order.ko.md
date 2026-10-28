# A2125 내부/GitHub 업데이트 v1 — 상점 가격순 정렬
- Draft PR #1745, 기준 main 35971c600f25869c96f1c666d4b9f58927202730, 분리 브랜치.
- 회원 전용 상점 가격 오름/내림차순, 엄격한 쿼리 검증, BigInt 정확 정렬, 웹 검색·정렬, Android 동일 쿼리 및 개인정보 캐시 금지.
- 집중 Backend 11·Frontend/app-api 31 PASS. 전체 테스트·Lint·Typecheck·Build·보안 감사 PASS. 격리 PostgreSQL app 역할 함수 실행/직접 테이블 조회 차단 확인.
- QA v1348, 공식 Test 정확 SHA, 독립 복원, DB 권한 및 과거 18,000 WLD 원장 차이, 데이터 디스크 98%로 운영 보류. 병합·배포·브랜치 삭제 없음. 최종 SHA CI 재확인 필요.
