# 기획 v1568 — F675-198 회원 알림 일시중지

## v2026.10.31.1568 — F675-198 회원 만료 알림 일시중지·자동 재개 (기능 추가 / DRAFT / RELEASE HOLD)
- **GitHub:** Draft PR #2197 OPEN/HOLD, 개발 이슈 #2195, 초기 SHA 346b6b1ad658559995896a28c31dca1be7ba8aef; 최종 정확 SHA CI 대기, 병합·배포 없음.

**회차·기준:** 이전 기능 보완 v1566 → 현재 기능 추가 v1568 → 다음 기능 보완 v1570(잠정). 기준 GitHub main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`, AGENTS.md·README.md·영문 정본 PROJECT_PLAN.md·한국어 대조 확인. 미병합 Draft #2189(HEAD `12253ef39aaddbf866c4fcdaa7b7f742ccb26c0f`) 후속, 개발 이슈 #2195. F675-192~197과 신규 기능은 모두 미구현 기획이다. 배포 없음.

### 목적·대안·회원 흐름
- **목적:** 회원이 전체 만료 알림을 영구 OFF하거나 보유 아이템을 하나씩 제외하지 않고 잠시 쉬도록 한다. **보유 아이템 만료 관련 앱 내 알림만** 억제하며 인증·보안·거래·관리 알림은 절대 억제하지 않는다. 푸시/이메일·자동연장·장착·구매·WLD·원장 쓰기 없음.
- **대안:** 전체 OFF 후 수동 ON은 복귀를 잊을 수 있고, 개별 제외는 번거롭고 장기 지속되며, 별도 자동 재개 잡은 중복·경합 위험이 있다. **선택:** DB 만료시각을 이용한 읽기 시 자동 재개와 불변 설정 전이 기록. 별도 재개 스케줄러 없음. **UTC 경과 24·72·168시간**(현지 달력 날짜 아님), 최대 7일, 임의 무제한 기간·중첩 일시중지는 V1에서 제외.
- **대상·진입점:** 인증·동의 완료 회원 본인, /inventory/expiring/reminders → /inventory/expiring/reminders/pause. 현재 상태·KST 표시/UTC 보조·종료시각·남은 시간·억제 대상과 제외 대상·**놓친 판단기간은 소급 알림하지 않음** 안내. 24시간/72시간/7일 중지 → 검토 → 확인, 지금 재개 → 확인, 상태 새로고침·활동 이력 CTA. 중지 중 추가 중지 409 ALREADY_PAUSED, 활성 중지만 수동 재개(그 외 409 NOT_PAUSED). 전체 알림 OFF이면 새 중지 금지, 기존 중지 해제는 허용. OFF→ON 해도 남은 중지시간은 유지. 기존 알림함 기록은 취소·삭제하지 않는다.
- **화면 상태:** GLOBAL_OFF, ACTIVE_PAUSE(종료시각·DB 기준 남은 시간), RESUMED_BY_TIME(시간 경과 자동 재개, DB 자동 수정 없음), NOT_PAUSED, STALE_REVISION(409 재조회), VERIFYING_RESULT/UNKNOWN_COMMIT(응답 유실), SOURCE_UNAVAILABLE(503), VERIFIED_COMMITTED(과거 커밋 영수증). 정상 빈 보유 목록과 설정 상태 혼동 금지. 카운트다운은 표시 전용, DB가 최종 판정. 320px/200% 확대·WCAG 2.2 AA·키보드 초점/aria-live·동작 감소, Android 동등성·계정 전환 후 이전 응답 폐기.

### API·권한·상태 계약
- 본인 세션·최신 동의·CSRF 검증 POST `/api/v1/shop/expiry-reminders/pause/status`(읽기 전용), `/pause/set` 요청 `{durationHours:24|72|168,expectedRevision:int64,idempotencyKey:UUID}`, `/pause/resume` 요청 `{expectedRevision:int64,idempotencyKey:UUID}`, `/pause/receipt-status` 요청 `{idempotencyKey:UUID}`. 회원 ID는 서버 세션에서만 추출. Next 서버 경계·Android `/app-api/v1/shop/expiry-reminders/pause/...` 동일 적용. 토큰/키 URL·외부 알림 링크 금지.
- 상태 200 `{state,asOfUtc,pauseUntilUtc?,revision,globalOptIn,mode,canPause,canResume}`는 본인 primary DB 조회 성공 시만. 설정/재개 200 `{status:'VERIFIED_COMMITTED',receiptId,committedAtUtc,pauseUntilUtc,revision}`는 불변 본인 영수증이 있어야만. 커밋 미확정 202 UNKNOWN(미커밋 확정 금지). 400 형식/크기, 401 인증, 403 동의/CSRF, 409 리비전·상태·멱등키 충돌, 429 회원별 제한, 503 DB/권한/잠금 불확실. 조회 실패를 NOT_PAUSED·빈 상태로 표현 금지. 요청 본문 최대 2KiB, 새 쓰기 회원당 분당 5회, 상태·영수증 조회 별도 제한(분당 20회 제안, 측정 필요).
- Nest/Next/Android의 정상·오류 전체 응답 `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`, 필요 시 `Vary: Cookie`; 화면 메타 robots noindex·사이트맵 제외. 토큰·회원 ID·종료시각·영수증을 분석·URL·로그에 기록 금지. 세션/계정 변경 시 실패 폐쇄.

### DB·잠금·멱등성·시간 정합성
- 구현 전 격리 PostgreSQL 17에서 기존 알림 설정/영수증/알림함 DDL·권한 확인. 임의 마이그레이션 번호 지정 금지, 확인 후 순방향 확장: 본인 설정의 `pause_until_utc timestamptz NULL`, `revision bigint NOT NULL` 비음수 CHECK·DB 전이시각, 본인 전용 추가형 중지/재개 전이 및 영수증 기록 `UNIQUE(owner_id,idempotency_key)`, 요청 다이제스트·행동·커밋시각·정확한 중지 시작/종료·조기 재개 증거. 과거 전이 덮어쓰기 금지, 보존·키 재사용 안전성 증명. 본인 이력용 `(owner_id,committed_at_utc DESC)` 인덱스, pause_until 인덱스는 EXPLAIN/BUFFERS 증거 있을 때만. 앱 계정에 직접 테이블 조회 권한 없음.
- 고정 search_path·본인/동의 검증 SECURITY DEFINER 함수, moneyverse_app은 EXECUTE만, 설정·전이·영수증·금융 테이블 직접 SELECT/INSERT/UPDATE/DELETE 거부. 제한된 READ COMMITTED 트랜잭션에서 (회원,멱등키) 직렬화→불변 영수증 우선 확인(같은 요청은 중지 종료·세션 교체 후에도 기존 영수증 반환, 같은 키 다른 요청은 409)→회원 설정 행 잠금(개별/통합 워커와 공유)→새 중지는 전체 ON·예상 리비전 검증→잠금 후 단일 DB `clock_timestamp()` 채집→정확한 24/72/168시간 추가→리비전 증가+전이+영수증 원자 커밋. 활성 중지의 수동 재개는 잠금 후 DB 시각을 실제 종료시각으로 불변 기록. 과거 증거 삭제 금지. 잠금 시간초과는 503/UNKNOWN, 성공·실패 추측 금지. 정규화·도메인 구분 다이제스트는 회원/동작/기간/예상 리비전 포함, 난수·발급시각 제외. JS Date를 DB 쓰기 정밀도 기준으로 사용 금지.
- **경계:** DB 판단시각 `now < effective_pause_until`이면 중지, 같아지면 자동 해제. 중지 시작은 커밋된 설정 전이부터 유효하며 이미 커밋된 알림은 소급 취소 불가. 워커는 설정 잠금 후 단일 DB 시각으로 보유 세대·만료시각·7일/1일 반개구간·전체 ON·개별 제외·중지 상태를 검증하고 영수증+알림함을 한 트랜잭션에서 기록. 중지 중 끝난 판단기간은 소급 발송 금지. 재개 후 여전히 열린 기간이면 공통 고유 영수증 조건에서 1회 판단 가능.
- **09시 통합 알림:** F675-196 고정 09:00 KST 슬롯에 중지 구간 `[시작,유효종료)`가 걸리면 09:07 수동 재개해도 그날 통합 알림 금지. 09시 이후 중지 시작·워커 커밋 전이면 즉시 억제. 09:00 정확히 종료면 슬롯에서 중지 아님, 09:00+1µs 종료면 중지. 슬롯 후 재개는 소급 통합 알림을 만들지 않음. 수동 재개 후에도 슬롯 당시 중지 여부를 입증하려면 **불변 본인 설정 전이 기록**이 필수이며 단일 nullable pause_until만으로 부족하다. 모든 쓰기 경로에서 증명 못 하면 기능 OFF 유지.

### 관리자·KPI·수용시험·배포
- 관리자 화면은 20명 이상 집단의 중지 선택·확인된 중지/재개·시간 경과 자동 재개·억제된 판단 건수·UNKNOWN/409/503·p95 집계만 제공, 개인별 만료 정보 금지. 영수증 커밋과 알림함 기록/읽음 구분. 상태 p95<300ms는 **미측정 목표**. 플래그 `EXPIRY_REMINDER_TEMP_PAUSE_ENABLED` 기본 OFF.
- **P0 OPS1568-01** #1984/#2144/#2171 운영 실제 실행 SHA/프론트/백엔드/엣지·롤백·독립 복원 및 cgroup EAGAIN 개선(다른 작업 중단 금지).
- **P0 SEC1568-02** #993 클린 PG17 마이그레이션·권한·알림함 DDL·전이 기록, moneyverse_app 직접 권한 거부.
- **P0 FIN1568-03** #2153/#2191 Test Treasury·Production 금융 증거 재검증, WLD/원장/보유 아이템 쓰기 0 증명.
- **P0 REL1568-04** #1088 전체 QA·보안 감사·경로 장부·정확 SHA 공식 Test·독립 복원·운영자 승인 후 승격.
- **P1 PAUSE1568-05** 개발 B: 설정·전이·영수증 SQL, UNIQUE/CHECK/인덱스/EXPLAIN·고정 search_path 권한.
- **P1 PAUSE1568-06** 개발 B: 워커 공통 잠금 순서·UTC 경계·09시 슬롯 전이 증거·동시성·멱등 재개.
- **P1 PAUSE1568-07** 개발 B: Nest 본인 CSRF status/set/resume/receipt-status DTO·200/202/400/401/403/409/429/503·제한.
- **P1 PAUSE1568-08** 개발 A/C: Next/Android 중지·재개·카운트다운·UNKNOWN·320px 접근성·계정 전환 차단.
- **P1 PAUSE1568-09** 개발 A/C: 실제 app-api 엣지 비공개 헤더·noindex·관리자 20명 이상 익명 KPI.
- **P1 PAUSE1568-10** QA: 격리 PG17 보유 10,001/회원 2/워커 2, ±1µs·09시 경계·24/72/168시간·전체 OFF/ON·개별 제외·7일/1일·09:07 재개·응답 유실/재시도·동시 워커·리비전 충돌·타인 접근·Android 320px·플래그 OFF 롤백·금융 쓰기 0. **제안만, 미실행.**
- 단계적 승격: 스키마/권한 검증→정확 SHA 공식 Test→전체 QA/보안/금융/독립 복원→플래그 OFF에서 소규모 활성→UNKNOWN/중복/워커 지연 모니터링→운영자 명시 승인. 롤백은 플래그 OFF, 기존 영수증·이력 보존, 놓친 알림 소급 금지. 이번 기획에서 운영 마이그레이션·배포 없음.

**근거·게이트:** 2026-10-31 20:05 KST miniPC Debian 13.6 서비스 활성·DEV DB 연결, cgroup TasksCurrent 952/1027로 P0 자원 압박 미해결. main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`, v1566 미병합. 실제 /inventory는 `apiOrNull` 실패를 []로 대체, shop holdings GET 존재, Android app-api 개인정보 허용목록에 shop/purchases는 있으나 shop/holdings/expiry-reminders 전체 보호는 미검증; F675-198 미구현. 과거 QA v1417 프론트 2,776 PASS이나 전체 TIMEOUT·의존성 취약점 13건, **신규 기능 수용시험 아님**. 외부 독립 신규 검증 승인 0, 누적 검증·중복제거·근거분류 UNKNOWN/10,000 **BLOCKED/IN PROGRESS**. 공식 정확 SHA Test·독립 복원·Production RELEASE HOLD. 문서만, main 병합·런타임·DB·WLD·원장·Test·Production 변경 없음.
