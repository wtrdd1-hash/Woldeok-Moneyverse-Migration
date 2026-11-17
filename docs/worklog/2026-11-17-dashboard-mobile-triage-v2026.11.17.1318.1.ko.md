# v2026.11.17.1318.1 — 모바일 대시보드 장애 정밀 기록 작업일지
## 작업 전 — 2026-11-17 약 13:18 KST
모바일 Chrome 회원 대시보드 스크린샷 접수. 업무를 장애 상세기록으로 한정하고 코드 수정/운영 승격은 포함하지 않음. AGENTS.md·문서정책·DOCS_INDEX·docs/planning/PROJECT_PLAN.md·통합기획 마스터와 관련 작업 이력 확인. @미니PC MCP로 실환경 개발 저장소 확인: 공용 main은 다른 작업의 미커밋 수정이 있고 원격보다 3개 커밋 뒤처져 있음. 기존 작업을 삭제/재설정하지 않음. 원격 main e96e8f81f4d6b99b221392a2b6fe46356361b145 확인. 초기 이슈 [#3242](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3242) 등록.

## 작업 중 — 코드·문서 대조
GitHub 최신 main의 frontend/src/app/dashboard/page.tsx, frontend/src/lib/api.ts, mobile-bottom-nav.tsx 대조. 관심/보유/알림 API null이 0으로 바뀌는 코드상 오류 가능성과 지갑 null의 ‘—’ 표시 분기를 직접 확인. 실제 운영 API 장애·회원 원장·실제 실행 SHA 미확인. 통합 기획과 현재 Spring 단일 런타임 기록 간 차이는 드리프트로 분리. 최신 origin/main e96e8f81f4d6b99b221392a2b6fe46356361b145를 새로 받아, 충돌 없는 전용 `docs/dashboard-mobile-incident-v2026.11.17.1318.1` 워크트리 생성.

## 종료 — 문서 기록 단계만
장애 보고/작업일지/변경이력/내부 및 GitHub 업데이트 내역의 영문·한국어 쌍 작성. **완료 검증:** 문서 경로·내용, 소스 코드 읽기 검사. **미실행:** 실제 인증 HTTP, 프로덕션 회원 데이터 조회, 원장 대사, 브라우저 E2E, 테스트·빌드, 공식 Test 및 운영 배포, DB/WLD 거래. 이슈 P1 **OPEN 유지**. [상세 장애 문서](../incidents/2026-11-17-dashboard-mobile-data-ux-inc-1318.ko.md) · [#3242](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3242).
