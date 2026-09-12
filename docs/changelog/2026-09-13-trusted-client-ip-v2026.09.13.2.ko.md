# v2026.09.13.2 — 신뢰 클라이언트 IP 보안 재통합

- 검증된 Trusted Client IP 보안 수정을 가장 최신의 조정된 런타임 기준선 위에 재통합했습니다.
- 기준선은 최신 `main` `7f2e59b0faf627376f9dd8066be2bf0642e31981`과 활성 Business Settlement 후보 `73756378915fe5d9bc74aeef4116664854436aa2`이며, 확인된 migration 번호 수정도 함께 보존합니다.
- 백엔드는 신뢰 프록시 모드에서 문법적으로 유효하고 엣지가 덮어쓴 `CF-Connecting-IP`만 사용자 식별 IP로 사용하며 `X-Forwarded-For`는 사용하지 않습니다.
- 신뢰 엣지 IP가 없거나 형식이 잘못되면 유효성 검증된 소켓 피어로 fail-closed 처리하고, 그것도 유효하지 않으면 `unknown`을 사용합니다.
- 프론트 서버/API 프록시 경로는 `X-Forwarded-For`를 백엔드로 전달하지 않습니다.
- 레이트리밋/스로틀러 보안 회귀 테스트를 유지합니다.
- 이 보안 변경 자체는 DB 스키마나 저장 데이터를 변경하지 않습니다.
- CI와 isolated Test exact-SHA에서 실제 프록시 동작을 확인하기 전에는 Production으로 승격하지 않습니다.
