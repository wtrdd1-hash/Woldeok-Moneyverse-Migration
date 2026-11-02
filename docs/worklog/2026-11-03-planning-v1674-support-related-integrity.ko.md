# 기획 v1674 — F675-224 관련 문의 연결 정합성

## v2026.11.03.1674 — F675-224 관련 문의 연결 재실행·인증 경계·개인정보 삭제 보완 (기능 보완 / 초안 / 운영 보류)

**주기:** 이전 Feature Addition v1672 → 현재 Feature Improvement v1674 → 다음 Feature Addition v1676(잠정). **기준:** 원격 main f5c3fbedae1c3b3ec2374882b049aac43a655eb4 시작·중간·최종 재확인, AGENTS.md·README.md·영문 정본·한국어 대조. 미병합 Draft #2549(기초 #2544)에 종속, 개발 이슈 #2548. 문서 전용이며 v1674는 충돌하는 v1672 요청·재실행 조건을 대체한다. F675-224는 **미구현**이다.

### 실제 소스에서 확인한 위험과 보완 결정

1. **actor UUID는 실제 호출자 인증 증거가 아니다.** 적용 마이그레이션 196의 admin_support_threads는 admin_current_roles(p_actor)를 검사하지만 p_actor는 호출자가 전달하는 UUID다. Nest는 Session/Authenticated/Consent/Admin/AdminSession 가드와 requireUserId(req)로 HTTP 세션 사용자를 도출한다. SQL 역할 조회는 *전달된 계정*의 권한을 검사할 뿐 HTTP 세션을 독립적으로 암호학적 인증하지 않는다. 이를 독립 인증으로 주장하지 않는다. 기능 ON 전에 moneyverse_app 권한으로 임의 관리자 UUID를 전달하는 부정시험, 역할 위장 위험 평가, 신뢰된 주체 결속 설계 승인 또는 잔여 백엔드 신뢰 경계의 명시적 수용이 필요하다. 앱 테이블 직접 권한 확대 금지, CSRF/비공개 엣지 유지.
2. **변경 없는 연결 요청에도 불변 영수증이 필요하다.** v1672의 이미 연결된 관계에 대한 신규 키 200 응답에 영수증 보존 조건이 모호하다. 연결 해제 후 같은 키를 재시도하면 뜻하지 않게 재연결될 수 있다. 최초 승인된 연결·해제 요청은 변경 없음까지 포함해 원래 HTTP 결과·선택적 NULL event_id를 불변 영수증으로 기록한다. 재실행은 매번 현재 인증 및 동일 키·정규화 요청 다이제스트를 확인하고 역사적 결과(replayed=true)만 반환한다. 다른 내용으로 같은 키를 사용하면 409, 재실행 감사 이벤트 추가 금지.
3. **연결에도 리비전 선행조건이 필요하다.** 기존 POST에는 pair revision 검사가 없어 오래된 관리자 화면에서 해제된 관계를 다시 연결할 수 있다. 양쪽 변경 모두 강한 pair revision 검사를 요구한다. 처음 없는 관계는 revision 0, 최초 연결 1, 해제 시 증가, 재연결 시 다시 증가한다. CAS/재실행 보호 기간 동안 tombstone을 유지하고 리비전은 초기화하지 않는다. 오래된 요청은 412; 이미 연결된 관계의 신규 키 무변경 응답에도 영수증을 남기며 리비전/이벤트는 증가시키지 않는다.
4. **DELETE JSON 본문 의존을 제거한다.** v1672 DELETE 본문을 대체해 POST·DELETE 모두 Idempotency-Key: UUID 및 If-Match: 강한 따옴표형 pair revision 헤더를 요구한다. POST 본문은 {relatedThreadId}만, DELETE는 경로로 대상 식별하고 본문 없음. 선행조건 누락 428, 오래됨 412, 동일 키 다른 작업·쌍·리비전 409. ETag와 정확한 정수 리비전 문자열 반환. Nest/Next BFF/프록시에서 헤더 전달 시험, 약한 ETag·알 수 없는 필드·잘못된 UUID·정수 범위 초과 거부, 관리자 전용·쓰기 CSRF 유지.
5. **회원 소유권·탈퇴·역할 회수 일관성.** 마이그레이션 196의 support_threads.user_id 및 support_messages.sender_user_id 외래키에는 ON DELETE CASCADE가 없다. 새 관계 테이블만 연쇄 삭제해도 회원 탈퇴가 안전해지는 것은 아니다. 보존 의무/법적 보류, 메시지→관계→영수증→감사→회원 삭제 순서와 필요한 가명화·최소 보존을 검증한다. support_threads.user_id의 무단 변경을 금지하거나 관계를 같은 트랜잭션에서 해제·감사한다. 모든 조회/쓰기에서 두 문의의 현재 동일 회원 소유를 확인한다. 관리자 역할 회수와 관계 변경은 v1670의 공통 잠금·직렬화 규칙을 사용한다.
6. **후보 검색은 전체 목록이 아니다.** 기존 인덱스 support_threads_user_recent_idx는 (user_id,last_message_at DESC,id DESC)이고 관계 테이블·접두어 인덱스는 없다. 최근 20건만 표시하면 오래된 문의가 누락될 수 있다. scope=RECENT_20, 21번째 행을 실제 조회한 경우에만 hasMore=true, 전체 건수/전체 없음 주장 금지. q는 NFC·trim한 3~80자 리터럴 접두어이며 LIKE 특수문자를 이스케이프하고 다른 회원 검색을 금지한다. 동일 회원 10,001건 EXPLAIN으로 성능 확인 후 필요할 때만 회원 범위 인덱스를 검토한다. 상태 변경·정렬 변경에도 HTTP 요청 간 완전한 스냅샷을 주장하지 않는다.

