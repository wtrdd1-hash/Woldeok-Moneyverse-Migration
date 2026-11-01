# 기획 v1614 — F675-209 중지 적용일·조기 재개 정합성 (한국어)

- 2026-11-01. 이전 기능 추가 v1612 → 현재 기능 보완 v1614 → 다음 기능 추가 v1616(잠정).
- Superpowers: skills__list 결과 []로 skills__read URI 경로 BLOCKED, miniPC 설치 using-superpowers/brainstorming/writing-plans/worktrees/verification 스킬 직접 확인.
- 정본: main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` 시작·중간 확인, AGENTS.md/README.md/영문 정본·한국어 기획서·실제 알림 서비스/웹 화면/app-api 경로 조사. 만료 알림 일시중지는 미구현.
- 미병합 #2355 기반 별도 문서 브랜치, 이슈 #2354 시작·중간·완료 갱신 및 Draft #2361. A/B/C/QA/Gemini 런타임 변경과 분리.
- 설계 모순: 1·3·7일 DATE CHECK는 임의 조기 재개를 종료일 단축으로 표현 불가, 활성 구간을 다음날 구간으로 교체하면 오늘 상태 변경 위험.
- 기본 구간+다음날 PAUSE/RESUME 예약 전이, GET 읽기 전용 해석기, PUT/작업자 회원 잠금 정규화, 동의 세대, 멱등·자정 경계·억제 증빙 설계.
- P0 4/P1 6. 신규 #2357 시즌 정산 EXECUTE를 별도 릴리스 차단으로 추가, 금융·Test 출처·권한·마이그레이션 충돌 보류.
- PG17/API/웹/Android/정확 SHA Test·독립 복원 수용시험은 제안만, 미실행. 스키마·런타임·WLD·원장·아이템·Test·Production 변경 없음.
- 외부 독립 신규 확보·중복 제거·분류 승인 0건, 누적 UNKNOWN / 10,000건 BLOCKED / IN PROGRESS. 최종 SHA/CI는 PR·miniPC FINISH에 기록.
