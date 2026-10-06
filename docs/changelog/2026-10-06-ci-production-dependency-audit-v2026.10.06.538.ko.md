# v2026.10.06.538 — CI 운영 의존성 감사 차단 수정

- root pnpm override에 `proxy-addr >=2.0.8`, `source-map-js >=1.2.2`를 추가했다.
- lockfile은 NestJS/Express 경로의 `proxy-addr 2.0.7`을 `2.0.8`로, Next/PostCSS 경로의 `source-map-js 1.2.1`을 `1.2.2`로 올린다.
- 필수 production audit 결과가 critical 1건 + high 1건에서 `No known vulnerabilities found`로 변경됐다.
- 애플리케이션 런타임 코드, DB 스키마/경제 권한, UI 동작은 변경하지 않는다.
- 관리자 모바일 수정 v537 검증 과정에서 발견된 릴리스 게이트 선행 수정이다.
