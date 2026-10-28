# v1420 — 회원 검토 대기 사진 제출 철회 기획(F675-161)

**상태: 작업 전 / DRAFT / RELEASE HOLD.** 2026-10-28 18:09 KST.

- [x] 최신 main의 AGENTS.md, README.md, PROJECT_PLAN.md 및 한국어 대조본, 관련 Superpowers 스킬 확인.
- [x] QA v1345 및 운영 차단 조건 확인; 갤러리 회원 제출 UI/API, Migration 098, 관리자 게시 Migration 127 확인.
- [ ] 영문·국문 통합 기획과 구체적인 API/DB/잠금/개인정보/롤백 백로그 완성.
- [ ] 작업 중 main/PR 재확인, 독립 근거 10,000건 게이트 기록.
- [ ] 영문·국문 대조, 문서 전용 변경, 원격 SHA 및 GitHub 인계 검증.

**기준:** main `35971c600f25869c96f1c666d4b9f58927202730`; QA v1345 FAILED/HOLD; 공식 Test 정확 SHA·독립 복원 미검증, 데이터 볼륨 97%, 과거 국고/원장 18,000 WLD 불일치. 이 기획에서는 Production/Test/DB/WLD 변경 금지.

**소스 사실:** `member_my_photo_submissions`는 최근 30건 및 게시 여부 불리언만 제공하며 회원 API에는 업로드/제출/내 목록만 있고 철회가 없다. Migration 098은 제출자 초안 미리보기를 허용하며 관리자 게시 함수는 같은 행을 변경할 수 있어 철회와 게시 승인 간 경합 차단이 필요하다. 신규 제안이며 배포 기능이 아니다.
