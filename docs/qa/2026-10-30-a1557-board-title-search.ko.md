# 개발 A 2026-10-30 15:57 — 공개 게시판 최근 제목 검색 QA

**판정: 대상 테스트 PASS / 전체 테스트 FAIL / 공식 Test BLOCKED / 운영 배포 HOLD.**

- 기준 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`, 독립 브랜치 `auto/hourly-a-20261030-1557-board-title-search`. 다른 A·B·C 작업과 미통합 변경은 보호했습니다.
- 공개 게시판의 **최신 50건** 안에서 제목을 대소문자 구분 없이 문자 그대로 검색합니다. 전체 과거 게시물 검색이 아닙니다. 기존 종목 필터와 병행 가능합니다.
- Nest API는 중복·배열·미지원·공백·80자 초과·제어문자 등 잘못된 검색어를 HTTP 400으로 거부합니다. SQL 매개변수 바인딩과 기존 `SECURITY DEFINER` 함수만 사용합니다. 금융 원장 및 마이그레이션 변경 없음.
- 웹: 접근 가능한 검색 폼, 오류·빈 결과 구분, 검색 결과 색인 방지. Android app-api: 검색어 전달과 캐시 금지·색인 방지 검증.
- TDD RED 확인 후 Backend 대상 **15 PASS**, Frontend·Android 대상 **11 PASS**. Typecheck·전체 Lint(오류 0, 경고 1,043)·Backend/Frontend 빌드·모바일 API 계약(183개) PASS.
- 전체 Backend **2,576 PASS / 119 FAIL / 495 SKIP**, 전체 Frontend **2,616 PASS / 53 FAIL**. 이전 회차와 실패 수는 같으나 모든 실패 항목의 동일성은 독립 검증하지 않았습니다. DB 단위 **56 PASS / 4 SKIP**, 운영 의존성 감사 알려진 취약점 0건.
- 격리 PostgreSQL 17에서 마이그레이션 020의 테스트 역할 구성 문제로 **전체 305개 적용 검증 실패**. 020을 제외하고 181까지 구성한 별도 기능 SQL 검증에서 합성 게시글 52건, 최신 50건 제한, 검색 2건, 특수문자 리터럴 1건, 오래된 글 제외, 앱 계정의 직접 SELECT 차단을 확인했습니다. 이것을 전체 마이그레이션 PASS로 표시하지 않습니다. 합성 원장 거래·전표 0건이며 자체 테스트 컨테이너 제거.
- 공식 Test 정확 SHA 인증 E2E, 전체 마이그레이션 검증, 독립 백업 복원 및 GitOps 승격은 BLOCKED. **main 병합·운영 배포·운영 DB 변경·롤백 없음**. 기존 브랜치 삭제 0건.
- 증거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-1557-board-title-search/`.
