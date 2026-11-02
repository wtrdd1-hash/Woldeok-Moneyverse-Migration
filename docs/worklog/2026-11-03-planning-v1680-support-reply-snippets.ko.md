# 기획 v1680 — F675-226 관리자 개인 문의 답변 문구

## v2026.11.03.1680 — F675-226 관리자 개인용 문의 답변 문구 저장 기능 (기능 추가 / 초안 / 운영 보류)

**주기·정본:** 이전 기능 보완 v1678 → 현재 기능 추가 v1680 → 다음 기능 보완 v1682(잠정). 원격 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` 시작 확인, AGENTS.md·README.md·영문 PROJECT_PLAN.md 정본 및 한국어 대조. 미병합 초안 #2566 위에 누적하며 개발 이슈 #2570. **F675-226 미구현**. 기획 문서만 변경하며 런타임/DB/WLD/원장/Test/Production은 변경하지 않는다.

### 기존 구현 근거, 목적과 범위
- **실제 기존 기능:** `frontend/src/app/admin/support/admin-support-view.tsx` 59–74행에 `CANNED_RESPONSES` 3개가 하드코딩되어 있고 약 596행에서 **전송 전** 답변 입력창에 텍스트만 삽입한다. `backend/src/support/support.controller.ts`는 관리자 목록·메시지·답변·상태 API를 제공하며 마이그레이션 `196-user-admin-support-chat.sql`에는 관리자 개인 답변 문구 저장 테이블이 없다. 기존 빠른 답변 자체가 없다고 주장하지 않는다.
- **목적·대상:** 관리자마다 자주 쓰는 문구를 최대 **20개** 직접 저장·편집·삭제해 응답 작성 부담을 줄인다. 기존 기본 문구 3개는 유지한다. AI 자동생성, 전체 관리자 공유, 변수 치환, 자동 전송, 문의 상태 변경, 회원 알림, 첨부파일, WLD·주식·금융 원장 변경은 범위 밖이다. 기능 스위치 `admin_support_personal_snippets` 기본 **OFF**.

### 권한, 진입점, 화면·CTA·상태
- 현재 관리자 역할, 유효 세션, 동의, 최근 관리자 재인증 필요. Nest `SessionGuard`·`AuthenticatedGuard`·`ConsentGuard`·`AdminGuard`·`AdminSessionGuard`, 변경 요청 CSRF. 서버는 세션에서 행위자 UUID를 추출하며 클라이언트 전달 UUID를 신뢰하지 않는다. DB는 현재 관리자 역할·본인 소유를 독립 검증하고 권한 회수 동시성 잠금을 명세한다. 다른 관리자의 문구는 최고관리자라도 개인용 API로 읽을 수 없다.
- `/admin/support` 답변 작성창 → **저장한 답변** → **내 답변 관리**. 목록에 제목·수정일·삽입·수정·삭제, 생성 폼에 제목 1~60 유니코드 코드포인트와 본문 1~2,000 코드포인트(공백 제거·NFC 정규화). 제목은 관리자별 대소문자 무시 중복 불가, 활성 최대 20개. 본문은 줄바꿈·탭을 제외한 제어문자 거부. HTML/스크립트 실행 금지, `{{name}}`·계좌정보·토큰 변수 치환 없음. 회원 문의 답변 초안을 자동 저장하지 않는다.
- **삽입**은 커서 위치에 평문을 넣거나 구분자를 포함해 덧붙일 뿐 `adminSupportReply` 호출·상태 변경·자동 전송을 하지 않는다. 작성 중인 텍스트 덮어쓰기는 명시적 선택이 있어야 한다. 기존 전송 버튼을 별도로 눌러야 실제 전송된다. 생성·수정·삭제 확인, 로딩·성공·중복/상한 409·오래된 리비전 412·사전조건 누락 428·권한 401/403·서버 503·오프라인 재시도 상태를 표시한다. 412에서는 최신 데이터를 다시 조회하고 무단 덮어쓰기 금지. 기본 3개는 읽기 전용, 개인 저장 문구만 수정 가능; 기능 OFF에서는 기본 3개가 계속 동작한다.
- 320px 모바일, WCAG 2.2 AA, 키보드/스크린리더, 대화창 닫힘 후 포커스 복귀, 오류 실시간 알림, 44px 터치 대상, 움직임 감소, 현지화 시간·문구 지원. Android/일반 회원/비로그인/계정 전환 경로에서는 관리자 개인 문구를 노출하지 않는다.

### 제안 API 및 오류·캐시 정책 (미구현)
- `GET /api/v1/admin/support/snippets` → 200 `{scope:'CURRENT_OPERATOR',items:[{id,title,body,revision,updatedAt}],limit:20}`, `updated_at DESC,id DESC` 정렬. 기본 문구 3개는 프론트 상수이며 DB 목록에 중복 저장하지 않는다. 성공한 인증 조회만 빈 목록을 확정한다.
- `POST /api/v1/admin/support/snippets` → 201 `{id,title,body,revision:1,updatedAt,replayed:false}`, 본문 `{title,body}`, UUID `Idempotency-Key` 및 CSRF 필수. `PATCH /api/v1/admin/support/snippets/:id` → 200, `{title,body}`·UUID 키·강한 `If-Match:"<revision>"` 필수. `DELETE /api/v1/admin/support/snippets/:id` → 200 `{id,deleted:true,revision,replayed:false}`와 동일 헤더. owner/revision 입력 필드 및 미정의 필드는 거부. 삭제는 승인된 보존기간·개인정보 삭제 정책에 맞춰 처리한다.
- 401 세션 없음, 403 관리자 권한·재인증 없음, 404 부재/타인 소유 동일 응답, 409 제목 중복·20개 초과·동일 키 다른 요청, 412 오래된 리비전, 428 사전조건 누락, 400 형식 오류, 503 DB 장애. 권한 오류는 fail-closed. **성공·오류 모두** `Cache-Control: private,no-store`, `X-Robots-Tag: noindex,nofollow`, `Referrer-Policy: no-referrer`; 공개 SEO·사이트맵·공유 카드·로그 본문 금지. Next BFF는 CSRF/If-Match/Idempotency-Key 전달과 비공개 캐시를 유지하며 내부 토큰 유출 금지.
- 멱등 영수증은 세션 행위자·HTTP 메서드·대상 ID/생성·API 버전·정규화 제목/본문·기대 리비전을 키 기반 HMAC으로 묶는다. 동일 키·동일 요청 재실행은 과거 결과 `replayed:true`를 반환하되 **현재 상태 ETag는 발급하지 않는다**. 다른 내용이면 409, 재실행 시 감사·쿼터 추가 금지. HMAC 키 식별자·교체·보존·만료 묘비 정책은 보안 승인 필요; 적법 삭제 후 영구 재실행 방지를 보장하지 않는다.

### PostgreSQL·트랜잭션·보안·삭제
- 새 고유 번호의 **전진 전용 마이그레이션**으로 `support_admin_reply_snippets` 테이블: UUID PK, `owner_id` users FK, `title/body` 텍스트, `revision bigint>=1`, 생성·수정 시각, 선택적 `deleted_at`. DB에도 길이·정규화 검사, `(owner_id,lower(title)) WHERE deleted_at IS NULL` 부분 유니크 인덱스(유니코드 casefold 한계 명시), `(owner_id,updated_at DESC,id DESC)` 활성 조회 인덱스. 영수증은 `UNIQUE(owner_id,idempotency_key)`, 요청 지문·원래 결과·키 ID·만료·묘비 기록. 감사에는 행위자·문구 ID·동작·리비전·시각만 기록하며 제목/본문 원문 금지.
- 기존 196번 및 체크섬 수정 금지. PUBLIC·`moneyverse_app`의 직접 테이블 권한 전부 회수, `SET search_path=pg_catalog,pg_temp`·스키마 명시·PUBLIC EXECUTE 회수·앱 EXECUTE 최소 허용의 `SECURITY DEFINER`만 사용. SQL 관리자 UUID 검사는 HTTP 세션 결합을 대체하지 않는다. 관리자별 잠금으로 최대 20개 생성 경쟁 직렬화, 행 잠금+리비전 비교로 수정·삭제 CAS, 영수증·감사·실제 변경을 하나의 트랜잭션에 커밋한다. 관리자 권한 회수/회원 탈퇴/보존 의무 충돌은 잠금 순서와 삭제·익명화 정책을 검증한다. 앱 직접 테이블 GRANT 금지.
- 관리자는 본인 문구만 열람하며 원문·개인정보를 분석/감사/로그에 전송하지 않는다. 보존기간·탈퇴·백업 잔존기간은 개인정보 정책 승인 필요. 관리자 통계는 내용 없는 이벤트 및 20명 이상 집단에서만 집계한다.

### 수용시험·분석·배포·롤백 (제안만, 미실행)
- 합성 시험: 19/20개 경계에서 동시 생성 100건(20개 초과 금지), 삭제 후 과거 키 재실행 100건, 동일 키 다른 본문 100건 409, 오래된 If-Match 100건 412, 타 관리자 ID 열거·권한 회수 경합 100건, XSS/유니코드/제어문자 100건, 비공개 캐시·프록시 오류 100건, 320px/스크린리더/키보드/다국어 50건, Android 계정 변경/회원 거부, 기능 OFF 기본 3개 회귀. 실제 PostgreSQL 17 앱 계정 직접 권한 거부 및 보안 함수 성공 시험, 문구 관리가 `support_messages`를 쓰지 않는 증거, WLD·원장 변경 0 검증. **이번 회차 실행하지 않음**.
- KPI: `snippet_created`, `snippet_inserted_into_draft`, `snippet_deleted`, 실제 별도 전송이 증명된 경우에만 `reply_sent_after_insert`. 본문·회원 정보 수집 금지, 20명 미만 집단 비공개. 문구 삽입은 전송이 아니며 응답시간 개선을 입증했다고 주장하지 않는다.
- 개발 A/B/C 별도 브랜치 구현, 실제 이미지/실행 SHA가 일치하는 공식 Test, 독립 DB·로그인·웹/Android E2E, 보안·접근성·성능, 외부 복원, GitOps 무중단 운영승격과 롤백. 기본 OFF → 추가형 DB 마이그레이션 → 승인된 관리자 카나리 → 모든 P0 해소 및 명시적 승인 뒤 ON. 문제 발생 시 데이터 삭제 없이 OFF 복구. 기획 예약은 코드 배포·PR 병합·예약 변경을 하지 않는다.

### P0/P1 백로그 및 최신 QA
- **P0 4건:** OPS1680-01 miniPC 루트 **99%/1.1GiB 잔여**(04:06 KST), 작업자 파일 보호·안전 용량 확보·외부 복원(#1170); SEC1680-02 앱 권한 264개 중 SELECT 218/INSERT 195/UPDATE 195/DELETE 194/TRUNCATE 213/TRIGGER 214, search_path 취약 함수 19개, 체크섬 불일치 5건(#993); FIN1680-03 국고/Mint/NPS/SWF 자금 출처·원장 불변성 독립 검증; REL1680-04 운영 다국어 **17/28 HTTP500**, 내부 프록시 EPROTO, main test-gate 실패, Test/Production SHA 불일치, 마이그레이션 불일치, 공식 Test 인증·Android·복원·GitOps 차단(#1088). **QA v1479(03:12~03:18 KST) FAILED / P0_PRODUCTION_HOLD.** 디스크만 이번 회차 재확인했으며 나머지 QA 관측을 이번 회차 운영 DB 재검증으로 주장하지 않는다.
- **P1 6건:** SNIP1680-05 DB·영수증·권한, SNIP1680-06 Nest/Next CRUD·재실행·ETag, SNIP1680-07 접근성·기본 문구 호환, SNIP1680-08 Android/회원 차단·비공개 HTTP, SNIP1680-09 개인정보·분석·스위치, SNIP1680-10 PG17 동시성·보안·Test·롤백. 이슈 #2570으로 인계, 총 P0 4/P1 6. 구현·수용 완료 아님.
- **외부 독립 근거 게이트:** 신규 획득·검증·중복 제거·분류 승인 **0건**, 누적 승인 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 합성 시험·검증 없는 과거 링크를 실적으로 계산하지 않는다. Production RELEASE HOLD와 기존 예약 활성 유지.
