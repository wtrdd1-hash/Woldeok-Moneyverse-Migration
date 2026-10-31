# Woldeok Moneyverse — Planning v1572 / DRAFT / RELEASE HOLD
**GitHub record:** Draft PR #2212 OPEN / DRAFT / RELEASE HOLD, stacked on unmerged #2203; engineering issue #2211; initial SHA b218653f3d9fd2ffb6618d6213204d996bb778f0. Final exact-SHA CI pending; no merge or deployment.
## v2026.10.31.1572 — F675-199 회원 보유 아이템 만료 달력 (FEATURE ADDITION / DRAFT / RELEASE HOLD)

**회차·진실 기준:** 이전 Feature Improvement v1570 → 현재 Feature Addition v1572 → 다음 Feature Improvement v1574(잠정). 최신 main 5bccda44d6db56aff05fa5623ef7f72b2ec0263c 시작·중간 확인, 미병합 기획 Draft #2203 계승, 개발 이슈 #2211. 본 문서는 설계안이며 구현·배포가 아니다. 영문 PROJECT_PLAN.md가 원본이고 본 문서는 동등한 한국어 대조본이다. F675-192~198 역시 미병합 기획이므로 달력 V1은 해당 기능의 실제 배포를 전제로 하지 않는다.

### 목적, 대안, 회원 흐름 및 상태
- **문제:** 현재 /inventory는 보유 아이템 목록을 표시하지만 날짜별 만료 예정 현황을 제공하지 않는다. 회원이 만료 전에 계획을 세우되 만료 예정과 알림 실제 전달을 혼동하지 않아야 한다. 읽기 전용 인벤토리 편의 기능이며 알림 발송·구매 기능이 아니다.
- **대안:** (A) 브라우저에서 기존 목록을 필터링하면 10,001개 보유와 상위 API 장애 시 가짜 빈 목록 위험이 있다. (B) 미구현 F675-194 알림 미리보기에 의존하면 동의·제외·통합 알림과 만료 자체를 혼동한다. **선택:** 본인 전용 DB 날짜별 집계 및 제한된 일별 상세 조회. 알림 동의와 독립적이다. 이메일/푸시, 자동 갱신, 장착, 구매, WLD·원장 변경은 없다.
- **대상·진입:** 인증과 최신 동의가 확인된 회원 본인만 /inventory → /inventory/expiry-calendar. 기본 KST 오늘부터 7개 날짜, 선택 시 30개 날짜; 날짜를 눌러 상세 목록 열기. CTA “7일”, “30일”, “아이템 보기”, “새로고침”, “보관함으로”. “만료 예정은 알림 발송 내역이 아닙니다”를 명시하며 만료시각이 없는 아이템은 기존 보관함에서 확인한다.
- **정직한 화면 상태:** LOADING, VERIFIED_DAYS, VERIFIED_EMPTY(본인 DB 정상 응답에 한함), VERIFIED_DAY_EMPTY, MORE_ITEMS, STALE_DAY(409 재조회), AUTH_REQUIRED, CONSENT_REQUIRED, SOURCE_UNAVAILABLE(503), RATE_LIMITED(429), ACCOUNT_CHANGED(이전 응답 폐기). DB 실패를 “만료 예정 없음”으로 표현하지 않는다. 기능 스위치 OFF면 메뉴와 호출을 숨긴다. 날짜·건수 스크린리더 알림, 포커스 복구, 동작 축소, 터치 44px, 너비 320px/확대 200%, WCAG 2.2 AA, Next·Android 동등성.
- **포함 기준:** user_items의 회원+catalog 기본키 1행은 상품 **종류 1개**이고 quantity는 별도 **수량**이다. quantity>0, expires_at NOT NULL, expires_at>DB 단일 asOf, [KST 오늘 00:00, 오늘+windowDays 00:00) 구간만 포함한다. 7일·30일은 오늘을 포함한 날짜 개수다. 종료일 자정과 정확히 일치하면 다음 구간으로 제외하고, 특정일 00:00 KST와 일치하면 그 날짜에 포함한다. 브라우저 시간대가 아닌 Asia/Seoul로 묶으며 PostgreSQL 마이크로초 원본을 JavaScript Date 밀리초로 절삭해 비교하지 않는다. 조회 중 만료되면 다음 조회에서 사라질 수 있으며 이는 영수증이 아닌 예측이다. expires_at NULL은 달력에서 제외한다.

