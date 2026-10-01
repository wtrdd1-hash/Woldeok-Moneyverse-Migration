# Moneyverse App/Site/Economy Core 보안 조사 검토 — v2026.10.01.497

> 상태: 작성 아키텍처용 조사근거. 런타임 증거가 아니다.
> 기준 설계: v2026.10.01.496.
> 최신 확인 main: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.

## 1. 조사 범위

다음을 검증한다.
- 분리된 App Core / Site Core BFF;
- 하나의 권위 Economy Core와 하나의 금융 DB 권위;
- 코어 간 workload/service identity;
- 모바일 요청무결성·replay 저항;
- 웹 세션/CSRF 격리;
- PostgreSQL 권한격리;
- AI/model의 경제변경 권한 분리;
- 제한형 AI 수치 정책변경.

## 2. 대규모 discovery 코퍼스

직전 조사패스에서 Crossref 메타데이터를 12개 분야별로 최대 12,000건씩 수집했다.

1. API/BFF 아키텍처;
2. 분산 금융코어/원장/트랜잭션 일관성;
3. 거시경제/재정/세금;
4. 은행/신용/통화정책;
5. 가상/게임경제;
6. AI 경제정책/RL/agent;
7. Safe RL/제약·robust control;
8. 인과추론/정책평가;
9. 시장무결성/알고리즘 가격;
10. 노동/기업/공급;
11. fraud/Sybil/bot/악용탐지;
12. API 보안/service identity.

첫 10개 분야는 120,000 raw에서 내부 중복제거 95,939건, 보안 보충 2개 분야는 24,000 raw에서 23,963건이었고, 두 신규 세트를 DOI 우선·정규화 제목 보조로 재중복제거한 결과 **118,490 신규 unique**였다.

기존 Moneyverse 경제 코퍼스 31,289행과 AI 경제 코퍼스 11,749행을 같은 규칙으로 합치면 discovery index는 **149,691 unique 후보**다.

제목 키워드 보수 스크린으로 25,765건이 최소 하나의 직접 설계주제에 걸렸다. 따라서 149,691은 발견 코퍼스이며 모든 문헌을 전문정독했거나 동등한 근거라는 뜻이 아니다.

수집 산출물 SHA-256:
- 첫 10분야 CSV: `8c50997148e8ebd41b639cd8e945d8bf59ce27f9fcffe125b61d592e9e00effb`;
- 보안보충 CSV: `86e1dab826080f35b722a9a780e7fdb78f015f0eec93ed376893c07b3177c57b`;
- 병합 unique 작업 CSV: `ee863813347fbd607690e091a7bfb8c0150ead4cbecbdef6cb31ba7314aed89f`.

## 3. 1차/현행 아키텍처 근거

### 3.1 Backend-for-frontend 분리

Microsoft Azure Architecture Center, “Backends for Frontends Pattern”:
https://learn.microsoft.com/azure/architecture/patterns/backends-for-frontends

모바일·웹 요구가 실질적으로 다를 때 인터페이스별 BFF 계층을 둘 수 있음을 설명한다.

AWS Prescriptive Guidance, “API integration – Backend for frontend”:
https://docs.aws.amazon.com/prescriptive-guidance/latest/micro-frontends-aws/api-integration-data-fetching.html

BFF는 도메인 모델 소유자가 아니라 인증·집계·변환 계층으로 설명된다.

**Moneyverse 반영:** App Core와 Site Core는 채널 adapter/BFF다. 잔액·세금·대출·국고·시장정산 규칙을 각 BFF가 독립 소유하지 않는다.

### 3.2 Zero Trust와 workload identity

NIST SP 800-207:
https://csrc.nist.gov/pubs/sp/800/207/final

NIST SP 800-207A:
https://csrc.nist.gov/pubs/sp/800/207/a/final

네트워크 위치 자체를 신뢰하지 않고 user/service identity와 resource를 중심으로 통제한다.

RFC 8705:
https://www.rfc-editor.org/rfc/rfc8705.html

RFC 9449:
https://www.rfc-editor.org/info/rfc9449/

도난 bearer credential의 재사용가치를 줄이는 proof-of-possession 패턴을 제공한다.

**Moneyverse 반영:** App Core와 Site Core가 하나의 장기 super-token을 공유하지 않는다. caller·audience·환경·scope가 다른 workload identity를 사용하며, 물리서비스 분리 시 최고위험 내부경로에는 mTLS 또는 동등한 proof-of-possession binding을 우선한다.

### 3.3 OAuth와 native app 로그인

RFC 9700:
https://www.rfc-editor.org/rfc/rfc9700.html

exact redirect 비교, public client의 PKCE, authorization-code injection 방어 등을 포함한다.

**Moneyverse 반영:** 모바일 browser handoff는 one-time/server-authoritative로 유지하고 향후 native OAuth는 APK에 confidential secret을 넣지 않고 exact redirect + PKCE 기준으로 정비한다.

### 3.4 API 공격면

OWASP API Security Top 10 2023:
https://api-security.owasp.org/editions/2023/en/0x11-t10/

BOLA, broken authentication, property/function authorization, resource consumption, sensitive business flow abuse, inventory drift, unsafe upstream consumption이 직접 관련된다.

**Moneyverse 반영:** 생성된 method/path/scope inventory를 보안경계의 일부로 두며 wildcard proxy 자체를 권한으로 간주하지 않는다.

