# 기획 v1604 — 회원 만료 알림 조회 기간 설정 (한국어)

**상태: 완료(문서만) — 2026-11-01 14:11 KST**

- 이전: 기능 보완 v1602. 현재: 기능 추가 v1604. 다음: 기능 보완 v1606(잠정).
- 기준 main: `143190d3811a1a419bfdfb2bab968e34fee447df`; 이전 미병합 기획 Draft #2315; 런타임 배포 없음.
- 조사: AGENTS.md, README.md, 영문 원본 PROJECT_PLAN.md, 한국어 대조 문서, 알림 설정 화면, Nest 인증 가드, 보관함 스키마, Android 게이트웨이, QA Draft #2326 및 열린 P0/P1 이슈.
- F675-207 제안: 회원이 만료 알림 조회 기간을 24시간 또는 72시간으로 선택; 기본 72시간; 알림 자동 동의 금지; F675-205 예약 작업 및 F675-206 미리보기와 일치.
- 확인표: [x] 소스·스킬 확인; [x] main/PR/QA 확인; [x] 영문·국문 통합 문서와 로그 갱신; [x] main 재조회; [x] 문서 검증; [x] 커밋·푸시·Draft PR·개발 이관; [x] 최종 점검.
- 외부 독립 근거: 이번 신규 검증 0건, 누적 UNKNOWN / 10,000건; BLOCKED / IN PROGRESS.

## 중간 점검
- main이 국고 v1607 병합 후 `95877554097b595d8dcfa28b60ecb65e50bf0c2d`로 변경되어 격리 브랜치를 최신 main 기준으로 재설정하고 국고·QA 디스크 파일을 보존함.
- GitHub 개발 이관 이슈: #2327. P0 4건/P1 6건, 모두 DRAFT/HOLD.
- 새 문서 검증: 영문·국문 4쌍 PASS, 릴리스 정책 140/140 PASS, 분류·보류 26/26 PASS, git diff --check PASS. 실제 기능 수용시험은 아님.

## 완료 / 검증
- Draft PR **#2328** OPEN/HOLD, 개발 이슈 **#2327** OPEN; 문서 전용 첫 커밋 `80c993ddc13af557c5040ccf0ce2c227b32d816c`. 최종 main 재조회 `95877554097b595d8dcfa28b60ecb65e50bf0c2d`.
- 릴리스 정책 **140/140 PASS**, 분류·보류 **26/26 PASS**, 영문·국문 4쌍 및 `git diff --check` PASS. PostgreSQL17/Nest/Next/Android 실제 기능 시험·공식 Test 정확 SHA·운영 배포는 미실행.
- 공개 Test 버전 `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`로 최신 main과 불일치. miniPC moneyverse-mcp TasksCurrent/Max **780/1027**(1회 관측).
- P0/P1은 개발 제안이며 RELEASE HOLD·기능 OFF 유지. WLD·원장·보관함·DB·런타임·Test·Production 변경 없음. 외부 근거 신규 승인 0건, 누적 UNKNOWN/10,000건, BLOCKED/IN PROGRESS.
