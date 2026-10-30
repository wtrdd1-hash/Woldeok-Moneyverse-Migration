# 기획 v1542 — 대상 결속과 증빙 정확성

**상태:** DRAFT / RELEASE HOLD, 문서 전용. **회차:** v1540 기능 추가 → v1542 기능 보완 → v1544 기능 추가(잠정).

**시작:** 2026-10-31T07:09:49+09:00 started; latest main 761a55a094fb9dd383d213e817305e68c79fa23c; v1540 PR #2101 head 247bf2e2eaa4d8adc3fae790c2ddc1d137b6c95f; QA v1405 last full verified; v1406 route-ledger evidence missing per B #2103; release HOLD.

**중간:** origin/main·AGENTS.md·README.md·영문 정본·국문 대조, 마이그레이션 071/114/123, Nest 장착 컨트롤러, Next 보관함, app-api 경로, PR #2101/#2103/#2094 및 이슈 #2100/#2031/#993 확인. main SHA 불변. v1540 요청에는 기존 만료 예정 장착 대상 UUID와 7/30일 기간이 없어 관계없는 슬롯도 REVIEWABLE로 보일 수 있는 설계 공백을 확인. 실제 악용 증거 아님.

**보완:** candidateId·expectedTargetCatalogId·slot·withinDays 필수, 전체 본인 장착 원천 검사, 단일 DB 시각·지문·30초/만료/기간 경계, 타인 후보 404·대상 불일치 409·증빙 만료 410·원천 장애 503. 증빙은 장착 허가가 아님. CSRF 보호 POST 읽기 BFF 우선, Android 게이트웨이 메서드 검증 전 확정 금지. 통합 마스터 영문·국문에 P0 4건/P1 6건과 상세 수용조건 반영.

**근거:** QA v1405 main 백엔드 2,778 PASS/501 SKIP, 프론트 2,770 PASS, lint/typecheck/build PASS, 전체 의존성 감사 FAIL. B Draft #2103은 QA v1406 정확 SHA 경로 증빙 누락을 언급. 공식 Test·DB 권한/체크섬·독립 복원 미증명. 합성 10,001개 수용시험 미실행. 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.

**변경:** 영문/국문 통합 기획서·업데이트 로그·회차 일지·내부/GitHub 기록만 변경. 런타임/DB/WLD/원장/Test/Production/main 변경 없음. 최종 PR/CI는 별도 기록, Draft/HOLD 유지.

**GitHub 연결 기록:** Draft/HOLD PR #2105(선행 #2101), 개발 이슈 #2100 댓글 갱신, 첫 커밋 ad503bf4756d3308203c7d735ab5c0a16fd62fa4의 문서 CI #41136736297 및 Build Test Candidate #41136717130 성공. 최종 문서 커밋의 CI는 별도 확인. 실제 기능·운영 승인 아님.
