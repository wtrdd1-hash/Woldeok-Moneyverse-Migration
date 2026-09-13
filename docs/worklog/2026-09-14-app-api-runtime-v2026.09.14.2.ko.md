# 작업기록 — 앱 API 런타임 v2026.09.14.2

우선순위: 네이티브 앱 API / Google Play 출시 차단 문제.

작업 전 확인: 운영이 구형 SHA를 서비스해 최신 main에 이미 존재하는 `/account-deletion`, `/data-deletion`이 운영에서는 404였다. 회원가입 503은 운영 SMTP 설정 부재와 기존 메일 서비스 장애로 확인했다. loopback 전용 relay를 구축해 health/EHLO를 확인했다. OAuth v2026.09.14.1은 먼저 CI를 통과해 병합했다.

검증 게이트: backend unit/E2E, frontend typecheck/test/build, DB CI, 정확한 후보 SHA Test, 이후 운영 version/API/삭제페이지 smoke. DB 데이터와 secret은 Git에 커밋하지 않는다.
