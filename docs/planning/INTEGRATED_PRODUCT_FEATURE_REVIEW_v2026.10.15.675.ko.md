## v1464 / F675-172 — 회원 전용 대시보드 바로가기 (기능 추가 / 초안 / 보류)

- 이전 기능 보완 v1462 → 현재 기능 추가 v1464 → 다음 기능 보완 v1466(잠정). main 9ebc5613845ba2e8179a0051e86db996593c8a19 시작·중간 확인; QA v1367 FAILED/P0; Test·Production 앱 c2129625aa6629c616fb31ce790950618b8d92b2는 main과 다름. Draft #1856/#1846/#1837/#1830 선행 의존. [백로그 #1865](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1865).
- /dashboard의 '다음 활동'은 고정 4개 링크이며 확인한 대시보드·프로필·DB에 회원별 편집 기능은 없다. 기존 상점 관심 목록 F675-160이나 공지 고정과 별개. 회원은 최대 6개 allowlist 내부 route key를 선택·순서 변경·저장·초기화하며 Android 동기화. 임의 URL·관리자 경로·송금·구매·보상·알림·WLD 변동 없음.
- 설계: 버전 있는 경로 레지스트리·권한 재검증, 회원 PK·CAS·본문 해시 불변 영수증, SECURITY DEFINER·앱 직접 DML 금지, 본인 GET/PUT/영수증 조회, CSRF, 409/412/422/429/503, 320px/WCAG 2.2 AA, noindex/no-store, 20명 이상 비식별 관리자 집계, 기본 OFF·비파괴 롤백. 상세 영문·국문 명세는 PROJECT_PLAN에 통합.
- P0 REPO1464-01 FIN1464-02 SEC1464-03 REL1464-04, P1 SHORTCUT1464-05, SHORTCUT1464-06, SHORTCUT1464-07, SHORTCUT1464-08, SHORTCUT1464-09, SHORTCUT1464-10. 합성 10,001건·동시 100·권한 위조 100·응답 유실 50·경로 경합 30 수용시험 **미실행**. 과거 체크섬 불일치 5건·국고 미연계 552행·MINT 조정 19건/18,000 WLD·브랜치 보존 게이트 유지.
- 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000건, BLOCKED/IN PROGRESS. 기획만 변경하고 runtime·DB·Test·Production은 그대로 유지. 신규 분산기획 파일 없음.


# 머니버스 통합 제품·기능 포트폴리오 재검토 — v2026.10.15.675

## v1462 / F675-171 — 저장 수취인 무결성 보완 (기능 보완 / 초안 / 운영 보류)

