# 머니버스 통합 제품·기능 포트폴리오 재검토 — v2026.10.15.675

## v1278 — F675-126 계산기 재계산·승격 사실성 (기능 보완 / 운영 보류)
- 이전 Addition v1276 → 현재 Improvement v1278 → 다음 Addition v1280; main `1c5b84a1` 시작·중간 확인, 선행 Draft #1310, 개발 [#1309](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1309).
- 복리·대출이 `stock`으로 저장되고 대출 상환방식이 누락되며 지역화 숫자로 정확한 재계산 불가. 제목/ticker 중복제거는 다른 시나리오를 유실하고 실패한 관심종목 승격도 성공 표시, 알림·10,000 WLD는 미검증. 계산기별 ID/스키마/수식 어댑터, 동의형 로컬 미리보기, 서버 영수증·재조회 검증, WLD/관심종목/알림 쓰기 0을 명세.
- P0 ENV1278-01 SEC1278-02 REL1278-03 CAL1278-04; P1 CAL1278-05 CAL1278-06 CAL1278-07 CAL1278-08 CAL1278-09 CAL1278-10. QA v1273 FAILED/HOLD, 루트 98%, 보안감사·DB권한·Migration·정확 SHA Test/복원 차단. 신규 외부 승인 0, 누적 미확인/10,000 BLOCKED. 문서만 변경, 기능 OFF, 운영 HOLD.
- **백로그 식별자:** ENV1278-01 SEC1278-02 REL1278-03 CAL1278-04 CAL1278-05 CAL1278-06 CAL1278-07 CAL1278-08 CAL1278-09 CAL1278-10


## v1276 — F675-126 검증형 계산기 시나리오 보관함 (기능 추가 / 보류)
- 이전 Improvement v1274 → 현재 Addition v1276 → 다음 Improvement v1278. main 1c5b84a1 시작·중간 확인, Draft #1304 미병합, 개발 [#1309](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1309).
- CalculatorSaveAction의 localStorage 임시 저장과 존재하지 않는 /api/portfolio/watchlist 호출은 서버 영구 저장 증거가 아니다. 오류 시 성공 표시 및 10,000 WLD/알림 약속은 미검증. 신규 본인 보관함은 실제 소유자·버전·입력 지문 영수증 필수, 로컬 초안 선택형 가져오기, 주식·WLD·원장 변경 없음.
- /tools 및 /account/calculator-scenarios 화면, NestJS 본인 CRUD·Android, 버전형 허용 목록/100건/8KiB, SECDEF DB·CAS·불변 영수증, 401/403/404/409/422/429/503, 개인정보/noindex, 관리자 k>=20, WCAG AA, 영수증 KPI/롤백은 국영문 통합 마스터에 상세화.
- P0 ENV1276-01 SEC1276-02 REL1276-03 CAL1276-04; P1 CAL1276-05 CAL1276-06 CAL1276-07 CAL1276-08 CAL1276-09 CAL1276-10. QA v1272 FAILED/HOLD, 공식 CI 실패, 루트 97%, Migration266/280, DB 권한, 정확 SHA Test/복원 BLOCKED. 외부 신규 승인 0·누적 미확인/10,000 BLOCKED. 기획 문서만 변경.
- **백로그 ID 전체:** ENV1276-01 SEC1276-02 REL1276-03 CAL1276-04 CAL1276-05 CAL1276-06 CAL1276-07 CAL1276-08 CAL1276-09 CAL1276-10


## v2026.10.25.1274 — F675-125 월간 명세서 정밀도·마감 무결성 보완 (기능 보완 / 초안 / 보류)
- **회차:** 이전 기능 추가 v1272 → 현재 기능 보완 v1274 → 다음 기능 추가 v1276(잠정). main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 확인, AGENTS·README·영문 정본/국문 대조. 미병합 Draft #1296 후속, 개발 이슈 #1295. 문서 기획만 수행, 런타임/DB/Test/운영 변경 없음.
- **실증 정정:** Migration 194 및 개발 DB 메타데이터에서 ledger_postings.amount·account_balances.available_amount가 BIGINT가 아닌 제한 없는 NUMERIC임을 확인했다. v1272 명세서 BIGINT 제안을 정수 CHECK를 갖춘 NUMERIC으로 대체하고 API/CSV는 정확한 10진 문자열로 처리하며 JS Number 변환을 금지한다. 동일 거래/계좌의 중복 전표를 먼저 집계하고 차변-대변 부호를 기존 지갑과 일치시킨다.
- **마감 검증:** 거래의 월 판정은 transaction.created_at, 정정은 새 역거래(Migration083), 계정 병합은 실제 이체(Migration163)로 처리한다. REPEATABLE READ·최대시각만으로 과거 시각 미커밋 거래의 누락을 막지 못하므로 전체 쓰기 경로의 seal/커밋 순서 워터마크와 독립 잔액 앵커 없이는 VERIFIED 금지, SOURCE_SEAL_UNAVAILABLE로 UNVERIFIABLE 처리. 완전 불변 세대·HMAC·head 원자 발행, 본인/세션/세대 서명 커서, 병합 원본·대상 사전 차단, 탈퇴 개인정보 처리.
- **P0:** ENV1274-01 SEC1274-02 REL1274-03 WAL1274-04. **P1:** WAL1274-05 WAL1274-06 WAL1274-07 WAL1274-08 WAL1274-09 WAL1274-10. DB/API/화면·관리자/SEO/Android/a11y/KPI/동시 100건·타인 100건·합성 10,001건·큰 수·늦은 커밋 테스트는 국영문 통합 마스터에 상세 명세.
- **QA:** 최신 완료 v1271 FAILED/HOLD(프론트 5건 실패, 의존성 Critical2/High10, 개발 DB 앱 DML 235/241, PUBLIC 은행 3개, Migration266/280, 정확 SHA 금융 Test/복원 미확인). 루트 95%·약 4.8GiB 여유(17:08 KST). 기능 OFF, 운영 보류. 외부 신규 승인 0건·누적 미확인/10,000 => BLOCKED/IN PROGRESS.
- **백로그 ID:** ENV1274-01 SEC1274-02 REL1274-03 WAL1274-04 WAL1274-05 WAL1274-06 WAL1274-07 WAL1274-08 WAL1274-09 WAL1274-10


