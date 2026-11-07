# QA — 프로필 HTTP 테스트 픽스처 복구

- 영문 정본: `2026-11-01-a0525-profile-http-fixture-repair.md`.
- 순수 main의 401 실패 2건 재현, 원인 `internal token required` 확인.
- 테스트 전용 헤더만 수정, 대상 8개 및 Backend 전체 2,950개 PASS / 517 SKIP.
- 운영 보안 경계 불변. 정확 SHA CI·Test·Production 미검증, 배포 보류.
