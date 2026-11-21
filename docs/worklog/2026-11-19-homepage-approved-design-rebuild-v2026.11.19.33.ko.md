# 공식 승인 홈 디자인(home.png) 전면 교체 및 3안 시안 격리 — 작업 기록 v2026.11.19.33

**일시:** 2026-11-19 KST
**작업자:** 프론트엔드 엔지니어링 에이전트
**목적:** v2026.11.19.32 장애 분석에 따라, 운영 메인(`GET /`)에 노출되어 있던 '홈 화면 3안' 비교 프로토타입을 전면 제거하고 공식 승인된 단일 다크 네이비/시맨틱 바이올렛 게임형 경제 대시보드(`home.png`)로 교체 배포.

## 작업 전 (Before Work)
- 운영 `https://easy-scraping.com/`에 녹색/청록색 3-concept 탐색 시안(`신규 사용자 유입을 위한 홈 화면 3안`)이 노출되어 기획서와 정체성 불일치 발생.
- `docs/design/all-pages-v2026.11.18.12/previews/home.png`에 공식 승인된 PC+모바일 홈 디자인이 복원되어 있음 확인.
- `docs/design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png`에 관리자 콘솔 공식 레퍼런스 확인.
- 사용자 질문 조율(Interactive Alignment)을 통해 즉시 교체 및 3안 시안의 `/design-preview` 격리 방침 확정.

## 계획 및 진행 (In Progress)
- [x] 전 시스템 기획 및 디자인 이미지 전수 분석
- [x] implementation_plan.md v86 누적 작성 (0 deletion 원칙 준수)
- [x] 정규 단일 홈 화면(`index.html`) 구현:
  - 다크 네이비(`#0C1020`) & 슬레이트(`#151D32`) & 바이올렛(`#9C83FF`) & 블루(`#64B7FF`) 테마
  - 데스크톱: 좌측 네비 사이드바(8개 탭: 홈, 대시보드, 지갑, 주식, 퀘스트, 상점, 커뮤니티, 관리자), 검색 바, 히어로 배너, 3대 KPI 카드(100조 WLD, +2.41%, 진행 중), 실시간 라인 차트 벤토 그리드, 빠른 작업, 10대 종목 실시간 테이블, 12종 계산기 허브, 데이터 원천 상태 카드
  - 모바일: 세로 카드 스택(홈 대시보드, 오늘의 자산, 퀘스트, 시장 동향, 새 소식), 44px 5-탭 바텀 내비게이션 독, 가로 오버플로우 0px
  - 56px 전역 지원 독
- [x] `/design-preview/index.html`에 3안 비교 시안 격리 보존 및 `robots: noindex, nofollow` 메타태그 적용
- [x] `/admin-preview/index.html` 관리자 콘솔 정밀 정렬
- [x] 실서버(`/srv/moneyverse-data/frontend-static/`) 및 Spring Boot 정적 경로 동기화 배포

## 검증 및 결과 (Finished)
- `curl -s https://easy-scraping.com/` 검증: '홈 대시보드', 'home-sidebar', 10대 종목 테이블, 12종 계산기, 모바일 바텀 내비게이션 독 100% 응답 확인.
- 격리된 `/design-preview/` 경로: `noindex, nofollow` 메타태그와 함께 기존 3안 시안 보존 확인.
- 브라우저 서브에이전트 실측 검증 완료 (데스크톱 1280px 및 모바일 390px 스크린샷 및 Bounding Box 확보).

