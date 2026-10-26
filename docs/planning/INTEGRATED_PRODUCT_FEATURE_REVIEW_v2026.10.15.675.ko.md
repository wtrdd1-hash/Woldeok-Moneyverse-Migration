## v1334 — F675-140 문의 검색 개인정보·커서 무결성 (기능 보완 / 초안 / 보류)
**QA 확인 01:16 KST:** QA v1304 진행 중(확인 시 install 게이트만 완료); v1303이 최신 완료 근거이며 v1304 PASS 추정 금지.
- 이전 추가 v1332 → 현재 보완 v1334 → 다음 추가 v1336, main 0fe614b2ca1a7bc0df540514e54db78130479e2a 시작·중간 확인. v1332 #1468 미병합, 런타임 변경 없음.
- 미구현 GET 검색어 URL 누출 설계를 CSRF 보호 읽기 전용 POST JSON 검색으로 정정하고 기존 GET 목록 유지. 실제 세션 필드는 id이며 session_generation은 없음. 제목 NFC·영문 ASCII 대소문자·LIKE 문자 이스케이프, 한국 날짜→UTC 반열림, 15분 본인/세션/필터/상한 결합 서명 키셋, 상태 변동은 실시간임을 고지, ?thread 독립 본인 확인.
- P0 ENV1334-01 SEC1334-02 REL1334-03 SUP1334-04; P1 SUP1334-05 SUP1334-06 SUP1334-07 SUP1334-08 SUP1334-09 SUP1334-10. QA v1303 전체 감사/봇/경로 원장 FAIL, 개발 DB 앱 DML 235/241, PUBLIC SECDEF 3, #1469 마이그레이션 5개 체크섬 불일치, 루트98%. 격리 10,001건·타인100건, DB 쓰기0, Android/WCAG/SEO/관리자 k>=20, 정확 SHA Test·롤백. 외부 근거 신규0, 누적 UNKNOWN/10,000 BLOCKED. 통합 기획서에 상세.


