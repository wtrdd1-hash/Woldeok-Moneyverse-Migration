# v1420 — 회원 검토 대기 사진 제출 철회 기획(F675-161)

**상태: 기획 완료 / DRAFT / RELEASE HOLD.** 2026-10-28 18:09 KST.

- [x] 최신 main의 AGENTS.md, README.md, PROJECT_PLAN.md 및 한국어 대조본, 관련 Superpowers 스킬 확인.
- [x] QA v1345 및 운영 차단 조건 확인; 갤러리 회원 제출 UI/API, Migration 098, 관리자 게시 Migration 127 확인.
- [x] 영문·국문 통합 기획과 구체적인 API/DB/잠금/개인정보/롤백 백로그 완성.
- [x] 작업 중 main/PR 재확인, 독립 근거 10,000건 게이트 기록.
- [x] 영문·국문 대조, 문서 전용 변경, 원격 SHA 및 GitHub 인계 검증.

**기준:** main `35971c600f25869c96f1c666d4b9f58927202730`; QA v1345 FAILED/HOLD; 공식 Test 정확 SHA·독립 복원 미검증, 데이터 볼륨 97%, 과거 국고/원장 18,000 WLD 불일치. 이 기획에서는 Production/Test/DB/WLD 변경 금지.

**소스 사실:** `member_my_photo_submissions`는 최근 30건 및 게시 여부 불리언만 제공하며 회원 API에는 업로드/제출/내 목록만 있고 철회가 없다. Migration 098은 제출자 초안 미리보기를 허용하며 관리자 게시 함수는 같은 행을 변경할 수 있어 철회와 게시 승인 간 경합 차단이 필요하다. 신규 제안이며 배포 기능이 아니다.

**중간 점검(18:11 KST):** main `35971c600` 동일, 사진 철회 PR 없음, Android `/app-api/v1/photos/mine` 기존 계약 확인. 사진 행 잠금·관리자 승인 경합·비공개 미디어 접근 즉시 차단·감사 영수증을 통합 명세할 예정.

**완료 기록(18:17 KST):** [Draft PR #1727](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1727), [개발 이슈 #1726](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1726). 영문·국문 7쌍·백로그 10개·문서 전용 검사·`git diff --check` PASS, 원격 SHA `c52f03deb43105cd1cb46792c0e79fb60a690c3e` 확인(마지막 작업일지 커밋 전). main `35971c600` 시작·중간·완료 동일. PR release-input PASS, classify/verify 진행 중. 전체 런타임 CI/공식 Test/운영승격 미수행, 백업 복원·금융 차단 유지. 외부 발행처 3곳, 신규 승인 0, 누적 UNKNOWN/10,000. 런타임/DB/미디어/WLD/Test/Production 변경 없음.
