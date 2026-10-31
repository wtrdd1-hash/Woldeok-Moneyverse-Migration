# 기획 v1552 — F675-194 회원 만료 알림 대상 미리보기

**2026-10-31 12:05 KST | 기능 추가 | DRAFT / RELEASE HOLD**

**이전:** 기능 보완 v1550. **현재:** 기능 추가 v1552. **다음:** 기능 보완 v1554(잠정). GitHub main 761a55a094fb9dd383d213e817305e68c79fa23c 시작·중간 확인, 선행 Draft #2128, 개발 인계 대기. 문서 전용이며 F675-188/192/193은 미구현.

**소스 확인:** 마이그레이션 071은 회원·상품 보유 PK와 NULL 만료시각을 정의, 123은 만료·수량 0 필터와 개별 DB 시각 사용. 프론트 인벤토리 apiOrNull은 장애를 빈 목록처럼 보일 수 있음. 알림 서비스는 in_app_notifications 직접 조회, Android app-api의 shop 비공개 처리는 purchases 중심. 개발 B의 Draft #2130 알림 링크 정화는 아직 미병합이며 이 기획과 작업 분리. 운영에서 알림 장애가 실제 발생했다고 단정하지 않음.

**선택:** 알림 예약·발송을 약속하지 않는 본인 판단 가능성 미리보기. 제한된 단일 DB 스냅샷으로 7일/1일 시작 포함·끝 제외 기간, 전체 집계와 기본 20/최대 50 상세, 커서 없음, 영속 예약 큐 없음. 본인 SECURITY DEFINER, Nest/Next/Android 인증·동의·CSRF, 비공개 헤더, 320px 접근성, WLD 쓰기 없음. 상세 API·DB·P0 4/P1 6·KPI·회귀시험은 영문/국문 통합 마스터에 수록.

**증거:** QA v1411 백엔드 2,778 PASS/501 SKIP, 프론트 2,770 PASS, lint/typecheck/build PASS, 격리 PG17 311/311; 전체 감사 13건 FAIL, 공식 Test 정확 SHA·경로 장부 FAIL, 개발 DB 권한/체크섬·Test FX 500 미해결. Production/Test SHA 불일치, 독립 복원 BLOCKED. 신규 기능 합성 수용시험 미실행. 외부 근거 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 플래그 OFF, RELEASE HOLD, main·런타임·DB·금융 변경 없음.
GitHub: Draft PR #2135 OPEN/HOLD, 개발 이슈 #2134 OPEN; 병합·배포 없음.