## v1332 — F675-140 회원 문의 이력 검색 (기능 추가, 초안/HOLD)
- 이전 보완 v1330 → 현재 추가 v1332 → 다음 보완 v1334, main `0fe614b2ca1a7bc0df540514e54db78130479e2a` 시작·중간 확인, 개발 이슈 [#1467](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1467), 미병합 v1330 #1461 기반.
- 실제 /support에는 검색·더보기 없고 Migration196 회원 목록 기본 50/최대 100건. 본인만 **제목 문자 그대로 검색**, 상태/기간 필터, 생성일 키셋 20/최대50, 본문 색인 제외; 세션/동의·SECDEF·GET 쓰기 0·noindex/no-store·Android/접근성·관리자 k>=20 집계. 운영 장애 확정 아님.
- P0 ENV1332-01 SEC1332-02 REL1332-03 SUP1332-04; P1 SUP1332-05 SUP1332-06 SUP1332-07 SUP1332-08 SUP1332-09 SUP1332-10. 격리 PG 10,001건, 타 회원 100회, 한글/와일드카드/커서 검증, 정확 SHA Test/롤백.
- QA v1302 1,423건 통과, 전체 감사 Critical2/High8·봇/라우트-원장 FAIL, 개발 DB 권한 235/241·PUBLIC 은행 3·Migration266 불일치, 루트 99%, RELEASE HOLD. 외부 10,000건 신규 승인 0·누적 UNKNOWN/BLOCKED. 영문·국문 통합 기획서에 상세 명세.

## v1330 — F675-139 문의 임시글 전송 의도 무결성 (기능 보완, 초안/HOLD)
- 이전 추가 v1328 → 현재 보완 v1330 → 다음 추가 v1332. 최신 main `0fe614b2ca1a7bc0df540514e54db78130479e2a` 시작·중간 확인; v1328 Draft #1457은 #1452 위 적층, 런타임 변경 없음.
- 근거: Next.js 문의 액션·위젯은 매 전송 새 UUID, Migration196 기존 문의 생성 재시도는 원래 내용 일치 미확인, 답장 SELECT/INSERT 경합에서 23505 가능. 명시적 서버 임시글, 안정적 전송 의도·서버 내용 digest, 본인 API·CAS/ETag, SECDEF 메시지·영수증·tombstone 원자성, 동일 의도 안전 재조회, 내용 변경 시 충돌, 웹/위젯 텍스트 전용/Android, WCAG·개인정보·SEO·관리자 k>=20, 기본 OFF.
- P0 ENV1330-01 SEC1330-02 REL1330-03 SUP1330-04; P1 SUP1330-05 SUP1330-06 SUP1330-07 SUP1330-08 SUP1330-09 SUP1330-10. 격리 DB 동일 의도 100·다른 의도 100·타 회원 100·합성 10,001·커밋 후 응답 유실·감사 실패·정확 SHA Test.
- QA v1301 1,423건 통과, 전체 감사 Critical2/High8 실패; DB 앱 DML 235/241·PUBLIC 은행 3·Migration266 불일치, 루트 98%, 공식 Test 미검증, 운영 보류. 외부 10,000건 신규 승인 0·누적 UNKNOWN/BLOCKED. 상세 명세 INTEGRATED_PLANNING_MASTER.md 및 국문 문서.


# 머니버스 통합 제품·기능 포트폴리오 재검토 — v2026.10.15.675
- Draft PR / 기획 초안: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1457 (stacked on #1452; no main merge). Engineering issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1456
- 최신 main 추가 근거: frontend/src/components/floating-support-chat-widget.tsx도 /app-api/v1/support/threads 및 답장을 전송하며, 답장 텍스트를 fetch 전에 지우고 처리된 오류에서만 복구하므로 응답 불명/창 닫힘 시 유실 위험을 설계에 반영. 위젯에는 이미지 URL 첨부가 있으나 v1328 임시글은 **텍스트 전용**으로, 첨부를 몰래 제거·저장·복구한 척하지 않음. 텍스트만 저장 CTA 제공(또는 /support 안내), 기존 첨부 전송은 보존. localStorage 음소거 설정은 임시글 보관이 아님. /support·플로팅 위젯·Android 모두 회귀 검증.

## F675-139 / v1328 — 회원 문의 임시저장 복구·안전 전송 검토 (초안 / 운영 보류)
- 이전 보완 v1326 → 현재 추가 v1328 → 다음 보완 v1330(잠정). 최신 main 0fe614b2ca1a7bc0df540514e54db78130479e2a가 변경되어 이전 main QA v1299를 새 SHA 승인 근거로 사용 금지. 실제 /support 즉시 전송과 Migration196에 임시글 보관 기능 없음.
- 회원 본인 명시적 저장/삭제/전송만 허용, 자동저장·허위 전송 표시 금지. NEW/REPLY 본인 임시글, CAS/묘비/불변 전송 영수증, 계정 간 캐시 차단. NestJS API/SECURITY DEFINER DB, 제안 보관 30일·20개 상한, 동시 100건·합성 10,001건, Android·WCAG·개인정보·관리자 k>=20·SEO noindex·기본 OFF·롤백. 세부 계약은 국영문 통합 마스터.
- P0 4/P1 6: ENV1328-01 SEC1328-02 REL1328-03 SUP1328-04 SUP1328-05 SUP1328-06 SUP1328-07 SUP1328-08 SUP1328-09 SUP1328-10. v1326 PR #1452 미병합·최신 main 분기, 문서만 적층. QA/DB 권한/Migration266/공식 Test/복원 차단. 외부 신규 승인 0건, 누적 UNKNOWN/10,000; 구현·운영승격 승인 아님.

- **v1326 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1452 (선행 #1449 미병합 기반; DRAFT / RELEASE HOLD). **개발:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1448.
## v1326 — F675-138 문의 종료·최신 답변 표시 무결성 (기능 보완 / DRAFT / RELEASE HOLD)
- 이전 추가 v1324 → 현재 보완 v1326 → 다음 추가 v1328(잠정), main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 재확인, 선행 Draft #1449 미병합. Migration196 오래된 순 메시지200건과 반복 resolved UPDATE는 최신 답변 누락·종료 이벤트 중복 위험이지만 운영 장애 확증은 아님.
- 본인 명시적 확인은 최신 관리자 답변 또는 명시적인 답변 없는 종료 카드가 서버에서 전달된 경우에만 가능. 600초 이하 회원/세션/문의/이벤트/revision/마지막 답변 HMAC은 표시 자격 증명이지 사람의 읽음 증거가 아님. 부분·과거·503·구회차를 확인 완료로 표시 금지. 실제 종료 전환만 이벤트1건, 반복 resolved no-op, 재개·재종료 신규 회차; 문의 행 우선 잠금·잠금 후 멱등 해시·감사 원자성·추가형 구함수 호환 SECDEF 최소권한.
- P0 4/P1 6: ENV1326-01 SEC1326-02 REL1326-03 SUP1326-04 SUP1326-05 SUP1326-06 SUP1326-07 SUP1326-08 SUP1326-09 SUP1326-10. 본인 GET/POST·키셋·Android/SEO/WCAG·관리자 고정 코호트 k>=20·격리 PG 201/501/10,001·100동시·기능 OFF 롤백은 국영문 통합 마스터. QA1299 진행 중 main 프론트6 실패·감사 FAIL, 루트99%, DB 권한/Migration266/Test/복원 HOLD. 외부10k 신규0·누적 UNKNOWN. 런타임·배포 없음, 개발 #1448.

- **v1318 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1420 (선행 #1416 미병합 기반, 운영 보류). **개발 이슈:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1415.

## v1318 — F675-136 관리자 답변 확인 무결성 (기능 보완 / DRAFT / HOLD)
- 이전 추가 v1316 / 현재 보완 v1318 / 다음 추가 v1320, main 1c5b84a1c45baafcca83f375a6f99698121e9bb5·선행 Draft #1416. Migration196 오래된 메시지200/최대500·문의50/최대100으로 `/support` 누락. 개발 DB 문의3·메시지6·관리자 답변2·200건 초과0, 운영 장애 확증 아님.
- 본인 v2 최신 메시지+활성화 이후 연속 관리자 seq, 명시적 CTA·600초 세션 HMAC·CAS 불변 영수증, 과거 UNKNOWN·프리페치 자동 읽음 금지·부분/503≠0·필터 변경 재조회. 문의 행 잠금 v2 답변/이벤트/상태/감사 원자성·기능 OFF 구형 복귀, SECURITY DEFINER/PUBLIC 회수, Android/WCAG/noindex/no-store·관리자 k>=20.
- P0/P1 ID: ENV1318-01 SEC1318-02 REL1318-03 SUP1318-04 SUP1318-05 SUP1318-06 SUP1318-07 SUP1318-08 SUP1318-09 SUP1318-10. 합성 201/501/10,001·100동시/BOLA·599/600/601초·롤백. QA v1293 실패/보류 main 프론트6실패·감사·앱 DML235/241·PUBLIC 은행3·Migration266·Test/복원 미완료·루트97%. 외부 10k 신규0·누적 UNKNOWN, BLOCKED/IN PROGRESS. 배포 없음.

- **v1316 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1416 (선행 #1411 미병합 기반, 운영 보류). **개발 이슈:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1415.
## v1316 — F675-136 회원 관리자 답변 확인 표시 (기능 추가 / DRAFT / HOLD)
- 이전 기능 보완 v1314 / 현재 기능 추가 v1316 / 다음 기능 보완 v1318(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 재확인, 선행 Draft #1411 미병합. 문서만 변경.
- Migration196·문의 화면·NestJS·관리자 콘솔은 문의/메시지/상태만 제공하며 회원 읽음 기준점이 없다. F675-127 대화록과 분리. 실제 저장된 새 관리자 답변만 표시하고, 과거 확인 상태는 UNKNOWN; GET/프리페치 자동 확인 금지.
- 본인 GET 목록·상세/POST 확인, 10분 서명 표시 증명·CSRF·세션·동의·단조 증가 CAS/멱등, 401/404/409/412/428/429/503, Android 동등성. 추가형 관리자 답변 이벤트·기준점·불변 영수증·원자 커밋, PUBLIC/직접 테이블 권한 금지. 관리자 k>=20·SEO·접근성·KPI·격리 100동시/10,001행·기본 OFF 상세는 국영문 마스터.
- P0/P1: ENV1316-01 SEC1316-02 REL1316-03 SUP1316-04 SUP1316-05 SUP1316-06 SUP1316-07 SUP1316-08 SUP1316-09 SUP1316-10. QA v1292 FAILED/HOLD, 루트 96%, DB 권한·Migration266·프론트6 실패·보안 감사·정확 SHA Test/복원 미해결. 외부 신규 승인0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 개발 #1415.

- **v1314 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1411 (미병합 #1407 기반, 운영 보류). **개발 이슈:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1406.

## v1314 — F675-135 개인정보 사건 무결성 보완 (DRAFT / HOLD)
- 이전 기능 추가 v1312 / 현재 기능 보완 v1314 / 다음 기능 추가 v1316(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 확인; 미병합 Draft #1407 후속 문서 전용.
- main의 admin_role에는 privacy_officer가 없고 Migration057은 일반 2인 승인 기능을 폐기했다. AdminGuard의 임의 역할 및 ReauthGuard 900초는 전담자 독립 승인·민감 처분 600초 요건을 충족하지 않는다. 앱 DB 계정이 넘긴 UUID는 DB 인증 신원이 아니므로 P0 권한/세션 결합·위조 거부 검증 필요.
- Migration015 원본 received 영수증 보존. 신규 접수 트리거 + 최대500건 멱등 소급 배치, 기능 ON 전 anti-join 누락 0; 사건 미생성은 RECEIVED_NOT_TRIAGED, 503은 빈 목록 아님. 실제 증빙·서로 다른 2인 승인, CAS/멱등/감사 원자성, 회원/관리자/Android API, HMAC 커서, SEO/no-store, WCAG/KPI·롤백은 국영문 통합 마스터 명세.
- P0 4/P1 6: ENV1314-01 SEC1314-02 REL1314-03 PRIV1314-04 PRIV1314-05 PRIV1314-06 PRIV1314-07 PRIV1314-08 PRIV1314-09 PRIV1314-10. QA v1291 main 실패/보류(프론트 1,397 통과/6 실패, 운영 High2, 전체 Critical2/High10, main CI 실패), 루트 95%/약4.8GiB, 데이터 83%/약33GiB. 독립 외부 근거 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 런타임·DB·Test·운영 변경 없음.

- **v1312 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1407 (미병합 #1402 기반, 운영 보류). **개발 이슈:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1406.

## F675-135 — v1312 개인정보 요청 검토·진행 현황 (기능 추가 / DRAFT / HOLD)
- 근거: main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 Migration015는 received 접수 상태만 저장, 회원 GET/POST만 제공하고 관리자 대기열이 없다. 일반 AdminGuard만으로 개인정보 담당 권한을 증명하지 못한다. 접수는 실제 이행·법적 준수 증거가 아니다.
- 제안: 본인 사건 타임라인, 개인정보 담당자 전용 대기열, 서로 다른 2인의 증빙 기반 이행 승인, 추가형 이벤트·멱등 영수증, CAS/CSRF/재인증, 503와 빈 목록 구분, 서명 마이크로초 커서, Android/접근성/SEO/관리자 집계, 순방향 DB·정확 SHA Test·롤백. 상세 국영문 통합 마스터 참조, 기능 OFF.
- 백로그 P0 4/P1 6: ENV1312-01 SEC1312-02 REL1312-03 PRIV1312-04 PRIV1312-05 PRIV1312-06 PRIV1312-07 PRIV1312-08 PRIV1312-09 PRIV1312-10. QA v1290 FAILED/HOLD, 루트 95%, 프론트 6건 실패, 보안 감사·DB ACL·Migration266·복원 차단. 신규 외부 승인 0건, 누적 UNKNOWN/10,000 BLOCKED. 런타임·DB·원장 변경 없음.

- v1310 planning Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1402 (stacked on unmerged #1399; RELEASE HOLD). Engineering handoff: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1398#issuecomment-6406659364 ; capacity: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170#issuecomment-6406659793 .

## F675-134 / v1310 — 보안 활동 보관함 무결성 (기능 보완 / 초안 / 보류)
- Backlog IDs / 백로그 ID: ENV1310-01 SEC1310-02 REL1310-03 AUTH1310-04 AUTH1310-05 AUTH1310-06 AUTH1310-07 AUTH1310-08 AUTH1310-09 AUTH1310-10
- 이전 기능 추가 v1308 / 현재 기능 보완 v1310 / 다음 기능 추가 v1312(잠정); main 1c5b84a1c45baafcca83f375a6f99698121e9bb5, Draft #1399 기반, 문서만 변경.
- 실제 공통 ReauthGuard 900초와 CSV 600초 요구 불일치: 내보내기 전용 600초 검사·응답 직전 재확인·세션/CSRF 경합 음성 테스트. Migration214 반환 type/time·최대50건 유지, 새 버전형 읽기 함수. UI apiOrNull 장애는 정상 빈 목록이 아니다. 로컬 이메일 기록은 OAuth/전체 로그인·로그아웃 증거가 아니며 합성·metadata 노출 금지.
- API: PG 마이크로초 HMAC 서명 커서(세션/필터/15분), POST CSV 5천/2MiB/30초·헤더 전 완성·실제 바이트 SHA-256·재인증 600초·감사 실패 폐기. P0 ENV1310-01 SEC1310-02 REL1310-03 AUTH1310-04, P1 AUTH1310-05~10. 세부 명세 영문·국문 통합 마스터. QA v1289 실패/보류, 루트 94%/6.5GiB로 회복 중이나 P0, 정확 SHA Test/복원 미검증. 외부 신규 승인0·누적 UNKNOWN/10,000 BLOCKED.

- v1308 planning Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1399 (stacked on unmerged #1394; RELEASE HOLD).
- v1308 engineering handoff: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1398; capacity #1170.

## F675-134 / v1308 — 회원 보안 활동 보관함 (기능 추가 / 초안 / 보류)
- 이전 기능 보완 v1306 / 현재 기능 추가 v1308 / 다음 기능 보완 v1310. main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 동일. UI 5/20, migration214 최대50·UUID 없음, 개발 DB 41건/3명, 전체 인증 이력 아님. 본인 필터·재인증+CSRF CSV·마이크로초 서명 커서·정상 빈 결과/503 구분·SECDEF·metadata 제외·Android·접근성. F675-132/F675-131과 분리.
- P0 ENV1308-01 용량, SEC1308-02 행위자/권한, REL1308-03 정확 SHA QA, AUTH1308-04 출처 정직성. P1 AUTH1308-05 DB, AUTH1308-06 커서, AUTH1308-07 CSV, AUTH1308-08 웹/모바일, AUTH1308-09 개인정보·관리자·SEO·KPI, AUTH1308-10 격리 회귀. ID: ENV1308-01 SEC1308-02 REL1308-03 AUTH1308-04 AUTH1308-05 AUTH1308-06 AUTH1308-07 AUTH1308-08 AUTH1308-09 AUTH1308-10.
- QA v1288 실패/보류, 루트 100% 약 466MiB, 프론트 6 실패·감사·앱 DML 235/241·PUBLIC 은행 함수 3·migration266 불일치·Test/복원 차단. 외부 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED. 문서만, 플래그 OFF.

- v1306 planning Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1394 (stacked on unmerged #1390; RELEASE HOLD).
- v1306 engineering handoff: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1389 (comment 6405355387).

## F675-133 / v1306 — 구형·신규 구매 영수증 무결성 검토 (기능 보완 / 초안 / 보류)
- 이전 추가 v1304 / 현재 보완 v1306 / 다음 추가 v1308(잠정). main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 동일, 선행 Draft #1390 미병합, 개발 구현과 분리.
- **P0:** ENV1306-01 루트 100%·608MiB, SEC1306-02 개발 DB 앱 DML 235/241·PUBLIC 은행 함수 3개, REL1306-03 QA v1287 실패·정확 SHA Test/복원 미검증, SHP1306-04 허위 빈 목록·원장/할인 오인 차단. **P1:** SHP1306-05 본인 통합 LEFT JOIN, SHP1306-06 NUMERIC 금액·원장 증빙, SHP1306-07 마이크로초 커서·backfill 안내, SHP1306-08 Nest/Next/Android, SHP1306-09 개인정보/접근성/관리/SEO/KPI, SHP1306-10 격리 PG 회귀·롤백.
- 근거: 구형 INNER JOIN·nullable 금액, Store 2.0 할인 반영 단가, 원장 NUMERIC·소문자 방향, 개발 DB 구형 0/신규 6·6건 금액/행위자/유형 일치(운영 검증 아님). 거래 FK만으로 원장 대사 완료, p_actor만으로 DB 인증, cutoff만으로 페이지 간 동일 스냅샷을 주장하지 않는다. 영문·국문 통합 마스터에 상세 명세. 외부 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED, 기능 기본 OFF·런타임 변경 없음.
- 백로그 ID: ENV1306-01 SEC1306-02 REL1306-03 SHP1306-04 SHP1306-05 SHP1306-06 SHP1306-07 SHP1306-08 SHP1306-09 SHP1306-10

- v1304 planning Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1390 (stacked on unmerged #1384; DRAFT / RELEASE HOLD).
- v1304 engineering issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1389

## 기획 v1304 — F675-133 구형·Store 2.0 구매 영수증 통합 조회 (기능 추가 / 초안 / 보류)
- 이전 보완 v1302 → 현재 추가 v1304 → 다음 보완 v1306(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 동일, 선행 Draft #1384 미병합. 문서 기획만 진행하며 런타임·DB·원장·WLD·Test·Production 변경 없음.
- main의 `MyReceipts`는 `/shop`에 연결되지 않았고 구형 `/api/v1/shop/purchases`는 `public.purchases` 최신 30건만 조회하며 Next BFF는 오류를 200/빈 목록으로 숨긴다. Store 2.0 `shop_purchases`는 별개. 회원 전용 `/account/shop/purchases` 양쪽 출처, 정확한 금액 문자열, 출처 표시, 진실한 빈 목록/장애, 서명 커서·상세를 설계한다. 현재 상품명은 과거 이름이 아니다. 개발 A 미병합 구형 이력 Draft #1258과 조율.
- P0 ENV1304-01 SEC1304-02 REL1304-03 SHP1304-04; P1 SHP1304-05 SHP1304-06 SHP1304-07 SHP1304-08 SHP1304-09 SHP1304-10. UI/API/DB/보안/SEO/Android/접근성/KPI/격리 PG/롤백은 영문 통합 마스터와 동등한 한국어 마스터에 상세 명세. QA v1286 실패/보류(프론트 6건, 보안 감사), 루트 100% 약 737MiB; 정확 SHA Test·복원·DB 권한 검증 차단. 외부 발행기관 3곳 검토, 신규 승인 0건·누적 UNKNOWN/10,000 BLOCKED.

- **v1302 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1384 (stacked on unmerged #1379; documentation only, DRAFT / RELEASE HOLD).

## 기획 v1302 — F675-132 세션 별칭 계약 무결성 보완 (기능 보완 / 초안 / 운영 보류)
- 이전 기능 추가 v1300 → 현재 기능 보완 v1302 → 다음 기능 추가 v1304(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 확인, 선행 Draft #1379 미병합, Gemini/A/B/C/QA 코드 변경 없음.
- Migration 213의 7열 account_active_sessions는 기존 반환형 직접 확장이 불가하므로 v2/보조 함수와 v1 롤백을 명세. 보안 화면의 추정 deviceLabel 아이콘과 API 실패의 허위 빈 목록을 바로잡도록 설계. 기존 세션 철회 UPDATE 및 auth_sessions 앱 UPDATE 권한을 고려해 행 잠금·행위자 신뢰 경계를 별도 검증.
- PUT JSON 별칭/본문 없는 DELETE 모두 If-Match·Idempotency-Key, 428/412/409/404/410/429/503, 커밋 후 ETag, NULL 버전 묘비, 재시도 재인증, 동시 변경 100건·타 회원 100건·철회 경합 테스트, Android 헤더, no-store/noindex, WCAG AA, k≥20 관리자 집계. 영문·국문 통합 마스터에 전체 구현 조건 수록.
- P0 ENV1302-01 SEC1302-02 REL1302-03 AUTH1302-04; P1 AUTH1302-05 AUTH1302-06 AUTH1302-07 AUTH1302-08 AUTH1302-09 AUTH1302-10. **백로그 ID:** ENV1302-01 SEC1302-02 REL1302-03 AUTH1302-04 AUTH1302-05 AUTH1302-06 AUTH1302-07 AUTH1302-08 AUTH1302-09 AUTH1302-10. QA v1285 FAILED/HOLD, 루트 100%/약 786MiB, 프론트 1397 통과/6 실패, 보안 감사 실패, 정확 SHA Test/복원 미검증. 외부 승인 신규 0건, 누적 UNKNOWN/10,000 BLOCKED. 기능 OFF·문서만 변경·운영 보류.

- **v1300 기획 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1379 (선행 #1371 미병합, 문서만 변경, 운영 승격 보류).
## 기획 v1300 — F675-132 회원 로그인 세션 별칭 (기능 추가 / DRAFT / HOLD)
- 이전 보완 v1298 / 현재 추가 v1300 / 다음 보완 v1302(잠정). 원격 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간 확인. 선행 기획 Draft #1371 미병합, 개발 이슈 https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1378; A/B/C/Gemini/QA 코드 수정 없음.
- 실제 main의 `/account/security`는 이미 회원 세션/보안 이벤트 조회·CSRF/재인증 세션 철회를 제공한다. Migration 213의 `deviceLabel`은 UA 기반 **추정** 기기명이며 실제 기기 인증이 아니다. 직접 편집하는 회원 별칭 저장 API는 확인되지 않았다.
- 기존 세션 행에 편집/초기화 CTA, NFC 40그래핌/160바이트, 서버 확인 후 성공·충돌·만료·오프라인 상태. GET 필드 확장, 본인 전용 PUT/DELETE, CAS/멱등성/단조 리비전 tombstone, SECDEF DB·앱 직접 DML 금지, 시간당 10건, 개인정보·계정 삭제, noindex/no-store, Android·WCAG AA, 관리자 표본 20명 이상 통계·KPI·롤백. 세션 권한/철회 및 WLD는 변경하지 않는다. 세부 명세는 영문·국문 통합 마스터.
- P0 ENV1300-01 SEC1300-02 REL1300-03 AUTH1300-04; P1 AUTH1300-05 AUTH1300-06 AUTH1300-07 AUTH1300-08 AUTH1300-09 AUTH1300-10. **백로그 ID:** ENV1300-01 SEC1300-02 REL1300-03 AUTH1300-04 AUTH1300-05 AUTH1300-06 AUTH1300-07 AUTH1300-08 AUTH1300-09 AUTH1300-10.
- QA v1284 FAILED/HOLD(프론트 1,397/6, 운영 High 2, 전체 Critical 2/High 10, 루트 99%); 정확 SHA Test/격리 복원 미입증. 외부 독립 근거 신규 승인 0·누적 UNKNOWN/10,000 BLOCKED. 기능 OFF·기획만 수행·운영 승격 금지.

## v2026.10.26.1298 — F675-131 알림 보관함 CSV 무결성 보완 (기능 보완 / DRAFT / HOLD)
- **회차:** 이전 기능 추가 v1296 → 현재 기능 보완 v1298 → 다음 기능 추가 v1300(잠정). main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, 영문 정본·한국어 동등 문서. Draft #1364 기반 문서만 수정, 개발 A/B/C/Gemini/QA 런타임 변경 금지.
- **main 근거:** 알림 회원 필터 직접 SELECT가 OFFSET/생성시각 단독 정렬·dedupe_key 반환·불리언 변환을 사용하며 CSV API는 미구현. 개발 B #1356 페이징 수정과 분리, 운영 사고 단정 금지.
- **계약 보완:** 5,000행/2MiB/30초 CSV를 **HTTP 헤더 전** 완성·검증하고 초과 시 부분 바이트 없이 413. 0건 헤더만, 고정 열/CRLF/BOM 없는 UTF-8/UTC/NULL, 정확 전송 바이트 SHA-256·크기. 셀 단위 수식 방어를 RFC4180 직렬화 전 수행, 변환 셀 수와 원문 비동등성 고지. SHA는 DB 진실을 보증하는 서명이 아니다. 단일 연결 READ ONLY REPEATABLE READ 내보내기, 여러 페이지는 BEST_EFFORT. 세션·동의·CSRF·최소권한·BOLA, no-store/noindex, Android/WCAG AA, 관리자 k>=20, 회원당 시간당 3회.
- **P0:** ENV1298-01 용량/복원; SEC1298-02 권한/본인/CSRF; REL1298-03 QA/정확 SHA Test; ARC1298-04 실제 출처/허위 성공/부분 응답 방지.
- **P1:** ARC1298-05 필터/CSV; ARC1298-06 MVCC/커서; ARC1298-07 제한 바이트/수식/해시; ARC1298-08 API·웹·Android·접근성; ARC1298-09 개인정보·관리자·SEO·KPI; ARC1298-10 격리 DB 100경합/100타인/10,001행·413/중단/롤백.
- **백로그 ID:** ENV1298-01 SEC1298-02 REL1298-03 ARC1298-04 ARC1298-05 ARC1298-06 ARC1298-07 ARC1298-08 ARC1298-09 ARC1298-10.
- **QA v1283:** 프론트 1,397통과/6실패, 전체 감사 Critical 2/High 10, 운영 High 2, 루트 99%/1.2GiB. 정확 SHA Test·복원 미입증, 승격 HOLD. 외부 근거 신규 승인 0/누적 UNKNOWN·10,000 BLOCKED. 스위치 OFF·배포 없음.
## 기획 v1296 — F675-131 신규 기능: 검증형 알림 보관함 검색·CSV (DRAFT/HOLD)
- 본인 DB 원본 알림만 기간·분류·읽음 검색, UUID 안정 커서와 정직한 일관성 표시, 단일 트랜잭션 CSV·정확 바이트 SHA-256. 5,000건/2MiB/30초 초과 시 부분 파일 없이 413, RFC4180·수식 삽입 방어. 모의 알림/localStorage 알림 제외, 개발 DB 현재 0건·분류/전달 증거 없음. 개발 B #1356 기존 페이징 수정과 분리, A/C/QA 미변경.
- P0 ENV1296-01 SEC1296-02 REL1296-03 ARC1296-04; P1 ARC1296-05 ARC1296-06 ARC1296-07 ARC1296-08 ARC1296-09 ARC1296-10. 본인·동의·CSRF, Next.js/Android, no-store/noindex, 관리자 k>=20, WCAG AA, 격리 실DB 100 경합/100 타인/10,001 합성, 기본 OFF·정확 SHA Test/GitOps. 루트 99%/1.4GiB, 감사·프론트·Test·복원 HOLD, 외부 근거 신규 승인 0/누적 UNKNOWN/10,000 BLOCKED.
- 백로그 ID: ENV1296-01 SEC1296-02 REL1296-03 ARC1296-04 ARC1296-05 ARC1296-06 ARC1296-07 ARC1296-08 ARC1296-09 ARC1296-10.

## 기획 v1294 — F675-130 알림 무결성 보완 (DRAFT/HOLD)
- 이전 기능 추가 v1292 / 현재 기능 보완 v1294 / 다음 기능 추가 v1296. 기존 NestJS 회원 읽음/모두 읽음 API를 재사용하고 고정 6개 모의 알림·localStorage 장마감 알림은 실제 사건과 분리. unreadOnly=false 파싱, 신규 도착 제외 모두 읽음 상한, UUID 동률 키셋, 실제 분류(개발 DB 0건으로 미확인), 동의·방해금지·세션, Android/SEO/WCAG 및 격리 100경합/10,001건 검증.
- P0: ENV1294-01, SEC1294-02, REL1294-03, NOT1294-04. P1: NOT1294-05, NOT1294-06, NOT1294-07, NOT1294-08, NOT1294-09, NOT1294-10. 루트 99%, 보안·프론트·정확 SHA·복원 HOLD, 기본 OFF·문서만. 독립 외부 근거 신규 승인 0/누적 UNKNOWN·10,000 BLOCKED.

- **GitHub v1292:** [기획 Draft PR #1354](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1354) (미병합 #1349 기반); [개발 이슈 #1353](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1353); [서버 용량 #1170 업데이트](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1170#issuecomment-6400649178). 문서만 수정, DRAFT / RELEASE HOLD.
## v2026.10.26.1292 — F675-130 회원 검증형 알림 제어·방해금지 시간 (기능 추가 / DRAFT / HOLD)
- **회차:** 이전 Feature Improvement v1290 → 현재 Feature Addition v1292 → 다음 Feature Improvement v1294(잠정). main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 시작·중간 재확인, AGENTS.md·README.md·영문 원본 기획서·한국어 대조 확인. 미병합 Draft #1349 기반 문서 브랜치, A/B/C/Gemini/QA와 격리.
- **실제 코드:** /account/notifications는 목표/NPC 설정만 저장한다. NotificationTabsBar의 은행/보안 등 6개 알림은 고정 모의 데이터이고 읽음도 브라우저만 변경한다. StockAlertPushEngine은 localStorage 기반 가상 장마감 브라우저 알림을 지연 발송한다. NestJS 실제 알림 조회는 회원 필터가 있지만 OFFSET과 created_at 단독 정렬이다. 개발 DB in_app_notifications는 10개 컬럼. 운영 사고가 확인됐다는 뜻은 아니다.
- **기능:** /account/notifications/preferences에서 선택적 전경 브라우저 알림 분류·IANA 시간대·조용한 시간 관리. 실제 회원 알림 이력은 (created_at,id) 키셋과 서버 영수증으로 조회. 보안/시스템 알림은 앱 내 유지, 기존 목표 토글 보존, 오프라인 푸시/수익 지급 약속 금지. 동의·세션·CSRF, CAS·UUID 멱등·불변 영수증·SECDEF 회원 검증, Android 동등성, no-store/noindex, WCAG AA, 관리자 k>=20, 기본 OFF. 전체 명세는 통합 기획서 참조.
- **P0:** ENV1292-01 루트 99%/1.8GiB, SEC1292-02 개발 DB 앱 쓰기 239/241 및 BOLA, REL1292-03 보안 감사·프론트 실패 6·정확 SHA Test·마이그레이션, NOT1292-04 가짜 알림/푸시 표시 제거. **P1:** NOT1292-05..10 스키마·원자성·키셋·웹/Android·개인정보/접근성·격리 실DB. 최신 후보 PR #1350 프론트 1,407 통과/6 실패, Test/복원 미검증. Production BLOCKED.
- **독립 근거 게이트:** W3C·OWASP 후보 검토, 신규 중복 제거·분류·최종 승인 0건, 누적 미확인/10,000건, BLOCKED / IN PROGRESS. 문서만 수정, 런타임/DB/WLD/원장/Test/Production 변경 없음.
- **백로그 ID:** ENV1292-01 SEC1292-02 REL1292-03 NOT1292-04 NOT1292-05 NOT1292-06 NOT1292-07 NOT1292-08 NOT1292-09 NOT1292-10

- **GitHub 기획 검토:** [Draft PR #1349](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1349) (미병합 #1345 기반, 문서만); [개발 인계 #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

## v1290 / F675-129 — 회원 상점 찜 목록 무결성 (기능 보완 / 초안 / 보류)
- **회차:** 이전 추가 v1288 → 현재 보완 v1290 → 다음 추가 v1292(잠정). 원격 main 1c5b84a1 시작·중간 동일, 미병합 기획 Draft #1345, 별도 개발 #1344. 문서만 변경, A/B/C·Gemini·QA 분리.
- **금액:** Migration 165는 회원별·서울 당일 market_sale·starter_tools 할인 GREATEST(1,base_price*9/10)을 적용한다. 공개/회원 가격은 다를 수 있어 회원 실효 BIGINT 정수 문자열과 조회 시각만 표시하고 가격 고정·할인 보장 금지. 서울 자정·이벤트 변경 시 재조회.
- **구매 조건:** shop_catalog_list_v2는 재고 0도 반환하며 sale_ends_at을 강제하지 않는다. 구매는 재고·회원/계좌·한도를 별도로 검증하지만 sale_ends_at/진행도 강제는 미확인. 찜 목록은 구매 가능 확정/Buy CTA 금지. 가격×수량 BIGINT 오버플로 검증 필요.
- **무결성:** 비활성 찜 제거 가능, 인증·동의 후 멱등 영수증 재시도, 불변 지문 영수증·30개 상한·회원→찜→상품 잠금·세대 HMAC 커서·하드 삭제 처리. 본인 GET/POST/DELETE·Next.js/Android 동등·no-store/noindex·관리자 k>=20·WCAG 2.2 AA·탈퇴/병합·실측 KPI. 기본 OFF.
- **P0:** ENV1290-01 SEC1290-02 REL1290-03 SHP1290-04. **P1:** SHP1290-05 SHP1290-06 SHP1290-07 SHP1290-08 SHP1290-09 SHP1290-10. QA v1279 프론트 1397/6·감사 FAIL·경로 검사 인자 오류, 루트 98%/2.0GiB, 개발 DB 앱 직접 쓰기 235/241, PUBLIC 은행 함수 0 재검증 필요, Migration 266 불일치·정확 SHA Test/복원 BLOCKED. 외부 신규 승인 0·누적 UNKNOWN/10,000.
- **백로그 식별자:** ENV1290-01 SEC1290-02 REL1290-03 SHP1290-04 SHP1290-05 SHP1290-06 SHP1290-07 SHP1290-08 SHP1290-09 SHP1290-10

- **GitHub 기획 검토:** [Draft PR #1345](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1345) (stacked on unmerged #1340, review-only); [development issue #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

## v1288 / F675-129 — 회원 전용 검증형 상점 찜 목록 (기능 추가 / 초안 / 보류)
- main `1c5b84a1` 시작·중간, 이전 보완 v1286 → 현재 추가 v1288 → 다음 보완 v1290(잠정). 미병합 기획 Draft #1340, 별도 개발 [#1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344); A/B/C·Gemini·QA 런타임과 분리.
- 실제 카탈로그 UUID/코드/BIGINT 가격, 공개·회원 카탈로그·보유·구매 API 확인; 본인 찜 CRUD 미확인. 회원당 30건·서버 영수증·현재 재고·정수 WLD 문자열; 가격 고정·예약·자동 구매·보상·허위 정산 없음.
- Nest/Next/Android 본인 CRUD, 원자적 상한·UUID 멱등성·버전 CAS, DB SECDEF 최소권한, 병합/삭제, 서명 커서, 관리자 k>=20, 개인 noindex, WCAG AA. 상세는 통합 마스터.
- P0 ENV1288-01 SEC1288-02 REL1288-03 SHP1288-04; P1 SHP1288-05 SHP1288-06 SHP1288-07 SHP1288-08 SHP1288-09 SHP1288-10. QA v1278 원시 1397 통과/6 실패·시간초과·감사 실패, 루트 98%, 운영 보류. 외부 신규 승인 0·누적 미확인/10,000 BLOCKED.
- **Backlog IDs:** ENV1288-01 SEC1288-02 REL1288-03 SHP1288-04 SHP1288-05 SHP1288-06 SHP1288-07 SHP1288-08 SHP1288-09 SHP1288-10


## v1286 / F675-128 — 마켓 검색 의미·소수 금액 무결성 (기능 보완 / 초안 / 보류)
- **GitHub 기획 검토:** [초안 PR #1340](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1340) (기존 #1335 기반, 미병합); [개발 인계 #1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334).
- 실제 코드: NUMERIC(20,4)와 BigInt/Number 정렬 충돌, ILIKE 와일드카드, 판매자명 UI/SQL 불일치, DTO 길이 제한 부재, OFFSET·비유일 정렬. 실제 운영 사고 증거는 아님.
- 기존 회원 전용 20건 검색 보관함을 정규화 리터럴 필터 v2·정확 10진 문자열·서버 ACTIVE 선필터·키셋/HMAC 버전 커서·원자적 영수증·병합/탈퇴 차단·404 BOLA·Android/noindex/a11y로 보완. 모의 매물/구매/잔액 성공 표시 금지. 상세는 통합 마스터.
- P0 ENV1286-01 SEC1286-02 REL1286-03 MKT1286-04; P1 MKT1286-05 MKT1286-06 MKT1286-07 MKT1286-08 MKT1286-09 MKT1286-10. QA v1276 FAILED/HOLD, v1277 원시 실패 증거, 루트 98%/2.2GiB, 운영 보류. 외부 승인 0건·누적 미확인/10,000 BLOCKED. 개발 [#1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334).
- **Backlog IDs:** ENV1286-01 SEC1286-02 REL1286-03 MKT1286-04 MKT1286-05 MKT1286-06 MKT1286-07 MKT1286-08 MKT1286-09 MKT1286-10


## v1284 / F675-128 — 검증형 마켓 검색 조건 보관함 (기능 추가 / 초안 / 운영 보류)
- **Engineering handoff / 개발 인계:** [#1334](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1334); planning-only and independent of runtime work.
- **근거:** `MarketplaceTabs`의 모의 매물, 브라우저 단독 구매 성공·임의 WLD 잔액, NestJS 실제 ACTIVE 조회의 OFFSET·유일 정렬 누락, NUMERIC(20,4) 가격 확인. main의 저장 검색 CRUD는 미확인. 모의 거래를 실제로 인증하지 않는다.
- **회원 동선:** 고정가 검색 조건 저장/재실행/수정/삭제(20건), `/marketplace` → `/account/marketplace-searches`; 본인 DB·불변 멱등 영수증·서명된 실시간 결과 커서. 자동 알림·정산 보장 없음.
- **인계:** P0 ENV1284-01 SEC1284-02 REL1284-03 MKT1284-04, P1 MKT1284-05 MKT1284-06 MKT1284-07 MKT1284-08 MKT1284-09 MKT1284-10. 세부 내용은 국문 통합 마스터; 기본 OFF, QA v1276 FAILED/HOLD, 운영 BLOCKED. 외부 승인 신규 0건, 누적 미확인/10,000.


## v1282 — F675-127 상담 상태 경합·스냅샷 진실성 (기능 보완 / HOLD)
- 이전 추가 v1280 → 현재 보완 v1282 → 다음 추가 v1284; main `1c5b84a1`, Draft #1324, 개발 #1323. Migration196 멱등키 중복 경합, 답변의 무조건 상태 갱신, 시각 역행, 관리자 동일 상태 감사 위험. 일반 Queryable 풀은 REPEATABLE READ 보장 불가. 버전형 멱등 상태 API·상담 행 선잠금 순차번호·메시지/상태/감사 원자성·GREATEST 시각, 고정 읽기 전용 REPEATABLE READ·다중 페이지 불변 스냅샷 또는 비인증 현재 조회. 10k/2MiB/30초 413, HMAC 커서/409, Android·개인정보·SEO·접근성·롤백.
- P0 ENV1282-01 SEC1282-02 REL1282-03 SUP1282-04; P1 SUP1282-05 SUP1282-06 SUP1282-07 SUP1282-08 SUP1282-09 SUP1282-10. QA v1275 FAILED/HOLD, 루트 98%, 감사/DB/마이그레이션/Test 미해결. 외부 신규 0, 누적 미확인/10,000 BLOCKED. 문서 전용.
- **전체 ID:** ENV1282-01 SEC1282-02 REL1282-03 SUP1282-04 SUP1282-05 SUP1282-06 SUP1282-07 SUP1282-08 SUP1282-09 SUP1282-10


## v1280 — F675-127 회원 상담 대화록·상태 출처 검증 (기능 추가 / HOLD)
- 이전 보완 v1278 → 현재 추가 v1280 → 다음 보완 v1282; main `1c5b84a1` 시작·중간 확인, 선행 Draft #1316, 개발 [#1323](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1323).
- 실제 `/support` 회원 상담/메시지 상한 50/200건, 키셋 커서 부재. Migration 196에 본인 확인 가능 이전/이후 상태 이력이 없고 컨트롤러에 내보내기 API 없음. 본인 전용 페이지 조회·TXT 스냅샷, `HISTORY_PARTIAL` 명시 및 검증 불가 과거 이력 생성 금지. Next `/support/transcripts/[threadId]`, NestJS/Android 본인 API, DB 불변 상태 이벤트, `REPEATABLE READ` 스냅샷, 10,000건/2MiB/30초, HMAC 커서·digest·타인 404, 관리자 k>=20, noindex/no-store, WCAG 2.2 AA, 1%→10%→100% 승인 배포·스위치 롤백.
- P0 ENV1280-01 SEC1280-02 REL1280-03 SUP1280-04; P1 SUP1280-05 SUP1280-06 SUP1280-07 SUP1280-08 SUP1280-09 SUP1280-10. QA v1273 FAILED/HOLD, QA #1317 후보 로컬 통과만으로 운영 승인 불가. 루트 98%, DB 권한·마이그레이션·정확 SHA Test·복원 미해결. 외부 신규 승인 0, 누적 미확인/10,000 BLOCKED. 문서 전용, 기능 OFF, Production HOLD.
- **백로그 ID:** ENV1280-01 SEC1280-02 REL1280-03 SUP1280-04 SUP1280-05 SUP1280-06 SUP1280-07 SUP1280-08 SUP1280-09 SUP1280-10


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
