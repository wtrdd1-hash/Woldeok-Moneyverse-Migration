# 기획 v1550 — F675-193 이력 리비전·알림함 보존·페이지 정합성
**상태:** 문서 기획 / DRAFT / RELEASE HOLD. **주기:** 기능 추가 v1548 → 기능 보완 v1550 → 기능 추가 v1552(잠정). **정본 main:** `761a55a094fb9dd383d213e817305e68c79fa23c`. **선행 Draft:** #2123. **개발 이슈:** #2122.

## 시작 (2026-10-31 11:02 KST)
- miniPC Debian 13.6, 주요 서비스 7개 활성, 개발 DB 연결(상태의 계정 moneyverse_migrator). skills__list URI가 없어 설치된 using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion 직접 읽음. 깨끗한 v1548 후속 별도 worktree 생성, 다른 개발자 브랜치 미변경.
- GitHub 커넥터로 PR/이슈/main 커밋 확인. 최신 main의 AGENTS.md, README.md, 영문 정본·국문 기획서 대조. 원격 main `761a55a094fb9dd383d213e817305e68c79fa23c`. 선행 기획은 main 미병합 Draft/HOLD.

## 중간: 확인 근거와 보완 설계
- 기존 알림 검색은 요청별 `BEGIN READ ONLY`, DB asOf, `(created_at,id)` 키셋 및 HMAC을 사용하지만 HTTP 요청 간 원본 리비전은 없다. 이는 미구현 F675-193의 실제 오류가 아닌 v1548 설계 위험의 근거다. 회원별 리비전·409 재조회·410 보존/TTL·원자적 영수증 증거·현재 알림함 CTA 재검증을 명세. 실제 운영 알림 이력 장애를 주장하지 않음.
- `in_app_notifications` CREATE TABLE은 테스트 fixture에서 확인했지만 번호형 마이그레이션에는 없어 실제 클린 스키마/ACL 미검증. 중간 main SHA 및 정본 기획 재확인. QA v1410: 백엔드 2,778 PASS/501 SKIP, 프론트 2,770 PASS, lint/typecheck/build PASS, 격리 PG17 311/311; 개발 체크섬 5건 불일치, 전체 감사 FAIL, 공개 Test 정확 SHA 게이트 FAIL, Test FX 500. Test `c2129625...`, Production `95485a...`, main `761a55a...` 불일치. 독립 복원 미검증, 신규 수용시험 미실행.

## 개발 인계·배포
- P0 OPS1550-01 SEC1550-02 FIN1550-03 REL1550-04, P1 HISTORY1550-05~10 영문·국문 통합 명세. 개발 A 지갑/갤러리, B 운영 출처, C 파생상품, QA 런타임과 수정 중복 회피. 별도 개발 브랜치·정확 SHA 격리 Test·배포 승인 전까지 기능 OFF.
- 외부 독립 근거 신규 승인 0, 누적 검증·중복 제거·분류 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 코드/SQL/DB/WLD/원장/Test/Production/main 변경 없음. 최종 커밋·PR·CI는 별도 검증 후 기록.

## GitHub handoff / GitHub 인계
Draft PR #2128 OPEN/HOLD stacked on #2123, engineering issue #2122 updated with P0/P1; final exact-SHA CI status to be recorded outside this commit. No merge/deploy.
