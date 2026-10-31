# v1562 기획 작업일지 — F675-196

## v2026.10.31.1562 — F675-196 일일 통합 알림의 고정 판단시각·설정 전환·증거 정합성 (기능 보완 / DRAFT / RELEASE HOLD)

**회차:** 이전 기능 추가 v1560 → 현재 기능 보완 v1562 → 다음 기능 추가 v1564(잠정). **기준:** main `bc8cd8a6c654af0336f550643f23049a58ee1d16` 시작/중간 확인, AGENTS.md·README.md·영문 PROJECT_PLAN.md 원본·국문 동등 문서. 미병합 Draft #2167 (`e866814b173fc526f3f41be233e12a695fde115f`) 위에 쌓은 문서 브랜치, 개발 이슈 #2166. F675-192~196은 모두 **미구현 Draft**. 실제 알림 구현·운영 배포를 주장하지 않음.

### 발견된 기획 문제·대안
- v1560은 09:00 KST와 7일/1일 판단기간을 정했으나, 실제 워커가 잠금 후 얻는 **실행 시각**으로 판단일·대상을 계산하면 09:00 정시 실행과 09:07 지연 실행에서 대상 경계가 달라질 수 있음. 회원/일 UNIQUE와 서명 영수증은 중복만 막을 뿐 판단 대상의 일관성을 보장하지 않음. 이는 기획 위험이며 운영 장애 확인은 아님.
- **개선:** KST 판단일 `decisionDateKst`와 DB가 계산한 고정 `slotAtUtc`(서울 09:00, 현재 UTC 00:00)를 판단기간·배치 키의 유일한 기준으로 사용. 잠금 후 DB `clock_timestamp()`는 현재 원천 검증과 실행 마감 판정에만 사용. 클라이언트 Date, 실행 시작시각으로 기간 계산, 무조건 소급 발송, 일부 아이템만 담은 통합 알림은 배제. 워커는 최소 1회 재시도 가능하나 알림함 확정은 회원/슬롯당 최대 1회이며 실제 수신 보장은 아님.
- **실행 제한 제안:** DB 시각 `slotAtUtc <= now < slotAtUtc+15분`일 때만 실행, 커밋 직전에 다시 확인. 15분은 **실측되지 않은 변경 가능한 설계값**. 슬롯 이전 WAIT, 15분 이상이면 증빙된 MISSED_NO_SEND, 소급 발송 금지. DB 장애나 워커 실행 증거가 없으면 UNKNOWN/UNVERIFIED로 표시하고 알림함 항목 부재만으로 누락이라고 단정하지 않음. 워커 2개와 재시도도 슬롯당 하나의 최종 결과로 수렴.
- **정확한 계산:** 만료 E에 대해 7일 알림은 `E-168h <= S < E-144h` 즉 `144h < E-S <= 168h`; 1일 알림은 `E-24h <= S < E` 즉 `0 < E-S <= 24h`. PostgreSQL 마이크로초와 UTC 고정시간을 사용, JavaScript Date로 정밀도를 낮추지 않음. S=2026-11-01 00:00Z일 때 E=S+168h는 7일 대상, E=S+144h는 제외, E=S+24h는 1일 대상, E=S는 제외. ±1µs 검증 필수.

