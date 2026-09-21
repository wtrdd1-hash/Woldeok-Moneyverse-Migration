# Woldeok Moneyverse — 전 저장소 보안 마스터 기획서

> 버전: **v2026.09.21.324**
> 날짜: **2026-09-21**
> 상태: 기획 / 보안 검증 기준
> 기준 언어: 영문
> 영문 canonical: [SECURITY_MASTER_PLAN.md](SECURITY_MASTER_PLAN.md)
> 범위: 현재 및 예정된 모든 Moneyverse 기능, API, 관리자 작업, 데이터 경로, 런타임, 빌드 파이프라인, 운영 표면
> 런타임 구현 상태: **이 문서만으로 구현 완료를 의미하지 않음**

## 0. 목적과 결정

이 문서는 Moneyverse 전 영역의 최소 보안 아키텍처, 검증 범위, 배포 차단 기준, 취약점 처리 규칙, 사고 대응 요구사항을 정의한다.

사용자가 요구한 “1억 개 레퍼런스”를 실제로 개별 문서 1억 건을 읽었다고 허위 표기하지 않는다. 대신 실제 취약점·CVE·CWE 데이터를 대규모로 집계하는 권위 있는 표준과 데이터셋을 사용하고, 이를 현재 저장소 구조와 기능별 공격면에 연결한다.

기준 체계:
- **OWASP Top 10:2025** — 웹 위험 인식 기준.
- **OWASP ASVS 5.0.0** — 애플리케이션 보안 검증의 주 기준.
- **OWASP API Security Top 10:2023** — 객체/기능 권한, 자원 고갈, SSRF, API 인벤토리, 외부 API 소비 위험 기준.
- **2025 CWE Top 25** 및 전체 CWE/CVE 매핑 — 근본 약점 분류 기준.
- **FIRST CVSS v4.0** — 기술 심각도 표준.
- **CISA KEV** — 실제 악용 취약점 우선순위 보정.
- **NIST SP 800-218 SSDF 1.1 final** — Secure SDLC 기준. SSDF 1.2 Rev.1은 현 시점 draft이므로 참고는 하되 final 기준처럼 취급하지 않는다.
- OWASP 공급망 보안 지침과 **SLSA** 개념 — 의존성, provenance, 빌드 무결성 기준.

Top 10 하나만으로는 충분하지 않다. 웹/API 보안 목록은 출발점이며, 실제 배포 기준은 ASVS, 아키텍처 위협모델, 비즈니스 로직 악용 검증, 의존성 인텔리전스, 운영 검증을 같이 적용한다.

## 1. 보안 원칙

1. **기본 거부**: 라우트, 액션, DB 함수, 소켓 이벤트, 큐 작업, 관리자 작업은 권한 계약이 명시되지 않으면 허용하지 않는다.
2. **서버 권위**: 클라이언트 UI 상태는 금액 이동, 역할 변경, 시장 정산, 제재, 국고, AI 실행, 보안설정의 권한 근거가 아니다.
3. **최소 권한**: 브라우저, 프론트 서버, 백엔드, DB 역할, CI, 봇, 운영자는 필요한 권한만 가진다.
4. **다층 방어**: 고가치 흐름은 입력검증·권한검사·DB invariant·rate limit·idempotency·audit·monitoring을 중첩한다.
5. **Fail closed**: 보안 통제가 오류났다고 허용 상태로 하향되지 않는다.
6. **클라이언트/저장소에 secret 금지**.
7. **ID는 위치표시자일 뿐 권한증명이 아님**.
8. **경제/금융성 변경은 내구성 있는 receipt와 actor audit를 남김**.
9. **정확한 SHA 기준 검증 후 승격**.
10. **보안 요구사항은 반드시 테스트 가능한 형태로 작성**.

## 2. 필수 위협 모델

