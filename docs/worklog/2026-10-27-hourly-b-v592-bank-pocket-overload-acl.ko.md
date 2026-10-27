# 개발 B v592 — 은행 저축 포켓 레거시 함수 실행권한 차단 (DRAFT / HOLD)

기준 main은 `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`입니다.
QA v1325의 P0 #993을 대상으로 개발 서버의 운영 연결 가능성이 있는
DB를 **읽기 전용**으로 조사했습니다. 은행 포켓의 기존 text-key
`bank_archive_pocket`, `bank_customize_pocket`, `bank_transfer_pocket`
세 오버로드에서 PUBLIC 및 앱 역할 EXECUTE가 확인됐습니다.
실제 악용이나 금전 손실이 발생했다고 확인된 것은 아닙니다.

Backend Repository의 세 함수 호출에 명시적인 UUID 및 금액 타입을
지정해 레거시 text-key 오버로드가 선택되지 않도록 했습니다.
신규 284번 SQL 마이그레이션은 세 레거시 함수가 존재할 때에만
PUBLIC 및 앱 역할의 실행권한을 회수합니다. 최신 UUID-key 오버로드와
기존 API 계약, 원장 및 WLD 잔액은 변경하지 않았습니다.

회귀 테스트 RED→GREEN을 수행했으며, 격리 PostgreSQL 17.11의
합성 함수 6개에서 이전 PUBLIC 접근을 재현한 뒤 마이그레이션을
두 번 적용하여 차단·정상 오버로드 호출을 확인했습니다. 이는
실제 금융 정산이나 공식 Test E2E 검증을 대신하지 않습니다.

Backend 1,548 PASS/413 SKIP, Frontend 1,485 PASS,
Contract 38 PASS, Bot 8 PASS, 타입 검사·Lint(오류 0)·Build PASS입니다.
그러나 기존 280번 중복 및 282/283번 조정 문제로 전체 테스트는
FAIL이며, 의존성 보안 감사도 FAIL입니다. A #1585와 B #1576의
283번 마이그레이션 제안 충돌을 먼저 해결해야 합니다.

**Draft + HOLD**: main 병합·공식 Test·Production 배포 없음.
공식 Test exact-SHA, 인증된 금융 E2E, 보안 감사, GitOps 승인 전
운영 반영 금지. 적용된 마이그레이션은 수정하지 않습니다.