### 설정 변경·보유 상태 경합·회원 화면
- **늦은 ON 방지:** 연속 활성화 시작 시각 `digest_enabled_since_utc`를 DB에 기록. `enabled_since < S`이고 회원 잠금/커밋 시 전체 설정도 ON인 경우만 포함. 09:00 이후 ON/재ON은 다음 판단일부터 적용. 09:00 이후라도 커밋 전 OFF/개별 모드 전환은 즉시 미발송 처리. 이미 확정된 알림은 취소하지 않음. 설정 리비전과 멱등성 키/본문 결속, 오래된 값 409, 이력 미확인 503.
- **늦은 해제·신규 획득 방지:** 보유 `generation_started_at`, `expiry_version_changed_at`, `last_unmuted_at` 또는 동등한 검증 가능 전이 증거가 S 이전이어야 포함. 커밋 전 제외 설정은 즉시 우선. 09:00 이후 획득·만료시각 변경·제외 해제는 당일 지연 워커에 소급 포함하지 않음. 마이그레이션 071/072/103/165 및 모든 쓰기 경로에서 전이 시각을 증명할 수 없으면 기능을 BLOCK하고 09:00 상태를 추정하지 않음. 전체 설정·보유 세대·개별 제외·영수증은 순서 있는 잠금 아래 재검증.
- **화면:** `/inventory/expiring/reminders/digest`에 '다음 판단 09:00 KST', '09시 이후 설정은 내일부터 적용', VERIFIED_COMMITTED_INBOX, VERIFIED_NO_ELIGIBLE, VERIFIED_MISSED_NO_SEND, UNKNOWN_WORKER_STATUS, SOURCE_UNAVAILABLE, SAVING, STALE_REVISION, GLOBAL_OFF, ACCOUNT_SWITCHED를 구분. 저장/되돌리기·증거 있는 이력 이동만 제공. 미리보기는 가능성이지 발송 확정이 아님. 전체 OFF이면 아이템별 조회 금지. 320px·200% 확대·WCAG 2.2 AA·포커스·aria-live·시간대 표기, Next/Android 계정 전환 응답 폐기.

### API·DB·트랜잭션·보안·운영
- v1560의 본인 전용 POST 미리보기/설정은 유지하고, 읽기 전용 `POST /api/v1/shop/expiry-reminders/digest/decision-status` 본문 `{decisionDateKst:'YYYY-MM-DD'}`를 추가 제안(최근 본인 7일만). 응답 `{decisionDateKst,slotAtUtc,status:'VERIFIED_COMMITTED_INBOX'|'VERIFIED_NO_ELIGIBLE'|'VERIFIED_MISSED_NO_SEND'|'UNKNOWN',inboxId?,sourceStatus:'VERIFIED'|'UNAVAILABLE'}`. inboxId는 현재 본인 권한 재검증 시에만 제공. 서버 세션·동의·CSRF, 본인 ID 입력 금지, URL 쿼리 토큰 금지, 원문 아이템 로그 금지. 오류 400/401/403/409/429/503, UNKNOWN을 검증된 빈 200으로 위장하지 않음. Android app-api 동등성.
- **DB 제안:** F675-192~195 실제 설정/영수증/세대 구조를 재사용하고 Backend B와 순차 마이그레이션을 조정. 회원+KST 판단일 UNIQUE 배치에 `slot_at_utc`, `window_version`, `cutoff_at_utc`, `outcome` CHECK, 불변 `committed_inbox_id`, 워커 시도/최종 상태의 본인 범위 증빙. COMMITTED일 때만 inbox ID 필수, NO_ELIGIBLE는 전체 데이터 조회 성공, MISSED는 실제 마감 증거가 있어야 기록. 그 외 상태에 SENT 영수증 금지. EXPLAIN/BUFFERS 근거 없는 중복 인덱스 금지. 고정 search_path SECURITY DEFINER, PUBLIC/앱 계정 직접 테이블 권한 거부·함수 EXECUTE만, 타인 접근 거부·마이그레이션 패리티. 최신 main 번호 313, 기획에서 번호 예약 금지. WLD·Treasury·발행·금융 원장 쓰기 없음.
- **원자성:** 회원+슬롯 예약 → 전체 설정/리비전 → 상품 UUID 정렬 보유·세대·만료 → 개별 제외 → 공통 기준별 영수증 → 배치·구성원·알림함. 기존 구매·알림 쓰기와 교착 없는 잠금 순서를 검증. 미리보기 첫 50건이 아닌 전체 집합. 커밋 직전 DB 마감시각·전체 OFF·모드·세대 재검증. 원천 불명·잠금 초과·부분 삽입·알림함 실패·10,001건 시간 초과는 전체 롤백하고 UNKNOWN/마감 전 재시도 가능, 부분 통합·가짜 빈 결과 금지. 확정 슬롯은 설정 변경으로 재개방하지 않음. 개별/통합 공통 영수증 중복 차단, 알림함 보존 삭제가 확정 증거를 연쇄 삭제하지 않도록 설계.
- **개인정보·악용:** `EXPIRY_REMINDER_DAILY_DIGEST_ENABLED` 기본 OFF. 2xx/3xx/4xx/5xx 모두 private/no-store/noindex/no-referrer, 사이트맵/공개 canonical 제외, 안전한 /inventory 내부 링크 #2130 선행. 판단 상태 조회 회원당 분당 최대 30회, 최근 7일만, 관리자 타인 상세 조회 금지. 관리자 KPI는 회원 20명 이상 집단만: 판단 슬롯·검증된 COMMITTED/NO_ELIGIBLE/MISSED/UNKNOWN·지연 분·재시도 경합·409/429/503·SQL p95·ON 전환. 소규모 셀 비공개. KPI는 **제안/미측정**.
- **배포:** B는 SQL/워커/API, A/C는 Next/Android, QA는 정확 SHA 격리 PG17·HTTP 확인. 별도 브랜치·Test Docker, 전체 QA·보안감사·경로장부·독립 복원·운영 실행 SHA/롤백·금융 정합성 승인 전 배포 금지. OFF 롤백에서도 공통 영수증 삭제/개별 알림 재발송·슬롯 이력 소급 변경 금지. RELEASE HOLD.

