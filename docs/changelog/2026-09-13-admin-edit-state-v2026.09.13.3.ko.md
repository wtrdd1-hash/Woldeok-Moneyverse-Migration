# v2026.09.13.3 — 관리자 편집 상태 새로고침 안전성 재통합

- 유효한 관리자 편집 상태 보호 변경을 가장 최신의 조정된 런타임 기준선에 재통합했습니다.
- 기준선: Trusted Client IP 후보 `90764db11805a0146fbd283a17e8cac67b160496`. 이 후보는 Business Settlement #196과 최신 `main` 위에 쌓여 있습니다.
- 관리자 시장 및 AI 뉴스 편집 화면에서 자동 route refresh/polling을 제거했습니다.
- 상점 저장 후 `router.refresh()` 대신 로컬 React 상태를 갱신해 검색어와 편집 문맥을 유지합니다.
- 보호 대상 관리자 편집 파일에 `LiveRefresh`, `router.refresh(`, `setInterval(`이 다시 들어오는 것을 막는 회귀 테스트를 추가했습니다.
- DB 및 백엔드 mutation 계약은 변경하지 않습니다.
- CI와 isolated Test exact-SHA 검증 전에는 Production으로 승격하지 않습니다.
