# 개발 A QA — 2026-10-31 20:25 회차 — 시즌 순위 범위

**판정: P1 코드 로컬 검증 PASS / 운영 RELEASE HOLD.** 기준 main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`, 수정 코드 SHA `cadb1561fd83265e17be96319dd26050f8567015`, Draft PR #2198.

- 회원이 시즌 이벤트 순위를 상위 3/10/20명으로 선택. Backend는 제한값을 검증해 기존 PostgreSQL SECURITY DEFINER 함수에 바인딩, Next.js는 접근성 있는 선택 링크 제공, Android는 중복·잘못된 요청과 검증되지 않은 HTTP 200·추가 개인정보 필드를 차단. 정확한 정수 문자열 유지, private/no-store/noindex/no-referrer. 신규 마이그레이션·원장·권한 변경 없음.
- 테스트 우선 개발: 1차 RED Backend 14/Frontend 6, 2차 사생활 검증 RED 4. 최종 대상 Backend 14 PASS, Frontend/Android 32 PASS.
- 최종 로컬: 전체 Lint 오류 0/경고 1,050, Typecheck PASS, Backend 2,800 PASS/501 SKIP, Frontend 2,808 PASS, DB 단위 62 PASS/4 SKIP, 계약 41 PASS, Backend/Next.js Build PASS(힙 3072MB). 1차 1024MB 빌드 메모리 부족 실패는 별도 기록.
- 운영 의존성 고위험 감사 PASS, 전체 의존성 감사 FAIL(중간 10·낮음 3, 총 13건). 건너뛴 DB 테스트를 통과로 집계하지 않음.
- 실제 개발 PostgreSQL 17.11의 마이그레이션 312개, 함수 EXECUTE 허용. 다만 앱 계정의 이벤트 참여 테이블 직접 SELECT/DELETE 권한 허용(P0 #993). 격리 네트워크 차단 PostgreSQL의 정본 함수와 합성 회원 25명으로 상위 3/10/20 정확한 결과 및 직접 SELECT 차단 확인. 롤백·컨테이너 제거. 실제 개발 DB는 활성 이벤트 0건으로 실데이터 순위 정확성 검증 불가.
- 공식 Test·Production 공개 SHA `bc8cd8a6…`는 후보와 다름. 운영 프로세스가 삭제된 v1515 경로를 사용하고 `/login`은 검색 색인을 허용(#1984). 후보의 정확 SHA 인증 E2E, 독립 백업 복원, 운영 권한·금융 정합성 게이트 미검증.
- 원격 브랜치 121개(비-main 120개), 열린 PR 106개, 충돌 PR 8개. 삭제 0건. #2121의 시즌 UI·컨트롤러·게이트웨이 파일 중복은 병합 전에 충돌 해결 필요.
- 초기 CI는 테스트 코드 숫자 리터럴 오류로 FAIL, 수정 SHA의 CI/후보 빌드 결과는 완료 시 별도 기록.

**최종 릴리스: HOLD.** main 병합·Test/Production 배포·서비스 재시작·운영 DB 변경·롤백 없음.
