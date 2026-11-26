# 서버 게임 연도 구현 (GAMEYEAR.2-5)

버전: v2026.11.26.GAMEYEAR.2
브랜치: feat/server-game-year-20261126 (worktree /home/debian/mv-gameyear-20261126). Test 백엔드가 #3447을 실행 중이라 #3447 head 8a48975a00 위에 쌓음 — #3447 병합 후 main으로 대상 변경.
작업자: Claude Code (Claude Opus 5.5, claude-opus-5-5)

- 시작 (2026-11-26T09:02:32+09:00): 소유자 긴급 지시 — 우선순위를 GAMEYEAR.2~5로 변경, #3447 관리자 잔여 작업은 8a48975a00에서 체크포인트(푸시 완료) 후 보류. PR #3452(671febd666, 명세·통합기획·작업기록 EN/KO)와 PR #3453(a5044a16c9, 모바일 내비·5개 언어 감사) 읽음. main 1df1150e97. 마이그레이션 번호: main 349, #3447 350~352, 353 사용 열린 PR 없음 → 353.
- 범위: forward-only DB 연도 함수(190 불변), Spring 계약·정직한 실패, 웹 공통 헤더·모바일·대시보드 연도 표시(EN 기본, KO 두 번째, JA/ZH/VI), 앱·Discord 계약 확인, 독립 Test 검증. 범위 밖: 연간 정산·금리·계정/시즌 리셋·현실시간 보안/카지노 보호, NAV-01/I18N-01/I18N-02·관리자 오류(후속), 운영·main·데이터 변환.
- 체크포인트 (2026-11-26T09:09:15+09:00): GAMEYEAR.2(f71df97236, 353은 Test DB에만 적용)·GAMEYEAR.3(9ada1cb1f7, Spring 계약, 전체 테스트 통과) 완료. GAMEYEAR.4 일부: frontend/src/lib/game-calendar.ts 연도 파싱·5개 언어 표기와 테스트(8개 통과). 헤더·모바일·대시보드 연결, Test 배포, GAMEYEAR.5 검증은 미완료. 소유자 보안 우선 재정렬(인계 v0908.1)로 일시 중단; 폐기 없음, 운영 변경 없음.
