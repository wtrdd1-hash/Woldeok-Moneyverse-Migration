# FE-C 명시적 언어 선택 우선순위 v2026.11.23.1 (KO)

범위: Spring `UiLocale.resolvePublic` 및 격리 회귀 테스트. 공개 Spring 경로의 `?lang=JA` 명시 선택이 기존 `wdmv_locale=ko` 쿠키보다 우선합니다. 명시 선택이 없으면 수동 쿠키가 브라우저 `Accept-Language`보다 우선합니다. 지원하지 않는 쿼리는 쿠키를 덮어쓰지 않습니다. 쿼리를 자동으로 영구 저장하지 않으며 계정 설정과 전역 셸은 변경하지 않았습니다.

TDD: 수정 전 테스트 2건 중 1건 실패(RED), 수정 후 2건 모두 통과(GREEN), 실패/건너뜀 0건. PR #3326의 채팅 경로 테스트 8건은 현행 main에 없어 이번 브랜치에서 실행·인증하지 않았습니다. `git diff --check` 통과. 운영·PostgreSQL·브라우저·전체 exact-SHA 릴리스 검증 미수행, FULL RELEASE HOLD.

FE-C 전용 locale resolver와 테스트만 수정. FE-A 소유 셸/선택기는 수정하지 않았으며 금융·개인정보 데이터 변경 없음.
