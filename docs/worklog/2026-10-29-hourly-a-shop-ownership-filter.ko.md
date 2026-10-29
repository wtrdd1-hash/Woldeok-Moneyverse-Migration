# A0425 — 회원 상점 보유 여부 필터

- 시작: Debian 13.6 미니PC 연결, main `35971c600f25869c96f1c666d4b9f58927202730`; 브랜치 97개, PR 94개. QA v1356 금융 잔액 18,000 WLD 불일치 및 DB 권한/마이그레이션/백업/공식 Test 차단 유지.
- 목표: 회원별 상점 상품 전체/보유/미보유 필터를 웹·API·기존 PostgreSQL SECURITY DEFINER 조회·Android 게이트웨이에 적용. 운영 DB/금융 원장 변경 없음.
- 상태: 테스트 우선 개발 진행. 공식 Test 정확 SHA 및 운영 배포는 게이트 통과 전 금지.
- 중간 검증: 테스트 우선(RED→GREEN). Backend 보유 여부 파서·필터·컨트롤러 6개 PASS, 웹/Android 29개 PASS. Android 상점 응답의 상위 공개 캐시 헤더를 비공개·캐시 금지로 수정.
- 전체 로컬: Backend 1,945 PASS/440 SKIP, Frontend 1,875 PASS, DB 46 PASS/4 SKIP, 계약 38 PASS, Bot 11 PASS. Lint 0 오류(기존 경고 1,099), Typecheck PASS, 고위험 보안 취약점 0건. Backend 빌드 PASS. Next 기본 15 워커는 자원 부족으로 실패, 임시 2 워커 제한으로 빌드 PASS 후 설정 원복.
- 격리 PostgreSQL 17.11: 읽기 전용 트랜잭션, moneyverse_app 역할로 함수 146행 조회 성공, user_items 직접 SELECT 불가, ROLLBACK. 공식 Test 인증 E2E 아님.
- 브랜치 감사: 기존 비-main 96개 중 고유 미통합 92개, 충돌 3개, 완전 포함된 release 마커 1개 보존. 삭제 0. 운영 DB·원장·Test·Production 미변경.
- 최종 배포 상태: 금융 잔액/권한/마이그레이션/백업/공식 Test 차단 해소 전 HOLD.
