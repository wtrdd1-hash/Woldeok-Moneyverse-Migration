# 월덕 머니버스 — 통합 기획 마스터

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
