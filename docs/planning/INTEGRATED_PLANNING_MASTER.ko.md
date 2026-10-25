# 월덕 머니버스 — 통합 기획 마스터
- **v1302 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1384 (stacked on unmerged #1379; documentation only, DRAFT / RELEASE HOLD).

## v2026.10.26.1302 — F675-132 로그인 세션 별칭 API·세션 철회 경합·신뢰 경계 보완 (기능 보완 / 초안 / 운영 보류)
- **회차:** 이전 기능 추가 v1300 → 현재 기능 보완 v1302 → 다음 기능 추가 v1304(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 재검증. 선행 Draft #1379 미병합. 이번 절은 v1300 제안 중 충돌하는 API 세부사항을 대체하며 과거 절은 이력으로 보존한다. 런타임·DB·회원·WLD·원장·Test·Production 변경 없음.
- **실제 코드 근거:** Migration 213의 `account_active_sessions(uuid,uuid)`는 7열 `RETURNS TABLE`이며 `device_label`은 user-agent 추정값이다. PostgreSQL에서 기존 함수의 반환 열 구조는 `CREATE OR REPLACE FUNCTION`으로 바꿀 수 없다. NestJS 저장소는 기존 7열을 매핑하고, Next.js 보안 화면은 `deviceLabel`로 모바일 아이콘을 추정하며 `apiOrNull` 실패를 빈 세션 목록으로 바꾼다. 세션 단일·전체 철회는 `auth_sessions` 직접 UPDATE이며 새 별칭과의 공통 잠금 순서는 검증되지 않았다. 앱 역할은 이미 `auth_sessions` UPDATE 권한이 있으므로 SECDEF 독점 경계나 `p_actor` UUID만으로 DB 인증을 주장할 수 없다.
- **화면과 진실성:** `/account/security`의 서버 제공 현재 세션/관리자 배지와 원래 추정 기기 종류·아이콘은 `customLabel`과 분리한다. 회원 별칭은 기기 신원 인증이 아니라는 안내를 표시하며 별칭 문자열로 하드웨어나 관리자 권한을 추정하지 않는다. 기존 로그아웃·재인증 동작 유지. VERIFIED_EMPTY(정상 조회 0건), SOURCE_UNAVAILABLE(서버 오류), REAUTH_REQUIRED, EDITING, SAVING, CONFIRMED, UNCONFIRMED_TIMEOUT, VERSION_CONFLICT, REVOKED, OFFLINE, ACCOUNT_SWITCHED를 구분한다. 조회 실패를 ‘기기 없음’으로 표시하지 않는다.
- **하위호환 조회:** Migration 213을 변경하거나 반환 형식을 덮어쓰지 않는다. 기존 7열 순서를 유지하면서 `custom_label`, `label_version`, `label_updated_at`를 추가하는 새 `account_active_sessions_v2(uuid,uuid)` 또는 동일 수준의 본인 제한 보조 함수를 별도 추가하고 v1을 롤백용으로 보존한다. 기존 `GET /api/v1/account/security/sessions`에는 nullable `customLabel`, `labelVersion`, `labelUpdatedAt`만 추가하고 정렬·배지·철회 응답은 유지한다. 개인 응답 no-store. 새 테이블 앱 직접 DML 권한 금지, 격리 PostgreSQL에서 EXECUTE/PUBLIC 및 실제 세션-행위자 결합 검증. 서비스가 전달한 `p_user` UUID 자체는 DB 수준 소유권 증명이 아니다.
- **변경 요청 전송 계약:** v1300의 DELETE JSON body는 프록시·앱 호환성이 불안정하므로 `PUT /api/v1/account/security/sessions/:id/label`은 JSON `{label}`, 같은 경로의 `DELETE`는 **본문 없음**으로 한다. 둘 다 `If-Match: "label-vN"`, `Idempotency-Key: UUID` 헤더 사용. 초기 버전 0 명시. 조건 누락 428, 오래된 버전 412, 동일 요청키에 다른 정규화 payload 409, 타인/미존재 404, 소유 확인된 만료·철회 410, 제한 429, 저장소 장애 503. 커밋 후에만 새 ETag·labelVersion·confirmed:true 반환. 타임아웃은 미확인으로 표시하고 재조회한다. 기존 v1300 JSON expectedVersion/requestId 및 일반 409 버전 충돌 제안보다 우선한다. Next.js BFF/Android app-api의 헤더·본문 없는 DELETE 전달을 검증한다.
- **입력·영수증:** 서버 NFC 정규화·공백 제거, 1~40 사용자 인식 글자와 UTF-8 160바이트 이내, 제어·양방향 오버라이드·영폭 위장·위험 마크업 거부, 텍스트 이스케이프. 행위자·대상 세션·HTTP 동사·정규화 별칭 또는 RESET·예상 버전·계약 버전을 포함한 payload digest로 재시도 식별; 원문 별칭 로그 금지. Reset은 NULL 묘비와 증가 버전을 남기며 최초 미생성 상태만 버전 0. 회원별 요청 UUID 고유·24시간 보존. 같은 요청 재실행도 현재 세션·동의·재인증·소유권·활성 대상 재검증 후 확정 응답, 다른 payload면 409. 영수증 만료가 별칭 버전을 초기화해서는 안 되며 계정 전환 재생을 차단한다.
- **트랜잭션·철회 경합:** 한 트랜잭션에서 대상 `auth_sessions` 행을 잠근 뒤 소유자·철회·만료 및 현재 행위자 세션/재인증을 다시 확인하고 별칭 버전·영수증·감사 메타데이터를 원자적으로 기록한다. 기존 단일·전체 철회 UPDATE와 행 잠금은 경합하지만 전체 UPDATE의 잠금 순서는 보장되지 않으므로 ‘데드락 없음’ 주장 금지. 별도 개발 브랜치에서 잠금 순서를 조율하고 SQLSTATE 40P01/40001에는 동일 요청키로 제한된 재시도, 소진 시 503/409 처리 및 거짓 성공 방지. 철회가 먼저면 저장 거부, 저장 후 철회면 다음 GET에서 세션 비표시. 별칭 수정으로 세션 만료 연장·철회 취소 금지. 감사 로그에는 별칭 원문 미포함.
- **DB·보존:** `account_session_label_states`의 session_id UUID PK/auth_sessions FK ON DELETE CASCADE, user_id UUID FK users ON DELETE CASCADE, nullable label, 증가 BIGINT version, updated_at. Reset은 NULL 묘비 보존. (user_id,request_id) 고유 영수증과 24시간 정리. 실제 세션 DELETE 때만 FK CASCADE이며 `revoked_at` UPDATE만으로는 삭제되지 않으므로 철회·만료 데이터의 별도 보존기간·정리·계정 삭제 검증 필요. PK 인덱스 우선, 추가 인덱스는 EXPLAIN 근거. 앱 직접 테이블 권한 금지, 기존 auth_sessions UPDATE 권한 문제는 P0 별도 해결.
- **관리·보안·SEO·모바일·접근성·KPI:** 관리자·로그·분석·URL·구조화 데이터에 회원 별칭 금지, k≥20 집계만 허용. 회원당 시간당 승인 변경 10건, IP/세션 남용 제한. noindex/nofollow/no-store. 기존 서버 렌더링 보안 화면에 키보드 조작 가능한 별칭 대화상자, 포커스 복원, 44px 터치, 320px/200% 확대, 스크린리더 상태를 적용한다. Android app-api에서 If-Match/Idempotency-Key/ETag/412/428/본문 없는 DELETE/CSRF/재인증 동등성 확보. 확정 영수증만 KPI로 계산하고 버전 충돌·철회 경합·404/410·429·503·지연을 비식별 집계한다.
- **P0:** ENV1302-01 루트 100%/약 786MiB, 다른 작업 보존·격리 복원; SEC1302-02 앱 235/241 광범위 DML·PUBLIC 은행 함수 3개·행위자 결합; REL1302-03 QA v1285 FAILED/HOLD(프론트 1,397 통과/6 실패, 운영 High 2, 전체 Critical 2/High 10, 봇 Critical 1/High 5, Migration 266 이력 차이, 정확 SHA 인증 Test·복원 미증명); AUTH1302-04 허위 빈 목록·기기 신원 오인·철회 후 성공 방지.
- **P1:** AUTH1302-05 v2 함수·묘비·권한, AUTH1302-06 행 잠금·CAS·영수증·데드락 재시도, AUTH1302-07 PUT/DELETE 헤더·오류 계약, AUTH1302-08 Next.js·Android·접근성·계정 전환, AUTH1302-09 개인정보·관리·SEO·KPI, AUTH1302-10 격리 PG 동시 변경 100건·타 회원 100건·철회 경합·DELETE 프록시·v1 롤백·Unicode/TTL·412/428·정확 SHA 회귀.
- **백로그 ID:** ENV1302-01 SEC1302-02 REL1302-03 AUTH1302-04 AUTH1302-05 AUTH1302-06 AUTH1302-07 AUTH1302-08 AUTH1302-09 AUTH1302-10.
- **승격·근거:** `account_session_nicknames_v1` 기본 OFF, 추가형 DB 변경과 실제 PG 권한·반환형 검증, 정확 SHA 공식 CI 및 인증 Test 웹/Android/보안/금융 E2E, 독립 백업 복원, 보안 감사, 승인 GitOps 1%→10%→100%, 기능 OFF 롤백 필요. Migration 213/적용된 266을 재작성하지 않는다. 외부 독립 근거 신규 중복제거 승인 0건, 누적 UNKNOWN / 10,000 → BLOCKED / IN PROGRESS. DRAFT / RELEASE HOLD.

- **v1300 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1379 (선행 #1371 미병합, 문서만 변경, 운영 승격 보류).
## v2026.10.26.1300 — F675-132 회원 전용 로그인 세션 별칭 (기능 추가 / DRAFT / RELEASE HOLD)
- **회차:** 이전 기능 보완 v1298 → 현재 기능 추가 v1300 → 다음 기능 보완 v1302(잠정). 최신 원격 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 재확인. 선행 미병합 기획 Draft #1371 기반 문서만 변경, 개발 A/B/C·Gemini·QA 작업과 분리. 개발 인계: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1378.

### 실제 코드 근거·목표·제외 범위
- **확인:** `/account/security`에는 이미 로그인 세션 목록·보안 이벤트가 있으며, NestJS `GET /api/v1/account/security/sessions` 및 CSRF·재인증을 요구하는 기존 세션 종료 API가 존재한다. Migration 213의 `account_active_sessions`는 사용자 에이전트 문자열로 Android/Windows 등의 **추정** 기기명을 만든다. Migration 214는 실제 회원 보안 이벤트를 최근 20건(함수 최대 50건) 조회한다. 확인한 main 코드에서는 회원이 기기명을 직접 저장·수정하는 별칭 API와 DB를 발견하지 못했다. 실제 운영 장애가 발생했다는 뜻은 아니다.
- **목적·대상:** 여러 브라우저·휴대전화로 접속하는 회원이 세션을 구별할 수 있도록 **자기만 보는 표시용 별칭**을 제공한다. 별칭은 기기 신원·보안 등급·로그인 권한의 검증 근거가 아니다. 화면에 “내가 지정한 이름이며 기기 신원 확인을 뜻하지 않습니다.”를 항상 표시한다.
- **비범위:** 기존 세션 목록·로그아웃·보안 이벤트 중복 구현 금지. IP 위치 추적·지문 채집·기기 인증·패스키·세션 토큰 표시·자동 신뢰·원장/WLD 거래·허위 알림·로그인 이력 복원 없음. 별칭 변경으로 세션 만료·재인증 시각·활동시각이 달라져서는 안 된다.

### 회원 화면·CTA·상태
- **진입:** `/account/security` > 활성 세션 행 > “기기 이름 수정”. 현재 기기·관리자 세션 배지는 서버 필드 그대로 유지하고, 별도 사용자 지정 이름과 기존 추정 기기명을 구별한다. 대화상자에는 편집·글자수·저장·기본 이름으로 초기화·취소 CTA를 제공한다. 초기화는 명시적인 별칭 제거이며 빈 문자열 저장은 허용하지 않는다. 기존 본인 확인 화면을 재사용한다.
- **상태:** INITIAL_LOADING, READY_DEFAULT, READY_CUSTOM, EDITING, REAUTH_REQUIRED, SAVING, SAVED_CONFIRMED, RESET_CONFIRMED, VERSION_CONFLICT(새로고침), SESSION_REVOKED_OR_EXPIRED(410), NOT_OWNED_OR_UNKNOWN(404), CONSENT_REQUIRED, SESSION_EXPIRED, RATE_LIMITED(429), OFFLINE, SOURCE_UNAVAILABLE(503), UNCONFIRMED. 네트워크 응답 유실 시 성공으로 표시하지 않고 본인 세션·버전을 재조회한다. 중복 저장 방지 및 접근성 상태 안내를 적용한다.
- **입력 검증:** NFC 정규화 후 유니코드 공백 양끝 제거, 1~40개 그래핌 클러스터 **및** UTF-8 160바이트 이하; 제어문자·줄바꿈·양방향 문자 조작·제로폭 위장 금지. 클라이언트와 서버의 그래핌 분할 규칙을 맞추되 서버 검증이 최종 기준이다. HTML 문자열로 삽입하지 않고 안전한 텍스트 렌더링을 사용한다. 비슷한 이름이나 동일 별칭은 인증 근거로 사용하지 않는다.

### API·DB·트랜잭션
- **기존 GET 확장:** `GET /api/v1/account/security/sessions`의 기존 필드를 유지하고 `customLabel:null|string`, `labelVersion` 정수 문자열(처음 0), `labelUpdatedAt`을 추가한다. 회원 식별자는 서버 세션에서만 가져오며 `Cache-Control: private, no-store`를 적용한다.
- **신규 PUT/DELETE:** `/api/v1/account/security/sessions/:id/label`에 `{label,expectedVersion,requestId}` 저장 또는 `{expectedVersion,requestId}` 초기화. SessionGuard·AuthenticatedGuard·ConsentGuard·CsrfGuard·ReauthGuard 필수, 대상 활성·본인 소유 검증, 회원당 시간당 성공 변경 10건 제한. 커밋 후에만 `confirmed:true`와 새 버전을 응답한다. 버전 충돌 409, 타인/미존재 404, 본인 만료·철회 410, 입력 오류 400, 제한 429, 저장소 장애 503. 관리자 세션 별칭도 관리자 권한의 근거로 쓰지 않는다.
- **DB 설계안(미적용):** account_session_label_states(session_id UUID PRIMARY KEY REFERENCES auth_sessions(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, label TEXT NULL, version BIGINT NOT NULL CHECK(version>=1), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(label IS NULL OR (char_length(label)>0 AND octet_length(label)<=160))). label=NULL은 별칭 초기화 후에도 버전을 유지하는 revision tombstone이다. 최초 저장 전 행이 없을 때만 버전 0, 저장·초기화 때마다 버전 증가. session_id PK 조인 우선, 실제 EXPLAIN 필요 시 (user_id,updated_at DESC,session_id) 인덱스 추가. account_session_label_requests(user_id,request_id,session_id,payload_hash,response_version,outcome,created_at, PRIMARY KEY(user_id,request_id))는 24시간 후 정리하고 원본 토큰·IP·UA·이메일은 저장하지 않는다. 탈퇴 시 연쇄 삭제, 만료·철회 세션 정리는 별도 보존기간 기준.
- **원자성:** 권한·재인증·동의·기능 플래그를 먼저 확인하고 현재 세션→대상 세션→상태/리비전→멱등 영수증 순서로 잠근다. 잠금 후 만료·철회를 다시 확인한다. 첫 저장은 버전 1, 이후 저장과 초기화는 모두 버전 증가(label=NULL tombstone 유지)로 ABA를 차단한다. 동일 회원·요청 UUID·payload는 현재 권한 재검증 후 커밋 결과만 재전달하고 payload 불일치는 409. 상태·버전·영수증·감사 이벤트가 한 트랜잭션에서 커밋되며 실패 시 모두 롤백. 응답 유실·세션 철회 경쟁에서 거짓 성공을 표시하지 않는다.
- **권한 경계:** 새 SECURITY DEFINER 함수는 schema-qualified SQL, 고정 search_path, PUBLIC EXECUTE 철회, moneyverse_app EXECUTE 최소 부여. 애플리케이션 계정에 신규 테이블 직접 SELECT/INSERT/UPDATE/DELETE를 주지 않는다. 기존 세션 조회 함수만 회원 소유 별칭과 안전하게 조인한다. 사용자 식별은 인증된 서버 세션에서 유도하며 타 회원 별칭을 응답하지 않는다.

### 운영·보안·접근성·검증
- **관리자:** 개별 회원 별칭·세션 ID는 관리자 통계에 노출하지 않고, 최소 표본 20명 이상 비식별 집계만 제공한다. 보안 감사 이벤트에는 실제 커밋된 변경의 유형·식별자만 남기고 별칭 원문을 기록하지 않는다. 성공하지 않은 변경에 감사 성공 이벤트를 생성하지 않는다.
- **개인정보·악용 방지:** CSRF·최근 재인증·동의·세션 검증, 100건 타 회원 BOLA 테스트, 레이트 리밋, 요청 로그 마스킹, XSS·유니코드 위장 방지, 계정 탈퇴·철회 경쟁 조건, URL/제3자 분석에 별칭 금지. 404 응답은 타인 세션 존재를 유추하지 못하게 한다.
- **SEO/모바일/a11y:** `/account/security` noindex/nofollow, no-store, 공개 구조화 데이터 없음. Android app-api는 동일 회원 전용 GET/PUT/DELETE, 인증·CSRF·재인증·오류를 유지하고 OS 기기 인증과 혼동하지 않는다. WCAG 2.2 AA, 키보드 대화상자·포커스 복귀·스크린리더 안내·44px 터치·320px·200% 확대·모션 축소.
- **분석/KPI:** 실제 서버 커밋된 별칭 변경 수/활성 세션 화면을 본 적격 회원 수, 7·30일 채택률, 409 충돌률, 404/410 오류율, 접근성 완료율, 지연시간을 비식별 측정한다. 버튼 클릭이나 응답 유실은 성공으로 집계하지 않는다.
- **회귀·배포·롤백:** 같은 세션 동시 CAS 100건, 타 회원 100건, 세션 만료·철회·현재/관리자 세션, 40그래핌·160바이트·NFC·양방향 문자·XSS, 요청 UUID 재사용·리비전 ABA·계정 삭제·Android·키보드·SEO 검증. 실제 격리 PostgreSQL에서 app 직접 DML 거부/함수 EXECUTE/롤백 검증. `account_session_nicknames_v1` 기본 OFF; 별도 개발 브랜치와 정확 SHA 공식 CI, 인증된 Test E2E·금융 회귀·격리 복원·보안감사·승인된 GitOps 이후에만 승격. 문제 발생 시 기능 OFF로 기존 추정 기기명 표시, 기존 로그아웃 기능 유지. 기획 회차에서 런타임·DB·운영 환경 변경 금지.

### P0/P1 개발 백로그·게이트
- **P0 ENV1300-01:** 루트 99%/약 1.0GiB, 다른 작업자 Worktree 보존하며 용량·백업 복원·DB 격리 해결.
- **P0 SEC1300-02:** 개발 DB 앱 계정 235/241 테이블 UPDATE+DELETE, PUBLIC 은행 함수 3개, 본인 소유/CSRF/재인증/DB 권한 음성 검증.
- **P0 REL1300-03:** QA v1284 프론트 1,397 통과/6 실패, 운영 보안감사 High 2, 전체 Critical 2/High 10, Migration 266 이력 불일치, 정확 SHA Test·복원·GitOps HOLD.
- **P0 AUTH1300-04:** 기존 UA 기반 추정 기기명·기존 세션 철회가 사용자 지정 별칭과 혼동되지 않도록 진실성 검증.
- **P1 AUTH1300-05:** 스키마·단조 리비전 tombstone·인덱스·SECDEF 소유권.
- **P1 AUTH1300-06:** 트랜잭션 잠금·CAS·멱등성·24시간 정리·철회 경합.
- **P1 AUTH1300-07:** NestJS GET 확장·PUT/DELETE·입력/오류/속도 제한.
- **P1 AUTH1300-08:** Next.js 수정·초기화 UI, Android 동등성, 서버 확인 상태·접근성.
- **P1 AUTH1300-09:** 개인정보·탈퇴·관리자 최소 20명 통계·SEO·KPI.
- **P1 AUTH1300-10:** 격리 DB 100 동시/100 타인·유니코드·회귀·단계 배포/기능 OFF 롤백.
- **Backlog IDs / 백로그 식별자:** ENV1300-01 SEC1300-02 REL1300-03 AUTH1300-04 AUTH1300-05 AUTH1300-06 AUTH1300-07 AUTH1300-08 AUTH1300-09 AUTH1300-10.
- **외부 독립 근거 10,000건:** 이번 회차 중복 제거·최종 승인 신규 **0건**, 누적 승인 **UNKNOWN / 10,000**, **BLOCKED / IN PROGRESS**. 이름만 언급된 표준·웹사이트를 승인 건수에 포함하지 않는다. 최신 QA v1284 **FAILED / RELEASE HOLD**. 문서만 변경, 운영 승격 금지.

## v2026.10.26.1298 — F675-131 알림 보관함 CSV 내보내기 무결성 보완 (기능 보완 / DRAFT / RELEASE HOLD)
- **v1298 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1371; **개발 인계:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1363; DRAFT / RELEASE HOLD.

### 확인 근거·범위·회차
- **회차:** 이전 Feature Addition v1296 → 현재 Feature Improvement v1298 → 다음 Feature Addition v1300(잠정). 원격 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 및 AGENTS.md·README.md·영문 정본 PROJECT_PLAN.md·한국어 대조를 재확인. 미병합 기획 Draft #1364 위에 문서만 적층하며 Gemini/개발 A/B/C/QA 브랜치·코드를 수정하지 않는다.
- **실제 main 근거:** `backend/src/notification/notification.service.ts`는 현재 `public.in_app_notifications`를 회원 조건 `user_id=$1`, `created_at DESC LIMIT/OFFSET`로 직접 조회하고 `dedupe_key`도 반환한다. `notification.dto.ts`는 `unreadOnly`에 `@Type(() => Boolean)`을 사용한다. 기존 읽음/모두 읽음 SQL 함수는 내보내기와 별개이며 **알림 CSV 내보내기 API는 main에 미구현**. 이는 코드상 위험이지 실제 운영 사고 증거가 아니다. 기존 페이징/불리언 수정은 개발 B #1356 담당이므로 중복 구현하지 않는다.
- **최신 QA v1283 원시자료(2026-10-26 약 04:25 KST):** 프론트 1,397 통과/6 실패, 백엔드 1,313 통과/398 건너뜀, DB 15 통과/3 건너뜀. 타입검사·린트·빌드는 통과했지만 전체 보안감사 Critical 2/High 10, 운영 감사 High 2; 인증된 정확 SHA Test E2E·격리 백업 복원 미입증. 루트 99%·여유 약 1.2GiB, 데이터 볼륨 약 56GiB. 운영 승격 BLOCKED.

### 사용자 계약 및 보안·정합성 결정
- **목적/대상:** 로그인·동의를 완료한 회원이 **실제로 DB에 저장된 본인 알림**만 검색·CSV 다운로드한다. 모의 UI 알림, 브라우저 시뮬레이션, 지급/원장 증빙 및 과거 전달 성공 보장은 제외. `/account/notifications/archive`에서 검색→CSV 내보내기→검증 완료; Android app-api 동일 계약. LOADING, EMPTY_VERIFIED, EXPORTING, VERIFIED, SOURCE_UNAVAILABLE, LIMIT_EXCEEDED, CONSENT_REQUIRED, SESSION_EXPIRED, UNCONFIRMED_TRANSFER 상태를 명시하며 응답 유실 시 성공 표시 금지.
- **부분 파일 금지:** 5,000행·UTF-8 출력 2MiB·30초 상한을 **HTTP 200 헤더나 본문 전송 전에** 확인한다. 제한된 크기의 완성 버퍼(또는 비공개 제한 임시파일)를 구성한 후 행 수·인코딩 바이트 수·마감시간을 검사하고, 초과 시 413(행/크기), 소스 장애 503, 시간초과 명시 오류를 반환한다. 일부 CSV를 스트리밍한 뒤 413으로 바꾸는 방식과 묵시적 잘라내기는 금지. 실제 0건이면 헤더만 포함하고 rowCount=0.
- **정확 바이트:** 열은 `id,category,title,body,link,is_read,read_at_utc,created_at_utc` 고정. `created_at DESC,id DESC` 정렬, **BOM 없는 UTF-8**, CRLF 레코드 구분, RFC 4180 따옴표 두 배 이스케이프·전체 필드 인용, UTC ISO-8601, NULL 규칙 명시. 파일명은 고정 ASCII. `text/csv; charset=utf-8`, `Content-Disposition: attachment`, `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`; 최종 전송 바이트의 SHA-256, byteLength/rowCount/schemaVersion/sanitizationVersion 메타데이터. 사용자 입력 파일명 및 공개 CDN 캐시 금지.
- **스프레드시트 수식 삽입:** 제목·본문·분류·링크의 쉼표·따옴표·CR/LF·탭·선행 공백/제로폭/BOM·전각 수식문자까지 공격 입력으로 취급. **RFC 직렬화 이전**에 버전이 있는 셀 단위 방어 변환을 적용하고 Excel 등 지원 뷰어에서 저장·재열기 회귀 검증. OWASP는 모든 스프레드시트에 통용되는 완전한 CSV 방어가 없고 재저장 시 수식이 재활성화될 수 있다고 명시한다. 따라서 CSV는 사람이 읽기 위한 **변환된 출력**으로 고지하고 DB 원문과 바이트 동일하다고 주장하지 않는다. transformedCellCount 표시. 무손실 기계용 포맷은 별도 승인 후 설계. SHA-256은 제공된 파일 바이트의 비교값일 뿐 DB 진실을 독립 인증하는 전자서명이 아니다.
- **스냅샷:** 하나의 PostgreSQL 전용 연결에서 `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY`로 회원 권한·필터·개수·데이터·스냅샷 시각을 일관되게 확인한 뒤 전송 전에 커밋/롤백한다. `snapshotCutoff`만으로 여러 HTTP 페이지의 MVCC 스냅샷을 보증할 수 없다. 읽음 상태·보존기간·삭제가 변할 수 있는 목록은 BEST_EFFORT로 표시하고, 완성된 단일 트랜잭션 CSV에만 스냅샷 일관성을 주장한다.
- **인증/개인정보:** 회원 식별자는 검증된 세션에서만 획득, 동의·CSRF 검사, 바이트 전송 직전 세션 epoch·동의 재검증. 로그아웃·계정 전환 시 다운로드 취소 및 캐시 삭제. `moneyverse_app`의 직접 테이블 SELECT/DML 확대 금지, 고정 search_path·PUBLIC EXECUTE 회수·역할 음성 테스트를 갖춘 좁은 SECURITY DEFINER 조회 함수 설계. 임의 UUID 인자만으로 DB 차원의 사용자 인증이 되는 것은 아니므로 호출자 위조 위협도 검토. 회원당 시간당 3회/IP 제한, 본문·제목·링크·dedupe_key 로그/분석/관리자 노출 금지. 안전한 동일 출처 링크만 내보내고 나머지는 빈 값. 탈퇴·병합·보존 만료 시 커서·다운로드 권한 무효화.
- **API/DB:** NestJS `GET /api/v1/notifications/archive`, CSRF 보호 `POST /api/v1/notifications/archive/export`를 Next.js BFF로 연결하고 Android 계약 동등성 유지. UTC 시작 포함·끝 제외(최대 90일), 실제 소스 분류 allowlist, 읽음 3상태, owner/session/filter/version/만료 HMAC 커서. 클라이언트 user_id 입력 금지. `(user_id,created_at DESC,id DESC)` 인덱스는 격리 EXPLAIN과 순방향 마이그레이션 검토 후 추가. 과거 이벤트·전달 성공을 임의 생성/역산하지 않는다.
- **관리/SEO/접근성/KPI:** 개인 화면 no-store·noindex·사이트맵 제외, 320px·44px 터치·키보드·스크린리더·WCAG 2.2 AA. 관리자는 k>=20 비식별 시도/실패/크기·지연 집계만 조회. 버튼 클릭은 다운로드 완료 KPI가 아니며 전체 응답·선택적 클라이언트 해시 검증 후만 완료 집계. 허위 성공=0, 타 회원 데이터 누출=0을 강제 게이트로 둔다.
- **검증/배포:** 격리 실 PostgreSQL에서 동시 요청 100건·타 회원 100건·동일 시각 UUID 10,001건·5,001행/2MiB+1·30초·잘못된 UTC·동의/세션 만료·0행·유니코드/CRLF/수식 공격·스프레드시트 재저장·해시 재계산·네트워크 중단·413 부분 바이트 0·Android·DB 권한 회귀를 검증한다. 기능 스위치 `notification_archive_export_v1` 기본 OFF, 개발 별도 브랜치/정확 SHA 공식 CI·Test E2E/보안 감사/복원/GitOps 승인 후 1%→10%→100% 단계 배포. OFF 롤백 시 기존 알림과 DB 원본 보존. 기획은 런타임·DB를 변경하지 않는다.

### P0/P1 개발 인계
- **P0 ENV1298-01:** 루트 99%·1.2GiB, 타 작업물 보호, 승인된 오래된 파일만 분류·이동, 격리 복원 및 환경 분리.
- **P0 SEC1298-02:** 최소권한·SECDEF 호출자 신원·BOLA/동의/CSRF·계정 전환 차단·PII 비노출.
- **P0 REL1298-03:** QA v1283 프론트 6실패·전체 Critical 2/High 10·운영 High 2, migration 266/280·정확 SHA Test·복원·GitOps HOLD.
- **P0 ARC1298-04:** 모의 알림·보상 증빙 CSV 배제, 전체 검증 전 성공 금지, 413에서 부분 200 바이트 금지.
- **P1 ARC1298-05:** 실제 분류·읽음·기간·링크 검증, 날짜/NULL/CSV 스키마 확정.
- **P1 ARC1298-06:** 단일 연결 REPEATABLE READ, 여러 페이지 BEST_EFFORT 정직 표시, UUID 동률 커서.
- **P1 ARC1298-07:** 제한 버퍼·헤더 전 413·정확 바이트 SHA·변환 셀 버전/수식 방어.
- **P1 ARC1298-08:** NestJS·Next.js·Android 계약, 세션 epoch, 접근 가능한 개인 다운로드 상태.
- **P1 ARC1298-09:** k>=20 관리자 통계, 악용 제한, noindex/no-store, 완료 KPI·개인정보 생명주기.
- **P1 ARC1298-10:** 격리 실DB 경합/BOLA/수식 삽입/크기·중단 회귀, 정확 SHA Test, 스위치 OFF 롤백.
- **백로그 ID:** ENV1298-01 SEC1298-02 REL1298-03 ARC1298-04 ARC1298-05 ARC1298-06 ARC1298-07 ARC1298-08 ARC1298-09 ARC1298-10.
- **외부 독립 근거 10,000건 게이트:** 이번 신규 승인·중복 제거 0건, 누적 실검증 UNKNOWN/10,000 → BLOCKED / IN PROGRESS. RFC 4180·OWASP CSV Injection은 후보 1차 출처일 뿐 승인 수량에 포함하지 않는다.
- **상태:** PARTIAL / DRAFT / RELEASE HOLD. 문서만 수정하며 런타임·마이그레이션·회원 데이터·WLD·원장·Test·Production 변경 없음.

## v2026.10.26.1296 — F675-131 회원 전용 검증형 알림 보관함 검색·CSV 내보내기 (기능 추가 / DRAFT / RELEASE HOLD)

### 실제 근거·목적·대상
- **회차:** 이전 Feature Improvement v1294 → 현재 Feature Addition v1296 → 다음 Feature Improvement v1298(잠정). 최신 main SHA 1c5b84a1c45baafcca83f375a6f99698121e9bb5, AGENTS.md·README.md·영문 정본 PROJECT_PLAN.md·한국어 대조 확인. 미병합 기획 Draft #1359 위에 별도 문서 브랜치로 적층하며 Gemini/개발 A/B/C/QA 작업은 건드리지 않는다.
- **확인된 사실:** main의 NestJS 알림 API는 회원 인증 기반 GET /api/v1/notifications·unread-count 및 CSRF 보호 읽음/전체 읽음 API를 제공한다. NotificationService는 user_id로 제한하지만 created_at DESC + OFFSET 조회다. Next.js /api/notifications는 limit/unreadOnly만 전달한다. 개발 DB public.in_app_notifications는 UUID id·user_id, category/title/body/link/dedupe_key/is_read/read_at/created_at의 10개 컬럼이며 현재 0건이다. (user_id,created_at DESC) 인덱스에는 UUID 순서 보조키가 없다. 이는 기능 공백에 대한 근거이지 운영 사고나 실제 내보낼 알림이 존재한다는 증거가 아니다.
- **사용자 가치:** 로그인·동의 완료 회원이 **DB에 실제 기록된** 본인 앱 내 알림만 기간·분류·읽음 상태로 검색하고, 내용과 SHA-256 무결성을 검증할 수 있는 UTF-8 CSV로 내려받는다. 모의 알림 6건, localStorage 가상 장마감 알림, 보상 수령, WLD·원장 변경, 오프라인 푸시, 과거 보존기간 보장, 확인되지 않은 분류 매핑은 포함하지 않는다. 알림 저장은 브라우저 전달 성공의 증거가 아니다. 개발 B의 미병합 PR #1356(기존 조회 필터·페이지네이션 수정)과 구현 범위를 분리하고 정확 SHA 검토 후 연계한다.

### 화면·CTA·상태·접근성
- 기존 /account/notifications → 신규 비공개 /account/notifications/archive. 검색: UTC 시작 포함/종료 미포함 기간, DB 근거로 확인된 분류, 전체/읽음/안읽음, 초기화, 검색, 더 보기, CSV 내보내기, 재시도, 안전한 동일 출처 알림 열기. 기본 최근 30일 검색(실제 데이터 보존 보장 아님), 선택 기간 최대 90일, 서버 컷오프·표시 시간대 명시.
- SIGN_IN_REQUIRED, CONSENT_REQUIRED, LOADING, EMPTY_VERIFIED, READY, EXPORTING, EXPORT_COMPLETE_VERIFIED, LIMIT_EXCEEDED, SNAPSHOT_EXPIRED, SOURCE_UNAVAILABLE, FORBIDDEN 상태를 분리한다. 타임아웃·해시 불일치 시 성공을 표시하지 않는다. 로그아웃·계정 전환 시 개인 캐시 폐기와 지연 응답 차단.
- 320px 모바일, 최소 44×44px 터치 대상, 키보드 전용 조작, 스크린리더 라벨·오류 후 포커스·과도하지 않은 결과 수 안내, WCAG 2.2 AA·동작 감소 지원. 회원 페이지 noindex, sitemap 제외, private/no-store 및 X-Robots-Tag noindex.

### API·DB·트랜잭션·보안
- NestJS GET /api/v1/notifications/archive?from&to&category&readState&limit&cursor: 기본 50/최대 100건, 회원 ID는 인증 세션에서만 결정, ISO UTC·enum 엄격 검증, 400 잘못된 입력, 401 비인증, 403 동의 미완료, 404 타인 데이터, 429 제한, 503 DB 오류. 응답 items/nextCursor/snapshotCutoff/filterHash. Next.js 동일 출처 비캐시 프록시와 Android app-api 동등 계약. moneyverse_app 직접 테이블 SELECT 권한을 새로 주지 않는다.
- POST /api/v1/notifications/archive/export: CSRF·세션·동의 검사, 회원당 시간당 최대 3회, 한 번의 내보내기 최대 5,000건·UTF-8 2MiB·30초. 초과 시 파일 일부를 보내지 않고 HTTP 413. 응답은 다운로드 헤더, no-store/no-sniff, **실제 바이트의 SHA-256**, rowCount, snapshotCutoff, 필터 지문 포함. CSV 컬럼 id/category/title/body/안전한 link/is_read/read_at_utc/created_at_utc. 내부 dedupe_key·세션 비밀·IP·이메일·타 회원 내용은 제외. RFC 4180 인용·줄바꿈 이스케이프, 선행 공백/제어문자 뒤의 = + - @ 수식 삽입 무력화. 스프레드시트 열기 자체는 무결성 증거가 아니다.
- 승인된 전진 전용 마이그레이션에서 필요할 때 (user_id,created_at DESC,id DESC) 인덱스를 추가하며 분류 복합 인덱스는 격리 EXPLAIN 이후 결정. SECURITY DEFINER 조회 함수는 search_path 고정·본인 검사·최소 EXECUTE 권한. 기존 알림 행은 수정하거나 백필하지 않는다. CSV는 **단일 PostgreSQL 연결의 REPEATABLE READ READ ONLY 트랜잭션**에서 권한·건수·크기·행·해시를 일관되게 검증하고 완전 생성 후에만 응답한다. 읽기 전용 내보내기에 중복 지급 영수증을 만들지 않는다. 재다운로드는 새로운 스냅샷이며 메타데이터 영수증만으로 동일 파일 재생을 약속하지 않는다. 선택적 감사 메타데이터는 회원·필터 지문·건수·해시·시각만 단기 보관하고 원문 CSV는 저장하지 않는다. 바이트 전송 직전 세션·동의를 재확인한다.
- 커서는 회원·세션 epoch·필터 지문·UTC 컷오프·마지막 (created_at,id)·만료·스키마 버전을 HMAC 서명하고 오류/타 회원 재사용은 400/410으로 거부한다. 동일 시각 UUID 보조키로 안정 정렬한다. 단순 컷오프는 여러 HTTP 요청의 MVCC 일관성을 보장하지 않으므로 불변 원본 또는 유효한 서버 스냅샷이 없으면 화면 페이징을 BEST_EFFORT로 명시하고 **단일 트랜잭션 CSV만 COMPLETE**로 표시한다. 읽음 변경과 경합하는 경우도 시험한다.
- 관리자는 k>=20 비식별 내보내기 성공·실패·크기·지연 통계만 조회하며 원문·회원 링크·타인 파일은 볼 수 없다. 회원/IP 속도 제한, 안전 링크 allowlist, 범위/용량/시간 제한, 개인 데이터 없는 분석, 거부 감사 기록 적용.

### KPI·시험·무중단 배포
- 검증된 서버 이벤트만으로 내보내기 시도/해시 검증 완료/413·429·503/빈 결과/p95 지연/재시도율 측정. 클릭을 성공으로 세지 않고 알림 본문은 분석에 수집하지 않는다.
- 격리 PostgreSQL에서 동시 내보내기·읽음 변경 100건, 타 회원 접근 100건, 동일 시각 10,001건 합성 알림, UTC/DST 경계, 세션 교체, 동의 해제, CSV 수식 공격, 5,001건·2MiB 초과, 중단 응답, SHA 재계산, 413 부분 파일 없음, ACL·Android·모바일/키보드/스크린리더·기존 알림 회귀를 검증한다. 합성 데이터는 트랜잭션 롤백. **이번 회차 런타임 시험 미수행.**
- 기능 플래그 notification_archive_export_v1 기본 OFF. 별도 개발 브랜치, 전진 마이그레이션 검토, 정확 후보 SHA 공식 CI·전체 보안 감사·격리 DB 역할 거부 시험·공식 Test 인증 E2E·백업 복원·GitOps 승인 후 1%→10%→100% 순차 배포. 이상 시 플래그 OFF, 계약 호환성 확인 후 앱 라우트 롤백. 자동 운영승격 금지. QA #1317의 프론트 1,404건/운영 감사 PASS는 **미병합 후보**의 결과일 뿐이며 다른 최신 개발 후보는 프론트 6건 실패 및 보안 감사 HOLD. 루트 디스크 99%(약 1.4GiB 여유), 운영 BLOCKED.
- **외부 독립 근거 10,000건 게이트:** RFC 4180·OWASP API Security Top 10·W3C WCAG 2.2는 승인 전 후보일 뿐. 신규 중복 제거·분류·승인 **0건**, 누적 실제 승인 **UNKNOWN / 10,000**으로 BLOCKED / IN PROGRESS. 근거 충족 주장 금지.

### 실행 가능한 P0/P1 백로그
- **P0 ENV1296-01:** 타인 작업물 삭제 없이 루트 99% 용량 확보·환경 분리·격리 복원 증명.
- **P0 SEC1296-02:** 최소권한·본인 BOLA·CSRF·동의·세션 차단·원문 유출 방지.
- **P0 REL1296-03:** 프론트 6건 실패·보안 감사·Migration 266/280·정확 SHA Test·백업 복원·GitOps 보류 해결.
- **P0 ARC1296-04:** 모의 알림과 실제 DB 알림의 구분·허위 성공 차단, 개발 B #1356 코드 중복 변경 금지.
- **P1 ARC1296-05:** 실제 분류 출처·기간/읽음 검색 검증·안전 링크.
- **P1 ARC1296-06:** 회원 UUID 커서·서명·인덱스·일관성 라벨.
- **P1 ARC1296-07:** 단일 트랜잭션 CSV·413 완전 차단·수식 공격 방어·SHA-256.
- **P1 ARC1296-08:** NestJS·Next.js·Android·접근성 동등 구현.
- **P1 ARC1296-09:** 개인정보·제한·관리자 집계·SEO·KPI.
- **P1 ARC1296-10:** 격리 실DB 동시성·ACL·10,001건·회귀·정확 SHA 배포/롤백.
- **백로그 ID:** ENV1296-01 SEC1296-02 REL1296-03 ARC1296-04 ARC1296-05 ARC1296-06 ARC1296-07 ARC1296-08 ARC1296-09 ARC1296-10.
- **판정:** PARTIAL / DRAFT / RELEASE HOLD. 기획 문서만 수정, 런타임 코드·마이그레이션·DB·WLD·원장·Test·Production 변경 없음.

## v2026.10.26.1294 — F675-130 알림 출처·읽음 컷오프·커서 무결성 (기능 보완 / DRAFT / HOLD)
- 이전 추가 v1292 → 현재 보완 v1294 → 다음 추가 v1296. 기존 인증·CSRF 읽음/전체 읽음 API를 재사용하며 새 알림 도착 후의 전체 읽음 오인, unreadOnly=false 파싱, UUID 보조 정렬 및 회원·세션 결합 서명 커서를 개선 대상으로 지정한다. 모의 알림과 localStorage 가상 장마감 알림은 실제 이벤트가 아니다. 개발 DB 알림 0건·분류 출처 미확인, 루트 99%, 외부 근거 신규 승인 0/누적 UNKNOWN, 정확 SHA Test·보안 감사·복원 HOLD. P0 ENV1294-01 SEC1294-02 REL1294-03 NOT1294-04, P1 NOT1294-05 NOT1294-06 NOT1294-07 NOT1294-08 NOT1294-09 NOT1294-10. 문서만 변경, 운영 승격 금지.

- **GitHub v1292:** [기획 Draft PR #1354](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1354) (미병합 #1349 기반); [개발 이슈 #1353](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1353); [서버 용량 #1170 업데이트](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170#issuecomment-6400649178). 문서만 수정, DRAFT / RELEASE HOLD.
## v2026.10.26.1292 — F675-130 회원 검증형 알림 수신 제어·방해금지 시간 (기능 추가 / 기획 초안 / 운영 보류)

### 현행 근거와 목표
- **회차:** 이전 Feature Improvement v1290 → 현재 Feature Addition v1292 → 다음 Feature Improvement v1294(잠정). 최신 main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 재조회, main AGENTS.md·README.md·영문 원본 PROJECT_PLAN.md·한국어 대조 확인. 미병합 Draft #1349 기반 독립 문서 브랜치, Gemini/개발 A/B/C/QA 변경과 격리.
- **실제 소스:** /account/notifications는 목표/NPC용 notifications_enabled 설정만 /api/v1/engagement/preferences에 저장한다. notification-tabs-bar.tsx는 은행 이자·보안 세션 등을 포함한 고정 INITIAL_NOTIFICATIONS 6개를 렌더링하며 읽음 처리를 React 상태에서만 수행한다. stock-alert-push-engine.tsx는 localStorage 계산기 시나리오를 읽어 서버 근거 없는 가상 장마감 브라우저 알림을 지연 발송한다. NestJS NotificationService.listNotifications는 실제 in_app_notifications를 user_id로 제한하지만 created_at DESC + LIMIT/OFFSET으로 조회한다. 이는 코드상 신뢰성 위험이지 운영 사고 발생 증거는 아니다. 별도로 존재하는 정상 알림 모달의 서버 읽음 영수증은 보존한다.
- **사용자 가치:** 로그인·동의 완료 회원이 선택적 *전경 브라우저 알림*의 분류별 수신 및 조용한 시간을 기기 간 동기화하고, 실제 원천이 확인된 본인 알림 이력을 조회한다. 오프라인 푸시·이메일·Discord DM·확정 전달·WLD 보상·실제 시세 알림을 약속하지 않는다. 보안/시스템 알림은 앱 내 기록과 열람이 계속 가능해야 한다.

### 화면·상태·사용자 흐름
- **진입:** 기존 /account/notifications와 종 모양 버튼 → 신규 /account/notifications/preferences, 기존 알림 센터의 실제 분류 필터·더 보기. 설정: IANA 시간대(기본 Asia/Seoul), 조용한 시간 기본 OFF, 시작/종료 HH:mm(같으면 오류), BUSINESS/BANK/SEASON/SPACE 등 실제 DB 원천에서 확인된 선택적 분류 토글. SECURITY/SYSTEM 앱 내 기록은 차단 불가; 화면 라벨과 DB 분류는 대조 후 확정.
- **CTA:** 설정 저장, 기본값 복원, 상태 재확인, 알림 열기, 읽음 처리, 더 보기. 브라우저 권한은 사용자 직접 클릭 시에만 요청하며 기기별로 별도 관리한다. 전경 알림은 명시적 동의+권한 허용 전까지 OFF; 페이지가 닫혀 있으면 전달을 보장하지 않는다. 기존 목표/NPC 토글은 독립적으로 유지한다.
- **상태:** LOADING, REAL_EMPTY, REAL_ITEMS, MORE_AVAILABLE, SAVING, VERIFIED_SAVED, UNCONFIRMED_TIMEOUT, STALE_REVISION, QUIET_ACTIVE, PERMISSION_DEFAULT, PERMISSION_DENIED, BROWSER_UNSUPPORTED, SESSION_EXPIRED, SOURCE_UNAVAILABLE, FEATURE_OFF. 서버 응답 유실 시 성공 알림 금지, 본인 GET 재조회로 확정. 가짜 알림·읽음·배당·WLD 지급 표시 금지.
- **조용한 시간:** 검증된 IANA 시간대 기준 [시작,종료) 반개구간, 자정 넘김 및 DST 공백/중복은 실제 UTC 시각을 현지시각으로 변환하여 판정. 선택적 전경 알림만 조용히 처리하며 DB 알림 기록·미읽음 수는 유지한다. 기간 종료 후 오래된 알림을 한꺼번에 팝업으로 재발송하지 않는다.

### API·DB·트랜잭션
- **조회:** GET /api/v1/notifications/preferences → revision,timezone,quietEnabled,quietStart,quietEnd,categoryOptIns,updatedAt,observedAt. GET /api/v1/notifications/history?category=&cursor=&limit=1..50 → 실제 본인 알림, hasMore,nextCursor,sourceStatus. (created_at DESC,id DESC) 키셋, 회원·세션·필터·만료를 묶은 서명 커서; OFFSET 금지. 분류 레지스트리 검증 전 미확인 분류 거부. Android /app-api/v1 동일 계약, Next.js same-origin BFF, private no-store/noindex.
- **저장:** PUT /api/v1/notifications/preferences는 유효한 로그인·동의·CSRF, If-Match revision, UUID idempotencyKey 필수. IANA 시간대/HH:mm/분류 허용목록 검증. DB 커밋된 receiptId·revision·savedAt·정규화 설정이 있어야 200 성공. 오류 400/422, 401, 404, 409, 429, 503; 이전 영수증 재생은 현재 설정 보장의 근거가 아님.
- **전진형 스키마 제안:** member_notification_delivery_preferences(user_id UUID PK FK users, timezone VARCHAR(64), quiet_enabled BOOL, quiet_start TIME, quiet_end TIME, revision BIGINT CHECK >0, updated_at TIMESTAMPTZ); member_notification_category_optins(user_id UUID,category TEXT 허용목록,enabled BOOL,PK(user_id,category)); member_notification_preference_receipts(id UUID PK,user_id UUID,request_key UUID,payload_sha256 BYTEA,revision BIGINT,result_json JSONB,created_at TIMESTAMPTZ,UNIQUE(user_id,request_key)). 영수증에는 알림 본문·IP·토큰 저장 금지. in_app_notifications(user_id,created_at DESC,id DESC) 인덱스와 EXPLAIN 기반 선택 인덱스. 계정 탈퇴/병합 시 명시적 삭제·무효화 정책 필요.
- **원자성:** 로그인·동의 재검증 → 회원/요청 advisory lock → 요청 해시 재생 검사 → users 행 잠금 → 설정 행 잠금 → revision CAS → 분류 검증 → 설정/토글 저장·revision 증가·불변 영수증 삽입을 단일 트랜잭션으로 처리. SECURITY DEFINER 고정 search_path, PUBLIC EXECUTE 회수, 앱에는 최소 EXECUTE만. 세션 전환 후 지연 응답 무시.
- **진짜 알림:** DB 본인 행만 SECDEF 함수로 읽고 광범위 SELECT 권한을 새로 부여하지 않는다. DB 실제 category 목록 확인 후 UI 분류 연결. 기존 읽음/전체 읽음 영수증과 미읽음 수를 유지한다. 브라우저 알림은 실제 서버 소유 이벤트 ID·선택적 수신 동의·기기별 중복 방지가 모두 확인된 경우에만 발송한다.

### 관리자·보안·접근성·지표·배포
- 회원 간 조회 100회 음성검증(BOLA), 세션/동의/CSRF, 최초 분당 쓰기 5회·읽기 30회, 요청 해시 재사용 차단, 개인정보 분석 로그 제외, 검색엔진 비색인·캐시 금지. 잠금 화면에 민감 금융/보안 내용을 노출하지 않고 사용자 클릭 없는 권한 팝업 금지. 계정 병합/탈퇴는 커서·revision 무효화.
- 관리자는 k>=20 비식별 집계(설정 채택률·원천 실패율)만 조회하며 개별 시간표·알림 본문·기기 식별자는 조회하지 않는다. 공개 SEO 설명은 서비스 내 가상 알림임을 명시하고 확정 수익/푸시를 약속하지 않는다. 모바일 44px 버튼, 키보드·포커스·스크린리더 상태 안내·동작 감소·WCAG 2.2 AA.
- KPI: 서버 검증 설정 저장률, 허위 성공 0, 가짜 알림 0, 타 회원 정보 노출 0, 409/429/503, 전경 알림 적격·억제율, 인앱 이력 유지, GET/PUT p95, 옵트아웃률. 실제 개선 효과는 미측정.
- notification_controls_v1 기본 OFF. 별도 개발 브랜치·전진형 마이그레이션·RED/GREEN·격리 실DB 테스트 후 정확 SHA Test 인증 사용자 흐름/금융 회귀, 보안 감사, 복구 검증, GitOps 승인 필요. 1%→10%→100% 단계 배포; OFF 롤백은 신규 UI/전경 알림만 중단하고 기존 수신함·목표 토글 유지. 기획 예약은 런타임 배포 금지.

### P0/P1 구체 개발 백로그
| 우선순위 | ID | 수용 조건 |
| --- | --- | --- |
| P0 | ENV1292-01 | 루트 99%·약 1.8GiB, 활성 작업물 보존, 격리 DB 복원 검증 및 85/90% 경보. |
| P0 | SEC1292-02 | 개발 DB 앱 직접 쓰기 가능 239/241 재측정, 과도 DML/PUBLIC 함수 회수, 타 회원 접근 100회 차단. |
| P0 | REL1292-03 | 최신 후보 PR #1350 프론트 1,407 통과/6 실패·감사 실패, migration 266/280 근거, 정확 SHA Test 인증 E2E/복구 게이트. |
| P0 | NOT1292-04 | 하드코딩 가짜 알림 6개·시뮬레이션 장마감 푸시 차단, 서버 원천/읽음/지급 영수증 없는 성공 표시 금지. |
| P1 | NOT1292-05 | 본인 설정/분류/불변 영수증 DB, 제약·인덱스·탈퇴/병합·SECDEF 최소권한. |
| P1 | NOT1292-06 | CAS·멱등 원자 저장, 로그인 우선 재생검사, 시간대·자정·DST·100건 동시 요청. |
| P1 | NOT1292-07 | 실제 알림 본인 조회·고유 키셋 커서·읽음/미읽음 일관성, 합성 10,001건. |
| P1 | NOT1292-08 | NestJS/Next.js/Android API 동등성, 401/409/429/503·기기 권한·세션 경합. |
| P1 | NOT1292-09 | 실제 알림 UI·접근성·개인정보·관리자 k>=20·SEO·KPI·오프라인 미보장 안내. |
| P1 | NOT1292-10 | 격리 PostgreSQL 동시 100·타 회원 100·합성 10,001·DST·응답 유실·로그아웃·롤백 회귀. |

**근거·운영 보류:** 최신 main 변경 없음; QA 후보와 읽기 전용 DB 측정은 최종 QA 승인 아님. 외부 독립 발행기관 W3C WCAG 2.2·OWASP API Top 10 2023은 후보 근거로 검토했으나 10,000건 중 새로 중복제거·분류·최종 승인한 근거 **0건**, 누적 승인 **미확인**, 게이트 **BLOCKED / IN PROGRESS**. 코드·DB·WLD·원장·Test·Production 변경 없음.

- **GitHub 기획 검토:** [Draft PR #1349](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1349) (미병합 #1345 기반, 문서만); [개발 인계 #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

## v2026.10.26.1290 — F675-129 회원 상점 찜 목록 가격·구매 가능성·재시도 무결성 보완 (기능 보완 / 초안 / 운영 보류)

### 기준·실제 코드 검증
- **회차:** 이전 기능 추가 v1288 → 현재 기능 보완 v1290 → 다음 기능 추가 v1292(잠정). 원격 main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 재확인, main AGENTS.md·README.md·영문 정본 PROJECT_PLAN.md·한국어 대조본 확인. 미병합 기획 Draft #1345 기반, 개발 인계 #1344와 분리. Gemini·개발 A/B/C·QA 코드/마이그레이션/배포는 변경하지 않는다.
- **회원별 가격(실제 Migration 165):** shop_effective_unit_price(p_actor,p_catalog)는 회원이 **현재 서울 날짜**의 market_sale 이벤트를 수령하고 starter_tools 대상 상품이면 GREATEST(1,(base_price*9)/10)의 정수 WLD 가격을 반환한다. shop_catalog_list_v2(p_actor)와 shop_purchase_catalog가 함께 사용하며 공개 p_actor=NULL은 기본가다. v1288의 일반적인 ‘현재 가격’을 **회원 본인 실효가**로 정정해야 한다. 서울 자정·수령 조건 변경으로 결제 시 달라질 수 있다. 운영 사고 발생을 입증한 것은 아니다.
- **열람과 구매 구분:** v165 카탈로그는 활성 여부·재고 starts_at/ends_at만 필터하고 **재고 0이나 sale_ends_at은 제외하지 않는다**. 구매 함수는 재고·활성 회원/계좌·shop_assert_purchase_limit를 별도로 검증하지만 sale_ends_at·required_progression_code 강제 조건은 확인되지 않았다. 정책 불일치는 개발 검토 대상으로 남기고 찜 기능이 임의로 구매 정책을 바꾸거나 ‘열람 가능=구매 가능’이라고 표시해서는 안 된다. 기존 BIGINT v_price*수량(최대 100) 오버플로 경계도 테스트한다.

### 사용자 흐름·화면·정확한 금액
- **목적 유지:** 로그인·동의한 활성 회원이 /shop에서 최대 30개 UUID 상품을 찜하고 /account/shop-wishlist에서 ‘상점에서 확인·제거·다시 시도’를 이용한다. 찜은 구매·재고 예약·가격 확정·알림·보상·WLD/원장 이동이 아니다. **찜 목록에는 활성 구매 CTA를 제공하지 않는다.** 비로그인 이용자는 공개 가격을 보고 저장 시 로그인한다.
- **금액:** 회원 본인 shop_effective_unit_price 결과를 effectiveUnitPriceWld의 정확한 양의 **정수 문자열**, priceObservedAt ISO 시각, priceStatus CURRENT|UNAVAILABLE로 반환한다. 공개 기본가를 회원 가격으로 재사용하지 않고 JS Number 변환이나 찜/영수증 가격 저장을 금지한다. ‘새로고침 당시 가격, 결제 시 확정’으로 안내하며 원천 장애 시 0/추정가를 표시하지 않는다.
- **가용성:** BROWSEABLE은 열람 가능만 의미, 재고 0은 OUT_OF_STOCK, 확인된 비활성/판매 기간 외는 INACTIVE_OR_OUT_OF_WINDOW, 구매 한도·계좌·진행도·판매종료 정책이 확정되지 않으면 CHECK_AT_CHECKOUT, DB 오류는 SOURCE_UNAVAILABLE, 하드 삭제는 REMOVED. 카탈로그 노출이나 sale_ends_at만으로 purchasable=true 금지. 만료된 sale_ends_at이 실제 구매에서 차단되지 않는 정책 불일치는 별도 개발 검토로 인계한다.
- **화면 상태:** LOADING/EMPTY/SAVED/ALREADY_SAVED/REMOVED/LIMIT_REACHED/UNAVAILABLE_SAVED/CHECK_AT_CHECKOUT/UNCONFIRMED/STALE_REVISION/SESSION_EXPIRED/SOURCE_UNAVAILABLE/FEATURE_OFF. 로그아웃·계정 전환 시 세션 세대별 오래된 응답을 차단하고 응답 유실 시 본인 재조회 전 성공 토스트 금지. 비활성·없는 상품 신규 저장은 구별 불가능한 404, **이미 찜한 비활성·기간 종료 상품은 판매 가능 여부와 무관하게 제거 가능**해야 한다.

### API·DB·트랜잭션·개인정보
- **본인 API:** GET /api/v1/shop/wishlist?cursor=&limit=30 → items의 catalogId,revision,savedAt,effectiveUnitPriceWld,priceObservedAt,priceStatus,availabilityState 및 nextCursor,wishlistGeneration. POST /api/v1/shop/wishlist {catalogId,idempotencyKey}, DELETE /api/v1/shop/wishlist/:catalogId {idempotencyKey,expectedRevision}. 불변 영수증 receiptId,operation,resultRevision,replayed는 **과거 결과**이지 현재 저장 상태 보장이 아니다. 세션 회원 ID만 사용, 활성 회원·동의·쓰기 CSRF, Next.js 동일 출처/Android /app-api/v1 동등. 400/422 입력, 401 세션, 404 타인/없음, 409 키·버전 충돌, 429 한도, 503 장애. 개인 no-store/noindex·교차 회원 캐시 금지.
- **순방향 스키마:** 회원+상품 UNIQUE, removed_at 소프트 제거, 양의 BIGINT revision, 활성 인덱스, 30건 상한 유지. UNIQUE(user_id,request_key) 영수증은 작업/상품/예상 버전 포함 SHA-256 정규화 지문·원 결과/버전/시각을 보관하며 일반 UPDATE/DELETE 권한·불변 트리거로 수정 금지, 적법한 삭제는 별도 승인 경로. 가격·상품명·IP·토큰은 복제하지 않는다. 상품 하드 삭제 FK CASCADE 후 과거 영수증 재시도로 상품을 부활시키지 않는다. 회원 소프트 탈퇴는 FK 연쇄 삭제가 아니다.
- **잠금 순서:** 세션 인증·활성 회원·동의를 **멱등 영수증 재조회보다 먼저** 확인 → 회원+요청키 트랜잭션 잠금 → 원 지문 비교 → users 회원 행 FOR UPDATE → 찜 행 FOR UPDATE → SAVE에 한해 상품 FOR KEY SHARE/저장 정책 → 30건 한도·CAS·UNIQUE·변경·불변 영수증·wishlistGeneration 증가를 한 트랜잭션에 확정. REMOVE는 현재 판매 조건과 무관하다. Migration 163 계정 병합과 잠금 역전 방지, Advisory 해시보다 UNIQUE가 최종 방어. 상품 하드 삭제 연쇄 시 커서 세대 무효화 트리거 또는 단일 페이지 재조회 필요.
- **커서:** HMAC 회원·세션 세대·찜 세대·saved_at+UUID·키 버전·15분 만료, 수정/삭제/로그아웃/병합 시 무효화. 운영 30건 상한 유지, 10,001건은 **격리 성능 테스트용 합성 데이터**다. 조회 중 가격·재고 변동이 가능하므로 구매 확정 스냅샷으로 주장하지 않는다.
- **보안·관리자·접근성/KPI:** 승인된 탈퇴 삭제·병합 정책 전에는 찜/영수증 계정 병합 차단, 세션/커서 무효화. 고정 search_path SECURITY DEFINER·본인 검증·PUBLIC EXECUTE 회수·앱 광범위 직접 DML 금지, 타 회원 100건 부정 검증, 초기 쓰기 5/읽기 30회/분. 관리자는 k>=20 집계만, 개인 찜·할인 수령 정보 비노출. 개인 SEO 비색인/사이트맵 제외, 모바일 44px·키보드·포커스·상태 알림·동작 감소·WCAG 2.2 AA. 검증된 저장/제거·가격 조회 실패·자정 할인 불일치·p95·409/429/503·허위 성공 0·BOLA 유출 0만 측정하고 수익 향상은 가설로 남긴다.

### P0/P1 개발 백로그 및 수용 기준
| 우선순위 | ID | 산출물·수용 기준 |
| --- | --- | --- |
| P0 | ENV1290-01 | 루트 98%/약 2.0GiB 여유, 독립 DB·복원·용량 경보, 다른 작업자 파일/볼륨 보존. |
| P0 | SEC1290-02 | QA v1279 개발 DB 앱 직접 UPDATE/DELETE 235/241, PUBLIC 은행 함수 0건 재실측·최소권한, 본인/동의 SECDEF·타 회원 100건 부정 검증. |
| P0 | REL1290-03 | QA v1279 프론트 1,397 통과/6 실패·경로 검사 명령 인자 오류·감사 실패, Migration 266 체크섬/280 출처, 정확 SHA 금융 Test E2E·격리 복원·롤백. |
| P0 | SHP1290-04 | v165 회원별 실효가, 재고 0, sale_ends_at/진행도 정책 불일치, BIGINT×수량 오버플로를 구매 진실과 대조, 허위 구매 가능/할인 보장 금지. |
| P1 | SHP1290-05 | 불변 본인 찜/영수증·하드 삭제 역사·정확한 문자열 실효가·가격 스냅샷 금지·30개 상한. |
| P1 | SHP1290-06 | 인증 후 재시도·회원/키 지문·회원→찜→상품 잠금·비활성 제거·CAS·세대 무효화·동시 100건. |
| P1 | SHP1290-07 | 회원별 DB 가격 조인·열람/품절/결제 시 확인 상태·서울 자정 관측 시각·HMAC 커서. |
| P1 | SHP1290-08 | NestJS/Next.js/Android API·오류·영수증 동등·세션 전환 방어·no-store·찜 구매 CTA 금지·접근 가능한 재시도. |
| P1 | SHP1290-09 | 탈퇴/병합·관리자 k>=20·SEO·WCAG 2.2 AA·실측 KPI·개인 할인 수령 정보 비노출. |
| P1 | SHP1290-10 | 격리 PostgreSQL 동시 100/타 회원 100/합성 10,001, 자정 할인·1 WLD 반올림·BIGINT×100 오버플로·판매종료 정책·하드 삭제/재시도·정확 SHA Test·OFF 롤백. |

- **QA/승격:** 2026-10-26 00:32 KST v1279 원시 결과 프론트 1,397 통과/6 실패, 린트·타입·빌드·백엔드·DB·계약 PASS, 경로 검증은 --inventory 인자 누락으로 FAIL(실제 경로 누락 증거 아님), 운영/전체/봇 의존성 감사 FAIL. 개발 DB PUBLIC 은행 함수 0건(과거 3건과 달라 보안 승인 전 재검증), 앱 직접 쓰기 235/241, Migration 266 DB 기록 SHA와 파일 SHA 불일치. 루트 98%/약 2.0GiB, 별도 볼륨 62GiB. 정확 SHA 금융 Test E2E·격리 복원·전체 QA 승인 미확인으로 운영 BLOCKED.
- **배포·롤백:** 문서만 수정. 개발 담당 별도 브랜치·순방향 마이그레이션, shop_wishlist_v1=OFF 기본 → 실 DB 권한/가격/구매·지갑·원장 회귀 → CI/감사 → 공식 정확 SHA 로그인 Test E2E·복원·QA/GitOps 승인 → 1%/10%/100%. 허위 성공·가격 불일치 시 OFF, 상품/재고/구매 영수증/WLD/원장 변경 금지.
- **외부 독립 근거 10,000건 게이트:** 신규 승인 0, 누적 독립 확보·중복 제거·근거 분류·승인 수량 UNKNOWN/10,000, BLOCKED / IN PROGRESS. 코드 검토·링크는 승인 건수로 자동 집계하지 않는다.

- **GitHub 기획 검토:** [Draft PR #1345](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1345) (stacked on unmerged #1340, review-only); [development issue #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

## v2026.10.26.1288 — F675-129 회원 전용 검증형 상점 찜 목록 (기능 추가 / 초안 / 운영 보류)

### 기준 문서·회차·실제 코드
- **회차:** 이전 기능 보완 v1286 → 현재 기능 추가 v1288 → 다음 기능 보완 v1290(잠정). 원격 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 재확인. 진실 기준: main `AGENTS.md`, `README.md`, 영어 원본 `PROJECT_PLAN.md` 및 한국어 대조본. 미병합 초안 PR #1340 위에 문서만 누적, 개발 인계 [#1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344). Gemini/개발 A/B/C/QA·런타임 변경 없음.
- **코드 근거(운영 사고 증거 아님):** `frontend/src/app/shop/page.tsx`는 공개/회원 카탈로그를 조회하며 `shop-store-view.tsx`는 `catalog_id`, `code`, 문자열 `price`, 보유·재고 정보를 표시한다. `backend/src/shop/shop.controller.ts`에는 공개/회원 카탈로그, 보유 아이템, 구매 API가 있으나 확인한 main에서 회원 찜 목록 CRUD는 찾지 못했다. Migration 071의 `shop_catalog.id UUID`, `code UNIQUE`, `base_price BIGINT`, `active`, 재고 기간과 Migration 075의 활성 상품 조회 함수를 확인했다. **상점 가격은 정수 BIGINT의 문자열이며 마켓의 NUMERIC(20,4)와 다르다.** 상품 소개·소각 문구는 독립 구매/원장 영수증을 대신하지 못한다.
- **목적:** 로그인·동의 완료한 활성 회원이 최대 **서로 다른 30개 상품**을 나중에 살펴보도록 보관한다. 찜은 개인적 관심 표시일 뿐 **재고 예약, 가격 확정, 구매, 소유, WLD 이동, 자동 알림, 보상**이 아니다.

### 사용자 흐름·화면·상태·API
- **진입점:** 기존 `/shop` 상품 카드/미리보기의 **찜하기 / 찜 해제** → 서버 영수증 확인 → **찜 목록 보기**. 신규 `/account/shop-wishlist`에서 **상점에서 보기 / 제거**를 제공한다. 비로그인 이용자는 공개 상점을 열람하되 저장 시 로그인 안내. 찜 목록의 오래된 데이터만으로 구매 CTA를 활성화하지 않고, 실제 구매는 기존 상점의 독립 권한·잔액·재고·원장 영수증 게이트를 통과해야 한다.
- **화면 상태:** `LOADING / EMPTY / SAVED / ALREADY_SAVED / REMOVED / LIMIT_REACHED / UNAVAILABLE_SAVED / SESSION_EXPIRED / STALE_REVISION / SERVICE_UNAVAILABLE / FEATURE_OFF`. 서버 응답 유실은 `UNCONFIRMED`로 유지하고 본인 재조회 전 저장 성공을 표시하지 않는다. 판매중지·재고 0·기간 만료 상품은 `UNAVAILABLE_SAVED`로 남기되 가격·구매 버튼을 허위로 노출하지 않는다. 상품이 실제 하드 삭제되면 FK 정책에 따라 찜 관계도 삭제된다.
- **키와 금액:** 찜 식별은 `catalogId UUID`; `code`는 상품 고유 코드이지 사용자 권한 토큰이 아니다. 현재 이름·카테고리·정수 WLD 가격 문자열·구매 가능 여부는 서버 카탈로그/재고를 매 조회 시 조인한다. 찜 저장 시점 가격을 고정하지 않으며 JavaScript Number로 BIGINT를 변환하지 않는다.
- **NestJS API(Next.js 동일 출처·Android `/app-api/v1` 동등):** `GET /api/v1/shop/wishlist?cursor=&limit=30` → 본인 목록/현재 상품/다음 커서; `POST /api/v1/shop/wishlist` 본문 `{catalogId:UUID,idempotencyKey:UUID}` → `{catalogId,revision,receiptId,state}`; `DELETE /api/v1/shop/wishlist/:catalogId` 본문 `{idempotencyKey:UUID,expectedRevision:positiveInteger}` → 불변 제거 영수증. 회원 ID는 요청에서 받지 않고 세션에서 추출한다. 로그인·동의·CSRF(변경 요청) 필수. 400/422 형식, 401 세션, 404 타 회원/존재하지 않음, 409 버전·키 충돌, 429 남용, 503 서비스 장애. 찜 API는 기존 구매 API를 호출하지 않는다.

### DB·트랜잭션·개인정보·운영
- **신규 마이그레이션 번호는 개발 담당이 예약:** `member_shop_wishlist(id uuid PK,user_id uuid NOT NULL REFERENCES users(id),catalog_id uuid NOT NULL REFERENCES shop_catalog(id) ON DELETE CASCADE,revision bigint CHECK(revision>0),saved_at timestamptz,updated_at timestamptz,removed_at timestamptz NULL,UNIQUE(user_id,catalog_id))`; 활성 인덱스 `(user_id,saved_at DESC,id DESC) WHERE removed_at IS NULL`. 제거한 항목을 다시 찜하면 동일 행을 새 버전으로 갱신한다. `member_shop_wishlist_receipts(id uuid PK,user_id,request_key uuid,payload_digest bytea CHECK(octet_length=32),catalog_id,operation CHECK SAVE/REMOVE,result_revision bigint,created_at,UNIQUE(user_id,request_key))`. 영수증에 가격·세션 토큰·IP·상품 설명을 복제하지 않는다. FK·보존·삭제 정책은 마이그레이션 전 승인.
- **원자적 처리:** 회원·동의·실제 상품 검증 → 회원+요청키 트랜잭션 Advisory Lock → 기존 영수증과 요청 본문 해시 비교(동일 재시도는 원 영수증, 다른 내용 재사용은 409) → 회원 행 `FOR UPDATE`로 활성 30개 상한 직렬화 → 해당 찜 행 잠금 → revision CAS/UNIQUE 검증 → 찜 변경·불변 영수증 동시 커밋. 잠금 해시 충돌 방지는 UNIQUE와 행 잠금이 최종 책임. 고정 `search_path` SECURITY DEFINER 함수에서 소유자·동의 검사, PUBLIC EXECUTE 회수, 앱 역할의 광범위 직접 DML 금지. 읽기도 DB에서 본인 검증.
- **실시간 가용성:** `shop_catalog.active`, 재고 수량, `starts_at`/`ends_at`, `sale_ends_at` 및 검토된 구매 제한을 현재 DB로 검증한다. 단순 활성 목록에 없다는 사실만으로 상세 원인을 추정하지 않는다. 페이지 간 재고 변화 가능성을 알리고 찜 목록을 고정 스냅샷이라고 주장하지 않는다. HMAC 커서는 회원·세션·저장시각+UUID 정렬키·키 버전·15분 만료를 결합한다.
- **탈퇴·병합:** Migration 010은 소프트 삭제이므로 FK CASCADE만으로 개인정보가 지워지지 않는다. Migration 163 병합 정책 승인 전에는 찜/영수증 보유 계정 병합을 차단하고 커서를 무효화한다. 개인정보 보존·삭제·익명화 정책과 감사 기록은 별도 검증. 본인 화면/API `private,no-store`, `noindex,nofollow`, 사이트맵 제외. 공개 `/shop` SEO는 유지. 관리자에게는 k>=20 비식별 통계만 제공하며 회원 찜 목록 열람·수정은 금지. 초기 테스트 상한: 변경 5회/분, 조회 30회/분/회원.
- **모바일·접근성·KPI:** 모바일 1열 재배치, 44px 터치 영역, 키보드·포커스·스크린리더 상태 알림, 오류 복구, reduced motion, WCAG 2.2 AA. Android 오류/영수증/금액 문자열 동일. 검증된 서버 이벤트로 저장률, D7/D30 재방문, 품절 찜 비율, 삭제율, p95, 409/429/503, BOLA 유출 0, 허위 성공 0을 측정한다. 구매 전환은 별도 원장 영수증이 있는 경우에만 계산하고 수익·리텐션 향상은 실측 전 `HYPOTHESIS`.

### P0/P1 개발 백로그
| 우선순위 | ID | 수용 기준 |
| --- | --- | --- |
| P0 | ENV1288-01 | 루트 98%·약 2.1GiB 여유, 독립 DB·복원·용량 경보; 다른 작업 공간/볼륨 삭제 금지. |
| P0 | SEC1288-02 | 개발 앱 역할 직접 DML/PUBLIC 함수 권한 재실측·최소권한·본인 SECDEF, 타 회원 부정 테스트 100건. |
| P0 | REL1288-03 | QA v1278 테스트 시간초과·6건 실패/의존성 감사, Migration 266/280 근거, 정확 SHA Test 금융 E2E·격리 복원·롤백. |
| P0 | SHP1288-04 | 실제 카탈로그/재고·구매 영수증 진실 검증; 찜을 재고 예약·결제·소유로 표시하지 않음. |
| P1 | SHP1288-05 | UUID 찜 DB·회원+상품 UNIQUE·활성 인덱스·요청 영수증·FK/보존·30개 상한. |
| P1 | SHP1288-06 | 원자적 찜/제거/재찜, 동일 키 재시도, 충돌 409, 상한 경합, 버전 CAS. |
| P1 | SHP1288-07 | 현재 카탈로그 조인, BIGINT 문자열, 품절·만료·비활성·삭제, 서명 키셋. |
| P1 | SHP1288-08 | NestJS·Next.js·Android API, 세션·동의·CSRF·오류·영수증 동등성. |
| P1 | SHP1288-09 | 탈퇴·병합·개인정보, 관리자 k>=20, SEO·no-store, WCAG AA, 실측 KPI. |
| P1 | SHP1288-10 | 격리 PostgreSQL 동시 저장 100건, 타 회원 100건, 합성 상품 10,001건, 재고·시간 경계, Test exact-SHA/롤백. |

- **QA·운영:** 마지막 승인된 완료 QA v1276 FAILED/HOLD. 최신 v1278 원시 증거(2026-10-25 23:28 KST)는 프론트 1,397건 통과/6건 실패, `pnpm test` 종료코드 124(시간초과), 타입·린트·빌드·API 계약·경로 검사는 0, 전체/운영/봇 의존성 감사 1. v1278 최종 승인 미확인. 루트 98%·2.1GiB, 별도 볼륨 65GiB. DB 권한/마이그레이션, 금융 Test 정확 SHA, 독립 복원 미검증으로 운영 승격 BLOCKED.
- **배포·롤백:** 기획 문서만 작성. 개발 별도 브랜치, 검토된 순방향 마이그레이션, `shop_wishlist_v1=OFF` 기본, 실 DB 최소권한·상점 구매·지갑·원장 회귀, CI/감사·정확 SHA Test·QA 승인 후 1%→10%→100%. 장애 시 기능 OFF로 숨기고 기존 카탈로그·재고·WLD·원장을 변경하지 않는다.
- **외부 독립 근거 10,000건 게이트:** 신규 승인 0건, 누적 중복 제거·분류·승인 수량 **미확인(UNKNOWN)** / 목표 10,000, **BLOCKED / IN PROGRESS**. 코드 검토와 일반 공식 문서는 승인 근거로 자동 집계하지 않는다.


## v2026.10.25.1286 — F675-128 회원 마켓 검색 조건 의미·금액 정밀도 보완 (기능 보완 / 초안 / 운영 보류)
- **GitHub 기획 검토:** [초안 PR #1340](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1340) (기존 #1335 기반, 미병합); [개발 인계 #1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334).

### 기준·회차·실제 소스 근거
- **회차:** 이전 기능 추가 v1284 → 현재 기능 보완 v1286 → 다음 기능 추가 v1288(잠정). 시작·중간 원격 `main=1c5b84a1c45baafcca83f375a6f99698121e9bb5` 확인, `AGENTS.md`·`README.md`·영문 정본 `PROJECT_PLAN.md`·한국어 대조본 재확인. 미병합 기획 Draft [#1335](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1335) 위에만 누적하며 개발 인계 [#1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334)를 유지. 개발 A/B/C·Gemini·QA 브랜치는 수정하지 않음.
- **실제 main에서 확인한 호환성 위험(운영 사고 입증 아님):** Migration 232의 `marketplace_listings.price_wld`는 `NUMERIC(20,4)`. `market-listings-view.tsx`의 `BigInt(priceWld)`는 `1.2500` 같은 소수 문자열에서 예외를 내며 `Number(BigInt 차이)` 정렬은 큰 값에서 정밀도를 잃음. `marketplace.service.ts`의 `ILIKE` 검색은 `%`·`_` 와일드카드를 이스케이프하지 않음. `MarketplaceQueryDto` 검색어·카테고리 길이 제한 없음. UI는 판매자명·상품명·설명을 검색하지만 SQL은 상품명·설명만 검색하고 판매자명을 반환하지 않음. `created_at DESC LIMIT/OFFSET`에는 유일 순서가 없음. 모의 매물·타이머 구매 성공·임의 1000 WLD 잔액도 P0 차단 대상.

### 검색 조건·금액 계약 정정
- **기존 F675-128 범위 유지:** 로그인·동의 회원의 `ACTIVE` 고정가 매물 검색 조건 저장(가격·재고 예약, 알림, 구매, 정산, WLD 이동 없음). `/marketplace` → **이 검색 저장** → `/account/marketplace-searches` → **검색 실행/이름 수정/조건 변경/삭제**. 상태 `LOADING/EMPTY/SAVED/DUPLICATE/LIMIT_REACHED/STALE_REVISION/SESSION_EXPIRED/DATA_UNAVAILABLE/FEATURE_OFF`를 유지하고 `INVALID_FILTER/PRICE_UNAVAILABLE/RESULTS_CHANGED`와 다시 시도/새로고침 CTA 추가. 모의 매물과 가짜 구매 영수증은 검증된 결과로 표시 금지.
- **정규화 필터 v2:** `{query,category,maxPriceWld,sort}`. 검색어는 NFKC·공백 제거, 유니코드 80코드포인트/UTF-8 320바이트 이하, 제어·양방향 제어문자 거부, SQL 패턴이 아닌 **문자 그대로의 부분 문자열**. 지문·API·SQL이 같은 정규화 값을 사용. `ILIKE`의 역슬래시·`%`·`_` 이스케이프 및 `ESCAPE '\\'`, 바인딩 파라미터, 쿼리 시간 제한. 카테고리는 실제 DB 기반 승인 목록(1~60코드포인트), 정렬은 `newest|price_asc|price_desc`. 개인정보·인덱스가 검증된 판매자명 조인이 구현되기 전에는 **판매자명 검색 안내 제거**(프론트·API 의미 일치).
- **정확한 WLD:** 최고가격은 선택적 양수 10진 문자열, 정수 최대 16자리·소수 최대 4자리, 지수·콤마·부호·무한대·JS Number 변환 금지. `NUMERIC(20,4)` 초과값은 반올림하지 않고 422. PostgreSQL NUMERIC으로 필터/정렬, JSON·Android는 문자열. UI 잔액 비교는 10^4 정수 스케일 또는 검토된 decimal 라이브러리 사용. `BigInt('1.2500')`와 `Number(BigInt 차이)` 금지. 지갑 원천 장애 시 `PRICE_UNAVAILABLE`, 잔액 추정 금지. 검색 저장 영수증과 실제 구매 정산 영수증은 별개.

### 결과 페이지·DB·보안·계정 생명주기
- **서버 선필터:** `status='ACTIVE'`·카테고리·리터럴 키워드·`price_wld<=maxPrice`를 LIMIT 이전에 적용. 최신순 `(created_at DESC,id DESC)`, 가격 오름/내림순 `(price_wld ASC|DESC,created_at DESC,id DESC)`에 맞는 키셋 비교 및 UUID 최종 타이브레이커. 격리된 실제 PostgreSQL 대표 데이터의 `EXPLAIN (ANALYZE, BUFFERS)`로 인덱스 결정. 현재 목록은 실시간 가변 데이터이므로 페이지 사이 판매·취소 가능, `RESULTS_CHANGED` 및 새로고침 제공, 고정 스냅샷/완전성 보장 금지.
- **서명 커서:** 회원·세션, 검색 ID·revision·정규화 지문, 정밀도 보존된 마지막 가격 문자열, 시간/UUID, 정렬, 키 버전, 15분 만료를 HMAC으로 묶음. 매 페이지 소유자·동의·활성 회원·삭제 여부 확인. 세션 만료 401, 타 회원/없는 ID는 동일 404, 변경된 revision 409, 잘못된 필터/커서 422, 호출 초과 429, DB 장애 503. 수정·삭제·계정 병합 후 기존 커서 무효화.
- **저장 원자성:** 회원당 활성 20건, `(user_id,filter_fingerprint) WHERE deleted_at IS NULL` 부분 UNIQUE, 회원별 최근순 인덱스, `UNIQUE(user_id,request_key)` 불변 영수증. **같은 정규화 조건을 다른 이름으로 저장해도 중복 409**(명칭 수정은 PATCH). 멱등 요청키 advisory lock → 원본 요청 지문·영수증 확인 → 회원 행 FOR UPDATE → 검색 행 FOR UPDATE → 한도·revision CAS·중복 검사·영수증을 단일 트랜잭션에서 확정. 회원+UUID 범위 잠금, DB UNIQUE로 충돌 최종 방어. `SECURITY DEFINER` 고정 search_path·본인/동의 검사·PUBLIC EXECUTE 회수·앱 광범위 DML 금지.
- **탈퇴·병합:** Migration 010은 논리 탈퇴, 163은 계정 병합이므로 FK 자동 삭제에 의존 불가. 검색/영수증이 남은 계정 병합은 승인된 이전·삭제 정책과 테스트가 마련되기 전까지 차단. 계정 상태 변경 시 세션·커서 무효화, 승인된 보존기간에 따라 검색어/요청 메타데이터 삭제·익명화. 관리자에는 k>=20 비식별 집계만, 검색어·회원 ID 노출 금지. 회원 API/페이지 no-store·noindex, 변경 CSRF, Android `/app-api/v1` 동등성, 키보드·초점·44px·동작 감소·WCAG 2.2 AA.

### P0/P1 개발 백로그 및 수용 기준
| 우선순위 | ID | 구체적 인계·수용 조건 |
| --- | --- | --- |
| P0 | ENV1286-01 | 루트 98%·약 2.2GiB 잔여, DB 격리·복원·24시간 용량 감시; 다른 작업자 파일/볼륨 보존. |
| P0 | SEC1286-02 | 앱 DB 직접 쓰기·PUBLIC 함수 권한 회수, SECDEF 본인 검증·타 회원 100건 부정 테스트·생명주기. |
| P0 | REL1286-03 | 완료 QA v1276 FAILED/HOLD, v1277 신규 실패 근거, Migration 266/280, 감사·경로 인벤토리·정확 SHA Test·복원 게이트. |
| P0 | MKT1286-04 | 모의 매물·임의 1000 WLD·타이머 구매 성공 fail-closed; 실제 매물·정산 영수증을 저장 영수증과 분리 검증. |
| P1 | MKT1286-05 | 필터 v2·와일드카드 문자 검색·판매자명 의미 일치·NUMERIC(20,4) UI/API 정밀도. |
| P1 | MKT1286-06 | 회원 20건 한도·정규화 중복 정책·원자적 CAS/멱등 영수증·병합/탈퇴 처리. |
| P1 | MKT1286-07 | SQL ACTIVE 선필터·유일 키셋 정렬·HMAC 커서·실측 인덱스·변경/재시작 상태. |
| P1 | MKT1286-08 | NestJS/Next.js/Android 오류·세션·동의·CSRF·no-store·금액 문자열 계약. |
| P1 | MKT1286-09 | 회원 화면·관리자 k>=20·개인정보·SEO noindex·모바일 WCAG·실제 KPI. |
| P1 | MKT1286-10 | 격리 PostgreSQL 동시 저장 100·BOLA 100·동률 매물 10,001·`%`/`_`·1.2500/최댓값·커서/병합/롤백 검증. |

- **QA:** 최근 완료 v1276 FAILED/HOLD. v1277 22:23 KST 원시 증거는 프론트 1,397 통과/6 실패, 타입·린트·빌드 종료코드 0, 테스트/경로 검사/전체·운영·봇 감사 종료코드 1; 최종 QA 승인 미확인. 루트 98%·2.2GiB, 금융 Test 정확 SHA·격리 복원 미검증, 운영 승격 **BLOCKED**.
- **배포:** 기획 문서만 수정. 별도 개발 브랜치·기본 `marketplace_saved_searches_v1=OFF`·검토된 순방향 마이그레이션 → 격리 DB/권한/금액·경로 회귀 → 정확 SHA CI → 로그인 Test E2E → QA 승인 → 1%/10%/100% → 스모크. 문제 발생 시 기능 OFF, 매물·에스크로·WLD·원장 불변.
- **외부 독립 레퍼런스 10,000건 게이트:** 신규 승인 0건, 중복 제거 누적 승인 수량 **미확인**, 목표 10,000건, **BLOCKED / IN PROGRESS**. 소스코드 분석·중복 링크·공식문서 단순 검토는 자동 승인 실적이 아님.


## v2026.10.25.1284 — F675-128 회원 전용 검증형 마켓 검색 조건 보관함 (기능 추가 / 초안 / 운영 보류)

### 정본·범위·근거
- **회차:** 이전 기능 보완 v1282 → 현재 기능 추가 v1284 → 다음 기능 보완 v1286(잠정). 시작 기준 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; `AGENTS.md`, `README.md`, 영문 정본 `PROJECT_PLAN.md` 및 국문 대조본을 확인. 미병합 기획 Draft #1329 위에 별도 적층, 개발 인계 [#1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334). 개발 A/B/C·Gemini·QA의 변경 및 마이그레이션 번호와 분리. **이번 회차는 기획 문서만 변경.**
- **소스에서 확인한 빈틈(운영 사고 입증 아님):** `marketplace-tabs.tsx`는 서버 조회가 아닌 `INITIAL_MARKET_LISTINGS`로 매물을 채우고 구매 후 브라우저에서 보유 아이템·잔액을 수정한다. `market-listings-view.tsx`는 실제 정산 영수증 없이 `setTimeout` 후 구매 성공을 표시한다. `/marketplace/page.tsx`는 지갑 API 실패 시 임의의 `1000` WLD를 표시한다. 실제 `GET /api/v1/marketplace/listings`는 `marketplace_listings`를 조회하지만 `created_at DESC LIMIT/OFFSET`으로 동률 정렬 기준이 없다. Migration 232의 가격은 `NUMERIC(20,4)`이며 정수/JS Number로 가정할 수 없다. 확인한 main에는 회원 저장 검색 CRUD가 없다. P2P 정산 이슈 #1314는 별도 개발 범위다.

### 목적·대상·권한·회원 동선
- **목적:** 로그인·동의 완료 회원이 실제 `ACTIVE` 고정가 매물의 **검증된 검색 조건**을 저장하고 기기 간 재사용. 검색 보관함은 읽기 전용 탐색이며 가격 예약, 알림 자동 발송, 에스크로, 구매, 아이템/WLD 지급 기능이 아니다. 회원당 활성 **20개**. 검색은 이름(1~80자)과 버전형 `{query,category,maxPriceWld,sort}`로 구성. 카테고리는 실제 승인된 목록으로 검증하고 UI 하드코딩 목록을 신뢰하지 않는다. 검색어 NFKC 정규화·공백 제거·80자 제한, LIKE 특수문자 이스케이프; 최고가는 `NUMERIC(20,4)`에 맞는 정확한 양수 10진 문자열; 정렬은 `newest|price_asc|price_desc`만 허용.
- **진입점:** `/marketplace` 고정가 탭 → 필터 → **이 검색 저장** CTA → 이름 확인 → 서버 저장 영수증 확인 → **저장됨** 및 `/account/marketplace-searches` 링크. 계정 화면에서 **검색 실행/이름 수정/조건 수정/삭제**(확인 대화상자). 저장된 검색을 열면 `/marketplace?savedSearch=<본인 소유 불투명 ID>`로 이동하고 서버 조건으로 실제 매물을 조회한다. `LOADING / EMPTY / SAVED / DUPLICATE / LIMIT_REACHED / STALE_REVISION / SESSION_EXPIRED / DATA_UNAVAILABLE / FEATURE_OFF` 상태 제공. 실패 시 저장·구매 성공을 표시하지 않으며 임의 잔액도 노출하지 않는다. 종료·취소된 매물은 `NO_LONGER_AVAILABLE`이며 구매 CTA를 숨긴다. 저장 없이 검색하는 동선은 유지한다.
- **범위:** 고정가 `ACTIVE` 매물만. 경매·P2P·암시장 제외. 회원의 검색 조건과 결과 조회는 비공개. 저장 조건은 **결과 스냅샷이 아니며**, 판매·취소로 결과가 바뀔 수 있다. 검색 저장 영수증을 거래 정산 영수증과 혼동하지 않는다.

### API·DB·트랜잭션·페이지네이션
- **NestJS 인증·동의·변경 시 CSRF:** `GET /api/v1/marketplace/saved-searches?cursor=&limit=20`, `POST /api/v1/marketplace/saved-searches`(`idempotencyKey:UUID,label,filters,filterSchemaVersion=1`), `PATCH /api/v1/marketplace/saved-searches/:id`(`expectedRevision`, 키), `DELETE /api/v1/marketplace/saved-searches/:id`(버전·키), `GET /api/v1/marketplace/saved-searches/:id/results?cursor=&limit=50`. 응답 `id,revision,normalizedFilters,receiptId,updatedAt` 또는 `items,nextCursor,liveAsOf`. 오류 400/401/403/404(타인·미존재 구별 방지)/409(중복·버전·키 충돌)/429/503. 회원 ID는 요청에서 받지 않고 서버 세션에서만 추출. Next.js 동일 출처와 Android `/app-api/v1/*`가 세션·CSRF·오류 계약을 동일하게 지킨다.
- **제안 DB(마이그레이션 번호는 개발 예약이 별도 확정):** `member_market_saved_searches(id uuid PK,user_id uuid FK users,label text,filter_schema_version smallint CHECK(=1),normalized_filters jsonb CHECK(object),filter_fingerprint bytea,revision bigint CHECK(>0),deleted_at,created_at,updated_at)`; 활성 행 부분 UNIQUE `(user_id,filter_fingerprint) WHERE deleted_at IS NULL`; 본인 목록 인덱스 `(user_id,updated_at DESC,id DESC) WHERE deleted_at IS NULL`. 불변 `member_market_saved_search_receipts(id uuid PK,user_id,search_id,request_key uuid,payload_digest bytea,result_revision bigint,result_kind text,created_at)` 및 UNIQUE `(user_id,request_key)`. 계정 탈퇴·병합·보존 정책에 맞춰 FK·소프트 삭제 검토. 매물 스냅샷이나 판매자 개인정보를 저장하지 않는다.
- **원자성·잠금 순서(AGENTS.md Migration 045):** 입력 검증 → **영수증 조회 전에** 멱등 UUID에 대한 트랜잭션 advisory lock 획득 → 원본 본문 지문·소유자 검증 → 회원 `users` 행 `FOR UPDATE`로 활성 20건 한도 직렬화 → 저장 검색 행 잠금·본인/기대 버전 재검증 → 버전형 JSON 지문·부분 UNIQUE 검사 및 변경·불변 영수증을 한 트랜잭션으로 확정. 동일 키·동일 본문 재시도는 최초 영수증 반환, 동일 키·다른 본문은 409. 삭제는 묘비 처리, 재등록은 새 요청 키. SECURITY DEFINER 함수는 `search_path` 고정, PUBLIC EXECUTE 회수, 앱 역할 광범위 직접 DML 금지. 기존 마켓 매물·원장·WLD·에스크로·보유 아이템을 수정하지 않는다.
- **실제 매물 검색:** `status='ACTIVE'`, 검증된 카테고리·문자열·정확한 NUMERIC 가격 조건을 SQL에서 **먼저** 적용. 최신순 `created_at DESC,id DESC`, 가격순 `price_wld ASC|DESC,created_at DESC,id DESC`. `(status,created_at DESC,id DESC)` 및 `(status,category,price_wld,id)` 등 인덱스는 실측 EXPLAIN·분포 검토 후 확정. HMAC 커서에 회원·검색 ID·필터 지문·정렬·전체 마지막 튜플·15분 만료·키 버전·원천 세대를 결합. 필터·버전 변경 시 409 후 재조회. **실시간 결과**라 동시 판매·취소 시 페이지 간 전체 스냅샷 완전성을 보장하지 않으며 별도 불변 매니페스트 검증 없이는 완전하다고 주장하지 않는다. 동일 시각·동일 가격·10,001행 테스트 필수.

### 관리자·보안·SEO·모바일·지표
- **관리자:** 활성 검색 수, 한도 실패, 검색 오류율 등 비식별 통계만(k>=20 미만 숨김). 회원 키워드·ID·검색 이력을 관리자 화면/분석 로그에 노출하거나 관리자가 임의 수정하지 않는다. 탈퇴·병합·보존·삭제는 명시적으로 감사하며 FK CASCADE만으로 완료했다고 주장하지 않는다.
- **보안/악용:** API·DB 양쪽 소유권(BOLA) 검증, user_id 입력 금지, SQL 파라미터·LIKE 이스케이프·쿼리 비용 제한, 회원당 20건, 변경 5회/분·검색 30회/분(초기 테스트 목표), 페이지 최대 50, 키워드 비로그, CSRF, XSS 이스케이프, 외부 URL 요청 없음. 본인 데이터 `Cache-Control: private,no-store`, `noindex,nofollow`, 사이트맵 제외; 공개 매물 SEO 유지. 판매자 비공개 정보 미노출.
- **모바일/a11y:** 키보드로 조작 가능한 필터·대화상자, 44px 터치 영역, 초점 표시, 입력 오류 요약, 로딩/빈 목록/실시간 상태 알림, 모션 감소, 1열 모바일 재배치 및 WCAG 2.2 AA. Android 앱 API에서 버전·커서·가격 문자열·409/429/503 동일. KPI는 검증 저장률, D7/D30 재방문, 검색 p95, 허위 성공 0, 한도/409/503, 삭제율, **실제 정산 영수증 확인 후에만** 탐색→구매 전환. 매출/유지율 상승은 관측 전 `HYPOTHESIS`.
- **배포·롤백:** `marketplace_saved_searches_v1=OFF` 기본. P0 모의 매물·허위 잔액·구매 성공 표시 정정 전 회원 노출 금지. 별도 개발 브랜치·순방향 마이그레이션·격리 DB 권한/원장 회귀·전체 CI/감사·정확 SHA Test 인증 금융 E2E·독립 복원 검증 후 1%→10%→100% 단계적 승격. 장애 시 기능 OFF·CTA 숨김, 승인된 보존 정책에 따라 회원 검색 메타데이터 유지; 매물·원장 롤백/삭제 금지. 기획 회차에서는 런타임·운영 변경 없음.

### P0/P1 개발 인계 및 수용 조건
| 우선순위 | ID | 구체적 완료 조건 |
| --- | --- | --- |
| P0 | ENV1284-01 | 루트 98%/2.3GiB 공간, 격리 DB·복원 검증; 다른 작업자 파일 삭제 금지. |
| P0 | SEC1284-02 | DB 앱 최소권한·PUBLIC 함수 회수·본인 검증 및 타 회원 100건 부정 테스트. |
| P0 | REL1284-03 | QA v1276 FAILED/HOLD, 감사·Migration 266/280·경로 원장·정확 SHA Test/롤백 게이트. |
| P0 | MKT1284-04 | `INITIAL_MARKET_LISTINGS`·임의 `1000` WLD·타이머 구매 성공 제거/차단 및 실제 영수증 검증. |
| P1 | MKT1284-05 | 버전형 검증 검색 DB, 20건 한도, 정규화 지문·부분 UNIQUE·본인 인덱스. |
| P1 | MKT1284-06 | 원자적 저장/수정/삭제, 잠금 순서, 불변 영수증·버전 CAS·멱등 409. |
| P1 | MKT1284-07 | 서버 ACTIVE 선필터·정확한 가격·유일 정렬·서명된 실시간 커서. |
| P1 | MKT1284-08 | NestJS/Next.js/Android API 계약·인증·CSRF·오류·비캐시 동등성. |
| P1 | MKT1284-09 | 회원 UX·관리자 k>=20·개인정보/SEO/WCAG 2.2 AA·관측 기반 KPI. |
| P1 | MKT1284-10 | 동시 저장 100건·BOLA 100건·동률 10,001건·허위 구매 방지·Test/롤백. |

- **최신 QA:** v1276(2026-10-25 21:27 KST) FAILED/HOLD. 정확 main 빌드·타입검사·린트 PASS, 프론트 1,397 통과/6 실패, 운영/전체/봇 의존성 감사 FAIL, 개발 DB 241개 중 235개 앱 직접 쓰기 가능·PUBLIC 은행 함수 3개, Migration 266 체크섬 불일치, 루트 98%/2.3GiB, 정확 SHA 인증 금융 Test E2E·독립 복원 미검증. 운영 DB 권한이나 실제 마켓 사고로 일반화 금지.
- **외부 근거 게이트:** PostgreSQL(LIMIT/OFFSET), OWASP(API BOLA), W3C(WCAG 2.2) 발행기관 3곳 자료 검토; **신규 최종 승인 0건**, 중복 제거 누적 승인 **미확인**, 목표 **10,000건**, **BLOCKED / IN PROGRESS**. 검토≠승인. 공식 링크: https://www.postgresql.org/docs/current/queries-limit.html ; https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/ ; https://www.w3.org/TR/WCAG22/ .


## v2026.10.25.1282 — F675-127 상담 대화록 스냅샷·상태 변경 무결성 보완 (기능 보완 / DRAFT / RELEASE HOLD)

### 기준·실제 코드 확인
- **회차:** 이전 기능 추가 v1280 → 현재 기능 보완 v1282 → 다음 기능 추가 v1284(잠정). 시작·중간에 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 확인. AGENTS.md, README.md, 영문 canonical PROJECT_PLAN.md 및 한국어 대조. 선행 미병합 Draft #1324 기반, 개발 [#1323](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1323) 인계. QA·개발 A/B/C·Gemini의 작업과 분리한 **문서 전용** 회차.
- **실제 근거:** Migration 196의 `support_add_message`와 `admin_support_reply`는 메시지 INSERT 후 상담 상태·`last_message_at`을 무조건 갱신함. 두 함수의 멱등키 조회는 INSERT 전에 수행되어 같은 키 동시 요청에서 기존 영수증 대신 고유 제약 `23505`가 발생할 위험이 있음. `admin_support_set_status(p_actor,p_thread,p_status)`는 요청 키가 없는 3인자 boolean 함수이며 상태가 변하지 않아도 감사 기록을 남김. 메시지 `created_at`은 상담 행 잠금 전에 `clock_timestamp()`로 생성되므로 먼저 시작한 요청이 늦게 행 잠금을 획득하면 `last_message_at`을 이전 시각으로 되돌릴 수 있음. 이는 **소스 기반 경합 위험**이지 운영 사고가 확인된 것은 아님. 기존 회원 메시지는 시간 오름차순 200건 요청(SQL 최대 500건)이어서 후속 대화가 누락될 수 있음. `SupportRepository`의 일반 `Queryable` 연속 조회는 단일 REPEATABLE READ 스냅샷을 보장하지 않음.

### 상태 변경·멱등성·DB 원자성
- **상담별 직렬화:** 향후 회원 답변, 관리자 답변, 관리자 상태 변경의 모든 쓰기 경로에서 상담 행을 `FOR UPDATE`로 먼저 잠그고 회원·관리자 권한, 활성·동의 상태, 요청 키·페이로드, 현재 상태를 잠금 내부에서 재검증. 메시지 INSERT, 실제 상태 변경 시 불변 이벤트 추가, 감사 기록 및 `last_message_at=GREATEST(기존 값, 잠금 후 확정 시각)`을 **단일 DB 트랜잭션**으로 처리. 잠금 전에 생성된 시각이나 UUID를 이벤트 순서로 사용 금지. 상담별 `event_seq`를 동일 잠금 아래 증가시켜 순서 확정; 기존 메시지 표시용 `created_at`은 임의 수정 금지.
- **상태 값:** 실제 허용값은 `open/waiting_user/resolved`. 기존 `admin_support_set_status`는 3인자 boolean이므로 새로운 멱등 상태 변경은 **버전이 구분된 함수/API**가 필요함. 기존 반환 계약을 조용히 바꾸지 않음. UUID 요청 키+정규화 페이로드 지문을 회원·상담·이전/다음 상태에 결합; 동일 재시도 원래 영수증 반환, 다른 내용 재사용 409. 상태가 그대로인 요청은 `unchanged`로 응답하고 가짜 전이 기록 금지. 세 쓰기 경로를 공통 잠금·이력 함수에 수렴시키며 상담 생성은 과거 상태가 없는 `initial_observation`으로만 표기.
- **제안 스키마:** 상담별 행 잠금 기반 `event_seq` 또는 `support_thread_event_clock(thread_id PK FK,next_seq BIGINT CHECK(next_seq>0))`; `support_status_events(id UUID PK,thread_id FK,seq BIGINT,actor_id UUID NULL,old_status TEXT NULL,new_status TEXT NOT NULL,origin TEXT,request_key UUID NULL,payload_digest BYTEA NULL,changed_at timestamptz)`. CHECK: `initial_observation`이면 이전 상태/요청 키 NULL, `recorded`이면 둘 다 NOT NULL; 허용 상태값 CHECK, UNIQUE(thread_id,seq), 요청 키 NULL 제외 부분 UNIQUE(thread_id,request_key), INDEX(thread_id,seq,id). 개인정보 삭제·보존 정책에 따른 FK 처리 검토. `moneyverse_app`에 테이블 DML 직접 부여 금지, SECURITY DEFINER 함수에 고정 search_path·PUBLIC EXECUTE REVOKE·DB 내부 본인/관리자 확인.

### 스냅샷·커서·내보내기 진실성
- **동일 DB 연결:** 기존 `queryRows`를 풀에 연속 호출해도 한 스냅샷이 아님. 새 다운로드는 `connect()` 가능한 `PoolClient`를 고정하고 `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY` → 본인 확인·건수·본문·상태 이벤트·digest를 동일 연결에서 조회 → COMMIT/ROLLBACK → finally release. 제한 시간·쿼리 타임아웃 설정, 트랜잭션 연결이 없으면 실패로 처리. 기본 READ COMMITTED 트랜잭션 도우미를 스냅샷 보장으로 오인하지 않음. HTTP 페이지를 넘기는 동안 DB 트랜잭션을 열린 채 유지하지 않음.
- **여러 요청 간 완결성:** `snapshotAt` 또는 `created_at<=snapshotAt`만으로는 안정된 전체 이력이 보장되지 않음. 과거 시각에 INSERT한 거래가 나중에 COMMIT될 수 있기 때문. 안정된 다중 페이지 내보내기는 본인 전용 불변 스냅샷 매니페스트(`snapshot_id`, 회원·상담, 원천 revision/건수, canonical 바이트 digest, 생성/만료, 익명화 세대)를 구체화하거나 검증된 커밋 순서 워터마크를 사용해야 함. 이 장치 전에는 페이지별 **현재 조회**로만 표시하고 전체 인증본으로 주장 금지. HMAC 커서에는 회원·상담·스냅샷 ID·필터·마지막 정렬키·만료·키 버전을 결합; 탈퇴·익명화·권한 해제·만료 시 409로 무효화하고 새로고침 안내. 동시 답변으로 인한 누락·중복을 조용히 허용하지 않음.
- **다운로드 상한:** 메시지 10,000건·UTF-8 2MiB·30초를 HTTP 200 헤더 송신 **전** 검증. 초과하면 불완전 파일을 보내지 않고 413과 페이지 보기 안내. UTF-8 TXT는 버전·상담 ID·UTC 시각·순차번호·제어문자 이스케이프·`HISTORY_PARTIAL`·`REDACTED`를 포함. SHA-256은 반환 파일의 바이트 무결성만 뜻하며 외부 공증이나 과거 이력 완결성을 뜻하지 않음. 동일 불변 스냅샷 100회 재다운로드 시 동일 바이트/digest. 본문 로그·이메일·영구 공유 링크·CDN 캐시 금지. Next 동일 출처와 Android App API에서 snapshotId/digest/상태/401·404·409·413·429·503 계약 동등성 보장.

### 회원·관리자·보안·모바일·배포
- 기존 `/support` → `/support/transcripts/[threadId]`. 화면 상태 `LOADING/READY/HISTORY_PARTIAL/EXPORT_TOO_LARGE/REDACTED/STALE_SNAPSHOT/UNAVAILABLE`, 409 발생 시 `스냅샷 새로고침`, 서버가 다운로드 가능하다고 검증한 경우에만 `TXT 다운로드` 활성. 기존 상담·관리자 기능 하위 호환, 가짜 성공 금지. 모바일·키보드·포커스·live region·대비·터치 타깃 WCAG 2.2 AA. 본인 페이지 noindex/nofollow/no-store·사이트맵 제외.
- 활성 회원·동의·세션·DB BOLA/BFLA, 변경 API CSRF, 회원 시간당 5회·서비스 분당 20회 내보내기 제한, ID 추측·과도한 스냅샷 생성 탐지. 관리자 통계는 k>=20 집계만, 본문/회원 식별자는 KPI 기록 금지. KPI: 스냅샷 성공률·p95·409·413·이력 불완전 비율·이벤트 누락/중복 0·타인 접근 누출 0·익명화 무효화 시간·`last_message_at` 역행 0.
- **향후 테스트:** 동일 키 회원/관리자 답변 100개와 관리자 상태 요청 100개 경합 → 원래 영수증/실제 전이 1회, 23505 누출·중복 0. 먼저 생성된 메시지의 잠금 지연에도 `last_message_at` 역행 0. 타 회원 100회 누출 0. 10,001건·2MiB 초과 → 413, HTTP 200 부분 파일 0. 늦은 COMMIT·페이지 사이 신규 답변·삭제/익명화/세션 해제 → 스냅샷 고정 또는 명시적 409. 동일 스냅샷 100회 바이트/digest 동일. 실제 격리 PostgreSQL ACL 부정 테스트, Next/Android 회귀·정확 SHA Test·기능 OFF 롤백. **이번 기획에서 실행하지 않음.**
- **운영:** 기본 `support_transcript_export_v1=OFF`. 번호 충돌 없는 forward-only 마이그레이션, 격리 DB 복원·권한 검증, 공식 정확 SHA CI/전체 보안 감사/금융 Test E2E/QA 승인 후 1%→10%→100% 점진 활성화. 문제 발생 시 스위치 OFF; 감사 대상 이력을 임의 삭제하여 롤백하지 않음. 이번 회차 런타임·DB·WLD·원장·Test·Production 변경 없음.

### P0/P1 개발 인계
| 우선순위 | ID | 수용 조건 |
| --- | --- | --- |
| P0 | ENV1282-01 | 루트 98% 용량 위험, 데이터 볼륨·격리 Test/DB·복원 증빙, 다른 작업자 보존. |
| P0 | SEC1282-02 | 본인/관리자 SECURITY DEFINER, PUBLIC 권한 회수, 앱 최소권한, 익명화. |
| P0 | REL1282-03 | 최신 QA v1275 FAILED/HOLD, Migration 266/280, 전체 감사, 인증 금융 E2E·롤백. |
| P0 | SUP1282-04 | 실제 상태/시각 역행·23505·no-op 감사 위험, 버전형 API 하위 호환. |
| P1 | SUP1282-05 | 고정 PoolClient 읽기 전용 REPEATABLE READ 및 불변 스냅샷/페이지 진실성. |
| P1 | SUP1282-06 | 상담 잠금 순차번호·3개 쓰기 경로 원자적 전이·멱등 영수증·시각 역행 방지. |
| P1 | SUP1282-07 | 버전형 NestJS·Next·Android 본인 API, 커서/409/413·비공개 헤더. |
| P1 | SUP1282-08 | 상담 이력/스냅샷 CTA, 모바일 WCAG AA, 불완전/익명화/초과 상태·noindex. |
| P1 | SUP1282-09 | 개인정보·보존·계정 병합, 관리자 k>=20, 악용 방지, KPI. |
| P1 | SUP1282-10 | 격리 PG 동시성·지연 COMMIT·digest·BOLA·10,001건·정확 SHA·롤백. |

- **최신 QA:** v1275(2026-10-25 20:24 KST) FAILED/HOLD. 정확 main build/typecheck/lint PASS, frontend 1,397 통과/6 실패, 전체·운영·봇 의존성 감사 FAIL, route-ledger 통합 inventory 누락, 개발 DB 권한/Migration 266 문제 지속. 공개 smoke 200이나 Test/Production SHA는 최신 main이 아님. 루트 98%(약 2.5GiB 여유). QA #1317 후보 PASS만으로 운영 승인 불가.
- **외부 독립 레퍼런스 게이트:** 독립 발행 자료 10,000건의 중복 제거·출처·근거 적합성 분류 필수. 이번 회차 신규 최종 승인 **0건**, 누적 검증 **미확인**, 목표 10,000건, **BLOCKED / IN PROGRESS**. 내부 기획서는 외부 근거로 집계 금지.


## v2026.10.25.1280 — F675-127 회원 전용 상담 대화록 내보내기 및 상태 변경 이력 (기능 추가 / DRAFT / RELEASE HOLD)

### 기준 문서·실제 구현 확인·범위
- **회차:** 이전 기능 보완 v1278 → 현재 기능 추가 v1280 → 다음 기능 보완 v1282(잠정). 시작·중간에 `main` `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 재확인. `AGENTS.md`, `README.md`, 영문 원본 `PROJECT_PLAN.md`, 한국어 대조 문서 검토. 선행 Draft PR #1316 미병합. 이번 변경은 **기획 문서만** 수정하며 runtime/DB/WLD/원장/기능 스위치/Test/Production을 변경·배포하지 않음.
- **실제 확인:** `frontend/src/app/support/page.tsx`에 회원 상담 목록·선택 대화·답장이 이미 존재함. `backend/src/support/support.repository.ts`는 회원 상담 목록 기본 50건, 메시지 200건(관리자 500건)으로 제한. `packages/database/migrations/196-user-admin-support-chat.sql`은 LIMIT만 사용하고 키셋 페이지네이션이 없음. `admin_support_set_status`는 현재 상태를 갱신하고 일반 관리자 감사 이벤트를 남기지만 회원이 확인할 수 있는 이전/이후 상태 이력은 없음. 현재 `support.controller.ts`에 본인 대화록 내보내기 API가 없음. 과거 메시지·상태 전체 복원이 가능하다고 주장하지 않음.
- **경계:** 기존 1:1 상담·운영자 판단은 그대로 유지. 신규 기능은 본인 전용 UTF-8 TXT 대화록과 페이지별 메시지·상태 이력 조회. WLD 보상·거래·공개 공유·이메일 발송·첨부·알림 발송은 제외. 기존 API 하위 호환 유지. QA Draft #1317, 개발 A/B/C, Gemini의 변경과 분리.

### 목적·대상·권한·진입점·화면
- **목적:** 목록/메시지 조회 상한으로 일부가 보이지 않는 상황을 해소하고, 실제 기록된 상담 내용과 상태 변경만 회원에게 제공. 대상은 로그인·동의 완료·활성 회원. 관리자는 기존 관리자 권한 범위 내에서만 사건 조회; 신규 관리자 일괄 다운로드는 제공하지 않음.
- **진입:** `/support`의 상담 카드에서 `전체 이력 보기`, `대화록 TXT 다운로드` CTA. 신규 `/support/transcripts/[threadId]`에서 제목, 기준 시각, 현재 상태, 기록된 상태 타임라인, 메시지 페이지네이션, 다운로드 버튼. 빈 목록/로딩/권한 없음/삭제됨/용량 초과/장애/이력 불완전/성공을 구분해 안내. 서버가 본인·상담 ID를 확인한 경우에만 다운로드 성공 표시.
- **화면 상태:** `LOADING → READY | EMPTY | HISTORY_PARTIAL | EXPORT_TOO_LARGE | ACCESS_DENIED | UNAVAILABLE`, 다운로드 `IDLE → GENERATING → READY | FAILED`. 도입 이전 상태는 `HISTORY_PARTIAL`로 표기하며 임의로 과거 상태 변경을 만들어내지 않음.

### API·앱 연동·내보내기 규약
- 기존 `/api/v1/support/threads`, `POST /threads`, `/threads/:id/messages`, 관리자 답변·상태 API 유지. 신규 본인 전용 `GET /api/v1/support/threads/history?limit=20&cursor=...`, `GET /api/v1/support/threads/:id/transcript?limit=100&cursor=...`(메시지·상태 이력 별도 서명 커서, 이력 완결성), `GET /api/v1/support/threads/:id/transcript/export`(`text/plain; charset=utf-8`, attachment, private/no-store, nosniff, 스냅샷 지문). 미인증 401, 타 회원/없는 상담 구분 없이 404, 커서 만료 409, 용량 초과 413, 제한 429, 장애 503. UUID·조회 한도·서명 검증. 클라이언트의 SQL 필터를 신뢰하지 않음.
- Next.js는 서버 전용 `frontend/src/lib/api.ts` 경로만 이용. 다운로드는 동일 출처의 인증된 Next Route Handler를 경유하고 `INTERNAL_API_TOKEN`을 브라우저에 노출하지 않음. 공개 캐시/CDN/영구 다운로드 URL/외부 리디렉션 금지. Android App API도 본인 확인, 메타데이터, 커서, 다운로드, 오류 상태를 동일하게 지원하도록 별도 계약 테스트 명세.
- 키셋 커서는 회원·상담·필터·마지막 `(created_at,id)`·스냅샷 경계·만료·HMAC 키 버전을 포함하고 매 페이지마다 권한 재검증. 메시지는 `(created_at ASC,id ASC)`, 상태는 `(seq ASC,id ASC)` 정렬. 새 다운로드는 읽기 전용 `REPEATABLE READ` 트랜잭션의 단일 스냅샷으로 생성. `snapshotAt`, 실제 건수, 정규화한 TXT의 SHA-256을 제공하되 이는 **파일 바이트 무결성**이지 외부 공증이나 과거 완전성 보증이 아님. **최대 메시지 10,000건/2MiB/30초** 초과 시 413과 페이지 조회 안내; 잘라낸 파일을 완전본으로 표시 금지. UTF-8 한글 보존, CRLF→LF, 제어문자 이스케이프, 불완전한 상태 이력 경고 헤더. CSV/HTML 내보내기 금지.

### DB 제약·인덱스·트랜잭션·관리자
- 제안 테이블 `support_status_events(id uuid PK, thread_id uuid FK, actor_id uuid FK, seq bigint NOT NULL, old_status text NULL, new_status text NOT NULL, changed_at timestamptz NOT NULL, request_key uuid NOT NULL, origin text CHECK(origin IN ('recorded','initial_observation')))`; 상태 값은 `open/waiting_user/resolved`, `UNIQUE(thread_id,seq)`, `UNIQUE(request_key)`, 변경 불가 append-only, 인덱스 `(thread_id,seq,id)`. 회원 목록 인덱스 `(user_id,last_message_at DESC,id DESC)`는 기존 것을 재사용. `initial_observation`은 old_status NULL 및 `HISTORY_PARTIAL`만 허용, `recorded` 전이는 old_status 필수. 기존 과거 변경을 임의로 복원하지 않음. `moneyverse_app`에 테이블 DML 부여 금지; 소유자 검증 `SECURITY DEFINER` 함수, 고정 search_path, PUBLIC REVOKE와 함수 EXECUTE만 부여.
- 향후 개발 시 `admin_support_set_status`에서 상담 행 `FOR UPDATE` 잠금 → DB 관리자 권한 확인 → 이전 상태 확인 → 새 상태·이벤트·관리자 감사 기록을 **단일 트랜잭션**으로 확정. 요청 키 멱등성(동일 재시도는 동일 영수증, 다른 페이로드 재사용 409), 상담별 seq 단조 증가. 답장으로 상태가 바뀌는 `support_add_message`, `admin_support_reply`도 같은 트랜잭션에 상태 이벤트 기록 필수. 변화가 없으면 허위 전이 기록 금지. 오래된 일반 감사 로그로 완전한 이력이라고 추정하지 않음.
- 상담 본문은 민감정보 포함 가능. 본문 로그·검색 색인·외부 저장소·관리자 일괄 다운로드 금지. 승인된 탈퇴/보존 정책에 따라 익명화·삭제 시 `REDACTED`를 표시하고 로그에서 복구하지 않음. 계정 병합은 소유권 이전·이력 정책 승인 전까지 차단. 관리자는 식별 불가능한 k>=20 집계만 조회; 기존 관리자 역할 검증 유지.

### 보안·SEO·모바일·접근성·지표·테스트·배포
- 활성 회원·동의·세션 검증, DB 함수 내부 BOLA/BFLA, 향후 쓰기 CSRF, 내보내기 **회원당 시간당 5회 / 서비스 전체 분당 20회**(운영 조정), 타인 ID 추측 방지, MIME/no-store/CSP, 영구 공유 링크 금지. 관리자 쓰기는 기존 AdminGuard/AdminSessionGuard와 DB 권한 동시 확인. 분석 이벤트에는 본문·회원 식별자 미기록.
- 반응형 화면, 키보드 조작, 포커스·상태 안내 live region, `TXT 다운로드` 명확한 CTA, 상태 이력 일부 누락 경고, UTC 원천 시각+현지화 표시, WCAG 2.2 AA. 개인 화면은 noindex/nofollow·사이트맵 제외·no-store.
- KPI: 본인 인증 다운로드 성공률, `HISTORY_PARTIAL` 비율, 내보내기 p95, 413 비율, 타 회원 접근 차단률, 기능 도입 이후 상태 이벤트 누락 0건 목표. k<20 집계 비공개; 다운로드 횟수를 상담 해결로 간주 금지.
- 검증 조건: 타 회원 조회 100회 정보 유출 0건, 관리자 상태·답변 동시 변경 100회 정확한 순차 이벤트, 합성 메시지 10,001건은 명시적 413 또는 누락 없는 페이지 조회, 한글/제어문자/2MiB/30초, 변경 없는 원천 100회 다운로드 동일 digest, 신규 메시지 후 새 스냅샷·digest, 탈퇴/병합/권한 변경/만료 커서/401·404·409·413·429·503. 실제 PostgreSQL 앱 계정 최소권한 부정 테스트, Android·Next 계약·회귀 테스트. **이번 기획에서 runtime 테스트는 실행하지 않음.**
- 기본 기능 스위치 `support_transcript_export_v1` OFF. 격리 Test·백업 복원 확인 후 마이그레이션/권한/상태 기록 검증, 공식 exact-SHA CI·보안 감사·금융 E2E·DB ACL·Migration 266/280 정합성·QA 승인 후 1%→10%→100% 점진 활성화. 오류·지연 시 스위치 OFF로 롤백, 불변 상태 이력 삭제 금지. Production RELEASE HOLD.

### P0/P1 실행 백로그 및 외부 근거 게이트
| 우선순위 | ID | 수용 조건 |
| --- | --- | --- |
| P0 | ENV1280-01 | 루트 용량·격리 DB/Test·백업 복원 증빙. |
| P0 | SEC1280-02 | DB 최소권한·본인 SECURITY DEFINER·관리자 역할·PUBLIC 권한 제거. |
| P0 | REL1280-03 | 정확 SHA CI/보안/Test E2E·Migration 266/280·롤백 게이트. |
| P0 | SUP1280-04 | 현재 50/200/500건 상한·과거 상태 출처 확인·HISTORY_PARTIAL 표시. |
| P1 | SUP1280-05 | 본인 키셋 페이지·단일 스냅샷 TXT 10k/2MiB·digest. |
| P1 | SUP1280-06 | 관리자 변경·답변의 원자적 불변 상태 이력. |
| P1 | SUP1280-07 | NestJS API·Android App API 동등 계약·오류/스트림. |
| P1 | SUP1280-08 | Next.js 상담/이력/다운로드 CTA·상태·모바일/a11y. |
| P1 | SUP1280-09 | 개인정보·보존·관리자 k>=20·SEO·KPI. |
| P1 | SUP1280-10 | 실DB 동시성/BOLA/10,001건/한글/exact-SHA Test/롤백 회귀. |

- **QA/운영:** 최신 완료 QA v1273 FAILED/HOLD. QA Draft #1317 후보 SHA의 로컬 frontend 1404/1404 PASS 및 운영 의존성 감사 PASS는 확인되나 개발 의존성 감사 Critical 2/High 8, 공식 CI·정확 SHA Test·DB 복원 미확인. 실행 시작 시 루트 디스크 98%(여유 약 2.6GiB), 개발 DB 앱 계정 권한 과다 및 Migration 266/280 미해결. 운영 승인 불가.
- **외부 독립 레퍼런스 10,000건 게이트:** 실제 독립 출처의 중복 제거·근거 분류·적합성 검증 필수. **신규 승인 0건, 누적 승인 수 미확인, 목표 10,000건, BLOCKED/IN PROGRESS**. 내부 기획 문서는 독립 외부 근거로 집계 금지.
- **개발 인계:** [이슈 #1323](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1323), 별도 개발 브랜치·정확 SHA Test 게이트. 이번 기획에서 병합·배포 없음.


## v2026.10.25.1278 — F675-126 계산기 시나리오 출처·재계산·승격 무결성 보완 (기능 보완 / 초안 / 운영 보류)

### 회차·정본·실제 코드 검증
- 이전 Feature Addition v1276 → 현재 Feature Improvement v1278 → 다음 Feature Addition v1280(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 확인, AGENTS.md·README.md·영문 PROJECT_PLAN 정본·국문 대조 검토. 미병합 Draft #1310에 종속되는 문서 후보, 개발 [#1309](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1309). QA v1273 FAILED/P0 HOLD. 런타임·DB·WLD·원장·Test·운영 미변경.
- **실제 불일치:** `CalculatorScenarioData.type`는 stock/retirement/pension/isa/tax만 지원하지만 복리 및 대출이자 계산기 모두 `type:'stock'`을 전송한다. 따라서 type·ticker·제목은 계산기 식별 증거가 아니다. 대출 `details`에는 상환방식 `repaymentType`이 없고, 복리 입력은 통화기호 포함 문자열이며, 퇴직금 `details`에는 원천 입력과 계산 결과가 섞인다. 현재 저장값으로 정확한 재계산을 보장할 수 없다.
- **실제 불일치:** `calculator-save-action.tsx`는 제목 또는 ticker로 저장 여부를 판단하고 제목으로 중복 제거하여 같은 제목의 서로 다른 입력을 덮어쓴다. 예외에서도 저장 성공 상태를 표시하고 브라우저 쿠키/로컬 저장소로 로그인 여부를 추정하며, main에 없는 `/api/portfolio/watchlist`로 비동기 요청한다. `watchlist-promotion-engine.tsx`는 실패/비정상 HTTP에서도 승격 성공 플래그를 설정한다. `calculator-retention-funnel.tsx`는 로컬 상태만으로 알림 설정·10,000 WLD 지급 예약을 표시한다. 이를 서버 확정 사실로 간주하지 않는다.
- **경계:** F675-126은 회원 전용 계산기 입력 보관함이다. 주식 관심종목·거래·보상·알림·세금 공식 인증·계정 간 이전 기능이 아니다. QA 계산기/링크 PR #1306, 개발 C 관심종목 PR #1308 및 Gemini/A/B 담당 런타임 변경과 분리한다.

### 입력 출처·회원 흐름·재계산
- 계산기별 안정적인 `calculatorId`, `inputSchemaVersion`, `formulaVersion`, `locale`, `currencyCode`를 사용하는 **명시적 어댑터 등록부**를 설계한다. 기존 type/title/ticker/출력값에서 계산기 종류를 추론하지 않는다. 복리·대출·퇴직금은 실제 입력 폼에서 모든 독립변수·단위를 추출하고 현행 엔진과 왕복 재계산을 검증한 후에만 지원한다. 대출은 상환방식·원금·금리·기간·빈도가 필수이며 총상환액에서 상환방식을 역산하지 않는다. 숫자는 정밀 10진 문자열/열거형으로 저장하고 계산 결과는 표시용일 뿐 원천 입력이나 과거 견적의 증거가 아니다.
- 누락·오표기된 `type:'stock'` 로컬 초안은 `UNSUPPORTED_LEGACY`, 상환방식 누락·문자열 역변환 불가는 `REPLAY_UNAVAILABLE`, 수식 개정은 `FORMULA_CHANGED`로 분리한다. `LOCAL_ONLY`, `AUTH_REQUIRED`, `SAVING`, `SYNCED_VERIFIED`, `CONFLICT`, `OFFLINE_UNCONFIRMED`, `DELETED`와 혼동하지 않는다. 검증된 입력만 현재 엔진으로 다시 계산하며 수식 버전·가정일·추정치/비금융조언 문구를 표시한다.
- 기존 /tools 저장 버튼, 회원 목록 /account/calculator-scenarios, 상세 /account/calculator-scenarios/[scenarioId]. CTA: 로컬 초안 미리보기·계정 저장·같은 키로 재시도·영수증 보기·재계산·이름 변경·삭제·선택 항목 가져오기. 서버 영수증과 본인 조회 결과가 소유자·시나리오 ID·버전·정규 지문까지 일치해야 `SYNCED_VERIFIED`. 네트워크 불명확 시 `OFFLINE_UNCONFIRMED` 유지, 성공 토스트 금지. 로그아웃/계정 전환 시 이전 회원 상태와 지연 응답을 격리한다.
- `wdmv_saved_scenarios`, `wdmv_calculator_watchlist`, `wdmv_scenarios_promoted`를 회원 보관함 데이터와 혼동하지 않는다. 로컬 가져오기는 **건별 미리보기·명시적 동의** 후 실행하며 자동 업로드하지 않는다. 제목/ticker가 아니라 계산기·스키마·정규 입력 지문으로 중복 판정하고 같은 제목의 다른 입력을 보존한다. 손상·과대·구형·위조·NaN·범위초과·개인정보 입력을 거부한다. 서버 영수증/재조회 전에는 로컬 원본을 삭제하거나 승격 플래그를 설정하지 않는다. 과거 승격 플래그는 계정 동기화 증거가 아니다. GET은 무부작용이다.

### API·DB·트랜잭션·보안
- NestJS 본인 전용 GET 목록/상세 및 POST/PATCH/DELETE `/api/v1/account/calculator-scenarios`, Android `/app-api/v1` 동등성. actor는 서버 인증 세션/앱 토큰으로만 결정하고 브라우저 쿠키 문자열 추정 금지. 브라우저 쓰기 CSRF·동의, 앱 토큰 범위 검증. 요청에 calculatorId·입력 스키마/수식 버전·통화코드·정규 inputs·제목·idempotencyKey 포함, 수정/삭제는 expectedRevision 필수. 응답은 불변 receiptId·scenarioId·소유 버전·입력 지문·확정시각·검증 상태를 반환하며 원문 입력은 영수증·로그·분석에 저장하지 않는다.
- JSON 필드 정렬·누락/null·소수점·단위·통화·수식 지문을 정규화하고 금액에 JS 부동소수점 왕복 변환을 금지한다. 알 수 없는 필드·범위 밖 숫자 거부. 요청 지문에는 회원·동작·대상 ID·기대 버전·계산기 ID/버전·정규 입력 포함. 같은 회원/키/지문 재시도는 **최초 확정 영수증**을 반환하고 키만 같고 내용이 다르면 409. DB 커밋 후 HTTP 응답 소실에도 중복 생성 금지.
- v1276의 추가형 테이블/인덱스 유지, 영수증 불변 트리거, `UNIQUE(user_id,request_key)`, `UNIQUE(user_id,id)`, 회원 활성 100건의 직렬화된 한도 잠금, `(user_id,deleted_at,updated_at DESC,id DESC)` 키셋 인덱스. `SECURITY DEFINER` 함수의 고정 search_path, 본인 검증, 앱 계정 직접 테이블 DML 및 PUBLIC EXECUTE 철회, 필요한 함수 EXECUTE만 부여. 잠금 순서는 회원→시나리오→영수증. 계정 병합/탈퇴는 원본·대상 모두 사전 검사하고 과거 소유권을 임의 이전하지 않는다.
- 서명 커서는 회원·세션·필터·정렬·가시성 세대·만료에 결합하며 변경/삭제 시 무효화한다. 401 미인증, 403 동의/CSRF, 404 타인/미존재, 409 버전·멱등 충돌, 413 8KiB 초과, 422 미지원 어댑터/수식/입력, 429 한도, 503 DB 장애. 실패 트랜잭션에는 성공 영수증이 없어야 한다.
- 관리자에는 k>=20 비식별 집계(확정 저장·구형 가져오기 거부·충돌·수식 불일치·삭제 지연)만 제공하며 원본 입력·제목·URL·회원 식별정보 열람 금지. 개인 목록/상세 noindex/no-store/사이트맵 제외, 공개 계산기는 canonical 색인 유지. 320px, 44px 터치, WCAG 2.2 AA, 스크린리더 오류·영수증 안내, 키보드 가져오기/충돌, 동작 감소, 배포 언어 전체(최소 QA 5개 언어) 문구 검증. 별도 영수증 없는 영구 동기화·알림·10,000 WLD 약속 금지.
- KPI는 서버 영수증 확정 저장률·기기 간 재계산 성공·가져오기 거부율·재조회 지연·구수식 비율·409/503·7일 재방문·삭제 SLA. 클릭·로컬 플래그·모달·성공 토스트·시도된 POST를 확정 저장으로 집계하지 않는다.

### P0/P1 개발 백로그·수용·운영
- **P0** `ENV1278-01` 루트 98%(여유 약 2.8GiB) 용량·작업자 파일 보존·DB 환경 격리·독립 복원. **P0** `SEC1278-02` 개발 DB 241개 중 235개 앱 DML, PUBLIC 은행 함수 3개 권한 축소·본인 SECURITY DEFINER·BOLA 실DB 음성 테스트(운영 권한 미확인). **P0** `REL1278-03` QA v1273 전체 Critical2/High10, 운영 High2, Migration266 체크섬/280 번호, CI·정확 SHA 인증 금융 Test E2E·격리 복원 차단 해결. **P0** `CAL1278-04` 허위 저장·승격·알림·보상 성공 표시와 계정 전환 지연 응답 차단(기존 QA/관심종목 담당 파일 중복 변경 금지).
- **P1** `CAL1278-05` 계산기별 입력 어댑터·스키마·수식 버전·legacy stock 오표기 판정. **P1** `CAL1278-06` 정규 지문·한도 직렬화·불변 멱등 영수증/재조회. **P1** `CAL1278-07` NestJS·Android 본인 API·서명 커서·오류 분류. **P1** `CAL1278-08` Next.js 회원 목록·상세·명시적 로컬 가져오기·로그아웃/재시도·접근성. **P1** `CAL1278-09` 개인정보·관리자 비식별·SEO·모바일/a11y·증거 KPI. **P1** `CAL1278-10` 실DB 권한 음성 테스트·중단/재시도·회귀·점진 배포/롤백.
- **향후 수용조건(미실행):** 복리/대출의 `type:'stock'`을 주식으로 가져오지 않음, 상환방식 없는 대출의 검증 재계산 금지, 동일 제목·상이 입력 유지, 손상/개인정보/NaN/지역화 숫자 검증, 동일 요청 100건 동시→영수증 1건, 타 회원 100건→누출 0, 합성 10,001건→커서 누락/중복 0, 한도·병합·탈퇴 경합, DB 커밋 후 응답 소실 재시도, 401/409/422/503·오프라인·교차 탭·로그아웃·5개 언어·320px·스크린리더 회귀. WLD·원장·주식 관심종목·알림 쓰기 0.
- **배포:** 기획만 변경, 기능 기본 OFF, 충돌 없는 전진형 DB Migration은 별도 개발 검토. 정확 SHA 공식 CI/보안/실DB 권한/인증 금융 Test E2E/격리 복원/GitOps 승인 후 <1%→5%→25%→100% 확대. 롤백은 UI/쓰기 비활성화, 불변 영수증/데이터 보존, 파괴적 역마이그레이션 금지. Production **RELEASE HOLD**.
- **외부 독립 레퍼런스 10,000건 게이트:** 독립 발행·정규 URL·중복 제거·실제 검토·근거 분류 승인 수량만 인정. 신규 승인 **0건**, 누적 승인 **미확인**, **BLOCKED / IN PROGRESS**. 표준 후보는 승인 수량이 아니다. 기존 국영문 통합 기획서에만 반영하고 신규 분산기획 파일 생성 금지.


## v2026.10.25.1276 — F675-126 회원 전용 검증형 계산기 시나리오 보관함 (기능 추가 / 초안 / 운영 보류)

### 회차 및 실증 근거
- 이전 Feature Improvement v1274 → 현재 Feature Addition v1276 → 다음 Feature Improvement v1278(잠정). main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 재확인, AGENTS.md·README.md·영문 PROJECT_PLAN 정본/국문 대조·실제 소스·열린 PR·QA v1272 검토. 선행 Draft #1304 미병합, 개발 인계 [#1309](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1309). 문서만 변경하며 런타임·DB·WLD·원장·Test·운영은 불변.
- **실제 확인된 결함:** frontend/src/components/calculator-save-action.tsx는 wdmv_saved_scenarios를 브라우저 localStorage에 최대 30건 저장하고, 브라우저 쿠키/저장소로 로그인을 추정하며, 오류에도 저장 성공을 표시하고 POST /api/portfolio/watchlist를 결과 확인 없이 호출한다. main에 대응 Next 라우트가 없다. 영구 동기화·알림·가입 10,000 WLD 보상 약속은 서버 영수증이 없는 미검증 문구이며 구현/승인된 기능으로 간주하지 않는다. calculator-retention-funnel.tsx와 watchlist-promotion-engine.tsx도 로컬 초안을 소비하므로 연계 교체가 필요하다.
- **목적·대상:** 인증 회원이 버전이 있는 개인 계산기 입력 시나리오를 기기 간 저장·재열기·이름 변경·삭제한다. 비회원은 브라우저 임시 저장임을 명시한다. 복리·대출이자·은퇴 계산기부터 실제 입력 스키마 확인 후 적용한다. 주식 관심종목·WLD·원장·보상은 변경하지 않는다. QA 계산기 링크 #1306, 개발 C 주식 관심종목 #1308, A/B·Gemini와 작업 영역 분리.

### 회원 흐름·화면·상태
- 기존 /tools 계산기와 CalculatorSaveAction에서 진입, 개인 목록 /account/calculator-scenarios, 상세 /account/calculator-scenarios/[scenarioId]. CTA: '내 계정에 저장', '저장한 시나리오', '다시 계산', '이름 변경', '삭제', '로컬 초안 가져오기'.
- 상태 LOCAL_ONLY, AUTH_REQUIRED, SAVING, SYNCED_VERIFIED, CONFLICT, STALE_CALCULATOR_VERSION, VALIDATION_FAILED, OFFLINE_UNCONFIRMED, DELETED, UNAVAILABLE. 서버 영수증의 소유자·ID·버전·정규 입력 지문이 일치할 때만 SYNCED_VERIFIED. 통신 불명확 시 UNCONFIRMED 및 안전한 재시도, 낙관적 성공 금지. 미검증 보상/알림 약속 금지.
- 로컬 초안은 건별 미리보기와 명시적 동의 후 가져온다. localStorage는 불신 입력이며 소유권·서버 저장 증거가 아니다. 손상/과대 JSON, 미지원 계산기·스키마, 범위 밖 단위/숫자, 스크립트 주입, 신원정보, 중복 키 거부. 로그인 시 자동 업로드 금지. 미지원 계산기는 '로컬 전용'으로 명시한다.

### API·DB·트랜잭션·보안
- NestJS 본인 API: GET /api/v1/account/calculator-scenarios?cursor&limit (1..50), GET /api/v1/account/calculator-scenarios/:id, POST /api/v1/account/calculator-scenarios, PATCH /api/v1/account/calculator-scenarios/:id, DELETE /api/v1/account/calculator-scenarios/:id. 본문 calculatorType 열거형, schemaVersion 양의 정수, 제목 1..80자, 허용 입력, idempotencyKey UUID; 수정/삭제 expectedRevision 필수. 영수증 id·소유 버전·정규 입력 지문·receiptId·savedAt·state. Android App API 동등성, actor는 서버 세션에서만 도출하고 쓰기 Consent/CSRF Guard 필수.
- 오류 401 미인증, 403 동의/CSRF/권한, 404 타인/미존재, 409 버전/키-본문 충돌, 413 8KiB 초과, 422 잘못된/구버전 스키마, 429 한도, 503 DB 장애. 회원·세션·필터·버전·만료에 묶인 서명 키셋 커서와 (updated_at DESC,id DESC) 정렬. 실제 확인되지 않은 개수 표시 금지.
- 번호 충돌 없는 추가형 Migration 제안: calculator_scenarios(id UUID PK, user_id UUID FK, calculator_type 허용 CHECK, schema_version 양의 int, title varchar(80), inputs jsonb 검증/8KiB 제한, revision 양의 bigint, input_digest bytea, created_at, updated_at, deleted_at); 인덱스 (user_id,deleted_at,updated_at DESC,id DESC), (user_id,id). calculator_scenario_receipts(id UUID PK, user_id FK, scenario_id FK, request_key UUID, request_fingerprint bytea, operation enum, revision bigint, canonical_digest bytea, created_at, UNIQUE(user_id,request_key)). 불변 영수증, 원본 민감 입력 복제 금지. 회원 활성 최대 100건, 회당 가져오기 최대 30건.
- SECURITY DEFINER 본인 검증 함수, 앱 역할 직접 테이블 DML 및 PUBLIC EXECUTE 철회. 회원 한도 행→시나리오 행 순서 잠금, expectedRevision CAS, 요청 키+본문 지문 확인. 같은 키·같은 본문은 최초 영수증 반환, 다른 본문은 409. 변경과 영수증 원자적 커밋, 실패 시 성공 영수증 없음. 계정 병합/soft-delete는 별도 사전 검증 및 개인정보 삭제 절차 적용.
- 입력 숫자 범위·단위·정밀도·수식 버전 허용 목록. 계좌번호·주소·식별번호·비밀번호·급여명세서·자유형 PII 저장 금지. 재무 입력도 개인정보이므로 승인된 암호화·보존·삭제 정책, 요청 본문 로그/분석 금지. 재열기 시 현재 계산 엔진으로 재계산하고 수식 버전·가정일·추정치 표시. 스키마 불일치 시 STALE_CALCULATOR_VERSION으로 표시하며 자동 강제 변환/현재 금융 견적 주장 금지.

### 관리자·SEO·접근성·KPI·배포
- 관리자 비식별 집계(저장 실패·한도·버전 오류·삭제 지연)만, k<20 집단 숨김; 개인 입력 열람·로그·문의 복제 금지. 공개 /tools canonical/색인 유지, 개인 목록·상세는 인증·noindex·no-store·사이트맵 제외·OpenGraph 유출 금지. 320px 반응형, 44px 이상 터치, WCAG 2.2 AA, 명확한 포커스/단위, aria-live 영수증, 키보드 가져오기/충돌 해결, 동작 감소, 5개 언어.
- 악용 방지: 회원별 분당 쓰기 12회, 회당 가져오기 30건, 활성 100건, 8KiB, CSRF/BOLA/BFLA, XSS 안전 제목, 재사용 요청 지문. 비회원 로컬 저장 서버 추적 금지. KPI 영수증 확인 저장률, 기기 간 재열기 성공률, 7일 재방문, 409/422/503, 가져오기 거부율, 삭제 SLA, 접근성 회귀. 로컬 클릭을 서버 저장으로 계산 금지.
- **P0** ENV1276-01 루트 용량·DB 격리·백업; SEC1276-02 최소권한·BOLA; REL1276-03 CI/감사/Migration/정확 SHA Test/복원; CAL1276-04 허위 브라우저 동기화·저장·보상 문구 정정. **P1** CAL1276-05 버전형 스키마/DB/영수증; CAL1276-06 원자적 CAS/멱등성/한도; CAL1276-07 NestJS·Android API; CAL1276-08 Next.js 개인 보관함·선택형 가져오기; CAL1276-09 개인정보·관리자·SEO·접근성·KPI; CAL1276-10 실DB 회귀·배포·롤백.
- 수용: 동일 요청 100건 동시 처리→영수증 1건, 타 회원 조회 100건→누출 0, 합성 10,001건→커서 누락/중복 0; 한도 경합·악성 로컬 초안·재사용 키·버전 충돌·병합/탈퇴·5개 언어·320px·키보드/스크린리더. WLD/원장/주식 관심종목/알림 쓰기 0. 기본 기능 OFF, 전진 추가형 DB, 호환 이중 읽기, 승인 게이트 후 <1%→5%→25%→100% 단계 배포. 롤백은 UI/쓰기 비활성화, 영수증/데이터 삭제·되감기 금지. QA v1272 FAILED/HOLD: 공식 CI 의존성 감사 실패, Migration266/280, DB 권한, 보안 감사, 정확 SHA Test 금융 E2E·격리 복원 미검증, 18:12 KST 루트 97%(약 3.1GiB). 운영 RELEASE HOLD.
- **외부 독립 근거 10,000건 게이트:** 정규 URL·독립 발행·중복 제거·실제 검토·근거 분류 후 승인된 수만 인정. 신규 승인 0건, 누적 승인 미확인, BLOCKED/IN PROGRESS. 후보 표준은 승인 수량에 포함하지 않는다. 신규 분산기획 파일 생성 금지.


## v2026.10.25.1274 — F675-125 월간 WLD 명세서 원천·정밀도·마감 무결성 보완 (기능 보완 / 기획 초안 / 운영 보류)

### 회차·근거·실제 확인된 설계 오류
- 이전 **기능 추가 v1272** → 현재 **기능 보완 v1274** → 다음 **기능 추가 v1276**(잠정). main SHA **1c5b84a1c45baafcca83f375a6f99698121e9bb5** 시작·중간 재확인, AGENTS.md·README.md·영문 PROJECT_PLAN 정본·국문 대조 확인. 미병합 Draft PR #1296 위 문서 전용 변경, 개발 이슈 #1295. 런타임·DB·Test·운영 배포와 원장 쓰기 없음.
- **P0 설계 정정(실증):** Migration 194-wide-wld-numeric-storage.sql은 ledger_postings.amount와 account_balances.available_amount를 제한 없는 PostgreSQL NUMERIC으로 전환했다. 개발 DB information_schema에서도 두 열이 NUMERIC임을 확인했다. v1272의 월간 명세서 BIGINT 기초·기말 잔액 및 차변·대변·증감 보관안은 정상적인 큰 WLD 금액에서도 오버플로할 수 있다. **본 v1274의 NUMERIC 규격이 v1272 BIGINT 제안을 대체**한다. 과거 기획 기록은 삭제하지 않는다.
- **원천 추가 확인:** init/001과 wallet.repository.ts에서 debit은 잔액 증가, credit은 잔액 감소다. Migration 083의 정정은 기존 거래를 바꾸지 않고 reverses_transaction_id로 연결된 신규 역거래를 작성한다. Migration 163 계정 병합은 기존 계좌·과거 원장 소유권을 남기고 ACCOUNT_MERGE_TRANSFER 신규 거래를 만든다. ledger_transactions.created_at과 ledger_postings.created_at은 별도 시각이다. 이는 코드 확인 결과이지 운영 명세서 오류 발생 증거가 아니다. 개발 DB와 운영 DB의 동등성을 주장하지 않는다.
- 기존 WLD 잔액·원장·보상·Wallet API를 변경하지 않는 읽기 전용 기획이다. 개발 A의 최근 CSV PR #1213 및 개발 C의 P2P PR #1286과 변경 범위를 분리한다.

### 수정된 정확 금액·원천 증거 DB 계약(미구현 제안)
- 기초·기말 현금/은행·합계와 행의 차변·대변·증감은 모두 **PostgreSQL NUMERIC**을 사용한다. 정수 금액만 허용하는 CHECK(value = trunc(value))를 NULL 허용 여부에 맞게 적용하고 차변·대변은 0 이상, 증감은 차변-대변으로 검증한다. BIGINT 강제 변환, JS Number 부동소수점 변환, 64비트 DTO 강제 변환을 금지한다. API/CSV는 지수·소수점 없는 정규 10진 정수 문자열을 반환하며 검증 후 SQL NUMERIC 또는 JS BigInt로만 계산하고 BigInt 객체를 JSON에 직접 넣지 않는다. UNVERIFIABLE이면 금액 네 필드는 전부 NULL, 임의의 0 또는 부분 VERIFIED 금지.
- v1272의 generation/head/row/receipt 4개 테이블 및 본인+월+세대 유일 제약, 불변 FK, generation+transaction+account 유일 제약, 단일 최신 head, 원천 건수는 유지한다. 각 행에는 원천 거래 ID·계좌 ID·거래 발생시각·계좌 유형·원천 전표 건수·정확 NUMERIC 합계·선택적 전표 ID 다이제스트를 둔다. 한 거래/계좌의 여러 전표는 먼저 집계한다. 계좌 ID는 변경 불가능한 원천 키이며 임의의 계정 병합 별칭으로 대체하지 않는다. VERIFIED에는 원천 세대 다이제스트·체크포인트 버전·seal ID·HMAC 키 버전을 필수화하고 비밀키는 노출하지 않는다. 상태·금액 무결성은 DTO뿐 아니라 DB CHECK로 강제한다.
- **기간 판정:** 서울 기준 월초 00:00부터 다음 달 월초 00:00 미만을 UTC로 변환하고 ledger_transactions.created_at으로 거래 월을 결정한다. posting.created_at으로 거래를 다른 달로 나누지 않으며 감사용으로만 보존한다. 전표 누락·거래 불일치 시 VERIFIED 차단. 원천 다이제스트는 거래시각·거래 ID·계좌 ID·전표 ID의 안정적 순서로 계산한다. 서명 커서는 본인/세션/월/세대/마지막 정렬키/만료/키 버전에 결합한다. LIMIT는 집계 이후에만 적용한다.
- **부호·정정:** 계좌 증감은 debit 합계 - credit 합계이며 현금↔은행 이동은 합계 증감 0이어도 각각의 계좌 행으로 표시한다. ADMIN_ADJUSTMENT 역거래는 실제 새 거래가 작성된 달에 포함하고 기존 월 기록을 소급 삭제·이동하지 않는다. 전체 거래의 차변·대변 균형과 본인 계좌 증감을 별도로 대사하고 균형 붕괴·미확인 계좌가 있으면 VERIFIED 금지.

### 원천 마감 장벽·계정 병합·불변 발행
- **스냅샷 격리만으로 과거 월 완결성을 보장하지 않는다.** REPEATABLE READ, MAX(created_at)/MAX(id), 건수, 24시간 유예만으로는 이전 시각으로 시작한 미완료 거래가 나중에 커밋하는 문제를 배제할 수 없다. VERIFIED는 모든 쓰기 경로(정정·관리자·계정 병합·과거 직접 잔액 조정 포함)가 준수하는 검증 가능한 단조 증가 원장 마감 seal/커밋 순서 워터마크, 전체 전표 대사, 독립적인 기초·기말 잔액 앵커가 필요하다. 프로토콜 미구현 또는 우회 쓰기가 존재하면 SOURCE_SEAL_UNAVAILABLE로 UNVERIFIABLE 처리한다. 시각 경과만으로 확정 금지.
- 발행 작업은 본인+월 네임스페이스 잠금 → 일관된 스냅샷 → 모든 원천 작성자·seal·계좌 소유·상태 확인 → NUMERIC 대사 → 완전한 불변 세대·HMAC 영수증 삽입 → 단일 head 원자적 이동 순으로 처리한다. 커밋 전 seal·계정 상태 재검증, 변경 시 중단·재시도한다. 늦은 원천이 검증되면 완전한 새 세대를 발행하고 과거 행은 수정하지 않는다. 동일 본인/월/seal/digest 재시도는 기존 영수증 반환. 조회는 단일 head 세대를 고정하고 변경 시 커서 409로 처음부터 다시 조회한다.
- Migration 163 병합 시 이전 회원의 과거 계좌와 원장이 그대로 남는다. 생존 회원의 과거 원장에 이전 회원의 거래를 자동 포함하거나 과거 기초잔액을 만들어서는 안 된다. 별도 승인된 개인정보 이전 규정 전까지 병합 원본·대상 중 어느 한쪽이라도 명세서 세대/head/영수증이 있으면 병합 사전 차단. 병합 이체는 실제 거래 달에 표시한다. Migration 010 탈퇴는 회원 행을 물리 삭제하지 않으므로 명세서·CSV·HMAC·백업의 보존/삭제 정책을 명시하고 접근을 즉시 차단한다. SECURITY DEFINER 함수는 search_path 고정·본인 범위 제한, 앱 직접 테이블 권한·PUBLIC EXECUTE 금지, 타인·다른 세션 접근 회귀 필수.
- 상태: PENDING_SOURCE(미마감), NOT_ARCHIVED(기록 없음), UNVERIFIABLE 사유 SOURCE_SEAL_UNAVAILABLE / MISSING_OPENING_ANCHOR / FRACTIONAL_SOURCE / UNBALANCED_SOURCE / OWNER_AMBIGUOUS / CHECKPOINT_CHANGED / SOURCE_GAP; 완전한 검증만 VERIFIED/REVISED. DB 오류를 EMPTY_VERIFIED로 변환 금지. VERIFIED만 CSV, no-store/noindex, 수식 주입 방지, 비식별 관리자 통계 k≥20, 모바일 320px/200% 확대·키보드·상태 안내·Android app-api 동등성. KPI: 거짓 VERIFIED 0, 정밀도 손실 0, 타인 노출 0, 멱등 마감 중복 세대 0.

### 갱신된 개발 백로그·운영 차단
- **P0** ENV1274-01: 루트 디스크 95%·약 4.8GiB 여유(17:08 KST), 개발/Test/운영 DB 격리·백업 복원 검증. SEC1274-02: 개발 DB 앱 241개 중 235개 테이블 UPDATE+DELETE 및 PUBLIC 은행 함수 3개 권한 최소화·본인 격리. REL1274-03: Migration 266 체크섬·280 번호 충돌, QA v1271 프론트 5건 실패, 의존성 Critical2/High10, 정확 SHA 로그인 금융 Test E2E·독립 QA PASS. WAL1274-04: 전체 원장 쓰기 경로 목록, seal/마감 워터마크·독립 잔액 앵커 증명, 불가능하면 실패 폐쇄.
- **P1** WAL1274-05: BIGINT 제안을 정확 NUMERIC 정수 제약·전표 사전 집계로 교체; WAL1274-06: 완전 세대 원자 발행·단조 seal 정정·HMAC 원본 재사용; WAL1274-07: NestJS 본인 전용 10진 문자열 목록/상세/행/CSV/영수증·세대 고정 커서; WAL1274-08: Next.js·Android·UNVERIFIABLE 사유·접근성; WAL1274-09: 계정 병합·탈퇴·개인정보·관리자 통계·SEO·KPI; WAL1274-10: 실제 격리 PG에서 2^63 초과 WLD, 중복 전표, 동시 마감 100건, 타인 조회 100건, 합성 10,001건, 다음 달 역거래, 과거시각 미커밋 거래, seal 누락, 병합 양쪽, 탈퇴, 정확 SHA CI·복원·롤백 검증.
- v1272의 화면·CTA·API·관리자·배포 조건은 본 문서에서 명시적으로 교체한 부분 외 유지한다. 기능 기본 OFF, 문서 단계에서 Migration 번호 예약 금지. 별도 개발 브랜치·정확 SHA Test·독립 QA·승인된 무중단 카나리·기능 비활성 롤백 필수, 원장 롤백 금지. 최신 완료 QA **v1271 FAILED/HOLD**(프론트 1,398 PASS/5 FAIL, 감사 Critical2/High10, 앱 DML 235/241, PUBLIC 은행 3, Migration266/280, 금융 Test/복원 미확인). 운영 RELEASE HOLD.
- 외부 독립 근거 **중복 제거·분류·승인 10,000건** 목표 유지. 이번 신규 승인 **0건**, 누적 승인 **미확인**, **BLOCKED / IN PROGRESS**. 소스 분석·공식 기술 문서는 승인된 외부 독립 레퍼런스 수량으로 집계하지 않는다.

**백로그 ID:** ENV1274-01 SEC1274-02 REL1274-03 WAL1274-04 WAL1274-05 WAL1274-06 WAL1274-07 WAL1274-08 WAL1274-09 WAL1274-10


## v2026.10.25.1272 — F675-125 회원 전용 검증형 월간 WLD 거래 명세서 (기능 추가 / 기획 초안 / 운영 보류)
- **GitHub:** [Draft PR #1296](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1296) OPEN/HOLD, [개발 이슈 #1295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1295) OPEN. 선행 기획 브랜치 위 미병합 문서 변경만 수행, 런타임/DB/Test/운영 변경 없음.

### 기준·실제 코드·범위
- **회차:** 이전 Feature Improvement v1270 → 현재 Feature Addition v1272 → 다음 Feature Improvement v1274(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 확인, AGENTS.md·README.md·영문 PROJECT_PLAN 정본과 국문 대조. 선행 Draft #1289 미병합, 개발 인계 [#1295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1295). 기획 문서만 변경하며 런타임·DB·WLD·원장·Test·운영은 변경하지 않는다.
- **확인한 공백:** NestJS `GET /wallet?recent=1..50`는 최대 50건, Next `/wallet/activity`도 50건을 요청하고 `export-ledger-csv.tsx`는 받은 최근 거래만 CSV로 만든다. 원천은 `ledger_transactions`·`ledger_postings`와 `accounts.owner_user_id`의 조인으로 USER_CASH·USER_BANK 증감 및 BIGINT WLD를 계산한다. 전체 월간 명세서·과거 기초잔액 검증 기준·월간 보존 기록은 조사한 main에서 확인되지 않았다. **기능 공백**이지 운영 원장 불일치가 확인됐다는 뜻은 아니다.
- **목적:** 활성·동의 완료 회원이 본인의 마감된 서울 시간 기준 월간 WLD 흐름을 확인하고, 최근 50건 CSV를 완전한 월간 명세서로 오인하지 않게 한다. 원장 변경 없는 읽기 전용 파생 기록이며 잔액·보상·거래·기존 지갑 화면을 변경하지 않는다. WLD는 서비스 내 가상 재화이며 금융기관 발급 예금 명세서가 아니다. 클라이언트 집계가 아닌 원천 검증 후 불변 세대 발행을 선택하고 근거 없는 과거 월은 UNVERIFIABLE로 표시한다.

### 사용자·권한·진입점·화면·상태
- 활성 로그인·최신 동의 회원만 접근, 비회원 SIGNED_OUT/로그인, 제한·탈퇴 회원 403. 기존 `/wallet`, `/wallet/activity`에 보조 **월간 명세서** CTA. `/wallet/statements`는 마감 월 목록, 검증 상태, 기간, 검증된 경우에만 현금·은행·합계 증감, 세대, **명세서 보기** 버튼을 표시한다. `/wallet/statements/YYYY-MM` 상세는 독립적으로 검증된 기초·기말 현금/은행 잔액, 계좌별 입출금, 원천 완결 체크포인트, 정정 세대 배지, CSV·뒤로가기 CTA를 제공한다. 미래 월 422, 진행 중 월 PENDING, 기초 근거 불충분 UNVERIFIABLE, 기록 미생성 NOT_ARCHIVED. 실패를 0으로 표시하지 않는다.
- 상태: SIGNED_OUT, LOADING, PENDING_SOURCE, VERIFIED, NOT_ARCHIVED, UNVERIFIABLE, REVISED, EMPTY_VERIFIED, PAGE_CONFLICT, DOWNLOAD_READY, RATE_LIMITED, FEATURE_UNAVAILABLE, ERROR. 거래가 0건이어도 기초·기말 근거와 원천 연속성이 입증된 경우만 EMPTY_VERIFIED. API 장애와 실제 빈 달을 구별한다. 로그아웃·계정 변경 시 개인 캐시·커서·다운로드 폐기. 스크린리더 상태 알림, 표 머리글·설명, 키보드 포커스 복귀, 320px·200% 확대, WCAG 2.2 AA 준수. 검증되지 않은 차트 수치나 장식용 KPI를 생성하지 않는다.

### 제안 API·Android·오류 (미구현)
- `GET /api/v1/wallet/statements?limit=12&cursor=SIGNED`(1~24), `GET /api/v1/wallet/statements/:month`(엄격한 YYYY-MM), `GET /api/v1/wallet/statements/:month/entries?limit=50&cursor=SIGNED`(1~100), `GET /api/v1/wallet/statements/:month/export.csv`(VERIFIED 세대만), `GET /api/v1/wallet/statements/:month/receipt`(비밀키 없는 세대·근거 메타데이터). 응답 `{month,timezone:'Asia/Seoul',status,generation,asOf,sourceCheckpoint,opening:{cash,bank,total}|null,closing:{cash,bank,total}|null,deltas:{cash,bank,total}|null,entryCount,revisionReason?}`. 모든 WLD 금액은 JS 부동소수점이 아닌 정규화된 십진 **문자열**. 행 `{transactionId,accountType,occurredAt,type,debit,credit,delta}`; 상대방 회원·계좌 식별자나 비공개 메모를 노출하지 않는다.
- 소유자는 반드시 인증 세션에서 유도한다. SessionGuard→AuthenticatedGuard→ConsentGuard; 비인증 공개 조회나 무인증 내보내기 금지. Android `/app-api/v1/wallet/statements/*`의 JSON·인증 동등성과 CSV 전달/안전한 다운로드는 실제 게이트웨이 확인 후 구현해야 하며 접두 경로만으로 동등하다고 주장하지 않는다. 401 비로그인, 403 계정·동의 제한, 404 존재하지 않거나 타인 소유 자료를 동일하게 처리, 409 커서 세대 불일치, 422 잘못된/미래 월, 429 요청 초과, 503 DB/원천 장애. 장애를 빈 배열이나 성공으로 위장하지 않는다. `Cache-Control: private,no-store`, `X-Robots-Tag: noindex,nofollow`, 공개 사이트맵·SEO·CDN 노출 금지. 안전한 파일명, UTF-8 BOM CSV, 비신뢰 문자열 수식 주입 방지. 회원당 분당 읽기 30회·내보내기 3회 제한. GET은 어떠한 원장 거래도 만들지 않는다.

### 제안 DB·검증·트랜잭션
- Migration 266 체크섬과 미병합 280 번호 충돌 해결 후에만 별도 개발 브랜치에서 순방향 신규 번호를 배정한다. `wallet_monthly_statement_generations(id UUID PK,owner_user_id UUID,month_start DATE,month_end_exclusive TIMESTAMPTZ,generation BIGINT,status TEXT CHECK(status IN ('VERIFIED','UNVERIFIABLE')),opening_cash BIGINT NULL,opening_bank BIGINT NULL,closing_cash BIGINT NULL,closing_bank BIGINT NULL,source_checkpoint JSONB NOT NULL,source_digest TEXT NOT NULL,created_at,UNIQUE(owner_user_id,month_start,generation))`; `wallet_monthly_statement_heads(owner_user_id,month_start,generation_id UUID,version BIGINT,PRIMARY KEY(owner_user_id,month_start))`; `wallet_monthly_statement_rows(generation_id,transaction_id,account_id,created_at,account_type,debit_amount BIGINT,credit_amount BIGINT,delta_amount BIGINT,PRIMARY KEY(generation_id,transaction_id,account_id))`; `wallet_monthly_statement_receipts(generation_id PK,proof_hmac,source_row_count,created_at)`. 외래키와 debit/credit >=0 CHECK, 월 경계·세대 단조 증가 제약을 둔다. 인덱스는 (owner_user_id,month_start DESC), (generation_id,created_at DESC,transaction_id DESC,account_id DESC), 원장 (account_id,created_at,id)/(created_at,id)를 **EXPLAIN 후** 검토한다. 한 거래·한 계좌에 게시가 여러 개인 경우 계좌별 집계 후 행 고유 제약을 적용한다.
- 서울 기준 완료 월의 `[월 시작, 다음 달 시작)`을 UTC timestamptz로 변환하며 최근 30일로 대체하지 않는다. 원천별 수집 체크포인트 연속성, 미확정/누락 게시, 거래·게시 수, 전체 거래 차변·대변 균형, 역사적 계좌 소유권을 검증한다. 현금↔은행 이동은 총합 0일 수 있으므로 각 계좌 증감과 전체 거래 균형을 구분한다. 기초·기말 잔액은 신뢰 가능한 원장 최초 기준 또는 이전 VERIFIED 세대와 그 이후 모든 게시로 독립 대사해야 한다. **현재 account_balances만으로 과거 월 기말을 증명할 수 없다.** 과거 직접 잔액 변경 위험과 원천 누락이 있으면 근거 없는 값을 계산하지 않고 사유가 있는 UNVERIFIABLE로 발행한다. 24시간 경과만으로 VERIFIED 확정 금지. NOT_ARCHIVED는 거래 0건이 아니다.
- 실제 개발 시에만 (owner,month) 네임스페이스 Advisory Lock과 REPEATABLE READ 이상 일관성, 원천 체크포인트 재검증을 사용한다. 검증한 계좌별 행·불변 세대·HMAC 근거 영수증을 기록한 뒤 단일 head 포인터를 원자적으로 변경한다. 동일 원천 지문의 재실행은 원본 세대를 재사용하며 지연 정정은 기존 행을 덮지 않고 **완전한 새 월 세대**를 발행한다. 오래된 다운로드는 정정 이전 버전임을 명시한다. HMAC 커서는 회원·세션·월·세대·마지막 (created_at,transaction_id,account_id)·15분 만료·키 버전을 결합한다. 세대 변경 시 409 재조회. 앱 역할에 개인 테이블 직접 SELECT/INSERT/UPDATE/DELETE 또는 PUBLIC EXECUTE를 부여하지 않고 고정 search_path·본인 검증 SECURITY DEFINER 함수만 허용한다.
- Migration 163 계정 병합은 명세서가 있는 계정의 병합을 정책 승인 전 사전 차단한다. Migration 010 탈퇴는 물리 삭제가 아니므로 즉시 조회를 차단하고 행·영수증·내보내기·백업의 개인정보 보존·삭제 정책을 명시한다. 관리자는 k>=20 비식별 생성 작업 통계만 보고 개별 회원 CSV나 명세서는 별도 승인된 고권한 사례 없이 열람하지 못한다. HMAC 비밀키는 서버 비밀 저장소에만 둔다.

### P0/P1 백로그·KPI·회귀·배포
- **P0:** `ENV1272-01` 서버 여유 공간·개발/Test/운영 DB 격리·암호화 복원; `SEC1272-02` 앱 직접 DML 235/241·PUBLIC 은행 EXECUTE 3건 최소권한 및 타 회원 거부; `REL1272-03` Migration266/280·전체 CI/의존성 보안·정확 SHA Test 게이트; `WAL1272-04` 원장 체크포인트·기초 잔액·계좌 소유권·완결 대사.
- **P1:** `WAL1272-05` 불변 스키마·인덱스·HMAC 영수증; `WAL1272-06` 원자적 월 마감·정정·중복 재실행; `WAL1272-07` NestJS 본인 목록/상세/커서/CSV/영수증; `WAL1272-08` Next.js·Android·접근성; `WAL1272-09` 관리자·개인정보·SEO·KPI; `WAL1272-10` 격리 PostgreSQL에서 동시 마감 100건, 타인 접근 100건, 합성 게시 10,001건, 동일 거래 다중 게시, 지연·누락, 월 경계, bigint, CSV 주입, 병합·탈퇴, 복원·롤백·지갑 회귀.
- 구현 이후 목표 KPI: 타인 자료 노출 0, 허위 VERIFIED 0, 불균형 검증 명세서 0, 중복 마감 추가 세대 0, 조회 가용성 99.9%, 합성 10,001건에서 p95 <300ms, 접근성 치명 결함 0. 개인 식별자·금액 분석 이벤트 금지. QA v1270 FAILED/HOLD: Frontend 6건 실패, 의존성 Critical2/High10, 앱 직접 DML 235/241, PUBLIC 은행 EXECUTE 3, Migration266/280, 정확 SHA 로그인 금융 Test E2E·격리 복원 미검증; 16:05 KST 루트 93%/7.4G 여유. 기능 스위치 기본 OFF, 별도 개발 브랜치→격리 PG/전체 CI·보안→정확 SHA Test→독립 QA PASS→승인된 무중단 카나리·롤백만 허용. 롤백은 새 조회/마감 작업만 끄고 보존된 근거를 삭제하거나 WLD·원장을 수정하지 않는다. **운영 승격 금지.**
- 외부 독립 근거 **10,000건** 중복 제거·분류·승인 조건 유지. 이번 신규 승인 **0건**, 누적 승인 **미확인**, **BLOCKED / IN PROGRESS**. PostgreSQL·OWASP·W3C 설계 지침은 승인된 외부 레퍼런스 건수로 세지 않는다.

## v2026.10.25.1270 — F675-124 게시판 작성자 숨김·계정 병합·커서 무결성 보완 (기능 보완 / 기획 초안 / 운영 보류)
- Draft PR [#1289](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1289) OPEN/HOLD, 개발 이슈 [#1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280) 업데이트, 미병합·런타임/DB/Test/운영 변경 없음.

### 기준, 회차 및 실제 소스
- 이전 **Feature Addition v1268** → 현재 **Feature Improvement v1270** → 다음 **Feature Addition v1272**(잠정). 원격 main **1c5b84a1c45baafcca83f375a6f99698121e9bb5** 시작·중간 확인, AGENTS.md/README.md/영문 PROJECT_PLAN 정본 및 국문 대조 완료. 선행 Draft PR #1281은 미병합 OPEN. 이번 작업은 기획 문서만 변경한다. 최신 완료 QA v1269 FAILED/HOLD.
- 실제 근거: Migration 175의 공개 게시판 목록은 작성자 UUID 없이 최신 50개를 먼저 반환한다. Migration 259의 게시글 상세에는 author_user_id가 있다. Migration 181의 종목 연동 공개 목록은 먼저 50개를 선택하고 이후 stock-community.service에서 종목을 필터링한다. 따라서 개인 피드가 기존 공개 목록을 재사용하면 종목 필터·작성자 숨김에서 누락/빈 페이지가 발생할 수 있다. Migration 163의 계정 병합은 작성 글·댓글을 검사하지만 아직 존재하지 않는 숨김 소유권/대상/영수증을 검사하지 않는다. Migration 010의 account_soft_delete는 회원 행을 삭제하지 않고 상태 변경·세션 취소만 수행한다. 이는 **설계상 위험**이지 확인된 운영 사고가 아니다.
- 대안 비교: 공개 최신 50건을 클라이언트에서 제거하는 방식은 기각(편향·캐시 유출), 기존 종목 공개 함수 재사용도 기각(종목 필터가 LIMIT 뒤에 있음), 병합 시 작성자 UUID나 영수증을 자동 이전하는 방식도 기각(개인정보·충돌). 채택안은 회원 본인 전용 SECURITY DEFINER 조회에서 작성자·종목 조건을 LIMIT 전에 적용하고, 원본 작성자 UUID와 요청 영수증을 불변으로 유지하는 방식이다. 공개 게시판, 검색 색인, 운영 제재, 메시지, 알림, WLD·원장은 변경하지 않는다.

### 대상·권한·진입점·화면·상태
- 최신 동의가 있는 활성 로그인 회원만 개인 피드/숨김을 이용한다. 비회원은 공개 /board만 읽는다. 공개 /board/[postId]에서 현재 공개 상태의 타인 글에만 **내 피드에서 이 작성자 숨기기** 버튼을 표시하고 postId만 전송한다. 자기 글, 탈퇴·식별 불가 작성자, 로그인 실패 상황에서는 버튼을 표시하지 않는다. 안내문은 '개인 피드만 변경되며 공개 글·댓글·메시지·알림에는 영향 없음'으로 명확히 한다.
- /board/personal은 전체/종목 필터, 글 제목·작성자 공개 표시명·작성일·댓글 수·종목 배지와 글 보기/숨김 관리/공개 게시판/새로고침 CTA를 제공한다. /account/board-muted-authors는 본인 숨김 목록을 표시하며, 원글 삭제·작성자 탈퇴 후에도 숨김 해제가 가능하도록 불가용 작성자 이름을 익명화한다. 이것은 신고·차단·운영 제재가 아니다.
- 상태: SIGNED_OUT, LOADING, READY, EMPTY, MUTING, MUTED_CONFIRMED, UNMUTING, UNMUTED_CONFIRMED, AUTHOR_UNAVAILABLE, CONFLICT_REFRESH, CURSOR_EXPIRED, UNKNOWN_COMMIT, RATE_LIMITED, FEATURE_UNAVAILABLE, ERROR. 확정 영수증 없이 성공 토스트 금지, 서버 오류를 EMPTY로 위장 금지, 계정 전환·로그아웃 때 이전 응답·커서·캐시 폐기. 키보드·스크린리더 상태 알림·포커스 복귀·320px/200% 확대·WCAG 2.2 AA를 준수한다.

### 제안 API·Android·비공개 처리 (미구현)
- GET /api/v1/board/personal?limit=20&stock=SYMBOL&cursor=TOKEN: 1~50건, 종목은 허용 ASCII 1~16자 대문자 정규화. 응답 {posts,nextCursor,muteGeneration,asOf,filter}. 종목·작성자 숨김은 **SQL에서 LIMIT 이전**에 처리하고 공개 top-50/종목 함수를 재사용하지 않는다.
- GET /api/v1/board/mutes?limit=20&cursor=TOKEN, GET /api/v1/board/mutes/state?postId=UUID, POST /api/v1/board/mutes {postId,requestId,expectedVersion}, DELETE /api/v1/board/mutes/:muteId {requestId,expectedVersion}, GET /api/v1/board/mutes/receipts/:requestId. POST 작성자는 서버가 공개 원글에서 추출하고 임의 author UUID 입력은 받지 않는다. DELETE는 원글 삭제 후에도 불투명 muteId로 본인 확인 후 가능하다. 200 JSON 원본 영수증 {requestId,muteId,version,muteGeneration,muted,replayed} 제공; 동일 키·다른 본문은 409, 타인/미존재는 동일 404, 인증·동의·충돌·형식·과다 요청·서비스 장애는 401/403/409/422/429/503을 구분한다.
- SessionGuard·AuthenticatedGuard·ConsentGuard, 웹 변경 CSRF/동일 출처, 회원별 12회/분 제한. Android app-api는 board 그룹과 DELETE JSON 본문을 전달하지만 If-Match/Idempotency-Key 헤더는 전달하지 않으므로 본문 expectedVersion/requestId를 검증한다. User-Agent는 인증 수단이 아니다. 개인 응답은 private,no-store 및 noindex/nofollow; 공개 HTML·사이트맵·메타데이터·CDN·로그에 신규 숨김 관계 또는 추가 작성자 식별자 노출 금지(기존 공개 게시글 상세 authorUserId 동작은 변경하지 않음).

### 제안 DB·잠금·계정 생명주기
- Migration 266 원본 체크섬과 다중 280 번호 충돌 해결 후 충돌 없는 순방향 마이그레이션을 별도 개발 예약에서 수행한다. member_board_author_mutes(mute_id PK,owner_user_id,author_user_id,muted,version>=1,created_at,updated_at, UNIQUE(owner_user_id,author_user_id),CHECK(owner<>author)); member_board_mute_states(owner_user_id PK,generation>=0); member_board_mute_receipts(owner_user_id,request_id,operation,target_mute_id,request_hmac,original_response_json,created_at, UNIQUE(owner_user_id,request_id)). 묘비·버전·원본 영수증 보존, 영수증에 글 본문·표시명·IP·토큰 저장 금지. 활성 숨김(owner,author) 부분 인덱스, 본인 목록(owner,updated_at DESC,mute_id DESC), 공개 글(created_at DESC,id DESC) 부분 인덱스, 종목(stock_id,post_id) 인덱스는 EXPLAIN으로 검증한다. 앱 테이블 직접 DML/SELECT 또는 PUBLIC 함수 EXECUTE를 부여하지 않고 고정 search_path의 SECURITY DEFINER 함수만 허용한다.
- 변경 트랜잭션: 입력 검증 → (회원,requestId) 단위 트랜잭션 advisory lock → 원본 영수증 조회·HMAC 비교 순서(AGENTS.md/Migration045 준수)로 같은 요청의 중복 삽입을 먼저 차단한다. 탈퇴 회원은 원본 재시도도 거절한다. 신규 POST는 먼저 공개 글에서 작성자 UUID를 잠금 없는 임시 값으로 읽고, 회원·작성자 users 행을 UUID 오름차순 FOR UPDATE로 잠근 뒤 원글 FOR SHARE로 작성자·공개 상태·두 회원의 활성 상태를 다시 검증한다. 그다음 본인 상태 행 FOR UPDATE → 숨김 행 순서로 잠근다. DELETE도 요청 키 advisory lock과 영수증 조회 후 회원 행 → 상태 행 → 숨김 행 순서다. Migration163의 두 회원 UUID 순서 잠금과 일치시켜 교착을 방지하며, 브라우저 작성자 UUID는 신뢰하지 않는다. 본인 상태 행이 없으면 INSERT ... ON CONFLICT DO NOTHING으로 생성한 뒤 잠근다. 회원당 활성 200명 한도는 상태 행 잠금으로 직렬화한다. 신규 행 예상 버전 0, 기존 행 CAS expectedVersion, 변경 시만 generation 증가, 원본 HMAC 본문 결합 영수증 원자적 저장. 같은 요청 재시도는 원본 영수증만 반환, 내용 다른 재사용/오래된 버전은 409. 네트워크 불명확 상태는 영수증 조회 후 현재 상태 재조회한다.
- 계정 병합: Migration 163은 두 회원을 UUID 순서대로 잠그지만 숨김 기록을 알지 못한다. 출시 전에 병합 대상 계정의 숨김 상태·묘비·영수증 또는 타 회원이 병합 대상자를 숨긴 참조가 있으면 **병합을 사전 거절**하는 명시적 정책을 추가한다. 사용자 잠금 순서를 병합·탈퇴와 통일하고 병합-숨김 100건 경합을 검증한다. 자동 이전·영수증 소유권 변경·조용한 삭제는 금지하며, 향후 이전 정책은 개인정보 승인 필요.
- 탈퇴: Migration 010은 소프트 삭제이므로 FK CASCADE로 개인정보가 지워진다고 주장하지 않는다. 탈퇴 즉시 개인 조회·변경 차단, 세션 결합 커서 폐기, 탈퇴한 작성자 표시명 익명화, 보존기간·삭제·백업·개인정보 요청 절차를 명시한다. 작성자 UUID는 과거 글에서 불변이고, 탈퇴 작성자의 숨김 해제는 muteId로 계속 가능해야 한다.
- 목록: 하나의 일관된 DB 스냅샷에서 회원 상태·muteGeneration·공개 글·종목 조건·활성 숨김 제외를 평가하고 (created_at,id) 키셋 및 LIMIT+1을 사용한다. 최초 페이지의 상한 튜플을 보존한다. HMAC 커서는 본인·세션·세대·정규화 종목·limit·상한·마지막 튜플·15분 만료·키 버전을 결합한다. 세대/세션/필터 변경과 만료는 409 재시작, 변조는 422. 조회 중 삭제·운영 제한으로 글이 사라질 수 있으며 **완전한 과거 스냅샷 보존을 약속하지 않는다**. OFFSET/수정 가능한 updated_at 정렬 금지.

### 관리자·KPI·테스트·승격·근거 게이트
- 관리자에는 20명 미만 셀을 숨기는 비식별 이용률·오류·커서 재시작률·p95 지연만 제공하고 개인 숨김 그래프를 노출하지 않는다. KPI 목표: 개인 피드 성공률 >=99.9%, 타인 정보 유출 0, 중복 재시도 추가 변경 0, 커서 일관성 오류 0, 합성 게시글 10,001건에서 p95 <300ms, 활성 200명 한도 위반 0, 핵심 접근성 오류 0. 승인된 분석만 사용한다.
- **P0 4개:** ENV1270-01(용량·DB 분리·복원), SEC1270-02(앱 최소권한·PUBLIC 은행 함수), REL1270-03(전체 CI·보안·266/280·정확 SHA Test), BOARD1270-04(작성자 원천·병합·탈퇴 권한). **P1 6개:** BOARD1270-05(DB·묘비·HMAC 영수증), BOARD1270-06(원자적 등록/해제·CAS·한도), BOARD1270-07(종목/작성자 선필터·서명 키셋), BOARD1270-08(NestJS/Next.js/Android·세션), BOARD1270-09(개인정보·관리자·SEO·접근성·KPI), BOARD1270-10(격리 PG 100건 경합/타인 접근, 합성 10,001건·회귀·롤백).
- 격리 PostgreSQL 앱 권한 부정 테스트, 실제 세션·동의·CSRF·Android, 동일/충돌 요청 각 100건, 200명 한도 동시 경쟁, 병합/탈퇴 경합 100건, 타인 접근 100건, 종목 선필터 합성 10,001건, 커서 위변조·만료·세대 변경, 공개 60초 캐시/SEO 무변경, 원장/WLD 미변경을 검증한다. 개발은 별도 브랜치·기능 기본 OFF, 순방향 스키마, 격리 백업 복원, 보안/CI/QA PASS, 공식 Test 정확 SHA 인증 E2E, 카나리·모니터링, 승인 GitOps 운영승격 및 OFF 롤백을 요구한다. P0 해결 전 병합·배포 금지.
- QA v1269 FAILED/HOLD: 프론트 1,397 통과/6 실패, 전체 감사 Critical 2/High 10 및 운영 감사 High 2, 개발 앱 241개 중 235개 UPDATE+DELETE, PUBLIC 은행 함수 3개, Migration 266 체크섬·280 번호 충돌, 정확 SHA Test 금융 E2E 및 격리 복원 미검증. 시작 실측 루트 디스크 92% 사용(과거 100%에서 개선됐으나 원인 불명). 외부 독립 근거 목표 10,000건, **신규 승인 0건, 누적 중복 제거 승인 미확인, BLOCKED / IN PROGRESS**. OWASP/PostgreSQL/W3C는 설계 참고 발행기관이지 승인 10,000건이 아니다. 런타임·DB·WLD·원장·Test·운영 변경 없음.


## v2026.10.25.1268 — F675-124 회원별 게시판 작성자 숨김 및 개인 피드 (기능 추가 / 기획 초안 / 운영 보류)
- Draft PR [#1281](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1281) OPEN/HOLD, 개발 이슈 #1280 OPEN, main 미병합·런타임/Test/운영 변경 없음.
- **개발 인계:** [GitHub 이슈 #1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280) OPEN/HOLD, 선행 기획 Draft #1274 미병합. 런타임 변경이 아니다.

### 회차·목적·대안·실제 코드 근거
- **이전 Feature Improvement v1266 → 현재 Feature Addition v1268 → 다음 Feature Improvement v1270(잠정).** 최신 원격 main eb27f5590e80bb71462e3888d052106a068e661a를 시작·중간 재확인하고 AGENTS.md, README.md, 영문 정본 PROJECT_PLAN.md 및 국문 대조를 읽었다. 선행 기획 Draft #1274는 미병합 OPEN이다. 본 회차는 문서 기획이며 런타임 구현 승인이 아니다.
- **목적/대상:** 로그인하고 현재 동의를 유지한 활성 회원이 개인 피드에서 원하지 않는 작성자의 공개 게시글만 숨기도록 한다. 공개 게시판, 타 회원, 관리자 조치, 메시지, 알림 전달, WLD·원장은 변경하지 않는다. 비회원은 기존 공개 게시판을 본다. 대안 A인 공개 상위 50건을 브라우저에서 사후 필터링하는 방식은 빈 페이지·편향 및 캐시 오염으로 기각한다. 대안 B인 전역 작성자 차단은 공개 SEO·운영·DM 의미를 바꾸므로 기각한다. **채택:** 별도 본인 전용 피드, DB LIMIT 이전 필터링, 명시적 숨김/해제와 관리 화면.
- **최신 main 실증:** frontend/src/app/board/page.tsx는 canonical/indexable 공개 화면이며 publicApi 캐시 60초이다. backend/src/board/public-board.service.ts 및 Migration 175의 공개 목록은 작성자 이름은 반환하지만 authorUserId는 없고 최대 50건이다. frontend/src/app/board/[postId]/page.tsx 및 Migration 259의 상세는 authorUserId를 제공한다. Migration 044/048의 목록은 deleted_at IS NULL을 기준으로 created_at/id 순서로 조회한다. 작성자별 개인 숨김 테이블/기능은 확인되지 않았다. App API 게이트웨이는 board 그룹과 JSON DELETE 본문을 지원한다. 공개 글 ID만으로 회원 소유권을 추정하지 않는다.
- **업무 분리:** F675-109 읽기 목록, F675-110 비공개 초안, F675-116 수정 이력, F675-121 게시글 팔로우·댓글 알림, 개발 C의 게시판/알림 작업과 분리한다. 신규 알림·DM 차단·괴롭힘 제재·게시글 삭제·크롤러별 차별 출력·보상·WLD·주식·원장 변경은 범위 밖이다. 분산 기획 파일을 만들지 않고 이 통합 정본에 흡수한다.

### 사용자 동선·권한·화면 상태
1. **진입:** 공개 /board와 /board/[postId]는 비회원·검색엔진에 그대로 제공한다. 로그인 상태에서 실제 공개 글의 본인 아닌 authorUserId가 검증되면 보조 CTA **이 작성자의 글을 내 피드에서 숨기기**를 제공하고 "내 피드만 바뀌며 공개 글은 계속 볼 수 있습니다"라고 설명한다. 로그인 회원에게 /board/personal, /account/board-muted-authors 링크를 제공한다. 작성자 정보 없음·본인 글·접근 불가 글에는 숨김 버튼을 표시하지 않는다.
2. **개인 피드:** /board/personal은 본인 인증·noindex/nofollow·private/no-store를 적용한 서버 조회 화면이다. 카드에는 실제 제목, 공개 작성자명, 작성 시각, 댓글 수, 글 열기를 표시한다. CTA는 **숨긴 작성자 관리**, **전체 공개 게시판 보기**, **새로고침**이다. 숨김 활성 작성자의 글을 **DB LIMIT 이전**에 제외한다. 공개 원문은 기존 공개·운영 정책 범위에서 계속 열람 가능하며 /board canonical 및 공개 상세는 변경하지 않는다.
3. **관리:** /account/board-muted-authors에는 본인 숨김 기록만 보인다. 탈퇴·이름 조회 불가 작성자는 **이용할 수 없는 회원**으로 익명화하고 **숨김 해제**는 가능해야 한다. 본인 자신, 임의 UUID, 타인의 목록은 숨기거나 열람할 수 없다. 관리자 제재·법적 삭제·플랫폼 안전 조치가 우선한다. 개인 숨김은 신고·차단 기능이 아니다.
4. **상태:** SIGNED_OUT, LOADING, READY, EMPTY_FEED, EMPTY_MUTES, MUTING, MUTED_CONFIRMED, UNMUTING, UNMUTED_CONFIRMED, AUTHOR_UNAVAILABLE, CONFLICT_REFRESH, UNKNOWN_COMMIT, RATE_LIMITED, ERROR, FEATURE_UNAVAILABLE. 저장된 영수증 전 성공 토스트 금지. 커밋 결과 불명 시 영수증 조회→현재 상태 재조회. 로그아웃·계정 전환 시 이전 응답을 폐기한다. 조회 오류를 글 없음으로 표시하지 않는다.

### NestJS·Next.js·Android API 계약(제안)
5. **본인 API:** GET /api/v1/board/personal?limit=20&cursor= (최대 50, posts/nextCursor/muteGeneration/asOf), GET /api/v1/board/mutes?limit=20&cursor= (최대 50), GET /api/v1/board/mutes/state?postId=UUID (CTA용 본인 숨김 상태·버전, 접근 불가 글 404), POST /api/v1/board/mutes 본문 {postId:UUID,requestId:UUID,expectedVersion:0이상 정수}, DELETE /api/v1/board/mutes/:muteId 본문 {requestId:UUID,expectedVersion:양의 정수}, GET /api/v1/board/mutes/receipts/:requestId. POST는 **서버가 현재 공개 가능한 글의 작성자를 확인**한다. 요청 본문에서 작성자 UUID를 받지 않는다. DELETE는 본인+불투명 muteId를 SQL에서 확인하며 타인/없는 기록 모두 404다. 기존 공개 API와 /board 캐시 의미는 유지한다.
6. **인가/오류:** 모든 본인 API에 SessionGuard·AuthenticatedGuard·ConsentGuard, 브라우저 변경 요청에 CsrfGuard·동일 출처 검증, 엄격한 JSON 스키마 적용. 회원당 쓰기 분당 12회·읽기 분당 60회, 본문 4KiB 이하, 기본 20/최대 50. 비로그인 401, 정지·동의 불충족 403, 접근 불가 글/숨김 404(존재 유추 불가), 구버전·세대 변경·영수증 충돌 409, 본인 숨김·잘못된 대상 422, 과다 호출 429, DB/기능 원천 불능 503. 네트워크 시간 초과를 성공으로 처리하지 않는다. 오류에 타인의 UUID·이름·숨김 정보 노출 금지.
7. **Android:** /app-api/v1/board/...에서 JSON 조회·숨김·해제·영수증 동등 계약을 제공하되 App API 경로 맵 및 최소 버전 검증을 먼저 통과한다. 현재 게이트웨이는 POST/DELETE 본문을 전달하므로 전달되지 않는 임의 헤더 대신 본문 requestId/expectedVersion을 사용한다. 앱 전송 방식별 세션·토큰·CSRF 정책, 계정 전환, 401/403/409/503을 검증한다. 모바일 전용 가짜 로컬 상태 금지.

### PostgreSQL 테이블·제약·인덱스·원자성
8. **정방향 마이그레이션 제안(번호 미배정; 266/280 해결 후):** member_board_author_mutes(id UUID PK, owner_user_id UUID users FK, muted_author_user_id UUID users FK, active BOOL, version BIGINT>=1, created_at, updated_at, UNIQUE(owner_user_id,muted_author_user_id), CHECK owner<>muted); member_board_mute_states(owner_user_id UUID PK users FK, generation BIGINT>=0); member_board_author_mute_receipts(owner_user_id,request_id UUID, operation enum, request_hmac BYTEA, mute_id, result_version, resulting_generation, committed_at, PRIMARY KEY(owner_user_id,request_id)). 원시 테이블은 PUBLIC·moneyverse_app의 직접 SELECT/DML 권한을 회수하고 본인 검증 SECURITY DEFINER 함수에만 제한적 EXECUTE를 허용한다. 무제한 작성자 UUID 검색 함수 금지.
9. **인덱스/한도:** 활성 숨김 부분 인덱스 (owner_user_id,created_at DESC,id DESC) WHERE active; UNIQUE(owner,author)로 묘비 포함 중복 방지; 영수증 PK owner+request; 공개 글 기존 (created_at DESC,id DESC) 인덱스 활용, 추가 author/visibility 인덱스는 격리 EXPLAIN 근거가 있을 때만 도입한다. 회원당 **활성 숨김 최대 200명**, 회원·상태 행 잠금으로 동시 한도 초과 방지. 합성 게시글 페이지네이션 10,001건은 운영 숨김 한도와 무관하다. 해제 후 재숨김에도 버전 단조 증가·묘비 보존.
10. **원자적 쓰기:** 트랜잭션 시작→활성 users 회원 행 잠금→본인 mute state 잠금→숨김 등록 시 공개 글 FOR SHARE 검증→기존 mute 행을 안정적인 UUID 순서로 잠금→대상 활성·본인 여부·한도·expectedVersion·중복 키 검사→active/묘비 및 version·generation 증가→불변 영수증 INSERT→한 번에 COMMIT. 동일 회원+requestId+정규화된 작업/글 또는 muteId/expectedVersion HMAC은 최초 영수증 반환, 다른 본문으로 같은 키 재사용은 409. 글 삭제·회원 탈퇴·숨김 변경과 경합하면 재검증/실패 처리하고 오래된 작성자에 대해 성공을 확정하지 않는다. HMAC 키 버전 교체·보존 기간 명시, 영수증에 이름·글 본문 미저장.
11. **개인 피드 조회:** DB 소유 함수 member_board_personal_list(actor,limit,cursor)가 공개 가능 글을 본인 활성 숨김과 NOT EXISTS로 조인하고 **LIMIT 이전 필터링**, (created_at DESC,post_id DESC) 키셋 순서로 반환한다. 인증된 응답에서만 authorUserId를 제공한다. 커서는 HMAC으로 본인·세션 식별자 해시·필터·숨김 generation·상한 워터마크·마지막(created_at,postId)·15분 이내 만료를 결합한다. 위조/타 계정/만료 커서는 정보 노출 없이 400/409. 숨김 generation 변경 시 Refresh를 요구하여 혼합 페이지를 막는다. 신규 글은 새로고침 때 표시하고 삭제 글은 사라질 수 있으며 과거 완전 스냅샷을 보장하지 않는다. OFFSET 및 공개 캐시 혼합 금지. 공개 사이트맵·구조화 데이터는 기존 공개 조회만 사용한다.
12. **개인정보 생명주기:** 탈퇴는 소프트 삭제이므로 즉시 읽기·쓰기 차단 후 본인 숨김·상태·영수증·백업 보존/삭제 기간을 개인정보 검토로 확정한다. ON DELETE CASCADE만으로 삭제 보장 불가. 숨김 기록이 있는 계정 병합은 명시적 이전 정책과 테스트 전 차단하며 임의 이전·타인 숨김 관계 노출 금지. 삭제된 작성자 이름 익명화. 관리자는 개인별 숨김 목록 열람·수정 권한이 없고 k>=20 및 차분 공격 억제를 적용한 비식별 통계만 제공한다.

### 보안·SEO·접근성·지표·검증·배포
13. **보안/악용방지:** BOLA/BFLA, CSRF, 타인 영수증·커서 재사용, UUID 열거, DELETE IDOR, 본인 숨김, 작성자명 XSS, 요청 폭주, 무제한 페이지네이션, 공개 캐시 누출을 차단한다. DB 함수에서도 회원 활성·동의를 검증한다. 직접 테이블 권한 확대 금지. 운영 제재·섀도밴·DM 차단·알림·공개 소셜 그래프와 혼동 금지. 감사 로그에는 회원 식별자/작업/결과만 최소화하고 작성자 이름·본문·토큰·쿠키·HMAC 키를 남기지 않는다.
14. **접근성/SEO/모바일:** WCAG 2.2 AA 키보드·포커스 복원·aria-live 상태 안내·해제 버튼, 320px/200% 확대, reduced motion, 주요 터치 버튼 44px(제품 목표; WCAG AA 법정 최소와 혼동 금지). 개인 피드·설정은 noindex/nofollow·사이트맵 제외·private no-store 및 적절한 세션 Vary. 공개 /board는 기존 indexable·60초 재검증·canonical 유지. 공개 ISR 캐시에 회원별 HTML을 저장하지 않으며 봇 감지로 인가를 대체하지 않는다.
15. **분석/KPI:** 개인 정보 없이 숨김 의도→확정 영수증 전환, 해제율, 개인 피드 D7 재방문, 게시글 열람률, 빈 피드/오류/409 비율, 작성자 이용 불가율, 피드 p95 지연을 측정한다. **타인 정보 누출 0, 공개 글 억제 0, WLD/원장 변경 0, 거짓 성공 0, 검증 없는 상태 확정 0**은 배포 불변 조건이지 관측 실적이 아니다. 집계 코호트 k>=20, 작성자 타깃 식별자 분석 수집 금지. 사업효과·목표치는 실제 측정 전 HYPOTHESIS로 표시.
16. **테스트/회귀:** 폐기 가능한 실제 PostgreSQL에서 동일 요청 100건 동시 재시도, 서로 다른 본문 동일 키 100건, 타 회원 조회·삭제 100건, 200명 경계 한도 경합 100건, 합성 공개 글 10,001건 키셋, 글 삭제 대 숨김 경합, 본인 숨김, 탈퇴/병합, 계정 전환, 공개 SEO·캐시 불변, 빈 피드·부분 장애, 서명 커서 세대 무효화, XSS 이름, Android POST/DELETE, 키보드·320px·스크린리더를 검증한다. 영수증 불변·중복 활성 0·정렬/중복 없음·권한 확대 없음·WLD/원장 변경 없음. 미인가 또는 허위 성공 한 건이라도 실패.
17. **무중단 배포/롤백:** 기능 스위치 기본 OFF. P0 ENV/SEC/REL과 266/280 마이그레이션 충돌 해결 후 별도 개발 브랜치·설계/구현 계획 사람 검토, 격리 PG RED/GREEN, lint/typecheck/unit/integration/app-api/Android/security/SEO/a11y, **최종 정확 SHA** 공식 인증 Test(API/DB/세션/사용자 흐름/회귀), 독립 QA PASS, 백업 복원, GitOps 사람 승인, 1%→10%→100% 카나리 및 롤백. 롤백은 스위치 OFF와 기존 경로 복원, 테이블·묘비·영수증 보존, 파괴적 마이그레이션/공개 글 필터 변경 금지. 기획 PR만으로 운영승격 금지.
18. **외부 근거 10,000건 게이트:** OWASP API Top 10 (https://api-security.owasp.org/editions/2023/en/0x11-t10/), W3C WCAG 2.2 (https://www.w3.org/TR/wcag/), PostgreSQL SELECT 잠금 문서 (https://www.postgresql.org/docs/18/sql-select.html) 공식 발행기관 3곳을 설계 참고로 검토했다. 신규 **최종 승인** 독립·중복제거·실제 근거 분류 기록 **0건**, 누적 검증 수량 **미확인 / 목표 10,000건**. **BLOCKED / IN PROGRESS**, 달성 주장 금지.

### P0/P1 개발 인계 — 독립 검증 가능한 10개 작업
- **P0 ENV1268-01** — miniPC 실측 루트 89%/11G 여유(14:06 KST; QA v1268의 과거 100%/177MiB보다 개선), 안전한 용량 감시·운영/개발/Test DB 격리·암호화 백업의 독립 복원; 타 작업자 Worktree 보존.
- **P0 SEC1268-02** — 개발 DB 241개 중 235개 테이블 앱 직접 UPDATE/DELETE, PUBLIC 은행 함수 3개 실행권한; 정방향 최소권한·본인/동의 부정 테스트, 운영 DB 임의 권한 변경 금지.
- **P0 REL1268-03** — QA v1268 FAILED/HOLD, Migration266 체크섬·280 4중 충돌, Frontend 6건 실패, 전체 감사 Critical2/High10, SWF·경매 원장 위험, 정확 SHA Test 금융 E2E·GitOps·복원 미통과.
- **P0 BOARD1268-04** — 공개/회원 작성자 식별·deleted_at·운영 노출 조건 실증, 개인 전용 필터 경계와 공개 ISR/SEO 불변, 삭제 경합.
- **P1 BOARD1268-05** — 본인/대상 유니크 묘비, 200명 한도, 단조 세대, HMAC 영수증, 인덱스·ACL·계정 생명주기 격리 DB 설계.
- **P1 BOARD1268-06** — 게시글에서 작성자 추출하는 원자적 숨김/해제, 회원 우선 잠금·버전 CAS·동일 키 재생·다른 본문 409·100건 경합·영수증 확인.
- **P1 BOARD1268-07** — SQL LIMIT 이전 필터·본인/세션/세대 서명 커서·합성 10,001글 페이지네이션·사후 필터 금지.
- **P1 BOARD1268-08** — NestJS 인가 API, Next.js /board/personal 및 /account/board-muted-authors, 글 상세 CTA, Android app-api 계약.
- **P1 BOARD1268-09** — 탈퇴/병합·익명화·관리자 k>=20 통계·noindex/no-store·WCAG 2.2 AA·안전 지표·남용 제한.
- **P1 BOARD1268-10** — 정확 SHA 격리 DB·보안·CI·Android·SEO·접근성·QA, 무중단 기능 스위치 롤아웃 및 OFF 롤백, 전 게이트 PASS 전 운영 금지.

**판정: DRAFT / HOLD.** 기획 문서만 작성하며 실제 기능 구현·운영 테스트·main 병합·배포는 수행하지 않는다.


## v2026.10.25.1266 — F675-123 일정 원천 버전·만료·개인 ICS 신뢰성 보완 (기능 보완 / 기획 초안 / 운영 보류)
- Draft PR [#1274](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1274) OPEN/HOLD; 개발 이슈 [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267) 갱신, main 병합·운영승격 없음.

### 회차·실제 코드 근거
- **이전 기능 추가 v1264 → 현재 기능 보완 v1266 → 다음 기능 추가 v1268(잠정).** 원격 main c9a868b1e622341e2daa8b936ddf0988eda9988e 시작·중간 재조회. main AGENTS.md/README.md/영문 정본 PROJECT_PLAN.md/국문 대조 확인. 선행 기획 Draft #1268은 미병합이며 개발 이슈 #1267로 이관. 이번 작업은 문서 기획이지 기능 구현·운영 반영이 아님.
- **실제 main 확인:** Migration 037 season_active_events()의 ends_at은 개별 이벤트 마감이 아닌 **소속 시즌의 종료일**이다. Migration 038 season_event_admin_update()는 제목·활성 상태를 변경하지만 updated_at·revision이 없다. Migration 165 shop_catalog_list_v2()는 **카탈로그 sale_ends_at**을 반환하면서 별도로 **재고 starts_at/ends_at**을 필터링한다. calendar/shop-deadlines.ts는 파싱 가능한 종료 시각이면 **이미 지난 날짜도** 포함한다. 현행 목록은 변경·취소 이력을 보증하지 않으므로 저장된 시각만으로 유효한 미래 일정을 확정할 수 없다.
- **회원 목적/범위:** /calendar에서 자발적으로 관심 등록·해제, 본인 전용 /account/calendar-watchlist에서 **원천 열기**, **최신 검증**, **삭제**, **검증된 .ics 다운로드**. 푸시·이메일·상시 공개 구독 피드·계산형 주간/당일 이벤트·WLD/원장/보상 변경 금지. 비회원은 로그인, 정지/동의 만료 계정은 접근 차단. 저장 유무보다 현재 원천 검증이 내보내기 여부를 결정한다.

### 원천 식별·버전·시간 무결성(P0)
1. **서버 권위 원천 해석기:** 좁게 EXECUTE를 허용한 SECURITY DEFINER 함수가 (본인,종류,원천ID)의 안정된 식별자·복합 버전·UTC 마감·유효 상태·사유를 반환한다. SEASON_END는 이벤트·시즌 활성, 시즌 시작<=검증 시각<시즌 종료를 확인하고 마감 명칭을 **시즌 종료**로 명시한다. SHOP_SALE_END는 상품·재고 활성 기간과 미래 sale_ends_at을 모두 검증한다. 재고가 판매 종료보다 먼저 종료되면 더 이른 날짜를 임의 판매 종료로 바꾸지 않고 **이용 불가**로 표시한다. 만료·비활성·삭제·품절·원천 불명은 유효한 미래 마감으로 내보내지 않는다. 품절은 복구 가능하므로 취소와 구분한다.
2. **단조 증가 원천 버전 필수:** 현재 main에는 신뢰할 수 있는 변경 버전이 없다. 충돌 중인 280을 재사용하지 않는 향후 순방향 마이그레이션으로 이벤트+상위 시즌, 카탈로그+재고의 revision/changed_at 또는 변경 이력 원장을 추가한다. 관리자 수정·기간 변경·재고 상태 변경과 같은 트랜잭션에서 버전을 증가시키고 관련 행의 복합 버전을 생성한다. 현재 값 해시만으로는 변경 후 원복(ABA)을 검출할 수 없으므로 **버전·격리 회귀 검증 전 VERIFIED 확정 금지**. 앱 계정 테이블 직접 권한·PUBLIC 실행 권한 금지.
3. **시간·잠금 일관성:** 회원 행 → 관심 행 → 원천 이벤트/시즌 또는 카탈로그/재고 행을 결정적 UUID 순서로 잠그고 단일 DB 스냅샷·서버 검증 시각을 사용한다. 관리자 변경과 경합하면 충돌·재검증 또는 제한된 재시도, 오래된 마감 확정 금지. 저장 버전과 원천 버전이 달라지면 CHANGED_RECONFIRM, 원천 소실은 UNAVAILABLE_SAVED(제목 비식별, 삭제 가능). 로그아웃·계정 전환 후 이전 응답 폐기.
4. **영속 저장·멱등 영수증:** member_calendar_watches의 (user_id,source_kind,source_id) UNIQUE, watch.version/generation 단조 증가 및 active 묘비. member_calendar_watch_receipts의 (user_id,request_id) UNIQUE와 본인+동작+종류+원천+기대 버전+원천 버전 HMAC 결합. 같은 요청 재전송은 최초 확정 영수증, 같은 키로 다른 내용은 409. 회원 행 잠금 아래 활성 100건 한도 계산(동시 100건 초과 불가). 해제 후 재등록해도 버전·불투명 ICS UID 초기화 금지. 소프트 탈퇴·계정 병합은 별도 정리/보존 심사 필요, ON DELETE CASCADE만으로 해결 불가.

### 화면·API·ICS·관리·배포 수용 조건
5. **회원 상태/CTA:** LOADING, AVAILABLE, WATCHING, SAVED_CONFIRMED, CHANGED_RECONFIRM, EXPIRED, SOLD_OUT, UNAVAILABLE_SAVED, UNVERIFIABLE, CONFLICT, UNKNOWN_COMMIT, ERROR, SIGNED_OUT. verifiedAt/원천 버전·종류·사유 표시. 날짜 변경 시 **변경된 일정 확인**으로 검증·동의 후 반영; 삭제된 원천도 **목록에서 제거** 가능. 오래된 날짜를 현재 날짜처럼 표시하지 않고 오류를 빈 목록 성공으로 바꾸지 않는다. 320px/200% 확대, 키보드/스크린리더 안내, 색상 외 텍스트, WCAG 2.2 AA.
6. **Nest 본인 API 제안:** GET /api/v1/calendar/watchlist?limit=20&cursor= (본인·세션·필터·스냅샷 HMAC, created_at/id 키셋, 최대 50); PUT/DELETE /api/v1/calendar/watchlist/:kind/:sourceId JSON {requestId,expectedVersion,expectedSourceRevision}; GET /api/v1/calendar/watchlist/receipts/:requestId; GET /api/v1/calendar/watchlist/export-preview는 검증·제외 건수와 검증 시각만 본인에게 제공. 비회원 401, 계정/동의 403, 타인/미존재 동일 404, 버전/중복 충돌 409, 남용 429, 원천 실패 503. 세션·CSRF·동의, no-store 필수. Android는 허용 경로 검증 후 JSON 동등 계약만 제공(게이트웨이는 임의 멱등 헤더를 전달하지 않으므로 본문 필드 사용), 바이너리 ICS는 1차 웹 전용.
7. **단일 스냅샷 내보내기:** 동일 출처·인증 GET /account/calendar-watchlist/export.ics는 **일회성 파일**이며 공개 구독 URL이 아니다. 모든 관심 원천을 **하나의 일관된 DB 읽기 트랜잭션**에서 재검증해 verifiedAt/복합 버전과 함께 확정한 결과만 렌더링한다. 개별 HTTP 목록을 이어 붙이거나 이전 미리보기·부분 장애를 신뢰하지 않는다. 미리보기/실제 다운로드 제외 건수를 명시하고 둘 사이 원천 변경 가능성을 설명한다. 유효 0건은 명시적으로 안내하며 임의 일정을 만들지 않는다.
8. **RFC 5545·삽입 공격 방어:** VEVENT마다 회원 식별자가 없는 영속 불투명 UID, UTC DTSTAMP, 실제 마감 시각 UTC DTSTART, 안전하게 이스케이프한 SUMMARY 사용. 임의 지속시간·주최자·참석자·알림·RRULE·취소 갱신을 생성하지 않는다. 신뢰 가능한 단조 버전/시각 없이는 SEQUENCE/LAST-MODIFIED를 주장하지 않는다. 다운로드한 스냅샷은 이전 외부 캘린더 가져오기를 자동 갱신하지 않는다. CRLF, 역슬래시/쉼표/세미콜론/개행 TEXT 이스케이프, UTF-8 문자 중간을 자르지 않는 **75옥텟** 접기, 제어문자 차단, 100건/256KiB 제한 및 실제 파서 왕복 검증. text/calendar; charset=utf-8, 고정 안전 파일명 attachment, private,no-store, nosniff. URL·UID·파일명·로그·분석에 회원 ID 노출 금지.
9. **관리자·개인정보·KPI:** 관리자에게는 k≥20 비식별 통계·차분 공격 억제만 제공, 개인 관심 목록 조회/수정 금지. 탈퇴·병합·보존 정책 승인, ICS 본문·제목 로그 저장 금지. 개인 화면 noindex/nofollow/no-store, 사이트맵·구조화 데이터 제외. 분당 쓰기 12회·시간당 내보내기 6회, UUID/열거형/커서 엄격 검증. 목표: **검증 안 된 마감 내보내기 0, 타 회원 노출 0, WLD/원장 변경 0**; 버전 지연 p95, 변경 확인률, 제외 사유, ICS 파서 성공률, 429/503 지표.
10. **격리 QA·운영승격:** 폐기 가능한 PostgreSQL에서 동일/상이 요청 100건, 타인 100건, 한도 경합 100건, 합성 커서 10,001건(실제 한도 100), 시즌 비활성·이름/종료 변경, 상품 판매일 변경·재고 조기 종료/품절/재입고, 변경→원복(ABA), 관리자 취소와 ICS 동시 실행, 서울 시간대, UTF-8 75옥텟/CRLF/삽입/파서 왕복, 로그아웃·병합·소프트 탈퇴·원천 부분 장애를 검증. 개발 별도 브랜치·기능 기본 OFF·266/280 해결 후 순방향 마이그레이션·정확 최종 SHA 공식 Test 금융 E2E·격리 암호화 복원·보안/권한/롤백·승인 GitOps 전 운영승격 금지. 기능 OFF 롤백은 진입점·내보내기만 숨기고 승인 보존 정책에 따라 기록 유지.

### P0/P1 개발 이관 — 독립 검증 가능한 10건
- **P0 ENV1266-01** — 타 작업자 삭제 없이 루트 용량 확보(13:02 KST 100%, 여유 181MiB, 데이터 볼륨 91GiB), 운영/개발/Test DB 분리·암호화 복원.
- **P0 SEC1266-02** — 개발 앱 계정 UPDATE/DELETE 235/241 테이블·PUBLIC 은행 함수 3개 권한 정리, SECURITY DEFINER 본인·동의 검증 및 타인 접근 음성 테스트.
- **P0 REL1266-03** — QA v1267 FAILED/HOLD, Migration266 체크섬/280 충돌, 프론트 6건 실패, 기존 보안 감사 Critical2/High10, 정확 SHA Test/복원/CI·승인 GitOps 차단.
- **P0 CAL1266-04** — 시즌 상위 종료/상점 재고 상태를 결합한 권위 원천 해석기, 단조 복합 버전, 허구 마감 차단.
- **P1 CAL1266-05** — 순방향 버전/변경 이력·관심 묘비/UID/영수증 DB UNIQUE/CHECK/인덱스·보존/병합, 마이그레이션 번호 충돌 해결 후 지정.
- **P1 CAL1266-06** — 회원 우선 잠금·버전 CAS·100건 한도·HMAC 멱등/409·관리자 원천 변경→원복 경합.
- **P1 CAL1266-07** — Nest 본인 목록/미리보기/영수증·BFF 단일 스냅샷 ICS·503 실패 차단·안전 헤더/제외 건수.
- **P1 CAL1266-08** — Next 화면 변경 확인 CTA·접근성·Android JSON 게이트웨이 동등성·세션 무효화.
- **P1 CAL1266-09** — 탈퇴/병합/보존·k-익명 관리자·SEO/no-store·남용 제한·KPI.
- **P1 CAL1266-10** — 격리 PG 동시 100건/합성 10,001건/ABA/원천 취소/ICS 파서 회귀·정확 SHA Test·카나리/롤백 검증.

**근거 게이트·안전:** RFC Editor RFC5545, OWASP API1:2023, PostgreSQL 잠금, W3C WCAG 2.2 지침 계열 검토. **이번 회차 신규 독립 중복 제거·승인 근거 0건, 누적 승인 수량 미확인 / 목표 10,000건 → BLOCKED / IN PROGRESS.** QA v1267 FAILED/HOLD. 기획 문서만 변경; 런타임·DB·WLD·원장·기능 스위치·Test·운영 변경 없음.

## v2026.10.25.1264 — F675-123 검증형 회원 일정 관심 목록·개인 ICS 내보내기 (기능 추가 / 기획 초안 / 운영 보류)
- Draft PR [#1268](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1268) 및 개발 이슈 [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267)는 OPEN/HOLD; 미병합 #1261을 기반으로 한 문서 초안.

### 회차·실제 코드 근거·작업 경계
- **이전 기능 보완 v1262 → 현재 기능 추가 v1264 → 다음 기능 보완 v1266(잠정).** 원격 main `c9a868b1e622341e2daa8b936ddf0988eda9988e` 시작·중간 재조회, main `AGENTS.md`, `README.md`, 영문 정본 `PROJECT_PLAN.md`와 한국어 대조 검토. 미병합 Draft #1261 위에 쌓인 **문서 전용** 후속이며 기능은 배포되지 않음. 개발 이슈 [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267). 최신 완료 QA **v1265 FAILED/HOLD**; v1266 감사 산출물은 있으나 종합 릴리스 PASS는 확인되지 않음.
- **코드 확인:** main `frontend/src/app/calendar/page.tsx`는 `GET /api/v1/seasons/events`의 `event_id/ends_at`, `GET /api/v1/shop/catalog`의 `catalog_id/sale_ends_at`, `/api/v1/engagement/early-game`의 주간 갱신 계산값을 표시. `calendar/shop-deadlines.ts`는 NULL이 아니고 날짜로 해석 가능한 판매 종료 시각을 정렬함. `/api/v1/early-game/today`는 오늘의 개인화 사건으로 미래 일정 근거가 아님. 조사한 main에서 회원 관심 일정 저장/인증 ICS 내보내기는 확인되지 않음. 신규 기능은 **제안**이지 현행 구현이 아님. 판매 종료 표시는 구매/보상 보장을 뜻하지 않음.
- **대상·목적:** 실제 공지된 시즌/상점 종료일을 다시 찾고 싶은 로그인 회원. 푸시·이메일 알림, 자동 구독 URL, 임의 일정 수집, 허구 반복 일정, WLD/원장 변경은 범위 제외. 개발 C의 알림함, 개발 A/B의 금융·국고 작업과 분리. 기존 캘린더·본인 권한 설계를 통합 문서에 흡수하며 분산 기획서 추가 금지.

### 회원 흐름·권한·상태·화면
1. `/calendar`에서 서버가 확인한 **미래 시즌 이벤트 종료** 또는 **상점 판매 종료**만 **관심 등록** 가능. `/account/calendar-watchlist`에서 **관심 해제**, **원본 열기**, **상태 새로고침**, **검증된 일정 .ics 내려받기** 제공. 비로그인 사용자는 로그인 안내, 목록은 본인만 조회. 회원당 활성 **100건** 상한, 동일 원천은 삭제 표식을 포함한 하나의 행만 보존. 종료·취소·비공개 원천 등록은 409 `SOURCE_NOT_WATCHABLE`.
2. 화면 상태: `LOADING`, `AVAILABLE`, `WATCHING`, `SAVED_CONFIRMED`, `CHANGED`, `EXPIRED`, `UNAVAILABLE_SAVED`, `CONFLICT`, `UNKNOWN_COMMIT`, `ERROR`, `SIGNED_OUT`. 사라진/숨겨진 원천은 **제목·날짜를 가린 상태로 관심 해제만 허용**. 날짜 변경 시 **변경된 날짜 확인** CTA와 본인 한정 이전·현재 비교를 표시하며, ICS에는 저장 시각이 아니라 **내보내기 직전 재검증한 최신 원천 시각**만 사용. 원천 조회 장애는 `UNVERIFIABLE`로 처리하고 가짜 날짜/0건으로 속이지 않음.
3. 개인화된 오늘 사건은 미래 일정 계약이 없고 주간 갱신은 계산값이므로 v1에서는 **안내만 표시**, 관심 등록·ICS 대상에서 제외. 시간은 UTC로 저장하고 화면에는 Asia/Seoul과 시간대를 명시. 유효한 원천 시각이 없으면 `DATE_UNAVAILABLE`. 외부 URL·임의 리다이렉트 금지, 원본 이동은 허용된 내부 경로만 사용.

### API·DB·트랜잭션·악용 방지 (모두 개발 제안)
4. Nest 본인 전용 `GET /api/v1/calendar/watchlist?cursor=`, `PUT /api/v1/calendar/watchlist/:kind/:sourceId`, `DELETE /api/v1/calendar/watchlist/:kind/:sourceId`, `GET /api/v1/calendar/watchlist/receipts/:requestId`. 쓰기 JSON `{requestId:UUID,expectedVersion:integer}`; 세션·동의·CSRF 검사와 **분당 12회** 쓰기 제한. 목록 `items[],nextCursor,sourceCheckedAt` 및 회원/세션 결합 서명 키셋 커서 `(created_at,source_kind,source_id)`; 스냅샷/버전 변화 시 409 재조회, OFFSET 금지. PUT/DELETE 응답은 불변 `{receiptId,requestId,committedVersion,active,sourceStatus}`. 같은 키+동일 요청은 최초 영수증 재전송, 다른 요청 내용은 409 `IDEMPOTENCY_CONFLICT`, 구버전은 409 `VERSION_CONFLICT`. 타인 영수증·원천 식별 여부 노출은 404, 원천 미검증 503, 과도한 요청 429. `SECURITY DEFINER` 함수 내부에서 본인 권한 검증; 앱 계정 직접 테이블 GRANT 금지.
5. DB 신설안(**Migration 266 체크섬 및 280 4중 충돌 해소 전 번호 지정 금지**): `member_calendar_watches(user_id UUID,source_kind CHECK IN('SEASON_END','SHOP_SALE_END'),source_id UUID,active boolean,version bigint CHECK(version>0),created_at timestamptz,updated_at timestamptz,PRIMARY KEY(user_id,source_kind,source_id))`; `member_calendar_watch_receipts(user_id,request_id UUID,source_kind,source_id,operation,request_hmac,key_version,committed_version,result_active,created_at,PRIMARY KEY(user_id,request_id))`. 관심 목록 인덱스 `(user_id,active,created_at DESC,source_kind,source_id)`, 영수증 `(user_id,created_at DESC)`. 연산 종류·키 버전·양수 버전 CHECK; 영수증은 불변이며 개인 이름·원문 설명·텍스트 미보관. 원천 합법 삭제를 막는 RESTRICT FK 금지, 원천이 사라지면 정책 승인된 기간 동안 불투명 삭제 표식만 유지.
6. **원자성:** DB 함수가 활동 중인 회원/동의를 확인하고 회원 행을 먼저 잠가 100건 상한을 직렬화한 뒤 관심 행 잠금, 동일 트랜잭션 스냅샷의 권위 있는 시즌/상점 원천 함수를 통해 유효성 확인, 버전 CAS·HMAC 요청 지문 확인, 관심 행과 불변 영수증을 한 번에 확정. 동시 요청으로 상한 초과·해제 후 구버전 재등록이 발생하지 않아야 함. 삭제 표식도 버전을 단조 증가시키며 0으로 초기화 금지. 응답 유실은 영수증 확인 후 현재 GET으로 재조정. 원천 취소와 확정 경합은 문서화한 원천 잠금/스냅샷으로 재검증하거나 실패 차단. 계정 소프트 삭제 즉시 조회/쓰기 차단, 탈퇴 정리 및 계정 병합 사전 검사에 관심·영수증 포함(소프트 삭제는 FK CASCADE가 아님); 자동 계정 간 이전 금지, 보존·백업 파기는 개인정보 검토 필요.

### RFC 5545 내보내기·Android·관리자
7. 같은 출처 인증 Next BFF `GET /account/calendar-watchlist/export.ics`는 내보내기 직전 모든 활성 관심 원천을 다시 확인, 종료·취소·검증 불가 일정은 **누락 건수를 별도 안내**하고 ICS에는 포함하지 않음. 최대 **100 VEVENT**, 영구 공개 피드·서명 URL·무인증 구독 엔드포인트·회원 ID·세션 토큰·잔액·원문 메모·외부 링크 금지. 검증된 마감 순간은 개인 정보 없는 `UID=SHA256(kind|sourceId)@easy-scraping.com`, UTC `DTSTAMP`, 마감 시각 UTC `DTSTART`와 `DURATION:PT1M`으로 **마감 표시**(실제 행사 시작 주장 금지), `SUMMARY`에 마감 명시. RFC 5545 TEXT의 역슬래시·세미콜론·쉼표·개행 이스케이프, CRLF, UTF-8 문자를 쪼개지 않는 75옥텟 접기, 제목 길이 제한. 헤더 `Content-Type:text/calendar; charset=utf-8`, `Content-Disposition:attachment`, `Cache-Control:private,no-store`, `X-Content-Type-Options:nosniff`. 검증 가능한 이벤트가 0이면 JSON 409, 원천 전체 장애면 503; 캐시된 날짜로 대체 금지. ICS는 **일회성 스냅샷**이며 추후 원천 변경이 외부 캘린더에 자동 동기화되지 않음을 명시.
8. Android app-api는 허용 경로/계약 검증 이후 JSON 관심 목록·등록·해제·영수증만 동등 제공. 현행 `frontend/src/app/app-api/v1/[...path]/route.ts`는 JSON 본문과 일부 헤더만 전달하므로 버전·멱등성 필드는 JSON 본문으로 전송. 바이너리 ICS는 첨부/미디어 계약 검증 전 **웹 전용 v1**. 로그아웃·계정 전환 시 진행 중 응답과 캐시 폐기. 회원 화면 `noindex,nofollow`, 사이트맵 제외, `Cache-Control:private,no-store`; WCAG 2.2 AA 키보드·상태 실시간 안내·포커스·320px 화면·200% 확대 검증.
9. 관리자에게는 **k≥20** 차등 추론 방지 집계만 제공: 원천 종류별 관심 수, 날짜 변경/원천 부재 비율, 내보내기 오류율·지연. 회원별 목록·식별자·파일명·임의 수정 권한 금지. KPI **미검증 날짜 내보내기 0, 타인 정보 노출 0, WLD/원장 변경 0** 및 7일 재방문율, 원천 무효 비율, 내보내기 성공률, p95 지연. 관리자 집계는 원천 사실을 대체하지 않음.

### P0/P1 개발 이관 — 독립 검증 가능한 10개 작업
- **P0 ENV1264-01** — 다른 작업자 자료를 삭제하지 않는 루트 디스크 복구(관측 100%, 약 349MiB), 운영/개발/Test DB 격리, 암호화 백업 복원.
- **P0 SEC1264-02** — 개발 앱 계정 과도한 DML(235/241)과 PUBLIC 은행 함수 3개 EXECUTE 제거, 본인 전용 SECURITY DEFINER, BOLA/BFLA 차단 검증.
- **P0 REL1264-03** — Migration266 체크섬/280 번호 충돌, 프론트 6건 실패, v1266 전체 감사 Critical2/High10, 최종 정확 SHA Test 금융 E2E 및 서명 승격 HOLD 해소.
- **P0 CAL1264-04** — 안정적인 원천 식별자, 시즌/상점 마감 사실·취소·변경·잠금/스냅샷 계약; 추정 주간·오늘 사건 제외.
- **P1 CAL1264-05** — 관심·삭제 표식·영수증 DB, 제약·인덱스·100건 상한, 개인정보 보존·병합; 충돌 해소 후 순방향 마이그레이션.
- **P1 CAL1264-06** — 회원 우선 잠금, 원천 확인, 버전 CAS, HMAC 멱등성/409, 중단·재시도 원자성.
- **P1 CAL1264-07** — Nest 본인 조회/쓰기/영수증, 동일 출처 BFF RFC5545 내보내기, 실시간 원천 확인·안전 헤더·오류 유형.
- **P1 CAL1264-08** — Next 캘린더 CTA·관심 목록·상태, Android JSON 동등성, 세션 격리·WCAG 2.2 AA.
- **P1 CAL1264-09** — 관리자 비식별 집계, 탈퇴/병합/보존, SEO/캐시 차단, 악용 제한·KPI.
- **P1 CAL1264-10** — 격리 실제 PG: 동일 키 100건 경합, 타인 100건 조회, 합성 10,001건 키셋(운영 한도 100 유지), 100건 상한 경합, 내보내기 중 원천 취소·날짜 변경, 75옥텟 한글 UTF-8·ICS 주입/파서 왕복, 구버전·로그아웃·탈퇴·병합, 백업 복원·Android 게이트웨이. 기본 기능 스위치 OFF, 정확 SHA Test와 승인된 카나리/GitOps 후에만 승격. 롤백은 UI·쓰기·내보내기를 비활성화하되 감사 영수증을 보존하고 WLD/원천 데이터를 변경하지 않음.

### QA·외부 근거 게이트·작업 제한
- QA v1265 FAILED/HOLD; v1266 감사 산출물(11:21~11:23 KST) 전체 **Critical2/High10**, 운영 의존성 **High2**, 봇 테스트 **8/8** 확인했지만 v1266 종합 PASS 미확인. 루트 100%(약 349MiB), DB 권한·Migration·CI·정확 SHA Test·복원 차단 지속. 본 문서는 실제 장애 수정이나 배포 결과가 아님.
- 검토한 외부 독립 발행처: RFC Editor [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html), [OWASP API1:2023](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/), [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). **이번 회차 중복 제거·최종 승인 0건, 누적 승인 수 미확인 / 목표 10,000건 → BLOCKED / IN PROGRESS.** 공식 설계 참고 3곳을 승인된 10,000건 증거로 집계하지 않음.
- 기획 예약은 런타임 코드·DB·WLD·원장·기능 스위치·Test·Production을 변경하지 않음. 개발 별도 브랜치·독립 QA 정확 SHA Test·승인된 운영 승격 필수.

## v2026.10.25.1262 — F675-122 주간 퀘스트 이력의 일관된 발행·원천 완결성 보완 (기능 보완 / 기획 초안 / 운영 보류)
- Draft PR #1261 (https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1261), 개발 이슈 #1256 (https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1256); OPEN/HOLD 유지.

### 회차 및 실제 근거
- 이전 **기능 추가 v1260** → 현재 **기능 보완 v1262** → 다음 **기능 추가 v1264**(잠정). 원격 main `c9a868b1e622341e2daa8b936ddf0988eda9988e` 시작·중간 재확인. main `AGENTS.md`, `README.md`, 영문 정본 `PROJECT_PLAN.md`, 국문 대조 문서를 검토. 미병합 Draft #1257의 **문서 기획 후속**이며 실제 구현이 아님. 최신 완료 QA **v1265 FAILED/HOLD**(2026-10-25 10:20 KST).
- 실제 마이그레이션 `101-early-game-progress.sql`의 현재 주차 계산은 `created_at >= v_from`만 적용하고 **주차 종료 배타적 상한이 없으며**, 현재의 변경 가능한 최고 레벨 직업을 사용함. NPC 지표는 평생 누적·자가 신고로 주간 검증 대상에서 제외. 현행 함수를 과거 주차 마감 함수로 재사용하지 않고 고정된 직업·목표 근거와 주차 양쪽 경계로 별도 계산해야 함.
- **v1260 미구현 설계의 추가 위험:** 목표별 최신 head가 독립 변경되면 한 주의 일부 목표만 수정된 혼합 버전이 조회될 수 있음. 마감 후 24시간 경과만으로 원천 영수증·원장의 수집 완결성을 증명할 수 없음. 실제 장애나 데이터 유실 발생을 확인했다는 뜻은 아님.

### 주차 단위 원자적 발행 및 완결성 계약(제안)
1. **주차 전체 세대(generation) 단일 권위:** 추가 전용 `member_weekly_goal_archive_generations(user_id,week_start,generation,published_at,source_cutoff,policy_version,completeness_status,prior_generation,reason_code,provenance_hmac,key_version)`, 추가 전용 `member_weekly_goal_archive_goals(user_id,week_start,generation,goal_code,target,progress,source_family,evidence_status,source_count,...)`, 단일 최신 포인터 `member_weekly_goal_archive_week_heads(user_id,week_start,generation)` 제안. PK는 각각 `(user_id,week_start,generation)`, `(user_id,week_start,generation,goal_code)`, 목표→세대 및 포인터→세대 FK, 회원·주차 head UNIQUE. 세대/목표 양수, 진행도 음수 금지, 서울 월요일·7일 경계, 허용 목표·상태, `window_kind='week' AND self_reported=false` CHECK. 목록 `(user_id,week_start DESC)`, 상세 `(user_id,week_start,generation,goal_code)` 인덱스. Migration 266/280 정리 전 번호 배정 금지.
2. **주차 전체 원자적 발행:** 회원·주차 단위 advisory lock → 주차 head 행 잠금 → 일관된 원천 스냅샷 → **검증 대상 3개 목표 전체**와 세대 선언·감사 영수증 삽입 → 목표 코드 집합/건수 및 완결성 검증 → 같은 트랜잭션에서 단일 head 교체. 일부만 기록된 주차는 공개 금지. 목표 하나만 수정돼도 **3개 전체를 담은 새로운 세대**를 발행하고 이전 세대·근거는 불변 유지. 동일 재시도는 최초 세대 반환, 다른 근거는 승인된 수정 이력 필요. 커밋 전 오류는 새 head가 전혀 노출되지 않아야 함.
3. **VERIFIED 전 원천 완결성 증명:** 작업 보상 영수증, 해당 원장 거래·전표, 고정된 직업/목표 정책 등 필수 원천별 내구성 있는 연속 체크포인트·시퀀스와 상한을 보관. 단순 `현재시각-24시간` 또는 `MAX(created_at)`는 완결성 워터마크가 아님. 서울 주차 종료 시점까지 모든 원천의 연속 수집 증명, 지연 도착/소급 변경 재조정 정책, 최소 24시간 유예가 모두 충족될 때만 VERIFIED. 현재 파이프라인이 증명하지 못하면 `PENDING_FINALIZATION` 또는 `UNVERIFIABLE`, 검증 달성 분자 제외. 소급/역분개 발생 시 새 전체 세대로 수정하고 과거 근거는 덮어쓰지 않음. 은행 순저축은 입금-출금, 배타적 주차 상한과 정확한 bigint/문자열 사용.
4. **조회 일관성·개인정보:** 목록/상세/영수증은 단일 SQL 문 또는 안정된 읽기 트랜잭션에서 **동일 발행 세대**를 한 번 선택해 목표와 합계를 조인. 본인 API에 `generation`, `completenessStatus`, `sourceFamilyStatus`, `publishedAt`, `correctedFromGeneration` 추가. 서명 커서는 회원/세션 및 발행 기준 시점을 고정하거나 변경 시 409 `ARCHIVE_CHANGED`와 재시작 토큰을 반환하여 페이지 간 세대 혼합 방지. 타인 영수증은 404, 근거 장애는 503이며 가짜 VERIFIED/0 반환 금지. 근거 지문은 키 버전·회전·보존 정책을 가진 HMAC 사용; 원장 원문·개인식별자·추측 가능한 원천 ID를 영수증/로그에 저장하지 않음.
5. **회원·관리자·Android·접근성:** `/quests/history` 목록/상세에 `PENDING_SOURCE`, `PENDING_FINALIZATION`, `VERIFIED`, `CORRECTED`, `UNVERIFIABLE`, `NOT_ARCHIVED`, `ERROR`를 색상 외 텍스트로 표기하고 근거 설명 CTA 제공. 수정 배너는 개인정보 없는 세대 이력으로 이동. 보상 Claim/Complete 버튼과 WLD 변경 금지. Android app-api도 본인 세대/상태 계약과 계정 전환 시 캐시 무효화 동일 적용. 관리자는 k≥20 집계로 체크포인트 누락·수정·지연만 확인(차분 공격 방지), 회원 원문 및 목표 수동 수정 권한 없음. 개인 화면 sitemap 제외, `noindex,nofollow`, `private,no-store`; WCAG 2.2 AA, 키보드, 320px/200% 확대 지원.
6. **KPI·격리 검증·배포:** 혼합 세대 조회 **0**, 잘못된 VERIFIED **0**, 타인 노출 **0**, 원장/WLD 변경 **0**을 필수 지표로 지정. 원천별 체크포인트 지연 p95, 미확정 비율, 수정 지연, 아카이브 범위 집계. 향후 격리 실제 PostgreSQL에서 마감 재시도·수정 경합 100건, 타인 조회 100건, 수정 중 합성 10,001건 커서, 목표 삽입~head 변경 사이 장애, 지연·소급 영수증/역분개, 서울 월요일/종료 상한, 직업/목표 변경, 2^53 초과 정수, HMAC 키 회전, 탈퇴·병합, Android·로그아웃 검증. 디스크·DB 권한·Migration·CI/보안·정확 최종 SHA 공식 Test 금융 E2E·승인된 카나리/GitOps·복원 게이트 전 기능 OFF. 롤백은 조회/마감만 중지하고 불변 이력은 보존.

### P0/P1 개발 인계 — 10개
- **P0 ENV1262-01** — 루트 용량 안전 복구(QA v1265: 100%, 약 368MiB), 운영·개발·Test DB 격리, 암호화 백업 격리 복원; 타 작업자 보존.
- **P0 SEC1262-02** — 개발 앱 계정 UPDATE/DELETE 235/241 및 PUBLIC 은행 함수 3개 권한 개선, 본인 검증 SECURITY DEFINER, 타인 접근·관리자 권한·HMAC 개인정보 음성 테스트.
- **P0 REL1262-03** — 적용 Migration 266 체크섬 불일치, 280 번호 4중 충돌, 프론트 CI 6건 실패, 보안 감사, 정확 SHA Test·승격 HOLD 해결.
- **P0 QUEST1262-04** — 원천별 연속 완결성 체크포인트, 주차 양쪽 경계, 과거 직업/목표 정책 증빙 확보; 증빙 없으면 VERIFIED 금지.
- **P1 QUEST1262-05** — 순방향 불변 주차 세대·목표·단일 head FK/UNIQUE/인덱스와 개인정보 안전 근거 증명.
- **P1 QUEST1262-06** — 전체 주차 원자적 마감, 체크포인트 게이트, 잠금 순서, 멱등 영수증, 전체 세대 수정 및 장애 롤백.
- **P1 QUEST1262-07** — NestJS 본인 전용 세대 일관 목록/상세/근거 API, 409 커서 재시작, 404/503, bigint 문자열.
- **P1 QUEST1262-08** — Next.js 근거/수정 화면, Android app-api 동등성, 세션 무효화, WCAG 2.2 AA.
- **P1 QUEST1262-09** — 탈퇴·병합·보존, 비식별 관리자, SEO/no-store, HMAC 키 회전, 원천 지연 KPI.
- **P1 QUEST1262-10** — 격리 PG 동시성·타인·커서·지연 원천·장애 주입 회귀, 정확 최종 SHA Test/복원/카나리/롤백.

**QA·근거 진실:** v1265 FAILED/HOLD. main CI 성공 표시는 runtime-check SKIPPED, PR #1255 runtime-check FAILED(프론트 6건). 루트 100%, 개발 DB 과도 권한, Migration 266/280, 운영/Test SHA가 main과 다름. 외부 독립 레퍼런스 10,000건 중 이번 승인 **0**, 누적 승인 **미확인(UNKNOWN)** → **BLOCKED / IN PROGRESS**. 기획은 런타임·DB·WLD·원장·Test·운영을 변경하지 않으며 다른 작업자와 예약도 변경하지 않음.


## v2026.10.25.1260 — F675-122 검증형 주간 퀘스트 목표 이력·원천 근거 아카이브 (기능 추가 / 기획 초안 / 운영 보류)

### 회차·코드 근거·기능 경계
- 이전 **기능 보완 v1258** → 현재 **기능 추가 v1260** → 다음 **기능 보완 v1262**(잠정). 원격 최신 **main** `c9a868b1e622341e2daa8b936ddf0988eda9988e` 시작 시 확인, 중간·완료 재조회 예정. main의 `AGENTS.md`, `README.md`, 영어 기준 `PROJECT_PLAN.md` 및 한국어 `PROJECT_PLAN.ko.md`를 대조했다. 미병합 기획 Draft #1248 위에 쌓는 **문서 초안**이며 구현된 기능이 아니다. 최신 완료 QA **v1264 FAILED/HOLD**(2026-10-25 09:56 KST).
- 실제 코드: `frontend/src/app/quests/page.tsx`는 `GET /api/v1/engagement/early-game`으로 이번 주 목표를 표시한다. `backend/src/engagement/engagement.controller.ts`와 Migration `101-early-game-progress.sql`의 `early_game_weekly_goals(p_actor)`는 **현재 서울 기준 월요일**을 계산하고 시간 조건이 **시작 경계만** 있으며 과거 주간 아카이브 API·마감 스냅샷이 없다. 세 목표는 작업 보상 영수증·원장 전표에서 계산하는 주간 지표이고 NPC 목표는 **평생 누적·자가 신고**이다. `user_job_progress`의 현재 직업 순위는 변하므로 과거 직업 작업을 현재 상태로 재계산하면 기록이 바뀔 수 있다. 이는 설계 공백이며 실제 데이터 유실 확인은 아니다.
- 목적·대상: 로그인·동의가 유효한 활성 회원이 **지난주 이전의 목표 달성 내역**과 인정된 근거를 확인하고, 검증된 달성과 미확인 기록을 구분한다. 공개 순위·회원 간 이력 노출·새 WLD 보상·원장 변경은 범위 밖이다. 현재 주간 진행률의 권위는 기존 `/quests`에 둔다.

### 회원 화면·권한·CTA·상태
- 기존 `/quests` 주간 목표 아래 **지난주 기록 보기** → 비공개 `/quests/history` 주차 목록 → `/quests/history/[weekStart]` 상세. **현재 주로 돌아가기**, **인정 근거 보기**, **재시도** CTA. 비로그인 사용자는 기존 로그인 화면으로 이동하고 동일 출처 복귀 경로만 허용한다. 로그인 전 HTML에 개인 기록을 포함하지 않는다.
- 주차 카드에는 서울 기준 `weekStart`, `weekEndExclusive`, 당시 목표 이름·기준치·단위, 문자열형 진행값, `sourceCutoff`, `revision`, `capturedAt`, `evidenceStatus`, `selfReported`를 표시한다. 상태: `NOT_ARCHIVED`(기록 미확보, **0회로 표시 금지**), `PENDING_FINALIZATION`, `VERIFIED`, `CORRECTED`, `UNVERIFIABLE`, `UNAVAILABLE`, `ERROR`. 마감 및 원천 검증 전에는 `VERIFIED` 금지, 수정 시 원본 영수증 보존과 수정 사유 표시. 현재 주는 `/quests`의 `IN_PROGRESS`이며 완료 이력에 포함하지 않는다.
- `window_kind='week'`이고 `self_reported=false`인 **세 가지 목표만** 주간 검증 달성률에 포함한다. `weekly_npc_regular`은 평생 누적·자가 신고이므로 주간 완료 분자/분모에서 제외하고 별도 노출 시에도 자가 신고 표시를 유지한다. 당시 목표 정책·기준치·직업 배정 근거가 없으면 `UNVERIFIABLE`로 처리하고 임의 소급 산출 금지. 회원용 **완료/보상 받기/수정** 버튼을 새로 만들지 않는다.
- 키보드·스크린리더 순서, 색상과 독립된 상태 텍스트, 수정 이력 접근성, 터치 44px, 화면 320px·확대 200%, TalkBack·VoiceOver, WCAG 2.2 AA를 준수한다.

### 제안 API·Android 동등 계약(미구현)
- `GET /api/v1/engagement/weekly-archive?limit=8&cursor=...` → `{items:[{weekStart,weekEndExclusive,status,verifiedGoals,eligibleGoals,revision,sourceCutoff}],nextCursor}`; 최대 12주/페이지, 회원·세션·정렬 기준·필터를 결합한 HMAC 서명 커서, 본인 전용, `Cache-Control: private, no-store`.
- `GET /api/v1/engagement/weekly-archive/:weekStart` → `{weekStart,weekEndExclusive,status,goals:[{code,label,target,progress,unit,completed,sourceKind,evidenceStatus,selfReported,revision,receiptId}],capturedAt,sourceCutoff,correctionAvailable}`. 서울 기준 과거 월요일인 `YYYY-MM-DD`만 허용. 잘못된 날짜 400, 기록 없음 404, 원천 장애 503. WLD·bigint 수치는 모두 **10진 문자열**로 전달하고 JS Number 변환 금지.
- `GET /api/v1/engagement/weekly-archive/receipts/:receiptId` → 본인 확인 후 `{weekStart,goalCode,revision,sourceCutoff,policyVersion,sourceFamily,finalizedAt,status}`만 반환. 원시 전표·타 회원·비밀 로그·개인 식별정보 노출 금지. 회원 쓰기 API는 **없다**. Next.js server-only 경계, 세션·동의 검증, Android `/app-api/v1/engagement/weekly-archive/...` 동일 읽기 계약, 오프라인 가짜 완료 표시 금지.
- HTTP 401 비로그인, 403 이용 제한/동의, 404 타인·없는 영수증 구별 불가, 400 날짜·커서 오류, 429 남용, 503 DB·근거 장애. 로그아웃/계정 변경 시 응답·커서 폐기, 장애를 200 빈 `VERIFIED`로 변환 금지.

### 제안 PostgreSQL·마감 트랜잭션·무결성
- Migration 266/280 충돌 해결 전 **새 번호 할당 금지**. 불변 수정 이력 `member_weekly_goal_archive`의 복합 키 `(user_id uuid,week_start date,goal_code text,revision integer)`; 필드 `week_end_exclusive`, `catalog_version`, `source_cutoff`, `captured_at`, `source_family`, `source_digest`, `source_count bigint`, `target bigint`, `progress bigint`, `unit`, `completed`, `evidence_status`, `correction_reason_code`, `job_context_version`. 월요일·7일 간격·양수 목표·음수 아닌 진행/수정 번호·허용 상태·`self_reported=false` CHECK. 인덱스 `(user_id,week_start DESC,goal_code,revision DESC)` 및 복합 UNIQUE. `member_weekly_goal_archive_heads`가 승인된 최신 revision만 가리키고 과거 행 UPDATE 금지.
- 별도 최소권한 마감 작업자가 서울 기준 주 종료 후 **최소 24시간 유예**와 원천 수집 워터마크 충족을 확인한다. 작업 advisory lock + head `FOR UPDATE`, 일관된 `sourceCutoff`, `(weekStart,goalCode,revision,sourceDigest)` 멱등 처리. 원천·스냅샷·head·감사/outbox를 하나의 트랜잭션으로 확정한다. 동일 digest 재실행은 최초 영수증, 변경 digest는 **감사된 새 revision**으로만 정정한다. 작업 중 실패 시 일부만 VERIFIED 금지.
- Migration 101의 **허용 거래 유형**과 은행 입금-출금 순액 규칙을 그대로 사용하고, 과거 주차에는 시작·**종료 미포함** 시간 경계를 모두 적용한다. 영수증 시각·bigint 정밀도를 유지한다. 현재 `user_job_progress`만으로 당시 직업은 입증 불가하므로 주차별 직업 배정 원천/버전이 없으면 `weekly_job_tasks`는 `UNVERIFIABLE`. 과거 정책 부재·늦은 소급 전표·수정·은행 전표 모호성도 임의 0 처리 금지. 기능 시작 전 과거 주차의 자동 소급 생성은 기본 금지.
- `moneyverse_app`·PUBLIC에 신규 테이블 직접 SELECT/DML 부여 금지; 회원 소유권을 DB 내부에서 확인하는 `SECURITY DEFINER` 조회 함수만 좁게 EXECUTE 허용. 마감자는 전용 최소권한 역할 사용, 회원 쓰기 함수 없음. 계정 soft delete/병합은 명시적 접근 차단·보존·삭제 승인, 과거 이력 임의 양도 금지. WLD·원장·은행 잔액·보상·NPC 친밀도 변경 없음.

### 관리자·남용 방지·SEO·KPI·테스트·배포
- 관리자 `/admin/engagement/weekly-archive`: 최근 성공 주차, 마감 지연, 워터마크 부족, 누락 스냅샷, 수정 건수, 실패 큐 및 **k≥20** 비식별 집계만 읽기 전용. 이름·원시 원장·수동 보상 지급·직접 수치 변경 금지. 수정은 별도 승인·감사된 관리자 작업에서만 수행한다.
- 회원당 GET 30회/분, 최대 12주/페이지, 커서 길이 제한, 엄격한 날짜 파서, 동일 형태 404, 세션 연계 HMAC, 민감 로그 제거. 회원 이력 `noindex,nofollow`, `no-store`, sitemap/공개 JSON-LD 제외; 공개 `/quests` 메타데이터에 개인 정보 노출 금지.
- KPI: 아카이브 대상 주차 대비 생성률, VERIFIED·UNVERIFIABLE 비율, 마감 지연 p95, 수정 건수·소요시간, 거짓 VERIFIED **0건**, 타 회원 유출 **0건**, 원장 변경 **0건**. 모든 대상 목표의 근거가 승인된 경우에만 주차 전체 VERIFIED로 집계한다.
- **향후 격리된 실제 PostgreSQL 테스트**: 마감 작업 100건 동시 재시도→단일 revision/head, 타 회원·영수증 100건 접근 차단, 합성 이력 10,001건 커서 중복/누락 없음, 서울 월요일 경계, 정책 변경, 직업 순위 변동, 소급 원장 수정, 중간 실패, 근거 누락, 탈퇴·병합, 2^53 초과 bigint, Android·세션 전환, 320px 접근성. 원장·잔액·보상 동일성 검증. **현재 미실행**.
- 기능 스위치 기본 OFF, 별도 개발 브랜치, Migration 266/280 및 DB 권한 선해결, 소급 복원 기본 OFF, 격리 Test에서 shadow 계산·101 현행 비교, 최종 **정확 SHA** 인증 E2E·보안·백업 복원·카나리·GitOps 승인 후 승격. 롤백은 UI·마감 작업만 OFF, 불변 감사/이력 보존, 금융 데이터 불변. QA v1264 **FAILED/HOLD**: 루트 100%(약 375MiB), 앱 DML 235/241, PUBLIC 은행 함수 3개, Migration266 체크섬·280 충돌, 기존 프론트 6건 실패, 감사 Critical2/High10·봇 Critical1/High5, 정확 SHA Test·복원 미검증.
- 외부 독립 레퍼런스 **중복 제거·근거 분류·승인 10,000건** 목표 유지. 기존 검토 발행기관 PostgreSQL/OWASP/W3C **3곳**, 이번 신규 승인 **0건**, 누적 승인 **미확인** → **BLOCKED / IN PROGRESS**. 합성 테스트·중복 URL·발행기관 수를 승인 근거 건수로 세지 않는다.

### 개발 예약 인계 P0/P1 백로그
- **P0 ENV1260-01** — 타 작업 보호 저장 공간 복구, 운영·개발·Test DB 격리, 암호화 백업 독립 복원.
- **P0 SEC1260-02** — 실제 PG 앱 최소권한·PUBLIC 은행 함수 3개 실행권한 회수, 본인 조회·관리자 개인정보 차단.
- **P0 REL1260-03** — Migration 266/280, CI·보안·프론트 실패, 최종 정확 SHA 인증 금융 Test E2E, GitOps 승격 보류.
- **P0 QUEST1260-04** — Migration101 지표 기간, 과거 직업 귀속·목표 정책 버전·소급 정정 근거 확인, 근거 없는 백필 거부.
- **P1 QUEST1260-05** — 전진 전용 수정 이력/head DB·인덱스·원천 영수증·본인 조회 함수·권한 부정 테스트.
- **P1 QUEST1260-06** — 24시간 유예·워터마크 마감 작업, 잠금·멱등·수정 revision·원자적 롤백.
- **P1 QUEST1260-07** — NestJS 본인 목록·상세·영수증 API, 서명 키셋 커서·bigint 문자열.
- **P1 QUEST1260-08** — Next.js 주간 이력 화면, 미확인·수정 상태, Android 동등성·접근성.
- **P1 QUEST1260-09** — 개인정보·관리자 지연 집계·요청 제한·noindex/no-store·KPI.
- **P1 QUEST1260-10** — 격리 PG 100 동시성·100 타인 접근·10,001 합성 이력·근거/정정/서울 경계 회귀·정확 SHA Test/카나리/롤백.


## v2026.10.25.1258 — F675-121 게시판 댓글 팔로우 재시도·삭제·알림 무결성 보완 (기능 보완 / 기획 초안 / 운영 보류)

### 회차 및 실제 근거
- 이전 **Feature Addition v1256** → 현재 **Feature Improvement v1258** → 다음 **Feature Addition v1260**(잠정). 원격 main `c9a868b1e622341e2daa8b936ddf0988eda9988e` 시작·중간 재확인, main AGENTS.md·README.md·PROJECT_PLAN.md(영어 정본)·PROJECT_PLAN.ko.md 대조. 미병합 Draft #1241 및 이슈 #1240 후속 **문서 전용** 기획이며 코드·DB·Test·운영 변경 없음.
- 정확한 main 코드 확인: `packages/database/migrations/048-member-board-threads.sql`의 `member_board_comments.idempotency_key`는 전역 UNIQUE다. `member_board_comment_create(p_actor,p_post,p_body,p_key)`는 기존 키 재시도에서 **작성자만 비교**하고 원래 글 ID/본문을 비교하지 않아 같은 회원이 다른 본문/글에 키를 재사용하면 과거 댓글을 성공처럼 반환할 수 있다. 첫 삽입 동시성은 UNIQUE 충돌 가능성이 있고, 글 존재 검사는 삭제와 잠금 직렬화되지 않는다. `member_board_comment_delete(p_actor,p_comment,p_key)`는 **p_key를 사용하지 않고** boolean을 반환한다. `backend/src/board/board.controller.ts`의 DELETE `:id/comments/:commentId`는 경로의 글 ID를 무시한다. 이는 **코드로 확인한 설계 위험**이지 실제 악용·데이터 손실 입증은 아니다.
- Migration 259의 공개·회원 댓글 조회는 소프트 삭제된 댓글·글을 제외한다. 기존 댓글 생성은 확정 댓글 이벤트/outbox를 기록하지 않는다. 개발 C의 실제 알림함 Draft #1206은 미병합이므로 중복 알림 저장소를 만들거나 main에 구현됐다고 주장하지 않는다.
- QA v1261 정확 main 격리 감사: 프론트 Vitest **6건 실패/1,397건 통과**, 전체 감사 **Critical 2/High 10**, 봇 **Critical 1/High 5**, 루트 디스크 **100%(시작 시 여유 약 444MiB)**. 운영/개발 DB 경계, 앱 과도 DML/PUBLIC 은행 EXECUTE, Migration 266 체크섬/280 충돌, 공식 정확 SHA 인증 Test 금융 E2E 및 격리 복원은 계속 차단; QA **FAILED/HOLD**.

### 보완된 기능·데이터 계약 (제안, 미구현)
1. **댓글 생성 멱등성:** 순방향 신규 함수는 글 행을 잠그고 회원·공개 여부를 검증한 뒤 `(회원,글ID,정규화본문,요청ID,작업)`에 묶인 불변 영수증을 보존한다. 같은 요청은 최초 확정 댓글/영수증을 `newlyInserted=false`로 반환하고, 같은 키로 다른 글/본문/작업을 제출하면 **409**로 거부하며 이벤트를 생성하지 않는다. 첫 삽입 UNIQUE 경합은 충돌 후 원본 조회·내용 대조로 처리해 500/중복 알림을 방지한다. 적용된 Migration 048은 수정 금지.
2. **글 삭제와 순서:** 신규 쓰기는 `글 FOR UPDATE → 댓글 행 → 팔로우/영수증/outbox` 순서로 잠그고 글 삭제도 같은 글 잠금을 따른다. 댓글 확정 뒤 글이 삭제되면 발송 직전 워커가 차단한다. 글 삭제 뒤 댓글 쓰기는 실패·이벤트 없음. 이미 전달·열람한 알림은 과거 노출 자체를 취소할 수 없으므로, 삭제 후 **알림 철회/본문 가림 또는 원천 상세 조회 재검증**을 요구하며 과거 노출이 전혀 없었다고 보장하지 않는다.
3. **댓글 삭제 경로·영수증:** 경로 `:postId`와 실제 댓글의 글 ID를 잠금 안에서 비교한다. 다른 글 경로로 호출해도 다른 글 댓글이 삭제되지 않도록 동일한 비노출 오류로 거부한다. 삭제 `requestId`는 `(회원,글ID,댓글ID,DELETE)`에 결합하고 동일 재시도는 최초 영수증, 다른 내용 재사용은 409를 반환한다. 기존 HTTP 204 클라이언트는 전환 기간 호환을 유지하고 새 버전의 영수증 API는 **200 JSON**을 사용한다(204 본문 금지).
4. **팔로우 세대·알림:** `(user_id,post_id)` 묘비의 `version/generation`을 단조 증가시킨다. 팔로우/알림 끄기/해제와 댓글 생성은 글 우선 잠금으로 직렬화한다. **신규 확정 댓글만** `comment_id` UNIQUE, `(post_id,event_seq)` UNIQUE인 트랜잭션 outbox 이벤트 1개를 만든다. 워커는 `(수신자,댓글ID,generation)` 고유키와 회원 활성·동의·세대·음소거·본인 댓글·글/댓글 공개 여부·기능 스위치를 재확인한 후 **#1206 계약 승인 뒤 기존 검증된 알림함**에 저장한다. 전달 후 상태 변경은 철회 또는 원천 상세 읽기 재검증으로 처리한다.
5. **회원·관리·보안:** `/board/[postId]` 팔로우/알림 끄기/해제, `/account/board-follows` 본인 목록, PENDING/UNKNOWN_COMMIT/CONFLICT/UNAVAILABLE/OFFLINE 상태를 명확히 표시한다. 확정 영수증 없이는 성공 표시 금지. 회원/세션/필터 결합 서명 커서 20건, 활성 200개, 분당 12회, noindex/no-store, 내부 안전 링크, Android JSON `requestId/expectedVersion`, WCAG 2.2 AA 키보드·TalkBack·VoiceOver. 관리자는 k≥20 비식별 큐·철회 통계만 확인하고 차분 공격을 차단한다. 탈퇴·병합은 별도 순방향 사전검사 및 개인정보 보존·삭제 정책이 필요하며 FK CASCADE만 신뢰하지 않는다.

### 개발 예약 이관 백로그 및 검증 (별도 브랜치)
- **P0 ENV1258-01** — 타 작업자 보존형 승인된 디스크 복구, 운영/개발/Test DB 격리, 암호화 백업 복원 증빙.
- **P0 SEC1258-02** — 순방향 앱 최소권한/PUBLIC EXECUTE 보완, 타 회원·다른 글 접근 차단 테스트.
- **P0 REL1258-03** — QA v1261 실패·감사, Migration 266/280, 최종 SHA 공식 Test·보안·GitOps 게이트 해결.
- **P0 BOARD1258-04** — Migration 048의 생성 재시도 원본 글/본문 결합, UNIQUE 경합, 글 잠금·삭제 경로 검증, 개발 C #1206 책임 경계 확정.
- **P1 BOARD1258-05** — 생성·삭제 버전 영수증/충돌 매핑, 순방향 DB 함수, 앱 직접 DML 금지.
- **P1 BOARD1258-06** — 글 잠금 신규 댓글 이벤트/outbox·세대별 중복 방지 워커·오래된 알림 철회.
- **P1 BOARD1258-07** — NestJS/Next.js 버전별 409/412/404/503·영수증, 기존 204 호환, Android JSON 동등성.
- **P1 BOARD1258-08** — 글 CTA/팔로우 목록, UNKNOWN_COMMIT 재조회, 20건 서명 커서·접근성·계정 전환.
- **P1 BOARD1258-09** — 관리자 익명 통계·철회, 탈퇴/병합·남용 제한·SEO·개인정보 KPI.
- **P1 BOARD1258-10** — 격리 실제 PG: 동일/상이 본문 같은 키 100건, 다른 글 삭제 100건, 댓글 생성·글 삭제·팔로우 재가입 경합, 합성 10,001건 커서, outbox 롤백/워커 재시도, 최종 SHA 공식 인증 Test E2E·카나리·롤백.
- 운영승격: 기본 **OFF**, WLD·원장 변경 없음, Migration 266/280 해결 전 신규 번호 예약 금지, 모든 P0/QA/보안/Test/복원 통과 전 운영 배포 금지. 외부 독립 근거 목표 **10,000건 중복 제거·출처 분류·승인**: 검토 발행기관 PostgreSQL/OWASP/W3C 3계열, 이번 신규 승인 **0건**, 누적 승인 **미확인**, **BLOCKED / IN PROGRESS**.


## v2026.10.25.1256 — F675-121 회원 게시판 글 팔로우·검증형 새 댓글 알림 (기능 추가 / 기획 초안 / 운영 보류)

### 회차·근거·범위
- 이전 **Feature Improvement v1254**, 현재 **Feature Addition v1256**, 다음 **Feature Improvement v1258**(잠정). 기준: 시작·중간 원격 main `c9a868b1e622341e2daa8b936ddf0988eda9988e`, `AGENTS.md`, `README.md`, 영문 `PROJECT_PLAN.md` 정본과 국문 대조. 최신 QA **v1259 FAILED/HOLD**. 미병합 기획 PR #1235 위에 쌓인 문서 초안이며 **구현·배포 완료가 아니다**.
- main 확인: `frontend/src/app/board/page.tsx` 공개 게시글, `board/[postId]` 댓글, `backend/src/board/board.controller.ts` 및 Migration 048의 인증된 댓글 작성, Migration 259의 공개 댓글·작성자 조회. `member_board_comment_create`는 멱등 키로 댓글을 저장하지만 글별 팔로우·알림 기능은 확인되지 않았다. `backend/src/notification/notification.controller.ts`에 회원 알림 조회/읽음 API가 존재한다. 개발 C의 미병합 #1206 실제 알림함과 **연계하되 중복 구현·병합 가정 금지**. F675-109 읽기 목록, F675-110 초안, F675-116 수정 이력과 범위를 분리한다.
- 목적: 회원이 명시적으로 팔로우한 글에 **실제로 확정되고 여전히 공개된 새 댓글**이 생기면 앱 내에서 알린다. 자동 구독·금융 알림·WLD 보상·이메일/푸시·공개 팔로워 수 기능은 제외한다.

### 회원 흐름·권한·화면
- 공개 `/board/[postId]`의 **새 댓글 팔로우** CTA. 로그인하지 않은 방문자에게는 **로그인 후 팔로우**만 표시하며 자동 구독하지 않는다. 활성·최신 동의 회원만 공개/미삭제/비제한 글을 팔로우한다. 본인 글 팔로우는 허용하되 본인 댓글은 알리지 않는다.
- 비공개 `/account/board-follows`: `팔로우 중`, `알림 끔`, `이용 불가` 탭, 20건 서명 키셋 페이지, **글 열기·알림 끄기/켜기·팔로우 해제**, 삭제/제한 글은 제목·본문 없이 **목록에서 제거**. 기존 `/account/notifications`는 C의 실제 알림함 계약이 병합·검증된 후에만 재사용한다. 별도 가상 알림함·보상 수령 기능 생성 금지.
- 상태: `NOT_FOLLOWING/FOLLOWING/MUTED/PENDING/CONFLICT/OFFLINE/UNAVAILABLE/ERROR`. 서버 확정 영수증만 성공 표시. 네트워크 실패는 성공으로 위장하지 않으며 같은 `requestId`로 재시도; 412면 최신 버전 재조회. 키보드 초점 복귀, 상태 라이브 영역, 44px 터치, 320px 화면·200% 확대, WCAG 2.2 AA.
- 권한: 본인 목록·팔로우·영수증만 접근, 관리자는 비식별 큐 통계만 조회. 읽기 Session+Authenticated+Consent, 변경은 CSRF 추가. 요청의 userId는 신뢰하지 않고 세션에서 회원 식별. 탈퇴·정지·비공개·삭제된 글/댓글 차단. 기능 OFF 시 신규 팔로우/알림 중단, 기존 내역 조회 및 안전한 해제는 허용.

### 제안 API(미구현)
- `GET /api/v1/board/follows?status=following|muted|all&limit=20&cursor=...` → `{items:[{postId,status,version,updatedAt,available,href?}],nextCursor}`. 제목·링크는 매번 공개 여부 확인 후 제공. HMAC 커서는 회원·세션·필터·스냅샷 상한·마지막 `(created_at,post_id)` 결합. 상태 변경이 일어나면 불변 created_at 정렬도 과거 시점 완전 스냅샷은 아님을 명시. 개인 응답 `Cache-Control: private, no-store`.
- `PUT /api/v1/board/posts/:postId/follow` 본문 `{requestId:UUID,expectedVersion:0 이상 정수,muted:boolean}`, 최초 등록 버전 0. 반환 `{status,version,receiptId,committedAt}`. `DELETE /api/v1/board/posts/:postId/follow`도 동일 본문으로 묘비 처리. `GET /api/v1/board/follows/receipts/:requestId`는 본인만 원본 확정 결과 메타데이터 조회(숨긴 제목·댓글 본문 없음).
- 오류 400 입력, 401 인증, 403 동의/CSRF, 404 부재·타인·비공개를 동일 처리, 409 동일 키/다른 HMAC 요청, 412 구버전, 429 제한, 503 의존성 실패. Android `/app-api/v1/board/...`는 현재 `frontend/src/lib/app-gateway.ts`가 `If-Match`/`Idempotency-Key` 헤더를 전달하지 않으므로 JSON `requestId/expectedVersion` 사용. 쿠키·CSRF·계정 전환 응답 차단 필수.

### DB·트랜잭션·알림 무결성
- 순방향 Migration 번호는 기존 **280 충돌 해결 후** 할당한다. 제안 `member_board_thread_follows`: `(user_id,post_id)` PK, `version bigint>=1`, `generation bigint`, `active`, `muted`, `start_event_seq bigint`, `created_at`, `updated_at`. 회원별 활성 최대 **200개**, 인덱스 `(user_id,active,created_at DESC,post_id DESC)`. 글 FK가 승인된 완전 삭제를 막아서는 안 되며 묘비·영수증으로 이전 상태가 재생성되지 않아야 한다.
- 제안 `member_board_reply_sequences(post_id PK,last_seq)`, `member_board_reply_events(comment_id UNIQUE,post_id,event_seq,committed_at)`와 `(post_id,event_seq)` UNIQUE, `member_board_reply_deliveries(user_id,comment_id,generation,notification_id,delivered_at)`의 `(user_id,comment_id)` UNIQUE. `member_board_follow_receipts(user_id,request_id,request_hmac,key_version,result_json,created_at)`는 본문·제목·URL을 저장하지 않는다. HMAC 키 순환 및 보존기간은 개인정보 승인 전 미확정. 워커 재시도·백오프·실패 격리와 큐 관측 포함.
- 팔로우 변경과 **신규 댓글** 확정은 동일 글 행을 일관된 순서로 잠그고, 진짜 신규 INSERT에만 글별 증가 `event_seq`를 부여해 댓글·이벤트·아웃박스를 같은 트랜잭션에 확정한다. 팔로우는 잠금 상태의 `start_event_seq`를 기록하며 그보다 큰 이벤트와 **동일한 활성 generation**만 알린다. 회원 구독 행 `FOR UPDATE`·버전 CAS로 팔로우/해제/재팔로우 ABA 차단. 동일 키 재전송은 최초 영수증, 다른 내용은 409. 롤백 시 이벤트·알림·영수증 **0건**.
- 알림 워커는 실제 발송 직전에 회원 활성·동의, 구독 generation·mute, 글 공개 상태, 댓글 존재/삭제, 작성자≠수신자를 재검증한다. `(user_id,comment_id)` 유일성으로 재시도 중복 차단. 글/댓글 삭제·운영 제한·팔로우 해제 시 대기 알림 폐기. 내구 알림 페이로드에 댓글 본문·금융 금액·숨겨진 제목 저장 금지. C #1206 알림 계약 미병합이면 **발송 OFF**를 유지한다.
- Migration 010/163 소프트 탈퇴·계정 병합은 FK CASCADE를 보장하지 않으므로 별도 순방향 정리·병합 사전차단, 무단 구독 이전·과거 계정 열람 확대 금지. 보존·백업 삭제는 개인정보 정책 승인 필요. PUBLIC/`moneyverse_app`의 신규 테이블 직접 DML 금지, 본인 검증 `SECURITY DEFINER` 함수만 허용하며 실제 PostgreSQL 권한 부정 테스트 필수.

### 운영·분석·테스트·승격
- 회원당 분당 쓰기 12회, 활성 200개, 글별 과도한 알림 큐 상한·지연·악용신고. 관리자에게 익명 큐 적체/실패/재시도 지연/기능 스위치만 표시. KPI: 팔로우 전환율, 실제 댓글 알림 지연 p95, 중복 전달 목표 0, 삭제 글 정보 유출 목표 0, 열람률(개인 추적 없음), 429 비율. 공개 글 canonical SEO 유지, 비공개 계정·영수증 `noindex/no-store`, 동일 출처 안전 링크, Android/TalkBack·VoiceOver·키보드 검증.
- 향후 격리 검증: 동일 키 100건 동시 등록→영수증 1건, 동일 키 다른 내용 100건→409, 타 회원 100건→비노출, 댓글 작성/팔로우 경합, 멱등 댓글 재생, 글/댓글 삭제·운영 제한, 해제/재팔로우 generation, mute, 계정 병합·탈퇴, 워커 재시작·큐 실패·롤백. **합성** 전달 10,001건 커서 시험(운영 팔로우 200개 상한 유지). 실DB 권한 부정, Nest/Next/Android/금융 회귀 시험 필요. **이번 기획에서 테스트 미실행**.
- 기본 OFF. 개발 A/B/C/Gemini/QA와 분리된 구현 브랜치. P0 루트 용량·운영/개발/Test DB 분리·최소권한·Migration 266/280·보안/CI·격리 암호화 백업 복원, 인증된 **정확 head-SHA 공식 Test** 웹/API/DB/모바일/접근성/금융 E2E, 승인 GitOps 카나리 후 점진 활성화. 롤백 시 신규 등록·알림 차단, 불안전 큐 폐기, 묘비·영수증 보존, WLD·원장 불변. 기획 단계 런타임·DB·Test·Production 변경 없음.

### P0/P1 개발 백로그(총 10건)
- **P0 ENV1256-01** — 소유자 확인 후 루트 디스크 복구, 운영/개발/Test DB 격리, 백업 복원 준비.
- **P0 SEC1256-02** — 격리 PG에서 검증한 순방향 앱 DML·PUBLIC 은행 함수 권한 축소, 회원 ACL/BOLA.
- **P0 REL1256-03** — QA v1259 보안 감사·프론트 CI 6건·Migration 266/280·정확 SHA Test/GitOps 차단 해소.
- **P0 BOARD1256-04** — 실제 댓글 INSERT/재생·글 공개/운영 제한·C #1206 알림 연동·잠금 순서 선행 검증.
- **P1 BOARD1256-05** — 회원 전용 구독/묘비/버전/영수증 DB·인덱스·200개 상한.
- **P1 BOARD1256-06** — 원자적 글별 이벤트 순번·트랜잭션 아웃박스·중복방지·generation 검증.
- **P1 BOARD1256-07** — NestJS 본인 API·404/409/412/429/503 및 Android JSON 계약.
- **P1 BOARD1256-08** — Next.js 팔로우 CTA·목록·Android·키보드/TalkBack·오프라인 상태.
- **P1 BOARD1256-09** — 관리자 익명 통계·개인정보/병합·악용방지·SEO/KPI.
- **P1 BOARD1256-10** — 격리 100건 경합·합성 10,001 커서·정확 SHA 회귀·카나리·롤백.
- 외부 독립 근거 10,000건 게이트: PostgreSQL·OWASP·W3C **발행기관 3곳** 검토, 신규 승인·중복 제거 **0건**, 누적 승인 **미확인/10,000**, **BLOCKED / IN PROGRESS**. 참고: https://www.postgresql.org/docs/17/explicit-locking.html ; https://api-security.owasp.org/editions/2023/en/0x11-t10/ ; https://www.w3.org/TR/WCAG22/ . 발행기관 3곳을 근거 10,000건으로 계산하지 않는다.


## v2026.10.25.1254 — F675-120 거래 메모의 계정 병합·삭제·커서 무결성 보완 (기능 보완 / 기획 초안 / 운영 보류)

### 회차·영문 정본·실제 소스에서 확인한 위험
- **이전:** Feature Addition v1252, **현재:** Feature Improvement v1254, **다음:** Feature Addition v1256(잠정). 시작·중간 원격 main c9a868b1e622341e2daa8b936ddf0988eda9988e 확인. 최신 main AGENTS.md·README.md·PROJECT_PLAN.md(영문 정본)·PROJECT_PLAN.ko.md 대조. QA v1257 FAILED/HOLD. 미병합 Draft #1229의 문서 전용 후속 기획이며 실제 기능 구현이나 운영 사고가 아니다.
- **확인한 충돌:** Migration 163의 admin_merge_forked_member_account는 p_merge의 로그인 식별자와 세션을 p_keep으로 옮기지만, 과거 accounts 및 ledger_postings는 원래 p_merge 소유로 남기고 p_merge 회원을 소프트 삭제한다. 현재 병합 거부 목록에는 신규로 제안된 거래 메모/영수증 테이블이 없다. Migration 010의 account_soft_delete 역시 회원 행을 삭제하지 않는다. 지갑 저장소는 ledger_transactions.actor_user_id가 아니라 accounts.owner_user_id를 통한 실제 전표 소유권을 사용한다. 따라서 병합 과정에서 메모를 무단 이전하거나 이전 회원의 과거 원장을 새 회원에게 노출해서는 안 된다. 이는 미래 연동 위험이며 실서비스 메모 유실이 확인됐다는 뜻이 아니다.
- **기존 v1252 명세 정정:** 수정 가능한 updated_at을 커서 정렬 키로 사용하면 수정된 항목이 커서 경계를 넘어 누락되거나 중복될 수 있다. 단순 시각 워터마크는 목록 구성원까지 고정하지 않는다. original_result와 일반 SHA256 지문은 개인 메모 본문 보존 또는 짧은 문구 사전 대입 위험을 명확히 차단하지 못했다.

### 계정 병합·원장 소유권·원자적 잠금 계약(제안)
- 과거 거래의 정당한 소유자는 해당 거래의 USER_CASH/USER_BANK 전표와 accounts.owner_user_id로 입증한다. 과거 계좌의 현재 status가 closed/frozen이더라도 소유 전표 검증에는 사용할 수 있지만, 현재 요청자는 active 회원·유효 세션·동의 상태여야 한다. 거래 actor_user_id, 관리자 병합 로그, 클라이언트 UUID만으로 소유권을 인정하지 않는다. 타인·시스템 전용·미존재 거래는 동일한 404로 응답하며 상대방 정보는 숨긴다.
- **P0 병합 차단:** 별도 승인된 순방향 Migration에서 Migration 163의 병합 함수를 안전하게 갱신한다. 경제 이동/세션 이전 이전에 p_keep·p_merge 두 users 행을 UUID 정렬 순서로 잠그고, p_merge에 활성 메모·삭제 묘비·요청 영수증 중 하나라도 있으면 전체 병합을 SQLSTATE 55000으로 거부한다. 메모 저장도 회원 행을 먼저 잠가 병합과 직렬화한다. 부분 병합·계좌 owner 변경·메모 자동 복사·임의 WLD 조정은 금지한다. p_keep의 기존 메모는 그대로 유지한다. 추후 이전 정책은 동일인 검증, 개인정보 승인, 원장 출처, 독립 테스트를 갖춘 별도 심사가 필요하며 이번 기획에서 승인하지 않는다.
- p_merge에 메모가 없어 정상 병합된 경우에도 p_keep은 기존 소유권 조건으로 p_merge의 과거 거래를 열람하거나 메모할 수 없다. 과거 거래 참조가 제시되면 개인 정보를 드러내지 않는 이용 불가 상태만 표시한다. 병합만으로 과거 원장 열람권이 이전된다고 주장하지 않는다. 회원 소프트 삭제나 관리자 계정 폐쇄 시 메모 API 접근은 즉시 차단하고, FK ON DELETE CASCADE를 개인정보 자동 삭제로 오인하지 않는다.
- 쓰기 잠금 순서는 활성 users 회원 행 FOR UPDATE → 거래·본인 소유 전표 확인 → 메모 행 → 영수증이다. 관리자 병합은 두 회원 행을 결정적 순서로 잠근 뒤 사전검사를 마치고 기존 금융 이동을 진행한다. 교착/잠금 시간 초과는 실패 폐쇄하며 동일 requestId·본문의 제한적 재시도만 허용한다. 저장·삭제·병합 경합에서 부분 결과가 남으면 안 된다.

### 개인정보 최소화·삭제 묘비·멱등 영수증
- (user_id,transaction_id) 복합 PK와 단조 증가 bigint version, 삭제 묘비를 유지한다. DB CHECK는 활성 메모의 허용 category 및 NFC 정규화 1~240 유니코드 코드포인트, 삭제 행의 category IS NULL AND note IS NULL AND is_deleted=true를 강제한다. 삭제 트랜잭션에서 본문·분류를 NULL로 지우고 버전을 올리며 영수증을 함께 확정한다. 삭제 묘비에는 필요한 회원·거래·버전·시각만 승인된 기간 보존한다. PostgreSQL WAL·MVCC·백업까지 즉시 물리 삭제됐다고 주장하지 않는다.
- 짧은 개인 메모의 일반 SHA256 대신 비밀키 기반 HMAC-SHA256 정규 요청 지문과 key_version을 저장한다. 승인된 영수증 TTL 동안 이전 검증 키를 안전하게 유지하여 키 교체 후에도 재시도를 확인한다. 비밀키를 DB/로그에 저장하지 않는다. 불변 original_result에는 operation, transactionId, committedVersion, confirmedAt, status만 저장하고 **메모·분류·요청 본문·상대방 원장 정보는 절대 넣지 않는다.** 같은 회원+requestId+같은 본문은 CAS 전 원본 메타 영수증을 재생하고, 다른 본문은 409, 오래된 버전은 412다. 과거 영수증으로 삭제된 메모를 되살리거나 현재 존재를 단정하지 않는다.
- 응답 유실 시 영수증 조회 뒤 본인 GET으로 현재 상태를 다시 확인한다. 서버 확정 전 저장 성공 표시 금지. 삭제 후 로컬 초안·비공개 캐시·지연 응답을 폐기하고 버전 묘비만 유지한다. 탈퇴 시 즉시 접근 차단 후 승인된 보존/백업 삭제 정책을 수행한다. 영수증 30일 보존은 제안일 뿐 개인정보 담당자의 승인 전 확정 정책이 아니다. 오류·추적·관리자·분석·CSV·SEO·사이트맵에 본문을 남기지 않는다.

### 안정적인 목록·웹/Android·관리자·보안·테스트
- updated_at 대신 변경 불가능한 annotation.created_at DESC, transaction_id DESC로 정렬하고 (user_id,created_at DESC,transaction_id DESC) WHERE is_deleted=false 인덱스를 사용한다. 서명 커서에는 본인·세션 세대·필터·발급 시각·asOf·마지막 created_at/transaction_id·짧은 만료를 포함하며 최대 50건씩 반환한다. 서버 지정 created_at은 수정하지 않고 created_at <= asOf로 새 행을 제외한다. 수정은 목록 순서를 바꾸지 않는다. 삭제는 이후 페이지 길이를 줄일 수 있고 묘비 재활성화는 표시 여부를 바꿀 수 있으므로 **안정된 정렬이지 과거 시점의 정확한 스냅샷은 아니다.** 완전 스냅샷이 필요하면 별도 기간 제한된 물리화 목록 설계가 필요하며 현재 구현됐다고 주장하지 않는다.
- 기존 /wallet/activity 최근 50건 CTA와 /wallet/annotations 저장 목록을 유지한다. 전체 과거 거래 탐색을 제공한다고 약속하지 않는다. v1252의 본인 전용 NestJS GET/PUT/DELETE/영수증 API를 유지한다. Android app-api는 PUT/DELETE 본문을 전달하지만 헤더는 허용 목록이므로 expectedVersion/requestId는 검증된 JSON 본문을 사용한다. 쿠키·CSRF·동의·계정 전환 응답 폐기, private/no-store, noindex, 320px/200% 확대, 키보드/TalkBack 초점 및 삭제/충돌/불명/이용불가 상태를 명시한다. 원장·WLD·잔액·타인 데이터는 수정하지 않는다.
- 관리자는 k>=20 집계와 차분 공격 방어 지표만 열람하고 메모 본문/회원/거래 ID를 보지 않는다. 병합 차단 집계도 개인 식별을 노출하지 않는다. 회원당 분당 12회 쓰기, 활성 500개 한도는 회원 행 잠금으로 경쟁을 제어한다. 본문 2KiB 이하, 정규화·허용 분류, 타인/미존재 균일 404, 공개 공유 금지.
- **향후 격리 실 PostgreSQL 수용 테스트(이번 회차 미실행):** 저장 대 관리자 병합 100건, 활성/묘비/영수증만 있는 병합 원천의 전액 롤백, 메모 없는 병합의 기존 동작 보존, p_keep의 p_merge 원장 접근 거부, 타인 접근 100건, 같은 키/다른 본문 100건, 저장/삭제 100건, 탈퇴 경합, HMAC 키 교체·내용 비복원, 다회원 합성 10,001건의 수정·삭제·재저장 커서 테스트, Android 본문·세션·접근성·캐시, 원장/잔액 불변 검증.
- 기본 기능 OFF. Migration266 체크섬 및 네 PR의 Migration280 충돌 해소 전 신규 번호 할당 금지. 별도 개발 브랜치·승인된 순방향 SQL·정확 후보 SHA 전체 CI/보안·격리 DB 최소권한 부정 테스트·공식 Test 인증 금융/Android E2E·암호화 백업 복원·롤백 훈련·승인 GitOps 이후에만 운영승격. OFF 상태에도 묘비/영수증 및 본인 확인 복구 경로를 안전하게 유지한다. 이번 기획은 런타임·DB·배포를 변경하지 않는다.

### P0/P1 개발 백로그·외부 근거
- **P0 ENV1254-01:** 루트 디스크 100%(시작 시 약 589MiB 여유), 별도 데이터 볼륨 약 101GiB; 운영·개발·Test DB 및 5433 격리, 타 작업자 자료 보존, 암호화 백업 격리 복원.
- **P0 SEC1254-02:** 개발 DB 앱 계정 241개 중 235개 UPDATE/DELETE 및 PUBLIC 은행 EXECUTE 3개를 승인된 순방향 최소권한과 부정 테스트로 개선; 운영 권한 상태로 일반화하지 않는다.
- **P0 REL1254-03:** QA v1257 FAILED/HOLD, 프론트 6건 실패, 이전 보안 감사 전체 Critical2/High10·봇 Critical1/High5, main/PR runtime-check SKIPPED, Migration266/280, 정확 SHA 공식 Test·복원 미검증; 빌드 성공만으로 병합 금지.
- **P0 WAL1254-04:** 계정 병합 전 메모/묘비/영수증 사전검사 및 과거 원장 비이전 계약, 저장 대 병합 100건 동시성.
- **P1 WAL1254-05:** 본문 NULL 묘비 CHECK·본문 없는 원본 영수증·HMAC 지문/키 교체·개인정보 승인 보존.
- **P1 WAL1254-06:** 회원→전표→메모→영수증 잠금, CAS·동일 키 재생·제한 재시도·500개 한도 경쟁.
- **P1 WAL1254-07:** 불변 created_at 키셋·본인/세션/asOf 서명 커서·비정확 스냅샷 설명·10,001건 회귀.
- **P1 WAL1254-08:** NestJS/Next.js/Android 본문 계약·응답 불명·삭제 상태·계정 전환/병합/탈퇴 차단·접근성.
- **P1 WAL1254-09:** no-store/noindex·승인된 개인정보/백업 삭제·비식별 관리자·HMAC 비밀 관리·악용방지/KPI.
- **P1 WAL1254-10:** 격리 PG 최소권한 부정·병합/저장/삭제/커서 동시성 회귀·정확 SHA 전체 CI·OFF 롤백·승인 GitOps 연계.
- **외부 독립 근거 10,000건 게이트:** URL·출처·날짜·라이선스·중복 제거·실제 분류가 완료된 기록만 집계. PostgreSQL 잠금/OWASP 인가 공식 문서는 참고 발행기관일 뿐 승인 기록 수로 계산하지 않는다. 이번 신규 승인 **0건**, 누적 검증 **미확인/10,000**, **BLOCKED / IN PROGRESS**. 별도 분산 기획 문서 생성 없음.


## v2026.10.25.1252 — F675-120 회원 전용 WLD 거래 메모·개인 분류 (기능 추가 / 기획 초안 / 운영 보류)

### 회차·기준 문서·중복 방지
- **Previous:** Feature Improvement v1250(F675-119 대시보드 바로가기, 미병합 Draft #1224). **Current:** Feature Addition v1252. **Next:** Feature Improvement v1254(잠정). 시작·중간 main `c9a868b1e622341e2daa8b936ddf0988eda9988e`. 최신 main의 `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`(영문 정본), `PROJECT_PLAN.ko.md`(국문 대조) 우선. QA v1255 **FAILED/HOLD**. 문서 전용 독립 브랜치이며 실제 개발·배포가 아니다.
- **코드 근거:** `frontend/src/app/wallet/activity/page.tsx`는 `GET /api/v1/wallet?recent=50`을 호출해 최근 거래 최대 50건만 표시한다. `wallet/export-ledger-csv.tsx`는 전달받은 최근 데이터만 CSV로 내보내며 전체 원장 추출 기능이 아니다. 검사한 main의 `wallet.controller.ts`에는 거래별 개인 메모 API가 없다. `wallet.repository.ts`는 `ledger_transactions`→`ledger_postings`→`accounts.owner_user_id`를 사용한다. 초기 원장 스키마에는 별도 거래 status 열이 없으므로 거래 행과 본인 전표의 원자적 존재가 확정 근거다. `app-gateway.ts`는 wallet 경로를 허용하지만 Android 메서드·본문·헤더는 별도 검증이 필요하다. 모든 열린 PR에 유사 기능이 없다고 단정하지 않는다.
- **범위 분리:** 회원 개인 메모는 원장 수정, 이의제기 심사, 환급, 잔액 재계산, 자동 분류, 공식 거래 증명, 전체 이력 CSV가 아니다. 기존 거래 이의제기 Draft #1048, 지갑 읽기·CSV 작업과 연계하되 Gemini/개발 A/B/C/QA 브랜치는 변경하지 않는다.

### 목적·회원 흐름·상태
- **목적/대상:** 상점·작업·송금·은행 이용이 많은 회원이 실제 원장 거래에 사적인 설명과 개인 카테고리를 저장한다. 기본 기능 OFF, 서버 확정 전에는 저장 성공으로 표시하지 않는다. 주체는 활성 상태·동의 완료 본인 회원이며 관리자는 비식별 집계만 확인한다.
- **진입:** 기존 `/wallet/activity` 최근 50건의 각 행에 **개인 메모** CTA를 추가하고 `/wallet/annotations`에서 저장된 메모를 키셋 페이지로 조회한다. 50건보다 오래된 거래도 서버에서 소유권 확인은 가능하지만, 현재 전체 과거 거래 탐색 UI가 존재한다고 주장하지 않는다. 별도 승인된 과거 이력 조회 UI와 연계하기 전까지 최근 50건을 작성 진입점으로 삼는다.
- **편집:** 개인 분류 `PERSONAL|WORK|SHOP|TRANSFER|BANK|OTHER`는 거래 원장의 type을 변경하지 않는다. 메모는 NFC 정규화한 유니코드 1~240 코드포인트, HTML 해석 금지. **저장/취소/메모 삭제/재시도/원본 영수증 확인** 버튼. 원장 WLD 금액·현금/은행 증감·거래 유형·시간·ID는 그대로 유지한다. 개인 메모를 은행이나 원장이 인증한 사실처럼 표시하지 않는다.
- **상태:** NO_NOTE(가상 버전 0), EDITING, SAVING, SAVED_CONFIRMED, REMOVED_CONFIRMED(영속 묘비), STALE_VERSION(412), KEY_REUSE_CONFLICT(409), UNKNOWN_COMMIT(영수증 조회 후 현재 상태 GET), NOT_OWNED_OR_NOT_FOUND(동일 404), OFFLINE, UNAVAILABLE(503), SIGNED_OUT. 서버 응답 없이 낙관적 임시 저장을 확정으로 표시하지 않는다. 계정 전환·동의 철회·탈퇴·세션 교체 시 임시 내용과 캐시를 지우고 진행 중인 응답을 사용자 세대별로 차단한다.

### API·DB·원자성 명세(별도 개발 브랜치 필요)
- **본인 전용 NestJS:** `GET /api/v1/wallet/transactions/:transactionId/annotation`; 동일 경로 `PUT {category,note,expectedVersion,requestId}`, `DELETE {expectedVersion,requestId}`; `GET /api/v1/wallet/transaction-annotations?limit=20&cursor=...`(최대 50); `GET /api/v1/wallet/transaction-annotations/receipts/:requestId`. 세션·인증·동의·쓰기 CSRF 필수, actor는 서버 세션에서만 취득. UUID와 요청 본문 최대 2KiB, 표준 요청 지문 검증. 결과는 현재 버전·확정시각·상태·원본 불변 영수증·재실행 여부를 포함하며 상대방 개인정보를 제외한다. 잘못된 입력 400, 인증/동의/CSRF 401/403, 본인 거래 없음/타인 거래 404, 키 내용 불일치 409, 버전 충돌 412, 속도 제한 429, DB 불확실 503. 본인 API 전부 `Cache-Control: private, no-store`.
- **DB 제안:** `member_wallet_transaction_annotations(user_id uuid REFERENCES users(id),transaction_id uuid REFERENCES ledger_transactions(id),category text CHECK(...),note text,version bigint NOT NULL CHECK(version>=1),is_deleted boolean NOT NULL,created_at timestamptz,updated_at timestamptz,PRIMARY KEY(user_id,transaction_id))`; `member_wallet_annotation_receipts(user_id,request_id,transaction_id,operation,payload_sha256,committed_version,committed_at,original_result,PRIMARY KEY(user_id,request_id))`. 보존 기간은 법무/개인정보 승인 필요. `(user_id,updated_at DESC,transaction_id DESC)` 인덱스 및 길이 CHECK. 삭제 후 행을 없애 버전을 0으로 되돌리지 않고 영속 묘비를 유지하여 ABA를 방지한다. `account_soft_delete`는 사용자 상태만 변경하므로 FK CASCADE만으로 메모가 지워지지 않는다.
- **소유권·권한:** 고정 search_path, 완전한 스키마 수식, 본인/활성 사용자 확인이 있는 검토된 `SECURITY DEFINER` 함수만 사용한다. 앱 계정에는 함수 EXECUTE만 최소 부여하고 PUBLIC EXECUTE 및 새 테이블 직접 DML/SELECT를 차단한다. 조회·쓰기마다 `ledger_postings p JOIN accounts a ON a.id=p.account_id`에서 `p.transaction_id=:tx AND a.owner_user_id=:actor AND a.account_type IN ('USER_CASH','USER_BANK')`의 존재를 확인한다. `ledger_transactions.actor_user_id`만으로 소유권을 판단하지 않는다. 역사적 거래는 계좌가 현재 비활성이어도 실제 본인 전표가 있으면 소유권 근거가 된다. 상대방·시스템 계좌 정보는 반환하지 않는다.
- **원자성:** 활성 회원 행 잠금→소유 전표 검증→메모 행/영수증 순서로 잠근다. 회원별 요청 ID의 최초 결과와 지문을 먼저 확인해 완전히 동일한 재시도는 CAS 전에 최초 영수증을 반환하고 다른 내용이면 409를 반환한다. 첫 저장은 expectedVersion=0, 저장·삭제마다 버전 증가, 오래된 버전은 412. 메모·묘비·영수증을 한 트랜잭션에서 확정한다. 원장·전표·계좌·잔액·outbox·WLD에는 쓰지 않는다. 영수증 30일 보존 제안은 승인 전 확정 정책이 아니며 만료 후 현재 GET으로 재조정한다. 목록 커서는 회원 서명 및 (updated_at,transaction_id) 스냅샷/워터마크에 결속하고 동시 수정으로 인한 중복·누락을 방지한다. 필요하면 수명이 제한된 서버 스냅샷 토큰을 사용한다.

### 관리자·보안·Android·접근성·SEO·분석·검증
- **보안/악용:** 타인 거래와 없는 거래를 구별 불가능한 404로 처리하고 존재 여부 추측을 제한한다. 회원당 분당 12회 쓰기, 활성 메모 500개, 본문 240 코드포인트. 제어문자·양방향 덮어쓰기 문자 제거, 텍스트 이스케이프, CSRF/CSP, 대량 열람 차단, 로그에 메모 본문 미기록. 관리자는 본문 편집·열람 권한 없음. 탈퇴 후 접근 차단과 물리 삭제/보존은 개인정보 정책 승인 필요.
- **Android/a11y/SEO:** `/app-api/v1/wallet/*` PUT/DELETE 본문·CSRF·요청 ID·세션 전달을 실제 계약으로 확인한다. If-Match/Idempotency-Key가 전달되지 않으면 본문 `expectedVersion`/`requestId` 사용. TalkBack·키보드·초점·44px 터치·320px·200% 확대·KO/EN·실시간 상태 알림. `/wallet/annotations`와 본인 API는 noindex/no-store. 메모 본문은 구조화 데이터·공개 사이트맵·검색 엔진에 노출 금지.
- **관리자/KPI:** 확정 저장/삭제·409/412/503·복구·지연시간·30일 유지율의 비식별 집계만, 코호트 최소 20명과 차분 공격 방어. 메모·회원 ID·거래 ID를 분석 이벤트에 기록하지 않는다. 목표: 타인 유출 0, 원장 무단 변경 0, 격리 Test 정상 시 저장 성공률 99.5% 이상, p95 조회 500ms/쓰기 800ms 이내(측정 완료가 아닌 제안).
- **수용 테스트:** 격리 실제 PostgreSQL에서 SECURITY DEFINER 소유/타인/시스템 전표, 앱 직접 DML 및 PUBLIC EXECUTE 거부, 탈퇴·세션 만료, ABA, 동일 요청 100건, 동일 키 다른 내용 100건, 저장-삭제 경합, 계정 전환, 응답 유실 영수증, 500개 한도, 10,001개 합성 다회원 데이터 키셋, 유니코드/CSV 악용, Android, 키보드/TalkBack, noindex/no-store, 원장·잔액 불변 검증. 이번 기획 회차에서 런타임 테스트는 수행하지 않았다.
- **배포/롤백:** 별도 개발 브랜치와 순방향 마이그레이션. Migration266 체크섬·280 네 PR(#1105/#1117/#1139/#1143) 충돌 해결 전 번호 할당 금지. 기본 OFF, 과거 데이터 자동 생성 없음. 정확한 후보 SHA 전체 CI/보안·격리 PG 권한·공식 Test 인증 지갑/금융/Android E2E·암호화 백업 복원·승인 GitOps 통과 후 1→5→25→100% 점진적 활성화. OFF는 새 편집을 막되 기존 버전·묘비·영수증을 유지하고 불확실 요청의 본인 확인 조회를 허용한다. 기획 예약은 Test/Production 및 DB를 변경하지 않는다.

### P0/P1 개발 백로그·외부 근거 게이트
- **P0 ENV1252-01:** 루트 디스크 100%(이번 회차 여유 약 19MiB), 운영/개발/Test DB 분리, 5433 외부 바인딩, 다른 작업자 자료 보존, 격리 복원.
- **P0 SEC1252-02:** 개발 DB 앱 UPDATE/DELETE 235/241 테이블, PUBLIC 은행 함수 3개 권한을 승인된 순방향 변경·부정 테스트로 해결; 운영 DB 권한이라고 단정하지 않음.
- **P0 REL1252-03:** QA v1255 FAILED/HOLD, 의존성 Critical 2/High 10, 봇 Critical 1/High 5, 프론트 6건 실패, CI runtime-check SKIPPED, Migration266/280, 정확 SHA Test/복원 미검증.
- **P0 WAL1252-04:** 본인 원장 전표 소유권·최근 50건 화면/CSV 한계·개인정보 정책·기존 이의제기 PR 범위 확인.
- **P1 WAL1252-05:** DB 제약/인덱스, 본인 전용 SECURITY DEFINER, 버전 묘비·지문 영수증.
- **P1 WAL1252-06:** 잠금·CAS·멱등 재실행·응답 유실 복구·서명 스냅샷 커서.
- **P1 WAL1252-07:** NestJS API, Next 최근 거래 메모 CTA/편집기 및 저장 목록.
- **P1 WAL1252-08:** Android 게이트웨이, 계정 세대 분리, TalkBack·320px·200% 접근성.
- **P1 WAL1252-09:** 개인정보 삭제·보존, 비식별 관리자, noindex/no-store, 악용 방지/KPI.
- **P1 WAL1252-10:** 격리 PG 동시성 100건, 타인 접근 100건, 다회원 합성 10,001건, 전체 회귀·OFF 롤백·정확 SHA 게이트.
- **외부 독립 근거:** URL/출처/라이선스/시각·중복 제거·실제 분류가 확인된 **10,000건** 목표. 신규 최종 승인 **0건**, 누적 승인 **미확인**. 공식 발행기관 3곳을 독립 근거 10,000건으로 집계하지 않음. **BLOCKED / IN PROGRESS**. 문서 전용 회차로 런타임·DB·원장·WLD·Test·운영 미변경.



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
