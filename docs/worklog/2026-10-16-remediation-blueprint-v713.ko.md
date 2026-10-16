# v2026.10.16.713 — 문제 수정 기획 사전·중간·종료 기록

[영문 정본](2026-10-16-remediation-blueprint-v713.md). **기획 문서만 생성, 코드/DB/운영 미변경.**

### 시작
- 요청은 v711에서 확인한 금융·보안·SEO·Android·Discord·기능 문제의 아주 자세한 해결 계획 수립임. 실제 데이터 변경 승인으로 취급하지 않음.
- 미니PC MCP 통해 원격 main `be0335f3be288198eef8b1cab7f763a7db63c0bc` 확인, 실제 운영 v697 `a5a1e9da6fc55ac71c44c4cf6ee138e9442f4e73`와 구분. v711 감사 PR #878 미병합, v710 블로그 코드 수십 파일 수정 중, v712 기획·v701 보안 병렬 작업 독립.
- 전용 `docs/remediation-blueprint-v2026.10.16.713` 작업트리 생성, 외부 작업 전 기록 `/srv/moneyverse-tasks/remediation-planning-v713/WORKLOG.md` 작성.
- AGENTS/문서 정책·색인·통합기획·현재 PROJECT_PLAN, 기존 v523/v542/543 재무·v530 UI, v697/v701 운영·v711 감사 및 Superpowers 계획·worktree/테스트 검증 절차 확인.
- PostgreSQL 17 보안함수·기본권한·락, OWASP API, Google 국가별 hreflang·리뷰 스니펫, Next.js 최신 메타데이터, GitHub 배포 공식 참고 검색.

### 중간
- 직접 소스 조사: PvP가 트랜잭션/잠금/안전 난수를 갖추었으나 direct balance UPDATE; 국고 대사 정상/0 하드코딩; 은행 가짜 신용 입력; SQL 269/271 및 v697 잡 이중 서비스.
- 국채·연금·FX·SWF·마켓플레이스·암시장·주식리그 추가 직접 금액 수정 후보를 재고표에 포함. 단순 소스 존재와 실제 운영 활성 여부 구별.
- DB 읽기 전용 재검증: 개발 public 241중 앱 UPDATE 허용237. 계좌/원장·금고/PvP·리그 직접 쓰기 허용. 실 스키마 NUMERIC, 원장 요청 hash·역거래 참조 존재. v701로 공개함수 실행0 유지.
- 중간 main 재조회 변화 없음 `be0335f3`, 동시 v710 코드에 미접촉.
- 영한 종합 기획·금융 상세 설계·26개 구현 체크리스트(총 6파일/827줄) 작성 및 상대 경로 링크 점검 성공.

### 완료 확인
- [x] 최신 main·동시 작업 충돌 다시 확인
- [x] 내부/깃허브 변경내역, 버전별 문서, 종료 기록 및 GitHub PR 보존
- [x] 계획 산출과 실제 시행/운영 승격이 구분된 상태 유지

### Final evidence / 종료 증거
- Planning-only PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/881
- Initial planning commit: 26f29e52a6406b9fbf7fb2eb408616bea220da29
- Documents: 3 bilingual detailed plans, catalog EN/KO and 4 EN/KO worklog/change-note pairs. Checked 26 tasks in each language, 0 broken relative Markdown links, 0 changes under backend/frontend/packages/bot/ops.
- PR remains unmerged and pending checks; no code modification, financial settlement, Production release or newly verified member feature.
