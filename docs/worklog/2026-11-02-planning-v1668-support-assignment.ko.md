# 기획 v1668 — F675-223 관리자 문의 담당자 배정·인계 (기능 추가 / 초안 / 운영 보류)

**주기:** 이전 Feature Improvement v1666 → 현재 Feature Addition v1668 → 다음 Feature Improvement v1670(잠정). **기준:** 시작 시 main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b` 확인(중간·완료 재확인 필요), AGENTS.md, README.md, 영문 PROJECT_PLAN.md 정본과 국문 동등 문서. **부모:** 미병합 초안 #2529(v1666, #2523 후속). **개발 인계:** #2536. 문서 전용 초안이며 구현 승인 아님. F675-223 및 기존 F675-217~222 초안은 main에 구현되지 않음.

## 목적·대상·실제 코드 근거

**목적:** 관리자 두 명이 같은 문의를 중복 처리할 위험을 줄이고 명시적 인계를 남기되 회원 답변을 막지 않음. **대상:** `/admin/support`의 인증된 관리자. 회원 `/support`에는 담당 관리자 신원, 답변 시간 보장, 금융 혜택을 노출하지 않음. **실측:** 마이그레이션 196의 `support_threads`에는 상태·제목·최근 메시지 시각은 있지만 담당자·배정 리비전이 없음. `admin_support_threads` 정렬은 open → waiting_user → resolved. Nest AdminSupportController에는 목록/메시지/답변/상태 변경만 있으며 배정 API가 없고 AdminSupportView에도 배정 CTA가 없음. 실제 PostgreSQL17.11 읽기 전용 확인: 문의 3건/메시지 6건, `assigned_admin_id` 및 `support_assignment_events` 없음, `moneyverse_app`의 account_balances UPDATE/TRUNCATE 권한 true. 이는 기능 공백과 권한 위험의 증거이며 **실제 운영 중복 처리 사고 증거는 아님**.

## 대안·채택 범위

**A 브라우저만의 '처리 중' 배지:** 관리자 간 동기화 불가로 기각. **B 독점 잠금·자동 만료 임대:** 연결이 끊긴 담당자 때문에 답변이 막힐 수 있어 기각. **C 채택 V1:** DB 트랜잭션/CAS 기반 문의당 담당자 1명, 명시적 인계·인수·감사. **배정은 협업 안내일 뿐 권한이나 독점 잠금이 아님**. 기존 관리자의 답변·상태 변경 권한을 변경하지 않으며 자동 배정·SLA·우선순위 상향·회원에게 직원 신원 표시·WLD/아이템/원장 쓰기를 하지 않음. F675-222 분류는 선택적 연계이며 배정의 필수 선행 기능이 아님.

## 권한·진입점·화면·CTA·상태

로그인·최신 동의·AdminGuard·최근 관리자 세션을 통과한 관리자는 `/admin/support`에서 전체/미배정/내 담당/다른 담당/오래됨 필터를 사용. 오래됨은 담당자 권한 상실 또는 24시간 변경 없음으로 표시하되 **24시간은 경고 기준이지 자동 만료가 아님**. 관리자만 담당자 표시명·배정 리비전·검증된 변경시각 확인. **담당하기(Claim)** 미배정, **담당 해제(Release)** 본인, **인계(Transfer)** 현재 담당→활성 관리자, **인수(Take over)** 다른 담당 건은 필수 사유(`handoff_unavailable|coverage|escalation`)·확인, **새로고침** 409, **다시 시도** 503, 제출 중 버튼 비활성화. 대상은 임의 UUID가 아니라 권한 검증된 활성 관리자 선택기. 로딩/확인된 빈 상태/401·403/권한 해지/충돌 409/429/503/출처 불명 구분. 마지막 답변자를 담당자로 추정하거나 자동 배정 금지. 기존 open→waiting_user→resolved 우선 정렬과 그룹 내 last_message_at DESC,id DESC 유지.

## 제안 API 계약(관리자 전용·비공개)

`GET /api/v1/admin/support/assignments?status=&assignment=all|unassigned|mine|others|stale&cursor=`는 최대 50+1건, `threadId,status,assignmentState,assigneeDisplay(관리자만),assignmentRevision(십진 문자열),assignedAt,assignmentUpdatedAt,nextCursor,sourceRevision` 반환. 목록에는 메시지 본문 미포함, 근거 없는 총계 금지. F675-222가 구현되면 상태 우선순위·원본 검증 커서를 재사용하고 아니면 별도 검증된 제한 조회 함수 구현. 커서는 관리자·세션·필터·상태순위·PostgreSQL 마이크로초 시각·UUID·리비전·5분 유효기간을 AES-256-GCM으로 결속, 키 회전. 원본 변경 409, 만료 410, 부분 성공 반환 금지. 기존 `/threads/:id/messages/:messageId` 라우트와 충돌 금지.

`POST /api/v1/admin/support/threads/:id/assignment` 미배정 건 담당, `PUT /api/v1/admin/support/threads/:id/assignment` 인계·사유 있는 인수, `DELETE /api/v1/admin/support/threads/:id/assignment` 본인 해제(타인 건은 명시적 감사 인수 절차만). 변경 요청마다 `expectedAssignmentRevision` 십진 문자열, UUID `idempotencyKey`, CSRF·최근 관리자 세션 필수. 응답은 `threadId,assignmentRevision,assigneeId(관리자만),eventId,outcome,changedAt`. 동일 키·동일 정규화 요청은 이후 리비전이 바뀌어도 최초 영수증 재생; 동일 키·다른 내용 409 `IDEMPOTENCY_CONFLICT`, 새 키·오래된 리비전 409 `ASSIGNMENT_CHANGED`, 없는 문의 404, 잘못된 요청 400, 미인증 401/403, 제한 429, 원본 오류 503. 근거 없는 빈 성공 응답 금지.

## DB 스키마·제약·인덱스·권한·트랜잭션

현재 고유 마이그레이션 끝 이후 **전진 전용** 추가(번호 선점 금지). `support_thread_assignments(thread_id uuid PRIMARY KEY REFERENCES support_threads(id), assignee_admin_id uuid NULL REFERENCES users(id), assignment_revision bigint NOT NULL DEFAULT 0 CHECK >=0, assigned_at timestamptz NULL, updated_at timestamptz NOT NULL)`로 문의당 현재 담당자 최대 1명 보장. NULL은 확인된 미배정, 미조회와 다름. 과거 문의는 배정 없음·리비전 0으로 초기화하며 담당자를 추정하지 않음. `support_assignment_events(event_id uuid PK,thread_id,actor_admin_id,previous_admin_id,next_admin_id,operation enum,reason enum nullable,revision bigint,created_at,UNIQUE(thread_id,revision))` 불변 이벤트와 `support_assignment_receipts(actor_admin_id,idempotency_key,operation_version,request_hmac,key_version,event_id,receipt_payload,created_at,retention_state,UNIQUE(actor_admin_id,idempotency_key))` 불변 영수증을 별도 저장. 회원 제목/본문은 영수증에 보관 금지. actor/문의/작업/대상/사유/예상 리비전 정규화값에 버전 있는 keyed HMAC 사용. 삭제·보존 정책은 별도 승인, 삭제 후 중복 생성 방지 최소 tombstone 유지.

트랜잭션 안에서 `admin_current_roles`로 요청자·대상 관리자 권한 확인, 문의 행→배정 행 순서로 잠금(기존 답변/상태/분류 변경과 잠금 순서 조정), **기존 영수증을 먼저 조회**하고 예상 리비전 CAS, 해제·인계·인수 정책 검증, 이벤트·영수증·리비전 +1·기존 `admin_append_audit_event`(ID·사유만, 본문 제외)를 원자적으로 기록. 동일 키 재실행은 최신 담당자가 달라져도 기존 결과만 반환. 신규 키의 동일 상태 요청은 검증된 현재 상태만 반환하고 가짜 인계 이벤트를 만들지 않음. 관리자 권한이 해지돼도 GET에서 데이터를 몰래 수정하지 않고 `STALE_ASSIGNEE`를 표시한 뒤 사유 있는 인수. SQLSTATE 교착·재시도와 동시 100건 검증. `(assignee_admin_id,updated_at DESC,thread_id)` 및 상태 우선 인덱스는 EXPLAIN 이후 결정. 전역 핫 카운터·무제한 OFFSET 금지. SECURITY DEFINER 고정 search_path, 함수 내부 권한 확인, PUBLIC 철회, 앱 계정은 함수 EXECUTE만 허용하며 **테이블 직접 DML 권한 금지**.

## 보안·개인정보·모바일·SEO·분석

Nest와 SQL에서 관리자 권한·최신 동의·세션·CSRF·actor 출처 검증, 속도 제한·열거 방지. 클라이언트 전달 actor/role 신뢰 금지. 다른 담당자의 배정 정보도 관리자 화면에서만 노출, 회원 `/support`·공개 API·사이트맵·검색에 직원 신원/감사 내역 노출 금지. Next BFF/app-api/Android는 상위 응답 스키마·세션 세대 검증, 잘못된 HTTP200은 503으로 실패, 계정 전환 시 이전 요청 취소, 비공개 디스크 캐시 금지. 실제 엣지의 성공/오류 모두 `Cache-Control: private,no-store`, `X-Robots-Tag: noindex,nofollow`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`. 본문·회원·직원·커서 등 로그/분석 제외. 관리자 UI 320/390px, 확대 200%, 44px 터치, 키보드·포커스·라이브 영역, WCAG2.2 AA. 공개 SEO 이익 주장 금지. 익명 관리자 KPI: 미배정 시간 p50/p95, 배정 후 첫 답변, 충돌/인수, 오래됨 비율, 조회 p95 <350ms **목표일 뿐 실측 아님**. 집계당 서로 다른 회원 20명 미만 및 역산 가능한 작은 셀 비공개, 개인 식별 분석 금지.

