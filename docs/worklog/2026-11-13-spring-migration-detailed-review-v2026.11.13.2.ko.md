# 스프링 전환 상세 위험·아티팩트 재검토 — 작업 기록 v2026.11.13.2

[English](2026-11-13-spring-migration-detailed-review-v2026.11.13.2.md)

## 작업 전 — 2026-11-13 KST
- 요청: 기존 스프링 전환 기획을 재검토하고 항목별 주의사항, 검증 기준, 아티팩트 보관·배포·롤백을 포함해 상세 기획 보강.
- 접근: 미니PC MCP 우선. 기존 코드/서비스/데이터 변경이 아닌 문서 계획 작업.
- 권위 확인: `AGENTS.md`, `DOCUMENTATION_POLICY`, `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`, v2026.11.13.1 영한 스프링 초안, `RELEASING`, 계약/금융 아키텍처, CI·배포 워크플로.
- 작업 시작 `origin/main`: `90965f1dd84e272e757041eb9afd8a477699eb7c`; 스프링 초안 `3a65b5e35b841da556f1543e5b6759af9b65d4c3`, PR #3142 OPEN. 새 브랜치는 검토 중인 초안에 스택으로 연결하며 다른 작업자의 작업 트리를 변경하지 않음.
- 독립 브랜치/작업 트리: `planning/spring-migration-detailed-review-v2026.11.13.2`, `/home/debian/.mv-tasks/spring-migration-review-v2026.11.13.2`.
- 초기 위험: 문서에 적힌 운영 세대(v1550)와 실행 유닛(v1546) 차이, 스왑 약 6.7GiB 사용, 기존 CI 아티팩트의 장기 롤백 보장 부재, 초안에 전체 경로·스케줄·봇별 증적과 도메인별 검증표가 부족함.
- 상태: 작업 시작. Java/DB/테스트/운영 배포 미실시.

## 작업 중 — 2026-11-13 KST
- R01~R10 위험·주의·중단조건과 G0~G6 도메인별 상세 절차·증거 양식을 영문/국문으로 작성.
- JAR/OCI/GHCR, digest, SBOM/서명·출처, 매니페스트·보관·복원, 조건부 JFrog Artifactory 선택을 별도 영·한 정책으로 작성.
- origin/main 재조회 결과 시작 SHA 90965f1dd84e272e757041eb9afd8a477699eb7c 유지, 원본 Spring PR #3142 OPEN 및 변경 없음 확인.
- RAM 가용량은 관측 시점에 따라 달라지는 수치이며 최신 관측 약 2960MiB, 기존 0.8GiB 기준과 차이 명시. v1550 문서/실행 v1546 서비스 차이를 G0 검증 대상으로 표시.
- 다음 단계: 통합문서 링크·변경 이력 추가, 영한 교차 참조·검증, 스택 PR. 서비스·DB·Test·운영 변경 없음.

## 작업 종료
- PENDING. 변경 파일, 검증 결과, GitHub 상태와 배포 미실시 여부를 작성 예정.
