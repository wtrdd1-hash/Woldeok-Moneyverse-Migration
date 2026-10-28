# 기획 v1438 — 금융 용어사전 정정 제안 출처·공개 무결성
## v1438 — 금융 용어사전 정정 제안 출처·공개 무결성 (2026-10-29 KST, 초안 / 승격 보류)
- 이전 추가 v1436 / 현재 보완 v1438 / 다음 추가 v1440(잠정). main 35971c600f25869c96f1c666d4b9f58927202730, 선행 Draft #1770, QA v1354 FAILED. 프론트엔드 전용 GLOSSARY_TERMS와 ISR 86400초에 맞춘 결정적 다국어 manifest 및 실제 공개 빌드 SHA 결합을 요구한다. 확인된 구버전 클라이언트는 409, 공개물·레지스트리 불일치는 503. 편집 승인 ACCEPTED_FOR_EDIT와 독립 배포 확인 PUBLISHED_VERIFIED를 구분하고 회원 요청 해시·불변 영수증·관리자 공개 감사를 명세한다.
- P0/P1: ENV1438-01 FIN1438-02 SEC1438-03 REL1438-04 GLOS1438-05 GLOS1438-06 GLOS1438-07 GLOS1438-08 GLOS1438-09 GLOS1438-10. 루트 96%(약 4.0GiB), 데이터 98%(약 4.3GiB); 과거 18,000 WLD 차이, 앱 쓰기 권한 235개, PUBLIC 은행 함수 3개, 체크섬 불일치 5건, 미적용 20건. 독립 복원·정확 SHA 공식 Test 미검증, 실제 PostgreSQL/ISR 혼합 회귀시험 미실행. 외부 신규 검증 승인 0건, 누적 UNKNOWN/10,000 BLOCKED / IN PROGRESS. 문서만 변경, 런타임·DB·금융·Test·운영 변경 없음. 이슈 #1769.

## Start / 시작
- [x] miniPC Debian 13.6, main, latest QA, previous Draft and system capacity checked.
- [x] Installed Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion read; skills__list empty, skills__read BLOCKED.
- [x] Isolated branch/worktree from predecessor Draft #1770; other workers untouched.
- [x] Read main AGENTS.md, README, canonical English PROJECT_PLAN and Korean counterpart.

## Mid / 중간
- [x] Main and EN/KO plan rechecked; actual frontend glossary source and ISR confirmed.
- [x] Integrated EN/KO spec, feature review, project plan, update logs and worklog.
- [ ] Update GitHub issue and open Draft PR; verify remote SHA.
- [ ] Run diff, docs-only classifier and GitHub CI.

## Evidence / 근거
- Backlog: ENV1438-01 FIN1438-02 SEC1438-03 REL1438-04 GLOS1438-05 GLOS1438-06 GLOS1438-07 GLOS1438-08 GLOS1438-09 GLOS1438-10
- QA v1354 FAILED, 18,000 WLD historical difference, app writable tables 235, PUBLIC bank EXECUTE 3, 5 mismatched and 20 unapplied migrations. Root 96%, data 98%.
- External independent accepted new 0, cumulative deduplicated verified UNKNOWN/10,000, BLOCKED / IN PROGRESS.
- Real isolated PostgreSQL acceptance, official Test exact SHA, independent backup restore and Production promotion NOT VERIFIED.
- No runtime, DB, WLD, ledger, Test or Production changes. DRAFT / RELEASE HOLD.

## Completion / 완료
PENDING remote and CI verification.
