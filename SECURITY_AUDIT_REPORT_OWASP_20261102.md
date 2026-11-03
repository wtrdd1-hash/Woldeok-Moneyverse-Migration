# [머니버스] OWASP Top 10 웹 애플리케이션 종합 보안 감사 및 취약점 패치 보고서

**문서 번호**: SEC-AUDIT-20261102-01  
**감사 일자**: 2026-11-02  
**감사 대상**: 머니버스(Woldeok Moneyverse) 풀스택 금융 웹 서비스  
**감사 기준**: OWASP Top 10 (2021), CWE/SANS Top 25, 금융 전산 보안 가이드라인  
**작업 브랜치**: `sec/owasp-vulnerability-audit-20261102`  
**감사자**: 웹 애플리케이션 보안 감사 및 모의침투 테스트 전담팀  

---

## 1. 감사 개요 및 요약 (Executive Summary)

본 보고서는 머니버스 서비스의 웹 애플리케이션 보안성 강화 및 안전한 금융 생태계 운영을 위해 소스코드 전수 감사(Static Application Security Testing), 권한 및 인증 구조 분석, 비파괴 모의침투 테스트(Non-destructive Penetration Testing)를 수행한 결과를 집대성한 공식 보안 감사 보고서입니다.

- **총 점검 항목**: OWASP Top 10 전 영역 (인젝션, 취약한 인증, 인가 부재, 설정 오류, SSRF 등)
- **식별된 취약점**: 총 2건 (HIGH 2건, CRITICAL 0건, MEDIUM/LOW 0건)
- **보안 패치 완료**: 1건 (CSRF 누락 결함 7개 컨트롤러 전수 패치 완료)
- **인프라 조치 권고**: 1건 (PostgreSQL 5433 포트 바인딩 및 방화벽 설정 가이드)
- **안전(Safe) 판정**: SQL Injection, SSRF, IDOR, 세션 하이재킹, 수치 오버플로 등 주요 공격 벡터 취약점 없음 확인.

---

## 2. 취약점 요약 매트릭스 (Vulnerability Summary Matrix)

| ID | 취약점 명칭 | OWASP 카테고리 | 위험도 | 영향 받는 컴포넌트 | 조치 결과 |
|:---:|:---|:---|:---:|:---|:---:|
| **SEC-001** | 주요 상태 변경 API의 CSRF 방어 가드 누락 | A01:2021-Broken Access Control | **HIGH** | Chat, Club, Warfare, FX, BurnEvent, Collection, Space | **패치 완료 (Resolved)** |
| **SEC-002** | PostgreSQL 데이터베이스 포트 외부 인터페이스 노출 | A05:2021-Security Misconfiguration | **HIGH** | 인프라/네트워크 레이어 (Docker `0.0.0.0:5433`) | **조치 권고 수립 (Guide Provided)** |
| **SEC-003** | SQL Injection (사용자 쿼리 삽입) | A03:2021-Injection | **SAFE** | 전체 레포지토리 및 DB 쿼리 레이어 | **취약점 없음 (Safe)** |
| **SEC-004** | Server-Side Request Forgery (SSRF) | A10:2021-SSRF | **SAFE** | 상태 수집기, OAuth 클라이언트, 아웃박스 워커 | **취약점 없음 (Safe)** |
| **SEC-005** | IDOR / Broken Object Level Authorization | A01:2021-Broken Access Control | **SAFE** | 지갑, 계정 보안, 채팅, 금융 원장 API | **취약점 없음 (Safe)** |
| **SEC-006** | 무인가 권한 상승 및 관리자 세션 우회 | A07:2021-Identification & Auth | **SAFE** | AdminGuard, ReauthGuard, 2FA/TOTP | **취약점 없음 (Safe)** |

---

## 3. 세부 취약점 분석 및 개선 조치 (Detailed Findings & Remediation)

### 3.1. [SEC-001] [HIGH] 주요 상태 변경 엔드포인트 CSRF 누락 결함

