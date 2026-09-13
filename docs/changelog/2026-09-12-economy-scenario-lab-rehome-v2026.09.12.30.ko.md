# v2026.09.12.30 — 경제 시나리오 실험실 재통합

- 오래된 기획 이력을 다시 병합하지 않고 기존 Economy Scenario Lab 런타임 구현만 최신 `main` 위에 재통합했습니다.
- 백엔드: 읽기 전용 시나리오 계산기, 검증 테스트, 관리자 preview API를 복원했습니다.
- 프론트엔드: `/admin/economy/scenario-lab` 화면과 경제 운영 진입 링크를 복원했습니다.
- 정밀도: 권위 있는 WLD 값은 정수 문자열로 유지하고 계산은 `BigInt`를 사용합니다.
- 안전 경계: DB migration, 원장/잔액 변경, 정책 쓰기, 추천 엔진, 자동 정책 적용은 추가하지 않았습니다.
- 재통합 시작 기준 main: `8b6666f46a2b56cd261604c322d116f0e004cfe2`.
- 후보 브랜치: `integrate/economy-scenario-lab-v2026.09.12.30`.
- CI와 isolated Test exact-SHA 검증 전에는 Production으로 승격하지 않습니다.
