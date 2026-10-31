# 개발 A 상점 재고 필터 — 배포 보류

- 후보 브랜치 `auto/hourly-a-20261101-0425-stock-availability`, 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`. 최종 SHA·CI 상태는 PR #2254 기록 참고.
- 로컬 전체 테스트·빌드·타입검사·Lint·보안 감사 통과, 실제 PostgreSQL 읽기 검증 통과. 공식 Test 정확 SHA 로그인 E2E와 독립 백업 복원 미수행.
- P0 차단: 개발 DB 앱 역할의 `shop_catalog` 및 `account_balances` 직접 UPDATE 권한, 운영 DB 미검증, Production Backend SHA와 Frontend 시간형 빌드 ID 불일치, Test 후보 SHA 불일치.
- 결론: main 병합·Test/Production 배포·DB 쓰기·서비스 재시작·롤백 모두 금지. 다른 개발자의 브랜치·PR 보존. 정확한 통합 main SHA에서 모든 게이트 충족 후에만 승격.
