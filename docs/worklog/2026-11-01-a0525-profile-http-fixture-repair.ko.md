# 개발 A 05:25 프로필 HTTP 테스트 픽스처 복구

영문 정본: `2026-11-01-a0525-profile-http-fixture-repair.md`.

- 작업 전: 순수 main에서도 인증 프로필 HTTP 테스트 2건이 200 대신 401을 반환함을 재현.
- 작업 중: 응답의 `internal token required` 확인. 기존 전역 내부 토큰 가드를 우회하지 않고, 테스트에서 설정한 32자 테스트 전용 토큰을 정상 요청에 전달하도록 수정.
- 작업 후: 대상 8/8, Backend 전체 2,950 PASS / 517 SKIP / 0 FAIL. 운영 코드·DB·서비스 변경 없음. 정확 SHA CI 및 배포 게이트 전까지 Draft/HOLD.
