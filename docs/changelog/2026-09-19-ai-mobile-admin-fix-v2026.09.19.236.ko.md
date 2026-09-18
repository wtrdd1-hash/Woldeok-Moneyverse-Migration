# v2026.09.19.236 — 경제 AI SHADOW health·적응형 제한 안전장치·모바일 관리자 수정

- 정책 적용 권한과 분리된 일일 Economy AI SHADOW health scheduler job을 추가하고 별도 append-only 테이블에 모델 증거를 기록한다.
- 기본 disabled `economy_job_limit_tightening`을 추가해 음수 직업 제한 delta를 DB에서 차단하고, 명시 활성화 후에도 실제 task limit은 최소 2회/일을 보장한다.
- 관리자 Economy AI 상태에 운영상태, 모델 도달성, proposal 적격/차단사유, 권위/SHADOW review 수, 최근 scheduler 결과를 추가한다.
- AI agent 증거, 접속 추이, 활동 로그에 모바일 stacked card를 추가하고 desktop table은 유지한다.
- migration 205와 SHADOW 격리, 제한 강화 guard, 실패상태, 반응형 회귀 테스트를 추가한다.
- 격리 PostgreSQL 17.11에서 migration 002–205 전체 적용 성공, 전체 로컬 테스트(contract 23, database 7, backend 1451, frontend 629), lint 오류 0, typecheck, production build를 통과했다.
- v235 운영 기준에 따라 Production auto-policy는 disabled를 유지하며 exact-SHA Test 검증 후에만 Production 승격한다.