## 테스트·무중단 배포·롤백·선행 조건

기능 스위치 `support_admin_assignment` 기본 **OFF**. **제안만, 미실행:** 격리 PostgreSQL17.11 기존 323개 전체 마이그레이션 + 전진 추가, 합성 문의 10,001건, 관리자 2명 동시 담당 100건, 동일/다른 내용 멱등 재실행·삭제 후 재시도 100건, 권한 해지/대상 비활성·삭제/보존 100건, 답변/상태/분류/배정 동시 변경 100건, 커서 위변조/만료/계정 전환/Android 엣지 100건, 앱 계정 UPDATE/DELETE/TRUNCATE/ALTER 거부와 SECURITY DEFINER 실행, WLD·아이템·원장 변동 0, 관리자 전용 응답 헤더와 WCAG. A/B/C/QA 별도 브랜치·RED-GREEN-REFACTOR·정확 SHA CI 후 공식 Test 정확 SHA 인증 웹/관리자/Android·DB 검증, 독립 암호화 외부 복원, 승인된 GitOps 카나리·모니터링이 모두 통과해야 ON. 롤백은 OFF 및 이전 UI/API 복귀, 추가 스키마·감사 기록 보존. 적용된 마이그레이션 되돌리거나 영수증 삭제 금지.

## P0/P1 백로그·최신 QA·외부 근거

