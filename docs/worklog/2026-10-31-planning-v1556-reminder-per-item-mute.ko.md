# 기획 v1556 — F675-195 회원 보유 아이템별 만료 알림 제외
**2026-10-31 | 기능 추가 | DRAFT / RELEASE HOLD**
**주기:** 이전 기능 보완 v1554 → 현재 기능 추가 v1556 → 다음 기능 보완 v1558(잠정).
**기준:** origin/main `761a55a094fb9dd383d213e817305e68c79fa23c`, AGENTS.md·README.md·영문 PROJECT_PLAN.md 및 한국어 대조본. 미병합 Draft #2141 위에 독립 브랜치 구성, 개발 이슈 #2148.

## 시작 전
- [x] Superpowers using-superpowers·brainstorming·worktrees·writing-plans·verification 확인. skills__list가 빈 목록이므로 skills__read URI를 확보할 수 없어 설치된 저장소 스킬을 직접 읽음.
- [x] miniPC Debian13 서비스, 마이그레이션 071, 프론트 보관함, GitHub main·PR 조사 및 격리 작업 폴더 확보.
- [x] P0 #2144 운영 백엔드·프론트·매니페스트 SHA 불일치 확인. 기획 작업에서는 운영 수정 금지.

## 진행 중
- [ ] 기존 영문·국문 통합문서에 기능 명세, P0/P1 개발 인계, 테스트·롤백 조건 통합.
- [ ] 작업 중 main·PR·QA 재확인, 내부·GitHub 업데이트 기록 및 영문·국문 대조.

## 완료(검증 대기)
- [ ] 문서 동등성·diff·주기·우선순위·최종 SHA CI 확인, 구현 완료로 오인되지 않도록 결과 명시.
- [ ] 런타임·DB·원장·WLD·공식 Test·Production·main 변경 없음.

**외부 독립 근거 게이트:** 신규 검증 0건, 누적 검증·중복제거·분류 UNKNOWN/10,000건, BLOCKED / IN PROGRESS.
