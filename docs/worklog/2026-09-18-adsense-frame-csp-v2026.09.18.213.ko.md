# AdSense frame CSP 작업일지 — v2026.09.18.213

v212를 실제 Test edge에 연결한 뒤 기존 반응형/title/script-CSP 수정은 확인됐지만 local pre-edge 검사에서 나타나지 않았던 iframe CSP 위반 2건이 추가로 드러났습니다. 즉시 Production 승격을 중단하고 Google AdSense CSP 공식 지침을 재확인했으며 frame 전체를 넓히지 않는 최소 allowlist 수정으로 정했습니다.

이 기록 전 security-header 타깃 테스트와 frontend typecheck가 통과했습니다. 이후 전체 frontend 검증 → PR/CI → exact-main Test browser → Production canary/cutover 순으로 진행합니다.
