# Spring 공용 에이전트 스킬 — GPT/Codex 및 Gemini CLI

**버전:** v2026.11.13.2218 · **상태:** 스킬 설치 범위 · **Spring 서비스 구현·운영 변경 없음**. [English](SPRING_AGENT_SKILLS.md)

## 목적과 우선 문서

기존 NestJS/TypeScript 백엔드를 Java 21·Spring Boot로 단계적으로 이전할 때 사용할 전문 스킬입니다. 이 스킬 설치 자체는 **Spring 전환 설계 승인이나 운영 승격 지시가 아닙니다**. 착수 시 `AGENTS.md`, `GEMINI.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, Spring 설계 초안과 릴리스 문서를 확인합니다. 작업 중 메인 변경 및 다른 에이전트의 브랜치 소유권을 재확인합니다.

## GPT와 Gemini 공용 사용

양쪽 모두 `.agents/skills/<이름>/SKILL.md`를 인식합니다. 별도 `.gemini/skills` 사본 없이 미니PC Debian 사용자 `~/.agents/skills`에도 복제 설치하여 공용으로 사용할 수 있습니다. 프로젝트 전용 스킬이 사용자 전역 스킬보다 우선합니다.

**검증 제한:** 확인 시 미니PC PATH에 `gemini` 명령이 없었습니다. 따라서 Gemini CLI 대화에서의 실제 활성화는 **미검증**입니다. 설치된 Gemini CLI 세션에서 `/skills reload` 및 `/skills list`로 확인하고 프로젝트 신뢰 설정을 점검해야 합니다. Codex도 실행 중인 세션에서는 재시작이 필요할 수 있습니다.

## 전문 스킬 8종

| 스킬 | 주요 역할 |
| --- | --- |
| `spring-strangler-migration` | 점진적 Spring 전환, 모듈 경계 및 라우트 소유권 |
| `spring-api-contract-parity` | API·DTO·오류 계약 및 Next/Android 호환성 |
| `spring-security-admin-auth` | Spring Security·CSRF·관리자 Discord/Telegram OTP |
| `spring-postgres-finance-ledger` | PostgreSQL 금융 원장·SECURITY DEFINER·JDBC 안전성 |
| `spring-testcontainers-qa` | JUnit 5·Testcontainers·실제 DB/권한 QA |
| `spring-gradle-dependency-quality` | Gradle·Java 21·의존성/공급망 점검 |
| `spring-scheduler-integrations` | 배치·봇·웹훅·실시간 이벤트 단독 실행 보장 |
| `spring-runtime-observability` | JVM 성능·관측성·무중단 배포 검증 |

## 작업 규칙

각 작업에 해당하는 스킬과 기존 Superpowers 스킬을 읽고 독립 브랜치/워크트리에서 진행합니다. 작업 전/중/종료 기록, 최신 `origin/main` 확인, 실제 PostgreSQL·API·인증·Android 테스트, 정확한 SHA 증명을 적용합니다. PostgreSQL 복식부기 원장과 보안 권한을 절대로 편의상 완화하지 않습니다.

이번 설치는 실행 스크립트·추가 패키지를 포함하지 않는 Markdown 스킬입니다. 운영 프로세스, DB, 금융 데이터, 배포 설정은 변경하지 않습니다. 삭제가 필요할 때도 전역 경로의 해당 8개 스킬만 제거하여 기존 스킬은 유지합니다.
