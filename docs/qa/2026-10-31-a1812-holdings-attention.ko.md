# QA — 회원 보유품 관리비 확인 필터, 2026-10-31

**후보:** `auto/hourly-a-20261031-1812-holdings-attention-repair`, 기준 main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`, 코드 SHA `5f7460daa681af836d99e67b207c9fea987891f4`.

회원 상점은 기존에 Nest가 무시하는 `status=attention`을 전송하여 관리비 확인 대상이 아닌 아이템까지 표시할 수 있었습니다. 이를 `filter=attention`으로 수정하고, 미납 주 수가 0이어도 체납액이 양수인 항목을 정수 문자열 그대로 분류합니다. Android app-api는 잘못된 필터·중복 필터·필터를 무시한 HTTP 200을 거부하고 비공개·캐시 금지·색인 금지 헤더를 강제합니다. DB 마이그레이션·원장 변경 없음.

**검증:** 대상 Backend 7 PASS, Frontend/Android 7 PASS. 전체 Backend 2,788 PASS / 501 SKIP, DB 단위 62 PASS / 4 SKIP, Frontend 2,781 PASS, lint 오류 0·경고 1,048, typecheck/build PASS, 모바일 계약 184개 PASS, 보안·릴리스 20 PASS, 운영 의존성 알려진 취약점 0건. 최초 전체 테스트는 Frontend에서 160초 제한으로 종료(124), 잘못된 NODE_ENV 재시도는 React.act 오류로 실패했으나 올바른 NODE_ENV=test·2-worker 재실행에서 Frontend 전체 2,781 PASS.

**실제 PostgreSQL 17.11:** 읽기 전용 트랜잭션에서 기존 함수 실행 및 가상 미존재 회원 0건 확인, ROLLBACK. 다만 개발 DB에서 앱 계정의 `public.user_items` 직접 SELECT/DELETE 권한이 모두 true로 확인되어 P0 최소 권한 위반(#993). 운영 DB 권한의 증거는 아님.

**운영 보류:** 공식 Test·Production 공개 Backend/Frontend SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`로 후보와 다름. 후보 정확 SHA 인증 E2E·독립 복원·최소 권한 검증 미충족. 병합·배포·서비스 재시작·운영 DB 변경·브랜치 삭제·롤백 없음. 비-main 111개 중 103개 미통합 커밋 보유, main 선조 8개는 소유권 확인 전 보존. 열린 PR 95개 중 충돌 8개.