모든 기능은 아래를 기록한다.
- 보호 자산;
- actor/권한 단계;
- 진입점;
- trust boundary;
- 데이터 저장소;
- 외부 의존성;
- 악용 시나리오;
- 기밀성·무결성·가용성 영향;
- 롤백/복구;
- 관측 신호;
- negative test.

STRIDE류 분류를 사용할 수 있지만, 가상경제 특유의 비즈니스 로직 악용은 별도로 반드시 다룬다.

주요 공격자:
- 비로그인 외부 공격자;
- 악성 로그인 사용자;
- 탈취된 사용자 계정;
- 탈취된 moderator/admin 계정;
- 자동화 봇;
- 악성 외부 연동;
- 오염된 dependency/build runner;
- 내부 운영자 실수/악용;
- 탈취된 내부 API token;
- DB credential 탈취자;
- AI prompt injection 공격자;
- replay/race 공격자;
- DoS 공격자.

## 3. 인증·OAuth·비밀번호·세션

주요 위험:
credential stuffing, spraying, enumeration, 약한 복구, OAuth state/nonce 오류, redirect abuse, session fixation, cookie replay, CSRF, step-up 부재, 계정연결 탈취, reset token replay.

필수 통제:
- Secure/HttpOnly 서버 세션;
- 로그인·권한상승 시 세션 rotation;
- state-changing request CSRF 방어;
- 외부에는 generic auth error;
- account/IP/network 다층 rate limit;
- reset/verification token은 짧은 만료, 단일 사용, 저장 시 hash;
- OAuth state/nonce/PKCE 적용 가능 범위 준수;
- redirect strict allowlist;
- credential/email/provider-link/관리자 민감작업 재인증;
- revoke-all 및 즉시 서버 폐기;
- token/password 없는 보안 이벤트 로그.

필수 테스트:
old cookie replay, reset token 동시사용, 잘못된 OAuth state/nonce, provider 중복연결, cross-origin write, revoke 후 replay, rate-limit 우회.

## 4. 권한·IDOR/BOLA/BFLA

모든 객체와 기능 접근은 서버에서 검사한다.

고위험 객체:
사용자 private 정보, wallet/ledger, bank/loan/bond, stock order/position/alert, business ownership, inventory/listing/crafting, club/co-op, message/chat, moderation, treasury, admin policy, notification, security session.

필수:
- actor는 trusted session에서 가져오고 body의 userId를 신뢰하지 않음;
- 중요 mutation은 service + DB 경계에서 소유권/역할 검증;
- 클라이언트 role/admin flag 금지;
- list/search도 detail과 동일한 권한정책;
- DTO allowlist로 mass assignment 차단;
- 관리자 기능은 route 접근만으로 권한인정 금지;
- 파괴적 관리자 작업은 step-up + preview + idempotency + immutable audit.

모든 resource ID endpoint는 “다른 사용자의 정상 객체 ID” negative test를 반드시 둔다.

## 5. 입력검증·Injection·Parser 안전성

배포 차단급:
SQL injection, command injection, template/code injection, header/log injection, path traversal, unsafe deserialization, prototype pollution, ReDoS.

통제:
- SQL parameter binding;
- untrusted shell interpolation 금지;
- user input 대상 eval/new Function 금지;
- DTO type/size/depth 제한;
- 동적 identifier enum allowlist;
- bounded parser;
- structured logging;
- canonical path resolution;
- user path 조각으로 실제 filesystem 경로 생성 금지.

## 6. 브라우저·프론트엔드

위험:
stored/reflected/DOM XSS, Markdown/HTML 악용, CSP bypass, clickjacking, cache leak, open redirect, client secret 노출, third-party script 악용.

통제:
- 기본 escape;
- 의도적으로 HTML 렌더링 시 allowlist sanitizer;
- `dangerouslySetInnerHTML` 최소화 및 별도 검증;
- 강한 CSP;
- frame-ancestors;
- Referrer-Policy, nosniff, 필요한 Permissions-Policy;
- member/private page shared cache 금지;
- redirect allowlist;
- `INTERNAL_API_TOKEN` 또는 server-only secret이 client bundle에 절대 포함되지 않음.

