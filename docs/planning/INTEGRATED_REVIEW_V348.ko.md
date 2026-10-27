## v1396 재검토 — F675-155 은행 상환 영향 미리보기 (추가 / DRAFT / HOLD)
- main의 /bank SmartLoanCard는 바로 상환하나 서버 검증 영향 미리보기가 없다. 실제 bank_repay는 원장을 변경하므로 미리보기 호출 금지. 본인 전용 POST + SECDEF 단일 읽기 관측으로 현재/예상 현금·대출·상한 적용액을 표시하며 확정 견적은 아니다.
- 실제 상환·멱등 영수증은 분리하고 타인 대출·세션 변경·현금 부족·과대 정수·비공개 캐시를 차단. 관리자 비식별 집계, noindex, Android 동등성, WCAG AA, 10,001/100/100 미실행.
- P0/P1 ENV1396-01 SEC1396-02 REL1396-03 LOAN1396-04 LOAN1396-05 LOAN1396-06 LOAN1396-07 LOAN1396-08 LOAN1396-09 LOAN1396-10. QA v1333 후보 #1635 CI PASS는 main/Test가 아님. DML 235/241·PUBLIC 은행 함수 3개·Migration 283/체크섬 5건·배포 링크·Test exact-SHA·복원 BLOCKED. 외부 신규 승인 0, 누적 UNKNOWN/10,000.


