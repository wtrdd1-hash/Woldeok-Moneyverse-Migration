# v2026.11.17.2 — 전체 프론트엔드 Spring 전환
## 시작 전 (2026-11-17 KST)
- 지시: 백엔드에 이어 **Next.js 178개 화면 및 124개 API 핸들러도 Spring Boot 기반 웹 프론트엔드로 전환**. 기존 Next 유지 기획은 새 지시로 목표 수정, 단 운영의 무검증 일괄 전환은 금지.
- 최신 origin/main 8b3e3aca3a8f8504535000c6a02a992acaf3c1a7, 통합 기획서·PROJECT_PLAN·AGENTS·RELEASING·현재 실행 코드 확인.
- 병렬 작업 보호: 격리 브랜치 feature/full-spring-web-foundation-v2026.11.17.2 및 독립 worktree 사용, 기존 작업자 파일은 만지지 않음.
- 기존 P0 관리자 보안/금융 문제(PR #3207) 해결 전 운영 금융·인증 API를 전환하지 않음.
- 이번 단계: 실제 작동하는 Spring MVC 페이지 SSR 기반, 영어 기본/한국어 보조, 안전한 공개 읽기 경로, 전체 페이지/API 기계적 목록과 미전환 상태, 테스트 및 단계별 전환 관문.
- 테스트: 먼저 실패 테스트 작성, 통과 코드 구현, Java 빌드·테스트 및 가능 시 격리 HTTP. 운영/DB/금액 무변경. 전체 전환 완료와 이번 1단계 구현 구분.
## 진행 중
- 대기.
## 종료
- 대기. 운영 승격 없음.

### 중간 기록 1 — 실제 Spring 웹 구현
- origin/main 재조회. Thymeleaf Spring MVC 미리보기 /spring-web, /spring-web/status 구현. 영어 기본·한국어 보조, 안전한 HTML 이스케이프, 반응형 CSS.
- 공개 상태는 기존 읽기 전용 public.content_public_status() 함수에서만 수집, DB 장애 시 noindex/private HTTP 503. 운영 기본 플래그 비활성, 격리 Test만 활성.
- TDD 초기 컴파일 실패 확인, Thymeleaf 의존성 온라인 해결, JDK25 Byte Buddy 호환 문제를 Gradle 테스트 JDK21 고정으로 회피.
- Java 6/6 테스트 통과. 운영/금전 기능 변경 없음. 다음은 178페이지·124 API 표준 경로 현황 작성.

### 중간 기록 2 — 전체 소스·실 HTTP 검증
- 최신 main은 초기 177(다른 worktree)과 달리 화면 178개, API 124개, 전체 302개. 경로 누락 검사 4/4 통과, 정식 전환 0건.
- 통합 기획서·PROJECT_PLAN 목표 변경 및 G0~G6 영문/한국어 기획 작성.
- Spring clean test bootJar 결과: JAR 생성됐으나 107개 테스트 중 1건 FAIL (기존 EngagementController/DopamineController가 /api/engagement/dopamine/status 중복 매핑). 전체 QA 통과 아님.
- 실 HTTP 임베디드 Test에서 한국어 렌더링·CSS·DB 장애 503 검증. 기능 OFF 시 CSS 폴더가 200으로 노출되는 현상을 발견해 별도 /assets 위치로 이동했고, OFF 시 404 테스트로 보호.
- Spring 새 웹 관련 10/10 PASS, Python 목록 4/4 PASS. 운영 라우팅·금전 변경 없음.
