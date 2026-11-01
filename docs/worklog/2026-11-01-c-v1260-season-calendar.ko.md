# 개발 C v1260 — 시즌 이벤트 캘린더 원천 검증 (초안 / 운영 보류)

## 시작 — 2026-11-01 13:17 KST
- Debian 13 미니PC MCP: 주요 서비스 7개 활성, 개발 PostgreSQL 연결 정상. origin/main SHA `f13bbce273ffc65e8576170992d82ea00c27a1c9`. main 작업 폴더의 타 작업자 변경 파일은 보존한다.
- AGENTS, 영문·국문 README, 영문 정본·국문 통합 기획, 열린 PR, A/B/QA·기획 및 CI 검토. 시즌 이벤트 캘린더 데이터 검증의 별도 활성 PR 없음.
- **확인된 P1:** `/calendar`는 `/api/v1/seasons/events`의 성공 응답을 검증 없이 사용하여 비정상 데이터로 화면이 중단되거나 잘못된 금액·날짜·빈 상태를 표시할 수 있다. Android 게이트웨이도 원천 검증 없이 전달한다.
- 기존 인증 Nest → PostgreSQL `season_active_events()` 계약을 유지한다. 유효한 빈 목록과 조회 실패를 구분하고, 잘못된 응답은 숨기며, 모바일·키보드·스크린리더 접근성과 HTTP 개인정보 보호 헤더를 검증한다. 원장·DB·금액 변경 없음.
- 독립 브랜치 `auto/hourly-c-calendar-season-v1260-20261101-1316`; 모든 필수 게이트 통과 전 병합·운영 배포 금지.

## 진행
- [ ] 실패 재현 및 회귀 테스트
- [ ] 웹·Android 실제 응답 검증
- [ ] 최신 main 중간·종료 재확인
- [ ] 최종 SHA 전체 테스트 및 보안·DB·CI·E2E 검증
- [ ] Draft PR, 백업, 최종 보고

## 최종
- 검증 전. RELEASE HOLD.
