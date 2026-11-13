# 전 시스템 Spring Boot 전환 — 아키텍처 설계 (초안)

**기획 버전:** v2026.11.13.1 · **기준일:** 2026-11-13 KST · **상태:** 초안 / 사용자 검토 필요 / 런타임 작업 미승인

[English canonical](2026-11-13-spring-platform-migration-design.md) · [작업기록](../../worklog/2026-11-13-spring-platform-migration-v2026.11.13.1.ko.md)

[v2026.11.13.2 장별 주의·상세 이행 계획](../../planning/SPRING_PLATFORM_MIGRATION_DETAILED_REVIEW_v2026.11.13.2.ko.md) · [아티팩트·Artifactory 보관/롤백](../../planning/SPRING_PLATFORM_MIGRATION_ARTIFACT_POLICY_v2026.11.13.2.ko.md) (검토용 보완 초안).

## 1. 사용자 지시·성공 조건·범위

사용자는 기존 TypeScript/NestJS 백엔드를 **전체 시스템 절차에 따라 Java/Spring Boot로 전면 전환**하도록 기획 시작을 지시했다. 대상은 국고만이 아니라 **기존 전체 백엔드/API, 비동기 작업, 외부 연동, 관리자 기능, 예약 작업**, 나아가 NestJS 종료까지다.

**최종 구조:** Spring Boot가 유일한 정식 애플리케이션 백엔드가 된다. 초기에는 브라우저 화면인 Next.js/React/TypeScript를 그대로 유지하고 Android/Compose 앱도 별도 클라이언트로 유지한다. PostgreSQL은 정식 금융 전표와 잔액 처리의 권위를 유지한다. 화면 전체를 Spring MVC/Thymeleaf로 바꾸는 것은 별도 제품·SEO·UX 결정이 필요하다. 브라우저 JavaScript를 Java 바이트코드로 단순 대체할 수는 없다. 기존 JS 봇과 빌드/운영 스크립트는 목록화하여 Java로 이전하거나 운영자 검토가 기록된 예외로 남긴다.

**완료 판정:** 기존 엔드포인트·명령·스케줄·소켓 이벤트·웹훅·봇 명령·Android 계약·관리자 기능마다 동등성 확인 또는 명시적 폐기 기록이 있다. 모든 정식 쓰기는 한 시점에 하나의 주체만 담당한다. Next/Android가 NestJS 없이 동작하고 실제 Test 및 Production에서 금융·보안·복구 게이트를 통과해야만 NestJS와 불필요한 Node 워커를 종료한다.

현재 문서는 **아키텍처 기획 초안**이다. Java 서비스 생성, DB 권한 변경/마이그레이션, Test 배포, 운영 트래픽 전환, 기능 동작 완료 선언은 수행하지 않는다.

## 2. 근거와 권위 문서

