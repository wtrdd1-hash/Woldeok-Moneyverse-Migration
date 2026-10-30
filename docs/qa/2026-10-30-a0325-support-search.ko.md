# QA — A0325 회원 문의 제목 검색 — 운영 배포 보류

기준 main `62c6cd038951d65c94b709302bdaec6e75b080b6`; 독립 브랜치 `auto/hourly-a-support-subject-search-20261030-0325`.

- RED: Backend 4건, Frontend 2건 실패 재현. Android 개인정보 보호 회귀테스트도 수정 전 실패.
- GREEN: Backend 제목/상태 7건, Frontend 제목/상태/Android 7건 통과(복합 필터 테스트 포함).
- 격리 PostgreSQL 17.11: 304/304 SQL 적용, 합성 문의 108건, 회원별 격리, `%_` 일반 문자 검색, 상태 결합, 최근 100건 제한, 앱 계정 직접 테이블 조회 차단 통과. 운영 DB 변경 없음.
- Typecheck/Build/변경 코드 ESLint 통과. DB 단위테스트 56건 통과/4건 건너뜀. 운영 의존성 알려진 취약점 없음.
- 전체 Lint 실패: 기존 `stale-tab-notice.tsx`의 `no-empty` 3건. 이번 후보의 제어문자 정규식 Lint 1건은 수정 후 재검증 통과. Backend 전체 2,355 PASS/236 FAIL/493 SKIP. Frontend 전체 85초 제한 초과. 모바일 API 생성 계약은 기존 NPC affinity 타입 불일치로 실패(QA PR #1927), 관련 없는 생성 파일은 제외.
- 공식 Test 정확 SHA 인증 흐름, 릴리스 이미지, 접근성/SEO 전체 E2E, 독립 복원, 국고 출처·Frontend SHA: BLOCKED. main 병합·Test/Production 승격·롤백 없음.

검증하지 않은 항목은 성공으로 간주하지 않으며 다른 개발자의 미병합 변경을 보존한다.