자동화:
XSS payload corpus, client bundle secret scan, private cache-control regression, security-header test.

## 7. API 보안

모든 REST/server-action/BFF에 OWASP API Top 10 기준 적용.

필수:
- BOLA/BFLA negative test;
- request/response property allowlist;
- pagination/최대건수;
- body size limit;
- expensive operation quota;
- method별 auth 일관성;
- URL fetch가 있으면 SSRF 통제;
- API inventory 및 deprecated API 관리;
- 외부 API 응답도 untrusted data로 처리.

rate/resource limit 대상:
login, search, board/chat, stock query, AI generation, export, upload, media transform, notification fan-out, WebSocket, admin report.

## 8. SSRF 및 outbound network

URL fetch 기능은:
- scheme allowlist;
- localhost/link-local/private/metadata/internal service 주소 차단;
- DNS/redirect 후 목적지 재검사;
- 짧은 timeout;
- response byte cap;
- redirect 횟수 제한;
- 내부 auth header 전달 금지;
- 민감 token 없이 목적지 policy decision 로깅.

## 9. PostgreSQL 보안 경계

- 제한된 runtime role;
- 경제/보안 민감 table broad write 금지;
- 필요 시 actor-scoped `SECURITY DEFINER`;
- 안전한 명시적 `search_path`;
- 함수 내부 actor 검증;
- user-controlled dynamic SQL 금지;
- 적용된 migration checksum 변경 금지;
- GRANT는 security change로 취급;
- credential/session private table 일반 read path 노출 금지;
- backup은 권한/보안상태까지 보존.

negative test:
direct table mutation deny, cross-user function deny, forged actor deny, idempotency replay 안전, race invariant 유지, numeric overflow/rounding 오류 없음.

## 10. Wallet·Ledger·경제 악용

고전적 취약점 외에 business logic exploit을 P0로 본다.

위험:
reward duplication, double spend, replay, negative/overflow, rounding arbitrage, self-transfer abuse, faucet/sink bypass, stale settlement, rollback inconsistency, unauthorized admin balance edit.

통제:
- exact integer/string 계약;
- atomic transaction;
- idempotency;
- authoritative invariant;
- 모든 가치 변경 ledger receipt;
- 최종 금액 client 계산 신뢰 금지;
- issuance/anomaly monitoring;
- 관리자 잔액 변경은 actor/reason/before-after/step-up/audit 필수.

## 11. 주식·시장 무결성

통제:
- 서버 권위 market state;
- order/settlement atomicity;
- 거래상태 명시 검사;
- suspension/delisting 정산 rule;
- market/admin immutable audit;
- order/alert quota;
- symbol/price/quantity 엄격 검증;
- discussion은 community XSS/spam 정책 적용.

## 12. 은행·대출·채권

- 하나의 authoritative interest formula;
- 정산 timestamp atomic;
- repayment replay 방지;
- state machine 검증;
- credit grade/rate client 입력 금지;
- private 데이터 권한검사·audit.

## 13. Shop·Inventory·Crafting·Marketplace

- inventory + ledger atomic mutation;
- 가격/수수료 서버 계산;
- escrow ownership invariant;
- idempotency;
- purchase/cancel concurrency test;
- client item metadata 불신.

## 14. Business·Club·Co-op·Personal Space

- 모든 mutation 소유권/역할 검사;
- invitation token entropy/expiry;
- membership state machine;
- self privilege escalation 차단;
- shared-resource quota;
- ownership/treasury/policy 변경 append-only log.

## 15. Board·Message·1:1 Chat

위험:
stored XSS, markdown link abuse, spam/flood, private message IDOR, conversation enumeration, attachment malware, socket room hijack.

