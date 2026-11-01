# 기획 v1600 — F675-206 읽기 전용 만료 알림 미리보기

## v2026.11.01.1600 — F675-206 회원 보관함 만료 알림 미리보기 (기능 추가 / DRAFT / RELEASE HOLD)

**주기 및 기준:** 이전 **Feature Improvement v1598** → 현재 **Feature Addition v1600** → 다음 **Feature Improvement v1602(잠정)**. 시작·중간에 `origin/main=f13bbce273ffc65e8576170992d82ea00c27a1c9` 재확인. main의 AGENTS.md, README.md, 영문 PROJECT_PLAN.md(정본), 국문 PROJECT_PLAN.ko.md를 대조했다. 선행 기획 Draft **#2301**은 미병합 OPEN이며 유효한 F675-199~205 기획을 이 별도 문서 브랜치로 승계했다. 개발 이슈 **#2307**, Draft PR **#2309**. **F675-206은 미구현**이고 별도 분산 기획 파일이나 런타임 배포는 없다.

### 소스 근거, 목적, 대안
- **소스 확인:** `frontend/src/app/account/notifications/page.tsx`에는 회원 전용 알림 설정 및 기존 목표 알림 설정이 있지만 만료 미리보기는 없다. `frontend/src/app/inventory/page.tsx`는 `apiOrNull('/api/v1/shop/holdings')` 실패를 `[]`로 바꿀 수 있어 장애를 검증된 0건으로 판단하면 안 된다. `backend/src/shop/shop.controller.ts`의 holdings GET에는 Session/Authenticated/Consent 가드가 있으며, `shop.repository.ts`는 마이그레이션 123의 `public.shop_my_items_v2(actor)`를 호출한다. `frontend/src/app/app-api/v1/[...path]/route.ts`의 비공개 헤더 처리는 일부 경로에만 명시되어 있다. 이는 소스 위험이지 운영 개인정보 유출의 증거가 아니다.
- **목적:** 인증·동의가 유효한 보유자가 F675-205 일일 알림을 켜기 전에 **현재 기준으로 알림에 포함될 아이템 종류 수**를 직접 확인한다. F675-203 요약과 F675-205 발송기는 모두 미구현 기획이며, 이번 기능은 발송·설정 저장·알림함 영수증 생성이나 09:00 발송 보장을 하지 않는다.
- **대안:** (A) 브라우저에서 전체 보유 목록 집계는 오류→0건, 무제한 응답, 시각 정밀도 문제로 제외; (B) 미리보기 저장 테이블은 데이터 노후화·보존 위험으로 제외; **(C) 선택:** PostgreSQL 회원 전용 제한 집계를 Nest GET으로 제공한다. F675-203 집계가 먼저 구현되면 동일한 검증된 계산식을 재사용하고 중복 계산을 만들지 않는다. 신규 테이블·금융 쓰기는 없다.

### 회원 흐름, 상태, 정확한 응답
- **진입점:** `/account/notifications`의 제안된 만료 알림 설정 아래. CTA **만료 알림 미리보기** → **새로고침** → **보관함 열기**. 알림 설정이 OFF여도 조회할 수 있고 조회만으로 수신 동의가 되지 않는다. 안내 문구: “현재 보유 아이템 기준 미리보기입니다. 수량은 바뀔 수 있으며 예약 알림 발송은 보장되지 않습니다.” 두 구간·기준시각·마지막 검증 조회만 표시하고 상품명·상품 ID·잔액·보유 수량·회원 UUID·가짜 알림은 표시하지 않는다.
- **구간:** PostgreSQL 단일 `statement_timestamp()`를 UTC 소수점 6자리 `asOf`로 사용. **(asOf, asOf+24시간]** 및 **(asOf+24시간, asOf+72시간]**에 만료되는 카탈로그 종류 수. `quantity>0`, `expires_at IS NOT NULL`인 회원 보유 항목만 포함한다. 이미 만료된 항목, 효과 만료, 유지비, 정지 상태 추정, 금융 이벤트는 제외한다. (회원,상품) PK의 상품은 구간당 1종으로 집계한다. 수치는 JS 실수 대신 **정규 비음수 십진 문자열**로 전달한다. 경계: asOf 정확히 만료는 제외, +24시간은 첫 구간, +24시간+1µs는 두 번째, +72시간은 두 번째, +72시간+1µs는 제외.
- **상태:** FLAG_OFF(기존 화면 유지), LOADING, VERIFIED_NONZERO, VERIFIED_ZERO, REFRESHING, AUTH_REQUIRED, CONSENT_REQUIRED, RATE_LIMITED, SOURCE_UNAVAILABLE, OFFLINE, SESSION_CHANGED. 503/타임아웃/시각 불명은 0건 성공으로 표시하지 않는다. 검증된 미리보기도 **조회 순간의 값**이지 미래 발송 결과나 09:00 작업 실행의 보증이 아니다. 로그아웃·계정 전환 시 이전 값을 즉시 지운다.