#### 1) 취약점 원인 및 메커니즘
- 머니버스는 쿠키 기반 세션(`mv_session`)을 사용하고 있으며, 중요한 상태 변경(POST/PUT/DELETE) 요청에 대해 `x-csrf-token` 헤더를 검증하는 `CsrfGuard`가 구축되어 있었습니다.
- 그러나 컨트롤러별 감사 결과 다음 7개 핵심 컨트롤러에 `CsrfGuard`가 적용되지 않고 누락되어 있었습니다:
  - `ChatController`: 대화방 생성(`POST`), 메시지 전송(`POST`), 대화방 삭제(`DELETE`), 읽음 처리(`POST`)
  - `ClubController`: 클럽 창설(`POST`), 가입/탈퇴(`POST`), 기부금 입금(`POST`)
  - `WarfareController`: 클럽전 세금 징수 청구(`POST /claim-tax`)
  - `AdminFxController`: 시장개입(`POST /intervene`), 통화스왑 인출(`POST /swaps/drawdown`), 긴급 동결(`POST /halt`)
  - `PublicFxController`: WLD/USD 즉시 환전(`POST /swap/*`), 선물환 계약(`POST /forward/contract`)
  - `BurnEventController`: 10,000 WLD 국고 영구 소각 및 드로우 참여(`POST /participate`)
  - `CollectionController`: 컬렉션 큐레이션 및 상태 전이(`POST`)
  - `SpaceController`: 우주 공간 생성, 프로젝트 기여, 재산세 납부(`POST`)

#### 2) 재현 조건 및 영향 범위
- **재현 시나리오**: 로그인된 사용자가 악의적인 공격자가 제작한 웹페이지(CSRF 공격 사이트)를 방문하여 숨겨진 `<form>` 자동 제출 또는 비동기 요청 스크립트가 실행될 경우, 브라우저가 저장된 세션 쿠키를 동반하여 요청을 전송합니다.
- **영향**: 피해자의 의도와 무관하게 클럽 탈퇴, 외환 강제 환전, 국고 소각 드로우 참가로 인한 자산 손실, 원치 않는 메시지 발송 등이 유발될 수 있는 중대한 위험이 존재했습니다.

#### 3) 개선 및 패치 내역
- 7개 컨트롤러에 `CsrfGuard`를 클래스 및 메서드 레벨에 전면 부착하였습니다:
  - `backend/src/chat/chat.controller.ts`: `@UseGuards(..., CsrfGuard)`
  - `backend/src/club/club.controller.ts`: `@UseGuards(..., CsrfGuard)`
  - `backend/src/club/warfare.controller.ts`: `@UseGuards(..., CsrfGuard)`
  - `backend/src/collection/collection.controller.ts`: `@UseGuards(..., CsrfGuard)`
  - `backend/src/space/space.controller.ts`: `@UseGuards(..., CsrfGuard)`
  - `backend/src/admin/fx/fx.controller.ts`: `AdminFxController` 및 `PublicFxController`
  - `backend/src/economy/burn-event.controller.ts`: `SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard` 적용
- **DI 호환성 보강**:
  - `backend/src/auth/guards/csrf.guard.ts` 및 `consent.guard.ts` 생성자의 `SessionRepository` 주입에 `@Optional()`을 적용하여 가벼운 테스트 모듈에서도 안전하게 동작하도록 리팩토링.
- **테스트 격리 보정**:
  - 기존 계약 테스트(`chat.message-limit.http.test.ts`, `club.ledger-hold.test.ts`, `warfare.http.test.ts`)에 `.overrideGuard(CsrfGuard).useValue({ canActivate: () => true })`를 적용하여 비즈니스 로직 테스트 무결성 복구.

#### 4) 검증 증적 (Verification Evidence)
- **신규 보안 테스트 `backend/src/security/csrf-defense.test.ts` 신설**:
  - 7개 컨트롤러의 메타데이터에 `CsrfGuard`가 정확히 결합되어 있는지 검증 (PASS).
  - CSRF 토큰 없이 요청 시 `HTTP 403 Forbidden` (`csrf token required`) 차단 검증 (PASS).
  - 위조된 토큰 제출 시 `HTTP 403 Forbidden` (`csrf token rejected`) 차단 검증 (PASS).
  - 유효한 토큰 제출 시에만 정상 진입 허용 검증 (PASS).
  - 결과: **11/11 tests passed (100%)**.

---

### 3.2. [SEC-002] [HIGH / INFRA] PostgreSQL 5433 포트 외부 와일드카드 노출

#### 1) 취약점 원인 및 메커니즘
- 네트워크 포트 바인딩 조사(`ss -tulpn`) 결과, PostgreSQL 컨테이너가 `0.0.0.0:5433`으로 전 세계 모든 네트워크 인터페이스에 바인딩되어 있음을 확인하였습니다.
- 호스트의 `ufw` 방화벽이 비활성화(`Status: inactive`)되어 있어 외부에서 5433 포트로 직접 패킷 도달이 가능한 상태입니다.

