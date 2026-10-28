# 기획 v1430 — F675-163 캘린더 저장 목록 무결성 (2026-10-28 KST)

## 시작 전 — 23:06–23:09 KST
- 이전: 기능 추가 v1428; 현재: 기능 보완 v1430; 다음: 기능 추가 v1432(잠정).
- main 35971c600f25869c96f1c666d4b9f58927202730, 선행 Draft #1749 e65a654ddad4defaacb8bcd03bdfb4f5e7204f74. 별도 브랜치·워크트리이며 선행 PR 미병합.
- skills__list 비어 있음. miniPC에 설치된 using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion을 읽음. AGENTS.md, README.md, PROJECT_PLAN.md, PROJECT_PLAN.ko.md 대조.
- 실제 main: 캘린더 헬퍼는 유효한 시간만 확인하고 과거 마감은 걸러내지 않음. shop_catalog_list_v2는 shop_catalog.sale_ends_at을 반환하고 shop_inventory.starts_at/ends_at으로 노출을 제한함. 시즌 마감은 virtual_seasons.ends_at. 기존 테스트는 현재 시각 없이 과거 날짜를 사용함.
- QA v1350 FAILED, 데이터 디스크 98%, 과거 18,000 WLD 차이, DB 권한·마이그레이션·독립 복원·정확 SHA Test는 HOLD.
- 계획: 기존 영문 정본·국문 통합 문서에 실제 출처, 변경된 마감, 서버 시간, 동시성, 회귀·운영 차단 조건을 보완. 런타임/DB/Test/Production 변경 없음.

## 진행 중
- [x] 최신 main과 선행 미병합 PR 대조.
- [ ] 기존 통합 영문·국문 기획 반영.
- [ ] 백로그 10개, 영문·국문 대조, 문서 전용 변경 검사.
- [ ] Draft PR 및 GitHub 이슈 전달.


## 중간 점검 — 23:11 KST
- 최신 main 재조회 후 동일, v1428 선행 Draft #1749 미병합. 추가 문서 12개 영문 정본·국문 동등 내용 반영.
- 마감 출처 정정과 개정번호 기반 회원 재확인 명세. QA v1350 FAILED, 외부 신규 승인 0·누적 UNKNOWN / 10,000 BLOCKED / IN PROGRESS, 운영승격 HOLD.

## 완료
- 대기: 검증, SHA, PR 증거.
