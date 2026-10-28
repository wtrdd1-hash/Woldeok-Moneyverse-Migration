# QA — 개발 A 지갑 입출금 필터 복구 (2026-10-28 10:25 KST)

## 작업 범위
- 병합되지 않은 채 닫힌 PR #1647의 원본 SHA `ed5289f3cabb28fd00c863c96ae5cb1358356920`를 보호 참조에서 확인하고, 최신 main `a28bed9aa40ff74d492824ae12892a7d52132fdd` 기반 신규 분리 브랜치에 기능을 복구했다.
- 회원 본인 원장의 현금+은행 순변동을 PostgreSQL에서 입금/출금/변동 없음으로 분류하고, 51건 lookahead 제한 **이전에** 필터링한다. 7일/30일 기간과 함께 적용하며 금액은 정수 문자열로 유지한다.
- 웹 44px 최소 터치 높이 및 접근성 탐색 속성, Android app-api 개인정보 캐시 금지를 유지한다. DB 마이그레이션·금융 원장·운영 데이터 변경 없음.

## 실제 검증
- RED: Backend 5 FAIL/3 PASS, Frontend 1 FAIL/3 PASS. GREEN: Backend 8 PASS, Frontend/Android 30 PASS.
- 격리 PostgreSQL 17.11 합성 스키마 2 PASS. 전체 적용 스키마/실제 운영 권한 검증은 아님.
- Backend 전체 1,930 PASS/442 SKIP, DB 45 PASS/3 SKIP, Bot 의존성 설치 후 11 PASS.
- Frontend 전체 **1 FAIL/1,866 PASS**. 기존 main과 동일한 관리자 블로그 테스트가 `편집 검토 대기` 문구 불일치로 실패했다. 독립 집중 재현에서도 실패했으며 이번 지갑 변경 파일과 무관하다.
- 루트 통합 `pnpm test`는 310초 제한으로 TIMEOUT. 전체 Lint 재시도 0 ERROR/1,102 WARNING, 변경 파일 Lint PASS, Typecheck PASS, API 계약 180 PASS, Backend/Next Build PASS, High 이상 의존성 감사 PASS.
- 접근성/SEO 전체 감사, 공식 Test 정확 SHA 인증 E2E, 전체 DB ACL, 독립 복원 및 GitOps 게이트는 미검증이다. Test 링크 대상이 없고 공개 Test SHA는 `6f697e74...`, 운영 버전은 `unknown`이다.
- P0 #1663의 미병합 PR 보호 참조 352개 유지. 다른 예약·브랜치·PR·운영 환경 변경/삭제 없음.

**판정: PARTIAL / BLOCKED — Production RELEASE HOLD.**
