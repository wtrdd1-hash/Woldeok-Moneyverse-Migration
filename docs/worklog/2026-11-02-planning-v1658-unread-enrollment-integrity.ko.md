# 기획 v1658 — F675-220 읽음 추적 등록 및 재시도 무결성

- 상태: 진행 중 / 문서 전용 / 초안 / 운영 보류.
- 이전: 기능 추가 v1656; 현재: 기능 보완 v1658; 다음: 기능 추가 v1660(잠정).
- 근거: 최신 origin/main, AGENTS.md, README.md, 영문 정본/국문 대조 기획서, 마이그레이션 196, Nest 문의 API/저장소, /support, QA v1466, 선행 초안 #2489, 개발 이슈 #2488.
- [x] using-superpowers, brainstorming(문서 기획), using-git-worktrees, verification-before-completion 읽음.
- [x] miniPC 및 GitHub PR/이슈 확인, 런타임 쓰기 없음.
- [ ] 문의별 등록 기준선 및 기능 스위치/대상자 전환 경합 명세.
- [ ] 메시지 삭제 후 중복 답변 재시도 및 개인정보 삭제 경계 명세.
- [ ] 영문/국문 통합 기획·로그 갱신, 중간 main 재확인, 검증.
- [ ] 브랜치 push, GitHub 개발 인계, Draft PR, 최종 CI 및 완료 기록.
- 안전: 병합·배포·금융/DB 수정·신규 기능 수용시험 통과 주장 금지.

## 진행 중 체크포인트
- 마이그레이션 196의 메시지 멱등키는 메시지 삭제 시 사라지고 users FK에 ON DELETE CASCADE가 없으며 v1656에는 회원별 추적 등록 기준선이 없다. 실제 사고가 아닌 소스 기반 위험이다.
- 본인 문의 등록 POST·직렬화 기준선/epoch·F675-217 공유 답변 삭제 표식·개인정보 삭제 FK 차단·P0 4건/P1 6건 명세.
- QA v1466 FAILED/P0 확인, 중간 main·선행 기획 브랜치 재조회 후 동일함. 영문/국문 통합 문서 6개 수정, 검증 대기. 런타임/DB/Test/Production 변경 없음.
