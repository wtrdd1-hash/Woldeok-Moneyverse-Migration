# Runtime identity 릴리스 게이트 — v2026.09.22.336

## 범위
QA-335-01에서 Production 빌드 게이트가 backend `/api/version`만 검증하고 frontend가 같은 exact application SHA인지 증명하지 않는 릴리스 통제 공백이 확인됐습니다. fail-closed runtime identity 검증기를 추가하고 Production artifact 생성 전 isolated-Test gate에 연결했습니다.

## 검증
- 정상 identity와 frontend/backend split-release 실패를 실행 가능한 회귀 테스트로 검증합니다.
- 검증기 실행 전 attested repository head를 checkout합니다.
- `git diff --check`.