- **주기:** 이전 Addition v1460 → 현재 Improvement v1462 → 다음 Addition v1464(잠정). main 95a8fdb85f6670cac9e52e16383711ac94924e93까지 재조회; 미병합 Draft #1846/#1837/#1830에 의존. QA v1366 HOLD. Test·운영 앱 c2129625aa6629c616fb31ce790950618b8d92b2는 main과 다름. [개발 이슈 #1844](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1844).
- **신규 소스 근거:** UUID만 입력하라는 화면과 달리 인증된 /wallet/recipients/search는 member_profiles ILIKE로 이름·UUID를 반환한다. 활성 회원 확인은 활성 USER_CASH 지갑 확인과 다르다. TransferForm은 오류 상태에서 송금 멱등키를 바꾸며 알림은 재생 여부를 구별하지 않는다. **운영 유출·중복 지급의 실측 증거는 아니다.**
- **보완 계약:** 이름 검색 재사용 금지, 본인 전용 UUID 저장, 회원+현금 지갑을 확인한 ELIGIBLE/UNAVAILABLE/UNKNOWN(최대 30초), 실제 폼 수취인 값 동기화·전체 UUID/금액 재확인, 미확정 송금의 최초 키 유지, 본인 영수증 조회, 정규화 해시·최상위 SERIALIZABLE·40001 동일 키 재시도, no-store·Android 동등성·기본 OFF.
- **백로그:** P0 REPO1462-01, FIN1462-02, SEC1462-03, REL1462-04; P1 RECIP1462-05~10(상태/DB/API/UI/개인정보/회귀). 제안 시험: 합성 10,001, 동시 100, 권한 거부 100, 응답 유실 50, 계정 상태 경합 30, 열거 30. 실제 수용시험 미실행.
- **게이트:** QA v1366 HTTP 48/50, 모바일 36/36, 개발 DB 원장 산술 불일치 0이지만 국고 552행 연결 누락, 체크섬 5건, 앱 쓰기 가능 관계 216개. 독립 복원·정확 SHA Test·신규 기능 운영승격 미인증. 외부 독립 근거 신규 승인 0, 누적 UNKNOWN/10,000 = BLOCKED/IN PROGRESS. 런타임·DB·WLD·Test·운영 변경 없음. 세부 영문·국문은 PROJECT_PLAN.
- **개발 연계:** [P0 #1854](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1854), [P1 #1855](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1855), [백로그 #1844](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1844).

## v1460 / F675-171 — 회원 전용 WLD 수취인 저장 (기능 추가 / 초안 / 배포 보류)

- **주기:** 이전 Improvement v1458 → 현재 Addition v1460 → 다음 Improvement v1462(잠정). main `b84d645a`; 미병합 #1837/#1830에 의존하며 main 반영 아님. QA v1365 FAILED/P0; 운영/Test 앱 `b44ffd0a` 별도. [개발 이슈 #1844](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1844).
- **소스 근거:** 지갑 송금 때마다 정확한 36자리 UUID를 입력한다. 수취인 검색·정확 ID 활성 확인 API는 있지만 검사한 지갑 코드에 본인 전용 저장 CRUD는 없다. 이름/Discord 공개 검색·실명 인증·자동 송금은 제외.
- **기능:** 회원이 공유받은 UUID를 최대 20명까지 개인 별칭으로 저장/조회/변경/삭제, 웹·Android 동등성. **송금에 사용**은 UUID만 채우고 전체 ID·금액 재확인을 거쳐 기존 송금을 수동 실행한다. 금액 저장·자동 지급·원장/알림 변경·사용자 열거 금지. 탈퇴·차단 상대는 사용 불가.
- **기술:** 추가형 owner+recipient UNIQUE/tombstone/version, 불변 요청 영수증, SECURITY DEFINER 소유자 검사·앱 직접 DML 거부, SERIALIZABLE 한도/CAS, 동일 UUID·해시 재시도, 409/412, 서명 커서, CSRF/no-store/noindex, WCAG 2.2 AA·320px, 영수증 90일 보존 제안, 익명 관리자 KPI. 기능 기본 OFF. **미구현.**
- **P0:** REPO1460-01(과거 브랜치 462/비조상 344), FIN1460-02(18,000 WLD/국고 552), SEC1460-03(체크섬 5건/권한), REL1460-04(독립 복원/정확 SHA Test/QA/GitOps). **P1:** RECIP1460-05~10(DB/원자성/API/UI/개인정보/합성 10,001+동시 100+권한 100 테스트). 실제 수용시험 미실행.
- **외부 근거:** 신규 검증·중복 제거 승인 0, 누적 UNKNOWN/10,000 = BLOCKED/IN PROGRESS. 신규 분산기획 파일 없음. 런타임·Test·운영·DB·WLD 불변. 세부 영문·국문 계약은 PROJECT_PLAN 참조.


## v1458 / F675-170 — 릴리스 증거 식별·브랜치 보존 (기능 보완 / 초안 / 보류)

- **주기:** 이전 추가 v1456 → 현재 보완 v1458 → 다음 추가 v1460(잠정). main `b84d645a`, 선행 Draft #1830 미병합·의존 브랜치. QA v1364 Test/운영 앱 `b44ffd0a`는 main과 다름. [개발 백로그 #1829](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1829).
- **P0:** QA v1364 기존 브랜치 이름 462개 누락(조상 118·비조상 344), 검증된 51 MiB 복구 bundle 보존. 소유자·삭제 주체·정책 대조 전 파괴적 정리 보류. 과거 18,000 WLD MINT 출처, 직접 연결 없는 국고 552행, 체크섬 5건, 인증 E2E·외부 독립 복원 미검증. 운영자 승인 금융 DML 유지. 기존 v1213 변조 증거로 단정하지 않음.
- **설계:** 저장소 HEAD·앱 SHA·이미지 digest·GitOps·DB 지문·정책·신뢰 epoch를 후보 키에 결합. PRE/POST와 REQUIRED/NOT_APPLICABLE을 상태 6종과 분리, PRE 최종 EVIDENCE_COMPLETE 금지. 키 폐기/만료는 불변 기록을 바꾸지 않고 현재 HOLD로 표시. 동일 스냅샷 FK·SERIALIZABLE 서명 수집·멱등 영수증·관리자 읽기/비식별 내보내기 전용·배포 CTA 없음·WCAG/noindex/Android 관리자 미지원.
- **백로그:** P0 REPO1458-01 FIN1458-02 SEC1458-03 REL1458-04; P1 RELBOARD1458-05~10. 격리 10,001행/동시 100건/권한 부정 100건 미실행. 외부 독립 승인 신규 0, 누적 UNKNOWN/10,000 = BLOCKED/IN PROGRESS. 문서만 변경, 영문·국문 상세 PROJECT_PLAN 수록.


## v1456 / F675-170 — 근거 연계형 릴리스 준비도 현황판 (기능 추가 / 초안 / 보류)

- **기준·주기:** 이전 보완 v1454 → 현재 추가 v1456 → 다음 보완 v1458(잠정). 원격 main `b84d645a`와 실제 Test/운영 앱 `b44ffd0a` 구분. QA v1363 HTTP 48/50(양쪽 `/help` 404), 모바일 36/36, Draft PR 113개/충돌 48개. [개발 백로그 #1829](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1829).
- **기능:** 권한 제한된 읽기 전용 `/admin/releases/readiness`, 소스/빌드/Test DB/복원/금융/인증 QA/운영 근거 체인, 검증/실패/만료/누락/불가/승인예외 6종 상태와 HOLD/EVIDENCE_COMPLETE. 승인·승격 버튼 금지. 정확 SHA·서명 증빙, 불변 PostgreSQL 스냅샷, 권한 검증 SECURITY DEFINER, 비식별 내보내기, 관리자 감사, Android 정책, noindex, WCAG 2.2 AA.
- **안전:** v1213 실제 운영 승격과 운영자 승인 기존 금융 DML 존중. 역사적 체크섬 5건·국고 근거·세션 재사용은 별도 미검증. 10,001행/동시 100건/권한 부정 100건 수용시험은 **미실행**. P0 ENV1456-01 FIN1456-02 SEC1456-03 REL1456-04, P1 RELBOARD1456-05~10. 상세 영문 정본과 한국어 대조본 PROJECT_PLAN에 수록.
- **외부 근거 게이트:** 신규 승인 0건, 누적 검증 UNKNOWN/10,000 → BLOCKED/IN PROGRESS. 문서만 변경, 런타임/Test/Production 미변경.

## v2026.10.29.1448 — F675-168 검증된 블로그 글 회원 전용 나중에 읽기 (기능 추가 / 초안 / 운영 보류)

**개발 인계:** [Draft PR #1801](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1801) / [Issue #1800](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1800). Documentation only, RELEASE HOLD.
- 이전 기능 보완 v1446 → 현재 기능 추가 v1448 → 다음 기능 보완 v1450(잠정). 시작 main f05efcb5d7c21d9553f68df227f9771217a30671 → 중간 main 8ba355374a2553926f67140febbf85c114f00ba1 변경(implementation_plan.md만 수정, 기획 원본 동일), QA v1359 FAILED/HOLD. 블로그 본문에 공유 버튼만 있고 검증된 회원 저장 기능이 없으며 정적 AI 글과 검증 게시 글은 구분해야 한다. 개발 이슈 #1800, 런타임 변경 없음.
- 독립 승인된 PUBLISHED 글만 명시적으로 저장/해제·수동 읽음 변경, 회원당 최대 100건, 개인 /account/reading/blog, 불변 게시 UUID·언어·epoch·영수증, 서명 커서·UUID 멱등성, 본인 전용 SECURITY DEFINER, 철회 tombstone. NestJS/Next/Android 동등성, CSRF, WCAG 2.2 AA, noindex/no-store, 관리자 감사·집계 KPI, WLD 영향 0.
- P0: ENV1448-01(용량/독립 복원), FIN1448-02(18계좌/+18,000 WLD), SEC1448-03(쓰기 239/공개 은행 3/체크섬 5/미적용 20, 블로그 278/279 포함), REL1448-04(정확 SHA Test/배포). P1: BLOG1448-05, BLOG1448-06, BLOG1448-07, BLOG1448-08, BLOG1448-09, BLOG1448-10 게시 근거, 트랜잭션, API, 화면, 관리자·개인정보·SEO, 실제 PG 회귀. 합성 10,001건·동시 100건·위조 100건은 수용 조건이며 미실행. 운영 BLOCKED.
- 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 독립 기획 파일 추가 없음. 전체 영문·국문 계약은 통합 마스터 및 https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1800에 반영.

[Draft PR #1794](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1794) — documentation-only, unmerged, release HOLD.

## v2026.10.29.1446 — F675-167 퀴즈·일일 보상 격리와 영수증 무결성 보완 (기능 보완 / 초안 / 운영 보류)
- 이전 추가 v1444 → 현재 보완 v1446 → 다음 추가 v1448(잠정). 시작·중간 main `35971c600f25869c96f1c666d4b9f58927202730` 동일, QA v1358 FAILED/HOLD. 미병합 #1790/#1784/#1780 의존, 미구현.
- **실제 코드 충돌:** 일일 퀘스트 `quest_financial_quiz`는 1,000 WLD 보상과 `/#financial-quiz` 링크를 표시하나 검색한 main에 대응 앵커는 없다. `DopamineRepository.claimDailyQuest`는 퀴즈 완료 증빙을 검사하지 않고 저장소 부재 시 컨트롤러 모의 성공 응답 경로가 있다. 이는 소스상 위험이며 운영 악용 입증이 아니다. 보상 정산은 기존 금융 이슈 [#1321](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1321)이 담당한다.
- F675-167은 별도 무보상 `glossary_practice`: 일일 보상 API·퀘스트/올클리어 이벤트·WLD/원장 변경 금지. 서버 전용 정답(공개 약한 해시 금지), 문제은행/배포 SHA·독립 검토, 언어별 검수 5문항×4선택지, 본인·지문 결합 영수증, 저장소 부재 503 실패 차단, 409/410/422/429, 24시간 10회, 30분 만료, 90일 보존, 웹·Android·SEO·WCAG/TalkBack·320px 검증. 클라이언트 모의 성공·점수 금지.
- P0/P1: ENV1446-01 FIN1446-02 SEC1446-03 REL1446-04 QUIZ1446-05 QUIZ1446-06 QUIZ1446-07 QUIZ1446-08 QUIZ1446-09 QUIZ1446-10. 격리 실제 PG 10,001건, 동시 100건, 위조 100건, 정답 유출 방지·퀴즈 원인 WLD 변화 0·정확 SHA Test·롤백 필수. QA v1358 루트98%/데이터99%/tmp97%, 회원 18명 +18,000 WLD, 앱 쓰기239, PUBLIC 은행3, 체크섬5/미적용20, Test SHA 불일치·독립 복원 미검증. 운영 보류.
- 외부 독립 중복제거·검증 신규 0건, 누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 문서만 변경, 런타임·DB·금융·Test·Production 변경 없음. 전체 명세는 영문·국문 통합 마스터, 개발 인계 [#1789](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1789).



## v2026.10.29.1444 — F675-167 검증 가능한 금융 용어 자가점검 (FEATURE ADDITION / DRAFT / RELEASE HOLD)
- [Draft PR #1790](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1790)는 미병합 #1784를 기반으로 한 문서 전용 기획.
- 이전 기능 보완 v1442 → 현재 기능 추가 v1444 → 다음 기능 보완 v1446(잠정). main 35971c600f25869c96f1c666d4b9f58927202730 시작·중간 동일, QA v1357 FAILED/HOLD. 미병합 #1784/#1780 후속 기획이며 [개발 이슈 #1789](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1789)로 연계.
- main에는 금융 용어 50개·별도 시스템 용어 12개, 4개 언어 정적 페이지와 86400초 ISR이 있지만 조사 범위에 검증된 퀴즈 문제은행·본인 시도/점수 영수증·대응 DB가 없다. 회원이 선택하는 5문항은 언어별 독립 승인된 서로 다른 용어 5개, 문항당 선택지 4개·정답 1개, 불변 개정·서버 전용 정답·원본 영수증을 요구한다. 자동 읽음·숙련·보상·WLD·원장 변경 없음.
- 개인 /account/learning/glossary/practice, NestJS/Next/Android 동등성, 본인 전용 PostgreSQL SECURITY DEFINER 시도·문항·영수증, 30분 만료·하루 10회·90일 보존, 작성자/심사자 분리, noindex/no-store, WCAG 2.2 AA·320px/TalkBack·KPI, 동시성 100·권한 음성 100·격리 PG 10,001건을 기획. 화면/API/DB/롤백 상세는 기존 국영문 통합 마스터에 기재.
- P0/P1: ENV1444-01 FIN1444-02 SEC1444-03 REL1444-04 QUIZ1444-05 QUIZ1444-06 QUIZ1444-07 QUIZ1444-08 QUIZ1444-09 QUIZ1444-10. QA v1357: 루트 98%/데이터 99%, USER_CASH +18,000 WLD, 앱 쓰기 239개 관계, PUBLIC 은행 함수 3개, 마이그레이션 불일치 5·미적용 20, 공식 Test SHA 불일치·독립 복원 미검증으로 운영승격 HOLD.
- 외부 독립 중복제거 승인 신규 0건, 누적 UNKNOWN/10,000, BLOCKED / IN PROGRESS. 문서만 변경, 런타임/DB/Test/운영 변경 없음.


## v2026.10.29.1442 — F675-166 금융 용어 정규 식별자·언어별 읽음 무결성 강화 (FEATURE IMPROVEMENT / DRAFT / RELEASE HOLD)
- GitHub 연계: [Draft PR #1784](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1784)는 미병합 선행 [#1780](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1780)에 의존하며 [개발 이슈 #1779](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1779)를 갱신함. 문서 전용·운영승격 HOLD.
- 사이클: Previous Addition v1440 → Current Improvement v1442 → Next Addition v1444(잠정). 원격 main 35971c600f25869c96f1c666d4b9f58927202730 시작·중간 재확인, 선행 Draft #1780 미병합. 마지막 확인 가능 QA v1355 FAILED/HOLD, 새 QA 결과는 미인증.
- 실제 소스: 정규 PSEO 금융 용어 50개, 별도 서비스 용어 ID 12개(교집합 0), 다국어 별칭 5개. volatility → sharpe-ratio는 동의어가 아니다. ko/en/ja/zh 페이지의 86400초 ISR과 언어 변경을 고려하여 불변 term ID·namespace, 검증된 별칭만 허용, 언어별 읽음 revision을 명세했다.
- 회원만 저장/삭제, 언어별 자발적 읽음/취소, 원본 digest 영수증, 회원·세션·필터·스냅샷 서명 커서, 100개 제한, 409 revision/422 별칭/503 권위 불일치 구분, Android 동등성, 개인정보/noindex/a11y/롤백. 상세 계약은 영문·국문 통합문서. 보상·학습 성취·WLD·원장 효과 없음.
- P0 ENV1442-01 FIN1442-02 SEC1442-03 REL1442-04; P1 GLOS1442-05 GLOS1442-06 GLOS1442-07 GLOS1442-08 GLOS1442-09 GLOS1442-10. 개발 DB 실측 247개 public 테이블 중 235개 moneyverse_app INSERT/UPDATE/DELETE 가능, 루트 98%·데이터 99%, 이전 QA 18,000 WLD 차이·마이그레이션/복원/정확 SHA 미해결. RELEASE HOLD.
- 외부 독립 중복제거·검증 승인 신규 0건, 누적 UNKNOWN / 10,000건, BLOCKED / IN PROGRESS. 문서 전용이며 runtime/DB/WLD/Test/Production/main 병합 없음.


## v2026.10.29.1440 — F675-166 회원 전용 금융 용어 학습 목록 (기능 추가 / DRAFT / RELEASE HOLD)
- GitHub 연계: [Draft PR #1780](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1780), [개발 이슈 #1779](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1779). 미병합·운영 보류.
- 이전 기능 보완 v1438 → 현재 기능 추가 v1440 → 다음 기능 보완 v1442(잠정). main 35971c600f25869c96f1c666d4b9f58927202730 시작·중간 재조회, QA v1355. 실제 main의 GLOSSARY_TERMS 공개 용어 상세는 24시간 ISR이며 본인 전용 용어 저장/읽음 API는 없다. 미병합 F675-165 정정 제안과 별도 기능.
- 회원 직접 저장/취소 및 자발적 읽음/취소, 비공개 /account/learning/glossary, 실제 배포 slug·개정 검증, 원본 영수증·본인 API·Android 동등성·CAS·100개 제한·409/503·삭제 용어 묘비·SEO/접근성/개인정보/롤백 설계. 읽음은 숙달·보상·WLD 증거가 아니다. [개발 이슈 #1779](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1779); 영문 정본·국문 상세는 통합 기획 참조.
- P0 ENV1440-01 FIN1440-02 SEC1440-03 REL1440-04; P1 GLOS1440-05 GLOS1440-06 GLOS1440-07 GLOS1440-08 GLOS1440-09 GLOS1440-10. QA: 루트/데이터 ~98%, 18명 18,000 WLD 차이, 앱 쓰기 가능 239개 테이블, PUBLIC 은행 실행 3개, 체크섬 불일치 5/미적용 20, 외부 복원·공식 Test 정확 SHA 미검증. 운영승격 보류.
- 외부 독립 근거 신규 승인 0, 누적 중복 제거 승인 UNKNOWN / 10,000, BLOCKED / IN PROGRESS. 문서만 변경, 런타임·DB·WLD·Test·운영 불변.


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