통제:
- output encoding/sanitization;
- URL scheme allowlist;
- user/conversation rate limit;
- read/write 시 participant authorization;
- opaque ID 권장;
- moderation/audit;
- attachment가 있으면 scan/quarantine;
- socket handshake auth + event별 room auth;
- session revoke 시 realtime 권한도 폐기.

## 16. Upload·Image·File

- MIME + extension + magic byte allowlist;
- random server filename;
- file size/image dimension/decompression 제한;
- user path segment 금지;
- executable/static root와 분리;
- 일반 attachment malware scan/quarantine;
- privacy 필요 시 metadata stripping;
- private download signed/time-limited authorization;
- 안전한 Content-Disposition;
- polyglot/archive bomb 대응.

## 17. 관리자·국고

최고위험 표면으로 취급한다.

- 모든 operation 별도 privileged authorization;
- recent reauth/step-up;
- 프로젝트의 현재 인증결정에 따라 2차인증/passkey 적용;
- frontend route 접근만으로 권한 부여 금지;
- bulk/destructive action 영향 preview;
- 매우 위험한 작업은 가능하면 2인 승인;
- idempotency;
- actor/reason/ticket;
- before/after;
- append-only audit;
- 즉시 권한/session revoke;
- tightly audited break-glass;
- 국고는 ledger/DB invariant 우회 금지.

Admin UI에 password hash, reset token, MFA secret, raw cookie, backend secret 표시 금지.

## 18. AI·자동화 보안

위험:
prompt injection, indirect injection, data exfiltration, tool abuse, unauthorized policy mutation, poisoned context, generated SQL/code, hallucinated admin action, resource exhaustion.

통제:
- model output은 untrusted data;
- AI가 authorization oracle이 될 수 없음;
- privileged tool call은 model text와 독립된 server policy 검증;
- tool allowlist + typed args;
- 고위험 action은 deterministic validation + 필요 시 human confirmation;
- secret을 prompt에 불필요하게 넣지 않음;
- retrieved content는 untrusted 표시;
- sanitize/encode output;
- budget/rate limit;
- model→tool→action chain audit;
- generated SQL 직접 실행 금지.

## 19. 모바일/Android

- APK에 `INTERNAL_API_TOKEN`/server secret 금지;
- public BFF/gateway 사용;
- native credential은 Android Keystore;
- deep/app link 검증;
- exported component 최소화;
- WebView JS bridge는 필요 없으면 비활성;
- auth token URL 금지;
- sensitive log 금지;
- TLS 기본검증 준수;
- certificate pinning은 rotation/recovery 계획이 있을 때만.

## 20. WebSocket·Realtime

- handshake auth;
- subscription/room join auth;
- revoked session 재검사;
- message size/frequency limit;
- schema validation;
- origin policy;
- payload의 actor ID 불신;
- connection/backpressure cap;
- reconnect/replay 의미 명확화.

## 21. Secret·Key 관리

- secret inventory/owner;
- secret manager/CI secrets;
- automation은 가능하면 scoped workload identity;
- rotation/expiry;
- Test/Production credential 분리;
- 최소 권한;
- repo history/CI log scanning;
- log redaction;
- webhook/internal API key high-impact 분류;
- compromise drill에 rotation + downstream revoke 포함.

## 22. Dependency·공급망

- lockfile 고정;
- trusted registry;
- direct/transitive SCA;
- KEV 발견 시 긴급 우선;
- release SBOM;
- SLSA 기반 provenance/attestation 목표;
- high-trust GitHub Actions는 가능하면 immutable SHA pin;
- workflow 최소권한;
- untrusted PR code에 production secret 금지;
- release workflow 보호;
- dependency confusion 방어;
- secret/code/container scan;
- base image 주기적 갱신.

## 23. CI/CD·GitHub

- workflow token 기본 read-only;
- Production environment protection;
- exact-SHA artifact promotion;
- Test/Production secret 분리;
- artifact digest 기록;
- routine release가 branch/ruleset 우회하지 않음;
- workflow 수정 security review;
- untrusted checkout + secret을 섞는 위험한 `pull_request_target` 패턴 금지;
- release log에 test와 artifact identity 증거.