### API·DB 권한·보안·성능
- **Nest:** `GET /api/v1/shop/expiry-digest/preview`에 SessionGuard, AuthenticatedGuard, ConsentGuard 적용. 회원은 서버 세션에서만 결정하고 요청의 회원 UUID·필터·본문은 허용하지 않는다. 알 수 없는 쿼리는 400, 인증 없음 401, 동의 없음 403, 요청 제한 429, DB·스키마·시각 검증 실패 503. GET이므로 CSRF 쓰기 토큰·멱등키 불필요. 성공 `200 {sourceStatus:'VERIFIED',asOfUtcMicros:'YYYY-MM-DDTHH:mm:ss.ffffffZ',count0To24h:'0',count24To72h:'0'}`. 새로고침은 새 조회이며 과거 성공 결과를 재사용하지 않는다.
- **SQL:** 필요할 때만 신규 순방향 마이그레이션을 사용하며 **318 번호 충돌** 해결 후 번호를 협의한다. 제안 함수 `public.shop_expiry_digest_preview_v1(p_actor uuid)`는 migrator 소유 SECURITY DEFINER, 고정 `search_path=pg_catalog,pg_temp`, 스키마 명시, PUBLIC EXECUTE 회수 및 검증된 역할에만 EXECUTE 부여. 한 읽기 명령 안에서 회원 조건과 마이크로초 경계를 적용하고 동적 SQL은 금지한다. **P0 보안 게이트:** 전달된 UUID나 호출자가 설정한 GUC는 DB 차원의 회원 신원 증명이 아니다. 앱 역할의 테이블 권한 부정 시험과 회원 2명 간 직접 EXECUTE 위조 접근 차단을 입증하거나, 안전한 신원 결속 설계가 승인될 때까지 신규 권한·기능 활성화를 차단한다. `user_items` 직접 SELECT나 알림 테이블 권한을 임의 부여하지 않는다.
- **제한:** 회원당 분당 10회, SQL 2초, p95 300ms 미만은 **시험 목표치이며 실측이 아니다**. 10,001건 합성 보유 데이터에서 `EXPLAIN (ANALYZE, BUFFERS)`로 기존 인덱스를 검토하고 효과가 입증된 경우에만 인덱스를 추가한다. 한 SQL 문장의 동일 기준시각·스냅샷만 보장하며 HTTP 요청 간 고정 스냅샷을 주장하지 않는다. 쓰기 트랜잭션·잠금·영수증은 없다. 확인되지 않은 `in_app_notifications` 생성 DDL은 F675-205의 별도 P0 차단 조건이며 이 읽기 기능에 의존시키지 않는다.
- **개인정보/SEO:** Nest·Next BFF·app-api·최종 HTTP 엣지의 성공과 오류 모두 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` 검증. 사이트맵·공개 canonical 제외. 회원 UUID·아이템명·만료 상세·응답 본문·인증 토큰을 로그/분석에 남기지 않는다. Android는 app-api 동등성, 디스크 캐시 금지, 로그아웃·계정 전환의 세션 세대 검증으로 지연 응답 폐기. 320px·200% 확대·44px 터치·키보드/aria-live·동작 감소·WCAG 2.2 AA·한영 의미 동등성.
- **관리자/KPI:** 미리보기 요청 수, 검증된 0건 비율, 401/403/429/503, p95, 이전 세션 응답 폐기를 집계하고 회원 **20명 미만 코호트는 비공개**. 회원별 조회 대시보드·외부 발송·마케팅 추론은 없다. 목표는 타 회원 정보 노출 0, 보유/WLD/원장 변경 0, 장애→0건 오표시 0, 공개 캐시 응답 0이며 실측 성공으로 주장하지 않는다.

### 개발 백로그 — P0 4건 + P1 6건 (OPEN)
1. **P0 OPS1600-01:** 운영 frontend/backend/edge 실행 SHA·복원 아티팩트·독립 복원 및 cgroup 여유 증명(#2171); 공유 프로세스 강제 종료 금지.
2. **P0 SEC1600-02:** PG17 신규·업그레이드 스키마, 앱 역할 ACL, 회원 2명 직접 EXECUTE 위조 접근 차단; 운영 전용 9개 테이블/소스 참조 5개(#2242), 체크섬 5건, 마이그레이션 318 충돌(#2233), DEV 광범위 권한(#993) 해결. 증명 전 신규 권한 금지.
3. **P0 FIN1600-03:** 실제 PostgreSQL에서 읽기 전용 및 보유 아이템/WLD/원장 변화량 0 검증, 기존 재무 출처 게이트 유지.
4. **P0 REL1600-04:** QA v1435 관리자 fixture 수정 Draft #2303(국소 37/37, 미병합), Test 백엔드/마이그레이터 DB 불일치(#2260), 운영 다국어 500(#2262), 빌드 성공만으로 자동 통합 승인하는 문제(#1088); 정확 SHA Test·전체 CI·독립 복원·운영자 승인 필수.
5. **P1 PREVIEW1600-05 (B/DB):** F675-203/205와 안전하게 공유 가능한 회원 집계, 마이크로초 경계, 두 회원 ACL, 10,001건 EXPLAIN, 직접 테이블 권한 금지.
6. **P1 PREVIEW1600-06 (B/API):** 인증 GET, 십진 문자열·UTC 정밀도, 400/401/403/429/503, SQL 제한, 비공개 헤더.
7. **P1 PREVIEW1600-07 (A):** 접근 가능한 미리보기/새로고침, 검증된 0건과 장애 구분, 자동 수신 동의·발송 보장 주장 금지, 기능 OFF 시 기존 화면.
8. **P1 PREVIEW1600-08 (C):** Android/app-api 동등성, 계정 전환 지연 응답 차단, 비공개 헤더, 디스크 캐시 금지.
9. **P1 PREVIEW1600-09 (A/C):** 회원 20명 이상 집계 KPI, 최종 엣지 SEO/개인정보, 민감 로그 금지, 320px WCAG 2.2 AA.
10. **P1 PREVIEW1600-10 (QA):** 격리 PG17 신규/업그레이드, 회원 2명·위조 100회, 보유 10,001건, 1µs 경계·KST 전환, 동시 읽기/보유 변경 100회, 429/503, Android 로그아웃, HTTP 헤더·금융 변경 0, 정확 SHA Test·롤백.

**수용시험은 제안만 했으며 실행하지 않았다.** 기능 스위치 `inventory_expiry_digest_preview` 기본 OFF. B/A/C/QA 별도 브랜치·Test 정확 SHA 검증 후 main/CI/보안/금융/백업/운영자 승인, OFF→소규모→확대. 롤백은 스위치 OFF로 기존 알림 설정 복원하며 DB 파괴적 롤백 금지. QA v1435의 fixture 통과는 전체 릴리스 통과가 아니다. 외부 독립 레퍼런스 신규 실검증·중복 제거·분류 승인 **0건**, 누적 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. **DRAFT / RELEASE HOLD**, 런타임/DB/아이템/WLD/원장/Test/Production 변경 없음.

