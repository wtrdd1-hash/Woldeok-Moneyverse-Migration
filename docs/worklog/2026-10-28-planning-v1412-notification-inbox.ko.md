# Planning worklog v1412 / F675-159

**최신 독립 QA 교차 확인(14:11 KST).** QA Draft PR #1692(v1413)은 별도 P0 블로그 발행 우회 및 검증형 발행 API 500을 보고했다. 공개 게시물 11건은 QA 보고 수치이며 이번 기획에서 독립 재현하지 않았다. 알림 기능 범위에 섞지 않고 QA 담당의 운영승격 차단 사유로 유지한다. 정기 QA v1341은 이번 회차에서 실제 확인한 최신 정기 증거 묶음이다.

## v1412 / F675-159 — 가상 금융 알림을 제거한 본인 검증형 알림함 (Feature Addition / DRAFT / RELEASE HOLD) — 이슈 #1693

**기준·회차.** Previous Feature Improvement v1410 → Current Feature Addition v1412 → Next Feature Improvement v1414(잠정). 2026-10-28 14:04~14:10 KST에 최신 main a28bed9aa40ff74d492824ae12892a7d52132fdd, AGENTS.md, README.md, 영문 정본 PROJECT_PLAN.md와 한국어 대조본, 열린 PR 및 QA v1341을 확인했다. 최신 main에서 분리된 문서 전용 Draft이며 A/B/C/QA 코드와 충돌시키지 않는다. 운영·금융 데이터 변경 없음.

**목적·대상·진입점·확인된 문제.** 로그인·동의한 회원의 /account/notifications는 서버에 실제 저장된 알림과 읽음 상태만 표시해야 한다. 현재 frontend/src/app/account/notifications/notification-tabs-bar.tsx는 INITIAL_NOTIFICATIONS 6건을 하드코딩하며 +1,840 WLD 이자 및 20 WLD 소각 정산 등 실제 원장 증빙이 없는 예시 문구를 포함한다. 클릭·모두 읽음은 React 로컬 상태만 바꿔 DB 반영 없이 성공처럼 보일 수 있다. 기존 목표·NPC 알림 수신 설정 폼은 실서버 기능이므로 보존한다. 이 사실은 코드에서 확인된 사용자 신뢰 문제이며 운영 사고 발생의 증거는 아니다. 개발 DB의 in_app_notifications는 현재 0건이므로 정직한 빈 상태가 필요하다.

**기존 기능 재사용·중복 방지.** NestJS에는 GET /api/v1/notifications, GET /unread-count, POST /:id/read, POST /read-all-receipt 및 409로 차단된 POST /claim-all이 이미 있다. Next.js app/api/notifications/route.ts도 인증된 GET/POST BFF와 no-store를 제공한다. 알림함·미읽음 집계·보상 수령을 중복 생성하지 않는다. 현재 BFF GET은 limit·unreadOnly만 전달하고 offset·category는 전달하지 않는다. DB 조회는 사용자 조건과 created_at DESC만 사용하여 동일 시각 순서가 결정적이지 않다. F675-152 보안 알림, F675-153 잔액 경보, F675-157 문의 답변은 독립 생산 기능으로 유지하고 실제 저장된 레코드만 표시한다. 알림을 금융 원장 정산 증거로 취급하지 않는다.

**화면·CTA·상태.** /account/notifications → 전체/사업/은행/시즌/공간/보안/시스템 탭 → 검증된 분류·제목·평문 본문·생성 시각·읽음 상태를 표시한다. CTA는 내부 링크 열기(허용된 상대 경로만), 읽음 처리, 모두 읽음, 이전 알림 더 보기, 재시도, 필터 초기화다. 기존 목표 알림 받기/중단 폼은 보존한다. 로딩·0건·오프라인·로그아웃·동의 미완료·잘못된 분류·만료 커서·429·세션 변경·DB 장애·쓰기 실패를 명시한다. 서버 영수증 확인 전 읽음 성공을 확정하지 않고 낙관적 UI 실패 시 원복한다. 미읽음 배지는 서버 집계만 사용한다. 목록 조회 자체로 읽음 처리하지 않는다. 모두 읽음은 변경 건수와 남은 미읽음을 구분하고 동시성 한계를 표시한다.

**API·권한.** 기존 호환성을 유지하면서 GET /api/v1/notifications?category=BUSINESS|BANK|SEASON|SPACE|SECURITY|SYSTEM&unreadOnly=true|false&limit=1..50&cursor=opaque를 추가 명세한다. 기존 offset 소비자는 전환 전까지 보존한다. 응답은 items[{id,category,title,body,link,isRead,readAt,createdAt}], nextCursor,hasMore,unreadCount,observedAt이며 실제 DTO의 표기법을 통일한다. 400 잘못된 분류, 401 인증 없음, 403 동의·권한 없음, 404 타인/없는 알림, 409 세션·필터 충돌, 410 커서 만료, 429 제한, 503 의존성 장애. GET은 CSRF 불필요, POST 읽음은 기존 CSRF·세션 가드를 유지한다. Next BFF는 허용된 필터·커서만 전달하고 모든 응답에 private/no-store를 적용한다. 503을 빈 목록 성공으로 바꾸지 않는다. Android App API도 인증·DTO·오류·캐시·내부 링크를 동일하게 맞추되 기존 어댑터를 조사한 뒤 연계한다. 사용자 UUID는 서버 세션에서만 확정한다.