# 통합 기획 재검토 v2026.09.22.348
- **v1324 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1449 (stacked on unmerged #1432; DRAFT / RELEASE HOLD). **Engineering issue:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1448.
## v1324 재검토 — 회원이 확인한 해결과 관리자가 종료한 문의 구분 (2026-10-26; DRAFT/HOLD)
- main Migration196은 회원 확인 없이 관리자 resolved 설정 가능하며 /support는 이를 처리 완료로 표시한다. 개발 DB 읽기 전용 resolved2/waiting_user1/메시지6, 운영·만족도 증거 아님. 기존 지원 답변 확인 v1316/v1318·문의 증빙 첨부 기획과 별도 범위.
- 결정: 신규 불변 완료 사건당 본인 선택형 확인 1건, GET·알림 조회 자동 동의 금지, 과거 기록 소급 확인 금지. 명시적 확인·선택형 도움됨/메모, 추가 문의는 기존 답장 기능. 현재 사건 버전·멱등성 필수.
- 본인 GET/POST·추가 SQL 사건/피드백, 관리자 완료 전환/감사 원자성, 행 잠금, SECDEF/PUBLIC 회수, 개인정보 n>=20, noindex/no-store, Android/WCAG, 장애 상태 명확화. P0 4/P1 6: ENV1324-01 SEC1324-02 REL1324-03 SUP1324-04 SUP1324-05 SUP1324-06 SUP1324-07 SUP1324-08 SUP1324-09 SUP1324-10.
- QA v1297 FAILED/HOLD, 루트98% 약2.0GiB, 보안·권한·마이그레이션·Test·격리 복원 차단. 독립 10,000건 신규 승인0·누적 UNKNOWN, BLOCKED/IN PROGRESS. 런타임 배포·회원 데이터 쓰기 없음.

- **v1322 Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1432 (stacked on unmerged #1427; DRAFT / RELEASE HOLD). **Engineering issue:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1426.

## v1322 재검토 — 수집품 큐레이션 조회/쓰기·코드 무결성 (2026-10-26; DRAFT/HOLD)
- main 근거: 프론트 NEO_CYBER_ARCADE_TOKEN과 서버 NEO_CYBER_CASINO_CHIP 불일치; GET 목록에서 예시4개 삽입, GET 진척에서 삽입/갱신, POST 임의 targetStep 및 D1/D3/D7, UI 실패 응답 미확인. 개발 DB 읽기 전용 수집품8/회원2·진척2(1단계/D7); 운영 데이터로 확대 해석 금지.
- v2: 과거 UNKNOWN 보존, 별칭/캐시 자동 검증 금지, GET 쓰기0, 명시적 버전 CAS·멱등 진척/메모, 보기 일자 분리, 불변 근거·관리자 증빙 매핑. P0 4/P1 6: ENV1322-01 SEC1322-02 REL1322-03 COL1322-04 COL1322-05 COL1322-06 COL1322-07 COL1322-08 COL1322-09 COL1322-10.
- QA v1297 진행 중·게이트 실패, 루트98%, 정확 SHA Test/격리 복원 미완료, 운영 보류. 독립 10,000건 신규 승인0·누적 UNKNOWN, BLOCKED/IN PROGRESS. 런타임 배포 없음.


- **v1320 Draft PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1427 (stacked on unmerged #1420; HOLD). Engineering issue:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1426 (Draft/RELEASE HOLD; predecessor #1420 unmerged).

## v1320 재검토 — 수집품 획득 진실성 게이트 (2026-10-26; DRAFT/HOLD)
- 정본 근거: main 1c5b84a1의 컬렉션 DEFAULT_PIECES/localStorage 오류 복원, 서버 ensureSeedPieces, Migration232 설명형 provenance, 개발 DB 8행/회원2명/시드 코드 일치8행과 앱 직접 DML. 개별 과거 발급·운영 소유권은 검증되지 않음.
- F675-137은 과거 행 삭제/예시 검증 오인 대신 본인 전용 획득 근거 영수증을 추가한다. 회원·API·DB·UX·Android·관리자·개인정보·SEO·KPI·롤백은 영문/국문 통합 마스터에 동등 명세. P0 4/P1 6: ENV1320-01 SEC1320-02 REL1320-03 COL1320-04 COL1320-05 COL1320-06 COL1320-07 COL1320-08 COL1320-09 COL1320-10.
- QA v1294 FAILED/HOLD, 루트97%/약3.3GiB, 정확 SHA Test·격리 PG/복원·보안 게이트 미완료. 과거 UI 스크린샷 합산은 독립 중복 제거·승인 10,000건 근거가 아님. 신규 승인0·누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS. 런타임 배포 없음.


일자: 2026-09-22
권위: `PROJECT_PLAN.ko.md`의 상세 보조 문서이며 표현이 충돌하면 PROJECT_PLAN의 통합 요약이 우선한다.
범위: 현재 통합 기획, 최신 implementation_plan, v342/v343/v347/v347.1 기록, QA/보안/릴리스 거버넌스, 현재 외부 규범 자료.

## 1. 증거 모델

"1만 개 이상 레퍼런스"는 추적 가능한 대규모 corpus 임계치와 핵심 규범 직접 확인으로 충족하며, 1만 페이지를 각각 수동으로 열었다고 주장하지 않는다. 기존 프로젝트 조사에는 SeeClick 웹 스크린샷 10,000개 subset, WebUI 41,970개, RICO 66,000+개 화면이 기록돼 있어 UI artifact 합계가 117,970개를 넘는다.

증거 우선순위는 (1) 최신 규범 표준·규제기관/중앙은행 자료, (2) 저장소 소스·생성 계약·exact-SHA 테스트, (3) exact identity가 있는 Test/Production 런타임 증거, (4) 폭넓은 패턴 참고용 대규모 디자인/UI/보안 corpus, (5) provenance용 과거 worklog/changelog 순이다.

## 2. 우선 공백

### G348-01 — 통합 버전 드리프트
헤더가 v335인데 문서 안에는 v337이 이미 있고 저장소 작업은 v347.1까지 진행됐다. 수용 조건: 헤더 v348, 영/한 동기화, 우선순위 규칙 명시.

### G348-02 — 결함 상태 드리프트
QA-335는 OPEN인데 후속 릴리스 기록은 복구를 보고한다. 수용 조건: 상태 변경마다 candidate SHA, Test 증거, Production 증거, 종료 SHA/날짜를 기록하며 오래된 OPEN을 묵시 삭제하지 않는다.

### G348-03 — Developer Portal/API 안전경계 부족
v347은 `/developer`와 live request를 구현했지만 mutation 안전, secret 보관, auth/CSRF/step-up, 오류 형식, resource budget, OpenAPI 진화 규칙이 통합 기획에 부족했다.
수용 조건: 생성 OpenAPI와 구현 상호 검증, OAS 3.0 호환범위와 OAS 3.2.1 전환 경로 테스트, RFC 9110 의미론, 가능한 RFC 9457 problem 형식, 운영 docs UI의 무제한 관리자/경제 mutation 금지, endpoint별 auth/BOLA·DTO allowlist·idempotency·pagination·size/rate/time budget·cache/retry/deprecation, analytics/localStorage credential 영속 저장 금지.

### G348-04 — 신문 투표 권위 충돌
v343은 localStorage 투표 동작을 기록하고 v347은 POST vote API를 추가했다. 수용 조건: 공유 투표라면 서버가 eligibility/vote/aggregate 권위이고 localStorage는 브라우저 UX 기억만 담당한다. 로컬/데모라면 그렇게 표시하고 로컬 백분율을 전체 사용자 여론처럼 보여주지 않는다.
### G348-05 — 동의 step-up 의미
v347.1은 화면 내 modal로 blackout을 해결했지만 상태/접근성 계약이 부족했다. 수용 조건: 버전이 있는 age/terms/privacy grant의 서버 권위, dialog label·focus 관리, 멱등 제출, 세션 만료/네트워크/충돌 복구, server-confirmed grant 전 보호 mutation 차단, analytics에서 민감 consent payload 제외.

### G348-06 — 주식 halt 기획/구현 상태 불일치
v315는 planning-only라고 하지만 v342는 실제 DB 수정·릴리스 증거를 기록한다. 수용 조건: v315를 제품 계약, v342를 구현 증거로 취급하고 real-DB concurrency, double-credit 방지, missing-cost-basis fail-closed, immutable-ledger test를 계속 게이트로 유지한다.

### G348-07 — freshness 의미
홈/신문/developer가 live/real-time 표현을 쓰지만 공통 stale-data 계약이 없다. 수용 조건: 모든 live datum에 source timestamp, fetched timestamp, max staleness, stale UI 동작, retry/backoff, safe fallback을 정의한다. client animation만으로 freshness를 증명하지 않는다.

## 3. 상세 구현 계약

### API / Developer Portal
- operationId 안정성과 contract-first endpoint inventory를 유지한다.
- 선언되지 않은 mutation 필드를 거부하고 금액 권위는 integer/minor-unit 또는 exact-decimal을 사용하며 binary float를 권위값으로 쓰지 않는다.
- mutation idempotency scope/key/result hash를 영속화하고 동시 insert에도 안정적인 cursor pagination을 사용한다.
- rate/resource budget, correlation ID, cache/retry/version/deprecation 동작을 공개한다.
- "Try It Out" 기본값은 sandbox/read-only다. 권한 write는 일반 authorization, CSRF, step-up을 그대로 적용하고 운영 docs에서 완전 비활성화할 수 있다.

### 신문
- story 권위에는 id/type/content, scenario/event 연결, generated/published/corrected/retracted 시각, locale, disclosure, provenance가 포함된다.
- 기사 내 시장값은 시점이 표시된 snapshot이며 현재 호가와 명시적으로 구분한다.
- poll 권위에는 pollId/options/window/eligibility/vote policy/aggregate freshness/idempotency가 포함된다.
- private prompt, secret, 개인 금융 프로필, 비공개 moderation 정보는 노출하지 않는다. 안정적인 공개 archive/detail만 index 후보로 둔다.

### 동의
- 상태기계: UNKNOWN -> REQUIRED -> SUBMITTING -> CURRENT 또는 ERROR, SESSION_EXPIRED는 별도 상태다.
- 정책 버전 변경 시 REQUIRED로 되돌리되 과거 audit history는 보존한다.
- backend가 정확한 policy version/timestamp를 저장하고 frontend cache는 참고값으로만 쓴다.
- 필수 dialog도 keyboard, screen reader, zoom/reflow, focus-not-obscured 요구를 충족한다.

### 릴리스 / QA
- 문서 변경만으로 런타임 배포를 주장하지 않는다.
- 구현 branch -> exact candidate Test -> real DB/API/security/accessibility/responsive -> 최신 기획 재확인 -> merge -> exact merged SHA rebuild -> 무중단 Production -> identity/session/smoke/log 검증 순서를 따른다.
- P0/P1 auth, 금융무결성, DB migration, cross-account, split-release, data-loss 결함은 운영 승격을 차단한다.

## 4. 최신 레퍼런스 재확인 — 2026-09-22

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- OpenAPI Specification 3.2.1 (v349에서 표기 정정, URL 유지): https://spec.openapis.org/oas/v3.2.1.html
- RFC 9110 HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- RFC 9457 Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- OWASP API Security Top 10:2023: https://owasp.org/API-Security/
- NIST SP 800-63-4: https://csrc.nist.gov/pubs/sp/800/63/4/final
- NIST SP 800-63B-4: https://csrc.nist.gov/pubs/sp/800/63/b/4/final
- NIST SP 800-218 SSDF 1.1: https://csrc.nist.gov/pubs/sp/800/218/final
- ISO 20022-1:2026: https://www.iso.org/standard/20022-1
- 한국은행 Payment and Settlement Systems Report 2025: https://www.bok.or.kr/portal/bbs/E0000866/view.do?menuNo=400223&nttId=11064840

## 5. 이후 기획 동작
매시간/모든 기획 회차는 side worklog만 만들지 않고 PROJECT_PLAN에도 요약 기록을 추가한다. 구현 직전과 작업 중간에 remote main을 다시 읽는다. 영문 기준/한국어 제2언어를 동기화하며 과거 결함을 지우거나 구현·배포 증거를 과장하지 않는다.


### G348-08 — v46/v47 긴급 방어 초안의 안전성 보강 필요
작업 중간 재확인에서 동적 정책 연동, 예외 경로 매칭, 200ms mount fade, 10초 미만 자동 rollback을 제안하는 implementation-plan v46/v47이 새로 추가된 것을 확인했다. 이는 입력 초안이며 그대로 운영 안전 계약으로 간주하지 않는다.
수용 조건:
- policy 조회 실패 시 명시적 fail-safe 상태를 사용하고 stale/hard-coded fallback으로 임의 동의 버전을 만들지 않는다.
- path/encoding/trailing-slash 변형을 canonicalize하고 서버/API 권한이 최종 권위이며 client overlay를 보안경계로 사용하지 않는다.
- exempt-route matrix는 prefix confusion, encoded-path 우회, API mutation 경로를 부정 테스트한다.
- fade 시간은 UX 선택이며 CLS/flicker 0%는 브라우저 측정 증거로 판정한다.
- rollback은 artifact SHA/digest, schema/migration compatibility, health/session 검증이 있는 기록된 last-known-good frontend/backend pair를 대상으로 한다.
- `systemctl reload-or-restart` 자체를 무중단 증거로 보지 않고 기존 blue/green/canary cutover와 rollback anchor를 사용한다.
