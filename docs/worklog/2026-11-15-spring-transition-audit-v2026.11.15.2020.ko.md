# 작업 기록 v2026.11.15.2020: Spring 전환율 실측 감사

[English canonical](2026-11-15-spring-transition-audit-v2026.11.15.2020.md) | 한국어. 상태: 읽기 전용, 운영 릴리스 없음.

- 시작 (20:14 KST): 권위 문서, $pc 서비스, Debian 프로세스 확인. Spring과 Node 병행 가동.
- 중간 (20:15~20:17 KST): Nginx 경로 소유권, GitHub main `f45c6e1513d3e11c9395bd2a510a26ddfee71292`, 소스 컨트롤러/HTTP 메서드 수와 Spring OpenAPI 확인. GET 읽기 전용 스모크. 공식 Test SHA가 main과 다름. DB/운영에 쓰기 없음.
- 종료 (20:18 KST): 코드 수 기준 17.24%를 전체 기능/트래픽 전환율과 구분하여 보고. 완전 전환 미인증. 미니PC `/srv/moneyverse-data/task-records/spring-transition-audit-v2026.11.15.2020/`에 내부 영/한 기록. GitHub 문서 전용 브랜치 및 PR 제안, 소스·운영 변경 없음.

변경분: 감사 증거만 추가. 코드/마이그레이션/기능 스위치/Nginx/운영 승격 없음. [상세 분석](../findings/2026-11-15-spring-transition-audit-v2026.11.15.2020.ko.md).