### API, DB 권한, 커서 및 정합성
- **제안 Nest API:** 본인 인증·동의·CSRF POST /api/v1/shop/expiry-calendar/summary {windowDays:7|30}, POST /api/v1/shop/expiry-calendar/day {kstDate:YYYY-MM-DD,limit?:20|50,cursor?:opaque}. 회원 식별자는 세션에서만 얻고 요청 owner ID는 받지 않는다. Next 서버 경계와 Android /app-api/v1/shop/expiry-calendar/*는 같은 스키마를 사용한다. 본문 최대 2KiB, 회원당 분당 읽기 20회 제안(실측 필요). 상세 날짜는 최대 30일 범위 안이어야 한다. 정상 200 {status:'VERIFIED',asOfUtc,timeZone:'Asia/Seoul',windowDays,days:[{kstDate,typeCount,unitCount,earliestExpiryUtc}],totalTypes,totalUnits}; 일별 {status:'VERIFIED',kstDate,asOfUtc,items,nextCursor?,totalTypes,totalUnits}. 정상 확인된 빈 결과만 200 빈 목록. 잘못된 입력 400, 미인증 401, 동의·CSRF 403, 오래된 커서 409 STALE_DAY, 제한 429, DB·스키마·권한·근거 불명 503. 캐시나 장애 시 빈 배열 대체 금지.
- **DB 경계:** 향후 검증된 번호로 전진형 마이그레이션을 추가하되 본인 전용 SECURITY DEFINER 함수(가칭 shop_owner_expiry_calendar_summary_v1(actor,window_days), shop_owner_expiry_calendar_day_v1(actor,kst_date,limit,cursor_fields))를 사용한다. 고정 search_path, moneyverse_migrator 소유, moneyverse_app에는 EXECUTE만 부여한다. user_items/shop_catalog/영수증/인증/금융 테이블 직접 SELECT/INSERT/UPDATE/DELETE 권한을 주지 않는다. 각 응답은 기본 DB의 단일 SQL 문장 스냅샷과 단일 asOf를 사용하며 HTTP 요청 사이에 동일 스냅샷이라고 주장하지 않는다. 회원 행 필터 후 catalog UUID로 결합. 후보 부분 인덱스 (user_id,expires_at,catalog_id) WHERE quantity>0 AND expires_at IS NOT NULL은 합성 10,001건 EXPLAIN(ANALYZE,BUFFERS) 및 쓰기 비용 확인 후 결정한다. V1 새 테이블은 필요하지 않다. 종류 수 COUNT(*) bigint, 수량 SUM(quantity)::bigint; JS 안전정수 초과는 정확한 십진 문자열로 전달한다.
- **일별 페이지:** 기본 20/최대 50건, (expires_at ASC,catalog_id ASC) 키셋 정렬. HMAC 불투명 커서는 회원, KST 날짜, 마지막 정확한 마이크로초 만료시각·UUID, 선택일 전체 대상의 정렬된 (catalog_id,정확한 만료시각,quantity) 결정적 지문, 스키마 버전, 발급시각, 120초 만료를 결속한다. 다음 조회 시 단일 SQL 스냅샷에서 지문을 다시 계산해 변경 또는 만료면 409 STALE_DAY로 처음부터 새로고침한다. 이름·세션 비밀은 커서에 넣지 않고 서명키 교체를 지원한다. 지문 계산 비용과 최대 응답 크기는 수용 게이트이지 성능 합격 증거가 아니다. acquired_at을 보유 세대 증거로 사용하지 않는다. 안전한 지문/커서를 구현하지 못하면 기능 OFF를 유지한다.
- **보안·운영:** Nest·Next·Android 게이트웨이의 정상·오류 응답에 Cache-Control private,no-store, X-Robots-Tag noindex, Referrer-Policy no-referrer를 강제하고 필요 시 Vary Cookie를 적용한다. 사이트맵 제외, URL에 아이템 ID 금지, 회원 아이템명·시간을 관리자 분석/로그에 남기지 않는다. 계정 전환 시 이전 응답을 폐기하며 매개변수 변조·CSRF·세션 경계를 검증한다. 읽기 전용이며 알림 설정, 아이템, WLD·원장 변경이 없다. 관리자 지표는 회원 20명 이상 집계만 공개한다. 달력 조회, 날짜 열기, 빈 목록, 재시도, 오래된 커서, 429/503, p95 지연 및 7/30일 전환을 KPI로 제안한다. p95<300ms는 미측정 목표다.

### 소스 근거, 개발 백로그, QA 및 출시
- **소스 근거:** 마이그레이션 071 user_items는 PRIMARY KEY(user_id,catalog_id), quantity>=0, expires_at timestamptz 및 앱 직접 권한 철회를 정의한다. 123 shop_my_items_v2는 회원 전용 SECURITY DEFINER이며 quantity>0과 미래 만료를 필터링하지만 만료 없는 행도 포함하고 clock_timestamp를 사용하므로 30일 단일 시각 집계와 동일하지 않다. Next /inventory/page.tsx는 apiOrNull 장애 시 []로 대체한다. 신규 달력은 이 가짜 빈 목록 처리를 복제하지 않는다. 최신 main에 F675-199 SQL/API/화면은 없다. 개발 A/B/C/QA와 대규모 통합 Draft #2206과 변경 영역을 분리한다.
- **P0 OPS1572-01** (#1984/#2144/#2171): Production 실행·백엔드·프론트·엣지 SHA 출처, cgroup 여유 및 독립 복원·롤백 증명.
- **P0 SEC1572-02** (#993/#2111): 깨끗한 PG17 권한·체크섬, 본인 격리·읽기 전용, 정확한 시각 및 조회 비용; 테이블 직접 권한 금지.
- **P0 FIN1572-03** (#1976/#2153/#2191/#2209): Treasury·마켓플레이스 원장 출처, 원장 외 경로·가공된 감정서 문제 해결; 달력 금융 변경 0.
- **P0 REL1572-04** (#1088/#2206): 동시 통합 PR·QA 조정, 보안·감사, 정확 SHA 공식 Test 인증 E2E, 독립 복원 및 운영자 승인.
- **P1 CAL1572-05** Backend B: 본인 전용 날짜 집계 SQL·실증 후 부분 인덱스, 종류/수량·UTC/KST 경계.
- **P1 CAL1572-06** Backend B: 일별 상세 SQL, 결정적 지문, 서명 키셋 커서, 120초 만료, 409 재조회·경합.
- **P1 CAL1572-07** Backend B: Nest 인증·동의·CSRF·엄격한 2KiB 본문, 분당 20회 제안 제한, 200/400/401/403/409/429/503 계약.
- **P1 CAL1572-08** 개발 A/C: Next·Android 화면/API 동등성, 장애 시 가짜 빈 목록 금지, 포커스·스크린리더·모바일·계정 전환.
- **P1 CAL1572-09** 개발 A/C: 엣지 개인정보·noindex, 20명 이상 관리자 집계, 실측 성능, INVENTORY_EXPIRY_CALENDAR_ENABLED 기본 OFF.
- **P1 CAL1572-10** QA: 격리 PG17 합성 보유 10,001건, 회원 2명, 동시 조회 2개, KST 자정 ±1µs, 7/30일 경계, NULL·만료·수량0, 64비트 집계, 타인 커서, 119/120/121초, 페이지 도중 변경, 앱 직접 SELECT/DML 거부, 원장 변경 0, 320px/200%·Android 계약. **시험 제안만 했으며 미실행.**
- **출시·롤백:** 별도 개발 브랜치, 전진형 DB 변경, 전체 QA/권한/금융/보안/GitOps 통과 및 공식 Test 정확 SHA 인증 E2E, 독립 복원 연습·운영자 승인 후 Production 승격. 문제 발생 시 기능 스위치 OFF로 중단하고 DB 파괴적 롤백은 하지 않는다. Production RELEASE HOLD. 기존 QA1420 FAILED/P0: 백엔드 2,786 PASS/501 SKIP, 프론트 2,776 PASS, 격리 PG17 312/312, 전체 감사 취약점 13건, Test FX HTTP500, 권한·체크섬·금융 출처·정확 SHA Test·복원 차단. F675-199 실제 수용시험 미실행. 외부 독립 근거 신규 검증·중복 제거·분류 승인 0건, 누적 UNKNOWN / 10,000건: BLOCKED / IN PROGRESS.
