# 작업 기록 — 신뢰 클라이언트 IP 재통합 v2026.09.13.2

## 선택한 런타임 작업
신뢰 프록시 모드에서 위조된 `X-Forwarded-For`가 감사 IP나 레이트리밋 식별값이 되지 않도록 기존 Trusted Client IP 보안 수정을 최신 기준선에 재통합합니다.

## 기준선과 중복 작업 확인
- 개발 직전 최신 main: `7f2e59b0faf627376f9dd8066be2bf0642e31981`.
- 사용한 최신 활성 런타임 기준선: Business Settlement 후보 `73756378915fe5d9bc74aeef4116664854436aa2`. 이 기준선은 최신 main과 CI에서 확인된 migration 번호 수정까지 보존합니다.
- 원본 기능: PR #165 / `7adfe534c0e123b54c497daf3e27dab1219f7dc7`.
- #165 기준점부터 현재 main까지 비교한 결과 7개 핵심 런타임 파일은 더 최신 main에서 수정되지 않아 선택적 이식이 최신 코드를 덮어쓰지 않습니다.
- 활성 PR #196, #195, #189를 확인했고 Trusted Client IP 파일과 직접 겹치지 않습니다.
- 개발 전과 중간에 Living Project Plan을 다시 읽고 보안, fail-closed Test, main force-push 금지 규칙을 유지했습니다.

## 런타임 변경
- `requestClientKey`가 Node `net.isIP`로 엣지/소켓 주소를 검증합니다.
- 신뢰 프록시 모드에서도 유효한 `CF-Connecting-IP`만 사용하며 `X-Forwarded-For`는 무시합니다.
- 비어 있거나 잘못된 엣지 메타데이터는 검증된 소켓 피어 또는 `unknown`으로 fail-closed 처리합니다.
- Next.js 내부 API 경로에서 `X-Forwarded-For` 전달을 제거합니다.
- 위조된 전달 체인, 잘못된 엣지 값, Cloudflare 우선순위를 레이트리밋/스로틀러 테스트로 검증합니다.

## 검증과 배포
- 브랜치: `integrate/trusted-client-ip-v2026.09.13.2`.
- 부모 런타임 후보: `73756378915fe5d9bc74aeef4116664854436aa2`.
- CI: PR 생성 및 head 고정 후 확인 예정.
- isolated Test exact-SHA: 아직 검증하지 않았습니다.
- Production: 변경하지 않았습니다.

## 다음 우선순위
CI/Test 처리 후 Admin edit-state #160을 최신 기준선에 재통합합니다. Economy Scenario Lab과 Event Calendar 후보는 exact-SHA Test 검증 가치가 남아 있어 보존합니다.