### 구현 가능한 DB/API/화면/보안/운영 조건 (제안, 미실행)

양방향 관계를 정규화한 low_id=min(UUID), high_id=max(UUID), CHECK(low_id<high_id), PRIMARY KEY(low_id,high_id), active, revision BIGINT>=1, updated_at을 사용한다. CAS/재실행 보호에 필요한 tombstone은 임의 삭제 금지. (actor_id,idempotency_key) 유일 영수증의 HMAC은 작업·정렬된 쌍·선행 리비전·행위자를 결속하며 원래 상태 코드/리비전과 nullable event_id를 불변 기록한다. 본문·연락처 저장 금지, 키는 DB 밖에서 관리·검증된 기간에 따라 회전, 영구 보존을 근거 없이 주장하지 않는다.

한 트랜잭션에서 Nest 세션·최근 관리자 인증·CSRF 검증 → DB 역할 회수와 공통 잠금으로 역할 재확인 → 두 support_threads를 UUID 오름차순 잠금 → 존재·소유권·리비전 확인 → 관계/tombstone 잠금 → 멱등 영수증 확인·고유키 직렬화 → 신규 연결 시 **양 끝점 각각 최대 20개**를 잠금 상태에서 검사 → 관계·감사·영수증 원자 기록. 재실행은 현재 인증 후 과거 결과만 반환하며 현재 관계 상태를 변경하지 않는다. 감사 실패 시 전체 롤백, 상한 초과는 409 LIMIT_REACHED. 금융 원장·WLD·아이템·메시지·문의 상태·담당자·알림 변경 없음.

관리자 /admin/support?thread=<UUID>의 **관련 문의**에서 기존 문의 연결·보기·연결 해제(확인) 제공. 412 발생 시 새로고침 안내, 역사적 재실행 배지, 저장 중 버튼 비활성화, LOADING/EMPTY/PARTIAL/ERROR/FORBIDDEN 구분. 최근 20건을 전체로 표시하지 않는다. 성공·오류 모두 private/no-store/noindex, 사이트맵 제외, 회원 Android 정보 노출 금지, 320px·WCAG 2.2 AA 키보드/초점/상태 알림. 관리자 KPI는 20명 이상 집계만 사용하고 외부 분석에 UUID·제목 전송 금지; 생성 건수·CAS 충돌·재실행 정확성·p95·권한 누출 0을 측정. 행위자·쌍별 속도 제한, UUID 열거 방지. 기능 스위치 support_related_cases_v1 기본 OFF; 공식 Test 정확 실행 이미지 SHA·인증 E2E·독립 승인 후 운영 승격, 롤백은 스위치 OFF(역마이그레이션 금지), tombstone/영수증 보존, 독립 복원 및 금융 변화 0 증명.

