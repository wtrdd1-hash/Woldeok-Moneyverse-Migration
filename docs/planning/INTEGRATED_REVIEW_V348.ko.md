# 통합 기획 재검토 v2026.09.22.348

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
