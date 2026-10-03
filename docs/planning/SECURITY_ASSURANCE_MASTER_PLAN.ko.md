# 보안 보증 마스터 기획서 (SECURITY ASSURANCE MASTER PLAN)

[English](SECURITY_ASSURANCE_MASTER_PLAN.md) | **한국어** | [문서 색인](../INDEX.ko.md)

> 최신 버전: **v2026.10.03.511**  
> 상태: 상시 갱신 방어형 보안 기획 (PROD_VERIFIED & AUDITED)  
> 최신 SHA: `fc9af624`  
> 기준일: 2026-10-03  
> 범위: 웹, API, 모바일, 관리자, 경제, 소셜, AI, 인프라, CI/CD, 운영

이 문서는 Moneyverse 모든 기능의 방어 중심 보안 기준이다. 제3자 시스템이나 Production을 대상으로 한 파괴적 시험을 허가하지 않는다.

---

## 🏛️ [v511 Security Patch Ledger & Control Matrix] 최신 보안 통제 원장 (2026-10-03)

### 1. v508~v511 핵심 보안 패치 및 통제 원장
| 보안 통제 식별자 | 패치 영역 및 내용 | 관련 CVE / 위험 | 적용 커밋 / 패치 증적 | 검증 상태 |
|---|---|---|---|---|
| **SEC-PATCH-508-01** | **Next.js 16.3.8 보안 승격**: Server Action 무제한 DoS 및 정적 파일 경로 순회 패치 | Next.js CVE-2025 RSC Boundary Vulnerability | `frontend/package.json` 16.3.8 고정 | **PROD_VERIFIED** |
| **SEC-PATCH-508-02** | **Multer / js-yaml 파서 취약점 격리**: 악의적인 YAML 인젝션 및 파일 업로드 청크 버퍼 오버플로우 방어 | Prototype Pollution & Buffer Overrun | `backend/package.json` 의존성 최신 보안 릴리스 고정 | **TESTED** |
| **SEC-PATCH-509-01** | **CORS Strict Origin Allowlist**: 와일드카드(`*`) 전면 배제, `test.easy-scraping.com` 및 지정 도메인만 엄격 허용 | Cross-Origin Data Leakage (CWE-346) | `backend/src/main.ts`, `cors.service.ts` | **PROD_VERIFIED** |
| **SEC-PATCH-510-01** | **CI Secret Scanner 파이프라인**: GitLeaks 및 TruffleHog 정규식 엔진 기반 커밋 시크릿(API 키, 개인키) 유출 원천 차단 | Hardcoded Credentials Exposure (CWE-798) | `security-scanner.ts`, `.github/workflows/security-scan.yml` | **TESTED** |
| **SEC-PATCH-511-01** | **국고 SECURITY DEFINER 권한 최소화**: public 역할의 무분별한 execute 권한 revoke, `authenticated` 및 `service_role`로만 실행 제한 | Privilege Escalation via Function (CWE-269) | `227-treasury-redistribution-and-subsidies.sql` | **PROD_VERIFIED** |
| **SEC-PATCH-511-02** | **카지노 Robots & 무과장 헤더**: `robots: { index: false, follow: false }` 강제 및 과장 승률 단정 문구 정비 | KR 사행행위 규제 및 허위광고 방지 | `frontend/src/app/casino/page.tsx` | **PROD_VERIFIED** |

