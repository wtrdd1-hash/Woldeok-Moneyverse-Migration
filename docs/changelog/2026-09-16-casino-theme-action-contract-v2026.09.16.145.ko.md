# 내부 업데이트 — v2026.09.16.145

- 범위: 카지노 프론트엔드/백엔드 계약 점검 및 최적화 검토.
- 수정 원인: 테마 폼은 `number`/`parity`를 전송했지만 `playDiceNumber`/`playDiceParity` 서버 액션은 `choice`를 읽고 있었음.
- 영향 UI: 슬롯, 하이/로우, 휠, 보물 상자, 젬.
- 백엔드 점검: 서버 권위 정산, 입력 검증, 멱등성, DB 소유 RNG/배당 구조 정상. 이번 결함에 필요한 백엔드 코드 변경은 없음.
- 작업 중 기획 재확인: `docs/planning/CASINO_GAME_SYSTEM_SPEC.md`의 서버 권위 결과, 보호 한도, 영수증 기반 애니메이션 원칙 유지 확인.
- 테스트: 계약 빌드 PASS, 카지노 프론트 집중 40/40 PASS, 프론트 타입체크 PASS, 변경 파일 ESLint PASS.