**DB·제약·인덱스·트랜잭션.** 개발 DB 읽기 검사에서 public.in_app_notifications 테이블 0건, notification_unread_count(uuid)·notification_mark_read(uuid,uuid) 존재, moneyverse_app의 테이블 SELECT·UPDATE 권한이 확인되었다. 반면 최신 main의 packages/database 추적 SQL에서는 in_app_notifications DDL을 찾지 못했다. 스키마 출처와 마이그레이션·체크섬 일치 여부를 먼저 규명하며 개발 DB 전용 객체를 이식 가능한 기준으로 가정하지 않는다. 전진 전용 SECURITY DEFINER 본인 범위 조회/읽음 함수, 고정 search_path, PUBLIC EXECUTE 회수, 최소 EXECUTE 권한을 검토한다. 임의 p_actor 인자만으로 DB 본인 인증이 되지 않으므로 세션→DB 주체 결속을 위조시험으로 증명해야 한다. ID 유일성, 소유자 FK, 분류 CHECK, 중복 키의 범위 유일성(존재 시), read_at/is_read 일관성, 링크 제한, 보존 정책을 검증한다. 사용자·분류·미읽음 조건을 LIMIT+1 전에 적용하고 created_at DESC,id DESC의 결정적 Keyset 조회를 사용한다. HTTP 요청 간 영구 스냅샷을 주장하지 않는다. 10,001건 EXPLAIN (ANALYZE, BUFFERS) 확인 후에만 (user_id,category,is_read,created_at DESC,id DESC) 등 인덱스를 결정한다. 기존 markAllReadWithReceipt는 UPDATE와 COUNT가 별도 SQL이므로 단일 트랜잭션 영수증 함수 또는 '처리 후 관측값' 표시가 필요하다. WLD·원장은 변경하지 않으며 claim-all은 계속 차단한다.

**관리자·보안·악용 방지.** 제목·본문은 이스케이프하고 javascript:/data:/외부 URL 및 변조된 내부 경로를 거부한다. 본문·사용자 UUID·커서 값을 로그/분석/리퍼러/캐시에 남기지 않는다. 본인 조회·세션 결속·회원/IP 호출 제한·커서 TTL·POST CSRF·멱등성·계정 전환 시 이전 응답 차단을 요구한다. 권한 오류를 직접 테이블 GRANT로 해결하지 않는다. 관리자는 k<20 소규모 집계 억제를 적용한 발송·읽음·실패 합계만 확인하며 회원 메시지 본문 조회나 임의 읽음 처리는 허용하지 않는다. 금융 금액은 실제 원천 영수증이 없으면 확정 정보처럼 표시하지 않고 대기/정산을 구분한다.

**SEO·모바일·접근성·분석.** 회원 화면·BFF는 noindex,nofollow, private/no-store, Referrer-Policy no-referrer, 개인 데이터 사이트맵/구조화 데이터 금지다. KO/EN 동등 문구, 320/390/768px, 버튼/탭 시맨틱, 키보드·포커스, aria-selected, 오류 상태 음성 안내, 움직임 줄이기, 44px 터치 영역을 검증한다. KPI는 실측 조회 성공률, 서버 읽음 성공률, 오류율, 미읽음 정확도, p95 응답 시간이며 원문/ID는 분석하지 않는다. 실측 전 KPI 달성을 주장하지 않는다.

**수용·배포.** 격리 PostgreSQL 합성 10,001건, 동시 읽기·읽음·삽입 100건, 사용자/세션 위조 100건, 6개 분류, 동일 시각 정렬, 201번째 조회, XSS/악성 링크, 0건 상태, 로그아웃, claim-all 차단, 모두 읽음 경합, 401/403/429/503 no-store, Android·모바일 회귀를 요구한다. **이번 회차는 테스트 명세만 작성했으며 실행하지 않았다.** 기능 기본 OFF, 별도 브랜치 TDD, lint/typecheck/build/보안/DB 회귀, 공식 Test 정확 SHA와 인증 웹·Android E2E, 암호화 백업 독립 복원, Nginx→프로세스→systemd→manifest SHA 대조, 무중단 전환 및 승인된 롤백을 거쳐야 한다. QA v1341 후보 CI는 공식 Test·Production 승인 증거가 아니며 데이터 볼륨 사용률 89%, 운영 정확 SHA 미확인으로 RELEASE HOLD다. 신규 승인 외부 독립 근거 0건, 누적 중복 제거 승인 UNKNOWN/10,000건으로 BLOCKED / IN PROGRESS 유지.

