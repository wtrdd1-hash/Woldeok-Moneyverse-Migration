# 개발 B v675 — P0 애플리케이션 DB 권한 릴리스 게이트 강화

**작업 전:** main `761a55a094fb9dd383d213e817305e68c79fa23c`에서 독립 브랜치를 생성했습니다. AGENTS.md, README, 영문·국문 기획서, QA v1404 및 열린 PR을 확인했습니다. A의 인벤토리 개인정보 보호와 B v674의 자문 API 작업을 피했습니다.

**개발 중:** 기존 읽기 전용 금융 사전 검사는 INSERT/UPDATE/DELETE만 확인해 PostgreSQL TRUNCATE와 회원정보·감사로그·보유상품 테이블의 직접 SELECT 권한을 놓쳤습니다. 12개 중요 테이블의 SELECT/TRUNCATE/DML을 검증하도록 수정했습니다. 실제 DEV를 읽기 전용으로 조사한 결과 중요 테이블 10/12개에 TRUNCATE, 개인정보 관련 6/6개에 SELECT 권한이 있었습니다. 이는 Production 침해 증거가 아닙니다.

**검증:** 회귀 테스트 20건, 릴리스 테스트 122건, 전체 Lint·Typecheck·Build, API 계약 184개, Backend 2,778건, Frontend 2,770건, DB 62건, 보안 17건 통과했습니다. 격리 PostgreSQL 17.11에서 위험 권한은 BLOCKED, 안전 권한은 다음 단계 진행 가능으로 판정했습니다. 공유 DB와 금융 원장은 수정하지 않았습니다.

**결론:** 기존 운영자 승인 금융 DML 예외를 확대하거나 취소하지 않았습니다. TRUNCATE 및 개인정보·감사 권한은 별도 검증 대상입니다. 공식 Test exact-SHA·독립 복구·Production 실행 버전 검증이 없으므로 Draft/HOLD 유지, 병합·배포 금지입니다.
