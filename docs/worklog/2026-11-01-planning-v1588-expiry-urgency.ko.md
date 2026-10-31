# Planning worklog / documentation-only draft v1588

## v2026.11.01.1588 — F675-203 회원 보관함 만료 임박 요약 (기능 추가 / 초안 / 운영 보류)

**주기·기준:** 이전 **기능 보완 v1586** → 현재 **기능 추가 v1588** → 다음 **기능 보완 v1590(잠정)**. 원격 main `f13bbce273ffc65e8576170992d82ea00c27a1c9` 시작·문서 작업 전 확인. 영문 PROJECT_PLAN.md 정본·한국어 의미 동등. 이전 기획 초안 **#2258**은 OPEN/미병합이므로 F675-199~202의 유효한 설계를 격리 문서 브랜치에서 승계했으며 **main 반영이나 구현을 뜻하지 않는다**. 개발 인계 **#2268**, 초안 PR **#2269**. **DRAFT / RELEASE HOLD**.

### 사용자 목적·실제 소스·대안
- **대상·목적:** 인증 및 필수 동의를 완료한 회원이 보유 아이템 중 만료가 가까운 종류·수량을 전체 목록 탐색 없이 확인한다. **겹치지 않는** 향후 0~24시간, 24~72시간, 72~168시간 구간별 상품 종류 수, 보유 수량과 가장 빠른 보유 만료시각을 제공한다. 알림 발송, 결제, 유지비 정산, 장착, 아이템 사용, WLD 이전이나 사용 가능 보장을 의미하지 않는다.
- **검증한 원본:** `frontend/src/app/inventory/page.tsx`는 `requireMember()` 후 `apiOrNull('/api/v1/shop/holdings')`를 호출하며 상위 API 장애를 `[]`로 바꿀 수 있다. `inventory-view.tsx`에는 카테고리 탭과 장착 미리보기가 있지만 임박 요약은 없다. Nest `shop.controller.ts`·`shop.repository.ts`는 회원 보유 읽기를 제공한다. 마이그레이션 **071**의 `user_items`는 회원/상품 복합 PK, 음수가 아닌 수량과 NULL 가능 `expires_at`을 정의한다. **123**의 `shop_my_items_v2(p_actor)`는 회원·양수 수량·미만료 보유를 필터링하지만 `clock_timestamp()`를 별도 호출하며 효과 영수증의 `effect_expires_at`은 **보유 만료와 별개**다. 보유 만료는 효과 만료, 연체 납부, 사용 가능성, 알림 도달 증거가 아니다. F675-199 달력·200 ICS·201 저장 보기·202 기본값은 모두 **미구현 기획**이며 본 기능의 선행 구현 조건이 아니다.
- **대안:** A 브라우저에서 기존 전체 보유 배열 집계는 10,001건 이상 비용 및 거짓 빈 결과 문제로 제외. B 회원별 예약 캐시는 지연·개인정보·불필요한 작업 때문에 제외. **선택 C:** 회원 전용 PostgreSQL 읽기 집계 함수 + 타입 검증 Nest GET + 웹/Android 앱 API 동등성. 신규 테이블, 금융·아이템 쓰기 없음.

### 화면·권한·상태·접근성
- **진입:** 기존 `/inventory`의 로그인 및 동의 확인 후 기능 스위치 `inventory_expiry_urgency_summary`(기본 **OFF**)로 '보유 만료 임박' 카드 표시. 세 구간별 서로 겹치지 않는 수치와 '보관함 보기' CTA를 제공한다. '만료 달력 열기'는 F675-199가 실제 구현·활성화된 뒤에만 표시하며 미구현 경로를 노출하지 않는다. 구간은 한국시간의 '오늘/이번 주'가 아니라 **현재부터 흐르는 24·72·168시간**임을 설명하고 기준시각을 한국시간으로 표기한다.
- **상태:** 최초 로딩, `200 VERIFIED_COUNTS`, 실제로 0건임이 확인된 `200 VERIFIED_EMPTY`, `401 UNAUTHENTICATED`, `403 CONSENT_REQUIRED`, `429 RATE_LIMITED`, `503 SOURCE_UNAVAILABLE`/원본 형식 오류, 오프라인, 로그아웃·계정 전환. 장애를 0건으로 표시하지 않는다. 이전 정상 결과를 보여주더라도 동일 세션의 '오래된 정보'로 명확히 표시하며 계정이 바뀌면 전부 폐기한다. 요약 장애로 기존 보관함·장착 화면을 숨기지 않는다.
- **접근성·모바일:** 너비 320px, 확대 200%, WCAG 2.2 AA, 키보드/보이는 포커스, 44px 터치, 수량과 만료시각 음성 안내, 정상 상태의 `aria-live=polite`, 모션 축소, 한·영 문구. Next·Android는 요청 식별자와 세션 세대를 결속해 늦은 응답·계정 전환·로그아웃 후 응답을 버리고 디스크·공용 캐시에 보존하지 않는다.