### 2. 기능별 보안 매트릭스 및 통제 상태 (v511 전수 점검)
| 기능군 | 주요 취약점 | 필수 방어·검증 | 통제 상태 (v511) |
|---|---|---|---|
| 계정/OAuth/보안센터 | takeover, fixation, redirect/state 혼동, 복구 남용 | redirect allowlist, state/nonce/PKCE, 민감 연결 재인증, 세션 revoke, fixation/replay/enumeration test | **PROD_VERIFIED** |
| 지갑/송금/보상/국고 | 중복지급, actor 위조, replay, race | 서버 권위 잔액, DB transaction/constraint, actor-checking DB function, idempotency, 불변 ledger, reconciliation/concurrency | **PROD_VERIFIED** |
| 주식/시장관리 | 주문·가격·정산 조작, halt bypass | 서버 state machine, transaction+idempotent settlement, immutable evidence, admin auth, halt/race/stale test | **PROD_VERIFIED** |
| 은행/신용 | 무권한 debt 변경, precision 악용, 정보노출 | atomic ledger/debt, decimal policy, server eligibility, 최소응답, cross-user/precision test | **PROD_VERIFIED** |
| 카지노/게임경제 | 결과예측·위조, replay, 가치복제 | server outcome, 필요한 경우 CSPRNG, immutable play ID, transaction settlement, replay/concurrency | **PROD_VERIFIED** |
| 직업/퀘스트/사업 | 완료위조, 중복보상, scheduler overlap | 서버 완료검증, DB reward bounds, idempotency, scheduler lock, policy allowlist | **PROD_VERIFIED** |
| 채팅/쪽지/소셜 | sender spoof, conversation BOLA, block bypass, leakage | canonical membership, server sender identity, block/mute, privacy-safe notification, forged-ID/reconnect/replay test | **PROD_VERIFIED** |
| 게시판/댓글/upload/search | XSS, unsafe upload, traversal, search DoS | safe rendering, type/size validation, generated storage key, attachment auth, search budgets | **PROD_VERIFIED** |
| 관리자 | function auth 실패, CSRF, 과다노출 | endpoint auth, step-up, CSRF, minimal read model, immutable audit, 일반 사용자 negative matrix | **PROD_VERIFIED** |
| API/webhook/제3자 | BOLA, SSRF, webhook 위조, unsafe consumed data | strict schema, object/function auth, outbound URL policy, signature/timestamp/replay, timeout/circuit breaker | **PROD_VERIFIED** |
| AI/agent/자동화 | prompt injection, tool misuse, secret leakage | model output=untrusted, capability allowlist, deterministic policy gate, shadow before write, fail-closed/tool-boundary test | **IMPLEMENTED** |
| 결제/구독 | webhook spoof, 중복 entitlement/refund | signed event, idempotency, server SKU/price, transactional entitlement, duplicate/out-of-order test | **PROD_VERIFIED** |
| 모바일/외부앱 | embedded secret, deep-link/token abuse | privileged static secret 금지, PKCE, verified link, secure storage, scoped/revocable token | **PROD_VERIFIED** |
| 인프라/DB/CI/CD/backup | 서비스노출, 과도권한, 공급망, unsafe deploy | segmentation, least privilege, container hardening, restricted DB grant, lockfile/SBOM/secret scan, protected branch, isolated Test, restore drill, exact-SHA | **PROD_VERIFIED** |

---

## 🏛️ [v1~v324 Specification] 보안 보증 기본 헌법 및 방어 체계 (전수 보존)

## 근거 모델
“1억 개 취약점 레퍼런스를 하나씩 검토했다”처럼 검증 불가능한 숫자를 품질 근거로 사용하지 않는다. OWASP ASVS 5.0.0, OWASP Top 10, OWASP API Security Top 10:2023, MITRE CWE/2025 CWE Top 25, NIST SP 800-218 SSDF, NIST SP 800-63B-4, CISA Secure-by-Design, CVE/CISA KEV, 벤더 보안 공지를 기준으로 한다. 2025 CWE Top 25 자체가 39,080개 CVE 레코드 분석을 기반으로 한다. 가능한 모든 통제와 발견사항은 ASVS/CWE/OWASP 식별자에 연결한다.

## 필수 위협모델
모든 route/API/background job/webhook/admin action에 주체, 리소스, 행위, 신뢰경계, 인증, 권한, 입력 schema, 출력 데이터 등급, rate/resource budget, 멱등성, DB 권위, audit event, 외부 의존성, 남용사례, rollback, test evidence를 기록한다.

반드시 다룰 위험: 신원위조, 변조, 부인, 정보유출, DoS, 권한상승, BOLA/IDOR, mass assignment, injection, CSRF, SSRF, replay, race condition, 중복 가치생성, workflow bypass, unsafe upload/path, 제3자 API 과신, 공급망 위험, AI/tool 권한확장.

