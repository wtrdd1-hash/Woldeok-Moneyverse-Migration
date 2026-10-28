# A1225 — 회원별 상점 상품 가격·관리비 비교 복구 (2026-10-28)

## 작업 전 / v1
- 최신 main `a28bed9aa40ff74d492824ae12892a7d52132fdd` 기준. AGENTS, README, 영문 원본/국문 보조 기획서, QA v1340, 이전 A 작업일지 확인. 원격 브랜치(main 포함) 20개, 열린 Draft PR 18개, 복구 참조 352개.
- 미통합 이전 코드 `db018d11f`의 P1 기능을 신규 `auto/hourly-a-shop-verified-compare-recovery-20261028-1225` 분리 worktree에 복구. 다른 작업자의 PR #1677 변경은 보호.

## 작업 중 / v2-v4
- RED 테스트 확인 후 Backend·API·웹·Android app-api 및 181개 엔드포인트 계약 복구. 회원 인증·동의, 두 개의 서로 다른 UUID, PostgreSQL 조회 가격, BigInt 정수 문자열 차이, 품절/누락 거부, 클라이언트 임의 금액 표시 방지. 기존 개인정보 `noindex`와 wallet/privacy 캐시 금지 정책을 유지하며 충돌 해결.
- 코드 커밋 `e6c4782d27ddf9fbf9e7dda7e34d27bcc26cc20f` (16개 파일). 마이그레이션·원장·구매 변경 없음.
- Backend 1,933 PASS/441 SKIP, Frontend 1,870 PASS/1 FAIL, DB 45 PASS/3 SKIP, Bot 11 PASS, 타입·린트 오류 0·계약 181·빌드 PASS. 전체 프로젝트 FAIL: 기존 main과 동일한 관리자 블로그 UI/테스트 불일치(`편집 검토 대기`).
- 격리 PostgreSQL 17.11에서 **실제 Migration 123 조회 함수 본문**과 컴파일된 저장소, 회원별 보유수량·대형 정수·원본 테이블 SELECT 차단 검증 PASS. 합성 스키마이므로 운영 전체 검증 아님.
- 운영 의존성 감사 High/Critical 0, Moderate 1; Bot 감사 0. 기존 앱 DB 직접 DML 235/241 및 PUBLIC 은행 함수 3개 위험 유지.

## 작업 후 / v5 — 운영 보류
- 352/352 복구 커밋 보호, 삭제 브랜치 0. 신규 기능은 Draft/HOLD, main 병합·공식 Test·운영배포·금융 DB 변경·롤백 0건.
- 전체 Frontend 실패, 공식 Test 정확 SHA 인증 E2E, 백업 복원, 보안·접근성·SEO 종합검증 및 GitOps 승인 미충족. PR #1677과 파일 중복은 추후 안전한 재검증 필요.
- 근거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-1225/`.
