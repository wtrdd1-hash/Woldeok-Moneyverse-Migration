# 참고자료 검토 — Instagram Java 가상 스레드 (v2026.11.21.1803.1)

[English](2026-11-21-instagram-java-virtual-threads-reference-v2026.11.21.1803.1.md)

> 상태: DRAFT — 게시물 메타데이터 검증, 릴스 영상·음성 전체 **미검증**. 조사 참고자료이며 **통합기획 채택 또는 구현 결정이 아님**.
> 기록일: 2026-11-21 KST. Instagram에 표시된 게시일: 2026-11-20.

## 원문과 증거
- 사용자 제공 링크: https://www.instagram.com/reel/Df966AMhwD1/?cnvx=MXVudW9sYnp4MjZteg==
- 정규 링크: https://www.instagram.com/reel/Df966AMhwD1/
- 계정/표제(공개 메타데이터): **한 바이트 CS** (`@cs.one.byte`).
- 게시물 원문 설명: **“기다리는 동안 직원을 놓아 주면 요청을 더 받을 수 있을까요? 가상 스레드를 그림으로 풀어 봤어요.”**
- 메타데이터 해시태그: `#가상스레드 #Java #자바 #스프링부트 #코딩공부`.
- 확인 방법: 2026-11-21 미니PC에서 HTTPS GET으로 Instagram HTML의 `og:title`, `og:description`, `description`, `twitter:title` 조회. 웹 검색엔진에서는 해당 릴스 콘텐츠를 찾지 못함.
- **검증 한계:** 영상 프레임, 음성·대본, 시간대별 시각 자료, 코드 예제는 추출하지 못함. 아래 내용은 **제작자의 발언으로 인용한 것이 아니라**, 공식 기술문서로 독립 검증한 기술 배경임.

## 별도 기술 문서에서 확인한 내용
1. Java 가상 스레드는 대량 동시 작업을 위한 경량 스레드이며, 특히 I/O 대기 중 OS 플랫폼 스레드 점유를 줄이는 데 도움이 될 수 있음. **동시성·처리량 개선을 위한 도구**이지 모든 요청이나 CPU 연산의 실행 속도가 빨라지는 것은 아님.
2. Java 가상 스레드는 **Java 21(JEP 444)**에서 정식 도입. Spring Boot는 Java **21 이상**에서 `spring.threads.virtual.enabled=true` 설정을 설명함. 비동기 실행기·스케줄러·사용자 지정 Executor의 영향을 개별 확인해야 함.
3. 가상 스레드는 PostgreSQL 커넥션 풀, 외부 API 호출 제한, DB 락, JVM 메모리, 네트워크 처리량 등의 자원 한도를 늘려 주지 않음. 대기열 제한·역압력·타임아웃·인증 컨텍스트·추적·실패 격리 필요.
4. 실제 효과는 I/O 패턴과 JDK/라이브러리 버전에 따라 달라짐. 처리량, p95/p99 지연, CPU, 힙, DB 풀 대기/타임아웃, 외부 API 오류, 취소 처리 및 작업 누수로 비교해야 함.

## 월덕 머니버스 적용 판단
- GitHub `main` 기준 소스 SHA `52a18d59cb71470128fa0b7739af434ad94b5ac6`의 `spring-backend/build.gradle.kts`는 **Spring Boot 3.3.5**, Java 컴파일 source/target **17**을 설정함. **소스 확인 결과일 뿐 운영 JVM 실측은 아님.**
- **결론: 자료 검토 대기열에만 등록.** 현재 Java 17 대상 소스에 가상 스레드 설정을 즉시 추가하거나 JDK/서비스를 변경하지 않음.
- 추후 독립 Test 후보: 읽기 전용 Spring MVC API, I/O 대기형 외부 API 집계, 안전한 백그라운드 I/O. 운영 잔액 DB·실제 회원 데이터를 대상으로 부하 시험 금지.
- 금융 트랜잭션·원장·정산·관리자 권한·채팅 배송은 성능만을 이유로 정합성·권한·멱등성·감사 영수증·보안 격리 규칙을 바꾸지 않음.
- 실제 적용은 통합 `PROJECT_PLAN.md`/ `INTEGRATED_PLANNING_MASTER.md`에 명시 채택, 별도 브랜치, JDK/라이브러리 호환성, 재현 가능한 Test QA, 부하·동시성 비교, 보안/DB 회귀, 독립 롤백, 정확한 버전의 운영 수용 증빙이 전제. **이번 기록만으로 도입 지시 또는 배포 승인을 추론하지 않음.**

## 추후 QA 제안 (미실행)
- [ ] 원본 영상/음성 확인 후 영상의 직접 주장과 별도 기술 설명 분리.
- [ ] 운영 JVM·빌드 JDK·라이브러리와 I/O 차단, ThreadLocal/보안 컨텍스트 사용 여부 조사.
- [ ] 현행 플랫폼 스레드와 Java 21+ 가상 스레드 후보를 동일 조건 및 제한된 DB 커넥션 풀로 Test 비교.
- [ ] DB 락/과부하, CSRF·세션·권한, 정산 멱등성 동시성 회귀 테스트.
- [ ] 처리량/지연/CPU/메모리/DB 풀/API 오류/롤백 증거와 운영 중단 조건 기록.

## 공식 기술 참고문헌
- OpenJDK JEP 444 — https://openjdk.org/jeps/444
- Oracle Java 21 Virtual Threads — https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html
- Spring Boot Task Execution and Scheduling — https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html
- Spring Boot SpringApplication / Virtual Threads — https://docs.spring.io/spring-boot/reference/features/spring-application.html
- 현재 소스 설정: [spring-backend/build.gradle.kts](../../spring-backend/build.gradle.kts)
- [실행 기준 통합기획](../planning/PROJECT_PLAN.ko.md) / [통합 기획 마스터](../planning/INTEGRATED_PLANNING_MASTER.ko.md)

**검증 구분:** 릴스 게시물 메타데이터만 확인. 영상 본문/코드 수정/운영 JVM/JDK 변경/QA/Test/Production 배포 없음.
