# 기획 v1422 — F675-161 사진 철회 무결성

**상태:** PARTIAL / DRAFT / RELEASE HOLD. Previous Addition v1420 → Current Improvement v1422 → Next Addition v1424(잠정). main 35971c600f25869c96f1c666d4b9f58927202730 시작·중간 확인. 선행 기획 #1727, 개발 후보 #1730 모두 Draft. QA v1346 FAILED.

**실제 근거:** main에는 철회 없음. 후보 SQL 292는 사진 행을 삭제하고 별도 표식·일일 제한을 보존하지만 GET mine은 살아 있는 최근 30건만 조회해 철회 이력이 사라짐. 기획 대비 API 경로·응답 차이, SQL 활성 회원·전용 OFF 검증 누락, 렌더별 UUID 재시도 문제, 모바일 철회 계약 누락. DB 환경변수가 없으면 SQL 시험 SKIPPED 가능. 운영 유출·악용 발생을 입증하는 것은 아님.

**결정:** 기존 영문·국문 통합문서와 P0/P1 10건 갱신. 개발 담당자가 행 유지/삭제 모델을 검증 후 확정하도록 하고 본인 비식별 철회 이력, 게시·미디어 차단, 5건 제한, 웹/Android 타입 계약, 안정적 재시도, 격리 실DB 시험, 정확 SHA Test·독립 복원·OFF 롤백 필수. 분산 신규 기능기획서나 런타임 변경 없음. 과거 18k WLD 불일치, 디스크 97%, 백업 #1718 운영 차단 유지.

**외부 근거:** PostgreSQL/OWASP/W3C 공식 발행처 3곳 검토, 신규 중복 제거 승인 0건, 누적 승인 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 운영/Test 코드·DB·WLD·미디어·기능 스위치 변경 없음.

**개발 연계:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1726 및 https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1730.

## GitHub 전달·완료 기록
- Draft PR #1732: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1732 (미병합 기획 #1727 기반, main 독립 병합 금지).
- 개발 이슈 #1726 전달: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1726#issuecomment-6466288371 ; 개발 A Draft #1730 리뷰: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1730#issuecomment-6466289117 .
- 문서 14개, git diff --check PASS, 릴리스 분류 시험 17 PASS / 0 FAIL, 영문·국문 기획 3쌍·백로그 10개 PASS. 원격 SHA 검증, PR CI는 완료 확인 전이며 공식 Test가 아님. QA v1347 진행 중, 완료된 최신 QA v1346 FAILED.
