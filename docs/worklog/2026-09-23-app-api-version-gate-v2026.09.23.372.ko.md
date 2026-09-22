# App API 최소 버전 게이트 — v2026.09.23.372

## 범위
개발 B / API-116-01 P1. 최신 main의 `/app-api/v1` 호환 게이트웨이에 서버가 소유하는 최소 지원 앱 버전 정책이 없던 부분을 보완했다.

## 구현
- 엄격한 `major.minor.patch` 정수 비교를 사용하는 선택적 `APP_API_MIN_VERSION` 정책을 추가했다.
- 정책 활성화 시 최소 버전 미만이거나 앱 버전 헤더를 정상 해석할 수 없는 요청은 private API 프록시 전에 HTTP 426 `app_upgrade_required`로 차단한다.
- 네이티브 클라이언트가 결정적인 업그레이드 흐름을 표시할 수 있도록 `x-moneyverse-min-app-version`을 반환한다.
- 잘못된 서버 정책은 호환성 검사를 조용히 해제하지 않고 HTTP 503으로 fail-closed 처리한다.
- 이 정책은 호환성 전용이며 인증·권한은 기존 서버 session/actor/role/consent/step-up을 계속 사용한다. 클라이언트 헤더를 신원 증명으로 취급하지 않는다.

## 검증
App API focused test 10/10 PASS, Frontend TypeScript noEmit PASS, 변경 파일 ESLint PASS, `git diff --check` PASS.

schema/migration/DB privilege/ledger/economic mutation 변경 없음. Production 승격은 required CI와 exact-SHA 증거를 계속 요구한다.