## v1272 — F675-125 회원 전용 검증형 월간 WLD 명세서 (추가 / 보류)
- **GitHub:** [Draft PR #1296](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1296) OPEN/HOLD, [개발 이슈 #1295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1295) OPEN. 선행 기획 브랜치 위 미병합 문서 변경만 수행, 런타임/DB/Test/운영 변경 없음.
- 이전 Improvement v1270, 현재 Addition v1272, 다음 Improvement v1274. main 1c5b84a1 확인, 선행 Draft #1289 미병합, 개발 이슈 [#1295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1295).
- 기존 지갑 API·화면은 최근 50건으로 제한되고 CSV는 받은 50건만 포함한다. 신규 회원 전용 월간 명세서는 현금·은행별 거래와 원천 완결 체크포인트·기초/기말 잔액을 독립 검증하고 불변 세대·영수증으로 발행한다. 근거 없는 과거 잔액은 UNVERIFIABLE. /wallet/statements·YYYY-MM, 인증 Nest/Android, private/no-store/noindex, 안전한 CSV, 320px/WCAG, 관리자 비식별 통계. 상세 계약은 국영문 통합 마스터.
- P0 ENV1272-01 SEC1272-02 REL1272-03 WAL1272-04; P1 WAL1272-05 WAL1272-06 WAL1272-07 WAL1272-08 WAL1272-09 WAL1272-10. QA v1270 FAILED/HOLD, Migration266/280·DB ACL·CI·Test·복원 게이트. 외부 승인 신규 0·누적 미확인/10,000 BLOCKED. 운영 승격 금지.

## v2026.10.25.1270 — F675-124 작성자 숨김 무결성 제품 검토 (기능 보완 / 초안 / 보류)
- Draft PR [#1289](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1289) OPEN/HOLD, 개발 이슈 [#1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280) 업데이트, 미병합·런타임/DB/Test/운영 변경 없음.
- 이전 기능 추가 v1268 / 현재 기능 보완 v1270 / 다음 기능 추가 v1272(잠정), main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 확인, 선행 Draft #1281 미병합, 개발 이슈 #1280. 구현·배포 아님.
- 공개 top-50 및 LIMIT 뒤 종목 필터를 개인 피드에 재사용 금지. SQL에서 작성자·종목을 LIMIT 이전 필터링, 본인/세션/세대/필터 결합 서명 커서, 원본 작성자 불변, 계정 병합 사전 차단, 소프트 탈퇴 보존·삭제 정책, HMAC 원본 영수증, 200명 한도·12회/분. 공개 SEO/DM/알림 불변, 관리자 20명 미만 비식별, Android 본문 CAS, WCAG AA. 상세 화면·API·DB·트랜잭션·KPI·보안·롤백은 국영문 통합 마스터.
- P0 ENV1270-01 SEC1270-02 REL1270-03 BOARD1270-04; P1 BOARD1270-05 BOARD1270-06 BOARD1270-07 BOARD1270-08 BOARD1270-09 BOARD1270-10. QA v1269 FAILED/HOLD: 프론트 6 실패, Critical2/High10, 앱 DML 235/241, PUBLIC 은행 3개, Migration266/280, 정확 SHA Test·복원 미검증, 시작 루트 92%. 독립 근거 신규 승인 0/누적 미확인/목표 10,000 BLOCKED. 문서만 변경.
- Full backlog IDs: ENV1270-01 SEC1270-02 REL1270-03 BOARD1270-04 BOARD1270-05 BOARD1270-06 BOARD1270-07 BOARD1270-08 BOARD1270-09 BOARD1270-10


## v2026.10.25.1268 — F675-124 본인 전용 게시판 작성자 숨김 (기능 추가 / 초안 / 운영 보류)
- Draft PR [#1281](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1281) OPEN/HOLD, 개발 이슈 #1280 OPEN, main 미병합·런타임/Test/운영 변경 없음.
- 이전 기능 보완 v1266 → 현재 기능 추가 v1268 → 다음 기능 보완 v1270(잠정). main eb27f5590e80bb71462e3888d052106a068e661a 시작·중간 및 영문 정본·국문 대조 확인. 개발 이슈 [#1280](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1280), 미병합 #1274 후속 문서만 변경.
- 공개 게시판은 60초 캐시·검색 색인·목록 최대 50건/authorUserId 없음, Migration259 상세는 작성자 UUID 있음. 브라우저 사후 필터·전역 차단 대신 DB LIMIT 이전 개인 피드 필터, 본인 숨김·해제만 설계. 공개 SEO·운영 제재·DM·알림·원장 변경 없음.
- 본인 검증 SECURITY DEFINER, 활성 200명 한도, 회원+작성자 유니크 묘비/버전·세대·HMAC 영수증, 회원/세션/세대 결합 커서, 동의/CSRF·Android 동등·개인 no-store/noindex·관리자 k>=20·WCAG2.2 AA. 상세는 영문/국문 통합 정본 참조.
- P0 ENV1268-01 SEC1268-02 REL1268-03 BOARD1268-04; P1 BOARD1268-05 BOARD1268-06 BOARD1268-07 BOARD1268-08 BOARD1268-09 BOARD1268-10. 검증: 동시 100건·타인 100건·합성 글 10,001건·공개 캐시 누출 0·정확 SHA Test 및 독립 QA PASS 전 운영 금지.
- QA v1268 FAILED/HOLD, 루트 실측 89%/11G 여유지만 DB ACL 235/241·PUBLIC 3·Migration266/280·Frontend 6건 실패·Critical2/High10·금융·복원/Test 차단 지속. 외부 신규 승인 0·누적 미확인/10,000 BLOCKED. 런타임/Test/운영 변경 없음.
- 전체 백로그 ID: ENV1268-01 SEC1268-02 REL1268-03 BOARD1268-04 BOARD1268-05 BOARD1268-06 BOARD1268-07 BOARD1268-08 BOARD1268-09 BOARD1268-10


## v2026.10.25.1266 — F675-123 일정 원천·ICS 무결성 보완 (기능 보완 / 초안 / 운영 보류)
- Draft PR [#1274](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1274) OPEN/HOLD; 개발 이슈 [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267) 갱신, main 병합·운영승격 없음.
- 이전 기능 추가 v1264 → 현재 기능 보완 v1266 → 다음 기능 추가 v1268(잠정). 원격 main c9a868b1e622341e2daa8b936ddf0988eda9988e 시작·중간 확인, main AGENTS/README 및 영문 정본·국문 대조 확인. 선행 Draft #1268 미병합, 개발 이슈 #1267, 문서만 변경.
- 실제 main: 시즌 이벤트 ends_at은 상위 시즌 종료일이며 관리자 이벤트 수정에 단조 버전 없음; 상점 판매 종료일과 재고 이용 기간은 별개; 캘린더 헬퍼는 지난 시각도 파싱되면 포함. 개선: 서버 본인 권위 원천 해석기, 이벤트+시즌/상품+재고 복합 버전, 변경→원복(ABA) 감지, 만료·비활성·품절·불명 차단, 날짜 변경 시 회원 재확인.
- ICS는 한 DB 트랜잭션의 최신 검증 미래 일정만 일회성 스냅샷으로 생성. 불투명 영속 UID·UTC DTSTART/DTSTAMP·RFC5545 이스케이프·UTF-8 75옥텟 접기·개인 no-store·제외 건수 명시. 허구 알림·구독 피드·취소 통보 금지. 버전 묘비/HMAC 멱등, 회원 우선 잠금/100건, Android JSON, 개인정보/관리자 k≥20/SEO/접근성/KPI/롤백 명세.
- P0 ENV1266-01 SEC1266-02 REL1266-03 CAL1266-04; P1 CAL1266-05 CAL1266-06 CAL1266-07 CAL1266-08 CAL1266-09 CAL1266-10. 상세 화면/API/DB/인덱스/트랜잭션/보안/테스트/배포는 [영문 통합 정본](INTEGRATED_PLANNING_MASTER.md)과 [국문 동등 문서](INTEGRATED_PLANNING_MASTER.ko.md).
- QA v1267 FAILED/HOLD, 루트 100%/여유 181MiB, 앱 DML 235/241·PUBLIC 은행 3개, Migration266/280, 프론트 6건 실패, 정확 SHA Test/복원 BLOCKED. 신규 승인 외부 근거 0건, 누적 미확인/10,000 BLOCKED/IN PROGRESS. 런타임·DB·WLD·원장·Test·운영 미변경.

## v2026.10.25.1264 — F675-123 검증형 회원 일정 관심 목록·개인 ICS 내보내기 (기능 추가 / 초안 / 운영 보류)
- 이전 기능 보완 v1262 → 현재 기능 추가 v1264 → 다음 기능 보완 v1266(잠정). 원격 main `c9a868b1e622341e2daa8b936ddf0988eda9988e` 시작·중간 재확인, main AGENTS/README·영문 정본 PROJECT_PLAN/국문 대조 검토. 미병합 #1261 후속 문서, 개발 이슈 [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267). 최신 완료 QA v1265 FAILED/HOLD, v1266 감사 산출물은 종합 PASS 아님.
- 실제 main `/calendar`는 시즌 `event_id/ends_at`, 상점 `catalog_id/sale_ends_at`, 계산형 주간 갱신·오늘 사건을 표시하나 본인 관심 목록·ICS 내보내기는 확인되지 않음. F675-123은 검증된 미래 시즌/상점 마감만 회원 자발적 등록·해제, 원천 최신 상태 재검증, 본인 불변 영수증, 100건 한도·분당 12회, 삭제된 원천의 비식별 해제, 인증 RFC5545 **일회성 스냅샷** 내보내기를 제안. 영구 공개 피드·푸시·이메일·WLD/원장 변경 금지. Android JSON 동등성.
- P0 ENV1264-01 SEC1264-02 REL1264-03 CAL1264-04; P1 CAL1264-05 CAL1264-06 CAL1264-07 CAL1264-08 CAL1264-09 CAL1264-10. 목적·권한·화면·CTA·상태·API·DB 제약/인덱스·트랜잭션·관리자·보안·SEO·모바일·접근성·KPI·100건 경합·합성 10,001건·롤백은 [국문 통합 마스터](INTEGRATED_PLANNING_MASTER.ko.md) 및 [영문 정본](INTEGRATED_PLANNING_MASTER.md)에 동등 명세.
- QA v1265 HOLD, 루트 100%(약 349MiB), 개발 앱 DML 235/241, PUBLIC 은행 EXECUTE 3, Migration266/280, 프론트 6건 실패, v1266 감사 Critical2/High10; 정확 SHA Test/복원 HOLD. RFC/OWASP/W3C는 설계 참고로 검토, 신규 승인 0·누적 미확인/10,000 BLOCKED/IN PROGRESS. 런타임·DB·WLD·Test·운영 미변경.

## v2026.10.25.1262 — F675-122 주간 이력 원자적 발행·원천 완결성 보완 (기능 보완 / 초안 / 운영 보류)
- 이전 기능 추가 v1260 → 현재 기능 보완 v1262 → 다음 기능 추가 v1264(잠정). main `c9a868b1e622341e2daa8b936ddf0988eda9988e` 시작·중간 재확인, main AGENTS/README·영문 정본 PROJECT_PLAN/국문 대조 검토. 미병합 #1257의 문서 후속, QA v1265 FAILED/HOLD.
- 실제 Migration101은 주간 `created_at` 하한만 사용하고 현재 직업 순위가 변동 가능하며 과거 주차 완결성 체크포인트가 없음. v1260 목표별 head는 혼합 버전 위험, 24시간 유예만으로 원천 수집 완결성 증명 불가. 불변 주차 전체 세대+단일 원자적 head, 원천별 연속 체크포인트, 근거 없는 VERIFIED 금지, HMAC 근거 지문, 본인 API·Android의 세대 일관 서명 커서 및 변경 시 409 재시작으로 보완. 수정 시 주차 전체 새 세대 추가, 임의 소급 생성·NPC 평생 지표의 주간 검증 포함·WLD/원장 변경 금지.
- P0 ENV1262-01 SEC1262-02 REL1262-03 QUEST1262-04; P1 QUEST1262-05 QUEST1262-06 QUEST1262-07 QUEST1262-08 QUEST1262-09 QUEST1262-10. 화면·API·DB·잠금·관리자·개인정보·SEO·접근성·KPI·100건 경합·합성 10,001건·롤백 상세는 [국문 통합 마스터](INTEGRATED_PLANNING_MASTER.ko.md) 및 [영문 정본](INTEGRATED_PLANNING_MASTER.md).
- QA v1265 루트 100%(약 368MiB), 개발 앱 DML 235/241, PUBLIC 은행 함수 3개, Migration266/280, PR #1255 프론트 6건 실패, main CI runtime-check SKIPPED, 정확 SHA Test/복원 HOLD. 외부 신규 승인 0, 누적 미확인/10,000 BLOCKED/IN PROGRESS. 기획 문서만 변경, 런타임·DB·WLD·Test·운영 변경 없음.


## v2026.10.25.1260 — F675-122 주간 퀘스트 이력 제품 검토 (기능 추가 / 운영 보류)
- `/quests`는 Migration101의 현재 서울 주차만 조회하며 검증된 과거 아카이브는 없다. 세 주간 목표는 영수증·원장 기반, NPC는 평생 누적·자가 신고. 현재 직업 순위로 과거 작업 달성률을 재계산하면 허위 과거 기록이 될 수 있다.
- 비공개 `/quests/history` 목록·상세, 서버가 확정한 불변 주간 근거, NOT_ARCHIVED/PENDING_FINALIZATION/VERIFIED/CORRECTED/UNVERIFIABLE 명시, 신규 보상·회원 쓰기·근거 없는 소급 금지. 당시 정책 버전, 24시간+워터마크, 새 revision으로만 정정, DB 본인 조회, 서명 커서, Android·접근성, 관리자 비식별 지연 지표, 개인 SEO. 상세는 [한국어 통합 기획서](INTEGRATED_PLANNING_MASTER.ko.md).
- P0 ENV1260-01 SEC1260-02 REL1260-03 QUEST1260-04; P1 QUEST1260-05 QUEST1260-06 QUEST1260-07 QUEST1260-08 QUEST1260-09 QUEST1260-10. QA v1264 FAILED/HOLD, 루트 100%, 앱 DML 235/241·PUBLIC 은행 함수 3개, Migration266/280, 정확 SHA Test·복원 차단. 외부 신규 승인 0·누적 미확인/10,000 BLOCKED. 문서만 변경.


## v2026.10.25.1258 — F675-121 댓글 팔로우 무결성 제품 검토 (기능 보완 / 운영 보류)
- 코드 확인: 댓글 생성의 같은 키 재시도는 작성자만 비교하고 글/본문은 확인하지 않으며, 삭제 요청 키와 URL의 글 ID가 무시된다. 잘못된 성공 표시·경로 불일치 위험이 있으나 실제 악용 입증은 아니다. 원본 결합 영수증/409, 글 잠금, 다른 글 경로 404, 신규 댓글만 outbox·세대별 알림 방지 설계.
- 사용자 신뢰: 서버 확정 팔로우/해제, 동일 재시도 최초 영수증, 가짜 새 댓글 알림 금지, 삭제 후 오래된 알림 철회/원천 재검증(과거 열람 취소 보장은 불가). 개발 C #1206 미병합 기능과 중복 금지, WLD·원장 미변경.
- P0 ENV1258-01 SEC1258-02 REL1258-03 BOARD1258-04; P1 BOARD1258-05 BOARD1258-06 BOARD1258-07 BOARD1258-08 BOARD1258-09 BOARD1258-10. QA v1261 HOLD, 루트 100%, 프론트 6건 실패, 감사 Critical2/High10·봇 Critical1/High5, DB 권한·Migration266/280·Test·복원 차단. 외부 신규 승인 0, 누적 미확인/10,000. 문서 초안만.


## v2026.10.25.1256 — F675-121 게시판 댓글 팔로우 제품 검토 (기능 추가 / 운영 보류)
- 문제: 실제 게시글·댓글은 있지만 main에서 회원의 명시적 글별 팔로우와 검증된 댓글 알림은 확인되지 않았다. 읽기 목록·게시글 초안·수정 이력 및 개발 C의 미병합 실제 알림함 #1206과 범위를 분리한다.
- 가치: 팔로우/알림 끄기/해제, 비공개 목록, 실제 확정되고 공개된 타인 댓글만 통지, WLD·보상 주장 없음. 503을 성공으로 표시하지 않으며 generation·공개 상태를 발송 직전 검증하고 댓글 본문·숨겨진 제목을 내구 페이로드에 저장하지 않는다.
- 구현 전제: 회원 전용 SECURITY DEFINER, 활성 200개, 글별 잠금 event_seq, 버전/묘비/HMAC 영수증, Android JSON requestId/expectedVersion, 분당 12회, 관리자 익명 큐 상태, noindex/no-store, WCAG AA, 롤백. P0 ENV1256-01 SEC1256-02 REL1256-03 BOARD1256-04; P1 BOARD1256-05 BOARD1256-06 BOARD1256-07 BOARD1256-08 BOARD1256-09 BOARD1256-10. 전체 API/DB/화면/테스트는 [국문 통합 마스터](INTEGRATED_PLANNING_MASTER.ko.md) 참조.
- QA v1259 FAILED/HOLD: 루트 100%, 앱 DML 235/241, PUBLIC 은행 함수 3개, Migration 266/280, 감사 Critical2/High10, 프론트 6건 실패, 정확 SHA Test·복원 차단. 외부 신규 승인 0, 누적 미확인/10,000 BLOCKED. 문서만 변경, 런타임·DB·WLD·Test·운영 변경 없음.


## v2026.10.25.1254 — F675-120 거래 메모 계정 생명주기·개인정보 검토 (기능 보완 / 보류)
- 실제 Migration 163은 병합된 회원의 과거 전표를 기존 계좌 소유로 보존한다. 신규 개인 메모·묘비·영수증이 있으면 병합 전 순방향 차단 검사를 요구하며, 별도 승인 없이 메모나 과거 원장 권한을 p_keep으로 이전하지 않는다. 실제 운영 사고 확인이 아닌 설계 연동 위험이다.
- 메모 삭제는 본문·분류를 NULL로 지우고 버전 묘비만 유지한다. 불변 영수증에는 개인정보를 담지 않고 일반 SHA256 대신 비밀키 HMAC·키 교체를 사용한다. 영수증 30일 보존은 개인정보 승인 전 제안이며 WAL·백업 즉시 삭제를 약속하지 않는다. 원장/WLD 변경 없음.
- 불변 created_at+거래 ID 키셋과 본인/세션/asOf 서명 커서는 수정에 따른 중복/누락을 방지하지만 삭제·재저장까지 과거 스냅샷으로 보장하지 않는다. 최근 50건 CTA·저장 목록·본인 404·계정 전환 응답 차단·Android 본문 expectedVersion/requestId·320px/200%·TalkBack·noindex/no-store 유지.
- P0 ENV1254-01 SEC1254-02 REL1254-03 WAL1254-04; P1 WAL1254-05 WAL1254-06 WAL1254-07 WAL1254-08 WAL1254-09 WAL1254-10. QA v1257 FAILED/HOLD, 루트 100%, DB 최소권한, Migration266/280, CI/보안/공식 Test 정확 SHA/복원 미해결. 향후 100건 동시성·10,001건 목록 수용 조건은 통합 마스터 참조.
- 외부 독립 근거 목표 10,000건, 이번 승인 0건, 누적 검증 미확인, BLOCKED/IN PROGRESS. 문서만 변경하고 운영승격 보류.


## v2026.10.25.1252 — F675-120 개인 원장 거래 메모 제품 검토 (기능 추가 / 보류)
- 문제: 현재 `/wallet/activity`는 최근 50건만 표시하고 CSV도 최근 전달 데이터만 내보내므로 거래를 나중에 개인적으로 구분하기 어렵다. 기존 송금 메시지·거래 이의제기 Draft #1048·원장 자체와 기능을 혼동하거나 중복하지 않는다.
- 제안: 회원 소유 현금/은행 전표로 확인한 거래에만 개인 분류·메모를 연결한다. `/wallet/activity` 저장/삭제, `/wallet/annotations` 목록, 불변 영수증·버전 묘비·서명 키셋·Android·키보드·320px/200%·noindex/no-store. 개인 분류는 공식 금융 거래 유형이 아니다.
- 권한/보안: 회원 본인 전용, 관리자는 본문 열람 불가, 공개 메모 없음, 타인 거래 조회 금지. SECURITY DEFINER 최소권한, 앱 직접 테이블 권한 금지, 분당 12회 쓰기·활성 500개 한도. 원장/WLD 변경 없음.
- P0 ENV1252-01 SEC1252-02 REL1252-03 WAL1252-04; P1 WAL1252-05 WAL1252-06 WAL1252-07 WAL1252-08 WAL1252-09 WAL1252-10. QA v1255 FAILED/HOLD, 루트 100%, Migration266/280, DB 권한·보안·CI·정확 SHA Test/복원 차단. 상세 구현 명세는 [영문 통합 마스터](INTEGRATED_PLANNING_MASTER.md)와 [국문 동등 문서](INTEGRATED_PLANNING_MASTER.ko.md).
- 외부 독립 근거 10,000건 게이트 신규 승인 0건, 누적 미확인 ⇒ BLOCKED/IN PROGRESS. 런타임·DB·Test·운영 미변경.



## F675-06 개별 상세기획 채택 — v2026.10.15.688

- [GSC 실제 검색성과·색인 증거 센터 상세기획](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.ko.md) / [영문](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md)을 v675 F675-06의 정식 상세기획으로 채택. 기존 /admin/seo·v685 재사용, GSC 날짜/상위 10개·무행0·크롤러 색인 오인·레거시 제출 성공/Google Indexing API 안내 오류 기록, 기술·제출·Google 색인본·검색 노출 실제 증거 분리, 구글/WCAG 16개 자료·D0~D7. 실제 SEO/GSC 운영 검증이나 코드 배포 아님.


## F675-05 개별 상세기획 채택 — v2026.10.15.686

- [첫 사용자 실제 행동·보상 안전 안내](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.ko.md) / [English](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.md)을 F675-05 정식 상세기획으로 채택. 기존 가이드·트래커/v76/v82 재사용, 로컬 WLD 허위입금·실패 주식 주문의 성공표시 근거 등록, 서버가 허용한 최대 3가지 사용자 선택/재방문 흐름, 한영 12개 문구·실측 전 조사·D0~D7. **기획 전용, 신규 기능 구현/배포 아님.**


## F675-04 상세 채택 — v2026.10.15.681

- [계산기→학습→선택형 가상게임 상세명세](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.ko.md) / [영문](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.md)을 v675 F675-04의 세부기획으로 채택. 기존 /tools/용어사전 활용, 비회원 계산·출처 우선, 가짜 보상/알림/클라우드 성공 금지, 세법/공식/번역·SEO 대조. 유저가설 8종/자료 14개/D0~D7. 실제 구현·Google 색인 성공을 뜻하지 않는다.


## F675-03 개별 심층 기획 — v2026.10.15.680

- [WLD 잔액변동 사유·개인영수증 명세](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md) / [영문](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md)을 F675-03 **상세기획 기준**으로 채택. 기존 지갑/거래 목록 확장, 은행 이동 순액 0과 포켓별 증감, 서버 원장 증빙·개인정보·CSV 및 D0~D7, 외부 13개 출처. WLD 이동·코드구현·운영 검증 완료는 아님.


## F675-02 개별 상세 기획 — v2026.10.15.679

- [F675-02 가상시장 AI 뉴스 신뢰·장애복구](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md) / [영문](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.md) 채택. 기존 v325 신문 재사용, 모델 호출 vs 실제 발행 vs 권한 있는 시장영향 분리, 실제 마지막 발행시각·과거 기사/정정, 사용자 가설 7개/외부 근거 13개/D0~D7. 현 운영 장애 해결이나 기능 구현 완료로 주장하지 않는다.


## F675-01 상세 후속 기획 — v2026.10.15.677

- [기능 실재성·이용자 신뢰 상세명세](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md) / [영문](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md)을 F675-01의 **상세 기획 기준**으로 추가 채택. 실제 서비스 검증이 아닌 설계·사용자 조사 가설 기록이며 F675-02~09는 향후 각각 개별 심층 검토.
- T677-01~06 코드상의 낙관적 헬스 측정값·오래된 화면갱신 등의 문제 정의. 실제 DB 안전성, v530 전체 화면, 동일 SHA Test 게이트 미충족 상태에서 배포 허가 아님.


> 상태: **PLANNING / AUTHORITY_DRIFT / 운영승격 BLOCKED** — 기획·기능 후보 검토이며 구현 완료나 배포 승인이 아님
> 검토일: 2026-10-15 KST
> 상위 문서: [프로젝트 기획서](PROJECT_PLAN.ko.md) · [통합기획 마스터](INTEGRATED_PLANNING_MASTER.ko.md) · [문서 정책](../DOCUMENTATION_POLICY.ko.md)
> 영문 원본: [Integrated Product/Feature Review](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md)
> 시작 메인: `f2bf939e53482721ee8bbf1074bd7ebf1922b13e`; 중간·최종 SHA는 작업 기록 참조
> **기존 권한 불변:** v530 전체 UI 차단, v523/542/543 경제 원장·공급량 원칙, v487 광고 전용 현금 수익화, 국내 법률 검토 및 배포 게이트를 대체하지 않는다.

## 1. 제품 방향 및 증거 경계

머니버스는 **현금화되지 않는 가상 WLD를 활용하는 지속형 사회경제 게임**이다. 실제 증권거래·실세계 금융뉴스·광고 클릭 게임이 아니다. 직업 → 지갑 → 가상 주식 → 수집/사업 → 커뮤니티 순환을 유지한다. 공공 교육용 계산기·가이드는 유용한 방문 목적을 제공하고, 게임 참여는 명확한 고지 후 자발적으로 유도한다. 현금 수익화는 현재 승인 범위인 적격 광고에만 한정한다. 현실 수익 보장이나 게임 재화의 현금 판매는 허용하지 않는다.

**이번에 실제 확인한 범위:** GitHub 최신 `origin/main`, 문서 우선순위·통합 기획서·제품/보안/SEO/AI/광고 세부 명세, 도구·주식·블로그·신문·관리자 SEO 및 API 라우트 존재, 미니PC의 읽기 전용 핵심 서비스 상태·개발 DB 연결. **확인하지 못한 범위:** 사용자별 모든 동작, 관리자 인증 E2E, 동일 SHA 격리 Test, 실제 DB 권한/공급량 안전성의 새 수용 검증, 정확한 운영 소스 신원, 매출과 SEO 성과 및 운영승격. 본 문서는 출시 승인이 아니다.

기존 감사 증거: [v638 기능/가동 점검](../worklog/2026-10-15-runtime-system-function-verification-v638.ko.md)(익명 GET 145회 중 404 6건 및 개발 DB 권한 이슈), [v651 웹 안정성](../worklog/2026-10-15-web-full-code-stability-v651.ko.md), [v652 운영승격 중단](../worklog/2026-10-15-production-promotion-gates-v652.ko.md)(Test/백엔드 SHA 불일치), [v660 주식 AI 뉴스](../worklog/2026-10-15-stock-ai-news-runtime-audit-v660.ko.md)(모델 호출과 SSRF 경로 충돌), [v625 금액 정밀도](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.ko.md). 이는 해당 검사의 범위에서만 유효하다.

## 2. 전체 도메인별 기획·구현 대응표

| 도메인 | 이미 존재하는 기획 및 코드 진입점 | 재검토 문제 / 현재 증거상 상태 | 다음 통과 조건 |
|---|---|---|---|
| 인증·OAuth·세션·언어 | 인증 명세·웹/앱·다국어 | 재시작·전환 때 세션 연속성, 사용자 선택 언어 우선, IP 강제 이동 금지 | 인증 사용자 세션/국가·언어/링크 검증 |
| 내비게이션·UI·관리자 | v530 전체 라우트/모바일 UI 점검, 관리자 템플릿 | 모바일 잘림, 관리자 전체 상태, 실제 버튼→API 연결 | 동일 SHA 다섯 번 전체 UI 경로 검증 |
| WLD·지갑·송금·원장 | v523/542/543 원장 명세, v625 금액 정밀도 | 직접 잔액 수정, DB 권한 과다, 정밀도·보존법칙 P0 | 실제 DB 최소권한·원장 합계·중복방지 |
| 직업·퀘스트·성장 | 작업·보상·경제시간·제한 명세 | 과업 식별/진입 및 서버 기준 보상 시간 표기 | 작업→제출→검수→영수증 E2E |
| 가상 주식·리그·이벤트 | 종목·포트폴리오·차트·알림·AI 시나리오 | 뉴스 스케줄 오류, 티커/ID 상태코드, 신선도 혼동 | 이벤트 검증 및 404/503·권한 계약 |
| 은행·국채·연금·국고 | 여러 재정·금융 명세 | 기존 WLD를 이동하는 원칙, 재원/준비금 정의 | 독립 회계 검증과 정책 버전 |
| 사업·상점·수집·경매 | 상품·거래·경매 화면 및 명세 | 결제/재고 오류 상태, 기능 발견성, 관리 권한 | 구매·경매 원장 증빙·권한 테스트 |
| 커뮤니티·게시판·클럽 | 소셜·게시·콘텐츠 운영 기획 | 동의·신고·수정·AI 콘텐츠 저작표시 | 관리자 검수·민감정보·게시 테스트 |
| 뉴스·블로그·AI | v261/v325·신문/블로그 페이지 | 모델 장애, 정적 정보에 실시간 날짜 표시 위험 | 마지막 성공 시점/정정 상태 |
| 공개 도구·교육 | 복리·세금 계산기·용어사전·가이드 | 계산기 분산, 결과 후 두 번째 유용한 행동 부족 | 공식·출처·가정 검증, 사용자 동선 측정 |
| SEO·국가·언어·유입 | v507 검색 운영, v527 키워드, GSC API | 제출≠색인, 얇은 콘텐츠, 캐노니컬/언어 경로 | URL 단위 색인 근거와 콘텐츠 품질 |
| 광고·측정 | v487 광고 전용, 분석 정책 | 광고 노출 금지 경로, 무효 트래픽, 수익 추정 과장 | 실측 Page RPM·동의/광고정책 |
| API·보안·인프라 | v397 API 완결, ASVS, DB/배포 지침 | DB 최소권한 위반 증거, Test/Prod SHA 불명확 | 인증·인가 부정 테스트, 동일 SHA Test |
| Android 및 외부 앱 | 웹/앱 API 공유 명세 | 계약 불일치·딥링크·서명 검증 | 계약 자동비교·실기기 수용 검사 |

**판정 원칙:** 화면, API 컨트롤러, 기능 스위치, 과거 통과 테스트는 존재를 나타내는 일부 증거일 뿐이다. 기능별 `PLANNING → IMPLEMENTED → TEST_VERIFIED → PRODUCTION_VERIFIED`를 책임자와 소스 SHA·라우트·DB 증거에 따라 구분한다. 이번 검토만으로 상태를 격상하지 않는다.

## 3. 신규 기능보다 앞서는 긴급 P0 항목

- **G675-01 경제/보안:** 직접 WLD 갱신, 과도한 앱 DB 권한, 공개 호출 가능한 고권한 DB 함수 문제 해결. 사용자 범위 검증 SECURITY DEFINER 경계와 독립적인 원장·공급량·동시성 음성 테스트가 필수다. 단순 테이블 권한 추가 금지.
- **G675-02 배포/UI:** Test·Production 실제 소스 SHA 확정, 로그인 관리자 포함 모든 페이지 5회 UI 검사, 모바일 오버플로·세션 보존·롤백 증거. 미충족 시 운영승격 HOLD.
- **G675-03 AI 뉴스:** 신뢰된 내부 모델의 정밀한 허용 경로를 설계하되 SSRF 일반 방어를 해제하지 않는다. 큐/백오프/서킷브레이커, 마지막 성공 시각을 도입하고 장애 시 가짜 최신 뉴스가 보이지 않게 한다.
- **G675-04 기능 실재성:** 보이는 모든 CTA를 화면→BFF→Nest→DB/작업자→기능 스위치→테스트로 매핑하고 미구현/관리자전용/오류/빈 데이터 상태를 정확히 표시한다.
- **G675-05 콘텐츠/SEO:** 복제·저품질 페이지와 허위 날짜/구조화 데이터 차단. 사이트맵 제출이나 API 호출을 색인 성공으로 표시하지 않는다.
- **G675-06 법률/광고:** 카지노 스위치가 켜져 있어도 법률 및 자격증명으로 허용 상태를 증명하기 전에는 운영 정합성을 선언하지 않는다. 현금 수익화는 기존 적격 광고 범위로 유지한다.

## 4. 기존 기능과 중복되지 않는 신규·확장 기능 후보

아래 항목은 **신규 기능 제안(PLANNING)**이다. 세부 개발 착수에는 기능 담당자, 독립 브랜치, API/DB·UX 명세, 테스트가 별도 필요하다.

| ID / 우선순위 | 기능 추가 방향 | 최소 화면·서버 계약 | 성과·수용 검증 |
|---|---|---|---|
| **F675-01 P0** | **기능 실재성 관리대장:** 운영자가 어떤 화면 버튼이 어떤 API/DB와 연결되는지 상태 조회 | 빌드 시 라우트→동작→BFF→Nest→DB/작업자→스위치·테스트·담당자 자동 대조; 관리자만 민감정보 확인; v397/v530 연계 | 공개된 실제 버튼 매핑 100%, 허위 성공 0, 오류 경로 추적 |
| **F675-02 P0** | **AI 시장뉴스 상태·정정 관리:** 사용자 뉴스 신선도 표시 및 관리자 재처리 | 생성/검토/공개/이벤트 각 상태 분리, 모델·출처·공개/만료 시각, 실패/지연 고지, 편집자 감사기록 | 장애 중 최신 표기 0, 마지막 성공 시점 확인 가능 |
| **F675-03 P1** | **지갑 변동 사유 설명:** WLD 거래별 원장 추적 영수증 | 읽기 전용 사용자 한정 DB 함수, 정수 문자열/BigInt, 보상·주식·송금·정정 연결, 타 사용자 정보 비공개 | 영수증과 원장 금액 정확히 일치, 권한 우회 실패 |
| **F675-04 P1** | **기존 계산기 결과→가이드→선택형 게임 동선:** 유사 URL 중복 없이 통합 | 공식/출처·적용국가·기준일·가정·버전, 공유가능한 프리셋, 교육용 설명, 게임 수치·실제 수치 구별 | 계산 결과 정확성, 다음 유용한 행동·자발적 가입 측정 |
| **F675-05 P1** | **첫 이용 안내 다음 행동 3개:** 기존 온보딩을 실제 동작 가능 기능으로 연결 | 서버가 현재 이용 가능한 작업만 제안, 잠금/로딩/오류/완료 상태, 허위 WLD 보상·강제 출석 금지 | 첫 가치 달성·D1/D7·완료율, 5xx 악화 없음 |
| **F675-06 P1** | **검색 증거·캐노니컬 관리센터:** 현재 관리자 SEO 화면 확장 | GSC 쿼리·페이지·국가·기기 샘플, 할당량·캐시, sitemap/canonical/hreflang 대조, 제출/크롤링/색인/클릭 상태 분리 | 테스트/관리자 색인 URL 0, 캐노니컬 오류·실제 유입 개선 |
| **F675-07 P1** | **국가·언어 사용자 선택 고도화:** 검색엔진에 친화적인 다국어 동선 | 국가·브라우저 언어는 제안에 사용 가능; 사용자 선택 우선·유지, IP 강제이동 금지, 품질 통과 번역 페이지만 hreflang | 모든 언어 URL 접근, 혼합언어·리다이렉트 반복 0 |
| **F675-08 P2** | **경제 정책 변화 투명 타임라인:** 실제 적용·예정·모의실험 명확히 구별 | 정책 버전·적용일·근거 공개, 읽기 전용 영향 해설, 자율발행·보장수익 표현 금지 | 변경 이력 추적, 공급량 불변 |
| **F675-09 P2** | **AI 블로그·뉴스 편집 승인함:** 저작·출처·수정 기록 관리 | 초안→사실/가상 검토→발행→정정/철회, 저작권 확인·편집자 표기·중복실행 방지 | 승인되지 않은 자동 공개 0, 정정 이력 보존 |

### 이번 문서에서 채택한 범위

- **채택:** 우선순위, 운영 상태의 사실성, 증거·수용 기준 및 구현 선후 관계.
- **미승인:** 실제 DB/스키마 변경, 신규 WLD 생성/이동, 자동 뉴스 발행 확대, 실금융 자문, 결제, 개인 위치 추적, 국가별 강제 리다이렉트.
- F675 제안은 모두 **PLANNING**이고 인력·기간·효과 수치의 실측 기반이 없다.

## 5. 실행 순서와 중단 규칙

**0단계 안정화:** P0 원장·DB 권한·출시 신원·AI 뉴스·API/버튼 허위 성공·관리자 전체 UI를 먼저 고친다. 동일 SHA Test·원장 보존·세션·롤백 증거 없으면 다음 신규 기능 출시를 중단한다.

**1단계 사용자 가치:** F675-01/02의 가동 사실 표시, F675-03 거래 영수증, F675-04 유용한 교육 계산기를 진행한다. 정상·권한없음·오래된 데이터·모바일·키보드 상태를 함께 테스트한다.

**2단계 SEO·유지율:** F675-05 첫 사용 동선, F675-06 Search Console 운영 사실성, F675-07 국가·언어 동선. 실제 Search Console 데이터를 기준으로 출시 성과를 측정하며 색인 보장은 금지한다.

**3단계 차별화:** 법률·경제·콘텐츠 게이트를 통과한 이후에만 F675-08/09의 투명성·편집관리 확장을 검토한다.

기본 측정항목: URL·언어·기기·이용자 그룹별 정상 응답/실제 기능 완료/첫 가치/D1·D7·D30, 검색 노출→클릭→두 번째 유용한 행동, 적격 광고 Page RPM, 적법하게 색인 가능한 URL 수, Core Web Vitals p75, 원장 보존·권한 우회 차단. 미측정 성과는 반드시 **UNKNOWN**으로 기록한다. P0 회귀가 발생하면 기능 단위로 중단하고 로그 및 롤백 근거를 남긴다.

## 6. 공식 1차 레퍼런스 (2026-10-15 확인)

| ID | 레퍼런스 | 기획 반영 |
|---|---|---|
| R675-01 | [Google 사용자 우선 유용한 콘텐츠](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | 복제 대량 URL보다 실제 효용 |
| R675-02 | [Google 다국어/다지역](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) | 언어별 URL·hreflang·사용자 선택 |
| R675-03 | [Google 사이트맵](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) | 발견 지원≠색인 보장 |
| R675-04 | [Google 구조화 데이터 정책](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | 화면에 표시되는 진짜 콘텐츠/날짜 |
| R675-05 | [Google Search Console API 사용량 제한](https://developers.google.com/webmaster-tools/limits) | 요청량 제한·캐시·불완전한 샘플 고지 |
| R675-06 | [web.dev Core Web Vitals](https://web.dev/articles/vitals) | 모바일 현장 p75 LCP 2.5초 이내·INP 200ms 이내·CLS 0.1 이하 |
| R675-07 | [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | 터치 크기·키보드 포커스 가림 |
| R675-08 | [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/master/5.0/en) | 인증·권한·경계 검증 기준 |
| R675-09 | [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) | 인증 수준별 재인증·세션 |
| R675-10 | [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) | 모델·출처·편집·감사·오류 관리 |
| R675-11 | [Google News 투명성](https://support.google.com/news/publisher-center/answer/6204050) | 기고자·발행일·발행자·정정 정보 |
| R675-12 | [PostgreSQL 잠금](https://www.postgresql.org/docs/17/explicit-locking.html) | 트랜잭션/세션 잠금 의미 구별 |
| R675-13 | [Search Console 데이터 내보내기](https://support.google.com/webmasters/answer/12919192) | API 추출 데이터≠색인 전체 목록 |

레퍼런스는 안전한 설계 판단을 위한 근거일 뿐 실제 서비스 배포, 검색순위 상승, 애드센스 승인, 외부데이터 이용권 또는 대한민국 법률 적합성의 증거가 아니다. 구현 직전에 최신 규정을 다시 확인한다.

## 7. 후속 구현 검증 및 작업 기록

F675 채택 시 각각: 기존 유사 기능 점검 → 담당자·정식 명세 → 화면/API/DB 읽기·쓰기 계약 → 인증·오류 화면 → BigInt·재정 안전성 → EN/KO 및 번역 품질 → 격리 테스트 → 개인정보/SEO/광고 정책 → 동일 SHA 테스트·무중단·세션·롤백 증빙 → 상태 갱신을 필수로 한다.

본 v675은 **기획과 레퍼런스 반영 전용**이며 소스 수정, Test/Production 승격은 하지 않는다. [작업 기록](../worklog/2026-10-15-integrated-planning-review-v675.ko.md)과 내부·GitHub 업데이트 기록을 참조한다.
