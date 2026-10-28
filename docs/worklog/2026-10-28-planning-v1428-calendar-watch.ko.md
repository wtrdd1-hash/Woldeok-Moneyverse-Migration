# v1428 — 회원 이벤트 캘린더 나중에 보기 기획 (2026-10-28)

- **시작 22:12 KST** — 이전 기능 보완 v1426 → 현재 기능 추가 v1428 → 다음 기능 보완 v1430(잠정). 기준 main `35971c600f25869c96f1c666d4b9f58927202730`. AGENTS.md, README.md, 영문·국문 프로젝트 계획과 통합 기획 확인. Superpowers 커넥터 목록이 비어 `skills__read` 경로 BLOCKED; miniPC에 설치된 using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion 읽음. main 기반 독립 worktree/브랜치 생성. 런타임 미변경.
- **실제 근거** — `/calendar`는 시즌 이벤트·오늘의 사건·주간 목표·상점 판매 종료를 보여주지만 회원별 저장/해제 기능이 없음. 시즌 이벤트 UUID와 종료 시각, 상점 카탈로그 UUID와 판매 종료 시각은 코드/마이그레이션에서 확인. 오늘의 사건·주간 목표는 안정적인 이벤트 식별자가 부족해 1차 저장 대상에서 제외.
- **기획** — F675-163 회원 전용 이벤트 저장 목록. 이메일·푸시 자동 발송, 자동 참가, WLD 이동, 구매, 보상 없음. 본인 소유권, 실제 일정, 만료·비공개 상태, 멱등 영수증, 모바일 동등성, 접근성, 관리자 집계, 회귀·롤백 명세.
- **P0** — 디스크·백업·복원, 18,000 WLD 원장 차이, DB 최소권한·비공개 이벤트, 정확 SHA Test·운영승격. **P1** — 스키마·조회, 경합·영수증, API, UI·접근성, 관리자·개인정보·KPI, PostgreSQL 회귀.
- **중간 22:13 KST** — main SHA 불변, QA v1349 FAILED·v1350 진행 중, 데이터 디스크 98%, 열린 PR 67개 확인. 시즌/상점 실제 SQL/화면을 근거로 EN/KO 통합 명세 작성. 개발 이슈 #1748, Draft PR #1749 생성.
- **완료 22:17 KST** — 영문·국문 7쌍, P0/P1 식별자 10개, 변경 경로 14개 모두 문서, git diff --check PASS; 릴리스 분류 시험 17 PASS / 0 FAIL. Draft PR #1749 OPEN, 이슈 #1748 OPEN. 중간 커밋 GitHub classify/policy/release-input/verify-classify PASS, runtime SKIPPED, verify/policy PENDING; 최종 커밋 CI 별도 확인 필요. main 불변. QA v1349 FAILED, v1350 진행 중. 공식 Test 정확 SHA·독립 복원·Production BLOCKED. 런타임·DB·원장·WLD·Test·Production 변경 없음.

**외부 근거:** 독립·중복제거·분류된 10,000건 필수. 신규 승인 0건, 누적 검증 수량 UNKNOWN/10,000, BLOCKED / IN PROGRESS. 검토한 발행처를 승인 레퍼런스로 계산하지 않음.

**배포:** 문서 전용 초안 / RELEASE HOLD. Test·Production·런타임·DB·WLD·원장 변경 없음.
