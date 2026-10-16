# 테스트 DB 이력 복구 및 정확 SHA 배포 — v2026.10.17.753

**영문 정본:** [English](TEST_DATABASE_LINEAGE_REPAIR_v2026.10.17.753.md)
**상태:** 공개 Test의 정확 SHA, 비로그인 경로와 읽기 전용 금융 검사 TEST_VERIFIED. **운영 앱 승격은 차단**.

## 출발점과 실제 원인
상위 정책 PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, 재정 v523/542/543, 인증 UI v530, P0 v713 준수. 기존 공개 Test v735.2의 woldeok_moneyverse_v506_test DB는 마이그레이션 246건, 잔액 계정 60건, 인증 세션 96건이나 신규 통화정책·PvP 테이블이 없어 PvP GET 500이었다.

기존 Test의 243-private-chat, 244-treasury-privilege, 245-runtime-maintenance와 현 정본의 243-treasury-security, 244-central-bank-mint, 245-auto-monetary는 같은 번호에 서로 다른 SQL이다. 기존 이력이나 해시를 삭제·변경하지 않았다.

소유권·접근 ACL까지 포함한 PostgreSQL 17.11 원본 Test 전체 백업을 별도 Test 클러스터 복제 DB wdmv_v753_test_acl에 복원. ACL을 누락한 1차 복제는 금융 SELECT 권한 오류가 나서 버리고, 금융 테이블의 직접 쓰기 권한을 광범위하게 열지 않았다. 복원 전 원본과 복제의 잔액 60·세션 96건은 행 해시까지 같았다.

복제본에서만 인자 이름이 충돌하는 treasury_cast_citizen_budget_vote(uuid,text,text)의 의존 객체가 없음을 확인하고 DROP FUNCTION RESTRICT 후 정본 SQL 243/244/245를 적용했다. 248–272 순차 25개 마이그레이션도 성공. 실제 실행된 정본 SQL 해시를 옛 세 이름과 함께 기록: 이력 274건 = 현 정본 271건 + 보존된 옛 Test 이력 3건. 271개 정본 파일 SHA256 전체 일치. 실행하지 않은 SQL을 적용 완료로 표시하지 않았다.

복제 Test DB는 사용자 잔액 60건, 원장 대조 불일치 0, 불균형 거래 0, 금융 핵심 테이블 5개의 앱 직접 쓰기 권한 0으로 검증됐다. 이는 Test의 좁은 준비 조건일 뿐 운영 금융 승인이 아니다.

## 실제 공개 Test 승격과 복구
main 소스 SHA c2d4667b44c0222ed422cea2a59626a0a318face. 두 번째 200GB 데이터 디스크의 불변 Test 릴리스에 Nest·Next 운영 빌드(정적 페이지 590개), 동일 BUILD_ID, 공통 계약 패키지를 포함해 생성.

02:40 KST 첫 전환은 @moneyverse/contract/dist/index.js 누락으로 백엔드 시작 실패. 롤백이 실제 작동해 v735.2와 이전 환경 복구 확인. 정확 SHA 소스에서 누락 패키지를 빌드하고 불변 배포본 자체를 사설 포트에서 다시 실행 검증.

02:43 KST 두 번째 전환 성공. 공개 Test 백엔드·프론트엔드 SHA 일치, /health 200, 비로그인 대표 경로 11개 × 5회 = 55/55 HTTP 200, PvP GET 200, 비로그인 생성 401, 검색 제외 noindex, Test 금융 검사 및 배포본 신원 검사 통과. v752 단일 작업 리더 규칙으로 Test 자동 스케줄러 차단.

기존 DB 전체 백업 및 전환 후 백업, 이전 릴리스 BUILD_ID 환경 파일은 /srv/moneyverse-data/backups/test-v2026.10.17.753-precutover/에 접근 제한해 보존. 원래 Test v735.2 불변 배포본과 Test 원본 DB는 그대로 유지. 운영 DB와 운영 포인터는 변경하지 않았다.

main 테스트 후보 CI 38938140942 성공, GitHub 운영 이미지 사전검사·빌드 38942314503 성공. 이는 실제 운영 호스트 승격과 다른 상태.

## 남은 조건
실제 인증된 회원·관리자 세션, 2FA 및 전 경로 v530 ×5 검증은 비로그인 55회 성공으로 대체되지 않는다. Test 크롤러 로그에서 seo_crawler_logs에 쓰기 권한 부족 경고도 발견돼 좁은 저장 함수 또는 안전 no-op으로 별도 수정해야 한다. 운영 DB는 아직 금융 잔액 불일치 19건, 전표 없는 현금 계정 5건, 보호 테이블 5개 앱 직접쓰기 권한 문제가 있다. v753에서 운영 앱 전환·운영 DB 변경·회원 잔액 조정을 하지 않았다.
