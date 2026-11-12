# A/v2152 — QA 증거 점검 (2026-11-13 04:05 KST)

## 시작 — 범위·스킬
이전 B/v2150: Draft #3115, 현재 A/v2152, 다음 B/v2154(이전 완료 기록 확인 조건부).
miniPC 상태 API에서 백엔드·프론트엔드·봇·MCP·nginx·Docker 활성 및 개발 DB 연결 확인. 이는 운영 거래 검증이 아님.
호스팅 skills__list 결과가 비어 호스팅 using-superpowers 읽기는 불가. 실제 로컬 SKILL.md 네 개를 읽음: using-superpowers(진입), systematic-debugging(원인 증거), writing-plans(개발 인계), verification-before-completion(완료 증거). 로컬 목록 조사, 외부 스크립트 실행 없음.
시작 Migration 원격 main SHA: 5f9219600984a3d8b84144a6ab04df8def4b8120. main의 AGENTS, README 및 영·한 PROJECT_PLAN/INTEGRATED_PLANNING_MASTER blob 확인. 앱 전체·최근 30일 전수 조사는 미완료, 앱 최신 SHA 미인증.

## 중간 — 결함 증거·중복 제거
P0 #3101(OPEN): main의 국고 충전 화면은 amountWld/reason/otpCode만 전송하여 필수 UUID v4 requestKey를 누락함. Next 라우트는 {error}를 반환하나 화면은 data.message를 읽음. 컨트롤러는 서비스 키 검증 전에 OTP 확인. 코드상 계약 결함은 확인했으나 특정 운영 충전의 실제 금전 이동은 미확인. #3101에 동일 원인·수정·테스트 기준이 이미 있어 신규 수정 델타 0. OTP 비밀은 기록하지 않음.
P0 #1909(OPEN): SWF 리밸런싱·청산 성공 표시와 실제 결제 증빙 불일치에 대한 기존 이슈. 신규 원장 대사·인증 E2E 증거 없음. 중복 신규 기획 금지.
기존 Draft #3112/#3114/#3115와 충돌 여부 검토. 개발 A/B/C·Gemini 작업을 덮어쓰지 않고 증거 인계만 수행.
우선순위: P0 #3101 요청·오류 계약 및 OTP/멱등성·원장 테스트, P0 #1909 SWF 결제 증빙 게이트, P1 인증 Test E2E·원장 대사, P2 금전 무결성 검증 후 오류 UX. 기존 백로그 참조이며 신규 이슈가 아님.
정본 통합기획서에 새로운 확정 변경을 추가하지 않음. TSI-20261110-001~011 및 #3006 원문 유지.
독립 외부 레퍼런스 10,000건: 검증 불가/BLOCKED(수량 추정 금지). 운영 결제·exact-SHA Test·앱 전수·최근 30일 전수 조사 BLOCKED.

## 종료 — 분류·검증
NET_NEW 채택 0, 신규 IMPROVEMENT 델타 0, 기존 P0 중복 재등록 제외 2(#3101/#1909), 이번 기획 증거기록 1쌍, 실제 코드 구현 0, 신규 QA·운영 인증 0. 기존 이슈는 OPEN이며 수정 완료로 간주하지 않음.
기획 품질 BLOCKED: 앱·30일·운영·독립 레퍼런스·인증 Test 증거 부족. 운영 코드·DB·배포·정본 기획서 변경 없음. 다음 B회차는 최소 세 후보를 코드·기존 기획·PR·외부 증거와 대조한 뒤 신규성 판정.
검토용 Draft PR은 구현·main 반영 증거가 아님.