**P0/P1 개발 백로그·담당.**
- P0 ENV1412-01 (Ops/QA): 릴리스 경로·정확 SHA·저장 공간·암호화 백업 독립 복원.
- P0 SEC1412-02 (B/QA): DB 스키마 출처·마이그레이션·앱 직접 SELECT/UPDATE·사용자 위조·PUBLIC 권한.
- P0 REL1412-03 (QA/Ops): 미병합 PR 보존·전체 게이트·공식 Test 정확 SHA·승인 운영승격.
- P0 NTF1412-04 (A/B/C): 허구 알림 6건과 가짜 읽음 성공 제거, 본인·링크·세션 차단.
- P1 NTF1412-05 (B): SECDEF 조회·분류별 결정적 커서·ACL·인덱스 검증.
- P1 NTF1412-06 (B): 원자적 또는 정확히 설명된 모두 읽음 영수증·경합·멱등성.
- P1 NTF1412-07 (A): NestJS·Next BFF·Android DTO/오류/캐시 정합성.
- P1 NTF1412-08 (C): 실시간 KO/EN 회원 UI·미읽음·모바일·접근성·계정 전환.
- P1 NTF1412-09 (C/QA): 개인정보·SEO·관리자 집계·안전 KPI.
- P1 NTF1412-10 (QA): 격리 PG 10,001/100/100·전체 회귀·복원·롤백 증거.

**백로그 ID:** ENV1412-01 SEC1412-02 REL1412-03 NTF1412-04 NTF1412-05 NTF1412-06 NTF1412-07 NTF1412-08 NTF1412-09 NTF1412-10.

## v1412 — 본인 검증형 실제 알림함 F675-159 (Feature Addition / DRAFT / RELEASE HOLD)
- Previous Improvement v1410 → Current Addition v1412 → Next Improvement v1414(잠정). 최신 main a28bed9aa40ff74d492824ae12892a7d52132fdd 시작·중간 확인, 이슈 #1693, QA v1341 후보 미완료. 최신 main 기반 독립 문서 브랜치.
- 현재 /account/notifications는 +1,840 WLD 이자·20 WLD 소각 등을 포함한 하드코딩 6건과 로컬 읽음 상태를 표시한다. NestJS 알림 API·Next BFF·개발 DB 객체는 있으나 개발 DB 실수량 0건, BFF 분류/offset 미전달, 동일 시각 정렬 미보장, 앱 계정 직접 SELECT/UPDATE, 추적 마이그레이션 DDL 출처 미확인.
- 실제 본인 알림 6분류·서버 미읽음·읽음 영수증·이전 알림·재시도·KO/EN·모바일/a11y·noindex/no-store·안전 링크·Android 동등성·SECDEF/최소권한을 명세했다. 가짜 금융 수치·WLD 보상은 금지. 영문 정본·한국어 통합 기획 참조.
- P0 ENV1412-01 SEC1412-02 REL1412-03 NTF1412-04; P1 NTF1412-05 NTF1412-06 NTF1412-07 NTF1412-08 NTF1412-09 NTF1412-10. 격리 PG 10,001/100/100은 명세만, 미실행. 외부 승인 신규 0, 누적 UNKNOWN/10,000 BLOCKED, 공식 Test 정확 SHA·독립 복원 미검증, 운영 HOLD.
- 백로그 ID: ENV1412-01 SEC1412-02 REL1412-03 NTF1412-04 NTF1412-05 NTF1412-06 NTF1412-07 NTF1412-08 NTF1412-09 NTF1412-10.

## 2026-10-28 14:10 KST — 자동 기획 v1412 / F675-159 (Feature Addition; DRAFT/HOLD)
- Previous Improvement v1410 → Current Addition v1412 → Next Improvement v1414(잠정). 최신 main a28bed9aa40ff74d492824ae12892a7d52132fdd 시작·중간 및 AGENTS/README/영문 정본·한국어 기획 확인, 이슈 #1693.
- 회원 알림 화면의 허구 WLD 수치 포함 6건·로컬 읽음 확인, 기존 API/BFF, 개발 DB 0건·앱 직접 SELECT/UPDATE·추적 DDL 출처 미확인. 실제 본인 알림·분류·페이지·원자적 영수증·보안·Android·모바일·SEO·KPI·롤백을 영문·국문 통합 기획에 명세.
- P0 ENV1412-01 SEC1412-02 REL1412-03 NTF1412-04; P1 NTF1412-05 NTF1412-06 NTF1412-07 NTF1412-08 NTF1412-09 NTF1412-10. QA v1341 후보 공식 Test 인증 아님, 운영 HOLD. 10,001/100/100 테스트 명세만·미실행. 외부 승인 신규 0, 누적 UNKNOWN/10,000 BLOCKED. 런타임·DB·WLD·원장·Test·운영 미변경.