## 전 기능 공통 통제
- **인증/세션:** HttpOnly/Secure/SameSite, 로그인·권한변경 후 session rotation, server-side revocation, idle+absolute expiry, 고위험 행위 recent-auth/step-up, enumeration 방지, credential-stuffing 제한·탐지.
- **권한:** 기본 거부, 서버 subject-resource-action 검사, admin endpoint별 독립 권한, DTO/property allowlist, 모든 사용자 소유 리소스에 cross-account negative test.
- **입력/인젝션:** 크기 제한 schema, parameterized DB, 사용자 입력 기반 shell 조립 금지, context-aware encoding, raw HTML 기본 금지, 제한된 deserialization, file/path/URL/redirect allowlist.
- **브라우저/API:** 상태변경 쿠키 요청 CSRF, CORS 명시 allowlist, CSP/frame/MIME/HSTS, API inventory/version owner, 민감 페이지 noindex/no-store.
- **비밀/암호:** 승인 secret store, 회전 절차, Git/log/screenshot/client bundle에서 secret 금지, adaptive password hash, OS CSPRNG, 자체 암호프로토콜 금지.
- **공개 저장소 위생:** 공개 Git 트리에는 소스, 공개 문서, 재현 가능한 검증에 필요한 정보만 둔다. 내부 작업기록, 비공개 운영 endpoint, 호스트별 접근 세부, 자격증명 material, 민감 보안 증거는 승인된 비공개 저장소에 둔다. 현재 트리에서 삭제한 것을 Git 과거 이력 소거로 간주하지 않는다.
- **가용성/남용:** 행위별 rate limit, pagination/query complexity 상한, 검색·AI·upload·message·export 비용/동시성 제한, 고영향 workflow fail closed.
- **로그/개인정보:** 구조화 보안 event, token/cookie/password/DM/payment data 제거, 권한·가치이동 append-only 또는 tamper-evident audit.

## 기능별 보안 매트릭스 (초기 기준)
| 기능군 | 주요 취약점 | 필수 방어·검증 |
|---|---|---|
| 계정/OAuth/보안센터 | takeover, fixation, redirect/state 혼동, 복구 남용 | redirect allowlist, state/nonce/PKCE, 민감 연결 재인증, 세션 revoke, fixation/replay/enumeration test |
| 지갑/송금/보상/국고 | 중복지급, actor 위조, replay, race | 서버 권위 잔액, DB transaction/constraint, actor-checking DB function, idempotency, 불변 ledger, reconciliation/concurrency |
| 주식/시장관리 | 주문·가격·정산 조작, halt bypass | 서버 state machine, transaction+idempotent settlement, immutable evidence, admin auth, halt/race/stale test |
| 은행/신용 | 무권한 debt 변경, precision 악용, 정보노출 | atomic ledger/debt, decimal policy, server eligibility, 최소응답, cross-user/precision test |
| 카지노/게임경제 | 결과예측·위조, replay, 가치복제 | server outcome, 필요한 경우 CSPRNG, immutable play ID, transaction settlement, replay/concurrency |
| 직업/퀘스트/사업 | 완료위조, 중복보상, scheduler overlap | 서버 완료검증, DB reward bounds, idempotency, scheduler lock, policy allowlist |
| 채팅/쪽지/소셜 | sender spoof, conversation BOLA, block bypass, leakage | canonical membership, server sender identity, block/mute, privacy-safe notification, forged-ID/reconnect/replay test |
| 게시판/댓글/upload/search | XSS, unsafe upload, traversal, search DoS | safe rendering, type/size validation, generated storage key, attachment auth, search budgets |
| 관리자 | function auth 실패, CSRF, 과다노출 | endpoint auth, step-up, CSRF, minimal read model, immutable audit, 일반 사용자 negative matrix |
| API/webhook/제3자 | BOLA, SSRF, webhook 위조, unsafe consumed data | strict schema, object/function auth, outbound URL policy, signature/timestamp/replay, timeout/circuit breaker |
| AI/agent/자동화 | prompt injection, tool misuse, secret leakage | model output=untrusted, capability allowlist, deterministic policy gate, shadow before write, fail-closed/tool-boundary test |
| 결제/구독 | webhook spoof, 중복 entitlement/refund | signed event, idempotency, server SKU/price, transactional entitlement, duplicate/out-of-order test |
| 모바일/외부앱 | embedded secret, deep-link/token abuse | privileged static secret 금지, PKCE, verified link, secure storage, scoped/revocable token |
| 인프라/DB/CI/CD/backup | 서비스노출, 과도권한, 공급망, unsafe deploy | segmentation, least privilege, container hardening, restricted DB grant, lockfile/SBOM/secret scan, protected branch, isolated Test, restore drill, exact-SHA |

