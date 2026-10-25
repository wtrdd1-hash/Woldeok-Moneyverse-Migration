# QA A0725 — 본인 개인정보 요청 접수 기록 CSV

**판정: PARTIAL / BLOCKED — Draft, main 미병합, Test·운영 미배포.**

회원은 최근 **최대 30건**의 개인정보 요청 **접수 기록**만 CSV로 다운로드합니다. 개인정보 전체 사본·전체 과거 기록·요청 처리 완료 증명이 아닙니다. 기존 본인 제한 PostgreSQL SECURITY DEFINER 함수, 세션 인증·동의, Android 쿠키·비공개 캐시·색인 금지, UUID·날짜·상태·중복·CSV 수식·보이지 않는 문자 방어를 적용했습니다. 신규 DB 마이그레이션·금융 원장 쓰기 없음. 영문/국문 모바일 계약 **180개**.

집중 Backend **2 PASS**, Frontend **23 PASS**. 격리 PostgreSQL 17.11 본인 1·타인 0, 테이블 직접 SELECT·원장 INSERT 차단, ROLLBACK 후 0. Typecheck·Lint(오류 0/경고 1,128)·Build PASS, 계약 38 PASS, DB 15 PASS/3 SKIP, Backend 1,317 PASS/398 SKIP, Bot 8 PASS. 전체 Frontend **1,406 PASS/6 FAIL**(SEO 3, 로그인 접근성 1, 계산기 링크 1, 관리자 M2 1). 보안 운영 High 2, 전체 Critical 2/High 10, Bot Critical 1/High 5로 FAIL.

시작 브랜치 234/PR 230, PR 직전 235/231, 비-main 234개 고유 미통합 커밋 보존, 중복 tip SHA 0, 충돌 #1107·#1110·#1143 보존, 삭제 0. MiniPC Debian 13.6 서비스 ACTIVE, 루트 디스크 **100%**, 데이터 약 76%. 공식 Test SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917`. 정확한 SHA 인증 E2E·전체 CI·보안·백업 복원·GitOps 승인 전 **RELEASE HOLD**. 현 롤백은 미병합 Draft 유지.
