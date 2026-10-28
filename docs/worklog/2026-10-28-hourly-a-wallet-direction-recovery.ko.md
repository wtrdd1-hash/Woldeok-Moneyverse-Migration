# 개발 A — 지갑 입출금 필터 미병합 변경 복구 (2026-10-28 10:25 KST)

## 작업 전
- 기준 main: `a28bed9aa40ff74d492824ae12892a7d52132fdd`. 대량 PR 종료 사고 #1663에서 보호된 미병합 PR #1647의 기능을 새 분리 브랜치에서 재구현·검증한다.
- 기존 작업 및 원장/운영 DB/다른 개발자 브랜치는 변경하지 않는다. 정확한 정수 문자열, 회원 소유권, 조회 후 50건이 아닌 조회 전 필터링을 유지한다.

## 진행 중
- RED→GREEN 회귀 테스트, 전체 검증, 중간 main 및 영문/국문 통합기획서 재확인 예정.

## 종료
- 미완료. 통합/운영 승격 금지.

### RED 검증
- 계약 빌드 후 Backend 5건 실패/3건 통과, Frontend 1건 실패/3건 통과를 확인했다. 최초 Backend 실패는 계약 패키지 빌드 누락으로 별도 분류한다.

### GREEN 및 충돌 해결
- Backend 8/8, Frontend/Android 30/30 통과. app-api 캐시 충돌은 기존 채팅/은행 보호를 유지하고 지갑을 추가해 해결했다.
- 중간 main과 영문/국문 통합기획서 재확인 완료. 운영 DB/원장 변경 없음.

## 종료 — 코드 구현, 통합 보류
- [완료] RED/GREEN, 격리 PostgreSQL 2 PASS, Backend 1,930 PASS/442 SKIP, DB 45 PASS/3 SKIP, Bot 11 PASS, 전체 Lint/Typecheck/계약/빌드 PASS.
- [차단] Frontend 기존 블로그 테스트 1 FAIL(1,866 PASS), 루트 통합 테스트 310초 TIMEOUT, 공식 Test 정확 SHA·DB ACL·인증 E2E·독립 복원·GitOps 미검증.
- 원격 브랜치/PR 삭제 0건, 보호 참조 352개 보존, Test/Production/원장 변경 및 롤백 0건. QA 상세는 `docs/qa/2026-10-28-a1025-wallet-direction-recovery.ko.md`.