**P0 4건:** OPS1668-01 운영 실제 실행 SHA/이미지/엣지와 독립 복원·롤백; SEC1668-02 Production 앱 TRUNCATE **213/264**, UPDATE **195/264**, DELETE **194/264**, TRIGGER/MAINTAIN, migrator 기본 TABLE ALL, 체크섬 불일치 5건, Test 앱/마이그레이터 DB 불일치(#993); FIN1668-03 국고/MINT/SWF 원장 출처·금융 변동 0; REL1668-04 Production 다국어 HTTP500 **16/28**, 운영 모드 백엔드 **2 FAIL**, 의존성 감사 **9**, QA 정책/라우트 원장/CI, 공식 Test 정확 SHA E2E·독립 승인. **P1 6건:** ASSIGN1668-05 B/DB 제약·권한·영수증; ASSIGN1668-06 B/API CAS·관리자 경로; ASSIGN1668-07 A/Web 접근성; ASSIGN1668-08 C/Android 비공개 엣지; ASSIGN1668-09 관리자 KPI/감사; ASSIGN1668-10 QA 1만 건·동시성·권한·금융·롤백. 개발 인계 **#2536**, Gemini/A/B/C/QA 코드 변경과 분리.

**최신 QA v1472(2026-11-02 21:36 KST): FAILED/P0_PRODUCTION_HOLD.** 원본 `/srv/moneyverse-data/tasks/Moneyverse-QA-v2026.11.02.1472-end.md`; QA v1472의 21:36 기준 공개 Production v1622 `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`, Test v1623 `abfbb8aee63393c9f58e72159bd5bcab06f99412`. **22:20:58 KST 신규 재확인:** Production은 v1622 유지, Test는 일시적 HTTP 502 1회 후 HTTP 200으로 현재 main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b` 반환. 공개 버전만으로 실제 이미지 불변성·공식 Test 인증 E2E·운영 승격을 인증할 수 없음. QA 격리 PG17.11 323/323 마이그레이션 PASS이나 Production ACL 편차 잔존. 신규 외부 독립 획득·검증·중복 제거·분류 승인 **0건**, 누적 승인 **UNKNOWN/10,000건** → **BLOCKED/IN PROGRESS**. 기획 완료를 기능 구현·수용시험·근거 게이트·배포 승인으로 주장하지 않음. **초안 / 운영 RELEASE HOLD**.
