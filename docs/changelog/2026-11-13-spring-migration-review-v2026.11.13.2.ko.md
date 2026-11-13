# v2026.11.13.2 — 스프링 전환 위험 검토·아티팩트 관리

**상태:** DRAFT / 문서만 변경 / 운영 미배포 · [English](2026-11-13-spring-migration-review-v2026.11.13.2.md)

- v2026.11.13.1 Spring 아키텍처 1~9장을 다시 검토하고 R01~R10 위험·주의·시험/중단 기준 작성.
- G0~G6 단계에 도메인별 역할, API/클라이언트/보안/DB 검증, 공식 Test, 무중단 전환/복귀 기준 추가.
- 현재 GHCR/Actions 재활용과 조건부 Artifactory 선택, JAR/OCI digest/출처·SBOM·보관·복원에 관한 영·한 명세 작성.
- 작업 기록, 내부/GitHub용 이력 추가. 기존 초안 PR #3142, 후속 스택 PR #3144.
- main 기준 90965f1dd84e272e757041eb9afd8a477699eb7c. Java·DB·Test·운영·금융 데이터 변경 없음.

[상세 기획](../planning/SPRING_PLATFORM_MIGRATION_DETAILED_REVIEW_v2026.11.13.2.ko.md) · [아티팩트 명세](../planning/SPRING_PLATFORM_MIGRATION_ARTIFACT_POLICY_v2026.11.13.2.ko.md).
