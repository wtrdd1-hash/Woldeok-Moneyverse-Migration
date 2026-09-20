# v2026.09.20.310 — main required-check release blocker

## English (canonical)

Development B selected REL-104-03 after the DR verifier landed on main. The connected main branch metadata still reports required-status-check enforcement `off` with no contexts/checks, so repository protection cannot currently be treated as a release gate.

This change adds a fail-closed verifier for main branch protection evidence and regression coverage in the repository test gate. Disabled enforcement and an empty required-check set are rejected; an enforced non-empty set is accepted.

This is executable control-plane code, not documentation-only completion. Repository administration still must enable the required checks before REL-104-03 can be considered fully closed.

## 한국어 (secondary)

DR 검증기 통합 이후 개발 B는 REL-104-03을 선택했습니다. 현재 main 메타데이터는 required status check enforcement가 `off`이고 필수 context/check가 비어 있으므로 이를 릴리스 게이트로 간주할 수 없습니다.

이번 변경은 해당 상태를 fail-closed로 판정하는 실행 코드와 회귀 테스트를 추가합니다. 실제 GitHub 저장소 설정에서 필수 체크 강제가 활성화되기 전까지 REL-104-03은 완전 완료로 처리하지 않습니다.