## 24. Container·Kubernetes·Edge·Host

- non-root;
- read-only root FS;
- capability drop;
- no-new-privileges;
- seccomp/AppArmor/SELinux/NixOS hardening;
- network policy/minimal exposure;
- backend/internal API 일반 public origin 노출 금지;
- strict Host;
- modern TLS;
- ingress size/time limit;
- 최소 health 정보;
- K8s RBAC least privilege;
- namespace/service-account 분리;
- Git에 plaintext secret manifest 금지;
- patching;
- backup은 primary compromise domain과 분리.

## 25. Logging·Monitoring·Alerting

보안 이벤트:
auth success/fail/rate-limit, password/email/MFA/passkey change, session revoke, privilege change, admin/treasury, permission denial, 이상 경제/시장행위, dependency/secret scan finding.

로그 금지:
password, reset token 원문, cookie, Authorization header, key, 필요 없는 private message body/PII.

Alert에는 owner, threshold, escalation, false-positive 처리, runbook이 필요하다.

## 26. Availability·DoS·예외처리

모든 공개/비싼 endpoint:
request size, execution time, rate/concurrency, pagination, DB timeout, queue/backpressure, safe cache, upstream timeout/circuit breaker를 갖는다.

OWASP Top 10:2025 A10에 맞춰 예외 경로가 auth를 우회하거나, 부분적인 가치 이전을 commit하거나, 내부정보를 유출하거나, 불일치 상태를 남기면 안 된다.

## 27. 개인정보·데이터 보호

- 최소수집;
- field-level inventory;
- 목적/retention;
- admin unmask audit;
- deletion/export runbook;
- production data를 dev/test에 기본 복사 금지;
- analytics에 secret/불필요 ID 금지;
- exact location, credential, 금융식별자, 민감데이터는 명시적 필요성 없으면 수집 금지;
- backup에도 deletion replay 정책 적용.

## 28. 취약점 탐지·검증 프로그램

1. SAST
2. SCA
3. Secret scanning
4. isolated Test DAST
5. IAST/fuzz/property test
6. DB negative test
7. 경제/admin/시장 manual abuse review
8. authenticated API authorization matrix
9. concurrency/race test
10. container/image/IaC scan
11. SBOM/release artifact verify
12. 주요 고위험 release 전·주기적 외부 penetration test

자동도구가 “취약점 없음”을 증명하지 않는다. false positive는 근거를 남기며, 무시 처리로 숨기지 않는다.

## 29. 심각도·처리정책

### P0 / Critical
예: auth bypass, admin/treasury privilege escalation, RCE, material SQLi, production control secret 유출, wallet theft/double-spend, exposed KEV dependency, unrestricted production DB write.

처리:
release block, 즉시 containment, rotation/revoke, emergency patch, 노출 가능 시 incident review.

### P1 / High
예: privileged stored XSS, private data BOLA, internal SSRF, 심각한 recovery/session 약점, material marketplace/economy exploit.

affected feature promotion 차단 후 우선 수정 + regression proof.

### P2 / Medium
낮은 영향 disclosure, 높은 전제조건의 제한적 abuse, defense-in-depth 누락.

### P3 / Low
낮은 exploitability/impact hardening.

CVSS v4.0을 기본 입력으로 사용하되 KEV, exploit 공개 여부, 인터넷 노출, 권한, blast radius, data sensitivity, 자동화 가능성, 복구난이도가 raw score보다 우선할 수 있다.

## 30. 배포 보안 Gate

보안 민감 변경은 아래 전부 충족 전 Production 금지:
1. threat/abuse update;
2. ASVS/API requirement mapping;
3. code review;
4. unit/integration/negative test;
5. dependency/secret/SAST gate;
6. 관련 DB security/invariant test;
7. exact-SHA isolated Test;
8. backend/API/DB/user-flow 검증;
9. security smoke;
10. artifact digest/SHA;
11. rollback target 확인;
12. 무중단 승격;
13. production auth/session/API/ledger/admin smoke;
14. critical alert 없음.

