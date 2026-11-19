# 월덕 머니버스 단일 런타임 이관 및 장애 회고 분석서 (Post-Mortem & Lessons Learned)

> **문서 버전**: v1.0.0 (2026-11-17)  
> **프로젝트**: Woldeok Moneyverse (Java 21 Spring Boot 3.3.5 + Next.js 16.4.2)  
> **목적**: 시스템 이관 및 운영 중 발생한 8대 핵심 오류의 근본 원인(Root Cause), 해결책, 재발 방지 체크리스트를 체계적으로 기록하여 향후 유사 장애를 원천 차단함.

---

## 1. 개요 및 요약 (Executive Summary)

Node.js 마이크로서비스 데몬을 100% 순수 Java Spring Boot 단일 런타임으로 통합 이관하고 프론트엔드 복구 및 국고 자동투자(ASWF), 디스코드 봇 일원화를 완료하는 과정에서 총 8가지 주요 오류 및 장애 상황이 식별되었습니다. 각 이슈의 상세 내역과 조치 결과는 다음과 같습니다.

---

## 2. 8대 핵심 실수 및 장애 심층 분석 (Root Cause & Post-Mortem)

### [사례 1] Discord Voice Gateway DAVE 프로토콜(E2EE) 4017 오류
- **현상 (Symptom)**: Spring Boot 내 디스코드 봇 구동 시 24/7 음악/음성 채널 접속이 즉시 차단되고 `4017: DAVE protocol required` 코드로 퇴장당함.
- **근본 원인 (Root Cause)**: Discord 음성 게이트웨이 v10 정책상 종단간 암호화(E2EE - DAVE)가 강제되었으나, Discord4J 음성 클라이언트에 DAVE 네이티브 바이너리가 누락되어 암호화 핸드셰이크에 실패함.
- **해결책 (Resolution)**:
  - `build.gradle.kts`에 `moe.kyokobot.libdave:natives-linux-x86-64:0.1.2` 의존성 주입.
  - 음성 클라이언트 암호화 모드를 `AEAD_AES256_GCM`으로 설정하여 성공적으로 음성 채널(`1536572442422550538`) 상주 성공.
- **재발 방지 체크리스트 (Prevention)**:
  - 외부 플랫폼(Discord, Google, Telegram 등)의 음성/미디어 API 연동 시 최신 프로토콜 요구사항(DAVE E2EE 등)과 OS별 네이티브 바이너리(`.so`, `.dll`) 유무를 사전에 의존성에 명시할 것.

---

### [사례 2] Lavaplayer 네이티브 디코더 부재 (UnsatisfiedLinkError)
- **현상 (Symptom)**: 음성 엔진 초기화 중 `UnsatisfiedLinkError: Required library was not found at NativeLibraryLoader` 발생.
- **근본 원인 (Root Cause)**: Lavaplayer 2.2.3이 오디오 디코딩(libopus, libconnector)을 위해 플랫폼 네이티브 코드를 요구하나, 코어 라이브러리만 등록되고 `lavaplayer-natives`가 누락됨.
- **해결책 (Resolution)**: `dev.arbjerg:lavaplayer-natives:2.2.3`을 Gradle 의존성에 명시적 추가.
- **재발 방지 체크리스트 (Prevention)**:
  - JNI(Java Native Interface) 기반 멀티미디어 라이브러리 사용 시 헤드리스 리눅스 환경 대응 네이티브 아티팩트를 필수 검증할 것.

---

### [사례 3] PostgreSQL 타입 불일치 (Numeric vs Character Varying)
- **현상 (Symptom)**: 국고 ASWF 자동투자 리밸런싱(`rebalanceSwf`) 호출 시 HTTP 500 에러 발생: `column "current_valuation_wld" is of type numeric but expression is of type character varying`.
- **근본 원인 (Root Cause)**: `JdbcTemplate.update()`에 `amount.toPlainString()`을 전달할 때, PostgreSQL의 엄격한 타입 시스템이 문자열 파라미터를 numeric 컬럼에 자동 캐스팅하지 못함.
- **해결책 (Resolution)**:
  - SQL 쿼리에 명시적 타입 캐스팅(`?::numeric`) 적용: `current_valuation_wld = ?::numeric`.
- **재발 방지 체크리스트 (Prevention)**:
  - PostgreSQL SQL 쿼리 작성 시 숫자(`numeric`), 고유값(`uuid`), 시간(`timestamptz`) 컬럼은 반드시 `?::numeric`, `?::uuid` 등 명시적 캐스팅을 적용하거나 타입이 일치하는 Java 객체를 바인딩할 것.

---

### [사례 4] 데이터베이스 권한 누락 (Permission Denied for Table)
- **현상 (Symptom)**: ASWF 국부펀드 테이블 조회 시 HTTP 503 `bad SQL grammar: permission denied for table treasury_swf_configs` 발생.
- **근본 원인 (Root Cause)**: 신규 테이블 생성 및 마이그레이션이 `postgres` 또는 `root` 소유자로 실행된 후, 실제 웹 애플리케이션 계정인 `moneyverse_app`에 DDL 권한이 부여되지 않음.
- **해결책 (Resolution)**:
  - `GRANT ALL ON ALL TABLES IN SCHEMA public TO moneyverse_app;`
  - `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO moneyverse_app;` 실행.
- **재발 방지 체크리스트 (Prevention)**:
  - 모든 DB 마이그레이션 스크립트 말미에 애플리케이션 유저에 대한 권한 부여(`GRANT ALL ON ... TO moneyverse_app`)를 의무화할 것.

---

