# 월덕 머니버스 — 통합 기획 마스터
**현재 기획:** v1512 F675-184 회원 보관함 검색·정렬 / 인계 #2013 / 초안 PR #2014 / 운영 보류; #2008 종속.

## v2026.10.30.1512 — F675-184 회원 보관함 검색·정렬 (기능 추가 / 초안 / 운영 보류)

**이전 / 현재 / 다음:** 기능 보완 v1510 / 기능 추가 v1512 / 기능 보완 v1514(잠정). 기준 main 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef를 시작·중간에 재확인. 기획 초안 #2008 후속 스택(#2003/#1995/#1990/#1983 종속), 개발 인계 #2013; 초안 PR #2014. 영문 PROJECT_PLAN.md가 원본이고 본 문서는 의미 동등한 한국어 대조본. 문서 제안일 뿐 구현·승인된 설계가 아니다. 별도 분산 기획 파일은 생성하지 않는다.

### 실제 소스에서 확인한 기능 공백과 설계 선택
- frontend/src/app/inventory/page.tsx는 회원 인증 후 GET /api/v1/shop/holdings를 apiOrNull로 호출한다. inventory-view.tsx에는 카테고리 탭만 있으며 키워드·희귀도·장착 여부 필터와 획득일·이름 정렬은 없다. API 실패 시 null을 빈 배열로 처리해 실제 장애를 '보유 아이템 없음'으로 잘못 표시할 수 있다. 기존 장착 POST는 별개이며 본 기능에 포함하지 않는다.
- Nest ShopController.holdings는 인증된 회원 UUID를 ShopCatalogRepository.holdings에 전달하고, 이는 마이그레이션 123의 public.shop_my_items_v2(actor)를 호출한다. SECURITY DEFINER 함수는 회원 본인·수량>0·미만료 아이템만 반환하고 acquired_at DESC, catalog_id 순으로 정렬하며 희귀도·장착·만료·연체·중단 상태를 포함한다. 앱 역할의 함수 EXECUTE는 원본 테이블 직접 SELECT 권한이 아니다. actor UUID 인자만으로 DB 호출자 신원이 인증되는 것은 아니므로 Nest 세션·동의 결속이 필수다. 이 사실은 Production 아이템 수량을 증명하지 않는다. 추가 읽기 전용 DEV PostgreSQL 17.11 실측에서 moneyverse_app의 public.user_items 직접 SELECT와 DELETE 유효 권한이 모두 true였으며, shop_my_items_v2 함수 EXECUTE도 true였다(DEV 6행 집계). 의도한 최소 권한과 충돌하므로 P0 #993을 해소하기 전 기능 공개 금지. Production 권한이나 침해 사실을 의미하지 않는다.
- 대안 A: 현재 전체 목록을 브라우저에서 필터링하면 쉽지만 10,001건 이상의 네트워크·메모리·CPU 사용을 제한하지 못하고 거짓 빈 목록 문제를 유지한다. 대안 B: 별도 검색 테이블·물리화 인덱스는 동기화 및 마이그레이션 위험이 과도하다. **V1 제안은 신규 테이블·금융 쓰기 없이, 제한된 본인 전용 SQL 읽기 함수와 형식 검증 API를 추가하는 것**이다. Backend B의 307–311 마이그레이션 스택 뒤에 번호를 조율하며 이번 기획은 번호를 예약하지 않는다.

### 목적·대상·권한·진입·화면·상태
- 목적은 회원이 전체 보관함을 훑지 않고 본인 소유 아이템을 찾도록 돕는 것이다. /inventory에서 '아이템 찾기' 검색창, 검색/초기화 CTA, 기존 카테고리 탭, 희귀도 드롭다운(원본에 존재하는 all/common/uncommon/rare/epic/legendary/mythic), 장착 중만 토글, 최근 획득/오래된 획득/이름 가나다 정렬을 제공한다. 아바타 미리보기·장착/해제 기능을 유지하되 신규 검색은 GET 읽기 전용이며 장착·구매·유지비 납부·WLD 발행/이체를 하지 않는다.
- 기본값은 검색어 없음·전체 카테고리·전체 희귀도·장착 전체·최신순·20건/페이지(서버 최대 50)다. 검색어가 있으면 공백 제거 후 유니코드 2~40글자, 정규식이 아닌 글자 그대로 부분 일치. SQL LIKE의 %, _, 역슬래시를 이스케이프하고 제어문자·중복 매개변수·미지원 값·초과 길이·비정상 UTF-8을 거부한다. Nest/Next/Android가 같은 필터를 정규화하며 공개 상점 상품을 섞지 않는다. 400에서는 입력을 유지하고 수정 방법을 안내한다.
- 화면 상태는 초기(기존 보관함), 로딩, 검증된 결과, 검증된 검색 결과 없음(전체 보유 0개와 구별), 필터 초기화, 계정 전환 중, 원천 변경 409(새로고침), 커서 만료 410(첫 페이지 다시 시작), 요청 제한 429, 서버/DB 불가 503(재시도), 오프라인, 미인증, 동의 만료로 구분한다. 원천 오류를 holdings=[] 또는 성공형 수치로 바꾸지 않으며 오래된 장착 미리보기와 새 검색 결과를 섞어 표시하지 않는다. 정확한 전체 건수는 동일 읽기 트랜잭션에서 검증한 경우에만 제공한다.
- 모바일·접근성은 320px, 200% 확대, 44px 터치 영역, WCAG 2.2 AA, 명시적 레이블, Enter 검색, 페이지 이동·오류 후 키보드 초점 복원, 포커스를 빼앗지 않는 aria-live, 모션 축소, 한국어/영어, 현재 페이지의 검증된 결과 건수 스크린리더 안내를 요구한다. 입력할 때마다 자동 전송하지 않는다.

### API·DB·인덱스·트랜잭션·동시성
- Nest GET /api/v1/shop/holdings/search?q=&category=&rarity=&equipped=&sort=&limit=&cursor=는 SessionGuard·AuthenticatedGuard·ConsentGuard를 통과한 본인만 호출한다. Next 서버 전용 BFF는 허용 목록의 쿼리만 내부 API로 전달하고, Android GET /app-api/v1/shop/holdings/search는 기존 인증 게이트웨이·생성 계약과 동등하게 처리한다. 응답은 {items:[기존 HeldItem DTO],pageSize,hasMore,nextCursor,sourceStatus:'VERIFIED',asOfUtc}이며 타인 아이템·원장 감사정보는 포함하지 않는다. 오류는 400 잘못된 입력, 401 미인증, 403 동의 부족, 409 원천 변경, 410 커서 만료, 429 요청 제한, 503 DB/원천 불가로 구분한다. 타인 아이템 ID는 입력으로 받지 않는다.
- DB는 검토된 전방 마이그레이션으로 public.shop_my_items_search_v1(p_actor uuid, p_query text, p_category text, p_rarity text, p_equipped boolean, p_sort text, p_limit integer, p_after_* 커서 키)를 추가한다. SECURITY DEFINER, 고정 search_path, 스키마 명시, 한 요청 내 읽기 전용 REPEATABLE READ, held.user_id=p_actor, 수량>0, asOf 시각 기준 미만료, 기존 shop_my_items_v2와 동일한 연체·미리보기 의미를 지킨다. PUBLIC EXECUTE 회수, 앱 역할에 함수 EXECUTE만 부여하고 user_items/shop_catalog/shop_upkeep_arrears/영수증 테이블 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE 불가를 재선언·음성시험한다. 신규 테이블·외래키·잔액 변경·쓰기 트랜잭션 없음. 기존 PK/FK/수량·만료 제약을 유지한다. (user_id, acquired_at DESC, catalog_id DESC), (user_id,catalog_id), 카탈로그 category/rarity/lower(name) 인덱스는 합성 10,001건 EXPLAIN/BUFFERS 후 중복 없이 필요한 것만 전방 추가한다.
- 최신/오래된순 커서는 획득시각 마이크로초+catalog_id UUID, 이름순은 lower(name) COLLATE C+catalog_id UUID로 안정 정렬하고 OFFSET은 사용하지 않는다. 15분 이내 HMAC-SHA256 커서는 목적/버전·회원·세션 세대·정규화된 필터/정렬·UTC 마이크로초 asOf·마지막 키·만료를 결속한다. 서명·회원·정렬·필터·세션 불일치는 400/409, 만료는 410. HTTP 요청 간 MVCC 스냅샷을 공유할 수 없으므로 매 페이지 본인 원천 집합의 버전/지문을 재검증한다. 아이템 추가·장착·만료 등 원천 변경은 409 REFRESH_REQUIRED로 처리하며 불변 목록이라고 거짓 주장하지 않는다. 전체 지문 계산이 10,001건에서 p95 300ms 목표를 넘으면 공개를 보류하고 세대 관리 방식을 재설계한다. 50+1 조회·SQL 시간·요청률·응답 크기를 제한한다.
- GET은 멱등성 키나 쓰기 트랜잭션이 필요 없다. 장착·구매·유지비 납부는 기존 별도 인증·CSRF·멱등성 보호 경로를 유지하며 검색이 이를 우회하지 못한다. Android는 로그아웃·계정 전환 시 진행 중 요청을 취소하고 이전 응답을 버리며 디스크 캐시를 사용하지 않는다.

### 관리자·보안·악용 방지·SEO·지표·배포
- 성공·오류 응답 모두 Cache-Control private,no-store, X-Robots-Tag noindex,nofollow, no-referrer를 적용하고 검색 URL을 사이트맵·색인 대상에서 제외한다. Production의 비공개 경로 HTTP 로봇 헤더 모순 #2012를 고려해 Next 메타데이터뿐 아니라 실제 HTTP 헤더를 검사한다. 검색어·아이템명·회원 UUID·서명 커서·원문 응답은 로그/분석에 저장하지 않는다. 회원별 요청률, SQL CPU·메모리·응답 크기 제한. V1에서 관리자의 개별 회원 보관함 검색은 제공하지 않는다.
- 관리자 지표는 서로 다른 회원 20명 이상 집단에서만 주간 이용, 검증된 검색 완료, 빈 결과 비율, 400/409/410/429/503, p95 지연, 필터 사용, 계정 전환 중 오래된 응답 차단 수를 익명 집계한다. 원문 검색어·개인 ID는 금지한다. p95 300ms 미만·타인 노출 0·원장 쓰기 0은 실측 결과가 아닌 수용 목표다.
- 기능 스위치 inventory_find_sort는 기본 OFF. 개발 A/B/C/QA는 별도 브랜치·테스트 Docker에서 진행하고 SQL 번호·계약을 조율한다. 후보 정확 SHA의 프론트·백엔드·엣지·Android 인증 E2E, 전체 CI, 보안·권한 음성시험, 독립 백업 복원·금융 불변식을 검증해야 한다. OFF→내부 운영자→제한 회원→관찰→확대, 실패 시 OFF 롤백으로 기존 카테고리 탭·장착 흐름을 보존하며 보유품·영수증·인덱스를 삭제하지 않는다. P0 해결 전 Production 승격 금지; 기획 예약은 배포하지 않는다.

### 개발 인계 — P0 4건 + P1 6건
1. **P0 OPS1512-01** — #1984 운영 표시 SHA 94d38f4와 삭제된 이전 실행 경로 불일치; 재시작 전 실행 바이너리·엣지 매니페스트·롤백 자산·독립 복원 증명.
2. **P0 SEC1512-02** — #993 개발 DB 광범위 직접 DML, 적용 체크섬 5건, 새 DB 은행 포켓 #2000, 알림 DDL #1693, B 307–311 스택 조율. 직접 GRANT·기존 마이그레이션 변경 금지.
3. **P0 FIN1512-03** — 국고 원장 미연계 552건, MINT/SWF 출처, 탐색 잔액 24건과 정규 0건을 동일 스냅샷·범위에서 검증. 보관함 읽기를 금융 정산 증명으로 사용 금지.
4. **P0 REL1512-04** — QA v1391 백엔드 119 FAIL / 2,563 PASS / 495 SKIP, 프론트 53 FAIL / 2,607 PASS, 전체 의존성 감사 비정상, #2012 비공개 HTTP 로봇 헤더. 전체 CI·공식 Test 정확 SHA·독립 복원·금융/보안/엣지 게이트.
5. **P1 INVENTORY1512-05** — B/QA 기존 원천과 동등한 본인 SQL 검색 함수·안정 커서·필요 인덱스·직접 권한/타인 음성시험·EXPLAIN. #2011 이후 마이그레이션 번호 조율.
6. **P1 INVENTORY1512-06** — B Nest 형식 검증 GET, 쿼리 허용 목록, HMAC 커서, 400/401/403/409/410/429/503 오류 차단, 자원 제한.
7. **P1 INVENTORY1512-07** — A/C Next 검색/초기화·희귀도·장착·정렬, 기존 카테고리/장착 보존, 검증된 빈 결과와 장애 구분, 키보드·320px·접근성.
8. **P1 INVENTORY1512-08** — C Android 게이트웨이·생성 API 계약 동등성, no-store/noindex, 계정 전환 취소·오래된 응답 폐기·디스크 캐시 금지.
9. **P1 INVENTORY1512-09** — A/C 익명 20명 이상 관리자 지표, HTTP 로봇/캐시 헤더, 검색어·UUID 로그 금지, 기본 OFF·단계적 공개·롤백.
10. **P1 INVENTORY1512-10** — QA 격리 PostgreSQL 17.11 합성 보유 10,001건 이상, 타인 100, 위조 커서 100, 동시 100, 아이템/장착/만료 변경 50, 한국어/로케일/시각 경계 30, 비정상/503 50; 원장·아이템 쓰기 0, 공식 Test 정확 SHA·롤백 증명.

**수용시험은 계획만 작성하고 실행하지 않았다.** 기존과 같은 보유품 가시성·만료 경계·희귀도·마이크로초 정렬·원천 변경 409·검증된 빈 목록과 장애 구분·타인 차단·HTTP 개인정보 헤더·기본 OFF 복귀를 확인해야 한다. 외부 독립 레퍼런스 신규 근거 승인 0건, 누적 중복 제거·승인 UNKNOWN / 10,000건 => BLOCKED / IN PROGRESS. 런타임·DB·WLD·원장·Test·Production 변경 없음. DRAFT / RELEASE HOLD.


## v2026.10.30.1510 — F675-183 주간 퀘스트 원본 집계 동등성 보완 (기능 보완 / 초안 / 운영 보류)

**이전/현재/다음:** 기능 추가 v1508 / 기능 보완 v1510 / 기능 추가 v1512(잠정). main SHA 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef 시작·중간 재확인. #2003의 후속 문서, #1995 → #1990 → #1983 종속, 기존 개발 인계 #2002, 초안 #2008. 기준은 main의 AGENTS.md·README.md·영문 PROJECT_PLAN.md이며 본 문서는 동등한 한국어 대조본. 별도 분산 기획 없음.

### 마이그레이션 101에서 확인한 정합성 위험
- packages/database/migrations/101-early-game-progress.sql:437–566의 public.early_game_weekly_goals(p_actor)는 한국시간 clock_timestamp()로 주 시작을 정하지만 영수증·원장에는 **created_at >= v_from 하한만 적용**한다. 다음 월요일 상한과 공통 asOf 시각은 없다. v1508의 [월요일, 다음 월요일) 상세는 미래 시각·소급 입력·주 경계에서 원본과 달라질 수 있다. 같은 DB 트랜잭션에서 4개 지표를 원본 101과 대조하기 전에는 검증으로 표시 금지. 상한 변경은 기존 101 수정 없이 원본·상세를 함께 전방 마이그레이션으로 처리.
- 직업 목표는 현재 user_job_progress의 **최고 레벨 직업**을 level DESC, job_type 열거형 순으로 선택한다. selected_at 직업이나 영수증 당시 직업이 아니다. 서로 다른 작업은 DISTINCT assignment.task_id, 직업 작업은 그 직업에 해당하는 보상 영수증 행 수다. 작업별 묶음 한 행을 영수증 한 건으로 합산하면 안 되며 직업 순위만 바뀌어도 주간 수치가 변할 수 있다.
- 소비는 USER_CASH credit 전표 중 SHOP_CATALOG_PURCHASE, SHOP_PURCHASE, BUSINESS_PURCHASE, CONSUMPTION_EVENT 네 유형만 포함한다. 저축은 USER_BANK에서 BANK_DEPOSIT/BANK_WITHDRAW의 debit-credit 순액을 GREATEST(net,0)으로 제한한다. 원본 101에는 accounts.currency='WLD' 명시 필터가 없어 신규 상세에만 추가하면 불일치할 수 있다. 일부 50건 페이지의 합계를 전체 진행률로 사용하지 않는다.
- NPC는 이번 주가 아닌 평생 MAX(npc_relationships.affinity), self_reported=true다. 주문 버튼 입력은 배달 확인 영수증이 아니므로 AGGREGATE_ONLY / SELF_REPORTED, 가짜 개별 기록·시각·검증 배지 금지.

### 보완한 본인 전용 V1 계약
- **목적·진입·권한:** 회원이 본인 목표 진행의 실제 근거를 이해하도록 한다. /quests의 근거 보기 → /quests/weekly-evidence?goal=<활성코드>&week=<현재 KST 월요일>. 인증·동의 회원 본인만 조회, 기능 quest_weekly_evidence 기본 OFF. NPC의 week는 게시판 기준이며 실제 범위는 lifetime을 명확히 표시. 과거 내역·보상 청구·정산 인증·원장 쓰기·상대방 노출 금지.
- **단일 스냅샷:** Nest가 DB KST 주·asOfUtc를 한 번 결정하고 읽기 전용 REPEATABLE READ에서 원본 101과 상세의 목표 코드·지표·범위·목표값·진행률·자기신고 여부를 대조한다. 완전 일치할 때만 sourceStatus=CANONICAL_MATCHED, 불일치는 성공형 0/목록 없이 503 PARITY_UNVERIFIED. 월요일 변경은 409 WEEK_CHANGED와 새로고침. HTTP 요청 사이 MVCC 스냅샷 재사용 불가.
- **커서·동시성:** 버전·목적 분리 HMAC-SHA256(15분)에 회원·세션 세대·목표·KST 주·집계/카탈로그 버전·최고 레벨 직업·UTC 마이크로초 기준시각·전체 적격 원천 집합 지문·마지막 (시각,UUID/묶음키)·만료를 결속한다. 50+1/최대 50, 안정 정렬. 보이는 페이지가 아닌 **전체 원천** 지문 재검증. 소급·삭제·직업 변경은 409 EVIDENCE_CHANGED, 만료는 410. 합성 10,001건 이상에서 p95 300ms 목표를 넘으면 성능 보류·재설계.
- **API·화면:** Nest GET /api/v1/engagement/early-game/weekly-evidence 및 Android /app-api/v1/...; {goalCode,weekStartKst,windowKind,weekEndExclusiveUtc,metric,target,progress,selfReported,sourceStatus,evidenceStatus,asOfUtcMicros,rows,nextCursor}. BIGINT/WLD는 정확한 10진 문자열, 시각 마이크로초 보존, 목록은 부분 근거이지 합산 총계가 아니다. NPC는 목록·다음 커서 없음. 400 잘못된 값, 401 인증, 404 타인/없음 동일, 409 변경, 410 만료, 429 제한, 503 원본/DB 불가. 로딩·검증된 빈 목록·집계 전용·변경·재시도·장애를 구분하며 가짜 달성 금지.
- **DB·보안:** 고정 search_path, 명시적 스키마, PUBLIC EXECUTE 회수, 최소 앱 EXECUTE의 본인 전용 SECURITY DEFINER 읽기. **p_actor 인자만으로 DB 호출자의 신원을 증명할 수 없다.** Nest 세션·동의·회원 결속, 직접 DML/SELECT 권한 음성 시험, EXPLAIN/BUFFERS 후 인덱스 판단. V1 신규 테이블 불필요. 개인정보 ID 로그 제거, 웹·Android 모든 상태 no-store/noindex/no-referrer, 계정 전환 취소·디스크 캐시 금지, 320px/200% 확대·44px·WCAG 2.2 AA·키보드·초점 복원.
- **관리·배포:** 관리자는 회원 개별 근거를 볼 수 없고 익명 20명 이상 집단의 조회·NPC·정합성 오류·변경·503·p95만 본다. p95 <300ms는 실측이 아닌 목표. 별도 브랜치/테스트 Docker, 전체 CI·공식 Test 정확 SHA 인증 E2E·독립 복원·금융/보안 게이트 통과 후 기본 OFF→제한 공개→관찰→OFF 롤백. 기획 예약은 배포 금지.

### P0 4건 + P1 6건 개발 인계
1. **P0 OPS1510-01** — Production 엣지 94d38f4와 #1984의 삭제된 v1515 프로세스 경로 불일치. 바이너리·링크·매니페스트·엣지·독립 복원 가능한 롤백 자산 보존 후 재시작 판단.
2. **P0 SEC1510-02** — 적용 체크섬 5건, 개발 DB 광범위 DML #993, 깨끗한 DB 은행 포켓 #2000, 알림 DDL #1693, B 마이그레이션 307–310 종속 관계 조사. 임의 GRANT/기존 SQL 변경 금지.
3. **P0 FIN1510-03** — 국고 미연계 552건, MINT/SWF 출처, 탐색 잔액 24건과 정규 0건을 동일 범위·스냅샷에서 독립 대조. 퀘스트 조회를 정산 인증으로 사용 금지.
4. **P0 REL1510-04** — QA v1390 백엔드 119 FAIL / 2,563 PASS / 495 SKIP, 프론트엔드 기존 53 FAIL, 계약 41 PASS는 배포 인증 아님. 전체 CI·공식 Test 정확 SHA·독립 복원·금융/인증/보안/엣지 게이트.
5. **P1 QUEST1510-05** — B/QA가 격리 PostgreSQL 동일 REPEATABLE READ에서 상세 4종과 원본 101 비교. 주간 상한/통화 의미 변경 시 원본과 함께 전방 마이그레이션.
6. **P1 QUEST1510-06** — B가 본인 EXECUTE 전용 SQL, 활성 카탈로그, 최고 레벨 직업 동률, 소비 허용 목록·은행 순저축, 작업 묶음, 전체 지문, 권한 음성·EXPLAIN 구현.
7. **P1 QUEST1510-07** — A/B Nest 세션·회원·동의 결속, 엄격 DTO, KST 현재 주, 서명 커서와 400/401/404/409/410/429/503 정합성 실패 차단.
8. **P1 QUEST1510-08** — A/C Next CTA·상세, 주간/평생 NPC 구분, 일부 페이지/비가산 합계 설명, 로딩/오류/재시도, 320px/200%/WCAG AA·키보드·초점.
9. **P1 QUEST1510-09** — C Android 응답·헤더 동등성, 계정 전환 취소·디스크 캐시 금지, 관리자 익명 20명 이상 KPI·개인정보·기본 OFF.
10. **P1 QUEST1510-10** — QA 격리 PostgreSQL 17.11 합성 10,001건 이상, 타인 100, 커서 위조 100, 동시 100, 소급/직업 변경 50, KST 경계 30, 비정상/장애 50; 원본 대조·원장 쓰기 0·정확 SHA Test/롤백.

**수용시험 계획만 작성, 미실행:** 미래 시각 행·최고 레벨 직업 동률·은행 순인출·타 통화·평생 NPC·일부 페이지 합계 검증 포함. 외부 독립 레퍼런스 신규 승인 0, 누적 UNKNOWN / 10,000, BLOCKED / IN PROGRESS. QA v1390은 운영 인증 아님. DRAFT / RELEASE HOLD.


## v2026.10.30.1508 — F675-183 회원 주간 퀘스트 달성 근거 상세 (기능 추가 / 초안 / 운영 보류)

**이전/현재/다음 주기:** 기능 보완 v1506 / 기능 추가 v1508 / 기능 보완 v1510(잠정). 시작·중간 확인한 origin/main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`. 미병합 초안 #1995 → #1990 → #1983에 문서만 누적. [P0/P1 개발 인계 #2002](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/2002). 기술 기준은 AGENTS.md, README.md, 영문 PROJECT_PLAN.md 원본이며 본 문서는 동등한 국문 대조본이다.

### 목적, 기존 소스 근거 및 범위 구분
- **확인된 공백:** `frontend/src/app/quests/page.tsx`는 `GET /api/v1/engagement/early-game`의 주간 목표 4개를 표시하지만 어떤 작업 보상 영수증·허용된 원장 전표가 수치에 기여했는지 상세 화면은 없다. `packages/database/migrations/101-early-game-progress.sql`이 집계한다. 지갑 거래 상세 F675-182, 날짜 지정 F675-181, 저장 필터, Android 은행 포켓 개선과 별도 기능이며 이번 회차 런타임 구현은 없다.
- **대상/성과:** 인증 및 동의한 회원이 자기 주간 퀘스트 수치의 출처를 읽기 전용으로 확인한다. 직접 보상을 생성하거나 금융 잔액을 별도로 계산하지 않는다. 근거가 없다는 사실과 API 장애를 구분하고, 실제 없는 수령·정산 완료를 표시하지 않는다.
- **V1:** 한국시간 월요일~일요일의 현재 주간만 제공. 과거 아카이브·내보내기·보상 청구·거래 수정·타인 정보·관리자 개인별 조회는 제외. 지표는 `distinct_work_tasks`(영수증 건수가 아닌 고유 작업 종류), `job_work_completions`(선정 직업의 검증 작업 영수증), `spend_or_save`(허용된 현금 소비 + max(0, 은행 입금-출금), 정확한 WLD 정수), `npc_affinity`(관계도 현재 집계만 제공)이다. 101번 마이그레이션의 거래 유형 허용 목록을 보존하며 주식 매수·카지노 손실·임의 출금을 소비로 분류하지 않는다.

### 권한·진입점·화면·CTA·상태
- **진입:** `/quests` 주간 목표 카드에 ‘근거 보기’ 버튼을 추가해 `/quests/weekly-evidence?goal=<목표코드>&week=<YYYY-MM-DD>`로 이동. 서버의 `requireMember` 및 세션·동의 검증 후에만 조회. `quest_weekly_evidence` 기능 스위치 기본 OFF. 목표 코드는 등록된 카탈로그 값만 허용하고 SQL 식별자나 임의 날짜 입력은 거부.
- **화면:** 목표명·한국시간 주간·정확한 목표/진행 문자열·집계 규칙·근거 출처/한계·최대 50개 기여 행·뒤로/재시도/다음 페이지를 제공한다. 고유 작업 목표는 작업별 그룹으로 보여주고 화면 행의 합계를 총진행으로 오인하지 않는다. 소비·저축은 허용된 소비, 부호 있는 입출금, 순저축 0 하한을 설명하며 상대방 신원을 노출하지 않는다. NPC 관계도는 `AGGREGATE_ONLY` 상태로 행 목록 없이 ‘개별 근거가 제공되지 않음’을 표시한다.
- **상태:** LOADING, READY_WITH_ROWS, VERIFIED_EMPTY, AGGREGATE_ONLY, EVIDENCE_CHANGED(새로고침 필요), INVALID_REQUEST, UNAUTHENTICATED, UNAVAILABLE, RATE_LIMITED. 실패를 0건/달성/지급 완료로 대체하지 않는다. 커서 만료 시 필터를 유지한 새로고침. 모바일 320px, 의미 있는 목록·키보드·초점 복귀·44px 조작부·스크린리더 상태 안내, WCAG 2.2 AA.

### API·DB·정합성·트랜잭션
- **API:** `GET /api/v1/engagement/early-game/weekly-evidence?goal=<code>&week=<date>&cursor=<opaque>` 및 Android `GET /app-api/v1/engagement/early-game/weekly-evidence`. 200 응답은 `{goalCode, weekStartKst, weekEndExclusiveUtc, metric, target, progress, sourceStatus, evidenceStatus, asOfUtc, rows, nextCursor}`. 금액/횟수는 정규 10진 문자열, 시각은 PostgreSQL 마이크로초 유지. 400 잘못된 값, 401 미인증, 404 타인/미존재 동일 응답, 409 근거 변경, 410 커서 만료, 429 제한, 503 장애를 구분. 실패 시 성공처럼 보이는 기본값을 반환하지 않으며 GET 외 변경 메서드 거부.
- **DB:** 필요한 경우에만 검토된 회원 범위 `SECURITY DEFINER` 조회 함수를 추가한다. 테이블 완전 수식·고정 search_path·PUBLIC EXECUTE 회수·앱 계정의 필요한 함수 EXECUTE만 부여, 테이블 직접 DML/SELECT 권한 완화 금지. `p_actor` 인자만으로 DB 호출자 신원을 독립 인증할 수 없으므로 Nest 세션 결속과 최소 권한 별도 검증 필수. V1 신규 테이블 없음. 기존 인덱스를 먼저 확인하고 폐기 가능한 DB에서 `EXPLAIN (ANALYZE, BUFFERS)`로 필요성이 입증된 경우에만 인덱스 추가: work_reward_receipts(user_id,created_at,id), work_assignments(id,task_id), ledger_transactions(created_at,id), ledger_postings(account_id,transaction_id), accounts 소유자/유형 등 후보.
- **일관성:** 첫 페이지 요약과 근거는 단일 READ ONLY REPEATABLE READ 트랜잭션에서 계산한다. 이후 페이지는 회원·목표·주간·UTC 기준시각·마지막 키·만료시각·정렬된 원본 근거의 정규 지문을 HMAC 서명 커서(15분)에 묶는다. 페이지마다 지문을 다시 검증하여 소급 입력·삭제·직업 선정·NPC 관계도 변화 시 409를 반환한다. HTTP 사이에 장기 DB 트랜잭션을 유지하지 않는다. `created_at DESC, UUID` 키셋 정렬과 50+1 조회(최대 50개). 전체 지문 계산이 비싸면 성능 게이트를 실패 처리하고 재설계하며 안정성 미검증을 성공으로 주장하지 않는다.
- **정확성·보안:** 한국시간 월요일 00:00 포함~다음 월요일 00:00 제외, 서버/DB 시계 기준. 101번의 직업 선정·원장 유형·입출금 부호와 집계 범위를 일치시킨다. BIGINT/NUMERIC을 JS Number로 변환하지 않는다. 세션/IP별 제한, SQL 타임아웃, 타인 조회 차단, 개인 식별자 로그 제외, 조회 전용, 성공·실패 모두 private no-store/noindex/no-referrer. Android 계정 전환 시 요청 취소 및 디스크 캐시 금지.

### 관리자·KPI·배포·롤백
- **관리자:** 20명 이상 집단만 통계 공개, 개인 퀘스트/원장 행·회원 ID 검색 금지. `quest_evidence_open_total`, `quest_evidence_verified_empty_total`, `quest_evidence_aggregate_only_total`, `quest_evidence_changed_total`, `quest_evidence_api_error_total`, `quest_evidence_p95_ms` 측정. p95 300ms 미만은 제안 목표이며 실측값 아님. 개인 화면은 SEO 색인 금지.
- **배포:** 스위치 기본 OFF, 독립 PostgreSQL·권한·계약·접근성·모바일 테스트, 정확 SHA의 공식 Test 프론트/백엔드/엣지/인증 및 독립 복원 통과 후에만 별도 승인. 개발 예약에서 별도 브랜치·test 폴더·Test Docker를 사용하고 필요 시 전진 전용 마이그레이션만 허용(기존 체크섬 수정 금지). 단계적 공개 및 409/503/p95 감시, 실패 시 스위치 OFF·검증된 SHA로 복귀하며 영수증/원장 삭제 금지. 기획 예약은 운영 배포 금지.
- **제안된 수용시험(미실행):** 합성 영수증/전표 10,001건 이상, 타인 접근 100건, 커서 위조 100건, 동시 요청 100건, 스냅샷/소급 입력 50건, 한국시간 주 경계·윤년·연말 30건, 비정상 응답·타임아웃 50건, NPC 집계만 제공, 고유 작업 비가산성, 순출금 0 하한, WLD/원장 변경 0건, 전체 회귀·실제 Android 계약 검증. 합격 실적이 아닌 시험 설계 수치다.

### P0 4건 + P1 6건 개발 백로그
1. **P0 OPS1508-01** — Production v1523 표시 SHA 94d38f4와 삭제된 v1515 경로의 실행 프로세스 불일치 #1984. 재시작/승격 전 프로세스·독립 복원 가능한 롤백 자산 보존.
2. **P0 SEC1508-02** — QA v1389 개발 DB의 audit_logs DELETE·account_balances UPDATE 허용 #993, 마이그레이션 체크섬 불일치 5건, 깨끗한 305개 마이그레이션에서 은행 포켓 스키마 누락 #2000. 개발 B와 전진 전용 권한·스키마 조정, 임의 GRANT 금지.
3. **P0 FIN1508-03** — 국고 미연계 552건·MINT/SWF 출처, 탐색 불일치 24건 대 정규 검사 0건의 동일 범위/스냅샷 대조. 금융 손상 단정 금지.
4. **P0 REL1508-04** — QA v1389 백엔드 119 FAIL/2563 PASS/495 SKIP, 프론트엔드 53 FAIL/2607 PASS, 전체 의존성 경고 11건. 전체 CI·정확 SHA 공식 Test·독립 복원·GitOps/엣지/금융/인증 게이트 필요. 14:04 KST Production /api/version 94d38f4, Test c2129625.
5. **P1 QUEST1508-05** — 회원 범위 DB 조회 함수·부정 권한 시험·101번 집계 동등성·인덱스 EXPLAIN.
6. **P1 QUEST1508-06** — 스냅샷 지문·안정적인 HMAC 커서·한국시간 범위·정확한 금액·409 변경 감지.
7. **P1 QUEST1508-07** — NestJS 인증·DTO·허용 목록·오류/요청 제한 및 실패 시 거짓 성공 방지.
8. **P1 QUEST1508-08** — Next.js 근거 보기 CTA·상세·모바일 접근성·빈 목록/집계 전용/만료/재시도.
9. **P1 QUEST1508-09** — Android app-api 계약, 개인정보 헤더·SEO·로그 제거, 관리자 20명 이상 KPI, 기본 OFF 스위치.
10. **P1 QUEST1508-10** — 독립 PostgreSQL 17.11 합성/부정/동시성/성능/회귀 시험, 정확 SHA Test 및 비파괴 롤백 검증.

**외부 독립 근거 게이트:** 이번 신규 중복 제거·실근거 검증 승인 **0건**, 누적 고유 승인 **UNKNOWN / 10,000건**. **BLOCKED / IN PROGRESS**이며 달성 주장 금지. QA v1389 실패 증거는 배포 인증이 아니다. 런타임·DB·원장·WLD·Test·Production·예약·다른 개발자 자산 변경 없음.

**이전 기획:** v1506 F675-182 거래 상세 보완 / 초안 PR #1995 / 인계 #1988 / 운영 보류; #1990/#1983 종속.

## v2026.10.30.1506 — F675-182 회원 거래 상세 근거 보완 (기능 보완 / 초안 / 운영 보류)

**이전/현재/다음 주기:** 기능 추가 v1504 / 기능 보완 v1506 / 기능 추가 v1508(잠정). main 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef 시작·중간 확인, AGENTS.md/README/영문 PROJECT_PLAN.md 원본·국문 대조. 미병합 #1990 → #1983에 종속된 문서 후속, 개발 인계 #1988. 중복 기능·런타임/DB/WLD/Test/운영 변경 없음.

**소스 기반 보완:** wallet.repository.ts는 owner_user_id 기준 거래별 전표를 합산하지만 wallet.service.ts의 JS Date 변환은 PostgreSQL 마이크로초를 잃는다. main에 상세 경로 없음. 계정 통화 char(3), 전표 금액 양의 bigint. 본인 USER_CASH/USER_BANK와 WLD만 명시적으로 필터, 동결/종료 계정 과거 거래 포함, 부호 있는 NUMERIC 정밀 합계와 정규 정수 문자열. netDelta=cashDelta+bankDelta. 순변동 0만으로 내부 이체를 단정하지 않으며 신뢰 가능한 은행 이동 유형과 양쪽 증감 확인 시에만 표현. UTC 원본 마이크로초 별도 보존, KST는 표시용. 유형 라벨은 서버 allowlist.

**인증 한계:** SECURITY DEFINER의 p_actor 인자만으로 SQL 호출자 신원은 독립 인증되지 않는다. 앱 계정 탈취 시 임의 actor UUID로 EXECUTE 가능하며 개발 DB에는 원장 직접 SELECT도 존재한다. Nest 인증 세션/동의→actor 결속, auth_sessions의 id/user_id/expires_at/revoked_at 검토와 한계, DB 최소 권한 검증 필수. 위조 가능한 GUC는 신원 증거 아님. 고정 검색 경로·public 명시·전용 함수 소유자·PUBLIC EXECUTE 회수·검토된 앱 EXECUTE만 허용. 직접 테이블 권한 추가 금지, 단일 SQL 스냅샷, 기존 인덱스 EXPLAIN.

**근거 의미:** 본인 원장 행 조회는 전체 전표 정산·지급 완료·공식 증명·현잔액 검증이 아니다. 모호한 LEDGER_READ_VERIFIED 대신 readStatus=READ_OK와 reconciliationStatus=NOT_ASSESSED, 화면 “원장 기록 조회됨 · 정산 검증서 아님”. 임의 0·상대방 정보 생성 금지, 통화/금액/전표 불일치 503. 타인/없음 동일 404, UUID 400, 비로그인 401, 제한 429, 원천 장애 503.

**화면/API:** /wallet/activity의 “거래 상세 보기” → 본인 /wallet/activity/transactions/:transactionId, Nest GET /api/v1/wallet/activity/transactions/:transactionId, Android /app-api/v1/wallet/activity/transactions/:transactionId. 200 엄격 DTO {transactionId,typeLabel,occurredAtUtcMicros,cashDelta,bankDelta,netDelta,currency:'WLD',readStatus:'READ_OK',reconciliationStatus:'NOT_ASSESSED'}. 미확인 JSON 검증, URL actor 금지, 허용된 뒤로 필터, 로딩/없음/오류/재시도/복사/포커스, 회원 전환 시 이전 응답 취소. 성공·오류 모두 private no-store/noindex/no-referrer, sitemap·ID 로그 금지. WCAG 2.2 AA, 320px, 200% 확대, 44px, 정의 목록·aria-live. 관리자 20명 이상 익명 집계만, 기본 OFF wallet_transaction_detail_v1. 별도 개발 브랜치의 호환 마이그레이션·OFF 롤백, 원장/백업 삭제 금지.

**QA v1388 (12:19–12:32 KST):** 운영 링크 v1523/실제 삭제된 v1515 PID 불일치 13시대 재확인, 서비스 중단 확인 없음. 개발 DB 253개 중 UPDATE/DELETE 211, TRUNCATE 233, 체크섬 5건. 탐색 balance_mismatch=24 vs 정규 0(40계정)은 검사 정의 차이 조사 대상, 변조 증거 아님. 국고 미연계 552·Test 합성 200, 백엔드 119 실패·프론트 53 실패, 모바일 계약 183개 통과는 전체 CI/Test/복원 인증 아님.


### P0 4 + P1 6 — backlog / 개발 백로그
1. **P0 OPS1506-01** — 운영 v1523 링크는 94d38f4 표시, 백엔드/프론트 PID 2608302/2608303은 삭제된 v1515 경로 실행(#1984). 프로세스·롤백 근거 보존, 재시작/삭제/승격 금지.
2. **P0 SEC1506-02** — QA v1388 개발 DB 앱 UPDATE/DELETE 211/253, TRUNCATE 233, 체크섬 5건 불일치. B 초안 #1987(307)·종속 #1992(308)와 조정, 공유 DB 임의 권한 변경 금지(#993/#1972).
3. **P0 FIN1506-03** — QA v1388 탐색 balance_mismatch=24 vs 정규 0(40계정), 검사 범위·스냅샷 비교 후 사고 판단. 국고 미연계 552, Test 합성 국고 200, MINT/SWF 출처 미검증(#1917).
4. **P0 REL1506-04** — QA v1388 전체 백엔드 119 실패/2563 통과/495 건너뜀, 프론트 53 실패/2607 통과. 모바일 계약 183개 통과는 배포 인증 아님. 정확 SHA CI, 공식 Test 프론트/백엔드/엣지, 실제 PG/인증/금융 E2E, 외부 복원, 승인 GitOps(#1979).
5. **P1 DETAIL1506-05** — 본인 WLD CASH/BANK SECURITY DEFINER 조회, 스키마 명시·고정 검색 경로·PUBLIC EXECUTE 차단·앱 직접 권한 추가 금지, 동결/종료 계정·SQL NUMERIC·인덱스 EXPLAIN, actor 인증 한계.
6. **P1 DETAIL1506-06** — Nest 정규 UUID·인증 세션/동의/actor 결속, 타인/없음 동일 404, 400/401/429/503, DB 제한, UTC 마이크로초와 READ_OK/NOT_ASSESSED DTO.
7. **P1 DETAIL1506-07** — Next 상세 CTA/SSR·미확인 JSON 검증·안전한 유형·KST, 순변동 0을 무조건 이체로 단정 금지, 로딩/복사/뒤로/재시도/오류·320px WCAG 2.2 AA.
8. **P1 DETAIL1506-08** — Android 상태/헤더 동등성, 오류 포함 private no-store/noindex/no-referrer, 회원 전환 요청 취소, 오프라인 저장·ID 분석 금지.
9. **P1 DETAIL1506-09** — 탈취된 앱 계정의 임의 p_actor EXECUTE 위협 명세, 개인정보·SEO·로그 최소화, 관리자 20명 이상 익명 집계, 기본 OFF.
10. **P1 DETAIL1506-10** — 격리 PG 17.11 수용시험 합성 10,001, 타인 100, 동시 100, 혼합 통화/전표 이상 50, 계정 상태 50, 순변동 0 30, 비정상 50, 회원 전환 30, 원장 쓰기 0·정확 SHA Test/롤백.

**Acceptance PLANNED, NOT RUN / 수용시험 계획만 수립, 미실행:** 10,001 synthetic, 100 cross-owner, 100 concurrent, 50 account states, 50 currency/posting anomalies, 30 zero-net, 50 malformed, 30 session switches, zero ledger/WLD writes. External independently acquired/deduplicated/classified approvals NEW 0; cumulative UNKNOWN / 10,000 — BLOCKED / IN PROGRESS. DRAFT / RELEASE HOLD.

## v2026.10.30.1504 — F675-182 회원 전용 지갑 거래 상세 (기능 추가 / 초안 / 운영 보류)

**주기·기준:** 이전 기능 보완 v1502 → 현재 기능 추가 v1504 → 다음 기능 보완 v1506(잠정). 최신 `origin/main` `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` 시작·중간 재조회. `AGENTS.md`, `README.md`, 영문 정본 `PROJECT_PLAN.md`와 한국어 동등 문서를 기준으로 한다. v1502 초안 #1983은 미병합이므로 이번 문서 제안은 기획 이력 보존을 위해 그 위에 쌓되 독립 병합하지 않는다. [개발 인계 #1988](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1988). 런타임·DB·WLD·Test·운영 변경 없음.

### 이용자 문제·범위·대안
- **실제 소스:** `frontend/src/app/wallet/activity/page.tsx`는 최대 50건의 `PostingStrip`만 보여주고 거래 상세 CTA가 없다. Nest `wallet.controller.ts`에는 `GET wallet/activity`는 있지만 `wallet/activity/transactions/:id`는 없다. 저장소는 본인 현금/은행 전표를 합산해 거래 UUID를 반환하고, 송금 완료 액션도 거래 UUID를 반환한다. F675-176 저장 필터·177 월별 요약·178 북마크·181 날짜 지정과는 별개이며 main에서 중복 상세 API는 확인되지 않았다.
- **대안:** (A) 행 확장형은 직접 이동·모바일 사용성이 낮음, (B) 전체 원장 내보내기는 과다 노출, **(C) 회원 전용 읽기 전용 거래 상세 화면을 채택**. 실제 돈을 변경하거나 검증되지 않은 금융 증명서를 만들지 않는다.
- **목적·대상:** 인증·약관 동의한 회원이 본인 거래 1건의 현금/은행 WLD 증감을 정확히 확인한다. 현금↔은행 이동의 전체 순변동은 0이다. 세금 증명·결제 확인서·현재 잔액·감사 증명으로 오인하지 않도록 명시한다.
- **진입·CTA:** `/wallet/activity` 각 행에 키보드 접근 가능한 ‘거래 상세 보기’ → `/wallet/activity/transactions/{uuid}`. 향후 북마크/날짜 지정 목록에서도 같은 경로 사용. 이전 목록으로 돌아갈 때 검증된 필터만 보존하고 임의 외부 리다이렉트는 금지한다. 송금 성공 시 검증된 영수증 UUID로 이동 가능하나 공개 공유 기능은 없다.

### 화면 상태·표시 계약
- 로딩 → 검증된 거래 상세. 존재하지 않거나 타인 소유면 동일한 404 ‘거래를 찾을 수 없습니다’. UUID 형식 오류 400, 미인증 401, 요청 제한 429(제한된 재시도), DB·상위 응답 장애 503(재시도). **장애를 거래 0건·잔액 0 또는 VERIFIED로 표시하지 않는다.** 계정 전환 시 이전 회원 데이터를 즉시 폐기한다.
- 거래 UUID, 복사 버튼·접근성 피드백, 안전한 유형명, 한국시간 시각(시간대 명시), 정확한 부호 있는 십진 WLD `cashDelta`·`bankDelta`·`netDelta`, 실제 DB 조회 근거 상태 `LEDGER_READ_VERIFIED`/`UNVERIFIED`/`UNAVAILABLE`만 노출한다. 상대방 이름·수수료·세금·송금인 정보를 추정하지 않는다. 자체 계정 간 이동 시 순변동 0 안내. 미정의 유형은 중립적인 현지화 라벨 사용.
- 상대방 회원 ID·이름, 시스템 계정 ID, 전표 ID, 정책 페이로드, 멱등 키, 요청 토큰, outbox·감사 로그 메타데이터는 반환하지 않는다. 조회 시점 원장 기록일 뿐 현재 잔액이 아니다. DB 원본 마이크로초 시각을 보존하고 화면에서만 한국시간으로 변환한다.

### API·DB·트랜잭션·권한
- **Nest:** `GET /api/v1/wallet/activity/transactions/:transactionId`에 엄격한 UUID·세션·동의 검증. 200 DTO `{transactionId,typeLabel,occurredAt,cashDelta,bankDelta,netDelta,currency:'WLD',evidenceStatus}`를 런타임 검증. 금액은 정확한 십진 문자열, NUMERIC으로 `netDelta=cashDelta+bankDelta` 확인, JS 부동소수점 금지. 잘못된 ID 400, 미인증 401, 타인/없음 404 동일 응답, 제한 429, DB 장애 503. 실패에 200 금지.
- **PostgreSQL:** 개발 예약이 별도 마이그레이션으로 검토된 `SECURITY DEFINER` 본인 전용 읽기 함수를 추가한다. 고정 `search_path`, `REVOKE ALL FROM PUBLIC`, 앱 역할에는 `EXECUTE`만 부여. `actor_user_id`가 아니라 CASH/BANK 계정의 `owner_user_id`로 본인 전표를 필터링하고 동결·종료 계정의 과거 기록도 유지한다. 거래 1건의 본인 전표를 먼저 합산한다. 원장 테이블 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE 권한을 새로 주지 않는다. 단일 SQL/함수 호출의 동일 문장 스냅샷을 사용하므로 다중 쿼리 트랜잭션 불필요. 신규 기능 테이블은 만들지 않는다. 기존 거래 PK·전표 transaction_id·계정 소유자 인덱스를 활용하고 인덱스 추가는 격리 DB EXPLAIN 후 판단. WLD 통화·NUMERIC 정밀도·합계 불변식 검증.
- **보안 실측:** 2026-10-30 개발 PostgreSQL 17.11 읽기 전용 조회에서 `moneyverse_app`의 `ledger_transactions SELECT` 및 `audit_logs DELETE`가 허용됨을 확인했다. AGENTS.md 최소 권한 선언과 불일치하므로 P0 #993에서 선행 해결한다. **운영 DB의 동일 권한이나 실제 변조를 입증하지 않는다.**
- **웹·Android:** Next SSR `/wallet/activity/transactions/[transactionId]`, `apiOrNull<T>` 대신 HTTP 상태와 응답 스키마를 실제 검증, 실패 차단·재시도, force-dynamic/no-store/noindex. Android `/app-api/v1/wallet/activity/transactions/:id`는 인증 세션·상태 코드·헤더·오류를 동일하게 전달한다. 기존 app-api는 지갑 private/no-store/noindex를 이미 지원하므로 중복 구현 대신 회귀시험. 오프라인/서비스워커 캐시·공개 URL 미리보기 금지. GET에 CSRF 토큰은 불필요하지만 Origin/CORS·세션 경계·UUID 추측 요청 제한을 적용한다. 거래 ID·개인 데이터를 로그·분석에 저장하지 않는다.
- **모바일·접근성:** 320px, 200% 확대, 최소 44px 터치 영역, WCAG 2.2 AA, 포커스 표시, 정의 목록, 복사·오류 상태 aria-live, 키보드·스크린리더 테스트, 한국어 및 현지화 키.
- **관리자·SEO·KPI:** 관리자는 익명 일별 `detail_open`/`detail_unavailable`/`detail_retry` 집계만(최소 코호트 ≥20), 회원별 거래 조회 권한 없음. 성공·거부·장애 모두 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`; 사이트맵·검색 인덱스 제외, referrer/로그 유출 금지. 건강한 Test에서 상세 조회 성공률 ≥99%, 무단 노출 0, WLD 변경 0 목표. 실제 측정 전 달성 주장 금지.
- **배포·롤백:** `wallet_transaction_detail_v1` 기능 스위치 기본 OFF. 개발 예약의 별도 브랜치에서 TDD RED→GREEN→REFACTOR, 호환 가능한 DB 함수·권한 회귀, 공식 Test의 프론트/백엔드/엣지 정확 SHA 및 실제 PG·인증 E2E, 독립 백업 복원 후 점진 활성화. P0 해결·소유자 승인 GitOps 전 운영 활성화/자동 승격 금지. 롤백 시 스위치 OFF로 CTA·화면 숨김, 함수는 검토된 마이그레이션 롤백 전까지 비활성 유지; 원장·백업 삭제 금지.

### P0 4건 / P1 6건 개발 인계
1. **P0 OPS1504-01:** QA v1387 [#1984](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1984) — Production v1523 심볼릭 링크는 `94d38f4...`를 표시하지만 실제 백엔드/프론트 PID 2608302/2608303은 삭제된 v1515 경로에서 실행. 증거 보존·독립 롤백 복원·재시작/정리/승격 금지.
2. **P0 SEC1504-02:** 개발 DB 원장 직접 SELECT·감사 DELETE [#993](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/993), 마이그레이션 체크섬 불일치 5건, MCP 민감 URL 로그 [#1972](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1972). 운영 권한 단정 금지.
3. **P0 FIN1504-03:** MINT 18,000 WLD 출처, 국고 원장 연결 552건, SWF 금융 시험 및 Test 국고 합성 200 [#1917](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1917) 검증 전 정상 판정 금지.
4. **P0 REL1504-04:** 전체 CI·lint·Android 계약, 공식 Test 정확 프론트/백엔드/엣지 SHA, 실제 PG/인증 E2E, 독립 복원 및 승인 GitOps [#1979](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1979).
5. **P1 DETAIL1504-05:** SECURITY DEFINER 본인 SQL·권한/인덱스·정확한 십진 연산.
6. **P1 DETAIL1504-06:** Nest API/DTO·UUID·본인 404·오류/속도 제한.
7. **P1 DETAIL1504-07:** Next 상세 화면·목록 CTA·응답 검증·접근성/복귀.
8. **P1 DETAIL1504-08:** Android 동등성·계정 전환·no-store/noindex·로그.
9. **P1 DETAIL1504-09:** 개인정보·관리자 익명 KPI·SEO·위협 모델·보존.
10. **P1 DETAIL1504-10:** 격리 PostgreSQL 수용·회귀·정확 SHA Test·스위치 OFF 롤백.

**수용시험은 계획이며 미실행:** 합성 원장 ≥10,001건, 타인·위조 ID ≥100, 동시 ≥100, 누락/동결/종료 ≥50, 현금↔은행 순변동 0 ≥30, 비정상/503 ≥50, 계정/세션 전환 ≥30. 타인 노출 0, WLD/원장 쓰기 0, 허위 VERIFIED 0. 외부 독립·중복 제거·실근거 분류 신규 승인 **0건**, 누적 **UNKNOWN / 10,000건** → **BLOCKED / IN PROGRESS**. 운영 승격 보류.


## v2026.10.30.1502 — F675-181 지갑 날짜 범위 조회 근거·커서 정합성 보완 (기능 보완 / 초안 / 운영 보류)

**주기와 기준:** 이전 기능 추가 v1500 → 현재 기능 보완 v1502 → 다음 기능 추가 v1504(잠정). 최신 `origin/main` `94d38f47603e99aabc42fc8f292b89441afb9663` 2026-10-30 11:08~11:10 KST 시작·중간 재조회. v1500 PR #1974는 11:08에 **병합**되었지만 날짜 범위 기능의 런타임은 **미구현**. AGENTS.md, README.md, 영문 PROJECT_PLAN.md, 국문 대조, Nest/Next/app-api, 개발 PostgreSQL 17.11 및 QA v1386 조사. 문서만 변경하며 런타임·DB·원장·WLD·Test·운영 변경 금지.

### 실제 소스에서 확인한 보완사항
- `wallet.repository.ts:259–293`은 본인 CASH/BANK 거래를 합산하고 방향 HAVING을 LIMIT 51보다 먼저 적용하며 `(created_at,id) DESC`로 정렬하지만, 날짜 종료일의 **배타적 상한은 없음**. `wallet.service.ts:393–414`의 `Date.toISOString()`은 PostgreSQL 마이크로초를 밀리초로 줄임. 기존 커서 v1은 60분 만료이며 신규 날짜 지정용이 아님.
- `period.ts`는 잘못된 기간을 조용히 all로 바꾸고, `page.tsx`는 `apiOrNull<WalletHistoryPage>`로 HTTP 오류를 null로 통합하며 응답을 실제 검증하지 않고 타입으로 간주함. 현재 화면은 null 장애와 0건을 구분하지만 **400/410/429/503 원인별 처리가 불가능**하고 비정상 200에 취약함. 신규 기간 지정에서는 오류 유형별 검증이 필요.
- 현재 Android app-api 프록시는 이미 `target.search=request.nextUrl.search`로 쿼리를 전달하고, 지갑 응답에 `private, no-store`와 `X-Robots-Tag: noindex`를 적용함. 없는 문제로 중복 프록시를 기획하지 않고 허용 매개변수 검증·오류 계약·세션 격리를 강화.
- 개발 PostgreSQL 17.11 읽기 전용 조사에서 계정·거래·포스팅 테이블 인덱스 10개, `idx_ledger_transactions_created_at_id` 및 `idx_ledger_postings_transaction_id` 확인. `moneyverse_app`는 원장 SELECT 권한과 함께 `account_balances` UPDATE, `audit_logs` DELETE 유효 권한도 보유(개발 DB 한정 P0). 기존 허가된 조회 또는 검토된 SECURITY DEFINER 함수를 활용하며 앱 계정 권한 확대·기존 마이그레이션 수정 금지. 기존 v1500 설계에 통합하는 보완이며 별도 기능·테이블을 만들지 않음.

### API·DB 시각·SQL·커서 실행 계약
- 회원 전용 `GET /api/v1/wallet/activity?period=custom&from=YYYY-MM-DD&to=YYYY-MM-DD&direction=all|in|out|neutral&cursor=...`를 기존 50+1 페이지 및 all/7d/30d 동작과 분리해 확장. 중복·배열·미허용 쿼리, 그레고리력 오류, 날짜 누락/혼합, 역전, 양끝 포함 366일 초과, **같은 DB 한국시간 오늘**보다 미래 종료일을 명시적으로 거부. 잘못된 요청을 all로 바꾸지 않음. 날짜·방향 변경 시 커서 제거.
- **첫 페이지**에서 DB `statement_timestamp()` 한 번으로 마이크로초 `asOf`, DB 한국시간 현재 날짜, 한국시간 시작일 00:00 이상·종료일 다음 날 00:00 미만의 UTC 경계를 동일 SQL 문장으로 산출(다중 쿼리면 동일 클라이언트 READ ONLY REPEATABLE READ). 이후 페이지는 서명된 첫 페이지 `asOf`와 동일한 경계를 재사용. `created_at>=startUtc AND created_at<endExclusiveUtc AND created_at<=asOf`. JS Date를 커서 경계로 변환하거나 로컬 24시간 덧셈 금지. 동결·종료된 본인 계정의 과거 거래도 조회.
- CASH/BANK 포스팅을 거래 ID별 정확한 NUMERIC 합산 후 방향 HAVING, 키셋 및 `created_at DESC,id DESC LIMIT 51` 적용. PostgreSQL 원본 마이크로초를 별도 커서용 문자열(예: UTC `to_char(...,'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`)로 보존하고 SQL 비교도 원본 시각으로 수행. 화면 시각의 밀리초 표시와 커서 정밀도 분리. 순변동 0은 neutral이지 내부 이체 확정 증거가 아님. 중복 계산·원장 쓰기 금지.
- 신규 목적별 HMAC `wallet-activity-custom-v1`은 본인 UUID, 인증 세션, 날짜 범위, 방향, DB asOf, 마이크로초 정렬키·거래 UUID, 버전, 발급·만료, 키 ID를 결속. 15분 TTL, 2048바이트 제한, 상수시간 서명 비교, 제한적 키 교체. 위조·범위/세션 불일치·기존 커서는 400, 만료는 410. 커서는 인증 수단이 아님. 서로 다른 HTTP 페이지에 동일 DB 스냅샷을 보장한다고 주장하지 않음. 뒤늦게 입력된 과거 거래는 페이지 결과를 바꿀 수 있으므로 사용자에게 알리고 처음부터 재조회 제공.
- Next BFF는 `string|string[]|undefined` 형태의 searchParams를 엄격히 파싱해 중복을 거부. 신규 기간 지정은 `apiOrNull` 대신 유형별 오류 처리, HTTP 200 JSON의 거래 UUID 중복·최대 50건·정확한 정수 문자열·cash+bank=net·시각·hasMore·nextCursor·범위/asOf 검증. **검증된 200/0건에서만 빈 결과**. 400 입력 오류, 410 커서 만료, 429 요청 제한, 503 장애, 비정상 200, 이전 세션 지연 응답을 각각 처리. 장애를 잔액 0 또는 기록 없음으로 표시 금지. Android 생성 EN/KO/JSON 계약과 계정 전환 취소 동등성 필수.
- `/wallet/activity`의 날짜 적용·초기화·다음 50건·처음부터 보기, 방향 유지, 한국시간 양끝 포함 표기, DB asOf, 편집 중 자동 조회 금지. 320px·200% 확대·WCAG 2.2 AA, 키보드 포커스·aria-live·44px 터치. 기능 스위치 `wallet_activity_calendar_range` 기본 OFF, 성공·오류 모두 no-store/noindex, 사이트맵 제외. 회원당 분당 10회·DB 2초 제한은 부하 시험 후 확정할 제안. 관리자는 20명 이상 익명 집계·7일 재사용·오류율·p95만 조회하며 개별 날짜·금액은 볼 수 없음.

### P0/P1 개발 인계 (4 + 6 = 10)
- **P0 OPS1502-01:** QA v1385 Docker 볼륨·작업공간 대량 삭제 [#1968] 원인·독립 외부 복원·롤백 자산 조사. ROOT 43% / DATA 42% 여유는 복원 증명이 아님.
- **P0 SEC1502-02:** 개발 DB `account_balances` UPDATE·`audit_logs` DELETE [#993], 마이그레이션 체크섬 5건, MCP SSE 민감 URL 로그 [#1972] 범위 조사 및 최소 권한 복구. 운영 침해 증거 아님.
- **P0 FIN1502-03:** Test 국고 합성 200 [#1917], 과거 미검증 MINT 18,000 WLD·국고 552건, SWF 출처 및 전체 금융 시험. QA v1386 금융 **선별 21건 PASS**는 전체 금융·운영 승인 아님.
- **P0 REL1502-04:** QA v1386 [#1979]에서 운영 v1515가 09:52 정확 SHA CI/Test PASS 이전에 승격됐고 공식 Test SHA는 구버전. 앱 API 스키마 건수 수정 #1978은 **main 병합**됐으나 전체 CI·인증 E2E·독립 복원·프론트/백엔드/엣지 SHA 및 승인된 GitOps는 미입증. **운영 승격 보류**. 기획에서 임의 배포·롤백 금지.
- **P1 RANGE1502-05:** DB 한국시간 경계/asOf, 본인·종료 계정 SQL, 50+1, 기존 인덱스 EXPLAIN 및 권한 회귀.
- **P1 RANGE1502-06:** 마이크로초 HMAC 커서, 목적·세션·범위 결속, 400/410·키 교체·지연 거래 의미.
- **P1 RANGE1502-07:** Next 엄격 쿼리 및 200/400/410/429/503/비정상/빈 결과 분리, 반응형 접근성.
- **P1 RANGE1502-08:** Android 쿼리·응답 동등, 계정 전환 취소, EN/KO/JSON 생성 계약·정확 SHA.
- **P1 RANGE1502-09:** 성공·오류 no-store/noindex, 남용 제한, 익명 관리자 KPI·개인정보 안전 로그.
- **P1 RANGE1502-10:** 격리 PostgreSQL 17.11 시험, 테스트 우선 구현, OFF/ON 검증, 정확 SHA Test, 독립 복원·승인된 무중단 배포/롤백.

### 수용시험·외부 근거·배포 게이트
- **명세만 작성, 미실행:** 합성 원장 10,001건 이상, 타인 접근 100건, HMAC 위조/범위 불일치 100건, 동시 페이지 100건, 동일 밀리초의 다른 마이크로초·한국시간 경계 50건, 윤년·시계·계정 전환 30건, 비정상 API 50건, 지연·소급 거래 30건, WLD/원장 변경 0. 고정 데이터에서 50+1 페이지 중복·누락 없음, 동시 변경 시 스냅샷 보장 없음 안내, 거짓 빈 결과 없음, 앱 계정 DML 권한 확대 없음, 기존 기간 회귀 확인.
- 신규 분산 기획 파일 없음. 런타임·DB·Test·운영 미변경. 개발 별도 브랜치·RED-GREEN·실제 PG/보안/모바일/접근성·전체 CI·공식 Test 프론트/백엔드/엣지 정확 SHA·독립 복원·사용자 승인·기능 OFF 롤백 필수. 외부 독립 중복 제거·실제 근거 분류 승인 **신규 0건, 누적 UNKNOWN / 10,000건 — BLOCKED / IN PROGRESS**.



**최종 재조회(11:13 KST):** main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`로 진행(implementation_plan.md 문서만 변경). 공개 Production `/api/version`은 `94d38f47603e99aabc42fc8f292b89441afb9663`(v1523 릴리스), 공식 Test는 구버전 `c2129625aa6629c616fb31ce790950618b8d92b2`. v1523의 정확 SHA CI/Test 통과는 이 회차에서 확인하지 못했으므로 P0 배포 게이트 보류. PR #1983 초안이며 운영 승격 권한 없음.
## v2026.10.30.1500 — F675-181 회원 전용 지갑 거래내역 날짜 직접 지정 (기능 추가 / 초안 / 운영 보류)

**주기:** 이전 기능 보완 v1498 → 현재 기능 추가 v1500 → 다음 기능 보완 v1502(잠정). **기준:** 2026-10-30 시작·중간 재확인한 origin/main a7f8730b9838b9324b6ece25e394dfcc8709aadf, AGENTS.md, README.md, 영문 정본 PROJECT_PLAN.md 및 한국어 대조. **GitHub:** [초안 PR #1974](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1974), [개발 인계 #1973](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1973). **설계 제안만 수행:** 런타임·DB·WLD·Test·Production 변경 없음. v1498 초안 #1964는 미병합 CLOSED이며 통합 문서의 가치 있는 기존 요구사항은 보존.

### 확인된 문제·대상·중복 방지
- 실제 소스: frontend/src/app/wallet/activity/period.ts는 all/7d/30d 및 all/in/out/neutral만 지원, page.tsx는 본인 원장 50건씩 표시. backend/src/wallet/wallet.controller.ts는 해당 기간만 허용, wallet.service.ts는 이동 일수 계산, wallet.repository.ts는 본인 CASH/BANK 거래를 합산하고 방향을 SQL에서 제한. 달력 시작일/종료일 필터는 해당 경로에 없음. 이는 코드 조사이지 사용자 수요나 운영 이용량 조사 결과가 아님.
- 인증·동의 회원이 원하는 두 한국시간 날짜 사이의 본인 WLD 거래를 조회하도록 함. 개인용 탐색이지 정산 증명·세금 증빙·내보내기·원장 변경·자동 재무 조언이 아님.
- F675-176 저장 필터, F675-177 월별 요약, F675-178 북마크, F675-173 개인정보 내보내기, 기존 export-ledger-csv.tsx와 별개. 중복 테이블·영수증·내보내기 API를 생성하지 않음.

### 진입·화면·CTA·상태
- 진입점 /wallet/activity, 기존 기간 선택 옆 “기간 지정” 추가. 비공개 정규 URL /wallet/activity?period=custom&from=YYYY-MM-DD&to=YYYY-MM-DD&direction=all. 기존 all/7d/30d 의미 불변.
- “시작일”, “종료일” 날짜 입력, “기간 적용”, “초기화”, 기존 방향 필터, “이전 기록 50건”, “처음부터 다시 보기”. 기본 입력값으로 한국시간 오늘 및 29일 전 제안하되 적용 전에는 조회하지 않음. 날짜·방향 변경 시 이전 커서 폐기, 뒤로 가기에서 정규 범위 복원.
- 최초·편집·입력 오류·로딩·정상 결과·정상 빈 결과·다음 페이지·커서 만료·미인증·동의 필요·요청 제한·서버 장애·지연 응답 폐기 상태. 구조 검증된 HTTP 200/0건에서만 빈 결과; 네트워크 오류·비정상 200·503을 빈 거래내역으로 표시 금지. 한국시간 양끝 포함, 서버 조회 기준시각, 과거 거래 지연 반영 시 재조회 변경 가능성을 명시.
- 엄격한 그레고리력 YYYY-MM-DD(윤년 검증), 시작일<=종료일, 양끝 포함 1~366개 달력 날짜, 종료일<=한국시간 오늘. 불가능한 날짜, 배열·중복·미허용 매개변수, custom이 아닌 기간의 from/to, 날짜 누락 custom은 400. 범위 자동 잘라내기 금지. 366일 상한은 부하 시험 전 제안값.

### API·DB·트랜잭션·인덱스·커서
- 기존 Nest GET /api/v1/wallet/activity에 period=custom, from, to, direction=all|in|out|neutral, cursor 선택값 추가. 기존 transactions,hasMore,nextCursor,asOf 유지, custom에 한해 range:{from,to,timezone:'Asia/Seoul',startInclusiveUtc,endExclusiveUtc} 추가. Next/Android에서 금액 문자열·시각·배열·커서·오류 코드 런타임 검증. 정상 빈 응답은 hasMore=false,nextCursor=null.
- 한국시간 시작일 00:00 포함부터 종료일 다음 날 00:00 미포함까지를 date::timestamp AT TIME ZONE 'Asia/Seoul' 등 시간대 인지 방식으로 UTC 변환. created_at>=startUtc AND created_at<endExclusiveUtc AND created_at<=serverAsOf. 브라우저 시간대·고정 24시간 계산·30일 이동기간 대체 금지. 서버 asOf는 조회 상한이며 서로 다른 HTTP 페이지 간 동일 DB 스냅샷 보장 아님.
- 소유자 USER_CASH/USER_BANK 포스팅을 거래 ID별 NUMERIC으로 합산, net=cashDelta+bankDelta. 방향은 집계 후 HAVING SIGN(net), 정렬 created_at DESC,id DESC LIMIT 51에서 최대 50건 반환. CASH↔BANK 이동은 순변동 0, 동결·종료 계정의 과거 본인 거래 보존. WLD를 JS Number로 변환하거나 원장 쓰기 금지.
- 신규 영속 테이블 없음. 격리 PostgreSQL EXPLAIN으로 ledger_transactions(created_at,id), ledger_postings(transaction_id,account_id), accounts(owner_user_id,account_type,id) 인덱스 적합성 확인. 추가 인덱스가 필요할 때만 별도 검토된 전진형 마이그레이션, 체크섬 불변·앱 직접 DML 권한 확대 금지. SQL 2초 제한은 부하 측정 후 확정할 제안.
- 별도 목적 HMAC 커서 wallet-activity-custom-v1에 ownerId,sessionId,from,to,direction,asOf,afterCreatedAtUs,afterTransactionId,issuedAt,expiresAt,version 결속. 15분 TTL, 최대 2048바이트, 상수시간 서명 비교, 제한된 키 교체. PostgreSQL 마이크로초 원본 정밀도를 텍스트 정렬키로 보존, JS Date 밀리초 반올림 금지. 기존 커서를 custom에 재사용 금지. 위조·형식 오류·범위 불일치 400, 만료 410 및 안전한 처음부터 재조회 안내. 단일 읽기 SQL 우선, 다중 SQL 시 동일 PG 클라이언트의 READ ONLY REPEATABLE READ 및 실패 시 롤백/반환.

### 권한·악용 방지·SEO·관리자·Android·KPI
- SessionGuard→AuthenticatedGuard→ConsentGuard→CsrfGuard 순서 유지. 회원 ID는 서버 세션에서만 취득, SQL 또는 검토된 SECURITY DEFINER 함수에서 본인 소유 강제. 타인 거래 추측·위조 커서에 존재 여부 누설 금지. 안전한 401/403/429/503, SQL 오류 노출 금지. wallet_activity_calendar_range 기능 스위치 사전 등록 후 기본 OFF.
- 회원당 분당 10회, 동시 1회, DB 2초, 엄격한 매개변수 허용목록은 부하 시험 전 제안 기준. Cache-Control private,no-store, X-Robots-Tag noindex, Next robots noindex/nofollow, sitemap·공개 구조화 데이터 제외. URL 원문·회원 ID·금액·거래 ID·세션·커서 로그 금지. QA v1385 MCP URL 민감정보 로그 [#1972](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1972) 참조.
- 관리자에게 최소 집단 20명 이상의 익명 집계(사용률·7일 재이용·200/400/410/429/503 비율·p50/p95·타임아웃)만 제공, 회원별 원장·날짜 조회 API 없음. 목표(미실측): 타인 조회 0, 거짓 빈 결과 0, 커서 범위 우회 0, 합의된 부하에서 p95<500ms. 위반 시 기능 중지.
- 320px·200% 확대·WCAG 2.2 AA, 명확한 입력 레이블/오류, 키보드 적용·초기화, 오류 후 초점, aria-live 결과 건수, 44px 이상 터치 영역. Android app-api는 custom 매개변수와 응답 스키마 검증, 계정 전환 지연 응답 폐기, 400/410/429 동등 처리, 영문/국문/JSON 모바일 계약 재생성 및 음성 시험.

### P0 4건·P1 6건 개발 인계
- **P0 OPS1500-01:** QA v1385 [#1968](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1968) Docker 볼륨·작업공간 대량 제거의 실행 주체·승인·누락 자산·Test/백업/롤백 복원성 조사와 독립 복원. 현재 ROOT/DATA 42%/37%는 복구 안전성 입증이 아님.
- **P0 SEC1500-02:** 개발 DB 앱 계정 UPDATE 211/253, DELETE 211/253, TRUNCATE 233/253, account_balances UPDATE·audit_logs DELETE, 체크섬 [#993](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/993), MCP 민감정보 로그 #1972 조사. 운영 DB 권한·악용 여부 미확인, 비밀값 출력 금지.
- **P0 FIN1500-03:** Test 국고 합성 응답 [#1917](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1917), MINT/SWF/국고 출처, QA v1385 undici 누락으로 금융 시험 수집 실패 해결 후 전체 재검증. 최근 금융 병합만으로 PASS 주장 금지.
- **P0 REL1500-04:** QA v1385 lint 오류 3건·모바일 생성 계약 드리프트·금융 시험 의존성 해결, 독립 백업 복원, 공식 Test 프론트/백엔드/엣지 정확 SHA, 승인된 GitOps 운영 승격. 문서 CI만으로 운영 배포 금지.
- **P1 RANGE1500-05:** 본인 SQL·한국시간 반개구간·NUMERIC·과거 계정·EXPLAIN/인덱스.
- **P1 RANGE1500-06:** Nest 입력 검증·마이크로초 HMAC 커서·응답 계약·위조/만료/키 교체.
- **P1 RANGE1500-07:** Next 날짜 UI 적용/초기화·빈 결과/오류/만료·320px 접근성.
- **P1 RANGE1500-08:** Android app-api 매개변수·스키마·계정 전환·영문/국문/JSON 계약.
- **P1 RANGE1500-09:** 개인정보·속도 제한·관리자 익명 KPI·noindex·안전 로그.
- **P1 RANGE1500-10:** 격리 PostgreSQL 17.11 회귀·기능 스위치·무중단 롤백·개발 A/B/C/QA 정확 SHA 인계.

### 수용시험·승격·외부 근거 게이트
- **계획만 수립, 미실행:** 합성 원장 10,001건 이상, 타인 접근 100건, HMAC/범위 위조 100건, 동시 조회 100건, 날짜/마이크로초 경계 50건, 윤년·시계·계정 전환 30건, 비정상 API 50건, WLD/원장 쓰기 0건, 50+1 페이지 정확성, 거짓 빈 결과 0. 기존 기간·방향·커서 회귀 필수.
- 개발자 별도 브랜치·테스트 우선 구현, 필요 시 승인된 전진형 인덱스 마이그레이션, 실제 PG·보안·모바일·접근성·CI, 독립 백업 복원, 공식 Test 프론트/백엔드/엣지 정확 SHA, 운영자 승인 후 제한적 활성화. 기본 OFF, 장애 시 OFF로 롤백하되 원장·환경설정 삭제 금지. 기획 예약은 배포하지 않음.
- 외부 독립 중복 제거·검증·분류 승인: **신규 0건, 누적 UNKNOWN / 10,000건 → BLOCKED / IN PROGRESS**. 10,000건 달성·기능 구현 완료 주장 금지.

**Draft PR:** [#1943](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1943), 미병합 [#1937](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1937) 기반; [개발 인계 #1936](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1936#issuecomment-6507404176). DRAFT / RELEASE HOLD, 독립 병합 금지.

## v1490 / F675-178 — 지갑 거래 북마크 정합성·재시도·모바일 개인정보 보호 보완 (FEATURE IMPROVEMENT / DRAFT / RELEASE HOLD)

**주기:** 이전 Feature Addition v1488 → 현재 Feature Improvement v1490 → 다음 Feature Addition v1492(잠정). **기준:** main 62c6cd038951d65c94b709302bdaec6e75b080b6, AGENTS.md, README.md, 영문 PROJECT_PLAN.md와 국문 대조 문서; 시작·중간 재조회. **선행:** 미병합 Draft PR #1937, 개발 인계 이슈 #1936. **QA:** 독립 v1380 FAILED/P0. 문서 기획만 수행하며 런타임·SQL·DB·WLD·Test·Production은 변경하지 않는다.

### v1488 설계에서 확인한 구체적 보완점
1. 현재 backend/src/wallet/wallet-activity-cursor.ts는 PostgreSQL 마이크로초 시각을 JavaScript Date/ISO 밀리초로 직렬화한다. DB의 (created_at,id) 비교에서 같은 밀리초에 속한 서로 다른 거래가 누락·중복될 수 있다. **새 북마크 커서에는 기존 구현을 재사용하지 않는다.** PostgreSQL 6자리 소수 시각 문자열과 UUID를 정밀도 손실 없이 전달하고 (bookmarked_at DESC,transaction_id DESC)로 정렬한다. UTC 형식·UUID를 엄격 검증하고 HMAC-SHA-256 키 ID·회원·세션·조건·limit·상태 세대(generation)를 결속하며 상수시간 비교, 유효기간 10분, 최대 2048바이트를 적용한다. 기존 거래내역 커서 문제는 별도 개발 회귀 과제이며 이번 기획으로 수정됐다고 주장하지 않는다.
2. frontend/src/lib/app-gateway.ts의 APP_API_REQUEST_HEADERS에는 **Idempotency-Key가 없다.** Android 북마크 저장/삭제의 재시도 키가 상위 서버로 전달되지 않는 위험이다. 북마크 변경 경로에 한정한 UUID 헤더 전달 및 중복·충돌 검증을 추가하고 세션/CSRF와 내부 토큰 경계를 유지한다. 지갑 경로의 private no-store는 존재하지만 **X-Robots-Tag: noindex 강제는 없다.** 성공·오류·304·비정상 상위 응답까지 보강한다. 기존 Backend B 개인정보 이슈 #1935와 코드 변경이 겹치지 않도록 한다.
3. frontend/src/app/wallet/activity/page.tsx에는 북마크 CTA가 없으며 apiOrNull은 장애와 검증된 빈 목록을 구분한다. 이 구분을 보존하고 서버 확인 전 저장 성공을 표시하지 않으며 로그아웃/계정 변경 시 세션 세대가 다른 비동기 응답을 폐기한다. period.ts의 방향·완전성 보조 함수는 현재 화면에 연결되지 않았으므로 배포된 기능이라고 주장하지 않는다.
4. 기존 불변 처리 영수증은 Save 성공→Remove→늦게 도착한 Save 응답에서 현재 상태를 잘못 보여줄 수 있다. 재시도 영수증은 **최초 커밋 시점의 결과**일 뿐 현재 저장 상태가 아니다. 최초 operationId·committedGeneration·effectAtCommit을 반환하고 최신 세대가 다르면 상태 API를 다시 조회한다. 동일 키는 24시간 이내에만 재시도 가능, 영수증 증거는 90일 이상 보존하며 24시간 초과 키는 쓰기 없이 410, 보존 중 다른 지문은 409로 거절한다.
5. 회원당 최대 100개 잠금만으로는 여러 페이지 사이의 추가·삭제에 따른 누락·중복을 막지 못한다. 마지막 북마크 삭제 후에도 초기화되지 않는 **회원별 단조 증가 generation**을 도입한다. 첫 페이지가 generation을 반환하고 커서에 결속한다. 다음 페이지에서 generation이 달라졌다면 409 BOOKMARK_PAGE_CHANGED와 처음부터 다시 보기 CTA를 제공한다. 이는 변경이 없는 동안의 집합 안정성만 보장하며 여러 HTTP 요청 전체의 MVCC 스냅샷은 아니다.

### 목적·사용자·화면·권한·상태
- 대상은 인증·동의한 회원이며, 본인 WLD 원장 거래 최대 100개를 기기 간 저장·삭제한다. 타인이 보낸 입금 및 동결/종료 계정의 과거 거래도 본인 원장에 기록됐다면 포함한다. 공개 공유, 영수증 인증, 메모·분류, 자동 저장, 송금, 잔액/국고 변경은 제외한다.
- 기존 /wallet/activity의 거래별 '거래 저장'/'북마크 삭제' 및 '저장한 거래 보기' → 비공개 /wallet/activity/bookmarks의 '이전 저장 기록 보기'/'목록 처음부터'/'거래내역으로 돌아가기'. 상한 도달 시 '기존 항목을 삭제한 후 저장하세요'. UUID를 그대로 노출하지 않는 접근성 이름, 320px·200% 확대·키보드·44px 터치 목표·스크린리더·Android TalkBack·WCAG 2.2 AA.
- 상태: DISABLED, LOADING, READY, VERIFIED_EMPTY, SAVING, REMOVING, ALREADY_APPLIED, LIMIT_REACHED(409), REPLAY_CONFLICT(409), PAGE_CHANGED(409), CURSOR_EXPIRED(410), REQUEST_KEY_EXPIRED(410), SESSION_EXPIRED(401), FORBIDDEN(403), NOT_OWNER_VISIBLE(404), RATE_LIMITED(429), OFFLINE, UPSTREAM_UNAVAILABLE(503), MALFORMED_RESPONSE(503), ACCOUNT_SWITCHED. 실패·비정상 200을 빈 목록이나 성공으로 표시하지 않는다.

### API·DB·트랜잭션의 실행 가능 계약
- GET /api/v1/wallet/activity/bookmarks?limit=20&cursor=... → {asOf,generation,items,nextCursor,hasMore,limit}; 기본 20/최대 50. 항목은 transactionId,bookmarkedAt 및 본인 소유 거래 투영(transactionId,occurredAt,label,netAmount/cashDelta/bankDelta 정확한 십진 문자열)만 포함한다. 상대방 신원·전체 posting은 제공하지 않는다. 본인 원장 근거가 소실된 항목은 숨기고 개인정보 없는 내부 경고만 남긴다.
- POST /api/v1/wallet/activity/bookmarks/status는 중복 없는 UUID 1~50개를 받아 본인에게 보이는 저장 ID와 generation만 반환한다. 타인/없는 거래 존재 여부를 구별할 수 없게 하며 읽기 전용이다.
- PUT/DELETE /api/v1/wallet/activity/bookmarks/:transactionId는 인증·동의·웹 CSRF·Android 세션과 정규 UUID Idempotency-Key를 요구한다. 최초 커밋의 {operationId,transactionId,action,effectAtCommit,committedGeneration,alreadyApplied,serverTime,currentStateRequiresRefresh}를 불변 영수증으로 반환한다. 400 잘못된 입력, 401 인증, 403 정책, 404 비소유/미존재, 409 상한·키 지문·세대 충돌, 410 키/커서 만료, 429 남용, 503 의존성. 네트워크 응답 유실 시 **동일 키**를 24시간 안에 재시도한다. 410이면 자동 신규 키로 재실행하지 않고 상태를 다시 조회한다.
- 제안 DB: wallet_bookmark_owner_state(owner_user_id PK, generation bigint≥0), wallet_activity_bookmarks(owner_user_id,transaction_id,bookmarked_at, 복합 PK 및 검토된 FK), wallet_bookmark_operation_receipts(owner_user_id,request_key 복합 PK, action,transaction_id,fingerprint,operation_id,effect_at_commit,committed_generation,created_at,expires_at, 불변 응답). (owner_user_id,bookmarked_at DESC,transaction_id DESC) 및 expires_at 인덱스. 계정 삭제·백업 복원 후 재삭제 증빙을 포함하며 원장 FK의 보존 정책을 검토한다. 체크섬 5건 불일치 해소 전 마이그레이션 번호를 배정하거나 기존 SQL을 수정하지 않는다.
- 본인 거래 증명은 ledger_postings→accounts에서 owner_user_id=인증 회원, account_type USER_CASH/USER_BANK, currency WLD인 행 존재 여부로 한다. ledger_transactions.actor_user_id나 account.status='active'로 필터링하지 않으며 posting 다수여도 거래 1건만 반환한다. SECURITY DEFINER 고정 search_path, 공개 EXECUTE 철회, moneyverse_app 최소 EXECUTE만 허용하고 신규 테이블 직접 DML/SELECT/TRUNCATE는 금지한다. **DB 함수에 전달하는 actor 인자 자체가 세션 인증은 아니다.** Nest는 검증된 서버 세션에서만 actor를 유도하며 함수 권한·위협 모델을 별도 검증한다.
- 단일 트랜잭션에서 회원 상태 행 생성·잠금→원장 소유 검증→멱등성 키/지문/시간 검사→100개 상한 확인→저장/삭제→**실제 집합 변경 시에만 generation 증가**→불변 영수증 기록→커밋. 이미 저장/삭제된 no-op은 영수증만 기록하고 세대를 올리지 않는다. 동시 저장 100건이 상한을 넘지 않으며 오래된 Save 영수증 재조회가 삭제를 되돌리지 않는다. 오류 시 전체 롤백. 목록 generation 검증과 조회는 동일 SQL 스냅샷에서 수행하고 PostgreSQL 마이크로초 튜플을 JS Date로 변환하지 않는다.

### 관리자·보안·SEO·모바일·KPI·시험·배포
- Next/Nest/Android 비공개 응답과 오류에 private no-store/noindex, 사이트맵/공개 공유/제3자 추적 금지. 관리자는 k≥20 집계만 조회하고 회원별 북마크 내용·상대방·원시 ID는 볼 수 없다. 읽기 30회/분·쓰기 10회/분·회원당 동시 쓰기 1회 목표는 부하검증 후 확정. KPI 가설은 누출 0, 거짓 성공 0, p95 목록 <500ms·쓰기 <700ms, 30일 사용 시도 ≥5%이며 **실측치가 아니다**.
- **계획, 미실행:** 격리 PostgreSQL 17.11에서 합성 원장 ≥10,001건, 같은 밀리초의 서로 다른 마이크로초, 타인 위조 100건, 99개에서 동시 저장 100건, 응답 유실/늦은 재시도 50건, 계정/세션 변경 30건, 세대 변경·24시간/90일 경계·2^53 초과 WLD·비WLD 제외·다중 posting·삭제/복원·비정상 200·Android 헤더/noindex·320px 접근성. 원장/잔액 변경 0, app 직접 권한 0, 회귀·롤백 증거 필요.
- **P0 4건:** REPO1490-01 과거 참조 462개(비조상 346개)·브랜치 보호; SEC1490-02 적용 체크섬 5건(219/220/221/234/266)·개발 DB 고객문의/감사 DML·함수 ACL; FIN1490-03 MINT 출처 18,000 WLD·국고 미연결 552행·SWF 6 FAIL·Test 합성 200; REL1490-04 QA v1380 FAILED/P0, 전체 lint/test/계약, frontend/backend/edge 정확 SHA, 독립 외부 복원, GitOps, 루트 92%/데이터 97% 용량 안전 확보(타인 작업 삭제 금지).
- **P1 6건:** BOOKMARK1490-05 마이크로초/세대 커서·소유 SQL/인덱스; BOOKMARK1490-06 회원 잠금·불변 재시도/현재 상태 정합성; BOOKMARK1490-07 Nest 계약·Android Idempotency-Key/noindex; BOOKMARK1490-08 Next CTA·계정 전환·접근성; BOOKMARK1490-09 개인정보·관리자 집계·SEO/KPI·삭제/복원; BOOKMARK1490-10 격리 PG 10,001건/악의적 경합/회귀/롤백·정확 SHA Test. **P0 4 + P1 6 = 총 10건.**
- 외부 독립 근거 신규 검증 승인 **0건**, 중복 제거·분류된 누적 승인 **UNKNOWN / 10,000건** → **BLOCKED / IN PROGRESS**. 기능 기본 OFF. 개발자는 별도 브랜치에서 RED/GREEN→격리 PG/권한→전체 CI→공식 Test 동일 SHA 인증 E2E→독립 복원→승인된 GitOps·스모크·롤백 순서로 진행한다. 기획 회차는 운영 배포·원장/DB 변경을 하지 않는다.


## v1478 / F675-175 — 고객문의 초안 권한·중복기획·검증형 전송 보완 (기능 보완 / 초안 / 운영 HOLD)

**진실 기준·주기·협업.** 이전 기능 추가 v1476 → 현재 기능 보완 v1478 → 다음 기능 추가 v1480(잠정). 시작·중간 origin/main `54b182d2214a15974350701174175f589789613b`. 선행 v1476 Draft PR #1901은 **OPEN / CONFLICTING**, 미병합. QA v1374 후보 PR #1902는 **DRAFT / FAILED-HOLD**(금융 시험 15 FAIL / 135 PASS / 18 SKIP)이며 공식 Test 정확 SHA 인증이 아님. v1476을 보완하는 문서 작업으로 코드·SQL·DB·WLD·Test·운영 변경 없음. [P0 문의 권한 #1908](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1908), [v1476 개발 이슈 #1900](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1900).

### 1. 실제 근거·중복기획 통합·책임 범위
- **개발 DB 실측 P0:** PostgreSQL 17.11 `woldeok_moneyverse_dev`의 문의 3건·메시지 6건, 초안 테이블 없음. `information_schema.role_table_grants`에서 `moneyverse_app`가 **두 테이블** `public.support_threads`, `public.support_messages`에 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER 권한을 보유하고 부여자는 `postgres`로 확인됨. 마이그레이션 196·302의 명시적 `REVOKE ALL`과 불일치. 메시지 본문은 조회하지 않았고 운영 DB 권한·악용·원인은 **미확인**. 임의 SQL 권한 회수 금지; 역할·기본 권한·적용 이력·체크섬을 읽기 전용 보존하고 격리 PostgreSQL에서 전진형 수정과 SECURITY DEFINER 정상 동작을 검증한 후 승인 배포.
- **실제 전송 경로 문제:** `frontend/src/app/support/actions.ts`의 `createSupportThread`/`replySupportThread`는 매 호출 안에서 새 `randomUUID()`를 생성하므로 응답 유실 뒤 재호출 시 중복 전송 가능성이 있음. 마이그레이션 196의 `support_create_thread`는 동일 키 재사용 시 회원만 확인하고 **제목/본문 일치는 검증하지 않음**. `support_add_message`는 본문을 확인하지만 동시 삽입 유니크 키 경합 시험이 필요. 302의 `support_my_message_receipt`는 메시지 UUID를 알아야 조회하므로 전송 결과 불명 상황의 키 기반 확인 수단이 아님. **운영 중복 전송 발생 증거는 아님**.
- **기존 세 기획을 하나로 통합:** F675-139/이슈 #1456은 초안 복구·원자적 전송, F675-164/이슈 #1758은 비공개 초안, F675-175/이슈 #1900은 다시 초안 저장을 정의함. 테이블·전송 API·기능 스위치를 3세트 구현하지 않음. F675-175는 기존 설계의 **최신 보완층**이며 F675-139의 원자적 전송과 F675-164의 스키마를 하나의 `support_private_drafts` 기능으로 합침. 과거 보관기간 **30일**과 v1476 **7일**이 충돌함. 개인정보 최소화를 위해 7일을 잠정 권고하되, 정책·고지·기존 초안 전환은 **결정 대기**이며 승인 없이 단축·삭제 금지.

### 2. 회원 화면·CTA·상태·접근성
- 기존 `/support` 신규 문의와 `/support?thread=<본인 UUID>` 답장에 **임시저장/이어쓰기/삭제/전송**, 전송 불명 시 **전송 상태 확인/동일 요청 재시도** 제공. 800ms 선택형 자동저장은 기본 OFF. 저장되지 않은 수정이 있으면 **저장된 초안 전송** 전에 명시적 저장·리비전 검증이 필요하며, **현재 글 바로 전송**을 선택하면 기존 저장 초안은 자동 삭제하지 않음. 자동저장이 전송으로 바뀌거나 오래된 서버 내용을 몰래 전송해서는 안 됨.
- `not_saved`, `saving`, `saved(revision,time)`, `conflict`, `expired`, `offline`, `unavailable`, `disabled`, `send_pending`, `send_uncertain`, `send_committed(receipt)`, `send_rejected` 상태를 구분. 409에서는 양측 리비전·시각 비교 후 수동 조정, 타임아웃은 전송 실패/미전송 확정으로 오표시하지 않음. 로그아웃·계정 변경 시 평문 메모리·대기 응답 제거. 320px·44px 터치·키보드·스크린리더 상태 안내·동작 줄이기·WCAG 2.2 AA, 한국어/영어 및 Android 동등, 비공개 noindex/nofollow·no-store.

### 3. API·동일 요청 재생 계약(미구현 제안)
- 본인 전용 GET/PUT/DELETE `/api/v1/support/drafts`의 `contextType,threadId?,expectedRevision`(십진 문자열 bigint), `requestId`(UUID), 제목·본문 길이·영수증 계약을 유지. 독립 전송 시스템을 또 만들지 말고 **단일** POST `/api/v1/support/drafts/send`에 `{contextType,threadId?,expectedRevision,sendRequestId,subject?,body}`를 받고 GET `/api/v1/support/send-receipts/:sendRequestId`로 회원별 확인. 회원 신원은 검증된 세션에서만 결정, `userId` 입력 금지. Next 동일 출처 BFF와 Android app-api의 DTO·동의·CSRF/베어러·오류 동등. 기존 직접 전송은 동일 영수증 계약에 위임하거나 초안 삭제 없는 별도 경로로 명확히 표시.
- 사용자가 전송을 확정할 때 **논리적 전송 1회당** `sendRequestId`를 난수 생성하고 회원·세션 세대·컨텍스트·정규화 본문 해시와 결속. 응답 불명 재시도에서는 서버 액션 내부에서 새 UUID를 생성하지 않고 **동일 키·동일 내용**을 재사용. 동일 키·동일 내용은 이후 편집에도 최초 `threadId/messageId/committedAt` 불변 영수증, 동일 키·다른 본문/컨텍스트/회원은 409 또는 타인 존재를 숨기는 404. 회원+키 조회는 메시지 UUID 사전 인지를 요구하지 않음. 요청 진행 중 `NOT_FOUND`는 미전송 증거가 아니며 동일 키로만 재시도. 30일 영수증 만료 후까지 중복 방지를 보장한다고 주장하지 않음.
- 400 입력 오류, 401 인증, 403 동의/활성 회원, 404 타인·없는 컨텍스트/영수증, 409 리비전·키·본문 충돌, 410 본인 만료 초안, 413 크기, 429 제한, 503 DB/암호키 장애. 허용 필드만 받기, Unicode NFC·공백 정규화와 JS/PostgreSQL 길이 기준 일치, 크기·시간·회원/IP 제한, `private,no-store`, 민감 내용·요청 키 로그 금지. 기존 문의 조회 API 호환 유지.

### 4. DB·암호화·원자성·보관
- **신규 마이그레이션 번호 미할당**: 개발 DB 적용 체크섬 5건과 #1878 계보 검증 우선. 전진형 스키마는 하나의 `support_message_drafts` 회원+컨텍스트 유일성·단조 증가 BIGINT 리비전·암호문/nonce/tag/key_version·만료 인덱스, 회원별 `UNIQUE(owner_id,send_request_id)` 전송 의도/영수증 저장소·요청 HMAC·불변 결과·30일 영수증 보존. 전역 요청 UUID 단독 PK로 타인 키 존재가 노출되지 않도록 회원 단위 스코프. 회원 행 잠금으로 활성 초안 20개 한도. 전송·삭제·만료 뒤 tombstone/generation을 유지해 늦은 자동저장으로 되살아나는 ABA 현상 차단.
- 서버 AES-256-GCM(새 96비트 nonce·128비트 tag), AAD는 회원·컨텍스트·**예상 다음 리비전 = expectedRevision+1**에 결속. 암호화 후 DB CAS에서 구버전이면 암호문 폐기, nonce 재사용 금지. 키 유실 시 실패 처리, 키 교체·백업 복원 tombstone 검증. 관리자 복호화/검색 금지, 앱 역할 테이블 직접 SELECT/DML/TRUNCATE 및 PUBLIC EXECUTE 금지, 본인 확인 함수에만 최소 EXECUTE.
- **저장 초안의 원자적 전송:** 회원 → 컨텍스트/초안 → 전송 의도 행 순서로 잠금, 활성 회원·본인 답장·기대 리비전·본문 해시·요청 키 확인. 기존 문의/메시지 생성, 불변 전송 영수증, 해당 리비전 초안 tombstone을 **단일 DB 트랜잭션**에 확정. 최신 리비전이 다르면 409·전송/삭제 모두 없음; 이미 확정된 키면 새 메시지 없이 최초 영수증 반환. 현재 글 직접 전송은 최신 저장 초안 삭제 금지. 적용된 196을 수정하지 말고 새 전진형 변경에서 `support_create_thread`의 동일 키 다른 제목/본문 문제 및 동시 삽입 경합을 해결·시험. 권한 확대를 임시 해결책으로 쓰지 않음.
- 만료·동의 철회·비활성 회원은 즉시 평문 조회 차단, 암호문 파기와 복원 후 재노출 방지. 과거 30일 정책에서 7일로 무단 단축 금지. 서버 탈취까지 막는 종단 간 암호화로 오인시키지 않음.

### 5. 관리자·보안·SEO·KPI·시험·운영 게이트
- 관리자에게는 개인정보 보호 임계치 적용 집계(저장·복구·전송 불명·실패)와 기능 상태만 제공. 초안·회원 식별자·키·영수증·본문 조회 금지. 가설 KPI는 동일 키 중복 전송 0, 타인 초안/영수증 조회 0, 자동 전송 0, 대표 격리 Test p95 저장 <500ms, 전송 불명 감소(실측 전 성과 주장 금지). 로그 비식별, 비공개 SEO/no-store, 접근성 회귀 필수.
- **수용시험 명세만, 미실행:** 격리 PostgreSQL 17.11 합성 초안 10,001개, 회원 위조/CSRF 100건, 저장·삭제·전송 동시성 100건, 응답 유실 재생 50건, 동일 키 다른 내용·동시 삽입 30건, 만료·키 교체·계정 변경·백업 복원 30건. 이후 리비전 변경 시 원본 영수증, 중복 메시지 0, tombstone 재생 방지, 20개 제한, 타인 존재 비노출, 앱 역할 테이블 권한 DENIED, 관리자 내용 DENIED, WLD/원장 변화 0, Nest/Next/Android·320px 접근성·롤백 검증. 196/302 소스와 개발 DB 권한 차이도 격리 DB 재현·검증.
- **P0 4건:** `REPO1478-01` 과거 브랜치 보존 및 충돌 선행 PR #1901 비파괴 조정; `SEC1478-02` 고객문의 DB 권한 편차 #1908·체크섬 5건; `FIN1478-03` 국고/조폐 #1895/#1896·중앙은행/국부펀드 #1902 실행 차단, MINT 18,000 WLD·국고 552행 출처; `REL1478-04` 전체 CI·독립 백업 복원·공식 Test 정확 SHA 인증·승인 GitOps·롤백. **P1 6건:** `DRAFT1478-05` F675-139/164/175 통합·7일 대 30일 보관 결정/스키마; `DRAFT1478-06` 원자적 전송·안정 키·본인 영수증·ABA 방지; `DRAFT1478-07` Nest/Next/Android API; `DRAFT1478-08` 회원 충돌/불명 전송 UI·접근성; `DRAFT1478-09` 관리자·개인정보·SEO·KPI; `DRAFT1478-10` 실제 PG 권한·경합·재생·롤백. 개발은 별도 브랜치, 기능 기본 OFF, 공식 정확 SHA Test·승인 운영승격 전 HOLD. 기획 회차에서 런타임·DB 변경 없음. 외부 독립 중복 제거 검증 승인 **신규 0건·누적 UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**.


## v1476 / F675-175 — 회원 전용 고객문의 임시저장 (기능 추가 / 기획 초안 / 운영 보류)

**주기·근거·한계.** 이전 기능 보완 v1474 → 현재 기능 추가 v1476 → 다음 기능 보완 v1478(잠정). 시작·중간 기준 origin/main `0dffb939676e6cfd861d19f96208f8929902d1f9`; v1474 Draft #1892의 병합은 가정하지 않음. 마지막 완료 독립 QA v1373 FAILED/P0(2026-10-29 21:35 KST), 신규 금융 실행 경로 회귀 #1895. 소스·개발 DB는 읽기 전용 조사. [개발 이슈 #1900](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1900). **문서 기획만 수행**하며 코드·DB·WLD·기능 스위치·공식 Test·운영은 변경하지 않음.

### 실제 소스 공백·대상·목적
- `frontend/src/app/support/member-support-forms.tsx`의 새 문의/답장 `useActionState` 폼에는 영구 임시저장 동작이 없음. `backend/src/support/support.controller.ts`는 전송·조회·대화 내역을 제공하지만 임시저장 API는 없음. 마이그레이션 `196-user-admin-support-chat.sql`은 실제 제출된 문의/메시지만 저장. 개발 PostgreSQL의 문의 3건·메시지 6건, 임시저장 테이블 없음은 **운영 건수나 수요 증거가 아님**.
- 대상은 모바일·여러 기기에서 민감한 관리자 문의를 작성하는 로그인 회원. 새 문의와 본인 소유 문의 답장의 **미전송 초안**만 저장. 기존 전송된 문의, F675-104 사건 에스컬레이션, F675-105 증빙 보관함, F675-173 개인정보 내보내기와 구분. 관리자 초안 조회, 첨부파일, 자동 전송·에스컬레이션·알림·잔액 변경·환불·청구 없음.
- 대안 비교: 브라우저 localStorage만 사용하면 기기 동기화가 안 되고 공용 기기 잔존 위험, 서버 평문 저장은 민감정보 노출 범위 증가. **권고안**은 회원 소유권 함수와 서버 암호화를 결합한 교차 기기 임시저장. 키 관리가 검증되기 전 기능은 OFF.

### 화면·CTA·상태
- 진입점은 기존 `/support` 새 문의 및 `/support?thread=<본인-uuid>` 답장. **임시저장**, **이어쓰기**, **초안 삭제**, 기존 **전송** 버튼을 분리. 800ms 지연 자동저장은 명시적 선택 시에만 켜며 기본 OFF. 저장은 전송이 아님. 회원당 활성 초안 최대 20개, 새 문의 1개 및 본인 소유 문의별 답장 1개, 최종 확인된 저장부터 7일 만료. 본문 1~2,000자, 새 문의 제목 1~120자. 빈 입력은 명시적으로 삭제하며 자동 업로드 금지.
- 상태: 미저장/저장 중/서버 확인 저장(시각·리비전)/충돌/만료/오프라인/서비스 불가/기능 OFF/전송 중/전송 검증 완료/전송 결과 불명. 타임아웃을 저장·전송 성공으로 표시하지 않고 로컬 입력을 유지하며 동일 요청 UUID로 재시도. 401 로그인, 403 본인·동의 거부, 404 타인·삭제된 문의, 409 구버전, 410 만료, 413 크기 초과, 429 제한, 503 서버·암호키 장애를 구별. 로그아웃·계정 전환 시 민감한 메모리와 미완료 응답을 폐기.
- 여러 기기 충돌은 서버 수정 시각을 표시하고 **서버 초안 검토** 또는 **로컬 내용 유지**를 사용자가 명시적으로 선택하도록 함. 자동 덮어쓰기 금지. 전송 확인 후에도 전송에 사용한 리비전과 일치할 때만 초안을 삭제하여 다른 기기에서 작성한 최신 내용을 보존. 전송 결과 불명일 때 기존 메시지 불변 영수증으로 확인 전까지 초안 유지.

### API·인증·암호화·악용 방지
- NestJS `GET /api/v1/support/drafts?contextType=new_thread|reply&threadId=<uuid>`, `PUT /api/v1/support/drafts` 본문 `{contextType,threadId?,subject?,body,expectedRevision,requestId}`, `DELETE /api/v1/support/drafts` 본문 `{contextType,threadId?,expectedRevision,requestId}`. 리비전은 JS 정밀도 손실 방지를 위해 십진 **문자열**이며 최초 저장은 `"0"`. 응답 `contextType,threadId?,revision,updatedAt,expiresAt,receiptId`; GET은 본인만 복호화된 제목/본문 추가. 사용자 ID는 입력받지 않고 검증된 세션에서 결정. DTO 미허용 필드·잘못된 UUID·초과 문자열·제어문자 거부. Next 동일 출처 `/api/support/drafts` 쓰기는 세션·동의·CSRF, Android `/app-api/v1/support/drafts`는 검증된 bearer 신원 사용. 경로맵·앱 API 계약 동등성 검증.
- 동일 `requestId`·본문 재요청은 이후 리비전이 바뀌어도 최초 불변 영수증을 반환하며, 동일 키에 다른 본문은 409. 타인 문의 존재를 누설하지 않는 404, 본인 초안 만료 시 권한 확인 후 410. 제안 제한: 회원별 분당 쓰기 30/읽기 60, IP별 추가 제한, 요청 크기·처리시간 상한(실측 후 조정). 모든 응답 `private,no-store`; 페이지 noindex/nofollow, 사이트맵 제외. 평문·암호문·요청 키·토큰·메시지 내용 로그 금지.
- NestJS가 UTF-8 JSON `{subject?,body}`를 AES-256-GCM(무작위 96비트 nonce, 128비트 tag)으로 암호화하고 키 버전을 참조. 키는 DB·브라우저에 저장하지 않음. 추가 인증 데이터에 회원·컨텍스트·리비전을 결속. 키 장애 시 실패 처리, 키 교체·유실·만료 데이터 파기 절차를 명세. 서버 탈취에도 안전한 종단 간 암호화라고 주장하지 않음.

### DB·트랜잭션·권한·만료
- **제안 스키마이며 미적용**. 기존 적용 마이그레이션과 체크섬 불일치 5건을 먼저 해결하고 신규 고유 번호의 전진형 SQL만 사용. `support_message_drafts`: `owner_id uuid REFERENCES users`, `context_type CHECK('new_thread','reply')`, `context_id uuid NOT NULL`, `ciphertext bytea`, 12바이트 nonce·16바이트 tag, `key_version`, `revision bigint CHECK>0`, `updated_at`, `expires_at`, `PRIMARY KEY(owner_id,context_type,context_id)`. 새 문의는 0 UUID 센티넬, 답장은 실제 본인 소유 `support_threads.id`만 허용하는 CHECK/함수 검증. `(owner_id,expires_at)`, `(expires_at,owner_id)` 인덱스. 평문 검색 인덱스 없음.
- `support_draft_operation_receipts`: `request_id uuid PRIMARY KEY`, owner/context/operation, `request_hmac bytea`, 결과 리비전, `receipt_id uuid UNIQUE`, 확정 시각. 초안 7일과 별개로 영수증은 30일 보관하여 응답 유실 재시도 보장 후 정책에 따라 파기. 원문 기록 금지. `SECURITY DEFINER` 함수에 고정 search_path·본인 검증; 테이블은 PUBLIC·moneyverse_app 직접 권한 회수, 최소 EXECUTE만 부여. 동시 신규 초안 20개 한도를 지키도록 회원 계정 행을 먼저 잠그고 컨텍스트 행 잠금→리비전·본인 문의 검증→암호문 갱신·만료 설정→불변 영수증 기록을 **단일 트랜잭션**으로 처리. 동일 키 재생은 변경 없이 최초 결과 반환.
- 삭제·전송 후 정리는 compare-and-swap 리비전 일치 시만 수행. 저장·삭제·전송 경합의 확정 결과를 하나로 제한하고 오래된 요청은 409. 계정 삭제·만료 후 즉시 읽기 금지, 정리 작업은 멱등·건수만 감사·백업 복원 후 재노출 방지. 개인정보 내보내기에 초안을 포함할지는 별도 법적 검토가 필요하며 관리자 내용 조회는 허용하지 않음.

### 관리자·SEO·접근성·분석·수용시험
- 관리자는 익명 집계된 저장 실패/지연/만료 건수와 기능 스위치만 확인. 개인 초안 조회·검색·대리 열람·내용 내보내기·자동 사건 생성 금지. 가설 KPI: 임시저장 복구 후 문의 완료율, 대표 Test에서 p95 저장 <500ms, 충돌·429·503 비율, 타인 조회 0, 원치 않는 전송 0. 제목/본문·암호문 분석 수집 금지.
- 웹 320px 단일 열·44px 터치 영역·키보드 포커스·스크린리더 저장/충돌 상태 알림·만료 안내·동작 줄이기·WCAG 2.2 AA. Android는 전송 대기 중 최소한의 로컬 안전 저장만 허용하며 로그아웃 시 폐기. 로그아웃 후 브라우저 뒤로가기로 초안 재노출 금지.
- **수용시험은 명세만 했고 미실행**: 격리 PostgreSQL 17.11 합성 10,001개, 타인/위조/CSRF 100건, 동시 저장·삭제·전송 100건, 응답 유실·멱등 재생 50건, 만료·계정 전환·키 교체 30건. 앱 역할 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE 금지, 관리자 조회 금지, WLD·원장 영향 0, Nest/Next/Android 계약, 접근성·SEO, 영수증 재생, 백업 복원, 기능 OFF 롤백. #1878·적용 체크섬 계보 검증 전 마이그레이션 번호 할당 금지.
- **운영 보류:** QA v1373 금융 #1895/#1896의 미검증 국고·조폐 실행, 기존 중앙은행·국부펀드 실패, MINT 18,000 WLD 출처, 국고 552행 연결, 개발 DB 체크섬 불일치 5건과 audit_logs 앱 권한, 브랜치 보존 #1663, 독립 백업 복원·공식 Test 정확 SHA. 새 코드는 별도 개발 브랜치·전체 CI·실제 PG 보안/금융 회귀·공식 Test 인증 E2E·승인 GitOps 이후에만 승격. 기능 기본 OFF, 롤백 시 UI/API 숨김·암호화 데이터는 정책적 파기까지 보존.
- **P0 4건:** REPO1476-01 브랜치/PR 보존; FIN1476-02 금융 fail-closed·출처; SEC1476-03 체크섬·권한·스키마 계보; REL1476-04 전체 CI·복원·정확 SHA Test·GitOps. **P1 6건:** DRAFT1476-05 DB/권한/TTL, DRAFT1476-06 경합·불변 영수증, DRAFT1476-07 Nest/Next/Android API, DRAFT1476-08 회원 UI·접근성, DRAFT1476-09 개인정보·관리자·KPI, DRAFT1476-10 격리 PG·보안·롤백. 양 언어 10개 식별자 동일. 외부 독립 중복 제거·검증 승인 신규 **0건**, 누적 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**.





## v1482 / F675-176 — 지갑 저장 필터: 검증된 거래내역·단조 증가 세대·안전한 재시도 (기능 보완 / DRAFT / RELEASE HOLD)
- **종속 Draft PR:** [#1920](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1920) — #1916 기반, 미병합. 첫 확인 시 CI 진행 중이며 릴리스 인증이 아니다.

**주기·기준:** 이전 기능 추가 v1480 → 현재 기능 보완 v1482 → 다음 기능 추가 v1484(잠정). 시작 main `62c6cd038951d65c94b709302bdaec6e75b080b6`(2026-10-30 01:05 KST). v1480은 아직 미병합 Draft PR #1916이며 이번 문서는 해당 브랜치 위에 쌓는 제안이다. 독립 QA v1376 **FAILED/P0**(#1917). C v1172 응답 검증 후보(#1919)는 로컬 전용으로 main 미반영. **구현·DB·Test·운영 변경이 아닌 기획 계약**이다.

### 소스 근거와 설계 오류 보완
- `backend/src/wallet/wallet.repository.ts`의 `recentTransactionsForUser`에는 이미 `in/out/neutral` SQL `HAVING` 필터가 있으나, **페이지네이션용** `activityTransactionsForUser`에는 방향 필터가 없다. `frontend/src/app/wallet/activity/period.ts`의 방향 URL 헬퍼도 현재 페이지와 Nest 조회 API에 연결되지 않았다. 실 PostgreSQL 테스트로 부호를 검증해 기존 의미를 재사용하되, LIMIT 이후 메모리 필터나 이미 기능이 구현됐다는 주장은 금지한다.
- 기존 `wallet-activity-cursor.ts` v1은 세션 관련 키로 서명하고 **60분** 유효하며 `Date.toISOString()`을 써 밀리초까지만 보존한다. 새 저장 필터용 v2는 **15분**, 목적별 독립 서명 키와 PostgreSQL 마이크로초 보존을 요구한다. 기존 페이지의 `apiOrNull<WalletHistoryPage>`는 런타임 구조 검증을 하지 않는다. C v1172(#1919)에서 별도로 검증기를 개발했으나 아직 main에 병합되지 않았으므로 작업 브랜치를 건드리지 않고 계약만 연계한다.
- 01:08 KST 개발 PostgreSQL 17.11 **읽기 전용** 조회에서 제안한 저장 필터·집합·영수증 테이블 3개는 모두 **없었으며**, `moneyverse_app`에는 `support_threads` UPDATE/TRUNCATE 직접 권한이 남아 있었다. 운영 DB 상태를 의미하지 않는다. `frontend/src/lib/app-gateway.ts`는 `wallet` 경로를 허용하지만 `APP_API_REQUEST_HEADERS`에 `If-Match`·`Idempotency-Key`가 없어 Android 저장 필터 쓰기 계약이 전달되지 않는다. 헤더 허용 목록·CSRF/인증·거부 시험을 개발에 명시하고 경로 존재만으로 모바일 동등성을 주장하지 않는다.
- QA v1376 P0: Test 공개 `/api/treasury/overview`가 합성 `disb-*` 항목으로 HTTP 200을 반환한 반면 운영 **공개** 경로는 안전하게 503이었다. 백엔드 SHA 일치만으로 프론트엔드·엣지 배포 증명이 불가능하다(#1917, 대응 Draft #1918). 실제 WLD 이동이나 운영 공개 합성 응답을 입증한 것은 아니다.

### 소유자 세대·원자적 변경·멱등성
- 신규 제안 `member_wallet_activity_view_sets`: 회원별 `owner_user_id UUID PK`, `generation BIGINT >0`, `updated_at`. SECURITY DEFINER 트랜잭션에서 없으면 생성한다. 생성·이름 변경·필터 변경·정렬·기본값 지정·삭제·전체 초기화 **모든 성공한 변경마다 세대 증가**, 마지막 필터 삭제 후에도 초기값으로 되돌리지 않는다. 필터별 `revision`은 유지하고 회원 집합 ETag `"wv-g<generation>"`을 모든 변경(생성·기본값 포함)의 `If-Match`로 요구한다. 누락 428, 오래된 값 409.
- 처리 순서: 인증 세션에서 소유자 결정 → 현재 세대 검사 **전에** `(owner,idempotency_key)` 영수증 조회 → 동일 정규화 요청·예상 세대면 원본 불변 영수증 반환, 다른 내용이면 409 → 소유자 집합 행 `FOR UPDATE` 잠금 → 세대/필터 revision 확인 → 최대 8개·이름 유일·기본값 최대 하나 검증 → 이전 기본값 해제와 새 기본값 지정 → 세대 증가·필터/삭제 표식·영수증을 **단일 커밋**. 실패하면 전부 롤백. 지연 요청으로 삭제된 필터를 되살리거나 최신 기본값을 덮어쓰면 안 된다.
- 영수증을 삭제한 후에도 무기한 멱등성을 보장한다고 주장하지 않는다. 삭제 표식·영수증 보존 기간은 **정책 미확정**(v1480의 7일은 잠정). 서버가 서명한 유효기간 있는 작업 토큰으로 영수증 정리 후 오래된 재생도 거부하고, 허용된 재시도 기간에 필요한 증빙을 먼저 삭제하지 않는다. 저장 필터 영수증은 금융 거래 영수증이 아니다.
- SECURITY DEFINER 함수는 search_path 고정·SQL 내부 소유권 확인·PUBLIC EXECUTE 금지·app 역할의 테이블 직접 SELECT/DML/TRUNCATE 금지, 필요한 EXECUTE만 허용. 금융 원장 쓰기·기존 적용 마이그레이션 수정 금지. 체크섬 5건과 DEV 권한 불일치 해결 전 신규 마이그레이션 번호 확정 금지.

### SQL·커서·API 검증
- 본인 USER_CASH+USER_BANK 원장 차변/대변을 거래별 합산하고 **SQL에서 방향 조건을 적용한 뒤** `(created_at,id) DESC LIMIT 51`. 양수=증가, 음수=감소, 0=순변동 없음(내부 이체 단정 금지). 격리 실제 PostgreSQL로 부호와 기존 전체 기록 결과를 대조한다. WLD는 정규 십진 문자열/BigInt로만 다루며 `cashDelta + bankDelta = netAmount`를 검증한다.
- v2 HMAC-SHA-256 커서는 버전·키 ID·목적·회원·인증 세션/세대·필터 해시·viewId/리비전과 **집합 세대**·DB `asOf`·기간 `since`·마지막 거래의 **마이크로초 6자리** 시각/UUID·발급/만료(15분 이내)에 결속한다. PostgreSQL 파라미터에서 6자리 정밀도를 유지하고 **JS Date를 거쳐 마지막 시각을 반올림하지 않는다**. 크기·인코딩·상수시간 서명 검증·키 교체를 DB 접근 전에 검사. 필터/기본값 변경·로그아웃·계정 전환·409/410이면 이유를 표시하고 첫 페이지부터 다시 시작. 잘못된/초과 커서는 400, 만료는 410이며 **커서를 조용히 버리고 첫 페이지를 다음 페이지인 것처럼 표시하지 않는다**. 기능 OFF에서는 기존 60분 v1 계약 그대로 유지.
- Nest/Next/Android의 거래내역 응답을 `unknown`에서 런타임 검증: 거래 배열 최대 50, UUID 중복 없음, 유효·범위 제한 시각, 정확한 WLD 정수 문자열과 현금+은행 합계, `hasMore` 불리언, `hasMore`가 참일 때만 `nextCursor`가 null이 아님, `asOf`·적용 필터·리비전 일치. 구조가 잘못된 HTTP 200은 **불가/503**으로 처리하고 빈 내역으로 꾸미지 않는다. 검증된 빈 목록/검색 결과 없음/만료/장애/저장 결과 불명을 구분한다. 금액·필터명·커서·회원 ID는 로그·분석에 남기지 않는다.
- Next 동일 출처 세션/CSRF/server-only API와 Android `/app-api/v1/[...path]`는 동일 오류 계약을 제공한다. 생성 API 문서 영·한·JSON 일치가 릴리스 조건. viewId와 기간/방향 혼합, 임의 userId, 공개 캐시·검색 색인 금지.

### 수용시험·배포·KPI·개발 백로그
- **계획이며 미실행:** 격리 PostgreSQL 17.11 합성 원장 10,001건, 타인 접근·위조 커서 100건, 기본값 경쟁·전체 삭제→재생성 ABA 포함 동시 수정 100건, 후속 세대 변경 뒤 응답 유실 재시도 50건, 마이크로초·UTC·0 순변동·만료·삭제 표식 30건, 잘못된 HTTP 200·중복/과대 커서 100건. LIMIT 이전 SQL 필터, 50+1 페이지, v1 기능 OFF 회귀, 실제 앱 역할 직접 접근 거부, 원장 쓰기 0, 320px/200% WCAG 2.2 AA, noindex/no-store, 웹·Android 동등성, 기능 OFF 롤백 검증. p95 <500ms는 격리 대표 데이터에서 검증할 **목표치**이지 실측 성과가 아니다.
- 관리자에게는 최소 표본 기준을 충족한 익명 집계·오류·지연만 제공한다. 개인 필터명·원장·금액·영수증 키 금지. 저장 성공·7일 재사용·409/410·비정상 응답 차단·타인 조회 0·중복 변경 0을 개인정보 없이 측정. 기본 OFF, 전진형 스키마와 별도 개발 A/B/C 브랜치, 전체 CI·독립 외부 백업 복원·공식 Test 인증 E2E·**프론트/백엔드 각각의 정확 SHA 및 엣지 검증** 이후 승인된 GitOps만 허용. 롤백은 기존 내역으로 돌아가며 금융 원장과 개인 필터를 삭제하지 않는다.
- **P0:** REPO1482-01 과거 Git 참조 462개 보존; SEC1482-02 DEV 고객문의·감사 앱 직접 DML 및 체크섬 5건 해결; FIN1482-03 SWF 허위 성공·MINT 18,000 WLD 출처·국고 552행; REL1482-04 Test 합성 국고 200/프론트 SHA 검증(#1917/#1918), 분류기·lint·app-api·전체 CI·외부 복원·공식 Test 정확 SHA. 모두 **BLOCKED/HOLD**.
- **P1:** VIEW1482-05 소유자 세대/스키마/ACL; VIEW1482-06 SQL 방향 필터·마이크로초 v2 커서; VIEW1482-07 Nest/Next/Android 런타임 응답·오류 검증과 게이트웨이 If-Match/Idempotency-Key 전달; VIEW1482-08 회원 충돌 UI·320px 접근성; VIEW1482-09 관리자 익명 집계·개인정보·SEO·KPI; VIEW1482-10 격리 PG·공격적 회귀·롤백. C v1172(#1919)는 별도 후보로 연계하고 타 작업 브랜치는 변경하지 않는다.
- 외부 독립 근거 신규 중복 제거·분류·검증 승인 **0건**, 누적 승인 **UNKNOWN / 10,000건**. Gate **BLOCKED / IN PROGRESS**. 기존 v1480 상세기획을 유지·보완하며 새 독립 기능 기획 파일은 만들지 않는다.

## v1480 / F675-176 — 회원 전용 지갑 기록 저장 필터 (기능 추가 / DRAFT / RELEASE HOLD)

**주기·기준:** 이전 기능 보완 v1478 → 현재 기능 추가 v1480 → 다음 기능 보완 v1482(잠정). 시작 main `62c6cd038951d65c94b709302bdaec6e75b080b6`(2026-10-30 00:10 KST), 독립 QA v1375 FAILED/P0. [개발 이슈 #1915](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1915). **기획 초안이며 구현·검증·배포 완료가 아니다.**

### 소스 근거·목적·중복 방지
- `frontend/src/app/wallet/activity/page.tsx`는 전체/최근 7일/최근 30일과 50건 커서 조회만 제공한다. `backend/src/wallet/wallet.controller.ts`는 period/cursor만 수신하며, 서비스 커서는 회원·세션·기간에 결속된다. DB 조회는 본인의 USER_CASH/USER_BANK 원장 기록을 집계하지만 순변동 방향 필터나 이름 있는 저장 필터는 확인되지 않았다. 별도 CSV 내보내기와 중복하지 않는다. 운영 사용자 수요를 실측했다는 뜻은 아니다.
- 대상은 반복해서 자신의 WLD 거래 기록을 확인하는 로그인 회원. **최대 8개**의 개인 필터(기간·순변동 방향)를 이름 붙여 저장하고 기본 필터를 하나 선택해 웹·Android에서 이어 쓴다. F675-171 수취인, F675-172 바로가기, F675-173 개인정보 내보내기, F675-174 알림 검색, F675-175 고객문의 초안과 별개다. 거래·송금·보상·매수·출금·원장 수정은 수행하지 않는다. 기능 스위치 `wallet_activity_saved_views`는 기본 **OFF**.
- 기존 원장이 유일한 금융 근거다. 저장 필터 및 그 처리 영수증은 금융 거래 영수증이 아니다.

### 회원 화면·CTA·상태·접근성
- 진입점: 기존 비공개 `/wallet/activity`. 기간 ALL/LAST_7_DAYS/LAST_30_DAYS, 순변동 ALL/INCREASE/DECREASE/UNCHANGED를 선택하고 `필터 적용`, `이 필터 저장`, `저장 필터 사용`, `이름 변경`, `기본으로 설정`, `삭제`, `전체 기록으로 초기화`를 제공한다. 이름은 공백 정리 후 NFC 1~40 코드포인트, HTML로 해석하지 않고 텍스트로만 표시한다.
- 순변동은 회원 소유 USER_CASH+USER_BANK 계정의 거래별 **부호 있는 WLD 순변동**을 뜻한다. 실제 PostgreSQL 테스트로 차변/대변 부호를 검증한 후 양수=증가, 음수=감소, 0=순변동 없음으로 표시한다. **0을 내부 이체라고 단정하지 않는다.** 세금·소득 증빙도 아니다. 금액에 JavaScript Number를 사용하지 않는다.
- 기본/미저장 미리보기/저장 중/저장 성공·리비전 영수증/적용/결과 없음/원장 자체 없음/다음 페이지/오래된 커서·리비전/이름 충돌/8개 초과/동일 요청 재생/401·403·409·410·429·503/오프라인·응답 유실/기능 OFF/로그아웃·계정 전환 시 낡은 응답 폐기를 구분한다. 필터나 세션이 바뀌면 첫 페이지부터 다시 조회한다. 실패를 성공으로 표시하지 않는다.
- 320px 단일 열, 200% 확대, 터치 44px, 키보드 포커스·스크린리더 상태 알림·모션 감소, WCAG 2.2 AA. 기존 한국어 화면 문구를 임의로 변경하지 않는다. 비공개 페이지는 `noindex,nofollow`, sitemap 제외, 응답은 `private,no-store`.

### API·인증·악용 방지·Android
- 제안 NestJS: `GET /api/v1/wallet/activity/views` 목록, `POST` 생성, `PATCH /api/v1/wallet/activity/views/:id` 수정·기본·순서, `DELETE` 논리 삭제. 쓰기는 UUID 멱등성 키와 `If-Match` 리비전 필요. 기록 조회는 `GET /api/v1/wallet/activity?period=...&movement=...` 미저장 필터 또는 `?viewId=...&cursor=...` 저장 필터. viewId와 period/movement 혼합은 거부한다. 기능 OFF일 때 기존 period+cursor 계약을 그대로 보존한다. 응답은 `transactions,hasMore,nextCursor,asOf,appliedFilters,viewRevision?`; 쓰기 영수증은 `receiptId,viewId,revision,outcome`.
- Next.js 서버 액션은 인증된 세션·CSRF와 server-only API 경로를 사용한다. Android는 기존 `/app-api/v1/[...path]` 인증·프록시 계약과 생성 API 문서(영·한·JSON)를 함께 검증한다. 본인 ID는 서버 세션에서만 결정하며 요청 본문 userId는 거부한다. 저장 ID 자체는 접근 권한이 아니다.
- 회원당 읽기 분당 30회, 쓰기 분당 10회와 IP 상한(실측 후 조정), 이름 40자·저장 8개·DB 2초 제한. 400 잘못된 입력, 401 미인증, 403 타인 접근, 409 리비전·이름·키 충돌, 410 삭제·만료, 429 속도 제한, 503 DB/권한 미검증. 파라미터 SQL, 엄격한 DTO enum. 이름·원장 금액·회원 ID·커서·토큰을 로그/분석에 남기지 않는다.

### DB 제약·트랜잭션·서명 커서
- **체크섬/ACL 게이트 해결 후** 신규 순번의 전진형 마이그레이션으로 `member_wallet_activity_views`(UUID PK, owner_user_id FK, name/normalized_name, period, movement, sort_position, is_default, revision BIGINT>0, created_at/updated_at/deleted_at)를 제안한다. 활성 회원별 정규화 이름 유일, 활성 기본 필터 최대 1개, owner+position 인덱스, 길이·열거형·위치 CHECK. 현재 SQL 소스 304개 번호 중복 0이더라도 적용 DB 293건 중 체크섬 5건 불일치가 남아 있어 **신규 마이그레이션 번호는 아직 부여하지 않는다**.
- `member_wallet_activity_view_receipts`는 (owner_user_id,idempotency_key) 유일, 요청 SHA-256·결과·리비전·시각을 불변 저장한다. 동일 키·동일 요청은 최초 영수증을 반환하며, 다른 요청은 409. 회원 행 잠금→8개 제한/기본값/이름 검사→CAS 리비전 확인→저장 또는 tombstone→영수증을 단일 트랜잭션으로 처리한다. 삭제 이후 늦은 요청이 복원하지 못하도록 세대·리비전을 단조 증가시킨다.
- SECURITY DEFINER 함수 내부에서 p_actor 소유권 확인, 고정 search_path, PUBLIC EXECUTE 금지, 승인된 app-role에만 EXECUTE. 새 테이블 직접 SELECT/DML/TRUNCATE 권한 부여 금지. 실제 DEV 고객문의·감사 권한 불일치가 있으므로 소스 REVOKE 선언만 신뢰하지 않는다. 금융 테이블과 기존 적용 SQL 수정 금지.
- 원장 기록은 **SQL에서 방향 조건을 적용한 후 LIMIT 51**, `(created_at,id)` 내림차순 키셋, DB asOf 상한, PostgreSQL 마이크로초 정밀도 보존. 별도 HMAC-SHA-256 v2 커서는 회원·세션 세대·필터 해시·viewId+리비전·asOf·마지막 튜플·15분 만료·키 ID에 결속하며 상수 시간 비교/키 교체를 지원한다. 기존 v1 커서는 기존 경로에서 유지한다. 과거 시각 삽입·원장 정정으로 페이지 멤버십이 바뀔 수 있어 영구 MVCC 스냅샷을 주장하지 않는다. 0원장 거래·계좌 간 상쇄도 별도 검증한다.

### 관리자·개인정보·SEO·KPI·시험·배포
- 관리자는 익명 집계(기능 사용량, 오류, 지연시간)만 조회한다. 개인 필터 이름·잔액·원장 내역·커서·회원 ID는 열람하지 않는다. 삭제 tombstone 보관은 **잠정 7일, 정책 확정 전 미결정**이며 개인정보 삭제 증빙 필요. 검색엔진 노출·푸시/메일 전송·외부 공유 없음.
- 제안 KPI(측정 전): 저장 성공률, 7일 재사용, 대표 격리 PG p95 <500ms, 타인 행 노출 0, 중복 변경 0, 원장 쓰기 0, 접근성 과업 완료. `EXPLAIN (ANALYZE, BUFFERS)`는 격리 합성 DB에서만 수행한다.
- **수용시험 계획, 실행하지 않음:** PostgreSQL 17.11 합성 원장 10,001건, 타인·커서 위조 100건, 동시 CAS 100건, 응답 유실 50건, 순변동 0·부호·UTC/DST·마이크로초 경계 30건. SQL 필터가 LIMIT 이전인지 확인하고 기존 커서·송금·원장 회귀, ACL 거부/EXECUTE, 웹·Android·320px/200% 접근성, noindex/no-store, 기능 OFF 롤백을 검증한다. DEV/운영 DB에 파괴적 SQL을 실행하지 않는다.
- **P0:** REPO1480-01 과거 브랜치 462개(비조상 346) 보존; SEC1480-02 고객문의·감사 테이블 앱 직접 DML(#1908) 및 적용 마이그레이션 219/220/221/234/266 불일치; FIN1480-03 SWF 허위 SUCCESS(#1909), MINT 18,000 WLD 출처·국고 552행; REL1480-04 배포 분류기 #1907, lint, app-api affinity, 전체 CI, 독립 외부 복원, 공식 Test 정확 SHA E2E.
- **P1:** VIEW1480-05 스키마·본인 함수; VIEW1480-06 원장 SQL 필터·서명 커서; VIEW1480-07 Nest/Next/Android API; VIEW1480-08 접근성 회원 화면; VIEW1480-09 개인정보·관리자·SEO·KPI; VIEW1480-10 격리 PG·회귀·롤백·정확 SHA. 개발 A/B/C 별도 브랜치·승인된 Test 동일 SHA 이후에만 운영 GitOps 검토. 기획에서는 런타임·DB·WLD·Test·운영 **변경 없음**.
- 외부 독립 중복 제거·검증 승인 근거 신규 **0건**, 누적 **UNKNOWN / 10,000건**. Gate **BLOCKED / IN PROGRESS**. 새 분산 세부기획 파일은 생성하지 않는다.







## v1486 / F675-177 — 지갑 월별 요약 스냅샷·과거 계정 조회 보완 (기능 보완 / 초안 / 배포 보류)
- **Draft PR:** [#1930](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1930) — OPEN / DRAFT / RELEASE HOLD; stacked on unmerged #1926, not independently mergeable.

**회차:** 이전 기능 추가 v1484 → 현재 기능 보완 v1486 → 다음 기능 추가 v1488(잠정). **기준:** main `62c6cd038951d65c94b709302bdaec6e75b080b6` 시작·중간 확인; 선행 [Draft #1926](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1926) 미병합. 독립 QA v1378 **FAILED/P0**. 본 변경은 기존 통합문서에만 반영하는 기획이며 API·DB·Test·운영 구현 완료가 아님. [개발 인계 #1925](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1925).

### 실제 소스에서 확인한 설계 공백
1. `backend/src/wallet/wallet.repository.ts:259+`의 기존 활동 조회는 주입된 풀의 `Queryable.query`를 사용함. v1484에서 요구한 `REPEATABLE READ READ ONLY`는 풀에 BEGIN/SELECT/COMMIT를 각각 보내는 방식으로 **보장되지 않음**. 여러 SQL을 사용할 경우 반드시 동일 `pg.PoolClient`를 체크아웃하고 격리수준·읽기 전용·시간 제한을 설정하여 스냅샷/집계를 수행한 뒤 오류 시 `ROLLBACK`, `finally`에서 `release()` 처리. 대안은 `asOf`, 월 경계, 본인 전표와 집계를 단일 SQL 문장 MVCC 스냅샷으로 계산하는 방식이며 이 경우 실제로 열지 않은 REPEATABLE READ 트랜잭션을 주장하지 않음.
2. `packages/database/init/001-economy-core.sql`에 회원 계정 상태 active/frozen/closed, 통화 char(3), 거래 생성 시각 및 전표 bigint 금액이 정의됨. 기존 활동 조회는 회원 USER_CASH/USER_BANK의 **모든 상태**를 포함하므로 월별 요약에서 `account.status='active'`를 추가하면 동결·종료 계정의 과거 거래가 사라지는 결함이 발생함. 회원 소유 WLD 계정만 포함하되 상태로 과거 이력을 지우지 않음. `ledger_transactions.actor_user_id`로 제한하지 않음(타인이 송금한 입금도 본인 계정 전표임).
3. 월별 '유입/유출'은 경제 전체의 총 거래량이 아닌 **회원 순증감 기준**임을 명확히 함. 먼저 회원의 거래 ID별 USER_CASH+USER_BANK 부호 전표를 합치고 net>0 증가, net<0 감소, net=0 순변동 없음으로 분류. 현금↔은행 이체는 현금·은행 증감은 남지만 회원 순유입/순유출 0, 거래 건수는 1건으로 처리. 같은 거래의 다중 전표를 중복 집계하지 않음. 화면에는 '내 WLD 순증가/순감소'를 표기하고 총수입·총지출·소득으로 오해시키지 않음. `netWld=inflowWld-outflowWld=cashDeltaWld+bankDeltaWld`를 월별·전체 기간에서 검증. 산술 일치는 MINT/국고/SWF 자금 출처나 정산 승인 증거가 아님.
4. `asOf`와 한국시간 월 경계는 **동일 DB 스냅샷**에서 도출. `[월초UTC, min(다음 월초UTC,asOf))` 반개구간을 적용하고 asOf 이후·미래 거래 제외. 화면용 `periodEnd`는 다음 월초 UTC로 유지하되 당월 부분 집계의 실제 끝은 `effectiveEndExclusive`로 별도 제공(항상 periodEnd 이하). 월 순서·연속성·서버 시각을 검증. 과거 시각으로 거래가 추가되면 과거 월 합계도 바뀔 수 있으므로 확정 결산으로 표시 금지.

### 구현 가능한 API·DB·화면 계약
- **진입·CTA·상태:** 기존 비공개 `/wallet/activity` → `월별 활동 요약`(스위치 `wallet_monthly_activity_digest` 기본 OFF) → 최근 1~12개월(기본 6) 선택 → `월별 요약 보기` → 결과와 기존 `거래내역 보기` 링크(지원하지 않는 월 필터 딥링크 생성 금지). LOADING, READY, VERIFIED_EMPTY(정상 DB 조회 시에만), PARTIAL, INVALID_MONTHS(400), SESSION_EXPIRED(401), FORBIDDEN(403), RATE_LIMITED(429), UNAVAILABLE(503), BAD_RESPONSE(503), OFFLINE, DISABLED 구분. 장애 시 0원 위장·이전 회원 결과 노출 금지. 로그아웃·세션 변경·계정 전환 시 오래된 응답 폐기.
- **API:** 회원 인증 `GET /api/v1/wallet/activity/monthly-summary?months=6`; 사용자 ID·임의 asOf·시간대·날짜 입력 불허. Nest/Next/Android가 `{asOf,timezone:'Asia/Seoul',monthsRequested,sourceStatus:'VERIFIED_READ',months:[{month,periodStart,periodEnd,effectiveEndExclusive,status,incomingCount,outgoingCount,zeroNetCount,inflowWld,outflowWld,netWld,cashDeltaWld,bankDeltaWld}]}` 검증. WLD는 정확한 부호 있는 정규 정수 문자열, 건수는 안전한 0 이상 정수, 월 중복 없음·최신순 연속·월별/전체 합계 불변식 충족. DB NUMERIC은 문자열로 직렬화, WLD를 JS Number로 변환 금지. 필드 누락·비정상 HTTP 200·불가능한 월 경계·합계 불일치는 503(정상 빈 결과로 전환 금지).
- **SQL·권한:** 서버 인증 세션의 회원만 필터링, WLD 통화·USER_CASH/USER_BANK 계정만 사용, 거래 ID·created_at 기준 선집계 후 월별 합산. 회원 전표 debit +금액 / credit -금액. 상태·거래 actor 필터 금지. 격리 PostgreSQL에서 인덱스·실행계획을 검증하며 JS 무제한 페이지 조회로 집계하지 않음. 신규 테이블·직접 앱 계정 DML 권한·원장 쓰기·금융 변경 없음. 본인 읽기 SECURITY DEFINER 함수가 필요하면 search_path 고정, PUBLIC EXECUTE 회수, 최소 EXECUTE만 부여, SQL 소유권 검사 및 마이그레이션 출처 확인 후 별도 정방향 변경.
- **오류·남용·개인정보:** 회원당 분당 10회, 동시 1회, DB 2초 제한은 실측 전 목표. 400/401/403/429/503을 명확히 구분하고 개인정보를 응답 오류에 넣지 않음. CDN/ISR 캐시 금지, `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, 사이트맵·구조화 데이터 제외. 금액·원장 거래 ID·회원 ID·영수증 원문 로그/분석 금지. 관리자는 최소 집단 규모를 충족한 이용·지연·오류 집계만 조회. 320px·200% 확대·키보드·스크린리더·WCAG 2.2 AA·Android EN/KO/JSON 생성 계약 동등. p95 500ms 및 접근성 완료율은 미측정 시험 목표.
- **시험·배포·롤백(계획, 미실행):** 격리 PG 17.11 편중 합성 거래 10,001건, 타인/actor 위조 100건, 한국시간·UTC·윤년 경계 100건, 동결/종료 계정·다중 전표 100건, 과거 시각 삽입·동시 스냅샷 경합 100건, 시간초과·비정상 응답·망 중단 50건, 2^53 초과 금액 정확성. 원시 본인 전표와 독립 대조, 현금↔은행 순변동 0, 과거 계정 이력 유지, 동일 클라이언트 트랜잭션 또는 단일 SQL 스냅샷, 앱 직접 DML·원장 변경 없음, Next/Nest/Android 동등성·기능 OFF 회귀 검증. 스위치 OFF 시 신규 CTA/API만 숨기고 기존 기록·CSV 보존. 인덱스는 P0 해결 후 별도 승인된 정방향 마이그레이션. 전체 CI·외부 백업 복원·프론트/백/엣지 정확 SHA 공식 Test·승인된 GitOps 운영승격·스모크·롤백 증거 필요.
- **P0 개발 백로그:** `REPO1486-01` 과거 브랜치 참조 462개/비조상 커밋 346개 보존; `SEC1486-02` DEV 고객문의/감사 DML/TRUNCATE와 적용 체크섬 219/220/221/234/266 5건(소스 SQL 304개 중복 0, 적용 293) 조사; `FIN1486-03` SWF/MINT/국고 미인증 성공 차단, 조정 19건/18,000 WLD·국고 552건 연결 누락·Test 합성 200 검증; `REL1486-04` 프론트/엣지 SHA, 금융 시험 실패 6건·lint 3건·계약 드리프트·외부 복원·정확 SHA Test·디스크(시작 시 루트 86%/데이터 92%) 해결. 승인 없이 파괴적 정리 금지.
- **P1 개발 백로그:** `MONTH1486-05` 과거 계정 포함 본인 WLD SQL·인덱스; `MONTH1486-06` 동일 클라이언트 스냅샷·반개구간·effectiveEnd; `MONTH1486-07` Nest/Next API 및 합계 검증; `MONTH1486-08` Android 계약·세션 격리·접근성; `MONTH1486-09` 개인정보·관리자 집계·SEO·KPI; `MONTH1486-10` 격리 PG 경합·정밀도·동결 계정·회귀·롤백. **P0 4건 + P1 6건 = 10건**, 수용시험은 정의만 했으며 미실행.
- **외부 근거 게이트:** 독립 획득·중복 제거·실제 근거 분류 신규 승인 **0건**, 누적 **UNKNOWN / 10,000건** → **BLOCKED / IN PROGRESS**. 운영 승격 **HOLD**. 기획 회차에서 런타임·DB·WLD·Test·Production 변경 없음.

## v1484 / F675-177 — 회원 전용 지갑 월별 활동 요약 (기능 추가 / 초안 / 배포 보류)
- **Draft PR:** [#1926](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1926) — OPEN / DRAFT / RELEASE HOLD; main 미병합, CI 전체 미인증.

**기준·범위:** 이전 기능 보완 v1482 → 현재 기능 추가 v1484 → 다음 기능 보완 v1486(잠정). main `62c6cd038951d65c94b709302bdaec6e75b080b6` 시작·중간 재확인, QA v1377 FAILED/P0. v1480/#1916·v1482/#1920은 미병합 제안이며 구현 완료로 간주하지 않음. [개발 이슈 #1925](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1925). 기존 통합문서에 추가하는 설계이며 런타임/DB 구현이 아님. 영어 문서가 canonical, 본 절은 한국어 동등본.

### 목적·근거·중복 회피
- **문제:** 로그인 회원은 `/wallet/activity`에서 전체/7일/30일 기준 최대 50건씩만 조회함. `backend/src/wallet/wallet.controller.ts`는 회원/세션 기반 기간+커서 API를 제공하며 `wallet.repository.ts`는 USER_CASH와 USER_BANK 전표를 거래별 부호 있는 증감으로 이미 집계함. 달력 월별 요약 API·화면은 확인되지 않음. `frontend/src/app/wallet/export-ledger-csv.tsx`는 전달된 최근 행만 저장하므로 완전한 거래 명세서가 아님. 소스 확인이 Production 이용 통계는 아님.
- **대상·가치:** 여러 페이지를 넘기지 않고 가상 WLD의 월별 증감을 살펴보려는 회원. 목표는 탐색 단계 감소와 월별 이해 향상이라는 가설이며 실제 소득/세금 증빙이 아님. F675-176 저장 필터(#1915/#1920), F675-173 개인정보 내보내기(#1876), 기존 최근 CSV와 구분. 공유 링크·투자 권유·송금·잔액 변경·새 금융 승인·관리자 개인 원장 접근 없음.

### 회원 화면·CTA·상태
- **진입:** 기존 비공개 `/wallet/activity`의 기능 스위치 기반 `월별 활동 요약` 버튼. 당월 포함 최근 **6개월** 기본, **1~12개월** 정수 선택. `월별 요약 보기`로 비공개 결과 갱신; `거래내역 보기`는 기존 기록 화면으로 이동하되 현재 화면이 임의의 월 필터를 지원하지 않는다는 점을 표시함. 별도 계약 없이 지원하지 않는 월 파라미터를 붙여서는 안 됨.
- **월별 응답:** Asia/Seoul 기준 `month` YYYY-MM, UTC ISO `periodStart` 포함·`periodEnd` 미포함, `status=PARTIAL|COMPLETE`, `incomingCount`, `outgoingCount`, `zeroNetCount`, 정규 10진 문자열 `inflowWld`, `outflowWld`, `netWld`, `cashDeltaWld`, `bankDeltaWld`. 서버 `asOf`, `sourceStatus=VERIFIED_READ` 필수. 당월은 PARTIAL. 이전 월도 과거 시각 거래가 추가되면 바뀔 수 있어 영구 확정 결산으로 표현 금지. 거래 건수는 회원 전표를 합친 후 **서로 다른 거래 ID** 기준이며 전표 행 수가 아님.
- **상태:** LOADING, VERIFIED_EMPTY(정상 조회 후 해당 기간 활동 없음), READY, PARTIAL_CURRENT_MONTH, 401 SESSION_EXPIRED, 403 OWNER_FORBIDDEN, 400 INVALID_MONTHS, 429 RATE_LIMITED, 503 SOURCE_UNAVAILABLE, 503 MALFORMED_UPSTREAM, OFFLINE/UNKNOWN, FEATURE_DISABLED. 원본 불가 시 0 WLD로 표시 금지. 순변동 0은 내부 이체와 동의어가 아님. 기초/기말 잔액, 투자 수익률, 소득·세금·공인 명세서로 표기 금지.
- **모바일/접근성:** 320px 한 열 배치, 반응형 월별 목록/표, 200% 확대 시 잘림 방지, 44px 터치 영역, 명확한 포커스·제목·키보드, 중복 없는 aria-live 오류/당월 안내, 동작 줄이기, WCAG 2.2 AA, 한영 UI 동등. 색상만으로 증감 구분 금지. 로그아웃·계정 전환 시 이전 요청 결과 폐기.

### API·권한·트랜잭션·DB 불변식
- **API:** NestJS `GET /api/v1/wallet/activity/monthly-summary?months=6`; 서버 세션에서 회원을 확인하고 userId 입력을 받지 않음. 클라이언트 `asOf`나 임의 시간대/미래 월 금지. 1~12 정규 정수(기본 6), 중복·배열·공백·소수·음수·초대형 쿼리는 400. 응답 `{asOf,timezone:'Asia/Seoul',monthsRequested,sourceStatus:'VERIFIED_READ',months:[...]}`로 정확히 1~12개 월을 최신순 반환. Next/Android는 알 수 없는 데이터 구조·금액·시각을 런타임 검증하며 실패를 빈 내역으로 표현하지 않음.
- **조회 절차:** PostgreSQL 단일 `REPEATABLE READ READ ONLY` 트랜잭션에서 `asOf` 생성. 한국시간 월초 포함·다음 월초 미포함 경계를 UTC로 변환(브라우저 로컬 시간이나 최근 30일 구간 사용 금지). 거래 생성 시각을 `[가장 오래된 월초 UTC, asOf]`로 제한, 회원 소유 USER_CASH/USER_BANK 전표만 JOIN, **거래 ID·시각별 선집계 후 월별 재집계**. 저장소의 부호 규칙(회원 계정 debit 양수, credit 음수)을 격리 PG로 검증. 거래별 `net=cashDelta+bankDelta`; 양수 증가, 음수 감소, 0 순변동 없음. 월별 증가 합은 양수 net의 합, 감소 합은 음수 net의 절댓값 합, 순증감=증가-감소. 현금·은행 증감을 별도로 더해 동일함을 정확하게 검증. NUMERIC과 정규 부호 있는 정수 문자열 사용, JS Number/부동소수점 금지. **정상 조회 이후에만** 활동 없는 월을 0으로 채움. 원장 산술 일치는 거래 자금 출처의 적법성 증명이 아님.
- **DB·인덱스:** 기존 원장 읽기 모델과 회원 소유 범위 재사용. 초기 버전은 **신규 테이블·스키마 제약·앱 계정 쓰기 권한 불필요**. `(account.owner_user_id,account_type)`, `ledger_postings(account_id,transaction_id)`, `ledger_transactions(created_at,id)`의 실제 인덱스·실행계획을 합성 10,001건으로 확인하며 인덱스 존재를 추정하지 않음. 필요 시 적용 마이그레이션 체크섬·권한 P0 해결 후 별도 추가 인덱스/락/롤백 심사. `moneyverse_app` 직접 DML/TRUNCATE 확대 금지. SECURITY DEFINER 도입 시 search_path 고정·PUBLIC EXECUTE 회수·최소 EXECUTE 부여·SQL 내부 소유권 검사. 읽기 중 DB 쓰기 없음. 쿼리 2초 제한·회원당 분당 10회·동시 1회는 실측 검증할 목표값.
- **API·Android:** Next 동일 출처 세션과 Nest 인증. Android `/app-api/v1/[...path]` wallet 허용 경로에서 인증 유지, 임의 userId/비밀·미승인 헤더 전달 금지. GET 응답 및 401/403/429/503 부정 사례를 EN/KO/JSON 생성 계약에 반영. 각 경계에서 `unknown` 응답을 검증: 월 수·순서·유일성, ISO asOf/경계, 정규 금액 문자열, 0 이상 건수, `net=증가-감소=현금+은행`, 미래 자료 금지, VERIFIED_READ. 비정상 HTTP 200은 503, 빈 기록 위장 금지. `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, CDN/ISR 캐시·사이트맵·공개 구조화 데이터 없음.
- **보안·남용·개인정보:** 인증·SQL 양쪽에서 본인 소유 범위 검증. 타인 회원 위조, 세션 전환, 계정 간 캐시 유출 거부. 금액·계정 ID·원장 영수증·원문 쿼리를 로그/분석에 남기지 않음. 관리자에는 최소 표본 수를 충족한 채택률·지연·오류 집계만 제공하고 회원별 월별 금액은 제공하지 않음. 요청량, p95 지연, 시간 초과, 비정상 응답 거부, 401/403/429, 타인 조회 **0**, 합계 불일치 **0** 측정. p95 <500ms 및 7일 이용률은 **시험 목표/가설**이며 실측 KPI가 아님. 비공개 페이지 SEO 유입 가치는 없음.

### 시험·배포·롤백·백로그
- **시험 계획만 작성, 미실행:** 격리 PostgreSQL 17.11에서 현금↔은행 순변동 0과 거래별 다중 전표를 포함한 편중 합성 거래 10,001건; 타인/위조 100건; 한국시간/UTC 경계·윤년 2월·월말·과거 시각 추가·순변동 0 사례 100건; 비정상 HTTP 200·시간 초과·네트워크 장애 50건; 2^53 초과 정밀도·중복 거래·12개월 제한·429·320px/200% 확대·Android 동등성. 월별 합을 독립 원시 전표 합계와 비교하고 정상 조회 후에만 활동 0 판정. 앱 계정 직접 DML 금지, 원장 쓰기 없음.
- **출시:** `wallet_monthly_activity_digest` 기본 OFF. 초기 버전은 스키마·데이터 마이그레이션이 없으므로 롤백 시 CTA·API만 비활성화하고 원장·기존 기록·CSV 유지. 추후 인덱스 필요 시 별도 호환 마이그레이션과 롤백. 개발 A/B/C 별도 브랜치, 전체 lint/test/build/app-api 계약, 공식 정확 SHA Test 인증 흐름, 프론트/백/엣지 개별 아티팩트 검증, 외부 독립 암호화 백업 복원, 사용자 승인 운영승격·스모크·롤백 필수. P0 전부 통과 전 배포 HOLD.
- **P0:** REPO1484-01 과거 참조 462개; SEC1484-02 DEV 고객문의/감사 직접 DML/TRUNCATE 및 적용 체크섬 219/220/221/234/266 5건; FIN1484-03 SWF 합성 성공·MINT 18,000 WLD 출처·국고 552건 직접 원장 연결 누락·Test 공개 국고 합성 200; REL1484-04 프론트/엣지 SHA(#1917/#1918), lint 3건/app-api 계약·전체 CI·정확 SHA Test·외부 복원·루트/데이터 디스크 86%/89%. 검증된 보관·백업 정책 없이 파괴적 정리 금지.
- **P1:** MONTH1484-05 본인 SQL·인덱스 검증; MONTH1484-06 Nest 엄격한 읽기 API; MONTH1484-07 Next 화면/접근성; MONTH1484-08 Android 계약; MONTH1484-09 관리·개인정보·SEO·KPI; MONTH1484-10 격리 PostgreSQL 적대적 회귀·롤백 증거. 개발 인계만 수행. 외부 독립·중복 제거·실제 근거 분류 신규 승인 **0건**, 누적 **UNKNOWN/10,000건**, 게이트 **BLOCKED/IN PROGRESS**. 새로운 독립 기획 파일·런타임·DB·WLD·Test·Production 변경 없음.




## v1488 / F675-178 — 회원 전용 지갑 거래 북마크 (기능 추가 / 기획 초안 / 운영 HOLD)
**Draft PR:** [#1937](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1937) — OPEN / DRAFT / RELEASE HOLD, 최신 main 독립 브랜치(선행 미병합 #1926/#1930 보존).

**회차:** 이전 v1486 기능 보완 → 현재 v1488 기능 추가 → 다음 v1490 기능 보완(잠정). **기준:** main `62c6cd038951d65c94b709302bdaec6e75b080b6`, AGENTS.md·README.md·영문 PROJECT_PLAN.md(정본)·국문 대조. 시작/중간에 main과 기획서 재확인. **개발 이관:** [#1936](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1936). 독립 QA v1379 금융 집중시험 6 FAIL/3 PASS, 전체 lint 오류 3건, 적용 마이그레이션 체크섬 불일치 5건. **기획만 수행**하며 구현·SQL·WLD·Test·운영 배포는 하지 않음.

### 목적·대상·실제 근거·범위
- 로그인 회원이 **본인에게 귀속되는 WLD 원장 거래**를 최대 100개 북마크하고 기기를 바꾸어 다시 찾아볼 수 있도록 함. 북마크는 개인 탐색 편의 기능이지 거래 인증서·금융 결산·신고·저장 필터·원장 수정이 아님.
- `frontend/src/app/wallet/activity/page.tsx`는 기간별 최대 50건/페이지와 커서를 제공하지만 저장 버튼이 없고, `backend/src/wallet/wallet.controller.ts`의 `GET wallet/activity`에도 북마크 CRUD가 없음. DEV PostgreSQL 17.11 읽기 전용 조회에서 `wallet_activity_bookmarks` 테이블 없음, 거래 891건 확인(운영 데이터로 해석 금지). F675-176은 필터 저장, F675-177은 월별 요약, F675-03은 거래 설명 영수증, F675-173은 개인정보 내보내기로 서로 다른 기능임.
- **제외:** 자유입력 메모, 개인 거래 분류, 자동 저장, 공개 공유, CSV/PDF, 원장·거래 설명·잔액·국고·대출·송금 변경. 근거 없는 정산 완료 표현 금지.

### 회원 화면·CTA·상태·권한
- 기존 비공개 `/wallet/activity`의 각 **본인 거래**에 `거래 저장`/ `저장 취소` 버튼. `저장한 거래 보기`는 비공개 `/wallet/activity/bookmarks`로 이동. 최신 북마크순 20개 기본, 최대 50개, `이전 저장 내역`/ `전체 거래로 돌아가기`. 100개 도달 시 `기존 북마크를 삭제한 후 저장하세요` 표시. 로그인·동의·세션·CSRF 검증, 클라이언트 owner/userId 입력 불허.
- 상태: DISABLED, LOADING, READY, VERIFIED_EMPTY(성공 조회에서만), SAVING, REMOVING, ALREADY_SAVED, ALREADY_REMOVED, LIMIT_REACHED(409), SESSION_EXPIRED(401), FORBIDDEN(403), NOT_FOUND(404), CONFLICT(409), CURSOR_EXPIRED(410), RATE_LIMITED(429), OFFLINE, UNAVAILABLE(503), MALFORMED_RESPONSE(503). 실패를 빈 내역이나 저장 성공으로 표시하지 않음. 계정 전환·로그아웃 시 기존 응답과 커서 폐기.
- 모바일 320px, 200% 확대, 키보드 포커스, 충분한 터치 영역, 버튼 접근성 이름, 상태 라이브 영역, 스크린리더·TalkBack, WCAG 2.2 AA 준수.

### API 및 응답 검증
- `GET /api/v1/wallet/activity/bookmarks?limit=20&cursor=<opaque>`: `{asOf,items:[{transactionId,bookmarkedAt,transaction:{occurredAt,label,netAmount,postings...}}],nextCursor,hasMore,limit}`. 기존 본인 거래 응답 스키마 재사용, WLD는 정밀도 손실 없는 정수 문자열. limit는 1..50 정수, 커서 최대 2048바이트. HMAC-SHA-256 커서는 회원·세션·limit·발급시각·마지막 시각(마이크로초)·UUID에 결속, 10분 만료. 저장/삭제 후 커서 무효화 및 첫 페이지 재조회. 집합 변경 중 페이지 완전 고정 보장 금지.
- `POST /api/v1/wallet/activity/bookmarks/status` (읽기 전용): `{transactionIds:[uuid,...]}` 1..50개 중복 없는 UUID → `{bookmarkedTransactionIds:[uuid,...]}`. 타인/없는 거래는 존재 여부를 노출하지 않고 제외. 읽기 POST도 세션·CSRF 및 no-store 적용.
- `PUT /api/v1/wallet/activity/bookmarks/:transactionId`, `DELETE`는 `Idempotency-Key` UUID 필수, 명시적 저장/삭제만 지원(토글 금지). `{transactionId,bookmarked,bookmarkedAt?,operationId,alreadyApplied,serverTime}` 응답. 동일 키·동일 회원·동일 작업·동일 거래 재요청은 원래 영수증 반환; 다른 요청으로 키 재사용 시 409. 응답 유실 재시도는 **동일 키** 유지. 24시간 지난 요청은 410, 영수증/묘비는 최소 90일 보존(보장 범위 명시).
- NestJS·Next.js·Android가 UUID, ISO 시각, 응답 필드, WLD 정밀도, 서명 커서, 세션을 검증. 400/401/403/404/409/410/429/503 표준 오류; 형식이 잘못된 HTTP 200은 빈 목록 대신 실패 처리.

### DB·트랜잭션·인덱스·권한
- 제안 테이블 `wallet_activity_bookmarks(owner_user_id uuid REFERENCES users(id),transaction_id uuid REFERENCES ledger_transactions(id),bookmarked_at timestamptz DEFAULT now(),PRIMARY KEY(owner_user_id,transaction_id))`와 `wallet_bookmark_operation_receipts(owner_user_id,request_key,action,transaction_id,request_fingerprint,response_json,created_at,PRIMARY KEY(owner_user_id,request_key))`. NOT NULL 및 action CHECK('save','remove') 필수. `(owner_user_id,bookmarked_at DESC,transaction_id DESC)` 인덱스와 영수증 보관 정리 인덱스 검토. 금융 원장·잔액·원본 거래에는 쓰기 없음.
- **본인 거래 판정:** `ledger_postings`→`accounts`의 `owner_user_id=인증된 회원`, `account_type IN ('USER_CASH','USER_BANK')`, `currency='WLD'`인 전표가 `EXISTS`여야 함. 다른 회원이 보낸 수신 거래도 포함하므로 `ledger_transactions.actor_user_id`로 제한하지 않음. 동결/종료 계정의 과거 거래를 잃지 않도록 `accounts.status='active'` 필터 금지. 타인 거래는 존재 여부를 숨긴 404.
- `SECURITY DEFINER` 함수 `wallet_my_bookmark_page`, `wallet_my_bookmark_status`, `wallet_my_bookmark_apply`를 소유자 범위로 설계하고 `search_path=public,pg_temp` 고정, PUBLIC EXECUTE 회수, `moneyverse_app`에 필요한 EXECUTE만 부여. 북마크/영수증 테이블 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE 권한 금지. 클라이언트가 전달한 actor를 신뢰하지 않음. 기존 `economy_post_transaction` 권한 확장 금지.
- 한 트랜잭션에서 회원 단위 락→본인 거래 검증→기존 멱등 영수증 및 fingerprint 확인→100개 상한 확인→INSERT ON CONFLICT/DELETE→불변 영수증 기록→COMMIT. 실패 시 전체 롤백. 99/100 동시 저장도 100개 초과 금지. 동일 요청은 기존 결과 재사용, 다른 작업은 커밋 순서로 처리. 커서의 시각은 마이크로초 보존.
- 체크섬 불일치 5건 해결 전 SQL 번호 지정/마이그레이션 실행 금지. 승인된 **전진형** 마이그레이션과 격리 PG 17.11 검증 후 도입. 롤백은 기능 플래그 OFF로 UI/API 비활성화, 북마크 데이터나 원장은 삭제하지 않음.

### 보안·관리·개인정보·SEO·분석
- 북마크는 개인 행동 메타데이터. 계정 삭제/처리 제한 정책에 맞춰 제거·차단하고 백업 복원 후 재삭제 증빙. 공개 프로필·공유·외부 분석·원시 회원/거래 ID 로깅 금지. `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, 사이트맵·구조화 데이터 제외.
- Android app-api allowlist 및 `Idempotency-Key`/세션/CSRF 전달, 생성 EN/KO/JSON 계약 동등성, 프록시도 no-store/noindex 강제. 관리자에게는 k≥20 코호트의 채택률·지연·오류 건수 집계만 제공하며 개인 거래 목록/금액 열람 금지.
- 제안 제한: 회원당 읽기 30회/분, 쓰기 10회/분, 동시 쓰기 1개, DB 2초 timeout(실측 전 목표). 북마크 100개, 배치 50개, 서명 키 회전·상수시간 비교. 가설 KPI: 30일 내 거래내역 이용자의 5%가 저장 기능 사용, 조회 p95 <500ms/쓰기 <700ms, 타인 정보 노출 0, 허위 성공 0. 실측 성과로 주장 금지.

### 수용시험·백로그·배포 차단
- **계획만 수립, 미실행:** 격리 PostgreSQL 17.11에서 합성 거래 ≥10,001건(수신 거래·동결/종료 계정·동시각·다중 전표), 타인 권한 위조 100건, 99/100 경계 동시 저장 100건, 응답 유실 동일 키 재시도 50건, 세션/계정 전환 30건, 서명/만료/비정상 200/큰 WLD 정밀도·영수증 정리 경합, 접근성·Android 계약, 기존 기록 회귀 및 롤백. 원장·잔액 변경 0, 직접 app-role DML 0, 타인 노출 0을 검증.
- **P0:** `REPO1488-01` 과거 참조 462개(비조상 346개)·브랜치 보호; `SEC1488-02` 체크섬 219/220/221/234/266 및 개발 DB 고객문의/감사 DML; `FIN1488-03` MINT 18,000 WLD·국고 552행·SWF 허위 성공·Test 합성 200; `REL1488-04` QA1379 금융 6 FAIL/lint 3, 독립 복원, frontend/backend/edge 정확 SHA, 공식 Test, GitOps, 디스크 root 87%/data 94%(임의 삭제 금지).
- **P1:** `BOOKMARK1488-05` 소유자 SQL/테이블/인덱스/권한, `BOOKMARK1488-06` 상한·동시성·멱등 영수증, `BOOKMARK1488-07` Nest API, `BOOKMARK1488-08` Next UI/a11y, `BOOKMARK1488-09` Android/관리자/개인정보/SEO/KPI, `BOOKMARK1488-10` 실제 PG 회귀·롤백. **P0 4 + P1 6 = 총 10건**. 개발 A/B/C 별도 브랜치에서 RED/GREEN→CI→격리 DB→공식 Test exact-SHA→독립 복원→승인된 무중단 운영 승격·스모크·롤백을 증빙해야 함.
- **외부 독립 근거 10,000건 gate:** 신규 취득·중복 제거·근거 분류 **승인 0건**, 누적 **UNKNOWN / 10,000** → **BLOCKED / IN PROGRESS**. 달성 주장 금지. 기능 플래그 `wallet_activity_bookmarks` 기본 OFF, 운영 승격 **BLOCKED**.





## v2026.10.30.1498 — F675-180 관리자 배포 준비 근거 매트릭스: 중복 기획 통합·신뢰 경계 강화 (기능 보완 / 초안 / 운영 승격 보류)

**GitHub 인계:** [Draft PR #1964](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1964)(#1960 종속), [기획 #1959](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1959), [기존 중복 #1829](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1829), [개발 DB 권한 P0 #993](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/993). **최초 확인 CI 진행 중, 최종 성공 주장 금지.**

**사이클:** 이전 Feature Addition v1496 → 현재 Feature Improvement v1498 → 다음 Feature Addition v1500(잠정). **기준:** 최신 원격 main 62c6cd038951d65c94b709302bdaec6e75b080b6 시작·중간 재확인. Draft PR #1960에 종속된 문서 전용 후속 기획이며 구현·병합·배포 승인이 아니다. 영문 PROJECT_PLAN.md가 정본이고 본 문서는 의미상 동등하다.

### 새 P0 증거 및 중복 기획 통합
- **기존 중복 발견:** [F675-170 / #1829](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1829)는 v1456에 이미 관리자 배포 준비 증거 보드를 정의했다. F675-180 / #1959(v1496)와 목표가 실질적으로 같다. 대시보드·API·증빙 수집·판정 엔진을 두 벌 만들지 않는다. F675-180을 **읽기 전용 V1 통합안**으로, F675-170은 기존 요구사항 및 별도 승인할 수 있는 V2 불변 증빙 저장소 후보로 보존한다. #1829의 기록을 지우거나 담당자 확인 없이 종료하지 않는다. V1의 유일한 진입점은 /admin/operations/release-readiness, Nest GET /api/v1/admin/operations/release-readiness다. 기존 /admin/releases/readiness 및 /api/v1/admin/releases/readiness는 구현·별칭·지원 약속 대상이 아니다.
- **충돌 해결:** F675-170의 WAIVED_WITH_AUTHORITY를 VERIFIED와 동일하게 취급하지 않는다. 금융 출처·DB 권한·공식 Test 신원·독립 복원·서명된 용량 등 필수 안전 게이트는 **면제 불가**다. 선택 게이트의 NOT_APPLICABLE은 서명된 버전 정책, 승인자, 사유, 만료일이 있는 경우에만 허용한다. F675-170의 불변 테이블 3개는 V1에서 **보류**한다. V1은 DB 객체·권한·마이그레이션을 추가하지 않는다. V2는 기존 마이그레이션/ACL 복구 이후 별도 승인된 전진형 마이그레이션, SECURITY DEFINER 본인/권한 범위 읽기, append-only 영수증, 후보SHA·환경·정책버전·게이트·아티팩트 해시 복합 유일성과 만료 인덱스를 요구한다. Android 관리자 경로는 V1에서 미지원이며 공개/app-api 경로를 만들지 않는다.
- **독립 QA v1384 수집 증거(최종 판정 미확인):** 08:19 KST /srv/moneyverse-data/qa-reports/qa1384-evidence/dev-db-acl-summary.txt의 개발 PostgreSQL 조사에서 기본 테이블 253개, moneyverse_app의 유효 UPDATE 권한 **211개**, DELETE **211개**, TRUNCATE **233개**가 보고됐다. SET ROLE moneyverse_app에서 account_balances UPDATE/TRUNCATE 및 audit_logs/users DELETE 가능 여부가 true였다. AGENTS.md의 최소 권한 모델과 충돌하므로 기존 audit_logs UPDATE 문제보다 광범위한 **P0 개발 DB 권한 조사**가 필요하다. 이는 개발 DB의 유효 권한이며 실제 악용·운영 DB 권한·WLD 이동 증거는 아니다. 무단 GRANT/REVOKE 없이 권한 출처, 기본 권한, 소유자, 마이그레이션 순서, 역할 상속 및 실제 세션 역할을 조사한다.
- 09:01 KST Debian 13.6 ROOT 97%(가용 2.9GiB), DATA 97%(가용 5.7GiB), 이후 DATA 98%(가용 5.4GiB). 앞선 08:00의 663MiB보다 여유가 늘었으나 여전히 P0 용량 위험이다. 서비스 중단은 확인되지 않았다. QA v1384에서 HTTP 50건 및 공개 국고 503 차단 증거를 수집했지만 최종 QA 판정은 확인되지 않았다. MINT 18,000 WLD, 국고 552건, SWF, 마이그레이션 체크섬 5건, Git 과거 참조 462개, 공식 Test 정확 SHA·독립 복원은 개별 재인증 전까지 HOLD다.

### 배포 단계·화면·판정
- **사전 검증과 배포 후 검증을 분리한다.** 정확한 40자리 후보 SHA, 환경(test|production), 단계(PREFLIGHT|POST_RELEASE)를 받는다. PREFLIGHT는 필수 CI, 공식 Test의 frontend/backend/app-api/edge 실제 아티팩트 해시와 인증된 음성 E2E, 독립 오프호스트 복원, DB 권한/체크섬, 금융 영수증, 서명된 ROOT/DATA 용량, 보안·개인정보·접근성·SEO·모바일 계약, 보호된 main/ref 정책을 확인한다. 기존 운영 아티팩트는 비교 기준이다. **아직 배포되지 않은 후보의 운영 런타임 해시를 사전 게이트로 요구하면 순환 조건이 되므로 금지**한다. POST_RELEASE는 별도 승인된 GitOps 승격 후 실제 운영 후보·엣지/원본 일치·스모크·롤백 식별자·모니터링을 검증한다. 사전 EVIDENCE_READY는 배포 완료나 배포 승인이 아니다.
- 관리자 화면: 명시적 SHA·단계 선택, 정책버전·필수/선택·환경·발급자·SHA256·실행 ID·측정/만료 시각·서명된 소스 리비전·판정·비식별 근거 링크 표시. CTA는 새로고침(읽기), 허용된 메타데이터 검사(최근 재인증), 이슈 열기, 비식별 요약 복사만 허용한다. 승인·병합·배포·면제·삭제·셸·DB·WLD 조작 CTA는 없다. 후보 미입력/오류, 로딩, 검증, HOLD_FAIL, HOLD_UNKNOWN, 만료, 발급자 폐기, 정책 변경, 401/403/409/429/503, 오프라인, 세션 전환 상태를 구분한다. 새 QA 실패·발급자 폐기·정책/main 변경 시 이전 초록색 표시를 무효화한다.
- **신뢰 경계:** 각 근거는 후보 SHA·단계·환경·불변 정책 digest·발급자에 결합한다. 백엔드 SHA가 같아도 프론트엔드/엣지가 다를 수 있으므로(#1917) frontend/backend/app-api/edge/Test DB를 별도로 증명한다. 집계 전후 소스 리비전이 다르거나 근거가 충돌하면 409/HOLD_UNKNOWN; GitHub·Test·DB·호스트·백업 사이 전역 원자적 스냅샷을 주장하지 않는다. 실제 승격 직전 재검증을 별도로 수행한다.
- **증빙 판정:** GitHub 필수 CI는 후보 정확 SHA·신뢰된 워크플로/러너·불변 run ID·필수 체크 정책을 검증한다. 문서 전용 CI와 SKIPPED 런타임은 통과 근거가 아니다. 클라이언트 JSON, 스크린샷, 브랜치 이름, 과거 재실행, 잘못된 환경, 폐기된 서명 키, 30초 초과 시각 오차는 불신한다. 저장공간 서명 수집기는 개발 A #1956의 책임이며 기획에서 중복 구현하지 않는다. 실제 키/서비스가 없으면 UNKNOWN이다. 용량 근거 TTL 최대 120초, CI 재확인 최대 15분, 나머지는 서명된 정책 TTL을 따른다. 필수 FAIL은 HOLD_FAIL, 필수 근거 누락·만료·위조·충돌·측정 안 됨·안전 게이트 면제는 HOLD_UNKNOWN, 모든 필수 서명 PASS일 때만 단계별 EVIDENCE_READY. 운영 POST_RELEASE_VERIFIED는 실제 운영 아티팩트 확인 후에만 표시한다.

### API·DB·보안·접근성·시험
- Nest 관리자 전용 읽기 GET은 candidateSha(정확한 40 hex), environment, stage만 받으며 Session/Authenticated/Consent/Admin/AdminSession 및 민감 메타데이터 최근 재인증을 적용한다. Next 동일 출처 프록시는 private,no-store, noindex를 200/4xx/5xx 모두 강제한다. 임의 URL·경로·호스트·셸 입력 금지, 발급자 허용 목록, 제한된 타임아웃, 관리자/IP 속도 제한, 최대 64KiB, 400/401/403/409/429/503 비식별 오류. 관리자 신원은 서버 세션에서만 얻는다. 공개/Android 경로 없음. 사이트맵·JSON-LD 제외, 회원/WLD·토큰·백업 내용·원시 경로는 로그·통계·복사에 포함하지 않는다. 320px·44px 터치·키보드·포커스·스크린리더·WCAG 2.2 AA, 영문/국문 동등 화면.
- V1은 테이블·인덱스·마이그레이션·GRANT·데이터 쓰기 트랜잭션·원장/WLD 변경 **0**이다. 기존 승인된 비식별 감사 메커니즘만 사용하며 앱 역할에 audit_logs 직접 접근을 추가하지 않는다. KPI는 통제 시험에서 거짓 초록 0, 누락 근거 검출 100%, 단계 오분류 0, 격리 p95 2초 이내, 사고 식별 시간 및 신뢰 발급자 커버리지라는 **목표**일 뿐 실측 결과가 아니다.
- **시험 정의만 작성, 미실행:** 합성 근거 10,001건, 위조/권한/교차SHA/폐기키 100건, 동시 새로고침·정책 변경 100건, 만료·응답 유실·롤백 경합 50건, 단계·시각·엣지·DB 경계 30건. 개발 DB 권한 211/233건을 자동 정상 처리하지 않는지, Test 가짜 국고 200/운영 503(#1917), 저장공간 서명 누락, 문서 CI만 성공, 배포 전 미래 운영 신원 순환 조건, 배포 후 실제 운영 신원, 안전 게이트 면제 금지, 과거 중복 경로 노출 금지를 검증한다. 별도의 공식 Test 정확 SHA·전체 CI·독립 복원·실제 PostgreSQL·승인된 GitOps는 계속 필수다. 기능 스위치 기본 OFF, 롤백은 화면/API 비활성화만 하고 증거 삭제 금지.

### 우선순위 개발 인계 (P0 4건 + P1 6건)
- P0 **DISK1498-01**: #1170 승인된 용량 회복, 작업 폴더·백업·참조 보존, 자동 삭제 금지.
- P0 **SEC1498-02**: QA v1384 개발 DB UPDATE 211/DELETE 211/TRUNCATE 233, account_balances/audit/users, 체크섬·Git 참조의 권한 출처를 격리 DB에서 검증하고 무분별한 실서버 REVOKE 금지.
- P0 **FIN1498-03**: MINT 18,000 WLD, 국고 552건, SWF 실정산 증빙과 #1917 Test/엣지 가짜 응답·금융 음성 회귀 검증.
- P0 **REL1498-04**: 필수 전체 CI, 보호된 ref/서명, 공식 Test frontend/backend/app-api/edge 정확 SHA, 독립 오프호스트 복원, 승인된 GitOps·배포 후 증빙.
- P1 **READINESS1498-05**: F675-170/#1829와 F675-180/#1959 통합, V1 단일 경로·DB 스키마/면제 엔진 중복 방지, V2 제안 보존.
- P1 **READINESS1498-06**: 단계별 서명 근거 계약, 불변 정책 digest, 발급자 리비전·키 폐기/교체, fail-closed 판정.
- P1 **READINESS1498-07**: Nest/Next 관리자 API, 401/403/409/429/503·no-store/noindex, 공개/Android 경로 금지.
- P1 **READINESS1498-08**: 영/한 반응형 단계별 화면·오류·세션 경계·WCAG 2.2 AA.
- P1 **READINESS1498-09**: 개인정보·SEO·비식별 감사·서명된 NOT_APPLICABLE·KPI·서명 수집기 담당 분리.
- P1 **READINESS1498-10**: 격리 PostgreSQL·API·공격·엣지·롤백 시험 및 정확 SHA 승격 게이트.
- 외부 독립 근거 신규 검증 승인 **0건**, 누적 중복 제거·검증 승인 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 분산 기획 파일 추가 없음. Gemini·개발 A/B/C·QA 브랜치와 런타임·DB·Test·Production 변경 없음. **DRAFT / RELEASE HOLD**.

## v2026.10.30.1496 — F675-180 관리자 전용 검증된 배포 준비 근거 매트릭스 (기능 추가 / 기획 초안 / 운영 승격 보류)

**회차 및 기준.** 이전 Feature Improvement v1494 → 현재 Feature Addition v1496 → 다음 Feature Improvement v1498(잠정). 시작·중간 확인한 최신 main SHA는 **62c6cd038951d65c94b709302bdaec6e75b080b6**. PROJECT_PLAN.md 영어판을 정본으로 하고 한국어판은 의미가 동일한 대조 문서다. 개발 인계 [#1959](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1959); [Draft PR #1960](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1960). 본 회차는 **문서 기획만 수행**하며 구현이나 배포 승인이 아니다.

### 근거, 문제, 사용자, 기존 기능과의 경계
- 2026-10-30 08:00 KST Debian 13.6 호스트 ROOT 사용률 96%, DATA /srv/moneyverse-data는 반올림 표시 100%이고 일반 작업자 가용 공간은 약 663MiB였다. 실제 장애 발생 증거는 아니다. 기존 [P0 사고 #1170](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170)에 따라 담당자 승인 후 용량을 확보하되, 타 작업자 폴더·백업·Git 참조·롤백 자산을 자동 삭제하지 않는다.
- 소스 확인: frontend/src/app/admin/api-health/page.tsx와 backend/src/admin/api-health.controller.ts는 CPU·메모리·읽기 전용 DB 연결 검사만 실측하며 도메인 API 상태는 **미측정**으로 표시한다. 조사한 관리자 경로에는 시스템 전반의 검증된 배포 근거를 합산하는 화면이 없었다. [저장공간 기획 #1948](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1948)과 [개발 A 초안 #1956](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1956)은 서명된 호스트 용량 근거를 담당한다. F675-180은 이를 **소비**할 뿐 수집기를 중복 구현하지 않는다.
- **08:08 KST 개발 DB 권한 실측:** woldeok_moneyverse_dev PostgreSQL 17.11에서 moneyverse_migrator로 읽기 전용 권한 함수를 조회한 결과 has_table_privilege(moneyverse_app, public.audit_logs, UPDATE)=true였다. 마이그레이션 102의 REVOKE 선언과 불일치한다. **개발 DB 권한 위험**이며 Production 권한이나 실제 변조의 증거는 아니다. SEC1496-02에서 원인을 조사하고 기록을 보존한다. 실제 app-api 게이트웨이 frontend/src/app/app-api/v1/[...path]/route.ts는 경로 허용 목록을 사용하며 조사한 코드에 관리자 배포 준비 경로는 없다.
- 독립 QA v1383의 07:22~07:24 수집 증거에서는 금융 집중 시험 6실패/3성공, 계약 시험 41성공, Android API 생성 계약 불일치, 공개 50경로 중 48경로 접근 가능 및 Test/Production /help 404가 확인됐다. **v1383 최종 판정은 확인되지 않았다.** 이전에 확인된 v1381은 FAILED/P0이다. 과거 미해결 지적사항인 적용 마이그레이션 체크섬 5건, 과거 Git 참조 462개, MINT 출처 18,000 WLD, 국고 연결 552건, SWF 정산 증명, 독립 복원 및 공식 정확 SHA Test는 이번 회차에서 해결·재감사했다고 주장하지 않는다.
- 대상은 특정 후보 커밋의 **미충족 배포 근거**를 확인하는 인증된 운영 관리자다. 읽기 전용 증빙 조회 기능이며 자동 배포·CI 실행·금융 인증·컴플라이언스 보증·배포 승인 기능이 아니다. 기대 가치는 거짓 정상 표시 없이 장애 원인을 빠르게 찾는 것이다.

### 진입점·화면·CTA·상태
- 관리자 콘솔 → **/admin/operations/release-readiness**. 후보 SHA는 40자리 16진수만 허용하고 소문자로 정규화한다. Test/Production 환경 선택은 조회 조건일 뿐 환경을 전환하지 않는다. 게이트별 필수 여부, 정책 버전, 출처, 범위, 증빙 해시, 측정·만료 시각, 정확한 후보 SHA, 판정 및 연계 근거를 표시한다. 브랜치명이나 과거 후보를 기본값으로 삼지 않는다.
- CTA는 **근거 보기**(허용된 메타데이터만), **새로고침**(읽기 전용 재검증), **이슈/PR 열기**(서버 허용 목록의 GitHub 링크만), **민감정보 제거된 요약 복사**로 한정한다. 승인·배포·병합·강제 통과·삭제·셸·재시작·데이터 보정·WLD 이체 버튼은 없다.
- 후보 미입력·형식 오류·로딩·검증된 성공·실패·UNKNOWN·만료·근거 충돌·출처 장애·401/403/409/429/503·오프라인·로그아웃·계정 전환 시 오래된 응답 차단을 구분한다. 누락은 빈 녹색이 아니라 **UNKNOWN/HOLD**다. 여러 시스템 간 전역 원자적 스냅샷을 주장하지 않는다.
- 320px 모바일 관리자, 768px/데스크톱, 키보드 초점·텍스트 상태·44px 터치·스크린리더 실시간 알림·동작 줄이기·WCAG 2.2 AA, 한국어·영어 동등 표시. 공개 사이트맵과 검색 색인, 구조화 데이터 제외.

### 근거 계약 및 판정 규칙
- 필수 검증 범주: ① 최신 main·보호 브랜치 정책 ② **정확한 후보 SHA**의 전체 필수 GitHub CI와 워크플로 신원 ③ 공식 인증 Test의 프론트엔드·백엔드·app-api 아티팩트 해시 및 DB 마이그레이션 계보 ④ 외부 독립 백업 복원·무결성·롤백 시험 ⑤ PostgreSQL 애플리케이션 권한과 적용 마이그레이션 체크섬 ⑥ MINT·SWF·국고 정산 출처와 음성 시험 ⑦ 서명된 호스트 ROOT/DATA 가용 바이트·inode·롤백 여유 ⑧ 보안·개인정보·접근성·SEO·모바일 API 계약 ⑨ 정책상 해당되는 경우에만 독립 외부 근거 10,000건 게이트. 비적용 시에도 서명된 정책 근거로 NOT_APPLICABLE을 표시하고 조용히 생략하지 않는다.
- 게이트별 필드: gateId, policyVersion, required, environment, candidateSha, sourceKind, sourceIdentity, evidenceDigest(sha256), capturedAt, expiresAt, sourceRunId, sourceArtifactSha, signatureVerification, verdict(PASS/FAIL/UNKNOWN), reasonCode, incidentRefs. 검증기는 SHA·환경·정책·발행자 허용 목록·서명·키 교체·실행 결과·시각·nonce·재전송·해시·불변 아티팩트 존재를 검증한다. 사용자 제출 JSON, 브랜치명, 녹색 화면, HTTP 200, 다른 SHA의 캐시, 스크린샷, 문서 전용 CI만으로 PASS 처리하지 않는다.
- 판정: 필수 항목에 FAIL이 하나라도 있으면 HOLD/FAIL; 그렇지 않더라도 누락·만료·서명 불일치·SHA 불일치·상충·미측정이면 HOLD/UNKNOWN; **모든 필수 항목의 검증된 PASS**만 EVIDENCE_READY다. EVIDENCE_READY도 운영 배포 승인이 아니며 별도의 사람 승인과 GitOps 절차가 필요하다. 새 QA 실패·근거 철회는 기존 녹색 결과를 무효화한다. 호스트 근거 유효기간 최대 120초, GitHub 실행 상태 재검증 최대 15분, 나머지는 출처별 명시된 TTL. 시계 오차 30초 초과·검증 불가는 UNKNOWN.
- 응답에는 서버 observedAt과 항목별 시각을 함께 표시한다. GitHub·DB·Test·호스트·백업을 가로지르는 전역 MVCC 일관성을 보장하지 않는다. 확인 중 출처 신원이 바뀌면 보수적으로 차단한다. 금융 결과는 화면 성공 문구가 아니라 실제 원장 영수증과 출처 증명이 필요하다.

### API·권한·DB·트랜잭션·보안
- 제안 Nest **GET /api/v1/admin/operations/release-readiness?candidateSha=40hex&environment=test|production**. 응답 {candidateSha,environment,policyVersion,observedAt,overall:HOLD_FAIL|HOLD_UNKNOWN|EVIDENCE_READY,gates:[...],nextReviewAt}. 400 형식 오류, 401 비인증, 403 권한 없음, 409 후보·정책 세대 충돌, 429 속도 제한, 503 검증 불가. 응답 예산 2초, 요청자가 임의 URL·파일경로·명령어·외부 요청 대상을 지정할 수 없다. Next 동일 출처 프록시는 허용된 입력과 인증 문맥만 전달한다. 공개·Android 회원 API는 만들지 않는다.
- 기존 SessionGuard·AuthenticatedGuard·ConsentGuard·AdminGuard·AdminSessionGuard 및 관리자 콘솔 세션/CSRF 보호를 준수한다. 민감 아티팩트 메타데이터 열람은 재인증을 요구한다. 관리자 세션별 응답 격리, 서명 발행자 위조·재전송 차단, 관리자/IP 속도 제한, 최대 64KiB 응답, 오류 메시지 정제 및 서명 비교의 시간차 방지를 적용한다.
- **v1 DB 변경 없음.** 새 테이블·인덱스·마이그레이션·권한·SECURITY DEFINER 함수·원장 변경이 없다. 검증된 기존 증빙을 최소 권한 읽기 어댑터로 조회한다. 장래 이력 저장이 필요하면 체크섬 5건을 해결한 뒤 별도 전진형 마이그레이션과 unique(candidateSha,environment,policyVersion,gateId,artifactDigest), 만료 인덱스를 심사한다. 앱 계정에 광범위한 테이블 권한을 부여하지 않는다.
- 조회 전용 집계이므로 쓰기 트랜잭션이나 허위 전역 스냅샷이 없다. 감사/분석에는 회원 잔액·세션 ID·토큰·호스트 절대경로·서명키·백업 전문·임의 비공개 GitHub 내용을 저장하지 않는다. 승인된 기존 감사 경로로 접근 거부 및 정책 변경의 정제된 메타데이터만 기록한다. 정상·오류 응답과 Next 프록시 모두 Cache-Control: private, no-store, X-Robots-Tag: noindex. CSP 유지, 외부 링크 허용 목록 검증.
- SEO: 관리자 화면 noindex/nofollow, 사이트맵·JSON-LD 제외. KPI 가설: 거짓 정상 **0건**, 통제 시험의 누락 근거 탐지율 **100%**, 격리 데이터에서 p95 표시 2초 이내, P0 원인 파악 시간, 검증된 출처 비율, 접근 거부 건수. 실제 측정 전에는 달성했다고 표현하지 않는다.

### 시험·무중단 배포·롤백·개발 인계
- **시험 명세만 작성, 실제 실행하지 않음:** 합성 근거 10,001건, 위조 서명/권한/다른 SHA 100건, 동시 새로고침·후보 전환 100건, 만료·시간 초과·응답 유실 50건, 마운트·시계·롤백 경계 30건. 출처 철회·main 변경·CI 미완료·가짜 녹색 화면·Test 프론트 SHA 불일치·위조된 저장공간·금융 실패·/help 404·백업 누락·app-api 불일치가 모두 HOLD로 이어져야 한다. 실제 PostgreSQL 권한 음성 시험, Next/Nest 계약, 관리자 401/403, 모바일 접근성, 개인정보/SEO 헤더, 공개/Android API 부재 및 기존 /admin/api-health 회귀를 검증한다.
- 기능 스위치 **기본 OFF**, 개발은 별도 브랜치, 기획 예약에서 런타임 배포 금지. 격리 Test의 **정확한 후보 SHA**, 전체 CI, DB 계보, 독립 복원, 금융 출처, 보안 검토와 사람의 승인 이후에만 통제된 승격 가능. 롤백은 UI/API 스위치 OFF로 처리하고 기존 관리자 API 상태 화면과 불변 근거·감사를 보존한다. EVIDENCE_READY라도 자동 승격하지 않는다.
- P0 **DISK1496-01** 용량 보호·승인된 복구(#1170), **SEC1496-02** DB 권한·체크섬·Git 참조, **FIN1496-03** MINT/SWF/국고 정산 증명, **REL1496-04** 전체 CI·독립 복원·공식 Test 정확 SHA·엣지/Android·GitOps. P1 **READINESS1496-05** 신뢰 어댑터, **READINESS1496-06** SHA/TTL/판정기, **READINESS1496-07** Nest/Next API, **READINESS1496-08** UI/접근성/다국어, **READINESS1496-09** 개인정보/관리자/SEO/KPI, **READINESS1496-10** 격리 공격·롤백 수용시험. 10개 모두 **개발 인계**이며 구현된 것이 아니다.
- 외부 독립 레퍼런스 이번 회차 신규 승인 **0건**, 누적 중복 제거·검증 승인 **UNKNOWN / 10,000건**, 분류 게이트 **BLOCKED / IN PROGRESS**. GitHub CI 성공 수와 혼동하지 않는다. 기존 저장공간 기획을 연결·재사용하고 새 분산 기획서를 생성하지 않는다. Gemini/개발 A/B/C/QA 브랜치·런타임 코드·DB·WLD·스위치·Test·Production은 변경하지 않는다. **DRAFT / RELEASE HOLD**.



## v1474 / F675-174 — 알림 검색 스냅샷·유니코드·커서 안전성 보완 (기능 보완 / 초안 / 운영 HOLD)
**GitHub:** [Draft PR #1892](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1892) OPEN / 미병합, [개발 이슈 #1887](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1887) 업데이트. 최신 main `ba18116a0f94ee4c2018cbb37fc7e161b1cd97c5` 기준으로 리베이스. 문서 전용 CI policy/classify SUCCESS, runtime-check SKIPPED. 운영 HOLD.

**주기·기준.** 이전 기능 추가 v1472 → 현재 기능 보완 v1474 → 다음 기능 추가 v1476(잠정). 시작·중간 최신 main `f9fd777458b89b3c33593ae0cad46a37b216474b`; 독립 QA v1372 FAILED/P0는 이전 main `69c4867…`을 검사했으며 현재 main 합격 증거가 아니다. v1472 설계 PR #1888은 병합됐지만 기능 코드는 **미구현**이다. Nest 알림 DTO/컨트롤러/서비스와 Next 알림 API·탭을 확인했으며 검색 API·SQL은 발견되지 않았다. 이번 작업은 문서만 수정한다. [개발 이슈 #1887](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1887).

### 기존 v1472 설계의 5가지 보완
1. **조회 시각은 여러 요청에 걸친 불변 DB 스냅샷이 아니다.** `(created_at DESC,id DESC)` 키셋은 일반적인 새 알림의 앞페이지 밀림을 막지만 과거 시각으로 추가한 알림, 삭제, 읽음 상태 변경으로 검색 대상이 달라질 수 있다. *검색 대상이 변경되지 않은 경우*에만 중복·누락 없는 순서를 보장한다. `asOfUtc`는 서버 기준 컷오프 정보이며 PostgreSQL MVCC 스냅샷이라고 표시하지 않는다. 읽음 처리·필터 변경·로그아웃·계정 변경 시 커서를 폐기하고 다시 검색한다. 신뢰할 수 있는 회원별 알림 변경 세대가 구현되면 커서에 결속하고 변경 시 409 `RESULT_SET_CHANGED`를 반환한다. 그전에는 읽지 않음 필터의 완전한 일관성을 주장하지 않고 “결과가 변경될 수 있으므로 새로고침”을 표시한다. 별도 결과 스냅샷 저장 기능은 이번 범위에 없다.
2. **한글 2글자·짧은 부분문자열의 검색 비용을 검증한다.** 입력 의도는 NFC 정규화된 2~80 유니코드 코드포인트·UTF-8 320바이트 이하이다. 서버에서 앞뒤·연속 공백을 정규화하고 제어문자·양방향 덮어쓰기·보이지 않는 문자만 있는 검색어를 거부한다. 제목/본문의 대소문자 무시 *리터럴* 검색이며 `%`, `_`, `\\`는 와일드카드로 해석하지 않는다. `pg_trgm`은 조사 당시 개발 DB에 없었고 짧은 한글·구두점 검색은 선택적 트라이그램을 보장하지 않는다. 격리 DB에서 검색어 유형별 인덱스·EXPLAIN·소유자/기간 범위·2초 타임아웃을 검증한다. 안전한 계획이 없으면 422 `QUERY_TOO_BROAD`(기간 축소·글자 추가 안내) 또는 인덱스 미검증 503 `SEARCH_UNAVAILABLE`로 실패 처리하며 전체 회원 스캔, 조용한 결과 자르기, 허위 0건 표시는 금지한다.
3. **서명 커서의 정규화·정밀도·재사용을 명시한다.** 버전·키ID·회원 해시·세션 세대·정규화 필터 해시·`asOfUtc`·첫 페이지 기준 `(created_at,id)`·마지막 표시 행 `(created_at,id)`·10분 만료를 HMAC-SHA-256에 결속한다. 2,048바이트 초과, 잘못된 base64, 미등록 키·버전, 비정규 시각, 서명 오류(상수 시간 비교), 만료·세션 철회는 거부한다. `kid`로 임의 알고리즘을 선택하지 않고 키 회전 검증 중첩은 최대 10분으로 제한한다. 필터 해시에는 검색어/분류/미확인/UTC `[from,to)`/limit/정렬이 포함된다. DB 마이크로초 정밀도를 JS Date의 밀리초로 손실시키지 않는다. `LIMIT pageSize+1`의 추가 행으로만 `hasMore`를 계산하고 **실제 표시한 마지막 행**을 다음 커서로 사용한다. 동일 시각이면 PostgreSQL UUID 순서로 결정하며 오프셋 대체는 금지한다.
4. **인증·개인정보 보호를 경로별로 분리한다.** Nest `POST /api/v1/notifications/search`는 세션·인증·동의 가드, Next `POST /api/notifications/search`는 로그인·JSON·Fetch Metadata·CSRF를 확인한다. Android는 웹 쿠키가 아닌 토큰 기반 회원 결속과 재생 방지를 사용한다. 요청 본문에서 회원 ID를 받지 않으며 기존 알림 읽음 POST와 구분한다. 타인 커서·세션 불일치는 존재 여부를 드러내지 않는 오류로 처리한다. 검색어/본문/커서/회원ID는 URL·로그·분석에 저장하지 않는다. 내부 링크는 현재 허용 목록과 클릭 시점 권한을 재확인한다. 검색은 읽음 처리·알림 발송·WLD 보상·원장 변경을 하지 않는다.
5. **DB·배포 안전성.** 조회는 읽기 전용 제한 트랜잭션, 고정 search_path의 회원 범위 `SECURITY DEFINER` 함수와 최소 EXECUTE 권한을 사용하며 테이블 직접 GRANT를 추가하지 않는다. 검색 이력 테이블은 만들지 않는다. 알림 테이블 생성 계보와 현재 앱 권한, 한글 검색 인덱스의 실제 실행 계획을 먼저 검증한다. 출처·인덱스·권한 음성시험·성능이 미확인되면 기능 기본 OFF다. 롤백 시 기존 오프셋 알림함과 읽음 처리 동작을 유지하고 신규 커서만 무효화한다.

### 화면·관리자·SEO·지표·수용시험
- 기존 알림함이 기본 화면이고 검색/초기화/더보기는 명시적 동작이다. 초기·로딩·결과·없음·네트워크 장애·오프라인·계정 전환·커서 만료·결과 변경·검색어 과다·인덱스 미검증을 구별한다. 이전 계정/필터의 지연 응답은 추가하지 않는다. 409는 검색 새로고침, 410은 동일 필터 첫 페이지 재시작, 422는 입력 보존·기간 축소 안내. 한국어·영어, 320px, 44px 터치, 키보드, 스크린리더, WCAG 2.2 AA를 요구한다. 검증되지 않은 총 건수·WLD 거래 성공을 표시하지 않는다.
- 관리자는 검색어·회원·본문·커서 없이 소규모 그룹 억제한 집계 지연/오류만 본다. 개인정보 페이지/API는 noindex/nofollow, sitemap 제외, `private,no-store`; 브라우저 캐시 음성시험. KPI 가설은 격리 데이터 p95 500ms 이하, 타 회원 조회 0, 원장 변화 0, 위험한 쿼리 계획 0, 검색 성공·접근성 오류 복구다. 실제 효과로 주장하지 않는다.
- **실행하지 않은 수용시험 계획:** 격리 PostgreSQL 17의 합성 알림 10,001건·회원 분포 편향, 타인/커서 위조 100건, 읽음/삽입/삭제 경합 100건, 만료/키 회전/철회/네트워크 50건, 시차/DST/마이크로초 동일시각 30건, 한글 두 글자/구두점/와일드카드/유니코드 30건, 쿼리 계획/타임아웃, Next/Nest/Android, 320px/키보드/스크린리더, 기존 읽음 영수증 회귀, 원장 변화 0, 기능 OFF 롤백. 대상 집합 불변일 때의 중복·누락 없음과 변경 시의 제한을 별도로 검증한다.

### P0/P1 개발 인계 및 게이트
- **P0 REPO1474-01:** 과거 누락 브랜치 462개 보존·복구 근거 조사(QA v1372 기준 346개가 당시 main의 비조상, 영구 유실 증거는 아님), 파괴적 정리 금지, #1663.
- **P0 SEC1474-02:** 현재 main의 SQL 304개는 번호 002~305로 **중복 0**(소스 관찰)이나 운영 DB 적용·무결성 합격을 의미하지 않는다. QA v1372 개발 DB 적용 293개·기존 체크섬 불일치 5개(219/220/221/234/266). 독립 복원 DB에서 적용 순서·권한·계보 확인, 적용된 SQL 수정 금지, #1878.
- **P0 FIN1474-03:** QA v1372 원장 분개 불균형 0, 차변 양수 기준 잔액 불일치 0이나 국고 직접 연결 누락 552행과 과거 MINT 보정 19건/18,000 WLD의 출처는 미검증. 기획은 금전 데이터 수정 금지, #1816.
- **P0 REL1474-04:** QA v1372 FAILED/P0는 이전 SHA 검사이며 이후 main v274 수정은 새로운 전체 lint/typecheck/build/보안/실제 PG/Android/공식 Test 정확 SHA 인증 금융 E2E·외부 백업 복원·GitOps/롤백 검증이 필요하다. Test/Production `/api/version`은 `c2129625aa6629c616fb31ce790950618b8d92b2`로 확인되어 최신 main과 다르다. 운영승격 BLOCKED.
- **P1 NOTIFSEARCH1474-05:** 회원 전용 SQL·인덱스 계보·한글 2글자 실행 계획; **P1 NOTIFSEARCH1474-06:** 필터 정규화·HMAC 커서·시각 정밀도·읽음 경합; **P1 NOTIFSEARCH1474-07:** Nest/Next/Android 인증·API 오류; **P1 NOTIFSEARCH1474-08:** 회원 UI·접근성·오류 복구; **P1 NOTIFSEARCH1474-09:** 개인정보·관리자·SEO·KPI·악용 방지; **P1 NOTIFSEARCH1474-10:** 실제 PG 적대적 회귀·기능 OFF 롤백·정확 SHA Test 인계.
- **외부 독립 근거:** 신규 중복제거·검증 승인 0건, 누적 UNKNOWN / 10,000건, `BLOCKED / IN PROGRESS`. 확보를 주장하지 않는다. **DRAFT / RELEASE HOLD.** 런타임·DB·WLD·Test·Production·기능 스위치 미변경. 개발 A/B/C는 별도 브랜치에서 구현하고 공식 Test 정확 SHA를 증명한 뒤 승인된 운영승격만 진행한다.



## v2026.10.30.1494 / F675-179 — 저장공간 근거 검증·예약 블록·배포 보류 강화 (기능 보완 / 초안 / 배포 보류)
**GitHub:** [Draft PR #1954](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1954); 선행 [v1492 PR #1949](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1949) 미병합. [개발 이슈 #1948](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1948), [P0 용량 #1170](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170).

**회차·기준.** 이전 기능 추가 v1492 → 현재 기능 보완 v1494 → 다음 기능 추가 v1496(잠정). 시작·중간 원격 main `62c6cd038951d65c94b709302bdaec6e75b080b6`; v1492는 아직 병합되지 않은 선행 기획이다. 독립 QA 최종 확인은 v1381 FAILED/P0이며 이후 회차 최종 판정은 미확인. 본 변경은 **문서 기획만** 수행한다.

### 실측 용량과 기존 설계 보완
- 2026-10-30 07:02~07:05 KST Debian 13.6 읽기 전용 측정: 루트 **94%**, 일반 사용자 가용 약 **5.8GiB**; DATA `/srv/moneyverse-data`는 `df` 반올림 표시 **100%**지만 실제 일반 사용자 가용 약 **1.1GiB**다. DATA `stat -f`: `f_blocks=51459497`, `f_bfree=2650519`, `f_bavail=287189`, 단편 크기 4096바이트, 가용 inode 약 915만 개. 약 9.7GiB의 예약 블록은 일반 작업자·백업이 쓸 수 있는 공간이 아니다. 100% 표시를 실제 0바이트로, `f_bfree`를 가용량으로 오해하지 않는다. 루트와 DATA는 별도 ext4이며 inode 고갈은 관측되지 않았다.
- v1492의 루트 92%/DATA 99%/약 3.1GiB는 당시 측정이며 현재 값이 아니다. 현재 **P0 긴급 / 배포 보류**. 고객 장애가 발생했다고 단정하지 않고 파일 삭제·자동 정리도 수행하지 않았다. 모든 작업 폴더, Git 참조, 백업, 롤백 파일과 소유권을 보호하며 실제 복원 가능성을 독립 검증한다.
- 최신 main의 `backend/src/admin/api-health.controller.ts`는 CPU·메모리·DB만 측정한다. `frontend/src/app/api/admin/api-health/status/route.ts`의 `NextResponse.json` 성공·실패 응답에는 명시적인 private/no-store/noindex 헤더가 없다. 이는 **소스에서 확인한 누락**이지 실제 캐시 유출의 증거는 아니다. 신규 저장공간 프록시는 모든 응답에 헤더를 강제하며 개발 C의 공개 상태 기능과 변경 범위를 분리한다.

- **빠른 용량 변화:** 2026-10-30 **07:08:30 KST** 추가 읽기 전용 `df -B1`에서 DATA 일반 사용자 가용량은 **233,713,664바이트(약 223MiB)**였다. 이전 약 1.1GiB는 보장된 여유가 아니다. P0 긴급 사고이며 자동 삭제를 허용하지 않는다.

### 수집기·보안·정확성·배포 조건
- 응답의 `sourceVerified:true` 자체는 증거가 아니다. 호스트에서만 실행되는 비root 읽기 전용 수집기가 고정 ROOT/DATA 마운트만 측정하고, 호스트 부팅 식별자·단조 증가 시퀀스·UTC 측정시각을 포함한 정규화 메시지를 수집기 전용 보호 키(예: Ed25519)로 서명한다. 서버는 고정 공개키, 키 ID, 서명, ROOT/DATA 중복 여부, 호스트·마운트 네임스페이스와 운영자 승인 마운트 ID/장치를 검증한다. 컨테이너 측정치, DATA 마운트 이탈, 장치 변경, 서명 실패는 **503 UNKNOWN / HOLD**. 원본 장치·경로·호스트 ID는 클라이언트에 노출하지 않는다.
- 60초 수집, 120초 이내 최신성, 미래시각 30초 초과·시계 오류·같은 부팅 세대의 중복/역행 시퀀스·재전송 거부. 수집기/서버 재시작 후 새로운 서명 측정이 도착하기 전까지 UNKNOWN. 로컬 채널 2초 제한, 관리자당 6회/분·IP당 30회/분; 임의 경로, 셸, 탐색, 삭제, 전체 DATA 볼륨에 대한 영속 기록 금지. 실패 시 컨테이너 statfs나 이전 정상값으로 대체하지 않는다.
- 임의 정밀도 정수로 `usedBytes=(f_blocks-f_bfree)*f_frsize`, `availableBytes=f_bavail*f_frsize`, `reservedBytes=(f_bfree-f_bavail)*f_frsize`, `totalBytes=f_blocks*f_frsize`를 계산한다. `0<=f_bavail<=f_bfree<=f_blocks`, `f_frsize>0`, 양의 사용률 분모를 검증한다. `usedPercent=100*usedBytes/(usedBytes+availableBytes)`이며 바이트·inode는 정확한 10진 문자열로 반환한다. `f_favail=0`은 inode 긴급, 지원되지 않는 inode 값은 UNKNOWN/HOLD. 화면에는 **반올림 100%지만 0이 아닌 가용량**과 **예약 블록(일반 사용자 사용 불가)**을 구분한다.
- **측정 위험도와 배포 승인 여부를 분리**한다. 사용률 95% 이상 또는 일반 사용자 가용량 5GiB 미만이면 EMERGENCY. 출처·마운트·계산 미검증이면 UNKNOWN/HOLD. 배포 용량 게이트는 대상 파일시스템별 실측 빌드 최대치 + 독립 복원 작업 공간 + 롤백 아티팩트 크기 + 운영자 승인 안전 여유를 `f_bavail`과 비교한다. 어떤 근거든 누락되면 0으로 간주하지 않고 HOLD. 용량 정상만으로 금융·DB ACL/체크섬·전체 CI·독립 복원·프론트/엣지 신원·공식 Test 정확 SHA·승인된 운영승격을 우회할 수 없다.
- `GET /api/v1/admin/operations/storage`와 Next 프록시에서 서버 측 관리자·세션·동의·관리자 세션을 확인한다. 응답은 `storage-v1` ROOT/DATA 허용 필드와 서버 검증 위험도만 포함한다. 200/401/403/429/503/기능 OFF **모든 응답**에 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`, 쿠키 사용 시 `Vary: Cookie`, `Referrer-Policy: no-referrer`를 적용한다. 경로·장치·키·회원정보 금지, 공개/Android 회원 API·사이트맵 제외. 오류를 정상 빈 상태로 표시하지 않는다.
- 기존 CTA **근거 새로고침 / 읽기 전용 근거 보기 / 이슈 #1170 열기**만 유지. 로딩·정상·긴급·UNKNOWN·오프라인·401/403/429/503·오래된 근거·계정 전환·늦게 도착한 응답을 구별한다. 320px, 200% 확대, 44px 터치, 키보드·aria-live·문자+아이콘, WCAG 2.2 AA, 영한 동등 문구. 관리자 감사에는 이벤트 유형·최신성·위험 등급만 남기고 경로·비밀·원본 ID는 기록하지 않는다. KPI는 가설: 거짓 정상 0, 위조·오래된 증거 수락 0, 무단 접근 0, 긴급 인지 지연 및 p95 최신성.
- v1은 **실시간 임시 읽기 전용**으로 SQL 테이블·인덱스·마이그레이션·GRANT·WLD/원장 변경이 없다. 장기 이력 DB는 별도 승인 후에만 고려한다. `admin_storage_headroom` 기본 OFF; 롤백은 수집기·API·UI 비활성화만 수행하고 파일을 변경하지 않는다.

### 개발 인계: P0 4건 + P1 6건
- **P0 DISK1494-01:** #1170 소유자·보존기한·백업·롤백 자산 인벤토리, 명시 승인 후 안전한 용량 확보, DATA `f_bavail` 재측정 및 독립 복원. 임의 삭제 금지.
- **P0 SEC1494-02:** 고객문의·감사 ACL 불일치, 적용 마이그레이션 체크섬 5건 격리 검증 및 순방향 수정·권한 부정 시험.
- **P0 FIN1494-03:** MINT 18,000 WLD 출처, 국고 552건 연결, SWF 실제 영수증, Test 합성 200 진실성 확인 전 금융 변경 보류.
- **P0 REL1494-04:** 과거 Git 참조 462개 보존, 전체 CI, 프론트/백엔드/엣지 신원, 독립 복원, 공식 Test 정확 SHA 및 운영자 승인.
- **P1 STORAGE1494-05:** 호스트 전용 비root 수집기, 고정 마운트·서명·출처 검증, 컨테이너 대체 금지.
- **P1 STORAGE1494-06:** BigInt 계산, 예약 블록·일반 사용자 가용량·inode·100% 반올림·배포 필요 공간 검증.
- **P1 STORAGE1494-07:** Nest 관리자 API·Next 프록시, 서명·재전송·최신성, 모든 응답 no-store/noindex, 제한·개인정보.
- **P1 STORAGE1494-08:** 영한 관리자 화면, 100%/비영(非零) 가용량·UNKNOWN/HOLD·오류·경합·접근성·SEO.
- **P1 STORAGE1494-09:** 최소 감사·KPI·키 교체·공개/Android 비노출·기능 OFF·무스키마 롤백.
- **P1 STORAGE1494-10:** 격리 호스트 읽기 전용 시험 + 합성 10,001건, 출처·권한 위조 100건, 동시 100건, 오래됨·재전송 50건, 예약 블록·마운트·임계값 30건; 독립 복원·정확 SHA Test. **시험은 기획만 하고 미실행**.
- 외부 독립 근거 신규 검증 승인 **0건**, 중복 제거 후 누적 **UNKNOWN / 10,000건** ⇒ **BLOCKED / IN PROGRESS**. Gemini·개발 A/B/C·QA 브랜치와 변경 겹침 방지. 문서 외 런타임·DB·Test·Production 미변경.


## v2026.10.30.1492 / F675-179 — 관리자 전용 검증형 저장공간 여유 및 배포 보류 근거 (기능 추가 / 초안 / 배포 보류)
**GitHub:** [Draft PR #1949](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1949) — OPEN / unmerged / RELEASE HOLD.

**기준과 회차.** 이전 기능 보완 v1490 → 현재 기능 추가 v1492 → 다음 기능 보완 v1494(잠정). 최신 `main` `62c6cd038951d65c94b709302bdaec6e75b080b6` 시작·중간 재확인. 독립 QA v1381 FAILED/P0. 개발 이슈 [#1948](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1948), 용량 사고 [#1170](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170). **문서 기획만 수행**하며 런타임·파일 삭제·DB·WLD·Test·Production을 변경하지 않는다.

### 실제 소스 기반 공백과 목표
- 2026-10-30 06:09 KST Debian 13.6 미니PC의 읽기 전용 `df -h` 결과 루트 92%, 데이터 `/srv/moneyverse-data` 99%, 이용 가능한 공간 약 3.1GiB. 이는 특정 시점의 호스트 측정이며 실제 고객 장애나 미래 고갈을 입증하지 않는다. 다른 작업자의 워크트리·Git 참조·백업·롤백 릴리스를 임의 삭제하지 않는다.
- 기존 `frontend/src/app/admin/api-health/page.tsx`와 `backend/src/admin/api-health.controller.ts`는 CPU·메모리·DB ping만 측정하고 도메인별 API 측정 여부를 구분한다. 호스트 파일시스템의 가용 공간·inode·롤백 여유를 검증해 관리자에게 제공하는 기능은 확인되지 않았다. 신규 기능은 관리자 읽기 전용 화면이며 공개 상태 페이지, 회원 알림, 자동 정리·배포 승인, SSH 콘솔과 구별한다. 개발 C의 공개 상태 응답 검증 이슈 #1947과 변경 범위를 분리한다.
- 대상은 빌드·복원·승격 가능성을 판단하는 운영 관리자다. 성공 조건은 **실제 호스트 출처와 최신성 검증**, 임계 용량의 정상 오표시 0건, 위험 파일 삭제 없이 사고 이슈로 연결하는 것이다.

### 진입점·화면·CTA·상태
- 관리자 전용 `/admin/operations/storage`를 기존 `/admin/api-health`와 관리자 메뉴에서 연결한다. 마운트는 고정 별칭 `ROOT`, `DATA` 두 개만 표시한다. 실제 경로·장치 식별자·작업 폴더·백업명·회원정보는 노출하지 않는다. 카드에는 호스트 측정 출처, 측정시각·경과시간, 총량·사용량·일반 사용자 가용 바이트, 사용률, 남은 inode, 심각도, 독립적인 롤백 여유 정책 충족 여부를 표시한다.
- CTA는 **근거 새로고침**, **읽기 전용 측정 근거 보기**, **용량 이슈 #1170 열기**만 제공한다. 삭제·정리·재시작·서비스 중지·명령 실행·마이그레이션·파일 탐색·배포 승인 버튼은 없다. 용량 정상은 금융·CI·복원·정확 SHA Test·GitOps 등 별도 배포 게이트를 통과했다는 뜻이 아니다.
- 상태: 로딩, 정상, 주의, 위험, 긴급, 수집기 미연결, 오래된 근거, 출처·서명 검증 실패, 호스트/컨테이너 네임스페이스 불일치, inode 부족, 401, 403, 429, 503, 기능 OFF, 오프라인 재시도. 검증 실패는 **UNKNOWN / RELEASE HOLD**이며 0% 또는 초록색으로 표시하지 않는다. 오래된 값은 반드시 '이전 측정'으로 구별한다.
- 한국어·영어 동등 문구, 320px 단일 열·768px 이상 그리드, 44px 터치, 키보드 초점, aria-live, 색 외 문자·아이콘 표시, 스크린리더 단위, 200% 확대, 모션 감소, WCAG 2.2 AA. 비공개 페이지는 사이트맵 제외·noindex.

### 수집기·API·권한·정확성
- 호스트의 제한된 읽기 전용 수집기가 고정 마운트 식별자만 `statvfs`/`statfs`로 측정한다. 사용자 입력 경로나 명령을 받지 않고 심볼릭 링크 추적·백업 디렉터리 스캔·root 명령 실행을 하지 않는다. 실제 호스트 마운트 네임스페이스와 신뢰 출처를 검증하고 인증된 로컬 Unix 소켓 또는 동등한 서명 채널로 전달한다. 컨테이너 마운트 측정치가 호스트 측정으로 둔갑하면 거부한다. ROOT/DATA 2건, 수집 주기 60초, 최신성 120초 이내. 수집기는 파일 쓰기·삭제·압축·변경 권한이 없다.
- `GET /api/v1/admin/operations/storage`에 `SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard`를 적용한다. 클라이언트 플래그로 관리자 권한을 판단하지 않는다. 응답은 `{schemaVersion:'storage-v1',observedAt,sourceKind:'HOST',sourceVerified:true,mounts:[{alias:'ROOT'|'DATA',totalBytes,usedBytes,availableBytes,usedPercent,inodeAvailable,inodeTotal,severity,headroomPolicyStatus}],freshness:'FRESH'}`. 바이트·inode 정수는 JS 안전 정밀도를 위해 10진 문자열, 백분율은 유한한 범위 숫자, 시간은 ISO UTC, 마운트는 정확히 2개·중복 금지. 실제 경로·장치·토큰·자유 형식 진단 정보 금지. 공개 API와 Android 회원 게이트웨이에는 노출하지 않는다.
- 오류는 401/403 인증, 429(제안: 관리자당 분당 6회·IP당 30회), 503 출처·최신성·수집기 실패, 상류 제한시간 2초. `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`; 실패를 정상 응답으로 위장하지 않는다. `admin_storage_headroom` 기능 스위치는 기본 OFF이며 코드만 되돌릴 수 있다.
- `df` 호환 사용률: `used=f_blocks-f_bfree`, `available=f_bavail`, `usedPercent=100*used/(used+available)`(분모 양수). `totalBytes=f_blocks*f_frsize`, `availableBytes=f_bavail*f_frsize`; 예약 블록을 구분하고 오버플로를 방지한다. inode는 가능할 때 `f_favail` 기준, 측정 불가를 '100% 가용'으로 간주하지 않는다. 제안 임계값: 80% 이상 주의, 90% 이상 위험, 95% 이상 또는 가용 <5GiB 긴급. 정확히 95%도 긴급이며 inode 고갈은 독립적으로 긴급. 미확인 데이터는 UNKNOWN. 임계값은 운영 승인 전 잠정값이다.
- v1은 실시간 호스트 측정이므로 **신규 DB 테이블·인덱스·권한·마이그레이션·WLD 원장 변경 없음**. 기존 감사 시스템에는 경로·원시 데이터 없는 접근·설정 메타데이터만 허용한다. 이후 이력 저장이 별도로 승인되고 디스크·체크섬 문제가 해결된 경우에만 새 정방향 마이그레이션으로 `(mount_alias,observed_at)` 유일성, `0<=available<=total` CHECK, `(mount_alias,observed_at DESC)` B-tree, 30일 제한 보관, 앱 계정 직접 DML 금지를 검토한다. **이 기획으로 미래 테이블 생성을 승인하지 않는다.**

### 보안·운영·분석·배포
- 임의 경로 열람·파일 목록·파일 내용·삭제 토큰·백업명·호스트 비밀·셸 접근 금지. 출처 위조, 서명 재전송, 시각 변조, SSRF, 관리자 사칭, 오래된 응답 경쟁, 과도한 요청, 단위 변조를 방어한다. 관리자 접근은 민감 정보 없이 감사하고 일반 회원·비로그인에게는 노출하지 않는다.
- KPI(실측 아님): 예약 수집의 최신 증빙 비율 >=99%, 오래되거나 위조된 값의 정상 오표시 0건, 긴급 관찰부터 사고 확인까지 걸린 시간. 로그에는 건수·지연·검증 결과·심각도 범주만 기록한다. v1에는 이메일·푸시 전송 기능이 없다.
- P0 용량 회복은 소유권·백업·롤백 보존 검증과 별도 운영 승인 후 수행한다. 대시보드는 공간을 확보하지 않는다. 전체 CI, 실제 호스트 수집기 격리 시험, 독립 복원, 공식 Test 정확 SHA 인증 E2E, GitOps 승인 전 Production 승격 금지. 롤백은 기능 OFF 및 UI/API/수집기 코드 복구, 기존 API-health 유지, RELEASE HOLD 유지, DB 다운마이그레이션 없음.

### P0/P1 구체 백로그 및 수용시험
- **P0 DISK1492-01:** #1170 읽기 전용 용량·소유권·백업·롤백 조사, 승인된 안전 복구. 자동 삭제 금지.
- **P0 SEC1492-02:** 앱 DB 직접 권한과 적용 마이그레이션 체크섬 불일치 5건, 정방향 보안 보완 및 부정 권한 시험.
- **P0 FIN1492-03:** MINT 18,000 WLD 출처, 국고 552건 연결, SWF 금융 실패, Test 합성 200 진실성 게이트.
- **P0 REL1492-04:** 과거 Git 참조 462개, 전체 lint/계약/CI, 독립 복원, 공식 Test 정확 SHA 및 승인된 운영 승격.
- **P1 STORAGE1492-05:** 고정 허용목록 읽기 전용 호스트 수집기, 출처·네임스페이스 검증, 셸/변경 권한 금지.
- **P1 STORAGE1492-06:** 바이트·inode·임계값·최신성·응답 스키마 검증 실패 시 차단.
- **P1 STORAGE1492-07:** Nest 관리자 API, 제한시간·호출량·개인정보 헤더, SQL 권한 추가 없음.
- **P1 STORAGE1492-08:** Next 관리자 화면·메뉴·모든 상태/CTA·모바일 접근성.
- **P1 STORAGE1492-09:** 감사·비공개 SEO·집계 KPI·Android/공개 경로 부정 시험·기능 OFF·롤백.
- **P1 STORAGE1492-10:** 수집기 격리·계약 시험, 오프라인 합성 측정 10,001건, 권한/출처 위조 100건, 동시 조회 100건, 오래됨/연결 실패 50건, 네임스페이스/경계 30건, 복원·정확 SHA Test 수용시험. **모두 기획된 시험이며 실제 실행하지 않았다.**
- 외부 독립 레퍼런스 신규 중복 제거·검증 승인 **0건**, 누적 **UNKNOWN / 10,000건** → **BLOCKED / IN PROGRESS**. 달성으로 표시하지 않는다. 개발 A/B/C·Gemini·QA의 작업 브랜치는 건드리지 않는다.


## v1472 / F675-174 — 회원 전용 검증형 알림 검색·안정적 내역 조회 (기능 추가 / 초안 / 운영 HOLD)

**기준·범위·주기.** 이전 기능 보완 v1470 → 현재 기능 추가 v1472 → 다음 기능 보완 v1474(잠정). 시작·중간 최신 main `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`. 마지막 완료 독립 QA v1371 FAILED/P0, v1372는 증거 수집 중으로 최종 판정 없음. 소스·개발 DB 읽기 전용 조사. **기획 문서만 변경**, 런타임·DB·WLD·기능 스위치·Test·Production 미변경. [개발 이슈 #1887](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1887).

### 실제 소스의 공백·범위·기존 기획과 구분
- `frontend/src/app/account/notifications/page.tsx`는 인증 알림 센터와 목표/NPC 설정을 제공한다. `notification-tabs-bar.tsx`는 분류 탭·읽음 처리·20개 단위 오프셋 페이지(상한 5,000)를 제공하지만 키워드·기간 검색이 없다. `backend/src/notification/notification.dto.ts`는 category/unreadOnly/limit/offset만 검증하고 `notification.service.ts`는 `created_at DESC,id DESC`로 직접 조회한다. 검색/서명 커서 API는 조사 범위에서 발견되지 않았다. 이는 **소스 공백**이지 운영 수요·법규 위반의 증거가 아니다.
- 개발 PostgreSQL 17.11 `public.in_app_notifications`는 조사 시 **0행**. 컬럼은 `id,user_id,category,title,body,link,dedupe_key,is_read,read_at,created_at`; 인덱스는 소유자/생성시각, 소유자/읽음, dedupe 부분 UNIQUE, PK. 기존 `moneyverse_app` SELECT/INSERT 권한은 관찰된 사실이며 **임의 추가·회수 승인 아님**. `pg_trgm` 미설치(`pgcrypto`, `plpgsql`만 설치). 조사한 init/migrations에서 테이블 생성 DDL이 발견되지 않아 원본 계보 검증이 필요하다. 개발 DB 0행을 운영 0행으로 확대 해석하지 않는다.
- F675-101 검증형 알림함, F675-102 수신 동의/조용한 시간, F675-103 선택형 다이제스트와 분리한다. 이번 기능은 **읽기 전용 검색과 안정적 과거 조회**만 제공하며 외부 알림 발송·알림 생성·일괄 보상 청구·자동 읽음·금융 송금·자동 삭제는 하지 않는다. 알림 문구를 실제 WLD 정산 증빙으로 취급하지 않는다.

### 사용자·진입점·화면 및 CTA
- 대상은 자신의 과거 알림을 찾는 로그인 회원. 기존 `/account/notifications`에서 키워드(Unicode NFC 2~80자), 허용 분류, 읽지 않음, 최대 90일 기간을 선택한다. 기간은 화면 현지 시각을 명시적으로 UTC 반개구간 `[fromUtc,toUtc)`로 변환한다. 검색·초기화·더 보기·검증된 내부 상세 이동 CTA를 제공한다. 기본 화면은 기존 알림함이며 사용자가 검색을 실행해야 검색 모드로 진입한다.
- 초기/검증/로딩/검색 결과/진짜 0건/알림 없음/네트워크 일부 실패/오프라인/401 재로그인/403 접근 거부/409 필터 불일치/410 커서 만료 후 동일 조건 재검색/429 요청 제한/503 인덱스 미검증/기능 OFF 후 기존 화면 복귀/로그아웃·계정 전환 중 오래된 응답 폐기를 구분한다. 검증된 전체 건수가 없다면 총건수를 꾸며 표시하지 않는다. 검색은 자동 읽음 처리하지 않고 실제 분류·시각·읽음 상태·서버 허용 내부 링크만 표시한다.
- 320px 단일 열·태블릿·데스크톱, 44px 터치, 키보드·포커스·상태 알림·스크린리더·모션 축소, WCAG 2.2 AA, 한국어/영어를 요구한다. Android 앱 API는 웹 쿠키 없이 해당 플랫폼 인증으로 동일한 읽기 전용 결과를 제공한다.

### API·인증·입력·오류
- NestJS `POST /api/v1/notifications/search`는 **상태를 바꾸지 않는 검색**이며 JSON `{query,category?,unreadOnly?,fromUtc,toUtc,limit?,cursor?}`를 받는다. 키워드를 URL·브라우저 기록·리퍼러·접근 로그에 남기지 않도록 GET 쿼리 대신 본문을 사용한다. Next 동일 출처 `POST /api/notifications/search`는 세션·CSRF·no-store, Android는 인증 토큰과 재생 방지 규칙을 적용한다. 응답 `{items:[{id,category,title,body,link,isRead,createdAt}],nextCursor,hasMore,asOfUtc}`. 기본 20/최대 50개, 검증 안 된 전체 건수는 반환하지 않는다.
- 허용 DTO 필드만 수용하고 NFC 정규화·공백 정리·2~80자·90일·UTC ISO·시작<종료를 검증한다. SQL 문자열 연결, 정규식·임의 정렬·타인 userId·무제한 offset 금지. 400 입력, 401 인증, 403 소유권, 409 커서/세션 불일치, 410 만료, 429 제한, 503 스키마/인덱스/계획 미검증. 회원당 분당 20회·IP당 60회(실측으로 조정), DB 2초 타임아웃, 반환 텍스트/페이로드 상한. `Cache-Control: private, no-store`; 검색어·본문·회원 ID·원본 커서·PII 로그/분석 제외.
- 서버 세션에서 actor를 확정하고 요청의 actor/userId를 절대 신뢰하지 않는다. 고정 search_path와 소유자 제한이 있는 `SECURITY DEFINER` 조회 함수, 최소 EXECUTE 권한을 설계한다. 기존 앱 역할의 직접 SELECT/INSERT 권한 계보는 별도 검증하고 **신규 테이블 직접 권한을 추가하지 않는다**. 링크는 서버의 내부 경로 허용 목록으로 재검증한다.

### DB·인덱스·서명 커서·동시성·롤백
- 먼저 스키마 출처와 중복 마이그레이션 번호 291~295, 기존 체크섬 5건을 해결한다. 적용된 SQL 원문은 절대 수정하지 않는다. #1878 해결 후에만 고유 번호의 전진 마이그레이션으로 `(user_id,created_at DESC,id DESC)` 인덱스 필요성을 검토하고 기존 PK/dedupe/알림 기록을 유지한다. 한국어 부분문자열 검색을 위한 `pg_trgm`/GIN 도입은 격리 PG 성능·확장 설치 검증을 선행한다. 현재 개발 DB에는 `pg_trgm`가 없다. 안전한 인덱스·계획이 없으면 무제한 검색이나 임의 일부만 반환하지 않고 `503 SEARCH_UNAVAILABLE`로 실패 처리하며 기존 알림함을 유지한다.
- DB 함수는 actor 소유권, 분류·읽음·기간·정규화된 리터럴 키워드를 검증하고 `(created_at,id)<(cursorCreatedAt,cursorId)` 키셋 조건으로 정렬·`limit+1` 조회한다. HMAC 서명 커서는 키 ID 회전, actor, 세션 세대, 필터 해시, DB 서버 `asOfUtc`, 마지막 튜플, 10분 만료를 결속한다. 상수 시간 검증 후 SQL을 실행하고 커서 원문은 분석에 기록하지 않는다. 새 알림(`created_at>asOfUtc`)은 기존 페이지를 밀지 않는다. 다만 읽음 상태 변경·관리자 역일자 입력까지 모든 페이지의 **불변 MVCC 스냅샷을 보장한다고 주장하지 않는다**. 변경 시 재검색 안내.
- 검색은 **쓰기 트랜잭션·금융 원장 변경·변경 영수증이 없다**. 서명 커서는 읽기 이어보기 증빙이지 금융/발송 영수증이 아니다. 읽기 전용 트랜잭션·타임아웃·실제 실행 계획 확인. 검색 기록 테이블을 신설하지 않고 키워드 없는 거친 집계만 허용. 기능 OFF 롤백은 신규 라우트를 닫고 기존 알림함·기존 데이터는 보존한다.

### 관리자·개인정보·SEO·지표
- 관리자는 익명 집계된 검색 사용량·지연·오류·기능 상태만 확인하고 회원 검색어·알림 본문·개별 결과·커서를 열람하지 않는다. 권한 거부와 설정/배포 이벤트만 비식별 감사한다. 검색어·알림 문구를 개인정보로 취급하고 기존 보존 정책을 따른다. 속도 제한, 서명 변조 거부, CPU/길이 제한, 로그아웃 세션 폐기를 요구한다.
- 회원 페이지/API는 `noindex,nofollow`, sitemap 제외, `no-store`, 크롤러 음성 테스트, 공개 구조화 데이터 없음. KPI는 **미실측 가설**로 검색 완료율, 타인 데이터 0건, 격리 데이터 p95 <500ms, 429/503 비율, 알림 탐색 시간, 접근성 과제 완료율이다. 검색어는 분석 수집 금지.

### P0/P1 개발 백로그·수용시험·승격 조건
- **P0 4건:** REPO1472-01 과거 삭제 브랜치 462개/비조상 344개 증거 보존(#1663); SEC1472-02 마이그레이션 291~295 번호 충돌·기존 체크섬 5건 및 스키마 계보(#1878, Draft #1885); FIN1472-03 19건 18,000 WLD MINT 보정 및 국고 직접 연결 누락 552행의 근거 검증(#1816), 금융 변경 금지; REL1472-04 QA v1371 린트/프론트·백엔드 타입 실패(#1883/#1884/#1886), 독립 외부 백업 복원, 전체 CI·보안·격리 PG·공식 Test 정확 SHA·승인 GitOps.
- **P1 6건:** NOTIFSEARCH1472-05 소유자 전용 함수·안전 인덱스, NOTIFSEARCH1472-06 HMAC 키셋 커서, NOTIFSEARCH1472-07 Nest/Next/Android 계약, NOTIFSEARCH1472-08 접근성 UI, NOTIFSEARCH1472-09 개인정보·관리자·KPI, NOTIFSEARCH1472-10 실제 PG·보안·회귀·롤백.
- **수용시험은 정의만 했고 실행하지 않았다.** PostgreSQL 17.11 격리 데이터 10,001건(회원 편중·한글/영문 포함), 타인 조회/위조 커서 100건, 동시 알림 생성·읽음 100건, 응답 유실/만료/재생 50건, 시간대/DST 30건, Unicode 이상값, 인덱스 누락 시 실패 처리, 실행 계획·타임아웃, Next/Nest/Android 계약, 320px·키보드·스크린리더, 비공개 SEO, 기존 읽음 처리 회귀, 원장 무변경, 실제 DB 권한 거부를 검증한다.
- 기능 스위치 기본 **OFF**. 개발 A/B/C는 별도 브랜치, QA/Gemini와 변경 중첩 금지. 마이그레이션 무결성, 정확 SHA 전체 CI, 공식 Test 인증·금융 E2E, 독립 백업 복원, 승인된 GitOps, 무중단 smoke·롤백 근거 없이는 main 병합/Production 승격 **BLOCKED**. 외부 독립 근거 신규 검증 승인 **0건**, 누적 중복 제거·승인 **UNKNOWN / 10,000**, **BLOCKED / IN PROGRESS**.
**GitHub:** [Draft PR #1888](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1888) OPEN / unmerged; [P0/P1 issue #1887](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1887). Documentation only, release HOLD.


## v1470 / F675-173 — 개인정보 내보내기 스냅샷·본인확인·다운로드 증빙 강화 (기능 보완 / 초안 / 운영 보류)

**기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1882 (미병합 / 운영 HOLD).

**주기:** 이전 Feature Addition v1468 → 현재 Feature Improvement v1470 → 다음 Feature Addition v1472(잠정). **기준:** 2026-10-29 19:09 KST 확인한 원격 main 76d63a5840a4a185fcaeb02f8b1132dd145f19e4, 최신 QA v1370 FAILED/P0. 본 내용은 기획 명세이며 구현·운영 배포가 아니다. v1468 기획은 Git 이력(6930c76ac)에 병합되었지만 v270 통합 이후 최신 main의 통합 기획서·프로젝트 계획서 첫 부분에서 사라져, 이번 변경에서는 다른 main 내용을 되돌리지 않고 해당 섹션을 복원한다.

### 소스 근거 및 차단 조건
- 현재 Next.js /account/privacy는 수동 개인정보 요청 입력·조회 화면이고, NestJS privacy/requests는 access/correction/restriction/withdrawal/deletion과 received 상태만 지원한다. 확인한 소스에는 회원 소유 내보내기 작업·파일·다운로드 API가 없다. 자동 파일 제공을 법정 열람 요청의 처리 완료로 표시해서는 안 된다.
- 현재 ReauthGuard의 REAUTHENTICATION_WINDOW_SECONDS는 900초(15분)이다. v1468 내보내기 기준은 최대 600초(10분)이므로 기존 가드를 단독 재사용하면 정책 위반이다. 서버가 검증한 재인증 시각과 현재 세션·회원에 묶인 별도 600초 검증이 필요하다. 클라이언트 auth_time, 로컬 시계, 쿠키 보유 또는 오래된 OAuth 콜백을 증빙으로 인정하지 않는다. 검증 불가 시 reauthentication_required 또는 503으로 차단하고 15분으로 완화하지 않는다. Android 토큰도 별도 본인확인·계정 결속을 검증한다.
- 최신 main에 SQL 마이그레이션 303개가 있으며 번호 중복은 291×3, 292×3, 293×2, 294×2, 295×4이다. QA v1370이 앞선 main에서 조사한 300개·이슈 #1878과 구별한다. 개발 DB 적용 293건은 QA 증거이지 이번 신규 DB 재실측이 아니다. 과거 체크섬 불일치 219/220/221/234/266도 남아 있다. 작성자 간 고유 번호·전진형 계보를 확정하기 전에는 내보내기 SQL 번호를 배정하거나 실행하지 않는다. 개발 PR #1880/#1881은 배포 인증이 아니다.
- QA v1370의 과거 브랜치 이름 누락 462개(그중 344개 SHA는 main 비조상), 승인된 금융 DML 범위를 넘는 audit_logs TRUNCATE 권한, MINT 18,000 WLD 출처 미검증, 공식 Test 정확 SHA 미인증도 유지한다. 운영자 승인 금융 권한은 임의 변경하지 않고 원장 산술 일치를 자금 출처 증명으로 혼동하지 않는다.

### 데이터 완전성·스냅샷
- 내보내기 데이터 종류별로 서버 고정 레지스트리(조회 함수, 안정적 기본키, 스키마 버전, 허용 열, 열별 소유권·마스킹, 보존 규칙, 제외 사유)를 둔다. 클라이언트가 테이블·열·조인 대상을 선택하지 못하며 SELECT * 금지. 회원 프로필·동의·요청 영수증·검증된 본인 원장 활동·업무/퀘스트만 소유권과 출처가 독립 검증된 경우에 한해 제공한다. 상대 회원의 이름·연락처, 채팅 본문, 인증정보, 원본 감사 로그는 제외한다.
- 각 데이터 종류마다 서버 기준 as_of, 안정적인 키셋 정렬, 최고 수집 키, 포함 건수, 마스킹·제외 건수와 사유, 정규 UTF-8 데이터 해시, 원천 스키마 개정을 기록한다. 가능하면 PostgreSQL READ ONLY REPEATABLE READ로 동일 스냅샷을 사용하되 60초 시간 상한을 적용하고 다운로드 동안 트랜잭션을 유지하지 않는다. 단일 스냅샷이 보장되지 않으면 종류별 시점과 NOT_ATOMIC_ACROSS_CLASSES를 명시하고 전체가 동일 시점이라고 주장하지 않는다.
- 선택한 필수 데이터 종류에서 소유권·원천·페이지네이션·스키마·해시 검증 실패 시 READY가 아닌 HOLD 처리한다. 선택적 제외는 명시적인 제외 코드와 사전 회원 확인이 필요하다. 25MiB 초과 파일을 조용히 잘라 제공하지 않고 TOO_LARGE와 최소 영수증 및 기존 수동 요청 경로를 제공한다. 금융 데이터는 공인된 읽기 전용 원장 조회·십진 문자열만 사용하며 분개·잔액·국고 연결을 생성하거나 추정하지 않는다.
- 서명된 manifest는 익명화된 회원별 내보내기 ID, 원천 기준 시점, 레지스트리 개정, 포함/제외 데이터 종류, 바이트 길이, 건수·해시, ZIP SHA-256, 생성·만료 시점을 묶는다. 서명 알고리즘·키 ID·공개 검증키의 버전 관리와 오프라인 검증기, 키 회전·폐기 규칙을 제공한다. 서명은 파일 무결성과 출처를 입증할 뿐 법적 완전성이나 사용자의 로컬 저장 성공을 증명하지 않는다.

### 암호화·다운로드·삭제
- 서버 저장 객체의 암호화와 사용자가 내려받는 ZIP을 구분한다. 별도 승인된 클라이언트 암호화가 없다면 인증 후 복호화된 ZIP은 평문이다. KMS가 보호하는 내보내기별 AES-256-GCM 봉투 암호화, 인증된 메타데이터를 사용하며 URL·로그·통계·이메일에 키·토큰·개인정보를 남기지 않는다. 고정 파일명만 허용하고 zip-slip 경로·심볼릭 링크·중첩 압축·실행 파일·CSV 수식은 금지한다. 압축 후 25MiB 외에 압축 전 크기·파일 개수·메모리·CPU 한도도 검사한다. 다운로드 화면에는 ZIP의 민감한 평문 저장 위험을 알린다.
- 1회용 다운로드 권한은 세션·회원·내보내기 ID·세대·파일 해시에 결속하며 최대 10분 유효하다. 첫 바이트 전 DB 원자 연산으로 소비하고 HTTP Range/재개 및 동일 권한 자동 재시도를 금지한다(Range는 416). 중단되면 재인증과 새 권한이 필요하다. 서버가 바이트를 전송한 사실만으로 회원이 저장했다고 표시하지 않는다. GRANT_CONSUMED, STREAM_STARTED, STREAM_FINISHED_SERVER, USER_VERIFIED_DIGEST(자발적 검증)를 분리한다.
- 권한 발급과 다운로드 시작마다 600초 재인증·계정 상태·소유권·취소/삭제 제한·세대·만료를 재검증한다. 계정 전환·로그아웃·세션 취소·동시 취소·키 폐기 시 권한은 무효화하며 타인 내보내기는 존재 여부가 드러나지 않도록 404를 반환한다. 삭제·처리 제한 요청 시 신규 작업과 권한은 HOLD, 대기 작업 취소·권한 폐기·암호문 정리 시행(법적 보존 예외는 별도 승인). 백업 복원 시 권한 폐기·삭제 기록을 먼저 재생하여 만료 파일이 되살아나지 않도록 한다. 객체 DELETE 응답만으로 삭제 완료를 선언하지 않고 객체 버전별 확인 증빙을 남긴다.

### API·DB·UI·관리·시험
- 제안 API: POST/GET /api/v1/privacy/exports, 개별 조회·취소, POST /:exportId/download-authorizations, GET /:exportId/download. 202 대기, 200 기존 멱등 영수증, 401 reauthentication_required, 403 정책 위반, 404 타인/미존재, 409 요청 해시 충돌·활성 작업, 410 만료·폐기, 413 TOO_LARGE, 416 Range 불가, 429 제한, 503 원천/KMS/마이그레이션 권한 불가. 비공개 no-store/noindex/nosniff, 웹 변경 요청 CSRF, Android 인증 검증, 공개 서명 URL 리다이렉트 금지. DB는 소유자 검증 SECURITY DEFINER 함수만 EXECUTE 허용하고 앱 계정 직접 테이블 DML을 금지한다.
- 스키마는 회원+요청 UUID 유일, 활성 작업 부분 유일, 작업자 lease/세대 fencing, 추가 전용 이벤트, 데이터 종류별 manifest, 다운로드 토큰 해시/소비시각, 폐기 epoch, 객체 버전별 삭제 증빙, (owner_id,created_at DESC,export_id) 인덱스를 명세한다. 번호 충돌 해결 전 새 마이그레이션 번호를 지정하지 않는다. 한 트랜잭션에서 소유자 잠금·24시간 제한·멱등 재생을 검사하며 같은 키·해시 재시도는 취소 후에도 원래 영수증을 반환하되 만료 파일은 재생성하지 않는다.
- 웹·Android 상태는 NOT_REQUESTED, REAUTH_REQUIRED, QUEUED, BUILDING, READY, HOLD, TOO_LARGE, FAILED, EXPIRED, CANCELLED, DOWNLOAD_INTERRUPTED를 구분한다. 320px/44px, 키보드·VoiceOver·TalkBack, WCAG 2.2 AA, 한영 문구·오류 복구 안내를 적용한다. 관리자는 익명 집계·지연·오류 코드만 열람하며 원본 회원 ID·파일 내용은 보지 않는다. 비공개 화면 SEO 색인 금지, 공개 개인정보처리방침만 안내한다.
- KPI는 데이터 종류별 완전성 통과율, 스냅샷 중단, 생성 p95, 사용자 선택 해시 검증, 다운로드 중단, 600초 재인증 차단율, 삭제 증빙 지연, 타인 접근 0건·원장 변동 0건이다. 개인별 파일 내용이나 이용 행동을 제3자 분석에 전송하지 않는다.
- 수용시험(아직 미실행): 격리 PostgreSQL 17의 합성 10,001건, 멱등 동시 100건, 위조 소유자/세션 100건, 다운로드 중단 50건, 삭제·복원·작업자 경합 30건, 재인증 599/600/601/899/900초 경계 30건, 페이지 수집 중 변경 30건, 25MiB ±1바이트와 압축 전 제한, KMS 장애, 해시 변조, 서명키 회전, 객체 복원, 웹·Android 동등성, WLD 분개 0건. #1878 마이그레이션 해결 후에만 추가형 스키마·기본 OFF를 고려하고, 독립 외부 복원과 공식 Test 정확 SHA 인증 E2E·운영승격·롤백 증빙 전에는 Production HOLD.

### P0/P1 개발 인계
- P0 REPO1470-01: 과거 브랜치 462개와 SHA 보존·대조(#1663), 파괴적 정리 금지.
- P0 SEC1470-02: SQL 303개 중 291~295 번호 충돌·과거 체크섬 5개·audit_logs TRUNCATE 권한 해결(#1878/#1880/#1881), 적용된 SQL 변경 금지.
- P0 FIN1470-03: MINT 18,000 WLD와 국고 직접 연결 552건 출처 검증(#1816), 기획에서 금융 데이터 수정 금지.
- P0 REL1470-04: 독립 복원·공식 Test 정확 SHA 인증·CI/보안/경로 증빙·서명된 운영승격/롤백 게이트.
- P1 EXPORT1470-05: 600초 전용 재인증·세션 결속·소유권·웹/Android 가드 시험.
- P1 EXPORT1470-06: 데이터 레지스트리·스냅샷 시점·완전성 manifest·마스킹·서명 오프라인 검증.
- P1 EXPORT1470-07: 봉투 암호화·작업자 fencing·멱등 영수증·취소·삭제 증빙.
- P1 EXPORT1470-08: NestJS/Next.js/Android API·1회용 비재개 스트림·실패 상태.
- P1 EXPORT1470-09: 회원 UI·접근성·관리자 최소 통계·법적 안내·SEO·KPI.
- P1 EXPORT1470-10: 실제 격리 PostgreSQL·악용/경합/복원 회귀·정확 SHA Test·롤백 증명.
- 외부 독립 레퍼런스 신규 중복 제거·검증 승인 0건, 누적 UNKNOWN / 10,000건. 근거 게이트 BLOCKED / IN PROGRESS이며 목표 달성을 주장하지 않는다. 이번 회차는 기획 문서만 변경하며 런타임·DB·WLD·Test·Production은 변경하지 않는다.

## v1468 / F675-173 — 회원 본인 전용 검증형 개인정보 내보내기 (기능 추가 / 초안 / 운영 보류)

**기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1877 (병합·배포 보류).

**주기:** 이전 기능 보완 v1466 → 현재 기능 추가 v1468 → 다음 기능 보완 v1470(잠정). **기준:** 2026-10-29 18:06 KST 최신 원격 main 9ebc5613845ba2e8179a0051e86db996593c8a19, 완료 QA v1369 FAILED/HOLD. **개발 인계:** GitHub 이슈 #1876. 기획일 뿐 실제 구현·법적 충족·운영 인증이 아니다.

### 기존 코드와 설계 판단
- Next.js account/privacy/page.tsx는 개인정보 권리 요청 접수·목록만 제공한다. NestJS privacy.controller.ts는 privacy/requests GET/POST만 제공하며, privacy.repository.ts의 요청 유형은 열람·정정·처리제한·동의철회·삭제, 상태는 received뿐이다. privacy.service.ts에는 파일 생성·외부 전송·계정 변경을 하지 않는다고 명시되어 있다. 조사한 main에서 검증된 다운로드 파일, 본인 전용 내보내기 작업, Android 동등 기능을 확인하지 못했다.
- 기존 열람 요청이 자동 내보내기로 법적 처리 완료됐다고 표시하지 않는다. 수동 요청과 관리자 검토는 별도로 유지한다. 자동 파일은 승인된 데이터 일부를 제공하는 선택적 서비스이며 전체 개인정보 열람의 법적 완결성을 보장하지 않는다. WLD·원장·세금·계정·동의 기록을 수정하거나 송금하지 않는다.
- 브라우저가 여러 API를 직접 조합하는 방식은 타인 정보 유출·출처 누락 위험으로 제외한다. 이메일 첨부 파일은 통제 불가능한 사본을 생성하므로 제외한다. 공개 객체저장소 서명 URL은 본인 재인증·철회 우회를 만들 수 있어 제외한다. 서버가 통제하는 암호화 파일과 짧은 유효기간의 동일 출처 다운로드를 채택한다.

### 목적, 대상, 권한, 진입점, 화면과 상태
- 목적은 로그인한 적격 회원이 본인 데이터 중 승인된 범위의 사본을 직접 요청하고 포함 범위와 생성 근거를 확인하는 것이다. 비회원은 로그인 안내만 표시한다. 정지·삭제 진행·소유권 미확인 계정은 기존 수동 열람 절차를 이용하며 민감 정보를 부분 노출하지 않는다.
- 계정 → 개인정보 센터 → 내 데이터 내보내기 → /account/privacy/export. 파일에 포함되는 정보·제외 정보·생성 시간·만료·법적 열람 요청과의 차이를 설명한다. 기본 해제된 명시적 동의 체크 후 '내보내기 요청', '진행 상태 새로고침', READY 상태에서 '본인 확인 후 다운로드', 만료 시 '새로 요청', 오류 시 '개인정보 문의' CTA를 제공한다. 취소된 작업은 되살리지 않는다.
- 상태는 NOT_REQUESTED, REAUTH_REQUIRED, QUEUED, BUILDING, READY, FAILED, EXPIRED, CANCELLED, HOLD, DOWNLOAD_AUTH_EXPIRED. 대기·생성·보류를 완료로 표시하지 않는다. 응답 유실 시 RECEIPT_UNKNOWN으로 표시하고 원래 멱등 요청 UUID의 영수증을 조회한다. 새 키로 자동 재시도하지 않는다. 로그아웃·계정 전환 시 메모리의 작업 정보와 다운로드 권한을 즉시 폐기한다.
- 회원당 QUEUED/BUILDING/READY 작업 1개, 최근 24시간 신규 생성 최대 1개, 파일 크기 최대 25MiB, READY 후 최대 7일 보관. 다운로드는 매번 10분 이내 유효한 1회성 인증이 필요하다. 만료·삭제 판단은 서버가 한다.

### 데이터 범위·불변 매니페스트
- 서버 승인 허용목록 v1: 본인 계정·프로필 공개 필드, 본인 동의 선택·개인정보 요청 영수증, 본인 현금/은행 원장 활동, 본인 업무·퀘스트 수행 이력의 읽기 전용 투영. 화면과 manifest.json에 데이터 종류, 원본 함수/테이블 버전, 기준 시각, 행 수, 포함 필드, 제외 사유, schema_version 및 종류별 SHA-256을 표시한다.
- 비밀번호 해시·재설정 토큰·인증 쿠키·세션 ID·OAuth 자격증명·내부 보안/관리자 감사 자료·타인 연락처와 신원·비공개 채팅/상담 본문·미승인 제3자 정보·결제 자격증명·출처 불명 데이터는 제외한다. 임의 SELECT *나 사용자 지정 ID 조인은 금지하고 서버 소유권 함수로 투영한다. 공동 기록의 타인 필드는 비식별 처리하고 제외 이유를 남긴다. 소유권/출처를 증명하지 못하면 제외 이유를 남기거나 HOLD로 중단한다.
- UTF-8 JSON과 manifest.json을 담은 결정적 ZIP 형식, UTC ISO-8601, WLD 금액은 문자열, 파일명은 고정 허용목록, CSV 수식·HTML 실행 콘텐츠 없음. 매니페스트의 파일별 해시와 전체 ZIP SHA-256, 서명키 버전을 기록한다. 해시는 무결성 검증이며 법적 완전성 보증이 아니다. 영수증은 회원·export_id·스키마·데이터 기준 시각·파일 해시·만료·상태에 결합하며 개인정보 본문은 저장하지 않는다.

### API·인증·웹·Android
- 신규 NestJS 제안 API: POST /api/v1/privacy/exports ({requestId: UUID, selectedClasses: 승인된 enum[]}), GET /api/v1/privacy/exports?limit=20, GET /api/v1/privacy/exports/:exportId, POST /api/v1/privacy/exports/:exportId/cancel, POST /api/v1/privacy/exports/:exportId/download-authorizations, GET /api/v1/privacy/exports/:exportId/download. 실제 경로는 개발자가 계약·route-map을 검증한다.
- Next.js account/privacy/export의 Server Action/BFF와 동일 출처 인증 스트리밍을 사용한다. INTERNAL_API_TOKEN·저장소 경로·암호화 키를 브라우저·CDN에 전달하지 않는다. Android app-api는 동일 상태와 소유권을 유지하되 브라우저 CSRF 쿠키 대신 앱 전용 인증을 쓴다. 생성/취소/다운로드 권한 발급에는 SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard와 10분 이내 재인증이 필요하다. 다운로드 직전 현재 세션·소유자·계정 상태·재인증·만료·파일 해시·1회성 권한을 원자적으로 재검증한다. 공개 서명 URL은 금지한다.
- HTTP: 202 대기, 200 기존 멱등 영수증, 400 입력 오류, 401 세션 없음, 403 권한/재인증 불충족, 404 타인/미존재 동일 응답, 409 동일 키 다른 본문 또는 활성 작업 충돌, 410 권한 만료/철회, 413 파일 상한, 429 요청 상한, 503 KMS/저장소/작업자/근거 미확인. Cache-Control private,no-store, X-Robots-Tag noindex, 첨부 다운로드 Content-Disposition, application/zip, nosniff, 민감 리다이렉트 금지. 비소유자 응답은 내용·시간 차이를 최소화한다.

### PostgreSQL 제약·인덱스·트랜잭션·작업자
- 기존 적용 SQL 수정 없이 연속된 다음 번호의 신규 마이그레이션 제안. privacy_export_jobs(export_id UUID PK, owner_id UUID FK users, request_uuid UUID, request_digest bytea, classes_version integer, selected_classes 검증 jsonb, 상태 enum, created/started/ready/expires/finished, lease_until, attempt_count, artifact_ref 불투명 참조, artifact_sha256, manifest_sha256, failure_code 허용목록, generation bigint). UNIQUE(owner_id,request_uuid), 활성 상태 부분 UNIQUE(owner_id), (owner_id,created_at DESC,export_id) 조회 인덱스, (status,lease_until,created_at) 작업자 인덱스, 상태별 시각·해시 32바이트 CHECK. 개인정보 본문·ZIP 바이트를 DB에 저장하지 않는다.
- privacy_export_events는 불변 전이·행위자 유형·요청 해시를 저장한다. privacy_export_download_grants는 1회성 토큰 해시·세션 결합 해시·10분 만료·사용 시각·generation을 보관한다. privacy_export_purge_receipts는 파일 삭제 시각·객체 버전 지문·독립 확인 지문을 남긴다. 감사 최소 정보 보존 기간은 별도 검토한다.
- 본인 전용 SECURITY DEFINER 생성/목록/상태/취소/권한발급/소비 함수만 앱 계정에 EXECUTE를 허용한다. 테이블 직접 읽기/쓰기와 PUBLIC EXECUTE는 명시적으로 회수한다. SQL의 p_actor 매개변수만으로 인증됐다고 간주하지 않으며 서비스에서 검증된 세션·Bearer로 결정한다. (회원,요청 UUID) 자문 트랜잭션 잠금 → 재생 영수증·본문 해시 확인 → 회원 잠금·활성 작업 상한 검증 → 상태 변경 순서를 고정한다. 작업자는 SKIP LOCKED와 만료 임대, generation 비교로 지연 완료가 취소·만료 작업을 READY로 되살리지 못하게 한다. 임시 암호화 객체를 완성·검증한 뒤에만 원자적으로 READY와 해시를 기록한다. KMS/쓰기 실패 시 READY 금지.
- 만료·취소 후 삭제 작업자가 암호화 객체를 삭제하고 독립 삭제 영수증을 기록한다. 백업·복원 과정에서 만료된 파일이 부활하지 않아야 한다. 법적 보존·삭제 요청 시 해당 내보내기 작업을 보류/취소하며 원본 기록을 자동 삭제하지 않는다.

### 관리자·보안·SEO·모바일 접근성·분석
- 관리자는 상태별 건수·소요시간·오류 코드·삭제 지연·보류 사유만 확인한다. 파일 내용·다운로드 대리 실행·회원별 파일 링크는 제공하지 않는다. 예외 보존에는 2인 승인과 불변 감사가 필요하다. 분석/로그에 개인정보·토큰·파일명·URL·매니페스트 필드 값을 넣지 않는다. KMS와 접근 로그는 별도 보호한다.
- 개인 화면 noindex/nofollow, 사이트맵 제외, SSR 공유 캐시 금지, CSP·Referrer-Policy 강화. 320px, 44px 조작부, 키보드 포커스, aria-live 상태 안내, 색상·카운트다운만으로 만료 전달 금지, 한/영 문구 동등, TalkBack/VoiceOver, WCAG 2.2 AA. 공개 SEO는 개인정보 안내문에 한정하며 개인 파일 페이지 색인 금지.
- KPI는 생성 READY p50/p95, 인증된 다운로드 성공률, 취소율, HOLD/503 비율, 파일 삭제 지연 p95, 타인 접근 성공 0, 유출 URL 0, WLD·원장 변화 0. 회원별 다운로드 행태는 외부 분석에 전송하지 않는다.

### 수용시험·무중단 배포·롤백·백로그
- 격리 PostgreSQL 17에서 합성 10,001행, 동일 키 동시 100요청은 작업 1개·동일 영수증, 타인 권한 위조 100건 정보 0, 다운로드 중단 50건 다른 권한 소비 0, 만료·취소·작업자 경합 30건 READY 부활 0, 로그아웃·계정 변경 30건 차단, 25MiB 경계, KMS 장애, 해시 불일치, 백업 복원·삭제, 원장 변화 0을 실제 실행해야 한다. 테스트를 기획했다고 통과했다고 주장하지 않는다. 웹/Android·공식 Test exact-SHA 인증 E2E 필요. 운영 개인정보를 테스트 데이터로 사용하지 않는다.
- 기능 스위치 기본 OFF, 추가형 마이그레이션, 격리 작업자, 파괴적 소급 변경 없음. 데이터 종류·보존 기간의 독립 개인정보/법무 검토, KMS·외부 백업 복원, DB 권한 회귀, 이미지/소스 SHA, 공식 Test E2E 후 GitOps 운영승격. 소수 적격 회원 카나리에서 개인정보 누출을 감시한 뒤 확대한다. 롤백은 신규 요청·다운로드 차단, 발급 권한 취소, 감사 보존, 보류 검토 후 파일 안전 삭제이며 기존 개인정보 요청·원장·테이블을 파괴하지 않는다.
- P0: REPO1468-01 과거 브랜치 보존(#1663), FIN1468-02 MINT 18,000 WLD·국고 미연결 552행(#1816), SEC1468-03 깨끗한 PG의 채팅 신고 오류(#1874)·마이그레이션 체크섬 5건·운영자 승인 기존 금융 권한, REL1468-04 독립 복원·공식 Test exact-SHA·빌드만으로 자동병합 금지(#1088). P1: EXPORT1468-05 스키마/매니페스트, EXPORT1468-06 작업자/멱등성, EXPORT1468-07 API/웹/Android, EXPORT1468-08 화면/a11y, EXPORT1468-09 관리자/개인정보/KPI, EXPORT1468-10 실제 PG/보안/롤백.
- QA v1369: HTTP 48/50(의도된 404 2건), 모바일 36/36, 대상 테스트 48/48 및 보안 24/24 PASS, route-ledger CLI 근거 누락 FAIL, 의존성 감사 Moderate 1건, 체크섬 불일치 5건, 개발 원장 산술 차이 0이나 MINT 자금 출처 미검증, 열린 Draft PR 147개·충돌 58개. 기존 Production v1502는 본 기능 배포가 아니다. 외부 독립 중복제거·검증 승인 신규 0건, 누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 문서 전용 초안, 운영승격 HOLD.

## v2026.10.29.1419 — 검증된 블로그 전용 2시간 자동 발행

- 기존 국가/언어 KR·US·JP·CN 및 경제·코딩·컴퓨터 자동 게시 기능은 소스와 DB 기능이 있었으나, v1213 운영 전역 스케줄러 OFF·구 서비스 블로그 게시 플래그 OFF로 실제 공개 0건. 경제 스케줄러 중복 활성화 없이 전용 예약 작업자 구성.
- 공식 출처 직접 조회/로컬 AI 작성/원어·품질 검증/기간별 SQL 발행 영수증 재사용, PostgreSQL 잠금으로 중복 작성 방지. 2시간 구간 내 재시도만 가능하고 이미 발행되면 즉시 생략. JSON 구형 API 재사용 금지.
- 사람 사전 승인 불필요, 기한 자동 비공개 없음. 관리자 수동 수정/철회/삭제 가능. 미검토 자동 생성 글 Google 광고 제외. 검증 실패 글은 공개하지 않으며 작업 시작만으로 게시 성공이라고 하지 않음.
- [내부 업데이트](../updates/v2026.10.29.1419-internal.ko.md) · [GitHub](../updates/v2026.10.29.1419-github.ko.md) · [실제 작업 기록](../worklog/2026-10-29-blog-automatic-v1419.ko.md).


## v2026.10.29.1213 — 실제 운영 승격 완료 / 금융 권한 승인 유지

- **운영 적용 완료:** easy-scraping.com, 불변 릴리스 v2026.10.29.1213, 코드 SHA b44ffd0af9e2bd6e7c2be7345b72094827078c3d. PR #1817 병합·원본 후보 CI 성공·정확한 SHA 공식 Test 검증. 이후 다른 작업자가 올린 main QA/문서 코드는 이번 실행 앱 SHA와 구별.
- 운영 DB를 격리 복원하고 누락된 23개 SQL 전부 리허설한 다음 **실제 PostgreSQL에 적용**. 기록 270→293개(최신 294), 계정 40·원장 거래 891·분개 1,829 불변. 승인된 기존 금융 핵심 3개 쓰기 권한 유지, 임의 분개/국고 중복 지급 없음.
- 기존 서비스 계속 실행하면서 새 서비스 검증→Nginx 전환→정식 불변 v1213 서비스 재전환, production-current 적용. 정확한 운영 SHA 식별 검사 PASS, 운영 17/17 경로 HTTP 200, 로그인 세션 1884건 유지, 최근 서비스 ERROR 0.
- **잔존 이력:** 기존 SQL 체크섬 5개(219/220/221/234/266), 특히 219/220 원본 미확보. 과거 국고 지급 영수증·실제 브라우저 인증 쿠키 재사용은 이번 검사로 독립 입증하지 못함. 금융 진단기 원본 BLOCKED의 세 항목은 운영자 승인 기존 DML 권한이며 사실 그대로 기록.
- [내부 기록](../updates/v2026.10.29.1213-internal.ko.md), [영어](../updates/v2026.10.29.1213-internal.md), [GitHub](../updates/v2026.10.29.1213-github.ko.md), [작업 로그](../worklog/2026-10-29-production-promotion-v1213.ko.md).


## v2026.10.29.1212 — 기존 금융 쓰기 권한 운영자 승인 / 공식 Test 성공 / 운영 이력 확인 대기

- 기존 accounts, account_balances, system_treasury_vaults에 부여된 쓰기 권한은 운영자가 명시적으로 승인하여 유지한다. 해당 세 권한만으로 반복 중단하지 않음. 원장·체크섬·인증 Test/세션·무중단 승격은 별도 검증.
- PR #1817을 main b44ffd0a에 통합, 동일 트리 후보 CI 성공, 공식 Test 291~294 및 정확한 앱 SHA 검증 성공. 이후 QA 작업자가 갱신한 main a1d8de0c는 이전 Test 인증과 구별.
- 운영 DB 사본에서 누락된 SQL 23개 모두 시험 적용 성공, 계정 40·거래 891·분개 1,829 및 승인 금융 권한 유지. 기존 체크섬 5건 불일치(219/220 원본 미확보). 운영용 파일 준비만 완료, 실제 운영 DB/서비스 미변경.
- 세부 기록: docs/updates/v2026.10.29.1212-internal.ko.md 및 docs/worklog/2026-10-29-finance-dml-approval-and-release-v1212.ko.md.


## v2026.10.29.1364 — 예약 QA 전용 임시 산출물 수명주기 보완 (운영 패치 후보)

- 2026-10-29 11:00 KST 예약 정리 실행은 성공했지만 대상 폴더 0개, 삭제량 0바이트였습니다. 기존 예약 QA가 정리 대상 폴더에 산출물을 생성하지 않아 실제 용량을 회수하지 못하는 구조입니다. 이전 작업을 실제 용량 확보로 표시하지 않습니다.
- 매시간 QA에서 민감정보 없는 임시 결과를 QA 전용 디렉터리 안에 완료 표시와 함께 기록합니다. 기존 72시간 보존·소유자/심볼릭링크·실행당 20건/2GiB 제한을 그대로 적용하며 0개 대상과 실제 삭제량을 구분해서 보고합니다. 디스크가 90% 이상이면 경고만 표시하며 타인의 작업물, QA 영구 증적, 데이터베이스, WAL, 백업, 릴리스, 업로드는 삭제하지 않습니다.
- 독립 브랜치 단위 테스트, 테스트 서버, 백엔드 읽기 전용 확인, QA 스케줄러 스테이징, 실제 삭제 검증 이후 예약 QA 스크립트만 교체합니다. 전수 로그인/금융 기능 QA 완료로 간주하지 않습니다. [작업기록](../worklog/2026-10-29-qa-hygiene-v1364.ko.md).

## v1448 / F675-168 — 검증된 블로그 글 회원 전용 나중에 읽기 (기능 추가 / 초안 / 운영 보류)

**개발 인계:** [Draft PR #1801](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1801) / [Issue #1800](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1800). Documentation only, RELEASE HOLD.

**기준과 주기.** 이전 기능 보완 v1446 → 현재 기능 추가 v1448 → 다음 기능 보완 v1450(잠정). 시작 main f05efcb5d7c21d9553f68df227f9771217a30671 및 중간 main 8ba355374a2553926f67140febbf85c114f00ba1을 확인(implementation_plan.md만 변경)했고 QA v1359는 FAILED/HOLD다. 구현·배포된 기능이 아닌 개발 인계용 기획이다. GitHub 이슈 #1800에 P0/P1을 연결한다. 신규 독립 기획 파일을 만들지 않는다.

### 실제 소스 확인 및 중복 방지
- Next.js 블로그 본문에는 공유하기 버튼이 있으나 회원별 저장·해제 CTA가 없다. BlogPost에는 slug, country, PUBLISHED/WITHDRAWN, 선택적 verificationReceipt가 있으며 공개 검증 API는 PUBLISHED 글과 영수증을 반환한다. 조사한 범위에서 회원 전용 저장 API·DB 테이블·Android 계약은 없다. GitHub 검색에서 동일 블로그 읽기 목록 이슈를 찾지 못했다. 게시판 읽기 목록 이슈 #1086은 별개 기능이다.
- **추가 소스 위험:** 마이그레이션 288은 blog_verified_articles의 receipt UUID와 앱 계정 직접 SELECT 권한을 만들고, 290의 REVISE는 본문·content_digest를 바꾸면서 기존 receipt를 유지한다. 게시 코드의 evidence.humanReviewRequired=false이므로 영수증 존재만으로 독립 사람 검토나 불변 콘텐츠 개정을 증명할 수 없다. 신규 개정·epoch·독립 검토 근거와 호환 SECURITY DEFINER 읽기를 먼저 구현한 뒤 기존 SELECT 권한을 단계적으로 회수해야 한다. QA v1359에서 288~290은 적용 목록, 278/279는 미적용 목록이므로 마이그레이션 의존성·정합성을 별도 검증한다.
- 블로그 편집 기반 마이그레이션 278/279는 QA v1359 기준 미적용 20건에 포함된다. 정적 글이나 AI 생성 콘텐츠를 독립 검토된 근거로 간주하지 않는다. 자격 조건은 승인된 출처, 불변 게시 영수증, 검토된 게시 개정 및 서버 게시 레지스트리다. 이를 증명할 수 없으면 저장 버튼을 비활성화하고 성공을 꾸미지 않는다.
- 브라우저 localStorage만 쓰는 대안은 기기 간 동기화·삭제·철회 무결성을 보장하지 못하므로 제외한다. 자동 읽음 추적도 개인정보와 오인 가능성 때문에 제외하고 명시적 회원 동작만 허용한다.

### 목적, 대상, 진입점과 화면 상태
- 목적은 회원이 독립 검증된 경제·코딩·컴퓨터 글을 명시적으로 저장해 웹·Android에서 이어 읽는 것이다. 비회원은 공개 글을 읽을 수 있지만 저장하려면 로그인해야 하며 로그인 전 성공으로 표시하지 않는다.
- 공개 진입점은 /blog/[slug]와 기존 ko/en/ja/zh 국가별 글 경로다. 검증된 글에서만 **나중에 읽기** / **목록에서 제거** CTA를 제공한다. 개인 목록 /account/reading/blog는 계정 메뉴와 저장 완료 화면에서 연결한다. 제목, 언어·국가, 검토된 콘텐츠 개정, 저장일, 사용자가 직접 설정한 읽음 상태 및 열기/제거 CTA를 보여준다. 계정 간 캐시 재사용은 금지한다.
- 상태: GUEST_SIGN_IN_REQUIRED, INELIGIBLE_UNVERIFIED, READY_UNSAVED, SAVING, RECEIPT_UNKNOWN, SAVED_VERIFIED, UNSAVING, READ_MARKING, CONTENT_REVISED_REVIEW, WITHDRAWN_TOMBSTONE, EMPTY, OWNER_CONFLICT_409, RATE_LIMIT_429, SOURCE_UNVERIFIED_503, ERROR. 타임아웃은 성공이 아니라 RECEIPT_UNKNOWN이며 영수증 조회 후 같은 요청 UUID로 재시도한다. 철회 글의 본문 링크는 숨긴다.
- 회원당 활성 저장 최대 100건, 페이지당 20건, 서버 저장시각 내림차순과 UUID 보조 정렬. 읽음/읽지 않음은 명시적 수동 변경만 허용한다. 저장은 학습 완료·정확성 보증·투자 권유가 아니다. WLD, 퀘스트, 광고 노출, 추천 보상, 공개 인기도, 알림 및 금융 원장과 완전히 분리한다.

### 게시 근거 및 불변 식별자
- slug는 URL 별칭일 뿐 불변 식별자가 아니다. 서버가 승인한 article UUID, 언어(ko|en|ja|zh), 국가(KR|US|JP|CN), 게시 개정, 출처 증빙 참조, 검토 콘텐츠 SHA-256, 검증 영수증 UUID, 게시 시각, 게시 epoch, PUBLISHED|WITHDRAWN|REVOKED 상태를 권위 레지스트리에 유지한다. 독립 검토된 PUBLISHED 개정만 저장 가능하며 클라이언트 slug/영수증/제목만으로 권한을 부여하지 않는다.
- 정적 글과 검증 글이 같은 slug를 사용하면 검증 게시 ID를 우선 확인하고 정적 글로 자동 연결하지 않는다. 개정이 바뀌면 회원에게 변경 사실을 표시하고 재확인받는다. 철회·취소된 글은 다시 열지 않는다. 철회 후 재게시에는 새 epoch·영수증이 필요하며 과거 저장을 자동 부활시키지 않는다. 권위 출처 오류나 서버 장애는 503으로 실패 차단한다.

### PostgreSQL 소유권, 제약, 트랜잭션
- 개발 예약에서 별도 신규 마이그레이션으로 blog_publication_registry(게시 UUID·언어·국가·개정·SHA·근거·영수증·epoch·상태·독립 검토자·시각), blog_member_reading_items(회원·게시 UUID·언어·저장 개정·epoch·저장일·선택적 읽음일·CAS 버전), blog_reading_operation_receipts(회원·요청 UUID·작업·정규 요청 해시·불변 결과·시각)를 제안한다. 게시 ID+언어+개정 및 영수증 유일성, 회원+게시 ID+언어 복합 PK/FK, 회원·저장일·UUID 키셋 인덱스, 상태·언어 CHECK, 변경 불가 감사 제약을 둔다. 영수증에 본문·민감정보를 저장하지 않는다.
- 목록/저장/해제/읽음/영수증 조회는 PostgreSQL SECURITY DEFINER 함수로 구현한다. 앱 계정에는 EXECUTE만 부여하고 직접 테이블 DML/SELECT를 주지 않는다. 회원 신원은 검증된 세션 또는 Android bearer에서 도출해야 하며 SQL p_actor만으로 인증됐다고 보지 않는다. 회원 잠금 → 게시 레지스트리 잠금 순서를 고정해 100건 제한과 철회 경합을 원자적으로 처리한다. 오래된 게시 개정은 409로 거부한다.
- 동일 요청 UUID+동일 정규 내용은 최초 영수증을 반환하고 다른 내용 재사용은 409로 거부한다. 해제·읽음 변경에는 본인 행과 CAS 버전이 필요하다. 개인 목록 커서는 회원·정렬·필터·만료를 HMAC으로 결합하고 위조·다른 회원·만료 커서는 422로 거부한다. 금융 테이블·기존 마이그레이션·PUBLIC 은행 권한을 수정하지 않는다.

### API·관리자·보안·SEO·접근성·KPI
- NestJS 회원 인증 API /api/v1/blog/reading-queue: GET 목록(limit<=20,cursor), POST /items(게시 ID·언어·기대 개정·requestId), DELETE /items/:publicationId(언어·요청 UUID·기대 버전), PATCH /items/:publicationId/read(언어·읽음 여부·요청 UUID·기대 버전), GET /operations/:requestId(영수증 복구). Next.js는 기존 server-only 내부 API 경로를 이용하고 Android는 /app-api/v1 프록시로 동등한 DTO·상태코드를 제공한다. 웹 CSRF, Android bearer, 회원/IP별 제한, no-store를 강제한다. 200/201 검증 영수증, 400 형식, 401 미로그인, 403 권한, 404 소유 항목 없음, 409 개정·멱등 충돌, 410 철회, 422 언어·커서, 429 제한, 503 게시 권위/DB 검증 실패를 구분한다.
- 관리자는 게시 철회·감사·개인정보를 제거한 집계만 처리하며 다른 회원의 비공개 목록을 임의 조회·대리 저장하지 못한다. 기존 단일 슈퍼관리자 권한을 따른다. 회원 삭제 시 목록·작업 영수증을 권한 있는 함수로 삭제하고 백업 보존기간을 문서화한다. 저장 해제 후 최소 tombstone은 30일 뒤 만료하며 활성 저장은 회원 제거/계정 삭제까지 보존한다. 본문 스냅샷은 저장하지 않는다.
- 공개 글의 canonical/hreflang/robots는 기존 검증 게시 정책을 유지한다. 개인 목록은 noindex/nofollow/no-store, 사이트맵·공개 OG 제외. WCAG 2.2 AA: 키보드, aria-pressed, 포커스 복귀, role=status 영수증, 320px, 200% 확대, 동작 감소, TalkBack, 4개 언어의 검토된 문구를 요구한다.
- KPI는 검증 게시 글 수, 명시적 저장 사용자 수, 영수증 성공률, 409·503 비율, 목록에서 열기, 자발적 제거, 철회 노출 억제 지연이다. 개인정보 보호된 집계만 허용하고 자동 읽음 추적·광고 타깃팅·가짜 참여 수치는 금지한다.

### P0/P1 개발 백로그, 수용시험 및 운영 차단
- P0 ENV1448-01: 루트 99%, 데이터 99%(이번 작업 중 100% 측정), 타 작업 자산 삭제 금지, 외부 암호화 백업 독립 복원. P0 FIN1448-02: QA v1359 회원 18계좌 +18,000 WLD 불일치, 임의 조정 금지, 기능 원인 WLD 변화 0 검증. P0 SEC1448-03: 앱 직접 쓰기 239개 관계, PUBLIC 은행 함수 3개, 체크섬 불일치 5개, 미적용 20개(블로그 278/279 포함), 최소 권한·게시 근거 확인. P0 REL1448-04: 정확 main 전체 CI, 공식 Test 정확 SHA 인증 DB/API/웹/Android E2E, 승인된 무중단 운영승격·롤백 증빙.
- P1 BLOG1448-05: 검증 게시 레지스트리·DB 제약/인덱스. BLOG1448-06: 본인 전용 원자적 트랜잭션·영수증. BLOG1448-07: NestJS/Next/Android 인증·계약 동등성. BLOG1448-08: 웹·모바일 화면과 접근성. BLOG1448-09: 관리자·개인정보·SEO·KPI. BLOG1448-10: 격리 실제 PostgreSQL 회귀·롤백. 합성 10,001건, 동시 저장/해제/읽음 100건, 타인 회원·CSRF·UUID·커서 위조 100건, 철회·재게시·개정·언어 충돌, 계정 전환, 320px/TalkBack, 원장 변화 0건을 검증해야 한다. 아직 시험을 실행하지 않았다.
- 기능 플래그 기본 OFF, 승인된 추가형 마이그레이션과 이전/신규 코드 공존, 공식 Test 정확 SHA 검증 후 승인된 배포만 허용한다. 실패 시 신규 쓰기를 차단하고 영수증을 보존한 채 롤백한다. 기획 예약은 Test/Production이나 런타임을 변경하지 않는다. 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000, BLOCKED / IN PROGRESS이며 달성으로 주장하지 않는다.


## v1446 / F675-167 — 금융 용어 퀴즈·보상 퀘스트 격리 및 영수증 무결성 보완 (기능 보완 / 기획 초안 / 운영 보류)

**개발 인계:** [Draft PR #1794](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1794) (선행 #1790/#1784/#1780), [이슈 #1789](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1789).

**주기·기준.** 이전 기능 추가 v1444 → 현재 기능 보완 v1446 → 다음 기능 추가 v1448(잠정). 시작·중간 main `35971c600f25869c96f1c666d4b9f58927202730`, QA v1358 FAILED/HOLD. 미병합 #1790의 F675-167을 보완하며 선행 #1784/#1780 의존성을 유지한다. 실제 퀴즈 구현이 아닌 문서 초안이다.

### 실제 코드 충돌과 결정
- `frontend/src/components/daily-economic-quest-station.tsx`는 `quest_financial_quiz`에 **1,000 WLD 보상**을 표시하고 `/#financial-quiz`로 연결하지만, main 프론트엔드 검색에서 대응 앵커 요소는 확인되지 않았다. `backend/src/engagement/dopamine.repository.ts`의 `claimDailyQuest`는 퀘스트 ID와 당일 청구 이력을 검사하지만 확인한 경로에는 **실제 정답 제출·완료 영수증 검증이 없다**. `dopamine.controller.ts`는 저장소가 없을 때 모의 성공 응답을 반환한다. 이는 소스상 위험이지 운영 악용·실제 지급의 입증이 아니다. 보상 정산 문제는 기존 [#1321](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1321)이 담당하며 A/B/C/QA의 코드를 덮어쓰지 않는다.
- F675-167은 별도의 **보상 없는 자발적 교육 퀴즈**이며 `glossary_practice` 네임스페이스만 사용한다. 일일 보상 API `/app-api/v1/engagement/dopamine/daily-quest/claim` 호출, `quest_financial_quiz` 완료 이벤트, `all_clear` 조건 충족, 업적·WLD 지급, 지갑·국고·`ledger_transactions`·`ledger_postings`·`account_balances`·금융 outbox 변경을 **모두 금지**한다. 퀴즈와 보상 청구의 요청 UUID·영수증도 공유하지 않는다. 기존 `/#financial-quiz` 링크를 보상 없는 퀴즈로 조용히 변경하거나 1,000 WLD를 준다고 암시하지 않는다.
- 추후 사용자가 보상 연계를 별도 승인할 때만 신뢰할 수 있는 서버 완료 증빙(회원·퀘스트·날짜·개정), 일회성 적격성, DB 소유 원자적 복식분개, 원장 대사, 악용 방지, 원본 멱등 영수증, 공식 Test·운영승격을 포함하는 **독립 금융 명세**가 필요하다. 본 기획으로 보상 지급이나 과거 소급 지급은 승인되지 않는다.

### 진입점·화면·권한·상태·문구
- 공개 `/guide/glossary` 및 검증된 정규 용어 페이지에는 선택적 **금융 용어 5문항 연습(보상 없음)** CTA만 제공한다. 비회원은 시작 없이 로그인 안내, 인증된 동의 회원은 `/account/learning/glossary/practice`에서 `ko|en|ja|zh`를 선택하고 명시적으로 시작한다. 언어별 승인된 서로 다른 금융 용어 5개, 각 4개 선택지, 건너뛰기, 30분 만료, UTC 기준 최근 24시간 시작 10회, 언어당 활성 시도 1개, 비공개 기록 90일 보존. 읽음·학습성취 자동 표시 금지, 0~5점은 투자능력 인증이 아니다.
- 상태: SIGN_IN_REQUIRED, UNAVAILABLE_NO_APPROVED_BANK, READY, STARTING, IN_PROGRESS, SUBMITTING, RECEIPT_UNKNOWN, SUBMITTED_VERIFIED, EXPIRED, REVOKED, CONFLICT_409, RATE_LIMITED_429, SERVER_UNVERIFIED_503, ERROR. 클라이언트 추측으로 성공·점수·보상을 표시하지 않는다. 타임아웃이면 **같은 UUID**로 원본 영수증을 조회하고, 미존재가 확인된 경우에만 동일 페이로드로 재시도한다. 로그아웃·계정 전환은 진행 중 응답·선택지·커서·비공개 캐시를 무효화한다. no-store/noindex, 공개 공유 링크·사이트맵·분석에 개인 결과 제외.
- 키보드 라디오 그룹, 독립 검수한 4개 언어 문구, 320px·200% 확대, 포커스 복구, TalkBack, 상태 알림 영역, 색상 외 정오표시를 보장한다. 만료된 시도는 UI 타이머로 연장하지 않고 할당량 내 새 시도를 안내한다. 별도 보상 일일 퀘스트와 관계없음을 명시한다.

### 문제은행·정답 보안·발행 검증
- **공개 가능한 메타데이터**(문제은행 ID/개정, 언어, 용어 ID, 검수 출처, 콘텐츠 SHA, 실제 배포 SHA)와 **서버 전용 정답 자료**(정답 choice ID, 채점 매핑, 제출 전 해설)를 물리적·권한상 분리한다. 네 가지 선택지나 정답 ID는 경우의 수가 적으므로 단순 해시도 정답 보안을 보장하지 않는다. Next 정적/ISR·Android 번들·CDN·로그·분석·소스맵에 정답, 정답 해시, 채점 분기 또는 관리자 미리보기를 노출하지 않는다. 난독화 대신 서버 최소권한을 적용한다.
- 편집자와 서로 다른 검토자가 언어별 불변 문항 개정, 중복 없는 선택지 4개·정답 1개, 실제 근거와 이용권을 승인한다. 승인 내역을 `term_id`, `term_revision`, `locale`, `bank_revision`, 문항/선택지 지문 및 배포 SHA에 연결한다. 출처·개정·배포가 검증되지 않거나 철회되면 시작을 차단한다. 자기 초안 자기 승인 금지, 외부 URL 허용목록, 회원 입력 임의 URL의 서버 fetch 금지. 철회 후 새 시도·미제출 시도 차단, 이미 확정된 영수증은 당시 개정 그대로 보존한다.

### API·DB·트랜잭션·동시성·오류 계약
- v1444의 비공개 웹/NestJS/Android `/api/v1/guide/glossary-practice` 및 `/app-api/v1/...` 계약을 유지하고 engagement/dopamine 보상 경로와 분리한다. `POST /attempts`: 인증 회원에서 파생한 actor, requestId UUID, expectedBankRevision. `POST /attempts/:id/submit`: 해당 시도의 문항 5개, 서버 발급 선택지 ID 또는 null, requestId UUID, expectedVersion/BankRevision. `GET /receipts/:requestId`는 회원·세션 한정 불변 원본 영수증, 목록은 회원·세션·필터·만료 HMAC 커서. 클라이언트 userId·점수·보상 플래그·정오 여부를 권한으로 신뢰하지 않는다.
- 순방향 추가형 PostgreSQL 설계: 회원+시도 복합 FK, `(user_id,request_id)`에 operation+정규 페이로드 지문 결합, `(attempt_id,position)` 1~5 유일성, 서로 다른 용어 5개, 시작 당시 선택지 순서·문항 개정 불변 스냅샷, 서버 전용 정답 저장. 고정 search_path의 제한된 SECURITY DEFINER, PUBLIC EXECUTE·앱 직접 DML 금지. 회원→시도→문항 순서로 잠금, 최근 24시간 할당량·제출을 직렬화한다. 같은 UUID 다른 내용은 409, 오래된 개정 409, 철회/만료 410, 선택지 오류 422, 할당량 429, 검증 불가능한 은행/배포 503. 저장소나 채점 권위가 없으면 **503 실패 차단**하고 모의 성공·점수를 반환하지 않는다. 채점 결과와 영수증을 한 트랜잭션에 확정하고 동일 재시도에는 원본 영수증을 반환한다.
- 제출 전 정답 추측을 돕는 오류·시간 차이를 방지하고 확정 제출 전 정오 정보 제공 금지. 문항 노출은 회원/IP 속도제한과 서버가 고정한 선택지 순서로 제한하되 접근성 재시도는 부당하게 차단하지 않는다. 관리자의 승인·철회는 최근 재인증·독립 검토·감사 기록이 필요하다. 관리자 KPI는 대상 회원 20명 이상 집계만, 개인 선택 답변은 일반 분석에 넣지 않는다.

### 회귀시험·배포·P0/P1 개발 인계
- **P0 ENV1446-01:** QA v1358 루트 98%(약 2.0GiB), 데이터 99%(약 3.4GiB), `/tmp` 97%. 용량 확보·독립 오프사이트 암호화 백업 복호화/복원 선행, 타 작업자 자료 보존.
- **P0 FIN1446-02:** USER_CASH 18명 총 +18,000 WLD 불일치와 기존 보상 퀘스트 증빙·정산 [#1321](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1321). 교육 퀴즈에서 WLD 보상 호출 완전 차단, 금융 담당자가 별도 원장·적격성 검증. 가짜 분개 금지.
- **P0 SEC1446-03:** 앱 직접 쓰기 239개 관계, PUBLIC 은행 함수 3개, 체크섬 불일치 5개/미적용 20개. 회원 권한·서버 전용 정답·저장소 부재 503 실패 차단 검증, 기존 마이그레이션 수정 금지.
- **P0 REL1446-04:** main runtime CI SKIPPED, 공식 Test SHA `cfb13272...`가 main과 불일치, 운영 버전 unknown. 정확 HEAD 전체 CI·격리 실제 PG·인증 Test exact-main E2E·백업/롤백·승인 GitOps 필수. 빌드 성공만으로 병합·운영승격 금지.
- **P1 QUIZ1446-05:** 문제은행·용어·배포 개정, 서버 전용 정답 분리, 독립 검토·철회, 공개 manifest의 약한 정답 해시 금지.
- **P1 QUIZ1446-06:** PostgreSQL 회원 복합 FK·5개 불변 스냅샷·24시간 한도·원자 채점/영수증·동시 UUID 재시도·잠금 순서.
- **P1 QUIZ1446-07:** NestJS·Next·Android API/DTO·no-store 회원 영수증 동등성, 503/409/410/422/429, 세션·CSRF·앱 bearer 음성시험.
- **P1 QUIZ1446-08:** 보상 없는 별도 CTA, 기존 일일 퀘스트 앵커 #1321 검토, 4개 언어 접근성, 계정 전환·타임아웃 복구.
- **P1 QUIZ1446-09:** 독립 관리자 편집·심사·철회 감사, 개인정보 삭제, SEO·집계 KPI, 정답 오라클·스크래핑 방지.
- **P1 QUIZ1446-10:** 격리 실제 PG 합성 시도 10,001건, 동시 시작/제출 100건, 타인/CSRF/UUID 위조 100건, 저장소 부재·정답 유출·철회·ISR·30분 만료·원본 영수증·일일 퀘스트 완전 격리 및 **연습 기능에 의한 WLD/원장 변화 0** 검증. 동시 다른 금융 활동이 있는 운영 총합이 아니라 격리된 통제 시험으로 입증한다.
- 기능 플래그 기본 OFF, 롤백 시 새 시작·제출 차단과 기존 영수증 보존, 파괴적 DB 작업 금지. 구현은 개발 담당의 별도 브랜치·정확 SHA Test 게이트·승인 후 진행. QA v1358의 공개 HTTP 50/50·모바일 36/36 통과는 회원 인증 퀴즈·금융 E2E 통과가 아니다. 운영승격 보류.

**외부 독립 근거 게이트:** 신규 중복제거·검증 승인 **0건**, 누적 **UNKNOWN / 10,000**, **BLOCKED / IN PROGRESS**. 용어·문항·GitHub 이슈·합성 기록·발행기관 수는 승인된 외부 독립 근거 수가 아니다. 이번 결과는 기획 초안이며 구현·배포가 아니다.


- 개발 연계: [이슈 #1789](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1789); [Draft PR #1790](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1790). 미병합 #1784 / #1780 후속이며 운영 미승격.

## v1444 / F675-167 — 검증 가능한 금융 용어사전 자가점검 퀴즈 (FEATURE ADDITION / DRAFT / RELEASE HOLD)

**기준과 사이클.** Previous Feature Improvement v1442 → Current Feature Addition v1444 → Next Feature Improvement v1446(잠정). 원격 main 35971c600f25869c96f1c666d4b9f58927202730을 시작·중간에 확인했고 QA v1357(05:20 KST)은 FAILED/HOLD이다. 이 문서 전용 기획은 미병합 #1784(그 선행 #1780)에 쌓이는 초안이며, 실제 구현·배포가 아니다. 선행 기획의 콘텐츠 레지스트리가 main에 이미 존재한다고 가정하지 않는다.

### 목적·대상·실제 코드·대안
- main의 frontend/src/config/pseo-glossary.config.ts는 정적 금융 용어 50개를 공개하며, frontend/src/app/guide/components/glossary-search.tsx에는 별도 시스템 용어 12개가 있다. 한국어와 en/ja/zh 용어 페이지의 ISR은 86400초다. 확인한 frontend/backend/DB 마이그레이션에는 용어별 퀴즈, 승인된 문제은행, 점수 영수증, 본인 전용 시도 API 및 대응 테이블이 없고 GitHub 용어 퀴즈 이슈 검색에도 동일 과제가 없었다. 이는 조사 범위 내 발견이며 모든 배포의 절대적 부재를 증명하지 않는다.
- 목적은 초보 회원이 PER/PBR/ROE 등 금융 개념을 **자발적으로 5문항 자가점검**하고, 검토된 해설과 원본 개정번호를 확인하도록 하는 것이다. 성공 기준은 선택 언어에서 서로 다른 금융 용어 5개에 연결된 검증 문제, 비공개 결과 영수증, 정확한 재시도다. 시스템 용어 12개는 제외한다.
- (A) 본문 자동생성 문제는 사실 오류·가짜 정답을 증폭할 수 있고, (B) 클라이언트 전용 퀴즈는 독립 검토·서버 영수증을 보증할 수 없다. 따라서 (C) **편집 검토를 통과한 서버 검증 문제은행과 본인 전용 시도**를 선택한다. AI 즉석 문제, 투자 조언, 공개 순위, 보상·업적·알림·WLD 지급, 자동 읽음 처리 및 금융 원장 변경은 범위 밖이다. v1440/v1442 저장·읽음 기능도 아직 미병합 초안이므로 의존 기능으로 간주하지 않는다.

### 진입점·화면·CTA·상태
- 공개 /guide/glossary 및 정규 용어 페이지에 선택형 '개념 자가점검' 링크를 제공한다. 비회원은 변경 없는 로그인 안내만 표시한다. 본인 인증된 활성 회원은 /account/learning/glossary/practice에서 ko/en/ja/zh를 선택하고 '5문항 시작'을 누른다. 페이지 방문·스크롤·체류·분석 이벤트로 자동 시작하지 않는다. 선택 언어에 **서로 다른 유효 용어에 연결된 독립 승인 문제 5개 미만**이면 QUIZ_UNAVAILABLE/503을 표시하고 모의 문제로 대체하지 않는다.
- 문제마다 상호 배타적인 선택지 4개, 건너뛰기, 이전/다음, 답안 제출 CTA를 제공한다. 제출 전 선택은 일시적 화면 상태에만 보관하고 성공으로 표시하지 않는다. 서버가 확정한 제출 영수증 후 0~5 정답 수, 각 정답·오답·미응답 구분, 검토된 해설, 용어 링크와 문제 개정번호를 보여준다. 다시 풀기는 새 시도이며 읽음·숙련·투자능력을 자동 인정하지 않는다.
- 상태: SIGN_IN_REQUIRED, REGISTRY_UNAVAILABLE, LOADING, READY, STARTING, IN_PROGRESS, SUBMITTING, RECEIPT_UNKNOWN(시간초과), SUBMITTED_VERIFIED, EXPIRED, CONTENT_REVOKED, CONFLICT_409, RATE_LIMITED_429, ERROR. 일시적 오류 시 선택과 키보드 초점을 보존하고 동일 요청 UUID·본문 지문으로 영수증 조회 후 재시도한다. 승인 문제 철회 중에는 다른 정답으로 몰래 대체하지 않고 CONTENT_REVOKED로 중단 후 재시작을 안내한다. 로그아웃·계정 전환 시 선택, 요청 키, 개인 캐시, 지연 응답을 모두 무효화한다.

### 문제은행 정본·심사·언어별 정확성
- 언어·배포별 불변 문제은행 manifest에 bank_revision, release_sha, canonical_manifest_sha256, question_id, question_revision, term_id, locale, approved_at, 작성자·독립 심사자, 인용 용어 개정번호 및 편집 근거 식별자를 기록한다. 작성자와 승인자는 달라야 하며 금융 사실·권리·원본성·정답을 독립 검증한다. 퀴즈 몇 개의 근거를 외부 독립 레퍼런스 10,000건 달성으로 세지 않는다.
- 각 문제는 동일 언어로 검토한 서로 다른 비어 있지 않은 선택지 4개, 정확히 하나의 승인 정답, 해설, 정규 용어 링크를 가진다. 정답 키는 서버 전용이며 시작/목록 응답·클라이언트 번들·공개 페이지·분석·로그에 포함하지 않는다. 선택지 인덱스 대신 불변 choiceId를 사용한다. volatility와 sharpe-ratio처럼 다른 개념을 동의어로 오인하지 않는다. 철회된 용어·별칭·언어별 개정번호 불일치·배포 manifest 검증 실패는 문제은행을 차단하며 공개 용어 페이지는 계속 제공한다.
- 편집 단계 DRAFT → REVIEW_PENDING → APPROVED → ACTIVE → REVOKED/RETIRED. 승인된 문제·정답을 제자리 수정하지 않고 새 불변 개정번호를 발행한다. 관리자 작성·검토·철회는 감사 기록과 독립 심사를 필요로 한다. 무검토 URL 가져오기, HTML 삽입, 임의 문제 제출 및 수익 보장 표현을 금지한다.

### NestJS·Next.js·Android API 계약
- 신규 인증 API 제안: GET /api/v1/guide/glossary-practice/availability?locale=ko|en|ja|zh; POST /api/v1/guide/glossary-practice/attempts(requestId UUID,locale,expectedBankRevision); GET /api/v1/guide/glossary-practice/attempts/:attemptId; POST /api/v1/guide/glossary-practice/attempts/:attemptId/submit(requestId UUID,expectedVersion,selections[{questionId,choiceId|null}],expectedBankRevision); GET /api/v1/guide/glossary-practice/receipts/:requestId; DELETE /api/v1/guide/glossary-practice/attempts/:attemptId(본인 철회). 개인 목록 GET /api/v1/guide/glossary-practice/attempts?cursor=...&limit<=20은 제한된 페이지네이션으로 제공한다.
- 시작 응답은 attemptId, 30분 만료시각, version, bankRevision, 정답 표시 없는 승인 문제 5개와 각 선택지 4개다. 제출은 시작 당시 고정한 5개 문제 ID와 서버가 발행한 선택지 ID 또는 미응답 null만 허용하며 중복을 거부한다. 서버만 불변 정답을 채점한다. 최종 영수증에는 요청 UUID, 본인 시도 ID, bankRevision, score(0~5), total=5, answeredCount, 문항별 정오답·미응답과 해설·출처, version, committedAt을 포함한다. 점수를 공개 URL에 넣지 않는다.
- 웹은 HttpOnly 실제 세션·CSRF·Next BFF, Android /app-api/v1은 검증된 모바일 bearer와 동일한 소유권·응답 계약을 사용한다. 클라이언트가 보낸 userId나 공유 DB의 p_actor만으로 본인을 신뢰하지 않는다. 400 형식 오류, 401 미인증, 403 비활성/동의/CSRF, 404 타인 또는 없는 시도, 409 버전·요청 키 본문 충돌, 410 만료·철회, 422 잘못된 선택지·언어, 429 한도, 503 미검증 문제은행/배포를 구분한다. 비공개 응답은 no-store이며 오류에도 정답 키가 노출되지 않는다. 웹·Android 동등성은 테스트로 입증한다.

### PostgreSQL 제약·인덱스·트랜잭션·영수증
- 독립 PostgreSQL에서 검증 후에만 추가형 순방향 마이그레이션을 제안한다. glossary_practice_questions(question_id UUID,question_revision BIGINT,term_id UUID,locale CHECK ko/en/ja/zh,bank_revision,source_revision,approved_editor,independent_reviewer,status,answer_choice_id,explanation,immutable_payload_digest,created_at; PK(question_id,question_revision), 정규 용어·언어 개정 FK), choices PK(question_id,question_revision,choice_id)를 둔다. 승인 함수가 선택지 정확히 4개·정답 하나·서로 다른 choiceId를 원자적으로 검증한다. 앱 역할의 직접 DML·PUBLIC EXECUTE를 허용하지 않고 search_path를 고정한 좁은 SECURITY DEFINER 함수만 사용한다.
- glossary_practice_attempts(attempt_id UUID PK,user_id FK,locale,bank_revision,created_at,expires_at,version,status CHECK,submitted_at,score CHECK 0..5,deleted_at), glossary_practice_attempt_items(attempt_id,position 1..5,question_id,question_revision,choice_order_snapshot,selected_choice_id nullable,correct_at_submission, 문제 불변 개정 FK), glossary_practice_receipts(user_id,request_id UUID,operation,canonical_payload_digest,result_snapshot,committed_at,PK(user_id,request_id))를 추가한다. 본인·시도 복합 FK로 타인 기록 연결을 방지한다. 인덱스는 (user_id,created_at DESC,attempt_id DESC), (user_id,status,expires_at), (attempt_id,position)이며 now()를 부분 인덱스 조건에 넣지 않는다.
- 한 시도에는 서로 다른 정규 금융 용어 5개/문제 5개가 있어야 한다. 문제은행 개정번호를 잠근 뒤 시도·문항 5개를 한 트랜잭션에 생성한다. 회원별 최근 UTC 24시간 시작 최대 10회, 언어별 활성 시도 최대 1개, 만료 30분을 회원 잠금 후 직렬 검증한다. 제출은 회원→시도→문항 순서로 잠그고 version·은행 개정·선택지를 확인해 채점·결과·불변 영수증을 원자 기록한다. 동일 회원/requestId/작업/본문 지문 재시도는 **최초 영수증 그대로** 반환하고, 다른 작업·본문·시도 재사용은 409이며 변경하지 않는다. 시간초과 시 영수증 조회 후 동일 UUID로 재시도한다. 철회는 본인만 멱등 처리하고 개인정보 시도 상세는 90일 후 승인된 보존정책에 따라 삭제한다.
- 목록 커서는 본인·세션·필터·만료에 결합해 서명한다. 관리자는 최소 20명 집계 버킷과 문제 심사·철회만 접근하며 개별 회원 점수는 기본적으로 볼 수 없다. 문제 철회는 신규 시작과 미제출 시도를 차단하되 이미 확정된 과거 영수증을 재채점하지 않는다.

### 보안·SEO·접근성·KPI·배포·롤백
- 회원/IP/기기별 속도 제한, 정답 키·타이밍 유출·열거 방지, UUID/길이/언어/선택지 허용목록, CSRF·계정 전환 차단을 적용한다. 비공개 퀴즈와 결과는 noindex,nofollow/no-store, 사이트맵·광고 개인화 제외. 기존 공개 정규 용어의 canonical/hreflang/DefinedTerm SEO는 변경하지 않는다. 관리자 발행·철회는 관리자 권한·CSRF·최근 재인증·독립 심사를 요구한다.
- WCAG 2.2 AA: 라벨 있는 radio 그룹, 키보드 이동, 명시적 진행도·해설, 색만으로 정오답 구별 금지, 포커스 복귀·오류 live region, reduced motion, 200% 확대, 320/360/390/768/1024/1280px, Android TalkBack을 시험한다. 만료 30분은 설명하되 답변 시간을 압박하지 않으며 만료 시 새로 시작한다. ko/en/ja/zh 문구와 정답은 각 언어별로 독립 심사한다.
- KPI는 동의한 시작→제출 완료율, 언어별 승인 문제 충족률, 부정 선택지 차단, 409/503, 확정 영수증 성공률, 자발적 재학습 및 개인정보 사고 0 목표다. 점수를 학습 성취 인증·투자능력·수익률로 표현하지 않고 답변 내용을 일반 분석 이벤트로 보내지 않는다.
- 기능 플래그 기본 OFF. 독립 실제 PostgreSQL에서 언어별 유효 용어 5개, 부족 언어, 합성 시도 10,001건 인덱스·커서, 동시 시작/제출 100건, 타인/CSRF/재시도 위조 100건, ISR 24시간 개정 경합, 중도 철회, 동일/변조 UUID, 30분 만료, 제출 전 정답 비노출, 웹/Android·접근성·SEO 및 **WLD/원장 변화 0**을 검증한다. 독립 암호화 백업 복원·DB 권한/마이그레이션 대조·18,000 WLD 원장 불일치 해결·전체 CI·공식 Test exact-SHA 인증 E2E·승인된 GitOps 무중단 승격·롤백 검증 전 Production 금지. 롤백은 시작/제출을 OFF로 막고 기존 영수증을 보존한다.

### 개발 백로그 P0 4 / P1 6
- **P0 ENV1444-01:** 06:04 KST 루트 98%(약 2.0GiB), 데이터 99%(약 3.5GiB); 용량 확장·승인된 보존정책 및 독립 오프사이트 암호화 백업 복원. 타 작업 파일 임의 삭제 금지.
- **P0 FIN1444-02:** QA v1357의 USER_CASH 18명 총 +18,000 WLD 차이와 국고 0 WLD. 근거 추적·승인된 순방향 정산만 허용, 지급 재실행·가짜 분개 금지.
- **P0 SEC1444-03:** QA v1357 앱 직접 쓰기 권한 239개 관계, PUBLIC 은행 함수 3개, 체크섬 불일치 5개, 미적용 20개. 최소권한·문제은행 출처·마이그레이션 검증.
- **P0 REL1444-04:** main runtime CI SKIPPED, 공식 Test SHA가 main과 불일치, 운영 SHA unknown. 정확 SHA 전체 인증 Test·보안·백업·롤백·승인 GitOps 선행.
- **P1 QUIZ1444-05:** 4개 언어 불변 문제/선택지/용어 manifest, 독립 편집 심사, 정답 비공개, 철회·개정.
- **P1 QUIZ1444-06:** 본인 전용 시도·문항·영수증 DB 함수, 5문항/하루 10회/30분 만료/90일 보존, 잠금·멱등.
- **P1 QUIZ1444-07:** NestJS·Next BFF·Android app-api DTO/인증/상태코드/영수증 조회·캐시 차단.
- **P1 QUIZ1444-08:** 공개 선택 진입, 회원 퀴즈·비공개 결과·4개 언어, 320px/WCAG/TalkBack.
- **P1 QUIZ1444-09:** 관리자 독립 검토·철회·감사, 개인정보 수명, 공개 SEO 유지, 집계 KPI, 악용·정답 유출 방지.
- **P1 QUIZ1444-10:** 격리 PostgreSQL 10,001건, 동시성 100건, 권한 음성 100건, 철회·만료·재시도·정확 SHA E2E, 원장 변화 0과 OFF 롤백.

**외부 독립 근거 게이트:** 신규 중복제거·독립검증 승인 **0건**, 누적 **UNKNOWN / 10,000**, **BLOCKED / IN PROGRESS**. 용어·문제·발행기관·GitHub 이슈·합성 데이터는 독립 승인 외부 레퍼런스 수량이 아니다. 이번 산출물은 기획 초안이며 코드 구현·Test·운영 배포가 아니다.


## v1442 / F675-166 — 금융 용어 학습 목록의 정규 식별자·다국어 읽음·재시도 무결성 강화 (FEATURE IMPROVEMENT / DRAFT / RELEASE HOLD)
- GitHub 연계: [Draft PR #1784](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1784)는 미병합 선행 [#1780](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1780)에 의존하며 [개발 이슈 #1779](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1779)를 갱신함. 문서 전용·운영승격 HOLD.

**기준 및 사이클.** Previous Feature Addition v1440 → Current Feature Improvement v1442 → Next Feature Addition v1444(잠정). 원격 main 35971c600f25869c96f1c666d4b9f58927202730을 시작·중간에 재확인했다. 선행 Draft PR #1780은 미병합이며 이번 변경은 문서 전용 후속 기획이다. 마지막 독립 확인 가능 QA 기준선은 v1355 FAILED/HOLD이며 miniPC Debian 13.6과 개발 PostgreSQL을 읽기 전용으로 조사했다. 서비스가 ACTIVE라는 사실만으로 운영 안전을 인정하지 않는다.

### 실제 소스 발견 및 기능 범위 정정
- frontend/src/config/pseo-glossary.config.ts에는 서로 다른 **정규 금융 용어 slug 50개**가 있다. frontend/src/app/guide/components/glossary-search.tsx에는 별도 **서비스/시스템 용어 ID 12개**가 있으며 두 집합의 교집합은 **0개**다. 이 둘을 금융 학습 목록의 동일한 62개 항목으로 합치거나 자동 저장해서는 안 된다.
- frontend/src/app/[locale]/guide/glossary/[term]/page.tsx에는 dca, mdd, beta, volatility, water-down의 **별칭 5개**가 있다. 특히 **volatility → sharpe-ratio**는 변동성과 위험조정 샤프비율이라는 서로 다른 개념을 연결하므로 의미상 동의어가 아니다. 정정 심사를 거치기 전에는 이 별칭을 QUARANTINED 처리하고 해당 별칭으로 샤프비율을 자동 저장·읽음 처리하지 않는다. 이번 기획에서 공개 페이지 코드를 수정하지 않는다.
- 한국어는 /guide/glossary/[term], 영어·일본어·중국어는 /[locale]/guide/glossary/[term]를 사용하고 상세 페이지는 86400초 재검증된다. v1440의 단일 read_revision 필드는 어느 언어를 읽었는지 보존할 수 없다.

### 불변 식별자·별칭·배포 콘텐츠 원본
내부 식별자는 slug/URL/언어와 독립된 불변 glossary_term_id(UUID)로 한다. 정규 금융 용어 manifest에는 term_id, canonical_slug, source_namespace=PSEO_FINANCE, release_sha, manifest_sha256, ko/en/ja/zh 언어별 콘텐츠 digest·revision, 공개 가능 여부, 배포 증빙을 포함한다. SHA-256 입력은 필드 순서·Unicode 정규화·UTF-8·스키마 버전을 고정한 canonical JSON으로 한다. 중복 ID/slug, 누락된 언어 필드, 검증되지 않은 manifest는 쓰기 OFF다. Next/Nest/Android 계약은 동일한 검토·배포 SHA에 묶고 클라이언트가 보낸 해시를 권위로 인정하지 않는다. 미병합 F675-165에 의존하지 않는다.
별칭은 별도 버전 테이블(alias_slug, locale_scope, target_term_id, editorial_equivalence_approved, effective_revision, retired_at)로 관리한다. 편집 검증을 통과한 진정한 동의어만 정규 URL로 안내한다. 의미가 다른 volatility 별칭은 자동 연결하지 않고 인증된 쓰기 요청에 422 INVALID_ALIAS를 반환하며 실제 용어 검색을 안내한다. 정규 slug가 이름만 바뀌면 term_id와 기존 저장을 유지한다. 삭제되면 비공개 tombstone과 Remove CTA를 유지한다. 검증 가능한 오래된 revision은 409 CONTENT_CHANGED, 배포 SHA/manifest 권위 자체가 불명확하면 503 REVISION_UNAVAILABLE로 구분한다.

### 회원 화면·언어별 상태·CTA
공개 금융 용어는 비회원도 계속 읽는다. 활성·동의 회원은 Save/Remove와 Mark read/Mark unread를 명시적으로 실행한다. /account/learning/glossary에서는 현재 언어의 제목과 언어별 자발적 읽음 표시를 보여준다. 예: '한국어 읽음, 영어는 읽음 표시 없음'. 읽음은 **언어별·정확한 콘텐츠 revision별**이며 학습 성취나 이해도 증명이 아니다. 콘텐츠가 수정되면 해당 언어에 NEEDS_REREAD를 표시하고 이전 자기표시 이력은 남긴다. 언어 변경·스크롤·체류시간·단순 열람·분석 이벤트로 읽음을 자동 생성하지 않는다. 비회원은 Sign in to save만 보이고 localStorage에서 임의 복구하지 않는다.
상태: UNAUTHENTICATED, LOADING, UNSAVED, SAVING, SAVED_UNREAD, SAVED_READ_IN_LOCALE, NEEDS_REREAD, UNAVAILABLE_TERM, INVALID_ALIAS, NETWORK_UNKNOWN, CONFLICT_409, REGISTRY_UNAVAILABLE_503, RATE_LIMITED_429, ERROR. 서버 원본 영수증 확인 전에는 성공을 표시하지 않는다. 타임아웃 시 원래 영수증 조회 후 동일 requestId·본문으로 재시도한다. 로그아웃·계정 변경 시 캐시·진행 중 응답·요청 키를 격리한다.

### NestJS·Next.js·Android API 및 인증
v1440의 GET /api/v1/guide/glossary-learning, GET/PUT/DELETE /:slug, POST /:slug/read-state, GET /receipts/:requestId 구조를 유지하되 DTO에 locale(ko|en|ja|zh), canonicalTermId, localeRevision을 명시한다. 기존 클라이언트의 의미를 묵시적으로 바꾸지 말고 버전별 계약을 제공한다. Save는 용어 단위, Read는 해당 언어와 정확한 revision 단위, Delete는 모든 언어의 해당 저장 용어를 제거하되 불변 영수증은 보존한다. 같은 requestId·동일 정규화 본문은 최초 응답 재생, 다른 term/locale/operation/version/body로 키 재사용 시 409 IDEMPOTENCY_KEY_REUSED다. 영수증에는 소유자 범위 termId, 정규 slug, 해당 시 locale, 원본 revision, 작업·결과 버전·시각·본문 digest를 포함한다.
웹은 HttpOnly 세션·CSRF·서버 파생 actor를 사용하는 Next BFF, Android /app-api/v1은 독립적으로 검증한 모바일 인증을 사용한다. 공유 DB 계정의 p_actor 인자만으로 본인을 증명하지 않는다. 400 형식 오류, 401 비로그인, 403 비활성·동의·CSRF, 404 타인·부재, 409 버전·본문 충돌, 422 검증 안 된 별칭, 429 제한, 503 manifest 불일치를 구분한다. 비공개 응답은 no-store이며 URL·공개 SSR·로그·분석 이벤트에 개인 학습 이력을 노출하지 않는다.

### PostgreSQL 제약·트랜잭션·커서
v1440 모델을 발전시켜 저장 PK를 (user_id,term_id)로 바꾸고 (user_id,slug) 결합을 금지한다. glossary_term_locales(term_id,locale,revision,content_digest,publication_sha,active) UNIQUE(term_id,locale), glossary_learning_read_marks(user_id,term_id,locale,read_revision,read_at,version,removed_at) UNIQUE(user_id,term_id,locale)를 추가한다. 복합 FK로 소유자·용어 정합성을 확인하고 지원 언어·digest를 CHECK로 제한한다. 언어별 읽음 표시는 저장 슬롯을 추가로 점유하지 않는다. 저장 엔트리는 회원별 단조 증가 save_seq, saved_at, removed_at, version을 보유한다. 회원 행→registry/entry/mark 순서 잠금으로 100개 활성 저장 제한과 CAS를 직렬화한다. moneyverse_app 직접 DML 금지, PUBLIC EXECUTE 철회, 최소 EXECUTE를 부여한 SECURITY DEFINER 함수와 실제 인증을 사용한다. 회원 탈퇴·삭제는 법적 보존이 필요한 비식별 감사자료 외의 학습 이력을 제거한다.
목록 커서는 HMAC 서명 불투명 토큰으로 user/session generation, filter, sort, registry epoch, max_save_seq 스냅샷, 만료시각에 결합한다. (save_seq DESC,term_id DESC) 순서와 페이지 최대 50개를 사용하며 재저장에는 새 save_seq를 부여한다. 스냅샷 이후 신규 저장은 제외하고 도중 삭제된 항목은 생략될 수 있음을 명시한다. 다른 회원·필터 변경·위조·만료 커서는 존재 여부를 유출하지 않고 거절한다. (user_id,removed_at,save_seq DESC,term_id DESC), (user_id,term_id,locale), 영수증 UNIQUE(user_id,request_id) 인덱스를 10,001개 합성 데이터 EXPLAIN으로 확인한다. now()를 부분 인덱스 조건에 넣지 않는다. requestId+정규 본문 digest 확인·상태 변경·원본 영수증 쓰기는 동일 DB 트랜잭션에서 수행한다.

### 관리자·보안·SEO·모바일 접근성·KPI
관리자는 최소 20개 적격 계정 이상으로 묶인 집계만 보고 개인 저장 목록이나 읽음 언어를 조회하지 못한다. 회원·IP·기기 제한, slug 허용목록, 길이 제한, 임의 URL fetch 금지, 100개 제한과 개인정보 비노출 감사를 적용한다. 공개 canonical/hreflang/DefinedTerm/사이트맵은 검증된 정규 금융 용어에만 적용하고 문제 별칭으로 중복 색인을 만들지 않는다. 비공개 목록은 noindex/nofollow, 사이트맵 제외, 광고 개인화 제외다. WCAG 2.2 AA, 키보드, 320/360/390/768/1024/1280/1440px, 200% 확대, reduced motion, 초점 복구, TalkBack, 언어별 상태 텍스트를 검증한다. KPI는 검증 영수증 비율, 자발적 D7 재방문, 언어별 다시읽기, 문제 별칭 차단, 409/503, 기기 간 일치율, 개인정보 사고 0 목표다. 읽음 클릭을 학습 성취나 투자 수익으로 표현하지 않는다.

### 실DB 시험·배포·롤백
격리 PostgreSQL에서 정규 금융 ID 50개, 별도 시스템 ID 12개, 별칭 5개(특히 volatility), 4개 언어 revision, 이름변경·삭제, 24시간 ISR A/B, 정확 SHA 불일치, 원본 영수증 재시도·본문 충돌, 동시 100건 저장/읽음/삭제, 권한·CSRF·커서 위조 100건, 100개 한도, 합성 10,001행의 커서·인덱스를 시험한다. 삭제·재저장 중 커서, 계정 전환, 웹/Android 인증 E2E, SEO/a11y, WLD·원장 변화 0도 검증한다. 실제 DB 시험이 SKIPPED면 PASS가 아니다. 독립 암호화 원격 백업·격리 복원, 보안/금융 대사, 공식 Test exact-SHA, 승인된 운영승격·롤백 증거 전에는 기능 OFF. 롤백 시 쓰기를 차단하고 원본 영수증·공개 용어사전을 보존한다. 이번 회차는 기획 전용이며 코드·DB·WLD·Test·Production을 변경하지 않는다.

### 갱신 개발 백로그 (P0 4 / P1 6)
- **P0 ENV1442-01:** 05:08 KST 루트 98%(여유 2.6GiB), 데이터 99%(여유 3.7GiB). 다른 작업 자료 보존, 독립 암호화 백업·전체 복원 증거 확보.
- **P0 FIN1442-02:** 이전 QA v1355의 회원 현금/원장 18건 총 18,000 WLD 차이를 원본 증거로 대사. 임의 원장 보정·국고 잔액 조작 금지.
- **P0 SEC1442-03:** 개발 DB 실측 public 247개 중 235개 테이블에서 moneyverse_app INSERT/UPDATE/DELETE 가능. 최소권한·manifest/별칭 무결성, 이전 보고 PUBLIC 은행 EXECUTE 3개와 마이그레이션 불일치 해결.
- **P0 REL1442-04:** 독립 복원·실DB ACL/금융/보안 E2E·공식 Test 정확 SHA·승인된 GitOps 운영승격 전 HOLD. #1088 빌드만으로 자동병합 금지.
- **P1 GLOS1442-05:** 불변 term_id, 분리된 용어 namespace, 검증 별칭, 4개 언어 배포 manifest·제약·FK·인덱스.
- **P1 GLOS1442-06:** 언어별 읽음 CAS·원본 본문 digest 영수증·100개 한도·이름변경/tombstone·동시성.
- **P1 GLOS1442-07:** NestJS/Next/Android 버전 DTO, 409/422/503 분리, 회원/세션/필터 서명 커서, no-store·영수증 재조회.
- **P1 GLOS1442-08:** Save/Read/Remove/Needs-reread/Invalid-alias 화면, 계정전환 격리, 모바일·TalkBack·다국어 접근성.
- **P1 GLOS1442-09:** 집계형 관리자 최소 20명, 개인정보 삭제, canonical/hreflang/SEO 보존, KPI·악용 방지.
- **P1 GLOS1442-10:** 격리 실DB 합성 10,001행, 동시 100건, ACL/CSRF/커서 음성 100건, 4개 언어 ISR, 정확 SHA, WLD 무변경·롤백.

**외부 독립 레퍼런스 gate:** 신규 중복 제거·검증 승인 **0건**, 누적 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 소스 slug, 별칭, 합성 시험 데이터, 외부 발행기관 언급, GitHub 이슈는 승인된 독립 레퍼런스가 아니다. 기존 v1440 기획은 유지하고 영어 통합 원본·한국어 동등 문서에 흡수한다.


## v1440 / F675-166 — 검증 가능한 회원 전용 금융 용어 학습 목록 (기능 추가 / DRAFT / RELEASE HOLD)
- GitHub 연계: [Draft PR #1780](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1780), [개발 이슈 #1779](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1779). 미병합·운영 보류.

**회차·기준:** 이전 Feature Improvement v1438 → 현재 Feature Addition v1440 → 다음 Feature Improvement v1442(잠정). 원격 main 35971c600f25869c96f1c666d4b9f58927202730 시작·중간 재확인, QA v1355 읽기 전용 증거, main에서 분리한 독립 브랜치. 기존 F675-165 용어 정정 제안(#1770/#1775)은 별도 미병합 기획이며 실제 운영 기능 또는 이번 기능의 기구현 의존성으로 취급하지 않는다. 이번 회차는 런타임·DB·WLD·Test·Production·기능 스위치를 변경하지 않는다.

### 실제 기능 공백, 목적, 데이터 진실 기준
최신 main의 공개 /guide/glossary 및 /guide/glossary/[term]은 frontend/src/config/pseo-glossary.config.ts의 GLOSSARY_TERMS에서 생성된다. 상세 페이지는 86400초 재검증을 사용하며 DefinedTerm/FAQ 검색 구조화 데이터를 노출한다. 회원별 용어 저장 목록, 자발적 읽음 표시, 이에 대응하는 NestJS/DB 본인 전용 API는 main에서 발견되지 않았다. 기존 CalculatorSaveAction은 계산 시뮬레이션을 브라우저 localStorage에 저장할 뿐, 용어 학습 목록의 계정 동기화를 입증하지 않는다. GitHub 이슈의 glossary bookmark/learning 검색에서도 동일 기능을 확인하지 못했다. 목적은 회원이 실제 게시된 용어를 직접 저장하고 나중에 읽거나 '읽어봄'을 스스로 표시하는 것이다. 읽음은 이해·숙달·교육 성과·투자 수익·보상 획득의 증거가 아니다.

### 이용 대상, 진입점, 버튼 및 상태
비회원도 공개 용어 목록·상세 설명은 검색 색인 가능한 상태로 읽는다. /guide/glossary/[term]의 활성·동의 회원에게만 '용어 저장/저장 취소', '읽어봄 표시/읽음 취소'를 제공한다. 비회원에게는 '로그인 후 저장'을 표시하되 조회만으로 추적·자동저장하지 않는다. /account/learning/glossary는 본인 전용 저장 목록, SAVED/READ/UNREAD 필터, 실제 공개 용어 제목 검색, 삭제, 다시 열기 및 '본인이 표시한 읽음 수'를 제공한다. 열람 시 자동 저장·localStorage 무단 이전·숙달 점수화는 금지한다. 상태는 UNAUTHENTICATED, LOADING, UNSAVED, SAVING, SAVED_UNREAD, SAVED_READ, REMOVING, NETWORK_UNKNOWN(영수증 재조회), CONFLICT(409 버전 충돌), UNAVAILABLE_TERM(비공개 묘비+삭제 가능), RATE_LIMITED(429), ERROR(재시도)로 구분한다. 서버 확정 영수증 전에는 저장·읽음 성공을 표시하지 않는다. 로그아웃·계정 전환 때 캐시, 진행 중 응답 및 요청 키를 폐기하여 타인 목록이 노출되지 않도록 한다. 푸시·이메일·포인트·업적·WLD 변경은 없다.

### 실제 배포 콘텐츠 버전 및 삭제된 용어
검토된 빌드에서 GLOSSARY_TERMS로 생성한 불변 slug manifest를 정확한 배포 SHA와 용어별 편집 내용 digest에 결합한다. 프론트엔드 배열만 존재할 때 백엔드가 동일 버전을 검증할 수 있다고 가정하지 않는다. F675-165의 향후 manifest 계약을 독립 검토 후 재사용할 수 있으나 해당 PR이 병합됐다고 가정하지 않는다. 신뢰 가능한 manifest/registry가 없다면 기능은 OFF로 두고 공개 용어사전은 정상 제공한다. 진짜 과거 콘텐츠 개정은 409 CONTENT_CHANGED로 재확인을 요구하며, 프론트·백엔드·DB의 버전 일치 자체를 입증할 수 없으면 503 REVISION_UNAVAILABLE로 쓰기를 차단한다. 용어 slug가 삭제·변경되면 다른 용어로 자동 연결하지 않고 본인 전용 '현재 이용 불가' 묘비를 유지해 삭제만 허용한다. 기존 읽음 기록은 당시 정확한 개정에 연결하고 개정 후에는 '다시 읽어야 함'으로 표시하되 과거 본인 표시를 위조·삭제하지 않는다. 개인 활동은 공개 메타데이터나 검색에 노출하지 않는다.

### NestJS·Next.js·Android API 동등성
인증된 회원용 NestJS API: GET /api/v1/guide/glossary-learning?state=&cursor=&limit= (본인 전용 키셋, 페이지 최대 50), GET /api/v1/guide/glossary-learning/:slug, PUT /api/v1/guide/glossary-learning/:slug (termRevision, expectedVersion, requestId), POST /api/v1/guide/glossary-learning/:slug/read-state (read:boolean, termRevision, expectedVersion, requestId), DELETE /api/v1/guide/glossary-learning/:slug (requestId, expectedVersion), GET /api/v1/guide/glossary-learning/receipts/:requestId. 불변 원본 처리 영수증은 {requestId,slug,operation,version,committedAt,state,termRevision}; 타임아웃이면 영수증을 먼저 조회하고 같은 키로 재시도한다. 400 형식 오류, 401 비회원, 403 정지·동의·CSRF, 404 타인/없는 기록 동일 응답, 409 버전·개정·요청 키 재사용 내용 불일치, 429 한도, 503 manifest/DB 불일치를 구분한다. 웹은 HttpOnly 동일 출처 세션과 CSRF가 있는 Next 서버 액션/BFF를 통하고, Android /app-api/v1은 별도 검증된 모바일 인증으로 동일 DTO·상태를 제공한다. 내부 웹 API 토큰을 앱에 배포하지 않는다. 본인 응답은 Cache-Control: private, no-store 및 필요 시 Vary: Cookie를 사용하며 비밀 키를 URL에 넣지 않는다. 관리자는 개인 목록을 열람하지 못하고 비식별 집계만 조회한다.

### PostgreSQL 소유권·제약·트랜잭션·악용 방지
추가형 glossary_term_registry(slug PK, schemaVersion, revision, contentDigest, releaseSha, active), glossary_learning_entries(user_id,slug,saved_at,read_revision nullable,read_at nullable,version 양수,removed_at nullable,updated_at; PK(user_id,slug), 삭제된 slug도 참조할 수 있는 registry FK), glossary_learning_receipts(user_id,request_id,operation,slug,canonical_payload_digest,original_result,committed_at; UNIQUE(user_id,request_id))를 설계한다. 허용 연산·상태·버전·정규 slug는 CHECK로 제한하고 (user_id,removed_at,saved_at DESC,slug) 및 (user_id,read_revision) 인덱스는 실제 EXPLAIN으로 검증한다. now() 같은 변동 조건을 부분 인덱스에 넣지 않는다. 회원당 활성 저장 100개 제한(10,001건은 격리 성능시험 합성 데이터일 뿐), 삭제하더라도 불변 영수증은 유지하고 반복 저장으로 제한을 우회하지 못한다. 인증된 회원 행 → 용어/저장 행 순서로 잠그고 CAS expectedVersion 및 유일 제약으로 동시 요청의 단일 승자를 확정한다. 동일 requestId+정규화 내용 digest는 최초 영수증을 재전달하고, 연산/본문이 달라지면 재로그인 후라도 409로 거부한다. 클라이언트 actor ID를 신뢰하지 않는다. SECURITY DEFINER 함수는 본인·권한을 확인하고 승인된 역할에만 EXECUTE를 부여하며 PUBLIC과 앱 역할의 직접 테이블 접근을 금지한다. 공유 DB 계정의 p_actor 인자만으로는 독립 인증이 되지 않으므로 SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard, 세션 기반 actor, 모바일 토큰 경계 및 실제 DB 권한 음성시험을 결합한다. 회원·기기·IP 별 요청 제한을 적용하되 타인 존재 여부는 누설하지 않는다. 임의 slug, 초과 본문, 외부 URL을 거부하고 금융 계정 식별자를 저장하지 않는다.

### 관리자·SEO·개인정보·분석·접근성
관리자에게는 최소 집계 집단 기준을 적용한 저장 수, 자발적 읽음 수, 409/503 비율, 응답 p95, 영수증 검증 수, 삭제된 용어 정리 수만 보여준다. 회원별 목록 열람 기능은 만들지 않는다. 공개 용어사전의 canonical, FAQ/DefinedTerm JSON-LD, sitemap, OG는 별도 검증된 공개 편집 배포 외에는 그대로 유지한다. 개인 학습 목록은 noindex/nofollow·사이트맵 제외·비공개 SSR·광고 타기팅 금지다. 개인 활동 보존 최소화, 회원 삭제·정보주체 요청 시 비식별화와 법적 감사 보존 범위를 문서화한다. WCAG 2.2 AA, 키보드, 320px, 200% 확대, aria-live, 목록 삭제 후 초점 복원, 색 외 상태 구분, 움직임 감소, Android TalkBack·오프라인 NETWORK_UNKNOWN을 수용한다. KPI는 확정 저장 영수증 전환율, 7일 자발적 재방문(집계), 기기간 일치율, 개정 충돌률, 개인정보 침해 0 목표, 중복 연산 비율이며 자가 읽음 표시를 학습 성취라고 주장하지 않는다.

### 개발 수용시험 및 배포·롤백
개발 예약은 별도 브랜치에서 RED 실패 시험을 먼저 작성하고, 격리된 실제 PostgreSQL에 합성 저장 10,001건으로 페이지·인덱스 성능, 동시 저장/읽음/삭제·재전송 100건, 타인 계정/CSRF/무효 slug/재사용 UUID 음성 100건, 동시 100개 제한, 삭제·이름 변경된 slug, 24시간 ISR의 빌드 A/B 혼재, 정확 SHA manifest 불일치 409/503, 로그아웃·계정 전환, Android/API/접근성/SEO/no-store, 금융 원장 변화 0을 입증한다. DB 시험 SKIP은 PASS로 간주하지 않는다. 기능 스위치는 기본 OFF, 추가형 마이그레이션·외부 암호화 백업·독립 복원·읽기 전용 그림자 검증·카나리, 공식 Test 정확 SHA 회원/관리자/금융 E2E와 승인된 운영 승격·롤백이 필수다. 빌드 성공만으로 자동 병합하는 #1088 방식은 금지한다. 롤백 시 쓰기만 OFF로 전환하고 기존 비공개 영수증·공개 용어사전은 보존한다. 실패 기록 은폐를 위한 삭제는 금지한다.

### P0/P1 개발 백로그 (총 10개)
- **P0 ENV1440-01:** QA v1355 루트/데이터 볼륨 각각 약 98%/98%, 다른 작업 증거 보존, 공간 확보와 독립 복원된 외부 암호화 백업 증명. 임의 삭제 금지.
- **P0 FIN1440-02:** QA v1355 USER_CASH 18명 총 18,000 WLD 원장 차이, 계정·분개 근거 독립 대사. 근거 없는 조정 금지, 국고 0 WLD.
- **P0 SEC1440-03:** QA v1355 앱 쓰기 가능 239개 테이블, PUBLIC 은행 EXECUTE 3개, 마이그레이션 체크섬 불일치 5개/미적용 20개. 본인·manifest·최소권한 경계 검증 실패 시 차단.
- **P0 REL1440-04:** 공식 Test 정확 SHA, 격리 DB 권한, 보안·금융 E2E, 독립 복원 증거 전 운영승격 차단. 빌드만으로 병합하는 #1088 금지.
- **P1 GLOS1440-05:** 실제 배포 용어 불변 manifest, 회원 저장·영수증 추가형 스키마·제약·인덱스·보존 정책.
- **P1 GLOS1440-06:** 회원 잠금·100개 한도·CAS·원본 영수증·409/503 개정 구분·삭제 slug 묘비.
- **P1 GLOS1440-07:** NestJS/Next BFF/Android app-api 인증·CSRF·비공개 캐시·페이지네이션·영수증 조회 동등성.
- **P1 GLOS1440-08:** 용어 상세·계정 목록 CTA/상태, 320px·접근성·TalkBack·계정 전환·오프라인 UNKNOWN.
- **P1 GLOS1440-09:** 관리자 비식별 집계, 개인정보 삭제, 공개 SEO 불변, 안전한 KPI·악용 방지.
- **P1 GLOS1440-10:** 실제 격리 PostgreSQL 합성 10,001건, 동시 100건·BOLA/CSRF 음성 100건, 혼합 릴리스/ISR·롤백·WLD 0 변화 증명.

**외부 독립 근거 게이트:** 이번 신규 검증 승인 0건, 누적 중복 제거 검증 승인 UNKNOWN / 10,000건, BLOCKED / IN PROGRESS. 용어 slug·합성 데이터·GitHub 이슈·외부 발행처 언급을 독립 승인 근거로 집계하지 않는다. 신규 분산 세부기획 파일 없이 기존 영문 정본·한국어 동등 통합 문서에 반영한다.


## v2026.10.28.1423 — 금융 운영 DB 291 보호 승격 확인 (전체 서버 코드는 기존)
- 신규 배당 4인자 멱등 복식분개 함수와 구형 무분개 배당 차단을 실제 Production DB에 적용. 신규 암호화 백업 체크섬/운영 스키마 모사시험/운영 app역할 차단/잔액 불변 검증 완료, 서버 다운 없음. PR #1706 코드 main 3c251d93 병합(운영 앱 실행 SHA는 별도). 운영 TREASURY 계정 0 WLD, 과거 18명 18,000 WLD 원장 미대사, 누락 migration269~287, 공식 Test SHA·디스크97%로 **앱 전체 승격은 HOLD**. 권한은 사용자 의사에 따라 변경하지 않음. [국문기록](../worklog/2026-10-28-treasury-db-production-containment-v1423.ko.md).

## v2026.10.28.1422 — 시민배당 내역 표시와 운영 게이트
- 신규 정식 배당 거래 라벨을 `국고 시민배당 지급`으로 보완, 회귀 29 PASS. 실 운영금융 사전검사 BLOCKED(18,000 원장·초기값 대사), 운영 treasury 원장잔고 0, 과거 배당3건 63,000 WLD 계정별 근거 검증 필요. [기록](../worklog/2026-10-28-treasury-wallet-label-v1422.ko.md).

## v2026.10.28.1421 — 국고배당 복식원장 실제 SQL E2E
- GitHub 첫 CI의 정책 버전 FK 오류 수정. 격리 PostgreSQL 전체 290개 마이그레이션 후 실제 배당 균형/멱등/권한/재원검사 ROLLBACK PASS. 실 WLD 무변경. 운영 원장 대사·정식 국고 0 WLD 및 정확SHA Test 미인증 상태. [기록](../worklog/2026-10-28-treasury-dividend-release-v1421.ko.md).
## v2026.10.28.1420 — 국고배당 복식원장 전환 개발 (운영 미적용)
- 기존 240 배당 함수의 18명×1,000 WLD 실지급/복식분개 누락 재발 방지: 새 마이그레이션 291로 원자분개, UUID 멱등, 감사영수증, 금고/정식 국고 원장 잔고 확인. 기존 지급 재실행이나 근거 없는 원장 조정 금지. DB 역할 권한은 현 사용자 지시에 따라 이번 범위에서 변경하지 않음. [기록](../worklog/2026-10-28-treasury-dividend-ledger-v1420.ko.md). GitHub CI 격리 E2E/운영 적용은 미완료.


## v2026.10.28.1418 — 모바일 블로그 관리자·실제 발행 상태 운영 승격
- 운영 관리자 화면 사진의 disabled AI 즉시 생성·모바일 제목/배지 줄바꿈 원인 확인. PR #1707 코드 SHA cfb13272beea53c4d8c20eff7f379b6f66343033, CI #40644673371/정식 Test 정확 SHA 통과 후 블로그 전용 운영 백엔드 3483/프론트 3484 무중단 전환, 이전 Next 정적 호환 fallback 유지. 프론트 관리자 API의 구형 3000 연결을 신 3483으로 수정. 관리자 권한 보호된 실제 스케줄·원고 검증·DB 게시 수·다음 회차 상태 조회/새로고침 구현, 허위 즉시 발행 버튼 제거. 공개 4국가·모바일 320~1024 QA 통과, 비인증 관리자 상태 API 403/401, 일반 금융·회원 서버 불변. 로컬 AI 검증 시간초과로 2시간 자동 발행 OFF/검증 게시 0, 옛 JSON 글 관리자 조작은 파일 보호로 제한, 실제 로그인 관리 E2E 미확인. v1418 영한 작업기록 참조.

## v2026.10.28.1417.6 — 블로그 관리자 검색 색인 차단 보완
- 블로그 전용 운영승격 직후 관리자 HTML은 noindex이나 HTTP 헤더가 index,follow였던 오류를 확인, 운영 관리자 블로그 4개 경로만 X-Robots-Tag noindex,nofollow 고정. 공개 블로그는 index,follow 유지, 익명 삭제 403/실제 헤더/무중단 설정검사 통과, 이전 Nginx 백업 보관.

## v2026.10.28.1417 — 블로그 전용 운영 승격 실제 적용
- CI/Test 검증 소스 SHA 4688e84... 별도 블로그 운영 백엔드 3481/Next 3482를 실제 한국/미국/일본/중국 목록, 관리자·검증 API·사이트맵에 연결. 운영 DB 사전 전체 백업 후 블로그 SQL 288~290만 적용, 일반 금융·회원/홈페이지와 production-current 포인터 불변. 운영 URL·모바일 320~1024px QA 통과, 구 발행 API 503, 기존 공개글 13건 보호. 로컬 AI 125초 생성 타임아웃으로 2시간 자동게시 OFF(검증 DB 글 0), 구형 JSON 글 관리자 수동 편집은 파일 잠금으로 제한. 금융 사전검사 기존 BLOCKED 수치 변동 없음. docs/worklog/2026-10-28-blog-only-production-v1417.ko.md 참조.

## v2026.10.28.1416 — 블로그 메인 통합·국고배당 18,000 WLD 원인 확인
- PR #1695 메인 2f2169a99698fdcf3a03867f532caca3ff599d77 병합(CI #3971, 기존 Test 통과). USER_CASH 18개 계정 각각 +1,000 WLD 차이는 국고 시민배당 18명×1,000 WLD 감사 기록과 일치하고 마이그레이션 240이 잔액만 직접 갱신해 본원장 분개를 누락하는 것이 원인. 다만 분개 보정/권한 3건/운영 DB 268은 미해결. Test AI 실발행도 모델 125초 시간 초과로 0건. 운영 앱 전체 코드/2시간 자동발행 미승격. docs/worklog/2026-10-28-blog-main-finance-v1416.ko.md 상세 참조.

## v2026.10.28.1415.8 — 운영 구형 블로그 내부 쓰기 경로 긴급 차단
- 운영 Nginx의 구형 발행 API 차단 뒤에도 14:43 KST 내부 JSON 작성으로 무검증 한국어 글 2개 추가(공개 11→13건) 확인. 기존 글 자동 비공개 금지 지침 유지. 공유 blog-posts.json을 0600 비공개 백업·SHA-256 검증 후 immutable 설정, debian 계정 쓰기 거부 테스트 통과. 구형 JSON 관리자 수정·비공개도 일시 제한되어 향후 검증형 DB 이관 시 통제된 해제 필요. 운영 전체 코드 승격은 금융/원장 게이트로 계속 보류. v1415.8 작업기록 참조.

## v2026.10.28.1415.7 — 블로그 CI·정식 Test 성공, 운영 금융 차단
- PR #1695 SHA 4688e84be0f831a3f6e5e16040b3764dff6d78bf: CI #3971 PASS, 공식 Test 정확 SHA 승격 및 DB 280~290 백업·적용, 4개국 블로그/모바일/noindex/E2E 통과. 운영 구형 무검증 발행기만 Nginx 503 차단, 기존 글·금융 DB 불변. **운영 전체 앱 승격 차단**: 3개 금융 테이블 과도 DML 및 계정 18건·18,000 WLD 원장 미확인. 운영 DB는 268, Test 검증형 자동 발행 실게시 0건. 상세 작업기록 docs/worklog/2026-10-28-blog-release-v1415.7.ko.md 참조.

## v2026.10.28.1415 — 블로그 안전 발행 통합 (소스 QA 통과 / 운영 보류)
- PR #1695 별도 브랜치에서 최신 main 구형 JSON 즉시게시 우회를 차단하고, 기존 국가별 검증형 DB/SSR/관리자 수정·삭제/공식출처 검색 구현을 통합. 백엔드 1,934·프론트 1,868·DB 45 테스트 및 Nest/Next 빌드 통과. 그러나 공식 Test 정확 SHA 미작동(test-current 부재), 운영 DB 블로그 288~290 테이블·함수 미반영으로 검증 API 500, 발행 플래그 미설정. **운영승격·운영글 변경·실제 새 자동 게시 성공은 아님**. 최신 v1405: KR/US/JP/CN 국가별 2시간 3주제 순환, 자동검증 GREEN 즉시발행, 사람 필수검토 없음, 시간 경과 자동 비공개 금지, 관리자 직접 조치만. 사이트맵 정정: /sitemap-blog.xml에는 게시 주소가 있고 인덱스와 연결됨. [내부 업데이트](../updates/v2026.10.28.1415-blog-integrated-internal.ko.md) / [작업기록](../worklog/2026-10-28-blog-integrated-v1415.ko.md).

## v2026.10.28.1415 — 국고·중앙은행·조폐국 P0 사실성 조치 (운영 미적용 코드 후보)
- [국문 작업기록](../worklog/2026-10-28-sovereign-finance-truth-v1415.ko.md) / [English](../worklog/2026-10-28-sovereign-finance-truth-v1415.md). 공개 국고의 가짜 잔액/지출은 UNVERIFIED, 메모리 기반 조폐/금리와 비정합 국고 자금 이동 경로는 503 차단. SWF SQL 오류 보정 및 관리자 허위 통화 UI 제거. 공식 격리 Test 정확 SHA의 DB·회원·관리자·모바일 금융 E2E와 원장/잔액 무결성, API 최소권한, 272 순방향 마이그레이션, 백업 복원 전 운영승격 불가.

## v2026.10.28.1412 — 원어 AI/DB 자동 블로그 구현 후보 (운영 미반영)
- [국문 구현·검증기록](../worklog/2026-10-28-blog-verified-publisher-v1412.ko.md) / [EN](../worklog/2026-10-28-blog-verified-publisher-v1412.md). 기존 v1405 2시간 KST KR/US/JP/CN×경제/코딩/컴퓨터 시간창을 실제 원어 Ollama 작성기·공식 HTTPS 출처·언어/위험/중복 검사 및 DB 원자 게시영수증·관리자 수동 수정/비공개/삭제 함수에 연결. 공개 API/국가별 블로그/사이트맵은 영수증 보유 글만 표시, 기존 철회 199편 복원 금지, 자동 비공개 없음, 새 무검토 AI 글의 Google 광고 배너 OFF.
- 병행 에이전트 메인 v255 신규 286/287 SQL 때문에 블로그 288/289/290 적용, 최신 메인 f396d009로 이식. 로컬 Front 1,690/Back 1,701/DB 38 단위 테스트 PASS(통합 430 skip), 타입/빌드/lint PASS; **공식 Test 실제 DB/auth 및 CI·운영 승격 아직 미완료**, 스케줄 플래그 기본 OFF. DB 콘텐츠 검증은 완벽한 실시간 사실 검증을 보장하지 않고, 근거 부족 원고를 건너뜀.


## v2026.10.28.1410 — TECH/2시간 자동 블로그 통합 검증 (운영 미배포)
- 기존 v1403 TECH 수정과 v1405 국가·주제 순환 병합, 283 중복 중 미적용 space 파일만 285로 정렬. 프론트 1,686·백엔드 1,695 테스트, 타입/린트/Next·Nest 빌드 PASS. AI 자동 글 작성·검증 DB 발행기 **미구현**, 공식 Test 신원·금융 권한 게이트 차단으로 운영 미승격. [작업기록](../worklog/2026-10-28-blog-full-release-v1410.ko.md). 기존 관리자 철회 글은 복원 금지.


## v2026.10.28.1405 — 사용자 확정: 2시간·4국가·3주제 자동 공개, 필수 사람 검토 폐기 (코드 후보 / 운영 미반영)
- [국문 v1405 정본](BLOG_TWO_HOUR_AUTOPUBLISH_SPEC_v2026.10.28.1405.ko.md) / [English](BLOG_TWO_HOUR_AUTOPUBLISH_SPEC_v2026.10.28.1405.md). 사용자 최신 지시는 매 2시간(KST 04·06·…·02) KR/US/JP/CN 각각의 원어와 경제·코딩·컴퓨터 주제를 번갈아 **자동 작성·적합 원고 즉시 공개**, 사람이 미리/나중에 필수 검토할 의무 없음, 관리자 본인의 선택적 수정·비공개·삭제, **시간 경과 자동 비공개 완전 금지**. v975/v1107/1108의 필수 사람 사전·사후 검토 부분보다 최신 권한. 출처·사실·독창성·언어·권리·기술 재현 독립 자동검사와 금융 릴리스 게이트는 유지. 고위험 또는 증거 없는 글은 자동 출판하지 않고 사람 검토 강제도 하지 않음.
- 소스 구현 후보: 12개 국가×주제 슬롯·기간키 및 순수 자동검사/AdSense 별도 자격 함수, 백엔드 구형 `blog.daily_publish`를 `blog.rotation_2h`으로 교체하는 개발 브랜치. 아직 원어 작성 AI·공식 출처 수집·DB 원자 게시영수증/Outbox·관리자 수동 철회 기능 **미구현**, 구형 503 차단 유지. 대외 Google 광고는 수동 큐레이션 없는 생성 콘텐츠에 게재 제한([정책](https://support.google.com/publisherpolicies/answer/11112688?hl=en)). 이미 공개된 글은 자동 비공개·검색제외하지 않음.
- **배포 진실성:** 공식 Test·DB/금융 게이트/운영 승격 미완료. 스케줄 12회 = 12편 성공이 아님. [작업기록](../worklog/2026-10-28-blog-rotation-v1405.ko.md). 병행 TECH 글 수정 v1403 PR #1602와 별도 관리.

## v2026.10.28.1403 — TECH 개발 블로그 코드 품질·관련성 개선 (별도 개발 후보)

- 기존 BigInt 원장 개발글에 복리 계산기, 금융시장 설명·금융기관 출처, 입증되지 않은 처리량·오차 실측 수치가 뒤섞였다. 새 TECH 전용 기술 원고(BigInt 원장·호가창 WebSocket/Canvas)에 TypeScript/SQL, 분개 균형·멱등성·동시성 테스트·공식 기술문서를 연결하고 금융교육 공통 원고를 사용하지 않는다. 본문 렌더러·추천 카드·가입 배너도 TECH에서 금융 관련 요소를 배제하며 COMPOUND 금융교육 계산기 기능은 유지한다.
- TECH 미등록 주제는 금융 원고로 채우지 않고 생성 거부, 가짜 국가판 복제·난수 조회수 차단, 출처 없는 조회수 미노출. v1102 합쳐진 자동발행 503 보호·v1108 시간 경과 자동 비공개 금지는 그대로 유지. 기존 공개 본문은 관리자 서명된 수동 정정 없이 자동 교체하지 않는다.
- 로컬 328파일/1,686 프론트 테스트 PASS, 블로그 20 PASS, TypeScript·린트·계약/Next 빌드 PASS. **공식 Test 실제 로그인·백엔드·DB/금융 승인, 무중단 운영 승격, 공개글 교정은 아직 미증명**.
- [작업기록 영문](../worklog/2026-10-28-blog-tech-relevance-v1403.md) / [국문](../worklog/2026-10-28-blog-tech-relevance-v1403.ko.md) · [내부 업데이트](../updates/v2026.10.28.1403-blog-tech-internal.ko.md) · [GitHub 업데이트](../updates/v2026.10.28.1403-blog-tech-github.ko.md).


## v2026.10.27.1318 — 예약 QA 운영 적용 검증 (예약 QA에 한정)

- v1317 HTTP 스모크 검사/QA 전용 임시 정리 작업을 PR #1542로 main `0da3b886`에 병합하고 별도 버전 고정 예약 QA 실행 파일로 설치했다. systemd drop-in만 교체했으며 기존 서비스 설정은 복구 가능하게 유지했다. 애플리케이션이나 DB는 배포하지 않았다.
- 2026-10-27 15:14 KST 실제 systemd 정상 종료: HTTP 200 24개, 예상된 로그인 이동 2개(인증 후 기능은 미검증), 예상 밖 실패 0, 세션 조회 410. 완료된 QA 전용 오래된 테스트 임시 파일 262,153바이트 1건만 삭제한 것을 확인. 루트 디스크 76%, 데이터 69%. 운영 서비스·테스트 백엔드 정상, 타이머 활성. 기록 당시 다음 예약 16:00.
- `예약 QA 운영 검증 완료`와 `QA 전용 정리 운영 검증 완료`에 한정한다. 전체 인증 금융/관리자/모바일/브라우저 기능과 필수 5회 반복 QA는 **미검증**이다. [v1318 종료 기록](../worklog/2026-10-27-scheduled-qa-runtime-v1318.ko.md).

## v2026.10.27.1317 — 예약 HTTP 스모크 QA와 제한된 디스크 정리 (운영 브랜치 후보)

- 2026-10-27 14:00 KST 시간별 QA는 HTTP 26개 경로 확인을 통과했다. 이는 로그인된 은행/관리자 기능, 브라우저/모바일 조작 및 필수 전체 경로 5회 반복 QA 검증 결과가 아니다. 실제 구동되는 QA 스크립트가 원격 main에서 누락된 배포 드리프트도 확인했다.
- 독립 브랜치에서 예약 스크립트를 추적하도록 복원하고, 리다이렉트 대신 HTTP 200만 통과 처리하며 읽기 전용 DB 세션 조회를 점검한다. QA 실패 시에도 디스크 정리 훅을 실행한다. 삭제는 QA 전용 임시 디렉터리에 완료 표시, 동일 소유자, 링크 없음, 72시간 경과, 삭제량 상한을 충족한 자료로만 제한한다. 운영 DB/WAL, 백업, 릴리스, 업로드, 보존할 QA 증적, 다른 작업자의 데이터는 삭제 금지다.
- 운영 QA 개선 후보이며 앱 테스트/운영 배포 또는 전체 기능 QA를 완료했다고 주장하지 않는다. [GitHub 기록](../updates/2026-10-27-scheduled-qa-disk-cleanup-v1317-github.ko.md).

## v2026.10.27.2 — 관리자 시장 소식 재인증 복구 경로 및 폐지된 TOTP 안내 정정 (개발 후보)

- 감사 근거: GitHub #1515. `POST/DELETE /api/v1/admin/stocks/market-events`의 `ReauthGuard`는 최근 15분 이내 본인 확인을 요구하나 시장 소식 화면에는 해결 경로가 없었다. 운영/Test 배포 커밋에도 같은 결함이 존재한다. Migration 197에서 폐기된 TOTP·신뢰기기·복구코드와 현재 남아 있는 OAuth/로컬 비밀번호 재인증을 구분한다.
- 현재 관리자 콘솔 입장 SQL은 최신 Migration 246에 따라 유효한 관리자 세션으로 가능하며, 최대 30일/24시간 유휴 유지를 사용한다. 구형 30분/10분 문구는 운영 현황이 아니다. 단, 개별 고위험 작업의 최근 15분 확인은 별도 `ReauthGuard`로 남아 있다.
- 정책 유지: 관리자 세션, 역할·DB 행위자 권한, CSRF, 가격 변경 작업의 최근 본인 확인, 감사·멱등성을 해제하지 않는다. 서버가 **실제로** `reauthentication_required`를 반환한 경우에만 소식 발행·종료 화면에서 `/account/security` 본인 확인 링크를 표시한다. 별도 탭으로 열어 미발행 원고를 보존한다. OTP 입력·권한 우회·임의 리다이렉트는 추가하지 않는다.
- 관리자 국고의 잘못된 TOTP 필수 문구, 감사 화면의 인증 앱 코드 오류 안내 및 `PROJECT_PLAN.ko.md` GAP-AUTH-01의 역대 기록 오류를 수정한다. AI 암호화에 쓰이는 TOTP 계열 봉인 유틸리티를 근거 없이 삭제하지 않는다.
- 릴리스 상태: **별도 브랜치의 후보 수정**. 정확 SHA CI와 실제 독립 Test의 백엔드/API/DB·인증 검증, 세션 연속성 및 무중단 운영 승격 게이트가 충족되기 전에는 운영 반영 완료로 표시하지 않는다. DB 스키마·가상경제 권위 변경 없음.

## v2026.10.24.1210 — F675-109 게시판 읽기 목록 삭제·멱등성·커서·이어읽기 무결성 강화 (기능 보완 / DRAFT / 운영 보류)

### 회차·기준·실제 소스와 수정 사유
- Previous **기능 추가 v1208** / Current **기능 보완 v1210** / Next **기능 추가 v1212**(잠정). 최신 원격 main `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` 및 main의 영문 정본·국문 대조 기획서를 시작·중간 재조회했다. 선행 Draft PR #1087은 **미병합 문서 기획**이지 배포된 코드가 아니다. 최신 QA v1213(2026-10-24 08:25 KST)은 FAILED/HOLD. 런타임·운영 연결 DB·WLD·기능 스위치·Test·Production·타 작업자 변경 없음.
- 소스 근거: Migration `044-member-board.sql`은 `member_board_posts(id,deleted_at)` 및 글 소프트 삭제 함수 `member_board_delete`를 정의한다. Migration `175-member-board-public-read.sql`, `259-board-author-user-id-and-chat-search.sql`의 `member_board_public_get`은 `deleted_at IS NULL`인 글만 반환한다. 실제 게시글 화면의 댓글 제목 앵커는 `id="comments-title"`이며 `id="comments"`가 아니다. main에는 읽기 목록 테이블/API가 확인되지 않았다. 선행 v1208의 글 FK `ON DELETE RESTRICT`는 향후 글 완전 삭제를 막을 수 있고, 모호한 404 처리 규칙은 이미 저장한 삭제 글의 목록 제거까지 차단할 수 있다. 이는 **구현 전 해결할 설계 결함**이지 확인된 운영 사고가 아니다.
- 기능은 회원의 수동 저장/삭제와 명시적 TOP/COMMENTS 이어읽기만 제공한다. 자동 스크롤·완독 추적, 관심사 추정, 광고 개인화, 알림 발송, WLD 지급·이동은 금지한다. 정적 다국어 블로그는 검증 가능한 게시 상태 계약이 마련될 때까지 제외한다. 기존 게시판/계정 UX를 활용하며 Gemini·개발 A/B/C·QA와 코드를 중복 수정하지 않는다.

### 회원 화면·CTA·상태·웹/Android
- 진입점: `/board/[postId]`의 저장/저장 취소, `/account/reading-list`의 본인 목록. 상태 GUEST, LOADING, NOT_SAVED, SAVING, SAVED_CONFIRMED, UNAVAILABLE_SAVED, REMOVING, CONFLICT, UNKNOWN_COMMIT, ERROR, SIGNED_OUT. CTA는 저장, 목록에서 제거, 글 열기, 댓글부터 이어읽기, TOP 표시, COMMENTS 표시, 저장 상태 새로고침, 재로그인 후 재시도. 원본 글이 삭제·비공개여도 **본인이 저장한 기록은 제목·본문·작성자·이미지를 가린 채 제거 가능**해야 한다. 본인 GET은 `available:false`로 응답할 수 있지만 삭제된 글의 신규 SAVE는 존재 여부를 구별하지 못하는 404. 미저장/타인 기록의 GET·DELETE는 404. 기존 기록 제거는 원본 공개 여부와 무관하게 확정 묘비 영수증을 반환하며, 같은 키 재전송은 원본 영수증만 반환한다.
- 실제 댓글 제목 앵커는 `h2#comments-title`이므로 이어읽기 정규 주소는 공개 여부를 재확인한 뒤 `/board/<정규-UUID>#comments-title`이다. 임의 해시·URL·CSS 선택자·리다이렉트 입력 금지. 키보드 사용자가 앵커로 이동했을 때 제목에 프로그램 포커스를 줄 수 있도록 `tabIndex=-1` 또는 동등 처리, 보이는 포커스 표시, 고정 헤더 아래 스크롤 여백을 개발 요구사항으로 둔다. TOP은 해시 없는 정규 글 주소. 글이 삭제됐으면 딥링크 대신 제목이 가려진 카드와 제거 버튼을 표시한다. 운영체제 움직임 줄이기 설정을 무시하지 않는다. Android는 네이티브 댓글 영역 이동으로 동등하게 제공하며 자동 열람 기록을 수집하지 않는다.
- 로그아웃·계정 전환·동의 철회·세션 만료 시 인증 세대값을 갱신해 진행 중인 GET/쓰기 응답과 이전 계정의 제목/목록 캐시를 폐기한다. 개인 API·BFF·엣지는 `Cache-Control: private, no-store`, 개인 화면은 `noindex,nofollow`. 타 계정 목록을 공용 localStorage에 저장하지 않는다. 과거 멱등 영수증이 이후 REMOVE된 항목의 현재 SAVED_CONFIRMED 상태를 보장하지 않으므로 재조회한다.

### API·DB 제약·트랜잭션·커서(제안, 미구현)
- v1208의 본인 전용 `GET /api/v1/board/reading-list`, `GET .../:postId`, `POST`, `PUT .../:postId/marker`, `DELETE .../:postId`와 제안된 Android `/app-api/v1/board/reading-list/*` 계약을 유지한다. 회원 ID·동의·CSRF는 서버 세션에서 검증하고 body의 userId를 신뢰하지 않는다. POST/PUT/DELETE는 UUID `Idempotency-Key`, PUT/DELETE는 `If-Match: "vN"` 및 응답 ETag/committedVersion을 요구한다. 오류는 400/422 잘못된 형식, 401 미인증, 403 동의·CSRF 거부, 404 타인/미저장 또는 비공개 글 신규 SAVE, 409 버전·멱등 지문 충돌/한도, 429 제한, 503 확정 불명. 네트워크 시간초과에 근거 없는 2xx 금지. **본인이 저장한 이용 불가 글의 DELETE는 허용**하고 제목이 없는 200 확정 영수증을 반환한다.
- 순방향 신규 `member_board_reading_list`: `(user_id,post_id)` 복합 PK, `user_id REFERENCES users(id) ON DELETE CASCADE`, `post_id REFERENCES member_board_posts(id) ON DELETE CASCADE`로 v1208의 **RESTRICT를 변경**한다. `saved_at,updated_at,removed_at`, `marker CHECK IN ('TOP','COMMENTS')`, 양수 단조 증가 `version`, 활성 목록 `(user_id,saved_at DESC,post_id DESC) WHERE removed_at IS NULL` 인덱스. 글의 소프트 삭제는 본인 목록에 UNAVAILABLE_SAVED로 남고, 별도 승인된 **완전 삭제**만 저장 행을 연쇄 제거한다. 기존 글/계정 삭제 정책과 호환성을 격리 DB에서 검증하며 임의로 운영 글을 완전 삭제하지 않는다. 완전 삭제 후 이전 영수증이 현재 글을 되살릴 수 없다. `member_board_reading_requests`와 `member_board_reading_events`는 `user_id REFERENCES users(id) ON DELETE CASCADE` 또는 별도 승인된 익명화 보안기록 보존 정책을 명시하고, `post_id` UUID는 글 완전 삭제를 막는 FK로 묶지 않는다. 요청 지문 `bytea` 길이 32 검증, `UNIQUE(user_id,idempotency_key)`, 불변 receiptId/operation/resultVersion을 사용한다. 원문 제목·본문·토큰·IP·자동 열람 기록은 저장하지 않는다. 묘비/감사 90일은 법률·개인정보 검토 전 제안일 뿐 승인된 삭제 정책이 아니다.
- 일관된 잠금 순서: **회원 users 행 → 원본 글 FOR SHARE → 본인 저장 행 → 멱등 요청 삽입/조회**(글이 존재하는 SAVE/MARK/REMOVE). 원본이 삭제된 REMOVE는 글의 공개 여부를 요구하지 않고 회원+저장 행 잠금만으로 처리한다. SAVE는 글 행 `FOR SHARE` 획득 후 `deleted_at IS NULL` 재검사, 회원 행 잠금 아래 활성 500건 한도 직렬화, 버전 CAS, 영수증·이벤트를 한 트랜잭션에 확정한다. 글 소프트 삭제 UPDATE는 잠금 해제까지 대기한다. **삭제 확정 이전 시작된 조회를 사후 회수할 수 있다고 주장하지 않는다**. 삭제 트랜잭션이 확정된 뒤 시작한 읽기에서는 글 메타데이터를 공개하지 않는다. 동일 키 동시 요청은 UNIQUE 충돌을 안전하게 재조회해 동일 지문에 최초 확정 영수증 1개, 다른 지문에 409(단순 SELECT 후 INSERT의 경쟁 오류 방치 금지). REMOVE 후 재저장은 **새 키와 최신 묘비 버전**을 모두 요구하고 오래된 SAVE/MARK가 부활시키지 못한다.
- 커서는 HMAC 인증 불투명 값에 본인·세션 세대·필터/버전·만료·`saved_at,post_id` 키셋을 결합한다. 타인 재사용·변조·만료·필터 불일치는 400/422, 타인 목록 노출은 0. 최초 페이지의 `asOf` 경계로 새 저장이 기존 페이지에 섞이지 않게 하고, 동시 삭제로 결과 수가 줄어들 수 있음을 UI에 정직하게 표시한다. 동일 시각 10,001건 커서 회귀는 **운영 한도 500을 바꾸지 않고 격리 DB의 합성 테스트 fixture에만 한도 예외**를 적용한다. 원시 회원별 읽기 기록은 분석으로 보내지 않는다.

### P0/P1 개발 백로그·QA·운영승격
- **P0 ENV1210-01** — 운영·개발이 공유하는 `woldeok_moneyverse_dev`를 격리하고 5433 외부 바인딩을 승인된 방화벽/네트워크 정책으로 제한. 연결 식별자·암호화 백업의 격리 복원 확인 전 쓰기·fixture 금지. 루트 디스크 93% 용량 경보; 다른 작업자 Worktree 삭제 금지.
- **P0 SEC1210-02** — 앱 역할 241개 중 235개 테이블 UPDATE/DELETE, PUBLIC 은행 EXECUTE 3개를 승인된 순방향 최소권한으로 개선. 격리 실 PostgreSQL 부정 권한 테스트, 운영 임의 REVOKE 금지.
- **P0 REL1210-03** — QA v1213 main 린트(wallet CSV)·프론트 토요일 블로그 테스트 실패, 전체 pnpm 감사 Critical4/High10, bot Critical1/High4, Migration266 체크섬 불일치, route-ledger inventory 누락, 격리 복원 및 정확 SHA Test 미완료. **신규 P0 #1088**: Test Candidate 이미지 빌드 SUCCESS만으로 ready PR 자동 병합·브랜치 삭제 금지. PR head와 정확히 일치하는 실제 Test 배포·backend/API/DB·인증 로그인/금융 E2E·보안 PASS 독립 증명 및 부정 워크플로 회귀를 병합 선행조건으로 요구.
- **P0 BOARD1210-04** — 글 공개/삭제/저장 경합과 이용 불가 글의 비공개 REMOVE 계약. SAVE 대 삭제 경쟁 100건, 타 회원 열거 100건, 삭제 확정 뒤 시작한 조회의 글 메타데이터 유출 0, 목록·SEO 제목 노출 0 검증.
- **P1 BOARD1210-05** — 순방향 CASCADE FK·계정/글 삭제 동등성, 본인 전용 SECURITY DEFINER, 회원→글→저장 잠금, 요청 지문과 100건 동시 원본 영수증, 완전 삭제/탈퇴 fixture.
- **P1 BOARD1210-06** — HMAC 본인/세션/만료/스냅샷 커서, 활성 500건 제한, 격리 합성 10,001건 동일 시각 페이지네이션, 동시 추가/삭제·키 교체 회귀.
- **P1 BOARD1210-07** — 실제 `#comments-title` 이어읽기, 명시적 위치 CAS, 키보드 포커스/스크롤 여백/움직임 줄이기/320px·200% 확대 및 Android 네이티브 이동.
- **P1 BOARD1210-08** — 계정 전환·세션 무효화, no-store/noindex, 소규모 집계 숨김 관리자 지표, CSRF/BOLA/속도 제한, 개인정보 삭제·동의 철회.
- **P1 BOARD1210-09** — 웹/Android 확정 영수증·불명 확정·이용 불가 목록/제거 UI, 권한 거부·409 재시도, 거짓 성공률 KPI, 자동 추적 금지.
- **P1 BOARD1210-10** — 격리 PostgreSQL TDD, 100건 SAVE/MARK/REMOVE/삭제 동시성, 마이그레이션 체크섬, 기능 OFF 롤백에서 묘비·영수증·기존 게시판 접근 보존.
- 스위치 `board_reading_list` 기본 OFF. 별도 개발 브랜치에서만 구현하고 정확 SHA 전체 CI·보안·격리 PG ACL/백업 복원·공식 Test 인증 웹/Android/금융 회귀·실제 배포 독립 증명·승인 GitOps 카나리 뒤 운영승격. 이미지 빌드 성공만으로 병합/배포하지 않는다. 기획은 코드·DB·Test·Production을 배포하지 않고 타 작업자의 브랜치·PR을 병합/삭제하지 않는다.
- **외부 독립 근거 게이트:** PostgreSQL 행 잠금(https://www.postgresql.org/docs/17/explicit-locking.html), OWASP 인가 지침(https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), W3C 포커스 가림 방지(https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) 발행기관 **3곳 검토**, 신규 중복 제거·최종 승인 **0건**, 누적 승인 **미확인 / 10,000건**. 상태 **BLOCKED / IN PROGRESS**. 문서 3건을 검토한 사실은 독립 승인 근거 10,000건 확보와 다르다.


## v2026.10.24.1208 — F675-109 검증형 회원 게시판 읽기 목록·수동 이어읽기 (기능 추가 / DRAFT / 운영 보류)

### 회차·기준·실제 소스·범위
- Previous 기능 보완 v1206 / Current 기능 추가 v1208 / Next 기능 보완 v1210(잠정). 최신 main `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` 시작·중간 재조회. 선행 v1206 Draft #1082는 미병합 문서 브랜치로 main이 아니다. QA v1211(2026-10-24 07:28 KST) FAILED/운영 보류. 런타임·DB·WLD·Test·Production·기능 스위치·타 작업자 브랜치 변경 없음.
- 소스 확인: `frontend/src/app/board/[postId]/page.tsx`는 공개/회원 게시글을 렌더링한다. `backend/src/board/public-board.controller.ts`와 `public-board.service.ts`는 `member_board_public_get`로 공개 여부를 판단한다. Migration 044의 `member_board_posts`는 UUID와 `deleted_at`, 공개 글 인덱스를 갖는다. 확인한 main 소스·마이그레이션에는 회원 읽기 목록 API/북마크 테이블이 없다. 블로그는 `blog-page-server.tsx`의 로컬 다국어 데이터에 기반해 NestJS 공개 여부 검증 계약이 확인되지 않아 **이번 범위에서 제외**한다. 별도 승인된 발행 매니페스트/백엔드 공개 계약 이후 확장한다. 컬렉션 즐겨찾기나 개발 C의 글자 크기 기능을 중복 구현하지 않는다.
- 목적·대상: 로그인 회원이 **공개된 게시글만 수동 저장**해 기기간 재방문하고, 명시적으로 글 처음/댓글 위치를 표시한다. 자동 스크롤 추적, 읽기 완료 추정, 관심사 프로파일링은 금지한다. 대상은 회원, Android 회원, 집계 지표만 보는 운영자, 권한 있는 개인정보 감사자다. 비회원은 공개 글을 읽되 저장은 로그인 후에만 가능하다. WLD·보상·거래·추천 광고·자동 이메일/푸시와 무관하다.

### 진입점·화면·CTA·상태
- `/board/[postId]`에서 **읽기 목록에 저장 / 저장 취소**, `/account/reading-list`에서 **글 열기 / 댓글부터 이어읽기 / 시작·댓글 표시 / 삭제 / 새로고침**을 제공한다. 계정·게시판에 목록 진입 링크를 둔다. 비회원 저장은 안전한 동일 출처 복귀 경로를 가진 로그인 안내로 연결하고 서버 저장 기록은 만들지 않는다.
- 상태 `guest|loading|not_saved|saving|saved|removing|unavailable|conflict|error|unknown`. 서버 DB 확정 영수증 없이는 저장 성공을 표시하지 않으며 네트워크 불명 상태에서는 **저장 상태 확인** CTA를 보여준다. 빈 목록은 게시판으로 이동한다. 삭제·관리제한·비공개 글은 **이용할 수 없는 글**과 **목록에서 삭제**만 보여주며 기존 제목·작성자·본문·이미지를 노출하지 않는다. 비공개 개인 목록 안의 이용 불가 건수도 외부에 공개하지 않는다.
- 자동 읽기 위치 수집은 없다. `TOP|COMMENTS` 중 명시적 버튼 클릭으로만 위치를 저장한다. CSS 선택자·DOM 경로·임의 URL·자유 입력 앵커를 거부한다. 열기 시 현재 공개 상태를 재확인하고 `/board/<UUID>`의 정규 링크만 사용한다.

### API·인증·Android 제안(미구현)
- `GET /api/v1/board/reading-list?cursor=&limit=20`: 세션+동의, 최대 100, `(saved_at DESC,post_id DESC)` 서명 불투명 키셋 커서, `items:[{postId,savedAt,marker,version,available,publicTitle?}]`, `nextCursor`. 타인/비공개 본문 반환 금지. `GET /api/v1/board/reading-list/:postId`: 본인 저장 상태만, 미저장·타인 404. `POST /api/v1/board/reading-list`: 로그인+CSRF+동의, `{postId:UUID}`, `Idempotency-Key:UUID`. `PUT /api/v1/board/reading-list/:postId/marker`: `{marker:TOP|COMMENTS}`, `If-Match:version` 및 멱등 키. `DELETE /api/v1/board/reading-list/:postId`: 같은 권한과 멱등 키. 성공 시 DB 확정 `{receiptId,postId,version,state,savedAt?}` 반환.
- 서버는 회원 ID를 세션에서만 결정한다. 400 잘못된 UUID/위치, 401 미로그인, 403 CSRF·동의, 404 비공개·타인·미저장, 409 구버전·다른 본문으로 키 재사용·저장 한도, 429 호출 제한, 503 확정 불명(상태 재조회) 처리. Next 서버 전용 BFF에서 세션·CSRF를 전달하고 내부 토큰 노출 금지. Android `/app-api/v1/board/reading-list/*`는 **제안**이며 route-map·허용 목록·기기 세션 검증 후 개발한다. 모든 개인 응답은 `Cache-Control: private, no-store`.

### DB 제약·인덱스·원자성·보존
- 개발 단계에서 기존 미병합 Migration 280/281 및 main 이력을 조정한 뒤 **새 순방향 마이그레이션** 번호를 지정한다. `member_board_reading_list(user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,post_id uuid NOT NULL REFERENCES member_board_posts(id) ON DELETE RESTRICT,saved_at timestamptz NOT NULL,updated_at timestamptz NOT NULL,removed_at timestamptz,marker text NOT NULL DEFAULT 'TOP' CHECK(marker IN ('TOP','COMMENTS')),version bigint NOT NULL DEFAULT 1 CHECK(version>0),PRIMARY KEY(user_id,post_id))`. 활성 목록 부분 인덱스 `(user_id,saved_at DESC,post_id DESC) WHERE removed_at IS NULL`. 게시글 제목·본문의 사본은 저장하지 않는다.
- `member_board_reading_requests(user_id uuid,idempotency_key uuid,request_hash bytea,receipt_id uuid UNIQUE,post_id uuid,operation text CHECK IN ('SAVE','MARK','REMOVE'),result_version bigint,created_at timestamptz,PRIMARY KEY(user_id,idempotency_key))`와 불변 `member_board_reading_events(id uuid PK,user_id uuid,post_id uuid,event_type text,version bigint,created_at timestamptz)` 및 `(user_id,created_at DESC,id DESC)` 감사 인덱스. 세션 토큰·IP·열람시간·자동 탐색이력·임의 앵커 저장 금지. 삭제 묘비/감사기록 보존 90일은 개인정보·법률 검토 전 **제안**이며 필수 보안기록 임의 삭제 금지.
- 고정 `search_path=pg_catalog,pg_temp`를 가진 본인 검증 `SECURITY DEFINER` 함수, `PUBLIC EXECUTE` 철회, 허용된 함수 `EXECUTE`만 앱 역할에 부여, 테이블 직접 DML 금지. SAVE는 `member_board_public_get`과 동일한 공개 조건을 트랜잭션에서 검사하고 삭제·제한 변경과 경합하지 않도록 글 행을 잠근다. 회원 users 행을 SELECT ... FOR UPDATE로 잠가 회원별 활성 건수 검사를 직렬화하고 최대 500건 한도를 원자적으로 검사하며 동일 회원+글 행 잠금·원본 멱등 영수증·이벤트를 함께 확정한다. 동일 키/동일 지문은 **최초의 역사적 영수증**을 반환하되 현재 저장 상태는 별도로 재조회한다(과거 저장 영수증은 현재 저장 보장이 아님). 다른 지문은 409. REMOVE는 버전 묘비를 남겨 오래된 SAVE/MARK가 되살리지 못하게 하며 재저장은 새 명시적 키와 버전으로만 허용한다. 조회 시 현재 공개 여부 재검증, 삭제 글의 제목·작성자 캐시 유출 0. WLD 원장 변경 없음.

### 관리자·보안·SEO·접근성·KPI
- 일반 관리자 화면에는 회원별 목록을 노출하지 않는다. `GET /api/v1/admin/board/reading-list/metrics`는 저장/삭제 건수, 공개 차단, 409/429/5xx, p95 지연만 충분히 집계해 작은 표본은 숨긴다. 예외 개인정보 조사 시 별도 역할·최근 재인증·사유·불변 감사가 필요하고 일괄 내보내기는 기본 금지. 초안 제한: 회원당 분당 쓰기 30건, 활성 저장 500건, 운영 기준선으로 조정. BOLA·CSRF·재전송·열거·악성 입력·부하 테스트 필요.
- 개인 목록/저장 상태는 `noindex,nofollow`, 사이트맵 제외, `private,no-store`. 공개 게시글의 canonical/SEO는 유지하고 삭제 글은 목록을 통해 부활시키지 않는다. 320px·200% 확대, 44px 터치, 의미 있는 버튼, 키보드·포커스, 저장 토글 `aria-pressed`, 확정 상태만 `role=status`, 오류는 `role=alert` 및 WCAG 2.2 AA. Android도 동등한 레이블과 권한, 백그라운드 읽기 추적·푸시 권한 추정 금지.
- KPI: 저장 확정/CTA 노출, 7일 내 명시적 재방문(집계), 비공개 원천 차단, 409/불명 영수증, 목록 지연 p50/p95, 개인정보 불만·타 회원 접근 실패. 개인 ID·탐색 기록을 분석에 적재하지 않는다. 실제 기준선 없는 성장 목표 수치 발명 금지. 안전 기준: 타인 노출 0/100, 삭제 글 제목 유출 0, 거짓 성공 영수증 0.

### P0/P1 개발 백로그·회귀·승격 차단
- **P0 ENV1208-01** — 운영·개발 공유 DB `woldeok_moneyverse_dev` 격리, PostgreSQL 5433 와일드카드 바인딩을 승인된 네트워크 정책으로 보호하고 실제 연결 대상을 분리 증명.
- **P0 SEC1208-02** — 앱 역할 DML 241개 중 235개 테이블, 은행 함수 `PUBLIC EXECUTE` 3개를 순방향 최소권한 변경 및 실 PostgreSQL 권한 거부 테스트로 해결. 운영 임의 REVOKE 금지.
- **P0 REL1208-03** — QA v1211 린트/프론트 실패, main pnpm audit Critical4/High10, bot Critical1/High4, Migration266 체크섬 근거, 정확 SHA CI/Test, 격리 백업복원 및 승인 GitOps 게이트. QA #1076 CI 성공은 실제 Test/운영 승인과 다름.
- **P0 BOARD1208-04** — 공개 글 조회·삭제·관리제한 조건과 저장 경합, 100건 저장 대 삭제 경쟁, 타인/비공개 존재 노출 및 오래된 제목 누출 0 검증.
- **P1 BOARD1208-05** — 순방향 DB·본인 SECURITY DEFINER·동일 키 100건 동시 영수증 1개·서로 다른 지문 100건 409·버전 묘비·500건 한도.
- **P1 BOARD1208-06** — 회원 웹 저장/삭제/목록/빈 상태/접근불가/불명 영수증, 동일 시각 10,001건 키셋 커서 무누락.
- **P1 BOARD1208-07** — 명시적 TOP/COMMENTS 위치, If-Match CAS, 세션 전환 격리, 안전한 정규 URL, 자동 추적 금지.
- **P1 BOARD1208-08** — Android App API 계약 동등성, 관리자 집계 전용 지표, 역할/CSRF/재인증 거부 테스트.
- **P1 BOARD1208-09** — 개인정보 보존·삭제 검토, SEO 분리, WCAG 2.2 AA 320px/200% 확대, 개인정보 최소 KPI.
- **P1 BOARD1208-10** — RED/GREEN·실 PostgreSQL·계약·웹/Android·QA 회귀, 마이그레이션 연속성, 동시성/멱등성/404·409·429·503/삭제 경합/10,001 커서/기능 OFF 롤백.
- 신규 스위치 `board_reading_list`는 기본 OFF. 별도 개발 브랜치에서 마이그레이션·코드를 구현하고 최종 정확 SHA의 전체 린트·타입·빌드·테스트·보안감사, 격리 PostgreSQL ACL, 백업 격리복원, 공식 Test 인증 사용자·Android·금융 회귀, 단계적 카나리 통과 뒤 승인된 GitOps 무중단 운영승격. OFF 시 신규 저장·수정만 중지하고 묘비/영수증/개인정보 기록은 보존, 구버전 클라이언트 재활성화 차단. 기획 예약은 병합·배포하지 않는다.
- **독립 근거 게이트:** OWASP API1 (https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/), PostgreSQL ON CONFLICT (https://www.postgresql.org/docs/17/sql-insert.html), W3C WCAG 2.2 (https://www.w3.org/TR/WCAG22/) 발행기관 3곳 검토. **승인된 독립 레퍼런스 3건이라는 뜻이 아님.** 신규 중복 제거 승인 **0건**, 누적 승인 **미확인**, 목표 **10,000건**, 게이트 **BLOCKED / IN PROGRESS**.


## v2026.10.24.1206 — F675-108 접근성 환경설정: 계정·첫 화면·동기화 무결성 강화 (기능 보완 / DRAFT / 운영 보류)

### 회차·소스·목적
- Previous 기능 추가 v1204 / Current 기능 보완 v1206 / Next 기능 추가 v1208(잠정). 시작·중간 기준 main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede 동일, v1204는 미병합 Draft. QA v1209(2026-10-24 06:45 KST) FAILED/HOLD. 문서 기획만 수행하며 런타임·DB·WLD·Test·운영·기능 스위치·다른 작업자 브랜치 변경 없음.
- frontend/src/app/layout.tsx에는 SiteShell 이전 POINT_PREFERENCE_SCRIPT와 next-themes ThemeProvider, frontend/src/lib/theme.ts에는 wdmv.theme/wdmv.point가 있다. globals.css/cosmetics.css는 OS 움직임 줄이기를 이미 지원한다. 계정 화면에는 접근성 링크가 없고 backend/src/account/account.controller.ts에는 SessionGuard/AuthenticatedGuard/ConsentGuard 및 쓰기 CsrfGuard가 있다. 신규 접근성 API·DB는 확인되지 않았다. 테마·포인트색·세션/기기 관리·OS 설정을 중복 구현하지 않는다.
- 확인된 운영 사고가 아닌 설계 위험: 진행 중 회원 응답의 계정 간 덮어쓰기, 공용 localStorage에 서버 스냅샷 유출, 버전 없는 DELETE 후 오래된 요청의 재활성화, 사이트 CSS의 OS 강제 색상·움직임 줄이기 무력화.

### 진입점·CTA·상태·우선순위
- 방문자 /accessibility, 회원 /account/accessibility, 계정/유틸리티 바로가기. 글자 100/125/150/175/200%, 대비 기본/높음, 움직임 기기 설정 따름/줄이기. CTA 미리보기·이 기기에 저장·내 기기 간 동기화(명시적 선택 전 OFF)·버전 비교·이 기기 값 사용·다른 기기 값 사용·재시도·기기 초기화·동기화 중단. 로그인·WLD 확인·보안 알림을 이 설정에 종속시키지 않는다.
- PREVIEW_UNSAVED(메모리), LOCAL_SAVED(기기만), SERVER_CONFIRMED(서버 확정 영수증), SYNC_PENDING, CONFLICT, OFFLINE, SAVE_FAILED, SYNC_DISABLED를 분리한다. aria-live로 실제 저장 위치를 안내하고 요청 전송만으로 완료 표시 금지. 오프라인 변경은 로컬에만 반영하고 재연결 시 자동 동기화 금지.
- OS forced-colors가 사이트 고대비/포인트색보다 우선, OS reduced-motion이 앱 움직임 선택보다 우선한다. 앱은 움직임을 더 줄일 수만 있다. Canvas/CanvasText, ButtonFace/ButtonText 등 시스템 색상 짝과 포커스·테두리를 사용하며 전역 forced-color-adjust:none 금지. 브라우저 확대·Android 글꼴 확대를 제한하지 않고 기존 next-themes class/포인트색 저장 책임을 보존한다. 밝음/어두움·forced-colors·prefers-contrast 조합 검증.
- 첫 화면에서 wdmv.accessibility.v1 JSON을 UTF-8 512바이트 이하, version=1, 정확한 필드·열거값만 수용한다. 루트 속성 data-a11y-scale(100|125|150|175|200), data-a11y-contrast(standard|high), data-a11y-motion(device|reduce)만 허용하며 임의 CSS/HTML/스크립트 금지. 셸 이전 적용하되 wdmv.theme/point는 변경하지 않는다. 저장소 차단/잘못된 JSON은 OS 안전 기본값, SSR/첫 CSR 일치, 마운트 전 컨트롤 선택 상태 보류, JS 차단 시 기본 화면 가독성 유지.
- 사용자가 직접 저장한 기기 설정은 계정 전환 후 남을 수 있지만 서버 회원 스냅샷·계정 ID를 공용 localStorage에 저장하지 않는다. 서버 스냅샷은 세션 메모리만 사용한다. 로그아웃·계정 전환·동의 철회·만료 시 auth-generation 증가, 진행 중 GET/PUT/DELETE 응답 폐기, 서버 유래 루트 속성 제거, 명시적 로컬 설정만 재적용. 탭 간 신호에는 회원 ID/값/영수증을 포함하지 않는다. 로컬과 서버가 다르면 명시적 비교 후 선택하며 조용한 덮어쓰기 금지.
- 충돌 화면에 로컬 미리보기·서버 버전/시각과 두 선택을 제공한다. 기기 초기화는 서버 동기화 철회가 아니며 동기화 중단은 버전 있는 서버 작업이고 로컬 설정을 보존한다. 오류/재시도는 키보드·스크린리더 접근 가능해야 한다.

### API·DB·동시성·개인정보 (제안, 미구현)
- GET /api/v1/account/accessibility-preferences는 인증된 본인에게만 200 {syncEnabled,textScalePct,contrastMode,motionMode,version,updatedAt}, 강한 ETag "vN"; 행이 없으면 200 {syncEnabled:false,values:null,version:0}, ETag "v0". API/BFF/엣지 private,no-store. 요청의 userId를 신뢰하지 않는다. 웹 세션·동의·쓰기 CSRF, Android 동등 인증·소유권 검증.
- PUT는 If-Match:"vN", Idempotency-Key UUID 및 {textScalePct:150,contrastMode:"high",motionMode:"reduce",syncEnabled:true}를 요구한다. 기본 동의 추정 금지. 확정 영수증 {receiptId,operation:"UPSERT",committedVersion,serverConfirmedAt,replayed}. DELETE는 If-Match·UUID로 동기화 중단, operation:"DISABLE" 영수증; 행 삭제/버전 초기화 금지. 같은 키/지문 재전송은 나중에 버전이 바뀌어도 최초 영수증 반환, 현재 상태라고 표시하지 않는다.
- 401 미인증, 403 권한/동의 거부, 409 VERSION_CONFLICT(현재 버전만 제공, GET 비교) 또는 IDEMPOTENCY_KEY_REUSED(다른 내용/작업), 422 ETag/UUID/값 오류, 429 사용자별 속도 제한, 503 장애. 미리보기·로컬 저장은 서버 쓰기 없음. 내구성 있는 영수증 없이 동기화 성공 표시 금지.
- 추가형 member_accessibility_preferences(user_id UUID PK FK users(id), text_scale_pct SMALLINT CHECK 100/125/150/175/200, contrast_mode CHECK standard/high, motion_mode CHECK device/reduce, sync_enabled BOOLEAN NOT NULL DEFAULT FALSE, version BIGINT NOT NULL CHECK>0, updated_at timestamptz, disabled_at nullable). receipts(id UUID PK,user_id UUID FK,idempotency_key UUID,operation UPSERT/DISABLE,request_digest bytea 길이32,committed_version bigint,created_at timestamptz,UNIQUE(user_id,idempotency_key)). 본인 조회는 PK 인덱스 활용, 불필요한 user_id 인덱스 추가 금지. 영수증·로그·분석에 원시 값 저장 금지.
- SECURITY DEFINER 함수는 SET search_path=pg_catalog,pg_temp, public 객체 완전 수식, 앱 계정만 EXECUTE. 본인·동의·정규화된 지문 확인 후 최초 삽입은 회원 잠금/advisory lock, 이후 행 잠금과 버전 CAS로 직렬화한다. 한 트랜잭션에서 값/버전 변경과 영수증 기록을 원자적으로 확정한다. DISABLE은 버전 증가 tombstone(sync_enabled=false, disabled_at)을 남겨 오래된 재활성화 차단. 앱 직접 DML·PUBLIC EXECUTE 금지. 동일 키 PUT 100건 -> 변경/영수증 각 1건, 서로 다른 키 구버전 PUT 100건 -> 최대 1회 증가, PUT/DISABLE 100건 -> 단조 버전·철회 부활 0건. 격리 PostgreSQL 실제 권한 거부 테스트 필수.
- 장애 추정·기기 지문·관리자 개인별 열람·광고 개인화·회원 연계 분석 금지. tombstone/영수증 보존 및 계정 삭제 처리는 법률/개인정보 검토 후 확정, 무단 무기한 보존 금지. WLD 잔액·원장·금융 권한 영향 없음.

### 관리자·모바일·SEO·접근성·배포·백로그
- /admin/experience/accessibility는 익명 집계만, 개인별 조회/변경 금지. 모든 코호트 k>=10 및 필터 조합 차분 추론 방지, 부족하면 표본 부족. KPI: 미리보기→로컬 저장, 동기화 선택률, 확정 영수증률, 충돌률, 비인가 공개(목표 0), WCAG 실패, 200% 글자/320px 핵심 과업, 첫 화면 변화 p95. 기준값 미확인. 세 설정 화면 noindex/nofollow·사이트맵 제외, 개인 API/BFF private,no-store.
- Android App API는 OS 글꼴·대비·움직임 줄이기 우선, WebView localStorage 비의존, 웹과 같은 동의·ETag·UUID 영수증·철회 tombstone. TalkBack·스위치·오프라인·계정 전환 검증. WCAG 2.2 AA 일반 대비 4.5:1·큰 글자 3:1, 글자 200% 확대, 320 CSS px 리플로(1280px에서 400% 확대), 1.4.12 글자 간격, 가려지지 않는 키보드 포커스. WLD 부호/금액·주문 확인·오류 의미 보존. 기존 가로 스크롤 잠금이 중요 내용을 숨기지 않는지 검사. Safari/Chrome/Firefox, 강제 색상, JS/저장소 차단 검증.
- P0 ENV1206-01 — 운영/개발/Test DB 및 5433 격리, 격리 백업 복원 증명 (#1053/#1060/#1066).
- P0 SEC1206-02 — 앱 계정 최소권한/PUBLIC 은행 EXECUTE 철회, 격리 PG 거부 테스트 (#993).
- P0 REL1206-03 — Migration266, 전체 pnpm 감사(치명적2/높음8 #1075), bot 감사(치명적1/높음4 #1077), 실제 3회 E2E(#1078), 정확 SHA CI/Test/GitOps.
- P0 A11Y1206-04 — 지갑/주문/고객지원/관리자 대비·320px/400%·OS 움직임/강제 색상·포커스 기준선, 중요 실패 시 출시 차단.
- P1 A11Y1206-05 — 제한된 첫 화면 파서·SSR hydration·JS/저장소 장애·기존 테마/포인트색 보존.
- P1 A11Y1206-06 — auth-generation 계정 격리·충돌 화면·오프라인·탭 간 비노출 신호.
- P1 A11Y1206-07 — 본인 API·ETag/CAS·버전 철회 tombstone·원자적 원본 영수증.
- P1 A11Y1206-08 — 의미 기반 CSS·OS 우선·200%/320px·금융 의미 회귀.
- P1 A11Y1206-09 — Android 동등성·관리자 최소 표본 집계·SEO/no-store·개인정보/KPI/악용방지.
- P1 A11Y1206-10 — 100건 동시성/타 회원 거부·브라우저/TalkBack/JS 차단/오프라인·Test 정확 SHA·롤백.
- 기능 스위치 기본 OFF. QA v1209 후보 로컬 lint/typecheck/build/test PASS는 전체 출시 PASS가 아니다. 운영/개발 DB 공유, 241개 중 235개 앱 DML, PUBLIC 은행 함수 3개, Migration266, 전체/bot 보안 감사, 정확 SHA 공식 Test 인증 E2E·격리 복원 미완료. 별도 개발 브랜치·검토된 전방향 마이그레이션·격리 Test 정확 SHA·승인된 GitOps 카나리 후에만 런타임 변경. 롤백은 스위치 OFF·신규 동기화/CSS 중단, 영수증·OS 접근성 유지, WLD 불변. Gemini/개발 A/B/C/QA 브랜치 미변경.
- 외부 독립 근거 목표 10,000건. W3C·MDN 발행기관 2계열 검토, 신규 중복 제거 승인 0, 누적 승인 수량 미확인 => BLOCKED/IN PROGRESS. 검토 자료: https://www.w3.org/TR/WCAG22/ ; https://www.w3.org/WAI/WCAG22/Understanding/reflow.html ; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors ; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion .


## v2026.10.24.1204 — F675-108 회원별 읽기·상호작용 접근성 환경설정 (기능 추가 / DRAFT / RELEASE HOLD)

### 회차, 기준 문서 및 실제 확인한 공백
- Previous: Feature Improvement v1202; Current: Feature Addition v1204; Next: Feature Improvement v1206(잠정). 시작·중간 main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede 및 국영문 canonical SHA256 불변. 최신 QA v1205 FAILED/HOLD. 코드·DB·Test·Production·WLD 변경 없음.
- 소스 근거: frontend/src/app/account/page.tsx에는 프로필·보안·알림·개인정보 링크는 있지만 접근성 환경설정 화면은 없다. frontend/src/lib/theme.ts는 브라우저별 테마/포인트색 localStorage를 이미 담당하고, globals.css/cosmetics.css는 운영체제 prefers-reduced-motion을 이미 따른다. 이를 중복 구현하거나 덮어쓰지 않는다. frontend/src/app/layout.tsx는 브라우저 확대(최대 배율 5)를 허용한다. 보안 페이지에는 이미 활성 세션 확인·원격 로그아웃이 구현되어 있으므로 기기 관리 기능은 이번 범위에서 제외한다.
- 목적: 저시력·운동 기능 제약·움직임 민감성 등 다양한 사용자가 가독성과 상호작용을 선택적으로 조정하되 기본 접근성과 가상 WLD 잔액은 유지한다. 대상은 비로그인 방문자(해당 브라우저만), 로그인 회원(로컬 우선·명시적 기기간 동기화), Android(운영체제 접근성 우선), 관리자(익명 집계만)이다. 장애 여부 추정·진단·프로파일링은 금지한다.

### 진입점, 화면·CTA·상태 및 사용자 흐름
- 진입점: /account -> /account/accessibility, 사이트 유틸리티와 로그인 화면의 접근성 바로가기; 비로그인 /accessibility. CTA: 미리보기, 글자 100/125/150/175/200%, 대비 기본/높음, 움직임 기기 설정 따름/줄이기, 이 기기에 저장, 내 기기 간 동기화(명시적 동의), 초기화, 기기 설정 복원. 기존 밝음/어두움/포인트색 설정은 별도 브라우저 저장 방식으로 유지한다.
- 미리보기는 즉시 적용하되 서버 저장 성공으로 표시하지 않는다. 상태 LOCAL_ONLY, SYNC_PENDING, SYNCED(version), CONFLICT, OFFLINE, SAVE_FAILED. 저장 전 미리보기·브라우저 저장·서버 확정 영수증을 구분한다. 실패 시 읽기 쉬운 로컬 표현을 유지하고 재시도/이 기기에만 유지 CTA를 제공한다. 로그인·거래 확인·중요 경고를 설정 화면에 종속시키지 않는다.
- 최초 방문에서는 OS/브라우저의 움직임 줄이기와 강제 색상·대비 설정을 우선 적용한다. OS에서 움직임 줄이기가 켜졌다면 앱 설정으로 움직임을 다시 활성화할 수 없다. 앱은 더 줄일 수만 있다. 높은 대비는 검증된 의미 기반 팔레트만 사용하고 임의 전경/배경색 입력이나 forced-colors 비활성화를 허용하지 않는다. 앱 글자 크기 조절은 브라우저 확대를 제한하지 않는다.
- 방문자는 로컬 설정만 사용한다. 로그인 회원의 기기간 동기화는 기본 OFF이고 명시적으로 선택해야 한다. 계정 전환·로그아웃 시 이전 계정의 동기화 스냅샷을 제거하되 사용자가 별도로 선택한 브라우저 로컬 설정은 임의 삭제하지 않는다. 오프라인/충돌 시 로컬 가독성을 유지한다. 서버 값으로 명시적 로컬 선택을 조용히 덮어쓰지 않고 충돌 화면에 이 기기 값/다른 기기 값과 버전·시각을 표시한다.
- 320px~1280px 모바일, 키보드·스크린리더·큰 글씨, 보이는 포커스, 라벨 있는 라디오/슬라이더, 가능한 44 CSS px 터치 영역, 색상 외 상태 표시, 접근성 live 영역, 움직임 없는 미리보기를 요구한다. 200% 글자 확대와 브라우저 확대에서도 로그인, WLD 금액 부호, 호가 주문, 관리자 확인의 의미가 잘리거나 바뀌면 안 된다.

### 제안 API·DB·트랜잭션·동시성 (미구현)
- 회원 GET /api/v1/account/accessibility-preferences는 본인 허용 필드·버전·updatedAt만 반환한다. PUT는 If-Match 버전 및 Idempotency-Key UUID로 명시적 동기화 설정을 저장하고, DELETE는 If-Match와 함께 서버 동기화 설정을 초기화한다. 비로그인 방문자는 localStorage만 사용하며 서버 API를 호출하지 않는다. 401 미인증, 403 권한 없음, 409 버전 충돌/키 재사용 내용 불일치, 422 범위·열거형 오류, 429 속도 제한, 503 장애. GET은 private/no-store. 서버 세션과 동의 상태에서 소유자를 결정하며 본문 userId를 신뢰하지 않는다. 웹 변경에는 CSRF, Android에는 동등한 네이티브 인증을 적용한다.
- 신규 전방향 마이그레이션 제안: member_accessibility_preferences 테이블에 user_id UUID PRIMARY KEY FK users(id) ON DELETE CASCADE, text_scale_pct SMALLINT CHECK IN (100,125,150,175,200), contrast_mode CHECK IN ('standard','high'), motion_mode CHECK IN ('device','reduce'), sync_enabled BOOLEAN DEFAULT FALSE, version BIGINT NOT NULL CHECK(version>0), updated_at timestamptz. 별도 member_accessibility_preference_receipts에 UNIQUE(user_id,idempotency_key), request_digest bytea(32), committed_version, created_at. (user_id,updated_at DESC) 인덱스는 실제 쿼리 계획에서 필요성이 확인될 때만 추가한다. 자유 형식 CSS·임의 URL·기기 지문·추정 장애 속성은 저장하지 않는다.
- 고정 search_path의 SECURITY DEFINER 함수가 세션·소유권을 확인하고 행 잠금/CAS로 한 트랜잭션에서 범위 검증·예상 버전 비교·요청 지문 결합·단일 행 갱신·영수증 기록을 원자적으로 수행한다. 같은 키·같은 지문은 기존 확정 영수증, 같은 키·다른 지문은 409. 같은 버전의 100개 동시 요청에서는 하나만 버전을 증가시키고 나머지는 409 또는 확정 재전송 응답. 앱 계정 직접 INSERT/UPDATE/DELETE와 PUBLIC EXECUTE 금지; 격리 PostgreSQL에서 거부 테스트가 필요하다.
- 방문자 localStorage 키 wdmv.accessibility.v1은 엄격한 JSON 스키마·길이 제한·허용값 검증을 거친다. 스크립트나 임의 CSS를 받지 않는다. 첫 화면 표시 전 허용된 루트 data 속성만 적용해 화면 번쩍임을 줄이고, 저장소 접근 실패는 비치명적으로 처리한다. 서버 환경설정은 인증 정보나 금융 권한 근거가 아니며 회원 식별 정보와 결합해 로깅하지 않는다. 계정 삭제 시 FK 연쇄 삭제와 보존 정책을 검토하고, 감사에는 상태/버전/작업의 최소 정보만 기록한다.

### 관리자·SEO·보안·분석·배포
- 관리자 /admin/experience/accessibility는 동기화 선택률·저장 실패·접근성 회귀의 집계만 보여준다. 회원별 값 열람/변경 기능은 제공하지 않는다. 집계 공개 최소 표본 >=10; 회원별 추적·기기 지문·원시 값 저장 금지. KPI: 설정 진입, 로컬 미리보기 성공, 동기화 선택, 서버 확정 저장률, 충돌률, WCAG 테스트 실패, 200% 확대 작업 완료율, UI 레이아웃 변화 p95. 기준값은 미확인; 비인가 공개 목표 0건.
- 회원/관리자 화면 noindex/nofollow·사이트맵 제외, API/BFF/엣지 private,no-store 및 공유 캐시 금지. CSS만으로 보안을 달성했다고 주장하지 않는다. WCAG 2.2 AA 일반 글자 대비 4.5:1·큰 글자 3:1, 200% 확대, 320 CSS px 리플로, 포커스·움직임 줄이기를 검증한다. WAI-Adapt는 참고 자료이며 해당 표준을 구현했다고 주장하지 않는다.
- Android App API는 네이티브 글자 크기·OS 움직임 줄이기·강제 대비를 우선하며 웹뷰 localStorage에 의존하지 않고 명시적 동기화 기능을 제공한다. TalkBack·스크린리더 레이블 검증 필수. 접근성 선호를 광고 개인화에 사용하지 않는다.
- 기능 스위치 기본 OFF. Production/개발이 5433 DB를 공유하고 wildcard 바인딩된 상태(#1053/#1060)에서는 DB 마이그레이션과 데이터 테스트를 차단한다. #993 앱 광범위 DML·PUBLIC 은행 EXECUTE, #1067 Next.js Critical2/High1, main 린트/프론트 테스트, Migration266 체크섬, #1066 구형 백업, 격리 복원 및 정확 SHA Test를 먼저 해결해야 한다. 검토된 추가형 마이그레이션만 허용한다. 공식 Test exact-SHA에서 100건 동시성, 소유권 부정 테스트, 스크린리더, forced-colors, 밝음/어두움, OS 움직임, 200% 확대, Android 검증 후 승인된 카나리와 되돌릴 수 있는 스위치로 승격한다. 롤백 시 서버 동기화/새 CSS 속성을 끄되 안전한 로컬 OS 동작과 확정 영수증은 보존한다. WLD/원장 변경 금지.

### P0/P1 개발 백로그 및 수용 기준
- P0 ENV1204-01 — #1053/#1060 운영·개발·Test DB 분리와 5433 외부 바인딩 제한(승인된 변경); 외부 차단·허용된 API·암호화 백업·격리 복원 증명.
- P0 SEC1204-02 — #993 앱 계정 직접 DML·PUBLIC 은행 함수 EXECUTE 권한 최소화; 검토된 전방향 보안 변경, 실제 격리 PG의 타 회원 거부 및 금융 회귀 검증.
- P0 REL1204-03 — #1067/#1066, main 린트/테스트, Migration266, 정확 SHA CI/Test·백업/롤백 장애 해소 전 운영승격 금지.
- P0 A11Y1204-04 — 계정·지갑·주식 주문·고객지원·관리자 중요 흐름의 대비·리플로·키보드·OS 우선순위 기준선; 중요 확인 화면이 접근 불가능하면 출시 차단.
- P1 A11Y1204-05 — 방문자/회원 로컬 설정, 미리보기·초기화, 엄격한 localStorage, 안전한 첫 화면.
- P1 A11Y1204-06 — 회원별 동기화 API·SECURITY DEFINER·버전 CAS·100건 동시 멱등 영수증·409 충돌; 기본 OFF.
- P1 A11Y1204-07 — 의미 기반 CSS 토큰, OS/forced-colors 우선, 검증된 높은 대비, 200% 확대; 기존 테마 저장 책임 유지.
- P1 A11Y1204-08 — Android App API·네이티브 동등성 및 최소 표본 기반 관리자 익명 집계.
- P1 A11Y1204-09 — CSRF·소유권·개인정보·SEO·캐시·악용방지·장애 추정 없는 KPI.
- P1 A11Y1204-10 — PUT 동일 키 100건/구버전 충돌, 타 회원 100회 차단, 320px·200% 글자·400% 브라우저 확대, forced-colors, 스크린리더, 모바일·오프라인·계정 전환·정확 SHA Test·롤백 회귀.
- 작업 소유권: Draft #1065 이후에 쌓는 문서 전용 기획. 개발 A/B/C·Gemini·QA 브랜치 변경 없음. 코드는 별도 개발 브랜치 및 Test exact-SHA 게이트 필수. 외부 독립 근거 10,000건 게이트 BLOCKED: W3C·MDN 2개 발행기관 계열 검토, 신규 중복 제거 승인 0건, 누적 승인 실수량 미확인. 임의 집계 금지.
- 참고 근거(검토했으나 승인 근거 DB에 등록하지 않음): https://www.w3.org/TR/WCAG22/ ; https://www.w3.org/WAI/adapt/ ; https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility .


## v2026.10.24.1202 — F675-107 본인 확인형 개인정보 열람 패키지: 영수증·격리·공개 통제 강화 (기능 보완 / 초안 / 운영승격 보류)

### 회차·확인 근거
- Previous 기능 추가 v1200 / Current 기능 보완 v1202 / Next 기능 추가 v1204(잠정). 시작·중간 main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede. main의 AGENTS.md, README.md, 영어 정본 PROJECT_PLAN.md 및 한국어 대조, v1200 통합 기획, QA v1203(04:39), GitHub PR, 실제 privacy API/저장소/migration 015 확인.
- 기존 privacy/requests GET·POST는 개인정보 요청 접수·영수증 기능일 뿐 데이터 사본 발급 기능이 아님. Migration 015의 RETURNS TABLE 출력변수 created_at과 INSERT RETURNING id, created_at이 충돌할 수 있음. 개발 C Draft PR #1064는 격리 PostgreSQL 17.11에서 SQLSTATE 42702를 재현하고 순방향 migration 280, 안정적 폼 멱등 키를 제안했으나 **main 미병합·미배포**. 기획 예약은 C의 코드를 중복 수정하지 않고 검토·정확 SHA 검증을 선행 의존성으로 지정.
- QA v1203: 운영 API와 개발 백엔드는 5433/woldeok_moneyverse_dev 공유(#1053); 운영 연결 DB Docker 포트가 0.0.0.0 및 [::] 바인딩(#1060), 외부 실제 접속 가능 여부는 미검증. 앱 계정 241개 중 235개 테이블 UPDATE/DELETE, bank SECURITY DEFINER 3개 PUBLIC EXECUTE(#993). Migration 266 체크섬 불일치, main lint·프론트 테스트·Next.js 보안 감사 실패, Test DB 스키마 불일치, 정확 SHA Test/복원 미검증. 공유 DB에 쓰기·마이그레이션·fixture·export worker 금지.
- v1200 범위를 유지하면서 실제 접수 영수증, 법률·기술 승인, 원천별 공개 정책, 객체 원자성, 권한 철회 및 환경 격리를 강화. **문서 기획만 수행**하며 실제 사본 생성·법적 승인·코드 배포·DB 변경이 아님.

### 회원·관리자·상태 및 진실성
- 회원 경로 /account/privacy → /account/privacy/packages; CTA 사본 신청, 본인 재확인, 상태 확인, 포함/제외 항목 확인, 다운로드, 문제 신고. ACCESS_REQUEST_RECEIVED(기존 접수), PACKAGE_QUEUED(새 작업 커밋), PACKAGE_READY(객체 검증·공개 승인)를 엄격히 구분. 접수 행 존재나 성공 URL만으로 발급·완료 표시 금지.
- 접수 재시도는 정규화된 종류/설명이 동일하면 폼별 UUID 재사용, 서버 영수증의 ID·소유자·종류·상태·키 검증 후 성공 표시. 같은 키 다른 내용은 409, 결과 불명은 이력 확인과 안전 재시도 안내, 42702/500은 실패 처리. 개발 C #1064와 순방향 280 검증에 연계하며 기획 브랜치에서 코드 복제 금지.
- 패키지 상태 VERIFY_REQUIRED → QUEUED → SNAPSHOTTING → POLICY_REVIEW → APPROVED → ENCRYPTING → READY → DOWNLOADING → DOWNLOADED 또는 EXPIRED; REJECTED_WITH_REASON, CANCELLED, RETRY_PENDING, REVOKED, OBJECT_UNAVAILABLE 예외. APPROVED≠READY. 객체 누락·해시 오류·심사 철회·암호키 폐기 시 READY 금지. 1회 다운로드 도중 연결이 끊겼으면 실제 다운로드 성공이라고 주장 금지.
- 회원 세션·최근 재인증(제안 10분 이내) 필수. 관리자 privacy.review와 privacy.release 분리, 민감 범주 2인 승인·최근 재인증·CSRF·사유 감사. 탈퇴/제한 계정은 법적 권리 행사 별도 경로. 신분증 업로드를 기본 요구하지 않음. 포함·제외 사유, 기준시각, 만료, 비식별 영수증만 노출.

### 데이터·API·DB·동시성 계약
- 버전형 원천별 허용 필드: 본인 프로필, 동의·요청 이력, 본인 작성 공개 콘텐츠, 본인 원장 분개·가상 WLD 금액의 정확한 문자열, 알림 설정. DM·지원 증빙·OAuth 토큰·금융 비밀·관리자 기록·제3자 식별자·삭제/비식별 정보는 기본 제외. 법적 예외는 별도 심사 사례번호와 감사가 필요하며 전체 테이블 SELECT * 내보내기 금지.
- 제안 API(미구현): POST /api/v1/privacy/access-packages {privacyRequestId,idempotencyKey,requestedCategories,disclosurePolicyVersion}은 작업·이벤트·outbox 커밋 후에만 202. GET /:id 및 서명 키셋 목록은 본인만, POST /:id/download-intent는 최근 재인증+CSRF, GET /:id/download는 세션 결속 1회 권한 원자적 소비. 관리자 /api/v1/admin/privacy/access-packages/:id/review 및 /release는 expectedVersion·사유·권한·이중 승인. 401 미인증, 403 권한 없음, 404 타인/미존재 구분 불가, 409 충돌, 410 만료/철회, 423 심사 보류, 503 장애. 객체 저장 경로는 절대 반환 금지.
- 제안 순방향 스키마: packages UNIQUE(owner_user_id,idempotency_key), 32바이트 request_digest, source_policy_version, state_version, owner+privacy_request 복합 FK; events append-only UNIQUE(package_id,version); artifacts UNIQUE(package_id,object_id), SHA256, 암호화 키 버전·크기·검증시각; grants UNIQUE(grant_hash), consumed_at, expires_at, session_fingerprint, revoked_at. (owner_user_id,created_at DESC,id DESC), worker lease용 부분 인덱스, 만료 삭제 인덱스. SECURITY DEFINER 고정 search_path, 요청·소유자 일치 강제, 앱 직접 DML/PUBLIC EXECUTE 금지.
- 작업·이벤트·outbox 원자적 생성 → lease/epoch 선점 → 범위 제한 일관 스냅샷 읽기 → 비공개 암호화 객체 업로드·해시/manifest/정책/승인 검증 → CAS READY+감사. 업로드 성공만으로 READY 금지; 실패 시 고아 객체 정리. 재심사/철회는 버전 증가 및 권한 폐기, 이후 **새 스트림 시작 금지**. 이미 전송된 바이트를 회수한다고 약속하지 않음. 다운로드 권한은 스트리밍 전에 원자적으로 소모, 실패 재시도는 재인증 후 새 권한.
- UTF-8 JSON 우선, CSV 수식 주입 무력화, ZIP 고정 경로·압축폭탄/심볼릭 링크/경로 탐색 차단, 크기·실행시간 상한, 암호화 저장·TLS·private/no-store/nosniff/no-referrer. 브라우저 분석·공유 캐시에 개인정보 금지. 보관기한은 법률 검토 후 확정, 백업까지 즉시 물리 삭제됐다는 주장 금지.

### 운영·접근성·지표·배포
- 관리자 화면은 가린 건수·원천 정책 버전·대기시간·승인/공개/철회 감사를 표시하고 원문 기본 미노출. Kill switch는 새 작업/권한만 중단하고 요청·감사 보존. Android App API 동일 소유권·재인증 및 OS 비공개 저장. 320px, WCAG 2.2 AA, 키보드·초점·상태 알림; 회원/관리자 noindex·sitemap 제외, BFF/API/edge/객체 no-store.
- KPI: 접수 영수증 정확도, READY 객체 무결성, 심사 대기 p50/p95, 타 회원 차단, 정책 버전 불일치, 권한 재사용 시도, 만료 삭제 지연, 무단 공개 목표 0. 기준값 UNKNOWN; 법적 처리기한은 개인정보 책임자 확인 전 임의 약속 금지.
- 기본 OFF. #1053/#1060 환경 연결 신원(host/port/db/user) 및 외부 접근 차단 증명 → 순방향 migration 검토 → 실제 격리 PG 소유자 부정 테스트 → 전체 보안 감사/CI → 정확 SHA 공식 Test 인증 E2E·암호화 복원 → 카나리·롤백. 과거 015/266 변경 금지. 실패 시 작업·다운로드 중단, 권한 폐기, 요청·감사 보존, 고아 객체 정리, WLD 자동 변경 없음. 개발 A/B/C/QA/Gemini 변경 영역은 유지.

### P0/P1 개발 백로그·수용 조건
- P0 ENV1202-01: #1053/#1060 운영/개발 DB 격리 및 5433 wildcard 노출 차단을 승인된 변경으로 수행; 외부 차단·정상 API/백업·Test 신원 증명.
- P0 PRIV1202-02: C Draft #1064의 migration 015 SQLSTATE 42702 격리 재현, 순방향 280·폼 키·확정 영수증 검토/통합/정확 SHA 검증. 중복 마이그레이션 금지.
- P0 SEC1202-03: #993 앱 광범위 DML/PUBLIC bank EXECUTE 제한, 회원별 접근 및 관리자 privacy.review/release 분리, 격리 PG 부정 테스트.
- P0 REL1202-04: QA v1203 Next.js Critical2/High1, lint/블로그 테스트, 266 출처, Test 동등성·정확 SHA·백업 복원. 운영승격 보류.
- P1 PRIV1202-05: 회원·요청 복합 제약, 버전형 공개 정책, 원천 허용 필드, 불변 manifest·제3자 예외 심사.
- P1 PRIV1202-06: lease fencing, 제한적 export, 객체+DB READY CAS, 손상/철회/고아 객체 처리.
- P1 PRIV1202-07: 세션 결속 1회 다운로드, 철회·만료 거부, 진실한 재시도 영수증, 비공개 캐시.
- P1 PRIV1202-08: 회원·관리자·Android UX, WCAG/320px, SEO, 비식별 감사·KPI.
- P1 PRIV1202-09: 같은 키 동시 100건→작업/영수증 1건, 다른 내용 재사용 100건→409, 타 회원 100건→공개 0, 다운로드 동시 100건→소모 최대 1회, 동일 시각 10,001건 키셋 누락 0, 객체 손상/누락 READY 0, 철회 후 새 스트림 0, 38자리 WLD 문자열 보존, CSV/ZIP 악성 입력 차단, 격리 Test·복원·롤백 검증.
- 외부 독립 참고 발행기관: PostgreSQL, OWASP, EDPB 3곳 검토. 신규 독립 분류·중복 제거 최종 승인 근거 **0건**, 누적 승인 **UNKNOWN/10,000**, gate **BLOCKED / IN PROGRESS**. 참고: https://www.postgresql.org/docs/current/plpgsql-implementation.html ; https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html ; https://www.edpb.europa.eu/documents/guideline/guidelines-012022-on-data-subject-rights-right-of-access_en . 법률 자문이나 10,000건 확보 증명이 아님.


## v2026.10.24.1200 — F675-107 본인 확인형 개인정보 열람 패키지 (기능 추가 / 기획 초안 / 운영승격 보류)

### 회차·근거·범위
- Previous: 기능 보완 v1198 / Current: 기능 추가 v1200 / Next: 기능 보완 v1202(잠정). 시작·중간 최신 main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede. main의 AGENTS.md, README.md, PROJECT_PLAN.md(영어 정본), PROJECT_PLAN.ko.md(한국어 대조) 확인. 미병합 Draft #1052 후속 기획으로 실제 기능 구현·테스트 통과·법률 자문·배포를 의미하지 않음.
- 소스 확인: /account/privacy는 개인정보 열람 요청을 기록·표시하지만 다운로드 가능한 완성 데이터 사본은 제공하지 않음. privacy.controller.ts는 GET/POST privacy/requests, 세션·인증·동의 검사와 POST CSRF를 사용. privacy.repository.ts의 요청 상태는 received뿐이며 migration 015는 외부 전송 주소, 파일, 자동 데이터 내보내기와 계정 변경을 명시적으로 금지. 기존 지갑 CSV는 전체 개인정보 사본이 아님. 요청 접수를 패키지 생성 성공으로 표현 금지.
- **QA v1201의 중요 정정:** 운영 공개 API 3343과 개발 백엔드 3000은 모두 127.0.0.1:5433/woldeok_moneyverse_dev를 사용. 이름에 dev가 있어도 **실제 운영 API 연결 DB**임. 공식 Test 3363은 별도 5585/wdmv_v761_test_acl 사용. 이 회차에서 5433 DB에 쓰기·마이그레이션·fixture·권한 실험·패키지 작업 절대 금지. #1053 환경 분리 승인과 증명이 선행되어야 함. 이전 보고서의 운영 DB 별개 추정은 최신 QA로 정정됨. 운영 연결 DB 원장 877거래/1,784전표/불균형 0은 읽기 전용 측정이며 운영 금융 E2E 인증은 아님.
- 목적: 기존 열람 요청을 재사용하여 **본인의 허용된 정보만** 별도 신원 재확인 후 확인·다운로드. 국내 법률의 실제 적용 범위는 검토가 필요하며 GDPR 이동권을 국내 서비스에 자동 적용한다고 주장하지 않음. 다른 회원 정보·비밀번호·토큰·관리자 내부 기록·비공개 지원 증빙 기본 제외. 이 기능에서 WLD 변경 없음.

### 이용자·관리자·화면·상태
- 회원: /account/privacy -> 내 열람 요청 -> 비공개 사본 신청 -> /account/privacy/packages. CTA: 사본 신청, 본인 재확인, 상태 확인, 포함 항목 보기, 1회 다운로드, 재신청, 검토 요청. 기존 개인정보 열람 요청의 소유권·종류(access)를 확인한 뒤 별도 패키지 작업을 시작. 접수와 완료를 분리.
- 회원 권한: 활성 계정, 유효 세션, 동의, 최근 재인증(설계 목표 10분 이내). 탈퇴·제한 계정은 법적 권리 행사 경로를 안내하며 가짜 성공 메시지를 표시하지 않음. 관리자 privacy.review와 privacy.release를 분리하고 최근 관리자 재인증·CSRF·사유 감사 기록 필수. 민감 범주에 대해서는 이중 승인; 담당자의 자기 승인 금지.
- 상태: NOT_REQUESTED -> VERIFY_REQUIRED -> QUEUED -> COLLECTING -> REVIEW_REQUIRED -> READY -> DOWNLOADED 또는 EXPIRED. 예외 REJECTED_WITH_REASON, FAILED_RETRYABLE, CANCELLED, UNAVAILABLE. 서버 확정 영수증과 실제 비공개 객체 검증 없이는 READY 표시 금지. 이의신청·법적 제한 근거 표시, 자동 처리 완료 기한 약속 금지.
- 포함: 본인 프로필, OAuth 제공자 이름(토큰 제외), 동의 이력, 본인 개인정보 요청 이력, 허용된 본인 작성 공개 게시글·댓글, 본인 소유 원장 분개·잔액의 정확한 가상 WLD 문자열(상대방·비공개 메모 제외), 본인 알림 설정. 비공개 대화·고객지원 증빙·제3자 정보·보안 비밀은 별도 법적 검토 전 기본 제외. 항목별 원천·기준시각·개수·허용 필드·제외 이유를 manifest에 기록. UTF-8 JSON 우선, CSV는 수식 주입 차단, ZIP 경로 제한과 50MiB 상한(측정 후 조정).

### API·DB·트랜잭션·보안
- 제안 API: GET /api/v1/privacy/access-packages?cursor&limit=1..25(본인, 서명 커서, no-store); POST /api/v1/privacy/access-packages {privacyRequestId,idempotencyKey UUID,categories[]} (세션·CSRF·최근 재인증), 202 {packageId,state:QUEUED,receiptId,createdAt}는 원자적 커밋 후에만 반환. 같은 회원/키/내용은 기존 영수증, 같은 키 다른 내용은 409. GET /:id는 본인 상태와 최소 manifest; POST /:id/download-intent는 최근 재인증·CSRF로 1회성 세션 결속 다운로드 권한 발급, GET /:id/download는 서버에서 원자적으로 소모한 권한만 허용하며 URL에 토큰 금지. 관리자 GET /api/v1/admin/privacy/access-packages와 POST /:id/review 또는 /release는 고급 권한·버전·사유 필수. Android App API는 동일 권한·오류·최소 버전 계약과 OS 비공개 저장 적용.
- DB(미적용 제안): privacy_access_packages(id UUID PK, owner_user_id FK, privacy_request_id FK, state CHECK, version>0, request_key UUID, request_digest 32바이트, 허용 categories, requested_at, expires_at 등), UNIQUE(owner_user_id,request_key), 인덱스 (owner_user_id,requested_at DESC,id DESC), (state,requested_at,id), 원 개인정보 요청과 동일 소유자 강제. privacy_access_events는 append-only UNIQUE(package_id,version); privacy_access_artifacts는 package_id UNIQUE, private_object_id UNIQUE, sha256 32바이트, manifest_hash, 크기<=50MiB, 암호화 키 버전·만료일. 1회 다운로드 권한은 해시·사용시각·세션 결속으로 저장. 공개 버킷/객체키/서명 URL 클라이언트 노출 금지.
- 트랜잭션: (1) 소유권·계정 상태·멱등 키 잠금 후 작업/이벤트/outbox 원자적 생성, (2) lease/version으로 worker 선점, 허용된 회원별 조회 함수를 일관된 읽기 스냅샷으로 제한 수집, 금융 쓰기 없이 암호화 저장, (3) SHA256·크기·manifest·검토 후 CAS로 READY+감사 확정, (4) 업로드만 성공했거나 오류가 난 경우 READY 금지, 고아 객체 정리와 안전 재시도. 제안 보관은 READY 24시간, 만료 후 48시간 이내 객체 삭제; 감사 메타데이터는 승인된 보존 정책과 법적 보존 예외 적용. 백업까지 즉시 물리 삭제됐다고 약속 금지.
- DB 앱 계정은 민감 테이블 직접 DML/무제한 SELECT 금지, 고정 search_path SECURITY DEFINER의 행위자 결속 함수에 최소 EXECUTE만 허용, PUBLIC EXECUTE 회수. 경로 탐색·ZIP 폭탄·CSV 수식·임의 이메일/URL 전송·무제한 수집 금지. 기본 제한은 활성 작업 1개/7일 2회(법적 권리 예외 검토 필요), 요청 크기·실행 시간·동시 worker 예산. 운영 연결 5433 DB는 테스트 데이터베이스가 아님.

### 운영·품질·회귀·승격
- 관리자 큐: 상태·대기시간·가린 범주 개수·승인 사유·접근 감사, 원문 기본 미노출. Kill switch는 신규 생성·다운로드를 중단하되 요청·이력은 보존. 비공개 회원·관리자 화면 sitemap 제외, noindex/nofollow, API·Next BFF·edge·파일 응답 모두 private,no-store, referrer 최소화, 분석에 개인정보 금지. 320px·키보드·초점·진행상태 live region·WCAG 2.2 AA. Android는 위조 가능한 클라이언트 헤더를 신원 근거로 사용 금지.
- KPI: 신청→확정 영수증, 대기 p50/p95, 승인된 데이터 범위, 실제 다운로드 성공률, 만료 객체 삭제 지연, 잘못된 READY 0건, 타 회원 유출 0건, 재인증 실패와 관리자 예외. 기준 수치 미측정이면 UNKNOWN 표기.
- 수용 회귀: 같은 키 100건 동시 요청→패키지·이벤트·outbox 1건; 다른 내용 재사용 100건→409; 타 회원 요청/파일 접근 100건 전부 차단; 만료 세션/재인증 거부; 1회 권한 100건 동시 다운로드→최대 1회 소모; 동일 시각 10,001건 키셋 누락 0; 업로드 실패/손상/객체 없음→READY 0; 38자리 WLD 문자열 정밀도 유지; CSV =,+,-,@ 및 제어문자 접두 방어; ZIP 경로·크기·압축 폭탄 방어; 법적 제한/이의신청, Android, WCAG, SEO, 암호화 백업 격리 복원, 정확 SHA Test 5-pass. **#1053 분리 이전 운영 연결 DB에서 테스트 금지.**
- 배포: 기능 기본 OFF. A 지갑 원장, B 관리자 권한/DB ACL, C 계정 UI, QA DB 환경·정확 SHA를 각각 소유; Gemini/기존 PR 범위 변경 금지. 새 코드는 별도 개발 브랜치와 현재 끝번호 이후 순방향 마이그레이션, 266 과거 파일 수정 금지. DB host/port/name/user/credential fingerprint로 Test 격리 검증, 전체 CI·보안·감사·복원·인증 E2E·카나리 후 승격. 실패 시 생성·다운로드 중단, 불변 요청·감사 보존, 안전 만료, WLD 자동 보정 없음. #1053, #993, Next.js 취약점, lint/frontend test, migration266, 백업·실행 SHA 차단 유지.

### P0/P1 백로그 및 외부 근거
- P0 ENV1200-01: #1053 운영/개발 DB 공유 구조 분리 및 안전한 Test 자격·fixture 증명.
- P0 SEC1200-02: #993 광범위 앱 DML 및 PUBLIC 함수 실행권한을 순방향 최소권한으로 정리, 격리 PG 부정 테스트.
- P0 PRIV1200-03: 본인/제3자 필드별 공개 정책, 최근 재인증, 관리자 법적 예외 심사, 허위 READY 0건.
- P0 REL1200-04: main lint·프론트 테스트·Next.js Critical 2/High 1·Migration266·백업 복원·정확 SHA Test/Production 게이트.
- P1 PRIV1200-05: 패키지/이벤트/객체/1회 권한 스키마, 불변 감사, 소유권·멱등 API.
- P1 PRIV1200-06: 제한적 스냅샷 worker, 암호화 객체, SHA256 manifest, TTL 삭제, CAS 확정.
- P1 PRIV1200-07: 회원·관리자·Android UX, 320px/WCAG, noindex/no-store.
- P1 PRIV1200-08: 100건 동시성, 10,001 커서, CSV/ZIP/재인증/보존·롤백 회귀.
- 외부 참고: 개인정보 포털(PIPC), 한국법제연구원(KLRI), 유럽개인정보보호이사회(EDPB), OWASP 4개 발행기관 계열 검토. 독립 승인 증빙으로 편입한 건수는 **신규 0건**, 누적 중복 제거 승인 **UNKNOWN**, 10,000건 게이트 **BLOCKED / IN PROGRESS**. https://www.privacy.go.kr/front/wcp/dcl/per/persnalInfo.do ; https://elaw.klri.re.kr/eng_service/lawTwoView.do?hseq=62389 ; https://www.edpb.europa.eu/system/files/2023-04/edpb_guidelines_202201_data_subject_rights_access_v2_en.pdf ; https://cheatsheetseries.owasp.org/


## v2026.10.24.1198 — F675-106 WLD 거래 이의제기 증거·심사 무결성 강화 (기능 보완 / 초안 / 운영승격 보류)

### 회차·근거·경계
- **이전:** 기능 추가 v1196 / **현재:** 기능 보완 v1198 / **다음:** 기능 추가 v1200(잠정). 시작·중간 origin/main SHA 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede. AGENTS.md, README.md, 영문 정본 PROJECT_PLAN.md와 한국어 대조 문서 확인. 최신 QA v1199(2026-10-24 02:25 KST) FAILED/HOLD. 미병합 Draft #1048(선행 #1043)에 쌓는 문서 기획이며 구현·운영 사고·Test 인증으로 주장하지 않음.
- **실제 소스 확인:** backend/src/wallet/wallet.repository.ts의 recentTransactionsForUser는 회원 소유 USER_CASH/USER_BANK 원장 전표를 거래별 합산하고 (created_at DESC,id DESC)로 최근 50건만 조회. frontend/src/app/wallet/activity/page.tsx도 50건만 표시하며 이의제기 버튼 없음. backend/src/wallet/wallet.controller.ts에 이의제기 API 없음. support.repository.ts는 일반 문의 함수 사용, Android App API 프록시 존재. QA v1199의 개발 DB 877거래/1,784전표·불균형 0건은 **운영 원장 인증이 아님**. Draft #1049의 비공개 거래 영수증도 최근 50건 범위이며 미병합이므로 오래된 거래를 이의제기 불가로 오인하거나 기능이 구현됐다고 표시하지 않음.
- **핵심 보완:** 최근 50건 화면, 알림 문구, 거래 actor, 클라이언트 입력 금액이 아니라 **DB 트랜잭션 안에서 실제 확정 전표의 회원 소유권을 재검증**. 51번째 이전 거래도 안전한 제한 조회를 통해 신청 가능해야 함. 현금↔은행 이동처럼 순변동 0인 거래도 현금·은행 개별 부호와 전표로 증명. 신청·심사 API는 WLD 차감·지급·동결·환불·취소를 수행하지 않음.

### 회원·관리자 화면, API 및 상태
- **진입·CTA:** /wallet/activity 또는 향후 소유권 검증된 거래 이력/영수증에서 거래 검토 → /wallet/disputes/new?transactionId=UUID. 최근 50건 밖의 거래는 ‘최근 목록에 없음’으로 구분하고 안전한 조회/이력 경로 제공; 단지 50건 밖이라는 이유로 ‘거래 없음’ 금지. 회원: 이의제기 접수·영수증 보기·정보 보완·재검토 요청. 관리자: /admin/support/transaction-disputes에서 분류·담당·정보 요청·결정·감사 조회. 상태 DRAFT/SUBMITTING/SUBMITTED/TRIAGED/NEEDS_MEMBER_INFO/UNDER_REVIEW/RESOLVED_NO_CHANGE/RESOLVED_CORRECTION_REFERENCED/REJECTED/CLOSED/UNAVAILABLE/RETRY_UNKNOWN. 타임아웃 시 성공·실패를 단정하지 말고 같은 멱등 키로 영수증 재조회.
- **자격 조회:** GET /api/v1/wallet/transactions/:transactionId/dispute-eligibility는 최근 50건 여부와 무관하게 로그인 회원이 소유한 확정 USER_CASH/USER_BANK 전표 존재를 DB에서 확인. 타인/미존재는 동일 404, 원장 불가 503, 비공개 캐시. 응답 {transactionId,eligible,existingOpenDisputeId?,receiptAvailable,observedAt}로 제한하고 상대 회원·비공개 메모 미노출. 무제한 거래 검색 금지.
- **접수:** POST /api/v1/wallet/disputes는 세션·동의·CSRF·UUID 멱등 키와 transactionId/category/정규화 summary만 허용. DB 함수에서 전표 소유권·요청 지문을 재검증. 동일 회원/키/지문 재시도는 같은 확정 영수증(200), 동일 키·다른 내용 409, 동일 회원·거래에 열린 사건 중복은 409 또는 본인 사건으로만 안내. 타인/미존재 404. 사건+문의+첫 불변 이벤트+Outbox 의도를 **한 트랜잭션**으로 확정한 경우에만 201. 결과 불명 시 RETRY_UNKNOWN 및 같은 키 조회. 원장 잔액 불변.
- **관리자 결정:** POST /api/v1/admin/wallet/disputes/:id/decisions는 support.dispute.resolve 별도 권한, 관리자 승격 세션·최근 재인증·CSRF, 사유 코드, expectedVersion, 멱등 키 필요. 행 잠금 아래 상태/버전 확인 후 이벤트와 버전 한 번만 확정. 담당자가 자신의 거래를 심사하지 못하며 상담 API는 금융 전표를 생성하지 못함. 정정 거래 참조는 독립 금융 승인과 확정·균형 원장을 검증한 뒤에만 기록. 같은 정정 거래를 여러 피해 회원 사건에서 참조할 수 있으므로 전역 UNIQUE 금지, 본인 전표 정보만 공개. 재검토는 F675-104, 비공개 증빙은 F675-105 책임으로 유지.

### DB·보안·검증·운영
- **DB:** v1196 wallet_disputes/events/resolution 구조와 회원별 열린 사건 부분 UNIQUE 유지. 원장 UUID, 회원, 문의, 요청 지문, 사유, 버전, 시각, 영수증을 불변 기록. 인덱스 (owner_user_id,request_key), (owner_user_id,created_at DESC,id DESC), (state,updated_at,id). ledger_transaction_id 및 correction_transaction_id 전역 UNIQUE 금지. 재검토는 기존 사건 행 잠금·버전 증가·이력 보존으로 처리. 문의/사건/이벤트/Outbox 부분 실패 시 전체 롤백, Outbox는 ‘발송 의도’이지 전달 성공 증거가 아님. 앱 계정은 회원 세션 결합·고정 search_path SECURITY DEFINER의 제한 EXECUTE만, 광범위한 금융/문의 직접 DML 및 무검토 PUBLIC EXECUTE 금지.
- **다른 작업과 분리:** 개발 A 영수증 #1049·P2P #1025, 개발 B 금융 관리자 #1050, 개발 C 상태/온보딩 #1046/#1051, QA v1199, Gemini 및 F675-104/105 PR은 별도 소유. 미병합 PR의 기능을 main에 있다고 가정하거나 Runtime 파일 수정하지 않음. QA v1199: 개발 DB 241개 중 235개 테이블 앱 UPDATE/DELETE, bank 함수 3개 PUBLIC EXECUTE, Next.js 16.3.8 Critical 2/High 1, Migration 266 체크섬 불일치, main 린트 오류·프론트 테스트 1건 실패. 운영 악용/유출은 확인되지 않음. 권한·마이그레이션·보안 의존성·CI·격리 백업 복원·공식 Test 정확 SHA 인증 전까지 운영승격 HOLD.
- **개인정보·모바일·접근성:** 회원/관리자 화면 및 API 비색인·비공개 no-store(Backend/BFF/App API/엣지), 타인 거래·사건 동일 404. Android 세션·CSRF·오프라인 동일 키 재시도·버전·409/503 상태 동등. 320px 모바일·키보드·상태 알림 라이브 영역·WCAG 2.2 AA. 권한 열람·내보내기·결정은 사유 포함 감사, 분석에는 상대 회원·원장 메모·첨부 URL·회원 ID 미수집. KPI는 실제 영수증 기반 접수율, 최초 응답 p95, 미해결 기간, 중복 억제, 정정 검증 실패, 타인 차단, 허위 성공 0건; 지연 목표치는 측정 후 확정.
- **회귀 수용:** 동일 키 동시 100건→사건/문의/이벤트/Outbox/영수증 각 1개; 동일 키 다른 본문 100건→409; 타인 거래·공유 P2P UUID 100건→소유자 전표만 공개; 51번째 이전 거래 접수 가능; 현금↔은행 순변동 0 및 38자리 금액 문자열 정확; 관리자 동시 버전 변경 100건→유실 없음; 동일 시각 이벤트 10,001건 키셋 누락 0; 부분 트랜잭션 실패 전부 롤백; 응답 유실 재시도 기존 영수증; 미승인·불균형·무관한 정정 거부; 앱 DML/PUBLIC EXECUTE/타인 권한/캐시 부정 테스트; Android/웹/a11y/SEO/암호화 백업 격리 복원·정확 SHA 5회 사용자 흐름.
- **배포·롤백:** wallet_transaction_disputes 플래그 기본 OFF, 순방향 추가 마이그레이션과 권한 검토, 합성 계정으로 복원 Test에서 원장 소유권 그림자 검증, 정확 SHA CI/인증된 Test/QA 승인 후 제한적 활성화. 장애 시 신규 접수·관리자 결정을 차단하되 기존 사건·이벤트·증빙·읽기 영수증 보존. 적용된 Migration 266 수정·과거 원장 삭제·자동 WLD 보정 금지. **이번 회차 Runtime/DB/Test/Production/기능 스위치 변경 없음.**

### P0/P1 개발 백로그·외부 근거 게이트
- **P0 WAL1198-01:** 최근 50건 초과 확정 전표 소유권, 현금·은행 부호·영수증 정확성(#1049 의존); 이전 거래/타인/순변동0/38자리 테스트.
- **P0 WAL1198-02:** #1025 P2P 재시도 부가정보·알림을 원장 증거와 분리, 미확정 근거 거부; 재시도 100건 중복 부작용 0.
- **P0 SEC1198-03:** 순방향 DB 최소권한, bank PUBLIC EXECUTE 검토, 관리자 승격·CSRF·재인증, 실제 PG 부정 테스트.
- **P0 REL1198-04:** QA v1199 린트/프론트/보안/Migration 266/브랜치 보존/격리 복원/정확 SHA CI·Test 차단 해결.
- **P1 WAL1198-05:** 회원 결합 원자적 사건·문의·이벤트·Outbox, 요청 지문·멱등 재시도·열린 사건 UNIQUE·버전형 재검토.
- **P1 WAL1198-06:** 독립 승인된 정정 원장 참조·불변 심사, 상담 API 원장 변경 금지.
- **P1 WAL1198-07:** 오래된 거래 탐색·진실한 CTA/상태·Android App API·비색인/no-store·WCAG/모바일.
- **P1 WAL1198-08:** F675-104 재검토·F675-105 비공개 증빙 연결·관리자 감사·보존/법적 보류.
- **P1 WAL1198-09:** 속도 제한·개인정보 안전 KPI·관리자 지연 지표·허위 성공 0.
- **P1 WAL1198-10:** 12종 동시성/보안/롤백 검증·공식 Test 정확 SHA 5회·카나리/복귀 검증.
- **외부 독립 근거:** OWASP API1 BOLA, PostgreSQL 17 명시적 잠금, W3C WCAG 2.2 상태 메시지(발행기관 3곳 검토, **신규 최종 승인 0건**, 누적 중복 제거 승인 수량 **미확인**, 목표 **10,000건**, 게이트 **BLOCKED / IN PROGRESS**). https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/ ; https://www.postgresql.org/docs/17/explicit-locking.html ; https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html . 10,000건 달성 주장 금지.


## v2026.10.24.1196 — F675-106 검증된 WLD 거래 이의제기·처리 영수증 (기능 추가 / 초안 / 운영승격 보류)

### 회차·권위·실제 근거와 금지사항
- **이전:** Feature Improvement v1194. **현재:** Feature Addition v1196. **다음:** Feature Improvement v1198(잠정). 시작·중간 기준 origin/main `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; AGENTS.md, README.md, PROJECT_PLAN.md(영문 정본), PROJECT_PLAN.ko.md 확인. 이 제안은 미병합 기획 Draft PR #1043 위에 쌓는 문서 초안이며 구현·테스트·배포·실제 운영 금융 사고를 의미하지 않는다.
- **실제 소스 확인:** `frontend/src/app/wallet/activity/page.tsx`는 `GET /api/v1/wallet?recent=50`으로 최근 50건까지 표시하지만 개별 거래 이의제기 CTA는 없다. `backend/src/wallet/wallet.repository.ts::recentTransactionsForUser`는 회원 소유 계정의 원장 전표에서 거래 ID·현금/은행 변동액을 계산한다. `backend/src/support/support.controller.ts`에는 일반 문의·답변·상태 변경은 있지만 거래 ID에 연결된 이의제기·심사 결정 영수증·금융 전용 큐가 없다. Android 게이트웨이는 `frontend/src/app/app-api/v1/[...path]/route.ts`, 관리자 문의는 `/admin/support`다. 개발 DB 읽기 전용 조사: 원장 거래 877건, 전표 1,784건, 문의 3건, 메시지 6건, 이름에 disput가 들어간 테이블 **0개**. `moneyverse_app`은 `account_balances`·문의 테이블에 직접 UPDATE/DELETE 가능하나, 조사된 원장 거래·전표 테이블에는 직접 UPDATE/DELETE 불가. QA v1197(2026-10-24 01:25 KST) FAILED/HOLD; 운영 원장은 인증되지 않았다.
- **선행 위험:** GitHub #1025는 원장 거래가 멱등이어도 P2P 부가정보·알림이 중복될 수 있는 구조를 기록한다. 이의제기 대상은 반드시 **커밋된 회원 소유 원장 거래 ID**여야 하며, 알림 문구·클라이언트 금액·검증되지 않은 P2P 메타데이터를 근거로 사용하지 않는다. 이의제기 접수는 WLD 출금·입금·동결·환불·취소·잔액 수정이 절대 아니다. 향후 정정은 별도 권한 있는 금융 절차에서 신규 균형 원장 거래로만 수행한다. F675-104 문의 이력, F675-105 비공개 증빙, 개발 A/B/C/QA의 지갑 변경은 선행 의존성으로 분리한다.

- **GitHub 기획 추적:** Draft PR #1048(선행 Draft #1043), 개발 이슈 #1047. 동일 금융 정정 거래가 여러 회원 사건을 해결할 수 있으므로 이의제기 테이블에서 정정 거래 FK를 전역 UNIQUE로 제한하지 않는다. 중복 금융 집행 방지는 독립 금융 승인·원장 멱등성에서 검증한다.

### 대상·권한·화면·CTA·상태
- **회원:** 실제 `/wallet/activity` 거래 행에서 **이 거래 검토 요청** → `/wallet/disputes/new?transactionId=<uuid>`(URL ID는 소유권 증거 아님). 목록 `/wallet/disputes`, 상세 `/wallet/disputes/:disputeId`, 기존 `/support`에서 연결 문의 확인. 비회원·탈퇴 회원·다른 회원에게는 접근 불가. 개인정보·상대방 계정/실명은 노출하지 않는다.
- **상담 담당자:** `/admin/support/transaction-disputes`에서 `support.dispute.read`, `support.dispute.triage`로 조회·분류. 최종 결정은 별도 `support.dispute.resolve` 권한, 최신 관리자 재인증, CSRF, 필수 사유와 불변 감사 기록을 요구한다. 상담 화면은 WLD를 변경할 권한이 없으며, 정정 거래 참조는 독립 금융 승인·원장 검증 후에만 추가한다.
- **상태:** 클라이언트 전용 DRAFT → 서버 커밋 영수증이 확인된 SUBMITTED → TRIAGED / NEEDS_MEMBER_INFO / UNDER_REVIEW → RESOLVED_NO_CHANGE 또는 RESOLVED_CORRECTION_REFERENCED 또는 REJECTED → CLOSED. 잘못된 전이는 409, 없거나 소유하지 않은 ID는 구분 없는 404. **문제 신고**, **비공개 증빙 첨부**, **추가 설명**, **처리 이력 보기**, **재검토 요청**(F675-104 재사용) CTA를 제공한다. 조회 불가·접수 중·접수 확정·기각·완료를 구분하고, 환급·처리기한·원장 정정을 확정 전에 약속하지 않는다. URL의 `?saved=1` 등으로 성공을 표시하지 않고 서버 영수증 ID·시각·상태를 검증한다.

### 제안 API (미구현)
- `GET /api/v1/wallet/transactions/:transactionId/dispute-eligibility`: 세션 회원의 `ledger_postings JOIN accounts` 소유권을 검증하여 `{transactionId,eligible,allowedCategories,existingOpenDisputeId?,observedAt}`만 반환. 타인/미존재는 404, 상대방 신원·입력 금액을 신뢰하지 않는다. 이 조회는 참고 정보이며 실제 접수 트랜잭션에서 다시 검증한다.
- `POST /api/v1/wallet/disputes`: 인증·동의·CSRF; `{transactionId,category: missing|incorrect_amount|duplicate|unrecognized|other,summary:10..2000자,idempotencyKey:UUID}`. 신규 접수 201 `{disputeId,supportThreadId,state:'SUBMITTED',version:1,receiptId,createdAt}`; 동일 회원·키·정규화 요청 재시도는 같은 영수증으로 200; 다른 내용의 키 재사용 또는 같은 거래의 열린 중복 사건은 409(타 회원 정보 비노출). 원장 변경은 수행하지 않는다.
- `GET /api/v1/wallet/disputes?cursor&limit=1..50`, `GET /api/v1/wallet/disputes/:disputeId`: 회원 소유권 검증, `(created_at DESC,id DESC)` 키셋 페이지네이션, 서명·검증된 커서, 최소 필드, `Cache-Control: private, no-store`. `GET /api/v1/admin/wallet/disputes?state&cursor`: 권한/재인증·열람 사유 감사·제한된 큐. `POST /api/v1/admin/wallet/disputes/:id/decisions`: `{expectedVersion,action,reasonCode,explanation,idempotencyKey,verifiedCorrectionTransactionId?}`, 행 소유·상태·정정 참조 재검증. Android `/app-api/v1/...`에서 오류·인증·CSRF·최소 버전 계약 동등성 확보. Android 헤더만으로 사용자 인증하지 않는다.
- 오류: 400 잘못된 입력, 401 미인증, 403 심사 권한 부족, 404 타인/미존재, 409 버전·멱등 충돌, 422 상태/정정 증거 부적합, 429 제한, 503 원장/DB 장애. SQL·사용자 UUID·상대방·저장키·금융 비밀은 응답과 로그에서 제외한다.

### DB 제약·인덱스·원자성·보안
- 현재 최종 마이그레이션 다음 번호의 **추가형 순방향 마이그레이션**만 허용하며 이미 적용된 266은 수정하지 않는다. `wallet_disputes(id uuid PK,owner_user_id FK users,ledger_transaction_id FK ledger_transactions,support_thread_id FK support_threads UNIQUE,category CHECK,state CHECK,version bigint CHECK(version>0),request_key uuid,request_digest bytea,created_at,updated_at)`; `UNIQUE(owner_user_id,request_key)`; `(owner_user_id,ledger_transaction_id) WHERE state IN ('SUBMITTED','TRIAGED','NEEDS_MEMBER_INFO','UNDER_REVIEW')` 부분 UNIQUE; 회원 인덱스 `(owner_user_id,created_at DESC,id DESC)`, 관리자 큐 `(state,updated_at,id)`. 거래 상대방도 **자기 소유 전표**가 있는 경우 자기 사건을 별도로 접수할 수 있다.
- `wallet_dispute_events(id uuid PK,dispute_id FK,version bigint,actor_user_id FK,action,from_state,to_state,reason_code,occurred_at,request_key uuid,request_digest bytea,UNIQUE(dispute_id,version),UNIQUE(dispute_id,request_key))`는 불변 추가형이며 앱 UPDATE/DELETE 금지. 선택형 `wallet_dispute_resolution(dispute_id PK FK,correction_transaction_id NULL FK ledger_transactions,verified_by,verified_at,decision_reason)`은 별도 금융 승인·원장 균형·참조 소유권을 검증할 때만 사용한다. `support_thread_id`와 F675-105 증빙 참조는 같은 회원/사건인지 검사한다.
- 세션에서 얻은 실제 회원과 결합한 `SECURITY DEFINER` 함수(제한된 EXECUTE, 고정 search_path)가 **같은 DB 트랜잭션 내부**에서 `accounts.owner_user_id = actor`인 전표 존재를 검증한다. 단순히 `ledger_transactions.actor_user_id`나 UUID를 안다는 이유로 허용하지 않는다. 이의제기 행, 연결 문의, 최초 불변 이벤트, 중복 방지 Outbox 의도를 원자적으로 커밋한다. 동시 같은 키는 UNIQUE 충돌 후 회원 소유권과 정규화 요청 지문이 모두 같을 때만 기존 영수증을 반환하며, 열린 사건 중복은 409. 관리자 상태 변경은 `SELECT ... FOR UPDATE`와 `expectedVersion` 비교 후 이벤트 추가·버전 증가를 단일 트랜잭션으로 수행한다. Outbox는 **발송 의도**이며 외부 알림 도착 증거가 아니다. 기존 F675-104 문의 멱등성/원자성 결함을 해결한 뒤 연결한다.
- 개인정보: 전표 원문, 상대방 정보, 내부 상담 메모, 증빙 원본, 외부 로그인 ID를 분석 로그에 남기지 않는다. F675-105가 준비되지 않으면 **텍스트만으로 접수 가능**해야 한다. 보존기간·법적 보존 정책은 출시 전 확정, 백업 암호화, 관리자 열람/반출 감사, 회원별 반출 권한 적용. 웹·BFF·App API·CDN 모두 비공개 `no-store`; 회원/관리자 화면 `noindex,nofollow`. 계정/IP 속도 제한, 입력 검증, 열린 중복 사건 방지, 심사/금융 승인 직무 분리, 자동 환급 금지, 사건 ID 추측 차단.

### P0/P1 개발 백로그·테스트·배포
- **P0 WAL1196-01** 실제 회원 소유 원장 증거·비열거형 404·허위 접수 성공 금지. **P0 WAL1196-02** #1025 P2P 재시도 부가정보/알림 중복 해결 및 검증 전 알림을 거래 증거로 신뢰 금지. **P0 SEC1196-03** 금융/상담 앱 계정 직접 DML 회수, 세션 결합 SECURITY DEFINER, 관리자 재인증·최소권한. **P0 REL1196-04** QA v1197의 CI·린트·보안(Critical 2/High 1)·Migration 266·브랜치 보존·백업/격리 복원·정확 SHA Test 차단 해결.
- **P1 WAL1196-05** DB 스키마·원자적 접수·불변 영수증/이벤트/Outbox. **WAL1196-06** 회원·관리자 API와 Android App API 계약. **WAL1196-07** 지갑 CTA·목록·상세·관리자 분류/심사 UX. **WAL1196-08** 독립 금융 정정 참조·F675-105 증빙·F675-104 재검토 연계. **WAL1196-09** 개인정보·모바일·WCAG 2.2 AA·SEO·KPI. **WAL1196-10** 동시성·회귀·무중단 배포·롤백 검증.
- 수용 시험: 같은 키 동시 100건 → 사건 1·문의 1·이벤트 1·Outbox 의도 1; 다른 내용으로 키 재사용 100건 → 409; 타 회원 거래/사건 접근 100회 → 노출 0; 관리자 버전 충돌 동시 100건 → 유실 갱신/중복 완료 0; 같은 시각 사건 10,001건 → 커서 누락/중복 0; 현금/은행 BigInt 정밀도 일치; 커밋 후 응답 유실 재시도 → 동일 영수증; 사건·문의·이벤트·Outbox 중간 실패 → 전체 롤백; 무승인·불균형·무관 정정 거래 참조 거부; Android/웹/접근성/보안/SEO 및 커서 변조 회귀.
- KPI는 실제 커밋 영수증만 집계: 접수 전환율, 접수 p95, 최초 심사·완료 p95, 재검토율, 접근 거부, 중복 억제, 허위 성공 0, 무근거 환급 약속 0. 실제 관측 전 목표치·운영 수치를 꾸며내지 않는다.
- `wallet_transaction_disputes` 플래그 **기본 OFF**. 독립 복원 Test DB에서 추가형 마이그레이션/권한 검증 → 정확 SHA CI·회원/관리자/Android 5회 E2E → 제한적 활성화 → 무중단 운영승격 심사. 롤백은 신규 접수와 화면을 비활성화하되 기존 사건·문의·감사는 보존; 적용된 마이그레이션 역수정·과거 원장 변경·증빙 삭제·자동 금융 취소 금지. 운영승격은 QA가 정확 SHA 및 금융/복원 게이트를 승인하기 전 **BLOCKED**.
- 독립 근거: OWASP API1:2023 객체별 접근 통제, PostgreSQL 17 동시성 제어, W3C WCAG 2.2 상태 메시지. **독립 발행기관 3곳 검토, 신규 최종 승인 근거 0건, 누적 중복 제거·승인 수량 미확인, 목표 10,000건 검증 게이트 BLOCKED / IN PROGRESS**. https://github.com/OWASP/API-Security/blob/master/editions/2023/en/0xa1-broken-object-level-authorization.md ; https://www.postgresql.org/docs/17/mvcc.html ; https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html .

## v2026.10.24.1194 — F675-105 고객지원 비공개 증빙 보관함: 소유권 검증·기존 URL 격리·내구성 영수증 보완 (기능 보완 / 초안 / 운영 보류)

- **회차·진실 기준:** 이전 Feature Addition v1192 / 현재 Feature Improvement v1194 / 다음 Feature Addition v1196(잠정). 최신 origin/main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede의 AGENTS.md·README.md·PROJECT_PLAN 영문/한국어를 시작·중간에 재확인. 미병합 선행 Draft #1038 및 보안 이슈 #1037, 2026-10-24 00:25 KST QA v1195 FAILED/HOLD. 본 회차는 격리 문서 기획으로, API 구현·Test 통과·실제 운영 유출·배포 승인을 의미하지 않는다.
- **소스·개발 DB에서 확인한 사실:** backend/src/content/chat-upload.controller.ts의 업로드는 세션·인증·동의·CSRF로 보호되지만 응답에 URL과 내부 storageKey를 함께 반환한다. GET content/chat/media/:key에는 명시적 소유권·인증 가드가 없고 public, max-age=86400, immutable 캐시 헤더를 사용한다. backend/src/content/chat-image-storage.ts는 악성코드 검사 후 원본 버퍼를 mode 0600으로 저장하며 이미지 재인코딩·EXIF 제거와는 별개이다. frontend/src/components/floating-support-chat-widget.tsx는 문의/답변/DM 본문에 미디어 URL을 덧붙이고 메시지 확정 전에 이미지 첨부 성공 토스트를 표시한다. frontend/src/app/app-api/v1/[...path]/route.ts는 request.arrayBuffer로 본문을 메모리에 버퍼링하고 업스트림 15초 제한을 사용하며 app-gateway.ts는 Cache-Control을 전달한다. 개발 DB의 읽기 전용 집계는 문의 3건·메시지 6건, **기존 /api/v1/content/chat/media/ URL을 포함한 지원 메시지 1건**, support_evidence 테이블 없음, moneyverse_app의 support_messages DELETE 및 support_threads UPDATE 허용을 확인했다. 회원 본문이나 실제 URL을 반출하지 않았고 운영 사고는 입증하지 않았다.
- **설계 선택과 호환성:** 기존 일반 DM/로비 이미지 경로의 사용자를 조사하기 전 모든 공개 이미지 경로를 일괄 중단하지 않는다. 고객지원 전용 증빙은 opaque evidenceId와 대화 소유권을 매 요청 확인하는 다운로드 경로만 사용하며 브라우저·Android·URL·분석·오류 메시지에 storageKey, 파일 경로, 원본 콘텐츠 SHA를 제공하지 않는다. 기존 일반 업로드 응답의 storageKey 노출도 P0 호환성·보안 조사 대상으로 두되, 고객지원 전용 경로에서 우선 제거하고 일반 클라이언트 변경은 소비자 확인 후 진행한다. 난수 키의 추측 곤란성은 권한 검사가 아니다.
- **대상·권한·진입점·CTA·화면 상태:** 문의 소유 회원은 /support 또는 제안 /support/cases/:threadId에서 '스크린샷 선택 → 개인정보 안내 확인 → 업로드 → 검사 중 → 전송 준비 → 메시지와 함께 전송 → 확정 첨부 영수증 → 증빙 보기/미연결 증빙 폐기' 흐름을 사용한다. 관리자 /admin/support는 일반 관리자 권한만으로 열람하지 못하고 support.evidence.read / support.evidence.quarantine / support.evidence.audit 전용 권한, 강화 세션, 필수 사유를 요구한다. 게스트·다른 회원·DM 참여자·봇에게 지원 증빙 바이트를 제공하지 않는다. selected/uploading/PENDING/READY-but-unlinked/ATTACHED/rejected/QUARANTINED/REVOKED/expired를 구별하고 메시지·연결 커밋 영수증 전에는 '첨부 완료'라고 표시하지 않는다. 기능 OFF에서는 기존 텍스트 문의가 정상 작동하고 WLD·원장은 변경하지 않는다.
- **회원 API 및 응답 계약(미구현):** POST /api/v1/support/threads/:threadId/evidence는 PNG/JPEG/WebP 1개(최대 8MiB), CSRF·세션·회원 소유권·UUID Idempotency-Key 및 회원+대화+파일 바이트+작업 종류에 묶인 요청 지문을 검증한다. 검사 중이면 202 PENDING 및 불투명 evidenceId/receiptId, 안전한 오브젝트와 DB 영수증이 확정된 경우에만 201 READY를 반환한다. 원본 storageKey, 파일 경로, EXIF, 전체 SHA, 공개 미디어 URL은 반환 금지. GET .../evidence/:evidenceId/receipt는 소유자/권한자에게 상태·영수증·버전만 제공한다. 기존 POST .../messages에 evidenceIds 0~3개와 멱등 키를 선택적으로 추가하고 메시지·연결·영수증을 단일 DB 트랜잭션으로 확정한다. GET .../evidence/:evidenceId는 매번 소유권을 검사하고 READY+ATTACHED 또는 허용된 본인 READY 미리보기만 안전한 바이트로 전송한다. DELETE는 미연결 본인 READY에 대해서만 CAS로 처리하며 연결 증빙은 조용히 삭제하지 않는다. 관리자 조회·격리 API에는 지원 전용 RBAC, 강화 인증, 사유 및 불변 감사가 필요하다. 오류 400/401/404(미존재·타 회원 동일)/409(지문 불일치·버전 충돌)/413/415/429/503을 구별하며 결과 불명 시 새 키 발급 대신 영수증 조회를 사용한다.
- **다운로드·캐시·개인정보 경계:** 비공개 GET/HEAD 및 오류(향후 304/206 지원 시 포함)는 Cache-Control: no-store, private; 레거시 Pragma: no-cache; X-Content-Type-Options: nosniff; Referrer-Policy: no-referrer; X-Robots-Tag: noindex, nofollow, noarchive를 적용한다. 안전하게 재인코딩한 래스터 미리보기만 명시적 권한 아래 inline 허용하며 그 외 Content-Disposition: attachment, 엄격한 CSP를 사용한다. 초기에는 조건부 304와 Range/206을 지원하지 않아 재검증 우회·메타데이터 누출을 막는다. HEAD는 바이트뿐 아니라 미인가 사용자에게 길이·ETag·수정시각을 노출하지 않는다. Next BFF는 업스트림 public 헤더를 그대로 전달하지 말고 지원 전용 경로에서 no-store를 강제한다. URL 쿼리 bearer 토큰, 내부 키, 권한 없는 리다이렉트를 사용하지 않는다.
- **DB 제약·인덱스·권한(검토할 순방향 마이그레이션):** v1192의 support_evidence/support_message_evidence/support_evidence_events 설계를 유지하면서 scan_version, 내부 normalized_sha256, object_generation, scanned_at, 단조 증가 version을 추가 검토한다. READY는 scan_version/object_generation/scanned_at 모두 존재해야 하며 소유자·오브젝트 키는 클라이언트가 지정하지 못한다. 비공개 영수증 테이블에 UNIQUE(actor_id,thread_id,idempotency_key,operation_kind)와 정규화 요청 지문을 저장한다. 같은 키·같은 지문은 기존 영수증, 다른 지문은 409. 메시지 연결 UNIQUE(evidence_id), 원본 테이블의 복합 UNIQUE(thread_id,id) 및 (thread_id,message_id)/(thread_id,evidence_id) 복합 FK로 교차 문의 연결을 거부한다. 메시지당 최대 3개는 잠금 있는 SECURITY DEFINER 함수에서 검증한다. (thread_id,created_at DESC,id DESC) 및 (state,expires_at,id) 인덱스로 이력·고아 파일 정리를 지원하고 10,001건 이상은 키셋 커서를 사용한다. 감사 기록은 추가 전용이다. moneyverse_app의 증빙 및 관련 지원 테이블 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE를 회수하고 고정 search_path·회원별 권한을 검사하는 함수 EXECUTE만 부여하며 PUBLIC EXECUTE 금지. DB 담당 B의 최소권한 작업과 조율하고 이미 적용된 Migration 266 원본은 수정하지 않는다.
- **파일·DB 간 내구성 및 동시성:** 파일시스템/오브젝트 저장소와 PostgreSQL은 하나의 ACID 트랜잭션이 될 수 없으므로 가상의 일괄 원자 커밋을 주장하지 않고 PENDING → READY 또는 QUARANTINED/REVOKED/DELETED 상태와 Outbox/재조정 작업을 정의한다. 먼저 멱등 예약·PENDING 영수증을 내구 저장하고 격리 오브젝트에 기록한다. 크기·픽셀·CPU·메모리 상한에서 악성코드 검사 후 재인코딩·EXIF/GPS 제거, 비공개 불변 오브젝트 generation 저장, 이후 DB READY를 버전 CAS로 확정한다. 실제 오브젝트 세대·정규화 해시와 DB READY가 모두 일치해야 전송한다. DB 확정 실패 오브젝트는 격리 후 문서화된 보관 기간이 지나면 회수하고 오브젝트 기록 실패 시 READY를 만들지 않는다. 검사·디스크·네트워크 호출 동안 DB 행 잠금 금지. 연결은 대화 행 → 증빙 ID 정렬 잠금 → 소유권/READY/만료/개수 확인 → 메시지·연결·영수증 원자 커밋. 폐기와 연결 경합은 CAS로 제어한다. 검사 실패·시간초과·오브젝트 불일치 시 fail-closed, 허위 READY 0건을 목표로 한다.
- **기존 URL 조사·사고 대응:** 개발 DB 지원 메시지 1건에서 기존 URL 존재를 집계로 확인했지만 운영 건수, CDN 캐시, 제3자 복사 여부는 미확인이다. 보안·QA가 합성 Test 계정으로 익명/타 회원 GET·HEAD 및 실제 엣지/CDN 응답을 통제된 방식으로 검증하고 실회원 파일은 열람하지 않는다. 지원/DM/로비 URL을 분류해 지원 메시지만 소유권·보존 의무 검토 후 비공개 증빙으로 연결하며 원문·감사 연속성을 보존한다. 비공개 경로가 검증되면 신규 지원 메시지의 공개 URL 삽입을 중단하되 일반 DM 기능을 임의 중단하지 않는다. 가능한 캐시 무효화·레거시 링크 회수를 수행하더라도 이미 복사된 파일까지 회수했다고 주장하지 않는다. 실제 운영 노출이 확인되면 별도 사고 대응·통지 절차를 따른다.
- **게이트웨이·모바일·남용 방지·접근성:** 현재 Next BFF는 multipart를 메모리에 적재하고 업스트림 15초 제한이 있으므로 전체 프록시 제한을 무작정 늘리지 않는다. 파일당 8MiB·메시지당 3개/총 24MiB·동시 작업 수·백프레셔를 갖춘 제한형 스트리밍 또는 비동기 202 영수증 경로를 개발자가 설계한다. Android App API도 동일한 회원/대화/CSRF 또는 문서화된 모바일 세션 보호, 멱등 재시도, 오프라인 복귀, content URI 만료, 앱 버전 정책을 적용한다. 회원/IP 속도·일일 바이트 한도, 압축해제/픽셀 제한, 임시 파일 안전 회수, 외부 URL 가져오기 금지. 320px 화면, 키보드 파일 선택·제거, 오류 포커스, 상태 live region, 이미지 대체 텍스트 안내, WCAG 2.2 AA. 회원/관리자 페이지 비색인 및 사이트맵 제외.
- **관리자·보관·분석/KPI:** 지원 전용 권한+강화 세션에서만 열람/격리, 사유를 비식별·불변 감사에 기록한다. 일반 로그·분석에는 object_key, EXIF, 회원 본문, 이미지 바이트, 회원 ID, 해시를 남기지 않는다. 법적 보존/삭제 정책과 미연결 파일 유효기간·고아 회수는 명시적 승인 후 적용한다. KPI: 검사 완료 업로드→실제 메시지 첨부율, fail-closed 차단 수, 타 회원 접근 차단 집계, 기존 지원 URL 이전 커버리지, 고아 회수 p95, 동일 키 중복 제거율, 구버전 클라이언트 오류율, 허위 READY 영수증 0건.
- **P0 개발 백로그:** SUP1194-01 기존 지원 URL 집계·격리 및 고객지원 전용 응답의 storageKey/공개 URL 제거; SEC1194-02 회원별/관리자별 GET·HEAD 소유권 검증과 Backend/BFF/Edge no-store; SEC1194-03 지원 테이블 최소권한 및 SECURITY DEFINER 실제 DB 부정 테스트; REL1194-04 QA v1195 린트·Critical/High 의존성·Migration266·백업 복원·브랜치 보존·정확 SHA Test/운영 출처 게이트. 지원·보안 개발, DB B, QA에 분리 연계하고 A/B/C/Gemini 코드 작업과 충돌시키지 않는다.
- **P1 개발 백로그:** SUP1194-05 검사·오브젝트·DB 영수증 상태기계 및 고아 회수; SUP1194-06 메시지 첨부 원자성·지문 멱등·CAS; SUP1194-07 15초 제한과 업로드 메모리 상한을 고려한 BFF 스트리밍/비동기; SUP1194-08 회원 웹·Android·SEO·a11y 및 정직한 CTA; SUP1194-09 관리자 감사·보존·KPI; SUP1194-10 부정 접근·동시성·캐시·검사·모바일·롤백 회귀. 각 개발 작업은 실제 파일/마이그레이션 경로와 TDD RED/GREEN 증거를 남긴다.
- **수용 조건·무중단 배포·롤백:** 익명/타 회원 GET·HEAD·Range 100회에서 바이트·메타데이터 0건, 동일 키 동시 업로드/첨부 100건에서 영수증·연결 각 1건, 다른 바이트 키 재사용 100건에서 409, 검사 실패 100건에서 READY 0건, 폐기/연결 경합 100건에서 폐기된 파일 조회 0건, 회원 이력 10,001건 누락·중복 0건. 파일 8MiB/3개/24MiB, 비동기 15초 영수증, Android 동등성, 지원 응답 storageKey 0건, 엣지 공유 캐시 0건을 합성 Test에서 검증한다. support_private_evidence 기본 OFF, 정확 SHA 린트·타입·빌드·보안감사·실제 PG·권한 E2E·격리 백업 복원·Migration parity·QA 독립 승인 전 운영 승격 금지. 점진적 활성화와 오류율 관찰 후 승인하며 롤백 시 신규 업로드만 차단하고 이미 확정된 증빙의 권한 있는 조회·보존·감사는 유지한다. 테이블 삭제·파일 일괄 삭제·기존 마이그레이션 수정 금지. 신규 코드는 개발 예약의 별도 브랜치에서만 구현한다.
- **외부 독립 근거 게이트:** OWASP 파일 업로드 지침, Mozilla MDN Cache-Control, PostgreSQL 제약 문서의 발행기관 3곳을 검토했다. 신규 승인·중복 제거된 독립 근거 레코드 0건, 누적 승인 수량 미확인, 목표 10,000건 BLOCKED. 문서 3개를 10,000건의 독립 증거로 환산하지 않는다.


## v2026.10.24.1192 — F675-105 고객지원 비공개 증빙 보관함 (기능 추가 / 초안 / 운영 보류)
- **회차·기준:** 이전 Feature Improvement v1190 / 현재 Feature Addition v1192 / 다음 Feature Improvement v1194(잠정). 시작·중간 main `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; main의 AGENTS·README·PROJECT_PLAN 국영문 및 미병합 선행 Draft #1028/#1033 확인. 최신 QA v1193 FAILED/HOLD. 본 변경은 격리된 문서 기획이며 실제 API 구현, 운영 유출, 테스트 통과 또는 배포 승인을 의미하지 않는다.
- **실제 소스·개발 DB 근거:** `frontend/src/components/floating-support-chat-widget.tsx`는 `/app-api/v1/content/chat/upload`로 이미지를 올린 뒤 반환된 `capturedImg.url`을 문의 답변의 일반 텍스트 본문에 결합한다. `backend/src/content/chat-upload.controller.ts`의 업로드에는 인증·동의·CSRF·악성코드 검사 기능이 있지만 `GET content/chat/media/:key`에는 명시적 인증·소유권 가드가 없고 `Cache-Control: public, max-age=86400, immutable`을 사용한다. `ChatImageStorage`는 UUID 난수 키와 파일 권한을 사용하므로 키 추측 가능성과 URL을 이미 가진 사람의 접근 가능성은 구별해야 한다. Next app-api 게이트웨이는 백엔드 Cache-Control을 전달하고 content 그룹을 허용하며 next.config는 /api/v1/*를 /app-api/v1/*로 재작성한다. 다만 실제 배포 엣지의 특정 URL 접근성 및 공유·유출 여부는 통제된 경로 검사·접근 로그 확인이 필요하며 운영 유출 사례를 주장하지 않는다. 기존 `/support`는 텍스트만 지원하고 `support_messages.body`는 2,000자 제한. 개발 DB 문의 3건·메시지 6건이며 `support_evidence` 테이블은 없다. 기존 검사·대화 기능을 재사용하고 임의의 공개 업로드 경로를 만들지 않는다.
- **목적·대상·범위:** 로그인한 문의 소유 회원과 지원 전용 권한을 가진 관리자가 오류 화면·거래 안내 화면 등의 이미지 증빙을 비공개로 교환·확인한다. 기존 텍스트 문의 및 F675-104 사건 이력과 호환하되 일반 DM/로비 공개 이미지, 임의 URL 가져오기, 금융 거래 사실 확정, WLD 자동 조정, 범용 문서 공유는 범위 밖이다. 증빙 이미지만으로 회원 주장에 대한 자동 판정을 하지 않는다. `support_private_evidence` 기본 OFF.
- **화면·CTA·상태:** `/support`와 제안 `/support/cases/:id`에 ‘스크린샷 첨부/미리보기/보내기 전 제거/메시지와 함께 전송/증빙 보기/문제 신고’, 관리자 `/admin/support`에 ‘권한 확인 후 보기/격리/판정 기록’을 제공한다. 초기 허용 PNG/JPEG/WebP, 파일당 8MiB, 메시지당 최대 3개·총 24MiB; GIF/SVG/PDF 제외. 상태 `selected→uploading→scanning→ready→attached`, 실패 `rejected_type|rejected_size|scan_unavailable|quarantined|upload_failed|link_conflict|expired|revoked|unavailable`. 서버에 확정된 영수증이 있어야 ‘첨부 완료’를 표시하고 업로드 후 메시지에 미연결된 파일은 `ready_pending_send`로 표시한다. 미리보기는 공개 오브젝트 URL을 사용하지 않으며 비로그인·타 회원에게 파일 바이트·메타데이터를 제공하지 않는다.
- **제안 API(미구현):** 회원 `POST /api/v1/support/threads/:threadId/evidence`는 multipart 단일 파일, CSRF·UUID `Idempotency-Key`·요청 지문·대화 소유권 검증 후 비동기 검사에서는 내구성 있는 `evidenceId,receiptId`와 `202 SCANNING`을 반환하고, 검사·DB 확정에 성공한 경우에만 `201 READY` 및 `evidenceId,receiptId,sha256,size,mimeType,expiresAt` 반환. `GET .../evidence/:evidenceId/receipt`로 결과를 조회할 수 있다. 기존 app-api 게이트웨이는 요청을 메모리에 버퍼링하고 업스트림 제한시간이 15초이므로 구현 전 요청 크기·메모리·검사 지연과 스트리밍/비동기 경로를 검토한다. 기존 `POST /api/v1/support/threads/:threadId/messages`에 선택 `evidenceIds:uuid[]`(0..3), 안정적인 재시도 키와 같은 대화 소유권을 추가해 메시지·연결·영수증을 한 트랜잭션으로 저장; 기능 OFF에서는 기존 텍스트 계약을 보존한다. `GET /api/v1/support/threads/:threadId/evidence/:evidenceId`는 매 요청 소유권 재확인 후 스트리밍, `DELETE .../evidence/:evidenceId`는 미연결 본인 업로드만 폐기, `GET .../evidence/:evidenceId/receipt`는 결과 불명 재시도 조회. 관리자 `GET /api/v1/admin/support/threads/:threadId/evidence/:evidenceId` 및 `POST .../quarantine`는 지원 전용 RBAC·추가 인증·사유·불변 감사 필수. Next BFF는 서버 전용 내부 인증키 유지, Android `/app-api/v1/support/threads/:threadId/evidence/*`는 회원·CSRF·MIME·영수증 의미 동등(정확한 경로는 route-map 검토 후 확정). 오류 400·401·403·404(타 회원 포함)·409(키/본문 또는 대화 불일치)·413·415·429·503 구별. 클라이언트 제공 소유자·파일 경로·외부 URL 신뢰 금지.
- **DB·보관 설계(검토할 순방향 migration):** `support_evidence(id uuid PK,thread_id uuid NOT NULL FK support_threads(id),uploader_id uuid NOT NULL FK users(id),object_key text UNIQUE NOT NULL,content_sha256 bytea NOT NULL CHECK octet_length=32,mime_type text CHECK IN (image/png,image/jpeg,image/webp),size_bytes bigint CHECK BETWEEN 1 AND 8388608,state text CHECK IN (PENDING,READY,QUARANTINED,REVOKED,DELETED),scan_version text,created_at timestamptz,expires_at timestamptz,version bigint CHECK >0)`. `support_message_evidence(thread_id uuid,message_id uuid,evidence_id uuid,PRIMARY KEY(message_id,evidence_id),UNIQUE(evidence_id))`; 양쪽 원본 테이블의 `(thread_id,id)` 복합 UNIQUE 및 `(thread_id,message_id)`·`(thread_id,evidence_id)` 복합 FK로 다른 문의에 증빙 연결을 DB에서 차단한다. 메시지당 3개 제한은 잠금 기반 SECURITY DEFINER 함수로 검증. 인덱스 `support_evidence(thread_id,created_at DESC,id DESC)`, `support_evidence(state,expires_at,id)`. `support_evidence_events(id PK,evidence_id FK,actor_id,event_type,redacted_reason,created_at)`는 추가 전용 감사. 파일은 비공개 웹루트 밖 암호화 보관·백업; 난수 저장키를 API·로그·URL·분석에 노출하지 않는다. 앱 계정 직접 테이블 DML/SELECT 금지, 고정 search_path·소유권/RBAC 검증 함수 EXECUTE만 허용. DB 담당 B의 기존 최소권한·Migration266 이슈와 조율하고 적용된 migration 원본을 수정하지 않는다.
- **원자성·악성코드·남용 방지:** 기존 `AntivirusScannerService`·`ChatImageStorage`의 검사 원리를 재사용하되 고객지원 전용 비공개 저장 영역·인증 스트리밍 경로를 사용한다. 서버에서 디코딩된 파일명, 매직바이트, 크기·해상도·압축해제 비율·MIME 허용목록을 확인하고 격리된 리소스 한도 내 이미지 재인코딩·EXIF/GPS 제거; 검사 서비스 오류·타임아웃은 차단 상태로 종료한다. 임시 격리 파일→검사/재인코딩→비공개 오브젝트 내구 저장→DB READY 메타데이터·불변 영수증 원자 확정; 실제 오브젝트 존재 및 소유권 검증된 DB READY 상태를 모두 만족할 때만 파일을 제공한다. 중간 실패의 고아 파일은 제한된 청소 작업으로 회수하며 미확정 파일은 절대 제공하지 않고 허위 READY 영수증도 만들지 않는다. 메시지 연결 시 대화 행→증빙 ID 정렬 잠금, 소유권·대화 일치·READY·유효기간·개수 검증 후 메시지·연결·영수증 원자 저장. 같은 키·같은 지문은 동일 영수증, 다른 지문은 409. 검사·디스크·네트워크 호출 동안 DB 잠금을 유지하지 않는다. 삭제와 연결 경쟁은 행 잠금/CAS로 제어하며 연결된 증빙은 회원이 조용히 삭제할 수 없고 관리자 보존 정책을 거친다. 회원/IP 속도·일일 바이트·동시성 제한, 콘텐츠 해시 악용 감지, 보안 경고 비식별 처리. 분석에 본문·바이트·EXIF·회원 ID·오브젝트 키 저장 금지.
- **기존 공개 URL 이전:** 권한 있는 읽기 전용 집계로 `support_messages` 내 `/api/v1/content/chat/media/` URL을 조사하되 일반 DM/로비 파일과 분리한다. 외부 엣지 접근 가능성, 캐시/CDN, 보존 의무 및 소유권 검증 프록시 전환 가능성을 먼저 확인한다. 새로운 고객지원 공개 URL 삽입을 중단하는 시점은 호환되는 비공개 경로 검증 이후로 정한다. 기존 DM 이미지 경로를 무작정 차단하거나 기록을 삭제하지 않는다. 이미 공유·캐시된 URL은 헤더 변경만으로 회수되지 않으므로 개인정보 담당자와 무효화·고지·대응 계획을 협의한다. 검증 전 과거 URL 상태는 `legacy_unverified`로 표시하며 소급 비공개 보장을 주장하지 않는다.
- **SEO·모바일·접근성·지표:** 회원/관리자 증빙·영수증은 `Cache-Control: private, no-store`, 안전한 래스터 미리보기가 아니면 `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`, 제한 CSP, noindex/nofollow, 사이트맵 제외, referrer 누출 차단. 320px 대응·키보드 선택/제거·8MiB/3개 제한 안내·진행률·`role=status`·오류 포커스·이미지 대체 텍스트·WCAG 2.2 AA. Android content URI 권한 만료·백그라운드 재시도 시 멱등 키 유지. KPI는 검증된 업로드→첨부율, 검사 실패 차단, 타 회원 거부, 고아 파일 회수 p95, 폐기 링크 접근, 과거 URL 조사 범위, 중복 영수증, 전송 바이트, 허위 성공 0건; 모두 비식별 집계. 안전 목표는 타 회원 바이트 0, 비공개 증빙 공개 캐시 0, 검사 전 READY 0, 허위 첨부 성공 0이며 참여 지표 목표는 근거 없이 수치화하지 않는다.
- **테스트·배포·롤백:** 실제 PostgreSQL·HTTP RED/GREEN: 타 회원/비로그인/무권한 관리자 100회 바이트·메타데이터 0, 동일 키 동시 업로드/연결 100건에서 영수증·연결 1건, 같은 키 다른 내용 100건 409, 삭제·연결 경쟁 100건에서 연결 파일 유실 0, 동일 시각 이력 10,001건 커서 누락·중복 0, 8MiB 경계, 위장 MIME/SVG/GIF, EXIF 제거, 압축 폭탄, 검사 서비스 장애, 고아 파일 회수, 파일명 XSS, Range/HEAD/캐시 우회, 웹·Android 동등성, 모바일 접근성, 기능 OFF 텍스트 회귀. 실제 엣지에서 익명·본인·타 회원·공유 캐시를 각각 테스트한다. 정확 SHA CI·lint/typecheck/build, 실제 DB 앱 권한 부정 테스트, Migration266 출처, Next 보안 감사, 암호화 백업 격리 복원, 인증 Test E2E, 배포 이미지 SHA·승인된 GitOps 승격/롤백이 모두 필요하다. 기능 OFF는 새 업로드만 막고 기존 대화·불변 영수증 보존, 비공개 파일은 계속 접근 통제, 격리 파일은 공개 금지. 운영 RELEASE HOLD; 기획 예약은 배포하지 않는다.
- **P0/P1 개발 백로그:** P0 `SUP1192-01` 고객지원 공개 미디어 URL 조사·신규 사용 차단 게이트, `SEC1192-02` 소유권/RBAC·비공개 no-store·앱 역할 최소권한, `REL1192-03` QA v1193 lint/보안/Migration266/브랜치 보존/정확 SHA Test/복원. P1 `SUP1192-04` DB·비공개 저장·검사/재인코딩·고아 파일, `SUP1192-05` 멱등 업로드·연결 API·영수증, `SUP1192-06` 회원/관리자/Android 화면·레거시 호환, `SUP1192-07` 남용·개인정보·SEO·접근성·KPI, `SUP1192-08` 실제 DB/엣지 보안·회귀·롤백. 런타임/DB 개발은 A/B/C의 별도 브랜치·QA 게이트에 연계하며 본 기획 브랜치에는 포함하지 않는다.
- **외부 독립 근거 게이트:** OWASP File Upload(https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)·API1 객체 접근 통제(https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/)(발행기관 OWASP 1곳), Mozilla MDN Cache-Control(https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)(발행기관 Mozilla 1곳) 검토. 독립 발행기관 2곳, 신규 승인·중복 제거된 증거 0건, 누적 승인 미확인, 목표 10,000건 => BLOCKED. 검토 문서는 설계 참고이며 검증된 독립 근거 10,000건 달성 주장이 아니다.

## v2026.10.23.1190 — F675-104 고객지원 사건 상태·재시도 정합성 강화 (기능 보완 / 초안 / 운영 보류)
- **회차·기준:** 이전 Feature Addition v1188 / 현재 Feature Improvement v1190 / 다음 Feature Addition v1192(잠정). 최신 `origin/main` `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`, 선행 Draft PR #1028, 개발 이슈 #1029, QA v1191 FAILED/HOLD 확인. v1188 사건 이력 기획은 아직 미병합. 격리 문서 기획이며 구현·운영 사고·경쟁조건 재현을 주장하지 않는다.
- **실제 소스·개발 DB 근거(읽기 전용):** `packages/database/migrations/196-user-admin-support-chat.sql`의 대화 상태는 `open|waiting_user|resolved`, `support_messages.idempotency_key UNIQUE`와 `support_threads.create_key UNIQUE`가 이미 존재한다. 개발 DB에는 문의 3건/메시지 6건, 앱 계정은 `support_threads` UPDATE 및 `support_messages` DELETE 권한을 가진다. `support_create_thread`는 같은 생성 키 재요청 시 회원 소유권만 검사하고 제목·첫 본문 동일성은 검사하지 않아 다른 내용도 기존 영수증으로 보일 가능성이 있다. `support_add_message`/`admin_support_reply`는 키 SELECT 후 INSERT 방식으로 명시적 잠금/`ON CONFLICT` 처리가 없으므로 동시 재요청이 UNIQUE 충돌로 노출될 수 있다(중복 영구행 발생 증거는 아님). `admin_support_set_status`에는 예상 버전·멱등 키가 없어 회원 답변과 상태 변경 충돌을 구분하지 않는다. 웹 회원·관리자 폼은 제출마다 새 UUID를 생성한다. 사건 이력 API는 아직 미구현이다.
- **P0 상태·메시지 원자성:** 회원 답변, 관리자 답변·종결, 사건 분류·재검토 요청은 공통 `support_threads` 행을 `SELECT ... FOR UPDATE`로 먼저 잠근 후 소유권/권한, 현재 상태, `case_version`, 허용 전이를 검증한다. 잠금 순서는 thread→case metadata→escalation/receipt→event→outbox로 고정하고 네트워크 호출 중 DB 잠금을 유지하지 않는다. 성공 시 대화 상태, 버전, 불변 이력, 서버 영수증을 하나의 트랜잭션으로 확정한다. 종결 후 회원 답변은 `open`으로 재개되고 `member_reopened` 이벤트를 남긴다. 구버전 상태에 기초한 관리자 종결은 409 및 최신 상태를 반환하고 회원 답변을 덮어쓰지 않는다. 관리자/회원 동시 답변도 버전형 전이로 직렬화한다. 기능 OFF 시 기존 채팅은 호환 래퍼로 계속 동작한다.
- **P0 멱등성·요청 지문:** 기존 UNIQUE 인덱스 중복 생성 금지. 대화 생성 키는 회원+정규화 제목+첫 본문 지문에, 메시지 키는 회원+대화+발신 종류+정규화 본문 지문에 결합한다. 기존 대화는 행 잠금, 신규 대화는 UNIQUE 충돌 안전 INSERT/재조회로 처리한다. 같은 키/같은 지문은 동일 저장 영수증 1건, 같은 키/다른 지문은 409, 타 회원의 영수증 내용은 노출하지 않는다. 23505/500을 원시 노출하지 않고 재조회 후 일관된 응답을 반환한다. Unicode 정규화 규칙을 고정하되 원본 메시지는 임의 수정하지 않는다. 웹·Android는 타임아웃 재시도에서 동일 UUID를 유지한다. 로그에 본문·요청 지문을 남기지 않는다.
- **P0 DB 권한·관리자 분리:** DB/Backend 담당 B가 검토하는 순방향 migration으로 지원 테이블 직접 UPDATE/DELETE를 회수하고 고정 search_path의 `SECURITY DEFINER` 함수 EXECUTE를 최소권한으로 부여한다. 새 분류/결정 기능은 지원 전용 RBAC와 민감 변경 시 관리자 세션/추가 인증을 요구한다. 일반 관리자 역할 존재만으로 재검토 결정권을 주지 않는다. 회원 사건/이력/영수증 및 Android 경로 모두 DB와 Nest BFF에서 실제 소유권 확인, 타 회원은 404, 무권한 관리자는 403, 사건 식별자·본문·타이밍 정보 유출 금지.
- **P1 API·화면:** v1188의 `GET /api/v1/support/cases/:id`, `GET .../events`, `POST .../escalations` 및 관리자 큐·분류·결정 API 유지. 신규 쓰기에는 `Idempotency-Key: UUID` 및 `If-Match: caseVersion` 필수. 응답은 DB 확정 `receiptId,caseVersion,chatStatus,triageState,committedAt`와 `notificationEvidence: pending|accepted|unknown|failed`를 제공하며 제공자 수락을 실제 도달로 표현하지 않는다. 409는 최신 버전, 결과 불명 503은 같은 키로 영수증 재조회, 새 키 재발급 자동 재시도 금지. `GET .../receipts/:key`는 본인/허용 관리자만 조회하고 상태를 바꾸지 않는다. 기존 `PUT /admin/support/threads/:id/status`도 CAS 호환 검증을 거쳐 우회 경로가 되지 않도록 한다. 회원 `/support/cases/:id`와 관리자 `/admin/support/cases`에서 대기/충돌/조회불가/확정을 구별하고 URL 파라미터로 성공을 위조하지 않는다.
- **P1 DB 제약·인덱스:** v1188 `support_case_meta`, `support_case_events`, `support_case_escalations` 및 기존 채팅 재사용. `case_version bigint CHECK >0`, `UNIQUE(thread_id,sequence)`로 사건 순서를 보장한다. 제안 `support_case_operation_receipts(request_key uuid PRIMARY KEY, thread_id uuid FK, actor_id uuid, operation text, request_fingerprint bytea, resulting_case_version bigint, receipt_id uuid UNIQUE, committed_at timestamptz)`는 불변으로 관리한다. 상태만 변경하는 작업도 동일 영수증 계약 사용. `support_case_events(thread_id,sequence DESC)`, `support_case_meta(triage_state,priority,target_at,thread_id)` 인덱스, 타 회원 재검토·고아 이벤트 차단, 정책 버전 감사. 알림 의도는 같은 트랜잭션의 Outbox에 저장하고 외부 전송은 커밋 이후. 자동 환불·WLD 잔액 변동·금융 개인정보 전송·임의 첨부파일/외부 제공자 도입 금지.
- **회원·관리자·보안·품질:** 회원의 ‘재검토 요청’ CTA는 본인 사건이며 조건을 만족할 때만 활성화하고 미충족 사유와 서버 근거 목표시간을 표시하되 처리 기한을 보장하지 않는다. 관리자 ‘담당자 지정/우선순위/종결/재검토 결정’은 사유·최신 버전, 민감 결정은 이중 확인. 사건 화면은 private/no-store/noindex/nofollow, 사이트맵·외부 분석 제외, 320px/Android 동일 기능, 키보드·포커스·`aria-live`, WCAG 2.2 AA, 한국어·영어 상태 동등성. 초기 악용 방지 제안 재검토 7일당 사건별 3회(운영 근거 확인 전 미확정), 관리자 일괄 작업 제한, 비식별 불변 감사. KPI는 구버전 충돌, 멱등 지문 불일치, 실제 첫 인간 답변 p50/p95, 재개·재검토·타 회원 차단·허위 성공·대기열 나이. 메시지 본문은 지표에서 제외.
- **수용·배포·롤백:** 실제 PostgreSQL RED/GREEN 테스트: 동일 키 생성/답변/재검토 100건 동시 처리→각각 저장 객체·영수증 1건, 같은 키/다른 본문 100건→409, 관리자 종결/회원 답변 및 양측 답변 충돌 100건→버전 단조 증가·이력 순서 유지·답변 누락 0건, 타 회원/무권한 관리자 100건→노출 0건, 동일 시각 이력 10,001건→순번 커서 누락 0건, 커밋 후 타임아웃 재조회, 23505 처리, Unicode·CSRF·XSS·모바일 재시도·기능 OFF 회귀. 정확 SHA 전체 CI, 실제 DB 부정 권한, Migration266 출처, 보안 감사, 인증된 Test E2E, Android 동등성, 암호화 백업의 격리 복원, 검토 승인을 거친 후 운영승격. `support_case_tracking` 기본 OFF, 읽기 전용 관찰→Test→제한 활성화→승인된 운영 순서. OFF 롤백은 기존 채팅·감사·영수증·이력을 보존하고 파괴적 역마이그레이션 금지.
- **우선순위·담당:** P0 `SUP1190-01` 대화 생성 키 지문/충돌 안전 영수증; P0 `SUP1190-02` 직렬화된 답변·종결·사건 버전; P0 `SEC1190-03` 지원 테이블 직접 DML 회수·소유권/RBAC; P0 `REL1190-04` QA v1191·CI/Next 보안/Migration266/129개 과거 브랜치 보존/정확 SHA Test/격리 복원 차단. P1 `SUP1190-05` 작업 영수증 스키마·커서·Outbox; P1 `SUP1190-06` 웹·관리자·Android 화면/CTA; P1 `SUP1190-07` 관리자 비식별 통계·접근성·SEO·악용 방지; P1 `SUP1190-08` 동시성·권한 부정·멱등·롤백 회귀. 개발 이슈 #1029와 B 담당에 전달; 개발 A 지갑/P2P #1025, C 블로그, Gemini, QA 변경과 분리하고 기획 예약에서 런타임 배포 금지.
- **외부 근거 게이트:** PostgreSQL 행 잠금 <https://www.postgresql.org/docs/17/explicit-locking.html>, PostgreSQL UNIQUE <https://www.postgresql.org/docs/current/indexes-unique.html>, OWASP API1 객체 권한 <https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/> 검토. 독립 발행기관 2곳(PostgreSQL/OWASP), 신규 최종 승인 근거 0건, 누적 중복 제거·승인 수량 미확인, 목표 10,000건 **BLOCKED**. 단순 열람 자료를 승인된 10,000건으로 계산하지 않는다.


## v2026.10.23.1188 — F675-104 회원 문의 사건 진행 이력·분류·재검토 영수증 (기능 추가 / 기획 초안 / 배포 보류)
- **주기·기준:** 이전 기능 보완 v1186, 현재 기능 추가 v1188, 다음 기능 보완 v1190(잠정). Debian 13.6에서 `origin/main` `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` 조사. QA v1189 FAILED/HOLD는 현 main 이전 기준. 저장소 무결성 사고 #1016/#1022로 과거 미병합 브랜치 끝점 129개가 main에 없음. 일괄 복구·PR 재개·브랜치 정리·운영승격 금지. 격리된 문서 전용 브랜치로 런타임·DB 미변경.
- **실제 확인한 공백:** `frontend/src/app/support/page.tsx`는 회원 문의와 답변, `frontend/src/app/admin/support/admin-support-view.tsx`는 3가지 대화 상태, `backend/src/support/support.controller.ts`는 세션/CSRF 보호 API를 제공. 마이그레이션 `196-user-admin-support-chat.sql`에는 `support_threads`, `support_messages`, 소유자 검증 SECURITY DEFINER 함수가 있음. 해당 경로에 사건별 재검토, 우선순위 분류, 버전형 응답 목표, 회원이 볼 수 있는 불변 진행 이력은 확인되지 않음. 개발 DB 읽기 조회: 문의 3건·메시지 6건·문의 컬럼 8개·메시지 컬럼 7개. 앱 역할이 support_threads UPDATE, support_messages DELETE 권한을 가진 것은 전역 P0 최소권한 회귀. 운영 사고 발생의 증거는 아님.
- **목적·대상·범위:** 로그인 회원이 문의의 실제 처리 경과, 관리자 확인 여부, 다음 처리 주체와 지연 시 재검토 요청 결과를 확인하도록 함. 담당 운영자는 분류·답변·사유 기록, 승인된 감독자는 재검토 판단, 보안 감사자는 비식별 사건만 열람. 기존 대화와 메시지는 그대로 정본으로 유지. 자동 환불·WLD 지급·계정 제재·응답시간 보장·AI 자동 판정·임의 파일 업로드·새 외부 발송 제공자 추가는 제외.
- **화면·CTA·상태:** 기존 `/support?thread=<uuid>`에 ‘처리 진행’ 탭과 `/support/cases/:id` 연결. 회원에게 사건번호·생성시각·검증된 마지막 관리자 답변·현재 대화 상태·안내용 우선순위·정책 기반 *목표* 응답시각(보장 아님)·이력·‘재검토 요청’ CTA를 표시. 사유 입력, 신청 자격·대기기간, 서버 확정 영수증을 제공. 상태 `new|triaged|awaiting_operator|awaiting_member|escalation_requested|under_review|resolved|unavailable`; 로딩·빈 목록·오류·충돌·권한거부를 구별. 관리자 `/admin/support/cases`에는 우선순위/경과시간 필터, 커서 큐, 담당자 지정·확인·재분류·완료 CTA와 사유 의무 입력 및 민감 작업 2차 확인. URL 쿼리만으로 처리 완료 표시 금지.
- **제안 API(미구현):** 회원 `GET /api/v1/support/cases/:id`, `GET /api/v1/support/cases/:id/events?cursor=&limit=20`, `POST /api/v1/support/cases/:id/escalations` 요청 본문 `{reason:1..1000자}`, `Idempotency-Key: UUID`, `If-Match: caseVersion`. 관리자 `GET /api/v1/admin/support/cases?state=&priority=&cursor=&limit=`, `PATCH /api/v1/admin/support/cases/:id/triage`(버전·담당자·분류·우선순위·사유), `POST /api/v1/admin/support/cases/:id/escalations/:requestId/decision`, 감사 대상 `POST .../:id/resolve`. 기존 대화 API 불변. 응답 `caseId,threadId,caseVersion,chatStatus,triageState,priority,nextActor,targetAt?,targetPolicyVersion?,eventsCursor,receiptId?`. 오류 400 유효성, 401 비로그인, 403 관리자 권한, 404 타 회원 사건, 409 버전/멱등 충돌, 429 제한, 503 결과 불확실+안전한 영수증 재조회. 오류에 개인정보 미포함. Next 서버 BFF가 세션으로 사용자 식별, 쓰기 CSRF 필수. Android `/app-api/v1/support/cases/*`는 route-map/계약 검토 후 동일한 소유권·상태 의미 적용하며 요청 본문의 user_id 불신.
- **DB·제약·인덱스:** 기존 `support_threads(id,user_id,status,last_message_at)`, `support_messages(thread_id,...)` 재사용. 기존 대화 상태 3종과 메시지를 복제하거나 대체하지 않음. 제안 `support_case_meta(thread_id uuid PRIMARY KEY REFERENCES support_threads(id), category CHECK, priority CHECK('normal','high','urgent'), triage_state CHECK, assigned_admin_id uuid NULL, policy_version integer NOT NULL, version bigint NOT NULL DEFAULT 1, target_at timestamptz NULL, updated_at timestamptz NOT NULL)`; `support_case_events(id uuid PK, thread_id FK, sequence bigint, actor_id uuid NULL, actor_kind CHECK, kind CHECK, safe_metadata jsonb, created_at timestamptz, UNIQUE(thread_id,sequence))`; `support_case_escalations(id uuid PK, thread_id FK, requester_id FK, request_key uuid UNIQUE, payload_digest bytea, state CHECK, created_at, decided_at NULL)`; `support_case_policies(version PK, target_minutes integer CHECK >0, business_calendar text, effective_at, approved_by)`. 인덱스 `(triage_state,priority,target_at,thread_id)`, 이력 `(thread_id,created_at DESC,id DESC)`, 재검토 큐 `(thread_id,state,created_at DESC)`; 회원 문의 `(user_id,last_message_at DESC,id DESC)`는 196에서 기존 제공. 48영업시간 응답 목표는 검증된 SLA가 아닌 설정 가능한 초기 *제안값*.
- **트랜잭션·상태 정합성:** 기존 문의 행 잠금 → 사용자·관리자 권한, 버전, 전이 허용 여부 확인 → 사건 이벤트·재검토/분류 변경·버전 증가·내구성 있는 알림 의도를 **단일 PostgreSQL 트랜잭션**으로 확정. 동일 멱등 키+동일 요청 지문은 동일 영수증 반환, 같은 키+다른 지문은 409. 완료·답변·재검토 동시 요청에서 대화/사건 상태 모순 방지. 사건 종료는 대화 상태 `resolved` 및 종료 사유를 요구하며 회원 답변으로 대화가 재개되면 새로운 사건 이벤트 기록. 외부 알림 발송 중 DB 잠금 유지 금지. 알림 전달 근거가 없으면 사건 전이는 기록하되 발송 상태는 `unknown`으로 표시. WLD·원장 변경 없음.
- **보안·악용·개인정보:** 고정 `search_path`의 검토된 SECURITY DEFINER 함수, 서버 인증에서 파생된 행위자, DB 내부 회원 소유권 검증, 관리자 역할 및 필요 시 재인증. 앱 계정 직접 INSERT/UPDATE/DELETE 허용 금지. UUID는 인증 대체 수단이 아님. 재검토 요청 제한 초안: 사건별 진행 중 1건, 결정 후 48시간 대기, 회원당 하루 5건(운영 데이터로 조정). HTML/스크립트 렌더링, 임의 외부 URL 요청, 안전성 미검증 첨부 차단; 일반 텍스트만. 내부 직원 메모·타 회원 식별자·원문은 회원 이력/분석에서 제외. 비식별 불변 감사, 보존·법적 보존정책은 구현 전 승인, 계정 삭제는 기존 생명주기 정책 준수, 파괴적 마이그레이션 금지.
- **SEO·모바일·접근성:** 회원 문의/사건/이력 및 관리자 화면 모두 `noindex,nofollow`, 사이트맵 제외, `Cache-Control: private,no-store`, 비공개 OpenGraph/JSON-LD 금지. 320px 및 Android 소형 화면에서 읽기 쉬운 이력, 키보드 접근 가능한 CTA·타임라인, 명확한 포커스, 영수증·오류 `aria-live`, WCAG 2.2 AA, 국영문 용어 일치. 제3자 분석/리퍼러로 사건 식별자 유출 방지. 웹·Android 어느 쪽에서도 사건 소유자 변경 불가.
- **분석·관리:** 첫 *사람* 답변 시간 중앙값/p95, 미처리 경과시간, 100건당 재검토 수, 응답 *목표* 초과 수, 재개율, 선택적 만족도, 타 회원 접근 차단, 멱등 충돌, 허위 성공 건수, 대기열 지연. 관리자에게 역할별 최소 사건 정보와 집계만 제공. 분석 로그에 메시지 본문·개인 식별자·WLD 잔액 금지. 보안 사건은 감사 채널로만 기록.
- **검증·배포·롤백:** 동일 키 재검토 동시 100건에서 재검토/이벤트/영수증 각각 1건, 같은 키의 다른 본문 100건은 409, 타 회원 접근 100건 전부 차단, 관리자 권한 음성 테스트 100건, 종료-회원답변 경합 100건에서 버전·상태 일관성, 같은 시각 이력 10,001건 커서 누락·중복 0건. DST/영업일 정책, XSS, HTML 이스케이프, CSRF, UUID 오류, 담당자 부재, 빈 큐, 지연 답변, 타임아웃, 롤백, 웹·Android 계약 동등성 검사. `support_case_tracking` 기본 OFF, DB 개발 B 담당 추가형 전진 마이그레이션, 검토 없는 기존 데이터 일괄 변경 금지. 기존 대화 그림자 조회→제한 Test→카나리→점진 활성화. 정확 SHA CI, 실제 PG 최소권한 음성 테스트, Migration 266 출처, 백업·격리 복원, 로그인 Test E2E, PR 승인, GitOps 승격 게이트 필수. OFF 전환 시 신규 분류/재검토만 중단, 기존 대화·이력 보존, 비파괴 롤백.
- **P0/P1 백로그:** P0 `SUP1188-01` 회원별 사건 조회·실제 영수증; P0 `SEC1188-02` 앱 역할 직접 DML 회수·음성 테스트(B 및 #828/#993 조정); P0 `REL1188-03` 브랜치 증거 보존 #1016/#1022, Next 감사·CI·Migration266·백업·정확 SHA 보류; P1 `SUP1188-04` 버전형 사건 메타데이터·이력·분류; P1 `SUP1188-05` 원자적 재검토·멱등성·목표 정책; P1 `SUP1188-06` 회원/관리자 웹 및 모바일 App API; P1 `SUP1188-07` 개인정보·접근성·SEO·운영 분석; P1 `SUP1188-08` 동시성·권한·커서·DST·롤백 QA. 개발 A 지갑/P2P(#1025), B DB/CI, C 블로그, Gemini, QA 코드와 분리. 본 브랜치는 문서만 변경.
- **외부 독립 근거 게이트:** OWASP API1 객체 권한 (<https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/>), PostgreSQL 잠금 (<https://www.postgresql.org/docs/current/explicit-locking.html>), W3C WCAG 2.2 (<https://www.w3.org/TR/WCAG22/>) 등 발행기관 3곳 검토, **신규 검증·중복 제거 승인 0건**, 누적 승인 실수량 미확인, 목표 10,000건 BLOCKED. 달성 주장 금지.

## v2026.10.23.1186 — F675-103 검증형 알림 묶음 발송 안전성 강화 (기능 보완 / 초안 / 보류)
- **회차·기준:** 이전 Feature Addition v1184, 현재 Feature Improvement v1186, 다음 Feature Addition v1188(잠정). v1184 F675-103을 보완하며 대체하지 않는다. 조사 기준 main `1a31a6f2df2b75a0accceef12662dc42d9ab2d45`, 선행 Draft PR #1014 `aed8d058`; QA v1187 FAILED/HOLD는 현재 main보다 이전이다. 기획 문서만 수정하며 코드·DB·잔액·스위치·Test·Production은 변경하지 않는다.
- **실제 구조의 빈틈:** 개발 DB `in_app_notifications.id`는 UUID, `dedupe_key`는 부분 UNIQUE지만 `category`는 자유 텍스트로 동의 목적과의 대응표가 확인되지 않았다. `notification_preferences`의 `state DEFAULT 'OPTED_IN'`, nullable `consented_at`, 기본 `source_surface='WEB_SETTINGS'`는 자발적 동의 증거가 아니다. `outbox_events`에는 UUID PK·재시도 정보만 있고 다이제스트 멱등 UNIQUE가 없다. 기존 Nest 알림 목록은 `created_at DESC`와 OFFSET만 사용하고 ID 동률 정렬이 없으며 다이제스트 API는 미구현이다. 이것이 운영 사고 발생의 증거는 아니다.
- **P0 명시적 동의·대상 판정:** 선택형 외부 다이제스트 발송 전 실제 소유자·목적·채널별 명시적 `OPTED_IN`, 검증 가능한 `consented_at`, 신뢰할 수 있는 불변 동의 감사·출처·정책 버전, 미철회 상태 및 활성 설정을 모두 확인한다. DB 기본값이나 클라이언트가 보낸 `source_surface`는 증거가 아니다. 검토·버전 관리되는 `category→purpose_code` 매핑과 원천 이벤트 검증이 없으면 해당 알림을 제외하고 사유만 비식별 감사한다. 분류 불명, 근거 없는 금융 금액, 필수·선택 구분 불명도 제외한다. 필수 계정·보안·거래 알림은 즉시 경로를 유지한다. 기존 설정 PK를 재사용하며 위험한 기본값 수정은 F675-102 담당의 검토된 전진 마이그레이션으로만 수행한다.
- **P0 발송 1회 제약:** `notification_digest_windows.UNIQUE(user_id,channel,frequency,window_start_utc,window_end_utc)`만으로는 Outbox 중복이 막히지 않는다. `notification_digest_windows.outbox_event_id uuid UNIQUE REFERENCES outbox_events(id)` 및 `notification_digest_dispatch_keys(digest_id uuid PRIMARY KEY REFERENCES notification_digest_windows(id),request_fingerprint bytea NOT NULL,outbox_event_id uuid UNIQUE NOT NULL REFERENCES outbox_events(id),created_at timestamptz NOT NULL)`을 제안한다. 창 행 잠금과 함께 한 트랜잭션에서 기록한다. 결정적 키는 회원·채널·UTC 반열린 구간·목적 정책 버전·설정 버전을 포함한다. 같은 키/같은 지문은 기존 영수증, 다른 지문은 409. 기존 알림 `dedupe_key`는 대체물이 아니다. 다른 발행자 검토 없이 공용 Outbox에 전역 UNIQUE를 추가하지 않는다.
- **P0 철회·외부 전송 경쟁:** 외부 제공자가 이미 수락한 메시지 회수는 보장하지 않는다. 회원/채널 발송 세대와 영속 `CLAIMED→HANDOFF_STARTED→PROVIDER_ACCEPTED|UNKNOWN|FAILED` 시도 기록을 둔다. 철회 요청은 즉시 신규 선점·전송 시작을 차단하고, 진행 중 시도는 `REVOCATION_PENDING`으로 표시한다. 기존 전송이 종료·확인되고 펜싱된 뒤에만 `revocation_effective_at`을 확정한다. 네트워크 호출 동안 DB 잠금을 유지하지 않는다. 전송 직전 세대·동의·방해금지를 재검사하고 낡은 임대를 거부한다. `UNKNOWN` 응답은 무조건 재전송하지 않는다. 제공자 수락은 실제 전달·읽음이 아니다. 기능 OFF/롤백은 신규 선택형 전송만 차단하고 철회·미확정 상태·불변 감사를 보존한다.
- **P1 API·권한:** 회원 전용 `GET/PUT /api/v1/notifications/digest/preferences`, `POST .../preview`, `GET .../history`와 관리자 재시도에 `settingsVersion`, `consentPolicyVersion`, `dispatchGeneration`, `revocationStatus: NONE|PENDING|EFFECTIVE`, `receiptId`, `deliveryEvidence: NONE|ACCEPTED|UNKNOWN`를 명시한다. 쓰기는 `If-Match`와 UUID `Idempotency-Key` 필수. 구버전·다른 본문 재사용 409, 결과 불명 503+조회 가능한 영수증, 타 회원 404, 비인증 401. 행위자는 세션·앱 토큰에서 결정하며 요청 본문을 신뢰하지 않는다. 관리자 재시도는 RBAC·재인증·사유·불변 감사가 필요하며 동의를 우회하지 못한다. 웹 BFF와 Android App API는 같은 계약을 사용한다. `?saved=1`만으로 성공 표시 금지.
- **P1 DB·커서:** 고정 `search_path`의 소유자 검증 SECURITY DEFINER 함수, 최소 EXECUTE, 앱 계정 직접 DML 금지, 타 회원 부정 테스트를 요구한다. 다이제스트 항목과 `in_app_notifications(user_id,id)`는 검토된 복합 UNIQUE/FK 또는 원자적 함수 소유자 검사로 연결한다. 이력은 `(user_id,created_at DESC,id DESC)` 인덱스와 서명된 불투명 키셋 커서로 동시각 10,001건을 누락·중복 없이 처리하고 OFFSET을 사용하지 않는다. 스케줄러 `(status,scheduled_at,id)` 인덱스 및 제한된 `SKIP LOCKED` 선점을 적용한다. 메시지 본문을 외부 제공자 메타데이터·분석·관리자 로그에 복사하지 않는다.
- **P1 시간·화면:** 검증된 IANA 시간대로 일간·주간 로컬 구간을 UTC 반열린 구간으로 변환한다. DST 존재하지 않는 시각은 다음 유효 시각, 반복 시각은 첫 번째만 사용한다. 설정·시간대 버전이 바뀌면 오래된 대기 창을 취소한다. 방해금지 충돌은 선택형 알림만 허용되는 다음 시각으로 연기한다. 회원 `/account/notifications/digest`, `.../history`에 `disabled|enabled|paused|revocation_pending|queued|accepted|unknown|failed`를 명시한다. 미리보기는 발송하지 않고 저장 성공은 서버 확정 영수증에만 표시한다. 320px 이상 모바일, WCAG 2.2 AA 키보드·초점·상태·오류, Android 13+ OS 권한과 서버 동의 분리, 비공개 no-store/noindex/nofollow 및 사이트맵 제외를 적용한다.
- **P1 관리자·지표·악용:** 목적/채널별 비식별 발송·억제·실패, 대기열 p95, 검증 동의 차단, 결과 불명, 중복 키 충돌, 철회 대기 시간, 허위 성공 0건, 전달 1,000건당 불만을 측정한다. 회원 명단·본문·기기 토큰은 공개하지 않는다. 미리보기 초기 제한 10회/회원/시간, 재시도 예산 및 대량 발송 2인 승인 제안은 운영 기준 확인 전 가안이다. 진단 이벤트 30일 보관도 개인정보 검토 전 가안이며 필수 금융 감사 증거는 임의 삭제하지 않는다.
- **수용·배포:** 창 선점 동시 100건에서 발송 키/Outbox 각 1건, 동일 PUT 100회에서 영수증 1건, 본문 충돌 100건에서 409, 타 회원 접근 100건 전부 거부, 철회·전송 충돌 100건에서 철회 효력 확정 뒤 신규 전송 시작 0건 및 진행 중 상태 정직 표시, 외부 응답 불명 100건에서 허위 전달 0·무조건 재전송 0, 동시각 10,001건 페이지네이션 무누락·무중복을 요구한다. DST·시간대 변경·권한 거부·빈 요약·HTML·관리자 재시도·롤백 회귀도 필요하다. 정확 SHA CI 전체 lint/typecheck/build, 실제 PostgreSQL 권한 부정 테스트, Migration 266 이력, Android 동등성, 인증 Test E2E, 백업·격리 복원, GitOps 승인을 통과하기 전 `notification_digest` OFF, Production HOLD를 유지한다.
- **재정렬 백로그:** P0 `NOTIF1186-01` 동의·목적 분류·원천 검증, P0 `NOTIF1186-02` 발송 키/Outbox UNIQUE·외부 응답 정직성, P0 `SEC1186-03` 앱 계정 최소권한/SECURITY DEFINER 소유자 검증, P0 `REL1186-04` CI·보안·Migration266·백업/복원·정확 SHA. P1 `NOTIF1186-05` 철회/임대 펜싱, P1 `NOTIF1186-06` 키셋 이력·웹/Android 계약, P1 `NOTIF1186-07` 관리자·개인정보·SEO·접근성·KPI, P1 `NOTIF1186-08` 동시성/DST/롤백 회귀. 선행 PR #994/#998/#1005/#1010/#1014 및 이슈 #1015는 미병합, Gemini/개발 A/B/C/QA의 구현 변경과 분리한다.
- **외부 독립 근거 게이트:** 이번 회차 PostgreSQL SELECT/SKIP LOCKED, OWASP API1 객체별 권한, Android 알림 권한 등 발행기관 3곳 검토. 신규 중복 제거·승인 근거 0건, 누적 승인 UNKNOWN, 목표 10,000건 BLOCKED. 달성 주장 금지.


## v2026.10.23.1184 — F675-103 회원 선택형 알림 묶음 요약·조용한 전달 (기능 추가 / 초안 / 보류)
- **회차·진실 기준:** 이전 v1182 기능 보완, 현재 v1184 기능 추가, 다음 v1186 기능 보완(잠정). miniPC Debian 13.6, 최신 main `8dc8d7d34fb110db7c3b4702fe310d390165a502`, 열린 PR 27건. QA v1185 FAILED/HOLD는 현재 main보다 이전 기준이므로 현행 main 품질을 인증하지 못함. 영어 원본과 한국어 의미 동등. 문서만 변경하며 런타임·스키마·잔액·Test·운영 변경 없음.
- **문제·선행 의존성:** 실제 `backend/src/notification/notification.controller.ts`는 회원별 목록·읽지 않음·읽음 기능을 제공하며 `notification.service.ts`는 `in_app_notifications`를 offset으로 조회, 다이제스트 API는 없음. 개발 DB의 `in_app_notifications`와 `notification_preferences`는 각 0행, 기존 알림 `dedupe_key` 부분 UNIQUE, 설정 `(user_id,purpose_code,channel)` PK, `outbox_events` 재시도 메타데이터 확인. 운영 데이터 수량으로 일반화 금지. F675-101 검증 알림함(#994/#998), F675-102 동의·방해금지(#1005/#1010)는 미병합 초안으로, 구현된 기능으로 간주하지 않으며 검토된 인터페이스에만 의존.
- **목적·대상·범위:** 명시적으로 선택한 회원이 선택형 활동 알림 여러 개를 일간/주간 사실 기반 요약으로 받아 피로를 줄임. 계정 보안·필수 거래 안내는 즉시 경로를 유지하며 요약 때문에 지연·해제되지 않음. 대상은 로그인 회원, Android 앱 사용자, 비식별 운영 통계 담당자, 권한 있는 보안 감사자. 가상 WLD 지급·청구·이동 없음. 광고 동의 자동 가입 없음. 기본 OFF, 별도 선택 전 기존 알림 동작 불변.
- **화면·CTA·상태:** 알림 설정에서 `/account/notifications/digest` 진입, 활성화(명시 동의), 매일/매주, 주간 요일, 현지 전달 시각(초기 제안 09:00), IANA 시간대, 전달 채널, 미리보기, 저장, 일시중지, 재개, 이력 보기. 본인 이력 `/account/notifications/digest/history` 커서 조회. 관리자 `/admin/notifications/digests`는 비식별 집계·실패·승인된 재시도. 비로그인은 로그인으로 유도하되 데이터 누설 금지. 상태 `disabled|editing|saving|enabled|paused|previewing|preview_ready|empty|queued|sent|failed|unknown`. 실제 서버 커밋 영수증 없이는 성공 표시 금지; URL 쿼리/로컬 낙관적 상태로 성공 주장 금지. 미리보기는 발송이나 WLD 보상이 아니며 확인 불가 전송은 성공이 아닌 unknown.
- **내용·동의 규칙:** 본인에게 귀속된 확정 알림 중 선택형 이벤트만 정확한 UTC 기간에서 집계, 이벤트 ID·원천 검증·정식 상세 링크 사용. 검증되지 않은 금액·가짜 알림 수·원천을 읽을 수 없는 이벤트는 제외. 보안·계정·필수 거래 알림은 다이제스트 때문에 차단하지 않음. 기존 `notification_preferences`의 목적/채널 동의가 증거 있는 `OPTED_IN`이어야 외부 채널 발송 가능. 행 없음, 증거 없음, 철회, 상태 불명은 선택형 외부 발송 0건. 인앱 미리보기 조회는 외부 채널 동의 없이 가능하지만 푸시·이메일 발송은 불가. 실제 전달 직전에 동의·OS 권한·방해금지 재확인. 외부 제공자 수락 이후 메시지 회수는 보장하지 않는다고 고지.
- **제안 API(미구현):** `GET /api/v1/notifications/digest/preferences` 본인 조회, `PUT /api/v1/notifications/digest/preferences` 로그인·동의·CSRF + UUID `Idempotency-Key` + `If-Match` 버전, 엄격한 `{enabled,frequency:DAILY|WEEKLY,weekday:1..7,localHour:0..23,timeZone:IANA,channel:IN_APP|PUSH|EMAIL}`; `POST /api/v1/notifications/digest/preview` 본인·CSRF·횟수 제한·저장 없는 최대 20건 비식별 미리보기; `GET /api/v1/notifications/digest/history?cursor=&limit=20` 본인 안정적 커서(최대 100); `GET /api/v1/admin/notifications/digests` 운영 권한; `POST /api/v1/admin/notifications/digests/:id/retry` 운영 권한·최근 재인증·CSRF·감사 및 재시도 가능 상태 검증. Next BFF는 세션·CSRF를 안전하게 전달하고 내부 API 토큰 노출 금지. Android `/app-api/v1/notifications/digest/*`는 본인 범위·앱 인증과 동등 계약(정확 경로는 route-map/contract 검토 후 확정). 오류 400 검증, 401/403 인증·권한, 404 타인 리소스, 409 버전 충돌·동일 키 다른 내용, 429 남용, 503 불확실; 타 회원 존재 여부 유출 금지.
- **DB 설계(향후 검토된 순방향 마이그레이션):** `notification_digest_settings(user_id uuid PK FK users,enabled boolean NOT NULL DEFAULT false,frequency text CHECK DAILY|WEEKLY,weekday smallint CHECK 1..7,local_hour smallint CHECK 0..23,time_zone text NOT NULL IANA 검증,channel text CHECK IN_APP|PUSH|EMAIL,version bigint NOT NULL DEFAULT 1 CHECK >0,updated_at timestamptz NOT NULL)`; 실제 목적/채널 동의는 기존 `notification_preferences`에서만 판단하여 중복 동의 진실을 만들지 않음. `notification_digest_windows(id uuid PK,user_id uuid FK,channel,frequency,window_start_utc,window_end_utc,scheduled_at,status CHECK QUEUED|SKIPPED|SENT|FAILED|UNKNOWN|CANCELLED,request_fingerprint bytea,attempts integer CHECK >=0,version bigint,created_at,updated_at,UNIQUE(user_id,channel,frequency,window_start_utc,window_end_utc),CHECK(start<end))`; `notification_digest_items(digest_id FK,notification_id FK,PRIMARY KEY(digest_id,notification_id))`에서 함수가 회원 소유권 교차 검증; `notification_digest_delivery_events(id uuid PK,digest_id FK,event_kind,redacted_reason,created_at)`는 추가 전용. 인덱스 `(user_id,created_at DESC,id DESC)`, `(status,scheduled_at,id)`, `(digest_id,created_at,id)`. 기존 `dedupe_key` UNIQUE 재생성 금지. 앱 DB 계정 직접 DML 금지, 고정 search_path·actor 소유권·EXECUTE 최소권한을 갖춘 SECURITY DEFINER 함수와 부정 권한 테스트 필요.
- **원자 처리·시간대:** 스케줄러는 `FOR UPDATE SKIP LOCKED`로 예정 기간을 선점하고 본인·목적/채널 동의·설정 버전을 검사한 뒤 UTC 반열림 기간의 검증 알림 ID와 중복 제거 outbox 의도를 단일 트랜잭션으로 확정. 결정적 키 `digest:user:channel:window_start:window_end:settings_version`, 요청 지문 불일치 시 409. 외부 제공자 호출 중 DB 잠금 유지 금지. 실제 발송 직전 동의·방해금지 재검사; 철회는 설정 행 잠금/버전으로 미발송 선택형 알림을 취소. 이미 제공자 수락된 건은 실제 증거에 따라 SENT 또는 UNKNOWN으로 기록. 재시도는 상한 있는 지수 백오프 및 가능한 제공자 멱등 키, 응답 유실 시 무조건 재발송/성공 주장 금지. IANA 시간대 기준 다음 허용 슬롯 계산: DST 존재하지 않는 시간은 다음 유효 시각, 중복 시간은 첫 번째 발생만 선택, UTC 기간 UNIQUE로 중복 방지. 방해금지와 겹치면 다음 허용 시각으로 미루되 필수 보안/거래 알림은 별도 경로 유지.
- **관리자·보안·악용 방지:** 관리자는 예약·차단·실패 건수, 큐 지연, 해시 상관 ID만 기본 조회하고 회원 알림 본문·수신자 명단은 기본 비공개. 재시도는 RBAC·최근 재인증·CSRF·사유·불변 감사; 대량 발송은 2인 승인, 철회 동의 우회 불가. 회원별 DB 읽기 및 BOLA·CSRF·재생 공격 방어, 미리보기 회원/IP당 시간당 10회(검증 전 초기값), 작업자 전체 예산, 미리보기 20건 상한, 임의 외부 URL/HTML 차단, 내부 링크 허용 목록, 로그·분석·제공자 메타데이터 PII 금지. 발송 진단 보관 30일은 개인정보 검토 전 제안값. 동의 증거 없는 외부 발송 0건. 보안/금융 필수 알림과 명확히 분리.
- **SEO·모바일·접근성:** 회원 설정·이력·미리보기·관리자 URL `noindex,nofollow`, `Cache-Control: private,no-store`, 사이트맵 제외. 개인정보 없는 공개 도움말만 색인 가능. 320px 이상 반응형, WCAG 2.2 AA, 의미 있는 스위치, 키보드 조작, 시간대 선택 레이블, 오류 요약, 저장/미리보기 확정 상태 `role=status`, 오류 `role=alert`, 포커스 유지. Android 13+ `POST_NOTIFICATIONS` OS 권한은 서버 동의와 별개; 거부 시 푸시 금지, 인앱 기능은 유지.
- **분석/KPI:** 집계형 동의/철회, 예약 대비 제공자 실제 수락, 중복 기간, 철회 후 억제, 열람률, 미리보기→동의, 실패/UNKNOWN, 큐 지연 p95, 회원 불만률. 분석에 원문/회원 ID 금지. 초기 수용: 타인 조회 100회 중 허용 0, 철회 확정 이후 신규 발송 100회 경쟁 테스트에서 0, 동시 선점 100회에서 중복 발송 0, 허위 성공 0, 증거 없는 동의 발송 0, DST 기간 계산 결정적 fixture 99% 이상; 사업 KPI는 실측 전 임의 확정 금지.
- **검증·배포·롤백:** RED/GREEN 실제 DB 함수: 타인 100회 차단, PUT 동일 재시도 100회/설정 충돌 100회, 동시 기간 선점 100건→outbox 1건, 철회/발송 100건 경쟁, 동일 시각 10,001건 커서 누락/중복 0, DST 전환·시간대 변경, 빈 기간, 제공자 타임아웃/응답 불명, Android 권한 거부, HTML 주입, 관리자 대량 재시도 거부, a11y·noindex. 정확 SHA CI/타입/린트, 실 DB ACL 부정 검사, 프론트/백엔드/앱 API 계약, 로그인 Test E2E, Migration 266 정합, 암호화 백업+격리 복구, 런타임 SHA/이미지 digest 및 롤백 증거 필수. `notification_digest` 스위치 기본 OFF, 모든 게이트 후 제한적 카나리. OFF/롤백은 신규 선택형 발송만 중단하며 설정·감사·철회 증거·필수 보안/거래 알림 보존; 이전 작업자가 철회 동의를 무시하지 않도록 해야 함. 기획 예약은 운영 배포 금지.
- **P0/P1 백로그:** P0 `NOTIF1184-01` 소유권·원천·동의 검증; P0 `SEC1184-02` DB 최소권한/함수 권한; P0 `REL1184-03` 최신 main CI·보안·Migration266·백업/복구·정확 SHA Test 장애; P1 `NOTIF1184-04` 버전 설정·멱등 API; P1 `NOTIF1184-05` 결정적 기간·outbox·DST; P1 `NOTIF1184-06` 회원 웹·Android 동등; P1 `NOTIF1184-07` 관리자·개인정보·SEO·접근성·KPI; P1 `NOTIF1184-08` 동시성·회귀·카나리·롤백. 개발 A/B/C·QA·Gemini와 파일/브랜치 분리, 기획은 문서만.
- **외부 근거 게이트:** OWASP API Top 10 (https://api-security.owasp.org/editions/2023/en/0x00-header/), W3C WCAG 상태 알림 (https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), Android 알림 권한 (https://developer.android.com/develop/ui/compose/notifications/notification-permission), IETF RFC 5545 (https://datatracker.ietf.org/doc/html/rfc5545), PostgreSQL INSERT/ON CONFLICT (https://www.postgresql.org/docs/current/sql-insert.html) 등 발행기관 5곳 검토. 이는 최종 승인된 독립 근거 5건이 아님. 신규 승인·중복 제거 **0건**, 누적 승인 **미확인**, 목표 **10,000건**, 게이트 **BLOCKED**. 달성 주장 금지.


## v2026.10.22.1140 — F675-92 계산기 오류 신고·공식 검증 정정 알림 (기획 / 초안)
- **회차:** 이전 Feature Improvement v1138 / 현재 Feature Addition v1140 / 다음 Feature Improvement v1142(잠정). 기준 GitHub main `c3e62cd49da66c0b7c48223fcc81be888166f183`; miniPC 로컬 main 1커밋 지연. 열린 PR #975/#977/#978/#981/#985. QA v1135는 프론트 CI 7건 실패, 금융 DB 권한/마이그레이션 차단으로 FAILED/HOLD이며 개발 40계정 원장 대사 일치는 공식 Test/운영 합격을 뜻하지 않는다.
- **목적·대상:** 계산기를 사용하는 방문자가 수식, 세법 적용연도, 가정, 결과의 오류를 확인할 수 있고, 로그인 회원이 민감정보를 제거한 신고를 접수한다. 관리자 편집자 검토→독립 승인자 확인→정정 공지 게시를 분리한다. 과거 계산 결과를 자동 덮어쓰거나 WLD를 지급하지 않는다. 미병합 F675-91 저장 기능을 선행 구현으로 가정하지 않는다.
- **실제 코드 근거:** `frontend/src/lib/capital-gains-tax-calculator.ts`의 배우자 증여 옵션은 기본 6억원을 양도차익에서 바로 차감하나, 국세청의 일반 양도세 계산 흐름만으로 이런 무조건 차감을 정당화할 수 없다. 법률 검증 전 사용을 제한한다. 미실현 손실 매도 시 '즉시 절세', 과세표준 0이면 '전액 비과세' 표현도 과도하다. 코드가 고정 표시한 5월 1~31일 신고 기간은 국세청 2026-02-03 공지의 **2025년 국외주식 양도소득 확정신고 2026-05-01~06-01**과 불일치한다. `calculator-save-action.tsx`, `calculator-retention-funnel.tsx`는 서버 영수증 없이 저장/알림/1만 WLD 성공을 표시할 수 있다. 모두 코드·공식자료 불일치이며 실제 이용자 피해가 확인된 것은 아니다.
- **P0 CAL1140-01:** 배우자 증여의 직접 양도차익 차감 및 확정적인 절세·비과세·신고기한 문구를 법률 검증 전 제거/비활성화하고, 확인 불가 시 '가정 미검증 추정치'를 표시한다. 국가/과세연도/법령 시행일/출처 리비전을 고정한다. 국세청 계산 흐름 https://nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2310 , 2026-02-03 안내 https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=2307&nttSn=1348384 , 소득세법 제97조의2 https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033246747 대조. 개별 상황의 과세 적법성은 별도 법률 검증한다.
- **P0 CAL1140-02:** 개발 PostgreSQL 실측에서 `moneyverse_app`에 `support_threads`, `support_messages`, `in_app_notifications`, `outbox_events`, `privacy_data_subject_requests`의 SELECT/INSERT/UPDATE/DELETE가 모두 허용되고 RLS는 OFF. 최소권한 원칙과 실제 권한을 대조하고, 권한 부여 이력·기존 SECURITY DEFINER 함수·실 DB 부정 테스트를 거친 순방향 마이그레이션으로 복구한다. 운영 DB 유출의 증거는 아니다.
- **P0 REL1140-03:** 금융 ACL/266 체크섬, CI 7건, 인증된 실제 Test E2E, exact-SHA, 백업/복원/무중단 롤백 증거 전까지 운영승격 차단. 기획 회차에서 코드·잔액·기능스위치·배포 수정 금지.
- **회원 흐름:** 공식 `/tools/*` 결과에 '계산 오류 신고' 버튼. 로그인/동의 후 `결과 오류|기준 오래됨|가정 누락|화면 오류` 선택→수식 버전/국가/연도 표시→민감정보 제거 미리보기→고정 멱등 UUID 제출→DB 접수 영수증 확인. 상태 `draft|submitting|submitted|unknown|rejected`, 서버 확인 전 성공 표시 금지. `/account/calculation-reports`에서 본인 신고만, `/tools/corrections`에서 승인된 공개 정정만 조회. 비회원은 정정 공지 열람과 선택적 로그인만 가능.
- **관리자:** `/admin/calculators/issues` 대기열, 심각도·중복군·수식 버전·증거·검토자 분리·승인/철회. 상태 `received→triaged→verifying→approved→published→closed` 및 `rejected|needs_information`; 세법 민감 정정은 작성자와 승인자 동일인 금지. 지연은 관리자 알림만, 기존 공개 콘텐츠 자동 비공개 금지. 정정 롤백은 공지 버전·스위치로 처리하고 과거 결과는 보존.
- **API:** 인증/동의/CSRF `POST /api/v1/calculators/issues`(idempotencyKey, calculatorKey, formulaVersion, issueKind, redactedExplanation 1000자 이하, HTTPS 허용 목록 출처); 본인 `GET /api/v1/calculators/issues?cursor=`; 공개 `GET /api/v1/calculators/corrections?calculatorKey=`; 관리자 `GET /api/v1/admin/calculators/issues`, `POST /api/v1/admin/calculators/issues/:id/decision`(관리자 세션, CSRF, 버전 비교). 400/401/403/409/413/429/503 오류 구분 및 정보노출 차단. 기존 `/support/threads`와 `in_app_notifications` 재사용. `/app-api/v1/*`은 모바일 쿠키/CSRF를 유지하고 내부 토큰을 노출하지 않는다.
- **DB·인덱스:** `calculator_issue_reports(id uuid PK, reporter_user_id uuid NOT NULL, calculator_key text, formula_version text, issue_kind text CHECK, redacted_description text CHECK length<=1000, idempotency_key uuid, request_hash bytea, status text CHECK, version integer DEFAULT 1, created_at, updated_at, UNIQUE(reporter_user_id,idempotency_key))`; 관리자 `(status,created_at,id)`, 회원 `(reporter_user_id,created_at DESC,id DESC)` 인덱스. `calculator_correction_notices(id uuid PK, calculator_key,formula_version,jurisdiction,tax_year,source_url,verified_at,effective_at,approved_by,published_by,status,revision,published_at, UNIQUE(calculator_key,formula_version,revision))`; 공개 함수는 승인된 비민감 필드만. `calculator_issue_events(id uuid PK,report_id FK,actor_id,event_type,prior_version,next_version,created_at)` 추가전용. 원본 금융거래·개인정보 첨부는 저장하지 않는다. SECURITY DEFINER 소유권·행 단위 검증; 앱 직접 DML 부여 금지.
- **트랜잭션·보안:** 요청 행 잠금→기대 버전 검사→불변 감사 이벤트→실제 변경 시 Outbox 알림 예약을 단일 트랜잭션으로 처리. 기존 알림 `dedupe_key` 고유 제약 활용, Outbox 자체 논리 이벤트 고유키는 스키마 확인 전 가정 금지. 사용자/IP 속도제한, 봇 방어, XSS/SSRF 허용 목록, 민감정보 로깅 금지, 보존/삭제 정책, 오류 세부정보 비노출. OWASP https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html .
- **SEO·모바일·a11y:** 공개 정정 목록만 canonical·색인 허용; 회원/관리자 신고 화면은 `noindex, no-store`, 사이트맵 제외. 320px 모바일, 키보드/스크린리더 상태 알림, WCAG 2.2 AA, Android App API 동등 계약.
- **KPI·수용:** 건강한 Test에서 접수 영수증 성공률 목표 99% 이상, 멱등키당 신고 1건 이하, 타 회원 조회 0/100, 거짓 '해결' 표시 0, 관리자 검토 지연 p95 관측, 정정 공지 조회율·재신고율. TDD로 100회 재시도, 관리자 동시전환 100건, 10,001건 커서, 이중 승인, 공개 PII 0, 법령 버전 경고, 공지 철회, 모바일 E2E, canonical/noindex, 정확 SHA CI/Test, DB 롤백·WLD 원장 불변 검증.
- **외부 근거 게이트:** 국세청·법제처·OWASP 독립 발행기관 3곳 자료를 검토했으나 정식 승인·중복제거 근거 원장 신규 0건, 누적 미확인, 목표 10,000건, BLOCKED. 검토 자료를 달성 실적으로 계산하지 않는다. 법률 적용은 사람 검증 선행.
- **개발 연계:** 기획 브랜치 문서만 변경. 개발 A/B/C·QA는 독립 브랜치·TDD·exact-SHA Test·승격 게이트 사용. 최신 main 정본 우선, 이전 v1136/v1138 미병합 브랜치를 구현된 기능으로 간주하지 않는다.


## v2026.10.22.1111 — 블로그 승격 선행조건 UI 회귀와 방문자 잔액 신뢰성 개선
- 운영 대비 홈페이지 개편 뒤 CI가 발견한 6건 UI 회귀: 오래된 4칸/Bento 스타일 검사와 실제 고정 10,000 WLD 개인잔액·시세 데이터 대기 오류를 분리. 홈을 `WalletGlance` 실제 인증/잔액 상태로 변경, 자료 없음 명확화, 접근성 제목·정식 계산기 링크, 현행 3개 핵심 바로가기 테스트. `NODE_ENV=test` 전체 프론트 1356 통과, 운영 데이터/DB/AI 발행 변경 없음. v1109 지갑 읽기, v1108 블로그 안전 정책과 독립 기록.


## v2026.10.22.1109 — 블로그 CI 선행조건인 지갑 읽기 모델 회귀오류 개선
- 지갑 `USER_CASH`/`USER_BANK`의 원장 부호별 읽기 집계, 정확한 BigInt 문자열 표시, 합계 모순 거부를 별도 코드 브랜치에 구현. 블로그 #986 전체 CI를 막은 기존 4건 테스트가 통과. 로컬 백엔드 1283 통과/실DB 397개는 생략, 금융 테이블 데이터/권한/SQL 변경 및 운영 승격 없음. 독립 PR/CI와 정식 Test 인증 전에는 금융 안전성 완료로 보지 않음.


## v2026.10.22.1108 — 사용자 자동 비공개 금지 지시로 기존 v1107 미심사 자동 철회 정책 변경
- [최신 정책](AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.ko.md) / [영문](AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.md). 공개 글은 24시간/48시간/30일 검토 지연되어도 **자동 비공개·검색제외·삭제하지 않고 관리자 알림만**. 사람이 명시적으로 철회·정정하거나 별도 승인된 긴급 보안/법적 조치가 있을 때만 상태 변경. 국가별 KR/US/JP/CN 독립 원어 글, 검증 후 GREEN 즉시발행·AMBER 사전승인·RED 차단은 기획 유지. 이번 단계 실제 소스에 4개 국가 검증 후보 평가와 기한 초과 시 알림만 판정하는 순수 정책 로직 및 테스트 작성. 신규 발행DB·알림 발송·관리자 삭제/API·운영 적용은 아직 없음. 구형 403/503 및 v1106 운영 SEO 복구 불변, #983 추적.

## v2026.10.22.1107 — 국가별 독립 원어 AI 글 작성·즉시발행·사후 철회 기획 확정
- [한글 공식 상세](AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.ko.md) / [영문](AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.md), [개발 순서](../superpowers/plans/2026-10-22-blog-country-auto-publish-v1107.ko.md). 한국·미국·일본·중국에 대해 번역이 아닌 현지 검색어/독립 본문과 공식 출처를 사용한다. 사용자 지시에 따라 검증된 GREEN 저위험 교육글은 **필수 자동 검사 통과 즉시 공개**, 공개 24시간 안에 사후검토하며 미심사는 자동 비공개. 관리자는 즉시 철회·정정/검색제외 가능. AMBER 국가별 세법·연금·투자·현행금리 등은 사전 인간승인, RED 무근거·복제글은 절대 공개 금지. 기존 v975 인간 사전승인 전면 규칙의 **GREEN 한정 예외**만 상위 계획으로 채택하며 나머지 금융·DB·Test·무중단 조건과 구형 API 403/503은 유지한다. 현재 **PLANNING**만 반영했으며 코딩·실제 신규 발행·운영 변경 없음. [개발 이슈 #983](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/983).


## v2026.10.21.1068 — 사용자 위험 감수 승인에 따른 운영 승격, 금융 미인증
- [상세 검증](../releases/v2026.10.21.1068.ko.md). 사용자는 무결성 문제가 있더라도 운영 반영을 명령함. PR #976 main 병합 SHA `6d4e258a`, v1068 백엔드·프론트가 운영 공개 3333/3334 경로에 실제 배포되고 정확 SHA 검사/기본 페이지 PASS. DB 전체 백업, 전후 핵심 행 수 불변. **금융 앱 직접 DML 권한 3건 및 국채·Repo·환전·연금·국고 원장 멱등 계약 미해결로 금융 안전성 검사는 계속 BLOCKED**. 실제 회원 결제 E2E 미인증. 공식 공개 Test는 구버전이고 구 운영 백엔드는 임시 스케줄러 리더(새 스케줄러 중지). 운영 배포는 완료했으나 금융 정합성 인증은 아님.


## v2026.10.21.1067 — 블로그 편집 안전성 CI 오류 수정 후보
- 기존 main의 발행 경로가 공식 원본/편집 승인 증거 없이 관리자·스케줄러 자동 발행을 허용하는 회귀를 확인. 운영 승인 기록이 없는 신규 글 게시를 503으로 거부하고 관리자 UI는 읽기 전용으로 전환했다. 미니PC 블로그 회귀 11/11, 국채 12/12 통과. 본 후보는 **금융 원장 직접 변경/DB권한/공식 Test/운영 미해결** 상태이고 운영승격 완료로 표시하지 않는다. [릴리스](../releases/v2026.10.21.1067.ko.md).


## v2026.10.21.1062 — 운영 API 연결 복구, 국채 앱 승격 차단
- Nginx 운영 백엔드 연결을 기존 오류 3233에서 실제 3000으로 변경하고 설정 백업·검증 후 공개 버전 API 502→200 복구. 응답 값 `unknown`으로 릴리스 신원은 미인증. v1061 앱 코드는 **운영 미배포**: 블로그 안전성 CI 실패 4건, 앱 금융 직접 쓰기 권한 3건 및 공식 Test 모바일/로그인 금융 QA 미완료. [한국어 릴리스](../releases/v2026.10.21.1062.ko.md). 인프라 연결 복구와 앱 승격을 혼동하지 않음.


## v2026.10.21.1061 — 국채 청약 HTTP 500 원인 확인 및 모바일 UI 오류 개선 (배포 전 후보)
- 5년물 1좌 비용 100,000 WLD에 비해 API가 조회한 해당 결제용 현금 잔액이 51,351 WLD여서 청약이 거절되었으나, 기존 일반 Error가 500으로 표기되었음을 확인. 코드는 잔액 부족을 HTTP 409, 유효하지 않은 좌수를 HTTP 400으로 응답하고 좁은 화면의 청약 제목/3개 탭 겹침을 개선. 국채·오류 필터 테스트 23건, 빌드·타입 검사 통과. [릴리스](../releases/v2026.10.21.1061.ko.md). **Test/Production 배포 미검증**. 기존 잔액 직접 수정과 원장 기반 정산·멱등성 P0는 별도 필수 개선으로 유지.

## v2026.10.20.1022 — 공식 Test 실제 승격 완료, 운영 금융 무결성·권한 게이트 유지
- [영문 검증 정본](../releases/v2026.10.20.1022.md) / [한국어 상세](../releases/v2026.10.20.1022.ko.md). 사용자 운영승격 승인 대상 main SHA 44055156을 공식 Test 백엔드·프론트 3100/3101 및 DB 278/279까지 실제 무중단 반영. Test 전체 DB 백업·격리 복원, 세션 96건 보존, 검색 제외, 릴리스 신원 검증 PASS. 공개 HTTP 257/257 통과이나 실로그인/은행/국고/관리자 전체 5회 테스트 증거는 BLOCKED. 운영용 정확 SHA 후보만 준비, 실제 운영승격은 금융 잔액 19계정 +4,779,188 WLD 차이와 직접 쓰기 3개, migration266 체크섬 변경, 은행 이체 SQL 오류가 해결되지 않아 미실시. 원장/사용자 데이터/과거 AI 발행 차단 유지.


## v2026.10.20.1001 — AI 블로그 전체 재점검·멱등성/자료 검증 수정 (코드 후보, 운영 보류)
- [영문 점검 보고](../findings/MONEYVERSE_AI_BLOG_REAUDIT_v2026.10.20.1001.md) / [한국어](../findings/MONEYVERSE_AI_BLOG_REAUDIT_v2026.10.20.1001.ko.md) · [기록 EN](../worklog/2026-10-20-ai-blog-recheck-v1001.md) / [한국어](../worklog/2026-10-20-ai-blog-recheck-v1001.ko.md). 최신 main v976 기초기능에서 작업 재시도 예상버전 우회, 자료 만료 후 완료 영수증 재조회 실패, 비정상 자료시각/내부망 출처 허용 4건을 RED→GREEN 재현 및 새로운 SQL 279·TS 검증 강화로 수정. PostgreSQL 17, 백엔드 1271 통과/DB397 생략, 프론트 1321 통과, DB 15 통과/3 생략, 타입/빌드/린트 통과. 운영 공개글 6편(10/15), sitemap 28개, 구 AI 검색제외, JSON 0444. 생성 API 503 유지, 실제 출처 수집·인간승인·게시 아직 없고 금융/v530/정식 Test SHA/운영승격 차단 유지. 실운영/DB/금융 무변경.


## v2026.10.20.976 — AI 블로그 검증/편집 기초 소스 구현 후보 (운영 미반영)
- 승인된 v975 기획 중 최초 단계: 신규 SQL 278의 주제·출처·초안·검토·감사 DB, 앱 및 PUBLIC 쓰기/실행 금지. 금융 수치·본문 중복 후보 자동검사 코드 추가, 승인·공개·스케줄러는 **구현하지 않음**. [영문 기록](../worklog/2026-10-20-ai-blog-editorial-foundation-v976.md) / [한국어](../worklog/2026-10-20-ai-blog-editorial-foundation-v976.ko.md). 독립 PG17·로컬 검사 합격, 백엔드 DB 397개 생략 및 Test/금융/운영 안전 수용 미실행. 구 503 및 JSON 0444 유지.


## v2026.10.20.975 — 공인출처 검증형 AI 블로그 편집·발행 시스템 제안 (기획만)
- [영문 상세기획](AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.md) / [한국어](AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.ko.md); [개발 실행계획](../superpowers/plans/2026-10-20-ai-blog-editorial-publication-v975.md) / [한국어](../superpowers/plans/2026-10-20-ai-blog-editorial-publication-v975.ko.md). 과거 AI 글 171편 미검증/noindex, 공개교육 글 6편 마지막 10월 15일, 기존 자동발행 안전차단 유지. 자료수집·AI 초안·수치/중복/국가법역 확인·인간 리비전 승인·멱등 발행으로 분리. v931 계산기 연계는 미통합 병렬 초안, v969 PR #963은 main 병합이나 운영 적용 미확인. 코드·실DB·원본JSON·Test/운영 무변경; v530 UI/금융 게이트 유지.


## v2026.10.18.804 — 불변 원장 직접 DML 권한 회수 (후보 / 운영 보류)
- 운영 v717/최신 소스는 원장 직접 쓰기 코드가 없지만 실제 앱 DB 계정은 INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER 등 광범위한 원장 권한을 보유. 신규 migration 277로 원장 2테이블 권한 모두 회수 후 SELECT만 복원하며 기존 SECURITY DEFINER 정산 함수를 유지. 운영 schema/ACL만 격리 DB에 복원해 적용·재적용 및 권한 거부를 검증. 나머지 금융 3테이블과 기초잔액 미인증 19계좌 +4,779,188 WLD, v530 인증 UI/복원은 별도 차단 항목. [릴리스](../releases/v2026.10.18.804.ko.md).


## v2026.10.17.802 — 운영 승인 후 불변 Test 후보 준비 / 운영 차단 유지
- 운영 승격 승인 접수, 정확 main `7098f236` 소스 빌드 및 실제 Next·manifest SHA가 일치하는 불변 Test 산출물 준비(미가동), 릴리스 검사 56건 통과. 현재 공개 Test는 소스 `bca8d54a`와 실제 매니페스트·빌드 `50fb6395`가 불일치. 운영 v717의 누락된 재시작 환경파일 참조를 비밀 아닌 기존 프로세스와 일치하는 설정으로 무중단 복구. 금융 읽기 전용 검사 직접 DML 5개·미입증 19계좌 +4,779,188 WLD로 BLOCKED. v530 인증 전체 화면, 정확 SHA Test, 세션 및 실복원 승인 전 운영승격·금융 예외처리 불가. [릴리스](../releases/v2026.10.17.802.ko.md).


## v2026.10.17.801 — 암시장 경매 무원장 WLD 차단 (main 병합 / 운영 보류)
- 과거 입찰은 금액 보유 없이 접수되고 구 자동정산은 원장 전표 없이 회원·SINK 잔액을 직접 수정할 수 있었다. 회원 권한·멱등·정식 경제 원장 정산이 검증될 때까지 신규 입찰 503/DB 이전 차단, 구 정산 비실행, 기존 기록 조회만 유지. [릴리스](../releases/v2026.10.17.801.ko.md). 현재 기초잔액 19계좌 근거 미인증, 앱 금융 직접권한 5개, v530 전체 인증 UI는 BLOCKED. [PR #928](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/928) CI·Test 후보 이미지 빌드 통과, main `bd6cf172` 병합 완료. 실제 Test/운영 승격이나 암시장 정상화는 아님.


## v2026.10.17.796 — 마켓 감정서 무원장 수수료 수정 후보; 운영 보류
- 별도 브랜치에서 무효한 DO 파라미터·무원장 잔액 수정을 전용 SECURITY DEFINER 원장 분개·감정서 발급 단일 거래로 변경. 단위 테스트와 폐기 가능한 격리 Test DB 검증 통과, 정식 Test/운영·인증 UI 미승격. 운영 19계정 4,779,188 WLD 차이, 앱 직접 DML, v530 관리자 포함 5회 UI/MFA 관문 미완. [릴리스](../releases/v2026.10.17.796.ko.md).

## v2026.10.17.791 — 프론트 빌드 산출물 정확 SHA 검사 (main 병합, 운영 보류)
- 공개 Test SHA `4997cf2b`의 실제 Next BUILD_ID가 시간값인 `frontend_artifact_sha_mismatch` 확인. 호스트 릴리스 복사 전 이 불일치 차단 검사 구현. [릴리스](../releases/v2026.10.17.791.ko.md). PR #923 main `92cb1582` 소스 병합·CI 통과. 현재 Test 인증·v530 전체 UI·금융 대사 통과 아님. 정확히 재빌드한 Test 세대와 로그인 세션 검증 후 운영 검토.


## v2026.10.17.790 — 금융승격 증거 완전성 검사 (main 병합, 운영 보류)
- v737 읽기 전용 금융 검사가 필수 원장 건수 누락/오류, 앱 권한 결과 이상, WLD 금액 모순을 더 이상 READY로 처리하지 않도록 보강. [릴리스](../releases/v2026.10.17.790.ko.md). 운영 DB 재조회에서 핵심 테이블 직접 DML 5건·원장 투영 차이 19계정이 유지됨. PR #921 main `c619fc23` 병합·CI 성공. 금융 대사 승인·v530 전체 UI·Test/운영 승격 아님.


## v2026.10.16.742 — Discord 관리자 DM 운영 알림 (후보)
- 기존 DiscordAlertService 주요 운영 경보를 채널과 관리자 DM으로 동시 전달하고 자격증명·회원 원본 데이터·원시 로그는 차단한다. [운영 가이드](../operations/discord-administrator-direct-messages.ko.md). 테스트/빌드 통과, CI·정식 Test·운영 승격 및 금융/관리자 UI 게이트는 별도 확인 필요.

## v2026.10.16.739 — 테스트 SEO 자동 제출 차단
- 독립 v738 카나리 기동 중 기존 SEO 크론이 URL 39건을 외부 제출하는 로그를 확인해 즉시 중지·설치 유닛 제거, 공식 Test/운영 유지. 수정: 테스트에서 자동 제출 예약 금지, 운영에서도 명시 활성화 필요, 종료 타이머 해제. 테스트 4건 통과. PR #899 main 38597632 병합, 외부 IP 차단 Test 카나리에서 36초 뒤 자동 SEO 실행 0건 검증. v530 전체 UI·금융 P0로 운영 앱 승격 계속 차단. [릴리스](../releases/v2026.10.16.739.ko.md).


## v2026.10.16.737 — 금융 읽기 전용 승격 통제 (AUTHORITY_DRIFT / BLOCKED)
- 5개 핵심 테이블 앱 직접 DML 및 과거 초기 잔액 출처가 입증되지 않은 원장/잔액 차이를 단일 읽기 전용 스냅샷으로 차단하는 검사기. 운영 v717 실측 40잔액 행, 19계정 차이 +4,779,188 WLD(초기 잔액 미인증 또는 드리프트), 거래별 차변·대변 불일치 0. **근거 없는 원장 보정 금지**. v530/금융 P0 승인 아님. [한글 기록](../worklog/2026-10-16-financial-readiness-v737.ko.md).

## v2026.10.16.736 — 블로그 v735 최종 Test 검증·운영 승격 보류 (AUTHORITY_DRIFT)
- PR #895 main SHA 9618a249 CI 및 동일 소스 Test v735.2 승인, 운영 불변 후보 준비만 완료, 트래픽 교체는 미실시. 실제 운영 v717. [결과](../releases/v2026.10.16.735.ko.md).
- 운영 DB 잔액·원장 직접 DML, v530 전체 인증 UI 5회 미해결. 중지된 구버전 v600 외부 재시작 사실 확인, 공유 글 저장 파일 읽기전용 유지. 금융 및 운영 안전조건 면제하지 않음.

## v2026.10.16.735 — 블로그 구버전 발행 경로 차단·저장 실패 수정 (AUTHORITY_DRIFT)
- 구식 프론트엔드 발행 4개 중지, 운영 v717 유지. 블로그 직접 저장·저장 실패 처리를 차단/실패 전파로 수정. [기록](../worklog/2026-10-16-ai-blog-production-unblock-v735.ko.md).
- 운영 금융 DB 잔액/원장 직접 DML 및 v530 관리자 포함 전체 인증 UI 5회 미통과. 운영 앱 승격 완료 근거 아님.

## v2026.10.16.734 — 실제 systemd 릴리스 식별검사 개선 (배포 통제 도구)
- PR #886 검증기 독립 통합: 운영 불변 릴리스에 대응하는 현행 systemd 서비스와 환경 BUILD_ID를 검사. 운영 v717 및 Test v721.2 모두 `ok=true`, `failures=[]`, 회귀 29/29 통과. 이 결과가 새 앱 운영 배포나 재무 P0·전체 166개 페이지 5회 인증 UI 검증 완료를 뜻하지 않음. [릴리스](../releases/v2026.10.16.734.ko.md).


## v2026.10.16.722 — AI 블로그 편집 안전조치 Test 검증·운영 앱 승격 보류 (AUTHORITY_DRIFT)
- PR #891 병합 SHA `10d5dfdb`; 정식 Test v721.2 정확한 SHA 및 블로그 5회 브라우저 135/135 통과. [릴리스 결과](../releases/v2026.10.16.721.ko.md). 통합 제품 기획의 권한을 변경하는 기록이 아님.
- 운영 v717 발행 보류 이후 AI 게시물 한 건 증가, 정확한 작성 경로 미확정. 원본 백업·해시 유지·공유 파일 읽기 전용 긴급 조치만 적용. 운영 앱 v717 유지, 전 화면 인증 5회 및 금융 원장/DB 권한 P0는 **BLOCKED**.

## v2026.10.16.720 — v719 UI 수정 Test 합격·운영 보류 (AUTHORITY_DRIFT)
- PR #889 main `0908c8d0` 통합, Test `bf538d0e`와 Git 트리 `317d07e9` 동일. [릴리스 증거](../releases/v2026.10.16.719.ko.md) / [작업기록](../worklog/2026-10-16-ui-v719-test-production-hold-v720.ko.md).
- 2026-10-16 16:51 KST v719.2 공식 Test 승격, 정확한 백엔드·프론트 실행 버전/헬스/noindex/무권한 POST 403/로그인 재시작 연속성 확인. 합성 QA Test 세션 폐기 및 비밀 파일 삭제.
- v530의 전체 166개 화면·34 관리자 인증 다섯 차례 검사와 국고/경제원장 DB 권한 P0는 **미해결 BLOCKED**. 이 기록은 운영승격 승인 아님. Production v717 유지.


## v2026.10.16.717 — 국가별 SEO 블로그와 자동 발행 안전 차단
- #879 초안 격리 통합, 국가별 24편, 지역별 canonical/hreflang/사이트맵, 근거 미검증 자동 발행 503 차단. 금융/DB 변경 없음. [릴리스](../releases/v2026.10.16.717.ko.md). 최종 GitHub PR/main CI, 독립 Test 로그인 세션 재시작 연속성 및 운영 Nginx 무중단 5/5 공개 점검 통과(2026-10-16 14:30 KST). 소스 SHA 176ca04e, 기존 v712 롤백 보존. 기존 국고 원장·권한 금융 P0는 별도 미해결.


## v2026.10.16.715 — 문서 PR 통합·운영승격 보류
- #878(v711 전면 진단), #881(v713 개선 설계)을 새 HEAD CI 통과 후 병합하고 각 작업 브랜치 삭제. [릴리스/작업기록](../releases/v2026.10.16.715.ko.md). 문서만 변경됐으며 공개 테스트·운영은 v712 SHA 142e36b5 유지. 재무 P0, 인증 실동작, 동일 SHA 테스트, 세션 연속성, 롤백 조건 미충족으로 코드 운영승격 차단.


## v2026.10.16.701 — 서버 최적화·공개 보안 함수 권한 보호
- **운영 적용 완료:** 보안 함수 PUBLIC 실행권 11→0, 앱 명시적 실행권 11개 유지, 실제 API 검증. 잔액/원장 직접 쓰기 권한은 미해결. [현황](../releases/v2026.10.16.701.ko.md).
- 완료된 자체 빌드 캐시만 정리해 2.44GiB 회수, 롤백 릴리스/데이터 보존. SECURITY DEFINER의 PUBLIC 실행권 회수 가드와 복제 DB RED/GREEN·롤백 검증, 앱 명시적 실행권 유지. 잔액/원장 직접 쓰기 DML은 별도 필수 개선. [릴리스](../releases/v2026.10.16.701.ko.md).

## v2026.10.15.697 — 실제 운영 승격 및 잔여 금융 위험
- Nginx/systemd 영구 운영 블루그린 승격, 소스 태그 prod-v2026.10.15.697 및 main PR #874 파일 트리 동일. [릴리스](../releases/v2026.10.15.697.ko.md). 운영 DB 마이그레이션 없으며 앱 잔액 직접 권한과 실제 운영 회원 로그인 E2E는 미해결.

## v2026.10.15.696 — 실제 Test 승격 및 금융 릴리스 차단
- 공개 Test v695 정확한 SHA 확인 및 로그인 쿠키 프로세스 재시작 보존 검증. v653 금전 안전 수정을 v696 후보로 분리 통합했으나 운영 DB 권한·마이그레이션·원장 대사 미해결. [릴리스](../releases/v2026.10.15.696.ko.md).

## v2026.10.15.695 — 브랜치 통합 후보, 운영 차단
- #850/#852 및 v678 국고 API 빌드 오류 수정만 격리 반영. 금융/운영 무변경. [릴리스](../releases/v2026.10.15.695.ko.md); 정확한 Test SHA·금융·세션 게이트 미충족.

## v2026.10.15.695 — 브랜치 통합 및 운영 승격 필수 조건
- #850/#852와 v678의 국고 Next.js 라우트 빌드 오류만 격리 병합. 잔액 변경·마이그레이션 없음. [영문 릴리스](../releases/v2026.10.15.695.md) / [한국어](../releases/v2026.10.15.695.ko.md).
- 로컬 단위·타입 검사, Nest 및 Next 운영 빌드 통과. Test의 정확한 SHA/DB, 금융원장 권한, 인증 세션, 운영 출처 증명은 미충족. 타 에이전트 미커밋 워크트리 23개의 변경사항은 분리 보존.


## v2026.10.15.688 — F675-06 GSC 검색/색인 진실성 통합 상세기획 (문서)

- 시작/중간 `origin/main=44d0b46583a9a2836e0f2b41655b245cf6f1c262`, 독립 `docs/gsc-evidence-center-v2026.10.15.688`, 타 v687/국고 브랜치 불변. [작업기록](../worklog/2026-10-15-f67506-search-evidence-v688.ko.md).
- [F675-06 한국어 상세](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.ko.md) / [영문](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md) 채택: S688-01~10 코드 위험, v685 수정 유지, 실제 GSC PT 검색어/페이지/국가/기기와 색인본 URL Inspection, 크롤러·제출·크롤링·색인·검색클릭 분리, 운영자 한영 12개 상태·공식자료 16개·D0~D7.
- 실제 앱·Google 비공개 데이터/키·색인요청·DB/Test/운영 무변경. v397/v530 및 v523/542/543 동일 SHA 출시 게이트 불변.


## v2026.10.15.686 — F675-05 첫 활동·실제 완료 증명 (문서 전용)

- 시작·중간 원격 `origin/main=6946398986edba0ad84bc601e6d1076e442f6d05`; 독립 `docs/first-session-truth-v2026.10.15.686`; v687 등 동시 작업 불변. [국문 작업기록](../worklog/2026-10-15-f67505-first-session-v686.ko.md).
- [F675-05 한영 상세기획](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.ko.md) / [영문](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.md) 채택: O686-01~10 허위 로컬 WLD 입금/실패한 첫 주식매수 완료·고정 광고 위험, 서버확인된 최대 3개 행동·선택과 원장 분리, v76/v82 자발적 다음 방문 목적, 사용자 과제 9개·한영 메시지 12개·레퍼런스 12개·D0~D7.
- v397·v530 및 v523/542/543 경제, 실제 Test/롤백/운영승격 제한 불변. 코드/DB/지급/거래/Test/운영 변경 없는 기획만.


## v2026.10.15.685 — SEO 응답 사실성·관리자 접근 (코드 수정 후보, 미배포)

- 작업 전·중 GitHub `origin/main=69bc8c14df236f57898b1b44ddc596be5144c30a`. 독립 `fix/indexnow-auth-plan-parity-v2026.10.15.685` 사용, 국고 v683·기획 v684 작업과 충돌 회피. [한국어 진단](../findings/MONEYVERSE_PLAN_SOURCE_GAP_REVIEW_v2026.10.15.685.ko.md) / [영문](../findings/MONEYVERSE_PLAN_SOURCE_GAP_REVIEW_v2026.10.15.685.md) / [작업기록](../worklog/2026-10-15-seo-integrity-v685.md).
- v675 G675-05 P0의 실제 사용 흐름: IndexNow 허위 성공과 다른 사이트 URL 제출, 크롤링 감사·일일 리포트/Discord 허위 완료, 누락된 관리자·CSRF 보호를 독립 코드 후보로 시정. 테스트·빌드·운영 검증 여부는 작업기록에서 분리.
- **기획 권한 변경 아님**: v530, v523/542/543 경제 보존, 크롤링과 색인 실제 증거 분리, 동일 SHA Test·DB·인증 E2E·무중단 운영 승격 차단 유지. DB/잔액/스위치/운영 포인터 무변경.

## v2026.10.15.681 — F675-04 사용자를 위한 계산·학습 선택 동선 (문서)

- 시작/중간 `origin/main=8356146e157080704e157b3203e38599baec68ff`, 독립 `docs/calculator-learning-funnel-v2026.10.15.681`. [작업기록](../worklog/2026-10-15-f67504-calculator-learning-v681.ko.md)에서 최종 확인; 타 작업자 브랜치 변경 없음.
- [한국어·영어 F675-04 명세](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.ko.md) 채택: 기존 계산기/가이드 재사용, C681-01~09의 알림 등록·10k WLD 지급·영구 보관의 클라이언트 성공 오인, 하드코딩 시세/세법/수식/프리셋 SEO 위험; 사용자 가설 8개/문구 10개/외부 자료 14개/D0~D7.
- 비회원 완전 계산→근거·가정→학습/비민감 공유→가상시장 선택 경로. 보너스·수익 보장 유인 금지. v397/v530 UI·v523/542/543 경제/Test 차단 그대로. **문서만 갱신**.


## v2026.10.15.680 — F675-03 실제 WLD 이동 사유·영수증 (문서 전용)

- 시작·중간 원격 메인 `a37b733837cf82c3f45adb88242bd1b4f6df2cb9`, 독립 `docs/wld-activity-receipts-v2026.10.15.680`, 최종 기록은 [작업기록](../worklog/2026-10-15-f67503-wld-receipts-v680.ko.md). 국고·원장 등 다른 작업자 워크트리 변경 없음.
- [F675-03 한글 상세 계획](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md) / [영문](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md) 채택: W680-01~08 소스 현황, 8개 사용자 검증 가설, 은행내부이동 순변화 0과 포켓별 변화, 본인 한정 조회/불변정정/큰 정수/정확한 과거·CSV 범위, D0~D7, 외부 13개 출처.
- 경제 코어 v523/542/543와 전체 UI v530 및 동일 SHA Test 차단 유지. **실제 코드·DB·잔액·사용자·Test·운영 변경 없음.**


## v2026.10.15.679 — F675-02 AI 가상뉴스 신뢰·복구 기능 상세기획 (문서 전용)

- 시작·중간 메인 `origin/main=b70cedbce34ad43bffe593ffbd1ac8374edb5ffa`; 최종 SHA는 [v679 기록](../worklog/2026-10-15-f67502-ai-news-user-trust-v679.ko.md). 동시 기획자 v678 사용 중이라 v679 독립 브랜치·워크트리 사용. 다른 작업자 코드·운영 포인터 변경 없음.
- [F675-02 국영문 상세명세](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md) 채택: N679-01~08 검증 수준, 이용자 7유형, 실제 시각 5종, 생성/검수/공개/주가 영향 분리, 지난기사/AI·허구고지/수정·철회, `pulse` 허위 실측 해소, 단일 신뢰 내부모델 SSRF 예외 경계, D0~D7 및 1차 자료 13개.
- 기존 v261/v325 영향 한계와 v530 UI, v523/542/543 원장 원칙 변경 없음. v660은 **과거 감사 증거**, v661은 **미수용 후보**, 신규 운영/모델·주가 경로 검증은 안 됨. 코드·DB·Test·운영 변경 없음.


## v2026.10.15.677 — F675-01 기능 실재성·사용자 신뢰 상세 기획 (문서 전용)

- 시작·작업 중 메인 `origin/main=a24a8ae9e0d14dbd63738f5bb7e4e857ca412c13`; 최종 SHA는 [작업 기록](../worklog/2026-10-15-feature-truth-ux-v677.ko.md). 분리된 v677 워크트리 사용, 동시 국고 v675/v676 작업과 충돌 회피.
- 정식 상세기획으로 [F675-01 이용자 신뢰 명세](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md) / [영문](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md) 채택. 네 가지 상태축, 여섯 사용자 유형/가설, 문구 시안, API 후보, 실측 계측, 기존 /api-health 확대, 결과불명 거래의 안전 확인, 7단계 개발 순서, 공식·실무 출처 13개.
- 현재 Git 소스의 정적 낙관적 헬스값·갱신실패 상태·기본 액션 3상태 문제를 구분. **실운영 피해 확정 아님**. v530 UI 및 DB/원장/동일 SHA Test 차단 유지. 코드·DB·스위치·Test·운영 변경 없음.


## v2026.10.15.675 — 전체 기획·신규 기능·레퍼런스 재검토 (문서 전용)

- 시작 및 작업 중 원격 메인 SHA: `f2bf939e53482721ee8bbf1074bd7ebf1922b13e`; 최종 메인 재확인과 차이는 [v675 작업기록](../worklog/2026-10-15-integrated-planning-review-v675.ko.md)에 기록. 독립 브랜치로 다른 작업자 파일 덮어쓰기 없음.
- [전체 제품·기능 재검토](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md) 영문·한국어 문서를 새로 작성: 인증, UI/관리자, WLD, 직업, 주식, 은행·국고, 사업·상점, 커뮤니티, AI 뉴스, 교육 도구, SEO·언어, 광고, 보안·인프라, Android 등 14개 영역과 공식 레퍼런스 13개 대조.
- G675-01~06 P0는 원장/DB 권한·보존법칙, 동일 SHA Test/인증 UI, AI 뉴스 장애·신선도, 화면→API 연결, SEO 사실성, 합법적 광고를 필수 검증으로 유지. F675-01~09는 **PLANNING 후보**로 구현 증거가 아니다.
- **AUTHORITY_DRIFT 유지:** 최신 코드·운영 기록이 v530 UI 차단이나 v523/542/543 경제 원칙을 자동 대체하지 않는다. 이번 채택은 우선순위/검증 계약이며 서비스 전체에 대한 운영승인으로 간주하지 않는다.
- 코드/DB/Test/Production 수정, 유입·색인·매출 증가 사실 확인 없음. [GitHub 업데이트](../updates/v2026.10.15.675-github.ko.md) 참조.


## v2026.10.14.625 — WLD 초대형 금액 오버플로 차단 (구현 후보)

- 지갑 알림·참고 외화 표시·P2P/기부·소각·연금 납입/환급/지급에서 금액 문자열과 BigInt로 정밀도 손실을 차단. 보유 한도 추가 없음. [영문 정본](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.md) / [국문 보고서](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.ko.md).
- **P0 WLD-625-01:** 연금·계좌·국고 직접 UPDATE와 부족액 0 보정은 원장 보존 구조 수정 및 독립 DB 수용 시험 필요. 주식 리그·경매·bigint/Number 경로는 P1 잔여 과제.
- 격리 브랜치 후보에 한정. 프론트 전체 회귀 및 DB/보안 수용 게이트 미충족. v530 기획 권위 유지, Test/운영 배포 미인증.

## PostgreSQL Outbox 보존·성능 최적화 — v2026.10.14.622 (격리 구현 후보)

- 기존 v486 데이터베이스 명세에 근거한 구현 후보이며 v530 통합 기획 권위를 대체하지 않는다. 개발 DB PostgreSQL 17.11, 957MB, Outbox 213MB, dead tuples 추정 약 46,941행 및 만료 조회 36.158ms/25,883버퍼를 확인했다.
- 순차 마이그레이션 270은 배송 시각 부분 인덱스를 동시 생성하고 해당 테이블의 autovacuum을 5% 기준으로 튜닝한다. 백엔드는 2,000행씩 최대 25배치로 정리하며 미배송과 기존 7일 정책을 보호한다.
- 분리된 합성 PostgreSQL Test에서 SQL·인덱스 검증, 백엔드 빌드·타입 검사 및 1,165개 테스트 통과. DB 관련 391개 건너뜀. **실제 Test 또는 운영 승격 승인 증거가 아니다.**
- 근거: [한국어 상세 보고서](../findings/MONEYVERSE_DB_OPTIMIZATION_v2026.10.14.622.ko.md), [영문 정본](../findings/MONEYVERSE_DB_OPTIMIZATION_v2026.10.14.622.md), [작업 기록](../worklog/2026-10-14-database-backend-optimization-v622.md).

## v2026.10.14.618 — 통합 브랜치 후보 (기획 승인 또는 운영 완료 아님)

- 작업 전/중간 `origin/main=c56af867ad8f7556e53f895b0bb294c4bfc8a02d` 재조회. 격리 v618에 기존 프론트 수정과 최신 SEO 도구·기획·라이브 점검·전체 기능 감사 브랜치를 보존하며 병합. 동시 작업 워크트리 무변경.
- PR #824의 모바일 API 계약/한영 참조 불일치 수정. 같은 SHA CI/Test, DB 및 세션 지속성 검증 전 운영 승격 수용 불가. [작업 기록](../worklog/2026-10-14-fullstack-branch-integration-v618.ko.md).

## v2026.10.14.605 — 전체 기능 수용검증 근거 (기획 승계·배포 아님)

- 최신 코드 c56af867: 타입/전체 빌드 통과, DB 제외 백엔드 1,162 통과·29 스킵, 프론트 수정환경 1,134 통과·35 실패, DB 정적 7·봇 4·QA 12 통과, lint 1,057 경고. 모바일 API 계약 3개 drift/Android SDK 차단. 익명 운영 GET 63곳(최초 61개 200·404 1개·일시 연결종료 1개), 개발 DB 831건 거래 0 불균형/237·269 마이그레이션 번호 누락. [한국어 상세 결과](../findings/MONEYVERSE_FULL_FUNCTION_ACCEPTANCE_AUDIT_v2026.10.14.605.ko.md).
- **전체 기능 수용 BLOCKED**: 인증 E2E, 동일 SHA Test, 운영 무중단 승격 근거 없음. 기존 보안·경제 결함은 열린 상태. 본 항목은 관찰 기록일 뿐 기획 권위 변경이 아니다.


## 전체 코드·보안 위험 재감사 — v2026.10.14.603 (근거 기록 / 문서 전용)

- SEC-603-01~14: 조건부 인증 고정 기본값(P0 후보), 관리자 백업 권한 검사 공백, 주민투표 반복, IndexNow 미인증, JSON 파일 동시성, 국고 지급 허위 성공, 관리자 SEO 가짜 수치, Android 테스트 계정 노출 등. [한국어 상세 보고서](../findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.ko.md) 및 [영문 정본](../findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md).
- 작업 중 main SHA가 062db65b에서 6be44719로 변경돼 격리 브랜치만 최신화했다. 기존 기획 권위 v530은 그대로이며 이 결과만으로 실제 악용, 기능 수용, Test/운영 성공을 주장하지 않는다. 책임자별 차단·음성 테스트·정확한 SHA의 격리 Test·무중단 승격 게이트를 적용한다.


## 운영 상태·기획 권위 불일치 조정 — v2026.10.14.600 (문서 전용)

> 상태: AUTHORITY_DRIFT. 새 의사결정과 검증 증거로 명시적으로 승계하기 전까지 통합기획 권위 버전은 v2026.10.05.530이다. 기능/Test/Production 검증 완료를 의미하지 않는다.

- **2026-10-14 09:26 KST Debian 13 $pc 읽기 전용 관찰:** `production-current` → `prod-v599`; `test-current` → `test-v541-gsc-aa4b6387`. 프런트·백엔드·nginx active 및 개발 DB 접속이 보고됐다. 정확한 SHA의 Test 승인, 사용자 기능 또는 운영 DB의 무결성이 입증된 것은 아니다.
- **권위 분리:** 운영 배포 표기 v599와 통합기획 버전 v530은 서로 다른 값이다. v583/v590을 최신으로 지칭하는 기존 문서는 과거 스냅샷이다.
- **카지노:** 실제 기능 스위치 `enabled`(2026-09-11 점검 후 재개 사유)와 기존 개발 총서의 '카지노 API 제거' 주장이 충돌한다. 현재 정책/라우트/API/법률·안전 수용증거가 일치하기 전까지 **정상 제공 또는 제거 완료를 단정하지 않는다.** 문서만 근거로 스위치를 변경하지 않는다.
- **국고:** v522의 30% 안전 비축 기준과 이후 85% 현금 유동성 정상화 서술은 대상 자산, 분모, 우선순위, DB 증거로 재조정해야 한다. 어느 수치도 임의 통화 발행이나 정책 변경을 허용하지 않는다.
- **API:** 기본 API 카탈로그에는 15개 도메인 제목이 있으며, 오래된 총서에는 14개로 적혀 있다. **문서 목록상 15개**로 통일하되 실제 15개 도메인 정상 구현을 의미하지 않는다. v477 카탈로그와 후속 addendum을 생성 계약과 대조해야 한다.
- **남은 게이트:** `/admin/seo` 모바일 넘침, `/app-api/v1/account/identities` 기존 HTTP 500, 관리자 전 화면 E2E, 정확한 Test SHA와 백엔드 검증, 무중단 승격 증거.
- **병행 작업 보호:** 이번 변경은 문서 전용이며 런타임·마이그레이션·스위치·테스트·운영 배포를 변경하지 않는다. 병합 전 최신 origin/main 재확인 필수.
- **근거:** [v600 작업 기록](../worklog/2026-10-14-authority-runtime-reconciliation-v600.md), [GitHub 업데이트](../updates/v2026.10.14.600-github.ko.md).


> 현재 원장 버전: v2026.10.05.530 (통합기획 권위 기준)
> 구현 권위 계약: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> 영문 원본: [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)

## 필수 회차 기록
모든 기획 재검토는 시작/중간 `origin/main` exact SHA, 권위 버전 드리프트, 검토한 세부명세와 release/work 기록, 심각도·근거·수용게이트가 있는 gap ID, 영/한 동기화, 구현/Test/Production 주장에 실제 증거가 있는지를 기록한다. 과거 결정은 삭제하지 않고 명시적으로 supersede한다.

## v2026.10.10.543 — 2026-10-10 — 긴급 경제 격리·불변 릴리스 출처 복구
- 시작 `origin/main=545e8231f8b90b543ed9de0722adf98d63587820`; 중간 재확인에서 `origin/main=9e17095586c46e43ec1a68214658e512e457148a`로 1커밋 전진한 것을 감지했다. 겹치는 SWF/릴리스/권위문서 변경은 없었지만 최신 main 기준으로 브랜치를 다시 구성한 뒤 계속했다.
- v523의 통화량/국고 자금보존 불변식과 최신 SWF 구현을 다시 대조해 기존 부팅 30초 후/시간주기 자율변동, 원천 없는 국고 유입, 합성 성장/수익실현, 직접 잔액 정산을 `AUTHORITY_DRIFT`로 확정했다.
- SWF 실행은 `MONEYVERSE_SWF_EXECUTION_ENABLED=true`, 스케줄러는 별도 `MONEYVERSE_SWF_SCHEDULER_ENABLED=true`일 때만 허용하도록 fail-closed 했다. 프로세스 시작 자체의 경제변동은 제거했고 명시 활성화된 실행도 advisory lock + 최소 실행간격을 요구한다.
- `ops/release/stage-host-release.sh`를 추가해 clean exact-SHA worktree, 빌드 산출물, 새 SHA-qualified 목적지, Git metadata 제거, `.moneyverse-release.json`을 강제하고 기존 release path 덮어쓰기를 거부한다.
- v543은 격리 회차다. 위험한 SWF 수식, FX 비정규 계좌 SQL, migration 253 broad grant, 연금/국채/Repo/FX 자금보존과 direct-table 정산은 v544 forward migration/Economy Core 복구 대상으로 남긴다.
- v530 전체 UI BLOCKED 게이트는 독립적으로 계속 유효하다. GitHub CI와 exact-SHA isolated Test가 모두 통과하기 전 Production 완료를 주장하지 않는다.
- 상세: `deltas/v2026.10.10.543.ko.md`, 작업기록: `../worklog/2026-10-10-v543-emergency-containment.ko.md`.

## v2026.10.10.542 — 2026-10-10 — 관리자 경제 진실성·국고 수학·권위 재정합

- 시작 `main=545e8231f8b90b543ed9de0722adf98d63587820`, 최초 중간 확인 동일; 격리 브랜치 `fix/planning-economy-truth-v2026.10.10.542`. Debian 원격 도구 월간 한도 및 머니버스 MCP 인증 차단으로 서버 검증 불가.
- 문서정책·카탈로그·PROJECT_PLAN·v523 경제기관 구분·v522 국고·v530 UI·v537 수정·v541 GSC·국채/복권/경제 명세·Android 운영 정책 및 최근 소스를 재검토했다.
- `ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md` / `.ko.md`를 현행 구현기획에 채택하고 E542-01~13 결함, 근거·수용 조건을 등록했다.
- 관리자 카드 브라우저 난수 추첨·가짜 소각·가짜 금리 적용 성공을 제거했다. 실제 버튼 차단 및 예시 금리 계산만 허용, 회귀 테스트 추가. **브랜치 구현만 확인**.
- 25M 무조건 유지, 잘못된 시간당 APR, 예산 배분 중복 해석을 상위 v523 불변식에 맞게 재정의한다. 복권, 실제 금리변경, 무조건 원리금 보장 등은 재원/원장/연령·관할/QA 근거 전 차단.
- v511 완료 선언 및 v530 이후 소스 변경만으로 최신 운영을 수용하지 않는다. 전체 UI 5회, 백엔드·DB·세션·보안·CI·Test·운영 승격은 **미검증**. 운영 재화/DB 미변경.

### v2026.10.10.542 보충: E542-13 격리 CI 마이그레이션 호환

- GitHub CI `38044593310`의 정책·lint·타입·빌드 통과 후 266번 마이그레이션이 `woldeok_moneyverse_dev` 고정 이름과 일회용 CI DB `woldeok_moneyverse_ci` 충돌로 실패했다.
- 불변 SQL/체크섬은 그대로 유지하고 CI 전용 DB 서비스 이름 및 테스트 연결 문자열만 수정. 운영 DB 영향 없음. 최신 SHA CI는 재검증 대기; 임의 DB 이름 이식성은 별도 차단.
- v542 결함 추적 E542-13까지 확장. 초안 PR #801 검토 중이며 운영 승격 없음.

## v2026.10.05.530 — 2026-10-05 — 긴급 전체 UI 재점검
- 최초 확인은 `origin/main=ca354411d88b461215a81557f686765cfedf00f0`; 브랜치 생성 전 필수 fetch에서 `921b467eac21645a51ba362b24cac7eaab89c081` 드리프트를 감지해 최신 SHA에서 v530 격리 브랜치를 만들었다. 중간 refetch도 `921b467e...`로 동일했다.
- 문서 거버넌스와 현행 plan/master/responsive/accessibility/update/runtime 권위를 다시 읽었고, 동시작업 dirty main 파일을 건드리지 않은 채 추적 Markdown 1,747개를 SHA-256 스캔으로 열거/읽었다.
- 최신 main UI 인벤토리는 웹 page 템플릿 142개, 관리자 25개다. 현재 Production/Test runtime identity가 최신 main과 달라 live 관측은 latest-main 수용 증거가 아니다.
- `EMERGENCY_FULL_UI_REAUDIT_SPEC.md` / `.ko.md`를 채택하고 현재 상태를 **BLOCKED — 긴급 UI 수정 필요**로 지정했다.
- P0: 제공 모바일 증거와 현재 비줄바꿈 소스 레이아웃이 `/admin/seo` 모바일 액션 행 잘림을 함께 입증한다. P1 gate는 touch-target triage, floating layer 본문 가림, account identities HTTP 500, heading/semantic 후속 점검이다.
- 전체 route 5회 완주, 인증 관리자 전수 포함, exact-SHA Test/backend health, 무중단 Production 승격 순서를 재확인했다.
- 점검/기획/문서 전용이며 런타임 수정, Test 수용, Production 승격을 주장하지 않는다.

## v2026.10.05.527 — 2026-10-05 — SEO 수요·키워드 포트폴리오 확장
- 시작/중간 `origin/main=5318213f1eca644c7f36df7d967a53092de0814c`; 기록된 중간 체크포인트에서 drift 없음. 전용 worktree/branch `docs/seo-demand-expansion-v2026.10.05.527`.
- 문서 거버넌스, PROJECT_PLAN, 통합마스터, 글로벌 SEO/성장 실행, search discovery, SEO intent activation, 현행 pSEO config/route, 아직 미병합 v525 search-to-user 기획을 읽기 전용 동시작업 입력으로 재검토했다.
- `SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md` / `.ko.md` 추가: evidence state, keyword record, 국내/해외 cluster map, pSEO admission/retirement, 금융 freshness, locale, 내부링크 graph, 검색→사용자 전환, 측정계약.
- 25개 cluster에서 keyword discovery 후보 10,473개(한국어 6,207 + 영어 4,266)를 생성했다. 모두 실측/provider evidence와 독립 page-value gate 통과 전 HOLD이며 후보수는 발행목표가 아니다.
- 신규 독립 Crossref 조사: 40 lane, raw 200,000 -> 중복제거 111,313, 수집오류 0, stream SHA-256 `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`. full compressed corpus, manifest, sample을 `docs/research/seo-demand-v2026.10.05.527/`에 버전 보존한다.
- 최신 Google/Naver/Bing 1차 검색가이드, Core Web Vitals, IndexNow/Schema.org 의미, 공식 금융도구 패턴을 별도 재검증했다. broad corpus 수량은 현재 1차자료 규칙을 대체하지 않는다.
- 기획/조사/문서 전용. runtime, Test, Production, 색인, 순위, traffic, revenue 완료를 주장하지 않는다.

## v2026.10.04.523 — 2026-10-04 — 중앙은행·조폐국·중앙국고 기관 분리
- 시작 `origin/main=c10e1582ccc0c058dff5c5356ad8b1893759f72c`; 중간 재확인에서 국고 영문/아키텍처 문서가 추가된 `origin/main=065ee42204a4238c5010897212c7fc2a6c848f64` 드리프트를 감지했다. 권위문서 편집 전 격리 브랜치를 최신 main으로 rebase해 동시 작업을 보존했다.
- 문서 거버넌스, 카탈로그, PROJECT_PLAN, 통합마스터, 국고 환원/재정 명세, AI Economy Controller, 통화유통속도 명세를 다시 읽고 통합했다.
- `CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md` / `.ko.md`를 추가하고 PROJECT_PLAN의 현재 경제기관 권위로 채택했다.
- 분리계약: 중앙은행은 통화정책 승인, 조폐국은 승인된 발행·폐기 실행, 중앙국고는 기존 WLD의 세입·예산·지출, Economy Core/Settlement Ledger는 복식정산·idempotency·대사·통화량 불변식을 담당한다.
- 일반 송금·세금·국고지출·사전재원 대출·국채 흐름은 총통화량을 바꾸지 않으며 canonical 조폐/폐기만 `M_total`을 변경한다.
- 기존 국고 보호준비금은 재정 유동성 준비금으로 명확히 재정의하며 신규통화 발행권한이 아니다. 재정 부족을 자동조폐로 전환하지 않는다.
- 초기 은행대출은 기존 WLD 완전 사전재원 방식으로 유지하고 현실 상업은행식 예금화폐 창출은 별도 승인 통화계층 설계 전까지 제외한다.
- AI는 진단·제안·허용된 저위험 bounded-auto에 한정하며 직접 조폐/폐기, 통화명령 승인, 국고부족의 통화화는 금지한다.
- 1차/공식 근거는 IMF 국고-중앙은행/TSA, ECB 발행·생산, Federal Reserve/BEP·US Mint 역할분리, 한국은행, Bank of England 통화창출 자료, EVE 공식 경제보고를 포함한다.
- 기획/문서 전용이다. 런타임·DB·Test·Production 구현/승격을 주장하지 않는다.

## v2026.10.04.522 — 2026-10-04 — 국고 세수 자동 사회 환원 파이프라인 & 4개 국어 번역 무결점 전면 통합
- 시작/최종 `origin/main=065ee422` (운영 배포본 `prod-v521` 무중단 승격 가동).
- **국고 세수 자동 사회 환원 파이프라인 권위 통합 (`TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.ko.md` / `.en.md`)**:
  - 국고 5대 금고(`VAULT_MAIN`, `VAULT_WELFARE`, `VAULT_EMERGENCY`, `VAULT_INFRA`, `VAULT_RESERVE`) 원장 체계 공식화.
  - 4대 사회 기능 자동 환원: 보편 기본소득 배당(`CITIZEN_DIVIDEND`, 40%), 정착/취약 복지 지원(`WELFARE_SUBSIDY`, 40%), 공공 인프라 펀딩(`COMMUNITY_FUNDING`, 30%), 룬스케이프형 역매수 영구소각(`MARKET_BUYBACK_BURN`, 10%), 거래정지 피해 전액 환급(`STOCK_HALT_SETTLEMENT`, 20%).
  - 10대 법정 세제율 원천징수 엔진: 장터 2%, 주식 1%, 사업 3%, B2B/소비 1~3%, 4구간 누진 부유세(0.05~0.5%).
  - 30% 불가침 안전 비축금 준칙(`Safe Reserve Invariant`: $\max(100{,}000\text{ WLD}, \text{Gross Assets} \times 30\%)$) 및 0 오차 회계 대사 검증.
  - `/admin/treasury` 긴급 제어 타워 Step-Up 2FA 모달 리팩터링 및 반응형 헤더 찌그러짐 원천 차단.
- **전 화면 4개 국어(KO, EN, JA, ZH) 번역 무결점 전수 쇄신**:
  - `i18n-dictionary.ts` 홈 마스터 사전 47종 신규 확장 및 역방향 인덱스 자동 연동.
  - 상단 공지 바(`notice-bar.tsx`), 메인 히어로, 4대 퀵 액션, 온보딩 2열 벤토 배너, 3단계 미니 칩, 6대 기능 뱃지, 3대 계산기 허브, 일일 리텐션 스테이션, 핫 종목 및 직업 마스터리 전 구역 4개 국어 100% 완벽 매핑.
- **초반 무자본 10만 WLD 시드머니 3분 공략 로드맵 & 60fps 비디오 시뮬레이터 (`/roadmap`)**:
  - 12개 실전 UI 씬 인터랙티브 모션 시뮬레이터 및 3단계 성장 로드맵 통합.
- **8대 전문 직업 2.0 & 실전 급여 파밍 가이드 (`/guide/career-mastery`)**:
  - 4단계 실습 시뮬레이터, 8대 직업 도감, 7대 승진 티어 및 라이선스 시스템 통합.
- **우측 하단 플로팅 위젯 글래스모피즘 분리**:
  - 고객센터 위젯과 온보딩 퀘스트 플로팅 위젯의 수직 분리 및 고대비 닫기 버튼 탑재.
- **검증 및 릴리스 상태**:
  - Vitest 1,048개 전수 테스트 100% ALL-PASS.
  - Next.js 16.3.8 Turbopack 163개 라우트 빌드 통과.
  - 원격 운영 호스트(`https://easy-scraping.com` / `prod-v521`) 무중단 배포 및 HTTP/2 200 OK 라이브 서비스 검증 완료.

## v2026.10.03.510 — 2026-10-03 — 글로벌 성장 실행설계·레퍼런스 심화
- 시작/중간 `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`; 격리 문서 브랜치 `docs/global-growth-deep-plan-v2026.10.03.510`.
- v509 기획이 런타임에 이미 구현됐다고 가정하지 않고 exact-main의 locale/proxy/layout/GSC/sitemap/pSEO 코드를 다시 대조해 구체 P0/P1 구현 공백을 등록했다.
- `GLOBAL_GROWTH_EXECUTION_SPEC.md` / `.ko.md`를 추가해 locale context, 번역상태, 서버 SEO read model, pSEO 입장/퇴출, 해외기능 epic, 시장 readiness, 광고/동의, analytics, 관리자, 릴리스 QA를 구현준비형으로 세분화했다.
- 신규 Crossref 회차: 30개 질의군, raw 210,000건 -> v510 내부 중복제거 121,320건, 수집오류 0건, SHA-256 `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`. v507은 별도 corpus이며 검증되지 않은 교차 unique 합계는 주장하지 않는다.
- corpus와 별도로 국제 URL/hreflang, people-first/scaled-content 정책, canonical/sitemap/lastmod, 폐기된 Google sitemap ping, JS rendering, CWV, BCP 47/CLDR, WCAG 2.2, IndexNow, 동의/광고, 미성년/개인정보 공식자료를 재확인했다.
- 기획/문서 전용이며 런타임, DB, Test, Production 변경/승격을 주장하지 않는다.

## v2026.10.03.509 — 2026-10-03 — 최신 main 기준 글로벌 성장 권위 통합
- 사용자의 진행 승인으로 v507 written design을 검토대기 격리 기획 상태에서 현재 기획 권위 체계로 승격했다.
- 통합 브랜치: `docs/global-growth-seo-integration-v2026.10.03.509`; 시작/중간 `origin/main=ddec006e75ffcaf866c3c6d0a82edc2b96372917`.
- v507 이후 v508 main 변경과 v507 기획 변경 경로가 겹치지 않아 clean 적용됐으며 v508 보안/런타임 증거는 그대로 보존된다.
- PROJECT_PLAN은 한국어 기본 locale, 보조형 GeoIP, 해외 제품가치, 다국어 SEO/검색수요 provenance, 품질게이트 pSEO, 광고 전용 해외 경제성을 현재 기획 권위로 채택한다.
- v507 상세명세/조사기록은 출처 추적을 위해 기존 버전을 유지하고 v509가 권위 채택 사실을 기록한다.
- 문서 전용 통합이다. 런타임 코드, DB, Test, Production은 변경/승격하지 않았다. 구현은 별도 브랜치와 exact-SHA Test/백엔드 health 증거를 요구한다.

## v2026.10.02.507 — 2026-10-02 — 한국어 기본 글로벌 성장·해외 SEO·광고수익 설계
- origin/main 5a7c658b38853f564983d19f961c689a494dc4b6에서 격리 브랜치 docs/global-growth-seo-v2026.10.02.507로 진행한 문서/기획 전용 회차다.
- 영어를 제품 default로 보던 과거 문구를 supersede한다. 제품/공개 fallback은 한국어이며 공개 색인 페이지의 GeoIP는 해외 언어 추천/selector 신호로 사용한다. 비색인 앱 온보딩만 자동 첫 기본값으로 사용할 수 있고 명시 locale URL과 사용자 선택이 우선한다.
- 해외 utility/지식/온보딩/번역/시간대·이벤트/탐색/리텐션 기능을 SEO 페이지 확대보다 먼저 정의한다.
- 실제 사이트 검색성과와 시장 검색량 추정을 분리하고 생성/fallback GSC 숫자를 운영 의사결정에 금지한다.
- 고정 pSEO 페이지수 목표 대신 독립 intent/가치/출처 freshness/canonical/hreflang/internal link/중복검사/deindex 경로 게이트를 적용한다.
- 일반검색·Image·video·Discover, 국가/locale KPI, 광고 전용 시장 기여이익 모델을 추가한다.
- Crossref broad discovery corpus: raw 150,000 -> DOI/title 중복제거 121,810건, manifest SHA-256 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729. 조사 후보 폭이지 수동검토 주장이 아니다.
- 상세 권위: GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md. 런타임/Test/Production 완료를 주장하지 않는다.

## v2026.09.29.486 — 2026-09-29 — 엄격 14.5만 DB 레퍼런스 코퍼스 및 PostgreSQL 17 재검증
- 조사/기획/문서 전용 주기. 시작/중간/최종 `origin/main=64201629c5cdf931d49e48e8808fc0f882318b3b`; 격리 브랜치 `docs/db-reference-expansion-v2026.09.29.486`.
- Crossref 엄격 제목 탐색: **원시 145,898 -> 제목 적합 145,579 -> 고유 145,579건**; DOI 우선/제목 보조 중복 제거; 코퍼스 SHA-256 `d61e825f8f699ccfca9e1bc5ee13dd070d123440c680a8aa9d90c5a4d6a80216`. 유지된 모든 제목은 단어 `database` 또는 `data base`를 포함.
- 초기 v486 광역 탐색은 표본에서 일반 단어 오탐을 확인해 폐기했고 엄격 코퍼스를 v486 정식 탐색 증거로 채택.
- **DB486-01 / P0:** concurrent index/reindex 후 예상하지 않은 invalid index가 있으면 DB 승인 차단.
- **DB486-02 / P0:** nullable 비즈니스 키 고유성은 NULL distinct 의미를 명시.
- **DB486-03 / P1:** extended statistics는 측정된 상관 컬럼 추정 오류와 전/후 계획 증거가 있어야 함.
- **DB486-04 / P0(활성화 시):** 복제/CDC 슬롯에 소유자, 소비자, 지연/보존 WAL 관측, 용량 예산, 보존 상한 정책 필요.
- **DB486-05 / P0:** 물리/base backup은 `pg_verifybackup`과 실제 격리 복구를 모두 요구하며 검증만으로 충분하지 않음.
- **DB486-06 / P0:** 저영향 제약 검증은 단계화하고 락/스캔을 분류.
- **DB486-07 / P1:** RLS는 owner/BYPASSRLS/FORCE-RLS 테스트가 있는 조건부 추가 방어층이며 현재 제한 역할 기반 변경 경계를 대체하지 않음.
- 상세 권위/증거: `DATABASE_ARCHITECTURE_SPEC.md`, `planning/deltas/v2026.09.29.486.md`, `findings/MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.29.486.md`.
- 전역 `PROJECT_PLAN.md`은 기존 authority-drift 규칙에 따라 v444 유지. 무관한 post-v444 제품 결정을 통합했다고 주장하지 않으며 런타임/Test/Production/마이그레이션/사용자 데이터 변경 없음.

## v2026.09.27.468 — 2026-09-27 — 전 도메인 API 카탈로그 및 릴리스 로그 v459~v468 정합화
- 문서 전용 동기화 회차. 기준 `origin/main=ce06a79f6e453a9a7f1ee2979ec3bf3fe88ca5ae`.
- **DOC-468-01 / P1:** `docs/UPDATE_LOG.ko.md` 및 `docs/UPDATE_LOG.md`에 `v459` ~ `v468` 누적 릴리스 로그(도파민 전용 API, 사행성 카지노 폐기, 주식 종목 프리뷰, GSC 연동, P2P 경매 프록시 비딩, VIP 5종 아바타 프레임, 호가 Depth 프리셋 등) 전수 동기화 완료.
- **DOC-468-02 / P1:** `docs/API_CATALOG_MASTER.ko.md` 및 `docs/API_CATALOG_MASTER.md`에 신규 도메인 15(SEO & Search Console Intelligence: `sitemaps/ping`, `gsc/sync`, `gsc/analytics`, `gsc/credentials`, `crawl-audit`, `gsc/digest-report`), 도메인 16(Moneyverse Plus VIP: `status`, `subscribe`, `daily-bonus`, `theme`), 도메인 17(WebSocket Gateway: `auction:bid`, `auction:extended`, `auction:settled`) 및 도메인 8 경매장 확장 API 명세 100% 반영.
- **DOC-468-03 / P1:** `docs/INDEX*`, `docs/DOCUMENT_CATALOG*`의 관측 런타임/소스 이력을 최신 운영 배포본 `v2026.09.27.468` (`prod-v468`, 1,552개 활성 세션 보존)과 일치시킴.

## v2026.09.27.467 — 2026-09-27 — 문서 권위/인벤토리 정리
- 문서 전용 회차. 시작 및 1차 중간 `origin/main=b0c8f1e25dc15b28d44fd033fca510bce70f6960`. 최종 통합 전 재확인에서 동시 런타임 v2026.09.27.466 `origin/main=d64eaedccb7c094063b36fb5f46590ce19f51ab1`을 감지했고 변경 파일은 런타임/루트 실행계획에 한정되어, 동시 작업을 덮어쓰지 않도록 해당 최신 main에서 문서 브랜치를 다시 생성했다. 이번 회차에서 runtime, Test, Production 변경은 수행하지 않았다.
- **DOC-467-01 / P0 / AUTHORITY_DRIFT:** 구현 권위 `PROJECT_PLAN.md` 헤더는 v2026.09.25.444인데 저장소 소스/런타임 이력은 v465까지 진행됐다. v445~v466 결정이 권위 기획서에 실제 통합되기 전까지 제품 기획 완료로 간주하지 않으며, 숫자를 맞추기 위한 허위 버전 상승을 금지한다.
- **DOC-467-02 / P1:** `docs/INDEX*`, `docs/README*`, `DOCUMENT_CATALOG*`, `DOCUMENTATION_POLICY*`를 현재 권위 체계에 맞춰 정리했다. 과거 v402 전체 재검토본은 현재 권위가 아닌 역사 검토 스냅샷으로 명시했다.
- **DOC-467-03 / P1:** exact main tree 기준 `docs/` 파일 1,638개, Markdown 1,620개, docs 루트 날짜형 Markdown 18개, exact duplicate-content 31개 그룹을 확인했다. 대량 삭제/이동 대신 기존 경로와 Git 이력을 보존한다.
- **DOC-467-04 / P1:** Markdown 언어쌍 원시 인벤토리는 영문 경로 기준 한국어 쌍 없음 85개, 한국어 정규화 경로 기준 영문 쌍 없음 19개다. 과거/내부/API 레거시/제3언어를 포함하므로 전부 현행 parity 결함으로 간주하지 않고 신규 유지 문서부터 영문 canonical + 한국어 2차 언어를 강제한다.
- **DOC-467-05 / P1:** 루트 `implementation_plan.md`, `PROJECT_MEMORY.md`, `walkthrough.md`는 실행/역사 참조이며 `PROJECT_PLAN.md`이 명시적으로 채택하지 않는 한 제품 권위를 갖지 않는다.
- **DOC-467-06 / P1:** Android 앱 저장소 문서도 웹 권위 기획을 상위 기준으로 삼도록 별도 README/문서정책을 추가한다. 구 앱 가이드의 카지노/과거 런타임 가정은 역사 스냅샷으로 분류하고 삭제하지 않는다.
- 상세 감사: `docs/findings/DOCUMENTATION_AUDIT_v2026.09.27.467.ko.md`. `PROJECT_PLAN.md` 자체는 계속 v444이며 post-v444 제품 결정을 별도 기획 재검토로 실제 병합해야 한다.

## v2026.09.25.444 — 2026-09-25
- OpenAlex/Crossref 35,429건을 DOI 우선/제목 보조 중복 제거해 **고유 탐색 후보 33,341건**으로 추적했으며, 이는 전수 원문 수작업 검토 주장이 아니다.
- **M444-01..04 / P1:** 무료 핵심, 맥락형 공개광고, 광고제거/편의/표현 구독, 비P2W 코스메틱 직접 entitlement, 명확한 스폰서십을 계획하고, 프리미엄은 추가 가치를 제공하며 광고는 민감 화면에서 배제한다.
- **M444-05 / P0:** 유료 WLD, 유료 확률형 아이템, 유료 카지노 가치, P2W 경제력, 유료 우월 WDX 정보는 계속 금지한다.
- **M444-06..08 / P1:** 단위경제는 시행일/채널별로 계산하고, 구독 해지는 간단히 유지하며, 모든 변동·운영비 차감 후 기여이익을 수익성 권위로 삼는다.
- 근거는 `MONEYVERSE_MONETIZATION_REVENUE_RESEARCH_REVIEW_v2026.09.25.444.ko.md`와 기획 델타에 있다. 기획/문서 전용이며 runtime, Test, Production, 실제매출, 법적승인 완료를 주장하지 않는다.

## Moneyverse Arcade 기획 기록 — v2026.09.26.444
- 100,000건 arcade 탐색 corpus에서 18,578건 검증 후보를 만들었으며, 이는 구현·Test·Production 승인 주장이 아닌 조사 근거다.
- 제안된 Arcade는 비도박·비현금화·비양도 오락에 한정한다. 유료 입장, 현금화, 유료 랜덤 보상, 베팅, WLD 구매, 경제적 우위는 허용하지 않는다.
- 상세 범위와 안전 경계, 연령/동의, 접근성, 텔레메트리, 릴리스 게이트는 `MONEYVERSE_ARCADE_GAME_SPEC.ko.md`와 영문 대응본에 있다.

## v2026.09.25.443 — 2026-09-25
- 시작 및 기록된 중간 `origin/main=99b0eaa04bbd0b28005861c624690c56744e8a14`; 동시 agent 작업을 덮어쓰지 않도록 별도 worktree/branch `docs/db-architecture-research-v2026.09.25.443`를 사용했다.
- 탐색 근거: DB 아키텍처 10개 lane의 Crossref 원시 80,000건을 DOI 우선/정규화 제목 fallback으로 중복 제거해 **66,858건 후보**를 구성했다. broad search false positive는 Tier C 탐색 근거일 뿐 설계 권위로 자동 채택하지 않는다.
- 기존 DB 강점인 numbered SQL migration authority, immutable checksum/reverse parity, 제한된 app role, security-definer mutation 경계, exact integer money, idempotency, transactional outbox/ledger, 결정적 locking 패턴을 재확인했다.
- **G443-01 / P0:** generated exact-SHA schema fingerprint + Test/Production catalog drift 검증.
- **G443-02 / P0:** canonical table PK/constraint audit 및 typed-domain invariant.
- **G443-03 / P0:** PostgreSQL이 child-side FK index를 자동 생성하지 않으므로 referencing-FK index coverage gate와 측정된 예외.
- **G443-04 / P0:** lock/scan/rewrite 분류 및 old/new-runtime 호환성을 포함한 expand/backfill/validate/switch/contract 무중단 migration protocol.
- **G443-05 / P0:** business idempotency와 결정적 lock ordering을 유지하는 retryable serialization/deadlock transaction 전체 bounded retry.
- **G443-06 / P0:** append-only ledger 권위 + atomic balance projection + sampled/full reconciliation/rebuild 증거.
- **G443-07 / P0:** runtime app role non-owner/no-DDL 유지, migration ownership 분리, security-definer search-path/grant 검증 의무화.
- **G443-08..13 / P1:** 측정 기반 index lifecycle, 조건부 partitioning, typed-core/JSONB 경계, 명시적 delete semantics, DB maintenance/observability SLO, heavy-read 분리.
- **G443-14 / P0/P1:** 검증된 logical backup을 유지하고 더 강한 RPO/RTO는 문서 주장 대신 실제 WAL/PITR 및 immutable off-host restore 증거로 수용.
- 상세 권위: `DATABASE_ARCHITECTURE_SPEC.ko.md` / 영문 대응본 및 `docs/findings/` 조사검토/corpus. 조사/기획/문서 전용이며 runtime DB/Test/Production 완료를 주장하지 않는다.

## v2026.09.25.442 — 2026-09-25
- 시작 `origin/main=a7fac4f4db2c4db3b9f8a4e159ad6ea5267540ec`; 최신 main에서 전용 브랜치 `docs/all-page-qa-v2026.09.25.442`를 생성했다.
- 작업 중간 `origin/main=a7fac4f4db2c4db3b9f8a4e159ad6ea5267540ec`; drift 없음. 기록 시점 `git diff --check` 통과.
- 문서 권위, v440/v441 반응형/관리자 계약, 현재 frontend route source, 과거 full-UI QA 기록과 관리자 runtime-QA 기록을 재검토했다.
- 현재 exact-source 스냅샷은 **frontend page 86개**, 그중 **`/admin/**` 22개**, **dynamic page 8개**이며 loading component 25개, error component 3개도 관측됐다. 따라서 과거 60-route sweep만으로 현재 full-route 완료를 증명할 수 없다.
- **G442-01 / P0:** exact release candidate의 모든 page가 필수 QA 범위다. sampling 또는 '변경된 route만' 수용 기준을 supersede한다.
- **G442-02 / P0:** 모든 관리자 page는 매 full-site pass의 기본 범위이며 관리자 검증을 선택적/후순위 단계로 미룰 수 없다.
- **G442-03 / P0:** source-generated route inventory와 QA ledger 및 최종 수용 증거가 1:1로 일치해야 한다. 누락/skipped route 또는 count mismatch는 Production 차단이다.
- **G442-04 / P0:** 모든 candidate는 최소 5회의 완전한 전 사이트 QA pass를 요구한다. 매 pass는 모든 page를 방문하고 누적 증거로 viewport, role, dynamic fixture, content-length, UI-state matrix를 커버한다.
- **G442-05 / P0:** dynamic page는 valid/invalid/not-found/permission fixture를 직접 확인하며 부모 list page 결과로 detail route를 대체할 수 없다.
- **G442-06 / P0:** route 수용은 실제 Test API/runtime data로 전체 page와 local tab/section/dialog/control을 확인해야 하며 screenshot-only, mock-only, source-only, historical evidence로 대체할 수 없다.
- **G442-07 / P0:** v440 반응형 matrix를 변경/admin page가 아니라 모든 page에 적용한다. clipping, body overflow, overlap, 접근 불가 control, 핵심정보 숨김, task 완료 불가는 승격 차단이다.
- 상세 권위: `FULL_ROUTE_UI_QA_SPEC.ko.md` / 영문 대응본 및 `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md` / 영문 대응본. 기획/문서 전용이며 현재 runtime이 이미 v442를 통과했다고 주장하지 않는다.

## v2026.09.25.441 — 2026-09-25
- 최신 main 재확인에서 동시 v440 통합을 감지해 이를 덮어쓰지 않고 `origin/main=5547e5b0c2eb76c60450e089cb415bd65c81026f` 위로 재기준화했다.
- v440은 모바일 overflow/nav/card reflow/slider mismatch/5회 QA를 이미 다룬다. v441은 빠진 control-state 의미 계약을 추가한다.
- **G441-01 / P0:** policy control은 하나의 server-derived canonical value envelope를 사용하고 frontend 숫자 fallback default를 금지한다.
- **G441-02 / P0:** missing/loading policy data를 권위 `0.0%`처럼 표시하지 않고 loading/unknown/blocked로 구분한다.
- **G441-03 / P0:** slider thumb, 화면 숫자, 접근성 값, API payload는 같은 값에서 파생하며 mutation 후 서버 응답으로 재정합한다.
- **G441-04 / P0:** AUTO 소유 policy control은 read-only 의미로 보이고 manual override는 명시적 권한/사유/버전 관리 흐름이다.
- **G441-05 / P1/P0 gate:** AI health, confidence/calibration, evidence sufficiency, council agreement, policy eligibility를 분리하며 정의되지 않은 “신뢰 %”는 운영 근거로 인정하지 않는다.
- **QA:** v440 viewport/5회 반복 외에도 실제 API hydration, auto/manual 전환, save/reread, refresh, rollback, error 상태를 검증한다.
- 기획/문서 전용이며 runtime/Test/Production 수정 완료를 주장하지 않는다.

## v2026.09.25.440 — 2026-09-25
- 시작 `origin/main=5394dd266e68c0a3ebfee616cdf7f0d906116b48`; 전용 브랜치 `docs/admin-mobile-responsive-v2026.09.25.440`.
- PROJECT_PLAN, 통합 마스터, 반응형/접근성 명세, 제품디자인/관리자/경제 기획과 제보된 경제 운영 모바일 화면을 재검토했다.
- **G440-01 / P0:** page-level horizontal overflow 또는 관리자 navigation/content 잘림은 기능 결함이며 릴리스 차단 사유다.
- **G440-02 / P0:** AI Council과 경제 metric/control card는 모바일 1열로 reflow하며 fixed-width overflow를 허용하지 않는다.
- **G440-03 / P0:** 금리 slider thumb, 표시 숫자, form state, submit payload, 서버 권위 저장값이 일치해야 한다. 불일치 시 save/apply를 차단한다.
- **G440-04 / P0:** 관리자 navigation은 모든 핵심 목적지를 발견 가능하게 유지해야 하며 affordance 없이 화면 밖 label을 숨기는 방식을 금지한다.
- **G440-05 / P0 QA:** 필수 viewport는 320/360/375/390/412/430 portrait + 대표 landscape + 768/1024 + desktop이며 200%와 적용 가능한 400% zoom/reflow를 포함한다.
- **G440-06 / P0 QA:** 반응형/관리자 route를 실질 수정할 때마다 viewport matrix, 전체 페이지 scroll, 모든 tab/section, long-content 상태, interactive control을 포함해 최소 5회의 완전 반복 QA를 수행한다.
- clipping, overlap, unreachable control, hidden CTA, body overflow, touch-target 실패, 의도치 않은 reset, control/value mismatch 중 하나라도 있으면 Test 수용 및 Production 승격을 차단한다.
- 상세 권위: `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md` / 영문 대응본. 기획/문서 전용이며 runtime 수정 완료를 주장하지 않는다.

## v2026.09.25.439 — 2026-09-25
- 시작 `origin/main=118a58ddc289839957caacd14650863e614f8fad`; 최신 main에서 전용 브랜치 `docs/session-continuity-v2026.09.25.439`를 생성했다.
- 현재 문서 권위 순서, PROJECT_PLAN, 통합 마스터, 인증/API 참고문서, 기존 v396 세션 연속성 계약을 재검토했다.
- **G439-01 / P0:** 아직 유효한 사용자는 앱/서비스/호스트 재시작, 배포, 프록시 reload, cutover, rollback, key rotation만을 이유로 로그아웃되면 안 된다.
- **G439-02 / P0:** 로그아웃 사유는 사용자 직접 로그아웃, 명시적 관리자/보안 폐기, compromise 대응, 계정 비활성/삭제, 정상 서버 권위 만료로 제한한다.
- **G439-03 / P0:** 세션 검증 권위와 키 재료는 런타임 교체 후에도 살아 있어야 하며 프로세스 메모리가 유일 권위가 될 수 없고 배포 hook이 shared session store를 비워서는 안 된다.
- **G439-04 / P0:** release/config/key 불일치 때문에 유효 세션을 guest로 조용히 강등하는 것은 정상 UX가 아니라 release failure다.
- **G439-05 / P0 승격 게이트:** 배포 전에 존재한 동일 authenticated session이 Test restart와 Production cutover를 통과해야 한다. 배포 유발 로그아웃 또는 release 기인 auth error spike는 승격 차단/rollback 조건이다.
- 수용 증거는 exact candidate SHA, runtime identity, shared-session health, privacy-safe continuity 식별자, safe CSRF mutation을 포함한 전후 authenticated request, auth-error 변화를 포함해야 한다. session count만 같아서는 부족하다.
- 영/한 동기화 필수. v439는 기획/문서 변경이며 Test/Production 런타임 변경을 주장하지 않는다.

## v2026.09.25.438 — 2026-09-25
- 시작/중간 `origin/main=328b4623f2f063eaaade74e38cb4d8f4f14561c2`; 기록된 중간 확인에서 main drift가 없었다.
- 정리 전 관측 저장공간 기준: root 99G/55G 사용(59%), data disk 197G/135G 사용(72%), data disk 사용 inode 약 490만 개.
- 삭제 전 활성 런타임 정체성을 재입증했다. Production backend/frontend CWD와 `production-current`는 모두 `prod-d058df3-v436`, Test는 모두 `test-d058df3-v436`으로 일치했다.
- **G438-01 / P0:** 활성 symlink target과 실행 프로세스 CWD release root는 삭제 보호한다.
- **G438-02 / P1:** 환경별 활성 + 최근 롤백 가능 불변 릴리스 최소 10개를 보존하고 더 긴 보존은 사유를 명시한다.
- **G438-03 / P1:** 용량 임계치는 70% 경고, 80% 비필수 artifact 증가 중단, 90% 이상 사고로 정하고 회수 bytes/inodes를 기록한다.
- **G438-04 / P1:** 일반 정리는 PostgreSQL, upload, backup, active release, retain-until-classified QA data를 제외하며 광범위 `docker system prune --volumes`는 계속 금지한다.
- **G438-05 / P1:** disk swap은 v437 memory-continuity 계약에 따르며 디스크 확보만을 이유로 축소하지 않는다.
- 상세 권위: `STORAGE_RELEASE_RETENTION_SPEC.ko.md` / 영문 대응본. 이번 회차는 런타임 저장공간 정리 증거를 포함하지만 application code release, DB migration, Test/Production 승격은 수행하지 않는다.

## v2026.09.25.437 — 2026-09-25
- Debian 13 Production VM 장애 증거에서 PostgreSQL이 03:31 KST부터 반복적인 `kvm_async_pf_task_wait_schedule` 스택과 함께 uninterruptible `D` 상태에 들어갔고 block 시간이 120초에서 1,087초까지 증가했다. 이전 부팅은 정상 shutdown 없이 끝났으며 10:46 부팅에서 system journal, Moneyverse 데이터 파일시스템 journal, PostgreSQL WAL 복구가 수행됐다.
- **G437-01 / P0 (하이퍼바이저 메모리 연속성):** Production VM 메모리는 공격적인 host overcommit/balloon 회수에 의존하지 않는다. 최소 보장 guest RAM, host reserve, balloon 하한, swap/PSI 임계치를 정의·관측하고 실측 steady-state 안전영역 아래로 자동 balloon-down 하는 것을 금지한다.
- **G437-02 / P0 (KVM async-PF/hung-task 탐지):** `kvm_async_pf`, hung task, guest scheduling stall, QEMU pause/reset, host OOM, storage latency, guest-agent 손실을 guest 내부뿐 아니라 가상화 host에서도 탐지한다. 로컬 애플리케이션 `/health` 하나만으로 정상 판정하지 않는다.
- **G437-03 / P0 (외부 watchdog 및 복구):** guest 밖 watchdog이 public edge, backend, DB transaction health, guest heartbeat를 함께 검사한다. 지속적인 VM-level 장애 시 alert -> 증거 보존 -> cooldown/fencing 정책에 따른 controlled restart/failover 순으로 처리하며 단일 애플리케이션 endpoint 실패만으로 VM을 재부팅하지 않는다.
- **G437-04 / P0 (DB crash safety):** PostgreSQL은 `fsync`/WAL crash recovery가 유지되는 durable storage를 사용하고 backup/restore 증거를 최신으로 유지한다. 자동 기동은 파일시스템과 DB 복구 완료 후에만 애플리케이션 트래픽을 받는다. DB가 recovery 또는 D-state일 때 auto-healer가 DB 의존 서비스를 반복 재시작하지 않는다.
- **G437-05 / P1 (host 관측성/증거):** Proxmox/QEMU task log, host kernel/OOM/PSI/I/O, VM guest journal, PostgreSQL, Nginx/API 가용성, release identity를 사고 단위로 연계 보존한다. 가능한 경우 자동 조치 전에 pre-crash 증거를 보존한다.
- **G437-06 / P1 (용량 게이트):** Production/Test/AI workload에 CPU/RAM/storage-I/O budget과 동시성 ceiling을 명시한다. 로컬 AI 추론, 빌드, 백업, QA가 Production과 자원경합할 수 있으면 직렬화하거나 resource limit을 적용한다.
- **수용 게이트:** Test fault-injection에서 memory pressure, guest pause/stall, DB crash recovery, host/guest health 불일치를 검증하고 ledger corruption 0, DB/session authority 생존 시 session continuity, 결정적 recovery ordering, bounded restart loop, 외부 alerting을 확인한다. host-level 관측성 또는 watchdog 책임 주체가 없으면 Production 승격을 차단한다.
- 시작 기준 `origin/main=4a4549f644972af972c47fb8f56bd9500766aa61`. 상세 권위: `docs/planning/INFRASTRUCTURE_STALL_RESILIENCE_SPEC.ko.md` / `.md`, delta `docs/planning/deltas/v2026.09.25.437.ko.md` / `.md`. 기획/문서만 변경하며 runtime 완화 구현, Test fault-injection, Production 변경 완료를 주장하지 않는다.

## v2026.09.24.433 — 2026-09-24
- v400/v401 경제 연구 권위를 다시 검증하면서 미러·번역본·추적 URL 변형·이미 채택된 표준을 다시 세지 않았다. 중복 제거된 31,289건 탐색 corpus는 광범위 기반으로 유지하고, v433은 건수 부풀리기 대신 품질/provenance 매핑을 강화한다.
- EVE Online 2026년 8월 MER, OSRS 시장개입 연구, Federal Reserve 정산/유동성 연구, PostgreSQL transaction isolation/locking, OWASP API Security, NIST SSDF, WCAG 2.2, OpenTelemetry semantic convention, GitHub deployment environment, Debian 13.7 릴리스 정보, Apple 플랫폼 정책 등 현재 1차/규범 근거를 재검증했다.
- **G433-01 / P0 (직업/경제):** 보상 직업은 서버 권위 시간 또는 독립 검증 가능한 완료 경계를 요구하며, 클릭 즉시 사용 가능한 WLD 생성은 금지한다.
- **G433-02 / P0 (원장/동시성):** 모든 잔액 mutation은 원자적 영속 transaction, 고유 business idempotency key, invariant 보존 동시성 제어와 제한형 transaction 전체 재시도를 요구한다.
- **G433-03 / P1 (경제):** 자동조절은 faucet/sink 단일 비율이 아니라 발행·소각·통화량·통화속도·가격지수·구매력·집중도·거래량 지표 묶음을 사용하고 변화율을 제한한다.
- **G433-04 / P1 (시장정책):** 거래세/item sink는 거래량을 줄이지 않으면서 고가품 가격을 올릴 수도 있으므로 인과·분배효과 검증을 필수화한다.
- **G433-05 / P1 (은행/국고):** 정산 속도는 유동성/위험 파라미터로 다루며 빠를수록 항상 안전하다고 가정하지 않는다.
- **G433-06 / P1 (관측성):** 경제정책 버전, 발행/소각, velocity, 세금, 국고 흐름, 중복 차단, retry, rollback을 metric/trace/log로 연계 추적한다.
- **G433-07 / P1 (접근성 정정):** WCAG 2.2 SC 2.5.8 AA 규범 최소는 정의된 예외가 있는 24x24 CSS pixel이다. Moneyverse 44x44는 더 강한 제품 목표로 유지하되 WCAG 규범 최소와 구분한다.
- **G433-08..10 / P1:** Test/Production 보호·직렬화 배포환경, 실제 호스트 증거 없이 Debian 13.6 관측값을 13.7로 바꾸지 않는 최신성 검증, 모바일 가상화폐/스토어 정책 경계를 추가했다.
- 시작/중간 main: `e15a6fdd941a8f78a1a27755f148072c738eddc1` (기록된 중간 체크포인트에서 drift 없음).
- 권위 상세명세: `docs/planning/deltas/v2026.09.24.433.ko.md` / 영문 대응본. 기획/문서 전용이며 런타임·Test·Production 완료를 주장하지 않는다.

## v2026.09.23.406 — 2026-09-23
- 최신 고신뢰 글로벌 학술 논문 및 핀테크·가상경제 레퍼런스를 전수 조사하여 기획 6대 도메인 결함 및 8대 Gap을 공식 보완 명세화했다.
- **주요 인용 레퍼런스**: Aave/Compound Kinked 점프 이자율 모델, LOB 웹소켓 단조 시퀀스 갭 복구(Binance/Coinbase), OSRS Grand Exchange 2% 거래세 & 자동 아이템 소각 메커니즘, RFC 6455 / Signal 프로토콜 멱등성 및 커서 페이지네이션, CNN 다요소 시장 감성 지수, OWASP ASVS 5.0 / NIST SP 800-63B-4 듀얼 키 롤링, Apple HIG 44px 최소 터치 타겟.
- **G406-01 / P0 (주식)**: 웹소켓 단절 시 틱 유실 방지를 위한 단조 시퀀스 ID 및 스냅샷+버퍼 델타 자동 재동기화 계약 명문화.
- **G406-02 / P1 (주식)**: 1원(CHIPS)부터 1,000만 원(SPACE)까지 극단 가격대를 포괄하는 KRX 준용 7단계 Tick Size Tier 규격 정의.
- **G406-03 / P1 (주식)**: AI 뉴스(40%) + 24시간 가격 모멘텀(30%) + 거래량 서지(20%) + 호가 압력(10%) 다요소 시장 감성 지수 수식 수립.
- **G406-04 / P0 (경제)**: 통화 발행량 누적 및 장비 가치 하락 방지를 위한 2% 마켓 거래세 징수 및 국고 연동 최저가 매물 자동 매입 소각(Automated GE Item Sink) 계약.
- **G406-05 / P0 (소셜)**: 1:1 개인 채팅의 클라이언트 UUID 멱등키 `(conversation_id, client_message_id)` 중복 전송 방지 및 커서 기반 페이지네이션 강제.
- **G406-06 / P0 (은행)**: 뱅크런 방지를 위한 Aave식 최적 이용률 $U_{\text{optimal}}=80\%$ 점프 금리 곡선 및 바젤 III 20% 법정지급준비금 동결 계약.
- **G406-07 / P1 (인증)**: 배포 및 시크릿 교체 시 세션 단절 없는 7일 Grace Period 듀얼 키 롤링 계약.
- **G406-08 / P1 (UX)**: 320px 극소 모바일 44px 터치 타겟 및 `pb-[calc(env(safe-area-inset-bottom)+5rem)]` 클리핑 방지 레이아웃 계약.
- 신규 권위 세부명세: `docs/planning/deltas/v2026.09.23.406.ko.md` / `v2026.09.23.406.md`. 영/한 동기화 완료.

## v2026.09.23.405 — 2026-09-23
- PR #702를 병합한 뒤(main `67e34d8df182403532e1541d16391f76edfafc57`) Debian 13 런타임 정리를 계속했다.
- Backend 설정과 active TCP 연결로 현재 DB 권위를 재입증했다: Production `127.0.0.1:5433/woldeok_moneyverse_dev`, Test `127.0.0.1:5585/woldeok_moneyverse_ci`.
- 운영 영향 없는 stale container object 4개만 제거했다: `mv-b280-pg`, `mv-ci315`, `mv-ci315b`, `wdmv-v127-fulltest-db`. Docker volume은 보존했다.
- `operations/RUNTIME_HYGIENE_INVENTORY.md` / `.ko.md`를 추가하고 남은 QA/recovery DB container는 owner/data/rollback 확인 전 유지 대상으로 분류했다.
- G405-01 / P1: Production PostgreSQL 5433과 QA PostgreSQL 55432/55433/55555/56555가 wildcard host bind인 것을 관측했다. firewall/network 도달성은 독립 검증하지 못했으므로 Internet 노출 확정이 아니라 bind-exposure 검토항목으로 기록한다.
- Production 5433은 live backend가 사용 중이므로 변경하지 않았다. QA bind 제한은 owner/workstream 확인 후 stop/recreate한다.
- Container 삭제와 volume 삭제는 별도 결정이며 이 호스트에서 광범위 volume prune을 사용하지 않는다.
- 런타임 정리/문서 업데이트이며 Production service restart, DB migration, release promotion은 수행하지 않았다.

## v2026.09.23.404 — 2026-09-23
- 승인 Debian 호스트의 실제 관측값을 기준으로 현재 인프라 문서를 다시 정리했다.
- 현재 관측 OS/runtime: Debian GNU/Linux 13.6 (trixie), Linux 6.12.94, systemd 257, Node 24.21.0, pnpm 10.0.0, Python 3.13.5, Nginx 1.26.3, Docker 29.8.0, Production PostgreSQL 17.11.
- 현재 공개 권위는 host Nginx 뒤 Debian 13 systemd release 디렉터리와 Docker PostgreSQL이다. Production backend/frontend는 3000/3001, Test는 3100/3101을 사용한다.
- 권위 `CURRENT_RUNTIME_BASELINE.md` / `.ko.md`를 추가하고 docs README/index에서 연결했다.
- deployment-flow와 release-guide 영/한을 현재 관측 상태와 TARGET/RECOVERY Kubernetes/Flux를 명확히 구분하도록 재작성했다.
- operations/production-deployment에서 GitOps desired state를 현재 공개 runtime 증거로 오해할 표현을 정정했다.
- Kubernetes/Flux는 접근·DB 대사·exact runtime identity·public routing을 명시적으로 재검증하기 전까지 target/recovery 아키텍처다.
- 여러 QA PostgreSQL 컨테이너가 관측됐지만 파괴적 정리는 수행하지 않았다. 컨테이너 정리는 owner/use/data/rollback 분류 후 수행한다.
- 기획/문서/런타임 관측 업데이트이며 runtime 변경이나 Production 승격은 수행하지 않았다.

## v2026.09.23.403 — 2026-09-23
- GitHub 문서를 역사 증거 삭제나 기존 경로 파손 없이 정리했다.
- 권위 `docs/README.md`, 간결한 `INDEX.md`, `DOCUMENTATION_POLICY.md`, `DOCUMENT_CATALOG.md`와 한국어 쌍 문서를 추가했다.
- planning, architecture, features, operations, findings, updates, changelog, worklog, releases에 문서군별 README 거버넌스를 추가했다.
- 문서 전용이면 `main`에 직접 반영하도록 했던 구형 한국어 단독 정책을 폐기했다. 의미 있는 문서 변경도 브랜치, latest-main 재확인, 영/한 정합, 버전 기록을 요구한다.
- 전수 인벤토리에서 docs 루트 날짜형 legacy Markdown 18개와 내용이 완전히 같은 그룹 31개를 찾았다. 이번 회차는 링크/이력 보호를 위해 경로를 유지하고 신규 루트 날짜형 기록을 금지한다.
- 역사 문서는 근거로 유지하되 현재 권위는 PROJECT_PLAN / INTEGRATED_PLANNING_MASTER / 채택 상세명세가 가진다.
- 문서 전용 커밋을 application release identity로 취급하거나 runtime 승격을 시작하면 안 된다.
- 기획/문서 전용이며 런타임·Test·Production 완료 주장은 없다.

## v2026.09.23.402 — 2026-09-23
- 현재 저장소 증거, 런타임 계약, 최신 표준, 최근 기획결정을 기준으로 기획 전면 재검토를 시작했다.
- 기계적 인벤토리: planning 최상위 166개 = 영문 83 + 한국어 83, 영/한 짝 누락 0, 상대링크 깨짐 0.
- G402-01 / P0: PROJECT_PLAN은 v397, 통합 마스터는 v401이던 권위 드리프트를 v402 공통 권위 marker로 정정했다.
- G402-02 / P1: 모바일 API 문서는 57 controller / 335 endpoint / mobile 179를 기록하지만 현재 소스 탐색은 58 controller 파일 / HTTP decorator 361개다. 동일 계산으로 단정하지 않고 generated contract diff를 요구한다. 로컬 `pnpm api:contract:check`는 dependencies/tsc 부재로 BLOCKED다.
- G402-03 / P1: 역사 incident 본문이 현재 상태를 자동 결정하지 않도록 current active-status ledger를 만들었다.
- G402-04 / P1: AUTH-105-02, OPS-CACHE-156-01 등 명시 TODO를 current-main으로 재검증한다.
- 최신 기준 재확인: OWASP ASVS 5.0.0, NIST SP 800-63-4/63B-4 final, OpenAPI 3.2.1, WCAG 2.2 / ISO 40500:2025, W3C ACT Rules Format 1.1.
- 권위 재검토 문서: `INTEGRATED_FULL_REVIEW_V402.md` / `.ko.md`. 1단계는 권위 정리와 12개 전면감사 lane 설정이며 전체 도메인 감사 완료를 주장하지 않는다.

## v2026.09.23.401 — 2026-09-23
- 경제 기획에 실제 핵심 논문-정책 연결을 추가했다. 대규모 31,289건 후보군과 별도로 고신뢰 논문을 채택근거·미채택가정·KPI까지 매핑한다.
- 핵심 근거: Axtell & Farmer (2025) ABM, Kaplan/Moll/Violante (2018) HANK, Kaplan & Violante (2018) heterogeneity, Zheng et al. AI Economist (2020/2021), Atashbar & Shi IMF RL (2022/2023), Atashbar (2024), Hogan-Hennessy et al. virtual-market intervention (2022), Calvano et al. algorithmic pricing (2020), Meylahn & Schinkel (2026).
- 코호트 구매력, ABM stress test, RL shadow gate, sink causal evaluation, 알고리즘 가격상한·동조 telemetry·사람 승인 규칙을 논문 근거와 직접 연결했다.
- 새 권위 문서: `ECONOMY_RESEARCH_PAPER_MAP.ko.md` / `ECONOMY_RESEARCH_PAPER_MAP.md`.
- 논문 인용만으로 Production 파라미터를 정할 수 없고 Moneyverse replay·telemetry·rollback 증거가 필요하다고 명시했다.
- 문서/기획 전용이며 런타임·Test·Production 완료를 주장하지 않는다. 영/한 동기화 완료.

## v2026.09.23.400 — 2026-09-23
- 기준 재확인: `origin/main=7b705e1d37e97ccd05ba12042c3fd8d582e396d0`; v399 경제 통화속도 기획을 바탕으로 추가 연구 확장을 수행했다.
- 기존 11,749건 후보군에 Crossref 6,879건과 OpenAlex 17,291건을 보완 수집했고 DOI 우선/정규화 제목 보조 중복 제거 후 **31,289건**으로 확장했다. 기존 대비 순증 19,540건이다.
- 신뢰도 높은 추가 근거로 2026 EVE Monthly Economic Report, Old School RuneScape 시장개입 실증연구, Fed/IMF/ECB/BIS heterogeneous-agent·HANK 자료, 2025 AEA/JEL ABM 리뷰를 재검토했다.
- G400-01 / P1: 전역 평균 지표만으로는 코호트별 구매력·분포효과를 놓친다. 신규·중간·고소득·고자산 코호트별 물가/구매력 관측을 추가했다.
- G400-02 / P1: sink가 총소각량을 늘려도 특정 희소·명예재 가격을 높일 수 있으므로 품목군별 가격·거래량·대체수요 검증을 추가했다.
- G400-03 / P1: 휴면잔액/복귀 고자산 유동성, 계절성, 데이터 사후정정과 source/version metadata를 경제 시뮬레이션·대시보드 계약에 추가했다.
- `MONEYVERSE_ECONOMY_REFERENCE_CORPUS_v2026.09.23.400.csv`, 연구검토 영/한, 경제 통화속도 명세 v400을 추가/갱신했다. 기획/문서 전용이며 런타임/Test/Production 완료를 주장하지 않는다.
- 영/한 동기화 완료.

## v2026.09.23.399 — 2026-09-23
- 시작 기준: `origin/main=4812a99b0a78da736e477d0a3a2f02ed4ea66283`; 중간 재확인: `origin/main=f0efc448a30a5b67071956b0faa6742a8427d2ea`. 두 신규 main 커밋은 경제 기획 문서와 비중첩이며 최신 main 위로 재기준화한다.
- 기존 경제 연구 후보군 CSV 11,749건을 재확인하고, 2026년 EVE Monthly Economic Report와 AI Economist/IMF 정책 시뮬레이션 문헌을 추가 검토했다.
- G399-01 / P0: 즉시 완료·즉시 정산 가능한 작업은 반복감쇠만으로도 단위시간당 WLD 발행속도가 과도해질 수 있다. 일반 플레이 무제한 원칙은 유지하되 모든 유상 작업에 서버 권위 시간 또는 검증 경계를 요구한다.
- G399-02 / P1: faucet/sink 비율만으로 경제를 제어하지 않고 통화량, 가격지수, 자산집중, 소득분포, 신규유저 핵심바스켓 구매력을 함께 본다.
- G399-03 / P1: 자동 제어는 악용차단 → 집중 발행원 감쇠 → 작업 다양화 → 고자산 명예 sink → 제한형 issuance factor → 임시 보상윈도우 순서로 적용하고 모두 버전관리·가역·감사 가능해야 한다.
- 신규 권위 세부명세: `ECONOMY_MONETARY_VELOCITY_SPEC` 영/한. 런타임 수정·Test 완료·Production 배포는 이번 회차에서 주장하지 않는다.
- 영/한 동기화 완료.

## v2026.09.23.398 — 2026-09-23
- 시작/중간 기준: `origin/main=4812a99b0a78da736e477d0a3a2f02ed4ea66283`.
- 현재 직업 보상 UI, `work_my_dashboard_v2`, game-clock repository, migration 203, `DEFAULT_LIMIT_POLICY`, `JOBS_PROFESSION_MASTERY_SPEC`, 기존 WORK-128 quota 계약을 재검토했다.
- G398-01 / P1: 현재 UI 문구는 자정/UTC 00:00을 말할 수 있지만 권위 가속 Moneyverse 게임 시계의 `day_ends_at`/`week_ends_at`은 다른 시각을 반환할 수 있어, 정산이 서버 시계를 쓰더라도 사용자 화면 계약이 서로 모순된다.
- G398-02 / P1: 화면에는 유한 일일/주간 WLD 한도가 보이지만 기획은 일반 직업 참여 기본 무제한을 선언한다. 유한 cap은 일반 작업/플레이 금지가 아니라 버전 관리형 보상 발행 보호 윈도우이며 사유/재평가 metadata가 필요하다고 명확히 했다.
- canonical summary/API 필드, unlimited=`null`, 서버 권위 초기화 경계 표시, 일일/주간 분리 문구, 동시성/멱등성 경계시험, 웹/모바일 정합, exact-SHA Test 게이트를 추가했다.
- 기획/문서 전용이며 이번 회차에서 런타임 수정·Test 완료·Production 배포를 주장하지 않는다.
- 영/한 동기화 완료.

## v2026.09.23.397 — 2026-09-23
- 기준: `origin/main=0e46f1eac272c42aa929947b79c0b0d2ccbd5454`.
- P0 기능/API 정합성 불변조건 추가: 서버 기반 또는 보안 민감 기능은 같은 작업 단위에서 필요한 API를 반드시 구현하고, 명시적 client-only 예외가 아니면 UI-only 구현을 미완성으로 판정한다.
- method/path, 인증·인가, schema, validation, error, idempotency, rate/resource limit, concurrency, telemetry/audit, version/deprecation, 영속화·실패 의미까지 포함한 완전한 API 계약을 요구한다.
- 웹/모바일 계약 정합, positive/negative authorization test, contract/schema check, 필요한 idempotency/concurrency 검증, exact-SHA client-to-API E2E를 필수화했다.
- UI에는 보이지만 필요한 backend/API 구현·테스트·문서가 빠진 기능은 Production 승격을 차단한다.
- 영/한 동기화 완료. 기획/문서 전용이며 과거 모든 기능의 API 완비를 주장하지 않는다.

## v2026.09.23.396 — 2026-09-23
- 기준: `origin/main=5762e7bc685dc8d75ce6e672a6cef1dcc9b03ee4`. main 최신 병합 릴리스 기록은 v393까지 진행됐지만 권위 기획은 v388이므로 이번 회차에서 런타임 배포 완료를 새로 주장하지 않고 기획 권위를 갱신한다.
- P0 인증/세션 연속성 불변조건 추가: 서버·서비스 재시작, 애플리케이션 업데이트, 블루-그린 전환, 프록시 reload, 롤백 때문에 아직 유효한 사용자를 로그아웃시키면 안 된다.
- 배포 인스턴스 독립 세션 권위, 서명/암호화 키 overlap, cookie/schema 호환성, 배포 전후 authenticated continuity 표본, 401/403/session-store telemetry, 배포 유발 로그아웃 시 중단/롤백을 필수화했다.
- 배포 수단으로 session store truncate/global invalidation/overlap 없는 키 일괄 교체를 금지한다. 보안·사용자·관리자·만료에 의한 정상 세션 폐기는 유지한다.
- Production 승격 전에 Test restart/cutover 자동 회귀시험 증거를 요구한다.
- 영/한 동기화 완료. 기획/문서 전용이며 새 런타임 배포 완료를 주장하지 않는다.

## v2026.09.23.388 — 2026-09-23
- 시작/통합 SHA: `bb832b69ee56b9ab247eda24b7b20f76ea44ffb4` (23개 미병합 PR 및 PR #685 메인 병합 완료).
- 검토: `PROJECT_PLAN` 영/한, `docs/mobile-api-complete-spec` 영/한, `AUTHENTICATION_SECURITY_PRIORITY_SPEC` 영/한, `COMMUNITY_MARKET_INTEGRITY_SPEC` 영/한, 런타임 마이그레이션 197 실증 증거, 백엔드 테스트(974 pass), 프론트엔드 테스트(3 pass), 배포 및 운영 세션(1,061개) 연속성 실측 데이터.
- G368-02 P0 종결 (Closed): 관리자 구형 TOTP 문구를 마이그레이션 197 및 실제 배포 통제인 `AdminSessionGuard`, `ReauthGuard`(Step-Up 2FA), 브라우저 CSRF 가드, DB role/actor 검사, 멱등성 및 append-only audit로 완전 정합화 완료.
- G368-03 P1 종결 (Closed): `docs/mobile-api-complete-spec.ko.md` 및 영문 문서를 v2026.09.23.388로 최신화하고, 신규 4대 도메인 16개 엔드포인트를 포함하여 57개 컨트롤러, 335개 엔드포인트(모바일 계약 179개) 전수 정합화 완료.
- G368-04 P1 종결 (Closed): 상점 Step-Up 및 23개 PR을 `main`에 정합 병합하고, 테스트 및 빌드 검증을 거쳐 테스트/운영 서버에 무중단 승격 완료.
- G368-05 P1 종결 (Closed): 운영 서버 승격 중 1,061개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 및 BFF 알림/채팅 엔드포인트 정상 응답 실측 증명 완료.
- 영/한 동기화: 완료.

## v2026.09.22.368 — 2026-09-22
- 시작 SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`.
- 중간 SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`(안정).
- 권위 드리프트: PROJECT_PLAN v352 대 main release 증거 v360.
- 검토: PROJECT_PLAN 영/한, INTEGRATED_REVIEW_V348 영/한, UPDATE_LOG 영/한, v359/v360 release 증거, mobile complete API 계약, 현재 관리자 TOTP/runtime migration 증거, 원격 admin-shop reauth 후보.
- G368-01 P1: 권위/버전 드리프트. 후속 release note는 기획 수용조건을 묵시적으로 덮어쓰지 않는다.
- G368-02 P0: migration/runtime 증거상 관리자 TOTP가 폐기됐지만 권위/세부기획에는 현재 통제로 남아 있다. 새 runtime+DB 증거 없이는 배포 통제로 계산하지 않는다.
- G368-03 P1: mobile/API 계약에 과거 v2026.09.14.2/52-controller/163-endpoint 내용과 v359의 57-controller/335-backend/179-mobile 내용이 혼재한다. exact-SHA semantic machine diff와 영/한 동기화를 요구한다.
- G368-04 P1: `auto/hourly-b-shop-stepup-v2026.09.22.366`은 미병합 WIP 증거다. 최신 main rebase, reauth/role/CSRF 음성시험, 감사·동시성/멱등성 증거, 영/한 기록, merged exact-SHA Test 증거가 있어야 수용한다.
- G368-05 P1: v360 session 수/무중단 증거는 해당 release 범위이며 모든 auth/CSRF/reauth/중요 mutation 연속성을 단독으로 증명하지 않는다.
- 외부 재확인: OWASP ASVS 5.0.0 latest stable, NIST SP 800-63B-4 2025-07 final 및 주기적 재인증/session-timeout 요구.
- 판단: 기획/문서 전용. 새 구현·Test·Production 완료를 주장하지 않는다.

## v2026.09.26.443 — 대한민국 법령/준수 감사
- 시작/중간 `origin/main=6f025ced5239fc6bc8b365c31ad0fd59acf84dbc`; 중간 drift 없음.
- `KR_LEGAL_COMPLIANCE_AUDIT.md` / `.ko.md` 추가. 운영 backend/frontend active, `production-current=prod-v453`, 선택 공개페이지에서 AdSense 실제 렌더 확인.
- **KR-LGL-443-01 / P0:** 실제 GRAC/등급 + 19+ + 법률/채널 증거 전 대한민국 카지노 BLOCK 유지. 현재 소스/운영 번들의 승인/정규가동성 문구는 권위 정책과 충돌한다.
- **KR-LGL-443-02 / P0:** 현재 광고 수익화 확대 전 실제 사업개시일·사업자등록·세무상태 증거 필요.
- **KR-LGL-443-03 / 실결제 전 P0:** 판매자 신원/신고, 거래조건, 청약철회/환불/해지, 미성년자 계약 통제 전 유료상품/구독 BLOCK.
- **KR-LGL-443-04..08 / P1:** 연령확인 표현, AdSense/국외이전, 광고성 메시지 동의, 게임 등급 적용성, 비환전 경계를 증거 기반 게이트로 관리.
- 기획/감사만 수행. 운영 변경·배포·DB migration·GRAC 승인·사업자등록·세무상태 완료를 주장하지 않는다.

## v2026.09.30.487 — 광고 전용 현금 수익화
- 시작/중간 `origin/main=85508db432cd525570e26bc1820b9e637a8140fa`; 기록한 체크포인트에서 drift 없음.
- 사용자 사업자등록 제약: 현재 안내 범위에서 상품 직접판매를 허용하지 않는다.
- **현행 현금수익 권위:** 검토된 광고수익만 허용한다. 유료 구독/광고제거, 디지털 상품/코스메틱, 유료 WLD/WDX, 유료 확률형/카지노 가치, 사용자 유료 마켓수수료, 후원/멤버십, 유료 API/B2B, 제휴/직접판매는 향후 사업범위·세무·법률 권위 변경이 명시적으로 해제하기 전까지 BLOCKED다.
- **월 광고수익 100만 원 목표:** 업계 평균 약속이 아니라 실측 Page RPM을 사용한다. `PV = 1,000,000 / PageRPM × 1,000`; 시나리오는 RPM 2천원=50만 PV, 5천원=20만 PV, 1만원=10만 PV, 2만원=5만 PV다.
- 성장 권위: 정상 인간 트래픽, Search Console/색인 진실성, audience-first 계산기·가이드, 올바른 locale 구조, 관련 내부링크, 실측 AdSense 실험. 자가클릭·클릭유도·보상형 광고조회·traffic exchange·봇 impression·저품질 유료트래픽은 금지한다.
- 신규 상세 권위: `AD_ONLY_ADVERTISING_REVENUE_SPEC.ko.md`; PROJECT_PLAN과 수익화/한국 준수 명세에 v487 상위 대체 게이트를 반영했다.
- Google AdSense Page RPM/Auto Ads/Experiments/invalid traffic/publisher policy와 국세청 플랫폼 광고수익 세무 안내를 재확인했다. 국세청 1인 미디어 안내를 이 웹사이트의 자동 업종분류 근거로 사용하지 않는다.
- 기획/문서 전용이며 런타임, 결제, AdSense 설정, Test, Production, 세무분류 확정, 실제 수익달성을 주장하지 않는다.
