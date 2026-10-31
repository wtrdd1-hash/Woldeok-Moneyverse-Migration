# 기획 v1546 — F675-192 잠금 후 시각과 안전한 알림함 이동
**상태:** 문서 전용 / 초안 / 배포 보류. **주기:** 보완 v1542 → 추가 v1544 → 보완 v1546 → 추가 v1548(잠정). **선행:** Draft #2113. **개발 인계:** #2112. **기준 main:** `761a55a094fb9dd383d213e817305e68c79fa23c`.

## 시작
miniPC Debian 13.6·서비스·개발 DB 연결 확인. 스킬 커넥터 목록이 비어 저장소 설치 Superpowers using-superpowers·brainstorming·writing-plans·worktrees·verification을 읽음. 별도 작업 트리·브랜치 생성, AGENTS·README·영문 기준/국문 대조 문서, GitHub Draft #2113·이슈 #2112 확인.

## 중간
main·기준 기획서 재조회 후 변동 없음. 알림 검색의 링크 허용 목록에 /inventory가 없고 DTO에는 PRODUCT_ACTIVITY가 이미 있음. 알림함 테이블 생성·권한은 미검증. 잠금 전 statement_timestamp가 시간 경계를 넘겨 오판할 수 있어 잠금 후 DB 시각·영수증+알림 원자성·안전한 CTA 설계로 보완. QA v1405는 과거 증빙, #2103·#2111·#2031 미해결.

## 인계·증빙
영문/국문 통합 기획·프로젝트 계획에 반영, P0 4/P1 6. 합성 수용시험 미실행. 외부 독립 근거 신규 0·누적 UNKNOWN/10,000 BLOCKED. 런타임/DB/WLD/원장/Test/Production/main 변경 없음. 커밋·Draft PR·CI는 검증 후 별도 기록.

09:10 KST 읽기 전용 공개 HTTP 재확인: Test FX 500, Production FX 200, Test /inventory 307(리다이렉트 미추적). 인증 Test SHA 증빙 아님.
