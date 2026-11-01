# 기획 v1616 — F675-210 회원 만료 알림 카테고리 선택

**2026-11-01 KST | 기능 추가 | 초안 / 운영 보류 | 문서 전용**

이전 보완 v1614 → 현재 추가 v1616 → 다음 보완 v1618(잠정). 원격 main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` 시작·중간 확인, 완료 시 재확인 예정. #2361 기반 Draft `#2369`, 개발 이슈 `#2368`. main AGENTS.md·README·영문 PROJECT_PLAN 정본·한국어 동등 문서·실제 소스·QA를 근거로 함. F675-199~210 모두 미구현. Superpowers using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification-before-completion 설치 파일 읽음(플러그인 스킬 목록 비어 있음).

**확인과 결정:** migration 071 초기 6종이며 2026-11-01 20:07 KST 읽기 전용 개발 DB `public.shop_catalog`에는 **14개 분류 코드**가 확인됨(Production 근거 아님)과 114 확장 카테고리·shop controller 토큰이 다르므로 웹/Android 고정 분류는 위험하다. 승인된 서버 레지스트리와 버전, ALL/SELECTED(1~16개) 회원 설정으로 일원화, 알림 자동 활성화 금지. 엄격 GET/PUT, 세션·동의·CSRF, 리비전 CAS·멱등 영수증·작업자 공통 잠금. 분류 출처 불명/변경은 409/503으로 처리하고 0건·전체 우회 발송 금지. 기존 알림 화면에는 기능이 없고 F675-205 작업자·영수증·설정도 미구현.

**개발 연계:** P0 OPS1616-01, SEC1616-02, FIN1616-03, REL1616-04; P1 SCOPE1616-05~10. API·DB·트랜잭션·한영/Android·접근성·개인정보·KPI·테스트·롤백은 통합문서에 명세. 금융 차단 #2366/#2330/#2340/#2357, Test 출처 #2345, DB 권한 #993, 마이그레이션 충돌 #2233 유지. 실제 기능/DB/공식 Test 수용시험 미실행, 런타임·SQL·잔액·Test·Production 변경 없음. 외부 신규 승인 0·누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 로컬 릴리스 정책 시험 147/147 PASS, 분류 시험 24/24 PASS, 한영 4쌍 대조 PASS, `git diff --check` PASS. Draft #2369·이슈 #2368 생성; 최종 SHA 원격 CI는 GitHub 작업 기록에서 별도 확인하며 실제 기능 수용시험은 아니다.