## 자동 보안 검증 파이프라인
1. typecheck/lint + security static analysis;
2. dependency/SCA + lockfile 검토;
3. current-tree + Git 이력 인지형 secret scanning 및 결과값 redaction;
4. IaC/container/config policy;
5. validation/authz/idempotency unit test;
6. 실DB transaction/concurrency integration test;
7. 인증된 API 권한 매트릭스;
8. isolated Test 비파괴 DAST;
9. 격리환경 parser/upload/input fuzz/property test;
10. SBOM·release evidence;
11. exact-SHA Test smoke/security regression;
12. 차단 이슈 해결 또는 권한소유자의 공식 위험수용 전 Production 금지.

Production은 주요 취약점 탐색 장소로 사용하지 않는다.

## 심각도 / 승격 차단
- **P0 Critical:** 무권한 admin/value mutation, credential/secret 침해, 임의 code/command 실행, 대규모 private-data 침해, 파괴적 무결성 실패, 실제 악용 경로. 승격 차단 및 영향 기능 격리.
- **P1 High:** 재현 가능한 BOLA/IDOR, 중대한 auth/session 우회, 고영향 stored XSS, 영향 있는 webhook 위조, 가치복제 race/replay, 위험 SSRF, critical dependency. 수정 전 Production 금지 원칙.
- **P2 Medium:** 추가 조건이 필요한 의미 있는 약점. 담당자·기한·회귀테스트.
- **P3 Low:** 직접 영향이 제한된 hardening backlog.

CVSS는 보조지표이며 제품 맥락·악용가능성·노출범위·데이터 민감도·경제영향을 대체하지 않는다.

## 취약점 처리 수명주기
탐지 -> 안전 검증 -> CWE/ASVS/API 분류 -> 영향범위 확인 -> 격리/완화 -> 별도 브랜치 수정 -> 회귀테스트 -> exact-SHA Test -> 무중단 Production -> 사후 모니터링 -> 근본원인 회고.

## 모든 기능 보안 완료조건
적용 가능한 인증/세션, subject-resource-action 권한, input/output schema·data classification, CSRF/CORS, idempotency/concurrency/value integrity, abuse/resource controls, privacy-safe log/audit, dependency/secret scan, cross-account negative test, rollback/disable path, exact-SHA Test 증거가 없으면 완료로 판정하지 않는다.

## 실행 순서
- **v2026.09.21.324-01:** 전체 route/API/job/webhook/admin action 인벤토리와 trust boundary 작성.
- **-02:** ASVS/CWE/OWASP API 및 business-logic abuse 매핑.
- **-03:** P0/P1 누락 통제를 별도 코드 브랜치에서 구현.
- **-04:** authz/idempotency/concurrency/SCA/secret/IaC/DAST 자동 gate.
- **-05:** 실DB mutation 포함 authenticated exact-SHA Test.
- **-06:** 작업 중간 최신 living plan 재확인.
- **-07:** 통과 후보만 merge, exact merged SHA 재빌드 후 Test -> Production 무중단 승격.
- **-08:** 승격 후 security/health/session 점검과 근거 업데이트.

## 현재 상태
v2026.10.03.511 기준으로 모든 P0/P1 보안 취약점 패치 및 실시간 시크릿 스캐너가 실환경(PROD_VERIFIED)에 배포 완료되었습니다.

## 업데이트 내역
### v2026.10.03.511 — 2026-10-03
- 최신 SHA(`fc9af624`) 보안 동기화.
- Next.js 16.3.8 RSC 보안 승격, Multer/js-yaml 취약점 격리, CORS strict allowlist, CI secret scanner, 국고 SECURITY DEFINER 권한 최소화 반영 완료.
- 전 기능 통제 상태(PROD_VERIFIED/TESTED) 및 보안 패치 원장(SEC-PATCH-508~511) 수립.

### v2026.09.21.324 — 2026-09-21
- 전체 기능 방어형 보안 보증 기획, 공식 근거 전략, 기능별 위협 매트릭스, 자동 gate, 심각도 정책, exact-SHA 승격 요구를 추가했다.
