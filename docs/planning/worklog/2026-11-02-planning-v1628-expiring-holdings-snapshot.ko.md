# 기획 v1628 — F675-213 회원 보유품 만료 임박 검증 조회

**v1628 GitHub:** Draft PR #2410 (OPEN / HOLD; 기준 #2402), 개발 인계 이슈 #2409. 병합·배포 없음.

**날짜:** 2026-11-02 KST. **회차:** 이전 Feature Improvement v1626; 현재 Feature Addition v1628; 다음 Feature Improvement v1630(잠정).
**상태:** DOCUMENTATION CANDIDATE / DRAFT / RELEASE HOLD. **시작·중간 main:** 510dbe6bf4d5c2a8089fc06b480776053da7a2e3. **누적 기준:** 미병합 Draft #2402, SHA c5812debab56dec968294ad0108c4ee5c36f308f. **인계:** #2409.

## 실제 확인
- miniPC Debian 13 서비스 활성, 개발 PostgreSQL 연결. Superpowers using-superpowers·brainstorming·using-git-worktrees·writing-plans·verification-before-completion을 설치 파일에서 확인했다. skills 커넥터 URI 0건으로 skills__read 경로만 BLOCKED이며 설치 스킬을 사용했다.
- main의 AGENTS.md·README.md·영문 PROJECT_PLAN.md 정본·한국어 동등 문서, GitHub 열린 PR과 QA를 조사했다. 공개 Test /api/version은 main 510dbe6..., Production은 353c6d5...를 반환하지만 불변 실행 이미지·DB 출처·독립 복원 증명은 아니다.
- 실제 /shop/catalog은 보유품 만료와 효과 종료를 구분한다. Nest shop/holdings는 인증 소유자 가드가 있지만 shop_my_items_v2의 무제한 행을 반환하고 마이그레이션 123은 clock_timestamp를 여러 번 호출한다. 단일 관찰시각의 정확한 24/72시간 현황은 없다. 실제 사용자 손실이 확인된 것은 아니다.

## 설계 및 인계
브라우저 전체 필터링이나 신규 작업자 대신 **읽기 전용·회원 본인** 현재 만료 임박 조회를 선택했다. GET /api/v1/shop/expiry-snapshot?hours=24|72, PostgreSQL REPEATABLE READ 단일 마이크로초 asOf, 전체 정확한 bigint 문자열 총계, 상위 10개 묶음, 출처 불명 503, WLD/원장/아이템 변경 없음, 알림 전달 추론 금지. 한영 웹/Android 비공개·접근성, 관리자 집계 전용, 기본 OFF. DB 제약·인덱스·트랜잭션·API·보안·SEO·KPI·회귀·롤백 조건을 양언어 통합 문서에 명세했다.

P0 OPS1628-01 SEC1628-02 FIN1628-03 REL1628-04, P1 SNAP1628-05..10은 GitHub #2409에 인계했다. 금융 #2330/#2340/#2357/#2366/#2404/#2405, 권한 #993, 마이그레이션 출처 #2233/#2345, 정확 SHA/복원 차단은 독립 유지한다. 외부 독립 근거 신규 승인 **0건**, 누적 **UNKNOWN / 10,000**, BLOCKED / IN PROGRESS.

## 검증·판정
기획 문서만 변경, 기능 구현 및 Test/Production 배포 없음. 기능 수용·PG17 마이그레이션·인증 E2E·복원 **미실행**. 문서 테스트·최종 SHA·원격 CI 결과는 실제 확인 후 추가한다. 다른 개발 브랜치·Draft·데이터·예약 유지.


**이번 QA:** 표준 릴리스/보안/백업 171/171 PASS, 분류기 24/24 PASS, 한영 4쌍×9표식 PASS, diff 검사 PASS. 확장 175/176 중 오래된 정리 워크플로 시험 1건 실패(실제는 읽기 전용). QA 후속 OPEN, 기능 E2E 미실행.