#### 2) 권고 조치 가이드라인
1. **Docker 컨테이너 바인딩을 로컬 루프백으로 한정**:
   - 기존: `-p 5433:5432` 또는 `ports: ["5433:5432"]`
   - 권장: `-p 127.0.0.1:5433:5432` 또는 `ports: ["127.0.0.1:5433:5432"]`
2. **호스트 방화벽 활성화 및 규칙 적용**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp    # SSH 접근 유지
   sudo ufw allow 80/tcp    # Nginx HTTP
   sudo ufw allow 443/tcp   # Nginx HTTPS
   sudo ufw enable
   ```
   - 위 조치를 통해 외부 공격자의 무차별 대입(Brute-force) 및 악의적 포트 스캐닝을 원천 차단할 수 있습니다.

---

### 3.3. [SEC-003 ~ SEC-006] 안전 판정 항목 상세 (Safe Findings)

1. **SQL Injection (A03:2021) - [SAFE]**
   - 백엔드 전 소스코드 조사 결과, 문자열 연결(`$query = "SELECT ... " + input`) 형태의 동적 SQL 생성 지점이 전무함.
   - 모든 데이터베이스 쿼리는 PostgreSQL 드라이버의 파라미터화 바인딩(`$1, $2, ...`)을 철저히 준수하고 있으며, NestJS DTO 파이프라인에서 입력 타입이 엄격히 검증되어 인젝션이 불가능함.
2. **Server-Side Request Forgery (SSRF) (A10:2021) - [SAFE]**
   - 사용자 입력을 기반으로 외부 임의 URL로 HTTP 요청을 전송하는 엔드포인트 부재.
   - 헬스체크 및 거시경제 지표 수집기(`status-collector`, `outbox-worker`)는 코드상에 명시된 화이트리스트 도메인과 로컬루프백(`127.0.0.1`)만을 호출함.
3. **IDOR 및 인가 통제 (A01:2021) - [SAFE]**
   - `requireUserId(request)`를 통해 세션 컨텍스트에서 인증된 사용자의 ID만을 신뢰하며, 클라이언트가 제출한 임의의 `userId`를 쿼리 조건으로 채택하지 않음.
   - 타인의 지갑 잔고 조회, 이체, 거래 내역 열람 시도가 서버 레이어에서 원천 차단됨.
4. **인증 우회 및 권한 상승 (A07:2021) - [SAFE]**
   - 관리자 API(`/admin/*`)는 `AdminGuard` 및 `ReauthGuard`의 이중 안전망을 통과해야 하며, 민감 작업 시 15분(900초) 이내의 최근 2FA 재인증 증적이 필수 요구됨.

---

## 4. 종합 검증 결과 (Verification & Quality Assurance)

| 검증 단계 | 대상 명령어 | 수행 결과 | 상태 |
|---|---|---|:---:|
| **보안 단위 테스트** | `vitest run src/security/csrf-defense.test.ts` | 11/11 tests passed | **PASS** |
| **인증 가드 단위 테스트** | `vitest run src/auth/guards/guards.test.ts` | 34/34 tests passed | **PASS** |
| **관련 도메인 회귀 테스트** | `vitest run src/chat src/club src/admin/fx src/collection ...` | 330/330 tests passed | **PASS** |
| **타입 안정성 검증** | `pnpm --filter backend typecheck` | 0 errors, exit code 0 | **PASS** |
| **프로덕션 번들 빌드** | `pnpm --filter backend build` | `nest build` 정상 완료 | **PASS** |

---

## 5. 최종 결론 및 권고사항

머니버스 웹 애플리케이션에 대한 OWASP Top 10 기준 종합 보안 점검 결과, 소스코드 레벨의 SQL Injection, SSRF, IDOR 등 치명적인 데이터 탈취/파괴 취약점은 일체 발견되지 않았으며 견고한 복식부기 및 세션 검증 체계가 유지되고 있음을 확인하였습니다.

식별된 취약점 중 애플리케이션 레벨의 **CSRF 방어 누락 결함(SEC-001)은 7개 핵심 컨트롤러에 `CsrfGuard`를 부착하고 11건의 보안 테스트를 신설하여 100% 안전하게 패치 완료**하였습니다.

인프라 레벨의 **PostgreSQL 포트 외부 노출(SEC-002)** 에 대해서는 운영 무중단 원칙에 입각하여 본 보고서에 상세 조치 가이드를 제공하였으므로, 추후 정기 인프라 점검 시 루프백 바인딩(`127.0.0.1:5433`)으로 전환을 권고합니다.
