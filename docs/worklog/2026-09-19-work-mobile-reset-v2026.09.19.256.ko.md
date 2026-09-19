# 내부 작업기록 — v2026.09.19.256

범위: /work 모바일의 “새 버전 배포” 오탐과 가속 초기화 화면 갱신 문제 수정.

원인:
- 운영 Nginx는 /api/version을 백엔드 런타임 식별용으로 사용한다.
- StaleTabNotice가 백엔드 SHA와 프론트 NEXT_PUBLIC_BUILD_ID를 비교해 정상 혼합 배포도 오래된 탭으로 오판했다.
- /work는 서버 렌더링 화면인데 live refresh가 없어 DB 일/주 창이 넘어가도 열린 화면은 이전 값을 계속 표시할 수 있었다.
- game_day_key/game_week_key는 내부 synthetic 저장 키이며 사용자 달력 날짜가 아니다.

변경:
- 프론트 빌드 식별 경로를 /frontend-version으로 분리했다.
- stale-tab 감지와 회귀 테스트를 새 경로 기준으로 변경했다.
- /work에서 화면이 보일 때 10초마다 서버 화면을 갱신해 현실 10분 일간/70분 주간 경계가 수동 새로고침 없이 반영되게 했다.
- 실제 초기화 시각 옆의 내부 game day/week 키 표시는 제거했다.
- 백엔드, 스키마, 원장, 보상 정책, 마이그레이션 변경은 없다.

검증: stale-tab 테스트 5/5, contract build, 프론트 typecheck, Next production build 통과.
승격: 브랜치 CI -> exact-SHA 격리 Test -> 프론트/백엔드 identity + 인증 /work + backend health -> main -> 병합 exact SHA 빌드 -> 무중단 Production -> 사후 probe.
