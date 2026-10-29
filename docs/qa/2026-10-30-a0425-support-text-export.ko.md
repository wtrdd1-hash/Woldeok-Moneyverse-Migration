# 개발 A QA — 회원 문의 TXT 대화 내역 내보내기 (2026-10-30 04:25 KST)

**후보:** `auto/hourly-a-support-text-export-20261030-0425`, 기준 main `62c6cd038951d65c94b709302bdaec6e75b080b6`. **판정: Draft / 운영 배포 보류.**

회원 본인에게만 허용된 기존 PostgreSQL `support_thread_messages` 함수를 사용해 최대 500건을 읽고, NestJS JSON 응답·웹 TXT 다운로드·Android app-api를 연결했다. 저장 데이터/원장/마이그레이션은 변경하지 않았다. 제어 문자·양방향 문자 제거, 줄별 접두어, 500건 상한 경고, 인증·개인정보 캐시 금지 및 검색 색인 차단을 적용했다.

**통과:** 신규 Backend TXT 테스트 최종 6건, 신규 Frontend TXT 다운로드 테스트 최종 4건, 관련 프런트엔드 47건(추가 테스트 전), SEO·접근성 15건, 공통 계약 41건, DB 단위 56건(4건 SKIP), 보안 13건, 전체 타입 검사·빌드, 변경 파일 ESLint, 운영 의존성 감사(알려진 취약점 0건). 격리 PostgreSQL 17.11에서 마이그레이션 304개 적용, 소유자 조회·타인 조회 거부·직접 테이블 접근 거부를 검증했다. 테스트 트랜잭션 롤백 후 컨테이너 제거.

**실패/차단:** 전체 Lint 오류 3건, Backend 전체 240 FAIL/2354 PASS/493 SKIP, Frontend 전체 554 FAIL/2041 PASS, 모바일 API 생성 문서 3개 불일치(별도 QA #1927 및 신규 엔드포인트 조정 필요), 공식 Test 정확 SHA 인증 E2E 미실행. 04:41 기준 Test/Production Backend SHA는 `c2129625aa6629c616fb31ce790950618b8d92b2`, Production Frontend 식별자는 `1793277134644`. Test 국고 HTTP 200/Production 503 P0 #1917 지속. #1891, #1908도 미해결.

**결론:** 전체 품질·금융·백업 복원·Test 릴리스 게이트 미통과. main 병합, 운영 DB 수정, Test/Production 배포, 롤백, 브랜치 삭제 없음. 근거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-0425-support-text/`.
