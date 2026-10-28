# 개발 C v1126 — Discord 전달 증거 검증 (한국어 보조)

## 시작 — 2026-10-28 15:39 KST
- 기준 main `952e487d0a0eb4d7520fa98a81e413a1b2cb869c`, 독립 브랜치/작업 폴더.
- Debian 13.6 미니PC 7개 서비스 및 개발 DB 연결 확인. 운영 연결 가능 DB에는 쓰기 금지.
- AGENTS, README 국영문, 국영문 통합기획, 열린 PR·CI·QA·A/B/C 검토. 다른 담당자 작업 중복 금지.
- `/admin/discord`는 Backend JSON을 검증하지 않고 표시하여 비정상 카운트·경로·수신자를 신뢰할 수 있는 P1 문제.
- 기존 PostgreSQL SECURITY DEFINER 읽기 계약을 유지하면서 검증기·실패 UI·회귀테스트 구현. 모든 릴리스 게이트 통과 전 배포 금지.

## 진행
- [ ] RED 테스트; [ ] 코드; [ ] main 재확인; [ ] 전체 검증; [ ] PR/CI.

## 종료
- 검증 대기. 공식 Test/Production 변경 없음.
