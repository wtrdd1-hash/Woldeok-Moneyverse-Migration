# FE-C support/chat locale alias correction — 2026-11-24 07:45 KST

## EN
Start: isolated from remote main 9876c09888ec; root/detached tree unchanged. Scope: UiLocale support/chat only, no shared shell, finance, DB, nginx, or deployment changes.
RED: eight parameterized locale alias assertions failed. Root cause: support/chat route regex did not match `.html` aliases; locale resolution also ignored a one-value explicit `lang` choice when a preference cookie existed.
GREEN: eight alias assertions passed with an explicit one-value supported selection taking precedence for support/chat only. Invalid/multiple selections fall back to existing cookie/browser handling.
Verification: targeted Gradle test PASS; full Gradle suite FAIL (670 tests, four failures in NativeMessagingWebTest for en/ko/ja/zh). No claim of integrated release readiness. PostgreSQL, WebSocket, RBAC, visual and Test exact-SHA gates BLOCKED. No production or Test service changes. Release HOLD.

## KO
시작: 원격 main 9876c09888ec 기준 격리 작업트리, 기존 root/detached 작업트리 미수정. 변경 범위는 지원/채팅 언어 라우트만 해당하며 공통 shell·금융·DB·Nginx·배포 무변경.
RED: 지원/채팅 8개 경로 별칭 언어 테스트 실패. 원인은 `.html` 별칭 정규식과 쿠키보다 우선해야 하는 단일 수동 `lang` 선택 미처리.
GREEN: 8개 경로 테스트 통과. 미지원/중복 언어 선택은 기존 쿠키·브라우저 처리 유지.
검증: 지정 Gradle 테스트 PASS, 전체 670개 중 NativeMessagingWebTest 4개 FAIL(en/ko/ja/zh). 실제 DB·WebSocket·RBAC·시각·독립 Test exact-SHA 미검증(BLOCKED). 운영 및 Test 서비스 변경 없음. RELEASE HOLD.
