# 기획 v1636 — 회원 만료 보유품 조회 (F675-215)

**상태:** 초안 / 운영 승격 보류. 이전 기능 보완 v1634 → 현재 기능 추가 v1636 → 다음 기능 보완 v1638. 미병합 기획 Draft #2428의 문서 전용 후속. 개발 인계 #2432.

**시작(2026-11-02 06:10 KST):** miniPC backend/frontend/bot/mcp/nginx/docker active, 개발 DB 연결. skills__list 빈 결과로 설치된 Superpowers using-superpowers·brainstorming·writing-plans·worktrees·verification 직접 읽음. main a8541927c3a351d980454c66e95a3356c47e0722. 공유 checkout의 기존 implementation_plan.md 수정은 건드리지 않고 v1634 HEAD 2137aef0cc687354a2446137cea08ccec90ee4e9에서 별도 worktree 생성. GitHub #2431 C, #2430 B, #2429 A, #2428 기획 중복 회피.

**중간(06:13 KST):** main 재조회 결과 동일. AGENTS.md, README.md, 영문·국문 기획, 123의 활성 보유품 필터, 071 단일 행, 104 만료 재설정, Nest GET, /inventory의 오류→빈 배열, Android 비공개 매처 확인. 운영 사고가 아니라 소스상 UX 공백이다. Test/Production 공개 SHA 모두 510dbe6bf4d5c2a8089fc06b480776053da7a2e3으로 main과 다르며 실제 실행 이미지·독립 복원 증거는 아니다. 영문 정본·국문·통합 문서에 P0 4/P1 6 반영, 이슈 #2432 작성.

**제안 범위:** 현재 DB에 남은 만료 행의 회원 전용 읽기. 구매 이력·복구·환불·장착이 아님. 페이지별 REPEATABLE READ는 요청 사이 MVCC 일관성을 보장하지 않는다. 소유자 결합 cursor·TTL·limit, 검증된 빈 목록/오류, Next·Android 비공개 헤더, 접근성, 관리자 집계, 기본 OFF, 정확 SHA Test·롤백 게이트. 기능 수용시험은 제안이며 실행되지 않았다.

**외부 레퍼런스:** 신규 독립 검증·중복 제거·분류 승인 0, 누적 UNKNOWN / 10,000, BLOCKED / IN PROGRESS.

**완료:** PR 및 최종 검증 댓글 참고. 런타임·DB·금융·Test·Production 변경 없음. RELEASE HOLD.
