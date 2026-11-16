# 머니버스 Spring 전환 실측 현황 (v2026.11.15.2020)

[English canonical](2026-11-15-spring-transition-audit-v2026.11.15.2020.md) | **한국어**

**상태:** PARTIAL / OBSERVED. **측정:** 2026-11-15 20:14~20:18 KST. **소스 기준:** GitHub `main` `f45c6e1513d3e11c9395bd2a510a26ddfee71292`. 읽기 전용 조사이며 새 기획 권위나 운영 배포 영수증이 아니다.

## 핵심 결론

Java Spring Boot 3.3.5가 127.0.0.1:4550에서 실행된다. 기존 Node.js/NestJS 백엔드도 127.0.0.1:4500에서 별도로 실행 중이며 Nginx가 API 영역별로 나누어 연결한다. Next.js, Nginx, PostgreSQL도 실행 중이다. **서버 전체 전환은 완료되지 않았다.**

*소스 매핑 수 기반 대략적인 구현 규모*는 **Spring HTTP 메서드 매핑 106개 ÷ 기존 NestJS HTTP 메서드 데코레이터 615개 = 17.24%**다. 이 수치는 서로 완전히 등가가 아닌 코드 개수 비교로서 **전체 기능 전환율, 운영 트래픽 비중, QA 합격률이 아니다.** 클래스 매핑/별칭/신규 기능 때문에 일대일 계산할 수 없다. 실제 트래픽 가중 전환율은 측정되지 않았다.

| 항목 | 실측 | 해석 |
| --- | --- | --- |
| Spring 소스 | 컨트롤러 26, HTTP 메서드 매핑 106, 별도 `@RequestMapping` 13 | 구현 존재, 기능 동등성 미검증 |
| NestJS 소스 | 컨트롤러 89, HTTP 메서드 데코레이터 615 | 기존 API 범위 여전히 큼 |
| Spring OpenAPI | `/v3/api-docs` HTTP 200, 경로 184, HTTP 작업 199 | 버전/별칭이 포함되어 199개 모두 이관된 API라는 의미 아님 |
| Spring 상태 | `127.0.0.1:4550/actuator/health` HTTP 200 `UP` | 이 포트의 `/api/health`는 404 |
| 운영 버전 | 공개 `/api/version` HTTP 200, Spring Boot 3.3.5 / Java 엔진 표시 | 전체 API가 Spring이라는 증거는 아님 |
| Nginx 라우팅 | Spring 4550, Node 4500, 내부 게이트웨이 4400. Node 기반 인증/채팅/블로그/Discord 등 경로 존속 | 혼합 서비스 가동 확인 |
| 내부 API 스모크 | 읽기 전용 GET 12개 HTTP 200 (국고, 국채, 연금, 은행, 중앙은행, 주식, 지갑, 장터, 시즌, OTP 상태, 버전 등) | 엔드포인트 도달성 확인, 로그인/금융 집행 테스트는 아님 |
| 공개 운영 스모크 | `/health`, `/api/stocks` HTTP 200 + Spring 헤더; 별도 짧은 버전 요청은 1회 타임아웃 | 전체 가용성 또는 결함 판정 불가, 추후 계측 필요 |
| 공식 Test | `test.easy-scraping.com/api/version` HTTP 200, id `cfc178ab55d95fd4f1e34a62f2d3cf17b932c12a` | 관측한 main SHA와 달라 정확-SHA Test 검증 미완료 |
| 실행물 출처 | Spring JAR 수정시각 2026-11-15 19:03:49 KST, 서비스 시작 19:03:49 | JAR과 main 커밋의 동일성 미증명 |
| Java / DB | 실행 JDK21, Gradle 컴파일 호환 Java17, PostgreSQL 17.11 | 과거 보고서의 PG16 환경 설명은 현재 서버와 다름 |

## 구현 도메인 및 잔여

Spring 컨트롤러는 국고/조폐국, 국민연금, 국채, 은행, 중앙은행, KDIC, 지갑, 카지노, 비밀시장, 장터, PvP, 시즌, 주식/리그, 프로필, 신문, 관리자 사용자/제어/보안/주식/경제, 관리자 채널 OTP 등에 존재한다. 이것은 **코드 존재 확인**이지 실기능 완료 증명이 아니다. NestJS에는 로그인/세션 연동, 채팅, 고객지원, 블로그, 미디어, 직업, 상점, 알림, SEO, 경제/공기업, 퀘스트 등 다수 모듈이 남아 있다. 메서드·경로·DTO별 호환성은 추가 검증이 필요하다.

## 문서 불일치 및 완료 조건

루트의 역사 문서 `SPRING_BOOT_MIGRATION_REPORT.md`는 전면 컷오버와 23개 API 스모크를 기록하지만 현재 혼합 라우팅 및 방대한 레거시 카탈로그와 일치하지 않는다. 기존 역사 문서는 보존하고 최신 실측으로 보완한다.

**완전 전환 승인 전 차단 항목:** 정확한 소스/JAR 배포 SHA 증명, Nest→Spring API 메서드·경로·DTO 정합성, 로그인·관리자 OTP·권한 부정검증, 격리 Test DB의 원장/멱등/롤백 금융 E2E, 독립 백업 복구, 운영 카나리 관측과 롤백 준비. 단일 헬스체크와 version 표시는 충분하지 않다.

**권장 순서:** 현재 혼합 라우팅 유지 → API 소유권/호환성 목록 자동 생성 → 인증·금융 고위험 도메인 우선 → 정확 SHA Test/최소권한 DB/보안 부정 테스트 → 트래픽·p95/p99·오류율 측정 → 도메인별 무중단 컷오버 및 복귀 게이트. 이번 조사에서 코드·Nginx·DB·운영 변경 없음.

참조: [문서 현황](../CURRENT_DOCUMENTATION_STATUS.ko.md), [문서 정책](../DOCUMENTATION_POLICY.ko.md), [통합 기획](../planning/PROJECT_PLAN.ko.md), [과거 이관 보고서](../../SPRING_BOOT_MIGRATION_REPORT.md), [작업기록](../worklog/2026-11-15-spring-transition-audit-v2026.11.15.2020.ko.md).