문서만 변경한 경우 이 runtime gate가 통과됐다고 표시하지 않는다.

## 31. 모든 기능 공통 Security Definition of Done

기능 완료 조건:
- asset/abuse case;
- auth 요구;
- authorization matrix;
- bounded schema;
- rate/resource limit;
- value/state mutation의 idempotency/race 정의;
- audit;
- privacy class;
- dependency/external trust;
- negative tests;
- incident/rollback;
- Test evidence.

## 32. 우선 구현 Backlog

### P0
1. 전체 endpoint authorization matrix + cross-user test.
2. 저장소 전체 ASVS 5.0 mapping.
3. SAST/SCA/secret/container/IaC gate 검증.
4. frontend/backend/release SBOM.
5. 모든 `SECURITY DEFINER`, GRANT, `search_path` 검증.
6. ledger/value flow concurrency/idempotency test.
7. admin/treasury step-up/audit/DB actor verification.
8. session revoke/replay + CSRF suite.
9. upload/content/Markdown/XSS suite.
10. SSRF inventory/outbound policy.
11. AI tool/prompt-injection abuse test.
12. WebSocket room/event auth test.
13. KEV emergency dependency process.
14. incident-response/credential-rotation drill.

### P1
CSP 강화, data retention/access matrix, fuzz/property test, authenticated economy/admin 외부 pentest, provenance 고도화.

### P2
OWASP SAMM/DevSecOps maturity 평가, attack-surface drift 탐지, ATO/secret/dependency/DB breach tabletop.

## 33. 기능군별 필수 테스트 Matrix

| 기능군 | 필수 보안 초점 |
|---|---|
| Login/OAuth/Account | enumeration, CSRF, rotation, replay, recovery, link |
| Wallet/Transfer | BOLA, double-spend, idempotency, overflow, audit |
| Bank/Loan/Bond | state, replay, accrual race, privacy |
| Stock | order auth, validation, suspension race, market admin audit |
| Shop/Inventory | tampering, duplication, concurrency |
| Marketplace/Crafting | escrow, server price/fee, purchase/cancel race |
| Business/Club | ownership, role escalation, shared treasury |
| Casino | server result, replay, limit, receipt integrity |
| Board/Gallery | stored XSS, URL/media, moderation |
| 1:1 Chat | participant BOLA, socket auth, spam, attachment |
| Notification | preference auth, fan-out abuse, URL injection |
| Admin | BFLA, step-up, audit, mass-action |
| Treasury | strongest auth, ledger invariant, dual control |
| AI | prompt injection, tool allowlist, exfiltration, budget |
| Mobile | secret absence, token storage, deep link, WebView |
| Backup/Restore | confidentiality, immutability, grants, ransomware separation |

## 34. 참조 기준

- OWASP Top 10:2025
- OWASP ASVS 5.0.0
- OWASP API Security Top 10:2023
- OWASP Cheat Sheet Series
- NIST SP 800-218 SSDF 1.1 final
- CWE Top 25 2025 + full CWE
- FIRST CVSS v4.0
- CISA KEV
- SLSA current specification
- Node.js / Next.js / NestJS / PostgreSQL / Kubernetes / GitHub Actions / Android의 현재 공식 보안 지침

## 35. 버전 이력

### v2026.09.21.324 — 2026-09-21
- 전 저장소 보안 마스터 기획 최초 작성.
- 인증 외 모든 기능군·운영 공격면까지 확장.
- 취약점 탐지, 심각도, 수정, 배포차단 기준 추가.
- 경제 비즈니스 로직, 관리자/국고, AI, realtime, mobile, 공급망, incident 대응 포함.
- Security DoD와 P0/P1/P2 구현 backlog 정의.
