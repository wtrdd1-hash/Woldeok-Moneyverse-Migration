# v2026.09.14.1 — 모바일 OAuth 브라우저 핸드오프

- Google/Discord 모바일 OAuth 완료 뒤 HTTPS 302로 커스텀 스킴에 바로 넘기던 불안정한 흐름을, 캐시되지 않는 최소 완료 문서 방식으로 변경했습니다.
- 완료 문서는 브라우저에서 즉시 `woldeok-moneyverse://oauth/callback?...` 이동을 시도하고, 외부 앱 실행에 사용자 동작이 필요한 브라우저를 위해 “월덕 머니버스 앱 열기” 링크도 제공합니다.
- 1회용 handoff code의 서버 생성·5분/단일 사용 의미는 유지하며, 호출자가 임의 return URI를 지정할 수 없게 유지합니다.
- 생성된 딥링크에는 `no-store`, `noindex`, 제한적 CSP, HTML/스크립트 이스케이프를 적용했습니다.
- 기본 딥링크와 서버 고정 return URI에 대한 회귀 테스트를 추가했습니다.
- 릴리스 전 검증: 프론트엔드 typecheck 통과, 프론트엔드 56개 파일 / 548개 테스트 통과. Production 승격 전 test exact-SHA와 백엔드/DB smoke는 계속 필수입니다.