# 개발 A2153 작업 기록 — 가상주식 알림 조건 검색

- **시작:** 2026-10-31 21:53 KST, Debian 13.6 미니PC 서비스 확인, 기준 main `5bccda44...`. 비-main 136개(선조 11·고유/분기 125), PR 116개(충돌 8). AGENTS/README/영문 정본·국문 통합기획서/QA 확인. A #2205, B #2207, C #2202 변경 보호.
- **V1:** 로그인 회원의 가상주식 알림 전체/조건 충족/감시 중 검색을 Nest·기존 소유자 DB 함수·Next 웹·Android app-api에 구현. 파라미터화 SQL, 접근성 라벨, 딥링크 유지, 캐시 금지/noindex. 신규 migration·원장/가격 쓰기 없음.
- **V2:** 필터가 무시된 빈 200 응답을 막기 위해 `filterApplied` 마커 검증, 백엔드 알 수 없는 쿼리 400, OpenAPI enum 문서화. RED Backend 2·Frontend 2 실패 → GREEN Backend 11·Frontend 6 통과.
- **격리 DB:** PostgreSQL 17.11에 SQL 312개 적용, 회원별 전체 2/충족 1/감시 1, 타 회원 격리, 앱 직접 SELECT/DELETE 거부. ROLLBACK 후 합성 데이터·원장 거래 0. 컨테이너 종료.
- **검증:** 최초 기존 테스트 인자 기대값과 EAGAIN 빌드 실패 수정. V1 SHA `0c94655...` 전체 lint/typecheck/test/build/security PASS, Backend 2,790 PASS/501 SKIP, Frontend 2,782 PASS. V2 최종 SHA 전체 게이트는 재검증 필요.
- **안전:** main 재확인, 통합 PR #2206 및 삭제된 Production v1515 프로세스 경로 문제 기록. 외부 정리로 고유 C 브랜치 2개가 삭제되어 별도 로컬 bundle 보존, 이슈 #1968 기록. A에서 원격 브랜치 삭제·복구·main 병합 없음.
- **운영:** PR #2210 Draft, 공식 Test 정확 SHA 인증 E2E·독립 백업 복원·P0 권한/운영 문제 미해결로 Production HOLD. 운영 DB·서비스·배포·롤백 변경 없음. 복구는 PR revert로 가능.
