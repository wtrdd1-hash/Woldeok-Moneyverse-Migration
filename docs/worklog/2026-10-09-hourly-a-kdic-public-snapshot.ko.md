# 개발 A — KDIC 공개 조회 경로 보강 (2026-10-09)

상태: **미검증 후보 — 병합/배포 금지**.

- 기준 main: `aa4ae83e581cb2c8530971bf04db0b5c2473d616`, 브랜치: `auto/hourly-a-kdic-public-snapshot-20261009-0325`.
- 시작 비-main 원격 브랜치 33개, 열린 PR 0개. main 포함/동일 25개는 삭제 대기, 고유 변경 8개(A 3개, C 5개)는 보존. GitHub 삭제 도구가 없고 원격 장치 모두 오프라인.
- 프론트: 기존 fail-closed KDIC 화면·테스트를 보존하고 동일 출처 Next BFF 연결, 정수 문자열 검사·BigInt 표시를 추가.
- 백엔드: 공개 조회에서 관리자 전체 개요/지급 이력을 호출하지 않고 전용 DB 함수를 사용.
- DB: 신규 266 마이그레이션에서 SECURITY DEFINER 공개 필드만 반환, PUBLIC 실행권 회수, moneyverse_app에 EXECUTE만 부여. BIGINT는 문자열. 기존 적용 마이그레이션 미수정.
- 테스트: 저장소·BFF 회귀 테스트 작성, **실행하지 못함**. Debian/miniPC 오프라인, 로컬 pnpm/PostgreSQL 부재.
- 전체 빌드·린트·타입·실DB·보안·E2E·exact-SHA Test: **BLOCKED(미검증)**. main 병합/운영 배포 없음. 롤백 불필요.
- 잔여 위험: 기존 KDIC 관리자 지급 기능의 계좌 잔액 직접 수정은 원장 무결성 위반 가능성이 있으므로 별도 원자적 DB 함수로 재설계·검증 필요.
- 다음: 정확한 SHA의 PostgreSQL 최소권한/정밀도/개인정보 및 전체 테스트 통과 후 최신 main 재확인.