**제안 수용시험(미실행):** PostgreSQL17 신규/업그레이드, 회원 혼합 합성 문의 10,001건, 역순 연결 동시성 100, 20개 상한 경합 100, 무변경→해제→같은 키 재실행 100, 해제→재연결→오래된 If-Match 100, 역할 회수/임의 actor 위장 100, 소유권 변경/탈퇴 경합 100, DELETE 프록시 헤더 보존 100, 회원 Android/BOLA 차단 100, 320px/스크린리더 50. 모든 시험에서 영수증·감사 원자성과 금융 변경 없음 확인.

### P0/P1 개발 백로그·QA·외부 근거 게이트

**P0 4건:** OPS1674-01 실행 이미지/엣지 SHA·롤백·외부 독립 복원 증명, miniPC 루트 디스크 **01:10 KST 사용률 95%, 여유 5.6GB**를 타 작업 데이터 삭제 없이 완화(#1170); SEC1674-02 운영/Test 앱 TRUNCATE/UPDATE/DELETE 권한·체크섬 불일치 5건(#993) 재검증 및 임의 actor SQL 호출·역할 회수 보안 검토; FIN1674-03 국고/Mint/NPS/SWF 자금 출처와 금융 변경 0 증명; REL1674-04 운영 다국어 500·운영모드 테스트·Test DB 불일치 해결, 정확 SHA 인증 E2E/Android·독립 복원·승인. **P1 6건:** LINK1674-05 DB 정규화 쌍/tombstone/20개 상한/권한 부정시험; LINK1674-06 Nest/Next 멱등 무변경 영수증·CAS 헤더; LINK1674-07 관리자 UI 최근20 표시·412/재실행·접근성; LINK1674-08 Android 회원 차단·세션 결속; LINK1674-09 탈퇴·감사/KPI·SEO 엣지; LINK1674-10 격리 PG 10,001건·경합·프록시 회귀·스위치 OFF 롤백. 개발 예약에서 별도 브랜치, 공식 Test exact-SHA 게이트 및 승인된 운영 승격만 수행한다.

**개발 DB 신규 읽기 전용 확인:** PostgreSQL 17.11 woldeok_moneyverse_dev의 문의 3건·메시지 6건, support_related_cases 테이블 없음, moneyverse_app의 account_balances UPDATE 유효 권한 TRUE. 개발 환경 증거이며 운영 권한 측정값이 아니다.

**최신 QA:** v1476 2026-11-03 00:38 KST FAILED/P0_PRODUCTION_HOLD (/srv/moneyverse-data/tasks/Moneyverse-QA-v2026.11.03.1476-end.md): 운영 다국어 HTTP500 16/28, Test 0/28, Test 후보 #2545 Treasury CI 13건 실패, 공식 인증 exact-main Test E2E와 외부 독립 복원 BLOCKED. QA 기준 main은 과거 9cade11a...이며 새 main f5c3fbed...의 승인 근거가 아니다. 01:12 KST 공개 버전 API: Test 0c70a114da5f4cc5374bc4b80e0403a044f8546f, Production 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b. 공개 ID는 실제 이미지 다이제스트 증거가 아니다. **Production RELEASE HOLD**.

**외부 독립 레퍼런스:** 신규 실제 확보·검증·중복 제거·분류 승인 **0건**, 누적 승인 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 합성 시험 데이터는 외부 독립 근거로 계산하지 않는다. 기획에서 런타임·DB·WLD·아이템·금융 원장·Test·Production·예약 설정 변경 금지.
