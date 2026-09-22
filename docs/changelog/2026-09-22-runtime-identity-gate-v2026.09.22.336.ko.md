# v2026.09.22.336

- 릴리스 안전성: Production 이미지 빌드 전에 격리 Test의 backend와 frontend runtime identity가 동일한 attested application SHA인지 검증합니다.
- `/api/version`과 `/frontend-version`이 다른 split release를 fail-closed 처리합니다.
- isolated-Test attestation에 runtime identity 일치 검증을 기록하고 실행 가능한 회귀 테스트를 추가했습니다.
