# 작업기록 — 웹 전체 코드·안정성 점검 v2026.10.15.651

**작업 전(10:45~10:47 KST):** 미니PC 내 /srv/moneyverse-tasks/audits/2026-10-15-web-full-code-stability-audit-start.md 사전 로그 작성. Desktop Commander 장치는 오프라인이나 미니PC 전용 MCP 접속은 정상. 프론트/백엔드/DB/Nginx/봇 서비스 확인. 운영 prod-v600, Test test-v618, 정본 통합기획/문서 표준/배포 규칙 및 기존 v639 후보 PR을 조회.

**협업 충돌 방지:** 점검 시작 main c03b0a9b, 진행 중 원격 main에 v636~v638, v650 감사 문서/CI 기록 병합으로 bf55b057까지 전진. 점검 구간 앱 소스 차이는 없음. v640 작업공간은 다른 에이전트 사용 중이므로 미변경. 최신 원격 main에서 독립된 v651 브랜치/작업공간을 생성함.

**작업 중(10:48~10:55 KST):** 운영 404 URL 6개 재현 및 정상 대체 URL 8개 확인. 잘못된 UUID 캔들 503, 비인증 identity 401 확인. DB 읽기: public 테이블 245, 앱 역할 직접 쓰기 권한 241, PUBLIC SECURITY DEFINER 실행권한 11. DB 크기 1008 MB, autovacuum 켜짐, pg_stat_statements 없음, 잠금 대기 0, 캔들·아웃박스 dead tuple 추정값 확보. 계산기 4곳의 링크, 잔액 직접 변경 SQL 확인. QA 본 명령은 필수 --inventory 누락으로 실패, QA 단위 테스트는 3/3 통과. 화면 164개(관리자 34), 백엔드 컨트롤러 82, Next 라우트 78, SQL 마이그레이션 270 인벤토리 확인. 서비스 재시작 0, 운영 최근 24시간 오류 등급 로그 0건, Test 백엔드 3건.

**참조 문서:** Next.js 운영 체크리스트/계측/리다이렉트, NestJS 헬스/종료, PostgreSQL 함수 권한·SQL 통계·Vacuum, Google SRE 신호 공식 자료를 대조. 기존 v636~v639 결함·개선 후보와 중복을 피함.

**작업 종료:** 영어/한국어 v651 결함 보고서·작업 기록·내부/GitHub 기록·릴리스 기록 작성. 전체 인증 UI E2E, 실사용 금액 변경, DB 권한 변경, 마이그레이션, Test/운영 배포, main 병합은 진행하지 않음. **BLOCKED**, 다음 단계는 격리 DB 원장/권한 Test → 링크/API/관리자 검증 → 무중단 승격 증거.