### [사례 5] F5 강제 새로고침 시 로그인 풀림 (0ms 하이드레이션 깜빡임)
- **현상 (Symptom)**: 브라우저에서 F5를 누를 때마다 약 0.5초간 프로필 아바타가 사라지고 '로그인' 버튼이 노출되어 사용자가 세션이 풀린 것으로 오인함.
- **근본 원인 (Root Cause)**: `useViewer` 훅이 초기 상태를 `useState<Viewer | null>(null)`로 시작하여, 백엔드 세션 검증 비동기 통신이 완료될 때까지 비로그인 상태로 렌더링됨.
- **해결책 (Resolution)**:
  - `localStorage`(`moneyverse_cached_viewer`)를 초기 렌더 시점에 동기식으로 즉시 조회(0ms Hydration)하도록 초기화 함수 도입.
  - SWR 백그라운드 갱신 및 멀티탭 간 `storage` 이벤트 리스너를 결합하여 일관성 유지.
- **재발 방지 체크리스트 (Prevention)**:
  - 사용자 세션 및 인증 상태는 클라이언트 마운트 즉시 캐시를 동기 로드하여 화면 깜빡임(FOUC)을 방지할 것.

---

### [사례 6] 에러 페이지 내 파괴적 세션 소거 (`localStorage.clear()`)
- **현상 (Symptom)**: 일시적인 화면 로드 실패나 라우트 에러 발생 시 사용자의 모든 로그인 토큰과 설정이 강제 삭제되어 재로그인이 강제됨.
- **근본 원인 (Root Cause)**: `error.tsx` 내에 에러 복구 명목으로 `localStorage.clear()` 코드가 삽입되어 있었음.
- **해결책 (Resolution)**:
  - `localStorage.clear()` 완전 제거.
  - 에러 정보(ID, 시간, 경로, 스택)를 `mv_screen_load_errors`에 기록하고, 백엔드 `POST /api/v1/audit/frontend-errors`로 안전 전송.
  - 3초 카운트다운 후 메인 홈(`/`)으로 자동 안전 리다이렉트 구현.
- **재발 방지 체크리스트 (Prevention)**:
  - 에러 바운더리 컴포넌트에서는 절대로 세션이나 전역 스토리지를 파괴하지 말 것.

---

### [사례 7] Next.js 16 배포본 빌드 실패로 인한 0바이트 빈 응답
- **현상 (Symptom)**: Nginx가 프론트엔드로 프록시할 때 모든 웹 페이지(`/`, `/bonds`, `/bomds` 등)에서 본문이 0바이트인 빈 청크 응답만 반환되어 흰 화면이 표시됨.
- **근본 원인 (Root Cause)**:
  - `production-current`가 가리키던 릴리즈의 `.next/export-detail.json`에 `{"success": false}`가 기록되어 있었음 (불완전/실패한 빌드 산출물).
  - Next.js 16에서 `next start`가 불완전한 산출물로 인해 페이지 렌더링 스트림을 즉시 종료함.
- **해결책 (Resolution)**:
  - 정상 검증된 배포본(`prod-v2026.11.14.1217-43ab5a5110`)으로 심볼릭 링크를 롤백 복구.
  - 포트 4501 및 포트 3001 모두 125KB 이상의 온전한 HTML 응답 서빙 확인.
- **재발 방지 체크리스트 (Prevention)**:
  - 배포 디렉토리 전환 전 반드시 로컬 curl을 통해 실제 HTML 바이트 크기(수십 KB 이상)를 검증하고 빌드 성공 여부를 확인할 것.

---

### [사례 8] 관리자 인증 응답 코드 불일치 (401 vs 403)
- **현상 (Symptom)**: `AdminGovernanceTest` 및 `AdminSecurityBoundaryRegressionTest` 단위 테스트가 `Status expected:<401> but was:<403>`로 실패함.
- **근본 원인 (Root Cause)**: `AdminAuthService.unauthorizedResponse()`에서 미인증(로그인 필요) 상태에 대해 401 Unauthorized 대신 403 Forbidden을 잘못 반환함.
- **해결책 (Resolution)**:
  - `status: 401`, `title: "Unauthorized"`, `code: "login_required"`로 HTTP 표준 규격 복원.
  - 126개 전체 단위 테스트 100% 통과(`BUILD SUCCESSFUL`).
- **재발 방지 체크리스트 (Prevention)**:
  - HTTP RFC 9110 표준을 준수하여 '인증되지 않은 사용자'에게는 401을, '인증되었으나 권한이 부족한 사용자'에게만 403을 반환할 것.

---

## 3. 종합 재발 방지 및 배포 수칙 가이드 (Operating Principles)

1. **실측 기반 검증 (Evidence First)**:
   - "다 됐습니다" 보고 전 반드시 curl, 단위 테스트, 로그를 통해 실제 응답 바이트와 상태 코드를 숫자로 확인할 것.
2. **비파괴적 에러 처리 (Non-Destructive Resilience)**:
   - 장애 발생 시 사용자 세션을 날리지 말고, 상세 원인을 기록한 뒤 안전한 기본 화면(홈)으로 유도할 것.
3. **엄격한 타입 및 권한 검증 (Strict Schema & Security)**:
   - PostgreSQL 쿼리와 Spring DTO 간 타입 일치성을 유지하고, 스키마 변경 시 권한(GRANT)을 즉시 동기화할 것.
4. **빌드 무결성 확인 후 릴리즈 (Build Integrity Assurance)**:
   - 프론트엔드/백엔드 배포 시 빌드 산출물의 정상 종료 상태(`success: true`)를 확인한 뒤 심볼릭 링크를 교체할 것.
