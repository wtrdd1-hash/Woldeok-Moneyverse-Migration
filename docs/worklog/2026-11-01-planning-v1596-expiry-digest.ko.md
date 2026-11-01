# 기획 v1596 — F675-205 회원 보관함 만료 예정 일일 요약 알림 (2026-11-01)
- [x] 시작: miniPC Debian 13.6 서비스 7개 활성, 개발 PostgreSQL 연결. 설치된 Superpowers using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification 확인. skills__list URI 0개로 skills__read BLOCKED, 로컬 설치 파일로 대체.
- [x] 근거: origin/main f13bbce273ffc65e8576170992d82ea00c27a1c9, AGENTS.md, README.md, 영어 원본·한국어 기획서, 이전 Draft #2290, 개발 A/B/C PR, QA v1433 이슈 #2292, SQL 071/123, Nest 알림·상점, Next 보관함·알림 설정, app-api 게이트웨이.
- [x] 중간: main과 기준 기획서 재조회; 미병합 유효 기획을 독립 작업트리로 승계. 기존 알림함과 PRODUCT_ACTIVITY 카테고리는 확인했으나 번호가 붙은 마이그레이션에서 in_app_notifications CREATE TABLE을 찾지 못함. 스키마 일치 검증 전까지 차단.
- [x] 설계: 회원 동의 기반 KST 일일 만료 요약, 설정, 제한된 알림 생성, 중복 방지 영수증, 권한·개인정보·모바일·접근성·관리자 KPI, P0 4건·P1 6건.
- [x] 검증: 로컬 릴리스 140/140, 분류 24/24 통과. 원격 최종 SHA CI는 별도 확인 필요. 영문·국문 동등성, 릴리스 분류, Git diff, 최종 SHA CI.
- [x] 완료: GitHub Draft PR #2297·이슈 #2296·기록. main 병합, 런타임·DB·WLD·아이템·Test·Production 변경 없음. 최종 SHA 원격 CI는 별도 확인 후 PR·이슈·miniPC FINISH에 기록.
- **주기:** 이전 보완 v1594 / 현재 추가 v1596 / 다음 보완 v1598(잠정). **상태:** DRAFT / RELEASE HOLD. 외부 신규 승인 0건, 누적 UNKNOWN / 10,000 BLOCKED / IN PROGRESS.

- GitHub 개발 인계: #2296; 문서 전용 독립 브랜치이며 신규 기능 수용시험은 미실행.
- Draft PR #2297 OPEN/HOLD. 초기 병렬 릴리스 시험은 miniPC cgroup 스레드 부족; 순차 재시험 140/140 PASS.
