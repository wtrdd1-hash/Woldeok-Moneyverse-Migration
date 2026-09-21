# 비밀번호 코드 포인트 경계 — v2026.09.22.328

- 상태: 로컬 구현/검증 완료, CI 및 exact-SHA isolated Test 대기.
- 최신 `main`, 열린 통합/의존성 PR, 인증 우선순위 명세와 로컬 인증 런타임을 확인한 뒤 중복되지 않는 backend/security 수정으로 선택했다.
- 문서는 최대 128 Unicode 코드 포인트를 요구하지만 `acceptablePassword`가 JavaScript `.length`를 사용해 이모지 같은 non-BMP 문자를 UTF-16 코드 유닛 2개로 계산하는 불일치를 확인했다.
- NFC 정규화, 최소 길이 없음 정책, 흔한 비밀번호 차단, Argon2id 해시는 유지하면서 `Array.from`으로 코드 포인트를 계산하도록 수정했다.
- ASCII 및 이모지 128/129 경계 회귀 테스트를 추가했다.
- migration, ledger, 권한, Production 데이터 경로는 변경하지 않았다.
