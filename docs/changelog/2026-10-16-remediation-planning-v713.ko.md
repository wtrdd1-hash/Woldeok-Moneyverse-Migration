# v2026.10.16.713 — 전체 문제 수정 상세 기획서 변경 기록

[영문 정본](2026-10-16-remediation-planning-v713.md). **상태 PLANNING**, 구현·운영 승격 아님.

- 전 도메인 P0/P1/P2와 전체 승인 게이트를 포함하는 영한 통합 수정 기획 신설.
- 현재 NUMERIC 원장 구조, 계좌·국고·조폐 삼중 대사, PvP 3계좌 수수료 정산과 SQL 권한 순차 회수에 관한 영한 P0 상세설계 신설.
- 실제 후보 파일, 부정/동시성/멱등 테스트, 담당권한과 브랜치 선후조건, 배포 중단/복원까지 포함한 영한 26개 실행 작업표 신설.
- v701 PUBLIC 고권한 DB 함수 개선을 반영하고 v711 감사, v710 블로그, v712 동시 기획을 보존함. PostgreSQL/OWASP/Google/Next.js/GitHub 공식 참고문헌 첨부.
- 제품 소스/원장/DB/사용자 세션/기능 스위치/실제 Test 또는 운영 릴리스에 변경 없음.

[종합기획](../planning/PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.ko.md) · [금융 상세](../planning/P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.ko.md) · [작업표](../planning/REMEDIATION_IMPLEMENTATION_TASK_MATRIX_v2026.10.16.713.ko.md)