### 3.5 모바일 보안과 요청무결성

OWASP MASVS:
https://mas.owasp.org/MASVS/

Google Play Integrity standard requests:
https://developer.android.com/google/play/integrity/standard

Play Integrity 표준요청은 `requestHash`로 요청내용을 bind할 수 있고 replay 완화도 제공한다.

**Moneyverse 반영:** device/app integrity는 추가 위험신호이며 사용자 identity 대체물이 아니다. 선택된 금융 write는 canonical 경제요청의 digest와 integrity 요청을 bind하고 서버가 재계산해 일치여부를 확인한다.

### 3.6 PostgreSQL 권위경계

PostgreSQL CREATE FUNCTION:
https://www.postgresql.org/docs/current/sql-createfunction.html

PostgreSQL Function Security:
https://www.postgresql.org/docs/current/perm-functions.html

`SECURITY DEFINER`의 안전한 `search_path`, `PUBLIC EXECUTE` 제거, 선택적 grant가 중요하다.

**Moneyverse 반영:** 현재 DB 최종무결성 경계를 유지하고 App Core/Site Core/AI에 broad table 권한을 주지 않는다.

### 3.7 AI 보안

NIST AI RMF GAI Profile:
https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

NIST AIRC:
https://airc.nist.gov/

OWASP LLM Top 10 2025 Excessive Agency:
https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf

AI lifecycle risk, TEVV, 기능·권한·자율성 제한을 뒷받침한다.

**Moneyverse 반영:** 모델출력은 비신뢰 proposal data다. inference/model runtime에는 원장변경이나 policy apply가 가능한 credential을 주지 않는다.

## 4. 현재 저장소의 보안상 강점

- browser -> nginx -> Next -> private NestJS -> PostgreSQL function 경로;
- 일반 public routing과 private API 분리;
- same-origin HttpOnly browser session;
- state-changing 흐름의 CSRF;
- 제한된 `moneyverse_app` DB role;
- actor-checking `SECURITY DEFINER` 경제 write;
- `economy_post_transaction` 단일 money mover;
- append-only ledger/audit;
- business idempotency;
- Android configured API host 고정 및 redirect 거부;
- Android contract에 `INTERNAL_API_TOKEN` 미포함;
- App API version/compatibility 계층.

## 5. v497 관련 현재 보안 드리프트/갭

### 5.1 App과 Site public contract가 섞임

웹 코드도 많은 `/app-api/v1/**`를 사용한다. native compatibility와 web 요구가 섞여 독립적인 정책·버전·보안통제가 어려워진다.

### 5.2 새 core 구조에 shared internal token은 너무 거침

현재 server-to-server 경계는 하나의 `INTERNAL_API_TOKEN`에 크게 의존한다. Next→Nest 단순경계에는 실용적이었으나 App/Site/Economy가 분리될 때 동일 bearer secret을 전체권한 신원체계로 확대하면 안 된다.

### 5.3 wildcard/dynamic transport에 generated allowlist 필요

App gateway의 넓은 path group과 Android universal `@Url` helper는 host pinning으로 arbitrary-host exfiltration은 막지만, 경제 write는 method/path/scope 생성 allowlist가 있어야 미래 route가 의도보다 강한 권한으로 조용히 노출되지 않는다.

### 5.4 AI/자동화 경제경로가 여러 개

economy auto-policy, work auto-tuning, 자동 stock scenario publication이 별도경로로 존재한다.

**v497 보정:** Economy Policy Registry 하나와 Economy Core executor 하나가 경제정책 변경을 소유한다. AI/work/stock 모듈은 명시적으로 bounded auto 등록된 family가 아니면 proposal/evidence만 생성한다.

### 5.5 모바일 integrity header는 있으나 request binding이 권위화되어야 함

App gateway는 `x-play-integrity-token`을 전달하지만 고가치 write 수용은 검증된 verdict, 예상 package/app identity, canonical 경제요청과 `requestHash` 일치를 함께 요구한다.

## 6. v497 채택 보안결론

1. App Core와 Site Core는 별도 BFF/보안경계지만 별도 경제가 아니다.
2. Economy Core 하나와 금융 ledger/DB 권위 하나를 유지한다.
3. public client는 Economy Core를 직접 호출하지 않는다.
4. App/Site Core에는 보호테이블 직접 write 권한을 주지 않는다.
5. workload identity와 최종 user actor 권위를 별도로 검증한다.
6. caller가 보낸 `X-User-Id`류 값은 identity로 신뢰하지 않는다.
7. 경제명령은 idempotency, policy version, request integrity 근거를 가진다.
8. AI/model runtime에는 ledger-write/policy-apply credential을 주지 않는다.
9. AI 자동 수치변경은 사전승인 policy registry, cooldown, 누적 drift budget을 모두 통과해야 한다.
10. AI envelope 확대 자체가 privileged human policy 변경이다.
11. App Core 탈취가 Site-admin/통화정책/DB-owner 권한으로 횡이동하지 못해야 한다.
12. AI runtime 탈취의 최악 결과를 나쁜 proposal 생성 수준으로 제한한다.
13. mobile integrity는 risk/request-binding이며 session/actor auth 대체물이 아니다.
14. 모든 public route는 inventory 관리하며 compatibility route는 retirement 계획을 가진다.
15. DB grant/function ownership/`search_path` 변경은 release-gated security change다.
