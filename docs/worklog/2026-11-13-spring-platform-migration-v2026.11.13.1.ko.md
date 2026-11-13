# Spring Boot 플랫폼 전환 — 작업기록 (v2026.11.13.1)

[English canonical](2026-11-13-spring-platform-migration-v2026.11.13.1.md)

## 작업 전 — 2026-11-13 KST
- 사용자 지시: 기존 TypeScript/NestJS 백엔드를 Java/Spring Boot로 **전체 시스템 절차에 따라 전환하기 위한 기획 시작**. 이는 기획 지시이며 운영 코드 즉시 교체 승인은 아님.
- 접근 경로: 우선 지정된 미니PC MCP의 `system_exec_command` 사용.
- 기준: `wtrdd1-hash/Woldeok-Moneyverse-Migration`, 작업 전 갱신한 `origin/main` = `90965f1dd84e272e757041eb9afd8a477699eb7c`.
- 격리: `planning/spring-platform-migration-v2026.11.13.1` 브랜치와 별도 worktree. 원본 main 작업공간 및 기존 `ops/telegram/__pycache__/` 미추적 파일은 건드리지 않음.
- 우선 검토 문서: `AGENTS.md`, 통합 및 Living 기획서(영/한), `docs/RELEASING.md`, 문서 기록 정책, 국고·금융 아키텍처, 관련 Superpowers 스킬.
- 초기 코드 수치: 프론트 TSX 898/TS 764, 백엔드 TS 900, NestJS 컨트롤러 89/서비스 52, DB migration 추적 파일 345. 코드를 열거한 값이며 동등성 검증 결과는 아님.
- 확인 필요 충돌: `AGENTS.md`의 Kubernetes/Flux 설명과 `docs/RELEASING.md`의 Debian systemd/Nginx 설명이 다르며 실제 호스트에는 systemd 서비스가 있음. 승격 전 배포 토폴로지 재실사가 필수.
- 하드웨어 관찰: RAM 약 7.9 GiB, 사용 가능 약 0.8 GiB, Swap 사용 약 6.5 GiB. 현 운영 호스트에 상주 JVM을 추가하지 않음.
- 기존 통합문서의 QA 및 금융 경고는 **과거 기록**이며 현재 통과/실패 판정으로 대체하지 않음.
- 절차: Superpowers 아키텍처 기획 → 초안 → 사용자 검토 → 구현계획 승인 게이트. 이 단계에서 구현 금지.


### 중간 체크포인트 — 2026-11-13 KST
- 전체 NestJS 모듈·JS 봇·외부 연동·Android·DB/보안·운영과 최종 NestJS 종료를 포함한 영/한 설계 초안을 작성. Spring 모듈형 G0~G6 단계 이관을 권장하고 금융 쓰기는 한 주체만 활성화하도록 규정.
- 기획 버전 메모, 영/한 프로젝트/통합 기획서 참조, 양쪽 CHANGELOG를 반영. 기존 기능 초안은 보존.
- 작업 중 `origin/main` 재조회: `90965f1dd84e272e757041eb9afd8a477699eb7c` 유지, 현 시점 main 추가 변경 없음.
- G0 기준을 조정: 미해결 금융 자금 출처는 금융 전환/운영 승격을 차단하지만 별도 보안·Test 게이트를 충족한 비쓰기 격리 기초 작업은 허용.
- 내부용 및 GitHub 공개용 영/한 업데이트 문서 4개를 기존 문서 관례에 맞춰 생성하고 기획 버전 메모와 연결.
- 실제 서비스·DB·기능 코드 변경 없음.

## 작업 중 — 점검표
- [x] 목표·범위 설정, 아키텍처 작업으로 분류
- [x] 코드와 통합문서 확인, 별도 브랜치 격리
- [ ] 영문 정본/한글 번역 전환 상세 기획 및 단계별 이행 작성
- [ ] Living/통합 기획서에 참조 반영
- [ ] 기획 버전 릴리스 메모, 내부·GitHub 변경 기록 반영
- [ ] 중간 `origin/main` 재조회, 충돌 여부 점검
- [ ] 영/한 의미 동등, Markdown 링크, 변경 범위 검증
- [ ] 브랜치 커밋·푸시 및 리뷰 요청

## 작업 종료
아직 미완료. 시작 체크포인트에서는 실제 Java 구현, Test 배포, Production 승격, DB/회원 자산 변경, main 병합을 수행하지 않음.
