# 개발 B v625 — 황금 오리 원장 없는 보상 지급 안전 차단

상태: 소스 코드 수정 및 핵심 검증 완료, 릴리스 차단. PR #1792는 Draft + hold.

기존 황금 오리 게임은 클라이언트 클릭 횟수로 WLD를 발행하며, 일일 제한이 원자적으로 보호되지 않고 Repository 미주입 시 가짜 성공 영수증을 반환했습니다. 기존 개발 A의 종료·미병합 PR #1320의 고유 구현을 복구하고, 추가로 Next 서버 액션과 브라우저 API 우회 호출까지 차단했습니다.

변경 계약: `POST /api/v1/engagement/dopamine/golden-duck`는 503 `golden_duck_settlement_unavailable`; Repository 내부 호출도 DB 실행 전에 거부합니다. `GET .../golden-duck/status`는 본인 원장에 실제 입금 분개가 있는지만 조회하며 비공개·캐시 금지입니다. 화면은 10초간 로컬 점수 연습만 제공하며 WLD 지급·지갑 갱신 이벤트가 없습니다. Android 게이트웨이도 503을 정상 응답으로 바꾸지 않습니다.

검증: 수정 전 RED 12건, 수정 후 Backend 집중 18 PASS, Frontend 집중 37 PASS, UI 연계 8 PASS, Backend 전체 1,944 PASS/440 SKIPPED, DB 패키지 46 PASS/4 SKIPPED, 전체 Typecheck·Backend Build·전체 Lint 오류 0·API 계약 180 PASS·보안 9 PASS. React 테스트는 NODE_ENV=test 사용.

차단: qs@6.16.0 Moderate 보안 감사 FAIL, 전체 Frontend·Next.js 빌드·실제 격리 PostgreSQL·공식 Test exact-SHA 인증 E2E 미완료. 공식 Test SHA는 `cfb13272beea53c4d8c20eff7f379b6f66343033`으로 후보와 다르고 Production 버전은 unknown. 공유 디스크 99%, /tmp 97%. 실제 운영 WLD·DB·배포·예약은 변경하지 않았습니다.
