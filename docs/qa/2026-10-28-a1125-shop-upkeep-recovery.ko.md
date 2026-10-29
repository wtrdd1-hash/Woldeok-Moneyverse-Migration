# QA A1125 — 상점 관리비 확인 기능 복구 (HOLD)

- 신규 브랜치 `auto/hourly-a-shop-upkeep-recovery-20261028-1125`, 기준 main `a28bed9aa40ff74d492824ae12892a7d52132fdd`. 최종 SHA와 게이트 종료코드는 서버 증거 및 PR에 기록한다.
- 구현 전 RED: Backend 2개 테스트 스위트, Frontend 1개 스위트가 미구현 모듈로 실패. 구현 후 GREEN: Backend 5/5, Frontend 29/29(모바일 게이트웨이 포함).
- 전체 Backend 1,932 PASS / 440 SKIP, Frontend 1,868 PASS / 1 FAIL(기존 main의 블로그 관리자 UI/테스트 불일치), DB 45 PASS / 3 SKIP. API 계약 180개 PASS, Typecheck PASS, Lint 오류 0건 PASS, Build PASS. Bot은 초기 의존성 누락으로 실패했으나 격리 설치 후 11 PASS.
- 전체 `pnpm test`는 140초 제한으로 중단되어 **PASS 아님**. 포트 미공개 격리 PostgreSQL 17.11의 합성 스키마에서 123번 조회 함수의 회원별 조회·만료 제외·큰 정수 정밀도·직접 테이블 접근 차단 확인. 운영 스키마/계정 검증은 아님.
- 접근성/SEO 정적 점검: 포커스 링, 현재 선택 표시, 44px 터치 대상, 회원 화면 noindex/force-dynamic, 비캐시 응답. 실제 인증 브라우저 E2E·접근성·SEO 및 전체 보안/백업 복원은 BLOCKED.
- P0 사고 #1663 복구 참조 352개 보존. 모든 최종 SHA 게이트, 실제 DB 최소 권한, 독립 백업 복원 및 GitOps 조건 충족 전 main 병합·Test/Production 배포 금지.