### 개발 백로그 P0 4건 / P1 6건
1. **P0 OPS1562-01** #2144/#1984/#2171: 운영 PID/바이너리/엣지 SHA·독립 복원·불변 롤백 증빙. miniPC moneyverse-mcp cgroup TasksCurrent 1016/TasksMax 1027, EAGAIN 원인 분리; 타 예약 프로세스 임의 종료 금지, 전체 QA 게이트.
2. **P0 SEC1562-02** #993: 개발 DB 체크섬 5건/ACL, 클린 PG17 알림함 DDL 출처, 보유세대·제외 전이시각, SECURITY DEFINER 권한 거부 시험. 기획 마이그레이션 번호 예약 금지.
3. **P0 FIN1562-03** #2153: 기존 Test 미검증 6천만 WLD/Production 503 증거를 최신 실제 원천으로 재검증; 통합 알림 금융 쓰기 0.
4. **P0 REL1562-04**: 보안감사·전체 QA·경로장부·정확 SHA 공식 Test·Android 개인정보·독립 복원·운영 출처·승격 승인 전 HOLD.
5. **P1 SLOT1562-05** B: 고정 slotAtUtc·15분 마감 SQL, 회원/날짜 UNIQUE, 감사 가능한 최종 상태, 인덱스·제약·보존 시험.
6. **P1 SLOT1562-06** B: 연속 ON 시작시각, 제외/획득/만료 변경 전이 증거, 잠금 순서·워커 2개 경합/재시도.
7. **P1 SLOT1562-07** B: Nest 판단상태 POST·CSRF/동의/세션·설정 멱등성·400/401/403/409/429/503/UNKNOWN.
8. **P1 SLOT1562-08** A/C: Next·Android 정확한 다음 판단·상태, 비공개 캐시, 저장/되돌리기, 320px 접근성, 계정 변경 응답 폐기.
9. **P1 SLOT1562-09** A/C: 안전한 알림함 링크·모든 HTTP 개인정보 헤더·관리자 20명 이상 집계·개인 ID 분석 금지·속도 제한.
10. **P1 SLOT1562-10** QA: 격리 PG17 10,001건/회원 2명/워커 2개, ±1µs 경계, 08:59/09:00/09:07/09:15·자정, ON/OFF/ON·슬롯 후 획득/해제·만료 변경·워커 미실행과 검증 누락 구분·원자성·ACL·Android·롤백·정확 SHA Test.

**증거:** main `bc8cd8a6c654af0336f550643f23049a58ee1d16` 시작/중간, 최신 마이그레이션 313. 이전 QA v1411 통계는 과거 결과이지 v1562 수용시험이 아님. 신규 #2171은 miniPC cgroup EAGAIN으로 전체 로컬 QA가 막힌 사실을 기록. v1560 로컬 릴리스 시험 121 PASS/1 FAIL(기존 정리 워크플로 기대 불일치), 원격 문서 CI 성공은 신규 기능 검증이 아님. 수용시험·p95 **제안/미실행**. 외부 독립 레퍼런스 신규 승인 **0건**, 누적 검증·중복 제거·분류 **UNKNOWN / 10,000건** => BLOCKED/IN PROGRESS. 런타임·DB·WLD·원장·Test·Production·main 변경 없음. DRAFT / RELEASE HOLD.
