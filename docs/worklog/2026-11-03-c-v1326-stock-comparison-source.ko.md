# C v1326 — 가상 주식 종목 비교 원천 검증

## 시작 — 2026-11-03 08:19 KST
- Debian 13.6 미니PC 연결, 핵심 서비스 7개 및 개발 PostgreSQL 연결 확인. 디스크 97% 사용 중이므로 불필요한 산출물 생성을 제한한다.
- 최신 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`에서 독립 worktree 생성. 다른 작업자의 변경을 보존한다.
- AGENTS, README 양 언어, 통합기획서 양 언어, QA v1484, 기획 v1688, A/B/C PR·CI를 확인했다.
- P1: 회원 종목 비교 화면이 검증되지 않은 API 숫자 문자열을 BigInt 계산에 넘겨 오류를 일으키거나 빈 시장으로 오인할 수 있다. 전역 검색엔진 색인 헤더도 회원 화면에 적용된다.
- 기존 Nest 공개 주식 API 및 PostgreSQL SECURITY DEFINER 조회 함수를 재사용한다. 금융 원장·DB 마이그레이션은 변경하지 않는다.
- 단계: [ ] 실패 재현 [ ] 원천 검증/접근성/HTTP 보호 [ ] 테스트 [ ] PostgreSQL/HTTP [ ] main 재확인/PR [ ] 배포 보류 판정.
