# 개발 A — 공개 서비스 상태 확인 필요 필터 (2026-11-01 05:25 KST)

영문 정본: `2026-11-01-a0525-public-status-attention.md`.

- 작업 전: main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 원격 브랜치 39개, 열린 PR 37개. 다른 작업 변경은 보존.
- 작업 중: 공개 상태의 `attentionOnly=1` 필터를 Nest·Next·Android API에 구현. 오래된 정상 관측은 `unknown`으로 정규화한 뒤 필터링. 전체 상태 요약은 필터 적용 전 자료로 유지.
- 테스트: 신규 테스트 RED 확인 후 GREEN(Backend 2, Frontend 4), 전체 타입 검사 PASS, Lint 오류 0/기존 경고 1,022. 개발 PostgreSQL 읽기 전용 3행, 앱 역할 EXECUTE 확인, ROLLBACK.
- 남은 검증: 전체 테스트/빌드/CI/공식 Test 인증 E2E/운영 GitOps 및 롤백. 운영 배포 보류.
