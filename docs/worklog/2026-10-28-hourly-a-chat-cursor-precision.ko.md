# 개발 A — 비공개 채팅 bigint 커서 정밀도 보완 (vA-2026.10.28.0025)

상태: **Draft / HOLD — main 병합, Test·Production 배포 금지**.

채팅 이전 메시지·증분 동기화가 `Number.parseInt`로 `2junk`를 수용하고, PostgreSQL `bigint`의 2^53 초과 시퀀스를 반올림하는 문제를 확인했습니다. 읽음 처리와 웹 폴링도 JavaScript 숫자를 사용했습니다. 이번 후보는 웹·Android app-api·NestJS·PostgreSQL 쿼리 바인딩까지 정확한 64비트 십진 문자열을 유지하며, 비정상·중복·범위 초과 커서는 HTTP 400으로 거부합니다. 읽음 처리에서 구형 앱의 안전한 정수는 호환 허용하지만 정밀도가 손실된 숫자는 거부합니다. Android 채팅 응답 및 오류는 `private, no-store`를 강제합니다.

TDD 수정 전 실패 확인, 수정 후 Backend 집중 87건·Frontend 26건 통과. PostgreSQL 17.11 독립 합성 스키마/읽기 전용 역할에서 5건 통과(2^53 초과 정확성·타인 조회 차단·메시지 변경 금지). 이 결과는 전체 실제 마이그레이션/운영 앱 역할 검증을 대신하지 않습니다.

시작·중간 main `004be59307e389a4f293a0a0e71ee4144982936d`, 원격 브랜치 349개(비-main 348), 열린 PR 339개(Draft 324), 열린 PR 중복 Head SHA 0개. 기존 #1589 및 다른 개발 작업 보존.

**남은 차단:** main의 마이그레이션 283 중복, `moneyverse_app`이 접근 불가한 private chat 테이블을 직접 읽는 기존 Repository 권한 결함, 전체 보안 감사, 공식 Test 정확 SHA 인증 E2E·접근성·SEO·5회 반복 QA·백업 복원·GitOps. 임의의 테이블 SELECT 권한 추가나 적용된 마이그레이션 변경은 하지 않았습니다. DB/원장/서비스/기능 스위치 변경 및 운영 배포 0건. 코드만 변경되어 승인된 revert로 롤백 가능하며 SQL 롤백은 없습니다.

검증: Backend 1,718 PASS/431 SKIP, Frontend 1,691 PASS, 전체 Typecheck·Build·app-api 180 엔드포인트 PASS, Bot 8 PASS(격리 작업공간 의존성 설치 후). DB 32 PASS/3 SKIP/1 FAIL(283 중복·285 누락), 전체 프로젝트 테스트 FAIL. 전체 Lint는 범위 밖 기존 블로그 코드 2오류로 FAIL(이번 변경 파일 Lint 0오류). 전체 의존성 2 Low/8 Moderate, Bot 1 Critical/5 High로 Bot 보안 감사 FAIL. 공식 Test 정확 SHA·실제 앱 역할 DB ACL·브라우저 접근성/SEO E2E·복원·GitOps는 미검증입니다.
