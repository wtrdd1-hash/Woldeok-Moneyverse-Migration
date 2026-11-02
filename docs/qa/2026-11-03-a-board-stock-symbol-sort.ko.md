# 개발 A QA — 최근 게시판 종목 기호순 정렬

**일시:** 2026-11-03 KST. **판정:** FAIL / 배포 보류. **기준 main:** `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. **코드 SHA:** `5abe3792d80e5f11db4dc80cc0f0d15355a3cbea`.

최신 공개 게시글 50건 안에서 종목 기호 오름차순(미연결 글 마지막, UUID 동률 기준) 정렬을 추가했습니다. 기존 SECURITY DEFINER 조회 함수만 사용하며 DB 마이그레이션·금융·아이템 쓰기·권한 확대는 없습니다. 웹은 정렬 선택/검색 결과 noindex 및 결과 검증, Android app-api는 `sortApplied=stock`과 정렬 순서/UUID를 검증하지 못하면 HTTP 503으로 차단합니다.

**검증:** TDD RED 확인, Backend 대상 18 PASS, Frontend 대상 12 PASS, Android 추가 3 PASS. 계약 184개 엔드포인트 생성물 동기화 PASS, 계약 테스트 41 PASS, DB 단위 72 PASS/5 SKIP, 정적 34 PASS. Backend 전체 2,986 PASS/2 FAIL/518 SKIP(기존 프로필 인증 200→401, #2265). Frontend 전체 2,951 PASS(`NODE_ENV=test`, 2 workers). 첫 실행 시간초과, 잘못된 NODE_ENV 실행 실패는 PASS에 포함하지 않습니다. Lint 오류 0/경고 1,027, Backend/Frontend 빌드 PASS. 운영 의존성 감사 0건, 전체 의존성 감사 취약점 9건 FAIL.

개발 PostgreSQL 실제 공개 글 1건/종목 연결 글 0건; 합성 SQL 정렬 PASS, 실제 다중 글 검증은 미완료. 개발 DB `moneyverse_app`의 잔액 UPDATE·아이템 DELETE 직접 권한 허용(P0). 공식 Test/Production SHA는 후보와 불일치하며 인증 E2E·독립 복원·GitOps 승격 미완료입니다.

브랜치 감사: 원격 비-main 303개(미병합 285, main 조상 18), 열린 PR 273개(충돌 29), 삭제 0. PR #2554/#2526/#2494/#2448과 가상 병합 충돌. 다른 개발자의 고유 변경 보호. **main 병합·Test/Production 배포·운영 DB 변경·롤백 모두 미실행.** 증거: `/srv/moneyverse-data/tasks/mv-a-20261103-0129-board-symbol-sort/evidence/`.
