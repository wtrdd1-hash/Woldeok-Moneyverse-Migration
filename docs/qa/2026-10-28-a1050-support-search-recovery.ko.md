# QA — A1050 관리자 문의 제목 검색 복구

**판정: PARTIAL / RELEASE HOLD.** 미병합 종료 PR #1652의 사용자 기능을 최신 main에서 독립 복구했습니다.

- 기준 main: `a28bed9aa40ff74d492824ae12892a7d52132fdd`; 독립 브랜치 `auto/hourly-a-support-search-recovery-20261028-1050`.
- RED: Backend 2실패, Web 2실패, Android 캐시 1실패. GREEN: Backend 3통과, Web/Android 28통과. 검색 입력·버튼 최소 44px 검증과 `noindex` 검증.
- 전체 Backend 1,930 PASS/440 SKIP, Frontend 1,867 PASS/**1 FAIL**(변경 외 블로그 테스트), DB 45 PASS/3 SKIP, Bot 11 PASS.
- 전체 Lint 오류 0/경고 1,102, typecheck·build·앱 API 계약 180개 PASS. 높은 등급 이상 루트/Bot 보안 감사 PASS.
- 격리 PostgreSQL 17.11에서 기존 196번 함수 본문으로 최신 100건·리터럴 검색·회원별 범위·원본 테이블 직접 SELECT 차단 확인. 전체 운영 스키마/권한 인증은 아님.
- 전체 프로젝트 테스트 실패, 공식 Test 정확한 SHA·인증 E2E·독립 백업 복원·GitOps 승격 미충족. **main 병합 및 운영배포 금지.**
- 마이그레이션/금융원장/권한/운영 변경 0건, 브랜치 삭제 0건, 롤백 불필요.