- 확인 시작 시 `origin/main`: `90965f1dd84e272e757041eb9afd8a477699eb7c` (2026-11-13). 우선 확인한 문서: `AGENTS.md`, `docs/planning/PROJECT_PLAN(.ko).md`, `docs/planning/INTEGRATED_PLANNING_MASTER(.ko).md`, `docs/RELEASING.md`, `docs/INFRASTRUCTURE.md`, `docs/architecture/FINANCE_INTEGRITY_CORE(.ko).md`, `docs/architecture/TREASURY_CORE(.ko).md`, `packages/contract/src/route-map.ts`.
- 추적 파일 조사: 프론트 TS 764·TSX 898, 백엔드 TS 900, NestJS controller 89개·service 52개, DB migration 추적 파일 345개. **파일 개수일 뿐 API 커버리지·동작 성공을 입증하지 않는다.** 대상 폴더는 account/activity/admin/auth/bank/blog/board/business/casino/central-bank/chat/club/collection/content/crafting/discord/economy/engagement/game-clock/health/help/lobby/marketplace/mint/notification/privacy/profile/scheduler/security/seo/shop/stock/support/telegram/wallet/work 등을 포함한다.
- 현 구조: 브라우저 -> Next.js BFF(`frontend/src/lib/api.ts` server-only) -> NestJS -> PostgreSQL `SECURITY DEFINER` 함수. Socket.IO 및 서명된 Discord interactions는 제한된 외부 진입이다. 원장 불변식과 PostgreSQL 함수 권한은 그대로 지킨다. `packages/contract`의 공유 TS 타입만으로 Java 런타임 검증을 대신할 수 없으므로 별도 계약 생성·실제 검증이 필요하다.
- Android 저장소 `wtrdd1-hash/woldeok-moneyverse-app`의 현재 `app/build.gradle.kts`에서 Compose, Retrofit/OkHttp, Socket.IO 클라이언트 사용을 확인했다. Android 계약, 디버그·릴리스 URL은 별도로 검증한다. 오래된 로컬 Android 체크아웃은 정본으로 취급하지 않는다.
- **배포 설명 충돌:** `AGENTS.md`에는 Kubernetes/Flux가, `docs/RELEASING.md`에는 Debian systemd/Nginx의 불변 Test/Production 세대가 기술되어 있다. 미니PC systemd 서비스 목록을 확인했지만 이것만으로 실제 대외 트래픽 경로가 증명되지는 않는다. G0에서 DNS·인그레스·TLS·Test 주소·PID·릴리스 경로·클러스터·롤백 대상을 재실사한다.
- 미니PC 관찰 수치: RAM 약 7.9 GiB, 사용 가능 약 0.8 GiB, Swap 사용 약 6.5 GiB, Java 21 설치. **용량 검증과 격리 없이 Production에 상주 JVM을 추가하지 않는다.**
- 기존 통합 기획서에는 QA 실패·금융/국고 출처 인증 및 실행 버전 불일치 기록이 있다. 이는 **과거의 확인 필요 항목**이지 최신 운영 상태나 실제 손실 증거가 아니다. 매 후보 SHA에서 재측정한다.
- 구현 전 최신 지원버전 재확인 근거: [Spring Boot 요구사항](https://docs.spring.io/spring-boot/system-requirements.html), [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [Spring 트랜잭션](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html), [관측성](https://docs.spring.io/spring-boot/reference/actuator/observability.html), [Spring Modulith](https://docs.spring.io/spring-modulith/reference/fundamentals.html).

## 3. 대안 비교와 권장 구조

| 대안 | 이점 | 위험 | 판단 |
| --- | --- | --- | --- |
| 웹 UI와 DB까지 한 번에 Java로 재작성 | 향후 단일 언어처럼 보임 | 로그인·SEO·금융·서비스 복구가 동시에 위험 | **배제** |
| 처음부터 Spring 마이크로서비스를 수십 개 구축 | 일부 확장성 | 8GB 미니PC·분산 트랜잭션·운영 복잡성 증가 | **기본안 배제** |
| **Spring Boot 모듈형 백엔드 + 경로별 점진 이관** | 초기 단일 배포 단위, 기능별 시험/복귀, 최종 NestJS 종료 | 전환 기간 기존/신규 서비스 병행 및 명확한 경로 소유권 필요 | **검토 권장안** |

Java 21과 지원 중인 안정 Spring Boot 버전(의존성·보안 감사 후 확정), 기본 Spring MVC, Spring Security, 승인된 DB 함수 호출용 JDBC, Actuator/Micrometer, OpenTelemetry 호환 추적을 후보로 한다. 기존 적용된 migration의 권위를 Flyway/Liquibase/Hibernate 자동 스키마 관리로 이전하지 않는다. Spring Modulith는 모듈 경계 검증에 유용한 후보지만 선검증 없이 필수 도입하지 않는다. Gradle/Maven은 운영 호스트·CI 용량과 기존 규약을 검증해 선택한다. 초기에는 수십 마이크로서비스가 아니라 **단일 Spring 배포 단위**로 관리한다.

### 목표 요청/명령 흐름

```text
브라우저 / Android / 허용된 외부 연동
       |                 |
 Next.js BFF         Android 앱 계약/게이트웨이
       |                 |
 인증된 내부 경로별 라우팅 / 제한된 인그레스
       |-----------------|-----------------|
 NestJS(미이관 경로 소유)     Spring(이관된 경로 소유)
       |                        |
       |------------------------|
                  |
        PostgreSQL 권한 제한 함수 API
        append-only 복식원장 + 감사 + outbox
```

**하나의 경로는 한 시점에 한 백엔드만 정식 처리**한다. Shadow 요청은 읽기 전용이며 거래·조회 카운터·알림 발송·개인정보 노출을 발생시키지 않는다. Next BFF 또는 허용된 내부 라우팅에서 기능·경로별 되돌리기 스위치를 제공하고 공개 URL은 유지한다. 동일 출처 HttpOnly 쿠키, 내부 API 토큰 보호, Android 인증 계약을 유지한다.

### Spring 모듈과 기존 코드의 대응

| Spring 모듈 | 기존 경계(일부) | 이관 방식 |
| --- | --- | --- |
| identity-access | `backend/src/auth`, `account`, `security`, `privacy` | 계약/세션 동등성 후 관리자 재인증 |
| community-content | `board`, `blog-editorial`, `content`, `seo`, `support`, `help` | 공개 조회부터, 이후 쓰기·발행 |
| member-engagement | `profile`, `activity`, `work`, `engagement`, `progression`, `collection`, `club`, `chat` | 저위험 조회 후 인증 명령 |
| market-game | `shop`, `stock`, `marketplace`, `business`, `casino`, `crafting`, `game-clock` | 비금융 조회부터, 원장 관련 쓰기는 마지막 |
| financial-control | `economy`, `wallet`, `bank`, `mint`, `central-bank`, 국고·국부펀드·연금·국채 | 최후 이관, 원장 단일 권위 |
| admin-operations | `admin`, `notification`, 기능 스위치·QA·관측 | 권한표·OTP/재인증·감사 동등성 |
| realtime-integrations | `lobby`, `discord`, `telegram`, `bot/`, Minecraft | 서명·Socket.IO·이벤트 프로토콜 검증 |
| batch-schedulers | `scheduler`, Discord outbox, 블로그 자동발행, 경제 AI 및 호스트 타이머 | Job별 한 명의 활성 리더/임대 |

각 하위 구현 명세에는 import, 엔드포인트, SQL 함수, 권한 guard, 이벤트 소비자, 타이머 소유자, 기능 스위치, 오류 상태, DTO, Android 소비 지점, 검증 테스트를 모두 열거한다. 코드 자동 변환으로 동등성이 보장된다고 가정하지 않는다.

## 4. 금융·DB 불변식 — 전환 중단 조건

1. **PostgreSQL을 정식 금융 원장으로 유지.** JPA `save()`로 원장을 직접 수정하지 않는다. 승인된 migration 소유 `SECURITY DEFINER` wrapper만 정식 금융 거래를 기표할 수 있다. 테이블 직접 쓰기 권한 추가·감사 비활성·Spring 자동 DB 초기화 금지. 앱 역할에는 필요한 함수 `EXECUTE`만 부여하며 각 환경에서 실제 유효 권한을 측정한다.
2. 차변=대변, 잔액 비음수 제한, 계정 잠금 순서, 동일 트랜잭션 outbox, 원장/감사 기록 append-only, 오류는 원거래를 참조하는 보정 전표로 처리한다. **회원 잔액 삭제·초기화 금지.**
3. 금융 명령의 멱등키 잠금·재생 조회·행위자 소유권 검증 순서를 Nest/Spring 병행 단계에도 동일하게 적용한다. **중복 쓰기와 분리 원장 금지.** 도메인별 fencing 방식으로 하나의 명령 소유자를 강제하고 구 소유자의 재시도 차단을 검증한다.
4. 금액은 JSON·DTO 전 구간에서 부호와 정규화가 검증된 10진수 **정수 문자열**로 보존한다. Java에서는 `BigInteger` 등 정밀한 정수 타입 및 명시적 직렬화를 사용한다. 부동소수 금액·암묵적 반올림 금지. PostgreSQL 마이크로초 시각/UTC 및 KST 경계 유지.
5. `backend/src/core/pg-error.ts`의 SQLSTATE→HTTP/JSON 계약을 유지한다. 의도된 `42501` 역할 거부와 실제 GRANT 누락을 구분하고 400/401/403/404/409/410/429/503을 fail-closed 처리한다. 실제 PostgreSQL 동시성·권한 음성 시험·재시도 대사가 필수다.
6. DB 변경은 `packages/database` 정본 순서에 따라 전방 migration만 허용하고 체크섬을 검증한다. Gemini·타 개발 브랜치와 SQL 번호 및 충돌을 조율한다. 적용 SQL 덮어쓰기나 Hibernate 자동 DDL 금지.

## 5. 인증·관리자·연동·클라이언트 동등성

- 기존 세션 쿠키 이름/domain/path/SameSite/Secure/HttpOnly, 서버 세션 스키마, 만료·갱신·로그아웃·동의·행위자 결속·CSRF·내부 토큰을 유지한다. 경로 전환 때문에 로그인을 강제 해제하지 않는다. OAuth callback·재인증·관리자 역할과 **실제로 구현된 Discord/Telegram 일회용 인증 흐름**을 소스와 대조해 테스트한다. 제거된 2인 승인 기능을 되살리지 않는다.
- Spring 외곽 권한 검사와 DB 함수 내 행위자 제한을 모두 검증한다. 위험 금융 관리자 명령은 최신 추가 인증·재사용 방지, 모든 시도는 감사 근거를 유지한다.
- Discord 웹훅은 변조되지 않은 원본 바이트 서명을 검증하고, 외부 공개 진입은 정확한 경로·요청 제한·서명 검증만 허용한다. Telegram 명령·콜백, 봇 상태, Minecraft 연결, 외부 알림 인증을 각각 검증한다.
- Socket.IO 프로토콜·namespace·재접속/ack·세션 쿠키·룸/이벤트 계약을 웹·Android 클라이언트에서 확인한 후 Node 소켓 서버를 종료한다. Java에서 합리적 비용으로 동등성을 달성할 수 없다면 검토·승인된 예외로 기존 게이트웨이를 유지한다.
- 기존 route-map 및 OpenAPI/API 계약을 Nest·Spring·Next·Android 공통 검증 fixture로 사용한다. Java 전환 중 브라우저에 내부 토큰·비밀이 노출되면 즉시 중단한다.
- 공개 SSR/ISR SEO, 회원/관리자 noindex·no-store, 기존 한국어 화면 문구, 영문 정본+한국어 2차 언어, 키보드·모바일 대응, 블로그 공개 주소는 별도 제품 승인 없이 바꾸지 않는다.

## 6. 단계별 전환 및 단계 종료 기준

아래는 **작업 순서**이며 완료 시한·배포 약속이 아니다. 매 단계는 자체 검토된 명세, 사용자 승인, 작은 TDD 구현 단위, 독립 Git 브랜치/PR, CI, 정확한 SHA의 격리 Test, 실제 백엔드/DB 검사 및 근거가 확인된 무중단 운영 승격을 요구한다. 각 단계 시작 및 중간에 `origin/main` 재조회한다.

| 단계 | 범위·산출물 | 종료 게이트 |
| --- | --- | --- |
| **G0 — 실사·복원 선행** | 전체 API·경로·워커·봇·Android 인벤토리, DB ACL·SQL 체크섬·원장 대사, 실제 운영 SHA/토폴로지, 백업·독립 복원, 지연/RSS/CPU/디스크 기준선, 실제 Test 환경 | 금융·버전·출처 미확인 사항을 전부 목록화한다. 미해결 금융 출처·배포 신원은 G5 및 운영 승격을 차단하되, G1의 별도 보안·Test 조건을 만족하는 비금융·비쓰기 격리 검증은 허용한다. 재현 가능한 기준선과 실제 Test 경로·중단 항목 등록 |
| **G1 — Java 기반** | 승인된 Java/Spring 의존성, 모듈 경계, 최소 DB 권한, 오류·DTO 계약, CI, 비밀 관리, 준비 상태·관측, 기능 스위치, Test 전용 배포 | 실제 격리 PostgreSQL 함수/인증 계약 시험. 공개 쓰기 및 운영 JVM 추가 없음 |
| **G2 — 공개·비금융 조회** | 공개 콘텐츠/도움말/상태 및 선별된 회원 GET을 경로별 라우팅으로 이관 | 응답·401/404/503·캐시/SEO·Android 동등성, 즉시 복귀 스위치 |
| **G3 — 인증·커뮤니티 쓰기** | 계정·세션·동의, 커뮤니티/블로그/고객지원 쓰기와 발행, 개인정보, 관리자 읽기·감사 | CSRF/OAuth/세션 유지, 타인 권한 음성, 발행/outbox 중복 0, 클라이언트 E2E |
| **G4 — 게임·실시간·배치·연동** | 비금융 상점/게임/마켓, 소켓/채팅, Discord/Telegram/Minecraft, 알림, 스케줄러/워커 리더 | 웹훅 서명, 소켓·모바일 계약, 활성 작업 리더 최대 1개, 이벤트/정산 누락·중복 없음 |
| **G5 — 금융 쓰기 도메인별 이관** | 지갑·은행·주식 정산·국고·조폐국·SWF·연금·국채·관리자 금융 명령을 동일 정식 SQL 함수 경유 | 동시 재시도에서 원장 불일치·고아/중복 영수증 0, 최소 권한·비음수, 국고 자금 출처 인증 |
| **G6 — 전체 전환·기존 서버 종료** | 모든 API/Job의 결과 확정, NestJS 쓰기·경로 소유권 종료, 낡은 Node 서비스 제거, 운영문서·QA·복구 훈련 | 승인된 24시간 이상 안정 관찰, 검증된 롤백 파일, 정확한 SHA·세션·DB 인증, 종료에 대한 운영자 승인 |

사용자 아키텍처 승인 후 세부 기획 분리: (A) 실사·플랫폼·보안·배포; (B) 공개·커뮤니티·인증; (C) 실시간·봇·스케줄러; (D) 게임·시장; (E) 금융·국고·관리자; (F) 최종 운영 전환. 각각 별도 버전·설계→상세 구현계획→범위 한정 PR을 사용한다. 이 초안만으로 배포가 승인되는 것은 아니다.

## 7. 시험·성능·전환·복귀

**전환 전:** 정식 DB·백엔드/프론트 실제 실행 SHA, 공식 Test 주소·격리 DB 스냅샷, 외부 독립 백업 복원, SQL 유효 권한, 웹훅 비밀, 세션 동등성, 리버스 프록시의 실제 경로 소유자를 확인한다. 기존 실패 시험을 분류하고 임의 면제하지 않는다. 관리자 포함 전체 화면/기능 QA는 현 기준 문서가 요구하는 후보당 5회 완주를 반영한다.

**계약 시험:** 목록화한 모든 경로와 Android에서 method/status/header/body, 401/403/404/409/429/503, 잘못된 행위자, CSRF 누락/변조, 서명 위조, OTP 만료/재사용을 확인한다. 동일 DB 스냅샷에서 실제 결과를 비교하고 네트워크 단절·재시작을 주입한다. 실제 PostgreSQL로 동시 거래·write 후 read·멱등 재시도·rollback·원장 불변성을 검증한다. 목(mock)만 통과한 것은 승인 불가다.

**성능:** 동일 하드웨어/트래픽에서 기존 p50/p95/p99, SQL·JVM 처리시간, GC 정지, RSS, 시작 지연, scheduler lag, 연결 풀을 측정한다. **잠정** 게이트는 Java 후보 p95가 검증된 기존 대비 110% 이내이면서 제품 SLO도 만족하는 것이다. 금융 명령 오류율 증가 허용 0. 절대 응답시간 목표는 G0 실측으로 확정한다. 사용 가능한 RAM을 초과하여 Swap 고갈을 유발하는 상주 JVM/풀을 추가하지 않으며, 부하 시험은 격리 Test에서 수행한다.

**트래픽 전환:** 쓰기 없는 Shadow 조회 → 격리 Test → 내부 미리보기 → 소수 운영 조회 트래픽 → 점진 확대. 쓰기 경로는 구 소유자를 fencing으로 중지한 뒤 새 소유자만 실행한다. **동시 활성 쓰기 두 개 금지.** 후보 SHA/롤백 주소를 함께 기록하고 스키마 불일치 시 즉시 중단한다.

**즉시 중단 기준:** 원장 불일치, 권한 확대, 타인 정보 노출, 세션 손실, 관리자 인증 우회, 스케줄러 중복 소유, 복원 실패, 배포 SHA 미확인, 실제 코드 출처 불명. 비금융 오류율·지연 경계는 G0에서 실제 SLO에 근거해 수치화한다. 롤백은 검증되고 보존된 이전 NestJS 아티팩트로 경로를 되돌리며 DB는 양쪽 호환 상태를 유지한다. 이미 기록된 원장은 삭제·초기화하지 않고 보정 전표만 사용한다.

## 8. 문서·브랜치·동시 작업 관리

- 영어가 공식 정본이며 한국어를 2번째 언어로 동시 유지한다. 권위는 `docs/planning/PROJECT_PLAN.md` → `INTEGRATED_PLANNING_MASTER.md` → 명시적으로 채택한 상세 설계 순이다. 이 문서는 검토 전 **상세 기획 후보**다.
- 모든 작업은 `docs/worklog/`의 작업 전·중·종료, 기획 버전, 내부/GitHub 변경 기록, 별도 브랜치·worktree, 작은 PR, 검토자를 남긴다. Gemini·다른 자동 브랜치의 작업 소유권을 사전 확인하고 SQL migration·경로 소유권을 중복 수정하지 않는다.
- 런타임 작업에는 정확한 SHA의 Test/Production, 로그인·브라우저·Android E2E, DB 권한 음성 검사, 독립 백업 복원, Nginx/엣지 카나리, 무중단 전환과 검증된 롤백이 필수다. **문서만 변경한 PR은 운영 배포 후보가 아니다.**
- `AGENTS.md`와 `docs/RELEASING.md`의 토폴로지 불일치는 **미해결**로 유지한다. 한 문서만 임의로 정답으로 정하지 않고 실제 공개 트래픽을 추적한다.
- 기획 수정은 단계별 버전으로 올리고, 실행 버전은 실제 코드 후보·검증 이후 별도 부여한다. 시험·승격·GitHub Release를 미리 완료로 기록하지 않는다.

## 9. 검토·승인 대상

**권장:** 기존 Next.js 웹 표현 계층과 PostgreSQL 금융 엔진은 유지하며 **서버 전체를 Spring Boot 모듈형 백엔드로 전환**한다. 외부 연동 일부가 기술적으로 동등하지 않다면 사용자 검토 후 명시적 예외로 유지하고, 운영 교체를 강행하지 않는다.

**실제 구현계획 작성 전 사용자 검토 사항:**
1. '전면 Spring 전환'의 범위를 전체 백엔드·배치·관리자·봇/연동으로 하되 **Next.js UI 및 PostgreSQL 원장은 유지**하는지.
2. 일괄 재작성·무리한 마이크로서비스 분할 대신 **모듈형 Spring + 기능별 단계 이전**을 수용하는지.
3. **금융 마지막**, 활성 쓰기 주체 1개, 운영 DB 초기화 금지, 실제 Test·복원·중단 및 복귀 게이트를 수용하는지.

승인 후 `skills/writing-plans/SKILL.md` 절차에 따라 **G0·G1의 상세 구현계획부터 별도로 작성**한다. 이후 단계도 각각 추가 설계 승인과 독립 검증이 필요하다.
