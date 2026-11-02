# A2025 종목명 검색 — 배포 보류

- 후보: Draft PR #2526, 브랜치 `auto/hourly-a-20261102-2025-board-stock-name`. 최종 SHA는 PR 및 증거에 기록.
- 구현: 공개 게시글 최근 50건의 종목명 검색, Nest·기존 PostgreSQL 함수 조회·Next·Android·184개 API 계약. 신규 마이그레이션, 금융 원장 쓰기, 권한 확대 없음.
- 로컬: 대상 회귀테스트·타입검사·빌드·린트(수정 후) PASS. **Backend 전체 인증 2건 FAIL, Frontend 전체 작업자 종료 1건 FAIL(단언 2,945 PASS), 전체 의존성 감사 9건 FAIL**, 개발 DB 직접 권한 P0 미해결.
- 공식 Test/Production은 후보와 다른 SHA. 양쪽 Treasury HTTP 200은 필수 503 보류 조건과 불일치. 후보 정확 SHA 인증 E2E, 독립 복원, 롤백 증거, GitOps 릴리스 게이트 미충족.
- 결정: **main 병합·운영 배포 금지**. 다른 개발의 고유 브랜치·PR 보존. Test/Production 변경 및 롤백 없음. 모든 필수 게이트가 독립적으로 충족된 뒤에만 재검토.

**Frontend 추가 증거:** 작업자 2개로 제한한 전체 2,947건 PASS. 기본 병렬 실행에서는 작업자 종료. Backend 독립 실행의 기존 프로필 인증 2건 FAIL, 기본 `pnpm test` 작업자 EPIPE, 전체 감사 및 개발 DB P0 권한 문제는 남아 있어 배포 보류 유지.
