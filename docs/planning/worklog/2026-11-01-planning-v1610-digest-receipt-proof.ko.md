# 기획 v1610 — F675-208 생성 증빙·추적 범위 보완 (2026-11-01)

**주기:** 이전 기능 추가 v1608 / 현재 기능 보완 v1610 / 다음 기능 추가 v1612(잠정). **상태:** DRAFT / RELEASE HOLD. **기준:** origin/main 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0 시작·중간 확인, AGENTS.md, README.md, 영문 정본 PROJECT_PLAN.md 및 국문 대조, 선행 Draft #2343·이슈 #2342.

## 근거와 결정
- 상태는 VERIFIED_CREATED / NO_VERIFIED_RECORD / NOT_TRACKED이며 추적 범위 불명·고아·위조 근거는 SOURCE_UNAVAILABLE 503이다.
- miniPC Debian 13.6 서비스 정상, DEV DB 연결. 읽기 전용 SQL에서 in_app_notifications 테이블의 PK·회원 FK·부분 dedupe UNIQUE·회원/생성시각 인덱스를 확인했다. 개발 앱 역할의 직접 DML/TRUNCATE 권한도 확인했으나 운영 권한의 증거는 아니다. 번호형 정식 CREATE TABLE은 미확인, DEV의 만료 알림 함수 0개. 기존 백엔드는 알림을 직접 조회·삽입하고 safeNotificationLink는 /inventory를 거부한다.
- 단순 JOIN으로 생성의 동일 트랜잭션을 증명할 수 없어 승인된 원자적 작성자·회원/카테고리/키 결속을 요구했다. 미생성 기록 표시는 회원/코호트별 KST 날짜 추적 범위·8일 이상 동시 보존 증빙을 전제하고 불확실하면 503으로 처리한다. MVCC 관찰시각과 커밋시각을 구분하고 같은 날짜 생성의 WITHIN_EXPECTED_WINDOW / OUTSIDE_EXPECTED_WINDOW를 사실대로 구분한다. 인증 오류/HEAD/조건부까지 선행 비공개 헤더, 60초 STALE·계정 전환 격리를 추가했다.
- 최신 P0 공식 Test 회계 출처 #2345(Test 313 대 운영 314), 자동 병합 #1088, DEV 권한 #993, 제작 #2330, 주식 체결 표시 #2340, 국고 과거 552/744건 출처 보류. Test/Production /api/version bc8cd8... / 353c6d...로 최신 main과 다르다. P0 4/P1 6 및 실제 수용시험은 제안이며 실행하지 않았다.
- 외부 독립 근거 신규 검증·중복제거·분류 승인 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.
- 런타임·DB·금융 데이터·Test·Production·예약·타 작업자 브랜치·main 변경 없음. 운영 승격 보류. 상세 명세는 영문·국문 통합 기획서 참조.
