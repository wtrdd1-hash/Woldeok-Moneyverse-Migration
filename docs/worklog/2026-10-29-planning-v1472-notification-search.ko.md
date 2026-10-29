# 기획 v1472 — F675-174 회원 전용 검증형 알림 검색·안정적 내역

**일자:** 2026-10-29 KST. **주기:** 이전 보완 v1470 / 현재 추가 v1472 / 다음 보완 v1474(잠정). **판정:** 기획 문서 초안 / 운영 HOLD.

**근거:** Debian 13 미니PC 서비스 확인, 시작·중간 main `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`. `AGENTS.md`, `README.md`, 영문 정본 `PROJECT_PLAN.md`·국문 대조, 알림 프론트/백엔드/DTO·앱 API 문서·개발 PostgreSQL 실측. 기존 알림함은 분류·읽음·오프셋만 제공. 개발 알림 0행, pg_trgm 미설치, 생성 스키마 계보 미확인. 마지막 완료 QA v1371 FAILED/P0, v1372 최종 전. Draft #1885(A 마이그레이션), #1883(QA 린트), #1886(B 백엔드)와 코드 중복 작업 없음.

**결정:** F675-174 본인 읽기 전용 POST 검색, 최대 90일, 한국어 검색 인덱스 검증, HMAC 10분 키셋 커서, Next/Nest/Android, 개인정보·접근성·관리자·SEO·KPI·롤백 설계. 상세 명세와 P0/P1은 기존 국영문 통합 마스터에 흡수, 새 분산 기획 파일 없음. [개발 이슈 #1887](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1887).

**승격:** P0 4건(브랜치 보존·마이그레이션·금융 출처·QA 정확 SHA/복원), P1 6건. 합성 10,001건 및 공격 수용시험은 계획만 수립하고 미실행. 기능 OFF, 런타임·DB·WLD·Test·운영 변경 없음. 외부 독립 근거 신규 승인 0건, 누적 중복 제거 승인 UNKNOWN/10,000 = BLOCKED/IN PROGRESS.

**Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1888 — open, not merged, no runtime/Production promotion.
