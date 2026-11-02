# 자동 기획 v1664 — F675-222 관리자 문의 분류·검증된 처리 대기열 (기능 추가 / 초안 / 운영 보류)

**주기:** 이전 Feature Improvement v1662 → 현재 Feature Addition v1664 → 다음 Feature Improvement v1666(잠정). **정본:** main 3eb1441090cb0602e054908547dcf43bfe4299dd 시작·중간 확인; AGENTS.md, README.md, 영문 PROJECT_PLAN.md 정본 및 국문 대조. 이전 초안 #2516은 미병합이며 최신 main에 구현된 기능으로 취급하지 않음. 개발 인계 이슈 #2522. **F675-222 미구현.** 이번 작업은 문서 전용이며 런타임/DB/WLD/보유품/원장/Test/Production/병합/배포 변경 없음.

## 실제 근거·목적·선택

- 마이그레이션 196의 support_threads에는 제목·상태·생성키만 있고 분류·분류 리비전이 없음. support_create_thread(actor,key,subject,body), Nest POST /support/threads, Next /support 작성 화면에도 분류가 없으며 관리자 목록은 상태만 필터링. 개발 PostgreSQL 17.11 읽기 전용 결과: 문의 3건, 메시지 6건, 분류 열 0개, moneyverse_app의 account_balances 직접 UPDATE 허용(P0 #993). 이는 **코드로 확인한 기능 공백**이며 실제 운영 사고나 SLA 위반 확인이 아님.
- 목적: 회원이 새 문의의 주제를 지정하고 권한 있는 관리자가 검증된 분류 대기열에서 처리. 대상: 인증·동의 완료 회원과 관리자. 성공 기준: 최초 메시지와 분류의 원자적 저장, 동일 요청 중복 방지, 정확한 관리자 재분류, 타인 문의 노출 0, 기존 데이터와 동시성 처리.
- 자유입력 분류(개인정보·스팸 위험), 회원 지정 긴급도·처리시간 보장(남용·근거 없는 약속)을 배제하고 고정 분류 5개 채택: account_access(계정 접근), balance_discrepancy(가상 잔액 내역), item_shop(아이템·상점), technical(기술 문제), other(기타). 분류는 **상담용 표시값**일 뿐 원장 거래·보상·우선권·유료 신속처리 근거가 아님. 첨부·공개 페이지·자동 환불 제외. 기능 플래그 support_case_category_triage 기본 OFF.

## 회원·관리자 화면 및 권한

1. 회원 /support 새 문의에 분류 선택(한국어/영어 설명), 제목 1~120자, 본문 1~2000자, “문의 등록” CTA. 성공 영수증에 정확한 threadId, categoryCode, categorySource=member_selected, categoryRevision, status=open 표시. 중복 클릭 UI 차단 외에 서버 멱등성 필수. 정확한 문의 열기는 F675-219가 구현·검증된 후만 연결; 현재 다른 첫 문의로 대체하는 /support?thread= 동작 금지. 기능 OFF에서는 기존 API·화면 유지. 기존 문의는 other로 이관하되 “기존 문의 분류 미지정(legacy_default)”으로 표시하고 회원 선택으로 허위 표시하지 않음.
2. 관리자 /admin/support에서 분류+상태 필터, 최근순 50+1 페이지, “분류 변경” CTA, 현재 분류·출처·리비전·최근 활동 표시. 로딩/검증된 빈 결과/400 입력 오류/401·403 권한/404 미존재·접근불가/409 리비전 충돌/410 커서 만료/429 제한/503 검증불가 상태를 구분. 긴급도·SLA를 암시하지 않음. 감사 기록은 변경 전후 분류·관리자·문의·사유코드·리비전만 기록하고 본문 복사 금지.
3. 회원 API에는 SessionGuard, AuthenticatedGuard, ConsentGuard, 관리자 변경에는 AdminGuard, AdminSessionGuard, CSRF를 적용. 서버 세션에서 actor 도출, PostgreSQL SECURITY DEFINER 내부에서 active 사용자 및 admin_current_roles 확인. actor UUID 인자 자체는 인증이 아님. 클라이언트의 memberId/adminId/권한/긴급도는 신뢰하지 않으며 타인 문의 존재 여부도 노출하지 않음. GET은 쓰기 없음.

## API 계약·실패 처리

4. 신규 회원 POST /api/v1/support/threads/categorized: {subject,body,categoryCode,idempotencyKey:uuid} → {thread:{threadId,status,categoryCode,categorySource,categoryRevision,createdAt},receiptVersion:1}. JSON 타입, 5개 enum, trim/NFC, UTF-8 바이트 상한, UUID 검증; 알 수 없는 필드·중복 파라미터 거부. 같은 키+같은 내용은 동일 영수증, 같은 키+다른 분류/제목/본문/행위자는 409. 동시 생성은 1건만. 기존 POST /support/threads는 별도 승격 전까지 유지.
5. 관리자 GET /api/v1/admin/support/triage?category=&status=&cursor=: {items:[{threadId,subject,status,categoryCode,categorySource,categoryRevision,lastMessageAt}],nextCursor,hasNext,queueRevision,scope:"RETAINED_CASES",countIsComplete:false}. 50+1 고정, PostgreSQL 최신순 (last_message_at DESC,uuid DESC), OFFSET·무제한 COUNT 금지. 목록과 리비전은 동일 MVCC 스냅샷; 변경 시 부분 결과 없이 409. AES-256-GCM 불투명 커서(랜덤 96비트 nonce, 키 회전, 관리자 세션·필터 결속, 5분 유효), DB 마이크로초 경계 문자열. 위조 400, 만료 410, 형식이 잘못된 상위 HTTP200은 503이며 빈 목록으로 대체하지 않음.
6. 관리자 PUT /api/v1/admin/support/threads/:id/category: {categoryCode,expectedCategoryRevision:decimal-string,idempotencyKey:uuid,reasonCode:taxonomy_error|member_clarification|routing_fix} → {threadId,categoryCode,categoryRevision,categorySource:"admin_reclassified"}. 최근 관리자 세션+CSRF, 행 잠금 CAS. 동일 키·동일 본문 재실행은 기존 영수증, 다른 내용은 409. 관리자 동시 변경은 한 요청만 성공, 나머지는 409 재조회. 같은 분류로의 no-op은 리비전·감사 이벤트 증가 금지.

## PostgreSQL·보안·트랜잭션

7. 현재 최종 마이그레이션 이후 **신규 순번 전방 마이그레이션**만 작성, 적용된 196 수정 금지. support_threads.category_code TEXT NOT NULL DEFAULT 'other' + CHECK 5개, category_source TEXT NOT NULL DEFAULT 'legacy_default' + CHECK(legacy_default/member_selected/admin_reclassified), category_revision BIGINT NOT NULL DEFAULT 0 + CHECK >=0. 기존 행은 other/legacy_default로 보존. 신규 support_create_thread_categorized(p_actor,p_key,p_subject,p_body,p_category)는 문의+최초 메시지를 한 트랜잭션으로 생성하고 create_key 재사용 시 분류·제목·본문·행위자까지 검증. 기존 함수 시그니처 유지.
8. 관리자 support_triage_list 및 support_reclassify_category SECURITY DEFINER 함수는 고정 search_path, moneyverse_migrator 소유, PUBLIC EXECUTE 회수, moneyverse_app에 필요한 EXECUTE만 허용. 지원 테이블 직접 SELECT/DML 권한 추가 금지. 재분류 UUID 멱등 영수증은 요청 내용 해시·불변 결과·행위자·문의 참조를 보존하고 개인정보 삭제·보존 외래키 정책을 검증. 행 잠금→리비전 검증→분류·출처·리비전 변경→기존 감사 이벤트→영수증을 한 트랜잭션으로 처리, 실패 시 전체 롤백. 본문·회원 개인정보는 영수증/감사에 저장 금지. (category_code,status,last_message_at DESC,id DESC) 인덱스는 EXPLAIN/ANALYZE 성능 확인 후 도입, 기존 상태 인덱스 유지.
9. 관리자 대기열 전역 리비전은 문의 생성·분류·상태·마지막 메시지·보존 삭제·탈퇴 삭제에 원자적으로 증가. 잠금 순서와 lock_timeout을 명시. 단일 SQL STABLE 스냅샷 또는 동일 연결 REPEATABLE READ READ ONLY 사용; VOLATILE 다중 쿼리 READ COMMITTED는 불가. 커서 경계는 PostgreSQL 마이크로초/UUID를 직접 사용하며 JS Date 밀리초로 만들지 않음. 트리거·초기화 경합 검증, 플래그 OFF 롤백 시 추가 컬럼·영수증 보존, 파괴적 다운그레이드 금지. 가상경제/원장/잔액과 트랜잭션 연결 금지.

## 개인정보·Android·접근성·KPI·검증

10. 회원 /support, 관리자 /admin/support, app-api 및 Android는 private,no-store / noindex,nofollow / no-referrer / nosniff, 사이트맵 제외, ETag/304 금지. 제목·본문·회원ID·커서 로그 및 분석 저장 금지. app-api는 상위 응답의 category/receipt/revision/scope 검증, 잘못된 HTTP200은 503. Android 로그아웃·계정 전환 시 커서와 진행 중 요청 폐기. KO/EN, 키보드·스크린리더, 320px, 200% 확대, WCAG 2.2 AA. 공개 SEO 변화 없음.
11. 관리자 KPI는 구간별 서로 다른 회원 20명 이상일 때만 집계: 분류별 생성량, 검증된 첫 답변까지의 중앙값, 재분류 비율, 409·429·503 비율, p95 대기열 지연. 소수 집계 숨김, 본문·제목·개인별 추출 금지, 측정하지 않은 SLA 준수율 생성 금지. **실측 아닌 테스트 목표:** 분류 저장 불일치 0, 타인 노출 0, 중복 생성 0, CAS 무단 덮어쓰기 0, 합성 1만 건 p95 <350ms, 치명적 a11y 오류 0.
12. **제안된 미실행 테스트:** 신규 PostgreSQL 설치와 196→신규 마이그레이션, 기존 3행 이관, 합성 10,001건+타인 데이터, 멱등 충돌 100건, 관리자 CAS 경합 100회, 커서 위조·만료·계정 변경 100건, 상태·삭제·탈퇴 동시성, 실제 앱 권한 거부, Android 잘못된 200, 전체 backend/frontend/모바일, 공식 Test 인증 exact-SHA E2E. 코드는 A/B/C 별도 브랜치에서 RED→GREEN, CI·DB·원장 증명·외부 암호화 복원, 승인 main, GitOps 무중단 승격·스모크·롤백. 문서 CI만으로 배포 금지.

## 최신 QA·우선순위·차단

- **최종 실행 신원 재확인(2026-11-02 20:11 KST):** 공개 Test /api/version은 abfbb8aee63393c9f58e72159bd5bcab06f99412로 변경되어 OPEN·비초안 금융 PR #2521(v1623)과 일치. Production은 6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e(v1622) 유지. QA v1469의 양쪽 v1622 결과는 19:36 시점 사실이며 이후 Test 후보에 그대로 적용하지 않음. 기획 작업은 어느 환경도 승격·변경하지 않았고 F675-222의 공식 Test 정확 SHA 검증은 미실행.
- **QA v1469, 2026-11-02 19:36 KST FAILED / P0_PRODUCTION_HOLD:** v1622 운영 다국어 표본 28건 중 16건 HTTP500(Test 0/28), 운영 모드 백엔드 2 FAIL, 정책 1 FAIL, 의존성 경고 9건, Production 앱 계정 UPDATE 195/DELETE 194(264개 테이블), 체크섬 불일치 5건, 공식 Test 마이그레이터 80개 불일치, 전체 경로 E2E 차단. Test/Production 공개 버전은 6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e(v1622)로 일치. main 3eb1441의 이후 문서 커밋과 다르다는 사실만으로 배포 실패라 단정하지 않음. 운영 loopback TLS EPROTO가 보고됐고 수정 초안 #2263은 미병합. 이전 QA의 단순 반복이 아니라 신규 확인된 결과.
- **P0 4건:** OPS1664-01 실제 실행 SHA·이미지·외부 복원; SEC1664-02 최소 권한·체크섬·Test DB 신원; FIN1664-03 원장 출처·재무 쓰기 0; REL1664-04 다국어 HTTP500·백엔드/정책/의존성·인증 exact-SHA Test·승격 승인.
- **P1 6건:** TRIAGE1664-05 B/DB 마이그레이션·인덱스; TRIAGE1664-06 B/API 멱등 생성·CAS·목록; TRIAGE1664-07 A/Web 회원·관리자 UX; TRIAGE1664-08 C/Android·app-api 증명; TRIAGE1664-09 관리자 익명 KPI; TRIAGE1664-10 QA·복원·경합·점진 활성화. 개발 이슈 #2522. Gemini/A/B/C/QA 변경과 분리, F675-217~221 초안은 구현된 main 기능으로 간주하지 않음.
- **외부 독립 근거 10,000건 게이트:** 이번 신규 획득·검증·중복제거·근거분류 승인 **0건**, 누적 승인 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**. 달성 주장 금지. **최종 상태: DOCUMENTATION ONLY / DRAFT / RELEASE HOLD.** 기능 수용시험·DB 변경·Test·Production·금융 데이터 변경 없음.

## 검증 및 GitHub 인계
- 격리 기획 브랜치 docs/planning-v1664-support-category-triage, PR #2523 OPEN/DRAFT, 이슈 #2522 OPEN. 첫 커밋 7f5183ecf7035233f0b854cfe01137a86e16b405. GitHub CI #41434537515 SUCCESS(분류·정책; 문서 전용 런타임 검사 SKIPPED).
- 로컬 직렬 정책·보안·백업 173/173 PASS, 릴리스 분류 24/24 PASS, 저장소 보안 스캔 PASS, 영문·국문 2쌍 x14 항목 PASS, git diff --check PASS. 최초 Node 기본 병렬 실행은 호스트 pthread_create 자원 부족으로 완료하지 못했으며 직렬 재실행은 성공. 기능 수용시험·공식 Test 정확 SHA·외부 독립 복원·운영 승격은 미실행.
- 시작·중간 origin/main은 3eb1441090cb0602e054908547dcf43bfe4299dd로 동일. 다른 개발자의 브랜치·미병합 PR·서비스는 변경하지 않았으며 RELEASE HOLD 유지.