### API·DB·보안 계약 — 제안이며 미구현
- **GET** `/api/v1/shop/expiry-urgency`: 서버가 인증 세션과 동의에서 회원을 결정하며 요청의 `userId`, 임의 `asOf`, 카테고리·SQL 조건을 받지 않는다. 응답은 `{status:'VERIFIED_COUNTS'|'VERIFIED_EMPTY',asOf:ISO8601Microseconds,timezone:'Asia/Seoul',bands:[{id:'H0_24'|'H24_72'|'H72_168',kindCount:decimalString,unitCount:decimalString}],total7d:{kindCount:decimalString,unitCount:decimalString},nextExpiryAt:ISO8601Microseconds|null}`. 종류 수·수량은 2^53을 넘더라도 손실 없는 **0 이상의 정수 문자열**이며 DB 마이크로초는 ISO 문자열로 보존하고 UI 표시 때만 현지화한다. 누락·음수·소수·오버플로·구간 합계 불일치면 `503`, 정상 빈 결과만 `200 VERIFIED_EMPTY`. 회원당 분당 30회 읽기 제한 제안, `429` 및 제한된 재시도 안내. GET은 멱등 영수증·쓰기 트랜잭션이 없다.
- **단일 SQL 원본:** 신규 `public.shop_my_expiry_urgency_v1(p_actor uuid)`은 `STABLE SECURITY DEFINER SET search_path=pg_catalog,pg_temp`인 읽기 함수. 단일 READ COMMITTED SQL 문에서 `statement_timestamp()`를 한 번만 MATERIALIZED CTE로 캡처한 `asOf`를 사용한다. `user_items`의 `user_id=p_actor`, `quantity>0`, `expires_at IS NOT NULL`, `expires_at>asOf`, `expires_at<=asOf+interval '168 hours'`만 집계한다. 구간 경계는 `(asOf,asOf+24h]`, `(asOf+24h,asOf+72h]`, `(asOf+72h,asOf+168h]`이며 정확히 경계에 걸리면 앞 구간이다. 회원/상품 PK이므로 `count(*)::bigint`는 **상품 종류 수**, `sum(quantity::bigint)`는 큰 수를 손실 없이 집계하며 `min(expires_at)`는 가장 이른 만료다. 7일 총합은 세 구간의 정확한 합. NULL 만료는 **기한 미상으로 제외**하며 영구 보유라고 단정하지 않는다. 이미 만료된 보유는 제외한다. `effect_expires_at`·장애 시 0 대체 금지. 동일 SQL 문 스냅샷만 보장하고 HTTP 요청 사이 일관성이나 커밋시각 증명은 주장하지 않는다. 신규 테이블·물리화 뷰·스케줄러 없음.
- **권한·인덱스·트랜잭션:** 함수 소유자는 migrator, PUBLIC EXECUTE 철회 후 앱 역할에 해당 함수 EXECUTE만 허용, `user_items` 직접 읽기·쓰기 권한 추가 금지. `p_actor` 자체는 인증이 아니므로 Nest가 검증된 세션에서 유도한다. 데이터·원장 쓰기 없음. 기존 회원/상품 PK로 회원 필터링 후 합성 10,001건 `EXPLAIN (ANALYZE, BUFFERS)`로 필요성을 확인한 뒤에만 선택적 `(user_id,expires_at)` 부분 인덱스 검토. 동시 인덱스 생성은 별도 비트랜잭션 마이그레이션 승인이 필요하며 무잠금이라고 단정하지 않는다. **#2233 마이그레이션 318 충돌 해결 전 번호 예약 금지**, 적용된 SQL 체크섬 수정 금지.
- **개인정보·SEO·관리·분석:** Nest→Next→Android 앱 API→Nginx의 실제 HTTP 응답(오류 포함)에 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` 적용. 회원 ID·정확 수량·URL·토큰·만료시각을 공용 캐시·분석 로그로 보내지 않는다. 관리자 KPI는 20명 이상 집계 집단에 한해 정상 조회·503/429 비율·p95 지연·보관함 진입을 집계한다. 10,001건에서 p95 <250ms 및 공용 캐시 0건은 **목표일 뿐 실측 아님**. 회원별 관리자 조회나 새로운 쓰기 권한 없음.

### 개발 인계 — P0 4건 + P1 6건 (전부 미완료)
1. **P0 OPS1588-01** (#1984/#2144/#2171): 운영 프론트·백엔드·엣지 실행 SHA, DB 결속, 작업 수 여유, 독립 백업 복원·롤백 증명.
2. **P0 SEC1588-02** (#993/#2242/#2233): 운영 전용 9개 테이블(소스 참조 5개), 앱 역할 광범위 DML, 체크섬 5건, 318 번호 충돌 조정 및 최소 권한 검증.
3. **P0 FIN1588-03** (#2191/#1976): 국고·마켓·클럽 원장 출처 및 요약 기능의 WLD·아이템 변경량 0 검증.
4. **P0 REL1588-04** (#2260/#2262/#2263): 공식 Test 앱/마이그레이터 DB 대상 불일치와 운영 다국어 HTTP 500 해결, 전체 QA·감사, 정확 SHA 격리 Test 인증 E2E, 독립 복원, 운영자 GitOps 승인.
5. **P1 URGENCY1588-05 Backend B:** 단일 시각·경계·대정수·ACL·EXPLAIN의 회원 SQL 함수, 마이그레이션 번호 조율.
6. **P1 URGENCY1588-06 Backend B:** 인증·동의 결속 Nest GET, 엄격한 200 정상/503 미확인/429 제한, 데이터 쓰기 없음.
7. **P1 URGENCY1588-07 개발 A:** 보관함 임박 카드·3구간·정상 0/장애 구분·접근성·기능 OFF·기존 보관함 독립 유지.
8. **P1 URGENCY1588-08 개발 C:** Android 앱 API 경로·응답 검증·계정/세션 세대 차단·디스크 캐시 금지·한영 동등성.
9. **P1 URGENCY1588-09 개발 A/C:** 실제 엣지 비공개·SEO 회귀, 20명 이상 집계 KPI, 개인정보·정확 수량 유출 금지.
10. **P1 URGENCY1588-10 QA:** 폐기형 PG17 신규·업그레이드, 보유 10,001건, 회원 2명, 동시 변경, 경계 ±1마이크로초, NULL·기만료·효과만 만료, 2^53 초과 합계, 권한 거부, 429/503, Android, 원장 변화 0, OFF 롤백; 공식 정확 SHA Test와 독립 복원.

### 수용시험·배포·외부 근거 게이트
- 위 신규 기능 수용시험은 모두 **제안만 했으며 실행하지 않았다**. SQL/API/웹/Android 신규 기능은 미구현이다. 기존 `apiOrNull → []` 거짓 빈 결과는 개발 담당자의 별도 결함이며 신규 카드로 은폐하지 않는다. QA v1429 **#2260**에서 공식 Test 앱/마이그레이터 DB 대상 불일치(구형 마이그레이터 246개, 실제 앱 316개 적용), **#2262/#2263**에서 운영 다국어 HTTP 500과 초안 수정이 확인됐다. QA v1426 **#2242**의 운영 전용 테이블·권한 문제도 미해결이다. 공개 Test `bc8cd8a6...`, 운영 `353c6d5d...`, main `f13bbce...`는 서로 다르며 실행 출처 검증은 **BLOCKED**다.
- **무중단 배포:** 스위치 OFF → 신규 함수·API를 검토한 전진형 변경 → 정확 후보 SHA 격리 PG/CI → 공식 Test 웹·Android·엣지 인증 시험 → 독립 복원·운영자 GitOps 승인 → 단계별 ON. **롤백:** OFF 및 이전 불변 이미지로 복귀, 클라이언트 소멸 전 추가 SQL 보존. 자동 병합·배포 없음, Gemini/개발 A/B/C/QA 브랜치·예약 불변. 외부 독립 근거 신규 검증 승인 **0건**, 누적 검증·중복 제거·근거 분류 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. **초안 / 운영 보류**.

### 검증 및 최종 로컬 기록 (2026-11-01 KST)
- **시작:** 원격 main f13bbce273ffc65e8576170992d82ea00c27a1c9, 소스·QA·AGENTS·Superpowers 확인, 이전 #2258 OPEN/미병합. **진행:** 별도 문서 브랜치, 이슈 #2268, 초안 #2269, 영문·국문 통합문서 반영. **로컬 완료:** 릴리스 140/140, 분류 24/24, 영문·국문 4쌍, git diff --check PASS.
- **기존 실패:** 확장 브랜치 정리 워크플로 4 PASS / 1 FAIL, 변경하지 않은 main에서도 동일하게 재현. **미수정.** 신규 SQL/API/Android 수용시험은 제안만 했으며 미실행. 런타임·DB·원장·Test·Production 변경 및 main 병합 없음.
- **원격 게이트:** 최종 SHA CI·Build Test Candidate 결과는 GitHub 초안 PR #2269 댓글에 기록하며 문서 전용 분류로 런타임 빌드는 건너뛴다. **초안 / 운영 보류**, 공식 정확 SHA Test 인증 E2E·금융/권한·독립 복원·운영 승인 BLOCKED. 외부 근거 신규 0·누적 UNKNOWN / 10,000.
