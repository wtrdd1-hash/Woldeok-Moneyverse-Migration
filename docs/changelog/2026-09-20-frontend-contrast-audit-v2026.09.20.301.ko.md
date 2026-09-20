# v2026.09.20.301 — 프론트엔드 색상·대비 감사

- 재구축 시각 시스템을 라이트/다크 semantic palette로 분리했습니다.
- 검증 대상 일반 텍스트 token 조합을 WCAG 2.2 AA 이상으로 올렸습니다.
- 홈·상점·작업·인벤토리·사업체·관리자 화면의 저대비 색상을 수정했습니다.
- 대비 회귀 테스트를 추가하고 사용자 point color도 primary control 가독성을 유지하도록 제한했습니다.
- SeeClick 10k 웹 subset, WebUI 41,970 웹 화면, RICO 66k+ 화면과 WCAG/GOV.UK/Atlassian/Material 지침을 레퍼런스 근거로 사용합니다.
- 전체 프론트엔드 재구축 게이트 완료 전 Production 승격은 계속 차단합니다.
