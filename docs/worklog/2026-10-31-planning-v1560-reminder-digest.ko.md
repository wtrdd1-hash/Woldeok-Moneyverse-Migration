# v1560 기획 작업일지 — 보유 아이템 만료 알림 일일 통합 알림

## 작업 전 — 2026-10-31 16:10 KST
- 이전 기능 보완 v1558 → 현재 기능 추가 v1560 → 다음 기능 보완 v1562(잠정).
- 최신 main `1a3625f3c5e426c857e2b44a412d7949ac4a6257`, AGENTS.md·README.md·영문 기준 기획서·국문 대조 문서를 확인함. 선행 미병합 Draft #2157의 SHA `ced5ee5e0a8f58b58c8f183807b4e246974c05ba` 위에 작업함.
- miniPC에서 Superpowers using-superpowers·brainstorming·using-git-worktrees·writing-plans·verification-before-completion 확인. 스킬 커넥터는 URI를 반환하지 않음.
- 071·123 마이그레이션, 알림 Nest 서비스·검색, Next 인벤토리·Android 게이트웨이 확인. 기존 알림 설정·아이템별 제외·이력·미리보기는 미구현 Draft 의존성임. 알림 검색 링크 허용 목록에 /inventory가 없으며 apiOrNull 오류가 빈 보관함으로 표시될 수 있음.
- 신규 F675-196: 하루의 만료 알림 판단 결과를 회원별 앱 내 통합 알림으로 묶는 선택형 설계. 이메일·푸시·WLD·원장 변경 없음. 발송 증빙과 실제 알림함 기록을 분리해 검증.
- P0 운영·금융·DB 권한·QA는 HOLD. 외부 신규 검증 승인 0건, 누적 UNKNOWN/10,000건 BLOCKED/IN PROGRESS.
- [x] 시작 기록·기준 조사. [ ] 영문/국문 동등 명세. [ ] P0/P1. [ ] 문서 검증. [ ] GitHub 이슈/PR/CI. [ ] 완료 기록.

## 진행 중
- 설계·검증 진행 중. 런타임 및 DB 수정 금지.

## 완료
- 최종 검증 전. RELEASE HOLD.
